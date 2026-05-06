import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  doc, 
  updateDoc, 
  arrayUnion, 
  onSnapshot, 
  orderBy, 
  increment, 
  writeBatch,
  addDoc
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { validateFlag } from '../lib/security';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'Facile' | 'Moyen' | 'Difficile';
  points: number;
  flagHash: string;
  image?: string;
  isPremium: boolean;
  solves: number;
  hint?: string;
}

export function useChallenges() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'challenges'), orderBy('points', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Challenge));
      setChallenges(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { challenges, loading };
}

export async function submitChallenge(challenge: Challenge, inputFlag: string) {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error('Utilisateur non connecté');

  const isCorrect = await validateFlag(inputFlag, challenge.flagHash);

  if (isCorrect) {
    const batch = writeBatch(db);
    const userRef = doc(db, 'users', userId);
    const leaderboardRef = doc(db, 'leaderboard', userId);
    const challengeRef = doc(db, 'challenges', challenge.id);

    // Update user: points, solved list, streak logic
    batch.update(userRef, {
      pts: increment(challenge.points),
      solvedCTF: arrayUnion(challenge.id)
    });

    // Update leaderboard synchronization
    batch.update(leaderboardRef, {
      pts: increment(challenge.points),
      solved: increment(1),
      updatedAt: new Date().toISOString()
    });

    // Update challenge global solve count
    batch.update(challengeRef, {
      solves: increment(1)
    });

    try {
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'batch_submit_success');
    }

    // Log the successful submission
    try {
      await addDoc(collection(db, 'submissions'), {
        userId,
        username: auth.currentUser?.displayName || 'User',
        challengeId: challenge.id,
        challengeTitle: challenge.title,
        category: challenge.category,
        pts: challenge.points,
        correct: true,
        solvedAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'submissions');
    }
  } else {
    // Increment attempts on wrong flag
    const userRef = doc(db, 'users', userId);
    try {
      await updateDoc(userRef, {
        [`attempts.ch_${challenge.id}`]: increment(1)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
    }

    // Log failure
    try {
      await addDoc(collection(db, 'submissions'), {
        userId,
        challengeId: challenge.id,
        correct: false,
        submitted: inputFlag.substring(0, 50), // Limited for privacy/security
        solvedAt: new Date().toISOString()
      });
    } catch (error) {
       handleFirestoreError(error, OperationType.CREATE, 'submissions');
    }
  }

  return isCorrect;
}
