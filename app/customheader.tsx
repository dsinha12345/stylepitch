import React from 'react';
import { View, Text, StyleSheet, Image as RNImage, TouchableOpacity, ImageBackground } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const CustomHeader = ({ title, onLogout }: { title: string; onLogout?: () => void }) => (
  <ImageBackground 
    source={require('../assets/header_background.png')} 
    style={styles.imagebackground}
    resizeMode="cover"
  >
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
  </ImageBackground>
);

const styles = StyleSheet.create({
  imagebackground : {
    width : "100%",
    height : 60,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Space between left section and logout
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 15,
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
