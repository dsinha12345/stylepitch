import { createStackNavigator } from "@react-navigation/stack";
import UserDesigns from './UserDesigns';
import UploadDesignScreen from './UploadDesignScreen';
import UserProfileScreen from './UserProfileScreen';
import ProfileScreen from './Profile';
import CardDetailScreen from './CardDetailScreen';
import RewardsScreen from "./Rewards";
import SettingsScreen from "./Settings"
import { UserProfileStackParamList } from './types'; // Adjust the path as necessary
import { StackNavigationProp } from '@react-navigation/stack';


// Create a Stack Navigator and type it with the defined parameter list
const Stack = createStackNavigator<UserProfileStackParamList>();

export const UserProfileStack = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen
              name="UserProfile"
              component={UserProfileScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="UserDesigns"
              component={UserDesigns}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="CardDetailScreen"
              component={CardDetailScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="UploadDesignScreen"
              component={UploadDesignScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ProfileScreen"
              component={ProfileScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="RewardsScreen"
              component={RewardsScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="SettingsScreen"
              component={SettingsScreen}
              options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
};
