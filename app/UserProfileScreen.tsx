// UserProfileScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from './types'; // Update with the correct path for your navigation types if used

type UserProfileScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'UserProfile'
>;

const UserProfileScreen = () => {
  const navigation = useNavigation<UserProfileScreenNavigationProp>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Profile</Text>
      {/* Add user information and profile details here */}
      <Button 
        title="Go Back" 
        onPress={() => navigation.goBack()} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});

export default UserProfileScreen;
