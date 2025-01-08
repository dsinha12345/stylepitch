import React, { useState, useEffect } from 'react';
import {View,Text,TextInput,TouchableOpacity,StyleSheet,Alert,ScrollView,Image,} from 'react-native';
import {getAuth,signInWithEmailAndPassword,createUserWithEmailAndPassword,GoogleAuthProvider,signInWithCredential,onAuthStateChanged,} from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { RootStackNavigationProp } from './types';
import { GoogleSignin, GoogleSigninButton } from '@react-native-google-signin/google-signin';
import { Picker } from '@react-native-picker/picker';
import { initializeApp, getApps } from 'firebase/app';
import firebaseConfig from '../firebaseConfig';
import app from '../firebaseConfig';

// Initialize Firebase
const auth = getAuth(app);
const firestore = getFirestore(app);


const logo = require('../assets/company_logo_only.png');

const LoginScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [regionPreference, setRegionPreference] = useState('Global');
  const navigation = useNavigation<RootStackNavigationProp>();

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '256007802506-0f12hjubdk4oje52pbkl5lul1gjncat0.apps.googleusercontent.com',
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

    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        navigation.navigate('MainScreen');
      })
      .catch((error) => {
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
    if (
      email === '' ||
      password === '' ||
      firstName === '' ||
      lastName === '' ||
      regionPreference === ''
    ) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    createUserWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        const user = userCredential.user;

        // Store additional user data in Firestore
        await setDoc(doc(firestore, 'users', user.uid), {
          firstName,
          lastName,
          email,
          regionPreference,
        });

        Alert.alert('Registration Success', `Account created for ${firstName}`);
        navigation.navigate('MainScreen');
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

      if (response && response.data && response.data.idToken) {
        const idToken = response.data.idToken; // Type assertion
        const googleCredential = GoogleAuthProvider.credential(idToken);
        const userCredential = await signInWithCredential(auth, googleCredential);

        if (userCredential.additionalUserInfo?.isNewUser) {
          const { displayName, email, photoURL } = userCredential.user;

          await setDoc(doc(firestore, 'users', userCredential.user.uid), {
            firstName: displayName?.split(' ')[0] || '',
            lastName: displayName?.split(' ')[1] || '',
            email,
            profilePicture: photoURL || '',
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
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {!isLogin && (
        <>
          <TextInput
            style={styles.input}
            placeholder="First Name"
            value={firstName}
            onChangeText={setFirstName}
          />
          <TextInput
            style={styles.input}
            placeholder="Last Name"
            value={lastName}
            onChangeText={setLastName}
          />
          <Text style={styles.label}>Region Preference</Text>
          <Picker
            selectedValue={regionPreference}
            onValueChange={setRegionPreference}
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
      <GoogleSigninButton
        style={styles.googleButton}
        size={GoogleSigninButton.Size.Icon}
        color={GoogleSigninButton.Color.Light}
        onPress={handleGoogleSignIn}
      />
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
    backgroundColor: '#f8f9f9',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
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
  picker: {
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
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
  googleButton: {
    width: 50,
    height: 50,
    marginVertical: 10,
  },
  toggleText: {
    color: '#fb5a03',
    marginTop: 10,
    fontSize: 16,
  },
  label: {
    width: '100%',
    marginBottom: 5,
    fontSize: 16,
    fontWeight: 'bold',
  },
  forgotPasswordText: {
    color: '#fb5a03',
    marginTop: 10,
    textDecorationLine: 'underline', // Optional: adds underline to indicate it's a link
    fontSize: 14, // Optional: adjust size as needed
  },
});


export default LoginScreen;
