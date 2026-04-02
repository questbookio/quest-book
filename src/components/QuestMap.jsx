import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext.jsx';
import { acceptQuest, getAllQuestStatuses, completeQuestWithPhoto } from '../services/questService.js';
import { logActivity } from '../services/socialService.js';
import { checkAchievements, getUserStats, incrementCategoryCount } from '../services/achievementService.js';
import { notifyQuestComplete, notifyAchievement } from '../services/notificationService.js';
import QuestDetail from './QuestDetail.jsx';
import QuestActive from './QuestActive.jsx';

const CATEGORIES = [
  { id: 'all', label: 'All', color: '#ffc857' },
  { id: 'exploration', label: 'Explore', color: '#34d399' },
  { id: 'photo', label: 'Photo', color: '#60a5fa' },
  { id: 'challenge', label: 'Challenge', color: '#f472b6' },
  { id: 'social', label: 'Social', color: '#c084fc' },
  { id: 'activity', label: 'Activity', color: '#fb923c' },
];

function getCategoryColor(category) {
  const cat = CATEGORIES.find(c => c.id === category);
  return cat ? cat.color : '#ffc857';
}

function createQuestIcon(category, status) {
  const color = getCategoryColor(category);
  const opacity = status === 'completed' ? '0.4' : '1';
  const checkmark = status === 'completed'
    ? '<text x="16" y="19" text-anchor="middle" fill="white" font-size="12" font-weight="bold">✓</text>'
    : status === 'accepted'
    ? '<circle cx="16" cy="15" r="5" fill="white"/><circle cx="16" cy="15" r="3" fill="' + color + '"/>'
    : '<circle cx="16" cy="15" r="5" fill="white"/>';

  const svg = `
    <svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg" opacity="${opacity}">
      <path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 24 16 24s16-12 16-24C32 7.16 24.84 0 16 0z" fill="${color}"/>
      <circle cx="16" cy="15" r="7" fill="rgba(0,0,0,0.3)"/>
      ${checkmark}
    </svg>
  `;
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40],
  });
}

function UserLocationTracker({ onLocationUpdate }) {
  const [position, setPosition] = useState(null);
  const map = useMap();
  const hasFlown = useRef(false);

  useEffect(() => {
    map.locate({ watch: true, enableHighAccuracy: true });

    map.on('locationfound', (e) => {
      setPosition(e.latlng);
      onLocationUpdate(e.latlng);
      if (!hasFlown.current) {
        map.flyTo(e.latlng, 14);
        hasFlown.current = true;
      }
    });

    return () => {
      map.stopLocate();
    };
  }, [map, onLocationUpdate]);

  if (!position) return null;

  const userIcon = L.divIcon({
    html: `
      <div style="
        width: 18px;
        height: 18px;
        background: #4285f4;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 0 8px rgba(66,133,244,0.5);
      "></div>
    `,
    className: '',
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });

  return <Marker position={position} icon={userIcon} />;
}

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: () => {
      onMapClick();
    },
  });
  return null;
}

// Calculate distance between two points in meters
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

function formatDistance(meters) {
  if (meters < 1000) {
    return `${Math.round(meters)}m away`;
  }
  const miles = meters / 1609.34;
  if (miles < 10) {
    return `${miles.toFixed(1)} mi away`;
  }
  return `${Math.round(miles)} mi away`;
}

