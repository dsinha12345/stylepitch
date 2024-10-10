import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native'; // Add useFocusEffect
import { MaterialIcons } from '@expo/vector-icons';
import CustomHeader from './customheader';
import { RootStackParamList } from './types'; // Import the RootStackParamList

interface Chat {
  chatId: string;
  designerId: string;
  firstName: string;
  lastName: string;
}

const MessagesScreen = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [filteredChats, setFilteredChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const fetchChats = async () => {
    try {
      const user = auth().currentUser;
      if (!user) {
        console.log('No user logged in');
        return;
      }

      const userDoc = await firestore().collection('users').doc(user.uid).get();
      const userData = userDoc.data();
      
      if (userData?.chats) {
        const chatList: Chat[] = await Promise.all(
          Object.entries(userData.chats).map(async ([chatId, designerId]: any) => {
            const designerDoc = await firestore().collection('users').doc(designerId).get();
            const designerData = designerDoc.data();
            
            return {
              chatId,
              designerId,
              firstName: designerData?.firstName || 'Unknown',
              lastName: designerData?.lastName || 'Unknown',
            };
          })
        );

        setChats(chatList);
        setFilteredChats(chatList);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh the chat list every time the screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchChats();
    }, [])
  );

  useEffect(() => {
    const filtered = chats.filter(chat => 
      `${chat.firstName} ${chat.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredChats(filtered);
  }, [searchQuery, chats]);

  const navigateToChat = (chatId: string) => {
    navigation.navigate('ChatScreen', { chatId });
  };

  const renderChatItem = ({ item }: { item: Chat }) => (
    <TouchableOpacity style={styles.chatItem} onPress={() => navigateToChat(item.chatId)}>
      <View style={styles.chatContent}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{item.firstName[0]}{item.lastName[0]}</Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.chatText}>
            <Text style={styles.boldText}>{item.firstName} {item.lastName}</Text>
          </Text>
        </View>
        <View style={styles.arrowContainer}>
        <MaterialIcons name="arrow-forward" size={24} color="#fb5a03" />
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <CustomHeader title="Messages" onLogout={() => auth().signOut()} />
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <Text>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search chats..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        {filteredChats.length === 0 ? (
          <Text style={styles.text}>No chats found</Text>
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
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  searchInput: {
    flex: 1,
    fontSize: 20,
    color: '#333',
  },
  list: {
    width: '100%',
  },
  chatItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  chatContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 15,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
  },
  textContainer: {
    flex: 1,
  },
  chatText: {
    fontSize: 18,
    color: '#333',
  },
  boldText: {
    fontWeight: 'bold',
  },
  arrowContainer: {
    marginLeft: 10,
  },
  text: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default MessagesScreen;
