export interface FavoritePost {
  favorite_post_id: string;
  user_id: string;
  post_id: string;
  created_at: string;
}

export interface FavoritePostResponse {
  success: boolean;
  message: string;
  data: FavoritePost;
}