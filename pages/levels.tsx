import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ALL_LEVELS, LevelInfo, getGameProgress } from '../game/levelData'; // Путь к вашему файлу
import styles from '../styles/LevelSelectPage.module.css'; // Создадим этот CSS

// Иконка замка (простой SVG)
const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M12 1L8 5v2H7c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2h-1V5l-4-4zm0 2.83L10.17 5H13.83L12 3.83zM17 19H7V9h10v10zm-5-7c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
  </svg>
);


const LevelSelectPage: React.FC = () => {
  const router = useRouter();
  const [levelsWithStatus, setLevelsWithStatus] = useState<LevelInfo[]>([]);

  useEffect(() => {
    const progress = getGameProgress();
    const updatedLevels = ALL_LEVELS.map(level => ({
      ...level,
      isUnlocked: progress.unlockedLevels.includes(level.id) || level.isUnlocked, // Первый уровень всегда isUnlocked
    }));
    setLevelsWithStatus(updatedLevels);
  }, []);

  const handleLevelSelect = (level: LevelInfo) => {
    if (level.isUnlocked) {
      // Передаем ID уровня или имя файла данных уровня на страницу игры
      router.push(`/game?levelId=${level.id}`);
      // В GameCanvas.tsx нужно будет прочитать этот query параметр и загрузить соответствующий уровень
    } else {
      // Можно показать сообщение или ничего не делать
      console.log(`Level ${level.name} is locked.`);
    }
  };

  return (
    <>
      <Head>
        <title>Select Level - Geometry Dash</title>
        {/* Шрифты должны быть в _document.tsx */}
      </Head>
      <div className={styles.pageContainer}>
        <h1 className={styles.pageTitle}>Choose Your Challenge!</h1>
        <div className={styles.levelGrid}>
          {levelsWithStatus.map(level => (
            <div
              key={level.id}
              className={`${styles.levelCard} ${!level.isUnlocked ? styles.locked : ''}`}
              onClick={() => handleLevelSelect(level)}
              role="button"
              tabIndex={level.isUnlocked ? 0 : -1}
              aria-disabled={!level.isUnlocked}
            >
              {!level.isUnlocked && (
                <div className={styles.lockOverlay}>
                  <LockIcon />
                </div>
              )}
              <div className={styles.levelNumber}>{level.id}</div>
              <h2 className={styles.levelName}>{level.name}</h2>
              {/* Можно добавить превью или сложность позже */}
              {/* <img src={level.previewImage || '/assets/images/default_preview.png'} alt={level.name} className={styles.levelPreview} /> */}
              {/* <p className={styles.levelDifficulty}>{level.difficulty}</p> */}
            </div>
          ))}
        </div>
        <Link href="/" passHref>
          <button className={styles.backButton}>Back to Menu</button>
        </Link>
      </div>
    </>
  );
};

export default LevelSelectPage;