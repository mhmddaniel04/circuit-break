import { expressionToSpeech, type ExprToken } from '../question';
import styles from './Expression.module.css';

/** Draws a Boolean expression like an SPM textbook, with a bar on top for NOT. */
export function Expression({ name, tokens }: { name: string; tokens: ExprToken[] }) {
  return (
    <span className={styles.expression}>
      {/* Screen readers cannot see the bar on top, so they read "NOT ( … )" instead. */}
      <span className={styles.srOnly}>{`${name} = ${expressionToSpeech(tokens)}`}</span>
      <span aria-hidden="true">
        {name} = <Tokens tokens={tokens} />
      </span>
    </span>
  );
}

function Tokens({ tokens }: { tokens: ExprToken[] }) {
  return tokens.map((token, index) =>
    typeof token === 'string' ? (
      <span key={index}>{token}</span>
    ) : (
      <span key={index} className={styles.over}>
        <Tokens tokens={token.over} />
      </span>
    ),
  );
}
