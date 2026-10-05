import { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg from 'react-native-svg';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CardHand } from '@/components/CardHand';
import { SuitSymbol } from '@/components/PlayingCard';
import { colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/spacing';
import type { Card, Player, Suit } from '@/engine/types';
import type { RootStackParamList } from '@/navigation/types';
import { useGameStore } from '@/store/useGameStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Game'>;
type TableSize = { width: number; height: number };

const HUMAN_PLAYER_ID = 'player-1';

function playerName(player: Player, index: number): string {
  return player.id === HUMAN_PLAYER_ID ? 'You' : `Player ${index + 1}`;
}

function suitColor(suit: Suit): string {
  return suit === 'hearts' || suit === 'diamonds' ? '#A63E3E' : colors.background;
}

function TableCard({ card }: { card: Card }) {
  const color = suitColor(card.suit);
  return (
    <View style={styles.tableCard}>
      <Text style={[styles.tableCardRank, { color }]}>{card.rank.toUpperCase()}</Text>
      <Svg width={24} height={24} viewBox="0 0 32 32">
        <SuitSymbol suit={card.suit} color={color} />
      </Svg>
    </View>
  );
}

function seatPosition(index: number, opponentCount: number, size: TableSize) {
  const angle =
    opponentCount === 1
      ? -90
      : -160 + (140 * index) / (opponentCount - 1);
  const radians = (angle * Math.PI) / 180;
  const centerX = size.width / 2;
  const centerY = size.height / 2;
  const radiusX = Math.max(0, centerX - 54);
  const radiusY = Math.max(0, centerY - 48);

  return {
    left: centerX + Math.cos(radians) * radiusX - 48,
    top: centerY + Math.sin(radians) * radiusY - 22,
  };
}

export function GameScreen({ navigation }: Props) {
  const [tableSize, setTableSize] = useState<TableSize>({ width: 0, height: 0 });
  const { height: screenHeight } = useWindowDimensions();
  const players = useGameStore(state => state.players);
  const currentTurn = useGameStore(state => state.currentTurn);
  const table = useGameStore(state => state.table);
  const winner = useGameStore(state => state.winner);
  const loser = useGameStore(state => state.loser);
  const gameOver = useGameStore(state => state.gameOver);
  const botThinking = useGameStore(state => state.botThinking);
  const startGame = useGameStore(state => state.startGame);
  const botTurn = useGameStore(state => state.botTurn);

  useEffect(() => {
    if (players.length === 0) {
      startGame(4);
    }
  }, [players.length, startGame]);

  useEffect(() => {
    if (
      currentTurn &&
      currentTurn !== HUMAN_PLAYER_ID &&
      !gameOver &&
      !botThinking
    ) {
      botTurn();
    }
  }, [botThinking, botTurn, currentTurn, gameOver]);

  const areaSize = {
    width: tableSize.width || 320,
    height: tableSize.height || Math.max(300, screenHeight * 0.48),
  };
  const opponents = players.filter(player => player.id !== HUMAN_PLAYER_ID);
  const turnPlayer = players.find(player => player.id === currentTurn);
  const turnIndex = players.findIndex(player => player.id === currentTurn);
  const turnLabel = gameOver
    ? 'Round complete'
    : botThinking
      ? `${turnPlayer ? playerName(turnPlayer, turnIndex) : 'Bot'} is thinking…`
      : currentTurn === HUMAN_PLAYER_ID
        ? 'Your turn'
        : turnPlayer
          ? `${playerName(turnPlayer, turnIndex)}’s turn`
          : 'Waiting for players';

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" onPress={navigation.goBack} hitSlop={10}>
          <Text style={styles.backLabel}>‹ Back</Text>
        </Pressable>
        <Text style={styles.heading}>Thulla</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.turnPill}>
        <View
          style={[
            styles.turnDot,
            { backgroundColor: currentTurn === HUMAN_PLAYER_ID ? colors.gold : colors.textMuted },
          ]}
        />
        <Text style={styles.turnLabel}>{turnLabel}</Text>
      </View>

      <View
        onLayout={event =>
          setTableSize({
            width: event.nativeEvent.layout.width,
            height: event.nativeEvent.layout.height,
          })
        }
        style={[styles.tableArea, { minHeight: Math.max(300, screenHeight * 0.44) }]}
      >
        <View style={styles.felt} />

        {opponents.map(player => {
          const playerIndex = players.findIndex(item => item.id === player.id);
          const opponentIndex = opponents.findIndex(item => item.id === player.id);
          const position = seatPosition(opponentIndex, opponents.length, areaSize);
          const isActive = currentTurn === player.id;

          return (
            <View
              key={player.id}
              style={[
                styles.seat,
                { left: position.left, top: position.top },
                isActive && styles.activeSeat,
              ]}
            >
              <Text style={styles.seatName}>{playerName(player, playerIndex)}</Text>
              <Text style={styles.cardCount}>{player.hand.length} cards</Text>
            </View>
          );
        })}

        <View style={styles.centerTable}>
          {table.length > 0 ? (
            <View style={styles.tableCards}>
              {table.map((play, index) => (
                <TableCard key={`${play.playerId}-${index}`} card={play.card} />
              ))}
            </View>
          ) : (
            <Text style={styles.tableHint}>Play begins with the Ace of Spades</Text>
          )}
        </View>

        {players
          .filter(player => player.id === HUMAN_PLAYER_ID)
          .map(player => (
            <View
              key={player.id}
              style={[
                styles.seat,
                styles.youSeat,
                currentTurn === player.id && styles.activeSeat,
              ]}
            >
              <Text style={styles.seatName}>You</Text>
              <Text style={styles.cardCount}>{player.hand.length} cards</Text>
            </View>
          ))}
      </View>

      <View style={styles.handArea}>
        <CardHand />
      </View>

      <Modal animationType="fade" transparent visible={gameOver}>
        <View style={styles.modalScrim}>
          <View style={styles.resultCard}>
            <Text style={styles.resultEyebrow}>ROUND COMPLETE</Text>
            <Text style={styles.resultTitle}>
              {loser === HUMAN_PLAYER_ID
                ? 'You lost this round'
                : `${players.find(player => player.id === loser)?.id.replace('player-', 'Player ') ?? 'A player'} lost`}
            </Text>
            <Text style={styles.resultCopy}>
              {winner ? 'The final trick has been resolved.' : 'No cards remain in play.'}
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => startGame(players.length || 4)}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>Play again</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={navigation.goBack} style={styles.homeButton}>
              <Text style={styles.homeButtonText}>Back to home</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
  },
  header: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backLabel: {
    color: colors.gold,
    fontSize: 16,
    fontWeight: '600',
  },
  heading: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 48,
  },
  turnPill: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  turnDot: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
  },
  turnLabel: {
    color: colors.text,
    fontWeight: '600',
  },
  tableArea: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
    overflow: 'visible',
  },
  felt: {
    position: 'absolute',
    alignSelf: 'center',
    width: '78%',
    height: '54%',
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.goldMuted,
    backgroundColor: colors.surface,
    shadowColor: colors.gold,
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 3,
  },
  seat: {
    position: 'absolute',
    width: 96,
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  activeSeat: {
    borderColor: colors.gold,
    borderWidth: 2,
  },
  seatName: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  cardCount: {
    color: colors.textMuted,
    fontSize: 11,
  },
  centerTable: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '82%',
  },
  tableCards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  tableCard: {
    width: 44,
    height: 62,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.control,
    borderWidth: 1,
    borderColor: colors.goldMuted,
    backgroundColor: '#F5F0E3',
  },
  tableCardRank: {
    position: 'absolute',
    top: 3,
    left: 4,
    fontSize: 9,
    fontWeight: '800',
  },
  tableHint: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  youSeat: {
    left: '50%',
    bottom: 0,
    marginLeft: -48,
  },
  handArea: {
    minHeight: 126,
    justifyContent: 'flex-end',
    paddingBottom: spacing.xs,
  },
  modalScrim: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: 'rgba(0, 10, 9, 0.78)',
  },
  resultCard: {
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    padding: spacing.xl,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.goldMuted,
    backgroundColor: colors.card,
    gap: spacing.md,
  },
  resultEyebrow: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  resultTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  resultCopy: {
    color: colors.textMuted,
    fontSize: 15,
    textAlign: 'center',
  },
  primaryButton: {
    alignSelf: 'stretch',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.control,
    backgroundColor: colors.gold,
  },
  primaryButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '800',
  },
  homeButton: {
    paddingVertical: spacing.sm,
  },
  homeButtonText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
});
