import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Eye, Lock, Maximize2, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';

interface ChambreCloseProps {
  children: React.ReactNode;
  type: 'University' | 'Enterprise' | 'LawEnforcement';
}

export function ChambreClose({ children, type }: ChambreCloseProps) {
  const { userData } = useAuth();
  const [isSecure, setIsSecure] = useState(true);

  useEffect(() => {
    // Disable right click
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    // Warn on screenshot (simple alert simulation as we can't fully block in browser)
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen' || (e.ctrlKey && e.key === 'p')) {
        alert("ALERTE SÉCURITÉ: La capture d'écran est interdite dans cette zone.");
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keyup', handleKeyUp);
    
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div className="relative min-h-[600px] rounded-3xl overflow-hidden border-2 border-accent-purple/20 bg-slate-950">
      {/* Background Watermark */}
      <div className="absolute inset-0 pointer-events-none z-10 opacity-[0.03] select-none text-slate-500 font-mono text-[10px] leading-relaxed flex flex-wrap gap-10 p-10 overflow-hidden uppercase">
        {Array.from({ length: 100 }).map((_, i) => (
          <span key={i}>{userData?.email} — {new Date().toLocaleDateString()} — {userData?.uid?.substring(0, 8)}</span>
        ))}
      </div>

      <header className="px-10 py-6 border-b border-white/5 flex items-center justify-between relative z-20">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center border border-rose-500/20">
            <Lock className="w-5 h-5 text-rose-500" />
          </div>
          <div>
            <h2 className="text-lg font-black uppercase tracking-tighter">PROTOCOLE {type.toUpperCase()}</h2>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-accent-green rounded-full animate-pulse" />
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Accès Sécurisé Restreint</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="text-right hidden sm:block">
              <p className="text-[10px] font-black text-slate-500 uppercase">Audit en cours</p>
              <p className="text-xs font-mono font-bold text-accent-orange">SES-ID: {Math.random().toString(36).substring(7).toUpperCase()}</p>
           </div>
           <button className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors">
              <Maximize2 className="w-4 h-4 text-slate-500" />
           </button>
        </div>
      </header>

      <div className="p-10 relative z-20">
        <div className={cn(
          "transition-all duration-700",
          !isSecure ? "blur-xl grayscale" : ""
        )}>
          {children}
        </div>
      </div>

      {!isSecure && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md">
           <AlertTriangle className="w-20 h-20 text-rose-500 mb-6 animate-bounce" />
           <h3 className="text-3xl font-black text-rose-500 tracking-tighter">VIOLATION DE SÉCURITÉ</h3>
           <p className="text-slate-400 mt-2 font-medium">Session suspendue pour audit immédiat.</p>
        </div>
      )}

      <footer className="absolute bottom-0 inset-x-0 p-10 pointer-events-none z-10 flex justify-end">
         <div className="flex items-center gap-2 opacity-50">
            <ShieldAlert className="w-4 h-4 text-slate-500" />
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">CHAMBRE CLOSE — PROTECTED CONTENT</span>
         </div>
      </footer>
    </div>
  );
}
