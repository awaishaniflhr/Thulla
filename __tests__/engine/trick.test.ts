import { resolveTrick } from '../../src/engine/trick';
import type { Card, GameState, Player, Suit } from '../../src/engine/types';

const card = (suit: Suit, rank: Card['rank']): Card => ({ suit, rank });

function makeState(
  players: Player[],
  trick: GameState['trick'],
  ledSuit: Suit = 'hearts',
): GameState {
  return {
    players,
    currentPlayerIndex: 0,
    trick,
    ledSuit,
    remainingDeck: [],
  };
}

describe('resolveTrick', () => {
  it('discards a same-suit trick and lets the highest card lead next', () => {
    const state = makeState(
      [
        { id: 'p1', hand: [] },
        { id: 'p2', hand: [] },
        { id: 'p3', hand: [] },
      ],
      [
        { playerId: 'p1', card: card('hearts', '10') },
        { playerId: 'p2', card: card('hearts', 'ace') },
        { playerId: 'p3', card: card('hearts', 'king') },
      ],
    );

    const result = resolveTrick(state);

    expect(result.currentPlayerIndex).toBe(1);
    expect(result.trick).toEqual([]);
    expect(result.ledSuit).toBeUndefined();
    expect(result.players).toEqual(state.players);
    expect(result.loserId).toBeUndefined();
    expect(state.trick).toHaveLength(3);
  });

  it('gives the pile to the highest led-suit card when a player cuts', () => {
    const state = makeState(
      [
        { id: 'p1', hand: [] },
        { id: 'p2', hand: [] },
        { id: 'p3', hand: [] },
      ],
      [
        { playerId: 'p1', card: card('hearts', 'king') },
        { playerId: 'p2', card: card('spades', 'ace') },
        { playerId: 'p3', card: card('hearts', 'ace') },
      ],
    );

    const result = resolveTrick(state);

    expect(result.currentPlayerIndex).toBe(2);
    expect(result.players[2].hand).toEqual(state.trick.map(play => play.card));
    expect(result.players[0].hand).toEqual([]);
    expect(result.players[1].hand).toEqual([]);
    expect(result.trick).toEqual([]);
  });

  it('marks the only player still holding cards as the loser', () => {
    const state = makeState(
      [
        { id: 'p1', hand: [] },
        { id: 'p2', hand: [] },
        { id: 'p3', hand: [card('clubs', '2')] },
      ],
      [
        { playerId: 'p1', card: card('hearts', '8') },
        { playerId: 'p2', card: card('hearts', '9') },
      ],
    );

    expect(resolveTrick(state).loserId).toBe('p3');
  });
});
