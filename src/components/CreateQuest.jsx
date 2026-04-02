import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { db } from '../firebase';
import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext.jsx';
import { validateQuest, containsProfanity } from '../services/questValidation.js';

const CATEGORIES = [
  { id: 'exploration', label: 'Exploration', icon: '🧭', color: '#34d399' },
  { id: 'photo', label: 'Photo', icon: '📸', color: '#60a5fa' },
  { id: 'challenge', label: 'Challenge', icon: '🧩', color: '#f472b6' },
  { id: 'social', label: 'Social', icon: '👥', color: '#c084fc' },
  { id: 'activity', label: 'Activity', icon: '🏃', color: '#fb923c' },
];

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const XP_VALUES = [100, 150, 200, 250, 300, 350, 400, 500];
const TAGS = ['Hidden location', 'Great view', 'Fun challenge', 'Social activity', 'Unique experience'];

function LocationPicker({ position, onPositionChange, existingQuests }) {
  const pinIcon = L.divIcon({
    html: `<svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg"><path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 24 16 24s16-12 16-24C32 7.16 24.84 0 16 0z" fill="#ffc857"/><circle cx="16" cy="15" r="7" fill="rgba(0,0,0,0.3)"/><circle cx="16" cy="15" r="5" fill="white"/></svg>`,
    className: '',
    iconSize: [32, 40],
    iconAnchor: [16, 40],
  });

  const existingIcon = L.divIcon({
    html: `<svg width="20" height="25" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg" opacity="0.4"><path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 24 16 24s16-12 16-24C32 7.16 24.84 0 16 0z" fill="#ffffff"/><circle cx="16" cy="15" r="5" fill="rgba(255,255,255,0.5)"/></svg>`,
    className: '',
    iconSize: [20, 25],
    iconAnchor: [10, 25],
  });

  function MapClickHandler() {
    useMapEvents({ click: (e) => onPositionChange([e.latlng.lat, e.latlng.lng]) });
    return null;
  }

  return (
    <div style={styles.mapContainer}>
      <MapContainer center={position || [26.1224, -80.1373]} zoom={13} style={{ width: '100%', height: '100%', borderRadius: '14px' }} zoomControl={false} attributionControl={false}>
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
        <MapClickHandler />
        {existingQuests.map(q => (
          <Marker key={q.id} position={[q.lat, q.lng]} icon={existingIcon} interactive={false} />
        ))}
        {position && <Marker position={position} icon={pinIcon} />}
      </MapContainer>
      <p style={styles.mapHint}>{position ? 'Tap to move pin · Ghost pins = existing quests' : 'Tap the map to place your quest'}</p>
    </div>
  );
}

