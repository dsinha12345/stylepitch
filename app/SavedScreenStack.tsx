import { createStackNavigator } from "@react-navigation/stack";
import SavedScreen from './SavedScreen';
import CardDetailScreen from './CardDetailScreen';
import { RootStackParamList } from './types'; // Adjust the path as necessary

// Create a Stack Navigator and type it with the defined parameter list
const Stack = createStackNavigator<RootStackParamList>();

export const SavedScreenStack = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen
              name="SavedScreen"
              component={SavedScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="CardDetailScreen"
              component={CardDetailScreen}
              options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
};
