'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '@/components/navbar';
import {
  MessageSquare,
  Heart,
  Plus,
  Search,
  Send,
  Flag,
  Calendar,
  User,
  CheckCircle2,
  AlertCircle,
  Share2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import MuiModal from '@/components/mui-modal';
import { useAuth } from '@/app/hooks/useAuth';
import useAxiosSecure from '@/app/hooks/useAxiosSecure';
import { publicApi } from '@/app/lib/public-api';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user?: {
    id: string;
    name?: string;
  };
}

interface Post {
  id: string;
  title: string;
  body: string;
  author_id?: string;
  author?: {
    id: string;
    name?: string;
  };
  reactions_count?: number;
  comments_count?: number;
  created_at: string;
}

export default function CommunityPage() {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Create Post Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  // Active Post Comments
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentsMap, setCommentsMap] = useState<Record<string, Comment[]>>({});
  const [commentInput, setCommentInput] = useState<Record<string, string>>({});
  const [commentLoading, setCommentLoading] = useState<Record<string, boolean>>({});

  // Toast message
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await publicApi.get('/community-posts', {
        params: { search: searchQuery || undefined },
      });
      const data = res.data?.data || res.data || [];
      setPosts(Array.isArray(data) ? data : []);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setToastMsg('Please sign in to publish a post.');
      return;
    }

    if (!newTitle.trim() || !newBody.trim()) return;

    setCreateLoading(true);
    try {
      await axiosSecure.post('/community-posts', {
        title: newTitle.trim(),
        body: newBody.trim(),
      });
      setNewTitle('');
      setNewBody('');
      setCreateModalOpen(false);
      setToastMsg('Post published successfully!');
      fetchPosts();
      setTimeout(() => setToastMsg(null), 3000);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to publish post.';
      setToastMsg(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!user) {
      setToastMsg('Please sign in to react to posts.');
      return;
    }
    try {
      await axiosSecure.post(`/community-posts/${postId}/react`, { type: 'like' });
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, reactions_count: (p.reactions_count || 0) + 1 }
            : p
        )
      );
    } catch {
      // Ignore double react
    }
  };

  const toggleComments = async (postId: string) => {
    if (activeCommentPostId === postId) {
      setActiveCommentPostId(null);
      return;
    }
    setActiveCommentPostId(postId);

    if (!commentsMap[postId]) {
      try {
        const res = await publicApi.get(`/community-posts/${postId}/comments`);
        const data = res.data?.data || res.data || [];
        setCommentsMap((prev) => ({ ...prev, [postId]: Array.isArray(data) ? data : [] }));
      } catch {
        setCommentsMap((prev) => ({ ...prev, [postId]: [] }));
      }
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!user) {
      setToastMsg('Please sign in to comment.');
      return;
    }
    const text = commentInput[postId]?.trim();
    if (!text) return;

    setCommentLoading((prev) => ({ ...prev, [postId]: true }));
    try {
      await axiosSecure.post(`/community-posts/${postId}/comments`, { content: text });
      setCommentInput((prev) => ({ ...prev, [postId]: '' }));

      const res = await publicApi.get(`/community-posts/${postId}/comments`);
      const updatedComments = res.data?.data || res.data || [];
      setCommentsMap((prev) => ({ ...prev, [postId]: Array.isArray(updatedComments) ? updatedComments : [] }));

      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, comments_count: (p.comments_count || 0) + 1 } : p
        )
      );
    } catch {
      setToastMsg('Failed to post comment.');
    } finally {
      setCommentLoading((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const handleReportPost = async (postId: string) => {
    if (!user) {
      setToastMsg('Please sign in to report.');
      return;
    }
    try {
      await axiosSecure.post(`/community-posts/${postId}/report`, { reason: 'Inappropriate content' });
      setToastMsg('Post reported for moderation review.');
      setTimeout(() => setToastMsg(null), 3000);
    } catch {
      setToastMsg('Failed to report post.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Banner Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <MessageSquare className="size-6 text-emerald-600" />
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Community Discussion Board
              </h1>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Connect with fellow disaster responders, share field updates, and support relief operations.
            </p>
          </div>

          <Button
            onClick={() => {
              if (!user) {
                setToastMsg('Please sign in to create a post.');
                return;
              }
              setCreateModalOpen(true);
            }}
            className="gap-1.5 text-xs font-semibold shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Plus className="size-4" />
            New Community Post
          </Button>
        </div>

        {toastMsg && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
            <CheckCircle2 className="size-4 shrink-0" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search community posts by keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 text-xs bg-card border-border/60"
          />
        </div>

        {/* Posts Feed */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12 space-y-2">
              <div className="size-8 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin mx-auto" />
              <p className="text-xs text-muted-foreground">Loading community discussions...</p>
            </div>
          ) : posts.length === 0 ? (
            <Card className="border-dashed border-border/70 p-8 text-center">
              <p className="text-sm font-semibold text-muted-foreground">
                No community posts found. Be the first to share an update!
              </p>
              <Button
                size="sm"
                onClick={() => setCreateModalOpen(true)}
                className="mt-3 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Create Post
              </Button>
            </Card>
          ) : (
            posts.map((post) => {
              const postComments = commentsMap[post.id] || [];
              const isCommentOpen = activeCommentPostId === post.id;

              return (
                <Card key={post.id} className="border-border/60 shadow-xs hover:border-border transition-colors">
                  <CardHeader className="p-5 pb-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="size-9 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-xs uppercase">
                          {post.author?.name ? post.author.name.charAt(0) : <User className="size-4" />}
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-foreground">
                            {post.author?.name || 'Community Member'}
                          </div>
                          <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Calendar className="size-3" />
                            <span>{new Date(post.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleReportPost(post.id)}
                        title="Report Post"
                        className="size-7 text-muted-foreground hover:text-destructive"
                      >
                        <Flag className="size-3.5" />
                      </Button>
                    </div>

                    <CardTitle className="text-base font-bold text-foreground pt-3">
                      {post.title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="p-5 pt-1 space-y-4">
                    <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {post.body}
                    </p>

                    <div className="flex items-center gap-4 border-t border-border/40 pt-3">
                      <button
                        type="button"
                        onClick={() => handleLikePost(post.id)}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-emerald-600 font-medium transition-colors"
                      >
                        <Heart className="size-4 text-emerald-600" />
                        <span>{post.reactions_count || 0} Likes</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleComments(post.id)}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors"
                      >
                        <MessageSquare className="size-4" />
                        <span>{post.comments_count || postComments.length || 0} Comments</span>
                      </button>
                    </div>

                    {/* Comments Drawer / List */}
                    {isCommentOpen && (
                      <div className="space-y-3 pt-3 border-t border-border/50 bg-muted/20 p-3 rounded-xl">
                        <div className="space-y-2">
                          {postComments.length === 0 ? (
                            <p className="text-xs text-muted-foreground italic">No comments yet. Write one below!</p>
                          ) : (
                            postComments.map((c) => (
                              <div key={c.id} className="p-2.5 rounded-lg bg-card border border-border/40 text-xs space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold text-foreground">
                                    {c.user?.name || 'Anonymous User'}
                                  </span>
                                  <span className="text-[10px] text-muted-foreground">
                                    {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <p className="text-muted-foreground leading-normal">{c.content}</p>
                              </div>
                            ))
                          )}
                        </div>

                        {user ? (
                          <div className="flex items-center gap-2 pt-1">
                            <Input
                              placeholder="Write a comment..."
                              value={commentInput[post.id] || ''}
                              onChange={(e) =>
                                setCommentInput((prev) => ({ ...prev, [post.id]: e.target.value }))
                              }
                              className="text-xs h-9 bg-card"
                            />
                            <Button
                              size="sm"
                              onClick={() => handleAddComment(post.id)}
                              disabled={commentLoading[post.id]}
                              className="h-9 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              <Send className="size-3.5" />
                            </Button>
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">Sign in to write comments.</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </main>

      {/* Create Post Modal */}
      <MuiModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Community Post"
        maxWidth="sm"
      >
        <form onSubmit={handleCreatePost} className="space-y-4 py-1">
          <div className="space-y-1.5">
            <Label htmlFor="post-title">Post Title</Label>
            <Input
              id="post-title"
              placeholder="e.g. Flood Relief Update in Feni District"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
              className="text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="post-body">Content / Message</Label>
            <Textarea
              id="post-body"
              placeholder="Share news, emergency updates, or field reports..."
              value={newBody}
              onChange={(e) => setNewBody(e.target.value)}
              required
              className="text-xs min-h-[120px]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/50">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCreateModalOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={createLoading}
              className="gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {createLoading ? 'Publishing...' : 'Publish Post'}
            </Button>
          </div>
        </form>
      </MuiModal>
    </div>
  );
}
