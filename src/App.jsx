import { useState, useEffect, useRef } from "react";
import { Line, Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

// ─── ASSET IMPORTS ────────────────────────────────────────────────────
import anathemaImg   from "./assets/anathema.png";
import assaultImg    from "./assets/assault.png";
import bastionImg    from "./assets/bastion.png";
import castleImg     from "./assets/castle.png";
import clericImg     from "./assets/cleric.png";
import coverImg      from "./assets/cover.png";
import endureImg     from "./assets/endure.png";
import executionImg  from "./assets/execution.png";
import guardImg      from "./assets/guard.png";
import judgementImg  from "./assets/judgement.png";
import lancerImg     from "./assets/lancer.png";
import mendImg       from "./assets/mend.png";
import nobodyMoveImg from "./assets/nobody_move.png";
import pawnLaborImg  from "./assets/pawn_labor.png";
import pillboxImg    from "./assets/pillbox.png";
import tacticianImg  from "./assets/tactician.png";
import warrantImg    from "./assets/warrant.png";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, RadialLinearScale, Title, Tooltip, Legend, Filler);

// ─── THEME ───────────────────────────────────────────────────────────
const T = {
  bg0: "#0A0A09",
  bg1: "#1A1A18",
  bg2: "#111110",
  green: "#3B6D11",
  greenBright: "#4A8F1A",
  red: "#A32D2D",
  text: "#FFFFFF",
  muted: "#888780",
  border: "rgba(255,255,255,0.08)",
  borderMid: "rgba(255,255,255,0.14)",
};

// ─── CARD IMAGE MAP ───────────────────────────────────────────────────
// Maps every card name to its imported PNG.
// "NOBODY MOVE" → nobody_move.png  |  "PAWN LABOR" → pawn_labor.png
const CARD_IMAGES = {
  ANATHEMA:      anathemaImg,
  ASSAULT:       assaultImg,
  BASTION:       bastionImg,
  CASTLE:        castleImg,
  CLERIC:        clericImg,
  COVER:         coverImg,
  ENDURE:        endureImg,
  EXECUTION:     executionImg,
  GUARD:         guardImg,
  JUDGEMENT:     judgementImg,
  LANCER:        lancerImg,
  MEND:          mendImg,
  "NOBODY MOVE": nobodyMoveImg,
  "PAWN LABOR":  pawnLaborImg,
  PILLBOX:       pillboxImg,
  TACTICIAN:     tacticianImg,
  WARRANT:       warrantImg,
};

// ─── CARD DEFINITIONS (kept for type colours + gallery iteration) ─────
const CARD_TYPES = {
  piece: {
    label: "Piece Cards",
    color: "#27500A",
    bg: "linear-gradient(160deg,#1e4509 0%,#3B6D11 100%)",
    cards: [
      { name: "LANCER",    desc: "Spawns a Lancer piece." },
      { name: "CLERIC",    desc: "Spawns a Cleric piece." },
      { name: "BASTION",   desc: "Spawns a Bastion piece." },
      { name: "TACTICIAN", desc: "Spawns a Tactician piece." },
    ],
  },
  action: {
    label: "Action Cards",
    color: "#7B1F1F",
    bg: "linear-gradient(160deg,#5a0f0f 0%,#A32D2D 100%)",
    cards: [
      { name: "MEND",      desc: "Use on a CLERIC. Heals Official for 15 HP and clears negative status effects." },
      { name: "GUARD",     desc: "FORTIFY an Official until your next turn (+4 DEF)." },
      { name: "ENDURE",    desc: "Apply on an Official. Its HP can't go below 1 HP until your next turn." },
      { name: "COVER",     desc: "Instantly create a Wall Obstacle on any open tile. At end of every turn, it loses 10 HP." },
      { name: "EXECUTION", desc: "Make an Official an Executor for one attack. If the attack brings the enemy below 8 HP, destroy it immediately." },
    ],
  },
  support: {
    label: "Support Cards",
    color: "#0B3D6E",
    bg: "linear-gradient(160deg,#0a2a50 0%,#185FA5 100%)",
    cards: [
      { name: "PAWN LABOR", desc: "Permanently promote a normal pawn on backrank. Resulting Official can attack, but is PINNED." },
      { name: "JUDGEMENT",  desc: "Pick a tile. Damage that tile at end of Opponent's Decree Phase." },
      { name: "ASSAULT",    desc: "Boost an Official's ATK by 50% for one turn." },
      { name: "PILLBOX",    desc: "Establish a Pillbox Obstacle on a missed Pawn. Pillboxes have 80 HP and 10 ATK. Can attack adjacent tiles." },
    ],
  },
  decree: {
    label: "Decree Cards",
    color: "#7A4A00",
    bg: "linear-gradient(160deg,#5a3500 0%,#BA7517 100%)",
    cards: [
      { name: "NOBODY MOVE", desc: "PIN all enemy Officials for their turn." },
      { name: "CASTLE",      desc: "Swaps a Rook with any Friendly Official on the same rank or file." },
      { name: "WARRANT",     desc: "Instantly end your turn. Next turn, Official Capturing is allowed." },
      { name: "ANATHEMA",    desc: "Move any Restriction as if it were a Piece." },
    ],
  },
};

