import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { SelectRegionScreenRouteProp, RootStackNavigationProp } from './types';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import CustomHeader from './customheader';

type SelectRegionProps = {
  selectedRegions: string[];
  setSelectedRegions: (regions: string[]) => void;
  uploadDesign: () => Promise<void>; 
};

const SelectRegionScreen: React.FC<SelectRegionProps> = ({ selectedRegions, setSelectedRegions }) => {
  const [uploading, setUploading] = useState(false);
  const route = useRoute<SelectRegionScreenRouteProp>();
  const navigation = useNavigation<RootStackNavigationProp>();

  // Extract designTitle and imageUrls from route params
  const { designTitle, imageUrls } = route.params;

  const regions = ['Americas', 'Europe', 'East Asia', 'South Asia', 'Africa', 'Australia', 'Gulf'];

  const toggleRegion = (region: string) => {
    setSelectedRegions(
      selectedRegions.includes(region)
        ? selectedRegions.filter((r) => r !== region)
        : [...selectedRegions, region]
    );
  };

  const uploadDesign = async () => {
    setUploading(true);
    const currentUser = auth().currentUser;
    if (!currentUser) {
      Alert.alert('Error', 'You must be logged in to upload a design.');
      setUploading(false);
      return;
    }

    try {
      const batch = firestore().batch();
      const designId = Date.now().toString();
      const designRef = firestore().collection('designs').doc(designId);

      // Create the design document
      batch.set(designRef, {
        userId: currentUser.uid,
        title: designTitle,
        imageUrls: imageUrls,
        regions: selectedRegions,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      // Update user's uploaded designs
      batch.update(firestore().collection('users').doc(currentUser.uid), {
        uploadedDesigns: firestore.FieldValue.arrayUnion(designId),
      });

      // Update regions collection with all design information
      selectedRegions.forEach((region) => {
        const regionRef = firestore().collection('regions').doc(region);
        const designsCollectionRef = regionRef.collection('designs');

        const designData = {
          designId,
          title: designTitle,
          imageUrls,
          userId: currentUser.uid,
          createdAt: firestore.FieldValue.serverTimestamp(),
        };

        batch.set(designsCollectionRef.doc(designId), designData);
      });

      await batch.commit();

      Alert.alert('Success', 'Design uploaded successfully!');
      setSelectedRegions([]);

      // Navigate to UserDesigns screen after successful upload
      navigation.navigate('UserDesigns');

    } catch (error) {
      console.error('Error uploading design:', (error as Error).message);
      Alert.alert('Upload failed', `There was an error uploading your design: ${(error as Error).message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <CustomHeader title="Region" />
      <View style={styles.container}>
        <Text style={styles.title}>Select Regions</Text>

        <FlatList
          data={regions}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.regionOption, selectedRegions.includes(item) && styles.selectedRegion]}
              onPress={() => toggleRegion(item)}
            >
              <Text style={[styles.regionText, selectedRegions.includes(item) && styles.selectedRegionText]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />

        {/* Upload design button */}
        {uploading ? (
          <ActivityIndicator size="large" color="#007BFF" />
        ) : (
          <TouchableOpacity style={styles.uploadButton} onPress={uploadDesign}>
            <Text style={styles.buttonText}>Upload Design</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

// Styling for the screen components
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#fb5a03',
  },
  listContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  regionOption: {
    width: '100%',
    padding: 15,
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  selectedRegion: {
    backgroundColor: '#fb5a03',
  },
  regionText: {
    fontSize: 16,
    color: '#fb5a03',
  },
  selectedRegionText: {
    color: '#fff',
  },
  uploadButton: {
    backgroundColor: '#fb5a03',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default SelectRegionScreen;
