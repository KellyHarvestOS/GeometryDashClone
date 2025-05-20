import React from 'react';
import styles from './ScoreDisplay.module.css'; // Создадим этот CSS-модуль

interface ScoreDisplayProps {
  attempts: number;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ attempts }) => {
  return (
    <div className={styles.scoreContainer}>
      {/* Можно добавить иконку, например, иконку "retry" или просто стилизованный текст */}
      <span className={styles.scoreIcon} role="img" aria-label="Attempts Icon">🔄</span> {/* Пример иконки */}
      <span className={styles.scoreLabel}>Попытки:</span>
      <span className={styles.scoreValue}>{attempts}</span>
    </div>
  );
};

export default ScoreDisplay;