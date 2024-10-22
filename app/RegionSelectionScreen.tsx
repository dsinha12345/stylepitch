import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRegion } from './RegionContext';
import { Entypo } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';

type RegionSelectionScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'RegionSelection'>;

type RegionSelectionScreenProps = {
  navigation: RegionSelectionScreenNavigationProp;
};

const RegionSelectionScreen: React.FC<RegionSelectionScreenProps> = ({ navigation }) => {
  const { setRegion } = useRegion();

  const regions = ["Global",'Americas', 'Europe', 'East Asia', 'South Asia', 'Africa', 'Australia', 'Gulf'];

  const handleRegionSelect = (selectedRegion: string) => {
    setRegion(selectedRegion);
    navigation.replace('MainScreen');
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
          style={styles.regionButton} 
          onPress={() => handleRegionSelect(region)}
        >
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
    elevation: 3, // Added for Android shadow
  },
  regionButtonText: {
    fontSize: 18,
    color: '#333',
  },
});

export default RegionSelectionScreen;