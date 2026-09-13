'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  MessageSquare,
  Filter,
  ChevronLeft,
  ChevronRight,
  Trash2,
  RotateCcw,
  CheckCircle2,
  Eye,
  AlertOctagon,
  EyeOff,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import useAxiosSecure from '@/app/hooks/useAxiosSecure';

interface CommunityPostRecord {
  id: string;
  title?: string;
  content: string;
  status: 'posted' | 'hidden' | 'flagged' | 'removed' | string;
  author_id?: string;
  created_at: string;
  deleted_at?: string | null;
}

export default function AdminCommunityPostsPage() {
  const axiosSecure = useAxiosSecure();
  const [posts, setPosts] = useState<CommunityPostRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [includeDeleted, setIncludeDeleted] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);

  // Moderation Modal
  const [selectedPost, setSelectedPost] = useState<CommunityPostRecord | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [updating, setUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {
        page,
        limit: 10,
        includeDeleted,
      };
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      const res = await axiosSecure.get('/admin/community-posts', { params });
      const responseData = res.data?.data || res.data;

      if (responseData?.data) {
        setPosts(responseData.data);
        setTotalPages(responseData.meta?.totalPages || 1);
        setTotal(responseData.meta?.total || responseData.data.length);
      } else if (Array.isArray(responseData)) {
        setPosts(responseData);
        setTotalPages(1);
        setTotal(responseData.length);
      }
    } catch (error) {
      console.error('Failed to fetch community posts:', error);
    } finally {
      setLoading(false);
    }
  }, [axiosSecure, page, statusFilter, includeDeleted]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleModerate = async () => {
    if (!selectedPost || !newStatus) return;
    setUpdating(true);
    try {
      await axiosSecure.patch(`/admin/community-posts/${selectedPost.id}/status`, {
        status: newStatus,
      });
      setSuccessMsg(`Post status updated to ${newStatus.toUpperCase()}`);
      setSelectedPost(null);
      fetchPosts();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (error) {
      console.error('Failed to moderate community post:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleSoftDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to soft delete this community post?')) return;
    try {
      await axiosSecure.delete(`/admin/community-posts/${postId}`);
      setSuccessMsg('Community post soft deleted successfully.');
      fetchPosts();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (error) {
      console.error('Failed to soft delete community post:', error);
    }
  };

  const handleRestore = async (postId: string) => {
    try {
      await axiosSecure.patch(`/admin/community-posts/${postId}/restore`);
      setSuccessMsg('Community post restored successfully.');
      fetchPosts();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (error) {
      console.error('Failed to restore community post:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase();
    switch (s) {
      case 'posted':
        return (
          <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-300 font-semibold">
            Posted
          </Badge>
        );
      case 'hidden':
        return (
          <Badge variant="secondary" className="gap-1 font-semibold">
            <EyeOff className="size-3" />
            <span>Hidden</span>
          </Badge>
        );
      case 'flagged':
        return (
          <Badge variant="destructive" className="gap-1 font-semibold">
            <AlertOctagon className="size-3" />
            <span>Flagged</span>
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="font-semibold uppercase">
            {s}
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border/60 p-6 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquare className="size-6 text-teal-600" />
            <h1 className="text-2xl font-bold text-foreground">Community Post Moderation</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Moderate community discussions, hide or remove flagged content.
          </p>
        </div>
        <Badge variant="secondary" className="self-start sm:self-auto text-xs px-3 py-1 font-semibold">
          Total: {total} Posts
        </Badge>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-sm font-semibold">
          <CheckCircle2 className="size-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <Card className="border-border/60">
        <CardHeader className="p-4 sm:p-6 pb-2">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Filter className="size-4 text-muted-foreground" />
              <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="h-9 text-xs rounded-md border border-input bg-background px-3 font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">All Posts</option>
                <option value="posted">Posted</option>
                <option value="flagged">Flagged</option>
                <option value="hidden">Hidden</option>
                <option value="removed">Removed</option>
              </select>
            </div>

            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer text-muted-foreground hover:text-foreground">
              <input
                type="checkbox"
                checked={includeDeleted}
                onChange={(e) => {
                  setIncludeDeleted(e.target.checked);
                  setPage(1);
                }}
                className="rounded border-input text-emerald-600 focus:ring-emerald-500 size-4"
              />
              <span>Include Deleted</span>
            </label>
          </div>
        </CardHeader>

        <CardContent className="p-0 sm:p-6 pt-4">
          <div className="overflow-x-auto border-t sm:border border-border/40 sm:rounded-xl">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-muted/50 border-b border-border/60 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="p-3.5">Post Content</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Created Date</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-muted-foreground font-medium">
                      Loading community posts...
                    </td>
                  </tr>
                ) : posts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-muted-foreground font-medium">
                      No posts found.
                    </td>
                  </tr>
                ) : (
                  posts.map((post) => {
                    const isDeleted = !!post.deleted_at;
                    return (
                      <tr
                        key={post.id}
                        className={`hover:bg-muted/30 transition-colors ${
                          isDeleted ? 'opacity-60 bg-red-500/5' : ''
                        }`}
                      >
                        <td className="p-3.5 font-medium text-foreground max-w-md">
                          {post.title && <div className="font-bold text-sm mb-0.5">{post.title}</div>}
                          <p className="line-clamp-2 text-xs text-muted-foreground">{post.content}</p>
                        </td>
                        <td className="p-3.5">{getStatusBadge(post.status)}</td>
                        <td className="p-3.5 text-xs text-muted-foreground">
                          {new Date(post.created_at).toLocaleString()}
                        </td>
                        <td className="p-3.5 text-right space-x-2">
                          {!isDeleted ? (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 gap-1 text-xs font-semibold"
                                onClick={() => {
                                  setSelectedPost(post);
                                  setNewStatus(post.status);
                                }}
                              >
                                <Eye className="size-3.5 text-teal-600" />
                                <span>Moderate</span>
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="h-8 gap-1 text-xs font-semibold"
                                onClick={() => handleSoftDelete(post.id)}
                              >
                                <Trash2 className="size-3.5" />
                                <span>Delete</span>
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 gap-1 text-xs font-semibold border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10"
                              onClick={() => handleRestore(post.id)}
                            >
                              <RotateCcw className="size-3.5" />
                              <span>Restore</span>
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between p-4 border-t border-border/40 mt-4">
            <span className="text-xs text-muted-foreground font-medium">
              Page {page} of {totalPages} ({total} Total)
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="h-8 text-xs font-semibold gap-1"
              >
                <ChevronLeft className="size-3.5" />
                <span>Prev</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                className="h-8 text-xs font-semibold gap-1"
              >
                <span>Next</span>
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Moderation Modal */}
      {selectedPost && (
        <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageSquare className="size-5 text-teal-600" />
                <span>Moderate Community Post</span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-3 text-sm">
              <div className="p-3 rounded-lg bg-background border border-border/60 text-xs text-foreground max-h-40 overflow-y-auto">
                {selectedPost.title && <div className="font-bold text-sm mb-1">{selectedPost.title}</div>}
                <p>{selectedPost.content}</p>
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                  Update Moderation Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="posted">Posted (Visible)</option>
                  <option value="flagged">Flagged for Review</option>
                  <option value="hidden">Hidden</option>
                  <option value="removed">Removed</option>
                </select>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setSelectedPost(null)}>
                Cancel
              </Button>
              <Button onClick={handleModerate} disabled={updating} className="bg-teal-600 hover:bg-teal-500">
                {updating ? 'Saving...' : 'Update Status'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
