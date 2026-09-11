'use client';

import React from 'react';
import styled from 'styled-components';

interface ModernButtonProps extends React.ComponentProps<'button'> {
  text?: string;
}

const ModernButton = ({ children, text, className, type = 'button', ...props }: ModernButtonProps) => {
  return (
    <StyledWrapper>
      <button type={type} className={`animated-button ${className ?? ''}`} {...props}>
        <svg xmlns="http://www.w3.org/2000/svg" className="arr-2" viewBox="0 0 24 24">
          <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" />
        </svg>
        <span className="text">{children ?? text}</span>
        <span className="circle" />
        <svg xmlns="http://www.w3.org/2000/svg" className="arr-1" viewBox="0 0 24 24">
          <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" />
        </svg>
      </button>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

  .animated-button {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 10px 22px;
    border: 3px solid transparent;
    font-size: 13.5px;
    background-color: transparent;
    border-radius: 100px;
    font-weight: 600;
    color: #1e1e1e;
    box-shadow: 0 0 0 2px #1e1e1e;
    cursor: pointer;
    overflow: hidden;
    transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
  }

  .animated-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .animated-button:focus-visible {
    outline: 2px solid #0F825F;
    outline-offset: 3px;
  }

  .animated-button svg {
    position: absolute;
    width: 15px;
    fill: #1e1e1e;
    z-index: 9;
    transition: all 0.8s cubic-bezier(0.23, 1, 0.32, 1);
  }

  .animated-button .arr-1 {
    right: 12px;
  }

  .animated-button .arr-2 {
    left: -25%;
  }

  .animated-button .circle {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 14px;
    height: 14px;
    background-color: #0F825F;
    border-radius: 50%;
    opacity: 0;
    transition: all 0.8s cubic-bezier(0.23, 1, 0.32, 1);
  }

  .animated-button .text {
    position: relative;
    z-index: 1;
    transform: translateX(-8px);
    transition: all 0.8s cubic-bezier(0.23, 1, 0.32, 1);
  }

  .animated-button:hover {
    box-shadow: 0 0 0 10px transparent;
    color: #ffffff;
    border-radius: 10px;
  }

  .animated-button:hover .arr-1 {
    right: -25%;
  }

  .animated-button:hover .arr-2 {
    left: 12px;
  }

  .animated-button:hover .text {
    transform: translateX(8px);
  }

  .animated-button:hover svg {
    fill: #ffffff;
  }

  .animated-button:active {
    scale: 0.95;
    box-shadow: 0 0 0 3px #0F825F;
  }

  .animated-button:hover .circle {
    width: 220px;
    height: 220px;
    opacity: 1;
  }

  @media (prefers-reduced-motion: reduce) {
    .animated-button,
    .animated-button * {
      transition: none !important;
    }
  }
`;

export default ModernButton;
