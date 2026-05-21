export type SkillTier = 'Standard' | 'Advanced';

export interface UserProfile {
  name: string;
  grade: string;
  balance: number; // In Hourglass Credits
  strengths: string[]; // Subjects they can teach
  needs: string[]; // Subjects they need help with
}

export interface MarketplacePost {
  id: string;
  studentName: string;
  subject: string;
  tier: SkillTier;
  cost: number; // 1.0 or 1.5 credits per hour
  type: 'Offer' | 'Request';
  description: string;
}

export interface Transaction {
  id: string;
  type: 'earn' | 'spend';
  amount: number;
  subject: string;
  peerName: string;
  timestamp: string;
}

export interface SessionReview {
  rating: number; // 1 to 5 stars
  comment: string;
}

// Track current active escrow sessions
export interface EscrowSession {
  id: string;
  postId: string;
  tutorName: string;
  learnerName: string;
  subject: string;
  cost: number;
  durationSeconds: number;
  status: 'active' | 'completed_pending_review' | 'finalized';
}