'use client';

import React from 'react';

interface ChatbotIconProps {
  size?: number;
  className?: string;
}

export default function ChatbotIcon({ size = 32, className = '' }: ChatbotIconProps) {
  const scale = size / 100;

  return (
    <div
      className={`relative flex items-center justify-center overflow-visible pointer-events-none select-none shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <style>{`
        @keyframes uiverseSpinning82341 {
          to {
            transform: rotate(360deg);
          }
        }
        .uiverse-spinner {
          background-image: linear-gradient(rgb(186, 66, 255) 35%, rgb(0, 225, 255));
          width: 100px;
          height: 100px;
          animation: uiverseSpinning82341 1.7s linear infinite;
          text-align: center;
          border-radius: 50px;
          filter: blur(1px);
          box-shadow: 0px -5px 20px 0px rgb(186, 66, 255), 0px 5px 20px 0px rgb(0, 225, 255);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .uiverse-spinner1 {
          background-color: rgb(36, 36, 36);
          width: 80px;
          height: 80px;
          border-radius: 50px;
          filter: blur(8px);
        }
      `}</style>
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
        }}
        className="shrink-0 flex items-center justify-center"
      >
        <div className="uiverse-spinner">
          <div className="uiverse-spinner1" />
        </div>
      </div>
    </div>
  );
}

