import { db, storage } from '../firebase';
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
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Accept a quest
export async function acceptQuest(userId, quest) {
  const docRef = doc(db, 'users', userId, 'activeQuests', quest.id);
  await setDoc(docRef, {
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

// Upload photo proof and complete quest
export async function completeQuestWithPhoto(userId, questId, photoFile, xp) {
  // Upload photo to Firebase Storage
  const timestamp = Date.now();
  const fileName = `quest-proofs/${userId}/${questId}_${timestamp}`;
  const storageRef = ref(storage, fileName);

  await uploadBytes(storageRef, photoFile);
  const photoURL = await getDownloadURL(storageRef);

  // Update quest status to completed
  const questRef = doc(db, 'users', userId, 'activeQuests', questId);
  await updateDoc(questRef, {
    status: 'completed',
    completedAt: serverTimestamp(),
    photoURL: photoURL,
  });

  // Update user XP
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const currentXp = userSnap.data().xp || 0;
    await updateDoc(userRef, {
      xp: currentXp + xp,
      questsCompleted: (userSnap.data().questsCompleted || 0) + 1,
    });
  } else {
    await setDoc(userRef, {
      xp: xp,
      questsCompleted: 1,
      createdAt: serverTimestamp(),
    });
  }

  return photoURL;
}

// Get all active (accepted) quests for a user
export async function getActiveQuests(userId) {
  const ref2 = collection(db, 'users', userId, 'activeQuests');
  const q = query(ref2, where('status', '==', 'accepted'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

// Get all completed quests for a user
export async function getCompletedQuests(userId) {
  const ref2 = collection(db, 'users', userId, 'activeQuests');
  const q = query(ref2, where('status', '==', 'completed'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

// Check if a user has already accepted or completed a specific quest
export async function getQuestStatus(userId, questId) {
  const docRef = doc(db, 'users', userId, 'activeQuests', questId);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    return snap.data().status;
  }
  return 'available';
}

// Mark a quest as completed (without photo - for future use)
export async function completeQuest(userId, questId) {
  const docRef = doc(db, 'users', userId, 'activeQuests', questId);
  await updateDoc(docRef, {
    status: 'completed',
    completedAt: serverTimestamp(),
  });
}

// Get all quest statuses for a user (batch check)
export async function getAllQuestStatuses(userId) {
  const ref2 = collection(db, 'users', userId, 'activeQuests');
  const snapshot = await getDocs(ref2);
  const statuses = {};
  snapshot.docs.forEach(d => {
    statuses[d.id] = d.data().status;
  });
  return statuses;
}