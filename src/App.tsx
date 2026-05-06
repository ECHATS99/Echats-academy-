import { Routes, Route, Navigate } from 'react-router-dom';
import { ExamPage } from './features/exams/ExamPage';
import { useAuth } from './context/AuthContext';
import { Navigation } from './components/Navigation';
import { Dashboard } from './features/dashboard/Dashboard';
import { CTFPage } from './features/ctf/CTFPage';
import { CTFDetailPage } from './features/ctf/CTFDetailPage';
import { TerminalPage } from './features/terminal/TerminalPage';
import { CoursesPage } from './features/courses/CoursesPage';
import { LessonPage } from './features/courses/LessonPage';
import { AdminPage } from './features/admin/AdminPage';
import { Leaderboard } from './features/leaderboard/Leaderboard';
import { ProfilePage } from './features/profile/ProfilePage';
import { Login } from './features/auth/Login';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from './lib/firebase';
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useEffect } from 'react';
import { seedInitialData } from './services/seedData.ts';
import { handleFirestoreError, OperationType } from './lib/firestore-errors';
import './lib/i18n';

function App() {
  const { user, userData, loading } = useAuth();

  useEffect(() => {
    if (userData?.role === 'admin') {
      seedInitialData().catch(console.error);
    }
  }, [userData]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const userRef = doc(db, 'users', user.uid);
      let userSnap;
      try {
        userSnap = await getDoc(userRef);
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
        return;
      }
      
      if (!userSnap.exists()) {
        const isAdmin = user.email === 'eliothm071@gmail.com';
        const userDataModel = {
          uid: user.uid,
          email: user.email!,
          username: user.displayName || user.email?.split('@')[0] || 'User',
          pts: 0,
          streak: 0,
          rank: 0,
          role: isAdmin ? 'admin' : 'user',
          solvedCTF: [],
          isPremium: isAdmin,
          language: 'fr',
          createdAt: new Date().toISOString(),
          level: 1,
          toolsInstalled: {}
        };
        
        try {
          await setDoc(userRef, userDataModel);
          
          await setDoc(doc(db, 'leaderboard', user.uid), {
            uid: user.uid,
            username: userDataModel.username,
            pts: 0,
            solved: 0,
            updatedAt: new Date().toISOString()
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
        }
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen bg-bg-dark flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-accent-purple/20 rounded-full" />
          <div className="absolute top-0 w-16 h-16 border-4 border-accent-purple border-t-transparent rounded-full animate-spin" />
          <ShieldCheck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-accent-purple" />
        </div>
        <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.3em] animate-pulse">Initialisation du noyau...</p>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row overflow-x-hidden selection:bg-accent-purple selection:text-white">
      <Navigation />
      
      <main className="flex-1 lg:pl-64 pt-16 lg:pt-0 pb-24 lg:pb-0 px-6 lg:px-10 overflow-x-hidden">
        <div className="max-w-7xl mx-auto py-10">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/ctf" element={<CTFPage />} />
            <Route path="/ctf/:id" element={<CTFDetailPage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/courses/:courseId" element={<LessonPage />} />
            <Route path="/courses/:courseId/lessons/:lessonId" element={<LessonPage />} />
            <Route path="/terminal" element={<TerminalPage />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/exams" element={<ExamPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;
