'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, MessageSquarePlus } from 'lucide-react';
import Navbar from '@/components/navbar';
import Search from '@/components/Search';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import useAuth from '@/hooks/use-auth';
import { publicApi } from '@/lib/api';
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

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    fetchPosts(val);
  };

  const handleOpenDrawer = () => {
    if (!user) {
      router.push('/sign-in?returnUrl=/community');
      return;
    }
    setIsDrawerOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="w-full md:w-[65%] max-w-3xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-3.5 rounded-2xl border border-border/70 shadow-sm">
            <Search
              value={searchQuery}
              onChange={handleSearchChange}
              onSubmit={() => fetchPosts(searchQuery)}
              placeholder="Search community posts..."
              className="flex-1"
              inputClassName="w-full sm:w-full focus:w-full sm:focus:w-full"
            />

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
                    className="p-6 rounded-2xl border border-border/60 bg-card shadow-sm space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-full bg-muted/70" />
                      <Skeleton className="size-10 rounded-full" />
                      <div className="space-y-1.5 flex-1">
                        <div className="h-3 w-32 bg-muted/70 rounded" />
                        <div className="h-2.5 w-20 bg-muted/50 rounded" />
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                    <div className="h-4 w-3/4 bg-muted/70 rounded" />
                    <div className="h-16 bg-muted/40 rounded-xl" />
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-16 w-full rounded-xl" />
                    <div className="flex items-center gap-4 pt-1">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-20" />
                    </div>
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
