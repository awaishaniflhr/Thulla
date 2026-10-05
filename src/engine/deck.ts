import type { Card, Player } from './types';

const suits = ['clubs', 'diamonds', 'hearts', 'spades'] as const;
const ranks = [
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  'jack',
  'queen',
  'king',
  'ace',
] as const;

export type RandomSource = () => number;

export type DealResult = {
  players: Player[];
  remainingDeck: Card[];
};

export function createDeck(): Card[] {
  return suits.flatMap(suit => ranks.map(rank => ({ suit, rank })));
}

export function shuffleDeck(
  deck: readonly Card[],
  random: RandomSource = Math.random,
): Card[] {
  const shuffled = [...deck];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [
      shuffled[swapIndex],
      shuffled[index],
    ];
  }

  return shuffled;
}

export function dealCards(
  playerCount: number,
  random: RandomSource = Math.random,
): DealResult {
  if (!Number.isInteger(playerCount) || playerCount < 3 || playerCount > 6) {
    throw new RangeError('Player count must be an integer from 3 to 6.');
  }

  const shuffled = shuffleDeck(createDeck(), random);
  const cardsPerPlayer = Math.floor(shuffled.length / playerCount);
  const cardsToDeal = cardsPerPlayer * playerCount;
  const players = Array.from({ length: playerCount }, (_, index) => ({
    id: `player-${index + 1}`,
    hand: [] as Card[],
  }));

  for (let index = 0; index < cardsToDeal; index += 1) {
    players[index % playerCount].hand.push(shuffled[index]);
  }

  return {
    players,
    remainingDeck: shuffled.slice(cardsToDeal),
  };
}
