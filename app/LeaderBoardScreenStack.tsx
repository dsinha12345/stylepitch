import { createStackNavigator } from "@react-navigation/stack";
import LeaderBoardScreen from './LeaderBoard'; // Ensure the correct path
import CardDetailScreen from './CardDetailScreen'; // Ensure the correct path
import { RootStackParamList } from './types'; // Adjust the path as necessary

// Create a Stack Navigator and type it with the defined parameter list
const Stack = createStackNavigator<RootStackParamList>();

export const LeaderBoardScreenStack = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen
              name="LeaderBoardScreen"
              component={LeaderBoardScreen}
              options={{ headerShown: false }} // Set to true if you want to show the header
            />
            <Stack.Screen
              name="CardDetailScreen"
              component={CardDetailScreen}
              options={{ headerShown: false }} // Set to true if you want to show the header
            />
        </Stack.Navigator>
    );
};
