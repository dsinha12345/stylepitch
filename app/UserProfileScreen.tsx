// UserProfileScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from './types';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { MaterialIcons } from '@expo/vector-icons';

type UserProfileScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'UserProfile'
>;

type ScreenNames = keyof RootStackParamList; // Extract screen names from the param list

const UserProfileScreen = () => {
  const navigation = useNavigation<UserProfileScreenNavigationProp>();
  const [userData, setUserData] = useState<{ firstName: string; lastName: string; profilePicture?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth().currentUser;
      if (!currentUser) return;

      try {
        const userDoc = await firestore().collection('users').doc(currentUser.uid).get();
        if (userDoc.exists) {
          const data = userDoc.data();
          setUserData({
            firstName: data?.firstName || '',
            lastName: data?.lastName || '',
            profilePicture: data?.profilePicture,
          });
        } else {
          console.log('No such document!');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  const items = [
    { id: '1', title: 'Profile', screen: 'ProfileScreen' },
    { id: '2', title: 'Your Designs', screen: 'UserDesigns' },
    { id: '3', title: 'Rewards', screen: 'Screen3' },
    { id: '4', title: 'Upload a Design', screen: 'UploadDesignScreen' },
    { id: '5', title: 'Settings', screen: 'Screen5' },
  ];

  const handleItemPress = (screen: ScreenNames) => {
    navigation.navigate(screen); // Type-safe navigation
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>
        Welcome, {userData?.firstName} {userData?.lastName}
      </Text>
      <Image
        source={{ uri: 'https://media.istockphoto.com/id/1300845620/vector/user-icon-flat-isolated-on-white-background-user-symbol-vector-illustration.jpg?s=612x612&w=0&k=20&c=yBeyba0hUkh14_jgv1OKqIH0CCSWU_4ckRkAoy2p73o=' }}
        style={styles.profilePicture}
      />
      <View style={styles.content}>
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.item} onPress={() => handleItemPress(item.screen as ScreenNames)}>
              <Text style={styles.itemText}>{item.title}</Text>
              <MaterialIcons name="arrow-forward" size={24} color="#fb5a03" />
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContent}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9f9',
    padding: 16,
  },
  welcomeText: {
    fontSize: 26,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  profilePicture: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 3,
    borderColor: '#fb5a03',
    alignSelf: 'center',
    marginTop: 30,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 10,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  itemText: {
    fontSize: 18,
    color: '#333',
    fontWeight: '500',
  },
  listContent: {
    paddingTop: 50,
  },
});

export default UserProfileScreen;
