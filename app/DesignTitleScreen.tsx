// DesignTitleScreen.tsx
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { DesignTitleScreenProps } from './types';
import { MaterialIcons } from '@expo/vector-icons';
import CustomHeader from './customheader';
import { SafeAreaView } from 'react-native-safe-area-context';

const DesignTitleScreen: React.FC<DesignTitleScreenProps> = ({ designTitle, setDesignTitle, navigation }) => {
  const handleNextPress = () => {
    if (!designTitle.trim()) {
      Alert.alert("Error", "Please enter a design title."); // Show alert if empty
    } else {
      navigation.navigate('AddImages', { designTitle });
    }
  };

  return (
    <View style= {{flex:1}}>
      <CustomHeader title='Title'/>
        <View style={styles.container}>
          <Text style={styles.title}>Enter Design Title</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your design title"
            value={designTitle}
            onChangeText={setDesignTitle}
          />
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleNextPress} // Use the new handler
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#fb5a03',
    borderRadius: 8,
    padding: 10,
    width: '90%',
    marginBottom: 20,
    backgroundColor: "#fff",
  },
  iconButton: {
    backgroundColor: 'transparent', // Optional: Adjust background if needed
    padding: 15,
    borderRadius: 8,
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default DesignTitleScreen;
