'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Heart,
  MessageSquare,
  Send,
  Trash2,
  MapPin,
  Clock,
  ArrowLeft,
  AlertCircle,
  Share2,
} from 'lucide-react';
import Navbar from '@/components/navbar';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { toast } from '@/components/ui/toast';
import useAuth from '@/hooks/use-auth';
import { axiosSecure, publicApi } from '@/lib/api';
import { CommunityPost, PostComment } from '@/components/community/types';

const CommunityPostDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const id = params?.id as string;

  const [post, setPost] = useState<CommunityPost | null>(null);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const [hasLiked, setHasLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [reacting, setReacting] = useState(false);

  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

  const fetchPost = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await publicApi.get(`/community-posts/${id}`);
      const data = res.data?.data || res.data;
      setPost(data);
      setLikeCount(data?.CommunityResponse?.Reactions?.total || 0);
    } catch {
      setPost(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchComments = useCallback(async () => {
    if (!id) return;
    try {
      setLoadingComments(true);
      const res = await axiosSecure.get(`/community-posts/${id}/comments`);
      const data = res.data?.data || res.data || [];
      setComments(Array.isArray(data) ? data : []);
    } catch {
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  }, [id, axiosSecure]);

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [fetchPost, fetchComments]);

  const handleReact = async () => {
    if (!user || !post) return;
    if (reacting) return;
    setReacting(true);

    try {
      const willLike = !hasLiked;
      setHasLiked(willLike);
      setLikeCount((prev) => (willLike ? prev + 1 : Math.max(0, prev - 1)));

      await axiosSecure.post(`/community-posts/${post.postId}/react`, {
        type: 'LIKE',
      });
    } catch {
      setHasLiked(!hasLiked);
      setLikeCount((prev) => (hasLiked ? prev + 1 : Math.max(0, prev - 1)));
    } finally {
      setReacting(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !post) return;

    try {
      setSubmittingComment(true);
      await axiosSecure.post(`/community-posts/${post.postId}/comments`, {
        content: newComment.trim(),
      });
      toast.add({
        id: 'comment-posted-success',
        title: 'Comment posted successfully!',
        type: 'success',
        timeout: 4000,
      });
      setNewComment('');
      await fetchComments();
      await fetchPost();
    } catch (err: any) {
      toast.add({
        id: 'comment-detail-error',
        title: err?.response?.data?.message || 'Failed to post comment.',
        type: 'error',
        timeout: 4000,
      });
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!post) return;
    try {
      await axiosSecure.delete(
        `/community-posts/${post.postId}/comments/${commentId}`
      );
      toast.add({
        id: 'comment-deleted-success',
        title: 'Comment deleted.',
        type: 'success',
        timeout: 4000,
      });
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      await fetchPost();
    } catch (err: any) {
      toast.add({
        id: 'comment-detail-delete-error',
        title: err?.response?.data?.message || 'Failed to delete comment.',
        type: 'error',
        timeout: 4000,
      });
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const authorInitial = (post?.postedBy?.name || 'U').charAt(0).toUpperCase();

  return (
    <div className="min-h-screen flex flex-col bg-background">
        <Navbar />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink render={<Link href="/" />}>Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink render={<Link href="/community" />}>
                  Community
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {post?.title ? (post.title.length > 30 ? `${post.title.slice(0, 30)}...` : post.title) : 'Post Details'}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7 space-y-4">
                <div className="rounded-2xl border border-border/70 bg-card p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-10 rounded-full shrink-0" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-7 w-3/4" />
                  <Skeleton className="h-20 w-full rounded-xl" />
                  <Skeleton className="h-48 w-full rounded-xl" />
                </div>
              </div>
              <div className="lg:col-span-5 space-y-4">
                <div className="rounded-2xl border border-border/70 bg-card p-4 space-y-3">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-9 w-full rounded-xl" />
                  <div className="space-y-2 pt-2">
                    <Skeleton className="h-16 w-full rounded-xl" />
                    <Skeleton className="h-16 w-full rounded-xl" />
                  </div>
                </div>
              </div>
            </div>
          ) : !post ? (
            <div className="py-16 text-center space-y-4">
              <AlertCircle className="size-12 text-muted-foreground/60 mx-auto" />
              <h2 className="text-xl font-bold text-foreground">
                Community Post Not Found
              </h2>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                This post may have been removed or is no longer available.
              </p>
              <Button render={<Link href="/community" />} variant="outline">
                <ArrowLeft className="size-4 mr-2" />
                Back to Community Feed
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7 space-y-4">
                <Card className="rounded-2xl border border-border/70 bg-card shadow-sm overflow-hidden">
                  <CardHeader className="p-5 pb-4 border-b border-border/40">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-emerald-700/10 text-emerald-800 font-bold text-sm flex items-center justify-center border border-emerald-600/20 shrink-0">
                        {authorInitial}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-foreground">
                            {post.postedBy?.name || 'Community Member'}
                          </span>
                          <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200/50">
                            {post.postedBy?.role || 'User'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                          {post.postedBy?.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="size-3" />
                              {post.postedBy.location}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="size-3" />
                            {formatDate(post.bumped_at || post.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-5 space-y-4">
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground leading-snug">
                      {post.title}
                    </h1>

                    <p className="text-xs leading-relaxed text-muted-foreground whitespace-pre-line">
                      {post.body}
                    </p>

                    {post.media_urls && post.media_urls.length > 0 && (
                      <div
                        className={`grid gap-3 pt-2 ${
                          post.media_urls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
                        }`}
                      >
                        {post.media_urls.map((url, idx) => {
                          const fullUrl = url.startsWith('http') ? url : `${backendUrl}${url}`;
                          return (
                            <div
                              key={idx}
                              className="rounded-xl overflow-hidden border border-border/50 bg-muted/20 flex items-center justify-center"
                            >
                              <img
                                src={fullUrl}
                                alt={`Attachment ${idx + 1}`}
                                className="w-full h-auto object-cover max-h-96"
                              />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="p-4 px-5 border-t border-border/50 flex items-center justify-between bg-muted/10">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handleReact}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          hasLiked
                            ? 'text-rose-600 bg-rose-50 dark:bg-rose-950/40'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        }`}
                      >
                        <Heart
                          className={`size-4 ${hasLiked ? 'fill-rose-600 text-rose-600' : ''}`}
                        />
                        <span>{likeCount} Likes</span>
                      </button>

                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MessageSquare className="size-4" />
                        <span>{comments.length} Comments</span>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              </div>

              <div className="lg:col-span-5 space-y-4">
                <Card className="rounded-2xl border border-border/70 bg-card shadow-sm overflow-hidden sticky top-20">
                  <CardHeader className="p-4 pb-3 border-b border-border/40">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                        <MessageSquare className="size-4 text-muted-foreground" />
                        Comments ({comments.length})
                      </h2>
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 space-y-4">
                    <form onSubmit={handleAddComment} className="space-y-2">
                      <Input
                        type="text"
                        placeholder="Add a comment to this discussion..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="text-xs h-9 bg-muted/20 rounded-xl"
                      />
                      <div className="flex justify-end">
                        <Button
                          type="submit"
                          size="sm"
                          disabled={submittingComment || !newComment.trim()}
                          className="text-xs font-semibold h-8 px-3 rounded-lg gap-1.5"
                        >
                          <Send className="size-3" />
                          <span>{submittingComment ? 'Sending...' : 'Post Comment'}</span>
                        </Button>
                      </div>
                    </form>

                    <div className="space-y-2.5 max-h-[550px] overflow-y-auto pr-1">
                      {loadingComments ? (
                        <p className="text-center text-xs text-muted-foreground py-4">
                          Loading comments...
                        </p>
                      ) : comments.length === 0 ? (
                        <div className="py-8 text-center space-y-1">
                          <p className="text-xs font-semibold text-foreground">
                            No comments yet
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            Start the conversation by posting a comment above.
                          </p>
                        </div>
                      ) : (
                        comments.map((comment) => {
                          const isCommentAuthor =
                            user?.name === comment.postedBy?.name;

                          return (
                            <div
                              key={comment.id}
                              className="p-3 rounded-xl bg-muted/20 border border-border/50 text-xs space-y-1.5"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-bold text-foreground">
                                    {comment.postedBy?.name || 'User'}
                                  </span>
                                  <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.2 rounded-full">
                                    {comment.postedBy?.role || 'User'}
                                  </span>
                                  <span className="text-[10px] text-muted-foreground">
                                    • {formatDate(comment.created_at)}
                                  </span>
                                </div>
                                {isCommentAuthor && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteComment(comment.id)}
                                    className="text-muted-foreground hover:text-destructive transition-colors p-1"
                                    title="Delete comment"
                                  >
                                    <Trash2 className="size-3.5" />
                                  </button>
                                )}
                              </div>
                              <p className="text-muted-foreground whitespace-pre-line text-xs leading-relaxed">
                                {comment.content}
                              </p>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </main>
      </div>
  );
};

export default CommunityPostDetailPage;
