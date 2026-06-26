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
      style={{ textDecoration: 'none', display: 'inline-block' }}
    >
      Ir a PitSport 🚀
    </a>
  </header>
);

const CategoryFilter = ({ selectedCategory, onSelectCategory, availableCategories }) => {
  return (
    <div className="filter-container">
      {availableCategories.map(cat => (
        <button 
          key={cat}
          className={`filter-btn ${selectedCategory === cat ? 'active' : ''}`}
          onClick={() => onSelectCategory(cat)}
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
      <div className="countdown-title">Próxima Carrera</div>
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

const RaceCard = ({ race }) => {
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
        <span className={`category-badge category-${race.category.toLowerCase()}`}>
          {race.category}
        </span>
      </div>
      <div className="race-card-content">
        <h3 className="race-title">{race.title}</h3>
        <div className="race-circuit">{race.circuit}, {race.country}</div>
        
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

  useEffect(() => {
    const now = new Date();
    // Filter future races and sort by date
    const futureRaces = races
      .filter(r => new Date(r.date) > now)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    setUpcomingRaces(futureRaces);
    if (futureRaces.length > 0) {
      setNextRace(futureRaces[0]);
    }

    // Extract unique categories from the races data
    const uniqueCategories = [...new Set(races.map(r => r.category))];
    setAvailableCategories(['All', ...uniqueCategories]);
  }, []);

  const filteredRaces = selectedCategory === 'All' 
    ? upcomingRaces 
    : upcomingRaces.filter(r => r.category === selectedCategory);

  return (
    <div className="app-container">
      <Header />
      
      {selectedCategory === 'All' && <NextRaceCountdown nextRace={nextRace} />}
      
      <CategoryFilter 
        selectedCategory={selectedCategory} 
        onSelectCategory={setSelectedCategory} 
        availableCategories={availableCategories}
      />

      <div className="race-grid">
        {filteredRaces.map(race => (
          <RaceCard key={race.id} race={race} />
        ))}
        
        {filteredRaces.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            No hay carreras futuras para esta categoría.
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
