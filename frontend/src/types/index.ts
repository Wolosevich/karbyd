export interface User {
  id: string;
  email?: string;
  username: string;
  avatar?: string | null;
  bio?: string | null;
  createdAt?: string;
  _count?: {
    posts?: number;
    followers: number;
    following: number;
  };
}

export interface Post {
  id: string;
  text: string;
  image?: string | null;
  authorId: string;
  author: Pick<User, "id" | "username" | "avatar">;
  createdAt: string;
  updatedAt: string;
  _count?: {
    likes: number;
    comments: number;
  };
  comments?: Comment[];
}

export interface Comment {
  id: string;
  text: string;
  authorId: string;
  postId: string;
  author: Pick<User, "id" | "username" | "avatar">;
  createdAt: string;
}

export interface FeedResponse {
  items: Post[];
  nextCursor: string | null;
}
export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  read: boolean;
  createdAt: string;
  sender: Pick<User, 'id' | 'username' | 'avatar'>;
}

export interface Dialog {
  user: Pick<User, 'id' | 'username' | 'avatar'>;
  lastMessage: Message;
  unreadCount: number;
}

export interface DialogsResponse {
  items: Dialog[];
}

export interface ChatResponse {
  user: Pick<User, 'id' | 'username' | 'avatar'>;
  messages: Message[];
}