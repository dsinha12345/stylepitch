// SavedScreen.tsx
import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, Dimensions } from 'react-native';
import { Picker } from '@react-native-picker/picker'; // Import the Picker component

const CARD_WIDTH = (Dimensions.get('window').width / 2) - 25;
const CARD_HEIGHT = Dimensions.get('window').height * 0.4;

const data = Array.from({ length: 10 }, (_, i) => ({
  id: i.toString(),
  title: `# ${i + 1}`,
}));

const countries = [
  { label: 'United States', value: 'US' },
  { label: 'Canada', value: 'CA' },
  { label: 'United Kingdom', value: 'UK' },
  { label: 'Germany', value: 'DE' },
  { label: 'France', value: 'FR' },
  // Add more countries as needed
];

const Card = ({ title }: { title: string }) => (
  <View style={styles.card}>
    <Text style={styles.cardText}>{title}</Text>
  </View>
);

const SavedScreen = () => {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  return (
    <View style={styles.container}>
      <View style={styles.dropdownContainer}>
        <Picker
          selectedValue={selectedCountry}
          onValueChange={(itemValue) => setSelectedCountry(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Select a country" value={null} />
          {countries.map((country) => (
            <Picker.Item key={country.value} label={country.label} value={country.value} />
          ))}
        </Picker>
      </View>
      <FlatList
        data={data}
        renderItem={({ item }) => <Card title={item.title} />}
        keyExtractor={(item) => item.id}
        numColumns={2}
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
  dropdownContainer: {
    paddingHorizontal: 10,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  list: {
    paddingBottom: 20,
    paddingHorizontal: 10,
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
