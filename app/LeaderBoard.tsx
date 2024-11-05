import React, { useState, useEffect } from 'react';
import { Alert, View, Text, FlatList, StyleSheet, Dimensions, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { RootStackNavigationProp } from './types';
import CustomHeader from './customheader';

const CARD_WIDTH = (Dimensions.get('window').width / 2) - 25;
const CARD_HEIGHT = Dimensions.get('window').height * 0.4;

interface Design {
  id: string;
  title?: string;
  imageUrls: string[];
  likes: number;
  userId: string;
}

const Card = ({ title, likes, imageUrls, onPress }: { title?: string; likes: number; imageUrls: string[]; onPress: () => void }) => (
  <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
    {imageUrls.length > 0 && (
      <Image
        source={{ uri: imageUrls[0] }}
        style={styles.cardImage}
        resizeMode="cover"
      />
    )}
    <View style={styles.cardContent}>
      <Text style={styles.cardText}>{title}</Text>
      <Text style={styles.likesText}>Likes: {likes}</Text>
    </View>
  </TouchableOpacity>
);

const LeaderBoardScreen = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const [region, setRegion] = useState<string>("Global");
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  
  // Listen to auth state changes
  useEffect(() => {
    const unsubscribeAuth = auth().onAuthStateChanged(user => {
      setIsAuthenticated(!!user);
      if (!user) {
        setRegion("Global");
        setDesigns([]);
      }
    });

    return () => unsubscribeAuth();
  }, []);
  useEffect(() => {
    let unsubscribe = () => {};
    const user = auth().currentUser
    if (user) {
      unsubscribe = firestore()
        .collection('users')
        .doc(user.uid)
        .onSnapshot((doc) => {
          if (doc.exists) {
            const userRegion = doc.data()?.regionPreference;
            setRegion(userRegion || "Global");
          }
        }, (error) => {
          console.error('Error fetching user region:', error);
        });
    } else {
      setRegion("Global");
    }

    return () => unsubscribe();
  }, [isAuthenticated]);

  // Handle region subscription only when authenticated
  useEffect(() => {
    let unsubscribeRegion: (() => void) | undefined;

    if (isAuthenticated) {
      const user = auth().currentUser;
      if (user) {
        const userDocRef = firestore().collection('users').doc(user.uid);
        unsubscribeRegion = userDocRef.onSnapshot((doc) => {
          if (doc.exists) {
            const userRegion = doc.data()?.regionPreference;
            setRegion(userRegion);
          }
        }, (error) => {
          console.error('Error fetching user region:', error);
        });
      }
    }

    return () => {
      if (unsubscribeRegion) {
        unsubscribeRegion();
      }
    };
  }, [isAuthenticated]);

  // Fetch designs when region changes
  useEffect(() => {
    const fetchTopDesigns = async () => {
      setLoading(true);
      try {
        const designSnapshot = await firestore()
          .collection('regions')
          .doc(region)
          .collection('designs')
          .orderBy('likes', 'desc')
          .limit(10)
          .get();

        const designData = designSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Design[];

        setDesigns(designData);
      } catch (error) {
        console.error("Error fetching designs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopDesigns();
  }, [region]);

  const navigateToCardDetail = (id: string) => {
    navigation.navigate('CardDetailScreen', { id });
  };

  const handleLogout = async () => {
    try {
      await auth().signOut();
      Alert.alert('Logged out', 'You have been logged out successfully.');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Logout failed', 'There was an error logging you out.');
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <CustomHeader title='LeaderBoard' onLogout={handleLogout} />
      <Text style={styles.header}>Top Designs in {region}</Text>
      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <FlatList
            data={designs}
            renderItem={({ item }) => (
              <Card 
                title={item.title} 
                likes={item.likes} 
                imageUrls={item.imageUrls} 
                onPress={() => navigateToCardDetail(item.id)} 
              />
            )}
            keyExtractor={(item) => item.id}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.list}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '85%',
  },
  cardContent: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  cardText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  likesText: {
    fontSize: 14,
    color: '#777',
  },
});

export default LeaderBoardScreen;