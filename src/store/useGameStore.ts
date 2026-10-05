import { create } from 'zustand';
import { chooseCard } from '@/engine/bot';
import { dealCards } from '@/engine/deck';
import { canPlay } from '@/engine/rules';
import { resolveTrick } from '@/engine/trick';
import type { Card, GameState, PlayedCard, Player, Suit } from '@/engine/types';

const BOT_TURN_DELAY_MS = 800;

type GameStore = {
  players: Player[];
  currentTurn: Player['id'] | null;
  table: PlayedCard[];
  ledSuit: Suit | undefined;
  winner: Player['id'] | null;
  loser: Player['id'] | null;
  remainingDeck: Card[];
  turnQueue: Player['id'][];
  gameOver: boolean;
  botThinking: boolean;
  startGame: (playerCount: number) => void;
  playCard: (card: Card) => void;
  botTurn: () => Promise<void>;
};

function cardEquals(left: Card, right: Card): boolean {
  return left.suit === right.suit && left.rank === right.rank;
}

function rotatePlayersWithCards(
  players: Player[],
  startIndex: number,
): Player['id'][] {
  return Array.from({ length: players.length }, (_, offset) =>
    players[(startIndex + offset) % players.length],
  )
    .filter(player => player.hand.length > 0)
    .map(player => player.id);
}

export const useGameStore = create<GameStore>((set, get) => ({
  players: [],
  currentTurn: null,
  table: [],
  ledSuit: undefined,
  winner: null,
  loser: null,
  remainingDeck: [],
  turnQueue: [],
  gameOver: false,
  botThinking: false,

  startGame: playerCount => {
    const deal = dealCards(playerCount);
    const players = deal.players.map(player => ({ ...player, hand: [...player.hand] }));
    let remainingDeck = deal.remainingDeck;
    let startingPlayerIndex = players.findIndex(player =>
      player.hand.some(card => card.suit === 'spades' && card.rank === 'ace'),
    );

    if (startingPlayerIndex === -1) {
      const aceIndex = remainingDeck.findIndex(
        card => card.suit === 'spades' && card.rank === 'ace',
      );
      const exchangedCard = players[0].hand.pop();
      players[0].hand.push(remainingDeck[aceIndex]);
      remainingDeck = remainingDeck.filter((_, index) => index !== aceIndex);
      if (exchangedCard) {
        remainingDeck.push(exchangedCard);
      }
      startingPlayerIndex = 0;
    }

    const turnQueue = Array.from({ length: players.length }, (_, offset) =>
      players[(startingPlayerIndex + offset) % players.length].id,
    );

    set({
      players,
      currentTurn: turnQueue[0] ?? null,
      table: [],
      ledSuit: undefined,
      winner: null,
      loser: null,
      remainingDeck,
      turnQueue,
      gameOver: false,
      botThinking: false,
    });
  },

  playCard: card => {
    const state = get();
    const playerId = state.currentTurn;

    if (!playerId || state.gameOver) {
      throw new Error('There is no active turn.');
    }

    const playerIndex = state.players.findIndex(player => player.id === playerId);
    const player = state.players[playerIndex];

    if (!player || !canPlay(card, player.hand, state.ledSuit)) {
      throw new Error('That card cannot be played on this turn.');
    }

    const nextPlayers = state.players.map(currentPlayer =>
      currentPlayer.id === playerId
        ? {
            ...currentPlayer,
            hand: currentPlayer.hand.filter(handCard => !cardEquals(handCard, card)),
          }
        : currentPlayer,
    );
    const table = [...state.table, { playerId, card }];
    const remainingTurns = state.turnQueue.slice(1);
    const ledSuit = state.ledSuit ?? card.suit;

    if (remainingTurns.length > 0) {
      set({
        players: nextPlayers,
        currentTurn: remainingTurns[0],
        table,
        ledSuit,
        turnQueue: remainingTurns,
      });
      return;
    }

    const gameState: GameState = {
      players: nextPlayers,
      currentPlayerIndex: playerIndex,
      trick: table,
      ledSuit,
      remainingDeck: state.remainingDeck,
    };
    const resolved = resolveTrick(gameState);
    const trickWinner = resolved.players[resolved.currentPlayerIndex]?.id ?? null;
    const nextTurnQueue = rotatePlayersWithCards(
      resolved.players,
      resolved.currentPlayerIndex,
    );
    const isGameOver = resolved.loserId !== undefined || nextTurnQueue.length === 0;

    set({
      players: resolved.players,
      currentTurn: isGameOver ? null : nextTurnQueue[0],
      table: resolved.trick,
      ledSuit: resolved.ledSuit,
      winner: trickWinner,
      loser: resolved.loserId ?? null,
      remainingDeck: resolved.remainingDeck,
      turnQueue: isGameOver ? [] : nextTurnQueue,
      gameOver: isGameOver,
    });
  },

  botTurn: async () => {
    const beforeDelay = get();
    const playerId = beforeDelay.currentTurn;

    if (
      !playerId ||
      playerId === 'player-1' ||
      beforeDelay.gameOver ||
      beforeDelay.botThinking
    ) {
      return;
    }

    set({ botThinking: true });
    await new Promise<void>(resolve => setTimeout(resolve, BOT_TURN_DELAY_MS));

    try {
      const state = get();
      if (state.currentTurn !== playerId || state.gameOver) {
        return;
      }

      const player = state.players.find(currentPlayer => currentPlayer.id === playerId);
      if (!player) {
        return;
      }

      const card = chooseCard(
        player.hand,
        state.ledSuit,
        state.table.map(play => play.card),
      );
      get().playCard(card);
    } finally {
      set({ botThinking: false });
    }
  },
}));
