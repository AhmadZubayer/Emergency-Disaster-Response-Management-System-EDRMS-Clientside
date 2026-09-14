'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, MessageSquarePlus } from 'lucide-react';
import Navbar from '@/components/navbar';
import SearchBar from '@/components/searchbar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  const [sortOption, setSortOption] = useState('desc');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fetchPosts = useCallback(async (search?: string, sortVal: string = 'desc') => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (search?.trim()) {
        params.append('search', search.trim());
      }

      if (sortVal === 'asc' || sortVal === 'desc') {
        params.append('sort', sortVal);
      }

      const queryString = params.toString();
      const url = queryString ? `/community-posts?${queryString}` : '/community-posts';

      const res = await publicApi.get(url);
      const rawData = res.data?.data || res.data || [];
      let list: CommunityPost[] = Array.isArray(rawData) ? rawData : [];

      if (sortVal === 'posted_by_you') {
        list = list.filter(
          (p) =>
            (user?.id && p.author_id === user.id) ||
            (user?.name && p.postedBy?.name === user.name)
        );
      } else if (sortVal === 'posted_by_volunteers') {
        list = list.filter(
          (p) => p.postedBy?.role?.toLowerCase() === 'volunteer'
        );
      } else if (sortVal === 'posted_by_relief_org') {
        list = list.filter(
          (p) =>
            p.postedBy?.role?.toLowerCase() === 'relief_org' ||
            p.postedBy?.role?.toLowerCase() === 'organization'
        );
      } else if (sortVal === 'posted_by_admin') {
        list = list.filter(
          (p) => p.postedBy?.role?.toLowerCase() === 'admin'
        );
      }

      setPosts(list);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPosts(searchQuery, sortOption);
  }, [fetchPosts, sortOption]);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    fetchPosts(val, sortOption);
  };

  const handleSortChange = (val: string | null) => {
    if (!val) return;
    setSortOption(val);
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
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-3.5 rounded-lg border border-border">
            <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <Select
                value={sortOption}
                onValueChange={handleSortChange}
              >
                <SelectTrigger className="w-full sm:w-[175px] h-9 shrink-0 bg-background text-xs">
                  <SelectValue placeholder="Sort / Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Descending</SelectItem>
                  <SelectItem value="asc">Ascending</SelectItem>
                  <SelectItem value="posted_by_you">Posted by You</SelectItem>
                  <SelectItem value="posted_by_volunteers">Posted by Volunteers</SelectItem>
                  <SelectItem value="posted_by_relief_org">Posted by Relief Org</SelectItem>
                  <SelectItem value="posted_by_admin">Posted by Admin</SelectItem>
                </SelectContent>
              </Select>

              <SearchBar
                value={searchQuery}
                onChange={handleSearchChange}
                onSubmit={() => fetchPosts(searchQuery, sortOption)}
                placeholder="Search community posts..."
                className="flex-1"
                inputClassName="w-full sm:w-full focus:w-full sm:focus:w-full"
              />
            </div>

            <Button
              onClick={handleOpenDrawer}
              size="default"
              className="shrink-0"
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
                    className="p-4 rounded-lg border border-border bg-card space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <Skeleton className="size-9 rounded-full" />
                      <div className="space-y-1.5 flex-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-16 w-full rounded-lg" />
                    <div className="flex items-center gap-4 pt-1">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="py-16 text-center space-y-3 rounded-lg border border-dashed border-border bg-card p-4">
                <MessageSquarePlus className="size-10 text-muted-foreground/60 mx-auto" />
                <h3 className="text-sm font-medium text-foreground">
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
                  className="mt-2"
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
                  onPostUpdated={() => fetchPosts(searchQuery, sortOption)}
                />
              ))
            )}
          </div>
        </div>
      </main>

      <AddCommunityPostDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        onSuccess={() => fetchPosts(searchQuery, sortOption)}
      />
    </div>
  );
};

export default CommunityPage;
