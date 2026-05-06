import { useChallenges } from '../../hooks/useCTF';
import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { 
  Trophy, 
  Medal, 
  Target, 
  TrendingUp, 
  Users,
  Star,
  Globe,
  ChevronUp,
  MapPin
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

interface LeaderboardUser {
  uid: string;
  username: string;
  pts: number;
  solved: number;
  country: string;
  avatar?: string;
  rank?: number;
}

export function Leaderboard() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'leaderboard'), orderBy('pts', 'desc'), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc, i) => ({ 
        uid: doc.id, 
        ...doc.data(),
        rank: i + 1
      } as LeaderboardUser));
      setUsers(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-accent-purple border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const top3 = users.slice(0, 3);
  const remaining = users.slice(3);

  return (
    <div className="space-y-12">
      <header className="text-center space-y-2">
        <h1 className="text-4xl font-black tracking-tighter">CLASSEMENT MONDIAL</h1>
        <p className="text-slate-500 font-medium">Les meilleurs hackers d'Afrique francophone.</p>
      </header>

      {/* Podium Top 3 */}
      <div className="flex flex-col md:flex-row items-end justify-center gap-6 pt-10">
        {/* 2nd Place */}
        {top3[1] && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="order-2 md:order-1 flex flex-col items-center"
          >
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-2xl bg-surface-dark border-2 border-slate-400 overflow-hidden">
                <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${top3[1].username}`} alt={top3[1].username} />
              </div>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-400 text-slate-950 px-3 py-1 rounded-full text-xs font-black shadow-lg">#2</div>
            </div>
            <div className="text-center">
              <p className="font-bold text-slate-300">{top3[1].username}</p>
              <p className="text-accent-cyan font-black text-sm font-mono">{top3[1].pts} PTS</p>
            </div>
            <div className="h-24 w-32 bg-slate-400/10 rounded-t-2xl mt-4 border-t border-x border-white/5" />
          </motion.div>
        )}

        {/* 1st Place */}
        {top3[0] && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="order-1 md:order-2 flex flex-col items-center"
          >
            <Trophy className="w-10 h-10 text-amber-500 mb-4 animate-bounce" />
            <div className="relative mb-4">
              <div className="w-32 h-32 rounded-3xl bg-surface-dark border-4 border-amber-500 overflow-hidden shadow-2xl shadow-amber-500/20">
                <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${top3[0].username}`} alt={top3[0].username} />
              </div>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-amber-500 text-amber-950 px-4 py-1.5 rounded-full text-sm font-black shadow-xl">#1</div>
            </div>
            <div className="text-center">
              <p className="font-black text-white text-lg">{top3[0].username}</p>
              <p className="text-amber-500 font-black text-xl font-mono">{top3[0].pts} PTS</p>
            </div>
            <div className="h-32 w-40 bg-amber-500/10 rounded-t-3xl mt-4 border-t border-x border-amber-500/20 flex flex-col items-center justify-center">
               <Star className="text-amber-500/20 w-8 h-8" />
            </div>
          </motion.div>
        )}

        {/* 3rd Place */}
        {top3[2] && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="order-3 flex flex-col items-center"
          >
            <div className="relative mb-4">
              <div className="w-20 h-20 rounded-2xl bg-surface-dark border-2 border-amber-800 overflow-hidden">
                <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${top3[2].username}`} alt={top3[2].username} />
              </div>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-amber-800 text-amber-100 px-3 py-1 rounded-full text-xs font-black shadow-lg">#3</div>
            </div>
            <div className="text-center">
              <p className="font-bold text-slate-300">{top3[2].username}</p>
              <p className="text-indigo-400 font-black text-sm font-mono">{top3[2].pts} PTS</p>
            </div>
            <div className="h-16 w-28 bg-amber-800/10 rounded-t-2xl mt-4 border-t border-x border-white/5" />
          </motion.div>
        )}
      </div>

      {/* Leaderboard Table V10 */}
      <div className="glass-panel overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5 text-[10px] uppercase font-black text-slate-500 tracking-[0.2em]">
            <tr>
              <th className="px-8 py-5">Rang</th>
              <th className="px-8 py-5">Utilisateur</th>
              <th className="px-8 py-5">Pays</th>
              <th className="px-8 py-5">Exploits</th>
              <th className="px-8 py-5 text-right font-mono">Score Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {remaining.map((user) => (
              <tr key={user.uid} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-8 py-5">
                  <span className="font-mono font-bold text-slate-500 group-hover:text-white transition-colors">#{user.rank}</span>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/5 border border-white/5">
                      <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${user.username}`} alt={user.username} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-200 group-hover:text-indigo-400 transition-colors uppercase tracking-tight text-sm">{user.username}</p>
                      <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{user.pts > 5000 ? 'EXPERT' : 'INITIÉ'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-slate-600" />
                    <span className="text-xs font-bold text-slate-400">{user.country || 'CG'}</span>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-2">
                    <Target className="w-3.5 h-3.5 text-slate-600" />
                    <span className="text-xs font-mono font-bold text-slate-400">{user.solved}</span>
                  </div>
                </td>
                <td className="px-8 py-5 text-right">
                  <span className="font-mono font-black text-indigo-400 text-base">{user.pts}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
