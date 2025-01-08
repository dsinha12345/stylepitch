import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { RefreshControl,TextInput, Alert, View, Text, StyleSheet, Dimensions, TouchableOpacity, Image as RNImage, ScrollView, SafeAreaView, Modal, Share } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import { getFirestore, collection, doc, getDoc, updateDoc, query, where, getDocs, orderBy, arrayUnion, increment, addDoc, serverTimestamp } from "firebase/firestore";
import { getAuth, onAuthStateChanged, currentUser } from "firebase/auth";
import app from '../firebaseConfig';
import CustomHeader from './customheader';
import { useNavigation } from '@react-navigation/native';
import { RootStackNavigationProp } from './types'; // Adjust the path as necessary

// Initialize Firebase

const auth = getAuth(app);
const firestore = getFirestore(app);


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
  const [region, setRegion] = useState<string>("Global");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const navigation = useNavigation<RootStackNavigationProp>(); 


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      if (user) {
        fetchSavedDesigns(user.uid);
        fetchUserRegion(user.uid);
      } else {
        setRegion("Global");
      }
    });
    return unsubscribe;
  }, []);

  const fetchUserRegion = async (userId: string) => {
    try {
      const userDoc = await getDoc(doc(firestore, "users", userId));
      const userData = userDoc.data();
      setRegion(userData?.regionPreference || "Global");
    } catch (error) {
      console.error("Error fetching user region:", error);
    }
  };

  const loadDesignsByRegion = async (selectedRegion: string) => {
    try {
      const designsRef = collection(firestore, "regions", selectedRegion, "designs");
      const designsQuery = query(designsRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(designsQuery);

      const designsData: Design[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Design[];

      setDesigns(designsData);
    } catch (error) {
      console.error("Error fetching designs:", error);
    }
  };
  
  
  const fetchSavedDesigns = async (userId: string) => {
    try {
      const userDoc = await getDoc(doc(firestore, "users", userId));
      const savedDesigns = userDoc.data()?.savedDesigns || [];
      setSavedCards(savedDesigns);
    } catch (error) {
      console.error("Error fetching saved designs:", error);
    }
  };


  useEffect(() => {
    if (region && isAuthenticated) {
      loadDesignsByRegion(region);
    }
  }, [region, isAuthenticated]);

  const savePost = async (id: string) => {
    if (auth.currentUser) {
      try {
        const userRef = doc(firestore, "users", auth.currentUser.uid);
        await updateDoc(userRef, {
          savedDesigns: arrayUnion(id),
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
  };

  const isSaved = useCallback((id: string) => savedCards.includes(id), [savedCards]);

  const handleLongPress = useCallback((userId: string) => {
    setSelectedDesignerId(userId);
    setIsMessageModalVisible(true);
  }, []);


  const sendMessageToDesigner = useCallback(async () => {
    if (!currentUser || !selectedDesignerId) {
      Alert.alert('Error', 'You must be logged in to send messages.');
      return;
    }
  
    try {
      const userDocRef = doc(firestore, 'users', currentUser.uid);
      const userDoc = await getDoc(userDocRef);
  
      if (!userDoc.exists()) {
        throw new Error('User data does not exist.');
      }
  
      const userData = userDoc.data();
      
      // Check if a chat already exists between these users
      const chatQuery = query(
        collection(firestore, 'chats'),
        where('participants', 'array-contains', currentUser.uid)
      );
      const chatSnapshot = await getDocs(chatQuery);
      
      let chatId: string;
      const existingChat = chatSnapshot.docs.find(
        (chat) => chat.data().participants.includes(selectedDesignerId)
      );
  
      if (existingChat) {
        chatId = existingChat.id;
      } else {
        // Create a new chat if one doesn't exist
        const chatRef = await addDoc(collection(firestore, 'chats'), {
          participants: [currentUser.uid, selectedDesignerId],
          createdAt: serverTimestamp(),
        });
        chatId = chatRef.id;
      }
  
      // Update user chat references
      await Promise.all([
        updateDoc(userDocRef, {
          [`chats.${chatId}`]: selectedDesignerId,
        }),
        updateDoc(doc(firestore, 'users', selectedDesignerId), {
          [`chats.${chatId}`]: currentUser.uid,
        }),
      ]);
  
      // Add message to the chat
      const messagesRef = collection(firestore, 'chats', chatId, 'messages');
      await addDoc(messagesRef, {
        text: customMessage || "Hi, I'm interested in your design!",
        createdAt: serverTimestamp(),
        senderId: currentUser.uid,
        senderName: `${userData?.firstName || 'First'} ${userData?.lastName || 'Last'}`,
      });
  
      // Reset modal and message
      setIsMessageModalVisible(false);
      setCustomMessage("Hi, I'm interested in your design!");
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send the message. Please try again.');
    }
  }, [currentUser, selectedDesignerId, customMessage]);

  const handleSwipe = async (id: string, direction: 'left' | 'right', selectedRegion: string) => {
    try {
      // Determine the field to update based on swipe direction
      const updateField = direction === 'right' ? { likes: increment(1) } : { dislikes: increment(1) };
  
      // Update the main "designs" collection
      const designRef = doc(firestore, "designs", id);
      await updateDoc(designRef, updateField);
  
      // Update region-specific and global collections if the region is not "Global"
      if (selectedRegion !== "Global") {
        const regionDesignRef = doc(firestore, "regions", selectedRegion, "designs", id);
        const globalRegionDesignRef = doc(firestore, "regions", "Global", "designs", id);
  
        await Promise.all([
          updateDoc(regionDesignRef, updateField),
          updateDoc(globalRegionDesignRef, updateField),
        ]);
      } else {
        // Update "Global" region only when it's explicitly the selected region
        const globalRegionDesignRef = doc(firestore, "regions", "Global", "designs", id);
        await updateDoc(globalRegionDesignRef, updateField);
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

  const handleShare = async (design: Design) => {
    try {
      const result = await Share.share({
        message: `Check out this amazing design: ${design.title}`,
        url: design.imageUrls[0], // Share the first image URL
        title: design.title || 'Amazing Design'
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log('Shared with activity type:', result.activityType);
        } else {
          console.log('Shared successfully');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong while sharing the design');
      console.error(error);
    }
  };

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
            
            <TouchableOpacity 
              style={styles.shareButton} 
              onPress={() => handleShare(card)}
            >
              <RNImage 
                source={require('../assets/share.png')} 
                style={styles.shareIcon}
              />
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
    <View> <CustomHeader title="Home" onLogout={handleLogout} />
    <SafeAreaView style={styles.container}>
      <Swiper
        ref={swiperRef}
        cards={memoizedDesigns}
        renderCard={renderCard}
        backgroundColor={'#f5f5f5'}
        stackSize={3}
        containerStyle={styles.swiperContainer}
        cardVerticalMargin={40}
        verticalSwipe={false}
        cardIndex={0}
        keyExtractor={(card: Design) => card.id}
        onSwipedAll={() => console.log('All cards have been swiped')}
        onSwipedRight={(cardIndex) => {
          const swipedCard = memoizedDesigns[cardIndex];
          handleSwipe(swipedCard.id, 'right',region);
        }}
        onSwipedLeft={(cardIndex) => {
          const swipedCard = memoizedDesigns[cardIndex];
          handleSwipe(swipedCard.id, 'left',region);
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
    </View>
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
    alignItems: 'center',
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
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
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    backgroundColor: '#fff',
  },
  shareIcon: {
    width: 25,
    height: 25,
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