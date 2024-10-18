// RegionSelectionScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRegion } from './RegionContext'; // Import the custom hook for global region
import Entypo from '@expo/vector-icons/Entypo';
import { RootStackNavigationProp } from './types';
import { Navigation } from 'lucide-react-native';

const RegionSelectionScreen = ({ navigation }) => {
  const { setRegion } = useRegion(); // Global region from context

  const regions = ['Americas', 'Europe', 'East Asia', 'South Asia', 'Africa', 'Australia', 'Gulf'];

  const handleRegionSelect = (selectedRegion:string) => {
    setRegion(selectedRegion); // Update the global region
    navigation.replace('MainScreen'); // Navigate to MainScreen
  };

  return (
    <View style={styles.container}>
      <Entypo name="globe" size={24} color="black" />
      {regions.map((region) => (
        <TouchableOpacity key={region} style={styles.regionButton} onPress={() => handleRegionSelect(region)}>
          <Text style={styles.regionButtonText}>{region}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  regionButton: {
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
  },
  regionButtonText: {
    fontSize: 18,
    color: '#333',
  },
});

export default RegionSelectionScreen;
