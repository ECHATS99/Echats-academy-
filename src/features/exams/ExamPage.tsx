import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, increment } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Timer, ShieldCheck, ChevronRight, AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';

interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
}

export function ExamPage() {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const [examStarted, setExamStarted] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(false);
  const [finished, setFinished] = useState(false);
  const [cheated, setCheated] = useState(false);

  const getExamConfig = () => {
    switch (userData?.level) {
      case 'Débutant': return { qCount: 20, duration: 40 * 60, next: 'Normal' };
      case 'Normal': return { qCount: 50, duration: 90 * 60, next: 'Pro' };
      case 'Pro': return { qCount: 100, duration: 180 * 60, next: 'Expert' };
      default: return { qCount: 20, duration: 40 * 60, next: 'Normal' };
    }
  };

  const config = getExamConfig();

  // Check for abandoned exam on mount
  useEffect(() => {
    if (userData?.examAttempt?.status === 'in-progress') {
       // If the exam was started but not finished, and it's a new mount, 
       // it means they probably refreshed or closed the tab.
       const checkAbandoned = async () => {
          const startedAt = new Date(userData.examAttempt!.startedAt).getTime();
          const now = new Date().getTime();
          // Allow some grace period (e.g. 10 seconds for initial load)
          if (now - startedAt > 10000) {
             setCheated(true);
             setFinished(true);
             // Optionally update DB to mark as failed
             await updateDoc(doc(db, 'users', userData.uid), {
                'examAttempt.status': 'failed',
                'examAttempt.isCheat': true
             });
          }
       };
       checkAbandoned();
    }
  }, []);

  // Anti-cheat: Refresh detection
  useEffect(() => {
    if (!examStarted) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
      // We can't easily mark as failed here because updateDoc is async, 
      // but the mere existence of a "started" state without "finished" can be used on next reload.
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [examStarted]);

  const startExam = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'questions'), where('difficulty', '==', userData?.level || 'Débutant'));
      const snap = await getDocs(q);
      const allQ = snap.docs.map(d => ({ id: d.id, ...d.data() } as Question));
      
      // Shuffle and pick
      const selected = allQ.sort(() => 0.5 - Math.random()).slice(0, config.qCount);
      
      if (selected.length < config.qCount) {
        alert("Pas assez de questions disponibles pour ce niveau dans la base de données. Contactez un administrateur.");
        setLoading(false);
        return;
      }

      setQuestions(selected);
      setTimeLeft(config.duration);
      setExamStarted(true);
      
      // Record start in Firestore
      if (userData?.uid) {
        await updateDoc(doc(db, 'users', userData.uid), {
          examAttempt: {
            startedAt: new Date().toISOString(),
            status: 'in-progress',
            type: config.next
          }
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const submitExam = useCallback(async (isCheat = false) => {
    setLoading(true);
    let correct = 0;
    if (!isCheat) {
      answers.forEach((ans, i) => {
        if (ans === questions[i].correctIndex) correct++;
      });
    }

    const pass = !isCheat && (correct / questions.length) >= 0.75; // 75% to pass

    if (userData?.uid) {
      await updateDoc(doc(db, 'users', userData.uid), {
        level: pass ? config.next : userData.level,
        pts: increment(pass ? 500 : 0),
        examAttempt: {
          finishedAt: new Date().toISOString(),
          status: pass ? 'passed' : 'failed',
          score: correct,
          isCheat
        }
      });
    }

    setFinished(true);
    setExamStarted(false);
    setLoading(false);
    if (isCheat) setCheated(true);
  }, [answers, questions, config.next, userData?.level, userData?.uid]);

  useEffect(() => {
    if (examStarted && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (examStarted && timeLeft === 0) {
      submitExam();
    }
  }, [examStarted, timeLeft, submitExam]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + 'h ' : ''}${m}m ${s}s`;
  };

  if (!examStarted && !finished) {
    return (
      <div className="max-w-3xl mx-auto py-20 space-y-10">
        <div className="text-center space-y-4">
          <ShieldAlert className="w-20 h-20 text-accent-purple mx-auto mb-6" />
          <h1 className="text-4xl font-black tracking-tighter">CENTRE D'ACCRÉDITATION</h1>
          <p className="text-slate-500 font-medium">Vous êtes sur le point de passer votre examen pour le niveau <span className="text-white font-bold">{config.next}</span>.</p>
        </div>

        <div className="glass-panel p-8 space-y-6">
          <h3 className="text-xl font-bold border-b border-white/5 pb-4">Règles de l'Examen</h3>
          <ul className="space-y-4">
            <li className="flex items-start gap-4">
              <div className="w-6 h-6 rounded bg-accent-purple/10 flex items-center justify-center text-accent-purple shrink-0 mt-1">1</div>
              <p className="text-sm text-slate-400"><span className="text-white font-bold">{config.qCount} questions</span> à choix multiples basées sur votre domaine d'expertise actuel.</p>
            </li>
            <li className="flex items-start gap-4">
              <div className="w-6 h-6 rounded bg-accent-purple/10 flex items-center justify-center text-accent-purple shrink-0 mt-1">2</div>
              <p className="text-sm text-slate-400">Temps imparti: <span className="text-white font-bold">{Math.floor(config.duration / 60)} minutes</span>. Le test s'arrête automatiquement à la fin du chrono.</p>
            </li>
            <li className="flex items-start gap-4">
              <div className="w-6 h-6 rounded bg-rose-500/10 flex items-center justify-center text-rose-500 shrink-0 mt-1 text-xs">!</div>
              <p className="text-sm text-rose-400 font-bold">INTERDICTION D'ACTUALISER LA PAGE. Toute actualisation ou sortie de la page entraînera un échec immédiat.</p>
            </li>
            <li className="flex items-start gap-4">
              <div className="w-6 h-6 rounded bg-accent-green/10 flex items-center justify-center text-accent-green shrink-0 mt-1">3</div>
              <p className="text-sm text-slate-400">Score de réussite: <span className="text-white font-bold">75%</span>. En cas de succès, vous recevrez l'accréditation {config.next}.</p>
            </li>
          </ul>

          <button 
            onClick={startExam}
            disabled={loading}
            className="w-full primary-gradient py-5 rounded-2xl font-black text-xl shadow-xl shadow-accent-purple/20 active:scale-95 transition-all flex items-center justify-center gap-4 group"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>DÉMARRER L'EXAMEN <ChevronRight className="group-hover:translate-x-2 transition-transform" /></>}
          </button>
        </div>
      </div>
    );
  }

  if (finished) {
    const passed = (answers.filter((a, i) => a === questions[i].correctIndex).length / questions.length) >= 0.75;
    return (
      <div className="max-w-2xl mx-auto py-32 text-center space-y-10">
        {cheated ? (
          <div className="space-y-6">
            <AlertTriangle className="w-24 h-24 text-rose-500 mx-auto" />
            <h2 className="text-4xl font-black text-rose-500">SESSION INVALIDÉE</h2>
            <p className="text-slate-500 font-medium leading-relaxed">Une anomalie a été détectée durant votre examen (actualisation ou perte de focus). Votre tentative a été enregistrée comme un échec.</p>
          </div>
        ) : passed ? (
          <div className="space-y-6">
            <ShieldCheck className="w-24 h-24 text-accent-green mx-auto" />
            <h2 className="text-4xl font-black text-accent-green">FÉLICITATIONS !</h2>
            <p className="text-slate-400 text-xl font-medium">Vous avez été promu au rang : <span className="text-white font-black">{config.next}</span></p>
            <p className="text-slate-500">Votre accréditation est désormais active dans votre profil.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <XCircle className="w-24 h-24 text-rose-500 mx-auto" />
            <h2 className="text-4xl font-black text-rose-500">SCORE INSUFFISANT</h2>
            <p className="text-slate-500 font-medium">Vous n'avez pas atteint les 75% requis. Étudiez davantage les modules de cours et réessayez plus tard.</p>
          </div>
        )}
        <button 
          onClick={() => navigate('/dashboard')}
          className="px-10 py-4 bg-white/5 border border-white/10 rounded-2xl font-black uppercase text-sm hover:bg-white/10 transition-all"
        >
          Retour au Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-accent-purple/10 rounded-xl flex items-center justify-center">
            <Timer className="w-6 h-6 text-accent-purple" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Temps Restant</p>
            <p className={cn("text-2xl font-mono font-black", timeLeft < 60 ? "text-rose-500 animate-pulse" : "text-white")}>{formatTime(timeLeft)}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Progression</p>
          <p className="text-2xl font-mono font-black">{currentIndex + 1} / {questions.length}</p>
        </div>
      </div>

      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-accent-purple shadow-[0_0_20px_rgba(168,85,247,0.4)]"
          initial={{ width: 0 }}
          animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      <motion.div 
        key={currentIndex}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="glass-panel p-10 space-y-10"
      >
        <h2 className="text-2xl font-bold leading-relaxed">{questions[currentIndex]?.text}</h2>
        
        <div className="grid grid-cols-1 gap-4">
          {questions[currentIndex]?.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => {
                const newAns = [...answers];
                newAns[currentIndex] = i;
                setAnswers(newAns);
              }}
              className={cn(
                "p-6 rounded-2xl text-left font-bold transition-all border-2 flex justify-between items-center",
                answers[currentIndex] === i 
                  ? "bg-accent-purple/20 border-accent-purple text-white shadow-lg shadow-accent-purple/10" 
                  : "bg-white/[0.02] border-white/5 text-slate-500 hover:border-white/10 hover:bg-white/[0.04]"
              )}
            >
              <span>{opt}</span>
              {answers[currentIndex] === i && <ShieldCheck className="w-5 h-5 text-accent-purple" />}
            </button>
          ))}
        </div>

        <div className="pt-10 flex justify-between">
          <button 
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex(prev => prev - 1)}
            className="px-8 py-3 rounded-xl font-bold text-slate-500 hover:text-white transition-all disabled:opacity-0"
          >
            Précédent
          </button>
          
          {currentIndex === questions.length - 1 ? (
             <button 
                onClick={() => submitExam()}
                disabled={loading}
                className="px-10 py-4 primary-gradient rounded-xl font-black text-sm uppercase tracking-widest shadow-xl shadow-accent-purple/20"
             >
                Terminer l'Examen
             </button>
          ) : (
            <button 
              onClick={() => setCurrentIndex(prev => prev + 1)}
              disabled={answers[currentIndex] === undefined}
              className="px-10 py-4 bg-white/10 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-white/20 transition-all disabled:opacity-30"
            >
              Suivant
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function XCircle(props: any) {
  return (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>
    </svg>
  );
}
