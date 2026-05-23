export interface UserProfile {
  email: string;
  name: string;
  grade: string;
  balance: number;
  strengths: string[];
  needs: string[];
}

export interface MarketplacePost {
  id: string;
  creatorEmail: string;
  studentName: string;
  subject: string;
  tier: 'Standard' | 'Advanced';
  cost: number;
  type: 'Offer' | 'Request';
  description: string;
  // --- NEW COMPLEX DEAL PARAMETERS ---
  lessonContent: string;
  maxStudents: number;
  timeLengthMinutes: number;
  scheduledDay: string;
  status: 'pending' | 'confirmed';
  acceptedByEmail?: string; // Tracks who joined or who requested to learn/teach
  acceptedByName?: string;
}

export interface Transaction {
  id: string;
  type: 'earn' | 'spend';
  amount: number;
  subject: string;
  peerName: string;
  timestamp: string;
}

export interface EscrowSession {
  id: string;
  postId: string;
  tutorName: string;
  learnerName: string;
  subject: string;
  cost: number;
  durationSeconds: number;
  status: 'active' | 'completed_pending_review';
}

// System notification blueprint for multi-user coordination simulation
export interface AppNotification {
  id: string;
  message: string;
  type: 'alert' | 'success' | 'request';
  timestamp: string;
  associatedPostId?: string;
}