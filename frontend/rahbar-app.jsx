import { useState, useEffect, useRef } from "react";

/* ============================================================
   RAHBAR – SMART TRAVEL COMPANION
   Single-file React app (JSX) using:
   - Tailwind core utilities
   - Inline CSS animations / keyframes via <style>
   - lucide-react icons
   ============================================================ */

// ── API Base URL ──────────────────────────────────────────────
const API_BASE = "http://localhost:8000";

// ── API Helper ────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

// ── Palette & tokens ─────────────────────────────────────────
const C = {
  sand: "#FEF7E0",
  gold: "#FF8C00",
  amber: "#FFA500",
  copper: "#FF6347",
  teal: "#008080",
  tealLight: "#20B2AA",
  tealDark: "#006666",
  night: "#2F4F4F",
  nightMid: "#4682B4",
  nightLight: "#87CEEB",
  white: "#FFFFFF",
  offWhite: "#F5F5F5",
  muted: "#708090",
};

// ── Sample data (fallback/demo) ───────────────────────────────
const SAMPLE_ITINERARY = {
  Paris: {
    weather: "☁️ 18°C, Partly Cloudy",
    packing: ["Light jacket", "Comfortable walking shoes", "Umbrella", "Power adapter (Type E)", "Camera"],
    days: [
      {
        day: 1, title: "Arrival & Eiffel Tower",
        activities: [
          { time: "09:00", name: "Check-in at hotel", type: "Hotel", cost: 0, note: "Included in booking" },
          { time: "11:00", name: "Eiffel Tower Summit", type: "Landmark", cost: 29, note: "Book tickets online to skip queue" },
          { time: "14:00", name: "Seine River Cruise", type: "Tour", cost: 15, note: "1-hour scenic cruise" },
          { time: "19:00", name: "Dinner at Le Marais", type: "Food", cost: 45, note: "Try French onion soup" },
        ]
      },
      {
        day: 2, title: "Museums & Montmartre",
        activities: [
          { time: "09:30", name: "Louvre Museum", type: "Museum", cost: 20, note: "Allow 3-4 hours minimum" },
          { time: "14:00", name: "Café de Flore lunch", type: "Food", cost: 25, note: "Historic literary café" },
          { time: "16:00", name: "Montmartre & Sacré-Cœur", type: "Landmark", cost: 0, note: "Free entry to basilica" },
          { time: "20:00", name: "Wine tasting experience", type: "Experience", cost: 55, note: "Local vineyard tour" },
        ]
      },
      {
        day: 3, title: "Versailles Day Trip",
        activities: [
          { time: "08:00", name: "Train to Versailles", type: "Transport", cost: 7, note: "RER C line, 40 mins" },
          { time: "09:30", name: "Palace of Versailles", type: "Museum", cost: 19, note: "Grand apartments + gardens" },
          { time: "14:00", name: "Gardens picnic lunch", type: "Food", cost: 12, note: "Pack from local boulangerie" },
          { time: "17:00", name: "Return to Paris", type: "Transport", cost: 7, note: "Evening free for shopping" },
        ]
      },
    ],
    phrases: [
      { fr: "Bonjour", en: "Hello / Good morning" },
      { fr: "Merci beaucoup", en: "Thank you very much" },
      { fr: "Où est...?", en: "Where is...?" },
      { fr: "L'addition, s'il vous plaît", en: "The bill, please" },
      { fr: "Parlez-vous anglais?", en: "Do you speak English?" },
    ],
    culture: [
      "Greet shopkeepers when entering stores — it's considered rude not to",
      "Tipping is appreciated but not mandatory (5-10%)",
      "Avoid eating on the go — meals are social events",
      "Dress modestly when visiting churches and cathedrals",
    ],
    alerts: [
      { type: "weather", msg: "Rain expected Day 2 afternoon — carry umbrella" },
      { type: "flight", msg: "CDG airport: normal operations, no delays" },
    ],
    expenses: { accommodation: 420, food: 220, activities: 152, transport: 80 },
  },
  Tokyo: {
    weather: "🌤️ 22°C, Mostly Sunny",
    packing: ["Light layers", "Comfortable shoes", "IC card for transit", "Cash (Japan is cash-heavy)", "Portable WiFi"],
    days: [
      {
        day: 1, title: "Shinjuku & Shibuya",
        activities: [
          { time: "09:00", name: "Check-in, Shinjuku", type: "Hotel", cost: 0, note: "Leave luggage, explore immediately" },
          { time: "11:00", name: "Meiji Shrine", type: "Landmark", cost: 0, note: "Arrive early, serene experience" },
          { time: "14:00", name: "Harajuku & Takeshita St.", type: "Shopping", cost: 30, note: "Street food & fashion" },
          { time: "19:00", name: "Shibuya Crossing at night", type: "Landmark", cost: 0, note: "Most iconic crossing in the world" },
        ]
      },
      {
        day: 2, title: "Asakusa & Akihabara",
        activities: [
          { time: "08:00", name: "Senso-ji Temple", type: "Landmark", cost: 0, note: "Go before 9am to avoid crowds" },
          { time: "11:00", name: "Nakamise shopping street", type: "Shopping", cost: 25, note: "Traditional souvenirs" },
          { time: "14:00", name: "Akihabara electronics", type: "Shopping", cost: 40, note: "Tech paradise" },
          { time: "19:00", name: "Ramen at Ichiran", type: "Food", cost: 15, note: "Solo dining booths, iconic experience" },
        ]
      },
    ],
    phrases: [
      { fr: "Sumimasen", en: "Excuse me" },
      { fr: "Arigatou gozaimasu", en: "Thank you very much" },
      { fr: "...wa doko desu ka?", en: "Where is...?" },
      { fr: "Ikura desu ka?", en: "How much is it?" },
    ],
    culture: [
      "Bow slightly when greeting — depth reflects respect level",
      "Remove shoes when entering homes and traditional restaurants",
      "Speak quietly on public transit — it's expected etiquette",
      "Cash is still king in many local restaurants and shops",
    ],
    alerts: [
      { type: "weather", msg: "Clear skies for your trip — ideal for photos" },
      { type: "flight", msg: "Narita Airport operating normally" },
    ],
    expenses: { accommodation: 380, food: 180, activities: 95, transport: 120 },
  },
};

const POPULAR_DESTINATIONS = ["Paris", "Tokyo", "Dubai", "Istanbul", "Barcelona", "Bali", "New York", "Rome"];

const INTERESTS_OPTIONS = ["Culture & History", "Food & Cuisine", "Adventure Sports", "Nature & Hiking", "Art & Museums", "Shopping", "Beaches", "Nightlife"];

