import { db } from '../firebase';
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';

// Log a quest completion to the global activity feed
export async function logActivity(userId, displayName, avatar, quest) {
  try {
    await addDoc(collection(db, 'activityFeed'), {
      userId,
      displayName: displayName || 'Explorer',
      avatar: avatar || '🧭',
      questId: quest.id,
      questHint: quest.hint,
      questCategory: quest.category,
      questXp: quest.xp,
      questDifficulty: quest.difficulty,
      type: 'completion',
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.error('Error logging activity:', err);
  }
}

// Get recent activity feed entries
export async function getActivityFeed(count = 30) {
  try {
    const q = query(
      collection(db, 'activityFeed'),
      orderBy('createdAt', 'desc'),
      limit(count)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error('Error fetching activity feed:', err);
    return [];
  }
}