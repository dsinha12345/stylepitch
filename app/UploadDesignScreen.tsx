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
        <Stack.Screen name="DesignTitle">
          {(props) => (
            <DesignTitleScreen
              {...props}
              designTitle={designTitle}
              setDesignTitle={setDesignTitle}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="AddImages">
          {(props) => (
            <AddImagesScreen
              {...props}
              imageUrls={imageUrls}
              setImageUrls={setImageUrls}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="SelectRegion">
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
