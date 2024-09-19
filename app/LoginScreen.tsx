// LoginScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Image } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { RootStackNavigationProp } from './types';

const logo = require('../assets/company_logo_only.png'); // Adjust the path based on your project structure

const LoginScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const navigation = useNavigation<RootStackNavigationProp>();

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setEmail('');
    setPassword('');
    setFirstName('');
    setLastName('');
  };

  const handleFormSubmit = () => {
    if (isLogin) {
      handleLogin();
    } else {
      handleRegister();
    }
  };

  const handleLogin = () => {
    if (email === '' || password === '') {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    auth()
      .signInWithEmailAndPassword(email, password)
      .then(() => {
        Alert.alert('Login Success', `Welcome back, ${email}`);
        navigation.navigate('UserProfile');
      })
      .catch(error => {
        if (error.code === 'auth/user-not-found') {
          Alert.alert('Error', 'No user found with this email.');
        } else if (error.code === 'auth/wrong-password') {
          Alert.alert('Error', 'Incorrect password.');
        } else {
          Alert.alert('Error', error.message);
        }
      });
  };

  const handleRegister = () => {
    if (email === '' || password === '' || firstName === '' || lastName === '') {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    auth()
      .createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        const user = userCredential.user;

        // Store additional user data in Firestore after user is created
        firestore()
          .collection('users')
          .doc(user.uid)
          .set({
            firstName: firstName,
            lastName: lastName,
            email: email,
          })
          .then(() => {
            Alert.alert('Registration Success', `Account created for ${email}`);
            navigation.navigate('UserProfile');
          })
          .catch((error) => {
            Alert.alert('Error', 'Failed to save user data. Please try again.');
            console.error('Error saving user data:', error);
          });
      })
      .catch((error) => {
        if (error.code === 'auth/email-already-in-use') {
          Alert.alert('Error', 'That email address is already in use!');
        } else if (error.code === 'auth/invalid-email') {
          Alert.alert('Error', 'That email address is invalid!');
        } else if (error.code === 'auth/weak-password') {
          Alert.alert('Error', 'Password should be at least 6 characters.');
        } else {
          Alert.alert('Error', error.message);
        }
      });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={logo} style={styles.logo} resizeMode="contain" />
      <Text style={styles.header}>{isLogin ? 'Login' : 'Register'}</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={(text) => setEmail(text)}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={(text) => setPassword(text)}
        secureTextEntry={true}
      />

      {!isLogin && (
        <>
          <TextInput
            style={styles.input}
            placeholder="First Name"
            value={firstName}
            onChangeText={(text) => setFirstName(text)}
          />

          <TextInput
            style={styles.input}
            placeholder="Last Name"
            value={lastName}
            onChangeText={(text) => setLastName(text)}
          />
        </>
      )}

      <TouchableOpacity style={styles.submitButton} onPress={handleFormSubmit}>
        <Text style={styles.submitButtonText}>{isLogin ? 'Login' : 'Register'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={toggleForm}>
        <Text style={styles.toggleText}>
          {isLogin ? 'Don\'t have an account? Register' : 'Already have an account? Login'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  logo: {
    width: 150, // Adjust width as needed
    height: 150, // Adjust height as needed
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 15,
    marginBottom: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
  },
  submitButton: {
    width: '100%',
    padding: 15,
    backgroundColor: '#007BFF',
    alignItems: 'center',
    borderRadius: 8,
    marginVertical: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  toggleText: {
    color: '#007BFF',
    marginTop: 10,
  },
});

export default LoginScreen;
