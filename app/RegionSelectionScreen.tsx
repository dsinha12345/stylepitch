//RegionSelectionScreen.tsx

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRegion } from './RegionContext';
import { Entypo } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList, RootStackNavigationProp } from './types';


const RegionSelectionScreen: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const { setRegion } = useRegion();
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  const regions = ["Global", 'Americas', 'Europe', 'East Asia', 'South Asia', 'Africa', 'Australia', 'Gulf'];

  const handleRegionSelect = (region: string) => {
    setSelectedRegion(region);
  };

  const handleConfirmSelection = () => {
    if (selectedRegion) {
      setRegion(selectedRegion);
      navigation.navigate('MainScreen'); // Changed from 'MainScreen' to 'Tabs' to match the Stack.Navigator
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Entypo name="globe" size={48} color="black" />
      </View>
      <Text style={styles.title}>Select a Region</Text>
      {regions.map((region) => (
        <TouchableOpacity 
          key={region} 
          style={[
            styles.regionButton, 
            selectedRegion === region && styles.selectedButton
          ]} 
          onPress={() => handleRegionSelect(region)}
        >
          <Text style={styles.regionButtonText}>{region}</Text>
        </TouchableOpacity>
      ))}
      {selectedRegion && (
        <TouchableOpacity 
          style={styles.confirmButton} 
          onPress={handleConfirmSelection}
        >
          <Text style={styles.confirmButtonText}>Confirm Selection</Text>
        </TouchableOpacity>
      )}
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
  iconContainer: {
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  regionButton: {
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  selectedButton: {
    backgroundColor: '#d1e7dd',
  },
  regionButtonText: {
    fontSize: 18,
    color: '#333',
  },
  confirmButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#fb5a03',
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default RegionSelectionScreen;