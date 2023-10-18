// App.js 또는 해당하는 파일
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Import the separated components
import HomeScreen from './HomeScreen'; // Update the file path if necessary
import TravelPlanScreen from './TravelPlanScreen';

// Import Provider
import { Provider as PaperProvider } from 'react-native-paper';

const Tab = createBottomTabNavigator();

const App = () => (
  <PaperProvider>
    <NavigationContainer>
      <Tab.Navigator initialRouteName="Home">
        <Tab.Screen name="Home">
          {(props) => <HomeScreen {...props} />}
        </Tab.Screen>
        <Tab.Screen name="Travel Plan">
          {(props) => <TravelPlanScreen {...props} />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  </PaperProvider>
);

export default App;
