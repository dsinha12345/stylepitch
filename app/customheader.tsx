import React from 'react';
import { View, Text, StyleSheet, Image as RNImage, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const CustomHeader = ({ title, onLogout }: { title: string; onLogout?: () => void }) => (
  <View style={styles.headerContainer}>
    {/* Left section: Logo and title */}
    <View style={styles.leftSection}>
      <RNImage source={require('../assets/company_logo_only.png')} style={styles.logo} />
      <Text style={styles.title}>{title}</Text>
    </View>
    {/* Right section: Logout Button or Icon */}
    {onLogout && (
      <TouchableOpacity onPress={onLogout} style={styles.logoutButton}>
        <MaterialIcons name="logout" size={24} color="red" />
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Space between left section and logout
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#f8f9f9',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  leftSection: {
    flexDirection: 'row', // Ensures logo and title are in a row
    alignItems: 'center',
    flex: 1, // Takes up the remaining space between left and right sections
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    marginRight: 10, // Space between logo and title
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  logoutButton: {
    padding: 10,
  },
});

export default CustomHeader;
