// AddImagesScreen.tsx
import React from 'react';
import { Image, Dimensions, View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { AddImagesScreenProps } from './types';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from './types';
import Icon from 'react-native-vector-icons/FontAwesome';

import { MaterialIcons } from '@expo/vector-icons';
import CustomHeader from './customheader';


const CARD_WIDTH = (Dimensions.get('window').width / 2) - 25;
const CARD_HEIGHT = Dimensions.get('window').height * 0.4;
const MAX_URL_LENGTH = 30; // Maximum number of characters to display

type AddImagesScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AddImages'>;

const AddImagesScreen: React.FC<AddImagesScreenProps> = ({ imageUrls, setImageUrls }) => {
  const navigation = useNavigation<AddImagesScreenNavigationProp>();
  const route = useRoute();
  const { designTitle } = route.params as { designTitle: string };

  const handleAddUrl = () => {
    setImageUrls([...imageUrls, '']);
  };

  const handleDeleteUrl = (index: number) => {
    const newUrls = imageUrls.filter((_, i) => i !== index);
    setImageUrls(newUrls);
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
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteUrl(index)}>
          <Icon name="trash" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
      <View style={styles.cardContainer}>
        {item.trim() !== '' && renderImageCard(item)}
      </View>
    </View>
  );

  const handleNextPress = () => {
    // Remove empty URLs before proceeding
    const filteredUrls = imageUrls.filter((url) => url.trim() !== '');
    
    // Update the state to reflect only the non-empty URLs
    setImageUrls(filteredUrls);
  
    // Check if there's at least one non-empty image URL
    if (filteredUrls.length > 0) {
      navigation.navigate('SelectRegion', { designTitle, imageUrls: filteredUrls });
    } else {
      Alert.alert('No Image URLs', 'Please enter at least one valid image URL before proceeding.');
    }
  };

  return (
    <View style = {{flex:1}}>
      <CustomHeader title = "Add Images"/>
    <View style={styles.container}>
      <Text style={styles.title}>Images</Text>
      
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
        onPress={handleNextPress} // Use the new handleNextPress function
      >
        <MaterialIcons name="arrow-forward" size={24} color="#fb5a03" />
      </TouchableOpacity>
    </View>
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
    borderColor: '#fb5a03',
    flexDirection: 'row', 
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  input: {
    padding: 10,
    width: '100%',
    flex: 1, 
  },
  deleteButton: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF0000',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
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
    backgroundColor: '#fb5a03',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  nextButton: {
    borderColor: '#fb5a03',
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default AddImagesScreen;
