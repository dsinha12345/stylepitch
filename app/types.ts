// types.ts
import { StackNavigationProp } from '@react-navigation/stack';

export type RootStackParamList = {
  Main: undefined;
  UserProfile: undefined;
  ProfileScreen : undefined;
  UserDesigns: undefined; // Add this line for UserDesigns
  UploadDesignScreen: undefined;
  CardDetailScreen: { id: string }; // Add this line for UploadDesignScreen if it exists
  LeaderBoard: undefined; 
  Saved: undefined;
};

export type RootStackNavigationProp = StackNavigationProp<RootStackParamList>;
