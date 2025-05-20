import React from 'react';
import styles from './ProgressBar.module.css'; // Создадим CSS-модуль

interface ProgressBarProps {
  progress: number; // 0 to 100
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className={styles.progressBarContainer}>
      <div
        className={styles.progressBarFill}
        style={{ width: `${clampedProgress}%` }}
      >
        <span className={styles.progressText}>{Math.round(clampedProgress)}%</span>
      </div>
    </div>
  );
};

export default ProgressBar;