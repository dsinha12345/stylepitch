import React, { useEffect, useState } from 'react';
import { Alert, View, Text, FlatList, StyleSheet, Dimensions, Image, RefreshControl, TouchableOpacity } from 'react-native';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import CustomHeader from './customheader'; // Import your CustomHeader component
import { useNavigation } from '@react-navigation/native';
import { RootStackNavigationProp } from './types'; // Adjust the path as necessary

const CARD_WIDTH = (Dimensions.get('window').width / 2) - 25; // Adjusted width for better spacing
const CARD_HEIGHT = Dimensions.get('window').height * 0.4; // Adjust card height for rectangular lengthwise design

interface Design {
  id: string;
  title?: string;
  imageUrls: string[]; // Added imageUrls to the Design interface
}

const Card = ({ title, imageUrls, onPress }: { title?: string; imageUrls: string[]; onPress: () => void }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    {imageUrls.length > 0 && (
      <Image source={{ uri: imageUrls[0] }} style={styles.cardImage} resizeMode="cover" />
    )}
    <View style={styles.cardTextContainer}>
      <Text style={styles.cardText}>{title || 'Untitled Design'}</Text>
    </View>
  </TouchableOpacity>
);

const UserDesigns = () => {
  const navigation = useNavigation<RootStackNavigationProp>(); // Use the defined type
  const [userDesigns, setUserDesigns] = useState<Design[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const auth = getAuth();
  const db = getFirestore();

  const fetchUserDesigns = async (userId: string) => {
    setIsRefreshing(true);
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const uploadedDesignsIds = userDocSnap.data()?.uploadedDesigns || [];

        const designsPromises = uploadedDesignsIds.map(async (id: string) => {
          const designDocRef = doc(db, 'designs', id);
          const designDocSnap = await getDoc(designDocRef);

          if (designDocSnap.exists()) {
            return { id: designDocSnap.id, ...(designDocSnap.data() as Omit<Design, 'id'>) };
          }
        });

        const fetchedDesigns = await Promise.all(designsPromises);
        setUserDesigns(fetchedDesigns.filter((design): design is Design => !!design)); // Filter out undefined results
      }
    } catch (error) {
      console.error('Error fetching user designs:', error);
      Alert.alert('Error', 'Failed to fetch your designs. Please try again later.');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserDesigns(user.uid);
      } else {
        setUserDesigns([]);
      }
    });

    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      Alert.alert('Logged out', 'You have been logged out successfully.');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Logout failed', 'There was an error logging you out.');
    }
  };

  const navigateToCardDetail = (id: string) => {
    navigation.navigate('CardDetailScreen', { id }); // Navigate to CardDetailScreen with the design ID
  };

  return (
    <View style={{ flex: 1 }}>
      <CustomHeader title="Your Designs" onLogout={handleLogout} />
      <View style={styles.container}>
        <FlatList
          data={userDesigns}
          renderItem={({ item }) => (
            <Card title={item.title} imageUrls={item.imageUrls} onPress={() => navigateToCardDetail(item.id)} />
          )}
          keyExtractor={item => item.id}
          numColumns={2} // Display two cards per row
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  list: {
    paddingHorizontal: 10, // Apply padding here to balance left and right
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    margin: 10,
    borderRadius: 10,
    backgroundColor: '#fff',
    overflow: 'hidden', // Ensure child elements don't overflow
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%', // Make sure image takes full height
  },
  cardTextContainer: {
    position: 'absolute', // Position the text at the bottom
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background for better readability
    padding: 10,
  },
  cardText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff', // Change text color to white for better contrast
  },
  backButton: {
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#007BFF',
    borderRadius: 5,
    margin: 10,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default UserDesigns;
