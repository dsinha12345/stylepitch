import React, { useState } from 'react';
import { Alert, View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, Pressable } from 'react-native';
import { useRegion } from './RegionContext'; // Import the custom hook for global region
import CustomHeader from './customheader';
import auth from '@react-native-firebase/auth';
import Entypo from '@expo/vector-icons/Entypo';

const SettingsScreen = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Use the global region state
  const { region, setRegion } = useRegion(); // Global region from context

  // List of settings options
  const settingsOptions = [{ id: '1', name: 'Region' }];

  // List of regions for the modal
  const regions = ["Global",'Americas', 'Europe', 'East Asia', 'South Asia', 'Africa', 'Australia', 'Gulf'];

  const handleOptionPress = (option: string) => {
    if (option === 'Region') {
      setIsModalVisible(true);
    }
  };

  const handleRegionSelect = (selectedRegion: string) => {
    setRegion(selectedRegion); // Update the global region
    setIsModalVisible(false);
  };

  const handleLogout = () => {
    auth().signOut().then(() => {
      Alert.alert('Logged out', 'You have been logged out successfully.');
    }).catch(error => {
      console.error('Logout error:', error);
      Alert.alert('Logout failed', 'There was an error logging you out.');
    });
  };
  return (
    <View style={{flex:1}}>
      <CustomHeader title = "Settings" onLogout={handleLogout}/>
    <View style={styles.container}>
      <FlatList
        data={settingsOptions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleOptionPress(item.name)}>
            <View style={styles.settingButton}>
              <Entypo name="globe" size={24} color="black" /> 
              <Text style={styles.item}>{region || 'Global'}</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Modal for region selection */}
      <Modal
        visible={isModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setIsModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Region</Text>
                <Text style={styles.modalSubtitle}>Choose your preferred region</Text>
              </View>
              
              <View style={styles.regionList}>
                {regions.map((regionItem) => (
                  <TouchableOpacity
                    key={regionItem}
                    style={[
                      styles.regionButton,
                      region === regionItem && styles.selectedRegion
                    ]}
                    onPress={() => handleRegionSelect(regionItem)}
                  >
                    <Text style={[
                      styles.regionButtonText,
                      region === regionItem && styles.selectedRegionText
                    ]}>
                      {regionItem}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  item: {
    fontSize: 18,
    padding: 15,
    marginVertical: 5,
    borderRadius: 5,
  },
  settingButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  settingButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  selectedValue: {
    fontSize: 16,
    color: '#666666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  modalHeader: {
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginTop: 8,
  },
  regionList: {
    marginBottom: 24,
  },
  regionButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginVertical: 6,
    backgroundColor: '#f8f9fa',
  },
  selectedRegion: {
    backgroundColor: '#fb5a03',
  },
  regionButtonText: {
    fontSize: 16,
    color: '#1a1a1a',
    textAlign: 'center',
  },
  selectedRegionText: {
    color: '#ffffff',
    fontWeight: '500',
  },
  closeButton: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#fb5a03',
    fontWeight: '500',
  },
});

export default SettingsScreen;