// ─── PROFILES DATA ───────────────────────────────────────────────────
const PROFILES = {
  JasielDuran: {
    password: "bbros123",
    username: "JasielDuran",
    rank: 47, tier: "Challenger",
    stats: { winRate: 61.4, winRateDelta: "+3.2%", wins: 127, losses: 80, avgTurns: 14.7, topOfficial: { name: "Lancer", wr: 68, usage: 43 } },
    recentMatches: [
      { result: "W", opponent: "KarlMarkov_99",  deck: "Aggro Rush",   turns: 12, date: "May 8" },
      { result: "W", opponent: "señorita_blade", deck: "Control Grid", turns: 19, date: "May 8" },
      { result: "L", opponent: "PinoyProGamer",  deck: "Aggro Rush",   turns: 9,  date: "May 7" },
      { result: "W", opponent: "m4rlow_exe",     deck: "Midrange",     turns: 16, date: "May 7" },
      { result: "W", opponent: "KellynR04",      deck: "Control Grid", turns: 22, date: "May 6" },
      { result: "L", opponent: "PinoyProGamer",  deck: "Midrange",     turns: 11, date: "May 6" },
      { result: "W", opponent: "señorita_blade", deck: "Aggro Rush",   turns: 8,  date: "May 5" },
    ],
    decks: [
      { name: "Aggro Rush",   games: 88, wr: 64.8, core: "Lancer × Sentinel Moment", cards: ["LANCER","LANCER","ASSAULT","ASSAULT","EXECUTION","EXECUTION","NOBODY MOVE","JUDGEMENT","ENDURE","GUARD","MEND","MEND","PAWN LABOR","WARRANT","CASTLE","ANATHEMA","ENDURE","COVER","PILLBOX","ASSAULT"] },
      { name: "Control Grid", games: 71, wr: 59.2, core: "Bastion × Nobody Move",    cards: ["BASTION","BASTION","NOBODY MOVE","NOBODY MOVE","CASTLE","CASTLE","WARRANT","WARRANT","GUARD","GUARD","MEND","MEND","ENDURE","COVER","COVER","ANATHEMA","JUDGEMENT","CLERIC","LANCER","TACTICIAN"] },
      { name: "Midrange",     games: 48, wr: 56.3, core: "Cleric × Warrant",         cards: ["CLERIC","CLERIC","LANCER","TACTICIAN","WARRANT","WARRANT","MEND","MEND","GUARD","EXECUTION","NOBODY MOVE","CASTLE","ASSAULT","JUDGEMENT","PAWN LABOR","ENDURE","COVER","BASTION","ANATHEMA","PILLBOX"] },
    ],
    cardStats:{
      action:  { fav:"EXECUTION", usage:[{ name:"EXECUTION",uses:132,wr:78 },{ name:"ENDURE",uses:98,wr:71 },{ name:"GUARD",uses:83,wr:68 },{ name:"MEND",uses:71,wr:64 },{ name:"COVER",uses:52,wr:60 }] },
      support: { fav:"JUDGEMENT", usage:[{ name:"JUDGEMENT",uses:159,wr:78 },{ name:"ASSAULT",uses:133,wr:74 },{ name:"PILLBOX",uses:78,wr:65 },{ name:"PAWN LABOR",uses:61,wr:58 }] },
      decree:  { fav:"NOBODY MOVE", usage:[{ name:"NOBODY MOVE",uses:148,wr:76 },{ name:"WARRANT",uses:121,wr:72 },{ name:"CASTLE",uses:89,wr:67 },{ name:"ANATHEMA",uses:54,wr:61 }] },
      piece:   { fav:"TACTICIAN", usage:[{ name:"TACTICIAN",uses:212,wr:79 },{ name:"LANCER",uses:148,wr:71 },{ name:"BASTION",uses:128,wr:65 },{ name:"CLERIC",uses:84,wr:59 }] },
    },
    wrTrend: { labels: ["May 1","May 2","May 3","May 4","May 5","May 6","May 7","May 8"], values: [52,55,58,54,60,63,61,61.4] },
    pieceRecords: {
      highestDmgTurn:  { val: 38,  detail: "Lancer · vs KarlMarkov_99 · Apr 22"      },
      highestDmgMatch: { val: 124, detail: "Lancer · vs señorita_blade · May 3"       },
      highestRecvTurn: { val: 44,  detail: "Bastion · vs PinoyProGamer · Apr 18"      },
      longestSurvival: { val: 21,  detail: "turns · Cleric · vs m4rlow_exe · Apr 30" },
    },
    officialAverages: [
      { name:"Lancer",    avgDmg:24.3, avgRecv:18.1, avgTurns:9.2,  usage:43 },
      { name:"Cleric",    avgDmg:12.7, avgRecv:9.4,  avgTurns:14.6, usage:31 },
      { name:"Bastion",   avgDmg:8.2,  avgRecv:29.8, avgTurns:16.1, usage:19 },
      { name:"Tactician", avgDmg:19.1, avgRecv:15.2, avgTurns:11.4, usage:7  },
    ],
    promotions: { total:619, distribution:[
      { name:"Lancer",    pct:41, color:"#185FA5" },
      { name:"Cleric",    pct:28, color:"#3B6D11" },
      { name:"Bastion",   pct:19, color:"#854F0B" },
      { name:"Tactician", pct:12, color:"#993556" },
    ]},
    heatmaps: {
      captures:    [[3,12,8,45,67,22],[7,34,89,71,52,14],[18,56,72,84,61,28],[9,43,68,76,58,19],[4,21,38,47,33,11],[2,8,14,23,16,5]],
      positioning: [[5,18,24,61,72,30],[11,42,78,82,64,21],[22,61,85,88,69,35],[13,49,74,80,66,24],[6,27,45,54,41,15],[3,12,18,29,20,7]],
      stats: { mostActive:"C4", leastActive:"A6", centerCtrl:"62%", edgeCtrl:"38%", totalCaptures:"1,847" },
    },
    meta: {
      activePlayers:"2,341", matchesToday:847, matchesDelta:"+12%", diversity:73,
      topDecks:[
        { name:"Aggro Rush",      core:"Lancer × Assault",     pickRate:28, wr:54, trend:"up" },
        { name:"Control Grid",    core:"Bastion × Nobody Move", pickRate:22, wr:51, trend:"dn" },
        { name:"Midrange Cleric", core:"Cleric × Warrant",      pickRate:18, wr:53, trend:"up" },
        { name:"Pillbox Siege",   core:"Bastion × Pillbox",     pickRate:14, wr:49, trend:"up" },
        { name:"Judgement Burn",  core:"Tactician × Judgement", pickRate:10, wr:57, trend:"dn" },
      ],
      vsCommmunity:{ labels:["Win Rate","Avg Dmg","Survival","Deck Diversity","Capture Rate","Card Efficiency"], player:[61,72,58,65,70,63], community:[50,50,50,50,50,50] },
    },
  },
  PinoyProGamer: {
    password: "pro2024",
    username: "PinoyProGamer",
    rank: 12, tier: "Grandmaster",
    stats: { winRate: 74.2, winRateDelta: "+1.8%", wins: 212, losses: 74, avgTurns: 10.3, topOfficial: { name: "Tactician", wr: 79, usage: 51 } },
    recentMatches: [
      { result:"W", opponent:"JasielDuran",    deck:"Judgement Burn", turns:9,  date:"May 8" },
      { result:"W", opponent:"KellynR04",      deck:"Judgement Burn", turns:7,  date:"May 8" },
      { result:"W", opponent:"m4rlow_exe",     deck:"Judgement Burn", turns:11, date:"May 7" },
      { result:"W", opponent:"señorita_blade", deck:"Hill Control",   turns:14, date:"May 7" },
      { result:"L", opponent:"KarlMarkov_99",  deck:"Judgement Burn", turns:18, date:"May 6" },
      { result:"W", opponent:"JasielDuran",    deck:"Judgement Burn", turns:11, date:"May 6" },
      { result:"W", opponent:"KellynR04",      deck:"Hill Control",   turns:9,  date:"May 5" },
    ],
    decks:[
      { name:"Judgement Burn", games:148, wr:77.2, core:"Tactician × Judgement", cards:["TACTICIAN","TACTICIAN","JUDGEMENT","JUDGEMENT","ASSAULT","ASSAULT","EXECUTION","NOBODY MOVE","WARRANT","CASTLE","MEND","ENDURE","PAWN LABOR","PILLBOX","GUARD","COVER","ANATHEMA","LANCER","CLERIC","BASTION"] },
      { name:"Hill Control",   games:64,  wr:68.8, core:"Bastion × Warrant",     cards:["BASTION","BASTION","WARRANT","WARRANT","NOBODY MOVE","CASTLE","GUARD","GUARD","MEND","MEND","ENDURE","ENDURE","COVER","COVER","TACTICIAN","JUDGEMENT","ASSAULT","CLERIC","LANCER","ANATHEMA"] },
      { name:"Rush Blitz",     games:74,  wr:71.1, core:"Lancer × Assault",      cards:["LANCER","LANCER","ASSAULT","ASSAULT","ASSAULT","EXECUTION","EXECUTION","NOBODY MOVE","JUDGEMENT","ENDURE","GUARD","MEND","PAWN LABOR","CASTLE","WARRANT","TACTICIAN","COVER","ANATHEMA","PILLBOX","BASTION"] },
    ],
    cardStats:{
      action:  { fav:"EXECUTION", usage:[{ name:"EXECUTION",uses:132,wr:78 },{ name:"ENDURE",uses:98,wr:71 },{ name:"GUARD",uses:83,wr:68 },{ name:"MEND",uses:71,wr:64 },{ name:"COVER",uses:52,wr:60 }] },
      support: { fav:"JUDGEMENT", usage:[{ name:"JUDGEMENT",uses:159,wr:78 },{ name:"ASSAULT",uses:133,wr:74 },{ name:"PILLBOX",uses:78,wr:65 },{ name:"PAWN LABOR",uses:61,wr:58 }] },
      decree:  { fav:"NOBODY MOVE", usage:[{ name:"NOBODY MOVE",uses:148,wr:76 },{ name:"WARRANT",uses:121,wr:72 },{ name:"CASTLE",uses:89,wr:67 },{ name:"ANATHEMA",uses:54,wr:61 }] },
      piece:   { fav:"TACTICIAN", usage:[{ name:"TACTICIAN",uses:212,wr:79 },{ name:"LANCER",uses:148,wr:71 },{ name:"BASTION",uses:128,wr:65 },{ name:"CLERIC",uses:84,wr:59 }] },
    },
    wrTrend:{ labels:["May 1","May 2","May 3","May 4","May 5","May 6","May 7","May 8"], values:[68,71,72,69,74,75,73,74.2] },
    pieceRecords:{
      highestDmgTurn:  { val:52,  detail:"Tactician · vs KarlMarkov_99 · Apr 28"        },
      highestDmgMatch: { val:189, detail:"Tactician · vs JasielDuran · May 1"            },
      highestRecvTurn: { val:38,  detail:"Lancer · vs KarlMarkov_99 · Apr 14"            },
      longestSurvival: { val:28,  detail:"turns · Bastion · vs señorita_blade · Apr 22"  },
    },
    officialAverages:[
      { name:"Lancer",    avgDmg:29.1, avgRecv:16.8, avgTurns:8.4,  usage:33 },
      { name:"Cleric",    avgDmg:14.2, avgRecv:8.1,  avgTurns:12.9, usage:16 },
      { name:"Bastion",   avgDmg:9.8,  avgRecv:27.4, avgTurns:15.6, usage:20 },
      { name:"Tactician", avgDmg:34.7, avgRecv:12.3, avgTurns:10.8, usage:31 },
    ],
    promotions:{ total:1024, distribution:[
      { name:"Tactician", pct:48, color:"#993556" },
      { name:"Lancer",    pct:29, color:"#185FA5" },
      { name:"Bastion",   pct:14, color:"#854F0B" },
      { name:"Cleric",    pct:9,  color:"#3B6D11" },
    ]},
    heatmaps:{
      captures:    [[8,21,15,62,89,34],[12,48,97,83,71,22],[24,68,88,92,74,38],[14,56,81,88,69,27],[7,32,51,59,44,16],[3,11,19,31,21,8]],
      positioning: [[9,24,31,71,84,41],[15,55,91,94,78,29],[29,74,96,99,81,44],[17,62,88,93,77,33],[8,34,58,65,50,19],[4,14,22,36,24,9]],
      stats:{ mostActive:"C3", leastActive:"A1", centerCtrl:"71%", edgeCtrl:"29%", totalCaptures:"2,948" },
    },
    meta:{
      activePlayers:"2,341", matchesToday:847, matchesDelta:"+12%", diversity:73,
      topDecks:[
        { name:"Aggro Rush",      core:"Lancer × Assault",     pickRate:28, wr:54, trend:"up" },
        { name:"Control Grid",    core:"Bastion × Nobody Move", pickRate:22, wr:51, trend:"dn" },
        { name:"Midrange Cleric", core:"Cleric × Warrant",      pickRate:18, wr:53, trend:"up" },
        { name:"Pillbox Siege",   core:"Bastion × Pillbox",     pickRate:14, wr:49, trend:"up" },
        { name:"Judgement Burn",  core:"Tactician × Judgement", pickRate:10, wr:57, trend:"dn" },
      ],
      vsCommmunity:{ labels:["Win Rate","Avg Dmg","Survival","Deck Diversity","Capture Rate","Card Efficiency"], player:[74,89,72,78,85,81], community:[50,50,50,50,50,50] },
    },
  },
};

