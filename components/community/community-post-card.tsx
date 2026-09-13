'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Heart,
  MessageSquare,
  MapPin,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from '@/components/ui/toast';
import useAuth from '@/app/hooks/useAuth';
import useAxiosSecure from '@/app/hooks/useAxiosSecure';
import { CommunityPost } from './types';

interface CommunityPostCardProps {
  post: CommunityPost;
  onPostUpdated: () => void;
}

const CommunityPostCard = ({ post, onPostUpdated }: CommunityPostCardProps) => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();

  const [hasLiked, setHasLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(
    post.CommunityResponse?.Reactions?.total || 0
  );
  const [reacting, setReacting] = useState(false);

  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

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
    <Card className="rounded-xl border border-border/70 bg-card shadow-xs overflow-hidden transition-all hover:shadow-sm hover:border-emerald-600/30">
      <CardHeader className="p-2.5 px-3.5 pb-1">
        <div className="flex items-center gap-2">
          <div className="size-6 rounded-full bg-emerald-700/10 text-emerald-800 font-bold text-[10px] flex items-center justify-center border border-emerald-600/20 shrink-0">
            {authorInitial}
          </div>
          <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
            <span className="font-bold text-xs text-foreground truncate">
              {post.postedBy?.name || 'Community Member'}
            </span>
            <span className="text-[9px] uppercase font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0 rounded-full border border-emerald-200/50">
              {post.postedBy?.role || 'User'}
            </span>
            {post.postedBy?.location && (
              <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                <MapPin className="size-2.5" />
                {post.postedBy.location}
              </span>
            )}
            <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
              <Clock className="size-2.5" />
              {formatDate(post.bumped_at || post.created_at)}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-3.5 py-0.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0 space-y-0.5">
            <Link
              href={`/community/${post.postId}`}
              className="font-bold text-xs sm:text-[13px] text-foreground leading-tight hover:text-emerald-700 dark:hover:text-emerald-400 hover:underline transition-colors line-clamp-1 block"
            >
              {post.title}
            </Link>
            <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">
              {post.body}
            </p>
          </div>

          {hasMedia && firstMediaUrl && (
            <Link
              href={`/community/${post.postId}`}
              className="size-14 sm:size-16 rounded-lg overflow-hidden border border-border/50 bg-muted/20 shrink-0 relative group block"
            >
              <img
                src={firstMediaUrl}
                alt="Post preview"
                className="size-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
              {post.media_urls.length > 1 && (
                <span className="absolute bottom-0.5 right-0.5 bg-black/75 text-white text-[8px] font-bold px-1 rounded">
                  +{post.media_urls.length - 1}
                </span>
              )}
            </Link>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-1.5 px-3.5 border-t border-border/40 flex items-center justify-between mt-1.5 bg-muted/10">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleReact}
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-semibold transition-colors ${
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

          <Link
            href={`/community/${post.postId}`}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <MessageSquare className="size-3" />
            <span>{post.CommunityResponse?.totalComments || 0}</span>
          </Link>
        </div>

        <Link
          href={`/community/${post.postId}`}
          className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
        >
          <span>View</span>
          <ArrowUpRight className="size-2.5" />
        </Link>
      </CardFooter>
    </Card>
  );
};

export default CommunityPostCard;
