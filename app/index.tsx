import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import RegionSelectionScreen from './RegionSelectionScreen'; // Import the new screen
import { RegionProvider, useRegion } from './RegionContext';
import {AuthStackScreen} from './AuthStack';
import MainScreen from './MainScreen';



const Stack = createStackNavigator();

const App = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<any>(null);
  const { region, setRegion } = useRegion();

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((user) => {
      setUser(user);
      if (initializing) setInitializing(false);
    });

    return unsubscribe;
  }, []);


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
            component={MainScreen}
            options={{ headerShown: false }}
          />
          </>
        ) : (
          <Stack.Screen
            name="Login"
            component={AuthStackScreen}
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