// ProfileScreen.tsx
import React, { useEffect, useState } from 'react';
import { SafeAreaView, Text, TextInput, View, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import CustomHeader from './customheader'; // Ensure the path is correct

const ProfileScreen = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [organization, setOrganization] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth().currentUser;
      if (!currentUser) return;

      try {
        const userDoc = await firestore().collection('users').doc(currentUser.uid).get();
        if (userDoc.exists) {
          const data = userDoc.data();
          setFirstName(data?.firstName || '');
          setLastName(data?.lastName || '');
          setPhoneNumber(data?.phoneNumber || '');
          setOrganization(data?.organization || '');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        Alert.alert('Error', 'Failed to fetch user data.');
      }
    };

    fetchUserData();
  }, []);

  const handleUpdateProfile = async () => {
    const currentUser = auth().currentUser;
    if (!currentUser) {
      Alert.alert('Error', 'No user is logged in.');
      return;
    }

    setLoading(true);

    try {
      await firestore().collection('users').doc(currentUser.uid).update({
        firstName,
        lastName,
        phoneNumber,
        organization,
      });

      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    auth().signOut().then(() => {
      Alert.alert('Logged out', 'You have been logged out successfully.');
    }).catch(error => {
      console.error('Logout error:', error);
      Alert.alert('Logout failed', 'There was an error logging you out.');
    });
  };

  return (
    <View style={{ flex: 1 }}>
      {/* CustomHeader placed outside SafeAreaView */}
      <CustomHeader title="Profile" onLogout={handleLogout} />

      <SafeAreaView style={styles.container}>
        <Text style={styles.label}>First Name</Text>
        <TextInput
          style={styles.input}
          value={firstName}
          onChangeText={setFirstName}
          placeholder="Enter your first name"
        />

        <Text style={styles.label}>Last Name</Text>
        <TextInput
          style={styles.input}
          value={lastName}
          onChangeText={setLastName}
          placeholder="Enter your last name"
        />

        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholder="Enter your phone number"
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Organization</Text>
        <TextInput
          style={styles.input}
          value={organization}
          onChangeText={setOrganization}
          placeholder="Enter your organization"
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleUpdateProfile}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? 'Updating...' : 'Update Profile'}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9f9',
  },
  label: {
    fontSize: 16,
    marginVertical: 10,
    color: '#333', // Consistent label color
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8, // Increased border radius for consistency
    padding: 15, // Increased padding to match UploadDesignScreen
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#fb5a03', // Orange color matching UploadDesignScreen
    padding: 15,
    borderRadius: 8, // Consistent border radius
    alignItems: 'center',
    marginTop: 20,
    width: '90%', // Match button width in UploadDesignScreen
    alignSelf: 'center', // Center the button
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  buttonDisabled: {
    backgroundColor: '#ccc', // Disabled state color
  },
});

export default ProfileScreen;
