import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image as RNImage } from 'react-native';
import Swiper from 'react-native-deck-swiper';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const data = [
  { id: 1, name: 'John Doe', image: 'https://images.squarespace-cdn.com/content/v1/54bc6cffe4b0fee4b02bd3c5/c88798a2-934e-440e-9e1d-89db4abd232a/IMG_4935.jpg' },
  { id: 2, name: 'Jane Smith', image: 'https://i.pinimg.com/736x/1a/e5/12/1ae5123d2738908a040c4c8b3caeb649.jpg' },
  { id: 3, name: 'Sam Johnson', image: 'https://d1muf25xaso8hp.cloudfront.net/https%3A%2F%2F40e507dd0272b7bb46d376a326e6cb3c.cdn.bubble.io%2Ff1701947977610x597614104972609200%2FThe%2520New%2520Black%2520%252847%2529.jpeg?w=256&h=256&auto=compress&dpr=2.5&fit=max' },
];

const SwipeScreen = () => {
  const [savedCards, setSavedCards] = useState<number[]>([]);

  const savePost = (id: number) => {
    setSavedCards((prev) => [...prev, id]);
  };

  const isSaved = (id: number) => savedCards.includes(id);

  return (
    <View style={styles.container}>
      <Swiper
        cards={data}
        renderCard={(card) => {
          return card ? (
            <View style={styles.card}>
              <RNImage source={{ uri: card.image }} style={styles.cardImage} />
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardName}>{card.name}</Text>

                {/* Save button */}
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
        containerStyle={styles.swiperContainer}
        verticalSwipe={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  swiperContainer: {
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
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    overflow: 'hidden',
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardTextContainer: {
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
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
});

export default SwipeScreen;
