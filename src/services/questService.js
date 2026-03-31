import { db } from '../firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';

// Accept a quest - creates a record in the user's activeQuests subcollection
export async function acceptQuest(userId, quest) {
  const ref = doc(db, 'users', userId, 'activeQuests', quest.id);
  await setDoc(ref, {
    questId: quest.id,
    category: quest.category,
    hint: quest.hint,
    objective: quest.objective,
    difficulty: quest.difficulty,
    xp: quest.xp,
    cost: quest.cost,
    lat: quest.lat,
    lng: quest.lng,
    tags: quest.tags || [],
    requiredItems: quest.requiredItems || [],
    bonusObjectives: quest.bonusObjectives || [],
    status: 'accepted',
    acceptedAt: serverTimestamp(),
  });
}

// Get all active (accepted) quests for a user
export async function getActiveQuests(userId) {
  const ref = collection(db, 'users', userId, 'activeQuests');
  const q = query(ref, where('status', '==', 'accepted'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Get all completed quests for a user
export async function getCompletedQuests(userId) {
  const ref = collection(db, 'users', userId, 'activeQuests');
  const q = query(ref, where('status', '==', 'completed'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Check if a user has already accepted or completed a specific quest
export async function getQuestStatus(userId, questId) {
  const ref = doc(db, 'users', userId, 'activeQuests', questId);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return snap.data().status;
  }
  return 'available';
}

// Mark a quest as completed
export async function completeQuest(userId, questId) {
  const ref = doc(db, 'users', userId, 'activeQuests', questId);
  await updateDoc(ref, {
    status: 'completed',
    completedAt: serverTimestamp(),
  });
}

// Get all quest statuses for a user (batch check)
export async function getAllQuestStatuses(userId) {
  const ref = collection(db, 'users', userId, 'activeQuests');
  const snapshot = await getDocs(ref);
  const statuses = {};
  snapshot.docs.forEach(doc => {
    statuses[doc.id] = doc.data().status;
  });
  return statuses;
}