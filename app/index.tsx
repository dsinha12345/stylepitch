import React, { useState, useEffect } from 'react';
import { View, Text, Alert, StyleSheet, Image } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import LoginScreen from './LoginScreen';
import TabNavigator from './TabNavigator';  // Assume we've moved TabNavigator to its own file
import RegionSelectionScreen from './RegionSelectionScreen'; // Import the new screen
import { RegionProvider, useRegion } from './RegionContext';

const Stack = createStackNavigator();

const App = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((user) => {
      setUser(user);
      if (initializing) setInitializing(false);
    });

    return unsubscribe;
  }, []);

  const { setRegion } = useRegion(); 

  const handleLogout = () => {
    auth()
      .signOut()
      .then(() => {
        setRegion('');
        Alert.alert('Logged out', 'You have been logged out successfully.');
      })
      .catch(error => {
        console.error('Logout failed', error);
        Alert.alert('Error', 'Logout failed. Please try again.');
      });
  };

  if (initializing) {
    return (
      <View style={styles.loadingScreen}>
        <Image source={require('../assets/company_logo_only.png')} style={styles.logo} />
      </View>
    );
  }
  
  return (
    <RegionProvider>
      <Stack.Navigator>
        {user ? (
        <>
          <Stack.Screen
          name="RegionSelection"
          component={RegionSelectionScreen}
          options={{ headerShown: false }}
        />
          <Stack.Screen
            name="MainScreen"
            options={{ headerShown: false }}
          >
            {(props) => <TabNavigator {...props} handleLogout={handleLogout} />}
          </Stack.Screen>
          </>
        ) : (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        )}
      </Stack.Navigator>
      </RegionProvider>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff', // You can adjust the background color
  },
  logo: {
    width: 150, // Adjust size as needed
    height: 150, // Adjust size as needed
    resizeMode: 'contain',
  },
});

export default App;