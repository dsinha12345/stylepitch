import { Alert } from 'react-native';
import auth from '@react-native-firebase/auth';
import { StackActions, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from './types'; // Adjust the import path if necessary

// Logout function
export const handleLogout = (navigation: NavigationProp<RootStackParamList>) => {
  auth()
    .signOut()
    .then(() => {
      Alert.alert('Logged out', 'You have been logged out successfully.');
      navigation.dispatch(StackActions.replace('LoginScreen'));
    })
    .catch(error => {
      console.error('Logout failed', error);
      Alert.alert('Error', 'Logout failed. Please try again.');
    });
};
