'use client';

import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import { Upload, X, AlertCircle } from 'lucide-react';
import MuiDrawer from '@/components/mui-drawer';
import ModernButton from '@/components/modernBtn';
import { toast } from '@/components/ui/toast';
import useAxiosSecure from '@/app/hooks/useAxiosSecure';
import { communityPostSchema } from '@/app/lib/validations/community-post-schema';

interface AddCommunityPostDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const fieldSx = {
  '& .MuiInputLabel-root': {
    fontSize: '0.8125rem',
    color: '#64748b',
    '&.Mui-focused': {
      color: '#059669',
    },
  },
  '& .MuiFilledInput-root': {
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderRadius: '10px',
    fontSize: '0.8125rem',
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.05)',
    },
    '&.Mui-focused': {
      backgroundColor: 'rgba(0, 0, 0, 0.05)',
    },
    '&:after': {
      borderBottomColor: '#059669',
    },
  },
  '& .MuiFormHelperText-root': {
    fontSize: '0.75rem',
  },
};

const AddCommunityPostDrawer = ({
  open,
  onOpenChange,
  onSuccess,
}: AddCommunityPostDrawerProps) => {
  const axiosSecure = useAxiosSecure();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

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

  const resetForm = () => {
    setTitle('');
    setBody('');
    setSelectedFiles([]);
    setFilePreviews([]);
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
        timeout: 5000,
      });

      resetForm();
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      setServerError(
        err?.response?.data?.message || 'Failed to publish post. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <MuiDrawer
      open={open}
      onClose={() => onOpenChange(false)}
      title="Create Community Post"
      subtitle="Share updates, emergency notices, or field stories"
      width={460}
      anchor="right"
    >
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between p-5">
        <div className="space-y-4">
          {serverError && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <div className="space-y-1">
            <TextField
              id="filled-basic"
              label="Post Title"
              variant="filled"
              fullWidth
              size="small"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
              }}
              error={!!errors.title}
              helperText={errors.title}
              sx={fieldSx}
            />
          </div>

          <div className="space-y-1">
            <TextField
              id="filled-basic"
              label="Description"
              variant="filled"
              multiline
              rows={4}
              fullWidth
              size="small"
              value={body}
              onChange={(e) => {
                setBody(e.target.value);
                if (errors.body) setErrors((prev) => ({ ...prev, body: '' }));
              }}
              error={!!errors.body}
              helperText={errors.body}
              sx={fieldSx}
            />
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-neutral-700 block">
              Attach Photos / Media
            </span>

            <label className="border-2 border-dashed border-neutral-300 hover:border-emerald-500 rounded-xl p-3.5 flex flex-col items-center justify-center gap-1 cursor-pointer bg-neutral-50/50 hover:bg-emerald-50/30 transition-colors">
              <Upload className="size-4 text-neutral-400" />
              <span className="text-xs font-medium text-neutral-600">
                Click to upload images
              </span>
              <span className="text-[10px] text-neutral-400">
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

            {filePreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-2 pt-1.5">
                {filePreviews.map((previewUrl, idx) => (
                  <div
                    key={idx}
                    className="relative rounded-lg overflow-hidden border border-neutral-200 aspect-square group"
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
            )}
          </div>
        </div>

        <div className="pt-5 flex justify-center">
          <ModernButton type="submit" disabled={loading}>
            {loading ? 'Posting...' : 'Post'}
          </ModernButton>
        </div>
      </form>
    </MuiDrawer>
  );
};

export default AddCommunityPostDrawer;