// ─── CARD ART COMPONENT ───────────────────────────────────────────────
// Renders the real PNG from src/assets/.
// The PNGs are portrait card art so we fix width and let height scale naturally.
//   sm = 44 px wide  →  deck strips, table rows, promotion bars
//   md = 64 px wide  →  gallery grid
//   lg = 80 px wide  →  favourite-card spotlight
function CardArt({ name, size = "sm" }) {
  const src = CARD_IMAGES[name];
  if (!src) return null;

  const widths = { sm: 44, md: 64, lg: 80 };
  const w = widths[size] ?? 44;

  const desc = Object.values(CARD_TYPES)
    .flatMap(t => t.cards)
    .find(c => c.name === name)?.desc ?? "";

  return (
    <img
      src={src}
      alt={name}
      title={`${name}${desc ? ": " + desc : ""}`}
      draggable={false}
      style={{
        width: w,
        height: "auto",
        borderRadius: 4,
        flexShrink: 0,
        display: "block",
        objectFit: "contain",
        filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.65))",
        userSelect: "none",
      }}
    />
  );
}

// ─── DECK FULL POPUP ─────────────────────────────────────────────────
// Click the +N button → dim overlay + centred popup showing all cards.
function DeckFullPopup({ deck, onClose }) {
  // Close on Escape key
  useEffect(() => {
    const handler = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Group cards by type
  const typeOrder  = ["piece", "action", "support", "decree"];
  const typeColors = { piece: "#3B6D11", action: "#A32D2D", support: "#185FA5", decree: "#BA7517" };
  const typeLabels = { piece: "Piece",   action: "Action",  support: "Support",  decree: "Decree"  };

  const grouped = {};
  deck.cards.forEach(cardName => {
    const typeKey = Object.keys(CARD_TYPES).find(k =>
      CARD_TYPES[k].cards.some(c => c.name === cardName)
    ) ?? "other";
    if (!grouped[typeKey]) grouped[typeKey] = [];
    grouped[typeKey].push(cardName);
  });

  return (
    <>
      {/* Dim overlay */}
      <div
        onClick={onClose}
        style={{
          position:   "fixed", inset: 0,
          background: "rgba(0,0,0,0.72)",
          zIndex:     900,
          backdropFilter: "blur(2px)",
        }}
      />

      {/* Popup */}
      <div style={{
        position:  "fixed",
        top:       "50%", left: "50%",
        transform: "translate(-50%,-50%)",
        zIndex:    901,
        background: T.bg1,
        border:    `1px solid ${T.borderMid}`,
        borderRadius: 12,
        padding:   "20px 22px",
        width:     440,
        maxHeight: "80vh",
        overflowY: "auto",
        boxShadow: "0 20px 60px rgba(0,0,0,0.85)",
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: T.green }}>{deck.name}</div>
            <div style={{ fontSize: 11, color: T.muted, fontFamily: "monospace", marginTop: 2 }}>
              {deck.games} games · {deck.wr}% WR · {deck.cards.length} cards
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.06)", border: `0.5px solid ${T.border}`,
              color: T.muted, borderRadius: 6, width: 28, height: 28,
              fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}
          >✕</button>
        </div>

        {/* WR bar */}
        <div style={{ height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden", marginBottom: 18 }}>
          <div style={{ width: `${deck.wr}%`, height: "100%", background: T.green, borderRadius: 2 }} />
        </div>

        {/* Cards by type */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {typeOrder.filter(k => grouped[k]).map(typeKey => (
            <div key={typeKey}>
              <div style={{
                fontSize: 9, fontFamily: "monospace", textTransform: "uppercase",
                letterSpacing: 1.5, color: typeColors[typeKey], marginBottom: 8,
                paddingBottom: 5, borderBottom: `0.5px solid rgba(255,255,255,0.06)`,
              }}>
                {typeLabels[typeKey]} Cards — {grouped[typeKey].length}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {grouped[typeKey].map((cardName, i) => (
                  <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                    <CardArt name={cardName} size="sm" />
                    <div style={{ fontSize: 7, color: T.muted, fontFamily: "monospace", textAlign: "center", maxWidth: 44, lineHeight: 1.3 }}>
                      {cardName}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Core */}
        <div style={{ marginTop: 16, paddingTop: 12, borderTop: `0.5px solid ${T.border}`, fontSize: 10, color: T.muted, fontFamily: "monospace" }}>
          Core: <span style={{ color: T.green }}>{deck.core}</span>
        </div>
      </div>
    </>
  );
}

// ─── FAVORITE DECK CARD ───────────────────────────────────────────────
function FavoriteDeckCard({ deck }) {
  const [popupOpen, setPopupOpen] = useState(false);

  return (
    <>
      <div style={{ background: T.bg1, border: `0.5px solid ${T.border}`, borderRadius: 8, padding: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: T.green, marginBottom: 2 }}>{deck.name}</div>
        <div style={{ fontSize: 11, color: T.muted, fontFamily: "monospace", marginBottom: 10 }}>{deck.games} games · {deck.wr}% WR</div>
        <div style={{ height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden", marginBottom: 8 }}>
          <div style={{ width: `${deck.wr}%`, height: "100%", background: T.green, borderRadius: 2 }} />
        </div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", alignItems: "flex-end", marginTop: 8 }}>
          {deck.cards.slice(0, 8).map((c, ci) => (
            <CardArt key={ci} name={c} size="sm" />
          ))}
          {deck.cards.length > 8 && (
            <div
              onClick={() => setPopupOpen(true)}
              style={{
                width: 44, height: 62, borderRadius: 4,
                background: "rgba(59,109,17,0.15)",
                border: `0.5px solid ${T.green}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, color: T.green, cursor: "pointer",
                fontFamily: "monospace", fontWeight: 700,
                transition: "background 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(59,109,17,0.28)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(59,109,17,0.15)"}
            >
              +{deck.cards.length - 8}
            </div>
          )}
        </div>
      </div>

      {popupOpen && <DeckFullPopup deck={deck} onClose={() => setPopupOpen(false)} />}
    </>
  );
}

// ─── STAT CARD ────────────────────────────────────────────────────────
function StatCard({ label, value, sub }) {
  return (
    <div style={{ background: T.bg1, border: `0.5px solid ${T.border}`, borderRadius: 8, padding: "14px 16px" }}>
      <div style={{ fontSize: 10, color: T.green, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: T.green, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: T.muted, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

// ─── SECTION LABEL ────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, color: T.green, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: 2, marginBottom: 10 }}>
      {children}
    </div>
  );
}

// ─── DASHBOARD PAGE ───────────────────────────────────────────────────
function DashboardPage({ profile }) {
  const total = profile.stats.wins + profile.stats.losses;
  const chartData = {
    labels: profile.wrTrend.labels,
    datasets: [{
      label: "Win Rate", data: profile.wrTrend.values,
      borderColor: T.green, backgroundColor: "rgba(59,109,17,0.06)",
      tension: 0.4, fill: true, pointRadius: 3, pointBackgroundColor: T.green, borderWidth: 2,
    }],
  };
  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { min: 40, max: 85, ticks: { callback: v => v + "%", font: { size: 10 }, color: T.green }, grid: { color: "rgba(59,109,17,0.1)" }, border: { display: false } },
      x: { ticks: { font: { size: 10 }, color: T.green }, grid: { display: false }, border: { display: false } },
    },
  };
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 20 }}>
        <StatCard label="Win Rate"     value={`${profile.stats.winRate}%`}                      sub={`${profile.stats.winRateDelta} this week`} />
        <StatCard label="Record"       value={`${profile.stats.wins}W–${profile.stats.losses}L`} sub={`${total} total matches`} />
        <StatCard label="Avg Length"   value={profile.stats.avgTurns}                            sub="turns per game" />
        <StatCard label="Top Official" value={profile.stats.topOfficial.name}                    sub={`${profile.stats.topOfficial.wr}% WR · ${profile.stats.topOfficial.usage}% usage`} />
      </div>

      <SectionLabel>Recent Matches</SectionLabel>
      <div style={{ background: T.bg1, border: `0.5px solid ${T.border}`, borderRadius: 8, overflow: "hidden", marginBottom: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "40px 1fr 1fr 70px 60px", padding: "8px 14px", background: T.bg0, fontSize: 10, color: T.muted, fontFamily: "monospace", letterSpacing: 0.5 }}>
          <div/><div>Opponent</div><div>Deck</div><div>Turns</div><div>Date</div>
        </div>
        {profile.recentMatches.map((m, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "40px 1fr 1fr 70px 60px", padding: "8px 14px", fontSize: 12, borderTop: `0.5px solid ${T.border}`, alignItems: "center" }}>
            <div><span style={{ display: "inline-flex", width: 24, height: 24, borderRadius: 4, alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, background: m.result === "W" ? T.green : T.red, color: "#fff" }}>{m.result}</span></div>
            <div style={{ color: T.text }}>{m.opponent}</div>
            <div style={{ color: T.muted }}>{m.deck}</div>
            <div style={{ color: T.muted, fontFamily: "monospace", fontSize: 11 }}>{m.turns} turns</div>
            <div style={{ color: T.muted, fontSize: 11 }}>{m.date}</div>
          </div>
        ))}
      </div>

      <SectionLabel>Favorite Decks</SectionLabel>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 20 }}>
        {profile.decks.map(deck => (
          <FavoriteDeckCard key={deck.name} deck={deck} />
        ))}
      </div>

      <SectionLabel>Win Rate Over Time</SectionLabel>
      <div style={{ background: T.bg1, border: `0.5px solid ${T.border}`, borderRadius: 8, padding: 14, marginBottom: 20 }}>
        <div style={{ height: 160 }}><Line data={chartData} options={chartOptions} /></div>
      </div>
    </div>
  );
}

// ─── CARD STATS PAGE ──────────────────────────────────────────────────
function CardStatsPage({ profile }) {
  const [activeTab, setActiveTab] = useState("piece");
  const tabData  = profile.cardStats[activeTab];
  const typeInfo = CARD_TYPES[activeTab];
  const maxUses  = Math.max(...tabData.usage.map(c => c.uses));

  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        {Object.keys(CARD_TYPES).map(k => (
          <button key={k} onClick={() => setActiveTab(k)} style={{
            padding: "6px 14px", borderRadius: 6, border: `0.5px solid ${activeTab === k ? T.green : T.border}`,
            background: activeTab === k ? T.green : "transparent", color: activeTab === k ? "#fff" : T.muted,
            fontSize: 12, cursor: "pointer", fontFamily: "monospace",
          }}>
            {CARD_TYPES[k].label.replace(" Cards", "")}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        <div>
          <SectionLabel>Favorite Card</SectionLabel>
          <div style={{ background: T.bg1, border: `0.5px solid ${T.border}`, borderRadius: 8, padding: 14, display: "flex", alignItems: "center", gap: 14 }}>
            <CardArt name={tabData.fav} size="lg" />
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: T.green }}>{tabData.fav}</div>
              <div style={{ fontSize: 11, color: T.muted, marginTop: 4 }}>{CARD_TYPES[activeTab].label.replace(" Cards", "")} Card</div>
              <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>Most played this season</div>
            </div>
          </div>
        </div>
        <div>
          <SectionLabel>Card Gallery</SectionLabel>
          <div style={{ background: T.bg1, border: `0.5px solid ${T.border}`, borderRadius: 8, padding: 14, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
            {typeInfo.cards.map(c => (
              <div key={c.name} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <CardArt name={c.name} size="md" />
                <div style={{ fontSize: 8, color: T.muted, fontFamily: "monospace", textAlign: "center", maxWidth: 64 }}>{c.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <SectionLabel>Usage Frequency & Win Rate</SectionLabel>
      <div style={{ background: T.bg1, border: `0.5px solid ${T.border}`, borderRadius: 8, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 80px 80px", padding: "8px 14px", background: T.bg0, fontSize: 10, color: T.muted, fontFamily: "monospace", letterSpacing: 0.5 }}>
          <div>Card</div><div>Usage</div><div style={{ textAlign: "right" }}>Times Used</div><div style={{ textAlign: "right" }}>WR%</div>
        </div>
        {tabData.usage.map((c, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "60px 1fr 80px 80px", padding: "10px 14px", borderTop: `0.5px solid ${T.border}`, alignItems: "center" }}>
            <CardArt name={c.name} size="sm" />
            <div style={{ paddingLeft: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: T.text, marginBottom: 4 }}>{c.name}</div>
              <div style={{ height: 3, background: "rgba(255,255,255,0.07)", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ width: `${(c.uses / maxUses) * 100}%`, height: "100%", background: T.green, borderRadius: 2 }} />
              </div>
            </div>
            <div style={{ textAlign: "right", fontSize: 12, color: T.muted, fontFamily: "monospace" }}>{c.uses}×</div>
            <div style={{ textAlign: "right", fontSize: 12, color: c.wr >= 60 ? T.greenBright : T.muted, fontFamily: "monospace", fontWeight: c.wr >= 60 ? 700 : 400 }}>{c.wr}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PIECES PAGE ──────────────────────────────────────────────────────
function PiecesPage({ profile }) {
  return (
    <div>
      <SectionLabel>Piece Records</SectionLabel>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 20 }}>
        <StatCard label="Highest Dmg (Turn)"  value={profile.pieceRecords.highestDmgTurn.val}       sub={profile.pieceRecords.highestDmgTurn.detail}  />
        <StatCard label="Highest Dmg (Match)" value={profile.pieceRecords.highestDmgMatch.val}      sub={profile.pieceRecords.highestDmgMatch.detail} />
        <StatCard label="Highest Recv (Turn)" value={profile.pieceRecords.highestRecvTurn.val}      sub={profile.pieceRecords.highestRecvTurn.detail} />
        <StatCard label="Longest Survival"    value={`${profile.pieceRecords.longestSurvival.val}t`} sub={profile.pieceRecords.longestSurvival.detail} />
      </div>

      <SectionLabel>Averages by Official Type</SectionLabel>
      <div style={{ background: T.bg1, border: `0.5px solid ${T.border}`, borderRadius: 8, overflow: "hidden", marginBottom: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 70px 70px 70px 60px", padding: "8px 14px", background: T.bg0, fontSize: 10, color: T.muted, fontFamily: "monospace", letterSpacing: 0.5 }}>
          <div>Official</div>
          <div style={{ textAlign: "right" }}>Avg DMG</div>
          <div style={{ textAlign: "right" }}>Avg Recv</div>
          <div style={{ textAlign: "right" }}>Avg Turns</div>
          <div style={{ textAlign: "right" }}>Usage</div>
        </div>
        {profile.officialAverages.map((o, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 70px 70px 70px 60px", padding: "10px 14px", borderTop: `0.5px solid ${T.border}`, alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <CardArt name={o.name.toUpperCase()} size="sm" />
              <span style={{ fontSize: 13, fontWeight: 600, color: T.green }}>{o.name}</span>
            </div>
            <div style={{ textAlign: "right", fontSize: 12, fontFamily: "monospace", color: T.text }}>{o.avgDmg}</div>
            <div style={{ textAlign: "right", fontSize: 12, fontFamily: "monospace", color: T.text }}>{o.avgRecv}</div>
            <div style={{ textAlign: "right", fontSize: 12, fontFamily: "monospace", color: T.text }}>{o.avgTurns}</div>
            <div style={{ textAlign: "right", fontSize: 12, fontFamily: "monospace", color: T.muted }}>{o.usage}%</div>
          </div>
        ))}
      </div>

      <SectionLabel>Pawn Promotion Distribution</SectionLabel>
      <div style={{ background: T.bg1, border: `0.5px solid ${T.border}`, borderRadius: 8, padding: 14 }}>
        <div style={{ fontSize: 11, color: T.muted, marginBottom: 12 }}>{profile.promotions.total} total promotions</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {profile.promotions.distribution.map(p => (
            <div key={p.name} style={{ display: "grid", gridTemplateColumns: "56px 1fr 40px", alignItems: "center", gap: 10 }}>
              <CardArt name={p.name.toUpperCase()} size="sm" />
              <div style={{ height: 6, background: "rgba(255,255,255,0.07)", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ width: `${p.pct}%`, height: "100%", background: p.color, borderRadius: 3, transition: "width 0.6s ease" }} />
              </div>
              <div style={{ fontSize: 12, fontFamily: "monospace", textAlign: "right", color: T.text }}>{p.pct}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── HEATMAP PAGE ─────────────────────────────────────────────────────
function HeatmapPage({ profile }) {
  const [heatmapType, setHeatmapType] = useState("captures");
  const data = profile.heatmaps[heatmapType];
  const max  = Math.max(...data.flat());
  const cols = ["A","B","C","D","E","F"];
  const rows = [6,5,4,3,2,1];
  const getCellColor = val => {
    const t = val / max;
    return `rgba(59,109,17,${0.1 + t * 0.9})`;
  };
  return (
    <div>
      <SectionLabel>Board Heatmaps</SectionLabel>
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {["captures","positioning"].map(t => (
          <button key={t} onClick={() => setHeatmapType(t)} style={{
            padding: "6px 14px", borderRadius: 6, border: `0.5px solid ${heatmapType === t ? T.green : T.border}`,
            background: heatmapType === t ? T.green : "transparent", color: heatmapType === t ? "#fff" : T.muted,
            fontSize: 12, cursor: "pointer", fontFamily: "monospace", textTransform: "capitalize",
          }}>{t}</button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 16 }}>
        <div style={{ background: T.bg1, border: `0.5px solid ${T.border}`, borderRadius: 8, padding: 14, flex: 1 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 3 }}>
            {rows.map((row, r) => cols.map((col, c) => {
              const val = data[r][c];
              return (
                <div key={`${col}${row}`} title={`${col}${row}: ${val}`}
                  style={{ aspectRatio: "1", borderRadius: 3, background: getCellColor(val), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "rgba(255,255,255,0.7)", fontFamily: "monospace", cursor: "default", transition: "background 0.3s" }}>
                  {val > 60 ? val : ""}
                </div>
              );
            }))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, fontSize: 10, color: T.muted, fontFamily: "monospace" }}>
            <span>Low</span>
            <div style={{ flex: 1, height: 3, background: "linear-gradient(to right,rgba(59,109,17,0.1),rgba(59,109,17,0.6),rgba(59,109,17,1))", borderRadius: 2 }} />
            <span>High</span>
          </div>
        </div>
        <div style={{ background: T.bg1, border: `0.5px solid ${T.border}`, borderRadius: 8, padding: 14, width: 200 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: T.green, marginBottom: 12 }}>Board Stats</div>
          {[
            ["Most active tile",  profile.heatmaps.stats.mostActive],
            ["Least active tile", profile.heatmaps.stats.leastActive],
            ["Center control",    profile.heatmaps.stats.centerCtrl],
            ["Edge control",      profile.heatmaps.stats.edgeCtrl],
            ["Total captures",    profile.heatmaps.stats.totalCaptures],
          ].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `0.5px solid ${T.border}`, fontSize: 11 }}>
              <span style={{ color: T.muted }}>{k}</span>
              <span style={{ color: T.text, fontFamily: "monospace" }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── META PAGE ────────────────────────────────────────────────────────
function MetaPage({ profile }) {
  const chartData = {
    labels: profile.meta.vsCommmunity.labels,
    datasets: [
      { label: "You",       data: profile.meta.vsCommmunity.player,    borderColor: T.green, backgroundColor: "rgba(59,109,17,0.15)",    pointBackgroundColor: T.green, borderWidth: 2,   pointRadius: 3 },
      { label: "Community", data: profile.meta.vsCommmunity.community, borderColor: T.muted, backgroundColor: "rgba(136,135,128,0.08)", pointBackgroundColor: T.muted, borderWidth: 1.5, pointRadius: 2 },
    ],
  };
  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { labels: { color: T.muted, font: { size: 10 } } } },
    scales: { r: { min: 0, max: 100, ticks: { display: false }, grid: { color: "rgba(59,109,17,0.2)" }, pointLabels: { font: { size: 10 }, color: T.green } } },
  };
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 20 }}>
        <StatCard label="Active Players" value={profile.meta.activePlayers} sub="last 7 days" />
        <StatCard label="Matches Today"  value={profile.meta.matchesToday}  sub={`↑ ${profile.meta.matchesDelta} vs yesterday`} />
        <StatCard label="Meta Diversity" value={`${profile.meta.diversity}%`} sub="deck variety index" />
      </div>

      <SectionLabel>Top Decks This Week</SectionLabel>
      <div style={{ background: T.bg1, border: `0.5px solid ${T.border}`, borderRadius: 8, overflow: "hidden", marginBottom: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "28px 1fr 80px 80px", padding: "8px 14px", background: T.bg0, fontSize: 10, color: T.muted, fontFamily: "monospace", letterSpacing: 0.5, gap: 10 }}>
          <div>#</div><div>Archetype</div><div style={{ textAlign: "right" }}>Pick Rate</div><div style={{ textAlign: "right" }}>Win Rate</div>
        </div>
        {profile.meta.topDecks.map((d, i) => (
          <div key={d.name} style={{ display: "grid", gridTemplateColumns: "28px 1fr 80px 80px", padding: "10px 14px", borderTop: `0.5px solid ${T.border}`, alignItems: "center", gap: 10 }}>
            <div style={{ fontSize: 11, color: T.muted, fontFamily: "monospace" }}>{i + 1}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.green }}>{d.name}</div>
              <div style={{ fontSize: 10, color: T.muted }}>{d.core}</div>
            </div>
            <div style={{ textAlign: "right", fontSize: 12, fontFamily: "monospace", color: T.muted }}>{d.pickRate}%</div>
            <div style={{ textAlign: "right", fontSize: 12, fontFamily: "monospace" }}>
              <span style={{ color: T.text }}>{d.wr}% </span>
              <span style={{ color: d.trend === "up" ? T.greenBright : T.red, fontSize: 10 }}>{d.trend === "up" ? "↑" : "↓"}</span>
            </div>
          </div>
        ))}
      </div>

      <SectionLabel>Your Stats vs Community</SectionLabel>
      <div style={{ background: T.bg1, border: `0.5px solid ${T.border}`, borderRadius: 8, padding: 14 }}>
        <div style={{ height: 200 }}><Radar data={chartData} options={chartOptions} /></div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────
export default function App() {
  const [screen,   setScreen]   = useState("login");
  const [page,     setPage]     = useState("dashboard");
  const [profile,  setProfile]  = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loadPct,  setLoadPct]  = useState(0);
  const [loadMsg,  setLoadMsg]  = useState("connecting...");
  const timerRef = useRef(null);

  const initials = n => n.slice(0, 2).toUpperCase();

  const login = () => {
    if (!PROFILES[username])                      { setError("account not found."); return; }
    if (PROFILES[username].password !== password) { setError("wrong password.");    return; }
    setProfile(PROFILES[username]);
    setError("");
    setScreen("loading");
    setLoadPct(0);
    const msgs = [`authenticating ${username}...`, "fetching match history...", "computing statistics...", "rendering dashboard..."];
    let p = 0;
    const tick = () => {
      p += Math.random() * 22 + 8;
      if (p > 100) p = 100;
      setLoadPct(Math.round(p));
      setLoadMsg(msgs[Math.floor((p / 100) * (msgs.length - 0.01))]);
      if (p < 100) timerRef.current = setTimeout(tick, 260 + Math.random() * 180);
      else setTimeout(() => { setScreen("app"); setPage("dashboard"); }, 400);
    };
    setTimeout(tick, 200);
  };

  const logout = () => {
    setProfile(null); setUsername(""); setPassword(""); setError("");
    setScreen("login"); setPage("dashboard");
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const PAGES       = ["dashboard", "cards", "pieces", "heatmap", "meta"];
  const PAGE_LABELS = { dashboard:"Dashboard", cards:"Cards", pieces:"Pieces", heatmap:"Heatmap", meta:"Meta" };

  if (screen === "login") return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 28, background: T.bg0, fontFamily: "Syne, sans-serif", color: T.text }}>
      <div>
        <div style={{ fontSize: 30, fontWeight: 700, textAlign: "center" }}>KING<span style={{ color: T.green }}>PIECE</span></div>
        <div style={{ fontSize: 12, color: T.green, textAlign: "center", fontFamily: "monospace", marginTop: 4 }}>statistics tracker</div>
      </div>
      <div style={{ background: T.bg1, border: `0.5px solid ${T.border}`, borderRadius: 10, padding: 24, width: 300, display: "flex", flexDirection: "column", gap: 14 }}>
        {[["Username", username, setUsername, "text", "enter username"], ["Password", password, setPassword, "password", "••••••••"]].map(([label, val, setter, type, placeholder]) => (
          <div key={label}>
            <label style={{ display: "block", fontSize: 11, color: T.muted, fontFamily: "monospace", marginBottom: 4 }}>{label}</label>
            <input type={type} value={val} onChange={e => setter(e.target.value)} onKeyDown={e => e.key === "Enter" && login()} placeholder={placeholder}
              style={{ width: "100%", padding: "8px 10px", background: T.bg0, color: T.text, border: `0.5px solid ${T.borderMid}`, borderRadius: 6, fontSize: 12, fontFamily: "monospace", boxSizing: "border-box" }} />
          </div>
        ))}
        <div style={{ fontSize: 11, color: T.red, textAlign: "center", minHeight: 14, fontFamily: "monospace" }}>{error}</div>
        <button onClick={login} style={{ width: "100%", padding: 10, background: T.text, color: T.bg0, border: "none", borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "Syne, sans-serif" }}>Log In</button>
      </div>
      <div style={{ width: 300 }}>
        <div style={{ fontSize: 10, color: T.green, textAlign: "center", marginBottom: 6, fontFamily: "monospace" }}>demo accounts — click to fill</div>
        {Object.values(PROFILES).map(p => (
          <div key={p.username} onClick={() => { setUsername(p.username); setPassword(p.password); setError(""); }}
            style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", background: T.bg1, border: `0.5px solid ${T.border}`, borderRadius: 6, fontSize: 11, cursor: "pointer", marginBottom: 4, fontFamily: "monospace" }}>
            <span style={{ color: T.green, fontWeight: 700 }}>{p.username}</span>
            <span style={{ color: T.muted }}>{p.password}</span>
          </div>
        ))}
      </div>
    </div>
  );

  if (screen === "loading" && profile) return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, background: T.bg0, fontFamily: "Syne, sans-serif", color: T.text }}>
      <div style={{ width: 40, height: 40, borderRadius: "50%", background: T.green, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#fff" }}>{initials(profile.username)}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: T.green }}>{profile.username}</div>
      <div style={{ width: 200, height: 2, background: T.border, borderRadius: 2, overflow: "hidden" }}>
        <div style={{ width: `${loadPct}%`, height: "100%", background: T.green, borderRadius: 2, transition: "width 0.2s" }} />
      </div>
      <div style={{ fontSize: 11, color: T.green, fontFamily: "monospace" }}>{loadMsg}</div>
    </div>
  );

  if (screen === "app" && profile) return (
    <div style={{ minHeight: "100vh", background: T.bg0, fontFamily: "Syne, sans-serif", color: T.text }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", background: T.bg1, borderBottom: `0.5px solid ${T.border}` }}>
        <div style={{ fontSize: 15, fontWeight: 700 }}>KING<span style={{ color: T.green }}>PIECE</span> <span style={{ fontSize: 11, color: T.green, fontWeight: 400 }}>stats</span></div>
        <div style={{ display: "flex", gap: 4 }}>
          {PAGES.map(p => (
            <button key={p} onClick={() => setPage(p)} style={{
              padding: "5px 12px", borderRadius: 6, border: "none",
              background: page === p ? T.green : "transparent", color: page === p ? "#fff" : T.muted,
              fontSize: 12, cursor: "pointer", fontFamily: "Syne, sans-serif", fontWeight: page === p ? 700 : 400,
            }}>{PAGE_LABELS[p]}</button>
          ))}
        </div>
        <div onClick={logout} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <div style={{ width: 26, height: 26, borderRadius: "50%", background: T.green, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff" }}>{initials(profile.username)}</div>
          <span style={{ color: T.muted, fontSize: 12 }}>{profile.username}</span>
          <span style={{ fontSize: 10, fontFamily: "monospace", color: T.muted }}>· logout</span>
        </div>
      </div>
      <div style={{ padding: "20px 24px" }}>
        {page === "dashboard" && <DashboardPage profile={profile} />}
        {page === "cards"     && <CardStatsPage profile={profile} />}
        {page === "pieces"    && <PiecesPage    profile={profile} />}
        {page === "heatmap"   && <HeatmapPage   profile={profile} />}
        {page === "meta"      && <MetaPage      profile={profile} />}
      </div>
    </div>
  );

  return null;
}