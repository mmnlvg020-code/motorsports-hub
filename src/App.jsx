import { useState, useEffect } from 'react';
import { races } from './data/races';

// Utility to create ICS file
const generateICS = (race) => {
  const startDate = new Date(race.date);
  // Assuming a 2-hour duration for the race
  const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
  
  const formatDate = (date) => {
    return date.toISOString().replace(/-|:|\.\d+/g, '');
  };

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `DTSTART:${formatDate(startDate)}`,
    `DTEND:${formatDate(endDate)}`,
    `SUMMARY:${race.title}`,
    `LOCATION:${race.circuit}, ${race.country}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', `${race.title.replace(/\s+/g, '_')}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const Header = () => (
  <header className="header">
    <div>
      <h1>Motorsports Hub</h1>
      <div style={{ color: 'var(--text-secondary)' }}>Tu Calendario Racing</div>
    </div>
    <a 
      href="https://pitsport.xyz/" 
      target="_blank" 
      rel="noopener noreferrer"
      className="filter-btn active"
      style={{ textDecoration: 'none', display: 'inline-block', backgroundColor: 'var(--accent-default)' }}
    >
      PitSport 🚀
    </a>
  </header>
);

const CategoryFilter = ({ 
  selectedCategory, 
  onSelectCategory, 
  availableCategories, 
  showFavoritesOnly, 
  setShowFavoritesOnly,
  favoritesCount,
  weekendMode,
  setWeekendMode
}) => {
  return (
    <div className="filter-container">
      <button 
        className={`filter-btn ${weekendMode ? 'active' : ''}`}
        onClick={() => setWeekendMode(!weekendMode)}
        style={{ borderColor: weekendMode ? 'var(--accent-f1)' : 'var(--glass-border)' }}
      >
        🏁 Fin de Semana
      </button>

      <button 
        className={`filter-btn ${showFavoritesOnly ? 'active' : ''}`}
        onClick={() => {
          setShowFavoritesOnly(!showFavoritesOnly);
          setWeekendMode(false);
        }}
        style={{ borderColor: 'gold' }}
      >
        {showFavoritesOnly ? '⭐ Mis Favoritos' : `☆ Favoritos (${favoritesCount})`}
      </button>

      {availableCategories.map(cat => (
        <button 
          key={cat}
          className={`filter-btn ${selectedCategory === cat && !showFavoritesOnly && !weekendMode ? 'active' : ''}`}
          onClick={() => { 
            onSelectCategory(cat); 
            setShowFavoritesOnly(false);
            setWeekendMode(false);
          }}
        >
          {cat === 'All' ? 'Todas' : cat}
        </button>
      ))}
    </div>
  );
};

const NextRaceCountdown = ({ nextRace }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!nextRace) return;
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = new Date(nextRace.date).getTime() - now;

      if (distance < 0) {
        clearInterval(interval);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [nextRace]);

  if (!nextRace) return null;

  return (
    <div className="countdown-section glass">
      <div className="countdown-title">Próxima Carrera 🏎️💨</div>
      <div className="countdown-event">{nextRace.title}</div>
      <div className="countdown-timer">
        <div className="countdown-box">
          <span className="countdown-value">{String(timeLeft.days).padStart(2, '0')}</span>
          <span className="countdown-label">Días</span>
        </div>
        <div className="countdown-box">
          <span className="countdown-value">{String(timeLeft.hours).padStart(2, '0')}</span>
          <span className="countdown-label">Hrs</span>
        </div>
        <div className="countdown-box">
          <span className="countdown-value">{String(timeLeft.minutes).padStart(2, '0')}</span>
          <span className="countdown-label">Min</span>
        </div>
        <div className="countdown-box">
          <span className="countdown-value">{String(timeLeft.seconds).padStart(2, '0')}</span>
          <span className="countdown-label">Seg</span>
        </div>
      </div>
    </div>
  );
};

