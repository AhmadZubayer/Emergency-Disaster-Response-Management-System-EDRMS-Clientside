'use client';

import React from 'react';
import styled from 'styled-components';
import { Badge } from '@/components/ui/badge';
import { DonationCampaign } from './types';

interface DonationCardProps {
  campaign: DonationCampaign;
  onClick: () => void;
}

const DonationCard = ({ campaign, onClick }: DonationCardProps) => {
  const target = Number(campaign.target_amount) || 0;
  const collected = Number(campaign.raised_amount) || 0;
  const progressPct = target > 0 ? Math.min(100, Math.round((collected / target) * 100)) : 0;
  const isActive = campaign.status === 'active';

  return (
    <StyledWrapper onClick={onClick}>
      <div className="card">
        <div className="card__shine" />
        <div className="card__glow" />
        <div className="card__content">
          <div className="card__header">
            <div className="flex items-start justify-between gap-2">
              <h3 className="card__title">{campaign.title}</h3>
              <Badge
                variant={isActive ? 'default' : 'secondary'}
                className="uppercase shrink-0"
              >
                {campaign.status}
              </Badge>
            </div>
            <p className="card__description">
              {campaign.start_date ? new Date(campaign.start_date).toLocaleDateString() : 'Active'} -{' '}
              {campaign.end_date ? new Date(campaign.end_date).toLocaleDateString() : 'Ongoing'}
            </p>
          </div>

          <div className="card__progress-container">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium text-primary dark:text-primary">
                ${collected.toLocaleString()} raised
              </span>
              <span className="text-muted-foreground text-xs">
                Target: ${target.toLocaleString()}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          <div className="card__footer">
            <span className="text-xs font-medium text-primary dark:text-primary">
              {progressPct}% Funded
            </span>
            <span className="text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">
              Donate & View Details &rarr;
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
    --card-accent: #059669;
    --card-accent-light: #10b981;
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
      rgba(16, 185, 129, 0.2) 0%,
      rgba(16, 185, 129, 0) 70%
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
    font-weight: 500;
    transition: all 0.3s ease;
  }

  .card__progress-container {
    width: 100%;
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
    border-color: rgba(16, 185, 129, 0.4);
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

export default DonationCard;
