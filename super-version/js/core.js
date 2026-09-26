/* ============================================================
   CORE — shared runtime state + seeded RNG
   ------------------------------------------------------------
   DETERMINISM CONTRACT: rng32 is the only source of randomness
   inside the race. Math.random() must never appear in any
   race system. A race is reproduced by seed + entries +
   weather + track together, not by seed alone.
   ============================================================ */
const $ = id => document.getElementById(id);
const canvas = $('race');
const ctx = canvas.getContext('2d');

let camera = 'side';
let running = false;
let sim = null;
let raf = 0;
let lastT = 0;

// snapshotted on each fresh race start, restored on REPLAY
let lastSeed = 83479126;
let lastTrack = 'punahele';
let lastEntries = raceEntries.map(e=>({...e}));
let lastWeather = 'sunny-day';

const colors = ['#8f9aa4','#d96686','#66a95a','#e0517d','#728f51','#b97845','#ee8195','#ff692c'];
const colorFor = i => colors[i % colors.length];

function rng32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function seed(v){v=Number(v)||1;return(v>>>0)||1}
