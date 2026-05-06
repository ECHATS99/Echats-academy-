import { collection, doc, setDoc, getDocs, query, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { hashFlag } from '../lib/security';

export async function seedInitialData() {
  const ctfRef = collection(db, 'challenges');
  const ctfSnap = await getDocs(query(ctfRef, limit(1)));

  if (ctfSnap.empty) {
    console.log('Seeding ECHATS PRO v8.1 Initial Data...');
    
    // --- CHALLENGES ---
    const challenges = [
      {
        id: 'nmap-ghost',
        title: 'Nmap Ghost Scan',
        description: 'Identifiez le port caché sur 10.10.250.1.',
        category: 'Réseau',
        difficulty: 'Facile',
        points: 50,
        flag: 'ECHATS{nmap_ghost_master}',
        hints: ['Essayez -p-', 'Port > 10000'],
        isPremium: false,
        solves: 1240,
        langs: ['fr', 'en']
      },
      {
        id: 'sqli-1',
        title: 'SQL Injection: Login Bypass',
        description: 'Contournez le login admin via SQL Injection.',
        category: 'Web',
        difficulty: 'Moyen',
        points: 250,
        flag: 'ECHATS{sqli_injection_success}',
        hints: ["' OR 1=1--"],
        isPremium: true,
        solves: 450,
        langs: ['fr', 'en', 'es']
      }
    ];

    for (const c of challenges) {
      const { flag, ...cData } = c;
      const targetHash = await hashFlag(flag);
      await setDoc(doc(db, 'challenges', c.id), {
        ...cData,
        flagHash: targetHash,
        createdAt: new Date().toISOString()
      });
    }

    // --- COURSES ---
    const courses = [
      {
        id: 'osint-101',
        title: 'Fondamentaux de l\'OSINT',
        description: 'Recherche de renseignement en sources ouvertes.',
        category: 'OSINT',
        isPremium: false,
        order: 1,
        langs: ['fr', 'en']
      },
      {
        id: 'red-team-basics',
        title: 'Red Team: Offensive Core',
        description: 'Les phases critiques d\'une intrusion.',
        category: 'Red Team',
        isPremium: true,
        order: 2,
        langs: ['fr', 'en']
      }
    ];

    for (const course of courses) {
      await setDoc(doc(db, 'courses', course.id), { 
        ...course, 
        createdAt: new Date().toISOString() 
      });
      
      const mId = `${course.id}-m1`;
      await setDoc(doc(db, `courses/${course.id}/modules`, mId), { id: mId, courseId: course.id, title: 'Phase Initiale', order: 1 });
      
      const lId = `${mId}-l1`;
      await setDoc(doc(db, `courses/${course.id}/lessons`, lId), {
        id: lId,
        moduleId: mId,
        title: 'Premier Briefing',
        type: 'text',
        content: '# Mission Briefing\n\nBienvenue Opérateur. Votre mission commence ici.',
        order: 1,
        isPremium: false
      });
    }

    // --- QUESTIONS ---
    await setDoc(doc(db, 'questions', 'q1'), {
      id: 'q1',
      text: "Quel outil est utilisé pour le scan réseau ?",
      options: ["Nmap", "Postman", "VS Code", "Steam"],
      correctIndex: 0,
      domain: "Réseau",
      difficulty: "Facile"
    });
  }
}
