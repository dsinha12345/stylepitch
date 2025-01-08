import React, { useState, useEffect, useCallback } from 'react';
import { Alert, View, ActivityIndicator, StyleSheet, SafeAreaView, Platform, StatusBar, Text } from 'react-native';
import { GiftedChat, IMessage, Bubble, Send, InputToolbar } from 'react-native-gifted-chat';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from './types';
import CustomHeader from './customheader';
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';


type ChatScreenRouteProp = RouteProp<RootStackParamList, 'ChatScreen'>;
type ChatScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ChatScreen'>;

interface ChatScreenProps {
  route: ChatScreenRouteProp;
  navigation: ChatScreenNavigationProp;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ route }) => {
  const { chatId } = route.params;
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      console.log('No user logged in');
      return;
    }

    const chatRef = collection(db, 'chats', chatId, 'messages');
    const q = query(chatRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messagesFromFirestore = querySnapshot.docs.map((doc) => {
        const firebaseData = doc.data();
        const message: IMessage = {
          _id: doc.id,
          text: firebaseData.text,
          createdAt: firebaseData.createdAt.toDate(),
          user: {
            _id: firebaseData.senderId,
            name: firebaseData.senderName,
          },
        };
        return message;
      });

      setMessages(messagesFromFirestore);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [chatId, db]);

  const onSend = useCallback(async(newMessages: IMessage[] = []) => {
    const user = auth.currentUser;

    if (!user) {
      console.log('No user logged in');
      return;
    }

    const message = newMessages[0];

    try {
      const chatRef = collection(db, 'chats', chatId, 'messages');
      await addDoc(chatRef, {
        text: message.text,
        createdAt: new Date(),
        senderId: user.uid,
        senderName: user.displayName || 'Unknown',
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  },
  [chatId, db]
);


  const renderBubble = (props: any) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: '#0084ff',
          },
          left: {
            backgroundColor: '#e5e5ea',
          },
        }}
        textStyle={{
          right: {
            color: '#ffffff',
          },
          left: {
            color: '#000000',
          },
        }}
      />
    );
  };

  const renderSend = (props: any) => {
    return (
      <Send {...props}>
        <View style={styles.sendingContainer}>
          <Text style={styles.sendButtonText}>➤</Text>
        </View>
      </Send>
    );
  };

  const renderInputToolbar = (props: any) => {
    return (
      <InputToolbar
        {...props}
        containerStyle={styles.inputToolbar}
        textInputStyle={styles.textInput}
      />
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0084ff" />
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
    <SafeAreaView style={styles.container}>
      <CustomHeader title="Chat" onLogout={handleLogout} />
      <GiftedChat
        messages={messages}
        onSend={(newMessages) => onSend(newMessages)}
        user={{
          _id: auth.currentUser?.uid || '',
          name: auth.currentUser?.displayName || 'You',
        }}
        renderBubble={renderBubble}
        renderSend={renderSend}
        renderInputToolbar={renderInputToolbar}
        alwaysShowSend
        scrollToBottom
        scrollToBottomComponent={() => (
          <Text style={styles.scrollToBottomText}>⬇</Text>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  sendingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginBottom: 5,
  },
  sendButtonText: {
    fontSize: 24,
    color: '#0084ff',
  },
  inputToolbar: {
    borderTopWidth: 1,
    borderTopColor: '#e5e5ea',
    backgroundColor: '#ffffff',
  },
  textInput: {
    color: '#000000',
    fontSize: 16,
  },
  scrollToBottomText: {
    fontSize: 24,
    color: '#0084ff',
  },
});

export default ChatScreen;