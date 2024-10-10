import React from 'react';
import { Image, Dimensions, View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { AddImagesScreenProps } from './types';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from './types';

const CARD_WIDTH = (Dimensions.get('window').width / 2) - 25;
const CARD_HEIGHT = Dimensions.get('window').height * 0.4;
const MAX_URL_LENGTH = 30; // Maximum number of characters to display

type AddImagesScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AddImages'>;

const AddImagesScreen: React.FC<AddImagesScreenProps> = ({ imageUrls, setImageUrls }) => {
  const navigation = useNavigation<AddImagesScreenNavigationProp>();
  const route = useRoute();
  const { designTitle } = route.params as { designTitle: string };  // Retrieve designTitle from the route params

  const handleAddUrl = () => {
    setImageUrls([...imageUrls, '']);
  };

  const handleUrlChange = (text: string, index: number) => {
    const newUrls = [...imageUrls];
    newUrls[index] = text;
    setImageUrls(newUrls);
  };

  const truncateUrl = (url: string) => {
    if (url.length <= MAX_URL_LENGTH) return url;
    const start = url.substring(0, MAX_URL_LENGTH / 2);
    const end = url.substring(url.length - MAX_URL_LENGTH / 2);
    return `${start}...${end}`;
  };

  const renderImageCard = (url: string) => (
    <View style={styles.imageCard}>
      <Image 
        source={{ uri: url }} 
        style={styles.image} 
        resizeMode="cover" 
        onError={(e) => console.log('Image loading error:', e.nativeEvent.error)}
      />
    </View>
  );

  const renderItem = ({ item, index }: { item: string; index: number }) => (
    <View style={styles.inputContainer}>
      <View style={styles.textInputWrapper}>
        <TextInput
          style={styles.input}
          placeholder="Enter Image URL"
          value={truncateUrl(item)}
          onChangeText={(text) => handleUrlChange(text, index)}
          multiline
        />
      </View>
      <View style={styles.cardContainer}>
        {item.trim() !== '' && renderImageCard(item)}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Image URLs</Text>
      
      <FlatList
        data={imageUrls}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
      />
  
      <TouchableOpacity style={styles.addButton} onPress={handleAddUrl}>
        <Text style={styles.buttonText}>Add Another Image URL</Text>
      </TouchableOpacity>
  
      <TouchableOpacity
        style={styles.nextButton}
        // Pass both designTitle and imageUrls to the next screen
        onPress={() => navigation.navigate('SelectRegion', { designTitle, imageUrls })}
      >
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 20,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
    alignItems: 'center',
  },
  textInputWrapper: {
    width: '100%',
    borderColor: '#007BFF',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  input: {
    padding: 10,
    width: '100%',
  },
  cardContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
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
  addButton: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  nextButton: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default AddImagesScreen;
/*


  
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
  

\
\
  return (
    <View style={{ flex: 1 }}>
      <CustomHeader title="Upload Your Design" onLogout={handleLogout} />
      <ScrollView contentContainerStyle={styles.container}>
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




      </ScrollView>

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
*/