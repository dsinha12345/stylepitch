//types.ts
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

// Root Stack Parameter List
export type RootStackParamList = {
  MainScreen: undefined;
  UserProfile: undefined;
  ProfileScreen: undefined;
  UserDesigns: undefined;
  UploadDesignScreen: undefined;
  CardDetailScreen: { id: string }; // Expecting an id as param for CardDetailScreen
  LeaderBoardScreen: undefined; 
  SavedScreen: undefined;
  ChatScreen: { chatId: string };
  MessagesScreen : undefined;
  LoginScreen : undefined;
  DesignTitle: undefined;
  AddImages: { designTitle: string }; // Expecting designTitle as param
  SelectRegion: { designTitle: string; imageUrls: string[] };
  RegionSelection: undefined;
  ForgotPasswordScreen: undefined;
  Login : undefined;
};

// User Profile Stack Parameter List
export type UserProfileStackParamList = {
  UserProfile: undefined; // No params
  UserDesigns: undefined; // No params
  CardDetailScreen: { id: string }; // Expecting an id as param
  UploadDesignScreen: undefined; // No params
  ProfileScreen: undefined; // No params
  RewardsScreen : undefined;
  SettingsScreen : undefined;
};

// Navigation Props for Root Stack
export type RootStackNavigationProp = StackNavigationProp<RootStackParamList>;

// Navigation Props for User Profile Stack
export type UserProfileStackNavigationProp = StackNavigationProp<UserProfileStackParamList>;

// Type for the navigation prop for each screen
export type DesignTitleScreenNavigationProp = StackNavigationProp<RootStackParamList, 'DesignTitle'>;
export type AddImagesScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AddImages'>;
export type SelectRegionScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SelectRegion'>;

// Type for the route prop for each screen (in case you pass any params in the future)
export type DesignTitleScreenRouteProp = RouteProp<RootStackParamList, 'DesignTitle'>;
export type AddImagesScreenRouteProp = RouteProp<RootStackParamList, 'AddImages'>;
export type SelectRegionScreenRouteProp = RouteProp<RootStackParamList, 'SelectRegion'>;

// Props for each screen
export type DesignTitleScreenProps = {
  navigation: DesignTitleScreenNavigationProp;
  route: DesignTitleScreenRouteProp;
  designTitle: string;
  setDesignTitle: (title: string) => void;
};

export type AddImagesScreenProps = {
  navigation: AddImagesScreenNavigationProp;
  route: AddImagesScreenRouteProp; // Now includes designTitle param
  imageUrls: string[];
  setImageUrls: (urls: string[]) => void;
};

export type SelectRegionScreenProps = {
  navigation: SelectRegionScreenNavigationProp;
  route: SelectRegionScreenRouteProp; // Now includes designTitle and imageUrls
  selectedRegions: string[];
  setSelectedRegions: (regions: string[]) => void;
  uploadDesign: () => void;
};