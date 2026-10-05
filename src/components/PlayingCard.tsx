import type { StyleProp, ViewStyle } from 'react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path, Polygon } from 'react-native-svg';
import { colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/spacing';
import type { Card, Suit } from '@/engine/types';

type PlayingCardProps = {
  card: Card;
  valid: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

const suitColor = (suit: Suit) =>
  suit === 'hearts' || suit === 'diamonds' ? '#A63E3E' : colors.background;

export function SuitSymbol({ suit, color }: { suit: Suit; color: string }) {
  switch (suit) {
    case 'hearts':
      return (
        <Path
          d="M16 28 4.1 16.5C-1.7 10.8 6.8 2 12.2 7.2L16 11l3.8-3.8C25.2 2 33.7 10.8 27.9 16.5L16 28Z"
          fill={color}
        />
      );
    case 'diamonds':
      return <Polygon points="16,2 29,16 16,30 3,16" fill={color} />;
    case 'clubs':
      return (
        <>
          <Circle cx="16" cy="9" r="7" fill={color} />
          <Circle cx="8" cy="17" r="7" fill={color} />
          <Circle cx="24" cy="17" r="7" fill={color} />
          <Path d="M16 16 11 30h10l-5-14Z" fill={color} />
        </>
      );
    case 'spades':
      return (
        <Path
          d="M16 2C12 8 3 11.5 3 19a8 8 0 0 0 13 6.3A11 11 0 0 1 12 30h8a11 11 0 0 1-4-4.7A8 8 0 0 0 29 19C29 11.5 20 8 16 2Z"
          fill={color}
        />
      );
  }
}

function suitName(suit: Suit): string {
  return suit[0].toUpperCase() + suit.slice(1);
}

export function PlayingCard({ card, valid, onPress, style }: PlayingCardProps) {
  const color = suitColor(card.suit);
  const rank = card.rank.toUpperCase();
  const label = `${rank} of ${suitName(card.suit)}`;

  return (
    <Pressable
      accessibilityLabel={`${label}${valid ? ', playable' : ', not playable'}`}
      accessibilityRole="button"
      disabled={!valid}
      onPress={onPress}
      style={[styles.card, valid ? styles.valid : styles.dimmed, style]}
    >
      <View style={styles.corner}>
        <Text style={[styles.rank, { color }]}>{rank}</Text>
        <Svg width={12} height={12} viewBox="0 0 32 32">
          <SuitSymbol suit={card.suit} color={color} />
        </Svg>
      </View>
      <Svg width={32} height={32} viewBox="0 0 32 32">
        <SuitSymbol suit={card.suit} color={color} />
      </Svg>
      <View style={[styles.corner, styles.bottomCorner]}>
        <Text style={[styles.rank, { color }]}>{rank}</Text>
        <Svg width={12} height={12} viewBox="0 0 32 32">
          <SuitSymbol suit={card.suit} color={color} />
        </Svg>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 68,
    height: 98,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.control,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: '#F5F0E3',
    padding: spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.28,
    shadowRadius: 4,
    elevation: 3,
  },
  valid: {
    borderColor: colors.gold,
    borderWidth: 2,
  },
  dimmed: {
    opacity: 0.42,
  },
  corner: {
    position: 'absolute',
    top: 5,
    left: 6,
    alignItems: 'center',
    gap: 1,
  },
  rank: {
    fontSize: 11,
    lineHeight: 13,
    fontWeight: '800',
  },
  bottomCorner: {
    top: undefined,
    left: undefined,
    right: 6,
    bottom: 5,
    transform: [{ rotate: '180deg' }],
  },
});
