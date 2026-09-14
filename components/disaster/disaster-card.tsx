'use client';

import React from 'react';
import styled from 'styled-components';
import { Badge } from '@/components/ui/badge';
import { Disaster } from './types';

interface DisasterCardProps {
  disaster: Disaster;
  onClick: () => void;
}

const formatImpactTime = (dateStr?: string) => {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return d.toLocaleString();
};

const DisasterCard = ({ disaster, onClick }: DisasterCardProps) => {
  const isSafe = disaster.is_verified;

  return (
    <StyledWrapper onClick={onClick}>
      <div className="card">
        <div className="card__shine" />
        <div className="card__glow" />
        <div className="card__content">
          <div className="card__header">
            <div className="flex items-start justify-between gap-2">
              <h3 className="card__title">{disaster.disaster_name}</h3>
              <Badge
                variant={isSafe ? 'default' : 'destructive'}
                className="uppercase shrink-0"
              >
                {isSafe ? 'Safe' : 'Active Warning'}
              </Badge>
            </div>
            <p className="card__description">{disaster.type?.replace('_', ' ')}</p>
          </div>

          <div className="card__info">
            <div className="info-item">
              <span className="info-label">Location:</span>
              <span className="info-value truncate">{disaster.impacted_location}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Impact Time:</span>
              <span className="info-value truncate">
                {formatImpactTime(disaster.impact_time)}
              </span>
            </div>
          </div>

          <div className="card__footer">
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
              View Warning Details &rarr;
            </span>
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  width: 100%;
  cursor: pointer;

  .card {
    --card-bg: var(--card, #ffffff);
    --card-accent: #d97706;
    --card-accent-light: #f59e0b;
    --card-text: #1e293b;
    --card-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);

    width: 100%;
    min-height: 140px;
    background: var(--card-bg);
    border-radius: 16px;
    position: relative;
    overflow: hidden;
    transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: var(--card-shadow);
    border: 1px solid rgba(226, 232, 240, 0.8);
    font-family: inherit;
    display: flex;
    flex-direction: column;
  }

  .card__shine {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      120deg,
      rgba(255, 255, 255, 0) 40%,
      rgba(255, 255, 255, 0.6) 50%,
      rgba(255, 255, 255, 0) 60%
    );
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
  }

  .card__glow {
    position: absolute;
    inset: -10px;
    background: radial-gradient(
      circle at 50% 0%,
      rgba(245, 158, 11, 0.2) 0%,
      rgba(245, 158, 11, 0) 70%
    );
    opacity: 0;
    transition: opacity 0.5s ease;
    pointer-events: none;
  }

  .card__content {
    padding: 16px;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 12px;
    position: relative;
    z-index: 2;
  }

  .card__header {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .card__title {
    color: var(--card-text);
    font-size: 15px;
    font-weight: 700;
    line-height: 1.25;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: all 0.3s ease;
  }

  .card__description {
    color: #64748b;
    font-size: 11px;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 600;
    transition: all 0.3s ease;
  }

  .card__info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  .info-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #64748b;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .info-label {
    font-weight: 600;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    color: #94a3b8;
    flex-shrink: 0;
  }

  .info-value {
    color: #334155;
    font-weight: 500;
  }

  .card__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 8px;
    border-top: 1px solid rgba(226, 232, 240, 0.6);
  }

  .card:hover {
    transform: translateY(-8px);
    box-shadow:
      0 20px 25px -5px rgba(0, 0, 0, 0.08),
      0 10px 10px -5px rgba(0, 0, 0, 0.03);
    border-color: rgba(245, 158, 11, 0.4);
  }

  .card:hover .card__shine {
    opacity: 1;
    animation: shine 2.5s infinite;
  }

  .card:hover .card__glow {
    opacity: 1;
  }

  .card:hover .card__title {
    color: var(--card-accent);
    transform: translateX(2px);
  }

  .card:hover .card__description {
    opacity: 1;
    transform: translateX(2px);
  }

  .card:active {
    transform: translateY(-4px) scale(0.99);
  }

  @keyframes shine {
    0% {
      background-position: -100% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
`;

export default DisasterCard;
