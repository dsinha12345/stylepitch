import React, { useState } from 'react';
import { Dimensions, View, Text, StyleSheet, Alert, TextInput, TouchableOpacity, FlatList, Image } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import CustomHeader from './customheader'; // Adjust the import path as necessary

const CARD_WIDTH = (Dimensions.get('window').width / 2) - 25;
const CARD_HEIGHT = Dimensions.get('window').height * 0.4;

const UploadDesignScreen = () => {
  const [designTitle, setDesignTitle] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>(['']);
  const [uploading, setUploading] = useState(false);

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

    setUploading(true);
    const currentUser = auth().currentUser;
    if (!currentUser) return;

    try {
      const batch = firestore().batch();
      const designId = Date.now().toString();
      const designRef = firestore().collection('designs').doc(designId);

      batch.set(designRef, {
        userId: currentUser.uid,
        title: designTitle,
        imageUrls: imageUrls,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      await firestore().collection('users').doc(currentUser.uid).update({
        uploadedDesigns: firestore.FieldValue.arrayUnion(designId),
      });

      await batch.commit();

      Alert.alert('Success', 'Design uploaded successfully!');
      setDesignTitle('');
      setImageUrls(['']);
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

  return (
    <View style={{ flex: 1 }}>
      <CustomHeader title="Upload Your Design" onLogout={handleLogout} />
      <View style={styles.container}>
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
        <TouchableOpacity style={styles.button} onPress={uploadDesign} disabled={uploading}>
          <Text style={styles.buttonText}>{uploading ? 'Uploading...' : 'Upload Design'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9f9',
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
  addButton: {
    backgroundColor: '#fb5a03',
    padding: 10,
    borderRadius: 8,
    marginVertical: 20,
    width: '90%',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#fb5a03',
    padding: 15,
    borderRadius: 8,
    width: '90%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
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
});

export default UploadDesignScreen;
