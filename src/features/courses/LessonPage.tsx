import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, where, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Play, FileText, CheckCircle2, Lock, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { ChambreClose } from '../../components/ChambreClose';
import Markdown from 'react-markdown';

interface Module {
  id: string;
  title: string;
  order: number;
}

interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  type: 'text' | 'video' | 'pdf' | 'quiz';
  content: string;
  isPremium: boolean;
  order: number;
}

export function LessonPage() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    if (!courseId) return;
    
    // Fetch course info
    getDoc(doc(db, 'courses', courseId)).then(s => setCourse(s.data()));

    // Fetch modules
    const qM = query(collection(db, `courses/${courseId}/modules`), orderBy('order', 'asc'));
    const unsubM = onSnapshot(qM, (snap) => {
      setModules(snap.docs.map(d => ({ id: d.id, ...d.data() } as Module)));
    });

    // Fetch lessons
    const qL = query(collection(db, `courses/${courseId}/lessons`), orderBy('order', 'asc'));
    const unsubL = onSnapshot(qL, (snap) => {
      const allL = snap.docs.map(d => ({ id: d.id, ...d.data() } as Lesson));
      setLessons(allL);
      if (lessonId) {
        setCurrentLesson(allL.find(l => l.id === lessonId) || allL[0]);
      } else {
        setCurrentLesson(allL[0]);
      }
    });

    return () => { unsubM(); unsubL(); };
  }, [courseId, lessonId]);

  if (!course || !currentLesson) return null;

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in duration-500">
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-80 space-y-6">
        <button 
          onClick={() => navigate('/courses')}
          className="flex items-center gap-2 text-slate-500 hover:text-white font-bold text-xs uppercase tracking-widest transition-colors mb-6"
        >
          <ChevronLeft className="w-4 h-4" /> Retour à l'Académie
        </button>

        <div className="glass-panel p-6 space-y-8">
           <div>
              <h2 className="text-xl font-black tracking-tight">{course.title}</h2>
              <div className="h-1.5 w-full bg-white/5 rounded-full mt-4 overflow-hidden">
                 <div className="h-full bg-accent-purple w-1/3 rounded-full" />
              </div>
              <p className="text-[10px] font-black text-slate-500 mt-2 uppercase">Progression: 33%</p>
           </div>

           <div className="space-y-6">
              {modules.map(mod => (
                <div key={mod.id} className="space-y-3">
                   <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">{mod.title}</h4>
                   <div className="space-y-1">
                      {lessons.filter(l => l.moduleId === mod.id).map(lesson => (
                        <button
                          key={lesson.id}
                          onClick={() => {
                            setCurrentLesson(lesson);
                            navigate(`/courses/${courseId}/lessons/${lesson.id}`);
                          }}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold transition-all text-left group",
                            currentLesson.id === lesson.id 
                              ? "bg-accent-purple/20 text-accent-purple border border-accent-purple/30" 
                              : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                          )}
                        >
                          {lesson.type === 'video' ? <Play className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
                          <span className="flex-1 truncate">{lesson.title}</span>
                          {lesson.isPremium && !course.isPremium && <Lock className="w-3 h-3 text-amber-500" />}
                        </button>
                      ))}
                   </div>
                </div>
              ))}
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 space-y-8">
        <ChambreClose type="University">
           <div className="space-y-10 max-w-4xl mx-auto">
              <header className="space-y-4">
                 <div className="flex items-center gap-3">
                   <span className="px-2 py-1 rounded bg-accent-purple/10 text-accent-purple text-[10px] font-black uppercase tracking-widest">{currentLesson.type}</span>
                   <span className="text-slate-500 text-xs font-bold tracking-widest uppercase">Lesson {currentLesson.order}</span>
                 </div>
                 <h1 className="text-4xl font-black tracking-tight">{currentLesson.title}</h1>
              </header>

              <div className="prose prose-invert max-w-none">
                 {currentLesson.type === 'video' ? (
                   <div className="aspect-video bg-black rounded-3xl border border-white/10 flex items-center justify-center group cursor-pointer relative overflow-hidden shadow-2xl">
                     <div className="absolute inset-0 bg-accent-purple/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                     <div className="w-20 h-20 bg-accent-purple rounded-full flex items-center justify-center shadow-2xl shadow-accent-purple/40 group-hover:scale-110 transition-transform relative z-10">
                        <Play className="text-white w-8 h-8 fill-white" />
                     </div>
                     <p className="absolute bottom-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Connecté au Serveur de Streaming ECHATS</p>
                   </div>
                 ) : (
                    <div className="markdown-body text-slate-300 leading-relaxed space-y-6">
                      <Markdown>{currentLesson.content}</Markdown>
                    </div>
                 )}
              </div>

              <div className="pt-10 border-t border-white/5 flex items-center justify-between">
                 <button className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-white transition-all">
                    <ChevronLeft className="w-4 h-4" /> Leçon Précédente
                 </button>
                 <button className="px-8 py-4 bg-accent-purple text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-accent-purple/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                    Marquer comme terminé <CheckCircle2 className="w-4 h-4" />
                 </button>
              </div>
           </div>
        </ChambreClose>
      </main>
    </div>
  );
}
