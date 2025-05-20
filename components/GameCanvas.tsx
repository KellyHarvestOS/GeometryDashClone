import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Player } from '../game/Player';
import { Obstacle } from '../game/Obstacle';
import { loadLevel } from '../game/Level';
import { checkCollision } from '../game/Collision';
import * as C from '../game/constants';
import Button from './UI/Button';
import ScoreDisplay from './UI/ScoreDisplay';
import ProgressBar from './UI/ProgressBar';
import { ImageManager } from '../game/ImageManager';
import { useRouter } from 'next/router';
import { ALL_LEVELS, unlockNextLevel } from '../game/levelData';

let jumpSound: HTMLAudioElement | null = null;
let music: HTMLAudioElement | null = null;
let portalSound: HTMLAudioElement | null = null;

if (typeof window !== 'undefined') {
  jumpSound = new Audio('/assets/sounds/jump.wav');
  music = new Audio('/assets/music/stereo_madness_lite.mp3');
  portalSound = new Audio('/assets/sounds/portal.wav');
  music.loop = true;
  music.volume = 0.2;
  if (jumpSound) jumpSound.volume = 0.5;
  if (portalSound) portalSound.volume = 0.6;
}

const commonStyles = `
  :root {
    --gd-blue: #3e87ff;
    --gd-green: #55dd00;
    --gd-light-green: #88ff44;
    --gd-dark-green-shadow: #33aa00;
    --gd-yellow: #ffff00;
    --gd-text-light: #ffffff;
    --bg-dark: #2c3044;
    --bg-dark-canvas: #000000;
  }
`;

const loaderStyles = `
  .loader-container {
    display: flex; flex-direction: column; justify-content: center; align-items: center;
    height: 100vh; width: 100vw; background-color: var(--bg-dark, #2c3044);
    color: var(--gd-text-light, white); position: fixed; top: 0; left: 0;
    z-index: 9999; font-family: 'Pusher', 'Arial Black', sans-serif;
  }
  .loader {
    border: 8px solid #f3f3f3; border-top: 8px solid var(--gd-blue, #3498db);
    border-radius: 50%; width: 60px; height: 60px;
    animation: spin 1s linear infinite; margin-bottom: 30px;
  }
  .loader-text {
    font-size: 2.2rem; letter-spacing: 1px; animation: subtlePulse 2s infinite ease-in-out;
    position: relative; display: inline-block; padding-right: 1.5em; 
  }
  .loader-text::after {
    content: ''; position: absolute; right: 0; bottom: 0.1em; 
    animation: loadingDots 1.5s infinite steps(4, end);
  }
  @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  @keyframes subtlePulse { 0% { transform: scale(1); opacity: 0.8; } 50% { transform: scale(1.02); opacity: 1; } 100% { transform: scale(1); opacity: 0.8; } }
  @keyframes loadingDots { 0% { content: ''; } 25% { content: '.'; } 50% { content: '..'; } 75% { content: '...'; } 100% { content: ''; } }
`;

