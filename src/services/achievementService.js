import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

// All achievements
export const ACHIEVEMENTS = [
  // Quest milestones
  { id: 'first_quest', name: 'First Steps', icon: '👣', description: 'Complete your first quest', check: (s) => s.questsCompleted >= 1 },
  { id: 'five_quests', name: 'Getting Started', icon: '🌱', description: 'Complete 5 quests', check: (s) => s.questsCompleted >= 5 },
  { id: 'ten_quests', name: 'Seasoned Explorer', icon: '🗺️', description: 'Complete 10 quests', check: (s) => s.questsCompleted >= 10 },
  { id: 'twenty_quests', name: 'Quest Master', icon: '⚔️', description: 'Complete 20 quests', check: (s) => s.questsCompleted >= 20 },

  // XP milestones
  { id: 'xp_500', name: 'XP Hunter', icon: '💰', description: 'Earn 500 XP', check: (s) => s.xp >= 500 },
  { id: 'xp_1000', name: 'Adventurer', icon: '🏔️', description: 'Earn 1,000 XP', check: (s) => s.xp >= 1000 },
  { id: 'xp_5000', name: 'Legendary', icon: '👑', description: 'Earn 5,000 XP', check: (s) => s.xp >= 5000 },

  // Creator milestones
  { id: 'first_creation', name: 'Quest Designer', icon: '✏️', description: 'Create your first quest', check: (s) => s.questsCreated >= 1 },
  { id: 'five_creations', name: 'World Builder', icon: '🏗️', description: 'Create 5 quests', check: (s) => s.questsCreated >= 5 },
  { id: 'creator_xp_100', name: 'Crowd Pleaser', icon: '🎭', description: 'Earn 100 Creator XP', check: (s) => s.creatorXpEarned >= 100 },

  // Category milestones
  { id: 'cat_exploration', name: 'Trailblazer', icon: '🧭', description: 'Complete an Exploration quest', check: (s) => (s.categories?.exploration || 0) >= 1 },
  { id: 'cat_photo', name: 'Shutterbug', icon: '📸', description: 'Complete a Photo quest', check: (s) => (s.categories?.photo || 0) >= 1 },
  { id: 'cat_challenge', name: 'Puzzle Solver', icon: '🧩', description: 'Complete a Challenge quest', check: (s) => (s.categories?.challenge || 0) >= 1 },
  { id: 'cat_social', name: 'Social Butterfly', icon: '🦋', description: 'Complete a Social quest', check: (s) => (s.categories?.social || 0) >= 1 },
  { id: 'cat_activity', name: 'Action Hero', icon: '🏃', description: 'Complete an Activity quest', check: (s) => (s.categories?.activity || 0) >= 1 },
  { id: 'all_categories', name: 'Jack of All Trades', icon: '🌟', description: 'Complete a quest in every category', check: (s) => {
    const cats = s.categories || {};
    return ['exploration', 'photo', 'challenge', 'social', 'activity'].every(c => (cats[c] || 0) >= 1);
  }},

  // Special
  { id: 'adventure_mode', name: 'Adventurous Spirit', icon: '⚡', description: 'Complete a quest from Adventure Mode', check: (s) => s.adventureCompleted >= 1 },
  { id: 'rate_quest', name: 'Critic', icon: '⭐', description: 'Rate a quest', check: (s) => s.ratingsGiven >= 1 },
];

// Get user's unlocked achievements
export async function getUserAchievements(userId) {
  try {
    const ref = doc(db, 'users', userId, 'meta', 'achievements');
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data().unlocked || {};
    }
  } catch (err) {
    console.error('Error getting achievements:', err);
  }
  return {};
}

// Check and unlock new achievements, returns array of newly unlocked
export async function checkAchievements(userId, stats) {
  try {
    const unlocked = await getUserAchievements(userId);
    const newlyUnlocked = [];

    for (const achievement of ACHIEVEMENTS) {
      if (!unlocked[achievement.id] && achievement.check(stats)) {
        unlocked[achievement.id] = {
          unlockedAt: new Date().toISOString(),
        };
        newlyUnlocked.push(achievement);
      }
    }

    if (newlyUnlocked.length > 0) {
      const ref = doc(db, 'users', userId, 'meta', 'achievements');
      await setDoc(ref, { unlocked }, { merge: true });
    }

    return newlyUnlocked;
  } catch (err) {
    console.error('Error checking achievements:', err);
    return [];
  }
}

// Get user stats for achievement checking
export async function getUserStats(userId) {
  try {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data();
    }
  } catch (err) {
    console.error('Error getting user stats:', err);
  }
  return {};
}

// Increment a category completion count
export async function incrementCategoryCount(userId, category) {
  try {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data();
      const categories = data.categories || {};
      categories[category] = (categories[category] || 0) + 1;
      await updateDoc(userRef, { categories });
    }
  } catch (err) {
    console.error('Error incrementing category:', err);
  }
}

// Increment a generic stat
export async function incrementStat(userId, field) {
  try {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const current = snap.data()[field] || 0;
      await updateDoc(userRef, { [field]: current + 1 });
    }
  } catch (err) {
    console.error('Error incrementing stat:', err);
  }
}