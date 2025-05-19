import React, { useRef, useEffect } from 'react';
import GameCanvas from '../components/GameCanvas';
import Head from 'next/head';
import styles from '../styles/GamePage.module.css';

const GamePage: React.FC = () => {
  const gamePageContainerRef = useRef<HTMLDivElement>(null);
  // gameCanvasWrapperRef больше не нужен здесь, если масштабирование полностью через CSS

  useEffect(() => {
    // Можно оставить для будущей логики, если понадобится JS для ресайза
    const handleResize = () => {};
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  return (
    <>
      <Head>
        <title>Geometry Dash Clone</title>
        {/* Шрифты теперь должны быть в _document.tsx */}
      </Head>
      <div ref={gamePageContainerRef} className={styles.gamePageContainer}>
        <div className={styles.gameCanvasWrapper}>
          <GameCanvas />
        </div>
      </div>
    </>
  );
};

export default GamePage;