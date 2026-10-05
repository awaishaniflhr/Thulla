import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors } from '@/constants/colors';
import { DailyBonusScreen } from '@/screens/DailyBonusScreen';
import { HomeScreen } from '@/screens/HomeScreen';
import { LeaderboardScreen } from '@/screens/LeaderboardScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';
import type { HomeTabParamList } from './types';

const Tab = createBottomTabNavigator<HomeTabParamList>();

export function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Daily Bonus" component={DailyBonusScreen} />
      <Tab.Screen name="Leaderboard" component={LeaderboardScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
