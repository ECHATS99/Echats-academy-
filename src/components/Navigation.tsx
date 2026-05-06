import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, 
  Terminal as TerminalIcon, 
  BookOpen, 
  Trophy, 
  Shield, 
  Settings,
  ChefHat,
  Monitor,
  Menu,
  X,
  User,
  LogOut,
  Globe
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export function Navigation() {
  const { t, i18n } = useTranslation();
  const { userData, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { path: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { path: '/ctf', label: t('nav.ctf'), icon: TerminalIcon },
    { path: '/courses', label: t('nav.courses'), icon: BookOpen },
    { path: '/terminal', label: t('nav.terminal'), icon: Monitor },
    { path: '/leaderboard', label: t('nav.leaderboard'), icon: Trophy },
  ];

  if (userData?.role === 'admin') {
    navItems.push({ path: '/admin', label: t('nav.admin'), icon: Shield });
  }

  const toggleLanguage = () => {
    const langs = ['fr', 'en', 'ar', 'es', 'pt', 'hi', 'zh'];
    const current = i18n.language;
    const nextIdx = (langs.indexOf(current) + 1) % langs.length;
    i18n.changeLanguage(langs[nextIdx]);
  };

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-950 border-r border-white/5 fixed inset-y-0 z-50">
        <div className="p-8">
          <NavLink to="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-accent-purple rounded-xl flex items-center justify-center shadow-lg shadow-accent-purple/20 group-hover:scale-110 transition-transform">
              <Shield className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-black tracking-tighter text-white">ECHATS <span className="text-accent-purple">PRO</span></span>
          </NavLink>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center gap-4 px-4 py-3 rounded-xl font-bold transition-all group",
                isActive 
                  ? "bg-accent-purple border border-accent-purple shadow-lg shadow-accent-purple/20 text-white" 
                  : "text-slate-500 hover:text-white hover:bg-white/5 border border-transparent"
              )}
            >
              <item.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110")} />
              <span className="text-sm tracking-tight">{item.label}</span>
              {location.pathname === item.path && (
                <motion.div 
                  layoutId="activeNav"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-white"
                />
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 space-y-2 border-t border-white/5">
          <button 
            onClick={toggleLanguage}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl font-bold text-slate-500 hover:text-white hover:bg-white/5 transition-all text-sm uppercase tracking-widest"
          >
            <Globe className="w-5 h-5" />
            {i18n.language}
          </button>
          
          <div className="p-4 bg-white/5 rounded-2xl flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-accent-purple/20 flex items-center justify-center border border-accent-purple/20">
                <User className="text-accent-purple w-5 h-5" />
             </div>
             <div className="flex-1 overflow-hidden">
                <p className="text-xs font-black text-white truncate">{userData?.username}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase truncate">{userData?.level}</p>
             </div>
             <button onClick={logout} className="p-2 text-slate-500 hover:text-rose-500 transition-colors">
                <LogOut className="w-4 h-4" />
             </button>
          </div>
        </div>
      </aside>

      {/* MOBILE BOTTOM NAV */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-slate-950/80 backdrop-blur-xl border-t border-white/10 z-50 px-2 pt-2 pb-safe">
        <div className="flex items-center justify-around">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex flex-col items-center gap-1 p-3 rounded-2xl transition-all",
                isActive ? "text-accent-purple" : "text-slate-500"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* MOBILE TOP BAR */}
      <header className={cn(
        "lg:hidden fixed top-0 inset-x-0 z-40 transition-all px-6 py-4 flex items-center justify-between",
        isScrolled ? "bg-slate-950/80 backdrop-blur-xl border-b border-white/5" : "bg-transparent"
      )}>
        <span className="text-xl font-black tracking-tighter text-white">ECHATS <span className="text-accent-purple">PRO</span></span>
        <button 
          onClick={toggleLanguage}
          className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xs font-black uppercase"
        >
          {i18n.language}
        </button>
      </header>
    </>
  );
}
