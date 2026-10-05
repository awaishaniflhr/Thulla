export type Suit = 'clubs' | 'diamonds' | 'hearts' | 'spades';

export type Rank =
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10'
  | 'jack'
  | 'queen'
  | 'king'
  | 'ace';

export type Card = {
  suit: Suit;
  rank: Rank;
};

export type Player = {
  id: string;
  hand: Card[];
};

export type PlayedCard = {
  playerId: Player['id'];
  card: Card;
};

export type GameState = {
  players: Player[];
  currentPlayerIndex: number;
  trick: PlayedCard[];
  ledSuit?: Suit;
  remainingDeck: Card[];
  loserId?: Player['id'];
};