function QuestMap({ onAchievement, focusQuestId, onFocusHandled }) {
  const { user } = useAuth();
  const [quests, setQuests] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedQuest, setSelectedQuest] = useState(null);
  const [questStatuses, setQuestStatuses] = useState({});
  const [showActive, setShowActive] = useState(false);
  const [completedMessage, setCompletedMessage] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    const fetchQuests = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'quests'));
        const questData = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(q => !q.status || q.status === 'active');
        setQuests(questData);
      } catch (err) {
        console.error('Error fetching quests:', err);
      }
      setLoading(false);
    };
    fetchQuests();
  }, []);

  useEffect(() => {
    const fetchStatuses = async () => {
      if (!user) return;
      try {
        const statuses = await getAllQuestStatuses(user.uid);
        setQuestStatuses(statuses);
      } catch (err) {
        console.error('Error fetching quest statuses:', err);
      }
    };
    fetchStatuses();
  }, [user]);

  // Handle focus on a specific quest (from featured quests)
  useEffect(() => {
    if (focusQuestId && quests.length > 0) {
      const quest = quests.find(q => q.id === focusQuestId);
      if (quest) {
        setSelectedQuest(quest);
        setShowActive(false);
      }
      if (onFocusHandled) onFocusHandled();
    }
  }, [focusQuestId, quests, onFocusHandled]);

  const filtered = filter === 'all'
    ? quests
    : quests.filter(q => q.category === filter);

  const defaultCenter = [26.1224, -80.1373];

  const getQuestDistance = (quest) => {
    if (!userLocation) return null;
    return getDistanceMeters(userLocation.lat, userLocation.lng, quest.lat, quest.lng);
  };

  const isWithinRange = (quest) => {
    const distance = getQuestDistance(quest);
    if (distance === null) return false;
    const radius = quest.radius || 200; // default 200 meters
    return distance <= radius;
  };

  const handleAccept = async (quest) => {
    try {
      await acceptQuest(user.uid, quest);
      setQuestStatuses(prev => ({ ...prev, [quest.id]: 'accepted' }));
      setSelectedQuest({ ...quest });
    } catch (err) {
      console.error('Error accepting quest:', err);
    }
  };

  const handleOpenActive = () => {
    setShowActive(true);
  };

  const handleComplete = async (quest, photoFile) => {
    await completeQuestWithPhoto(user.uid, quest.id, photoFile, quest.xp);
    setQuestStatuses(prev => ({ ...prev, [quest.id]: 'completed' }));
    setShowActive(false);
    setSelectedQuest(null);
    setCompletedMessage({ xp: quest.xp });
    setTimeout(() => setCompletedMessage(null), 3000);

    // Log to activity feed
    try {
      const { doc: fbDoc, getDoc: fbGetDoc } = await import('firebase/firestore');
      const userRef = fbDoc(db, 'users', user.uid);
      const userSnap = await fbGetDoc(userRef);
      const userData = userSnap.exists() ? userSnap.data() : {};
      await logActivity(user.uid, userData.displayName, userData.avatar, quest);

      // Store notification
      await notifyQuestComplete(user.uid, quest.hint, quest.xp);

      // Track category and check achievements
      await incrementCategoryCount(user.uid, quest.category);
      const stats = await getUserStats(user.uid);
      const newAchievements = await checkAchievements(user.uid, stats);
      if (newAchievements.length > 0) {
        if (onAchievement) onAchievement(newAchievements[0]);
        await notifyAchievement(user.uid, newAchievements[0].name, newAchievements[0].icon);
      }
    } catch (err) {
      console.error('Error logging activity:', err);
    }
  };

  const handleCloseAll = () => {
    setSelectedQuest(null);
    setShowActive(false);
  };

  const handleLocationUpdate = useRef((latlng) => {
    setUserLocation(latlng);
  }).current;

  return (
    <div style={styles.wrapper}>
      <MapContainer
        center={defaultCenter}
        zoom={12}
        style={styles.map}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />
        <UserLocationTracker onLocationUpdate={handleLocationUpdate} />
        <MapClickHandler onMapClick={handleCloseAll} />

        {filtered.map(quest => (
          <Marker
            key={quest.id}
            position={[quest.lat, quest.lng]}
            icon={createQuestIcon(quest.category, questStatuses[quest.id])}
            eventHandlers={{
              click: () => {
                setShowActive(false);
                setSelectedQuest(quest);
              },
            }}
          />
        ))}
      </MapContainer>

      {/* Category filter bar */}
      <div style={styles.filterBar}>
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setFilter(cat.id)}
            style={{
              ...styles.filterButton,
              background: filter === cat.id
                ? cat.color
                : 'rgba(255,255,255,0.08)',
              color: filter === cat.id
                ? '#0a0a0f'
                : 'rgba(255,255,255,0.6)',
              borderColor: filter === cat.id
                ? cat.color
                : 'rgba(255,255,255,0.12)',
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Quest detail bottom sheet */}
      {selectedQuest && !showActive && (
        <QuestDetail
          quest={selectedQuest}
          questStatus={questStatuses[selectedQuest.id] || 'available'}
          distance={getQuestDistance(selectedQuest)}
          formatDistance={formatDistance}
          onClose={() => setSelectedQuest(null)}
          onAccept={handleAccept}
          onOpenActive={handleOpenActive}
        />
      )}

      {/* Active quest sheet with photo upload */}
      {showActive && selectedQuest && questStatuses[selectedQuest.id] === 'accepted' && (
        <QuestActive
          quest={selectedQuest}
          isInRange={isWithinRange(selectedQuest)}
          distance={getQuestDistance(selectedQuest)}
          formatDistance={formatDistance}
          onComplete={handleComplete}
          onClose={() => setShowActive(false)}
        />
      )}

      {/* Completion toast */}
      {completedMessage && (
        <div style={styles.toast}>
          <span style={styles.toastText}>
            🎉 Quest Complete! +{completedMessage.xp} XP
          </span>
        </div>
      )}

      {loading && (
        <div style={styles.loadingOverlay}>
          <div style={styles.spinner} />
        </div>
      )}
    </div>
  );
}

const styles = {
  wrapper: {
    position: 'relative',
    width: '100%',
    height: '100vh',
    background: '#0a0a0f',
  },
  map: {
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  filterBar: {
    position: 'absolute',
    top: '16px',
    left: '0',
    right: '0',
    zIndex: 1000,
    display: 'flex',
    gap: '8px',
    padding: '0 16px',
    overflowX: 'auto',
    WebkitOverflowScrolling: 'touch',
    msOverflowStyle: 'none',
    scrollbarWidth: 'none',
  },
  filterButton: {
    padding: '8px 16px',
    borderRadius: '20px',
    border: '1px solid',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    flexShrink: 0,
    transition: 'all 0.2s',
    fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  toast: {
    position: 'absolute',
    top: '70px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 3000,
    padding: '14px 24px',
    borderRadius: '16px',
    background: 'rgba(52,211,153,0.15)',
    border: '1px solid rgba(52,211,153,0.3)',
    backdropFilter: 'blur(10px)',
    animation: 'slideUp 0.3s ease-out',
  },
  toastText: {
    color: '#34d399',
    fontSize: '15px',
    fontWeight: '700',
    fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(10,10,15,0.8)',
    zIndex: 2000,
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid rgba(255,200,87,0.2)',
    borderTop: '3px solid #ffc857',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
};

export default QuestMap;