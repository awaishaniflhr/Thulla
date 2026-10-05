import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenFrame } from '@/components/ScreenFrame';
import type { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export function SplashScreen({ navigation }: Props) {
  return (
    <ScreenFrame
      title="Thulla"
      description="Your next game starts here."
      actionLabel="Continue"
      onActionPress={() => navigation.replace('Home')}
    />
  );
}
