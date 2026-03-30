import { db } from './firebase';
import { collection, addDoc, getDocs, query, limit } from 'firebase/firestore';

const SEED_QUESTS = [
  {
    category: 'social',
    hint: 'A stage awaits your voice at this lively spot...',
    objective: 'You are broke! Perform on stage at a karaoke night to make enough money to pay off your debts!',
    difficulty: 'Hard',
    xp: 300,
    cost: 'Free',
    lat: 26.1224,
    lng: -80.1373,
    tags: ['Social activity', 'Fun challenge', 'Unique experience'],
    requiredItems: [],
    bonusObjectives: [],
    createdAt: new Date().toISOString(),
  },
  {
    category: 'activity',
    hint: 'Where the water meets patience...',
    objective: 'Catch a fish! Any size counts. Take a photo of your catch before releasing it.',
    difficulty: 'Medium',
    xp: 200,
    cost: 'Free',
    lat: 26.0887,
    lng: -80.1100,
    tags: ['Unique experience', 'Fun challenge'],
    requiredItems: ['Fishing rod', 'Bait'],
    bonusObjectives: ['Catch 3 different species'],
    createdAt: new Date().toISOString(),
  },
  {
    category: 'photo',
    hint: 'The first light paints the horizon in gold...',
    objective: 'Take a picture at the beach at sunrise. The sun must be visible over the water.',
    difficulty: 'Medium',
    xp: 200,
    cost: 'Free',
    lat: 26.1901,
    lng: -80.0968,
    tags: ['Great view', 'Unique experience'],
    requiredItems: [],
    bonusObjectives: ['Include your shadow in the photo'],
    createdAt: new Date().toISOString(),
  },
  {
    category: 'exploration',
    hint: 'A park with the name of a common bird...',
    objective: 'Search Robbins Preserve and find the community gardens. Take a seed and plant one type of vegetable. Upload picture of planted seed.',
    difficulty: 'Hard',
    xp: 350,
    cost: 'Free',
    lat: 26.0729,
    lng: -80.2534,
    tags: ['Hidden location', 'Unique experience', 'Great view'],
    requiredItems: ['Gardening gloves (optional)'],
    bonusObjectives: ['Find a painted horse', 'Find a windmill', 'Find a bell'],
    createdAt: new Date().toISOString(),
  },
  {
    category: 'social',
    hint: 'Strangers hold the soundtrack to your quest...',
    objective: 'Ask 3 random strangers for their favorite song. Write them down and create a playlist.',
    difficulty: 'Easy',
    xp: 150,
    cost: 'Free',
    lat: 26.1468,
    lng: -80.1268,
    tags: ['Social activity', 'Fun challenge'],
    requiredItems: [],
    bonusObjectives: ['Get 5 songs instead of 3'],
    createdAt: new Date().toISOString(),
  },
  {
    category: 'activity',
    hint: 'Move your feet to a rhythm you have never tried...',
    objective: 'Attend a dance class. Any style counts — salsa, hip hop, ballet, anything. Upload a photo or video of you in class.',
    difficulty: 'Medium',
    xp: 250,
    cost: '$10-20',
    lat: 26.1003,
    lng: -80.1395,
    tags: ['Fun challenge', 'Unique experience'],
    requiredItems: ['Comfortable shoes', 'Water bottle'],
    bonusObjectives: ['Learn one full routine'],
    createdAt: new Date().toISOString(),
  },
  {
    category: 'challenge',
    hint: 'Your loved one misses the warmth of your kitchen...',
    objective: 'Bake a new recipe and surprise a friend or family member with your treat. Upload a photo of the finished bake AND their reaction.',
    difficulty: 'Medium',
    xp: 250,
    cost: '$5-15',
    lat: 26.1350,
    lng: -80.1700,
    tags: ['Fun challenge', 'Unique experience'],
    requiredItems: ['Baking ingredients', 'Oven access'],
    bonusObjectives: ['Bake something from a culture different than your own'],
    createdAt: new Date().toISOString(),
  },
  {
    category: 'exploration',
    hint: 'Scales, fur, and feathers all in one kingdom...',
    objective: 'Go to your local zoo and take a picture with a reptile, mammal, and bird. One photo for each.',
    difficulty: 'Easy',
    xp: 200,
    cost: '$20-40',
    lat: 26.1556,
    lng: -80.1678,
    tags: ['Fun challenge', 'Great view', 'Unique experience'],
    requiredItems: ['Zoo admission'],
    bonusObjectives: ['Find an animal whose name starts with the same letter as yours'],
    createdAt: new Date().toISOString(),
  },
  {
    category: 'challenge',
    hint: 'Put away the screen. Paper guides the way...',
    objective: 'Go to a new city, acquire a paper map, put your phone away, and use the map to find a coffee shop. Upload a photo of the map and your coffee.',
    difficulty: 'Hard',
    xp: 400,
    cost: '$5-10',
    lat: 26.0112,
    lng: -80.1494,
    tags: ['Unique experience', 'Fun challenge'],
    requiredItems: [],
    bonusObjectives: ['Navigate to 3 locations using only the paper map'],
    createdAt: new Date().toISOString(),
  },
];

export async function seedQuests() {
  try {
    const questsRef = collection(db, 'quests');
    const existing = await getDocs(query(questsRef, limit(1)));

    if (!existing.empty) {
      console.log('Quests already seeded — skipping.');
      return;
    }

    for (const quest of SEED_QUESTS) {
      await addDoc(questsRef, quest);
    }
    console.log(`Seeded ${SEED_QUESTS.length} quests to Firestore!`);
  } catch (err) {
    console.error('Error seeding quests:', err);
  }
}