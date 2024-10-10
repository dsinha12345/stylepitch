import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { TextInput, Alert, View, Text, StyleSheet, Dimensions, TouchableOpacity, Image as RNImage, ScrollView, SafeAreaView, Modal } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import RNPickerSelect from 'react-native-picker-select';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

interface Design {
  id: string;
  title?: string;
  imageUrls: string[];
  likes: number;
  dislikes: number;
  userId: string;
}

const SwipeScreen: React.FC = () => {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [savedCards, setSavedCards] = useState<string[]>([]);
  const swiperRef = useRef<Swiper<Design>>(null);
  const [customMessage, setCustomMessage] = useState("Hi, I'm interested in your design!");
  const [isMessageModalVisible, setIsMessageModalVisible] = useState(false);
  const [selectedDesignerId, setSelectedDesignerId] = useState<string | null>(null);
  const [region, setRegion] = useState<string | null>(null);
  
  const user = auth().currentUser;


  const regions = [
    { label: 'North America', value: 'north_america' },
    { label: 'Europe', value: 'europe' },
    { label: 'Asia', value: 'asia' },
    // Add more regions as needed
  ];

  const fetchDesigns = async () => {
    try {
      const snapshot = await firestore().collection('designs').orderBy("createdAt","desc").limit(100).get();
      const designsData = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...(data as Omit<Design, 'id'>)
        };
      });
      setDesigns(designsData);
    } catch (error) {
      console.error('Error fetching designs:', error);
    }
  };
  const loadDesignsByRegion = async (selectedRegion: string) => {
    try {
      const regionDoc = await firestore()
        .collection('regions')
        .doc(selectedRegion)
        .collection("designs")
        .orderBy("createdAt", "desc")
        .get();
  
      // Extract design IDs from region documents
      const designIds = regionDoc.docs.map(doc => doc.data().designId);
  
      // Fetch design details from the Designs collection
      const designsPromises = designIds.map(async (designId) => {
        const designDoc = await firestore()
          .collection('Designs')
          .doc(designId)
          .get();
  
        if (designDoc.exists) {
          const data = designDoc.data();
          return {
            id: designDoc.id, // Document ID from Designs collection
            ...(data as Omit<Design, 'id'>),// Convert Firestore Timestamp to JavaScript Date
          };
        }
        return null; // Return null if design does not exist
      });
  
      // Wait for all design fetches to complete
      const designsData = await Promise.all(designsPromises);
      
      // Filter out any null values (if any designs did not exist)
      setDesigns(designsData.filter(design => design !== null));
  
    } catch (error) {
      console.error('Error fetching designs:', error);
    }
  };
  
  
  const fetchSavedDesigns = async () => {
    if (user) {
      try {
        const userDoc = await firestore().collection('users').doc(user.uid).get();
        const savedDesigns = userDoc.data()?.savedDesigns || [];
        setSavedCards(savedDesigns);
      } catch (error) {
        console.error('Error fetching saved designs:', error);
      }
    }
  };

  useEffect(() => {
    loadDesignsByRegion("Global");
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
          Alert.alert("Error", "Failed to save the design. Please try again.");
        }
      } else {
        Alert.alert("Error", "You must be logged in to save designs.");
      }
    },
    [user]
  );

  const isSaved = useCallback((id: string) => savedCards.includes(id), [savedCards]);

  const handleLongPress = useCallback((userId: string) => {
    setSelectedDesignerId(userId);
    setIsMessageModalVisible(true);
  }, []);

  const sendMessageToDesigner = useCallback(async () => {
    if (!user || !selectedDesignerId) {
      Alert.alert("Error", "You must be logged in to send messages.");
      return;
    }

    try {
      if (!user.uid) {
        throw new Error('User ID is undefined');
      }

      // Check if a chat already exists
      const userDoc = await firestore().collection('users').doc(user.uid).get();
      const userData = userDoc.data();

      let existingChatId = null;
      if (userData?.chats) {
        existingChatId = Object.keys(userData.chats).find(chatId => {
          const chatParticipant = userData.chats[chatId];
          return chatParticipant === selectedDesignerId;
        });
      }

      let chatId;
      if (existingChatId) {
        chatId = existingChatId;
      } else {
        // Create a new chat document
        const newChatRef = await firestore().collection('chats').add({
          participants: [user.uid, selectedDesignerId],
          createdAt: firestore.FieldValue.serverTimestamp(),
        });
        chatId = newChatRef.id;

        // Update current user's document
        await firestore().collection('users').doc(user.uid).update({
          [`chats.${chatId}`]: selectedDesignerId,
        });
        
        // Update designer's document
        await firestore().collection('users').doc(selectedDesignerId).update({
          [`chats.${chatId}`]: user.uid,
        });
      }

      // Add the message to the chat
      await firestore().collection('chats').doc(chatId).collection('messages').add({
        text: customMessage,
        createdAt: firestore.FieldValue.serverTimestamp(),
        senderId: user.uid,
        senderName: `${userData?.firstName || 'First'} ${userData?.lastName || 'Last'}`,
      });
      setIsMessageModalVisible(false);
      setCustomMessage("Hi, I'm interested in your design!"); // Reset the message
    } catch (error) {
      console.error('Error sending message:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      Alert.alert("Error", "Failed to send message. Please try again later.");
    }
  }, [user, customMessage, selectedDesignerId]);

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
      Alert.alert("Error", "Failed to update likes/dislikes. Please try again.");
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
        <TouchableOpacity
          key={card.id}
          onLongPress={() => handleLongPress(card.userId)}
          activeOpacity={0.9}
          style={styles.card}
        >
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
            <TouchableOpacity style={styles.likeItem} onPress={handleDislikePress}>
              <RNImage source={require('../assets/dislike.jpg')} style={styles.likeIcon} />
              <Text style={styles.dislikesText}>{card.dislikes}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.likeItem} onPress={handleLikePress}>
              <RNImage source={require('../assets/like.jpg')} style={styles.likeIcon} />
              <Text style={styles.likesText}>{card.likes}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      );
    },
    [isSaved, savePost, handleLikePress, handleDislikePress, handleLongPress]
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
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Select Region:</Text>
        <RNPickerSelect
          onValueChange={(value) => setRegion(value)}
          items={regions}
          placeholder={{ label: "Select a region", value: null }}
        />
      </View>
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
      <Modal
        visible={isMessageModalVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TextInput
              value={customMessage}
              onChangeText={setCustomMessage}
              placeholder="Type your message here"
              style={styles.messageInput}
              multiline
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsMessageModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.sendButton]}
                onPress={sendMessageToDesigner}
              >
                <Text style={styles.buttonText}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  pickerContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
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
    borderWidth: 1,
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  messageInput: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    height: 100,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    width: '45%',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'black',
  },
  sendButton: {
    backgroundColor: '#fb5a03',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default SwipeScreen;