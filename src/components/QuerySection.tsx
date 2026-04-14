import React, { useState, useEffect, useRef } from 'react';
import { collection, query, onSnapshot, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { TaxQuery, UserProfile } from '../types';
import { Send, User, Shield, Loader2, MessageSquare } from 'lucide-react';

import { handleFirestoreError, OperationType } from '../lib/errorHandlers';

interface QuerySectionProps {
  returnId: string;
  profile: UserProfile;
}

export default function QuerySection({ returnId, profile }: QuerySectionProps) {
  const [queries, setQueries] = useState<TaxQuery[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const queriesPath = `tax_returns/${returnId}/queries`;
    const q = query(
      collection(db, 'tax_returns', returnId, 'queries'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const queriesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TaxQuery[];
      setQueries(queriesData);
      setLoading(false);
      
      // Scroll to bottom
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 100);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, queriesPath);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [returnId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      await addDoc(collection(db, 'tax_returns', returnId, 'queries'), {
        returnId,
        senderId: profile.uid,
        senderRole: profile.role,
        senderName: profile.displayName || 'User',
        message: newMessage.trim(),
        timestamp: serverTimestamp(),
      });
      setNewMessage('');
    } catch (error) {
      console.error("Error sending query:", error);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-neutral-100 bg-neutral-50/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          <h2 className="font-bold text-neutral-900">Communication Hub</h2>
        </div>
        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
          Secure Channel
        </span>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-4 bg-neutral-50/30"
      >
        {queries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-2">
            <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-neutral-300" />
            </div>
            <p className="text-sm text-neutral-500">No messages yet. Start a conversation with our experts.</p>
          </div>
        ) : (
          queries.map((q) => {
            const isMe = q.senderId === profile.uid;
            // Note: In a real app, we'd fetch the sender's role if not stored in the message
            // For now, we'll assume staff/admin if senderId != profile.uid and profile is client
            const isExpert = (profile.role === 'client' && !isMe) || (profile.role !== 'client' && isMe);

            return (
              <div 
                key={q.id} 
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    isExpert ? 'bg-primary/10 text-primary' : 'bg-neutral-200 text-neutral-500'
                  }`}>
                    {isExpert ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>
                  <div className={`space-y-1 ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className={`px-4 py-2 rounded-2xl text-sm ${
                      isMe 
                        ? 'bg-neutral-900 text-white rounded-tr-none' 
                        : 'bg-white border border-neutral-200 text-neutral-900 rounded-tl-none shadow-sm'
                    }`}>
                      {q.message}
                    </div>
                    <p className="text-[10px] text-neutral-400 px-1">
                      {q.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={handleSend} className="p-4 border-t border-neutral-100 bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={profile.role === 'client' ? "Ask a question to the expert..." : "Send a query to the client..."}
            className="flex-1 px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="p-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-50"
          >
            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </form>
    </div>
  );
}
