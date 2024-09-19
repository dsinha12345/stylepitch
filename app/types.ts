// types.ts

import { StackNavigationProp } from '@react-navigation/stack';

export type RootStackParamList = {
  Main: undefined;
  UserProfile: undefined; // Define other screen params if any
};

export type RootStackNavigationProp = StackNavigationProp<RootStackParamList>;
