import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PickImageScreen from './PickImageScreen';
import PreviewScreen from './PreviewScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [image, setImage] = useState<string | null>(null);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="PickImage" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="PickImage">
          {(props) => <PickImageScreen {...props} setImage={setImage} />}
        </Stack.Screen>
        <Stack.Screen name="Preview">
          {(props) => <PreviewScreen {...props} image={image} setImage={setImage} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
