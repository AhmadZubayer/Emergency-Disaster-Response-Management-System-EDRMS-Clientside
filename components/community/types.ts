export interface PostAuthor {
  name: string | null;
  role: string;
  location?: string | null;
}

export interface ReactionCounts {
  total: number;
  like: number;
  dislike: number;
  sad: number;
  care: number;
}

export interface CommunityResponse {
  Reactions: ReactionCounts;
  totalComments: number;
}

export interface CommunityPost {
  postId: string;
  author_id?: string;
  postedBy: PostAuthor;
  created_at: string;
  updated_at?: string;
  bumped_at: string;
  title: string;
  body: string;
  media_urls: string[];
  status: 'POSTED' | 'ARCHIVED' | 'REMOVED';
  CommunityResponse: CommunityResponse;
}

export interface PostComment {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  postedBy: PostAuthor;
}
