import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenFrame } from '@/components/ScreenFrame';
import type { RootStackParamList } from '@/navigation/types';

export function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <ScreenFrame
      title="Home"
      description="Welcome back. Ready for a round?"
      actionLabel="Start game"
      onActionPress={() => navigation.navigate('Game')}
    />
  );
}