const overlayStyles = `
  .overlay-common {
    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
    display: flex; flex-direction: column; justify-content: center; align-items: center;
    text-align: center; font-family: 'Pusher', 'Arial Black', sans-serif;
    color: var(--gd-text-light, white); z-index: 1000; padding: 20px; box-sizing: border-box;
    animation: fadeInOverlay 0.5s ease-out;
  }
  @keyframes fadeInOverlay { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
  .gameOverOverlay { background-color: rgba(70, 0, 0, 0.85); }
  .levelCompleteOverlay { background-color: rgba(0, 70, 0, 0.85); }
  .overlayTitle {
    font-size: 4.5rem; margin-bottom: 10px; text-shadow: 3px 3px 0px rgba(0,0,0,0.4);
    animation: titlePopIn 0.6s 0.2s cubic-bezier(0.68, -0.55, 0.27, 1.55) backwards;
  }
  @keyframes titlePopIn { 0% { transform: scale(0.5) translateY(-50px); opacity: 0; } 100% { transform: scale(1) translateY(0); opacity: 1; } }
  .overlaySubtitle { font-size: 1.5rem; margin-bottom: 25px; opacity: 0; animation: fadeInText 0.5s 0.5s ease-out forwards; }
  .overlayText { font-size: 1.2rem; margin-bottom: 30px; opacity: 0; animation: fadeInText 0.5s 0.7s ease-out forwards; }
  @keyframes fadeInText { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  .trophyIcon, .skullIcon { font-size: 4rem; margin-bottom: 15px; animation: iconBounce 0.8s 0.4s ease-out; }
  @keyframes iconBounce { 0% { transform: scale(0.5) translateY(-30px); opacity: 0; } 60% { transform: scale(1.1) translateY(10px); opacity: 1; } 80% { transform: scale(0.9) translateY(-5px); } 100% { transform: scale(1) translateY(0); opacity: 1; } }
  .overlayButton {
      padding: 15px 30px !important; font-size: 1.3rem !important; font-family: 'Pusher', sans-serif !important;
      font-weight: bold !important; color: var(--gd-text-light, white) !important;
      background: linear-gradient(145deg, var(--gd-green, #55dd00), #4CAF50) !important;
      border: 2px solid var(--gd-dark-green-shadow, #33aa00) !important; border-radius: 10px !important;
      cursor: pointer !important; transition: transform 0.2s ease, box-shadow 0.2s ease !important;
      box-shadow: 0 4px 10px rgba(0,0,0,0.3) !important; text-transform: uppercase !important;
      opacity: 0; animation: fadeInText 0.5s 0.9s ease-out forwards;
  }
  .overlayButton:hover { transform: translateY(-3px) scale(1.03) !important; box-shadow: 0 6px 15px rgba(85, 221, 0, 0.5) !important; }
`;

const pauseMenuStyles = `
  .pauseOverlay {
    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
    display: flex; flex-direction: column; justify-content: center; align-items: center;
    background-color: rgba(0, 0, 0, 0.85);
    z-index: 1500;
    font-family: 'Pusher', 'Arial Black', sans-serif;
    color: var(--gd-text-light, white);
    animation: fadeInOverlay 0.3s ease-out;
  }
  .pauseTitle {
    font-size: 3.5rem;
    color: var(--gd-yellow, yellow);
    text-shadow: 2px 2px 0px rgba(0,0,0,0.3);
    margin-bottom: 30px;
  }
  .pauseMenuButton {
    min-width: 220px;
    margin-bottom: 15px !important;
  }
  .pauseMenuButton:last-child {
    margin-bottom: 0 !important;
  }
`;

const pauseButtonStyles = `
  .ingamePauseButton {
    position: absolute;
    top: 15px;
    right: 15px;
    padding: 0 !important;
    font-size: 1rem !important;
    background-color: rgba(0,0,0,0.5) !important;
    border: 2px solid rgba(255,255,255,0.4) !important;
    color: var(--gd-text-light, white) !important;
    z-index: 100;
    border-radius: 50% !important;
    width: 44px !important;
    height: 44px !important;
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    cursor: pointer !important;
    transition: background-color 0.2s, transform 0.2s !important;
  }
  .ingamePauseButton:hover {
    background-color: rgba(255,255,255,0.2) !important;
    transform: scale(1.1) !important;
  }
  .ingamePauseButton svg {
    width: 20px;
    height: 20px;
  }
`;

const PauseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
  </svg>
);

