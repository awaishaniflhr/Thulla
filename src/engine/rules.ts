import type { Card, Suit } from './types';

const openingCard: Card = { suit: 'spades', rank: 'ace' };

function sameCard(left: Card, right: Card): boolean {
  return left.suit === right.suit && left.rank === right.rank;
}

export function canPlay(
  card: Card,
  hand: readonly Card[],
  ledSuit?: Suit,
): boolean {
  if (!hand.some(handCard => sameCard(handCard, card))) {
    return false;
  }

  if (ledSuit === undefined) {
    return sameCard(card, openingCard);
  }

  const canFollowSuit = hand.some(handCard => handCard.suit === ledSuit);
  return !canFollowSuit || card.suit === ledSuit;
}
