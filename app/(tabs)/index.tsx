import React from 'react';
import { Text, View, StyleSheet, Dimensions, Image as RNImage } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Swiper from 'react-native-deck-swiper';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const data = [
  { name: 'John Doe', age: 25 },
  { name: 'Jane Smith', age: 28 },
  { name: 'Sam Johnson', age: 30 },
];

//const Stack = createStackNavigator();

// Tinder-like swipe screen
const TinderSwipe = () => {
  return (
    <View style={styles.container}>
      <Swiper
        cards={data}
        renderCard={(card) => {
          return card ? (
            <View style={styles.card}>
              <Text style={styles.cardName}>{card.name}, {card.age}</Text>
            </View>
          ) : (
            <View style={styles.noMoreCards}>
              <Text>No More Profiles</Text>
            </View>
          );
        }}
        backgroundColor={'#f5f5f5'}
        stackSize={3}
        infinite
      />
    </View>
  );
};

// Placeholder for other screens (Explore, Messages, Profile, Settings)
const LeaderBoardScreen = () => <View style={styles.screen}><Text>LeaderBoard</Text></View>;
const MessagesScreen = () => <View style={styles.screen}><Text>Messages</Text></View>;
const ProfileScreen = () => <View style={styles.screen}><Text>Profile</Text></View>;
const SavedScreen = () => <View style={styles.screen}><Text>Saved</Text></View>;

// Create Bottom Tab Navigator
const Tab = createBottomTabNavigator();

const App = () => {
  return (
    // Remove NavigationContainer here if expo-router or any other library is handling it
    
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: { backgroundColor: '#fff', borderTopColor: '#eee' },
        tabBarLabelStyle: { fontSize: 36 },
      }}
    >
      
      <Tab.Screen 
        name="LeaderBoard" 
        component={LeaderBoardScreen} 
        options={{
          tabBarIcon: () => (
            <RNImage 
              source={require('C:/Users/admin-dsinha1/Downloads/React_native_StylePitch/stylepitch/trophy.png')} // replace with your icon file
              style={{ width: 24, height: 24,  
              backgroundColor: 'transparent', // Add this line to remove the grid
       }}
            />
          ),
          tabBarLabel: "", // Add this line to hide the label
        }}
      />
      <Tab.Screen 
        name="Messages" 
        component={MessagesScreen} 
        options={{
          tabBarIcon: () => (
            <RNImage 
              source={require('C:/Users/admin-dsinha1/Downloads/React_native_StylePitch/stylepitch/messages.png')} // replace with your icon file
              style={{ width: 36, height: 36,  
              backgroundColor: 'transparent' // Add this line to remove the grid
       }}
            />
          ),
          tabBarLabel: "", // Add this line to hide the label
        }}
      />
      <Tab.Screen 
        name="Home" 
        component={TinderSwipe} 
        options={{
          tabBarIcon: () => (
            <RNImage 
              source={require('C:/Users/admin-dsinha1/Downloads/React_native_StylePitch/stylepitch/hanger.png')} // replace with your icon file
              style={{ width: 36, height: 36,  
              backgroundColor: 'transparent' // Add this line to remove the grid
       }}
            />
          ),
          tabBarLabel: "", // Add this line to hide the label
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          tabBarIcon: () => (
            <RNImage 
              source={require('C:/Users/admin-dsinha1/Downloads/React_native_StylePitch/stylepitch/user_icon.webp')} // replace with your icon file
              style={{ width: 24, height: 24, borderRadius :12 }}
            />
          ),
          tabBarLabel: "", // Add this line to hide the label
        }}
      />
      <Tab.Screen 
        name="Saved" 
        component={SavedScreen} 
        options={{
          tabBarIcon: () => (
            <RNImage 
              source={require('C:/Users/admin-dsinha1/Downloads/React_native_StylePitch/stylepitch/saved.png')} // replace with your icon file
              style={{ width: 24, height: 24, borderRadius :12 }}
            />
          ),
          tabBarLabel: "", // Add this line to hide the label
        }}
      />
     </Tab.Navigator>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: SCREEN_HEIGHT * 0.15, // Add this line to center the cards
  },
  card: {
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_HEIGHT * 0.75, // Fixed height
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    marginBottom :20,
  },
  cardName: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  noMoreCards: {
    justifyContent: 'center',
    alignItems: 'center',
    height: SCREEN_HEIGHT * 0.6, // Fixed height
  },
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;