import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import the separated components
import HomeScreen from './HomeScreen'; // Update the file path if necessary
import TravelPlanScreen from './TravelPlanScreen';
// Import Provider
import { Provider as PaperProvider } from 'react-native-paper';

const Stack = createStackNavigator();

const App = () => (
  <PaperProvider>
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Travel Plan" component={TravelPlanScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  </PaperProvider>
);

export default App;