function CreateQuest({ onClose, onCreated }) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState([]);
  const [existingQuests, setExistingQuests] = useState([]);
  const [category, setCategory] = useState('');
  const [position, setPosition] = useState(null);
  const [hint, setHint] = useState('');
  const [objective, setObjective] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [xp, setXp] = useState(200);
  const [cost, setCost] = useState('Free');
  const [customCost, setCustomCost] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [requiredItems, setRequiredItems] = useState('');
  const [bonusObjectives, setBonusObjectives] = useState('');
  const totalSteps = 3;

  useEffect(() => {
    const fetchQuests = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'quests'));
        setExistingQuests(snapshot.docs.map(doc => ({ id: doc.id, lat: doc.data().lat, lng: doc.data().lng })));
      } catch (err) { console.error('Error fetching existing quests:', err); }
    };
    fetchQuests();
  }, []);

  const toggleTag = (tag) => setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);

  const validateStep1 = () => {
    const errs = [];
    if (!category) errs.push('Pick a category');
    if (!position) errs.push('Drop a pin on the map');
    setErrors(errs);
    return errs.length === 0;
  };

  const validateStep2 = () => {
    const errs = [];
    if (!hint || hint.trim().length < 10) errs.push('Hint must be at least 10 characters');
    if (hint && hint.trim().length > 200) errs.push('Hint must be under 200 characters');
    if (!objective || objective.trim().length < 20) errs.push('Objective must be at least 20 characters');
    if (objective && objective.trim().length > 500) errs.push('Objective must be under 500 characters');
    if (!difficulty) errs.push('Select a difficulty');
    if (hint && objective && hint.trim().toLowerCase() === objective.trim().toLowerCase()) errs.push('Hint and objective cannot be the same');
    if (containsProfanity(hint)) errs.push('Hint contains inappropriate language');
    if (containsProfanity(objective)) errs.push('Objective contains inappropriate language');
    setErrors(errs);
    return errs.length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) { setErrors([]); setStep(2); }
    else if (step === 2 && validateStep2()) { setErrors([]); setStep(3); }
  };

  const handleBack = () => { setErrors([]); setStep(s => s - 1); };

  const handleSubmit = async () => {
    setSubmitting(true);
    setErrors([]);
    const validationErrors = await validateQuest({ hint, objective, category, position, difficulty, xp });
    if (validationErrors.length > 0) { setErrors(validationErrors); setSubmitting(false); return; }
    try {
      await addDoc(collection(db, 'quests'), {
        category, lat: position[0], lng: position[1], hint: hint.trim(), objective: objective.trim(),
        difficulty, xp, cost: cost === 'Custom' ? customCost.trim() : cost, tags: selectedTags,
        requiredItems: requiredItems ? requiredItems.split(',').map(i => i.trim()).filter(Boolean) : [],
        bonusObjectives: bonusObjectives ? bonusObjectives.split(',').map(i => i.trim()).filter(Boolean) : [],
        radius: 200, createdBy: user.uid, createdAt: serverTimestamp(), status: 'active',
      });
      onCreated();
    } catch (err) { console.error('Error creating quest:', err); setErrors(['Something went wrong. Try again.']); setSubmitting(false); }
  };

  return (
    <>
      <div style={styles.backdrop} onClick={onClose} />
      <div style={styles.sheet}>
        <div style={styles.handleBar}><div style={styles.handle} /></div>
        <div style={styles.header}>
          <div>
            <p style={styles.headerTitle}>Create Quest</p>
            <p style={styles.stepText}>Step {step} of {totalSteps}</p>
          </div>
          <button onClick={onClose} style={styles.closeButton}>✕</button>
        </div>
        <div style={styles.progressOuter}><div style={{ ...styles.progressInner, width: `${(step / totalSteps) * 100}%` }} /></div>

        {step === 1 && (
          <div style={styles.stepContent}>
            <p style={styles.fieldLabel}>CATEGORY</p>
            <div style={styles.categoryGrid}>
              {CATEGORIES.map(cat => (
                <button key={cat.id} onClick={() => setCategory(cat.id)} style={{ ...styles.categoryOption, background: category === cat.id ? `${cat.color}20` : 'rgba(255,255,255,0.04)', borderColor: category === cat.id ? cat.color : 'rgba(255,255,255,0.08)' }}>
                  <span style={styles.categoryIcon}>{cat.icon}</span>
                  <span style={{ ...styles.categoryLabel, color: category === cat.id ? cat.color : 'rgba(255,255,255,0.6)' }}>{cat.label}</span>
                </button>
              ))}
            </div>
            <p style={styles.fieldLabel}>QUEST LOCATION</p>
            <LocationPicker position={position} onPositionChange={setPosition} existingQuests={existingQuests} />
          </div>
        )}

        {step === 2 && (
          <div style={styles.stepContent}>
            <p style={styles.fieldLabel}>CRYPTIC HINT</p>
            <p style={styles.fieldHelp}>What players see before arriving. Be mysterious!</p>
            <textarea value={hint} onChange={(e) => setHint(e.target.value)} placeholder="A park with the name of a common bird..." style={{ ...styles.textarea, borderColor: containsProfanity(hint) ? 'rgba(239,68,68,0.4)' : hint.length > 0 && hint.length < 10 ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.1)' }} rows={2} />
            <span style={{ ...styles.charCount, color: containsProfanity(hint) ? '#f87171' : hint.length > 0 && hint.length < 10 ? '#f87171' : hint.length >= 10 ? '#34d399' : 'rgba(255,255,255,0.2)' }}>
              {containsProfanity(hint) ? '⚠️ Contains inappropriate language' : `${hint.length} / 10 min · 200 max`}
            </span>

            <p style={{ ...styles.fieldLabel, marginTop: '16px' }}>QUEST OBJECTIVE</p>
            <p style={styles.fieldHelp}>What players must do. Be specific and actionable.</p>
            <textarea value={objective} onChange={(e) => setObjective(e.target.value)} placeholder="Find the community gardens and plant one type of vegetable. Upload a picture of the planted seed." style={{ ...styles.textarea, borderColor: containsProfanity(objective) ? 'rgba(239,68,68,0.4)' : objective.length > 0 && objective.length < 20 ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.1)' }} rows={3} />
            <span style={{ ...styles.charCount, color: containsProfanity(objective) ? '#f87171' : objective.length > 0 && objective.length < 20 ? '#f87171' : objective.length >= 20 ? '#34d399' : 'rgba(255,255,255,0.2)' }}>
              {containsProfanity(objective) ? '⚠️ Contains inappropriate language' : `${objective.length} / 20 min · 500 max`}
            </span>

            <p style={{ ...styles.fieldLabel, marginTop: '16px' }}>DIFFICULTY</p>
            <div style={styles.difficultyRow}>
              {DIFFICULTIES.map(d => {
                const colors = { Easy: '#34d399', Medium: '#fbbf24', Hard: '#f87171' };
                return <button key={d} onClick={() => setDifficulty(d)} style={{ ...styles.difficultyOption, background: difficulty === d ? `${colors[d]}20` : 'rgba(255,255,255,0.04)', borderColor: difficulty === d ? colors[d] : 'rgba(255,255,255,0.08)', color: difficulty === d ? colors[d] : 'rgba(255,255,255,0.5)' }}>{d}</button>;
              })}
            </div>

            <p style={{ ...styles.fieldLabel, marginTop: '16px' }}>XP REWARD</p>
            <div style={styles.xpRow}>
              {XP_VALUES.map(v => (
                <button key={v} onClick={() => setXp(v)} style={{ ...styles.xpOption, background: xp === v ? 'rgba(255,200,87,0.15)' : 'rgba(255,255,255,0.04)', borderColor: xp === v ? '#ffc857' : 'rgba(255,255,255,0.08)', color: xp === v ? '#ffc857' : 'rgba(255,255,255,0.5)' }}>{v}</button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={styles.stepContent}>
            <p style={styles.fieldLabel}>COST</p>
            <div style={styles.costRow}>
              {['Free', '$5-10', '$10-20', '$20-40', 'Custom'].map(c => (
                <button key={c} onClick={() => setCost(c)} style={{ ...styles.costOption, background: cost === c ? 'rgba(255,200,87,0.15)' : 'rgba(255,255,255,0.04)', borderColor: cost === c ? '#ffc857' : 'rgba(255,255,255,0.08)', color: cost === c ? '#ffc857' : 'rgba(255,255,255,0.5)' }}>{c}</button>
              ))}
            </div>
            {cost === 'Custom' && <input type="text" value={customCost} onChange={(e) => setCustomCost(e.target.value)} placeholder="e.g. $50+" style={styles.input} />}

            <p style={{ ...styles.fieldLabel, marginTop: '16px' }}>TAGS</p>
            <div style={styles.tagsGrid}>
              {TAGS.map(tag => (
                <button key={tag} onClick={() => toggleTag(tag)} style={{ ...styles.tagOption, background: selectedTags.includes(tag) ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)', borderColor: selectedTags.includes(tag) ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.08)', color: selectedTags.includes(tag) ? '#ffffff' : 'rgba(255,255,255,0.4)' }}>{tag}</button>
              ))}
            </div>

            <p style={{ ...styles.fieldLabel, marginTop: '16px' }}>REQUIRED ITEMS (optional)</p>
            <p style={styles.fieldHelp}>Separate items with commas</p>
            <input type="text" value={requiredItems} onChange={(e) => setRequiredItems(e.target.value)} placeholder="Fishing rod, Bait, Sunscreen" style={styles.input} />

            <p style={{ ...styles.fieldLabel, marginTop: '16px' }}>BONUS OBJECTIVES (optional)</p>
            <p style={styles.fieldHelp}>Separate with commas</p>
            <input type="text" value={bonusObjectives} onChange={(e) => setBonusObjectives(e.target.value)} placeholder="Catch 3 species, Take a selfie with your catch" style={styles.input} />
          </div>
        )}

        {errors.length > 0 && (
          <div style={styles.errorBox}>
            {errors.map((err, i) => <p key={i} style={styles.errorText}>• {err}</p>)}
          </div>
        )}

        <div style={styles.navRow}>
          {step > 1 && <button onClick={handleBack} style={styles.backButton}>← Back</button>}
          <div style={{ flex: 1 }} />
          {step < totalSteps ? (
            <button onClick={handleNext} style={styles.nextButton}>Next →</button>
          ) : (
            <button onClick={handleSubmit} disabled={submitting} style={{ ...styles.submitButton, opacity: submitting ? 0.5 : 1 }}>
              {submitting ? 'Validating...' : '🗺️ Create Quest'}
            </button>
          )}
        </div>
      </div>
    </>
  );
}

const styles = {
  backdrop: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1999 },
  sheet: { position: 'fixed', bottom: 0, left: 0, right: 0, maxHeight: '92vh', overflowY: 'auto', background: 'linear-gradient(180deg, #1a1a2e 0%, #12121f 100%)', borderRadius: '20px 20px 0 0', padding: '12px 20px 32px', zIndex: 2000, animation: 'slideUp 0.3s ease-out', fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif", WebkitOverflowScrolling: 'touch' },
  handleBar: { display: 'flex', justifyContent: 'center', marginBottom: '12px' },
  handle: { width: '36px', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.2)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' },
  headerTitle: { fontSize: '20px', fontWeight: '700', color: '#ffffff', marginBottom: '2px' },
  stepText: { fontSize: '12px', color: 'rgba(255,255,255,0.35)' },
  closeButton: { background: 'rgba(255,255,255,0.08)', border: 'none', color: 'rgba(255,255,255,0.5)', width: '32px', height: '32px', borderRadius: '50%', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  progressOuter: { height: '3px', borderRadius: '2px', background: 'rgba(255,255,255,0.06)', marginBottom: '20px', overflow: 'hidden' },
  progressInner: { height: '100%', borderRadius: '2px', background: 'linear-gradient(90deg, #ffc857, #f0a030)', transition: 'width 0.3s ease' },
  stepContent: { marginBottom: '16px' },
  fieldLabel: { fontSize: '10px', fontWeight: '700', color: 'rgba(255,255,255,0.4)', letterSpacing: '1.5px', marginBottom: '8px' },
  fieldHelp: { fontSize: '12px', color: 'rgba(255,255,255,0.25)', marginBottom: '8px', marginTop: '-4px' },
  categoryGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '20px' },
  categoryOption: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '12px 8px', borderRadius: '12px', border: '1px solid', cursor: 'pointer' },
  categoryIcon: { fontSize: '20px' },
  categoryLabel: { fontSize: '11px', fontWeight: '600' },
  mapContainer: { height: '200px', borderRadius: '14px', overflow: 'hidden', position: 'relative' },
  mapHint: { position: 'absolute', bottom: '8px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000, fontSize: '11px', color: 'rgba(255,255,255,0.6)', background: 'rgba(0,0,0,0.7)', padding: '4px 12px', borderRadius: '10px', whiteSpace: 'nowrap' },
  textarea: { width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#ffffff', fontSize: '15px', resize: 'vertical', outline: 'none', fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif", transition: 'border-color 0.2s' },
  charCount: { fontSize: '11px', display: 'block', textAlign: 'right', marginTop: '4px', transition: 'color 0.2s' },
  input: { width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#ffffff', fontSize: '15px', outline: 'none', fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif", marginTop: '4px' },
  difficultyRow: { display: 'flex', gap: '8px' },
  difficultyOption: { flex: 1, padding: '10px', borderRadius: '12px', border: '1px solid', fontSize: '14px', fontWeight: '600', cursor: 'pointer', textAlign: 'center' },
  xpRow: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  xpOption: { padding: '8px 14px', borderRadius: '10px', border: '1px solid', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
  costRow: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '4px' },
  costOption: { padding: '8px 14px', borderRadius: '10px', border: '1px solid', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
  tagsGrid: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  tagOption: { padding: '6px 12px', borderRadius: '10px', border: '1px solid', fontSize: '12px', fontWeight: '500', cursor: 'pointer' },
  errorBox: { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '12px', padding: '12px 14px', marginBottom: '14px' },
  errorText: { color: '#f87171', fontSize: '13px', lineHeight: '1.6' },
  navRow: { display: 'flex', gap: '12px', alignItems: 'center' },
  backButton: { padding: '14px 20px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.6)', fontSize: '15px', fontWeight: '600', cursor: 'pointer' },
  nextButton: { padding: '14px 28px', borderRadius: '14px', border: 'none', background: 'linear-gradient(135deg, #ffc857 0%, #f0a030 100%)', color: '#0a0a0f', fontSize: '15px', fontWeight: '700', cursor: 'pointer' },
  submitButton: { padding: '14px 28px', borderRadius: '14px', border: 'none', background: 'linear-gradient(135deg, #34d399 0%, #059669 100%)', color: '#ffffff', fontSize: '16px', fontWeight: '700', cursor: 'pointer' },
};

export default CreateQuest;