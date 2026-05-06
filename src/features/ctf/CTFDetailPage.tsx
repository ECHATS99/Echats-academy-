import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth } from '../../lib/firebase';
import { doc, getDoc, updateDoc, arrayUnion, increment, addDoc, collection } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { validateFlag } from '../../lib/security';
import { 
  Shield, 
  Terminal as TerminalIcon, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ChevronLeft,
  Lightbulb,
  FileCode,
  Download
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  points: number;
  flagHash: string;
  hints: string[];
  isPremium: boolean;
  solves: number;
}

export function CTFDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userData } = useAuth();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [inputFlag, setInputFlag] = useState('');
  const [status, setStatus] = useState<'idle' | 'wrong' | 'correct' | 'loading'>('idle');
  const [hintIndex, setHintIndex] = useState(-1);

  useEffect(() => {
    if (!id) return;
    getDoc(doc(db, 'challenges', id)).then(s => {
      if (s.exists()) setChallenge({ id: s.id, ...s.data() } as Challenge);
    });
  }, [id]);

  const isSolved = challenge && userData?.solvedCTF?.includes(challenge.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!challenge || isSolved || status === 'loading') return;

    setStatus('loading');
    const isCorrect = await validateFlag(inputFlag, challenge.flagHash);

    if (isCorrect && userData?.uid) {
      const userRef = doc(db, 'users', userData.uid);
      await updateDoc(userRef, {
        solvedCTF: arrayUnion(challenge.id),
        pts: increment(challenge.points)
      });

      await updateDoc(doc(db, 'challenges', challenge.id), {
        solves: increment(1)
      });

      // Update leaderboard
      await updateDoc(doc(db, 'leaderboard', userData.uid), {
        pts: increment(challenge.points),
        solved: increment(1)
      });

      setStatus('correct');
      // Instant reward effect
    } else {
      setStatus('wrong');
      setTimeout(() => setStatus('idle'), 2000);
    }
  };

  if (!challenge) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-500">
      <button 
        onClick={() => navigate('/ctf')}
        className="flex items-center gap-2 text-slate-500 hover:text-white font-bold text-xs uppercase tracking-widest transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Retour aux Labs
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
           <header className="space-y-4">
              <div className="flex items-center gap-3">
                 <span className={cn(
                   "px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest",
                   challenge.difficulty === 'Facile' ? "bg-accent-green/10 text-accent-green" :
                   challenge.difficulty === 'Moyen' ? "bg-accent-orange/10 text-accent-orange" : "bg-rose-500/10 text-rose-500"
                 )}>{challenge.difficulty}</span>
                 <span className="text-slate-500 text-xs font-bold tracking-widest uppercase">{challenge.category}</span>
              </div>
              <h1 className="text-4xl font-black tracking-tight">{challenge.title}</h1>
              <div className="flex items-center gap-6 text-slate-500">
                 <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-accent-purple" />
                    <span className="text-xs font-bold">{challenge.points} Crédits</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-accent-green" />
                    <span className="text-xs font-bold">{challenge.solves} résolus</span>
                 </div>
              </div>
           </header>

           <div className="glass-panel p-8 space-y-6">
              <h3 className="text-lg font-bold flex items-center gap-2"><TerminalIcon className="w-5 h-5 text-accent-cyan" /> Briefing de Mission</h3>
              <p className="text-slate-400 leading-relaxed font-medium">{challenge.description}</p>
              
              <div className="p-4 bg-white/5 border border-white/5 rounded-xl flex items-center gap-4">
                <div className="w-10 h-10 bg-accent-cyan/10 rounded-lg flex items-center justify-center">
                  <Download className="w-5 h-5 text-accent-cyan" />
                </div>
                <div className="flex-1">
                   <p className="text-xs font-bold">files.zip</p>
                   <p className="text-[10px] text-slate-500 uppercase tracking-widest">Artefacts de mission</p>
                </div>
                <button className="px-4 py-2 bg-white/10 rounded-lg text-xs font-bold hover:bg-white/20 transition-all">Télécharger</button>
              </div>
           </div>

           <section className="space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2"><Lightbulb className="w-5 h-5 text-amber-500" /> Indices Stratégiques</h3>
              <div className="grid grid-cols-1 gap-4">
                 {challenge.hints.map((hint, i) => (
                   <div key={i} className="glass-panel p-4 overflow-hidden relative">
                      {hintIndex >= i ? (
                        <p className="text-sm text-slate-400 animate-in fade-in slide-in-from-top-2">{hint}</p>
                      ) : (
                        <button 
                          onClick={() => setHintIndex(i)}
                          className="w-full flex items-center justify-between text-xs font-bold text-slate-500 hover:text-amber-500 transition-colors uppercase tracking-widest"
                        >
                          Débloquer l'indice {i + 1} <span className="text-[9px] text-amber-500/50">-50 PTS</span>
                        </button>
                      )}
                   </div>
                 ))}
              </div>
           </section>
        </div>

        <div className="space-y-8">
           <section className="glass-panel p-8 space-y-6">
              <div className="text-center space-y-2">
                 <h3 className="text-xl font-black tracking-tighter uppercase">RÉSOUCHATS</h3>
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Soumettre le Flag</p>
              </div>

              {isSolved ? (
                <div className="p-6 bg-accent-green/10 border border-accent-green/20 rounded-2xl flex flex-col items-center gap-4 text-center">
                   <CheckCircle2 className="w-12 h-12 text-accent-green" />
                   <div>
                      <h4 className="font-bold text-accent-green">DÉFI COMPLÉTÉ</h4>
                      <p className="text-xs text-slate-400 mt-1">Les crédits ont été versés sur votre compte.</p>
                   </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                   <div className="relative">
                      <input 
                        value={inputFlag}
                        onChange={(e) => setInputFlag(e.target.value)}
                        placeholder="ECHATS{...}"
                        disabled={status === 'loading'}
                        className={cn(
                          "w-full bg-slate-900 border-2 rounded-2xl p-4 font-mono font-bold text-center outline-none transition-all",
                          status === 'wrong' ? "border-rose-500 animate-shake" : 
                          status === 'correct' ? "border-accent-green" : "border-white/5 focus:border-accent-purple/50"
                        )}
                      />
                      <AnimatePresence>
                         {status === 'wrong' && (
                           <motion.div 
                             initial={{ opacity: 0, y: 10 }}
                             animate={{ opacity: 1, y: 0 }}
                             exit={{ opacity: 0 }}
                             className="absolute -bottom-6 inset-x-0 text-center"
                           >
                             <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest flex items-center justify-center gap-1">
                               <AlertCircle className="w-2 h-2" /> Flag Invalide
                             </span>
                           </motion.div>
                         )}
                      </AnimatePresence>
                   </div>

                   <button 
                     type="submit"
                     disabled={status === 'loading' || !inputFlag}
                     className={cn(
                       "w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95",
                       status === 'loading' ? "bg-white/5 text-slate-500" : "bg-accent-purple text-white shadow-accent-purple/20 hover:bg-accent-purple/90"
                     )}
                   >
                     {status === 'loading' ? "Vérification..." : "VÉRIFIER LE FLAG"}
                   </button>
                </form>
              )}

              <div className="pt-4 border-t border-white/5 space-y-4">
                 <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <span>Format Requis</span>
                    <span className="text-white">ECHATS{ "{" }...{ "}" }</span>
                 </div>
                 <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <span>Tentatives</span>
                    <span className="text-white">{(userData?.attempts?.[id!] || 0)}</span>
                 </div>
              </div>
           </section>

           <div className="glass-panel p-6 bg-accent-purple/5 border-accent-purple/10">
              <p className="text-[10px] font-black text-accent-purple uppercase tracking-widest mb-2">Conseil de l'IA</p>
              <p className="text-xs text-slate-400 italic leading-relaxed">"N'oubliez pas que l'injection SQL commence souvent par un simple caractère d'échappement. Analysez les erreurs de retour."</p>
           </div>
        </div>
      </div>
    </div>
  );
}
