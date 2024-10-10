import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, Image as RNImage, TouchableOpacity, SafeAreaView } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import CustomHeader from './customheader'; // Adjust the path as necessary
import { RouteProp } from '@react-navigation/native';
import { UserProfileStackParamList } from './types'; // Adjust the path as necessary

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

interface Design {
  id: string;
  title?: string;
  imageUrls: string[];
  likes: number;
  dislikes: number;
}

type CardDetailScreenProps = {
  route: RouteProp<UserProfileStackParamList, 'CardDetailScreen'>;
};

const CardDetailScreen: React.FC<CardDetailScreenProps> = ({ route }) => {
  const { id } = route.params; // No need to check for route.params because types ensure it's present
  const [design, setDesign] = useState<Design | null>(null);
  const [loading, setLoading] = useState(true);
  
  const user = auth().currentUser;

  const fetchDesign = async () => {
    try {
      const doc = await firestore().collection('designs').doc(id).get();
      if (doc.exists) {
        setDesign({ id: doc.id, ...(doc.data() as Omit<Design, 'id'>) });
      } else {
        console.error('No such design!');
      }
    } catch (error) {
      console.error('Error fetching design:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDesign();
  }, [id]);

  const saveDesign = async () => {
    if (user) {
      try {
        const userDocRef = firestore().collection('users').doc(user.uid);
        await userDocRef.update({
          savedDesigns: firestore.FieldValue.arrayUnion(id),
        });
        console.log(`Design ${id} saved successfully!`);
      } catch (error) {
        console.error('Error saving design:', error);
      }
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!design) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text>Error fetching design details.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title={design.title || 'Design Details'} />

      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.card}>
          <ScrollView contentContainerStyle={styles.cardScrollView}>
            {design.imageUrls.map((imageUrl, index) => (
              <RNImage
                key={`${design.id}-${index}`}
                source={{ uri: imageUrl }}
                style={styles.cardImage}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
          <View style={styles.cardFooter}>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardName}>{design.title || 'Design'}</Text>
              <TouchableOpacity style={styles.saveButton} onPress={saveDesign}>
                <RNImage source={require('../assets/saved.png')} style={styles.saveIcon} />
              </TouchableOpacity>
            </View>
            <View style={styles.likesContainer}>
              <View style={styles.likeItem}>
                <RNImage source={require('../assets/like.jpg')} style={styles.likeIcon} />
                <Text style={styles.likesText}>{design.likes}</Text>
              </View>
              <View style={styles.likeItem}>
                <RNImage source={require('../assets/dislike.jpg')} style={styles.likeIcon} />
                <Text style={styles.dislikesText}>{design.dislikes}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  card: {
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_HEIGHT * 0.8,
    backgroundColor: '#fff',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  cardScrollView: {
    flexGrow: 1,
  },
  cardImage: {
    width: '100%',
    height: SCREEN_HEIGHT * 0.8,
  },
  cardFooter: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  cardTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  cardName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  saveButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
  },
  saveIcon: {
    width: 24,
    height: 24,
  },
  likesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  likeItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  likesText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  dislikesText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F44336',
  },
});

export default CardDetailScreen;
