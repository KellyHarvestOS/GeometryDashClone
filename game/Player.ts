import {
  PLAYER_SIZE,
  PLAYER_COLOR,
  JUMP_FORCE,
  GRAVITY,
  CANVAS_HEIGHT,
  GROUND_HEIGHT,
} from './constants';
// import { Obstacle } from './Obstacle'; // Obstacle не используется напрямую в этом файле для типизации методов
import { ImageManager, ImageKey } from './ImageManager';

export class Player {
  x: number;
  y: number;
  prevX: number;
  prevY: number;
  width: number;
  height: number;
  velocityY: number;
  isJumping: boolean;
  isOnGround: boolean;
  rotation: number;
  color: string;
  gravityDirection: number = 1;
  private playerImage: HTMLImageElement | undefined;
  private localImageManager: ImageManager;

  constructor(startX: number, startY: number, manager: ImageManager) {
    this.x = startX;
    this.y = startY;
    this.prevX = startX;
    this.prevY = startY;
    this.width = PLAYER_SIZE;
    this.height = PLAYER_SIZE;
    this.velocityY = 0;
    this.isJumping = false;
    this.isOnGround = false;
    this.rotation = 0;
    this.color = PLAYER_COLOR;
    this.localImageManager = manager;
    this.playerImage = this.localImageManager.getImage('player');
    this.gravityDirection = 1;
  }

  jump() {
    if (this.isOnGround) {
      this.velocityY = JUMP_FORCE * this.gravityDirection;
      this.isJumping = true;
      this.isOnGround = false;
    }
  }

  applyGravity() {
    if (!this.isOnGround) {
      this.velocityY += GRAVITY * this.gravityDirection;
    }
  }

  updatePosition() {
    this.prevX = this.x;
    this.prevY = this.y;
    this.y += this.velocityY;

    if (!this.isOnGround) {
      this.rotation += 5 * this.gravityDirection;
    }

    const groundLevel = CANVAS_HEIGHT - GROUND_HEIGHT - this.height;
    const ceilingLevel = GROUND_HEIGHT;

    if (this.gravityDirection === 1) {
      if (this.y >= groundLevel) {
        this.y = groundLevel;
        this.landed();
      }
    } else {
      if (this.y <= ceilingLevel) {
        this.y = ceilingLevel;
        this.landed();
      }
    }
    if (this.y > ceilingLevel && this.y < groundLevel) {
        this.isOnGround = false;
    }
  }

  landed() {
    this.velocityY = 0;
    this.isJumping = false;
    this.isOnGround = true;
    this.rotation = Math.round(this.rotation / 90) * 90;
    if (this.gravityDirection === -1 && (this.rotation % 180 !== 0)) {
       if (Math.abs(this.rotation % 180) === 90) this.rotation +=90;
    } else if (this.gravityDirection === 1 && (this.rotation % 180 !== 0)){
         if (Math.abs(this.rotation % 180) === 90) this.rotation +=90;
    }
    this.rotation = (this.rotation % 360 + 360) % 360;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    ctx.rotate(this.rotation * Math.PI / 180);

    if (!this.playerImage) { // Попытка получить изображение, если оно не было загружено при создании
        this.playerImage = this.localImageManager.getImage('player');
    }

    if (this.playerImage && this.playerImage.complete && this.playerImage.naturalHeight !== 0) {
      ctx.drawImage(this.playerImage, -this.width / 2, -this.height / 2, this.width, this.height);
    } else {
      ctx.fillStyle = this.color;
      ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    }
    ctx.restore();
  }

  getBounds() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }

  toggleGravity() {
    this.gravityDirection *= -1;
    this.velocityY = 1 * -this.gravityDirection;
    this.isOnGround = false;
  }

  resetState(startX: number, startY: number, manager: ImageManager) {
    this.x = startX;
    this.y = startY;
    this.prevX = startX;
    this.prevY = startY;
    this.velocityY = 0;
    this.isJumping = false;
    this.isOnGround = false;
    this.rotation = 0;
    this.gravityDirection = 1;
    this.localImageManager = manager;
    this.playerImage = this.localImageManager.getImage('player');
  }
}