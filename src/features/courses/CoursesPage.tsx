import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { BookOpen, Star, ChevronRight, Search, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';

interface Course {
  id: string;
  title: string;
  description?: string;
  category: string;
  isPremium: boolean;
  image?: string;
}

export function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, 'courses'), orderBy('order', 'asc'));
    return onSnapshot(q, (snap) => {
      setCourses(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course)));
    });
  }, []);

  const categories = ['all', 'Forensics', 'Red Team', 'Blue Team', 'Réseau', 'OSINT'];

  const filtered = filter === 'all' ? courses : courses.filter(c => c.category === filter);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase">Académie de Guerre</h1>
          <p className="text-slate-500 font-medium tracking-tight">Formation offensive et défensive de pointe.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-accent-purple transition-colors" />
            <input 
              placeholder="Rechercher un module..." 
              className="bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-3 text-sm focus:outline-none focus:border-accent-purple/50 transition-all w-64"
            />
          </div>
        </div>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={cn(
              "px-6 py-2 rounded-xl font-bold text-xs uppercase tracking-widest transition-all whitespace-nowrap border",
              filter === cat 
                ? "bg-accent-purple border-accent-purple text-white shadow-lg shadow-accent-purple/20" 
                : "bg-white/5 border-white/5 text-slate-500 hover:text-white"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((course, i) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => navigate(`/courses/${course.id}`)}
            className="glass-panel group overflow-hidden cursor-pointer hover:border-accent-purple/30 transition-all flex flex-col"
          >
            <div className="relative h-48 overflow-hidden bg-slate-900 flex items-center justify-center">
              {course.image ? (
                <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              ) : (
                <BookOpen className="w-16 h-16 text-slate-800" />
              )}
              {course.isPremium && (
                <div className="absolute top-4 right-4 bg-amber-500 text-black px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest shadow-lg">
                  PREMIUM
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
            </div>
            
            <div className="p-6 space-y-4 flex-1 flex flex-col">
              <div className="flex-1">
                <p className="text-[10px] font-black text-accent-purple uppercase tracking-[0.2em] mb-2">{course.category}</p>
                <h3 className="text-xl font-bold tracking-tight line-clamp-1">{course.title}</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed mt-2 line-clamp-2">
                  {course.description || "Module d'entraînement spécialisé pour les opérateurs cyber."}
                </p>
              </div>
              
              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                   <span className="text-xs font-bold text-slate-400">4.9</span>
                </div>
                <button className="flex items-center gap-2 text-xs font-black uppercase text-accent-purple group-hover:gap-4 transition-all">
                   Démarrer <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
