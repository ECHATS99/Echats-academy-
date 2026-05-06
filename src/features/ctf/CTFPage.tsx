import { useState } from 'react';
import { useChallenges, Challenge, submitChallenge } from '../../hooks/useCTF';
import { useAuth } from '../../context/AuthContext';
import { 
  Target, 
  Search, 
  Filter, 
  Lock, 
  Zap, 
  ChevronRight,
  Trophy,
  Users,
  CheckCircle2,
  X,
  FileCode,
  Lightbulb,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

export function CTFPage() {
  const { challenges, loading } = useChallenges();
  const { userData } = useAuth();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tous');
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);

  const categories = ['Tous', 'Web', 'Crypto', 'Pwn', 'Forensic', 'OSINT'];

  const filtered = challenges.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase());
    const matchesCat = activeCategory === 'Tous' || c.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="w-12 h-12 border-4 border-accent-cyan border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-mono text-sm animate-pulse">Synchronisation avec les serveurs de challenges...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">CAPTURE THE FLAG</h1>
          <p className="text-slate-500 font-medium mt-1">Pratiquez sur des vulnérabilités réelles dans un environnement sécurisé.</p>
        </div>
        
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 self-start">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
                activeCategory === cat ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      <div className="flex gap-4">
        <div className="flex-1 glass-panel px-6 py-3 flex items-center group focus-within:border-indigo-500/50 transition-all">
          <Search className="w-5 h-5 text-slate-600 group-focus-within:text-indigo-400" />
          <input 
            type="text" 
            placeholder="Rechercher par titre, catégorie ou difficulté..."
            className="bg-transparent border-none outline-none text-sm w-full ml-4 text-slate-300 placeholder:text-slate-700"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((challenge, i) => {
          const isSolved = userData?.solvedCTF?.includes(challenge.id);
          const isLocked = challenge.isPremium && !userData?.isPremium;
          const diffClass = challenge.difficulty === 'Facile' ? 'badge-debutant' : 
                          challenge.difficulty === 'Moyen' ? 'badge-intermediaire' : 'badge-avance';

          return (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -5 }}
              onClick={() => !isLocked && setSelectedChallenge(challenge)}
              className={cn(
                "glass-panel p-6 space-y-6 cursor-pointer group transition-all relative overflow-hidden",
                isSolved ? "border-accent-green/30 bg-accent-green/[0.02]" : "hover:bg-white/[0.08]",
                isLocked && "opacity-60 grayscale cursor-not-allowed"
              )}
            >
              {isSolved && (
                <div className="absolute -top-2 -right-8 bg-accent-green text-slate-900 text-[8px] font-black uppercase tracking-widest py-4 px-10 rotate-45">
                  Résolu
                </div>
              )}

              <div className="flex justify-between items-start">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center border transition-colors",
                  isSolved ? "bg-accent-green/10 border-accent-green/20 text-accent-green" : "bg-white/5 border-white/5 text-slate-500 group-hover:text-indigo-400 group-hover:border-indigo-500/20"
                )}>
                  <Target className="w-6 h-6" />
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={cn(diffClass)}>{challenge.difficulty}</span>
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{challenge.category}</span>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-black group-hover:text-indigo-300 transition-colors">{challenge.title}</h3>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1">
                    <Trophy className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-xs font-bold font-mono text-amber-500">{challenge.points} PTS</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-xs font-bold font-mono text-slate-500">{challenge.solves} solvers</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                {isLocked ? (
                  <div className="flex items-center gap-2 text-accent-purple">
                    <Lock className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase">Contenu Premium</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-slate-400 group-hover:text-white transition-colors">
                    <span className="text-[10px] font-black uppercase">Lancer le Défi</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                )}
                {challenge.isPremium && <Zap className="w-3.5 h-3.5 text-accent-purple fill-current" />}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Modal Défi V10 */}
      <AnimatePresence>
        {selectedChallenge && (
          <ChallengeModal 
            challenge={selectedChallenge} 
            onClose={() => setSelectedChallenge(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ChallengeModal({ challenge, onClose }: { challenge: Challenge, onClose: () => void }) {
  const [flag, setFlag] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'already'>('idle');
  const [message, setMessage] = useState('');
  const { userData } = useAuth();

  const handleSolve = async () => {
    if (!flag.trim()) return;
    
    if (userData?.solvedCTF?.includes(challenge.id)) {
      setStatus('already');
      setMessage('Challenge déjà résolu !');
      return;
    }

    setStatus('loading');
    try {
      const isCorrect = await submitChallenge(challenge, flag);
      if (isCorrect) {
        setStatus('success');
        setMessage(`Success ! +${challenge.points} Points ont été ajoutés à votre compte.`);
      } else {
        setStatus('error');
        setMessage('Flag incorrect. Réessayez !');
      }
    } catch (e) {
      console.error(e);
      setStatus('error');
      setMessage("Erreur lors de la soumission. Vérifiez votre connexion.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-bg-dark/90 backdrop-blur-md" 
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-4xl glass-panel bg-surface-dark overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Sidebar Info */}
        <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-white/5 p-8 space-y-8 bg-white/[0.01]">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-center">
              <FileCode className="w-8 h-8 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black">{challenge.title}</h2>
              <p className="text-xs font-black text-slate-500 uppercase mt-1 tracking-widest">{challenge.category}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500 font-medium">Difficulté</span>
              <span className={cn(
                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter",
                challenge.difficulty === 'Facile' ? 'bg-accent-green/10 text-accent-green' : 
                challenge.difficulty === 'Moyen' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-accent-red/10 text-accent-red'
              )}>{challenge.difficulty}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500 font-medium">Récompense</span>
              <span className="font-mono font-bold text-amber-500">+{challenge.points} PTS</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500 font-medium">Soumissions</span>
              <span className="font-mono font-bold text-slate-300">{challenge.solves}</span>
            </div>
          </div>

          {challenge.hint && (
            <div className="p-4 bg-white/[0.03] border border-white/10 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-indigo-400">
                <Lightbulb className="w-4 h-4" />
                <span className="text-xs font-bold uppercase">Besoin d'aide ?</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed italic">Utilisez vos points pour débloquer un indice (-10 PTS).</p>
            </div>
          )}
        </div>

        {/* Content & Action */}
        <div className="flex-1 p-8 md:p-12 space-y-8 overflow-y-auto">
          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-600 uppercase tracking-widest border-b border-white/5 pb-2">Description</h3>
            <div className="text-slate-300 leading-relaxed text-lg prose prose-invert max-w-none">
              {challenge.description}
            </div>
          </div>

          {status === 'success' ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-8 bg-accent-green/10 border border-accent-green/20 rounded-2xl flex flex-col items-center text-center gap-4"
            >
              <div className="w-16 h-16 bg-accent-green/20 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-accent-green" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-accent-green">Défis Relevé !</h4>
                <p className="text-slate-400 mt-1">{message}</p>
              </div>
              <button 
                onClick={onClose}
                className="mt-2 px-8 py-2 bg-accent-green text-slate-900 font-bold rounded-lg hover:scale-105 transition-transform"
              >
                Continuer
              </button>
            </motion.div>
          ) : (
            <div className="space-y-6 pt-10">
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-600 uppercase tracking-widest ml-1">Soumettre votre Flag</label>
                <div className="relative group">
                  <input 
                    type="text"
                    disabled={status === 'loading'}
                    placeholder="ECHATS{your_flag_here}"
                    value={flag}
                    onChange={(e) => setFlag(e.target.value)}
                    className={cn(
                      "w-full bg-white/5 border-2 rounded-2xl px-6 py-5 font-mono text-xl outline-none transition-all",
                      status === 'error' ? "border-accent-red/50 focus:border-accent-red shadow-lg shadow-accent-red/5" : "border-white/5 focus:border-indigo-500/50"
                    )}
                  />
                  {status === 'error' && (
                    <motion.div 
                      key={message}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="absolute -bottom-8 left-1 flex items-center gap-2 text-accent-red text-xs font-bold"
                    >
                      <AlertCircle className="w-4 h-4" />
                      {message}
                    </motion.div>
                  )}
                </div>
              </div>
              
              <button 
                disabled={status === 'loading' || !flag.trim()}
                onClick={handleSolve}
                className="w-full primary-gradient py-5 rounded-2xl font-black text-xl shadow-xl shadow-accent-green/10 active:scale-95 transition-all disabled:opacity-30 flex items-center justify-center gap-4 group"
              >
                {status === 'loading' ? (
                  <div className="w-6 h-6 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    VÉRIFIER LE FLAG <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
