#!/usr/bin/env node
/* Race-balance simulator. Runs the game's OWN engine files (js/core.js, data.js,
   systems.js, race.js + buildField from ui.js) headless in Node and reports:
   win share per dog / rider / dog+rider combo, win share of the player slot,
   leader-at-25/50/75% win rates, lead changes per race, close finishes.
   usage: node tools/race_sim.js [ROOT_DIR] [N] [--json] [--fixed-seed] [--default-pick]
     ROOT_DIR defaults to the repo this file lives in (pass another checkout to compare). */
const fs=require('fs'), path=require('path'), vm=require('vm');
const args=process.argv.slice(2);
const flags=new Set(args.filter(a=>a.startsWith('--')));
const pos=args.filter(a=>!a.startsWith('--'));
const ROOT=pos[0]||path.join(__dirname,'..'); const N=+(pos[1]||2000);
const el=()=>new Proxy({},{get:(t,k)=>k==='getContext'?()=>new Proxy({},{get:()=>()=>{}}):k==='classList'?{add(){},remove(){},toggle(){}}:k==='style'?{}:t[k],set:(t,k,v)=>(t[k]=v,true)});
const ctx=vm.createContext({console,Math,JSON,Object,Array,Number,Set,Map,Proxy,
  document:{getElementById:el,querySelectorAll:()=>[],body:{classList:{add(){},remove(){}}}},
  showResults(){},dumpSystemLog(){}});
const rd=f=>fs.readFileSync(path.join(ROOT,'js',f),'utf8');
['data.js','core.js','systems.js','race.js'].forEach(f=>vm.runInContext(rd(f),ctx,{filename:f}));
const ui=rd('ui.js');
const grab=name=>{const i=ui.indexOf('function '+name+'(');let d=0,j=ui.indexOf('{',i);for(let k=j;k<ui.length;k++){if(ui[k]==='{')d++;else if(ui[k]==='}'&&--d===0)return ui.slice(i,k+1)}};
vm.runInContext(`const PLAYER_ID='e1'; let playerPick={dogId:'penny',riderId:'monkey-jockey'};\n${grab('shuffled')}\n${grab('buildField')}`,ctx);
const out=vm.runInContext(`(function(N,fixedSeed,defaultPick){
  const pr=rng32(20261002); const STY={}, STE={}, W={}, WD={}, WR={}, ENT={}, ENTD={}, ENTR={};
  let tWin=0, playerWins=0, lead25=0, lead50=0, lead75=0, lc=0, lcLate=0, close=0, photo=0, lcZero=0, mjWins=0, mjEnt=0;
  for(let k=0;k<N;k++){
    const s=fixedSeed?83479126:seed(1+Math.floor(pr()*4e9));
    playerPick=defaultPick?{dogId:'penny',riderId:'monkey-jockey'}:{dogId:DOGS[Math.floor(pr()*8)].id,riderId:RIDERS[Math.floor(pr()*8)].id};
    const weather=pr()<.5?'sunny-day':'rainy-day';
    const entries=buildField(s);
    sim=makeRace(s,'punahele',weather,entries); running=true;
    const D=sim.track.distance; let at={}, prevL=null, changes=0, late=0, g=0, held=null, heldT=0, cur=null;
    while(!sim.done&&g++<30*400){ step(1/30);
      const lead=sim.racers.reduce((a,b)=>b.pos>a.pos?b:a);
      /* a lead change counts once the new leader has held it for 0.5 s,
         and only after the opening 5% (start-line jostling isn't a lead change) */
      if(lead!==held){held=lead;heldT=0}else heldT+=1/30;
      if(heldT>=.5&&held!==cur){ if(cur&&lead.pos>D*.05){changes++; if(lead.pos>D*.5)late++} cur=held }
      [.25,.5,.75].forEach(q=>{if(at[q]===undefined&&lead.pos>=D*q)at[q]=lead.entrantId});
    }
    const w=sim.finishOrder[0], combo=w.dog.name+' + '+w.rider.name;
    W[combo]=(W[combo]||0)+1; WD[w.dog.name]=(WD[w.dog.name]||0)+1; WR[w.rider.name]=(WR[w.rider.name]||0)+1;
    sim.racers.forEach(r=>{const c=r.dog.name+' + '+r.rider.name;ENT[c]=(ENT[c]||0)+1;ENTD[r.dog.name]=(ENTD[r.dog.name]||0)+1;ENTR[r.rider.name]=(ENTR[r.rider.name]||0)+1});
    if(w.plan){STY[w.plan.style]=(STY[w.plan.style]||0)+1; sim.racers.forEach(r=>STE[r.plan.style]=(STE[r.plan.style]||0)+1)}
    if(w.entrantId==='e1')playerWins++; tWin+=w.finish;
    if(w.rider.id==='monkey-jockey')mjWins++;
    if(at[.25]===w.entrantId)lead25++; if(at[.5]===w.entrantId)lead50++; if(at[.75]===w.entrantId)lead75++;
    lc+=changes; lcLate+=late; if(!changes)lcZero++;
    const m=sim.finishOrder[1].finish-w.finish; if(m<.25)close++; if(m<.05)photo++;
  }
  const share=(wins,ent)=>Object.keys(ent).map(k=>({k,winPct:+(100*(wins[k]||0)/N).toFixed(1),entered:ent[k],winPerEntry:+((wins[k]||0)/ent[k]*8).toFixed(2)})).sort((a,b)=>b.winPerEntry-a.winPerEntry);
  return {races:N,fair:'12.5% (winPerEntry 1.00 = fair share)',playerSlotWinPct:+(100*playerWins/N).toFixed(1),monkeyJockeyRiderWinPct:+(100*mjWins/N).toFixed(1),
    leaderAt25WinsPct:+(100*lead25/N).toFixed(1),leaderAt50WinsPct:+(100*lead50/N).toFixed(1),leaderAt75WinsPct:+(100*lead75/N).toFixed(1),
    leadChangesPerRace:+(lc/N).toFixed(2),leadChangesSecondHalf:+(lcLate/N).toFixed(2),racesWithNoLeadChangePct:+(100*lcZero/N).toFixed(1),
    marginUnder025sPct:+(100*close/N).toFixed(1),photoFinishUnder005sPct:+(100*photo/N).toFixed(1),avgWinTimeS:+(tWin/N).toFixed(1),
    styles:Object.keys(STE).map(k=>k+' x'+((STY[k]||0)/STE[k]*8).toFixed(2)+' ('+(100*STE[k]/N/8).toFixed(0)+'% of runners)').join(', ')||'n/a (v1 engine has no styles)',dogs:share(WD,ENTD),riders:share(WR,ENTR),combos:share(W,ENT)};
})(${N},${flags.has('--fixed-seed')},${flags.has('--default-pick')})`,ctx);
if(flags.has('--json')){console.log(JSON.stringify(out,null,1));process.exit(0)}
const {dogs,riders,combos,...head}=out;
console.log(head);
const tb=(t,a)=>{console.log('\n'+t+'  (winPct of all races; winPerEntry: 1.00 = fair share)');a.forEach(x=>console.log(`  ${x.k.padEnd(34)} ${String(x.winPct).padStart(5)}%  x${x.winPerEntry.toFixed(2)}`))};
tb('DOGS',dogs); tb('RIDERS',riders);
console.log('\nCOMBOS: best x'+combos[0].winPerEntry+' ('+combos[0].k+'), worst x'+combos[combos.length-1].winPerEntry+' ('+combos[combos.length-1].k+'), combos above x1.5: '+combos.filter(c=>c.winPerEntry>1.5).length+'/'+combos.length);
