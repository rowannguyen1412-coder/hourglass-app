import { UserProfile, MarketplacePost, Transaction } from './types';

export const systemUsers: UserProfile[] = [
  {
    email: "alex@school.edu",
    name: "Alex Rivera",
    grade: "Grade 11",
    balance: 3.5,
    strengths: ["Math (Algebra/Calculus)", "Chemistry"],
    needs: ["Physics (Waves)", "History Essay Review"]
  },
  {
    email: "chloe@school.edu",
    name: "Chloe Zhang",
    grade: "Grade 11",
    balance: 5.0,
    strengths: ["Physics (Kinematics)", "English Lit"],
    needs: ["Math (Calculus)"]
  }
];

export const initialPosts: MarketplacePost[] = [
  {
    id: "post-1",
    creatorEmail: "chloe@school.edu",
    studentName: "Chloe Zhang",
    subject: "Grade 11 Physics: Kinematics",
    tier: "Standard",
    cost: 1.0,
    type: "Request",
    description: "Struggling with projectile motion equations. Need someone to go over the practice test with me before Friday!",
    lessonContent: "Deriving kinematic positions and acceleration charts",
    maxStudents: 1,
    timeLengthMinutes: 60,
    scheduledDay: "Friday afternoon",
    status: "confirmed"
  },
  {
    id: "post-2",
    creatorEmail: "marcus@school.edu",
    studentName: "Marcus Vance",
    subject: "AP Calculus: Derivatives",
    tier: "Advanced",
    cost: 1.5,
    type: "Offer",
    description: "Aced the midterm! I can teach tricks for chain rule and optimization problems.",
    lessonContent: "Chain Rule shortcuts and optimization problem structures",
    maxStudents: 3,
    timeLengthMinutes: 45,
    scheduledDay: "Saturday Morning",
    status: "confirmed"
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
  }
];