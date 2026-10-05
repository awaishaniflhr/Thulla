import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '@/constants/colors';
import { GameScreen } from '@/screens/GameScreen';
import { SplashScreen } from '@/screens/SplashScreen';
import { HomeTabs } from './HomeTabs';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Home" component={HomeTabs} />
      <Stack.Screen name="Game" component={GameScreen} />
    </Stack.Navigator>
  );
}
