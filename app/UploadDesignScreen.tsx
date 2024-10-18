import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import DesignTitleScreen from './DesignTitleScreen';
import AddImagesScreen from './AddImagesScreen';
import SelectRegionScreen from './SelectRegionScreen';
import { RootStackParamList } from './types';

// Create a typed stack navigator
const Stack = createStackNavigator<RootStackParamList>();

const UploadDesignScreen: React.FC = () => {
  const [designTitle, setDesignTitle] = useState<string>('');  // Design title state
  const [imageUrls, setImageUrls] = useState<string[]>(['']);  // Image URLs state
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);  // Selected regions state

  // Function to handle design upload logic
  const uploadDesign = async () => {
    // Add logic for uploading the design (e.g., API call)
  };

  return (
    <Stack.Navigator initialRouteName="DesignTitle">
      <Stack.Screen 
        name="DesignTitle" 
        options={{ headerShown: false }}  // Correctly place headerShown here
      >
        {(props) => (
          <DesignTitleScreen
            {...props}
            designTitle={designTitle}
            setDesignTitle={setDesignTitle}
          />
        )}
      </Stack.Screen>
      <Stack.Screen 
        name="AddImages" 
        options={{ headerShown: false }}  // You can also hide the header for this screen if needed
      >
        {(props) => (
          <AddImagesScreen
            {...props}
            imageUrls={imageUrls}
            setImageUrls={setImageUrls}
          />
        )}
      </Stack.Screen>
      <Stack.Screen 
        name="SelectRegion" 
        options={{ headerShown: false }}  // And for this screen as well if needed
      >
        {(props) => (
          <SelectRegionScreen
            {...props}
            selectedRegions={selectedRegions}
            setSelectedRegions={setSelectedRegions}
            uploadDesign={uploadDesign}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

export default UploadDesignScreen;
