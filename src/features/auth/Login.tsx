import { ShieldCheck, Zap, ArrowRight, Lock, Globe } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginProps {
  onLogin: () => void;
}

export function Login({ onLogin }: LoginProps) {
  return (
    <div className="min-h-screen bg-bg-dark flex flex-col md:flex-row overflow-hidden">
      {/* Visual Side */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-surface-dark items-center justify-center p-20 overflow-hidden border-r border-white/5">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
           <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-accent-purple/10 blur-[120px] rounded-full animate-pulse" />
           <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-accent-green/5 blur-[120px] rounded-full" />
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
        </div>

        <div className="relative z-10 space-y-8 max-w-lg">
          <div className="inline-flex items-center gap-3 bg-accent-purple/10 px-4 py-2 rounded-full border border-accent-purple/20">
            <Zap className="w-4 h-4 text-accent-purple fill-current" />
            <span className="text-[10px] font-black text-accent-purple uppercase tracking-widest leading-none">Cybersecurity Excellence</span>
          </div>
          
          <h1 className="text-7xl font-black tracking-tighter leading-[0.9] text-white">
            APPRENDS. <br />
            <span className="text-accent-purple">PRATIQUE.</span> <br />
            MAÎTRISE.
          </h1>
          
          <p className="text-lg text-slate-500 font-medium leading-relaxed">
            Rejoignez la plateforme de formation en cybersécurité n°1 en Afrique francophone. Challenges CTF, cours avancés et terminal IA.
          </p>

          <div className="grid grid-cols-3 gap-8 pt-10 border-t border-white/5">
            {[
              { val: '2.5k+', label: 'Étudiants' },
              { val: '150+', label: 'Challenges' },
              { val: '24/7', label: 'Support IA' },
            ].map((s, i) => (
              <div key={i}>
                <p className="text-2xl font-black text-white">{s.val}</p>
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-20 relative">
        <div className="w-full max-w-md space-y-12">
          <div className="flex flex-col items-center text-center space-y-4">
             <div className="w-16 h-16 bg-accent-purple rounded-3xl flex items-center justify-center shadow-2xl shadow-accent-purple/20 mb-2">
                <ShieldCheck className="w-10 h-10 text-white" />
             </div>
             <h2 className="text-3xl font-black tracking-tighter">Bienvenue sur ECHATS PRO</h2>
             <p className="text-slate-500 font-medium">Connectez-vous pour accéder à votre laboratoire.</p>
          </div>

          <div className="space-y-6">
             <button 
                onClick={onLogin}
                className="w-full bg-white text-slate-900 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 hover:bg-slate-100 transition-colors shadow-xl active:scale-95 duration-200"
              >
               <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
               Continuer avec Google
             </button>

             <div className="relative flex items-center py-4">
                <div className="flex-grow border-t border-white/5"></div>
                <span className="flex-shrink mx-4 text-[10px] font-black text-slate-700 uppercase tracking-[0.2em]">ou accès invité</span>
                <div className="flex-grow border-t border-white/5"></div>
             </div>

             <div className="glass-panel p-8 space-y-6 border-white/5">
                <div className="space-y-4 text-center">
                   <p className="text-sm text-slate-400 font-medium leading-relaxed">
                      L'authentification par email/mot de passe arrive bientôt pour ECHATS PRO v10.0.
                   </p>
                   <div className="flex justify-center gap-4 py-2">
                      <div className="flex flex-col items-center gap-1 opacity-40">
                         <Globe className="w-4 h-4" />
                         <span className="text-[8px] font-black uppercase">Africa</span>
                      </div>
                      <div className="flex flex-col items-center gap-1 opacity-40">
                         <Lock className="w-4 h-4" />
                         <span className="text-[8px] font-black uppercase">Secure</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          <p className="text-center text-[10px] text-slate-700 font-black uppercase tracking-widest mt-10">
            &copy; 2024 Black Hawk Lab — Brazzaville, Congo
          </p>
        </div>
      </div>
    </div>
  );
}
