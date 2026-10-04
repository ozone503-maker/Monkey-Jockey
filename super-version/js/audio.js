/* ============================================================
   AUDIO — one manager for every sound in the game.
   ------------------------------------------------------------
   Files (Jessie's names; all five are cuts of the "Volcano Jockey"
   master, 144 BPM — see CHANGELOG "Audio mapping"):
     theme.mp3      title screen music (song intro, 16 s, loops)
     menu-loop.mp3  team-select music (same bytes as theme.mp3, loops)
     race-start.mp3 start sound: plays under READY-SET-GO; it is the
                    4 s lead-in that lands exactly where race-loop begins
     race-loop.mp3  race music (song body, 1:52, loops)
     victory.mp3    victory sting on the podium (song outro, 24 s, ends)
   To swap a track: replace the file, or change AUDIO_FILES below.

   Rules:
   - Nothing plays until the first tap/click/key (phone autoplay rules).
     The first gesture also "primes" every element (silent play+pause)
     so later cues (race music at GO, victory at the finish) are allowed
     to start without a new tap on iOS/Android.
   - One element per track and one music channel: starting a track
     always stops the other music, so REPLAY / RACE AGAIN never stack.
   - Mute is a visible button, remembered on this device (localStorage).
   - Render/UI only: the race engine never waits on or reads audio.
   ============================================================ */
const AUDIO_FILES = {
  theme:   'assets/audio/theme.mp3',
  menu:    'assets/audio/menu-loop.mp3',
  start:   'assets/audio/race-start.mp3',
  race:    'assets/audio/race-loop.mp3',
  victory: 'assets/audio/victory.mp3'
};
const AUDIO_MUSIC = {theme:true, menu:true, race:true};     // looped, one at a time
const AUDIO_VOL   = {theme:.55, menu:.45, race:.50, start:.85, victory:.80};

window.MJ_AUDIO_LOG = [];                                    // test hook: every play() call

const Sound = {
  els:{}, unlocked:false, music:null, pendingMusic:null,
  muted: (()=>{ try{ return localStorage.getItem('mj-muted')==='1'; }catch(e){ return false; } })(),

  init(){
    for(const k in AUDIO_FILES){
      let el = document.getElementById('aud-'+k);
      if(!el){ el = new Audio(AUDIO_FILES[k]); el.preload = 'auto'; }
      el.loop = !!AUDIO_MUSIC[k];
      el.volume = AUDIO_VOL[k];
      el.muted = this.muted;
      this.els[k] = el;
    }
    // victory sting ends -> settle into the menu loop if we are still on the results
    this.els.victory.addEventListener('ended', ()=>{
      if(!document.body.classList.contains('racing') || (sim && sim.done)) this.playMusic('menu');
    });
    const first = ()=>this.unlock();
    ['touchend','mousedown','keydown','click'].forEach(t=>document.addEventListener(t, first, {capture:true}));
    document.addEventListener('visibilitychange', ()=>{
      if(document.hidden){ Object.values(this.els).forEach(el=>el.pause()); }
      else if(this.music && this.unlocked){ this._play(this.music, false); }
    });
    this.renderButton();
  },

  _play(k, restart){
    const el = this.els[k]; if(!el) return;
    if(restart){ try{ el.currentTime = 0; }catch(e){} }
    el.muted = this.muted;
    MJ_AUDIO_LOG.push({track:k, file:AUDIO_FILES[k], t:Math.round(performance.now()),
      afterGesture: this.unlocked, userActivation: !!(navigator.userActivation && navigator.userActivation.hasBeenActive)});
    const p = el.play(); if(p && p.catch) p.catch(()=>{});
  },

  /* first user gesture: allow audio, prime every element, start whatever is wanted */
  unlock(){
    if(this.unlocked) return;
    if(navigator.userActivation && !navigator.userActivation.isActive) return;   // not a real activation yet
    this.unlocked = true;
    this.prime(Object.keys(this.els).filter(k=>k!==this.pendingMusic));
    if(this.pendingMusic){ const m = this.pendingMusic; this.pendingMusic = null; this.music = null; this.playMusic(m); }
  },
  /* silent play+pause inside a gesture, so the element may start later without one (iOS) */
  prime(keys){
    keys.forEach(k=>{
      const el = this.els[k]; if(!el || !el.paused || k === this.music) return;
      el.muted = true;
      const p = el.play();
      const settle = ()=>{ if(this.music !== k && !el._cue){ el.pause(); try{ el.currentTime = 0; }catch(e){} } el.muted = this.muted; };
      if(p && p.then) p.then(settle, settle); else settle();
    });
  },

  /* looped music: never restarts a track that is already playing */
  playMusic(k, {restart=false}={}){
    if(!this.unlocked){ this.pendingMusic = k; return; }
    for(const m in AUDIO_MUSIC){ if(m !== k){ const el=this.els[m]; el.pause(); try{ el.currentTime = 0; }catch(e){} } }
    const el = this.els[k];
    if(this.music === k && !el.paused && !restart) return;
    this.music = k;
    this._play(k, restart || el.ended);
  },
  stopMusic(){
    this.music = null; this.pendingMusic = null;
    for(const m in AUDIO_MUSIC){ const el=this.els[m]; el.pause(); try{ el.currentTime = 0; }catch(e){} }
  },

  /* one-shot cue: restarts from 0, never overlaps itself */
  cue(k){
    if(!this.unlocked) return;
    const el = this.els[k]; el._cue = true;
    el.pause(); this._play(k, true);
  },
  stopCues(){ ['start','victory'].forEach(k=>{ const el=this.els[k]; el._cue=false; el.pause(); try{ el.currentTime=0; }catch(e){} }); },
  stopAll(){ clearTimeout(this._goTimer); this.stopCues(); this.stopMusic(); },

  /* race cue: race-start.mp3 is the song's lead-in (master 12.00-16.14 s) and
     race-loop.mp3 begins at master 16.14 s, so the loop is started exactly when
     the lead-in ends: one continuous piece of music across the start. */
  START_LEAD: 4.138,
  raceStart(){
    this.stopAll();
    this.prime(['race','victory']);                 // RACE tap is a gesture: arm the later cues
    this.cue('start');
    this._goTimer = setTimeout(()=>{ this.els.start._cue = false; if(sim && !sim.done) this.playMusic('race', {restart:true}); }, this.START_LEAD*1000);
  },
  victory(){
    clearTimeout(this._goTimer);
    this.stopMusic(); this.els.start._cue = false; this.els.start.pause();
    this.cue('victory');
  },

  setMuted(m){
    this.muted = m;
    try{ localStorage.setItem('mj-muted', m ? '1' : '0'); }catch(e){}
    Object.values(this.els).forEach(el=>{ el.muted = m; });
    this.renderButton();
  },
  renderButton(){
    const b = document.getElementById('muteBtn'); if(!b) return;
    b.setAttribute('aria-pressed', String(this.muted));
    b.setAttribute('aria-label', this.muted ? 'Sound off. Tap to unmute' : 'Sound on. Tap to mute');
    b.innerHTML = this.muted ? '<span aria-hidden="true">🔇</span> SOUND OFF' : '<span aria-hidden="true">🔊</span> SOUND ON';
    b.classList.toggle('off', this.muted);
  }
};
