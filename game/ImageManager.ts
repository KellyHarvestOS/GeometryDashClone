interface ImageSources {
  player: string;
  groundBlock: string;
  spike: string;
  portalUp: string;
  portalDown: string;
  backgroundLayer1?: string;
   terrainBlock: string;
    dynamicBlock?: string;

}

export type ImageKey = keyof ImageSources;

export class ImageManager {
  private images: Map<ImageKey, HTMLImageElement> = new Map();
  private sources: ImageSources = {
    player: '/assets/images/player.png',
     terrainBlock: '/assets/images/ground_block1.png',
    groundBlock: '/assets/images/ground_block.png',
    spike: '/assets/images/spike.png',
    portalUp: '/assets/images/portal_up.png',
    portalDown: '/assets/images/portal_down.png',
    backgroundLayer1: '/assets/images/1.jpg',
     dynamicBlock: '/assets/images/ground_block1.png',
  };
  public TILE_SIZE = 30;
  private loadPromises: Promise<void>[] = [];

  constructor() {
    // Конструктор пуст, инициализация в initializeAndLoad
  }

  public initializeAndLoad(): Promise<void[]> {
    if (typeof window === 'undefined') {
      return Promise.resolve([]);
    }

    this.loadPromises = [];

    for (const key in this.sources) {
      const sourceKey = key as ImageKey;
      const img = new Image();
      const srcPath = this.sources[sourceKey];
      if (srcPath) {
        img.src = srcPath;

        const loadPromise = new Promise<void>((resolve, reject) => {
          img.onload = () => {
            this.images.set(sourceKey, img);
            resolve();
          };
          img.onerror = (error) => {
            console.error(`Failed to load image: ${srcPath}`, error);
            reject(error);
          };
        });
        this.loadPromises.push(loadPromise);
      }
    }
    return Promise.all(this.loadPromises);
  }

  getImage(key: ImageKey): HTMLImageElement | undefined {
    return this.images.get(key);
  }

  drawTiled(ctx: CanvasRenderingContext2D, key: ImageKey, x: number, y: number, width: number, height: number) {
    const img = this.getImage(key);
    if (!img || !img.complete || img.naturalHeight === 0) return;

    const tileWidth = img.naturalWidth; // Используем naturalWidth/Height для оригинального размера тайла
    const tileHeight = img.naturalHeight;

    if (tileWidth === 0 || tileHeight === 0) return; // Защита от деления на ноль

    for (let i = 0; i * tileWidth < width; i++) {
      for (let j = 0; j * tileHeight < height; j++) {
        const currentTileWidth = Math.min(tileWidth, width - i * tileWidth);
        const currentTileHeight = Math.min(tileHeight, height - j * tileHeight);
        ctx.drawImage(
          img,
          0, 0,
          currentTileWidth, currentTileHeight,
          x + i * tileWidth,
          y + j * tileHeight,
          currentTileWidth,
          currentTileHeight
        );
      }
    }
  }
}