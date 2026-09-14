'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Plus, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import MuiModal from '@/components/mui-modal';
import { toast } from '@/components/ui/toast';
import useAuth from '@/hooks/use-auth';
import { axiosSecure, publicApi } from '@/lib/api';
import EditProfileDrawer, { UserProfileData } from '@/components/profile/edit-profile-drawer';
import { CommunityPost } from '@/components/community/types';
import AddCommunityPostDrawer from '@/components/community/add-community-post-drawer';
import DashboardFrame from '@/components/profile/dashboard-frame';
import { getApiErrorMessage } from '@/utils/api-error';
const formatTrashDate = (dateStr?: string) => {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};
const VolunteerCommunityPostsPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [myPosts, setMyPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [togglingSafety, setTogglingSafety] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [confirmTrashItem, setConfirmTrashItem] = useState<CommunityPost | null>(null);

  const fetchPageData = useCallback(async () => {
    try {
      const [profileResult, postsResult] = await Promise.allSettled([
        axiosSecure.get('/users/profile'),
        publicApi.get('/community-posts')
      ]);
      if (profileResult.status === 'fulfilled') {
        const data = profileResult.value.data?.data || profileResult.value.data;
        setProfile(data);
      } else {
        toast.add({
          id: 'posts-profile-error',
          title: 'Failed to load profile. Please try again.',
          type: 'error'
        });
      }
      if (postsResult.status === 'fulfilled') {
        const data = postsResult.value.data?.data || postsResult.value.data;
        const posts = Array.isArray(data) ? data : [];
        setMyPosts(posts.filter((post: CommunityPost & { author_id?: string; userId?: string }) => post.author_id === user?.id || post.userId === user?.id || post.postedBy?.name === user?.name));
      } else {
        toast.add({
          id: 'posts-posts-error',
          title: 'Failed to load posts. Please try again.',
          type: 'error'
        });
      }
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.name]);
  useEffect(() => {
    if (user) {
      fetchPageData();
    }
  }, [user, fetchPageData]);

  const handleToggleSafety = async () => {
    try {
      setTogglingSafety(true);
      await axiosSecure.patch('/users/is-safe');
      await fetchPageData();
    } catch (err) {
      toast.add({ id: 'safety-update-error', title: getApiErrorMessage(err, 'Failed to update safety status.'), type: 'error' });
    } finally {
      setTogglingSafety(false);
    }
  };

  const handleMoveToTrash = async () => {
    if (!confirmTrashItem) return;
    try {
      setActionInProgress('moving-to-trash');
      const url = `/community-posts/${confirmTrashItem.postId}`;
      await axiosSecure.delete(url);
      toast.add({
        id: `trash-success-${confirmTrashItem.postId}`,
        title: 'Item moved to trash.',
        type: 'success',
        timeout: 4000,
      });
      setConfirmTrashItem(null);
      await fetchPageData();
    } catch (err) {
      toast.add({
        id: 'trash-error',
        title: getApiErrorMessage(err, 'Failed to delete item'),
        type: 'error',
        timeout: 5000,
      });
    } finally {
      setActionInProgress(null);
    }
  };

  return (
    <>
      <DashboardFrame
        profile={profile}
        role="VOLUNTEER"
        tab="posts"
        loading={loading}
        togglingSafety={togglingSafety}
        onEdit={() => setIsEditOpen(true)}
        onToggleSafety={handleToggleSafety}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium">Your Community Posts</h3>
              <p className="text-xs text-muted-foreground">
                Discussions, field warnings, and informational updates you have posted.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => setIsCreatePostOpen(true)}

            >
              <Plus className="size-4" />
              Create Post
            </Button>
          </div>

          {myPosts.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-4 text-center bg-card space-y-3">
              <MessageSquare className="size-8 text-muted-foreground/60 mx-auto" />
              <p className="text-xs text-muted-foreground">
                You have not created any community posts yet.
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-border overflow-hidden bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Interactions</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myPosts.map((post) => (
                    <TableRow key={post.postId}>
                      <TableCell className="max-w-xs truncate">{post.title}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {post.CommunityResponse?.Reactions?.total || 0} reactions &bull; {post.CommunityResponse?.totalComments || 0} comments
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="uppercase">
                          {post.status}
                        </Badge>
                      </TableCell>
                      <TableCell >{formatTrashDate(post.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => router.push(`/community/${post.postId}`)}

                          >
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setConfirmTrashItem(post);

                            }}
                            className="text-destructive"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </DashboardFrame>
      {profile && (
        <EditProfileDrawer
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          profile={profile}
          onSuccess={fetchPageData}
        />
      )}
      <AddCommunityPostDrawer
        open={isCreatePostOpen}
        onOpenChange={setIsCreatePostOpen}
        onSuccess={fetchPageData}
      />
      <MuiModal
        open={!!confirmTrashItem}
        onClose={() => setConfirmTrashItem(null)}
        title="Move Item to Trash?"
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmTrashItem(null)}

            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleMoveToTrash}
              disabled={actionInProgress === 'moving-to-trash'}

            >
              <Trash2 className="size-3.5" />
              Move to Trash
            </Button>
          </>
        }
      >
        <p className="text-xs text-muted-foreground">
          Are you sure you want to delete{' '}
          <span className="font-medium text-foreground">
            {confirmTrashItem?.title}
          </span>
          ? This record will be moved to your Trash and can be restored within 30 days.
        </p>
      </MuiModal>
    </>
  );
};

export default VolunteerCommunityPostsPage;
