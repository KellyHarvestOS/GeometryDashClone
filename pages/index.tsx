import React from 'react';
import Link from 'next/link';
import Head from 'next/head'; // Оставляем для title и специфичных мета-тегов страницы
import styles from '../styles/HomePage.module.css';

const HomePage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Geometry Dash Clone - Menu</title>
        {/* Теги для подключения шрифтов отсюда УДАЛЕНЫ */}
      </Head>
      <div className={styles.container}>
        <div className={styles.titleContainer}>
          <h1 className={styles.title}>
            <span>G</span>
            <span>e</span>
            <span>o</span>
            <span>m</span>
            <span>e</span>
            <span>t</span>
            <span>r</span>
            <span>y</span>
            <span className={styles.dashText}>D</span>
            <span className={styles.dashText}>a</span>
            <span className={styles.dashText}>s</span>
            <span className={styles.dashText}>h</span>
          </h1>
          <p className={styles.subtitle}>Clone</p>
        </div>

        <Link href="/levels" passHref> {/* ИЗМЕНЕНО ЗДЕСЬ */}
          <button className={`${styles.startButton} ${styles.animatedButton}`}>
            Start Game
          </button>
        </Link>

        <div className={styles.footerText}>
          A simple clone made with Next.js & Canvas
        </div>

        <div className={styles.bgSquares}>
          {[...Array(10)].map((_, i) => (
            <div key={i} className={styles.square}></div>
          ))}
        </div>
      </div>
    </>
  );
};

export default HomePage;