import { db } from '../firebase';
import { doc, getDoc, setDoc, collection, getDocs, query, where, serverTimestamp } from 'firebase/firestore';

const DAILY_BONUS_XP = 100;
const WEEKLY_BONUS_XP = 250;

// Get today's date string (YYYY-MM-DD)
function getTodayKey() {
  return new Date().toISOString().split('T')[0];
}

// Get current week key (YYYY-WXX)
function getWeekKey() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const weekNum = Math.ceil(((now - start) / 86400000 + start.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

// Pick a random active quest for featured
async function pickRandomQuest(excludeId) {
  const snapshot = await getDocs(collection(db, 'quests'));
  const quests = snapshot.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(q => (!q.status || q.status === 'active') && q.id !== excludeId);

  if (quests.length === 0) return null;
  return quests[Math.floor(Math.random() * quests.length)];
}

// Get or create featured quests
export async function getFeaturedQuests() {
  const featuredRef = doc(db, 'meta', 'featured');
  const snap = await getDoc(featuredRef);
  const todayKey = getTodayKey();
  const weekKey = getWeekKey();

  let data = snap.exists() ? snap.data() : {};
  let updated = false;

  // Check if daily quest needs refresh
  if (!data.daily || data.dailyDate !== todayKey) {
    const quest = await pickRandomQuest(data.weekly?.id);
    if (quest) {
      data.daily = {
        id: quest.id,
        hint: quest.hint,
        category: quest.category,
        difficulty: quest.difficulty,
        xp: quest.xp,
        lat: quest.lat,
        lng: quest.lng,
        cost: quest.cost,
        bonusXp: DAILY_BONUS_XP,
      };
      data.dailyDate = todayKey;
      updated = true;
    }
  }

  // Check if weekly quest needs refresh
  if (!data.weekly || data.weeklyDate !== weekKey) {
    const quest = await pickRandomQuest(data.daily?.id);
    if (quest) {
      data.weekly = {
        id: quest.id,
        hint: quest.hint,
        category: quest.category,
        difficulty: quest.difficulty,
        xp: quest.xp,
        lat: quest.lat,
        lng: quest.lng,
        cost: quest.cost,
        bonusXp: WEEKLY_BONUS_XP,
      };
      data.weeklyDate = weekKey;
      updated = true;
    }
  }

  if (updated) {
    await setDoc(featuredRef, data);
  }

  return {
    daily: data.daily ? { ...data.daily, bonusXp: DAILY_BONUS_XP } : null,
    weekly: data.weekly ? { ...data.weekly, bonusXp: WEEKLY_BONUS_XP } : null,
  };
}

export { DAILY_BONUS_XP, WEEKLY_BONUS_XP };