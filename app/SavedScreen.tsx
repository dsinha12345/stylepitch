import React, { useEffect, useState } from 'react';
import { Alert, View, Text, FlatList, StyleSheet, Dimensions, Image, RefreshControl, TouchableOpacity } from 'react-native';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { RootStackNavigationProp } from './types'; // Adjust the path as necessary
import CustomHeader from './customheader';
import app from '@/firebaseConfig';

const CARD_WIDTH = (Dimensions.get('window').width / 2) - 25;
const CARD_HEIGHT = Dimensions.get('window').height * 0.4;

interface Design {
  id: string;
  title?: string;
  imageUrls: string[];
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


const SavedScreen = () => {
  const navigation = useNavigation<RootStackNavigationProp>(); 
  const [savedDesigns, setSavedDesigns] = useState<Design[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [user, setUser] = useState<any>(null); // Track user state
  
  
  const auth = getAuth(app);
  const firestore = getFirestore(app);

  const fetchSavedDesigns = async () => {
    if (user) {
      setIsRefreshing(true);
      try {
        const userDoc = await getDoc(doc(firestore, 'users', user.uid));
        const savedDesignsIds = userDoc.data()?.savedDesigns || [];

        const designsPromises = savedDesignsIds.map(async (id: string) => {
          const designDoc = await getDoc(doc(firestore, 'designs', id));
          return { id: designDoc.id, ...(designDoc.data() as Omit<Design, 'id'>) };
        });

        const fetchedDesigns = await Promise.all(designsPromises);
        setSavedDesigns(fetchedDesigns.filter(design => design.title));
      } catch (error) {
        console.error('Error fetching saved designs:', error);
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  useEffect(() => {
    // Monitor user authentication state
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchSavedDesigns();
      } else {
        setSavedDesigns([]); // Clear designs if no user
      }
    });

    // Cleanup the listener on unmount
    return () => unsubscribe();
  }, [auth]);

  const navigateToCardDetail = (id: string) => {
    navigation.navigate('CardDetailScreen', { id }); // Navigate to CardDetailScreen with the design ID
  };

  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await auth.signOut();
      console.log('User logged out successfully');
  
      // Navigate to the login screen if necessary
      navigation.navigate('LoginScreen'); // Replace 'Login' with your navigation route name
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Logout Error', 'An error occurred while logging out. Please try again.');
    }
  };
  return (
    <View style={{ flex: 1 }}>
    <CustomHeader title="Saved" onLogout={handleLogout} />
    <View style={styles.container}>
      <FlatList
        data={savedDesigns}
        renderItem={({ item }) => (
          <Card title={item.title} imageUrls={item.imageUrls} onPress={() => navigateToCardDetail(item.id)} />
        )}
        keyExtractor={item => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={fetchSavedDesigns} />
        }
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
    paddingBottom: 20,
    paddingHorizontal: 10,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    margin: 10,
    borderRadius: 10,
    backgroundColor: '#fff',
    overflow: 'hidden',
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardTextContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
  },
  cardText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default SavedScreen;
