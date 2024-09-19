import React from 'react';
import { View, Text, StyleSheet, Image as RNImage } from 'react-native';

const CustomHeader = ({ title }: { title: string }) => (
  <View style={styles.headerContainer}>
    <RNImage
      source={require('../assets/company_logo_only.png')} 
      style={styles.logo}
    />
    <View style={styles.titleContainer}>
      <Text style={styles.title}>{title}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
  logo: {
    width: 120,
    height: 40,
    resizeMode: 'contain',
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center', // Center vertically
    alignItems: 'center',     // Center horizontally
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default CustomHeader;
