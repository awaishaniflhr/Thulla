import { canPlay } from './rules';
import type { Card, Rank, Suit } from './types';

const rankValue: Record<Rank, number> = {
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  jack: 11,
  queen: 12,
  king: 13,
  ace: 14,
};

export function chooseCard(
  hand: readonly Card[],
  ledSuit: Suit | undefined,
  tableCards: readonly Card[],
): Card {
  const effectiveLedSuit = ledSuit ?? tableCards[0]?.suit;
  const validCards = hand.filter(card => canPlay(card, hand, effectiveLedSuit));

  if (validCards.length === 0) {
    throw new Error('No valid card is available to play.');
  }

  const isCut =
    effectiveLedSuit !== undefined &&
    !hand.some(card => card.suit === effectiveLedSuit);

  return validCards.reduce((selected, card) => {
    const isBetter = isCut
      ? rankValue[card.rank] > rankValue[selected.rank]
      : rankValue[card.rank] < rankValue[selected.rank];

    return isBetter ? card : selected;
  });
}
