import { useAuth } from '../../context/AuthContext';
import { useChallenges } from '../../hooks/useCTF';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { 
  Trophy, 
  Target, 
  Zap, 
  TrendingUp, 
  Clock, 
  ChevronRight,
  ShieldCheck,
  Star,
  Activity,
  Award
} from 'lucide-react';

export function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userData } = useAuth();
  const { challenges } = useChallenges();
  const [globalStats] = useState({ visitors: 142050, activeHackers: 852, totalSubmissions: 450000 });

  const stats = [
    { label: t('dashboard.pts'), value: userData?.pts || 0, icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: t('dashboard.rank'), value: `#${(userData?.rank || 1204).toLocaleString()}`, icon: Trophy, color: 'text-accent-cyan', bg: 'bg-accent-cyan/10' },
    { label: t('dashboard.level'), value: userData?.level || 'Débutant', icon: Star, color: 'text-accent-purple', bg: 'bg-accent-purple/10' },
    { label: t('dashboard.streak'), value: `${userData?.streak || 0}j`, icon: Zap, color: 'text-accent-orange', bg: 'bg-accent-orange/10' },
  ];

  const categories = [
    { id: 'web', name: 'Web', count: 120, resolved: 45, icon: 'fa-globe' },
    { id: 'osint', name: 'OSINT', count: 85, resolved: 12, icon: 'fa-eye' },
    { id: 'forensic', name: 'Forensic', count: 95, resolved: 8, icon: 'fa-search' },
    { id: 'redteam', name: 'Red Team', count: 60, resolved: 15, icon: 'fa-skull' },
  ];

  return (
    <div className="space-y-10 pb-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight">{t('dashboard.welcome', { name: userData?.username })} 👋</h1>
          <p className="text-slate-500 font-medium tracking-tight">System Status: <span className="text-accent-green font-black">OPERATIVE</span></p>
        </div>
        <div className="flex items-center gap-4">
           <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-center">
              <p className="text-[9px] font-black text-slate-500 uppercase">Live Multi-Region Status</p>
              <p className="text-sm font-mono font-bold text-accent-cyan">STABLE</p>
           </div>
           <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-center">
              <p className="text-[9px] font-black text-slate-500 uppercase">Live Nodes</p>
              <p className="text-sm font-mono font-bold text-accent-green">{globalStats.activeHackers} ALIVE</p>
           </div>
        </div>
      </header>

      {/* Grid de Stats V10 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-panel p-6 flex items-center gap-5 group hover:bg-white/[0.08] transition-all cursor-default"
          >
            <div className={cn("p-4 rounded-2xl group-hover:scale-110 transition-transform", stat.bg)}>
              <stat.icon className={cn("w-6 h-6", stat.color)} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          {/* Section Official Ranking */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-accent-green" /> CLASSEMENT OFFICIEL
              </h2>
              <p className="text-[10px] font-black text-slate-500 uppercase">Mise à jour: Temps Réel</p>
            </div>
            <div className="glass-panel overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/[0.02] border-b border-white/5">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Rang</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Opérateur</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Niveau</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Crédits</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {[
                    { rank: 1, name: 'Root_Master', level: 'Expert', pts: '45.2k', color: 'text-amber-500' },
                    { rank: 2, name: 'Cyber_Ghost', level: 'Pro', pts: '38.9k', color: 'text-slate-200' },
                    { rank: 3, name: 'Shadow_Walker', level: 'Pro', pts: '31.1k', color: 'text-orange-400' },
                    { rank: 4, name: 'NullPoint', level: 'Normal', pts: '29.8k', color: 'text-slate-400' },
                  ].map((dev) => (
                    <tr key={dev.rank} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4">
                         <div className={cn("w-6 h-6 rounded flex items-center justify-center font-black text-xs", dev.rank === 1 ? "bg-amber-500/20 text-amber-500" : "bg-white/5 text-slate-500")}>
                           {dev.rank}
                         </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-sm tracking-tight group-hover:text-accent-cyan transition-colors">{dev.name}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-[10px] font-black bg-white/5 px-2 py-1 rounded-md uppercase">{dev.level}</span>
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-accent-green">{dev.pts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Section Stats Visiteurs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="glass-panel p-8 relative overflow-hidden group">
                <Activity className="w-16 h-16 text-accent-cyan opacity-10 absolute -right-4 -bottom-4 group-hover:scale-125 transition-transform duration-500" />
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Visiteurs Mondiaux</h4>
                <div className="flex items-end gap-3">
                   <p className="text-4xl font-black font-mono tracking-tighter">{globalStats.visitors.toLocaleString()}</p>
                   <span className="text-accent-green text-xs font-bold mb-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +15%</span>
                </div>
                <p className="text-[9px] text-slate-500 mt-2 font-bold uppercase tracking-widest">Dernières 24 Heures</p>
             </div>
             <div className="glass-panel p-8 relative overflow-hidden group">
                <ShieldCheck className="w-16 h-16 text-accent-green opacity-10 absolute -right-4 -bottom-4 group-hover:scale-125 transition-transform duration-500" />
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Intrusions Bloquées</h4>
                <div className="flex items-end gap-3">
                   <p className="text-4xl font-black font-mono tracking-tighter">142.8k</p>
                   <span className="text-accent-cyan text-xs font-bold mb-1 flex items-center gap-1"><Zap className="w-3 h-3" /> SECURE</span>
                </div>
                <p className="text-[9px] text-slate-500 mt-2 font-bold uppercase tracking-widest">Firewall Network Status</p>
             </div>
          </div>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Target className="w-5 h-5 text-accent-green" /> Recommandé pour vous
              </h2>
              <button className="text-xs font-black text-accent-green uppercase flex items-center gap-1 hover:gap-2 transition-all">
                Tout voir <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {challenges.slice(0, 4).map((challenge) => (
                <div 
                  key={challenge.id} 
                  onClick={() => navigate(`/ctf/${challenge.id}`)}
                  className="glass-panel p-4 flex items-center justify-between group hover:border-accent-purple/30 cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/5 rounded-xl border border-white/5 flex items-center justify-center group-hover:bg-indigo-500/10 transition-colors">
                      <Target className="w-6 h-6 text-slate-400 group-hover:text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm leading-tight">{challenge.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-black uppercase text-slate-500">{challenge.category}</span>
                        <span className="text-[9px] font-black text-indigo-400">+{challenge.points} PTS</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-white" />
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar Dashboard */}
        <div className="space-y-8">
          <section className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Activity className="w-5 h-5 text-accent-orange" /> Par catégories
            </h2>
            <div className="glass-panel p-6 space-y-4">
              {categories.map((cat) => (
                <div key={cat.id} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{cat.name}</span>
                    <span className="text-[10px] font-mono text-slate-500">{cat.resolved}/{cat.count}</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500 rounded-full" 
                      style={{ width: `${(cat.resolved / cat.count) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="glass-panel p-6 overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-10 blur-xl bg-accent-purple/50 rounded-full" />
            <Award className="w-8 h-8 text-accent-purple mb-4" />
            <h3 className="text-lg font-bold">Passer PRO</h3>
            <p className="text-sm text-slate-500 mt-1 mb-4">Débloquez 100% des cours et CTF, ainsi que le terminal IA illimité.</p>
            <button 
              onClick={() => window.location.href = '/exams'}
              className="w-full bg-accent-purple text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-accent-purple/20 active:scale-95 transition-all"
            >
              Passer l'Examen de Niveau
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
