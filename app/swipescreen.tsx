import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image as RNImage, ScrollView, SafeAreaView } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

interface Design {
  id: string;
  title?: string;
  imageUrls: string[];
  likes: number;
  dislikes: number;
}

const SwipeScreen: React.FC = () => {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [savedCards, setSavedCards] = useState<string[]>([]);
  const swiperRef = useRef<Swiper<Design>>(null);
  
  const user = auth().currentUser;

  const fetchDesigns = async () => {
    try {
      const snapshot = await firestore().collection('designs').limit(100).get();
      const designsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Design, 'id'>),
      }));
      setDesigns(designsData);
    } catch (error) {
      console.error('Error fetching designs:', error);
    }
  };

  const fetchSavedDesigns = async () => {
    if (user) {
      const userDoc = await firestore().collection('users').doc(user.uid).get();
      const savedDesigns = userDoc.data()?.savedDesigns || [];
      setSavedCards(savedDesigns);
    }
  };

  useEffect(() => {
    fetchDesigns();
    fetchSavedDesigns();
  }, []);

  const savePost = useCallback(
    async (id: string) => {
      if (user) {
        try {
          const userDocRef = firestore().collection('users').doc(user.uid);
          await userDocRef.update({
            savedDesigns: firestore.FieldValue.arrayUnion(id),
          });
          setSavedCards((prev) => [...prev, id]);
          console.log(`Design ${id} saved successfully!`);
        } catch (error) {
          console.error('Error saving design:', error);
        }
      }
    },
    [user]
  );

  const isSaved = useCallback((id: string) => savedCards.includes(id), [savedCards]);

  const handleSwipe = async (id: string, direction: 'left' | 'right') => {
    try {
      const designRef = firestore().collection('designs').doc(id);
      if (direction === 'right') {
        await designRef.update({
          likes: firestore.FieldValue.increment(1),
        });
        console.log(`Design ${id} liked!`);
      } else {
        await designRef.update({
          dislikes: firestore.FieldValue.increment(1),
        });
        console.log(`Design ${id} disliked!`);
      }
      // Update the local state to reflect the change
      setDesigns((prevDesigns) =>
        prevDesigns.map((design) =>
          design.id === id
            ? {
                ...design,
                likes: direction === 'right' ? design.likes + 1 : design.likes,
                dislikes: direction === 'left' ? design.dislikes + 1 : design.dislikes,
              }
            : design
        )
      );
    } catch (error) {
      console.error('Error updating likes/dislikes:', error);
    }
  };

  const handleLikePress = useCallback(() => {
    if (swiperRef.current) {
      swiperRef.current.swipeRight();
    }
  }, []);

  const handleDislikePress = useCallback(() => {
    if (swiperRef.current) {
      swiperRef.current.swipeLeft();
    }
  }, []);

  const renderCard = useCallback(
    (card: Design | undefined) => {
      if (!card) {
        return (
          <View style={styles.noMoreCards}>
            <Text>No More Designs</Text>
          </View>
        );
      }

      return (
        <View key={card.id} style={styles.card}>
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardName}>{card.title || 'Design'}</Text>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => savePost(card.id)}
              disabled={isSaved(card.id)}
            >
              <RNImage
                source={require('../assets/saved.png')}
                style={{
                  width: 24,
                  height: 24,
                  tintColor: isSaved(card.id) ? 'green' : 'gray',
                }}
              />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.cardScrollView}>
            {card.imageUrls.map((imageUrl, index) => (
              <RNImage
                key={`${card.id}-${index}`}
                source={{ uri: imageUrl }}
                style={styles.cardImage}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
          <View style={styles.likesContainer}>
            <TouchableOpacity style={styles.likeItem} onPress={handleLikePress}>
              <RNImage source={require('../assets/like.jpg')} style={styles.likeIcon} />
              <Text style={styles.likesText}>{card.likes}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.likeItem} onPress={handleDislikePress}>
              <RNImage source={require('../assets/dislike.jpg')} style={styles.likeIcon} />
              <Text style={styles.dislikesText}>{card.dislikes}</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    },
    [isSaved, savePost, handleLikePress, handleDislikePress]
  );

  const memoizedDesigns = useMemo(() => designs, [designs]);

  if (memoizedDesigns.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading designs...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Swiper
        ref={swiperRef}
        cards={memoizedDesigns}
        renderCard={renderCard}
        backgroundColor={'#f5f5f5'}
        stackSize={3}
        infinite
        containerStyle={styles.swiperContainer}
        cardVerticalMargin={40}
        verticalSwipe={false}
        cardIndex={0}
        keyExtractor={(card: Design) => card.id}
        onSwipedAll={() => console.log('All cards have been swiped')}
        onSwipedRight={(cardIndex) => {
          const swipedCard = memoizedDesigns[cardIndex];
          handleSwipe(swipedCard.id, 'right');
        }}
        onSwipedLeft={(cardIndex) => {
          const swipedCard = memoizedDesigns[cardIndex];
          handleSwipe(swipedCard.id, 'left');
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9f9',
  },
  swiperContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_HEIGHT * 0.75,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    overflow: 'hidden',
    borderWidth : 1,
    borderColor: '#a5a5a5',
  },
  cardScrollView: {
    flexGrow: 1,
  },
  cardImage: {
    width: '100%',
    height: SCREEN_HEIGHT * 0.7,
  },
  cardTextContainer: {
    padding: 15,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  cardName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'black',
  },
  saveButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  noMoreCards: {
    justifyContent: 'center',
    alignItems: 'center',
    height: SCREEN_HEIGHT * 0.6,
  },
  likesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
  },
  likeItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeIcon: {
    width: 25,
    height: 25,
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

export default SwipeScreen;