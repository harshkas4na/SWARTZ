// types/index.ts
export interface Post {
  id: string;
  username: string;
  userProfileImage: string;
  title: string;
  description: string;
  image?: string;
  comments: Comment[];
  isFollowingAuthor: boolean;
  isBlurred?: boolean;
}

export interface Comment {
  username: string;
  content: string;
}

  export interface Proposal {
    id: number;
    subgroupId: string;
    proposer: string;
    description: string;
    votesFor: number;
    votesAgainst: number;
    voteThreshold: number;
    executed: boolean;
    deadline: number;
  }
export interface Subgroup {
  id: string;
  name: string;
  subscriberCount: number;
  posts: number[];
}