const RaceCard = ({ race, isFavorite, onToggleFavorite }) => {
  const localDate = new Date(race.date);
  
  // Format options for the browser's local timezone
  const dateStr = localDate.toLocaleDateString(undefined, { 
    weekday: 'short', month: 'long', day: 'numeric' 
  });
  const timeStr = localDate.toLocaleTimeString(undefined, { 
    hour: '2-digit', minute: '2-digit' 
  });

  return (
    <div className="race-card glass">
      <div className="race-card-img-wrapper">
        <img src={race.image} alt={race.title} className="race-card-img" />
        <span className={`category-badge category-${race.category.toLowerCase().replace(/\s+/g, '-')}`}>
          {race.category}
          <span 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFavorite(race.category); }} 
            style={{ cursor: 'pointer', marginLeft: '8px', fontSize: '1rem', textShadow: '0 0 5px rgba(0,0,0,0.8)' }}
            title={isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}
          >
            {isFavorite ? '⭐' : '☆'}
          </span>
        </span>
      </div>
      <div className="race-card-content">
        <h3 className="race-title">{race.title}</h3>
        <div className="race-circuit">{race.circuit}, {race.country}</div>
        <div className="race-broadcaster">📺 {race.broadcaster || "Por confirmar"}</div>
        
        <div className="race-datetime">
          <div>
            <div>{dateStr}</div>
            <div className="race-time">{timeStr}</div>
          </div>
          <button className="add-to-calendar" onClick={() => generateICS(race)}>
            + Calendar
          </button>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [upcomingRaces, setUpcomingRaces] = useState([]);
  const [nextRace, setNextRace] = useState(null);
  const [availableCategories, setAvailableCategories] = useState(['All']);
  
  // New States for Phase 2 Features
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('motorsports-favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [weekendMode, setWeekendMode] = useState(false);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('motorsports-favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (category) => {
    setFavorites(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  useEffect(() => {
    const now = new Date();
    // Filter future races and sort by date
    const futureRaces = races
      .filter(r => new Date(r.date) > now)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    setUpcomingRaces(futureRaces);

    // Extract unique categories from the races data
    const uniqueCategories = [...new Set(races.map(r => r.category))];
    setAvailableCategories(['All', ...uniqueCategories]);
  }, []);

  // Update Next Race logic to prioritize favorites
  useEffect(() => {
    if (upcomingRaces.length === 0) return;
    
    if (favorites.length > 0) {
      // Find the next upcoming race that is in the favorites list
      const nextFav = upcomingRaces.find(r => favorites.includes(r.category));
      setNextRace(nextFav || upcomingRaces[0]);
    } else {
      setNextRace(upcomingRaces[0]);
    }
  }, [upcomingRaces, favorites]);

  // Apply filters
  let filteredRaces = upcomingRaces;
  if (weekendMode) {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    filteredRaces = filteredRaces.filter(r => new Date(r.date) <= nextWeek);
  } else if (showFavoritesOnly && favorites.length > 0) {
    filteredRaces = filteredRaces.filter(r => favorites.includes(r.category));
  } else if (selectedCategory !== 'All') {
    filteredRaces = filteredRaces.filter(r => r.category === selectedCategory);
  }

  return (
    <div className="app-container">
      <Header />
      
      {/* Show countdown only if we are viewing everything or favorites/weekend */}
      {selectedCategory === 'All' && <NextRaceCountdown nextRace={nextRace} />}
      
      <CategoryFilter 
        selectedCategory={selectedCategory} 
        onSelectCategory={setSelectedCategory} 
        availableCategories={availableCategories}
        showFavoritesOnly={showFavoritesOnly}
        setShowFavoritesOnly={setShowFavoritesOnly}
        favoritesCount={favorites.length}
        weekendMode={weekendMode}
        setWeekendMode={setWeekendMode}
      />

      <div className="race-grid">
        {filteredRaces.map(race => (
          <RaceCard 
            key={race.id} 
            race={race} 
            isFavorite={favorites.includes(race.category)}
            onToggleFavorite={toggleFavorite}
          />
        ))}
        
        {filteredRaces.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            No hay carreras futuras para esta categoría o filtro.
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
