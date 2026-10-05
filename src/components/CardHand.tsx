import { useState } from 'react';
import { StyleSheet, useWindowDimensions, View, type ViewStyle } from 'react-native';
import { canPlay } from '@/engine/rules';
import type { Card } from '@/engine/types';
import { useGameStore } from '@/store/useGameStore';
import { PlayingCard } from './PlayingCard';

const CARD_WIDTH = 68;
const CARD_HEIGHT = 98;
const EMPTY_HAND: Card[] = [];

function fanStyle(index: number, count: number, overlap: number): ViewStyle {
  const normalized = count < 2 ? 0 : (index / (count - 1)) * 2 - 1;
  const lift = 14 * (1 - Math.abs(normalized));

  return {
    marginLeft: index === 0 ? 0 : -overlap,
    transform: [{ translateY: -lift }, { rotate: `${normalized * 19}deg` }],
    zIndex: index,
  };
}

type CardHandProps = {
  playerId?: string;
};

export function CardHand({ playerId = 'player-1' }: CardHandProps) {
  const [containerWidth, setContainerWidth] = useState(0);
  const { width: screenWidth } = useWindowDimensions();
  const hand = useGameStore(
    state => state.players.find(player => player.id === playerId)?.hand ?? EMPTY_HAND,
  );
  const currentTurn = useGameStore(state => state.currentTurn);
  const ledSuit = useGameStore(state => state.ledSuit);
  const table = useGameStore(state => state.table);
  const gameOver = useGameStore(state => state.gameOver);
  const playCard = useGameStore(state => state.playCard);

  const width = containerWidth || screenWidth - 32;
  const step =
    hand.length > 1
      ? Math.min(CARD_WIDTH * 0.62, Math.max(6, (width - CARD_WIDTH) / (hand.length - 1)))
      : 0;
  const overlap = CARD_WIDTH - step;
  const effectiveLedSuit = ledSuit ?? table[0]?.card.suit;
  const isPlayersTurn = currentTurn === playerId && !gameOver;

  if (hand.length === 0) {
    return null;
  }

  return (
    <View
      onLayout={event => setContainerWidth(event.nativeEvent.layout.width)}
      style={styles.container}
    >
      <View style={styles.row}>
        {hand.map((card, index) => {
          const valid =
            isPlayersTurn && canPlay(card, hand, effectiveLedSuit);

          return (
            <PlayingCard
              key={`${card.suit}-${card.rank}`}
              card={card}
              valid={valid}
              onPress={() => playCard(card)}
              style={fanStyle(index, hand.length, overlap)}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: CARD_HEIGHT + 22,
    justifyContent: 'flex-end',
    overflow: 'visible',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
});
