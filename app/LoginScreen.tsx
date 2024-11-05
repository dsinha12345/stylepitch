// LoginScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Image } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { RootStackNavigationProp } from './types';
import { GoogleSignin, GoogleSigninButton, SignInSuccessResponse } from '@react-native-google-signin/google-signin';
import { Picker } from '@react-native-picker/picker';


const logo = require('../assets/company_logo_only.png'); // Adjust the path based on your project structure

const LoginScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const navigation = useNavigation<RootStackNavigationProp>();
  const [regionPreference, setRegionPreference] = useState('Global');

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '256007802506-0f12hjubdk4oje52pbkl5lul1gjncat0.apps.googleusercontent.com', // Get this from your google-services.json
    });
  }, []);
  const toggleForm = () => {
    setIsLogin(!isLogin);
    setEmail('');
    setPassword('');
    setFirstName('');
    setLastName('');
    setRegionPreference('Global');
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
        navigation.navigate('MainScreen');
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
    if (email === '' || password === '' || firstName === '' || lastName === '' || regionPreference === ''){
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
            regionPreference : regionPreference,
          })
          .then(() => {
            Alert.alert('Registration Success', `Account created for ${firstName}`);
            navigation.navigate('MainScreen');
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
  const handleGoogleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      // Check if response is a SignInSuccessResponse
      if (response && response.data && response.data.idToken) {
        const idToken = response.data.idToken; // Type assertion

        const googleCredential = auth.GoogleAuthProvider.credential(idToken);
        const userCredential = await auth().signInWithCredential(googleCredential);
  
        // Handle new user logic
        if (userCredential.additionalUserInfo?.isNewUser) {
          const { givenName, familyName, email, photo } = response.data.user; // Extract user data
  
          await firestore().collection('users').doc(userCredential.user.uid).set({
            firstName: givenName || '',
            lastName: familyName || '',
            email: email,
            profilePicture: photo || '', // Save the profile picture URL
          });
        }
  
        Alert.alert('Login Success', `Welcome, ${userCredential.user.displayName}`);
        navigation.navigate('MainScreen');
      } else {
        Alert.alert('Error', 'Google Sign-In was cancelled. Please try again.');
      }
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      Alert.alert('Error', 'Google Sign-In failed. Please try again.');
    }
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
          <Text style={styles.label}>Region Preference</Text>
          <Picker
            selectedValue={regionPreference}
            onValueChange={(itemValue) => setRegionPreference(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Global" value="Global" />
            <Picker.Item label="Americas" value="Americas" />
            <Picker.Item label="Europe" value="Europe" />
            <Picker.Item label="East Asia" value="East Asia" />
            <Picker.Item label="South Asia" value="South Asia" />
            <Picker.Item label="Africa" value="Africa" />
            <Picker.Item label="Australia" value="Australia" />
            <Picker.Item label="Gulf" value="Gulf" />
          </Picker>
        </>
      )}

      <TouchableOpacity style={styles.submitButton} onPress={handleFormSubmit}>
        <Text style={styles.submitButtonText}>{isLogin ? 'Login' : 'Register'}</Text>
      </TouchableOpacity>

      <View style={styles.googleButtonContainer}>
  <GoogleSigninButton
    style={styles.googleButton}
    size={GoogleSigninButton.Size.Icon} // You can adjust this as needed
    color={GoogleSigninButton.Color.Light}
    onPress={handleGoogleSignIn}
  />
</View>

      <TouchableOpacity onPress={toggleForm}>
        <Text style={styles.toggleText}>
          {isLogin ? 'Don\'t have an account? Register' : 'Already have an account? Login'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('ForgotPasswordScreen')}>
        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
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
    backgroundColor : "#f8f9f9"
  },
  googleButtonContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    // Ensure the button doesn't overflow the container
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  googleButton: {
    width: '100%', // Use full width of the container
    height: '100%', // Use full height of the container
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  picker: {
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    alignSelf: 'flex-start',
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
    backgroundColor: '#fb5a03',
    alignItems: 'center',
    borderRadius: 8,
    marginVertical: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  toggleText: {
    color: '#fb5a03',
    marginTop: 10,
  },
  forgotPasswordText: {
    color: '#fb5a03',
    marginTop: 10,
    textDecorationLine: 'underline', // Optional: adds underline to indicate it's a link
    fontSize: 14, // Optional: adjust size as needed
},
});

export default LoginScreen;
