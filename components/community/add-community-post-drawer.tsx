'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Upload, X, AlertCircle } from 'lucide-react';
import MuiDrawer from '@/components/mui-drawer';
import ModernButton from '@/components/modernBtn';
import { toast } from '@/components/ui/toast';
import { axiosSecure } from '@/lib/api';
import { communityPostSchema } from '@/lib/validations/community-post-schema';
import { CommunityPost } from './types';

interface AddCommunityPostDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  postToEdit?: CommunityPost | null;
}

const AddCommunityPostDrawer = ({
  open,
  onOpenChange,
  onSuccess,
  postToEdit,
}: AddCommunityPostDrawerProps) => {
  const isEditing = Boolean(postToEdit);

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [existingMedia, setExistingMedia] = useState<string[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

  useEffect(() => {
    if (open) {
      if (postToEdit) {
        setTitle(postToEdit.title || '');
        setBody(postToEdit.body || '');
        setExistingMedia(postToEdit.media_urls || []);
      } else {
        setTitle('');
        setBody('');
        setExistingMedia([]);
      }
      setSelectedFiles([]);
      setFilePreviews([]);
      setErrors({});
      setServerError('');
    }
  }, [open, postToEdit]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArr = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArr]);
      const newPreviews = filesArr.map((f) => URL.createObjectURL(f));
      setFilePreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingMedia = (index: number) => {
    setExistingMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setTitle('');
    setBody('');
    setSelectedFiles([]);
    setFilePreviews([]);
    setExistingMedia([]);
    setErrors({});
    setServerError('');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setServerError('');

    const result = communityPostSchema.safeParse({ title, body });
    if (!result.success) {
      const errMap: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          errMap[issue.path[0] as string] = issue.message;
        }
      });
      setErrors(errMap);
      return;
    }

    try {
      setLoading(true);

      if (isEditing && postToEdit) {
        if (selectedFiles.length > 0) {
          const formData = new FormData();
          formData.append('title', title.trim());
          formData.append('body', body.trim());
          selectedFiles.forEach((file) => {
            formData.append('files', file);
          });
          await axiosSecure.patch(`/community-posts/${postToEdit.postId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        } else {
          await axiosSecure.patch(`/community-posts/${postToEdit.postId}`, {
            title: title.trim(),
            body: body.trim(),
          });
        }

        toast.add({
          id: 'post-updated-success',
          title: 'Community post updated successfully!',
          type: 'success',
          timeout: 4000,
        });
      } else {
        const formData = new FormData();
        formData.append('title', title.trim());
        formData.append('body', body.trim());

        selectedFiles.forEach((file) => {
          formData.append('files', file);
        });

        await axiosSecure.post('/community-posts', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        toast.add({
          id: 'post-created-success',
          title: 'Community post published successfully!',
          type: 'success',
          timeout: 4000,
        });
      }

      resetForm();
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      setServerError(
        err?.response?.data?.message ||
          (isEditing
            ? 'Failed to update post. Please try again.'
            : 'Failed to publish post. Please try again.')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <MuiDrawer
      open={open}
      onClose={() => onOpenChange(false)}
      title={isEditing ? 'Edit Community Post' : 'Create Community Post'}
      subtitle={
        isEditing
          ? 'Update your discussion, report, or announcement'
          : 'Share updates, emergency notices, or field stories'
      }
      width={460}
      anchor="right"
    >
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between p-5">
        <div className="space-y-4">
          {serverError && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <div className="space-y-1">
            <Label htmlFor="community-post-title">Post Title</Label>
            <Input
              id="community-post-title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
              }}
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? 'community-post-title-error' : undefined}
            />
            {errors.title && <p id="community-post-title-error" className="text-xs text-destructive">{errors.title}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="community-post-description">Description</Label>
            <Textarea
              id="community-post-description"
              rows={4}
              value={body}
              onChange={(e) => {
                setBody(e.target.value);
                if (errors.body) setErrors((prev) => ({ ...prev, body: '' }));
              }}
              aria-invalid={!!errors.body}
              aria-describedby={errors.body ? 'community-post-description-error' : undefined}
            />
            {errors.body && <p id="community-post-description-error" className="text-xs text-destructive">{errors.body}</p>}
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-medium text-foreground block">
              Attach Photos / Media
            </span>

            <label className="border-2 border-dashed border-border hover:border-primary rounded-lg p-3.5 flex flex-col items-center justify-center gap-1 cursor-pointer bg-muted hover:bg-primary/30 transition-colors">
              <Upload className="size-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">
                Click to upload images
              </span>
              <span className="text-xs text-muted-foreground">
                JPEG, PNG, MP4 supported
              </span>
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>

            {existingMedia.length > 0 && (
              <div className="space-y-1 pt-1">
                <span className="text-[11px] text-muted-foreground block">Current Media</span>
                <div className="grid grid-cols-3 gap-2">
                  {existingMedia.map((url, idx) => {
                    const fullUrl = url.startsWith('http') ? url : `${backendUrl}${url}`;
                    return (
                      <div
                        key={idx}
                        className="relative rounded-lg overflow-hidden border border-border aspect-square group"
                      >
                        <img
                          src={fullUrl}
                          alt={`Existing preview ${idx + 1}`}
                          className="size-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingMedia(idx)}
                          className="absolute top-1 right-1 size-5 rounded-full bg-black/70 text-white flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity"
                        >
                          <X className="size-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {filePreviews.length > 0 && (
              <div className="space-y-1 pt-1">
                <span className="text-[11px] text-muted-foreground block">New Media</span>
                <div className="grid grid-cols-3 gap-2">
                  {filePreviews.map((previewUrl, idx) => (
                    <div
                      key={idx}
                      className="relative rounded-lg overflow-hidden border border-border aspect-square group"
                    >
                      <img
                        src={previewUrl}
                        alt={`Upload preview ${idx + 1}`}
                        className="size-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="absolute top-1 right-1 size-5 rounded-full bg-black/70 text-white flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="pt-5 flex justify-center">
          <ModernButton type="submit" disabled={loading}>
            {loading ? (isEditing ? 'Updating...' : 'Posting...') : (isEditing ? 'Update' : 'Post')}
          </ModernButton>
        </div>
      </form>
    </MuiDrawer>
  );
};

export default AddCommunityPostDrawer;
