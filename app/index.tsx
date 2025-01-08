import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider, useAuth } from './Contexts/AuthContext'; 
import { AuthStackScreen } from './AuthStack';
import MainScreen from './MainScreen';
import { RootStackParamList } from './types'; 

const Stack = createStackNavigator<RootStackParamList>();

const AppContent = () => {
  const { user, loading } = useAuth(); 

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <Image source={require('../assets/company_logo_only.png')} style={styles.logo} />
      </View>
    );
  }

  return (
    <Stack.Navigator>
      {user ? (
        <Stack.Screen
          name="MainScreen"
          component={MainScreen}
          options={{ headerShown: false }}
        />
      ) : (
        <Stack.Screen
          name="Login"
          component={AuthStackScreen}
          options={{ headerShown: false }}
        />
      )}
    </Stack.Navigator>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
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
    backgroundColor: '#fff',
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },
});

export default App;
