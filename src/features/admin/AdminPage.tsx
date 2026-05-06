import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, getDocs, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { 
  Shield, 
  Terminal as TerminalIcon, 
  BookOpen, 
  Users, 
  Plus, 
  Trash2, 
  Edit3, 
  BarChart3, 
  Smartphone,
  Globe,
  Settings
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useTranslation } from 'react-i18next';

type AdminTab = 'stats' | 'ctf' | 'courses' | 'users' | 'config';

export function AdminPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<AdminTab>('stats');
  const [challenges, setChallenges] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    if (activeTab === 'ctf') {
      const snap = await getDocs(collection(db, 'challenges'));
      setChallenges(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } else if (activeTab === 'courses') {
      const snap = await getDocs(collection(db, 'courses'));
      setCourses(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } else if (activeTab === 'users') {
      const snap = await getDocs(collection(db, 'users'));
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }
  };

  const tabs: { id: AdminTab, icon: any, label: string }[] = [
    { id: 'stats', icon: BarChart3, label: 'Analytics' },
    { id: 'ctf', icon: TerminalIcon, label: 'Challenges CTF' },
    { id: 'courses', icon: BookOpen, label: 'Académie' },
    { id: 'users', icon: Users, label: 'Opérateurs' },
    { id: 'config', icon: Settings, label: 'Système' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase">Command Center</h1>
          <p className="text-slate-500 font-medium tracking-tight">Administration globale de l'infra ECHATS PRO.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-rose-500/10 rounded-full border border-rose-500/20">
           <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
           <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Zone Haute Sécurité</span>
        </div>
      </header>

      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide border-b border-white/5">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-6 py-4 flex items-center gap-3 font-bold text-xs uppercase tracking-widest transition-all border-b-2",
              activeTab === tab.id 
                ? "border-accent-purple text-white bg-accent-purple/5" 
                : "border-transparent text-slate-500 hover:text-white"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="min-h-[400px]">
        {activeTab === 'stats' && <StatsOverview />}
        {activeTab === 'ctf' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold uppercase tracking-tight">Base de données CTF</h2>
              <button className="px-4 py-2 bg-accent-purple text-white rounded-xl font-bold text-xs uppercase flex items-center gap-2 hover:scale-105 transition-all">
                 <Plus className="w-4 h-4" /> Nouveau Défis
              </button>
            </div>
            <div className="glass-panel overflow-hidden">
               <table className="w-full text-left border-collapse">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase">Titre</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase">Catégorie</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase">Points</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {challenges.map(c => (
                      <tr key={c.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-6 py-4 font-bold text-sm tracking-tight">{c.title}</td>
                        <td className="px-6 py-4">
                           <span className="text-[10px] font-black bg-white/5 px-2 py-1 rounded-md uppercase text-slate-400">{c.category}</span>
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-accent-green">{c.points}</td>
                        <td className="px-6 py-4 text-right">
                           <div className="flex justify-end gap-2">
                             <button className="p-2 bg-white/5 rounded-lg text-slate-500 hover:text-white transition-colors"><Edit3 className="w-4 h-4" /></button>
                             <button className="p-2 bg-rose-500/10 rounded-lg text-rose-500 hover:bg-rose-500 hover:text-white transition-all"><Trash2 className="w-4 h-4" /></button>
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>
          </div>
        )}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold uppercase tracking-tight">Gestion des Opérateurs</h2>
            <div className="glass-panel overflow-hidden">
               <table className="w-full text-left border-collapse">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase">Identifiant</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase">Email</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase">Plan</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase text-right">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {users.map(u => (
                      <tr key={u.id}>
                        <td className="px-6 py-4 font-bold text-sm">{u.username}</td>
                        <td className="px-6 py-4 text-xs text-slate-500 font-mono">{u.email}</td>
                        <td className="px-6 py-4">
                           <span className={cn(
                             "text-[9px] font-black px-2 py-1 rounded uppercase",
                             u.plan === 'Blaze' ? "bg-amber-500 text-black" : 
                             u.isPremium ? "bg-accent-purple text-white" : "bg-white/10 text-slate-400"
                           )}>{u.plan || (u.isPremium ? 'Premium' : 'Free')}</span>
                        </td>
                        <td className="px-6 py-4 text-right font-mono font-bold text-accent-cyan">{u.pts}</td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatsOverview() {
  const stats = [
    { label: 'MRR Estimates', value: '$8,450', sub: '+12% ce mois', icon: BarChart3, color: 'text-emerald-500' },
    { label: 'Opérateurs Actifs', value: '1,240', sub: 'DAU (Daily Active Users)', icon: Users, color: 'text-accent-purple' },
    { label: 'CTF Solve Rate', value: '68%', sub: 'Global success ratio', icon: TerminalIcon, color: 'text-accent-cyan' },
    { label: 'Network Load', value: '14%', sub: 'Infrastructure stable', icon: Globe, color: 'text-accent-green' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((s, i) => (
        <div key={i} className="glass-panel p-8 space-y-4">
           <div className={cn("p-4 rounded-2xl bg-white/5 w-fit", s.color)}>
              <s.icon className="w-6 h-6" />
           </div>
           <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{s.label}</p>
              <p className="text-3xl font-black tracking-tighter mt-1">{s.value}</p>
              <p className="text-[10px] font-bold text-slate-400 mt-2 italic">{s.sub}</p>
           </div>
        </div>
      ))}
    </div>
  );
}
