import React, { useState, useEffect } from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import LoginScreen from './LoginScreen';
import TabNavigator from './TabNavigator';  // Assume we've moved TabNavigator to its own file

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

  const handleLogout = () => {
    auth()
      .signOut()
      .then(() => {
        Alert.alert('Logged out', 'You have been logged out successfully.');
      })
      .catch(error => {
        console.error('Logout failed', error);
        Alert.alert('Error', 'Logout failed. Please try again.');
      });
  };

  if (initializing) return <View style={styles.screen}><Text>Loading...</Text></View>;

  return (
      <Stack.Navigator>
        {user ? (
          <Stack.Screen
            name="MainScreen"
            options={{ headerShown: false }}
          >
            {(props) => <TabNavigator {...props} handleLogout={handleLogout} />}
          </Stack.Screen>
        ) : (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        )}
      </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;