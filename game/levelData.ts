export interface LevelInfo {
  id: number;
  name: string;
  description?: string;
  isUnlocked: boolean;
  musicSrc: string;        // Путь к музыкальному файлу

  levelLengthUnits: number; // "Длина" уровня в условных единицах (для прогресс-бара)
 sceneDataFile?: string; 
}

// Массив с описанием всех уровней
export const ALL_LEVELS: LevelInfo[] = [
  {
    id: 1,
    name: "Первый рывок",
    description: "Основы основ и первый вызов.",
    isUnlocked: true,
    musicSrc: '/assets/music/stereomadnesslite.mp3', // Ваша текущая музыка
    levelLengthUnits: 3000, // Ваша текущая C.LEVEL_LENGTH или актуальная длина
  },
  {
    id: 2,
    name: "Скользкий путь",
    description: "Осторожно, шипы повсюду!",
    isUnlocked: false,
    musicSrc: '/assets/music/Back_On_Track_Full.mp3', // ЗАМЕНИТЕ НА РЕАЛЬНЫЙ ФАЙЛ
    levelLengthUnits: 3500,
  },
  {
    id: 3,
    name: "Небесный прыжок",
    description: "Полеты в облаках и смена гравитации.",
    isUnlocked: false,
    musicSrc: '/assets/music/Polargeist_Full.mp3', // ЗАМЕНИТЕ
    levelLengthUnits: 4000,
  },
  {
    id: 4,
    name: "Темный коридор",
    description: "Сможете ли вы пройти в темноте?",
    isUnlocked: false,
    musicSrc: '/assets/music/Dry_Out_Full.mp3', // ЗАМЕНИТЕ
    levelLengthUnits: 3200,
  },
  {
    id: 5,
    name: "Огненное испытание",
    description: "Горячие препятствия и быстрый темп.",
    isUnlocked: false,
    musicSrc: '/assets/music/Base_After_Base_Full.mp3', // ЗАМЕНИТЕ
    levelLengthUnits: 4200,
  },
  {
    id: 6,
    name: "Ледяные пики",
    description: "Скользкие платформы и холодные шипы.",
    isUnlocked: false,
    musicSrc: '/assets/music/Cant_Let_Go_Full.mp3', // ЗАМЕНИТЕ
    levelLengthUnits: 3800,
  },
  {
    id: 7,
    name: "Механический хаос",
    description: "Движущиеся части и сложные механизмы.",
    isUnlocked: false,
    musicSrc: '/assets/music/Jumper_Full.mp3', // ЗАМЕНИТЕ
    levelLengthUnits: 5000,
  },
  {
    id: 8,
    name: "Финальный отсчет",
    description: "Предпоследний вызов перед вершиной.",
    isUnlocked: false,
    musicSrc: '/assets/music/Clutterfunk_Full.mp3', // ЗАМЕНИТЕ
    levelLengthUnits: 4600,
  },
  {
    id: 9,
    name: "Секретный бонус",
    description: "Скрытый уровень для настоящих искателей.",
    isUnlocked: false, // Может разблокироваться особым образом
    musicSrc: '/assets/music/Clubstep_Full.mp3', // ЗАМЕНИТЕ
    levelLengthUnits: 2500,
  },
  {
    id: 10,
    name: "Вызов Мастера",
    description: "Самый сложный уровень. Удачи!",
    isUnlocked: false,
    musicSrc: '/assets/music/Electrodynamix_Full.mp3', // ЗАМЕНИТЕ
    levelLengthUnits: 6000,
  },
];

const PROGRESS_STORAGE_KEY = 'gdCloneProgress';

export interface GameProgress {
  unlockedLevels: number[];
}

export const getGameProgress = (): GameProgress => {
  if (typeof window === 'undefined') {
    return { unlockedLevels: [1] };
  }
  try {
    const progressJson = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (progressJson) {
      const progress = JSON.parse(progressJson) as GameProgress;
      if (!progress.unlockedLevels.includes(1)) {
        progress.unlockedLevels.push(1);
      }
      // Убедимся, что все isUnlocked: true из ALL_LEVELS также добавлены
      // на случай, если логика isUnlocked в ALL_LEVELS изменится для других уровней в будущем
      ALL_LEVELS.forEach(levelInfo => {
        if (levelInfo.isUnlocked && !progress.unlockedLevels.includes(levelInfo.id)) {
          progress.unlockedLevels.push(levelInfo.id);
        }
      });
      progress.unlockedLevels.sort((a,b) => a-b);
      return progress;
    }
  } catch (error) {
    console.error("Error reading game progress from localStorage", error);
  }
  // По умолчанию, если ничего нет или ошибка
  const defaultUnlocked = ALL_LEVELS.filter(l => l.isUnlocked).map(l => l.id);
  if (!defaultUnlocked.includes(1)) defaultUnlocked.push(1); // Гарантируем первый
  defaultUnlocked.sort((a,b) => a-b);
  return { unlockedLevels: defaultUnlocked };
};

export const saveGameProgress = (progress: GameProgress) => {
  if (typeof window === 'undefined') return;
  try {
    if (!progress.unlockedLevels.includes(1)) {
        progress.unlockedLevels.push(1);
    }
    ALL_LEVELS.forEach(levelInfo => {
        if (levelInfo.isUnlocked && !progress.unlockedLevels.includes(levelInfo.id)) {
          progress.unlockedLevels.push(levelInfo.id);
        }
    });
    progress.unlockedLevels.sort((a,b) => a-b);
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error("Error saving game progress to localStorage", error);
  }
};

export const unlockNextLevel = (completedLevelId: number): boolean => {
  const progress = getGameProgress();
  const nextLevelId = completedLevelId + 1;
  const nextLevelInfo = ALL_LEVELS.find(level => level.id === nextLevelId);

  if (nextLevelInfo && !progress.unlockedLevels.includes(nextLevelId)) {
    progress.unlockedLevels.push(nextLevelId);
    // progress.unlockedLevels.sort((a, b) => a - b); // Сортировка уже есть в saveGameProgress
    saveGameProgress(progress);
    console.log(`Level ${nextLevelId} unlocked!`);
    return true;
  }
  console.log(`Next level ${nextLevelId} does not exist or already unlocked.`);
  return false;
};

// Функция для сброса прогресса (для отладки)
export const resetGameProgress = () => {
    if (typeof window === 'undefined') return;
    const defaultUnlocked = ALL_LEVELS.filter(l => l.isUnlocked).map(l => l.id);
    if (!defaultUnlocked.includes(1)) defaultUnlocked.push(1);
    defaultUnlocked.sort((a,b) => a-b);
    saveGameProgress({ unlockedLevels: defaultUnlocked });
    console.log("Game progress has been reset.");
};