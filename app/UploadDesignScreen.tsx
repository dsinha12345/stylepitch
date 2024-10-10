import React, { useState } from 'react';
import { Dimensions, View, Text, StyleSheet, Alert, TextInput, TouchableOpacity, FlatList, Image, Modal, Pressable, ScrollView } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import CustomHeader from './customheader'; // Adjust the import path as necessary

const CARD_WIDTH = (Dimensions.get('window').width / 2) - 25;
const CARD_HEIGHT = Dimensions.get('window').height * 0.4;

const UploadDesignScreen = () => {
  const [designTitle, setDesignTitle] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>(['']);
  const [uploading, setUploading] = useState(false);
  const [regionModalVisible, setRegionModalVisible] = useState(false);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);

  const handleAddUrl = () => {
    setImageUrls([...imageUrls, '']);
  };

  const handleUrlChange = (text: string, index: number) => {
    const newUrls = [...imageUrls];
    newUrls[index] = text;
    setImageUrls(newUrls);
  };

  const uploadDesign = async () => {
    if (!designTitle.trim()) {
      Alert.alert('Please enter a design title.');
      return;
    }
    if (imageUrls.some(url => !url.trim())) {
      Alert.alert('Please fill in all image URLs.');
      return;
    }
    if (selectedRegions.length === 0) {
      Alert.alert('Please select at least one region.');
      return;
    }
  
    setUploading(true);
    const currentUser = auth().currentUser;
    if (!currentUser) return;
  
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
        
        // Create the design data object to be added to each region
        const designData = {
          designId,
          title: designTitle,
          imageUrls,
          userId: currentUser.uid,
          createdAt: firestore.FieldValue.serverTimestamp(),
        };
        
        // Add the design data to the subcollection of the selected region
        batch.set(designsCollectionRef.doc(designId), designData); // Use set to overwrite if it exists
      });
  
      await batch.commit();
  
      Alert.alert('Success', 'Design uploaded successfully!');
      setDesignTitle('');
      setImageUrls(['']);
      setSelectedRegions([]);
    } catch (error) {
      console.error('Error uploading design:', error);
      Alert.alert('Upload failed', 'There was an error uploading your design.');
    } finally {
      setUploading(false);
    }
  };
  

  const renderImageCard = (url: string) => (
    <View style={styles.imageCard}>
      <Image source={{ uri: url }} style={styles.image} resizeMode="cover" />
    </View>
  );

  const handleLogout = () => {
    auth().signOut().then(() => {
      Alert.alert('Logged out', 'You have been logged out successfully.');
    }).catch(error => {
      console.error('Logout error:', error);
      Alert.alert('Logout failed', 'There was an error logging you out.');
    });
  };

  const regions = ['Americas', 'Europe', 'East Asia','South Asia', 'Africa', 'Australia', 'Global',"Gulf"];

  const toggleRegion = (region: string) => {
    setSelectedRegions(prevRegions => 
      prevRegions.includes(region)
        ? prevRegions.filter(r => r !== region)
        : [...prevRegions, region]
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <CustomHeader title="Upload Your Design" onLogout={handleLogout} />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.textInputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Enter Design Title"
            value={designTitle}
            onChangeText={setDesignTitle}
          />
        </View>
        <FlatList
          data={imageUrls}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <View style={styles.inputContainer}>
              <View style={styles.textInputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter Image URL"
                  value={item}
                  onChangeText={text => handleUrlChange(text, index)}
                  multiline
                />
              </View>
              <View style={styles.cardContainer}>
                {item ? renderImageCard(item) : null}
              </View>
            </View>
          )}
          contentContainerStyle={styles.listContainer}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddUrl}>
          <Text style={styles.addButtonText}>Add Another Image URL</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => setRegionModalVisible(true)}>
          <Text style={styles.buttonText}>Select Regions</Text>
        </TouchableOpacity>

        {selectedRegions.length > 0 && (
          <View style={styles.selectedRegionsContainer}>
            <Text style={styles.selectedRegionsTitle}>Selected Regions:</Text>
            {selectedRegions.map(region => (
              <Text key={region} style={styles.selectedRegion}>{region}</Text>
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.button} onPress={uploadDesign} disabled={uploading}>
          <Text style={styles.buttonText}>{uploading ? 'Uploading...' : 'Upload Design'}</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={regionModalVisible}
        onRequestClose={() => setRegionModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Select Regions</Text>
            <View style={styles.regionScrollView}>
              {regions.map(region => (
                <TouchableOpacity
                  key={region}
                  style={[
                    styles.regionOption,
                    selectedRegions.includes(region) && styles.selectedRegionOption
                  ]}
                  onPress={() => toggleRegion(region)}
                >
                  <Text style={[
                    styles.regionText,
                    selectedRegions.includes(region) && styles.selectedRegionText
                  ]}>{region}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Pressable style={styles.modalCloseButton} onPress={() => setRegionModalVisible(false)}>
              <Text style={styles.closeButtonText}>Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
    alignItems: 'center',
  },
  textInputWrapper: {
    width: '100%',
    height: 50,
    borderColor: '#007BFF',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
    marginBottom: 10,
  },
  input: {
    padding: 15,
    fontSize: 16,
  },
  cardContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  button: {
    backgroundColor: '#fb5a03', // Main button color
    padding: 15,
    borderRadius: 8,
    width: '90%',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000', // Shadow for depth
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.5,
    elevation: 5, // For Android shadow
  },
  buttonText: {
    color: '#fff', // Button text color
    fontSize: 16,
    fontWeight: 'bold', // Make text bold
  },
  addButton: {
    backgroundColor: '#fb5a03', // Add button color
    padding: 15,
    borderRadius: 8,
    marginVertical: 20,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000', // Shadow for depth
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.5,
    elevation: 5, // For Android shadow
  },
  addButtonText: {
    color: '#fff', // Add button text color
    fontSize: 16,
    fontWeight: 'bold', // Make text bold
  },
  imageCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
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
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  listContainer: {
    paddingBottom: 20,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    height: '70%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  regionScrollView: {
    width: '100%',
  },
  regionOption: {
    width: '100%',
    padding: 15,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  selectedRegionOption: {
    backgroundColor: '#fb5a03',
  },
  regionText: {
    fontSize: 16,
  },
  selectedRegionText: {
    color: '#fff',
  },
  modalCloseButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#fb5a03',
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  selectedRegionsContainer: {
    width: '90%',
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  selectedRegionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  selectedRegion: {
    fontSize: 14,
    marginBottom: 2,
  },
});

export default UploadDesignScreen;