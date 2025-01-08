import React, { useEffect, useState, useCallback } from 'react';
import { Alert, ActivityIndicator, View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { getFirestore, doc, getDoc, collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { RootStackParamList } from './types';
import CustomHeader from './customheader';
import { format } from 'date-fns';

interface Chat {
  chatId: string;
  designerId: string;
  firstName: string;
  lastName: string;
  lastMessageTime: number;
  lastMessage: string;
}


const MessagesScreen = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [filteredChats, setFilteredChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const db = getFirestore();
  const auth = getAuth();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const fetchChats = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.log('No user logged in');
        return;
      }
  
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();
  
      if (userData?.chats) {
        const chatList: Chat[] = await Promise.all(
          Object.entries(userData.chats).map(async ([chatId, designerId]) => {
            const designerDoc = await getDoc(doc(db, 'users', designerId as string)); // Cast designerId to string
            const designerData = designerDoc.data();
  
            const messagesQuery = query(
              collection(db, 'chats', chatId, 'messages'),
              orderBy('createdAt', 'desc'),
              limit(1)
            );
            const messageDocs = await getDocs(messagesQuery);
            const lastMessage = messageDocs.docs[0]?.data()?.text || '';
            const lastMessageTime = messageDocs.docs[0]?.data()?.createdAt?.toMillis() || 0;
  
            return {
              chatId,
              designerId: designerId as string, // Ensure designerId is a string
              firstName: designerData?.firstName || 'Unknown',
              lastName: designerData?.lastName || 'Unknown',
              lastMessage,
              lastMessageTime,
            };
          })
        );
  
        chatList.sort((a, b) => b.lastMessageTime - a.lastMessageTime);
        setChats(chatList); // Correctly typed now
        setFilteredChats(chatList);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };  

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    const filtered = chats.filter(chat =>
      `${chat.firstName} ${chat.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredChats(filtered);
  }, [searchQuery, chats]);

  const navigateToChat = (chatId: string) => {
    navigation.navigate('ChatScreen', { chatId });
  };

  const formatTime = (timestamp: number) => {
    const now = new Date();
    const messageDate = new Date(timestamp);
  
    // If the message is from today, show time only (e.g., "12:45 PM")
    if (
      messageDate.getDate() === now.getDate() &&
      messageDate.getMonth() === now.getMonth() &&
      messageDate.getFullYear() === now.getFullYear()
    ) {
      return format(messageDate, 'hh:mm a');
    }
  
    // If from this year, show month and day (e.g., "Oct 15")
    if (messageDate.getFullYear() === now.getFullYear()) {
      return format(messageDate, 'MMM dd');
    }
  
    // Otherwise, show full date (e.g., "Oct 15, 2023")
    return format(messageDate, 'MMM dd, yyyy');
  };

  const renderChatItem = ({ item }: { item: Chat }) => (
    <TouchableOpacity style={styles.chatItem} onPress={() => navigateToChat(item.chatId)}>
      <View style={styles.chatContent}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{item.firstName[0]}{item.lastName[0]}</Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.boldText}>
            {item.firstName} {item.lastName}
          </Text>
          <View style={styles.messageRow}>
            <Text style={styles.lastMessage} numberOfLines={1} ellipsizeMode="tail">
              {item.lastMessage}
            </Text>
            <Text style={styles.messageTime}>
              {formatTime(item.lastMessageTime)}
            </Text>
          </View>
        </View>
        <View style={styles.arrowContainer}>
          <MaterialIcons name="arrow-forward" size={24} color="#fb5a03" />
        </View>
      </View>
    </TouchableOpacity>
  );


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
      <CustomHeader title="Messages" onLogout={handleLogout} />
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <MaterialIcons name="search" size={24} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search chats..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        ) : filteredChats.length === 0 ? (
          <Text style={styles.text}>
            To interact with designers you like, hold on the designs!
          </Text>
        ) : (
          <FlatList
            data={filteredChats}
            keyExtractor={(item) => item.chatId}
            renderItem={renderChatItem}
            style={styles.list}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f6f6',
  },
  searchContainer: {
    marginVertical: 16,
    marginHorizontal: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  list: {
    flex: 1,
    marginTop: 0,
  },
  chatItem: {
    marginHorizontal: 16,
    marginVertical: 6,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
  },
  chatContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    marginRight: 8,
    lineHeight: 18,
  },
  messageTime: {
    fontSize: 14,
    color: '#aaa',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  textContainer: {
    flex: 1,
  },
  chatText: {
    fontSize: 20,
    color: '#333',
  },
  boldText: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  arrowContainer: {
    marginLeft: 'auto',
    paddingLeft : 10,
  },
  text: {
    fontSize: 20,
    color: '#333',
    textAlign: 'center',
    marginTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MessagesScreen;