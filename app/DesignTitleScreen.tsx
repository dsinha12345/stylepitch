// DesignTitleScreen.tsx
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { DesignTitleScreenProps } from './types';

const DesignTitleScreen: React.FC<DesignTitleScreenProps> = ({ designTitle, setDesignTitle, navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter Design Title</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your design title"
        value={designTitle}
        onChangeText={setDesignTitle}
      />
      <TouchableOpacity
        style={styles.nextButton}
        // Pass designTitle to AddImages screen
        onPress={() => navigation.navigate('AddImages', { designTitle })}
      >
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
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
    borderColor: '#007BFF',
    borderRadius: 8,
    padding: 10,
    width: '90%',
    marginBottom: 20,
  },
  nextButton: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 8,
    width: '90%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default DesignTitleScreen;
