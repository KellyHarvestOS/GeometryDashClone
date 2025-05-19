import {
  PLAYER_SIZE,
  BLOCK_COLOR,
  SPIKE_COLOR,
  OBSTACLE_SPEED,
  PORTAL_GRAVITY_UP_COLOR,
  PORTAL_GRAVITY_DOWN_COLOR,
  CANVAS_HEIGHT,
  GROUND_HEIGHT,
  GROUND_TILE_SIZE
} from './constants';
import { ImageManager, ImageKey } from './ImageManager';

export type ObstacleType = 'block' | 'spike' | 'portal';
export type PortalEffect = 'gravityUp' | 'gravityDown';

// Перемещаем ObstacleData сюда или импортируем из Level.ts, если он там определен с isDynamic
export interface ObstacleData {
  x: number;
  y: number;
  width?: number;
  height?: number;
  size?: number;
  type: ObstacleType;
  portalEffect?: PortalEffect;
  isDynamic?: boolean; // Флаг для различения блоков
}

export class Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: ObstacleType;
  portalEffect?: PortalEffect;
  color: string;
  triggered: boolean = false;
  private obstacleImage: HTMLImageElement | undefined;
  private imageKey: ImageKey | undefined;
  private localImageManager: ImageManager;
  isVisuallyFlipped: boolean;

  constructor(data: ObstacleData, manager: ImageManager) {
    this.x = data.x;
    this.y = data.y;
    this.type = data.type;
    this.portalEffect = data.portalEffect;
    this.localImageManager = manager;
    this.isVisuallyFlipped = false;

    if (data.type === 'block') {
      this.width = data.width || GROUND_TILE_SIZE;
      this.height = data.height || GROUND_TILE_SIZE;
      this.color = BLOCK_COLOR;

      // Если isDynamic не передан, считаем его динамическим, если он не является частью основного пола/потолка
      const isTrulyDynamic = data.isDynamic === true || 
                            (data.isDynamic === undefined && 
                             this.y >= GROUND_HEIGHT && this.y < CANVAS_HEIGHT - GROUND_HEIGHT);

      if (isTrulyDynamic && this.localImageManager.getImage('dynamicBlock')) {
        this.imageKey = 'dynamicBlock'; // Используем dynamicBlock, если он есть и блок динамический
      } else {
        this.imageKey = 'terrainBlock'; // Иначе используем terrainBlock
      }
      
      // Переворачиваем ОСНОВНОЙ ПОТОЛОК (состоящий из terrainBlock)
      if (this.imageKey === 'terrainBlock' && this.y < GROUND_HEIGHT && this.height === GROUND_TILE_SIZE && data.isDynamic === false) {
         this.isVisuallyFlipped = true;
      }
      // Переворачиваем ДИНАМИЧЕСКИЕ блоки НА потолке
      else if (isTrulyDynamic && this.y >= GROUND_HEIGHT && this.y < CANVAS_HEIGHT / 2) {
         this.isVisuallyFlipped = true;
      }

    } else if (data.type === 'spike') {
      this.width = data.size || PLAYER_SIZE;
      this.height = data.size || PLAYER_SIZE;
      this.color = SPIKE_COLOR;
      this.imageKey = 'spike';
      if (Math.abs(this.y - GROUND_HEIGHT) < GROUND_TILE_SIZE / 2) { // Шипы на потолке
          this.isVisuallyFlipped = true;
      }
    } else if (data.type === 'portal') {
      this.width = data.width || PLAYER_SIZE;
      this.height = data.height || PLAYER_SIZE * 3;
      this.imageKey = data.portalEffect === 'gravityUp' ? 'portalUp' : 'portalDown';
      this.color = data.portalEffect === 'gravityUp' ? PORTAL_GRAVITY_UP_COLOR : PORTAL_GRAVITY_DOWN_COLOR;
    } else {
        this.width = PLAYER_SIZE;
        this.height = PLAYER_SIZE;
        this.color = '#CCCCCC';
        this.imageKey = undefined;
    }

    if (this.imageKey) {
        this.obstacleImage = this.localImageManager.getImage(this.imageKey);
    }
  }

  update() {
    this.x -= OBSTACLE_SPEED;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (!this.obstacleImage && this.imageKey) {
        this.obstacleImage = this.localImageManager.getImage(this.imageKey);
    }

    if (this.obstacleImage && this.obstacleImage.complete && this.obstacleImage.naturalHeight !== 0) {
        ctx.save();
        if (this.isVisuallyFlipped) {
            ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
            ctx.rotate(Math.PI);
            ctx.translate(-(this.x + this.width / 2), -(this.y + this.height / 2));
        }
        ctx.drawImage(this.obstacleImage, this.x, this.y, this.width, this.height);
        ctx.restore();
    } else {
      ctx.fillStyle = this.color;
      if (this.type === 'block' || this.type === 'portal') {
        ctx.fillRect(this.x, this.y, this.width, this.height);
        if (this.type === 'portal') {
            ctx.fillStyle = 'white'; ctx.font = '12px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(this.portalEffect === 'gravityUp' ? 'UP' : 'DOWN', this.x + this.width / 2, this.y + this.height / 2);
        }
      } else if (this.type === 'spike') {
        ctx.save();
        if (this.isVisuallyFlipped) {
            ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
            ctx.rotate(Math.PI);
            ctx.translate(-(this.x + this.width / 2), -(this.y + this.height / 2));
        }
        ctx.beginPath();
        ctx.moveTo(this.x, this.y + this.height);
        ctx.lineTo(this.x + this.width / 2, this.y);
        ctx.lineTo(this.x + this.width, this.y + this.height);
        ctx.closePath(); ctx.fill();
        ctx.restore();
      }
    }
  }

  getBounds() {
    return { x: this.x, y: this.y, width: this.width, height: this.height };
  }
}