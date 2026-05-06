import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Terminal as TerminalIcon, ShieldAlert, Cpu, Lock, Globe } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { cn } from '../../lib/utils';

export function TerminalPage() {
  const { userData } = useAuth();
  const [history, setHistory] = useState<Array<{ type: 'cmd' | 'res' | 'error', text: string }>>([
    { type: 'res', text: 'ECHATS PRO v8.1 Mondial — Kernel Initialisé' },
    { type: 'res', text: `Tapez 'help' pour voir les commandes disponibles.` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [history]);

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const cmd = input.trim().toLowerCase();
    setHistory(prev => [...prev, { type: 'cmd', text: input }]);
    setInput('');
    setIsLoading(true);

    // Initial check for simple local commands
    if (cmd === 'help') {
      setHistory(prev => [...prev, { type: 'res', text: 'Commandes supportées: help, clear, ls, apt install [tool], whoami, status' }]);
      setIsLoading(false);
      return;
    }

    if (cmd === 'clear') {
      setHistory([]);
      setIsLoading(false);
      return;
    }

    if (cmd === 'whoami') {
      setHistory(prev => [...prev, { type: 'res', text: userData?.username || 'root' }]);
      setIsLoading(false);
      return;
    }

    if (cmd === 'status') {
      setHistory(prev => [...prev, { type: 'res', text: `Role: ${userData?.role} | Subscriptions: ${userData?.plan} | Active Labs: ${userData?.solvedCTF?.length}` }]);
      setIsLoading(false);
      return;
    }

    // AI Processing for complex simulation
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

      const prompt = `Tu es un terminal Linux Kali simulé pour ECHATS Pro. 
      L'utilisateur a tapé: ${cmd}. 
      Réponds comme un vrai terminal (texte brut). 
      Si c'est "apt install [quelque chose]", confirme l'installation.
      Sois bref et technique.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
      });
      
      let text = response.text || '';

      // Detection of installation to persist in Firestore
      if (cmd.startsWith('apt install')) {
        const tool = cmd.split(' ')[2];
        if (tool && userData?.uid) {
          await updateDoc(doc(db, 'users', userData.uid), {
            [`toolsInstalled.${tool}`]: true
          });
        }
      }

      setHistory(prev => [...prev, { type: 'res', text }]);
    } catch (err) {
      setHistory(prev => [...prev, { type: 'error', text: 'Erreur de connexion au noyau IA.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-12rem)] flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-accent-purple/10 rounded-xl flex items-center justify-center">
            <TerminalIcon className="w-6 h-6 text-accent-purple" />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter">Terminal IA Simulé</h1>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Zone d'entraînement contrôlée</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-accent-green/10 rounded-full border border-accent-green/20">
          <div className="w-2 h-2 bg-accent-green rounded-full animate-pulse" />
          <span className="text-[10px] font-black text-accent-green uppercase tracking-widest">Noyau Actif</span>
        </div>
      </header>

      <div className="flex-1 bg-black border border-white/10 rounded-2xl p-6 font-mono text-sm overflow-hidden flex flex-col shadow-2xl">
        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-2 mb-4 scrollbar-hide">
          {history.map((entry, i) => (
            <div key={i} className={cn(
              "leading-relaxed",
              entry.type === 'cmd' ? "text-accent-cyan pl-2 border-l-2 border-accent-cyan/20" : 
              entry.type === 'error' ? "text-rose-500" : "text-slate-300"
            )}>
              {entry.type === 'cmd' && <span className="text-slate-600 mr-2">root@echats:~$</span>}
              <pre className="whitespace-pre-wrap">{entry.text}</pre>
            </div>
          ))}
          {isLoading && <div className="text-accent-purple animate-pulse">Traitement par le noyau...</div>}
        </div>

        <form onSubmit={handleCommand} className="flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/5">
          <span className="text-accent-cyan font-black">root@echats:~$</span>
          <input 
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1 bg-transparent border-none outline-none text-accent-cyan placeholder:text-slate-700 font-bold"
            placeholder="Saisissez une commande ou installez un outil..."
          />
        </form>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Outils Installés', value: Object.keys(userData?.toolsInstalled || {}).length, icon: Cpu },
          { label: 'Mode Sécurisé', value: 'Activé', icon: Lock },
          { label: 'Géo-Fencing', value: userData?.country || 'Global', icon: Globe },
        ].map((item, i) => (
          <div key={i} className="glass-panel p-4 flex items-center gap-4">
             <item.icon className="w-5 h-5 text-slate-500" />
             <div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">{item.label}</p>
                <p className="text-sm font-bold text-white mt-1 uppercase tracking-tight">{item.value}</p>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
