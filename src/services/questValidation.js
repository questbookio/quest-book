import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

// Profanity word list (basic - expandable)
const PROFANITY_LIST = [
  'fuck', 'shit', 'ass', 'bitch', 'damn', 'dick', 'cock', 'pussy',
  'bastard', 'cunt', 'nigger', 'nigga', 'faggot', 'fag', 'retard',
  'whore', 'slut', 'penis', 'vagina', 'bullshit', 'motherfucker',
  'asshole', 'dumbass', 'jackass', 'piss', 'crap',
];

export function containsProfanity(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  return PROFANITY_LIST.some(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    return regex.test(lower);
  });
}

// Check if a quest is too close to an existing one (within 50 meters)
function getDistanceMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function validateQuest({ hint, objective, category, position, difficulty, xp }) {
  const errors = [];

  // Required fields
  if (!category) {
    errors.push('Pick a category');
  }

  if (!position) {
    errors.push('Drop a pin on the map for the quest location');
  }

  if (!difficulty) {
    errors.push('Select a difficulty level');
  }

  if (!xp) {
    errors.push('Choose an XP reward');
  }

  // Hint validation
  if (!hint || hint.trim().length < 10) {
    errors.push('Hint must be at least 10 characters');
  } else if (hint.trim().length > 200) {
    errors.push('Hint must be under 200 characters');
  }

  // Objective validation
  if (!objective || objective.trim().length < 20) {
    errors.push('Objective must be at least 20 characters — be specific!');
  } else if (objective.trim().length > 500) {
    errors.push('Objective must be under 500 characters');
  }

  // Profanity check
  if (containsProfanity(hint)) {
    errors.push('Hint contains inappropriate language');
  }
  if (containsProfanity(objective)) {
    errors.push('Objective contains inappropriate language');
  }

  // Hint should not reveal the objective
  if (hint && objective && hint.trim().toLowerCase() === objective.trim().toLowerCase()) {
    errors.push('Hint and objective cannot be the same — keep the hint mysterious!');
  }

  // Duplicate location check (within 50 meters of existing quest)
  if (position && errors.length === 0) {
    try {
      const snapshot = await getDocs(collection(db, 'quests'));
      const tooClose = snapshot.docs.some(doc => {
        const data = doc.data();
        const dist = getDistanceMeters(position[0], position[1], data.lat, data.lng);
        return dist < 50;
      });

      if (tooClose) {
        errors.push('A quest already exists within 50 meters of this location. Pick a different spot.');
      }
    } catch (err) {
      console.error('Error checking duplicates:', err);
    }
  }

  return errors;
}