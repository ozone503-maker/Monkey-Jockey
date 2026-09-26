/* ============================================================
   DATA — roster, entries, tracks, conditions, event + mood defs
   ============================================================ */
const DOGS = [
  {id:"meatball",name:"Meatball",speed:6,burst:4,stamina:9,focus:8,size:8},
  {id:"beaux",name:"Beaux",speed:6,burst:5,stamina:8,focus:8,size:7},
  {id:"kira",name:"Kira",speed:7,burst:5,stamina:8,focus:9,size:6},
  {id:"penny",name:"Penny",speed:8,burst:7,stamina:7,focus:8,size:5},
  {id:"mike",name:"Mike",speed:8,burst:8,stamina:7,focus:7,size:4},
  {id:"diva",name:"Diva",speed:8,burst:8,stamina:6,focus:7,size:3},
  {id:"noodle",name:"Noodle",speed:9,burst:8,stamina:5,focus:6,size:2},
  {id:"ghostbuster",name:"Ghostbuster",speed:9,burst:9,stamina:5,focus:6,size:1}
];

const RIDERS = [
  {id:"shockbot",name:"ShockBot",balance:10,timing:6,nerve:9,luck:3,size:8},  // replaces the retired slot-0 rider: same index + stats so seeded fields/outcomes are unchanged
  {id:"nonna",name:"Nonna",balance:8,timing:7,nerve:10,luck:3,size:7},
  {id:"ipo",name:"Ipo",balance:8,timing:8,nerve:8,luck:7,size:5},
  {id:"erv",name:"Erv",balance:7,timing:6,nerve:9,luck:5,size:4},
  {id:"mystery-drone-pilot",name:"Mystery Drone Pilot",short:"MDP",balance:7,timing:9,nerve:8,luck:6,size:3},  // replaces Ruch (canon, issue #3): same index + stats
  {id:"monkey-jockey",name:"Monkey Jockey",balance:9,timing:9,nerve:8,luck:6,size:1},
  {id:"dinny",name:"Dinny",balance:6,timing:9,nerve:7,luck:8,size:1},
  {id:"fonk",name:"Fonk",balance:5,timing:8,nerve:10,luck:9,size:1}
];

/* ------------------------------------------------------------
   RACE ENTRIES — there is no fixed TEAMS array.
   An entry is { entrantId, dogId, riderId }. entrantId is the
   identity the race and every per-racer system keys off, so the
   same rider can appear on more than one dog without sharing
   state. The list below is only the DEFAULT lineup.

   Duplicate dogs and duplicate riders are intentionally allowed
   in this engineering/test build. Unique launch-roster
   participation gets enforced later at the UI/game-rule layer.
   ------------------------------------------------------------ */
const FIELD_SIZE = 8;
const DEFAULT_ENTRIES = [
  {entrantId:"e1", riderId:"shockbot",      dogId:"meatball"},
  {entrantId:"e2", riderId:"nonna",         dogId:"beaux"},
  {entrantId:"e3", riderId:"ipo",           dogId:"kira"},
  {entrantId:"e4", riderId:"monkey-jockey", dogId:"penny"},
  {entrantId:"e5", riderId:"erv",           dogId:"mike"},
  {entrantId:"e6", riderId:"mystery-drone-pilot", dogId:"diva"},
  {entrantId:"e7", riderId:"dinny",         dogId:"noodle"},
  {entrantId:"e8", riderId:"fonk",          dogId:"ghostbuster"}
];
let raceEntries = DEFAULT_ENTRIES.map(e=>({...e}));

const TRACKS = [
  {id:"punahele",name:"Punahēle Sprint",distance:900,speedWeight:1.0,burstWeight:1.05,staminaWeight:0.95,focusWeight:1.0,eventRate:0.8,locked:false},
  {id:"rainforest",name:"Rainforest Run",distance:1400,speedWeight:1.0,burstWeight:0.95,staminaWeight:1.08,focusWeight:1.02,eventRate:1.0,locked:true,unlock:"January 1, 2027"},
  {id:"kilauea",name:"Kīlauea Long Run",distance:2100,speedWeight:0.96,burstWeight:0.85,staminaWeight:1.18,focusWeight:1.04,eventRate:1.15,locked:true,unlock:"February 14, 2027"}
];

const WEATHER = {
  "sunny-day":  {id:"sunny-day",  label:"SUNNY DAY",  traction:1.00, visibility:1.00, focusMod:0,   balanceMod:0,   eventBoost:1.0},
  "rainy-day":  {id:"rainy-day",  label:"RAINY DAY",  traction:0.97, visibility:0.94, focusMod:-0.3, balanceMod:-0.4, eventBoost:1.15}
  // sunny-night & rainy-night intentionally omitted for launch
};

const EVENT_DEFS = [
  {id:"birds",type:"distraction",severity:0.6,duration:[1.2,2.4],affected:["focus"],visual:"birds",commentary:"birds scatter"},
  {id:"wild-pig",type:"obstacle",severity:0.85,duration:[1.8,3.0],affected:["nerve","balance"],visual:"pig",commentary:"wild pig crosses"},
  {id:"puddle",type:"surface",severity:0.5,duration:[2.0,3.5],affected:["balance"],visual:"splash",commentary:"big puddle"},
  {id:"falling-leaf",type:"distraction",severity:0.35,duration:[0.8,1.6],affected:["focus"],visual:"leaves",commentary:"falling branches"},
  {id:"mist",type:"visibility",severity:0.55,duration:[3.0,5.0],affected:["focus"],visual:"mist",commentary:"sudden mist"},
  {id:"driveway",type:"opening",severity:0.4,duration:[1.0,2.0],affected:["timing"],visual:"driveway",commentary:"driveway interruption"}
];

const RIDER_PERSONALITIES = {
  "monkey-jockey":{base:"focused",states:["focused","confident","cocky","locked-in"],triggers:{lead:"confident",passed:"locked-in",eventScare:"focused",final:"locked-in"}},
  "nonna":{base:"irritated",states:["irritated","furious","fiercely-competitive"],triggers:{passed:"furious",nearMiss:"fiercely-competitive",lead:"irritated"}},
  "fonk":{base:"simmering",states:["simmering","lit","relentless"],triggers:{passed:"lit",surge:"relentless",final:"relentless"}},
  "dinny":{base:"worried",states:["worried","determined","hero-mode"],triggers:{behind:"determined",comeback:"hero-mode",event:"worried"}},
  "ipo":{base:"analytical",states:["analytical","concerned","calculated-attack"],triggers:{midpack:"concerned",opening:"calculated-attack"}},
  "erv":{base:"chill",states:["chill","startled","committed"],triggers:{scare:"startled",final:"committed"}},
  "mystery-drone-pilot":{base:"detached",states:["detached","tracking","full-signal"],triggers:{passed:"tracking",surge:"full-signal"}},   // same trigger keys as the old Ruch slot -> identical mood timing
  "shockbot":{base:"cool",states:["cool","dialed-in","full-voltage"],triggers:{lead:"dialed-in",final:"full-voltage"}}   // same trigger keys as the old slot -> identical mood timing
};

const dogBy = Object.fromEntries(DOGS.map(x=>[x.id,x]));
const riderBy = Object.fromEntries(RIDERS.map(x=>[x.id,x]));