// ── CSS Keyframes (injected once) ─────────────────────────────
const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { font-family: 'DM Sans', sans-serif; background: #0A1628; color: #F8F4EE; overflow-x: hidden; }
  ::-webkit-scrollbar { width: 6px; } 
  ::-webkit-scrollbar-track { background: #0A1628; }
  ::-webkit-scrollbar-thumb { background: #D4A843; border-radius: 3px; }

  @keyframes fadeUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
  @keyframes floatY { 0%,100% { transform:translateY(0px); } 50% { transform:translateY(-12px); } }
  @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
  @keyframes slideIn { from { transform:translateX(-20px); opacity:0; } to { transform:translateX(0); opacity:1; } }
  @keyframes expandWidth { from { width:0; } to { width:100%; } }
  @keyframes starFloat { 0% { opacity:0; transform:translateY(0) scale(0); } 50% { opacity:1; transform:translateY(-40px) scale(1); } 100% { opacity:0; transform:translateY(-80px) scale(0.5); } }
  @keyframes bgShift { 0%,100% { background-position:0% 50%; } 50% { background-position:100% 50%; } }

  .fadeUp { animation: fadeUp 0.7s ease forwards; }
  .fadeIn { animation: fadeIn 0.5s ease forwards; }
  .float { animation: floatY 4s ease-in-out infinite; }

  .btn-gold {
    background: linear-gradient(135deg, #D4A843, #E8892B);
    color: #0A1628;
    font-family: 'DM Sans', sans-serif;
    font-weight: 600;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }
  .btn-gold::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, #E8892B, #D4A843);
    opacity: 0;
    transition: opacity 0.3s;
  }
  .btn-gold:hover::before { opacity: 1; }
  .btn-gold:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(212,168,67,0.4); }
  .btn-gold:active { transform: translateY(0); }
  .btn-gold:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

  .btn-outline {
    background: transparent;
    color: #D4A843;
    border: 1.5px solid #D4A843;
    font-family: 'DM Sans', sans-serif;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  .btn-outline:hover { background: rgba(212,168,67,0.1); transform: translateY(-2px); }

  .card-hover {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  .card-hover:hover {
    transform: translateY(-6px);
    box-shadow: 0 20px 50px rgba(0,0,0,0.4);
  }

  .glass {
    background: rgba(17, 34, 64, 0.7);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(212,168,67,0.15);
  }

  .gradient-text {
    background: linear-gradient(135deg, #D4A843, #E8892B, #D4A843);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmer 3s linear infinite;
  }

  .input-field {
    background: rgba(10,22,40,0.8);
    border: 1px solid rgba(212,168,67,0.25);
    color: #F8F4EE;
    font-family: 'DM Sans', sans-serif;
    transition: all 0.3s ease;
    outline: none;
  }
  .input-field:focus {
    border-color: #D4A843;
    box-shadow: 0 0 0 3px rgba(212,168,67,0.1);
  }
  .input-field::placeholder { color: rgba(248,244,238,0.35); }

  .nav-link {
    position: relative;
    color: rgba(248,244,238,0.75);
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
    transition: color 0.3s;
    cursor: pointer;
    background: none;
    border: none;
    font-family: 'DM Sans', sans-serif;
    padding: 4px 0;
  }
  .nav-link::after {
    content: '';
    position: absolute;
    bottom: -2px; left: 0;
    width: 0; height: 2px;
    background: #D4A843;
    transition: width 0.3s ease;
  }
  .nav-link:hover { color: #D4A843; }
  .nav-link:hover::after { width: 100%; }
  .nav-link.active { color: #D4A843; }
  .nav-link.active::after { width: 100%; }

  .star-bg {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    overflow: hidden;
  }

  .progress-bar {
    height: 6px;
    border-radius: 3px;
    background: linear-gradient(90deg, #D4A843, #E8892B);
    transition: width 1s ease;
  }

  .alert-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 500;
  }

  .tab-btn {
    background: none;
    border: none;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    padding: 10px 20px;
    border-radius: 8px;
    transition: all 0.3s ease;
    color: rgba(248,244,238,0.6);
  }
  .tab-btn.active {
    background: rgba(212,168,67,0.15);
    color: #D4A843;
    border: 1px solid rgba(212,168,67,0.3);
  }
  .tab-btn:hover:not(.active) { color: #D4A843; background: rgba(212,168,67,0.05); }

  select.input-field option { background: #112240; color: #F8F4EE; }

  .interest-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border-radius: 24px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.25s ease;
    border: 1px solid rgba(212,168,67,0.25);
    color: rgba(248,244,238,0.7);
    background: transparent;
    font-family: 'DM Sans', sans-serif;
    user-select: none;
  }
  .interest-chip.selected {
    background: rgba(212,168,67,0.15);
    border-color: #D4A843;
    color: #D4A843;
  }
  .interest-chip:hover { border-color: rgba(212,168,67,0.6); color: #F8F4EE; }

  .section-enter { animation: fadeUp 0.6s ease both; }
  .section-enter:nth-child(1) { animation-delay: 0s; }
  .section-enter:nth-child(2) { animation-delay: 0.1s; }
  .section-enter:nth-child(3) { animation-delay: 0.2s; }
  .section-enter:nth-child(4) { animation-delay: 0.3s; }
  .section-enter:nth-child(5) { animation-delay: 0.4s; }
  .section-enter:nth-child(6) { animation-delay: 0.5s; }

  .error-toast {
    position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
    background: rgba(244,67,54,0.95); color: white; padding: 14px 28px;
    border-radius: 12px; font-size: 14px; z-index: 9999;
    box-shadow: 0 8px 32px rgba(0,0,0,0.4); animation: fadeUp 0.4s ease;
  }
`;

// ── Helpers ───────────────────────────────────────────────────
function typeIcon(type) {
  const map = { Hotel:"🏨", Landmark:"🏛️", Tour:"🚢", Food:"🍽️", Museum:"🖼️", Transport:"🚆", Shopping:"🛍️", Experience:"✨" };
  return map[type] || "📍";
}

function StarBackground() {
  const stars = Array.from({length: 60}, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2.5 + 0.5,
    opacity: Math.random() * 0.6 + 0.1,
    delay: Math.random() * 3,
    dur: Math.random() * 3 + 2,
  }));
  return (
    <div className="star-bg">
      <svg width="100%" height="100%">
        {stars.map(s => (
          <circle key={s.id} cx={`${s.x}%`} cy={`${s.y}%`} r={s.size}
            fill={s.id % 5 === 0 ? C.gold : C.white}
            opacity={s.opacity}
            style={{ animation: `pulse ${s.dur}s ${s.delay}s ease-in-out infinite` }}
          />
        ))}
      </svg>
    </div>
  );
}

function Spinner({ msg }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:16, padding:"60px 0" }}>
      <div style={{ width:56, height:56, border:`3px solid rgba(212,168,67,0.2)`, borderTop:`3px solid ${C.gold}`, borderRadius:"50%", animation:"spin 1s linear infinite" }} />
      <p style={{ color:C.muted, fontSize:14, animation:"pulse 2s ease-in-out infinite" }}>
        {msg || "Rahbar is crafting your journey…"}
      </p>
    </div>
  );
}

function BudgetBar({ label, amount, total, color }) {
  const pct = Math.round((amount / total) * 100);
  return (
    <div style={{ marginBottom:16 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
        <span style={{ fontSize:13, color:C.muted }}>{label}</span>
        <span style={{ fontSize:13, color:C.offWhite, fontWeight:600 }}>${amount} <span style={{ color:C.muted, fontWeight:400 }}>({pct}%)</span></span>
      </div>
      <div style={{ background:"rgba(255,255,255,0.07)", borderRadius:3, height:6, overflow:"hidden" }}>
        <div className="progress-bar" style={{ width:`${pct}%`, background:color }} />
      </div>
    </div>
  );
}

// ── NAVBAR ────────────────────────────────────────────────────
function Navbar({ page, setPage, mobileOpen, setMobileOpen }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);
  const links = [["home","Home"],["plan","Plan Trip"],["dashboard","Dashboard"],["about","About"]];
  return (
    <>
      <nav style={{
        position:"fixed", top:0, left:0, right:0, zIndex:1000,
        padding: scrolled ? "12px 0" : "20px 0",
        background: scrolled ? "rgba(10,22,40,0.95)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(212,168,67,0.12)" : "none",
        transition:"all 0.4s ease",
      }}>
        <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 24px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <button onClick={() => setPage("home")} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:38, height:38, borderRadius:"50%", background:`linear-gradient(135deg, ${C.gold}, ${C.amber})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>🧭</div>
            <div>
              <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, fontWeight:600, color:C.gold, lineHeight:1 }}>Rahbar</div>
              <div style={{ fontSize:9, color:C.muted, letterSpacing:"0.15em", textTransform:"uppercase" }}>Smart Travel</div>
            </div>
          </button>
          <div style={{ display:"flex", gap:32, alignItems:"center" }} className="desktop-nav">
            {links.map(([id, label]) => (
              <button key={id} className={`nav-link ${page===id?"active":""}`} onClick={() => setPage(id)}>{label}</button>
            ))}
            <button className="btn-gold" onClick={() => setPage("plan")} style={{ padding:"9px 22px", borderRadius:24, fontSize:13 }}>
              ✈️ Plan Trip
            </button>
          </div>
          <button onClick={() => setMobileOpen(o => !o)} style={{ background:"none", border:"none", cursor:"pointer", display:"none", color:C.gold, fontSize:22 }} className="mobile-menu-btn">
            {mobileOpen ? "✕" : "☰"}
          </button>
        </div>
      </nav>
      {mobileOpen && (
        <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, background:"rgba(10,22,40,0.97)", zIndex:999, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:32, animation:"fadeIn 0.3s ease" }}>
          <button onClick={() => setMobileOpen(false)} style={{ position:"absolute", top:24, right:24, background:"none", border:"none", color:C.gold, fontSize:28, cursor:"pointer" }}>✕</button>
          {links.map(([id, label]) => (
            <button key={id} className={`nav-link ${page===id?"active":""}`} style={{ fontSize:22 }} onClick={() => { setPage(id); setMobileOpen(false); }}>{label}</button>
          ))}
        </div>
      )}
      <style>{`.mobile-menu-btn { display: none !important; } @media(max-width:768px){ .desktop-nav { display: none !important; } .mobile-menu-btn { display: flex !important; } }`}</style>
    </>
  );
}

// ── HOME PAGE ─────────────────────────────────────────────────
function HomePage({ setPage }) {
  const features = [
    { icon:"🗺️", title:"AI Itinerary Builder", desc:"Personalized day-by-day plans generated from your budget, dates, and interests using Gemini AI." },
    { icon:"🌤️", title:"Weather-Smart Packing", desc:"Smart packing lists tailored to your destination's forecast via OpenWeatherMap integration." },
    { icon:"🚨", title:"Real-Time Alerts", desc:"Live flight delay detection and emergency re-routing powered by AviationStack API." },
    { icon:"💰", title:"Expense Tracker", desc:"Track spending in real time with categorized breakdowns and budget alerts." },
    { icon:"🌍", title:"Cultural Guide", desc:"Local etiquette tips, useful phrases, and cultural insights for every destination." },
    { icon:"📍", title:"POI Discovery", desc:"Explore restaurants, landmarks, and hidden gems using OpenStreetMap data." },
  ];
  const stats = [
    { value:"50K+", label:"Trips Planned" },
    { value:"120+", label:"Countries Covered" },
    { value:"98%", label:"Traveler Satisfaction" },
    { value:"24/7", label:"AI Assistance" },
  ];
  const destinations = [
    { name:"Paris", emoji:"🗼", tag:"Romance" },
    { name:"Tokyo", emoji:"⛩️", tag:"Culture" },
    { name:"Bali", emoji:"🌴", tag:"Nature" },
    { name:"Dubai", emoji:"🏙️", tag:"Luxury" },
  ];
  return (
    <div style={{ minHeight:"100vh", position:"relative" }}>
      <section style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", textAlign:"center", padding:"120px 24px 80px", position:"relative" }}>
        <div style={{ maxWidth:800, position:"relative", zIndex:1 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(212,168,67,0.1)", border:"1px solid rgba(212,168,67,0.3)", borderRadius:24, padding:"6px 18px", marginBottom:28, animation:"fadeUp 0.6s 0.1s both" }}>
            <span style={{ fontSize:14 }}>✨</span>
            <span style={{ fontSize:13, color:C.gold, letterSpacing:"0.08em" }}>AI-POWERED TRAVEL COMPANION</span>
          </div>
          <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(52px,8vw,96px)", fontWeight:600, lineHeight:1.0, marginBottom:24, animation:"fadeUp 0.7s 0.2s both" }}>
            <span style={{ color:C.offWhite }}>Your Journey,</span><br/>
            <span className="gradient-text">Perfectly Planned</span>
          </h1>
          <p style={{ fontSize:"clamp(15px,2.5vw,18px)", color:C.muted, lineHeight:1.8, marginBottom:48, maxWidth:580, margin:"0 auto 48px", animation:"fadeUp 0.7s 0.35s both" }}>
            Rahbar is an intelligent travel assistant that transforms your travel preferences into beautifully crafted itineraries — with real-time alerts, budget tracking, and cultural wisdom.
          </p>
          <div style={{ display:"flex", gap:16, justifyContent:"center", flexWrap:"wrap", animation:"fadeUp 0.7s 0.5s both" }}>
            <button className="btn-gold" onClick={() => setPage("plan")} style={{ padding:"16px 36px", borderRadius:50, fontSize:16, position:"relative", zIndex:1 }}>
              ✈️ Plan Your Trip
            </button>
            <button className="btn-outline" onClick={() => setPage("dashboard")} style={{ padding:"16px 36px", borderRadius:50, fontSize:16 }}>
              📊 View Demo
            </button>
          </div>
        </div>
        <div className="float" style={{ position:"absolute", right:"8%", top:"30%", fontSize:80, opacity:0.12, userSelect:"none" }}>🧭</div>
        <div className="float" style={{ position:"absolute", left:"6%", bottom:"25%", fontSize:60, opacity:0.1, userSelect:"none", animationDelay:"1.5s" }}>✈️</div>
      </section>

      <section style={{ padding:"60px 24px", borderTop:"1px solid rgba(212,168,67,0.1)", borderBottom:"1px solid rgba(212,168,67,0.1)" }}>
        <div style={{ maxWidth:900, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:24, textAlign:"center" }}>
          {stats.map((s,i) => (
            <div key={i} style={{ animation:`fadeUp 0.6s ${i*0.1}s both` }}>
              <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:48, fontWeight:600, color:C.gold }}>{s.value}</div>
              <div style={{ fontSize:13, color:C.muted, letterSpacing:"0.05em", textTransform:"uppercase" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding:"100px 24px", maxWidth:1200, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:64 }}>
          <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(36px,5vw,56px)", fontWeight:600, color:C.offWhite, marginBottom:12 }}>Everything You Need</h2>
          <p style={{ color:C.muted, fontSize:16, maxWidth:480, margin:"0 auto" }}>One intelligent companion for the complete travel lifecycle — before, during, and after your trip.</p>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))", gap:24 }}>
          {features.map((f,i) => (
            <div key={i} className="glass card-hover section-enter" style={{ padding:32, borderRadius:16 }}>
              <div style={{ fontSize:36, marginBottom:16 }}>{f.icon}</div>
              <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:24, fontWeight:600, color:C.gold, marginBottom:10 }}>{f.title}</h3>
              <p style={{ color:C.muted, fontSize:14, lineHeight:1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding:"80px 24px", background:"rgba(17,34,64,0.4)" }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:56 }}>
            <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(32px,5vw,52px)", fontWeight:600, color:C.offWhite, marginBottom:10 }}>
              Popular <span className="gradient-text">Destinations</span>
            </h2>
            <p style={{ color:C.muted, fontSize:15 }}>Rahbar has you covered across the globe</p>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:20 }}>
            {destinations.map((d,i) => (
              <div key={i} className="glass card-hover" style={{ padding:"32px 24px", borderRadius:16, textAlign:"center", cursor:"pointer", animation:`fadeUp 0.6s ${i*0.1}s both` }}
                onClick={() => setPage("plan")}>
                <div style={{ fontSize:48, marginBottom:12 }}>{d.emoji}</div>
                <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, fontWeight:600, color:C.offWhite, marginBottom:4 }}>{d.name}</div>
                <div style={{ fontSize:12, background:"rgba(212,168,67,0.12)", color:C.gold, padding:"3px 12px", borderRadius:20, display:"inline-block" }}>{d.tag}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding:"100px 24px", textAlign:"center" }}>
        <div style={{ maxWidth:700, margin:"0 auto" }}>
          <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(36px,5vw,60px)", fontWeight:600, color:C.offWhite, marginBottom:20, lineHeight:1.1 }}>
            Ready to Travel <span className="gradient-text">Smarter?</span>
          </h2>
          <p style={{ color:C.muted, fontSize:16, marginBottom:40, lineHeight:1.7 }}>
            Let Rahbar handle the planning while you focus on the memories. Start with your dream destination.
          </p>
          <button className="btn-gold" onClick={() => setPage("plan")} style={{ padding:"18px 48px", borderRadius:50, fontSize:17, position:"relative", zIndex:1 }}>
            🌍 Start Planning Now →
          </button>
        </div>
      </section>
    </div>
  );
}

// ── TRIP PLANNER ──────────────────────────────────────────────
function PlannerPage({ setPage, setTripData }) {
  const [form, setForm] = useState({ destination:"Paris", budget:"", startDate:"", endDate:"", travelers:"1", interests:[], style:"Balanced" });
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("Contacting Rahbar AI…");
  const [step, setStep] = useState(1);
  const [error, setError] = useState(null);

  const update = (k,v) => setForm(f => ({ ...f, [k]:v }));
  const toggleInterest = (i) => setForm(f => ({
    ...f, interests: f.interests.includes(i) ? f.interests.filter(x=>x!==i) : [...f.interests, i]
  }));

  // ── REAL API CALL ─────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.budget || !form.startDate || !form.endDate) {
      setError("Please fill in budget and dates.");
      return;
    }
    setError(null);
    setLoading(true);

    const msgs = [
      "Calling Gemini AI for your itinerary…",
      "Fetching live weather data…",
      "Checking flight alerts…",
      "Personalizing your experience…",
      "Almost ready…",
    ];
    let msgIdx = 0;
    setLoadingMsg(msgs[0]);
    const interval = setInterval(() => {
      msgIdx = (msgIdx + 1) % msgs.length;
      setLoadingMsg(msgs[msgIdx]);
    }, 1800);

    try {
      const itinerary = await apiFetch("/api/itinerary", {
        method: "POST",
        body: JSON.stringify({
          destination: form.destination,
          budget: parseFloat(form.budget),
          startDate: form.startDate,
          endDate: form.endDate,
          travelers: form.travelers,
          interests: form.interests.join(", ") || "General travel",
          style: form.style,
        }),
      });

      setTripData({ ...form, itinerary, destinationKey: form.destination });
      setPage("dashboard");
    } catch (err) {
      setError(`Failed to generate itinerary: ${err.message}. Make sure backend is running at localhost:8000`);
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  const travelStyles = ["Budget", "Balanced", "Comfort", "Luxury"];

  return (
    <div style={{ minHeight:"100vh", padding:"100px 24px 60px", position:"relative", zIndex:1 }}>
      {error && (
        <div className="error-toast" onClick={() => setError(null)}>{error} ✕</div>
      )}
      <div style={{ maxWidth:760, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:56, animation:"fadeUp 0.7s both" }}>
          <div style={{ fontSize:48, marginBottom:12 }}>✈️</div>
          <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(36px,5vw,56px)", fontWeight:600, color:C.offWhite, marginBottom:10 }}>
            Plan Your <span className="gradient-text">Dream Trip</span>
          </h1>
          <p style={{ color:C.muted, fontSize:15 }}>Tell Rahbar about your journey and get a personalized itinerary in seconds.</p>
        </div>

        {/* Steps */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:0, marginBottom:48, animation:"fadeUp 0.7s 0.1s both" }}>
          {[1,2,3].map((s, i) => (
            <div key={s} style={{ display:"flex", alignItems:"center" }}>
              <div onClick={() => setStep(s)} style={{ width:36, height:36, borderRadius:"50%", background: step>=s ? `linear-gradient(135deg,${C.gold},${C.amber})` : "rgba(255,255,255,0.07)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:600, color: step>=s ? C.night : C.muted, cursor:"pointer", transition:"all 0.3s ease", border: step===s ? "none" : "1px solid rgba(255,255,255,0.1)" }}>
                {s}
              </div>
              {i < 2 && <div style={{ width:60, height:2, background: step>s ? `linear-gradient(90deg,${C.gold},${C.amber})` : "rgba(255,255,255,0.07)" }} />}
            </div>
          ))}
        </div>
        <div style={{ display:"flex", justifyContent:"center", gap:44, marginBottom:48 }}>
          {["Destination","Details","Preferences"].map((l,i) => (
            <span key={i} style={{ fontSize:12, color: step>=i+1 ? C.gold : C.muted, transition:"color 0.3s", letterSpacing:"0.05em" }}>{l}</span>
          ))}
        </div>

        {loading ? <Spinner msg={loadingMsg} /> : (
          <div className="glass" style={{ borderRadius:20, padding:"40px 40px", animation:"fadeIn 0.5s both" }}>
            {/* Step 1 */}
            {step === 1 && (
              <div style={{ animation:"slideIn 0.4s both" }}>
                <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:28, color:C.gold, marginBottom:28 }}>Where to?</h3>
                <div style={{ marginBottom:24 }}>
                  <label style={{ display:"block", fontSize:13, color:C.muted, marginBottom:8, letterSpacing:"0.05em", textTransform:"uppercase" }}>Destination</label>
                  <input
                    type="text"
                    className="input-field"
                    value={form.destination}
                    onChange={e => update("destination", e.target.value)}
                    placeholder="e.g. Paris, Tokyo, Lahore, Dubai…"
                    style={{ width:"100%", padding:"13px 16px", borderRadius:10, fontSize:15 }}
                    list="dest-list"
                  />
                  <datalist id="dest-list">
                    {POPULAR_DESTINATIONS.map(d => <option key={d} value={d} />)}
                  </datalist>
                </div>
                <div style={{ marginBottom:24 }}>
                  <label style={{ display:"block", fontSize:13, color:C.muted, marginBottom:8, letterSpacing:"0.05em", textTransform:"uppercase" }}>Number of Travelers</label>
                  <div style={{ display:"flex", gap:10 }}>
                    {["1","2","3","4","5+"].map(n => (
                      <button key={n} onClick={() => update("travelers",n)} style={{ flex:1, padding:"12px 0", borderRadius:10, border:`1px solid ${form.travelers===n ? C.gold : "rgba(212,168,67,0.2)"}`, background: form.travelers===n ? "rgba(212,168,67,0.15)" : "transparent", color: form.travelers===n ? C.gold : C.muted, fontFamily:"'DM Sans',sans-serif", fontSize:15, cursor:"pointer", transition:"all 0.2s" }}>{n}</button>
                    ))}
                  </div>
                </div>
                <button className="btn-gold" onClick={() => setStep(2)} style={{ width:"100%", padding:"15px", borderRadius:12, fontSize:16, marginTop:8 }}>
                  Continue →
                </button>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div style={{ animation:"slideIn 0.4s both" }}>
                <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:28, color:C.gold, marginBottom:28 }}>Dates & Budget</h3>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18, marginBottom:20 }}>
                  <div>
                    <label style={{ display:"block", fontSize:13, color:C.muted, marginBottom:8, letterSpacing:"0.05em", textTransform:"uppercase" }}>Start Date</label>
                    <input type="date" className="input-field" value={form.startDate} onChange={e => update("startDate",e.target.value)} style={{ width:"100%", padding:"13px 16px", borderRadius:10, fontSize:14 }} />
                  </div>
                  <div>
                    <label style={{ display:"block", fontSize:13, color:C.muted, marginBottom:8, letterSpacing:"0.05em", textTransform:"uppercase" }}>End Date</label>
                    <input type="date" className="input-field" value={form.endDate} onChange={e => update("endDate",e.target.value)} style={{ width:"100%", padding:"13px 16px", borderRadius:10, fontSize:14 }} />
                  </div>
                </div>
                <div style={{ marginBottom:24 }}>
                  <label style={{ display:"block", fontSize:13, color:C.muted, marginBottom:8, letterSpacing:"0.05em", textTransform:"uppercase" }}>Total Budget (USD)</label>
                  <div style={{ position:"relative" }}>
                    <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:C.gold, fontSize:16, fontWeight:600 }}>$</span>
                    <input type="number" className="input-field" placeholder="e.g. 2500" value={form.budget} onChange={e => update("budget",e.target.value)} style={{ width:"100%", padding:"13px 16px 13px 34px", borderRadius:10, fontSize:15 }} />
                  </div>
                </div>
                <div style={{ marginBottom:28 }}>
                  <label style={{ display:"block", fontSize:13, color:C.muted, marginBottom:10, letterSpacing:"0.05em", textTransform:"uppercase" }}>Travel Style</label>
                  <div style={{ display:"flex", gap:10 }}>
                    {travelStyles.map(s => (
                      <button key={s} onClick={() => update("style",s)} style={{ flex:1, padding:"10px 0", borderRadius:10, border:`1px solid ${form.style===s ? C.gold : "rgba(212,168,67,0.2)"}`, background: form.style===s ? "rgba(212,168,67,0.15)" : "transparent", color: form.style===s ? C.gold : C.muted, fontFamily:"'DM Sans',sans-serif", fontSize:13, cursor:"pointer", transition:"all 0.2s" }}>{s}</button>
                    ))}
                  </div>
                </div>
                <div style={{ display:"flex", gap:12 }}>
                  <button className="btn-outline" onClick={() => setStep(1)} style={{ flex:1, padding:"14px", borderRadius:12, fontSize:15 }}>← Back</button>
                  <button className="btn-gold" onClick={() => setStep(3)} style={{ flex:2, padding:"14px", borderRadius:12, fontSize:15 }}>Continue →</button>
                </div>
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div style={{ animation:"slideIn 0.4s both" }}>
                <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:28, color:C.gold, marginBottom:8 }}>Your Interests</h3>
                <p style={{ color:C.muted, fontSize:14, marginBottom:28 }}>Select all that apply — Rahbar will tailor your itinerary accordingly.</p>
                <div style={{ display:"flex", flexWrap:"wrap", gap:10, marginBottom:32 }}>
                  {INTERESTS_OPTIONS.map(i => (
                    <button key={i} className={`interest-chip ${form.interests.includes(i)?"selected":""}`} onClick={() => toggleInterest(i)}>
                      {form.interests.includes(i) ? "✓ " : ""}{i}
                    </button>
                  ))}
                </div>
                {/* Summary */}
                <div style={{ background:"rgba(212,168,67,0.05)", border:"1px solid rgba(212,168,67,0.15)", borderRadius:12, padding:"18px 20px", marginBottom:24 }}>
                  <div style={{ fontSize:13, color:C.muted, marginBottom:10, letterSpacing:"0.05em", textTransform:"uppercase" }}>Trip Summary</div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                    {[
                      ["📍 Destination", form.destination],
                      ["💰 Budget", form.budget ? `$${form.budget}` : "—"],
                      ["📅 Dates", form.startDate && form.endDate ? `${form.startDate} → ${form.endDate}` : "—"],
                      ["👥 Travelers", form.travelers],
                      ["🎯 Style", form.style],
                      ["💡 Interests", form.interests.length ? `${form.interests.length} selected` : "General"],
                    ].map(([k,v],i) => (
                      <div key={i} style={{ fontSize:13 }}>
                        <span style={{ color:C.muted }}>{k}: </span>
                        <span style={{ color:C.offWhite, fontWeight:500 }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ display:"flex", gap:12 }}>
                  <button className="btn-outline" onClick={() => setStep(2)} style={{ flex:1, padding:"14px", borderRadius:12, fontSize:15 }}>← Back</button>
                  <button className="btn-gold" onClick={handleSubmit} style={{ flex:2, padding:"14px", borderRadius:12, fontSize:15, position:"relative", zIndex:1 }}>
                    🗺️ Generate My Itinerary
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── DASHBOARD ─────────────────────────────────────────────────
function DashboardPage({ tripData, setPage }) {
  const [activeTab, setActiveTab] = useState("itinerary");
  const [activeDay, setActiveDay] = useState(0);

  const data = tripData?.itinerary || SAMPLE_ITINERARY["Paris"];
  const dest = tripData?.destination || "Paris";
  const budget = tripData?.budget || "2500";
  const startDate = tripData?.startDate || "2025-06-15";
  const travelers = tripData?.travelers || "2";

  const totalExpenses = Object.values(data.expenses || {}).reduce((a,b) => a+b, 0);
  const budgetNum = parseFloat(budget) || 2500;
  const remaining = budgetNum - totalExpenses;

  const downloadPDF = () => {
    const lines = [];
    lines.push(`RAHBAR – SMART TRAVEL COMPANION`);
    lines.push(`Trip to ${dest}`);
    lines.push(`Budget: $${budget} | Travelers: ${travelers} | Start: ${startDate}`);
    lines.push("=".repeat(50));
    lines.push("");
    lines.push("ITINERARY:");
    (data.days || []).forEach(d => {
      lines.push(`\nDay ${d.day}: ${d.title}`);
      (d.activities || []).forEach(a => {
        lines.push(`  ${a.time} – ${a.name} (${a.type}) – $${a.cost}`);
        lines.push(`           Note: ${a.note}`);
      });
    });
    lines.push("\nBUDGET SUMMARY:");
    Object.entries(data.expenses || {}).forEach(([k,v]) => lines.push(`  ${k}: $${v}`));
    lines.push(`  Total Estimated: $${totalExpenses}`);
    lines.push(`  Remaining Budget: $${remaining.toFixed(0)}`);
    lines.push("\nPACKING LIST:");
    (data.packing || []).forEach(p => lines.push(`  ✓ ${p}`));
    lines.push("\nLANGUAGE PHRASES:");
    (data.phrases || []).forEach(p => lines.push(`  ${p.fr} = ${p.en}`));
    lines.push("\n\nGenerated by Rahbar – Smart Travel Companion");
    const blob = new Blob([lines.join("\n")], { type:"text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `Rahbar_${dest}_Itinerary.txt`;
    a.click(); URL.revokeObjectURL(url);
  };

  const days = data.days || [];
  const currentDay = days[activeDay] || days[0];

  return (
    <div style={{ minHeight:"100vh", padding:"100px 24px 60px", position:"relative", zIndex:1 }}>
      <div style={{ maxWidth:1100, margin:"0 auto" }}>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:16, marginBottom:40, animation:"fadeUp 0.7s both" }}>
          <div>
            <div style={{ fontSize:13, color:C.muted, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:6 }}>YOUR JOURNEY</div>
            <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(32px,5vw,56px)", fontWeight:600, color:C.offWhite, lineHeight:1.1 }}>
              {dest} <span className="gradient-text">Awaits</span>
            </h1>
            <div style={{ display:"flex", gap:16, marginTop:10, flexWrap:"wrap" }}>
              {[`📅 ${startDate}`, `👥 ${travelers} travelers`, `💰 $${budget} budget`, data.weather].filter(Boolean).map((b,i) => (
                <span key={i} style={{ fontSize:13, color:C.muted, background:"rgba(255,255,255,0.05)", padding:"4px 12px", borderRadius:20, border:"1px solid rgba(255,255,255,0.08)" }}>{b}</span>
              ))}
            </div>
          </div>
          <div style={{ display:"flex", gap:12 }}>
            <button className="btn-outline" onClick={() => setPage("plan")} style={{ padding:"11px 22px", borderRadius:24, fontSize:14 }}>
              ✏️ Edit Trip
            </button>
            <button className="btn-gold" onClick={downloadPDF} style={{ padding:"11px 22px", borderRadius:24, fontSize:14, position:"relative", zIndex:1 }}>
              ⬇️ Download Plan
            </button>
          </div>
        </div>

        {/* Alerts */}
        {data.alerts && data.alerts.length > 0 && (
          <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:32, animation:"fadeUp 0.7s 0.1s both" }}>
            {data.alerts.map((a,i) => (
              <div key={i} className="alert-badge" style={{ background: a.type==="weather" ? "rgba(43,130,184,0.15)" : "rgba(212,168,67,0.12)", color: a.type==="weather" ? "#5BB8F5" : C.gold, border:`1px solid ${a.type==="weather" ? "rgba(91,184,245,0.3)" : "rgba(212,168,67,0.3)"}` }}>
                {a.type==="weather" ? "⛅" : "✈️"} {a.msg}
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display:"flex", gap:8, marginBottom:32, animation:"fadeUp 0.7s 0.2s both", flexWrap:"wrap" }}>
          {[["itinerary","🗓️ Itinerary"],["budget","💰 Budget"],["packing","🧳 Packing"],["culture","🌍 Culture"]].map(([id,label]) => (
            <button key={id} className={`tab-btn ${activeTab===id?"active":""}`} onClick={() => setActiveTab(id)}>{label}</button>
          ))}
        </div>

        {/* ITINERARY TAB */}
        {activeTab === "itinerary" && (
          <div style={{ animation:"fadeIn 0.4s both" }}>
            <div style={{ display:"flex", gap:10, marginBottom:28, overflowX:"auto", paddingBottom:8 }}>
              {days.map((d,i) => (
                <button key={i} onClick={() => setActiveDay(i)} style={{ flexShrink:0, padding:"10px 20px", borderRadius:12, border:`1px solid ${activeDay===i ? C.gold : "rgba(212,168,67,0.2)"}`, background: activeDay===i ? "rgba(212,168,67,0.15)" : "transparent", color: activeDay===i ? C.gold : C.muted, fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:500, cursor:"pointer", transition:"all 0.2s", whiteSpace:"nowrap" }}>
                  Day {d.day}: {d.title}
                </button>
              ))}
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              {(currentDay?.activities || []).map((a,i) => (
                <div key={i} className="glass card-hover" style={{ padding:"20px 24px", borderRadius:14, display:"flex", alignItems:"center", gap:20, animation:`slideIn 0.4s ${i*0.07}s both` }}>
                  <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, color:C.gold, minWidth:56, fontWeight:600, letterSpacing:"-0.02em" }}>{a.time}</div>
                  <div style={{ fontSize:28 }}>{typeIcon(a.type)}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, color:C.offWhite, fontSize:16, marginBottom:3 }}>{a.name}</div>
                    <div style={{ fontSize:13, color:C.muted }}>{a.note}</div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontSize:14, background:"rgba(212,168,67,0.1)", color:C.gold, padding:"3px 12px", borderRadius:20, marginBottom:4 }}>{a.type}</div>
                    <div style={{ fontSize:16, fontWeight:600, color: a.cost===0 ? "#4CAF50" : C.offWhite }}>{a.cost===0 ? "Free" : `$${a.cost}`}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BUDGET TAB */}
        {activeTab === "budget" && (
          <div style={{ animation:"fadeIn 0.4s both" }}>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))", gap:24 }}>
              <div className="glass" style={{ padding:28, borderRadius:16 }}>
                <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:24, color:C.gold, marginBottom:20 }}>Budget Overview</h3>
                <div style={{ marginBottom:28 }}>
                  {[
                    { label:"Accommodation", amount:data.expenses?.accommodation||0, color:`linear-gradient(90deg,${C.teal},${C.tealLight})` },
                    { label:"Food & Dining", amount:data.expenses?.food||0, color:`linear-gradient(90deg,${C.gold},${C.amber})` },
                    { label:"Activities", amount:data.expenses?.activities||0, color:`linear-gradient(90deg,#7C5CBF,#9D7BE8)` },
                    { label:"Transport", amount:data.expenses?.transport||0, color:`linear-gradient(90deg,#3A8FD4,#5BB8F5)` },
                  ].map((b,i) => <BudgetBar key={i} {...b} total={totalExpenses||1} />)}
                </div>
                <div style={{ borderTop:"1px solid rgba(255,255,255,0.08)", paddingTop:18 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                    <span style={{ color:C.muted, fontSize:14 }}>Total Estimated</span>
                    <span style={{ color:C.offWhite, fontWeight:600, fontSize:16 }}>${totalExpenses}</span>
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between" }}>
                    <span style={{ color:C.muted, fontSize:14 }}>Your Budget</span>
                    <span style={{ color:C.gold, fontWeight:600, fontSize:16 }}>${budgetNum}</span>
                  </div>
                  <div style={{ marginTop:16, padding:"12px 16px", borderRadius:10, background: remaining > 0 ? "rgba(76,175,80,0.1)" : "rgba(244,67,54,0.1)", border:`1px solid ${remaining > 0 ? "rgba(76,175,80,0.3)" : "rgba(244,67,54,0.3)"}` }}>
                    <span style={{ color: remaining > 0 ? "#4CAF50" : "#F44336", fontWeight:600 }}>
                      {remaining > 0 ? `✅ $${remaining.toFixed(0)} remaining` : `⚠️ $${Math.abs(remaining).toFixed(0)} over budget`}
                    </span>
                  </div>
                </div>
              </div>
              <div className="glass" style={{ padding:28, borderRadius:16 }}>
                <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:24, color:C.gold, marginBottom:20 }}>Daily Activity Costs</h3>
                {days.map((d,i) => {
                  const dayCost = (d.activities||[]).reduce((s,a) => s+a.cost, 0);
                  return (
                    <div key={i} style={{ marginBottom:16 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                        <span style={{ fontSize:14, color:C.muted }}>Day {d.day}: {d.title}</span>
                        <span style={{ fontSize:14, color:C.offWhite, fontWeight:600 }}>${dayCost}</span>
                      </div>
                      <div style={{ background:"rgba(255,255,255,0.06)", borderRadius:4, height:8, overflow:"hidden" }}>
                        <div style={{ height:"100%", width:`${Math.min((dayCost/200)*100,100)}%`, background:`linear-gradient(90deg,${C.gold},${C.amber})`, borderRadius:4, transition:"width 1s ease" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* PACKING TAB */}
        {activeTab === "packing" && (
          <div style={{ animation:"fadeIn 0.4s both" }}>
            <div className="glass" style={{ padding:32, borderRadius:16, maxWidth:600 }}>
              <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:28, color:C.gold, marginBottom:8 }}>🧳 Smart Packing List</h3>
              <p style={{ color:C.muted, fontSize:14, marginBottom:28 }}>Curated for {dest} — {data.weather}</p>
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                {(data.packing||[]).map((item,i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 18px", background:"rgba(255,255,255,0.04)", borderRadius:12, border:"1px solid rgba(255,255,255,0.07)", animation:`slideIn 0.4s ${i*0.07}s both` }}>
                    <div style={{ width:20, height:20, borderRadius:4, border:`2px solid ${C.gold}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, color:C.gold, flexShrink:0 }}>✓</div>
                    <span style={{ color:C.offWhite, fontSize:15 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CULTURE TAB */}
        {activeTab === "culture" && (
          <div style={{ animation:"fadeIn 0.4s both" }}>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))", gap:24 }}>
              <div className="glass" style={{ padding:28, borderRadius:16 }}>
                <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:26, color:C.gold, marginBottom:20 }}>🗣️ Useful Phrases</h3>
                <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                  {(data.phrases||[]).map((p,i) => (
                    <div key={i} style={{ padding:"14px 16px", background:"rgba(255,255,255,0.04)", borderRadius:10, animation:`slideIn 0.4s ${i*0.07}s both` }}>
                      <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:20, color:C.gold, fontWeight:600, marginBottom:3 }}>{p.fr}</div>
                      <div style={{ fontSize:13, color:C.muted }}>{p.en}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="glass" style={{ padding:28, borderRadius:16 }}>
                <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:26, color:C.gold, marginBottom:20 }}>🌍 Cultural Etiquette</h3>
                <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                  {(data.culture||[]).map((tip,i) => (
                    <div key={i} style={{ display:"flex", gap:12, padding:"14px 16px", background:"rgba(255,255,255,0.04)", borderRadius:10, animation:`slideIn 0.4s ${i*0.07}s both` }}>
                      <span style={{ color:C.gold, fontSize:16, flexShrink:0, marginTop:1 }}>💡</span>
                      <span style={{ color:C.muted, fontSize:14, lineHeight:1.6 }}>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── ABOUT ─────────────────────────────────────────────────────
function AboutPage() {
  return (
    <div style={{ minHeight:"100vh", padding:"100px 24px 60px", position:"relative", zIndex:1 }}>
      <div style={{ maxWidth:900, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:56, animation:"fadeUp 0.7s both" }}>
          <div style={{ fontSize:48, marginBottom:12 }}>🧭</div>
          <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(36px,5vw,52px)", fontWeight:600, color:C.offWhite, marginBottom:10 }}>
            About <span className="gradient-text">Rahbar</span>
          </h1>
          <p style={{ color:C.muted, fontSize:15 }}>Rahbar is your smart travel companion, designed to make every journey effortless, confident, and memorable.</p>
        </div>
        <div className="glass" style={{ padding:40, borderRadius:20, animation:"fadeUp 0.7s 0.1s both" }}>
          <div style={{ display:"grid", gap:28 }}>
            <div>
              <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:28, color:C.gold, marginBottom:12 }}>What is Rahbar?</h2>
              <p style={{ color:C.muted, fontSize:15, lineHeight:1.8 }}>
                Rahbar is a modern AI-powered travel planning experience built to help you discover destinations, organize budgets, and craft personalized itineraries with ease. Powered by Gemini AI, OpenWeatherMap, and AviationStack.
              </p>
            </div>
            <div>
              <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:28, color:C.gold, marginBottom:12 }}>Why choose Rahbar?</h2>
              <p style={{ color:C.muted, fontSize:15, lineHeight:1.8 }}>
                Whether you are planning a weekend escape or a long-awaited vacation, Rahbar helps you travel smarter by delivering weather-aware packing advice, cultural insights, and clear itinerary recommendations.
              </p>
            </div>
            <div>
              <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:28, color:C.gold, marginBottom:12 }}>Developed by</h2>
              <p style={{ color:C.muted, fontSize:15, lineHeight:1.8 }}>
                Rahbar was developed by <strong style={{ color:C.offWhite }}>Muhammad Mahaz Noor</strong>, bringing travel planning innovation and thoughtful design to every journey.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── FOOTER ────────────────────────────────────────────────────
function Footer({ setPage }) {
  return (
    <footer style={{ background:"rgba(10,22,40,0.95)", borderTop:"1px solid rgba(212,168,67,0.1)", padding:"60px 24px 30px", position:"relative", zIndex:2 }}>
      <div style={{ maxWidth:1200, margin:"0 auto" }}>
        <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", gap:40, marginBottom:48 }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
              <div style={{ width:36, height:36, borderRadius:"50%", background:`linear-gradient(135deg,${C.gold},${C.amber})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>🧭</div>
              <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:24, fontWeight:600, color:C.gold }}>Rahbar</span>
            </div>
            <p style={{ color:C.muted, fontSize:14, lineHeight:1.8, maxWidth:280 }}>
              Your intelligent travel companion — turning travel dreams into perfectly crafted journeys.
            </p>
          </div>
          {[
            { heading:"Product", links:[["home","Home"],["plan","Plan Trip"],["dashboard","Dashboard"]] },
            { heading:"Features", links:[["plan","Itinerary AI"],["plan","Budget Tracker"],["plan","Cultural Guide"]] },
            { heading:"Company", links:[["about","About"]] },
          ].map(({ heading, links },i) => (
            <div key={i}>
              <div style={{ fontSize:12, color:C.gold, letterSpacing:"0.1em", textTransform:"uppercase", fontWeight:600, marginBottom:16 }}>{heading}</div>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {links.map(([page,label],j) => (
                  <button key={j} onClick={() => setPage(page)} style={{ background:"none", border:"none", color:C.muted, fontSize:14, cursor:"pointer", textAlign:"left", padding:0, fontFamily:"'DM Sans',sans-serif", transition:"color 0.2s" }}
                    onMouseEnter={e => e.target.style.color=C.gold} onMouseLeave={e => e.target.style.color=C.muted}>{label}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ borderTop:"1px solid rgba(255,255,255,0.06)", paddingTop:24, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
          <div style={{ fontSize:13, color:C.muted }}>© 2025 Rahbar – Smart Travel Companion. All rights reserved.</div>
          <div style={{ fontSize:12, color:C.muted }}>Built with ❤️ for travelers worldwide</div>
        </div>
      </div>
    </footer>
  );
}

// ── APP ROOT ──────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [tripData, setTripData] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => { window.scrollTo({ top:0, behavior:"smooth" }); }, [page]);

  return (
    <>
      <style>{GLOBAL_STYLES}</style>
      <StarBackground />
      <div style={{ position:"relative", zIndex:1, minHeight:"100vh", display:"flex", flexDirection:"column" }}>
        <Navbar page={page} setPage={setPage} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
        <main style={{ flex:1 }}>
          {page === "home"      && <HomePage setPage={setPage} />}
          {page === "plan"      && <PlannerPage setPage={setPage} setTripData={setTripData} />}
          {page === "dashboard" && <DashboardPage tripData={tripData} setPage={setPage} />}
          {page === "about"     && <AboutPage />}
        </main>
        <Footer setPage={setPage} />
      </div>
    </>
  );
}
