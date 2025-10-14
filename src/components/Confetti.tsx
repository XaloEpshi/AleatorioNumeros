"use client";

import React, { useMemo, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

type ConfettiPiece = {
  id: number;
  style: React.CSSProperties;
  shape: 'rect' | 'circle';
};

const colors = ["#FFD700", "#B80F0A", "#FFFFFF"];

export const Confetti = () => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    const newPieces = Array.from({ length: 150 }).map((_, i) => {
      const x = Math.random() * 100;
      const y = -10 - Math.random() * 20;
      const duration = 4 + Math.random() * 4;
      const delay = Math.random() * 2;
      const rotation = Math.random() * 360;
      const size = 8 + Math.random() * 8;
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      return {
        id: i,
        shape: Math.random() > 0.5 ? 'rect' : 'circle',
        style: {
          left: `${x}vw`,
          top: `${y}vh`,
          width: `${size}px`,
          height: `${size}px`,
          backgroundColor: color,
          transform: `rotate(${rotation}deg)`,
          animation: `fall ${duration}s ${delay}s linear forwards`,
        } as React.CSSProperties,
      };
    });
    setPieces(newPieces);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
       <style>{`
        @keyframes fall {
          0% { transform: translateY(0vh) rotate(var(--start-rot)); opacity: 1; }
          100% { transform: translateY(110vh) rotate(var(--end-rot)); opacity: 0; }
        }
      `}</style>
      {pieces.map(piece => {
        const startRot = Math.random() * 720;
        const endRot = startRot + Math.random() * 720 - 360;

        const dynamicStyle: React.CSSProperties = {
          ...piece.style,
          '--start-rot': `${startRot}deg`,
          '--end-rot': `${endRot}deg`,
        } as React.CSSProperties;

        return (
          <div
            key={piece.id}
            style={dynamicStyle}
            className={cn(
              'absolute',
              piece.shape === 'circle' ? 'rounded-full' : ''
            )}
          />
        );
      })}
    </div>
  );
};