const GameCanvas: React.FC = () => {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playerRef = useRef<Player | null>(null);
  const obstaclesRef = useRef<Obstacle[]>([]);
  const [localImageManager, setLocalImageManager] = useState<ImageManager | null>(null);
  const [gameState, setGameState] = useState<'loading' | 'playing' | 'paused' | 'gameOver' | 'levelComplete'>('loading');
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentLevelId, setCurrentLevelId] = useState<number | null>(null);
  const [attempts, setAttempts] = useState(1);
  const [progress, setProgress] = useState(0);
  const levelProgressRef = useRef(0);
  const animationFrameIdRef = useRef<number | undefined>(undefined);
  const bgX1Ref = useRef(0);
  const BG_SPEED = C.OBSTACLE_SPEED / 4;
  const lastPlayingStateTimeRef = useRef(0);

  useEffect(() => {
    if (router.isReady) {
      const levelIdFromQuery = router.query.levelId;
      if (levelIdFromQuery) {
        const id = parseInt(levelIdFromQuery as string, 10);
        const levelExists = ALL_LEVELS.find(l => l.id === id);
        if (levelExists) {
            setCurrentLevelId(id);
        } else {
            router.push('/levels');
        }
      } else {
         router.push('/levels'); 
      }
    }
  }, [router.isReady, router.query.levelId, router]);

  useEffect(() => {
    if (currentLevelId === null || isInitialized) return;

    const manager = new ImageManager();
    manager.initializeAndLoad()
      .then(() => {
        const initialPlayerX = 50;
        const initialPlayerY = C.CANVAS_HEIGHT - C.GROUND_HEIGHT - C.PLAYER_SIZE;
        playerRef.current = new Player(initialPlayerX, initialPlayerY, manager);
        obstaclesRef.current = loadLevel(manager); // TODO: Загрузка данных уровня по currentLevelId
        obstaclesRef.current.forEach(obs => { if (obs.type === 'portal') obs.triggered = false; });
        levelProgressRef.current = 0;
        setProgress(0);
        bgX1Ref.current = 0;
        setLocalImageManager(manager);
        setIsInitialized(true);
        setGameState('playing');
        startGameMusic();
      })
      .catch(error => {
        console.error("Error loading images:", error);
        setIsInitialized(true);
        setGameState('gameOver');
      });
  }, [currentLevelId, isInitialized]);

  const startGameMusic = useCallback(() => {
    if (music && music.paused) {
      music.currentTime = (gameState === 'paused' && lastPlayingStateTimeRef.current > 0) ? lastPlayingStateTimeRef.current : 0;
      music.play().catch(error => console.warn("Music play failed:", error));
    }
  }, [gameState]);

  const stopGameMusic = useCallback((pause = false) => {
    if (music) {
      if (pause) {
        lastPlayingStateTimeRef.current = music.currentTime;
      } else {
        lastPlayingStateTimeRef.current = 0;
        music.currentTime = 0;
      }
      music.pause();
    }
  }, []);

  const resetGameForRetry = useCallback(() => {
    if (!canvasRef.current || !isInitialized || !localImageManager || !playerRef.current || currentLevelId === null) {
      return;
    }
    const initialPlayerX = 50;
    const initialPlayerY = C.CANVAS_HEIGHT - C.GROUND_HEIGHT - C.PLAYER_SIZE;
    playerRef.current.resetState(initialPlayerX, initialPlayerY, localImageManager);
    obstaclesRef.current = loadLevel(localImageManager); // TODO: Перезагрузка ТЕКУЩЕГО уровня
    obstaclesRef.current.forEach(obs => { if (obs.type === 'portal') obs.triggered = false; });
    levelProgressRef.current = 0;
    setProgress(0);
    setGameState('playing');
    stopGameMusic();
    startGameMusic();
    bgX1Ref.current = 0;
  }, [isInitialized, localImageManager, currentLevelId, startGameMusic, stopGameMusic]);

  const togglePause = useCallback(() => {
    if (gameState === 'playing') {
      setGameState('paused');
      stopGameMusic(true);
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    } else if (gameState === 'paused') {
      setGameState('playing');
      startGameMusic();
    }
  },[gameState, startGameMusic, stopGameMusic]);

  const handlePlayerAction = useCallback(() => {
    if (gameState === 'gameOver' || gameState === 'levelComplete') {
      if (gameState === 'gameOver') {
        setAttempts(prev => prev + 1);
        resetGameForRetry();
      } else {
        router.push('/levels');
      }
    }
  }, [gameState, resetGameForRetry, router]);

  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && (gameState === 'playing' || gameState === 'paused')) {
        event.preventDefault();
        togglePause();
      }
      if (gameState === 'playing' && (event.code === 'Space' || event.key === ' ' || event.key === 'ArrowUp' || event.key === 'w')) {
        event.preventDefault();
        if (playerRef.current && playerRef.current.isOnGround) {
            playerRef.current.jump();
            if (jumpSound) { jumpSound.currentTime = 0; jumpSound.play().catch(e => console.warn("Jump sound failed", e));}
        }
      }
    };
     const handleCanvasClick = (event: MouseEvent) => {
        if (gameState === 'playing' && event.target instanceof HTMLElement && event.target.tagName === 'CANVAS') {
            if (playerRef.current && playerRef.current.isOnGround) {
                playerRef.current.jump();
                if (jumpSound) { jumpSound.currentTime = 0; jumpSound.play().catch(e => console.warn("Jump sound failed", e));}
            }
        }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    const currentCanvas = canvasRef.current;
    currentCanvas?.addEventListener('mousedown', handleCanvasClick);

    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
      currentCanvas?.removeEventListener('mousedown', handleCanvasClick);
    };
  }, [gameState, togglePause, handlePlayerAction]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !playerRef.current || !isInitialized || !localImageManager || gameState !== 'playing') {
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
      return;
    }
    const gameLoop = () => {
      if (gameState !== 'playing') {
        if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
        return;
      }
      levelProgressRef.current += C.OBSTACLE_SPEED;
      const currentLevelData = ALL_LEVELS.find(l => l.id === currentLevelId);
      const levelLength = currentLevelData?.sceneDataFile ? C.LEVEL_LENGTH : C.LEVEL_LENGTH; // Placeholder
      const currentProgress = Math.min(100, (levelProgressRef.current / levelLength) * 100);
      setProgress(currentProgress);

      if (currentProgress >= 100 && currentLevelId !== null) {
        setGameState('levelComplete'); stopGameMusic(); unlockNextLevel(currentLevelId); return;
      }
      
      const bgImage = localImageManager.getImage('backgroundLayer1');
      if (bgImage && bgImage.complete && bgImage.naturalHeight !== 0) {
        const imgHeight = C.CANVAS_HEIGHT;
        const scale = imgHeight / bgImage.naturalHeight;
        const imgWidthScaled = bgImage.naturalWidth * scale;
        bgX1Ref.current -= BG_SPEED;
        if (bgX1Ref.current <= -imgWidthScaled) {
          bgX1Ref.current += imgWidthScaled; 
        }
        ctx.drawImage(bgImage, bgX1Ref.current, 0, imgWidthScaled, imgHeight);
        ctx.drawImage(bgImage, bgX1Ref.current + imgWidthScaled, 0, imgWidthScaled, imgHeight);
        if (bgX1Ref.current + 2 * imgWidthScaled < C.CANVAS_WIDTH) {
             ctx.drawImage(bgImage, bgX1Ref.current + 2*imgWidthScaled, 0, imgWidthScaled, imgHeight);
        }
      } else {
        ctx.fillStyle = C.BACKGROUND_COLOR;
        ctx.fillRect(0, 0, C.CANVAS_WIDTH, C.CANVAS_HEIGHT);
      }

      const player = playerRef.current!;
      player.applyGravity(); player.updatePosition();
      let onBlockSurface = false;
      const currentObstacles = obstaclesRef.current;
      for (let i = currentObstacles.length - 1; i >= 0; i--) {
        const obstacle = currentObstacles[i];
        obstacle.update();
        if (checkCollision(player.getBounds(), obstacle.getBounds())) {
          if (obstacle.type === 'spike') {
            setGameState('gameOver'); return;
          } else if (obstacle.type === 'block') {
            const playerBounds = player.getBounds(); const blockBounds = obstacle.getBounds();
            if (player.gravityDirection === 1) {
              if (player.velocityY >= 0 && player.prevY + playerBounds.height <= blockBounds.y && playerBounds.y + playerBounds.height >= blockBounds.y) {
                player.y = blockBounds.y - player.height; player.landed(); onBlockSurface = true;
              } 
              else if (playerBounds.x + playerBounds.width > blockBounds.x && player.prevX + playerBounds.width <= blockBounds.x && (playerBounds.y + playerBounds.height > blockBounds.y + 5 && playerBounds.y < blockBounds.y + blockBounds.height - 5) ) {
                setGameState('gameOver'); return;
              }
            } else { 
              if (player.velocityY <= 0 && player.prevY >= blockBounds.y + blockBounds.height && playerBounds.y <= blockBounds.y + blockBounds.height) {
                player.y = blockBounds.y + blockBounds.height; player.landed(); onBlockSurface = true;
              }
              else if (playerBounds.x + playerBounds.width > blockBounds.x && player.prevX + playerBounds.width <= blockBounds.x && (playerBounds.y + playerBounds.height > blockBounds.y + 5 && playerBounds.y < blockBounds.y + blockBounds.height - 5) ) {
                setGameState('gameOver'); return;
              }
            }
          } else if (obstacle.type === 'portal' && !obstacle.triggered) {
            if ((obstacle.portalEffect === 'gravityUp' && player.gravityDirection === 1) || (obstacle.portalEffect === 'gravityDown' && player.gravityDirection === -1)) {
              player.toggleGravity(); obstacle.triggered = true;
              if (portalSound) {
                portalSound.currentTime = 0; portalSound.play().catch(e => console.warn("Portal sound failed", e));
              }
            }
          }
        }
        obstacle.draw(ctx);
        if (obstacle.x + obstacle.width < -C.CANVAS_WIDTH) {
          currentObstacles.splice(i, 1);
        }
      }
      if (player.gravityDirection === 1 && !onBlockSurface && player.y + player.height < C.CANVAS_HEIGHT - C.GROUND_HEIGHT) {
        player.isOnGround = false;
      } else if (player.gravityDirection === -1 && !onBlockSurface && player.y > C.GROUND_HEIGHT) {
        player.isOnGround = false;
      }
      player.draw(ctx);
      // Восстановлена полная логика фильтра для генерации препятствий
      if (currentObstacles.filter(o => o.x > C.CANVAS_WIDTH && (o.type === 'spike' || o.type === 'portal' || (o.type === 'block' && o.y >= C.GROUND_HEIGHT && o.y < C.CANVAS_HEIGHT - C.GROUND_HEIGHT))).length < 3 && levelProgressRef.current < levelLength - C.CANVAS_WIDTH * 1.5) {
         const lastNonGroundObstacle = currentObstacles.filter(o => o.type !== 'block' || (o.y >= C.GROUND_HEIGHT && o.y < C.CANVAS_HEIGHT - C.GROUND_HEIGHT)).sort((a, b) => b.x - a.x)[0];
         const lastObstacleX = lastNonGroundObstacle ? lastNonGroundObstacle.x : C.CANVAS_WIDTH / 2;
         const nextX = Math.max(C.CANVAS_WIDTH, lastObstacleX) + 250 + Math.random() * 200;
         if (nextX < levelLength - C.CANVAS_WIDTH / 2 && localImageManager) {
            if (Math.random() < 0.65) {
                const yPos = player.gravityDirection === 1 ? C.CANVAS_HEIGHT - C.GROUND_HEIGHT - C.PLAYER_SIZE : C.GROUND_HEIGHT;
                obstaclesRef.current.push(new Obstacle({type: 'spike', x: nextX, y: yPos, size: C.PLAYER_SIZE}, localImageManager));
            } else {
                const yPos = player.gravityDirection === 1
                    ? C.CANVAS_HEIGHT - C.GROUND_HEIGHT - C.PLAYER_SIZE * (1 + Math.floor(Math.random()*1.8))
                    : C.GROUND_HEIGHT + C.PLAYER_SIZE * (Math.floor(Math.random()*1.8));
                obstaclesRef.current.push(new Obstacle({type: 'block', x: nextX, y: yPos, width: C.PLAYER_SIZE, height: C.PLAYER_SIZE}, localImageManager));
            }
         }
      }
      animationFrameIdRef.current = requestAnimationFrame(gameLoop);
    };
    animationFrameIdRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [gameState, isInitialized, localImageManager, currentLevelId]);

  if (!isInitialized || gameState === 'loading') {
    return (
      <>
        <style jsx global>{`
          ${commonStyles}
          ${loaderStyles}
          ${overlayStyles} 
          ${pauseMenuStyles}
          ${pauseButtonStyles}
        `}</style>
        <div className="loader-container">
          <div className="loader"></div>
          <h2 className="loader-text">Loading Assets</h2>
        </div>
      </>
    );
  }

  let overlayContent = null;
  if (gameState === 'paused') {
    overlayContent = (
      <div className="pauseOverlay">
        <h2 className="pauseTitle">Paused</h2>
        <Button onClick={togglePause} className="overlayButton pauseMenuButton">Resume</Button>
        <Button onClick={resetGameForRetry} className="overlayButton pauseMenuButton">Restart Level</Button>
        <Button onClick={() => router.push('/levels')} className="overlayButton pauseMenuButton">Back to Levels</Button>
      </div>
    );
  } else if (gameState === 'gameOver') {
    overlayContent = (
      <div className="overlay-common gameOverOverlay">
        <div className="skullIcon" role="img" aria-label="Game Over Icon">💀</div>
        <h2 className="overlayTitle">Game Over!</h2>
        <p className="overlaySubtitle">Попытка: {attempts}</p>
        <p className="overlayText">Space / Click to Retry</p>
        <Button onClick={handlePlayerAction} className="overlayButton">Retry</Button>
      </div>
    );
    if (music && !music.paused) stopGameMusic();
  } else if (gameState === 'levelComplete') {
    overlayContent = (
      <div className="overlay-common levelCompleteOverlay">
        <div className="trophyIcon" role="img" aria-label="Trophy Icon">🏆</div>
        <h2 className="overlayTitle">Level Complete!</h2>
        <p className="overlaySubtitle">Отличная работа!</p>
        <p className="overlayText">Press Space or Click to Continue</p>
         <Button onClick={handlePlayerAction} className="overlayButton">Continue</Button>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`${commonStyles}${overlayStyles}${pauseMenuStyles}${pauseButtonStyles}.game-canvas-container-actual {width: 100%;height: 100%;position: relative;}.game-canvas-element {width: 100%;height: 100%;display: block;image-rendering: pixelated;image-rendering: crisp-edges;background-color: var(--bg-dark-canvas, #000);}.game-ui-overlay {position: absolute;top: 10px;left: 10px;right: 10px;z-index: 10;pointer-events: none;}`}</style>
      <div className="game-canvas-container-actual"> 
        {gameState === 'playing' && !overlayContent && (
          <>
            <Button onClick={togglePause} className="ingamePauseButton" aria-label="Pause Game"><PauseIcon /></Button>
            <div className="game-ui-overlay">
              <ScoreDisplay attempts={attempts} />
              <ProgressBar progress={progress} />
            </div>
          </>
        )}
        <canvas ref={canvasRef} width={C.CANVAS_WIDTH} height={C.CANVAS_HEIGHT} className="game-canvas-element"/>
        {overlayContent}
      </div>
    </>
  );
};

export default GameCanvas;