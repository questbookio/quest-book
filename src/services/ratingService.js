import { db } from '../firebase';
import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  collection,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';

// Submit a rating for a quest
export async function rateQuest(userId, questId, stars) {
  // Save individual rating
  const ratingRef = doc(db, 'quests', questId, 'ratings', userId);
  await setDoc(ratingRef, {
    userId,
    stars,
    createdAt: serverTimestamp(),
  });

  // Recalculate average
  const ratingsSnap = await getDocs(collection(db, 'quests', questId, 'ratings'));
  let total = 0;
  let count = 0;
  ratingsSnap.docs.forEach(d => {
    total += d.data().stars;
    count++;
  });

  const average = count > 0 ? total / count : 0;

  // Update quest with average rating
  await updateDoc(doc(db, 'quests', questId), {
    averageRating: Math.round(average * 10) / 10,
    ratingCount: count,
    flagged: average < 2 && count >= 3,
  });

  return { average: Math.round(average * 10) / 10, count };
}

// Get a user's rating for a specific quest
export async function getUserRating(userId, questId) {
  try {
    const ratingRef = doc(db, 'quests', questId, 'ratings', userId);
    const snap = await getDoc(ratingRef);
    if (snap.exists()) {
      return snap.data().stars;
    }
  } catch (err) {
    console.error('Error getting user rating:', err);
  }
  return null;
}