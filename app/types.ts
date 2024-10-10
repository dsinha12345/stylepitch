//types.ts
import { StackNavigationProp } from '@react-navigation/stack';

// Root Stack Parameter List
export type RootStackParamList = {
  MainScreen: undefined;
  UserProfile: undefined;
  ProfileScreen: undefined;
  UserDesigns: undefined;
  UploadDesignScreen: undefined;
  CardDetailScreen: { id: string }; // Expecting an id as param for CardDetailScreen
  LeaderBoard: undefined; 
  SavedScreen: undefined;
  ChatScreen: { chatId: string };
  MessagesScreen : undefined;
  LoginScreen : undefined;
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
