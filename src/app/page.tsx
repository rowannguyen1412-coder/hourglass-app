'use client';

import { useState } from 'react';

// ==========================================
// INTERNAL TYPE DEFINITIONS (MATCHES TYPES.TS)
// ==========================================
interface UserProfile {
  name: string;
  email: string;
  grade: string;
  balance: number;
  strengths: string[];
  needs: string[];
}

interface MarketplacePost {
  id: string;
  studentName: string;
  creatorEmail: string;
  subject: string;
  tier: 'Standard' | 'Advanced';
  cost: number;
  type: 'Offer' | 'Request';
  description: string;
  duration: string;
  scheduledDay: string;
  status: 'open' | 'pending' | 'confirmed';
  acceptedByEmail?: string;
  acceptedByName?: string;
}

interface AppNotification {
  id: string;
  message: string;
  type: 'request' | 'alert';
  timestamp: string;
  associatedPostId: string;
  targetEmail: string;
}

interface Transaction {
  id: string;
  details: string;
  type: 'earn' | 'spend';
  amount: number;
  peer: string;
  timestamp: string;
}

const DEFAULT_TEST_ACCOUNT: UserProfile = {
  name: "Alex Rivera",
  email: "alex@school.edu",
  grade: "Grade 11",
  balance: 3.5,
  strengths: ["Advanced Math", "Chemistry Basics"],
  needs: ["Physics Basics", "History Review"]
};

const SUBJECT_OPTIONS = [
  "Advanced Math",
  "Coding",
  "Basic Photography",
  "Physics Basics",
  "Chemistry Basics",
  "History Review",
  "Guitar",
  "Public Speaking"
];

