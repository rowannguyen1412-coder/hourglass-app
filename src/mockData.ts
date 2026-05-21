import { UserProfile, MarketplacePost, Transaction } from './types';

export const initialProfile: UserProfile = {
  name: "Alex Rivera",
  grade: "Grade 11",
  balance: 3.5, // Starts with 3.5 Hourglass Credits
  strengths: ["Math (Algebra/Calculus)", "Chemistry"],
  needs: ["Physics (Waves)", "History Essay Review"]
};

export const initialPosts: MarketplacePost[] = [
  {
    id: "post-1",
    studentName: "Chloe Zhang",
    subject: "Grade 11 Physics: Kinematics",
    tier: "Standard",
    cost: 1.0,
    type: "Request",
    description: "Struggling with projectile motion equations. Need someone to go over the practice test with me before Friday!"
  },
  {
    id: "post-2",
    studentName: "Marcus Vance",
    subject: "AP Calculus: Derivatives",
    tier: "Advanced",
    cost: 1.5,
    type: "Offer",
    description: "Apped the midterm! I can teach tricks for chain rule and optimization problems. Standard rules apply but pushing for advanced tier depth."
  },
  {
    id: "post-3",
    studentName: "Jordan Taylor",
    subject: "Grade 12 English: Essay Structure",
    tier: "Standard",
    cost: 1.0,
    type: "Request",
    description: "Need help organizing my thesis statement and body paragraphs for the Hamlet essay assignment."
  },
  {
    id: "post-4",
    studentName: "Sarah Ahmed",
    subject: "Grade 11 Chemistry: Stoichiometry",
    tier: "Standard",
    cost: 1.0,
    type: "Offer",
    description: "I love balancing equations! Happy to help anyone map out mole conversions and limiting reactant problems."
  }
];

export const initialTransactions: Transaction[] = [
  {
    id: "tx-1",
    type: "earn",
    amount: 1.0,
    subject: "Algebra 2 Foundations",
    peerName: "Leo Cooper",
    timestamp: "2 hours ago"
  },
  {
    id: "tx-2",
    type: "spend",
    amount: 1.5,
    subject: "US History Review Session",
    peerName: "Emily Blunt",
    timestamp: "Yesterday"
  }
];