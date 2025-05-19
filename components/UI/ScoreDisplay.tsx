import React from 'react';

interface ScoreDisplayProps {
  attempts: number;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ attempts }) => {
  return (
    <div style={{ position: 'absolute', top: '10px', left: '10px', fontSize: '20px', color: 'black' }}>
      Попытки: {attempts}
    </div>
  );
};

export default ScoreDisplay;