export default function HourglassDashboard() {
  // --- CORE SYSTEM STATES ---
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [feedFilter, setFeedFilter] = useState<'All' | 'Offer' | 'Request'>('All');

  // --- NEW LISTING FORM STATES ---
  const [postSubject, setPostSubject] = useState('');
  const [postTier, setPostTier] = useState<'Standard' | 'Advanced'>('Standard');
  const [postCost, setPostCost] = useState(1.0);
  const [postType, setPostType] = useState<'Offer' | 'Request'>('Offer');
  const [postDescription, setPostDescription] = useState('');
  const [postDuration, setPostDuration] = useState('60 Mins (Standard)');
  const [postSchedule, setPostSchedule] = useState('Monday afternoon');

  // --- MOCK DATABASE COLLECTIONS ---
  const [posts, setPosts] = useState<MarketplacePost[]>([
    {
      id: "post-1",
      studentName: "Chloe Zhang",
      creatorEmail: "chloe@school.edu",
      subject: "Physics Basics: Motion",
      tier: "Standard",
      cost: 1.0,
      type: "Request",
      description: "Struggling with speed and acceleration formulas. Need someone to go over the practice worksheet with me!",
      duration: "60 Mins (Standard)",
      scheduledDay: "Friday afternoon",
      status: "open"
    },
    {
      id: "post-2",
      studentName: "Marcus Vance",
      creatorEmail: "marcus@school.edu",
      subject: "Advanced Math: Derivatives",
      tier: "Advanced",
      cost: 1.5,
      type: "Offer",
      description: "I can teach quick rules for optimization problems. Clear examples provided.",
      duration: "60 Mins (Standard)",
      scheduledDay: "Monday afternoon",
      status: "open"
    }
  ]);

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [transactions] = useState<Transaction[]>([
    { id: "tx-1", details: "Basic Photography Setup", type: "earn", amount: 1.0, peer: "Leo Cooper", timestamp: "2 hours ago" },
    { id: "tx-2", details: "History Review Session", type: "spend", amount: 1.5, peer: "Emily Blunt", timestamp: "Yesterday" }
  ]);

  // --- SIGNUP FORM STATES ---
  const [signupEmail, setSignupEmail] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupGrade, setSignupGrade] = useState('Grade 11');
  const [signupStrengths, setSignupStrengths] = useState<string[]>([]);
  const [signupNeeds, setSignupNeeds] = useState<string[]>([]);

  const addStrength = (subject: string) => {
    if (subject && !signupStrengths.includes(subject)) {
      setSignupStrengths([...signupStrengths, subject]);
    }
  };

  const removeStrength = (subject: string) => {
    setSignupStrengths(signupStrengths.filter(s => s !== subject));
  };

  const addNeed = (subject: string) => {
    if (subject && !signupNeeds.includes(subject)) {
      setSignupNeeds([...signupNeeds, subject]);
    }
  };

  const removeNeed = (subject: string) => {
    setSignupNeeds(signupNeeds.filter(n => n !== subject));
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupEmail || !signupName) return;

    setCurrentUser({
      name: signupName,
      email: signupEmail,
      grade: signupGrade,
      balance: 5.0, 
      strengths: signupStrengths.length > 0 ? signupStrengths : ["Coding"],
      needs: signupNeeds.length > 0 ? signupNeeds : ["Advanced Math"]
    });
  };

  const processDealEngagement = (post: MarketplacePost) => {
    if (!currentUser) return;
    if (post.creatorEmail === currentUser.email) return;
    if (post.type === 'Offer' && currentUser.balance < post.cost) return;

    setPosts(posts.map(p => p.id === post.id ? { 
      ...p, 
      status: 'pending',
      acceptedByEmail: currentUser.email,
      acceptedByName: currentUser.name
    } : p));

    const targetedAnnouncement: AppNotification = {
      id: `notif-${Date.now()}`,
      message: `🔔 Match Proposal: ${currentUser.name} wants to confirm your "${post.subject}" exchange. Do you authorize this transaction?`,
      type: 'request',
      timestamp: 'Just now',
      associatedPostId: post.id,
      targetEmail: post.creatorEmail
    };

    setNotifications([targetedAnnouncement, ...notifications]);
  };

  const confirmPendingLesson = (postId: string) => {
    const targetPost = posts.find(p => p.id === postId);
    if (!targetPost || !currentUser) return;

    setPosts(posts.map(p => p.id === postId ? { ...p, status: 'confirmed' } : p));

    if (targetPost.type === 'Offer') {
      if (currentUser.email === targetPost.creatorEmail) {
        setCurrentUser((prev: UserProfile | null) => prev ? { ...prev, balance: prev.balance + targetPost.cost } : null);
      }
    }

    setNotifications(notifications.filter(n => n.associatedPostId !== postId));
    setIsNotifOpen(false);
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const newPost: MarketplacePost = {
      id: `post-${Date.now()}`,
      studentName: currentUser.name,
      creatorEmail: currentUser.email,
      subject: postSubject,
      tier: postTier,
      cost: postCost,
      type: postType,
      description: postDescription,
      duration: postDuration,
      scheduledDay: postSchedule,
      status: 'open'
    };

    setPosts([newPost, ...posts]);
    setIsCreateModalOpen(false);
    
    setPostSubject('');
    setPostDescription('');
  };

  const toggleActiveUserTestingFrame = () => {
    if (!currentUser) return;
    if (currentUser.email === DEFAULT_TEST_ACCOUNT.email) {
      setCurrentUser(JSON.parse(localStorage.getItem('hourglass_user_b') || '{}'));
    } else {
      localStorage.setItem('hourglass_user_b', JSON.stringify(currentUser));
      setCurrentUser(DEFAULT_TEST_ACCOUNT);
    }
  };

  // --- INITIAL SCREEN / SIGNUP VIEW FRAME ---
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-slate-100 font-sans">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl">
          
          <div className="flex items-center gap-3 mb-5">
            <img 
              src="/logo.png" 
              alt="Hourglass Logo" 
              className="w-12 h-12 rounded-xl object-cover shadow-lg border border-slate-800"
            />
            <div>
              <h1 className="text-xl font-black tracking-tight text-white">Welcome to Hourglass</h1>
              <p className="text-xs text-slate-400 font-medium">High School Peer Time-Banking Network</p>
            </div>
          </div>

          <form onSubmit={handleSignupSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">School Email Account</label>
              <input 
                type="email" 
                placeholder="you@school.edu" 
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-medium text-white placeholder-slate-600 focus:outline-none focus:border-teal-500 transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Full Name</label>
                <input 
                  type="text" 
                  placeholder="Your profile name" 
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-medium text-white placeholder-slate-600 focus:outline-none focus:border-teal-500 transition"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Grade Level</label>
                <select 
                  value={signupGrade}
                  onChange={(e) => setSignupGrade(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-medium text-white focus:outline-none focus:border-teal-500 transition"
                >
                  <option>Grade 9</option>
                  <option>Grade 10</option>
                  <option>Grade 11</option>
                  <option>Grade 12</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">My Strengths (Topics you can teach)</label>
              <select 
                value=""
                onChange={(e) => { addStrength(e.target.value); e.target.value = ""; }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-medium text-white focus:outline-none focus:border-teal-500 transition"
              >
                <option value="" disabled>-- Click a topic to add --</option>
                {SUBJECT_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              
              <div className="flex flex-wrap gap-1.5 mt-2 min-h-6">
                {signupStrengths.length === 0 ? (
                  <span className="text-[10px] text-slate-600 italic">No strengths selected yet</span>
                ) : (
                  signupStrengths.map(s => (
                    <span key={s} className="bg-teal-500/20 text-teal-300 border border-teal-500/30 px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1">
                      {s}
                      <button type="button" onClick={() => removeStrength(s)} className="text-rose-400 hover:text-rose-300 font-extrabold ml-1">×</button>
                    </span>
                  ))
                )}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">My Needs (Topics you want help with)</label>
              <select 
                value=""
                onChange={(e) => { addNeed(e.target.value); e.target.value = ""; }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-medium text-white focus:outline-none focus:border-teal-500 transition"
              >
                <option value="" disabled>-- Click a topic to add --</option>
                {SUBJECT_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>

              <div className="flex flex-wrap gap-1.5 mt-2 min-h-6">
                {signupNeeds.length === 0 ? (
                  <span className="text-[10px] text-slate-600 italic">No needs selected yet</span>
                ) : (
                  signupNeeds.map(n => (
                    <span key={n} className="bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1">
                      {n}
                      <button type="button" onClick={() => removeNeed(n)} className="text-rose-400 hover:text-rose-300 font-extrabold ml-1">×</button>
                    </span>
                  ))
                )}
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:brightness-110 text-slate-950 font-black text-xs p-3 rounded-xl transition shadow-lg active:scale-[0.98]"
            >
              Initialize Profile Session & Enter Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  const filteredPosts = posts.filter(p => feedFilter === 'All' || p.type === feedFilter);

  // --- MAIN DASHBOARD VIEW FRAME ---
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-teal-500/20 pb-12">
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img 
              src="/logo.png" 
              alt="Hourglass Logo" 
              className="w-9 h-9 rounded-lg object-cover border border-slate-200"
            />
            <div>
              <span className="font-black text-slate-950 tracking-tight text-base block">Hourglass</span>
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Credit Hub</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={toggleActiveUserTestingFrame}
              className="text-[10px] bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-800 font-bold px-2.5 py-1.5 rounded-xl transition"
            >
              🔄 Simulation Swap User Frame
            </button>

            <div className="relative">
              <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl relative transition"
              >
                <span>🔔</span>
                {notifications.filter(n => n.targetEmail === currentUser.email).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 w-2.5 h-2.5 rounded-full ring-2 ring-white animate-bounce" />
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-slate-900 border border-slate-800 shadow-2xl rounded-2xl p-4 text-xs z-50 text-slate-100 animate-in fade-in duration-150">
                  <h3 className="font-bold border-b border-slate-800 pb-2.5 mb-2.5 flex justify-between items-center">
                    <span className="flex items-center gap-1.5 font-black text-white">
                      <span className="text-teal-400">⏳</span> Real-Time Action Desk
                    </span>
                    <button onClick={() => setIsNotifOpen(false)} className="text-[10px] bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 px-2 py-0.5 rounded-md font-bold transition">Close</button>
                  </h3>
                  
                  <div className="space-y-2.5 max-h-64 overflow-y-auto pr-0.5">
                    {notifications.filter(n => n.targetEmail === currentUser.email).length === 0 ? (
                      <div className="text-center py-6 text-slate-500 italic">
                        No pending actions for your account.
                      </div>
                    ) : (
                      notifications
                        .filter(n => n.targetEmail === currentUser.email)
                        .map(notif => {
                          const targetPost = posts.find(p => p.id === notif.associatedPostId);

                          return (
                            <div key={notif.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col gap-2.5">
                              <p className="text-slate-300 leading-normal font-medium text-[11px]">{notif.message}</p>
                              <div className="flex justify-between items-center pt-2 border-t border-slate-800/60">
                                <span className="text-[9px] text-slate-500 font-mono">{notif.timestamp}</span>
                                {targetPost && (
                                  <button
                                    onClick={() => confirmPendingLesson(targetPost.id)}
                                    className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:brightness-110 text-slate-950 text-[10px] px-3 py-1.5 rounded-lg font-bold shadow-md transition duration-150 active:scale-95"
                                  >
                                    Authorize Match & Lock 🚀
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-slate-950 text-white rounded-xl px-3 py-1.5 flex items-center gap-2 border border-slate-800">
              <span className="text-teal-400 text-xs font-mono font-bold">💳</span>
              <div className="text-right">
                <span className="text-[9px] block uppercase font-bold tracking-wider text-slate-500 leading-none">Balance</span>
                <span className="text-xs font-black text-emerald-400 font-mono">{currentUser.balance.toFixed(1)} <span className="text-[10px] text-slate-400">Hrs</span></span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-8">
        {posts.some(p => p.status === 'confirmed' && (p.creatorEmail === currentUser.email || p.acceptedByEmail === currentUser.email)) && (
          <div className="w-full mb-6 bg-gradient-to-r from-teal-950 to-slate-950 border border-teal-500/30 rounded-2xl p-4 flex items-center justify-between shadow-xl">
            <div className="flex items-center gap-3">
              <div className="bg-teal-500/20 p-2.5 rounded-xl text-xl">🎉</div>
              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-wider">Ledger Lock Established</h4>
                <p className="text-[11px] text-slate-300 font-medium mt-0.5">
                  The mutual exchange loop is fully authorized! Your peer lesson is <span className="text-teal-400 font-bold">Ready & Starting Soon</span>.
                </p>
              </div>
            </div>
            <button 
              onClick={() => setPosts(posts.filter(p => p.status !== 'confirmed'))}
              className="text-[10px] bg-teal-500/10 text-teal-400 hover:bg-teal-500 hover:text-slate-950 font-bold px-3 py-1.5 rounded-xl transition"
            >
              Dismiss System Log
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md text-slate-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-black text-white text-sm border border-slate-700">
                  {currentUser.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="font-bold text-sm text-white">{currentUser.name}</h2>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">{currentUser.grade}</span>
                </div>
              </div>

              <div className="space-y-3.5 pt-3 border-t border-slate-800 text-[11px]">
                <div>
                  <span className="block font-bold uppercase text-slate-400 mb-1">My Strengths (Earns Time)</span>
                  <div className="flex flex-wrap gap-1">
                    {currentUser.strengths.map((s: string) => (
                      <span key={s} className="bg-teal-500/10 text-teal-300 border border-teal-500/20 px-2 py-0.5 rounded-md font-medium">{s}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="block font-bold uppercase text-slate-400 mb-1">My Needs (Spends Time)</span>
                  <div className="flex flex-wrap gap-1">
                    {currentUser.needs.map((n: string) => (
                      <span key={n} className="bg-rose-500/10 text-rose-300 border border-rose-500/20 px-2 py-0.5 rounded-md font-medium">{n}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <div className="flex justify-between items-center bg-white p-3 border border-slate-200/80 rounded-2xl shadow-xs">
              <div className="flex gap-1">
                {(['All', 'Offer', 'Request'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setFeedFilter(tab)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition ${feedFilter === tab ? 'bg-slate-950 text-white shadow-xs' : 'text-slate-500 hover:bg-slate-100'}`}
                  >
                    {tab === 'All' ? 'All Feed' : tab === 'Offer' ? 'Available Offers' : 'Help Requests'}
                  </button>
                ))}
              </div>

              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-teal-600 hover:bg-teal-500 text-white text-xs font-black px-3 py-2 rounded-xl transition flex items-center gap-1.5 shadow-sm"
              >
                <span>➕</span> Create Listing
              </button>
            </div>

            <div className="space-y-4">
              {filteredPosts.map(post => {
                const isOwnPost = post.creatorEmail === currentUser.email;

                return (
                  <div key={post.id} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition relative overflow-hidden">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${post.type === 'Offer' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-indigo-50 text-indigo-700 border-indigo-200'}`}>
                          {post.type === 'Offer' ? 'Available Offer' : 'Help Requested'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium ml-2">Listed by {post.studentName} {isOwnPost && '(You)'}</span>
                      </div>
                      <span className="text-xs font-bold font-mono text-slate-950 bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg">
                        🪙 {post.cost.toFixed(1)} Credits
                      </span>
                    </div>

                    <h3 className="font-black text-slate-950 text-sm mb-1">{post.subject}</h3>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed mb-4">{post.description}</p>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-[10px] font-bold text-slate-500">
                      <div className="flex gap-4">
                        <span>⏱️ {post.duration}</span>
                        <span>📅 {post.scheduledDay}</span>
                      </div>

                      {post.status === 'open' && (
                        <button
                          onClick={() => processDealEngagement(post)}
                          disabled={isOwnPost}
                          className={`text-[10px] font-bold px-3 py-1.5 rounded-xl transition ${isOwnPost ? 'bg-slate-50 text-slate-300 cursor-not-allowed border border-slate-100' : 'bg-slate-950 hover:bg-teal-600 hover:text-white text-white shadow-xs'}`}
                        >
                          {isOwnPost ? 'Monitoring Loop' : post.type === 'Offer' ? 'Book Lesson' : 'Accept Exchange'}
                        </button>
                      )}

                      {post.status === 'pending' && (
                        <span className="text-[10px] text-amber-600 font-black uppercase tracking-wider bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg animate-pulse">
                          Pending Auth...
                        </span>
                      )}

                      {post.status === 'confirmed' && (
                        <span className="text-[10px] text-teal-600 font-black uppercase tracking-wider bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-lg">
                          Locked & Ready
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
              <h3 className="font-black text-slate-950 text-xs uppercase tracking-wider border-b border-slate-100 pb-2.5 mb-3 flex items-center gap-1.5">
                <span>📊</span> History Log
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {transactions.map(tx => (
                  <div key={tx.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-900 leading-tight">{tx.details}</p>
                      <p className="text-[9px] text-slate-400 mt-0.5">Peer: {tx.peer} • {tx.timestamp}</p>
                    </div>
                    <span className={`font-mono font-bold ${tx.type === 'earn' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {tx.type === 'earn' ? '+' : '-'}{tx.amount.toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-5 shadow-2xl transform animate-in zoom-in-95 duration-150">
            <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider border-b border-slate-100 pb-3 mb-4">
              Publish New Exchange Loop
            </h3>
            
            <form onSubmit={handleCreatePost} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Listing Intention</label>
                  <select value={postType} onChange={(e) => setPostType(e.target.value as 'Offer' | 'Request')} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium focus:outline-none focus:border-teal-600">
                    <option value="Offer">Offer to Teach (Earns Credits)</option>
                    <option value="Request">Request Help (Costs Credits)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Exchange Subject Name</label>
                  <input type="text" placeholder="e.g., Coding Basics, Advanced Math" value={postSubject} onChange={(e) => setPostSubject(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium focus:outline-none focus:border-teal-600" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Ledger Tier</label>
                  <select value={postTier} onChange={(e) => setPostTier(e.target.value as 'Standard' | 'Advanced')} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium focus:outline-none focus:border-teal-600">
                    <option value="Standard">Standard Tier</option>
                    <option value="Advanced">Advanced Tier</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Credit Cost</label>
                  <input type="number" step="0.5" min="0.5" value={postCost} onChange={(e) => setPostCost(parseFloat(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold focus:outline-none focus:border-teal-600" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Schedule Frame</label>
                  <input type="text" value={postSchedule} onChange={(e) => setPostSchedule(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium focus:outline-none focus:border-teal-600" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Public Description Details</label>
                <textarea 
                  rows={2}
                  placeholder="Provide context for classmates reading this public catalog posting..."
                  value={postDescription} 
                  onChange={(e) => setPostDescription(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium focus:outline-none focus:border-teal-600 resize-none"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2 border-t">
                <button 
                  type="button" 
                  onClick={() => setIsCreateModalOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl font-bold transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-1.5 rounded-xl font-bold transition"
                >
                  Publish Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}