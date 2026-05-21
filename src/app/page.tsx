'use client';

import React, { useState, useEffect } from 'react';
import { UserProfile, MarketplacePost, Transaction, EscrowSession } from '../types';
import { initialProfile, initialPosts, initialTransactions } from '../mockData';

export default function HourglassDashboard() {
  // ----------------------------------------
  // 1. STATE & PERSISTENCE MANAGEMENT
  // ----------------------------------------
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [posts, setPosts] = useState<MarketplacePost[]>(initialPosts);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [activeSession, setActiveSession] = useState<EscrowSession | null>(null);
  
  // Feed Filtering state: 'All' | 'Offer' | 'Request'
  const [feedFilter, setFeedFilter] = useState<'All' | 'Offer' | 'Request'>('All');
  
  // Timer tracking states
  const [timerLeft, setTimerLeft] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  
  // Quality Control Review Modal states
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');

  // Load from LocalStorage on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('hg_profile');
    const savedPosts = localStorage.getItem('hg_posts');
    const savedTransactions = localStorage.getItem('hg_transactions');
    
    if (savedProfile) setProfile(JSON.parse(savedProfile));
    if (savedPosts) setPosts(JSON.parse(savedPosts));
    if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
  }, []);

  // Save changes to LocalStorage helper
  const saveToStorage = (newProfile: UserProfile, newPosts: MarketplacePost[], newTx: Transaction[]) => {
    localStorage.setItem('hg_profile', JSON.stringify(newProfile));
    localStorage.setItem('hg_posts', JSON.stringify(newPosts));
    localStorage.setItem('hg_transactions', JSON.stringify(newTx));
  };

  // ----------------------------------------
  // 2. LIVE COUNTDOWN TIMER LOGIC
  // ----------------------------------------
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timerLeft > 0) {
      interval = setInterval(() => {
        setTimerLeft((prev) => prev - 1);
      }, 1000);
    } else if (timerLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      // When timer hits 0, trigger the "Verify Session" pending state
      if (activeSession) {
        setActiveSession({ ...activeSession, status: 'completed_pending_review' });
      }
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerLeft, activeSession]);

  // Format seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // ----------------------------------------
  // 3. CORE TRANSACTION & ESCROW LOGIC
  // ----------------------------------------
  
  // User Accepts an item from the Feed
  const handleAcceptExchange = (post: MarketplacePost) => {
    if (activeSession) {
      alert("You already have an active skill-exchange session running!");
      return;
    }

    if (post.type === 'Offer') {
      // Current User is the LEARNER (spending credits)
      // Escrow Logic: Check if current user has enough balance immediately
      if (profile.balance < post.cost) {
        alert("Inadequate Hourglass Credits! Help a peer out first to earn more credits.");
        return;
      }

      // Deduct balance from learner immediately to place in Escrow
      const updatedProfile = { ...profile, balance: profile.balance - post.cost };
      setProfile(updatedProfile);
      
      // Setup Escrow tracking session (Simulating a quick 15-second high-yield workspace)
      const newSession: EscrowSession = {
        id: `session-${Date.now()}`,
        postId: post.id,
        tutorName: post.studentName,
        learnerName: profile.name,
        subject: post.subject,
        cost: post.cost,
        durationSeconds: 15, // Using 15 seconds for rapid MVP testing demonstration
        status: 'active'
      };
      
      setActiveSession(newSession);
      setTimerLeft(15);
      setIsTimerRunning(true);
      
      // Remove post from feed since it's occupied
      const updatedPosts = posts.filter(p => p.id !== post.id);
      setPosts(updatedPosts);
      saveToStorage(updatedProfile, updatedPosts, transactions);

    } else {
      // Current User is the TUTOR (earning credits helping someone who requested help)
      // Since the mock student requested help, we assume their escrow is backed.
      const newSession: EscrowSession = {
        id: `session-${Date.now()}`,
        postId: post.id,
        tutorName: profile.name, // Current user is tutor
        learnerName: post.studentName,
        subject: post.subject,
        cost: post.cost,
        durationSeconds: 15,
        status: 'active'
      };

      setActiveSession(newSession);
      setTimerLeft(15);
      setIsTimerRunning(true);

      const updatedPosts = posts.filter(p => p.id !== post.id);
      setPosts(updatedPosts);
      saveToStorage(profile, updatedPosts, transactions);
    }
  };

  // Triggered when user manually ends or clicks "Verify Session"
  const handleVerifySessionClick = () => {
    setIsTimerRunning(false);
    setShowReviewModal(true);
  };

  // Final step: Submit review and allocate currency out of Escrow
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSession) return;

    let updatedProfile = { ...profile };
    let updatedTx = [...transactions];

    // If current user acted as the TUTOR, they officially receive the escrowed funds now!
    if (activeSession.tutorName === profile.name) {
      updatedProfile.balance += activeSession.cost;
      
      const newTx: Transaction = {
        id: `tx-${Date.now()}`,
        type: 'earn',
        amount: activeSession.cost,
        subject: activeSession.subject,
        peerName: activeSession.learnerName,
        timestamp: 'Just now'
      };
      updatedTx = [newTx, ...updatedTx];
    } else {
      // Current user was the LEARNER (funds were already deducted on start)
      const newTx: Transaction = {
        id: `tx-${Date.now()}`,
        type: 'spend',
        amount: activeSession.cost,
        subject: activeSession.subject,
        peerName: activeSession.tutorName,
        timestamp: 'Just now'
      };
      updatedTx = [newTx, ...updatedTx];
    }

    setProfile(updatedProfile);
    setTransactions(updatedTx);
    saveToStorage(updatedProfile, posts, updatedTx);

    // Clean up interface state
    setActiveSession(null);
    setShowReviewModal(false);
    setComment('');
    alert("Transaction completed successfully! Credits securely transferred.");
  };

  // ----------------------------------------
  // 4. RENDERING ENGINE (THE DASHBOARD UI)
  // ----------------------------------------
  const filteredPosts = posts.filter(post => {
    if (feedFilter === 'All') return true;
    return post.type === feedFilter;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col md:flex-row antialiased font-sans">
      
      {/* SIDEBAR NAVIGATION & PROFILE VIEW */}
      <aside className="w-full md:w-80 bg-white border-b md:border-b-0 md:border-r border-slate-200 p-6 flex flex-col justify-between shrink-0">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-teal-600 text-white p-2.5 rounded-xl shadow-md shadow-teal-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight text-slate-900">Hourglass</h1>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Time Banking Hub</p>
            </div>
          </div>

          {/* User Profile Info */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-teal-100 text-teal-700 font-semibold rounded-full flex items-center justify-center text-sm">
                {profile.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">{profile.name}</h3>
                <span className="text-xs px-2 py-0.5 bg-slate-200 text-slate-600 rounded-md font-medium">{profile.grade}</span>
              </div>
            </div>

            <div className="space-y-3 mt-4 border-t border-slate-200/60 pt-3">
              <div>
                <span className="text-xs font-semibold text-teal-600 uppercase tracking-wider block mb-1">My Strengths (Earns Time)</span>
                <div className="flex flex-wrap gap-1">
                  {profile.strengths.map((str, idx) => (
                    <span key={idx} className="text-xs bg-teal-50 border border-teal-100 text-teal-800 px-2 py-1 rounded-md">{str}</span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider block mb-1">My Needs (Spends Time)</span>
                <div className="flex flex-wrap gap-1">
                  {profile.needs.map((nd, idx) => (
                    <span key={idx} className="text-xs bg-indigo-50 border border-indigo-100 text-indigo-800 px-2 py-1 rounded-md">{nd}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-400 text-center md:text-left border-t border-slate-100 pt-4 mt-4">
          Peer-to-Peer Academic Banking System &bull; Grades 10-12
        </div>
      </aside>

      {/* MAIN MAIN CONTENT CONTAINER */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* TOP COMPACT CONTAINER: TIME WALLET WIDGET */}
        <header className="bg-white border-b border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Student Dashboard</h2>
            <p className="text-sm text-slate-500">Deposit time helping others, withdraw it when you need a tutor.</p>
          </div>

          {/* Financial Wallet Box */}
          <div className="bg-gradient-to-br from-teal-600 to-emerald-700 text-white rounded-2xl p-4 shadow-xl shadow-teal-900/10 flex items-center gap-4 min-w-[240px]">
            <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 text-emerald-200 ${isTimerRunning ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium text-emerald-100 uppercase tracking-wider">Active Balance</p>
              <h4 className="text-2xl font-extrabold tracking-tight">{profile.balance.toFixed(1)} <span className="text-sm font-normal text-emerald-100">Credits / Hrs</span></h4>
            </div>
          </div>
        </header>

        {/* WORKSPACE MIDDLE BODY */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          
          {/* INTERACTIVE ESCROW LIVE TRANSACTION VIEW CONTAINER */}
          {activeSession && (
            <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
              <div className="flex items-start gap-3.5">
                <div className="bg-amber-500 text-white p-3 rounded-xl mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wide bg-amber-200 text-amber-900 px-2 py-0.5 rounded-md">Live Escrow Session Locked</span>
                    <span className="text-xs text-amber-700 font-medium">Cost: {activeSession.cost.toFixed(1)} Credits</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mt-1">{activeSession.subject}</h3>
                  <p className="text-xs text-slate-600 mt-0.5">Tutor: <strong className="text-slate-800">{activeSession.tutorName}</strong> &bull; Learner: <strong className="text-slate-800">{activeSession.learnerName}</strong></p>
                </div>
              </div>

              {/* Live Timer Control Group */}
              <div className="flex items-center gap-3 self-end md:self-center bg-white border border-amber-200 px-4 py-2 rounded-xl shadow-inner">
                <div className="text-center">
                  <span className="text-xs text-slate-400 block font-semibold uppercase tracking-tight">Time Remaining</span>
                  <span className="font-mono text-xl font-bold text-slate-800">{formatTime(timerLeft)}</span>
                </div>
                
                {activeSession.status === 'active' ? (
                  <button 
                    onClick={handleVerifySessionClick} 
                    className="bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs px-3.5 py-2 rounded-lg transition"
                  >
                    End & Verify
                  </button>
                ) : (
                  <button 
                    onClick={() => setShowReviewModal(true)} 
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs px-3.5 py-2 rounded-lg transition animate-pulse"
                  >
                    Confirm & Release
                  </button>
                )}
              </div>
            </div>
          )}

          {/* LOWER TWO COLUMN GRID: MARKETPLACE vs LOGS */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* COLUMN 1 & 2: DYNAMIC DECENTRALIZED MARKETPLACE FEED */}
            <div className="xl:col-span-2 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="font-bold text-slate-900 text-lg">Decentralized Marketplace Feed</h3>
                
                {/* Filters */}
                <div className="bg-slate-200/70 p-1 rounded-xl flex gap-1">
                  {(['All', 'Offer', 'Request'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setFeedFilter(type)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${feedFilter === type ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      {type === 'All' ? 'Browse All' : type === 'Offer' ? 'Browse Offers' : 'Browse Requests'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Feed Content Cards */}
              <div className="space-y-3">
                {filteredPosts.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">No exchange slots listed inside this filter category right now.</p>
                ) : (
                  filteredPosts.map((post) => (
                    <div key={post.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-slate-300 transition flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                      <div className="space-y-1.5 max-w-xl">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-[11px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md ${post.type === 'Offer' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-indigo-50 border border-indigo-200 text-indigo-800'}`}>
                            {post.type === 'Offer' ? 'Available Offer' : 'Help Requested'}
                          </span>
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${post.tier === 'Advanced' ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-slate-100 text-slate-600'}`}>
                            {post.tier} Tier ({post.cost.toFixed(1)}/hr)
                          </span>
                          <span className="text-xs text-slate-400 font-medium">Listed by {post.studentName}</span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-base">{post.subject}</h4>
                        <p className="text-sm text-slate-500 leading-relaxed">{post.description}</p>
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => handleAcceptExchange(post)}
                        className={`sm:shrink-0 px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm transition ${
                          post.type === 'Offer' 
                            ? 'bg-teal-600 hover:bg-teal-700 text-white' 
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        }`}
                      >
                        Accept Exchange ({post.cost.toFixed(1)} Credits)
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* COLUMN 3: HISTORICAL TRANSACTION LOG */}
            <div className="space-y-4">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="font-bold text-slate-900 text-lg">Ledger Transactions Log</h3>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-4 divide-y divide-slate-100 shadow-sm">
                {transactions.map((tx) => (
                  <div key={tx.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <h5 className="font-bold text-slate-800 text-xs truncate">{tx.subject}</h5>
                      <p className="text-[11px] text-slate-400 truncate">{tx.type === 'earn' ? 'Earned via' : 'Paid to'} {tx.peerName} &bull; {tx.timestamp}</p>
                    </div>
                    <span className={`text-xs font-bold font-mono shrink-0 px-2 py-0.5 rounded-md ${tx.type === 'earn' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                      {tx.type === 'earn' ? '+' : '-'}{tx.amount.toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* COMPLIANCE ESCROW QUALITY CONTROL MODAL */}
      {showReviewModal && activeSession && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSubmitReview} className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 animate-scale-up space-y-4">
            <div className="text-center space-y-1.5">
              <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto text-xl">🏆</div>
              <h3 className="text-lg font-bold text-slate-900">Verify & Complete Session</h3>
              <p className="text-xs text-slate-500">Rate your experience. Confirming this step authorizes the ledger to release escrow security directly into the tutor's active time wallet balance.</p>
            </div>

            {/* Star Picker Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block text-center">Tutor Rating (Quality Control)</label>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    className={`text-2xl transition ${star <= rating ? 'text-amber-400 scale-110' : 'text-slate-200'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            {/* Commments Block */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Feedback / Comments</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Optional notes on how the peer-exchange session went..."
                className="w-full border border-slate-200 rounded-xl p-3 text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500 h-20 resize-none"
              />
            </div>

            {/* Action Triggers */}
            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-md shadow-teal-700/10"
              >
                Submit Review & Release Funds
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}