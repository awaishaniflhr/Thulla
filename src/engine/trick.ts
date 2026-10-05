import type { GameState, Rank, Suit } from './types';

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

export function resolveTrick(state: GameState): GameState {
  if (state.trick.length === 0) {
    throw new Error('Cannot resolve an empty trick.');
  }

  const ledSuit: Suit = state.ledSuit ?? state.trick[0].card.suit;
  const ledSuitPlays = state.trick.filter(play => play.card.suit === ledSuit);

  if (ledSuitPlays.length === 0) {
    throw new Error('The trick must contain a card of the led suit.');
  }

  const winningPlay = ledSuitPlays.reduce((highest, play) =>
    rankValue[play.card.rank] > rankValue[highest.card.rank] ? play : highest,
  );
  const winnerIndex = state.players.findIndex(
    player => player.id === winningPlay.playerId,
  );

  if (winnerIndex === -1) {
    throw new Error('The trick contains a player who is not in the game.');
  }

  const wasCut = ledSuitPlays.length !== state.trick.length;
  const players = state.players.map(player => {
    if (!wasCut || player.id !== winningPlay.playerId) {
      return player;
    }

    return {
      ...player,
      hand: [...player.hand, ...state.trick.map(play => play.card)],
    };
  });
  const playersWithCards = players.filter(player => player.hand.length > 0);
  const loserId = playersWithCards.length === 1 ? playersWithCards[0].id : undefined;

  return {
    ...state,
    players,
    currentPlayerIndex: winnerIndex,
    trick: [],
    ledSuit: undefined,
    loserId,
  };
}
