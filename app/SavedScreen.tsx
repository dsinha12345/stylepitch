// SavedScreen.tsx
import React from 'react';
import { View, Text, FlatList, StyleSheet, Dimensions } from 'react-native';

const CARD_WIDTH = (Dimensions.get('window').width / 2) - 25; // Adjusted width for better spacing
const CARD_HEIGHT = Dimensions.get('window').height * 0.4; // Adjust card height for rectangular lengthwise design

const data = Array.from({ length: 5 }, (_, i) => ({
  id: i.toString(),
  title: `Saved designs ${i + 1}`,
}));

const Card = ({ title }: { title: string }) => (
  <View style={styles.card}>
    <Text style={styles.cardText}>{title}</Text>
  </View>
);

const SavedScreen = () => {
  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        renderItem={({ item }) => <Card title={item.title} />}
        keyExtractor={item => item.id}
        numColumns={2} // Display two cards per row
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      />
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
    paddingHorizontal: 10, // Apply padding here to balance left and right
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    margin: 10,
    borderRadius: 10,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default SavedScreen;
