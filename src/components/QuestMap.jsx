import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

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

function createQuestIcon(category) {
  const color = getCategoryColor(category);
  const svg = `
    <svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 24 16 24s16-12 16-24C32 7.16 24.84 0 16 0z" fill="${color}"/>
      <circle cx="16" cy="15" r="7" fill="rgba(0,0,0,0.3)"/>
      <circle cx="16" cy="15" r="5" fill="white"/>
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

function UserLocationMarker() {
  const [position, setPosition] = useState(null);
  const map = useMap();
  const hasFlown = useRef(false);

  useEffect(() => {
    map.locate({ watch: true, enableHighAccuracy: true });

    map.on('locationfound', (e) => {
      setPosition(e.latlng);
      if (!hasFlown.current) {
        map.flyTo(e.latlng, 14);
        hasFlown.current = true;
      }
    });

    return () => {
      map.stopLocate();
    };
  }, [map]);

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

function QuestMap() {
  const [quests, setQuests] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuests = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'quests'));
        const questData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setQuests(questData);
      } catch (err) {
        console.error('Error fetching quests:', err);
      }
      setLoading(false);
    };
    fetchQuests();
  }, []);

  const filtered = filter === 'all'
    ? quests
    : quests.filter(q => q.category === filter);

  const defaultCenter = [26.1224, -80.1373];

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
        <UserLocationMarker />

        {filtered.map(quest => (
          <Marker
            key={quest.id}
            position={[quest.lat, quest.lng]}
            icon={createQuestIcon(quest.category)}
          >
            <Popup>
              <div style={styles.popup}>
                <div style={{
                  ...styles.popupCategory,
                  color: getCategoryColor(quest.category)
                }}>
                  {quest.category?.toUpperCase()}
                </div>
                <div style={styles.popupHint}>{quest.hint}</div>
                <div style={styles.popupMeta}>
                  <span style={styles.popupDifficulty}>{quest.difficulty}</span>
                  <span style={styles.popupXp}>{quest.xp} XP</span>
                </div>
                {quest.cost && (
                  <div style={styles.popupCost}>
                    {quest.cost === 'Free' ? '🆓 Free' : `💰 ${quest.cost}`}
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
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
  popup: {
    fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
    minWidth: '180px',
  },
  popupCategory: {
    fontSize: '10px',
    fontWeight: '700',
    letterSpacing: '1.5px',
    marginBottom: '6px',
  },
  popupHint: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1a1a2e',
    lineHeight: '1.4',
    marginBottom: '8px',
  },
  popupMeta: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  popupDifficulty: {
    fontSize: '11px',
    color: '#666',
    fontWeight: '500',
  },
  popupXp: {
    fontSize: '11px',
    color: '#f0a030',
    fontWeight: '700',
  },
  popupCost: {
    fontSize: '11px',
    color: '#888',
    marginTop: '4px',
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