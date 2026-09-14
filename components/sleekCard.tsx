'use client';

import React from 'react';
import styled from 'styled-components';
import { MapPin, User, Clock } from 'lucide-react';
import { MissingPerson } from '@/components/missing-persons/missing-person-dialog';
import { Badge } from '@/components/ui/badge';

interface SleekCardProps {
  person: MissingPerson;
  onClick: () => void;
}

const getDaysAgo = (dateStr?: string) => {
  if (!dateStr) return 'Recently';
  const date = new Date(dateStr);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Reported today';
  if (diffDays === 1) return 'Reported 1 day ago';
  return `Reported ${diffDays} days ago`;
};

const SleekCard = ({ person, onClick }: SleekCardProps) => {
  const [imgError, setImgError] = React.useState(false);
  const isMissing = person.status?.toUpperCase() === 'MISSING';

  return (
    <StyledWrapper onClick={onClick}>
      <div className="card">
        <div className="card__shine" />
        <div className="card__glow" />
        <div className="card__content">
          <div className="card__left">
            <div className="card__header">
              <h3 className="card__title">{person.full_name}</h3>
              <p className="card__description">
                {person.age} yrs old • {person.gender}
              </p>
            </div>

            <div className="card__info">
              <div className="info-item">
                <MapPin className="size-3 text-current shrink-0" />
                <span className="truncate">{person.last_seen_location}</span>
              </div>
              <div className="info-item">
                <Clock className="size-3 text-current shrink-0" />
                <span className="truncate">{getDaysAgo(person.last_seen_date || person.created_at)}</span>
              </div>
            </div>

            <div className="card__footer">
              <Badge
                variant={isMissing ? 'destructive' : 'default'}
                className="uppercase"
              >
                {person.status}
              </Badge>
            </div>
          </div>

          <div className="card__right">
            <div className="card__image">
              {person.photo_url && !imgError ? (
                <img
                  src={person.photo_url}
                  alt={person.full_name}
                  className="profile-img"
                  onError={() => setImgError(true)}
                />
              ) : (
                <User className="size-8 text-muted-foreground/60" />
              )}
            </div>
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
      rgba(16, 185, 129, 0.25) 0%,
      rgba(16, 185, 129, 0) 70%
    );
    opacity: 0;
    transition: opacity 0.5s ease;
    pointer-events: none;
  }

  .card__content {
    padding: 14px 16px;
    height: 100%;
    display: flex;
    align-items: stretch;
    justify-content: space-between;
    gap: 12px;
    position: relative;
    z-index: 2;
  }

  .card__left {
    width: 60%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 8px;
    min-width: 0;
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
    text-transform: capitalize;
    transition: all 0.3s ease;
  }

  .card__info {
    display: flex;
    flex-direction: column;
    gap: 3px;
    min-width: 0;
  }

  .info-item {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
    color: #64748b;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: color 0.3s ease;
  }

  .card__footer {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 8px;
    margin-top: 2px;
  }

  .card__right {
    width: 40%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .card__image {
    width: 100%;
    aspect-ratio: 1 / 1;
    max-height: 95px;
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.25));
    border-radius: 12px;
    transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(16, 185, 129, 0.2);
  }

  .profile-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s ease;
  }

  .card:hover {
    transform: translateY(-8px);
    box-shadow:
      0 20px 25px -5px rgba(0, 0, 0, 0.08),
      0 10px 10px -5px rgba(0, 0, 0, 0.03);
    border-color: rgba(16, 185, 129, 0.35);
  }

  .card:hover .card__shine {
    opacity: 1;
    animation: shine 2.5s infinite;
  }

  .card:hover .card__glow {
    opacity: 1;
  }

  .card:hover .card__image {
    transform: translateY(-2px) scale(1.03);
    box-shadow: 0 8px 16px -4px rgba(16, 185, 129, 0.2);
  }

  .card:hover .profile-img {
    transform: scale(1.06);
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

export default SleekCard;
