import { Obstacle, ObstacleData, ObstacleType, PortalEffect } from './Obstacle';
import { ImageManager } from './ImageManager';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  GROUND_HEIGHT,
  PLAYER_SIZE,
  LEVEL_LENGTH,
  GROUND_TILE_SIZE
} from './constants';

const level1Data: ObstacleData[] = [
  // Динамические препятствия (примеры)
  { type: 'spike', x: 400, y: CANVAS_HEIGHT - GROUND_HEIGHT - PLAYER_SIZE, size: PLAYER_SIZE },
  // Для динамического блока можно оставить type: 'block' или создать новый тип,
  // чтобы использовать другой спрайт, если dynamicBlock в ImageManager отличается
  { type: 'block', x: 600, y: CANVAS_HEIGHT - GROUND_HEIGHT - PLAYER_SIZE * 2, width: PLAYER_SIZE, height: PLAYER_SIZE, isDynamic: true }, // Добавим флаг
  { type: 'portal', x: 800, y: CANVAS_HEIGHT - GROUND_HEIGHT - PLAYER_SIZE * 2.5, portalEffect: 'gravityUp', width: PLAYER_SIZE, height: PLAYER_SIZE * 3 },
  { type: 'spike', x: 1000, y: GROUND_HEIGHT, size: PLAYER_SIZE },
  { type: 'block', x: 1200, y: GROUND_HEIGHT + PLAYER_SIZE, width: PLAYER_SIZE, height: PLAYER_SIZE, isDynamic: true },
  { type: 'portal', x: 1500, y: GROUND_HEIGHT + PLAYER_SIZE * 0.5, portalEffect: 'gravityDown', width: PLAYER_SIZE, height: PLAYER_SIZE * 3 },
  // ... другие препятствия
];




export function loadLevel(manager: ImageManager): Obstacle[] {
  const dynamicObstaclesData: ObstacleData[] = JSON.parse(JSON.stringify(level1Data));
  const staticGeometryData: ObstacleData[] = [];

  const TILE_SIZE = GROUND_TILE_SIZE;
  const numTilesWidth = Math.ceil((LEVEL_LENGTH + CANVAS_WIDTH * 2) / TILE_SIZE);
  const numLayers = Math.round(GROUND_HEIGHT / TILE_SIZE);

   /* ЗАКОММЕНТИРУЙТЕ ИЛИ УДАЛИТЕ ЭТИ ЦИКЛЫ:
  // Генерация блоков для пола
  for (let h = 0; h < numLayers; h++) {
    for (let i = 0; i < numTilesWidth; i++) {
      staticGeometryData.push({
        type: 'block',
        x: Math.round(-CANVAS_WIDTH + i * TILE_SIZE),
        y: Math.round(CANVAS_HEIGHT - GROUND_HEIGHT + h * TILE_SIZE),
        width: TILE_SIZE,
        height: TILE_SIZE,
        isDynamic: false,
      });
    }
  }

  // Генерация блоков для потолка
  for (let h = 0; h < numLayers; h++) {
    for (let i = 0; i < numTilesWidth; i++) {
      staticGeometryData.push({
        type: 'block',
        x: Math.round(-CANVAS_WIDTH + i * TILE_SIZE),
        y: Math.round(h * TILE_SIZE),
        width: TILE_SIZE,
        height: TILE_SIZE,
        isDynamic: false,
      });
    }
  }
  */

  // Теперь allObstacleData будет содержать только динамические препятствия
  const allObstacleData = [...staticGeometryData, ...dynamicObstaclesData];
  return allObstacleData.map((data: ObstacleData) => new Obstacle(data, manager));
}