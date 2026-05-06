import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  User, 
  Mail, 
  MapPin, 
  Calendar, 
  Trophy, 
  Target, 
  Zap, 
  Edit2, 
  Camera,
  Shield,
  Clock,
  History
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export function ProfilePage() {
  const { userData } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    username: userData?.username || '',
    bio: (userData as any)?.bio || '',
    country: (userData as any)?.country || 'CG'
  });

  const handleSave = async () => {
    if (!userData?.uid) return;
    try {
      await updateDoc(doc(db, 'users', userData.uid), editedData);
      setIsEditing(false);
    } catch (e) {
       console.error(e);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      <header className="relative h-64 rounded-3xl overflow-hidden group">
        <img 
          src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&q=80" 
          className="w-full h-full object-cover opacity-40" 
          alt="Banner"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-dark via-bg-dark/20 to-transparent" />
        
        <div className="absolute -bottom-10 left-10 flex items-end gap-6">
          <div className="relative group">
            <div className="w-32 h-32 rounded-3xl bg-surface-dark border-4 border-bg-dark overflow-hidden shadow-2xl relative">
              <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${userData?.username}`} alt="Avatar" />
              <button className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-8 h-8 text-white" />
              </button>
            </div>
            <div className="absolute -top-2 -right-2 bg-accent-green p-1.5 rounded-lg shadow-lg">
               <Shield className="w-4 h-4 text-slate-900" />
            </div>
          </div>
          
          <div className="pb-4 space-y-1">
            <h1 className="text-3xl font-black tracking-tighter">{userData?.username}</h1>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest flex items-center gap-2">
              <MapPin className="w-3 h-3" /> {editedData.country} • MEMBRE DEPUIS {new Date(userData?.createdAt || '').getFullYear() || 2024}
            </p>
          </div>
        </div>
        
        <button 
          onClick={() => setIsEditing(true)}
          className="absolute bottom-4 right-4 px-4 py-2 bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-xl border border-white/10 text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all"
        >
          <Edit2 className="w-3 h-3" /> Éditer le profil
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mt-16 pt-10">
        <div className="space-y-8">
          <section className="glass-panel p-8 space-y-6">
            <h3 className="text-xs font-black text-slate-600 uppercase tracking-[0.2em] border-b border-white/5 pb-4">À propos</h3>
            <p className="text-sm text-slate-400 leading-relaxed italic">
              {editedData.bio || "Aucune description fournie par l'utilisateur."}
            </p>
            <div className="space-y-4 pt-2">
               <div className="flex items-center gap-3 text-sm text-slate-500">
                  <Mail className="w-4 h-4 text-indigo-400" />
                  <span>{userData?.email}</span>
               </div>
               <div className="flex items-center gap-3 text-sm text-slate-500">
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  <span>Dernière connexion: {new Date().toLocaleDateString()}</span>
               </div>
            </div>
          </section>

          <section className="glass-panel p-8 bg-accent-purple/5 border-accent-purple/10">
             <div className="flex items-center gap-4 mb-4">
                <Zap className="w-8 h-8 text-accent-purple fill-current" />
                <div>
                   <h4 className="font-bold">Abonnement Premium</h4>
                   <p className="text-[10px] text-slate-500 uppercase font-black">Statut: {userData?.isPremium ? 'Actif' : 'Inactif'}</p>
                </div>
             </div>
             {!userData?.isPremium && (
               <button className="w-full bg-accent-purple text-white py-3 rounded-xl font-bold text-sm tracking-tight hover:scale-105 transition-transform shadow-lg shadow-accent-purple/20">
                  Passer PRO maintenant
               </button>
             )}
          </section>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
             {[
               { label: 'Score', val: userData?.pts, icon: Trophy, color: 'text-amber-500' },
               { label: 'Soumissions', val: userData?.solvedCTF?.length, icon: Target, color: 'text-accent-green' },
               { label: 'Série', val: userData?.streak, icon: Zap, color: 'text-accent-orange' },
               { label: 'Niveau', val: userData?.level, icon: Award, color: 'text-accent-purple' },
             ].map((s, i) => (
                <div key={i} className="glass-panel p-5 text-center group hover:bg-white/[0.08] transition-colors">
                   <s.icon className={cn("w-5 h-5 mx-auto mb-2", s.color)} />
                   <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{s.label}</p>
                   <p className="text-xl font-black">{s.val || 0}</p>
                </div>
             ))}
          </div>

          <section className="space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <History className="w-5 h-5 text-accent-cyan" /> Activité récente
            </h3>
            <div className="glass-panel overflow-hidden">
               {userData?.solvedCTF && userData.solvedCTF.length > 0 ? (
                 <div className="divide-y divide-white/5">
                   {userData.solvedCTF.slice(0, 5).map((id, i) => (
                     <div key={id} className="p-4 flex items-center justify-between hover:bg-white/[0.02]">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 bg-accent-green/10 rounded-xl flex items-center justify-center">
                              <Target className="w-5 h-5 text-accent-green" />
                           </div>
                           <div>
                              <p className="text-sm font-bold">Challenge Résolu: #{id.substring(0, 8)}</p>
                              <p className="text-[10px] text-slate-500">Confirmé sur la blockchain ECHATS</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className="text-xs font-bold text-accent-green uppercase font-mono">+POINTS</p>
                        </div>
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="p-12 text-center space-y-4">
                    <Clock className="w-12 h-12 text-slate-800 mx-auto" />
                    <p className="text-slate-500 font-bold">Aucune activité enregistrée sur ce compte.</p>
                 </div>
               )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

import { Award } from 'lucide-react';
