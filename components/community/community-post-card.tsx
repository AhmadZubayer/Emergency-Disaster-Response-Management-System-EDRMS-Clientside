'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import {
  Heart,
  MessageSquare,
  MapPin,
  Clock,
} from 'lucide-react';
import { toast } from '@/components/ui/toast';
import useAuth from '@/hooks/use-auth';
import { axiosSecure } from '@/lib/api';
import { CommunityPost } from './types';

interface CommunityPostCardProps {
  post: CommunityPost;
  onPostUpdated: () => void;
}

const CommunityPostCard = ({ post, onPostUpdated }: CommunityPostCardProps) => {
  const router = useRouter();
  const { user } = useAuth();

  const [hasLiked, setHasLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(
    post.CommunityResponse?.Reactions?.total || 0
  );
  const [reacting, setReacting] = useState(false);

  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

  const handleCardClick = () => {
    router.push(`/community/${post.postId}`);
  };

  const handleReact = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.add({
        id: 'auth-required-like',
        title: 'Please sign in to react to posts.',
        type: 'error',
        timeout: 4000,
      });
      return;
    }

    if (reacting) return;
    setReacting(true);

    try {
      const willLike = !hasLiked;
      setHasLiked(willLike);
      setLikeCount((prev) => (willLike ? prev + 1 : Math.max(0, prev - 1)));

      await axiosSecure.post(`/community-posts/${post.postId}/react`, {
        type: 'LIKE',
      });
      onPostUpdated();
    } catch {
      setHasLiked(!hasLiked);
      setLikeCount((prev) => (hasLiked ? prev + 1 : Math.max(0, prev - 1)));
    } finally {
      setReacting(false);
    }
  };

  const handleCommentsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/community/${post.postId}`);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const authorInitial = (post.postedBy?.name || 'U').charAt(0).toUpperCase();

  const hasMedia = post.media_urls && post.media_urls.length > 0;
  const firstMediaUrl = hasMedia
    ? post.media_urls[0].startsWith('http')
      ? post.media_urls[0]
      : `${backendUrl}${post.media_urls[0]}`
    : null;

  return (
    <StyledWrapper onClick={handleCardClick}>
      <div className="card">
        <div className="card__shine" />
        <div className="card__glow" />
        <div className="card__content">
          <div className="flex items-center justify-between gap-3 w-full">
            <div className="flex items-center gap-2 min-w-0">
              <div className="size-5 rounded-full bg-primary/10 text-primary font-medium text-[10px] flex items-center justify-center border border-primary/20 shrink-0">
                {authorInitial}
              </div>
              <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                <span className="font-semibold text-xs text-foreground truncate">
                  {post.postedBy?.name || 'Community Member'}
                </span>
                <span className="text-[9px] uppercase font-semibold text-primary dark:text-primary bg-primary/10 dark:bg-primary/50 px-1.5 py-0 rounded-full border border-primary/50 shrink-0">
                  {post.postedBy?.role || 'User'}
                </span>
                {post.postedBy?.location && (
                  <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground truncate">
                    <MapPin className="size-2.5 shrink-0" />
                    {post.postedBy.location}
                  </span>
                )}
                <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground shrink-0">
                  <Clock className="size-2.5 shrink-0" />
                  {formatDate(post.bumped_at || post.created_at)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleReact}
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium transition-colors ${
                  hasLiked
                    ? 'text-rose-600 bg-rose-50 dark:bg-rose-950/40'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <Heart
                  className={`size-3 ${hasLiked ? 'fill-rose-600 text-rose-600' : ''}`}
                />
                <span>{likeCount}</span>
              </button>

              <button
                type="button"
                onClick={handleCommentsClick}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                <MessageSquare className="size-3" />
                <span>{post.CommunityResponse?.totalComments || 0}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 w-full mt-1.5">
            <div className="flex-1 min-w-0 space-y-0.5">
              <h3 className="card__title text-xs font-bold text-foreground leading-tight line-clamp-1">
                {post.title}
              </h3>
              <p className="card__description text-xs text-muted-foreground leading-snug line-clamp-2">
                {post.body}
              </p>
            </div>

            {hasMedia && firstMediaUrl && (
              <div className="size-12 sm:size-14 rounded-lg overflow-hidden border border-border bg-muted/20 shrink-0 relative group">
                <img
                  src={firstMediaUrl}
                  alt="Post preview"
                  className="size-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
                {post.media_urls.length > 1 && (
                  <span className="absolute bottom-0.5 right-0.5 bg-black/75 text-white text-[8px] font-medium px-1 rounded">
                    +{post.media_urls.length - 1}
                  </span>
                )}
              </div>
            )}
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
    background: var(--card-bg);
    border-radius: 14px;
    position: relative;
    overflow: hidden;
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
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
      rgba(16, 185, 129, 0.22) 0%,
      rgba(16, 185, 129, 0) 70%
    );
    opacity: 0;
    transition: opacity 0.4s ease;
    pointer-events: none;
  }

  .card__content {
    padding: 12px 14px;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    position: relative;
    z-index: 2;
  }

  .card__title {
    transition: all 0.3s ease;
  }

  .card__description {
    transition: all 0.3s ease;
  }

  .card:hover {
    transform: translateY(-4px);
    box-shadow:
      0 14px 20px -4px rgba(0, 0, 0, 0.07),
      0 6px 8px -3px rgba(0, 0, 0, 0.03);
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
    transform: translateX(1px);
  }

  .card:hover .card__description {
    transform: translateX(1px);
  }

  .card:active {
    transform: translateY(-2px) scale(0.995);
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

export default CommunityPostCard;
