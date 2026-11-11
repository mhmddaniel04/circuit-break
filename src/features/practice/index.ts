// Public API of the SPM practice feature.
export { CircuitDiagram } from './components/CircuitDiagram';
export { Expression } from './components/Expression';
export {
  createRandom,
  DIFFICULTIES,
  generateQuestion,
  type Difficulty,
  type Random,
} from './generateQuestion';
export {
  columnExpression,
  expressionToSpeech,
  outputExpression,
  solveQuestion,
  type ExprToken,
  type PracticeQuestion,
  type QuestionColumn,
  type TruthRow,
} from './question';
