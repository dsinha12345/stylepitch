import React, { useState, useEffect } from 'react';
import { Alert, View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, Pressable } from 'react-native';
import CustomHeader from './customheader';
import auth from '@react-native-firebase/auth';
import Entypo from '@expo/vector-icons/Entypo';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation
import { RootStackNavigationProp } from './types';

const SettingsScreen = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [region, setRegion] = useState<string>("Global"); // Default region value
  const regions = ["Global", 'Americas', 'Europe', 'East Asia', 'South Asia', 'Africa', 'Australia', 'Gulf'];
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const navigation = useNavigation<RootStackNavigationProp>(); // Initialize useNavigation
  const user = auth().currentUser;
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Set up auth state listener
    const unsubscribe = auth().onAuthStateChanged(user => {
      setIsAuthenticated(!!user);
      
      // Only fetch region if user is authenticated
      if (user) {
        firestore()
          .collection('users')
          .doc(user.uid)
          .get()
          .then(userDoc => {
            if (userDoc.exists) {
              setRegion(userDoc.data()?.regionPreference || "Global");
            }
          })
          .catch(error => {
            console.error("Error fetching user region:", error);
          });
      } else {
        // Reset region to default if user is not authenticated
        setRegion("Global");
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);



  // List of settings options
  const settingsOptions = [{ id: '1', name: 'Region' },{ id: '2', name: 'Delete Account' },];
  const NEW_USER_ID = 'bIhqY58m9IR4jWRaHMWY3JXyjIS2';
  const handleOptionPress = (option: string) => {
    if (option === 'Region') {
      setIsModalVisible(true);
    }else if (option === 'Delete Account') {
      setIsDeleteModalVisible(true);
      }
  };

  const handleRegionSelect = async (selectedRegion: string) => {
    if (user) {
      try {
        // Update region in Firebase
        await firestore().collection('users').doc(user.uid).update({ regionPreference: selectedRegion });
        setRegion(selectedRegion); // Update local state
        setIsModalVisible(false);
      } catch (error) {
        console.error("Error updating region:", error);
        Alert.alert("Error", "Could not update region.");
      }
    }
  };

  const handleLogout = () => {
    auth().signOut().then(() => {
      Alert.alert('Logged out', 'You have been logged out successfully.');
    }).catch(error => {
      console.error('Logout error:', error);
      Alert.alert('Logout failed', 'There was an error logging you out.');
    });
  };
  const updateMessagesToUnknown = async (userId:string) => {
  try {
    const chatDocs = await firestore()
        .collection('chats')
        .where('participants', 'array-contains', userId) // Changed to 'array-contains' to match users in participants
        .get();

  const updatePromises = chatDocs.docs.map(async (chatDoc) => {
// Update participants to replace userId with NEW_USER_ID
    await chatDoc.ref.update({
    participants: firestore.FieldValue.arrayRemove(userId),
    });
    await chatDoc.ref.update({
      participants: firestore.FieldValue.arrayUnion(NEW_USER_ID),
    });
    // Get messages sent by the userId to update their senderName
    const messageDocs = await firestore()
        .collection('messages')
        .where('senderId', '==', userId)
        .get();

  // Update each message's senderName to 'Unknown'
  const messageUpdatePromises = messageDocs.docs.map((messageDoc) => {
      return messageDoc.ref.update({
        senderName: 'Unknown',
        senderId: NEW_USER_ID,
      });
  });

    return Promise.all(messageUpdatePromises);
    });

    await Promise.all(updatePromises);
    // Update designs collection to replace userId with NEW_USER_ID
    const designDocs = await firestore()
    .collection('designs')
    .where('userId', '==', userId)
    .get();

    const designUpdatePromises = designDocs.docs.map((designDoc) => {
      return designDoc.ref.update({
      userId: NEW_USER_ID,
      });
      });

    await Promise.all(designUpdatePromises);
    } catch (error) {
    console.error('Error updating messages:', error);
    Alert.alert('Error', 'There was a problem updating your messages.');
    }
    };
  const handleDeleteAccount = async () => {
    const user = auth().currentUser;

    if (user) {
      try {
      // Call the function to update messages
      await updateMessagesToUnknown(user.uid);
        await user.delete();
      Alert.alert('Account Deleted', 'Your account has been deleted successfully.');
      navigation.navigate('LoginScreen'); // Optionally, navigate back to a login or welcome screen
      } catch (error) {
        console.error('Delete account error:', error);
        Alert.alert('Error', 'There was a problem deleting your account. Make sure you are logged in.');
      }
      }
      setIsDeleteModalVisible(false);
  };
    return (
      <View style={{ flex: 1 }}>
        <CustomHeader title="Settings" onLogout={handleLogout} />
        <View style={styles.container}>
          <FlatList
            data={settingsOptions}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleOptionPress(item.name)}>
                <View style={styles.settingButton}>
                  {item.name === 'Region' && (
                    <>
                      <Entypo name="globe" size={24} color="black" />
                      <Text style={styles.item}>{region || 'Global'}</Text>
                    </>
                  )}
                  {item.name === 'Delete Account' && (
                    <Text style={[styles.item, { color: 'red' }]}>Delete Account</Text>
                  )}
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
                          region === regionItem && styles.selectedRegion,
                        ]}
                        onPress={() => handleRegionSelect(regionItem)}
                      >
                        <Text
                          style={[
                            styles.regionButtonText,
                            region === regionItem && styles.selectedRegionText,
                          ]}
                        >
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
    
          {/* Modal for delete account confirmation */}
          <Modal
            visible={isDeleteModalVisible}
            animationType="fade"
            transparent={true}
            onRequestClose={() => setIsDeleteModalVisible(false)}
          >
            <Pressable
              style={styles.modalOverlay}
              onPress={() => setIsDeleteModalVisible(false)}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Delete Account</Text>
                  <Text style={styles.modalSubtitle}>
                    Are you sure you want to delete your account? This action cannot
                    be undone.
                  </Text>
    
                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={handleDeleteAccount}
                    >
                      <Text style={styles.deleteButtonText}>
                        Yes, Delete My Account
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => setIsDeleteModalVisible(false)}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
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
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    },
  deleteButton: {
    backgroundColor: '#fb5a03',
    padding: 16,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
    },
  deleteButtonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: '600',
    },
  cancelButton: {
    backgroundColor: '#000000',
    padding: 16,
    borderRadius: 10,
    flex: 1,
    alignItems: 'center', // Center align the items
    justifyContent: 'center', // Center justify the content
    },
  cancelButtonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: '600',
    },
});

export default SettingsScreen;




