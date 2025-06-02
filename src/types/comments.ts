export type ReactionType = "like" | "heart" | "smile" | "wow" | "angry" | "sad";

export interface Reaction {
  type: ReactionType;
  userId: string;
  timestamp: Date;
}

export interface Reply {
  id: string;
  userId: string;
  text: string;
  timestamp: Date;
  reactions: Reaction[];
}

export interface Comment {
  id: string;
  userId: string;
  text: string;
  timestamp: Date;
  reactions: Reaction[];
  replies: Reply[];
}