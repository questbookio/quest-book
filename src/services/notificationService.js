import { db } from '../firebase';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  query,
  orderBy,
  limit,
  where,
  serverTimestamp
} from 'firebase/firestore';

// Notification types
export const NOTIF_TYPES = {
  QUEST_COMPLETE: 'quest_complete',
  LEVEL_UP: 'level_up',
  ACHIEVEMENT: 'achievement',
  QUEST_APPROVED: 'quest_approved',
  CREATOR_XP: 'creator_xp',
  FEATURED: 'featured',
};

// Add a notification
export async function addNotification(userId, type, data) {
  try {
    await addDoc(collection(db, 'users', userId, 'notifications'), {
      type,
      data,
      read: false,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.error('Error adding notification:', err);
  }
}

// Get recent notifications
export async function getNotifications(userId, count = 30) {
  try {
    const q = query(
      collection(db, 'users', userId, 'notifications'),
      orderBy('createdAt', 'desc'),
      limit(count)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error('Error fetching notifications:', err);
    return [];
  }
}

// Get unread count
export async function getUnreadCount(userId) {
  try {
    const q = query(
      collection(db, 'users', userId, 'notifications'),
      where('read', '==', false)
    );
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (err) {
    console.error('Error getting unread count:', err);
    return 0;
  }
}

// Mark all as read
export async function markAllRead(userId) {
  try {
    const q = query(
      collection(db, 'users', userId, 'notifications'),
      where('read', '==', false)
    );
    const snapshot = await getDocs(q);
    const promises = snapshot.docs.map(d =>
      updateDoc(doc(db, 'users', userId, 'notifications', d.id), { read: true })
    );
    await Promise.all(promises);
  } catch (err) {
    console.error('Error marking notifications read:', err);
  }
}

// Helper to create notifications for common events
export async function notifyQuestComplete(userId, questHint, xpEarned) {
  await addNotification(userId, NOTIF_TYPES.QUEST_COMPLETE, {
    title: 'Quest Complete!',
    message: `You completed "${questHint}" and earned ${xpEarned} XP`,
    icon: '🎉',
  });
}

export async function notifyLevelUp(userId, levelName, levelIcon) {
  await addNotification(userId, NOTIF_TYPES.LEVEL_UP, {
    title: 'Level Up!',
    message: `You reached ${levelName}!`,
    icon: levelIcon,
  });
}

export async function notifyAchievement(userId, achievementName, achievementIcon) {
  await addNotification(userId, NOTIF_TYPES.ACHIEVEMENT, {
    title: 'Achievement Unlocked!',
    message: achievementName,
    icon: achievementIcon,
  });
}

export async function notifyCreatorXp(userId, xpEarned, questHint) {
  await addNotification(userId, NOTIF_TYPES.CREATOR_XP, {
    title: 'Creator Reward!',
    message: `Someone completed your quest "${questHint}" — you earned ${xpEarned} XP`,
    icon: '🗺️',
  });
}

export async function notifyQuestApproved(userId, questHint) {
  await addNotification(userId, NOTIF_TYPES.QUEST_APPROVED, {
    title: 'Quest Approved!',
    message: `Your quest "${questHint}" is now live on the map`,
    icon: '✅',
  });
}