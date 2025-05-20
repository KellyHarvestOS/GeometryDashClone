export interface LevelInfo {
  id: number;
  name: string;
  description?: string; // Опционально
  isUnlocked: boolean; // Изначально разблокирован (для первого уровня)
  // Позже можно добавить:
  // previewImage?: string;
  // difficulty?: 'easy' | 'normal' | 'hard' | 'demon';
  // musicTrack?: string;
  sceneDataFile?: string; // Путь к файлу с данными уровня (если уровни в JSON)
}

// Пока что просто массив с описанием уровней
// В будущем, sceneDataFile будет указывать на JSON с объектами для каждого уровня
export const ALL_LEVELS: LevelInfo[] = [
  { id: 1, name: "Первый рывок", description: "Основы основ.", isUnlocked: true, sceneDataFile: 'level1.json' },
  { id: 2, name: "Скользкий путь", isUnlocked: false, sceneDataFile: 'level2.json' },
  { id: 3, name: "Небесный прыжок", isUnlocked: false, sceneDataFile: 'level3.json' },
  { id: 4, name: "Темный коридор", isUnlocked: false, sceneDataFile: 'level4.json' },
  { id: 5, name: "Огненное испытание", isUnlocked: false, sceneDataFile: 'level5.json' },
  { id: 6, name: "Ледяные пики", isUnlocked: false, sceneDataFile: 'level6.json' },
  { id: 7, name: "Механический хаос", isUnlocked: false, sceneDataFile: 'level7.json' },
  { id: 8, name: "Финальный отсчет", isUnlocked: false, sceneDataFile: 'level8.json' },
  { id: 9, name: "Секретный бонус", isUnlocked: false, sceneDataFile: 'level9.json' }, // Скрытый или бонусный
  { id: 10, name: "Вызов Мастера", isUnlocked: false, sceneDataFile: 'level10.json' },
];

const PROGRESS_STORAGE_KEY = 'gdCloneProgress';

export interface GameProgress {
  unlockedLevels: number[]; // Массив ID разблокированных уровней
  // Позже можно добавить: highestScorePerLevel, starsCollected, etc.
}

export const getGameProgress = (): GameProgress => {
  if (typeof window === 'undefined') {
    return { unlockedLevels: [1] }; // По умолчанию на сервере только первый уровень
  }
  try {
    const progressJson = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (progressJson) {
      const progress = JSON.parse(progressJson) as GameProgress;
      // Убедимся, что первый уровень всегда разблокирован
      if (!progress.unlockedLevels.includes(1)) {
        progress.unlockedLevels.push(1);
      }
      return progress;
    }
  } catch (error) {
    console.error("Error reading game progress from localStorage", error);
  }
  // По умолчанию, если ничего нет или ошибка
  return { unlockedLevels: [1] };
};

export const saveGameProgress = (progress: GameProgress) => {
  if (typeof window === 'undefined') return;
  try {
    // Убедимся, что первый уровень всегда в списке разблокированных
    if (!progress.unlockedLevels.includes(1)) {
        progress.unlockedLevels.push(1);
        progress.unlockedLevels.sort((a,b) => a-b); // Опционально, для порядка
    }
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error("Error saving game progress to localStorage", error);
  }
};

export const unlockNextLevel = (completedLevelId: number): boolean => {
  const progress = getGameProgress();
  const nextLevelId = completedLevelId + 1;
  const nextLevelExists = ALL_LEVELS.find(level => level.id === nextLevelId);

  if (nextLevelExists && !progress.unlockedLevels.includes(nextLevelId)) {
    progress.unlockedLevels.push(nextLevelId);
    progress.unlockedLevels.sort((a, b) => a - b); // Для порядка
    saveGameProgress(progress);
    return true; // Уровень успешно разблокирован
  }
  return false; // Следующего уровня нет или он уже разблокирован
};