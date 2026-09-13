'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, MessageSquarePlus, AlertCircle } from 'lucide-react';
import Navbar from '@/components/navbar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import useAuth from '@/app/hooks/useAuth';
import { publicApi } from '@/app/lib/public-api';
import { CommunityPost } from '@/components/community/types';
import CommunityPostCard from '@/components/community/community-post-card';
import AddCommunityPostDrawer from '@/components/community/add-community-post-drawer';

const CommunityPage = () => {
  const router = useRouter();
  const { user } = useAuth();

  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fetchPosts = useCallback(async (search?: string) => {
    try {
      setLoading(true);
      const url = search?.trim()
        ? `/community-posts?search=${encodeURIComponent(search.trim())}`
        : '/community-posts';
      const res = await publicApi.get(url);
      const data = res.data?.data || res.data || [];
      setPosts(Array.isArray(data) ? data : []);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPosts(searchQuery);
  };

  const handleOpenDrawer = () => {
    if (!user) {
      router.push('/sign-in');
      return;
    }
    setIsDrawerOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="w-full md:w-[65%] max-w-3xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-card p-3.5 rounded-2xl border border-border/70 shadow-sm">
            <form
              onSubmit={handleSearchSubmit}
              className="relative flex-1"
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search community posts, topics, or updates..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value === '') {
                    fetchPosts('');
                  }
                }}
                className="pl-9 h-10 text-xs bg-muted/20 rounded-xl"
              />
            </form>

            <Button
              onClick={handleOpenDrawer}
              size="default"
              className="gap-2 text-xs font-semibold shrink-0 rounded-xl"
            >
              <Plus className="size-4" />
              <span>Make a post</span>
            </Button>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="p-6 rounded-2xl border border-border/60 bg-card/60 shadow-sm space-y-3 animate-pulse"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-full bg-muted/70" />
                      <div className="space-y-1.5 flex-1">
                        <div className="h-3 w-32 bg-muted/70 rounded" />
                        <div className="h-2.5 w-20 bg-muted/50 rounded" />
                      </div>
                    </div>
                    <div className="h-4 w-3/4 bg-muted/70 rounded" />
                    <div className="h-16 bg-muted/40 rounded-xl" />
                  </div>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="py-16 text-center space-y-3 rounded-2xl border border-dashed border-border/80 bg-card/40 p-8">
                <MessageSquarePlus className="size-10 text-muted-foreground/60 mx-auto" />
                <h3 className="text-base font-bold text-foreground">
                  No community posts found
                </h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  {searchQuery
                    ? `No updates matching "${searchQuery}". Try a different keyword.`
                    : 'Be the first to share an update, field report, or emergency announcement.'}
                </p>
                <Button
                  onClick={handleOpenDrawer}
                  variant="outline"
                  size="sm"
                  className="mt-2 text-xs font-semibold gap-1.5"
                >
                  <Plus className="size-3.5" />
                  Make a post
                </Button>
              </div>
            ) : (
              posts.map((post) => (
                <CommunityPostCard
                  key={post.postId}
                  post={post}
                  onPostUpdated={() => fetchPosts(searchQuery)}
                />
              ))
            )}
          </div>
        </div>
      </main>

      <AddCommunityPostDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        onSuccess={() => fetchPosts(searchQuery)}
      />
    </div>
  );
};

export default CommunityPage;
