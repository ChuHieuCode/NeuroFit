import { SequenceRecallGame } from './memory/sequence-recall.js';
import { NumberMemoryGame } from './memory/number-memory.js';
import { SpatialMemoryGame } from './memory/spatial-memory.js';
import { CardMatchingGame } from './memory/card-matching.js';
import { TargetTrackingGame } from './attention/target-tracking.js';
import { SelectiveAttentionGame } from './attention/selective-attention.js';
import { VisualSearchGame } from './attention/visual-search.js';
import { StroopChallengeGame } from './attention/stroop-challenge.js';
import { SpeedMatchGame } from './speed/speed-match.js';
import { ReactionTimeGame } from './speed/reaction-time.js';
import { RapidCalculationGame } from './speed/rapid-calculation.js';
import { SymbolComparisonGame } from './speed/symbol-comparison.js';
import { PatternRecognitionGame } from './problem/pattern-recognition.js';
import { MatrixReasoningGame } from './problem/matrix-reasoning.js';
import { TowerOfHanoiGame } from './problem/tower-of-hanoi.js';
import { PuzzleSolverGame } from './problem/puzzle-solver.js';
import { MentalArithmeticGame } from './math/mental-arithmetic.js';
import { NumberSeriesGame } from './math/number-series.js';
import { QuickEstimateGame } from './math/quick-estimate.js';
import { TaskSwitchingGame } from './flexibility/task-switching.js';
import { RuleChangeGame } from './flexibility/rule-change.js';
import { DualNBackGame } from './flexibility/dual-n-back.js';
import { WordAssociationGame } from './language/word-association.js';
import { VocabularyChallengeGame } from './language/vocabulary-challenge.js';
import { SyllogismVerdictGame } from './logic/syllogism-verdict.js';
import { DeductiveGridGame } from './logic/deductive-grid.js';
import { SetLogicGame } from './logic/set-logic.js';

export const GAME_REGISTRY = {
  'sequence-recall': SequenceRecallGame,
  'number-memory': NumberMemoryGame,
  'spatial-memory': SpatialMemoryGame,
  'card-matching': CardMatchingGame,
  'target-tracking': TargetTrackingGame,
  'selective-attention': SelectiveAttentionGame,
  'visual-search': VisualSearchGame,
  'stroop-challenge': StroopChallengeGame,
  'speed-match': SpeedMatchGame,
  'reaction-time': ReactionTimeGame,
  'rapid-calculation': RapidCalculationGame,
  'symbol-comparison': SymbolComparisonGame,
  'pattern-recognition': PatternRecognitionGame,
  'matrix-reasoning': MatrixReasoningGame,
  'tower-of-hanoi': TowerOfHanoiGame,
  'puzzle-solver': PuzzleSolverGame,
  'mental-arithmetic': MentalArithmeticGame,
  'number-series': NumberSeriesGame,
  'quick-estimate': QuickEstimateGame,
  'task-switching': TaskSwitchingGame,
  'rule-change': RuleChangeGame,
  'dual-n-back': DualNBackGame,
  'word-association': WordAssociationGame,
  'vocabulary-challenge': VocabularyChallengeGame,
  'syllogism-verdict': SyllogismVerdictGame,
  'deductive-grid': DeductiveGridGame,
  'set-logic': SetLogicGame
};

export function isGameImplemented(gameId) {
  return Boolean(GAME_REGISTRY[gameId]);
}

export function createGameInstance(gameId, container, callbacks, options) {
  const GameClass = GAME_REGISTRY[gameId];
  if (!GameClass) {
    return null;
  }
  return new GameClass(container, callbacks, options);
}
