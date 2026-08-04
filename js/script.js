/* ================= ROTATING GLOBE (real world map, self-contained) ================= */
(function initGlobe(){
  const canvas = document.getElementById('globeCanvas');
  const labelsEl = document.getElementById('globeLabels');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  if(!ctx) return;
  const size = 170, dpr = Math.min(window.devicePixelRatio||1, 2);
  canvas.width = size*dpr; canvas.height = size*dpr;
  ctx.scale(dpr, dpr);
  const cx = size/2, cy = size/2, R = size/2 - 2;
  const TILT = -13 * Math.PI/180, cosT = Math.cos(TILT), sinT = Math.sin(TILT);

  // More detailed real-world continent & island coastline approximations for a recognizable, realistic globe
  const CONTINENTS = [
    [[-168,66],[-165,60],[-155,59],[-145,60],[-140,60],[-135,57],[-130,55],[-125,49],[-124,42],
     [-122,37],[-120,34],[-117,32],[-110,31],[-105,22],[-100,20],[-97,16],[-94,16],[-90,14],
     [-88,13],[-84,9],[-79,8],[-77,8],[-80,18],[-81,25],[-80,26],[-77,29],[-75,35],[-74,39],
     [-70,41],[-66,45],[-60,47],[-55,51],[-58,49],[-65,55],[-70,58],[-75,62],[-80,68],[-90,69],
     [-95,70],[-105,72],[-115,72],[-125,70],[-135,70],[-145,70],[-155,71],[-160,70],[-165,68],[-168,66]], // North America
    [[-77,8],[-73,10],[-68,11],[-62,10],[-58,7],[-55,5],[-51,1],[-50,0],[-48,-5],[-45,-6],
     [-40,-10],[-35,-8],[-36,-11],[-38,-13],[-39,-17],[-40,-20],[-41,-22],[-42,-23],[-45,-24],
     [-48,-26],[-50,-29],[-53,-30],[-56,-33],[-58,-35],[-60,-38],[-62,-40],[-64,-43],[-65,-45],
     [-67,-48],[-68,-50],[-70,-53],[-72,-52],[-73,-48],[-73,-45],[-72,-40],[-71,-35],[-71,-30],
     [-70,-25],[-70,-20],[-71,-15],[-71,-10],[-76,-5],[-79,-4],[-80,-2],[-80,2],[-79,4],[-77,8]], // South America
    [[-17,21],[-16,17],[-16,15],[-15,12],[-13,10],[-11,7],[-9,5],[-7,4],[-4,5],[-2,5],[2,6],
     [5,5],[7,4],[9,4],[9,1],[9,-2],[11,-4],[12,-6],[13,-9],[13,-13],[13,-16],[12,-19],[12,-22],
     [14,-25],[16,-28],[18,-31],[18,-34],[20,-34],[23,-34],[26,-33],[28,-31],[30,-30],[32,-27],
     [33,-24],[35,-24],[37,-20],[39,-16],[40,-14],[40,-10],[42,-6],[41,-1],[42,2],[44,4],[45,8],
     [45,10],[43,11],[43,13],[41,13],[42,15],[40,16],[38,17],[37,19],[37,22],[35,25],[34,27],
     [32,29],[32,31],[29,31],[26,32],[24,32],[19,32],[15,32],[11,33],[10,35],[9,37],[3,37],
     [0,36],[-3,36],[-6,36],[-6,33],[-8,32],[-10,30],[-13,28],[-15,25],[-17,21]], // Africa
    [[-10,36],[-9,39],[-9,43],[-7,44],[-5,46],[-2,47],[0,50],[2,49],[4,50],[5,52],[4,53],
     [5,55],[7,57],[10,58],[8,56],[11,55],[13,55],[15,55],[15,58],[18,59],[20,60],[18,63],
     [20,65],[22,66],[24,66],[24,68],[28,70],[30,70],[32,66],[35,66],[38,64],[40,66],[42,66],
     [45,66],[48,66],[50,68],[53,68],[55,68],[58,69],[60,70],[65,72],[68,72],[70,72],[75,73],
     [80,73],[85,73],[90,75],[95,76],[100,75],[105,76],[110,73],[115,73],[120,73],[125,72],
     [130,72],[135,73],[140,73],[143,70],[145,68],[150,70],[155,68],[160,68],[165,68],[170,68],
     [175,66],[178,65],[180,65],[178,64],[172,62],[168,60],[163,59],[160,60],[157,55],[160,52],
     [163,57],[167,63],[170,64],[168,66],[163,63],[158,60],[152,58],[150,60],[145,55],[142,55],
     [140,48],[135,42],[132,38],[130,35],[128,34],[126,34],[124,33],[122,32],[120,30],[118,26],
     [115,23],[110,20],[107,10],[105,10],[104,8],[100,6],[98,8],[96,10],[95,15],[93,18],[92,20],
     [90,21],[88,22],[85,20],[83,18],[80,8],[78,9],[76,10],[75,15],[70,20],[68,24],[65,25],
     [60,25],[57,26],[55,26],[52,28],[50,30],[48,30],[46,30],[42,29],[40,30],[36,31],[35,30],
     [34,31],[33,31],[30,31],[28,36],[27,37],[25,40],[22,40],[19,40],[15,42],[12,44],[8,43],
     [3,43],[-2,43],[-6,43],[-9,43],[-10,40],[-10,36]], // Eurasia
    [[113,-22],[114,-20],[116,-19],[120,-18],[122,-17],[124,-15],[127,-13],[130,-12],[132,-11],
     [134,-11],[136,-12],[138,-11],[142,-11],[144,-14],[145,-16],[145,-17],[146,-19],[147,-19],
     [148,-20],[150,-22],[151,-24],[153,-25],[153,-27],[153,-28],[151,-31],[150,-33],[150,-35],
     [148,-37],[147,-38],[144,-38],[141,-38],[138,-35],[136,-35],[137,-33],[134,-32],[132,-32],
     [130,-32],[128,-32],[126,-33],[124,-33],[120,-34],[117,-35],[115,-34],[115,-31],[113,-26],[113,-22]] // Australia
  ];
  const ISLANDS = [
    [[-45,60],[-42,62],[-38,65],[-34,68],[-25,71],[-20,74],[-22,77],[-30,80],[-38,82],[-45,83],
     [-52,82],[-58,79],[-63,76],[-65,72],[-63,68],[-58,64],[-52,61],[-45,60]], // Greenland
    [[43,-12],[45,-13],[47,-13],[48,-15],[49,-16],[48,-19],[47,-22],[46,-24],[45,-25],[44,-24],
     [43,-22],[43,-18],[43,-15],[43,-12]], // Madagascar
    [[130,31],[131,32],[132,33],[133,34],[135,34],[136,35],[137,35],[139,36],[140,37],[140,39],
     [141,40],[141,41],[142,43],[144,44],[145,43],[143,41],[141,39],[140,36],[137,35],[135,34],
     [133,32],[131,31],[130,31]], // Japan
    [[-8,52],[-7,54],[-6,55],[-5,57],[-4,58],[-3,59],[-2,58],[-1,56],[-1,53],[0,52],[1,51],
     [0,51],[-2,50],[-4,50],[-5,50],[-6,50],[-8,51],[-10,52],[-8,52]], // British Isles
    [[95,5],[97,4],[98,3],[101,0],[104,-3],[106,-6],[110,-3],[113,-3],[116,-3],[119,-4],[120,-5],
     [122,-8],[120,-8],[117,-8],[112,-8],[108,-6],[104,-6],[100,-3],[97,2],[95,5]], // Indonesia
    [[173,-41],[174,-39],[176,-38],[178,-38],[178,-39],[177,-40],[175,-41],[175,-45],[173,-44],
     [170,-43],[169,-44],[171,-42],[173,-41]] // New Zealand
  ];
  function catmullRomPt(p0,p1,p2,p3,t){
    const t2=t*t, t3=t2*t;
    const lon = 0.5*((2*p1[0])+(-p0[0]+p2[0])*t+(2*p0[0]-5*p1[0]+4*p2[0]-p3[0])*t2+(-p0[0]+3*p1[0]-3*p2[0]+p3[0])*t3);
    const lat = 0.5*((2*p1[1])+(-p0[1]+p2[1])*t+(2*p0[1]-5*p1[1]+4*p2[1]-p3[1])*t2+(-p0[1]+3*p1[1]-3*p2[1]+p3[1])*t3);
    return [lon,lat];
  }
  function densify(ring, steps){
    const out = [], n = ring.length;
    for(let i=0;i<n;i++){
      const p0 = ring[(i-1+n)%n], p1 = ring[i], p2 = ring[(i+1)%n], p3 = ring[(i+2)%n];
      for(let s=0;s<steps;s++){ out.push(catmullRomPt(p0,p1,p2,p3,s/steps)); }
    }
    return out;
  }
  const CONTINENTS_DENSE = [...CONTINENTS, ...ISLANDS].map(r=>densify(r,5));

  const LABELS = [
    {name:'USA', c:[-98,39]}, {name:'CANADA', c:[-106,56]}, {name:'BRAZIL', c:[-52,-10]},
    {name:'UK', c:[-2,54]}, {name:'FRANCE', c:[2,47]}, {name:'GERMANY', c:[10,51]},
    {name:'NIGERIA', c:[8,9]}, {name:'EGYPT', c:[30,26]}, {name:'S. AFRICA', c:[24,-29]},
    {name:'RUSSIA', c:[60,61]}, {name:'INDIA', c:[79,22]}, {name:'CHINA', c:[104,35]},
    {name:'JAPAN', c:[138,37]}, {name:'INDONESIA', c:[113,-2]}, {name:'AUSTRALIA', c:[134,-25]},
    {name:'MEXICO', c:[-102,23]}
  ];
  LABELS.forEach(l=>{
    const d = document.createElement('div');
    d.className = 'globe-label'; d.textContent = l.name;
    labelsEl.appendChild(d); l.el = d;
  });

  function project(lon, lat, rotLon){
    const lambda = (lon-rotLon)*Math.PI/180, phi = lat*Math.PI/180;
    const x = Math.cos(phi)*Math.sin(lambda);
    const y0 = Math.sin(phi), z0 = Math.cos(phi)*Math.cos(lambda);
    const y = y0*cosT - z0*sinT, z = y0*sinT + z0*cosT;
    return { x: cx+R*x, y: cy-R*y, z, visible: z > 0.02 };
  }
  function drawRing(rotLon, ring){
    ctx.beginPath();
    let started = false;
    for(let i=0;i<=ring.length;i++){
      const [lon,lat] = ring[i % ring.length];
      const p = project(lon, lat, rotLon);
      if(p.visible){ if(!started){ ctx.moveTo(p.x,p.y); started=true; } else ctx.lineTo(p.x,p.y); }
      else started = false;
    }
    ctx.fill(); ctx.stroke();
  }
  function drawLine(rotLon, points){
    ctx.beginPath();
    let started = false;
    points.forEach(([lon,lat])=>{
      const p = project(lon, lat, rotLon);
      if(p.visible){ if(!started){ ctx.moveTo(p.x,p.y); started=true; } else ctx.lineTo(p.x,p.y); }
      else started = false;
    });
    ctx.stroke();
  }
  const MERIDIANS = [], PARALLELS = [];
  for(let lon=-180; lon<180; lon+=30){
    const line=[]; for(let lat=-80; lat<=80; lat+=4) line.push([lon,lat]); MERIDIANS.push(line);
  }
  for(let lat=-60; lat<=60; lat+=30){
    const line=[]; for(let lon=-180; lon<=180; lon+=4) line.push([lon,lat]); PARALLELS.push(line);
  }

  let start = null;
  function frame(t){
    if(start===null) start = t;
    const rotLon = (-100 + (t-start)*0.015) % 360;
    ctx.clearRect(0,0,size,size);

    ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2);
    const grad = ctx.createRadialGradient(size*0.32,size*0.28,4, cx,cy,R*1.25);
    grad.addColorStop(0,'#2c5490'); grad.addColorStop(0.55,'#132A52'); grad.addColorStop(1,'#0a1830');
    ctx.fillStyle = grad; ctx.fill();

    ctx.strokeStyle = 'rgba(227,178,60,0.12)'; ctx.lineWidth = 0.5;
    MERIDIANS.forEach(line=>drawLine(rotLon, line));
    PARALLELS.forEach(line=>drawLine(rotLon, line));

    ctx.fillStyle = 'rgba(227,178,60,0.88)';
    ctx.strokeStyle = 'rgba(13,30,61,0.5)'; ctx.lineWidth = 0.4;
    CONTINENTS_DENSE.forEach(ring=>drawRing(rotLon, ring));

    ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2);
    ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 1.2; ctx.stroke();

    LABELS.forEach(l=>{
      const p = project(l.c[0], l.c[1], rotLon);
      if(p.visible && p.z > 0.15){
        l.el.style.left = p.x+'px'; l.el.style.top = p.y+'px';
        l.el.style.opacity = Math.min(1, (p.z-0.15)/0.5).toFixed(2);
      } else {
        l.el.style.opacity = 0;
      }
    });
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();

/* ================= NAV / TOAST ================= */
const TAB_SCREENS = ['home','setup','report','profile'];
function go(screen){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById('screen-'+screen).classList.add('active');
  const tabbar = document.getElementById('tabbar');
  tabbar.style.display = TAB_SCREENS.includes(screen) ? 'flex' : 'none';
  document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active', t.dataset.tab===screen));
  if(screen==='setup'){ coachSay("Hey, I'm Neeraj! Let's get to know you a little better. Pop in your resume if you have one handy — it helps me ask sharper, more relevant questions."); }
  else if(!['hardware','assess'].includes(screen)){ hideCoach(); }
  if(screen==='schedule'){ resetScheduleScreen(); }
  window.scrollTo(0,0);
}
function toast(msg){
  const t = document.getElementById('toast'); t.textContent = msg; t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'), 2200);
}

/* ================= AUTH ================= */
function loadDB(){ try{ return JSON.parse(localStorage.getItem('w3m_db')) || {users:{}, byEmail:{}}; }catch(e){ return {users:{}, byEmail:{}}; } }
function saveDB(){ try{ localStorage.setItem('w3m_db', JSON.stringify(DB)); }catch(e){} }
const DB = loadDB();
let currentUser = null;
let authTab = 'login';
function isValidEmail(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
function initials(name){ return (name||'?').split(' ').map(s=>s[0]).join('').slice(0,2).toUpperCase(); }
function setAuthTab(tab){
  authTab = tab;
  document.getElementById('tabLogin').classList.toggle('active', tab==='login');
  document.getElementById('tabSignup').classList.toggle('active', tab==='signup');
  document.getElementById('loginFields').style.display = tab==='login' ? 'block' : 'none';
  document.getElementById('signupFields').style.display = tab==='signup' ? 'block' : 'none';
  document.getElementById('au-submit').textContent = tab==='login' ? 'Log In' : 'Create Account';
  const st = document.getElementById('au-status'); st.textContent=''; st.className='auth-status';
}
function submitAuth(){
  const st = document.getElementById('au-status');
  if(authTab === 'login'){
    const uname = document.getElementById('login-username').value.trim().toLowerCase();
    const pass = document.getElementById('login-password').value;
    if(!uname || !pass){ st.textContent='Enter your username and password.'; st.className='auth-status bad'; return; }
    const user = DB.users[uname];
    if(!user || user.password !== pass){ st.textContent='No account matches that username and password.'; st.className='auth-status bad'; return; }
    loginAs(user);
  } else {
    const name = document.getElementById('signup-name').value.trim();
    const uname = document.getElementById('signup-username').value.trim().toLowerCase();
    const email = document.getElementById('signup-email').value.trim().toLowerCase();
    const pass = document.getElementById('signup-password').value;
    if(!name || !uname || !pass){ st.textContent='Fill in your name, a username, and a password.'; st.className='auth-status bad'; return; }
    if(!/^[a-z0-9_.]{3,20}$/.test(uname)){ st.textContent='Username: 3-20 characters — letters, numbers, "_" or "." only.'; st.className='auth-status bad'; return; }
    if(DB.users[uname]){ st.textContent='That username is already taken — try another.'; st.className='auth-status bad'; return; }
    if(email && !isValidEmail(email)){ st.textContent="That email looks incomplete — you can also leave it blank."; st.className='auth-status bad'; return; }
    const user = {name, email, username:uname, password:pass, role:'Not specified', location:'Not set'};
    DB.users[uname] = user; if(email) DB.byEmail[email] = uname; saveDB();
    loginAs(user);
  }
}
function demoLogin(){
  const user = {name:'Demo User', email:'demo@w3me.in', username:'demo', password:'demo', role:'Product Manager', location:'Bengaluru, IN'};
  loginAs(user);
}
function loginAs(user){
  currentUser = user;
  try{ localStorage.setItem('w3m_session', user.username); localStorage.setItem('w3m_biometric_user', user.username); }catch(e){}
  const hr = new Date().getHours();
  const greet = hr<12?'Good morning':hr<18?'Good afternoon':'Good evening';
  document.getElementById('home-greeting').textContent = `${greet}, ${user.name.split(' ')[0]}`;
  document.getElementById('profileName').textContent = user.name;
  document.getElementById('profileMeta').textContent = `${user.role} · ${user.location}`;
  document.getElementById('profileAvatar').textContent = initials(user.name);
  toast(`Signed in as ${user.name.split(' ')[0]}`);
  go('home');
}
function logout(){ currentUser=null; try{localStorage.removeItem('w3m_session');}catch(e){} go('entry'); }
(function restoreSession(){
  try{ const u = localStorage.getItem('w3m_session'); if(u && DB.users[u]) loginAs(DB.users[u]); }catch(e){}
})();

/* ================= SSO / PROVIDER LOGIN ================= */
const PROVIDERS = {
  google:{ label:'Google', icon:'G' },
  microsoft:{ label:'Microsoft', icon:'M' },
  linkedin:{ label:'LinkedIn', icon:'in' },
  apple:{ label:'Apple', icon:'🍎' }
};
let currentProvider = 'google';
function openProviderModal(provider){
  currentProvider = provider;
  const p = PROVIDERS[provider];
  const screen = document.getElementById('screen-provider');
  screen.className = 'screen provider-'+provider;
  document.getElementById('paLogo').textContent = p.icon;
  document.getElementById('paTitle').textContent = 'Sign in with '+p.label;
  document.getElementById('pa-username').value = '';
  document.getElementById('pa-password').value = '';
  document.getElementById('pa-status').textContent = '';
  document.getElementById('paSubmitBtn').textContent = 'Sign in';
  document.getElementById('paSubmitBtn').disabled = false;
  go('provider');
}
function cancelProviderAuth(){ go('signon'); }
function submitProviderAuth(){
  const uname = document.getElementById('pa-username').value.trim();
  const pass = document.getElementById('pa-password').value;
  const status = document.getElementById('pa-status');
  if(!uname || !pass){ status.textContent = 'Enter your email/username and password.'; return; }
  status.textContent = '';
  const btn = document.getElementById('paSubmitBtn');
  btn.textContent = 'Authorizing…'; btn.disabled = true;
  setTimeout(()=>{
    const lookupKey = uname.toLowerCase();
    let user = DB.users[lookupKey] || (DB.byEmail[lookupKey] ? DB.users[DB.byEmail[lookupKey]] : null);
    if(!user){
      const username = lookupKey.includes('@') ? lookupKey.split('@')[0]+'.'+Math.random().toString(36).slice(2,5) : lookupKey;
      user = { name: PROVIDERS[currentProvider].label+' User', email: lookupKey.includes('@') ? lookupKey : '',
        username, password: pass, role:'Not specified', location:'Not set' };
      DB.users[username] = user; if(user.email) DB.byEmail[user.email] = username; saveDB();
    }
    loginAs(user); // returns from authorization straight to the home screen
  }, 900);
}

/* ================= BIOMETRIC (FACE + VOICE) LOGIN ================= */
let bioStream = null, bioTimer = null;
async function startBiometricScreen(){
  go('biometric');
  const ring = document.getElementById('scanRing'), status = document.getElementById('bioStatus'), wave = document.getElementById('bioWave');
  ring.classList.remove('scanning'); wave.style.display='none';
  status.textContent = 'Initializing camera & microphone…';
  try{
    bioStream = await navigator.mediaDevices.getUserMedia({video:true, audio:true});
    document.getElementById('bioVideo').srcObject = bioStream;
    ring.classList.add('scanning');
    status.textContent = 'Detecting face…'; wave.style.display='none';
    bioTimer = setTimeout(()=>{
      status.textContent = 'Analyzing voice pattern…'; wave.style.display='flex';
      bioTimer = setTimeout(()=>{
        status.textContent = 'Verifying identity…';
        bioTimer = setTimeout(finishBiometric, 900);
      }, 1200);
    }, 1200);
  }catch(e){
    status.textContent = 'Camera/mic access denied — sign in another way below.';
  }
}
function finishBiometric(){
  const status = document.getElementById('bioStatus');
  let linked = null;
  try{ const u = localStorage.getItem('w3m_biometric_user'); if(u && DB.users[u]) linked = DB.users[u]; }catch(e){}
  if(linked){
    status.textContent = `Identity verified — welcome back, ${linked.name.split(' ')[0]}.`;
    setTimeout(()=>{ stopBiometricStream(); loginAs(linked); }, 500);
  } else {
    status.textContent = 'No Face & Voice ID enrolled on this device yet. Sign in another way first, then it unlocks automatically next time.';
    document.getElementById('scanRing').classList.remove('scanning');
    document.getElementById('bioWave').style.display='none';
  }
}
function stopBiometricStream(){
  if(bioTimer) clearTimeout(bioTimer);
  if(bioStream){ bioStream.getTracks().forEach(t=>t.stop()); bioStream=null; }
}
function cancelBiometric(){ stopBiometricStream(); go('entry'); }

/* ================= HOME WIDGETS ================= */
const scores = [{label:'Burnout',val:42,color:'#C1543D'},{label:'Role Match',val:88,color:'#C6932A'},
  {label:'Happiness',val:74,color:'#E3B23C'},{label:'Leadership',val:69,color:'#132A52'},{label:'Stability',val:81,color:'#4C8F6B'}];
function ring(val,color){ const r=25,c=2*Math.PI*r,off=c-(val/100)*c;
  return `<svg width="60" height="60" viewBox="0 0 60 60"><circle cx="30" cy="30" r="${r}" fill="none" stroke="var(--line)" stroke-width="6"/>
  <circle cx="30" cy="30" r="${r}" fill="none" stroke="${color}" stroke-width="6" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${off}" transform="rotate(-90 30 30)"/></svg>`; }
function renderScoreRow(elId){
  document.getElementById(elId).innerHTML = scores.map(s=>`<div class="score-card card">${ring(s.val,s.color)}<div class="val">${s.val}%</div><div class="lbl">${s.label}</div></div>`).join('');
}
function drawRadar(id, vals){
  const axes=['Purpose','Leadership','Growth','Culture','Stability','Balance'];
  const cx=120,cy=108,R=76;
  const pts=arr=>arr.map((v,i)=>{ const a=-Math.PI/2+i*(2*Math.PI/axes.length); return [cx+Math.cos(a)*R*v, cy+Math.sin(a)*R*v]; });
  let svg='';
  [0.25,0.5,0.75,1].forEach(f=>{ const ring=axes.map((_,i)=>{ const a=-Math.PI/2+i*(2*Math.PI/axes.length); return `${cx+Math.cos(a)*R*f},${cy+Math.sin(a)*R*f}`; }).join(' ');
    svg+=`<polygon points="${ring}" fill="none" stroke="var(--line)" stroke-width="1"/>`; });
  axes.forEach((label,i)=>{ const a=-Math.PI/2+i*(2*Math.PI/axes.length); const x2=cx+Math.cos(a)*R,y2=cy+Math.sin(a)*R;
    const lx=cx+Math.cos(a)*(R+22), ly=cy+Math.sin(a)*(R+14);
    svg+=`<line x1="${cx}" y1="${cy}" x2="${x2}" y2="${y2}" stroke="var(--line)" stroke-width="1"/><text x="${lx}" y="${ly}" font-size="8.5" fill="var(--ink-soft)" text-anchor="middle">${label}</text>`; });
  const dataPts = pts(vals).map(p=>p.join(',')).join(' ');
  svg+=`<polygon points="${dataPts}" fill="rgba(227,178,60,0.28)" stroke="#E3B23C" stroke-width="2"/>`;
  pts(vals).forEach(p=>{ svg+=`<circle cx="${p[0]}" cy="${p[1]}" r="2.6" fill="#132A52"/>`; });
  document.getElementById(id).innerHTML = svg;
}
drawWellbeingRadar('radarSvg', [0.65,0.6,0.7,0.6,0.75,0.6]);
try{ renderRatingBand(); renderFocusAreas(); renderStrongAreas(); renderRoadmap(); renderWeeklyTrend(); }catch(e){}
const skills = [{n:'Programming',v:72,c:'#C6932A'},{n:'Leadership',v:65,c:'#132A52'},{n:'Communication',v:88,c:'#E3B23C'},{n:'Cloud / AI',v:54,c:'#4C8F6B'}];
document.getElementById('skillSliders').innerHTML = skills.map(s=>`<div class="skill-row"><div class="s-label">${s.n}</div>
  <div class="s-track"><div class="s-fill" style="width:${s.v}%; background:${s.c};"></div></div><div class="s-val">${s.v}%</div></div>`).join('');
function heatColor(v){
  // v: 0 (low engagement) -> 1 (high engagement). Clear, easy-to-read color ramp: red -> gold -> green.
  const stops = [
    {p:0,   c:[193,84,61]},   // red  (low)
    {p:0.5, c:[227,178,60]},  // gold (medium)
    {p:1,   c:[76,143,107]}   // green (high)
  ];
  let a=stops[0], b=stops[1];
  for(let i=0;i<stops.length-1;i++){ if(v>=stops[i].p && v<=stops[i+1].p){ a=stops[i]; b=stops[i+1]; break; } }
  const span = (b.p-a.p) || 1;
  const t = (v-a.p)/span;
  const rgb = a.c.map((ac,i)=>Math.round(ac + (b.c[i]-ac)*t));
  return `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
}
document.getElementById('heatGrid').innerHTML = Array.from({length:28},()=>Math.random()).map((v,i)=>{
  const dayNames=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const week = Math.floor(i/7)+1, day = dayNames[i%7];
  const level = v<0.34?'Low':v<0.67?'Moderate':'High';
  return `<div class="heat-cell" style="background:${heatColor(v)};" title="Week ${week} · ${day} — ${level} engagement (${Math.round(v*100)}%)"></div>`;
}).join('');

/* ================= RESUME / ATS ================= */
let analyzedAts = null, analyzedAtsFile = '';
const uploadZoneEl = document.getElementById('uploadZone');
const fileInputEl = document.getElementById('fileInput');
uploadZoneEl.addEventListener('click', ()=>{ fileInputEl.click(); });
fileInputEl.addEventListener('change', function(){
  if(this.files && this.files[0]) handleResumeUpload(this.files[0]);
});
uploadZoneEl.addEventListener('dragover', e=>{ e.preventDefault(); e.currentTarget.classList.add('drag'); });
uploadZoneEl.addEventListener('dragleave', e=> e.currentTarget.classList.remove('drag'));
uploadZoneEl.addEventListener('drop', e=>{
  e.preventDefault(); e.currentTarget.classList.remove('drag');
  if(e.dataTransfer.files && e.dataTransfer.files[0]) handleResumeUpload(e.dataTransfer.files[0]);
});
function handleResumeUpload(file){
  try{
    if(!file){ toast('No file detected — try again.'); return; }
    const okExt = /\.(pdf|docx?|txt)$/i.test(file.name);
    if(!okExt){ toast('Please upload a PDF, DOC/DOCX, or TXT file.'); return; }
    if(file.size === 0){ toast('That file looks empty — try a different one.'); return; }
    if(file.size > 10*1024*1024){ toast('That file is too large — please keep it under 10MB.'); return; }
    document.getElementById('atsPanel').style.display = 'none';
    document.getElementById('uploadText').textContent = `Analyzing ${file.name}…`;
    let hash=0; for(let i=0;i<file.name.length;i++) hash = (hash*31 + file.name.charCodeAt(i)) % 997;
    const score = 55 + (hash % 40);
    setTimeout(()=>{
      analyzedAts = score; analyzedAtsFile = file.name;
      document.getElementById('uploadText').textContent = `${file.name} — analyzed`;
      document.getElementById('atsPanel').style.display = 'grid';
      document.getElementById('atsVal').textContent = score;
      document.getElementById('atsCircle').style.borderColor = score>=75?'var(--good)':(score>=50?'var(--accent)':'var(--danger)');
      const pool = score>=75
        ? ['Strong keyword coverage for your target role','Clear reverse-chronological structure','Quantified impact in most bullet points']
        : score>=50
        ? ['Decent structure, could use more metrics','A few sections are missing keywords','Consider tightening your summary line']
        : ['Formatting may confuse some ATS parsers','Add more role-specific keywords','Quantify achievements with numbers where possible'];
      document.getElementById('atsInsights').innerHTML = pool.map(p=>`<div><span class="dot"></span>${p}</div>`).join('');
    }, 700);
  }catch(err){
    console.error('Resume upload failed:', err);
    toast('Resume analysis hit an error — you can skip this and continue.');
  }
}

/* ================= SETUP FLOW ================= */
let chosenTrack = '';
const userLangs = [];
function selectTrack(track){
  chosenTrack = track;
  document.getElementById('trackMcq').classList.toggle('sel', track==='mcq');
  document.getElementById('trackVoice').classList.toggle('sel', track==='voice');
  document.getElementById('trackContinue').disabled = !chosenTrack;
}
function addLanguage(){
  const lang = document.getElementById('langSelect').value, lvl = document.getElementById('langLevel').value;
  if(!lang){ toast('Choose a language first'); return; }
  userLangs.push({lang,lvl});
  renderLangPool();
}
function renderLangPool(){
  document.getElementById('langPool').innerHTML = userLangs.map((l,i)=>
    `<div class="lang-chip">${l.lang} · ${l.lvl} <b onclick="removeLang(${i})">✕</b></div>`).join('');
}
function removeLang(i){ userLangs.splice(i,1); renderLangPool(); }

/* ================= SETUP DROPDOWNS (industry / function / role / location / skills) ================= */
const INDUSTRIES = ["Technology / IT","Finance & Banking","Healthcare & Pharma","Education","Retail & E-commerce",
  "Manufacturing","Automotive","Real Estate","Construction","Energy & Utilities","Telecommunications",
  "Media & Entertainment","Hospitality & Travel","Transportation & Logistics","Government & Public Sector",
  "Non-Profit / NGO","Legal Services","Consulting","Agriculture","Insurance","Aerospace & Defense",
  "FMCG / Consumer Goods","Gaming","Sports & Fitness","Fashion & Apparel","Food & Beverage","Biotechnology",
  "Environmental Services","Human Resources","Marketing & Advertising","Other"];

const JOB_FUNCTIONS = {
  "Engineering & Technology": ["Software Engineer","DevOps Engineer","Data Engineer","QA / Test Engineer",
    "Mobile Developer","Site Reliability Engineer","Systems Administrator","Cloud Architect","Security Engineer","Embedded Engineer"],
  "Product & Design": ["Product Manager","Product Designer","UX Researcher","UI Designer","Product Owner","Business Analyst"],
  "Data & AI": ["Data Scientist","Data Analyst","Machine Learning Engineer","AI Researcher","Business Intelligence Analyst"],
  "Sales & Business Development": ["Sales Executive","Account Manager","Business Development Manager","Sales Engineer",
    "Customer Success Manager","Partnerships Manager"],
  "Marketing & Communications": ["Marketing Manager","Content Strategist","SEO Specialist","Brand Manager",
    "Social Media Manager","PR Manager","Growth Marketer"],
  "Finance & Accounting": ["Financial Analyst","Accountant","Controller","Investment Analyst","Auditor","Treasury Analyst"],
  "Human Resources": ["HR Generalist","Talent Acquisition Specialist","HR Business Partner",
    "Compensation & Benefits Analyst","Learning & Development Specialist"],
  "Operations & Supply Chain": ["Operations Manager","Supply Chain Analyst","Logistics Coordinator",
    "Procurement Manager","Project Manager"],
  "Customer Support": ["Customer Support Representative","Technical Support Engineer","Support Team Lead"],
  "Legal & Compliance": ["Legal Counsel","Paralegal","Compliance Officer","Contracts Manager"],
  "Healthcare": ["Registered Nurse","Physician","Medical Technician","Healthcare Administrator","Pharmacist"],
  "Education": ["Teacher","Professor","Instructional Designer","Academic Counselor"],
  "Executive & Leadership": ["CEO","COO","CTO","CFO","VP","Director"]
};

const SKILLS = ["JavaScript","Python","Java","C++","SQL","React","Node.js","AWS","Azure","Google Cloud",
  "Data Analysis","Machine Learning","Project Management","Agile / Scrum","Communication","Leadership",
  "Sales","Negotiation","SEO","Content Writing","Graphic Design","Figma","Excel","Financial Modeling",
  "Public Speaking","Customer Service","Salesforce","HR Management","Recruiting","Six Sigma",
  "Supply Chain Management","UX Research","Copywriting","Video Editing","Cybersecurity","DevOps",
  "Product Strategy","Market Research","Accounting","Legal Drafting","Teaching / Training"];

const COUNTRIES = ["Afghanistan","Albania","Algeria","Andorra","Angola","Argentina","Armenia","Australia",
  "Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin",
  "Bhutan","Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi",
  "Cambodia","Cameroon","Canada","Cape Verde","Central African Republic","Chad","Chile","China","Colombia",
  "Comoros","Congo (DRC)","Congo (Republic)","Costa Rica","Croatia","Cuba","Cyprus","Czech Republic","Denmark",
  "Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea",
  "Estonia","Eswatini","Ethiopia","Fiji","Finland","France","Gabon","Gambia","Georgia","Germany","Ghana",
  "Greece","Grenada","Guatemala","Guinea","Guinea-Bissau","Guyana","Haiti","Honduras","Hungary","Iceland",
  "India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Ivory Coast","Jamaica","Japan","Jordan",
  "Kazakhstan","Kenya","Kiribati","Kosovo","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia",
  "Libya","Liechtenstein","Lithuania","Luxembourg","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta",
  "Marshall Islands","Mauritania","Mauritius","Mexico","Micronesia","Moldova","Monaco","Mongolia","Montenegro",
  "Morocco","Mozambique","Myanmar","Namibia","Nauru","Nepal","Netherlands","New Zealand","Nicaragua","Niger",
  "Nigeria","North Korea","North Macedonia","Norway","Oman","Pakistan","Palau","Panama","Papua New Guinea",
  "Paraguay","Peru","Philippines","Poland","Portugal","Qatar","Romania","Russia","Rwanda","Saint Lucia",
  "Samoa","San Marino","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia",
  "Slovenia","Solomon Islands","Somalia","South Africa","South Korea","South Sudan","Spain","Sri Lanka",
  "Sudan","Suriname","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Timor-Leste",
  "Togo","Tonga","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Tuvalu","Uganda","Ukraine",
  "United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan","Vanuatu","Vatican City",
  "Venezuela","Vietnam","Yemen","Zambia","Zimbabwe"];

function populateSelect(id, items, placeholder){
  document.getElementById(id).innerHTML = `<option value="">${placeholder}</option>` +
    items.map(v=>`<option>${v}</option>`).join('');
}
function initSetupDropdowns(){
  populateSelect('industry', INDUSTRIES, 'Choose');
  populateSelect('jobFunction', Object.keys(JOB_FUNCTIONS), 'Choose');
  populateSelect('location', COUNTRIES, 'Choose country');
  populateSelect('skillSelect', SKILLS, 'Choose a skill');
}
initSetupDropdowns();
function onJobFunctionChange(){
  const func = document.getElementById('jobFunction').value;
  const roleSelect = document.getElementById('jobRole');
  if(!func){
    roleSelect.innerHTML = '<option value="">Choose function first</option>';
    roleSelect.disabled = true;
    return;
  }
  roleSelect.disabled = false;
  populateSelect('jobRole', JOB_FUNCTIONS[func], 'Choose a role');
}
const userSkills = [];
function addSkill(){
  const sel = document.getElementById('skillSelect');
  const val = sel.value;
  if(!val){ toast('Choose a skill first'); return; }
  if(userSkills.includes(val)){ toast('That skill is already added'); return; }
  userSkills.push(val);
  renderSkillPool();
}
function renderSkillPool(){
  document.getElementById('skillPool').innerHTML = userSkills.map((s,i)=>
    `<div class="lang-chip">${s} <b onclick="removeSkill(${i})">✕</b></div>`).join('');
}
function removeSkill(i){ userSkills.splice(i,1); renderSkillPool(); }
function continueFromSetup(){ go('track'); }
function continueFromTrack(){
  if(!chosenTrack){ toast('Pick a response mode to continue'); return; }
  if(chosenTrack==='voice') { go('hardware'); requestHardware(); }
  else beginAssessment();
}

/* ================= HARDWARE CHECK ================= */
let hwStream = null;
async function requestHardware(){
  document.getElementById('retryHwBtn').style.display='none';
  document.getElementById('camStatus').className='status-pill status-wait'; document.getElementById('camStatus').textContent='Requesting…';
  document.getElementById('micStatus').className='status-pill status-wait'; document.getElementById('micStatus').textContent='Requesting…';
  document.getElementById('beginAssessBtn').disabled = true;
  // getUserMedia only exists in a secure context (HTTPS or localhost). Opening this file
  // directly (file://) or over plain HTTP means navigator.mediaDevices won't exist at all —
  // that's a different failure than the user blocking permission, so we surface it clearly.
  if(!window.isSecureContext || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
    document.getElementById('camStatus').className='status-pill status-bad'; document.getElementById('camStatus').textContent='Unavailable';
    document.getElementById('micStatus').className='status-pill status-bad'; document.getElementById('micStatus').textContent='Unavailable';
    document.getElementById('retryHwBtn').style.display='block';
    toast('Camera/mic need a secure connection (HTTPS) to work — this page isn\'t loaded over one. Switch to Written mode to continue.');
    return;
  }
  try{
    hwStream = await navigator.mediaDevices.getUserMedia({video:true, audio:true});
    document.getElementById('preCheckVideo').srcObject = hwStream;
    document.getElementById('camStatus').className='status-pill status-good'; document.getElementById('camStatus').textContent='Active';
    document.getElementById('micStatus').className='status-pill status-good'; document.getElementById('micStatus').textContent='Active';
    document.getElementById('beginAssessBtn').disabled = false;
  }catch(e){
    const label = e.name==='NotAllowedError' ? 'Denied' : e.name==='NotFoundError' ? 'Not Found' : 'Blocked';
    document.getElementById('camStatus').className='status-pill status-bad'; document.getElementById('camStatus').textContent=label;
    document.getElementById('micStatus').className='status-pill status-bad'; document.getElementById('micStatus').textContent=label;
    document.getElementById('retryHwBtn').style.display='block';
    const msg = e.name==='NotAllowedError'
      ? 'Camera/mic permission was denied — allow access in your browser settings, then retry, or switch to Written mode.'
      : e.name==='NotFoundError'
      ? 'No camera or microphone found on this device — switch to Written mode.'
      : 'Camera/mic access failed — you can retry or switch to Written mode.';
    toast(msg);
  }
}

/* ================= NEERAJ VOICE COACH (British English male, natural TTS) ================= */
let coachVoice = null, ttsSupported = 'speechSynthesis' in window, sttSupported = ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
function pickCoachVoice(){
  if(!ttsSupported) return;
  // Known British English (en-GB) male voice names across common engines, best-sounding first
  const BRITISH_MALE_PREFERRED = [
    /Microsoft Ryan Online.*Natural/i,          // Edge/Windows — natural neural UK male
    /Microsoft Ryan/i,
    /Microsoft George/i,                         // classic Windows UK male
    /Google UK English Male/i,                   // Google narrator — Chrome/ChromeOS/Android
    /Daniel/i,                                    // macOS/iOS UK male
    /Arthur/i,
    /Oliver/i
  ];
  // Any Google narrator voice (Chrome/ChromeOS/Android) that isn't specifically UK — used as a named fallback
  const GOOGLE_NARRATOR = [/Google UK English Male/i, /Google US English/i, /Google.*English.*Male/i];
  // Names known to be female voices, so they're never picked even if they slip through an en-GB filter
  const FEMALE_NAME_HINT = /Hazel|Susan|Kate|Serena|Sonia|Fiona|Moira|Zira|Libby|Sarah|Female/i;
  const load = ()=>{
    const voices = speechSynthesis.getVoices();
    if(!voices.length) return;
    // "Thomas" requested by name — check across all voices first (some engines list it outside en-GB)
    let best = voices.find(v=>/Thomas/i.test(v.name));
    if(!best){
      const gbVoices = voices.filter(v=>/^en-GB/i.test(v.lang));
      for(const rx of BRITISH_MALE_PREFERRED){ best = gbVoices.find(v=>rx.test(v.name)); if(best) break; }
      if(!best) best = gbVoices.find(v=>/male/i.test(v.name));
      if(!best) best = gbVoices.find(v=>!FEMALE_NAME_HINT.test(v.name));
      if(!best) best = gbVoices[0];
    }
    if(!best){
      // no en-GB voice (or Thomas) at all — try a Google narrator voice by name before the generic fallback
      for(const rx of GOOGLE_NARRATOR){ best = voices.find(v=>rx.test(v.name)); if(best) break; }
    }
    coachVoice = best
      || voices.find(v=>/male/i.test(v.name) && /^en/i.test(v.lang))
      || voices.find(v=>/^en/i.test(v.lang) && !FEMALE_NAME_HINT.test(v.name))
      || voices[0];
  };
  load();
  speechSynthesis.onvoiceschanged = load;
}
pickCoachVoice();
function coachSay(text, onEnd){
  const bubble = document.getElementById('coachBubble');
  bubble.style.display = 'flex';
  document.getElementById('coachText').textContent = text;
  const avatar = document.getElementById('coachAvatar');
  if(demoActive || !ttsSupported){ if(onEnd) onEnd(); return; }
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  if(coachVoice) u.voice = coachVoice;
  // Natural conversational pace and pitch — no artificial deepening, just an unhurried, warm delivery
  u.rate = 0.97; u.pitch = 1.0; u.volume = 1;
  avatar.classList.add('speaking');
  u.onend = ()=>{ avatar.classList.remove('speaking'); if(onEnd) onEnd(); };
  u.onerror = ()=>{ avatar.classList.remove('speaking'); if(onEnd) onEnd(); };
  speechSynthesis.speak(u);
}
function hideCoach(){ document.getElementById('coachBubble').style.display='none'; if(ttsSupported) speechSynthesis.cancel(); }
const COACH_WELCOME = "Welcome to the W3M platform — the one and only platform for your career diagnostics and support. Please feel free to ask anything related to your career. I'm here to help you!";
let coachTapCount = 0;
function coachBubbleTap(){
  coachTapCount++;
  if(coachTapCount===1){
    coachSay(COACH_WELCOME, ()=>{ document.getElementById('coachText').textContent = "Ask me anything, or tap again to see my profile →"; });
  } else {
    coachTapCount = 0;
    go('portfolio');
  }
}

/* ================= ADAPTIVE ASSESSMENT ENGINE — 12 competency dimensions ================= */
const CATEGORIES = [
  { key:"direction", title:"Career Direction & Clarity", q:"How clear are you on the direction you want your career to take?",
    options:[{t:"Very unclear — I'm not sure what I want",s:1},{t:"Somewhat unclear — vague ideas",s:2},{t:"Fairly clear — a general direction",s:3},{t:"Very clear — I know exactly where I'm headed",s:4}] },
  { key:"satisfaction", title:"Job Satisfaction", q:"How satisfied are you with your current role?",
    options:[{t:"Not satisfied at all",s:1},{t:"Somewhat dissatisfied",s:2},{t:"Generally satisfied",s:3},{t:"Very satisfied",s:4}] },
  { key:"growth", title:"Career Growth", q:"How would you rate your career growth over the last 2 years?",
    options:[{t:"Stagnant — little to no growth",s:1},{t:"Slow growth",s:2},{t:"Steady growth",s:3},{t:"Strong, accelerating growth",s:4}] },
  { key:"leadership", title:"Leadership Readiness", q:"How ready do you feel to take on a bigger leadership role?",
    options:[{t:"Not ready at all",s:1},{t:"Need significant development",s:2},{t:"Mostly ready, some gaps",s:3},{t:"Fully ready",s:4}] },
  { key:"resume", title:"Resume Health", q:"How confident are you that your resume reflects your true impact?",
    options:[{t:"Not confident — outdated or generic",s:1},{t:"Somewhat confident",s:2},{t:"Fairly confident",s:3},{t:"Very confident — sharp and current",s:4}] },
  { key:"linkedin", title:"LinkedIn Presence", q:"How would you rate your LinkedIn presence and activity?",
    options:[{t:"Barely active or outdated",s:1},{t:"Basic profile, rarely active",s:2},{t:"Active and reasonably complete",s:3},{t:"Strong, active, well-positioned",s:4}] },
  { key:"interview", title:"Interview Readiness", q:"How prepared do you feel walking into an interview today?",
    options:[{t:"Not prepared",s:1},{t:"Would need real prep",s:2},{t:"Reasonably prepared",s:3},{t:"Very well prepared",s:4}] },
  { key:"skills", title:"Skills Assessment", q:"How current are your skills relative to where the market is heading?",
    options:[{t:"Falling behind",s:1},{t:"Some gaps forming",s:2},{t:"Mostly current",s:3},{t:"Ahead of the curve",s:4}] },
  { key:"workplace", title:"Workplace Environment", q:"How would you describe your current workplace environment?",
    options:[{t:"Toxic or very unsupportive",s:1},{t:"Challenging, some issues",s:2},{t:"Generally healthy",s:3},{t:"Excellent, highly supportive",s:4}] },
  { key:"obstacles", title:"Career Obstacles", q:"How significant are the obstacles currently standing in your way?",
    options:[{t:"Major obstacles I don't know how to solve",s:1},{t:"Real obstacles, some ideas to address them",s:2},{t:"Minor obstacles",s:3},{t:"No significant obstacles right now",s:4}] },
  { key:"goals", title:"Future Goals", q:"How well-defined are your career goals for the next 3 years?",
    options:[{t:"Not defined at all",s:1},{t:"Loosely defined",s:2},{t:"Fairly well defined",s:3},{t:"Clearly defined with a plan",s:4}] },
  { key:"aireadiness", title:"AI Readiness", q:"How ready do you feel to work effectively with AI tools in your field?",
    options:[{t:"Not ready — I avoid them",s:1},{t:"Basic awareness only",s:2},{t:"Comfortable using common tools",s:3},{t:"Highly fluent, using AI to get ahead",s:4}] },
  { key:"burnout", title:"Burnout Level", q:"How drained or exhausted do you feel by your work most weeks?",
    options:[{t:"Constantly exhausted — running on empty",s:1},{t:"Often drained, recovering is hard",s:2},{t:"Tired sometimes, but I bounce back",s:3},{t:"Energized — rarely feel burnt out",s:4}] },
  { key:"stress", title:"Stress Load", q:"How manageable is your day-to-day stress right now?",
    options:[{t:"Overwhelming — I struggle to cope",s:1},{t:"High, but I'm holding on",s:2},{t:"Manageable most days",s:3},{t:"Low — I feel in control",s:4}] },
  { key:"motivation", title:"Motivation", q:"How motivated do you feel to show up and do your best work?",
    options:[{t:"Very low — just going through the motions",s:1},{t:"Inconsistent — comes and goes",s:2},{t:"Fairly motivated most days",s:3},{t:"Highly motivated and driven",s:4}] },
  { key:"focus", title:"Focus & Concentration", q:"How easy is it for you to stay focused on deep work without getting pulled away?",
    options:[{t:"Very hard — constantly distracted",s:1},{t:"Frequent interruptions break my focus",s:2},{t:"Generally able to focus",s:3},{t:"Deep, sustained focus most days",s:4}] },
  { key:"behavior", title:"Behavioral Resilience", q:"How would you describe how you react under pressure or criticism at work?",
    options:[{t:"I shut down or react poorly",s:1},{t:"I struggle but eventually recover",s:2},{t:"I stay mostly composed",s:3},{t:"I stay calm and constructive",s:4}] },
  { key:"peerpressure", title:"Peer & Organizational Pressure", q:"How much pressure do you feel from peers, politics, or organizational expectations?",
    options:[{t:"Constant, heavy pressure",s:1},{t:"Frequent pressure, hard to navigate",s:2},{t:"Occasional pressure, manageable",s:3},{t:"Minimal — I navigate it well",s:4}] },
  { key:"projectchallenges", title:"Project Challenges", q:"How well are you handling the complexity and demands of your current projects?",
    options:[{t:"Overwhelmed — falling behind",s:1},{t:"Struggling with scope or resources",s:2},{t:"Handling it, with some strain",s:3},{t:"Confidently on top of it",s:4}] }
];
const FOLLOWUP_PROMPTS = {
  direction:"What's making the direction feel unclear right now?",
  satisfaction:"What's the biggest thing dragging your satisfaction down?",
  growth:"What's been getting in the way of faster growth?",
  leadership:"What would help you feel more ready to lead?",
  resume:"Which part of your resume feels weakest to you?",
  linkedin:"What's stopping you from being more active there?",
  interview:"What part of interviewing worries you most?",
  skills:"Which skill gap concerns you the most right now?",
  workplace:"What's the hardest part of your current environment?",
  obstacles:"What's the biggest obstacle, specifically?",
  goals:"What's making it hard to define your next 3 years?",
  aireadiness:"What's holding you back from using AI tools more?",
  burnout:"What's contributing most to that exhaustion?",
  stress:"What's the biggest source of that stress right now?",
  motivation:"What's pulling your motivation down lately?",
  focus:"What tends to break your focus the most?",
  behavior:"Can you describe a recent moment this showed up?",
  peerpressure:"Where is that pressure coming from most?",
  projectchallenges:"What's the hardest part of the current project load?"
};
let workingCategories = CATEGORIES.slice();
let stepIndex = 0, selectedScore = null, selectedText = '';
let pendingAnswer = null;
const userAnswers = [];
let recognizer = null;
let timerInterval = null, timeLeft = 600;

/* --- adapt question order/wording to the resume upload and stated career stage --- */
function buildAdaptiveCategories(){
  let list = CATEGORIES.map(c=>({...c, options:c.options}));
  if(analyzedAts !== null && analyzedAts < 70){
    const resumeCat = list.find(c=>c.key==='resume');
    const skillsCat = list.find(c=>c.key==='skills');
    list = list.filter(c=>c.key!=='resume' && c.key!=='skills');
    list.unshift(skillsCat);
    list.unshift({...resumeCat, q:`Your uploaded resume scored ${analyzedAts}% on ATS compatibility — how confident are you that it reflects your true impact?`});
  }
  const stage = document.getElementById('careerStage').value;
  if(stage === 'Student' || stage === 'Graduate / Fresher'){
    list = list.map(c=>{
      if(c.key==='leadership') return {...c, q:"How ready do you feel to take initiative or lead small projects early in your career?"};
      if(c.key==='goals') return {...c, q:"How well-defined are your career goals for your first 3 years in the workforce?"};
      return c;
    });
  }
  return list;
}

/* --- infer a score from a spoken answer by matching it against option language --- */
function inferScoreFromTranscript(transcript, options){
  const t = transcript.toLowerCase();
  const STOP = new Set(['the','a','an','and','or','to','of','is','in','on','for','with','my','i','it','that','this','at','as','be','are','very']);
  let best = {score:3, hits:0};
  options.forEach(opt=>{
    const words = opt.t.toLowerCase().replace(/[^a-z0-9\s]/g,'').split(/\s+/).filter(w=>w && !STOP.has(w) && w.length>2);
    const hits = words.filter(w=>t.includes(w)).length;
    if(hits > best.hits){ best = {score:opt.s, hits}; }
  });
  return best.hits>0 ? best.score : 3;
}

function beginAssessment(){
  workingCategories = buildAdaptiveCategories();
  stepIndex = 0; userAnswers.length = 0; pendingAnswer = null; timeLeft = 600;
  go('assess');
  document.getElementById('assessVideoFrame').style.display = chosenTrack==='voice' ? 'block' : 'none';
  document.getElementById('voiceArea').style.display = chosenTrack==='voice' ? 'block' : 'none';
  document.getElementById('mcArea').style.display = chosenTrack==='voice' ? 'none' : 'block';
  if(chosenTrack==='voice' && hwStream) document.getElementById('assessVideo').srcObject = hwStream;
  clearInterval(timerInterval);
  timerInterval = setInterval(()=>{
    timeLeft--; const m=Math.floor(timeLeft/60), s=timeLeft%60;
    document.getElementById('countdown').textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    if(timeLeft<=0){ clearInterval(timerInterval); finishAssessment(); }
  }, 1000);
  coachSay("Alright, let's dive in! We'll walk through twelve quick areas together — there are no wrong answers, so just be honest and take your time.", ()=>renderQuestion());
}
function renderChips(){
  document.getElementById('chipRow').innerHTML = workingCategories.map((c,i)=>
    `<div class="chip ${i===stepIndex?'active':''}">${c.title}</div>`).join('');
}
function renderQuestion(){
  const cat = workingCategories[stepIndex];
  selectedScore = null; selectedText = ''; pendingAnswer = null;
  document.getElementById('qCat').textContent = cat.title;
  document.getElementById('progFill').style.width = `${(stepIndex/workingCategories.length)*100+4}%`;
  document.getElementById('qText').textContent = cat.q;
  document.getElementById('followupBox').style.display = 'none';
  document.getElementById('mainSubmitRow').style.display = 'flex';
  renderChips();
  if(chosenTrack==='mcq'){
    document.getElementById('mcArea').innerHTML = `<div class="mc-list">${cat.options.map((o,i)=>
      `<div class="mc-opt" onclick="selectOpt(this,${i})">${o.t}</div>`).join('')}</div>`;
  } else {
    document.getElementById('liveTranscript').textContent = sttSupported ? 'Listening for your answer…' : 'Speech recognition unavailable — switch to Written mode.';
    document.getElementById('voiceBadge').style.display = 'flex';
    document.getElementById('voiceBadgeText').textContent = 'Reading question aloud…';
  }
  coachSay(cat.q, ()=>{
    if(chosenTrack==='voice'){
      document.getElementById('voiceBadgeText').textContent = 'Listening for your answer…';
      startListening();
    }
  });
}
function selectOpt(el,i){
  document.querySelectorAll('.mc-opt').forEach(o=>o.classList.remove('sel'));
  el.classList.add('sel');
  const cat = workingCategories[stepIndex];
  selectedScore = cat.options[i].s; selectedText = cat.options[i].t;
}
function startListening(){
  if(!sttSupported) return;
  try{
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognizer = new SR(); recognizer.continuous = true; recognizer.interimResults = true;
    recognizer.onresult = e=>{ let text=''; for(let i=0;i<e.results.length;i++) text += e.results[i][0].transcript; document.getElementById('liveTranscript').textContent = text; };
    recognizer.onerror = ()=>{ document.getElementById('liveTranscript').textContent = 'Mic not detected — switch to Written mode.'; };
    recognizer.start();
  }catch(e){}
}
function submitAnswer(){
  const cat = workingCategories[stepIndex];
  let score, text;
  if(chosenTrack==='mcq'){
    if(selectedScore===null){ toast('Pick an option to continue'); return; }
    score = selectedScore; text = selectedText;
  } else {
    const transcript = document.getElementById('liveTranscript').textContent.trim();
    if(!transcript || transcript.length<3 || transcript==='Listening for your answer…' || transcript==='Speech recognition unavailable — switch to Written mode.'){
      toast('Speak your answer to continue, or switch to Written mode.'); return;
    }
    text = transcript;
    score = inferScoreFromTranscript(transcript, cat.options);
    if(recognizer){ try{ recognizer.stop(); }catch(e){} }
  }
  pendingAnswer = { cat: cat.title, key: cat.key, q: cat.q, score, text };
  if(score <= 2){
    document.getElementById('mainSubmitRow').style.display = 'none';
    document.getElementById('followupPrompt').textContent = FOLLOWUP_PROMPTS[cat.key] || "Can you tell me a bit more about that?";
    document.getElementById('followupInput').value = '';
    document.getElementById('followupBox').style.display = 'block';
    coachSay(FOLLOWUP_PROMPTS[cat.key] || "Can you tell me a bit more about that?");
  } else {
    finalizeAnswer(null);
  }
}
document.getElementById('followupSubmit').addEventListener('click', ()=>{
  finalizeAnswer(document.getElementById('followupInput').value.trim());
});
function finalizeAnswer(followUp){
  document.getElementById('followupBox').style.display = 'none';
  document.getElementById('mainSubmitRow').style.display = 'flex';
  userAnswers.push({...pendingAnswer, followUp: followUp || null});
  pendingAnswer = null;
  stepIndex++;
  if(stepIndex >= workingCategories.length){ finishAssessment(); } else { renderQuestion(); }
}
function finishAssessment(){
  clearInterval(timerInterval);
  if(recognizer){ try{ recognizer.stop(); }catch(e){} }
  hideCoach();
  if(hwStream){ hwStream.getTracks().forEach(t=>t.stop()); hwStream=null; }
  go('report');
  compileReport();
}
/* ---- lookup + banding helpers ---- */
const CAT_LABELS = Object.fromEntries(CATEGORIES.map(c=>[c.key,c.title]));
function scoreByKey(key){ const a = userAnswers.find(x=>x.key===key); return a ? a.score : null; }
function pctByKey(key){ const s = scoreByKey(key); return s===null ? null : Math.round((s/4)*100); }
function avgPct(keys){
  const vals = keys.map(pctByKey).filter(v=>v!==null);
  if(!vals.length) return null;
  return Math.round(vals.reduce((a,b)=>a+b,0)/vals.length);
}
function bandFor(pct){
  if(pct===null) return {cls:'med', label:'Not Yet Assessed', tone:'medium'};
  if(pct<40) return {cls:'crit', label:'Critical — Needs Immediate Attention', tone:'critical'};
  if(pct<60) return {cls:'sens', label:'Sensitive — Needs Focused Effort', tone:'sensitive'};
  if(pct<80) return {cls:'med', label:'Medium — On Track With Gaps', tone:'medium'};
  return {cls:'norm', label:'Normal — Strong Footing', tone:'normal'};
}

function compileReport(){
  renderScoreRow('reportScoreRow');
  const atsCircle = document.getElementById('reportAtsCircle');
  if(analyzedAts!==null){
    document.getElementById('reportAtsVal').textContent = analyzedAts+'%';
    document.getElementById('reportAtsMeta').textContent = `Parsed from ${analyzedAtsFile}`;
    atsCircle.style.borderColor = analyzedAts>=75?'var(--good)':(analyzedAts>=50?'var(--accent)':'var(--danger)');
  } else {
    document.getElementById('reportAtsVal').textContent='--';
    document.getElementById('reportAtsMeta').textContent='No resume uploaded for this session.';
    atsCircle.style.borderColor='var(--line)';
  }
  const bars = document.getElementById('competencyBars');
  bars.innerHTML = userAnswers.length ? userAnswers.map(a=>`<div class="bar-row">
    <div class="bar-label"><span>${a.cat}</span><span>${a.score}/4</span></div>
    <div class="bar-track"><div class="bar-fill" style="width:${(a.score/4)*100}%;"></div></div></div>`).join('')
    : `<p style="font-size:12.5px; color:var(--ink-soft);">No diagnostic run yet this session.</p>`;
  document.getElementById('transcriptLogs').innerHTML = userAnswers.length ? userAnswers.map(a=>`<div class="log-item">
    <div class="lc">${a.cat}</div><div class="lq">${a.q}</div><div class="le">"${a.text}"</div>${a.followUp?`<div class="le" style="margin-top:4px;">Follow-up: "${a.followUp}"</div>`:''}</div>`).join('')
    : '';

  renderRatingBand();
  renderWellbeingRadar();
  renderFocusAreas();
  renderStrongAreas();
  renderRoadmap();
  saveHistorySnapshot();
  renderWeeklyTrend();
}

/* ---- overall rating band ---- */
function renderRatingBand(){
  const allKeys = userAnswers.map(a=>a.key).filter(Boolean);
  const overall = avgPct(allKeys.length ? allKeys : []);
  const band = bandFor(overall);
  const el = document.getElementById('ratingBand');
  el.className = 'rating-band ' + band.cls;
  document.getElementById('ratingLabel').textContent = band.label;
  document.getElementById('ratingScoreVal').innerHTML = (overall===null?'--':overall+'%') + '<span>Score</span>';
  const subMap = {
    critical:"Several areas are running low at the same time. Worth addressing soon rather than letting it compound — a focused conversation with a coach can help you triage.",
    sensitive:"A few areas need attention before they become bigger problems. Nothing urgent, but consistent small steps now will pay off.",
    medium:"You're largely on track with specific gaps worth closing. A structured 30/60/90 push should move the needle.",
    normal:"You're in a strong position overall. Focus now on sharpening your edge rather than fixing fundamentals."
  };
  document.getElementById('ratingSub').textContent = overall===null ? 'Run the diagnostic to see your rating.' : subMap[band.tone];
}

/* ---- wellbeing radar: burnout, stress, behavior, motivation, direction, focus ---- */
function renderWellbeingRadar(){
  const axesKeys = ['burnout','stress','behavior','motivation','direction','focus'];
  const defaults = [0.65,0.6,0.7,0.6,0.75,0.6];
  const vals = axesKeys.map((k,i)=>{ const p = pctByKey(k); return p===null ? defaults[i] : p/100; });
  drawWellbeingRadar('radarSvg', vals);
}
function drawWellbeingRadar(id, vals){
  const axes=['Burnout','Stress','Behavior','Motivation','Direction','Focus'];
  const cx=120,cy=108,R=76;
  const pts=arr=>arr.map((v,i)=>{ const a=-Math.PI/2+i*(2*Math.PI/axes.length); return [cx+Math.cos(a)*R*v, cy+Math.sin(a)*R*v]; });
  let svg='';
  [0.25,0.5,0.75,1].forEach(f=>{ const ring=axes.map((_,i)=>{ const a=-Math.PI/2+i*(2*Math.PI/axes.length); return `${cx+Math.cos(a)*R*f},${cy+Math.sin(a)*R*f}`; }).join(' ');
    svg+=`<polygon points="${ring}" fill="none" stroke="var(--line)" stroke-width="1"/>`; });
  axes.forEach((label,i)=>{ const a=-Math.PI/2+i*(2*Math.PI/axes.length); const x2=cx+Math.cos(a)*R,y2=cy+Math.sin(a)*R;
    const lx=cx+Math.cos(a)*(R+22), ly=cy+Math.sin(a)*(R+14);
    svg+=`<line x1="${cx}" y1="${cy}" x2="${x2}" y2="${y2}" stroke="var(--line)" stroke-width="1"/><text x="${lx}" y="${ly}" font-size="8.5" fill="var(--ink-soft)" text-anchor="middle">${label}</text>`; });
  const dataPts = pts(vals).map(p=>p.join(',')).join(' ');
  svg+=`<polygon points="${dataPts}" fill="rgba(227,178,60,0.28)" stroke="#E3B23C" stroke-width="2"/>`;
  pts(vals).forEach(p=>{ svg+=`<circle cx="${p[0]}" cy="${p[1]}" r="2.6" fill="#132A52"/>`; });
  document.getElementById(id).innerHTML = svg;
}

/* ---- key focus areas: resume, interview, peer/org pressure, project challenges ---- */
function renderFocusAreas(){
  const items = [
    {key:'resume', icon:'📄', title:'Resume', desc:'How well your resume reflects your impact'},
    {key:'interview', icon:'🎤', title:'Interview Readiness', desc:'Confidence walking into interviews'},
    {key:'peerpressure', icon:'🧭', title:'Peer / Org Pressure', desc:'Pressure from peers, politics, or expectations'},
    {key:'projectchallenges', icon:'📁', title:'Project Challenges', desc:'How you\'re handling current project load'}
  ];
  const el = document.getElementById('focusAreas');
  const rows = items.map(it=>{
    const pct = pctByKey(it.key);
    const band = bandFor(pct);
    const badgeCls = pct===null || band.cls==='norm' ? 'med' : band.cls;
    return `<div class="focus-item">
      <div class="focus-badge ${badgeCls}">${it.icon}</div>
      <div class="focus-info"><div class="ft">${it.title}</div><div class="fd">${it.desc}</div></div>
      <div class="focus-pct">${pct===null?'—':pct+'%'}</div>
    </div>`;
  }).join('');
  el.innerHTML = rows;
}
function renderStrongAreas(){
  const strong = userAnswers.filter(a=>a.score>=3).map(a=>a.cat);
  const el = document.getElementById('strongAreas');
  el.innerHTML = strong.length ? strong.map(s=>`<span class="strong-chip">✓ ${s}</span>`).join('')
    : `<p style="font-size:12px; color:var(--ink-soft); margin:0;">Complete the diagnostic to surface your strong areas.</p>`;
}

/* ---- 30/60/90 roadmap, built from weakest categories ---- */
function showRoadmapPhase(phase){
  document.querySelectorAll('.roadmap-tab').forEach(t=>t.classList.toggle('active', t.dataset.phase===phase));
  document.querySelectorAll('.roadmap-phase').forEach(p=>p.classList.toggle('active', p.id==='roadmap-'+phase));
}
const ROADMAP_LIBRARY = {
  burnout:{30:'Build in two protected recovery blocks a week — even 30 minutes counts.', 60:'Identify and remove one recurring energy drain from your workload.', 90:'Establish a sustainable weekly rhythm you can hold for the next year.'},
  stress:{30:'Name your top 3 stress triggers and one coping response for each.', 60:'Renegotiate one commitment that\'s consistently overloading you.', 90:'Build a repeatable stress-management routine into your calendar.'},
  motivation:{30:'Reconnect with one piece of work that felt meaningful — do more of it.', 60:'Set one visible, achievable win to rebuild momentum.', 90:'Re-align your role or projects toward what genuinely motivates you.'},
  focus:{30:'Block two deep-work windows a day, notifications off.', 60:'Cut one recurring meeting or distraction that fragments your day.', 90:'Make deep-focus blocks a standing part of your weekly structure.'},
  behavior:{30:'Notice one pressure trigger and practice a pause before reacting.', 60:'Get feedback from a trusted peer on how you show up under stress.', 90:'Build a go-to composure routine for high-pressure moments.'},
  resume:{30:'Rewrite your top 3 bullet points with quantified impact.', 60:'Get your resume reviewed by a coach or trusted peer.', 90:'Tailor 2-3 versions of your resume for different target roles.'},
  interview:{30:'Run one mock interview and record it to review.', 60:'Build a story bank of 6-8 strong STAR examples.', 90:'Do a full mock interview loop with a career coach.'},
  peerpressure:{30:'Identify one relationship or dynamic causing the most friction.', 60:'Set one explicit boundary and communicate it clearly.', 90:'Build a support network that buffers organizational pressure.'},
  projectchallenges:{30:'Break your biggest project into 3 concrete milestones.', 60:'Flag scope or resource gaps to your manager directly.', 90:'Close out or hand off one chronically overloaded project.'},
  direction:{30:'Write one paragraph on where you want to be in 3 years.', 60:'Talk to 2 people already in that direction.', 90:'Draft a concrete 12-month plan toward that direction.'},
  goals:{30:'Turn one vague goal into a specific, measurable target.', 60:'Set milestones and checkpoints for that goal.', 90:'Review progress and recalibrate your goals.'}
};
/* ---- what to focus on at each stage of the roadmap ---- */
const STAGE_FOCUS = {
  30:{icon:'🌱', title:'Days 1–30 · Learn the Fundamentals', desc:'Focus on closing the gap fast — get oriented, fix the quick wins, and start learning in your weakest areas.'},
  60:{icon:'🛠️', title:'Days 31–60 · Practice & Apply', desc:'Focus on putting new skills to work — real tasks, mock scenarios, and feedback from people around you.'},
  90:{icon:'🏆', title:'Days 61–90 · Certify & Showcase', desc:'Focus on locking it in — finish a certification, update your resume or portfolio, and show the proof.'}
};

/* ---- learning channels, matched to the job function chosen at setup, for skill upgrades / learning / certification ---- */
const FUNCTION_LEARNING_CHANNELS = {
  "Engineering & Technology":[
    {icon:'💻', name:'freeCodeCamp', note:'Free, project-based coding courses with shareable certifications.'},
    {icon:'🎓', name:'Coursera — Google / IBM Career Certificates', note:'Structured, industry-recognized technical certificates.'},
    {icon:'▶️', name:'YouTube — Fireship, Traversy Media', note:'Fast, practical walkthroughs of current tools & frameworks.'}],
  "Product & Design":[
    {icon:'🎨', name:'Coursera — Google UX Design Certificate', note:'End-to-end UX/product design fundamentals.'},
    {icon:'📘', name:'LinkedIn Learning — Product Management Paths', note:'Role-specific product & design skill tracks.'},
    {icon:'▶️', name:'YouTube — Design Course, AJ&Smart', note:'Practical design & product-thinking breakdowns.'}],
  "Data & AI":[
    {icon:'🤖', name:'DeepLearning.AI (via Coursera)', note:'Foundational to advanced AI/ML certifications.'},
    {icon:'📊', name:'Kaggle Learn', note:'Free, hands-on data science micro-courses.'},
    {icon:'▶️', name:'YouTube — StatQuest, Krish Naik', note:'Clear explainers on stats, ML & AI concepts.'}],
  "Sales & Business Development":[
    {icon:'📈', name:'HubSpot Academy', note:'Free sales & inbound certifications, widely recognized.'},
    {icon:'📘', name:'LinkedIn Learning — Sales Foundations', note:'Structured pipeline, negotiation & closing skills.'},
    {icon:'▶️', name:'YouTube — Sales Insights Lab', note:'Practical, modern B2B sales technique videos.'}],
  "Marketing & Communications":[
    {icon:'📣', name:'Google Skillshop (Digital Garage)', note:'Free, certified digital marketing fundamentals.'},
    {icon:'✍️', name:'HubSpot Academy — Content & SEO', note:'Content strategy and SEO certifications.'},
    {icon:'▶️', name:'YouTube — Think Media, Neil Patel', note:'Applied, current marketing & content tactics.'}],
  "Finance & Accounting":[
    {icon:'💹', name:'Corporate Finance Institute (CFI)', note:'Practical finance & modeling certifications.'},
    {icon:'🎓', name:'Coursera — Wharton Business Foundations', note:'Core finance & accounting fundamentals.'},
    {icon:'▶️', name:'YouTube — Aswath Damodaran (NYU)', note:'Deep, respected valuation & finance lectures.'}],
  "Human Resources":[
    {icon:'🧑\u200d🤝\u200d🧑', name:'SHRM Learning', note:'Globally recognized HR certification pathways.'},
    {icon:'📘', name:'LinkedIn Learning — HR & People Analytics', note:'Modern HR practice and data-driven people skills.'},
    {icon:'▶️', name:'YouTube — HR Bartender', note:'Practical, day-to-day HR guidance.'}],
  "Operations & Supply Chain":[
    {icon:'📦', name:'ASCM / APICS Certification', note:'The industry-standard supply chain credential.'},
    {icon:'🎓', name:'Coursera — Supply Chain Management', note:'End-to-end operations & logistics fundamentals.'},
    {icon:'▶️', name:'YouTube — Supply Chain Secrets', note:'Applied, real-world operations breakdowns.'}],
  "Customer Support":[
    {icon:'🎧', name:'HubSpot Academy — Customer Service', note:'Free, practical support & service certification.'},
    {icon:'📘', name:'LinkedIn Learning — Customer Service Foundations', note:'Core service & de-escalation skills.'},
    {icon:'▶️', name:'YouTube — Support Driven', note:'Community-sourced support best practices.'}],
  "Legal & Compliance":[
    {icon:'⚖️', name:'Coursera — Legal Studies (Yale / Wesleyan)', note:'Accessible legal & compliance foundations.'},
    {icon:'📘', name:'LinkedIn Learning — Compliance Foundations', note:'Practical regulatory & compliance skill-building.'},
    {icon:'▶️', name:'YouTube — LegalEagle', note:'Approachable breakdowns of legal concepts.'}],
  "Healthcare":[
    {icon:'🩺', name:'Coursera — Healthcare Management (Rice University)', note:'Healthcare systems & management fundamentals.'},
    {icon:'📘', name:'LinkedIn Learning — Healthcare Fundamentals', note:'Role-specific healthcare skill tracks.'},
    {icon:'▶️', name:'YouTube — Reputable clinical & health-org channels', note:'Stay current on practice standards.'}],
  "Education":[
    {icon:'📚', name:'Coursera — Foundations of Teaching', note:'Instructional design & teaching fundamentals.'},
    {icon:'📘', name:'LinkedIn Learning — Instructional Design', note:'Modern curriculum & learning-experience skills.'},
    {icon:'▶️', name:'YouTube — Edutopia', note:'Practical, classroom-tested teaching ideas.'}],
  "Executive & Leadership":[
    {icon:'🧭', name:'Coursera — Leadership (HEC Paris / Michigan)', note:'Strategic leadership & management fundamentals.'},
    {icon:'📘', name:'LinkedIn Learning — Executive Leadership', note:'Communication, influence & team leadership.'},
    {icon:'▶️', name:'YouTube — Harvard Business Review', note:'Sharp, applied leadership case studies.'}]
};
const DEFAULT_LEARNING_CHANNELS = [
  {icon:'📘', name:'LinkedIn Learning', note:'Broad, role-based courses with completion certificates.'},
  {icon:'🎓', name:'Coursera', note:'University- and company-backed courses & certifications.'},
  {icon:'▶️', name:'YouTube', note:'Search your target skill for free, current tutorials.'}
];
const LEARN_STAGE_LABEL = {30:'Skill up', 60:'Learn & practice', 90:'Certify'};

function renderRoadmap(){
  const answered = userAnswers.filter(a=>a.key);
  const weakest = answered.slice().sort((a,b)=>a.score-b.score).slice(0,3);
  const focusList = weakest.length ? weakest : [{key:'direction', cat:'Career Direction & Clarity'}];
  const overall = avgPct(answered.map(a=>a.key));
  const band = bandFor(overall);
  const paceMap = {critical:'This is a critical window — move on these fast and consider getting outside support.', sensitive:'These are worth steady, deliberate attention over the next 90 days.', medium:'Solid, incremental progress here will close most of your gaps.', normal:'Use this window to sharpen strengths rather than fix fundamentals.'};

  const industryVal = (document.getElementById('industry') || {}).value || '';
  const functionVal = (document.getElementById('jobFunction') || {}).value || '';
  const channels = FUNCTION_LEARNING_CHANNELS[functionVal] || DEFAULT_LEARNING_CHANNELS;
  const contextBits = [functionVal, industryVal].filter(Boolean);
  const contextLine = contextBits.length
    ? `Picked for ${contextBits.join(' in ')}, and matched to where your evaluation flagged the biggest gaps — ${focusList.map(f=>f.cat).join(', ')}.`
    : `Matched to where your evaluation flagged the biggest gaps — ${focusList.map(f=>f.cat).join(', ')}. Choose your industry &amp; function in Diagnostic Setup to sharpen these further.`;

  ['30','60','90'].forEach(phase=>{
    const stage = STAGE_FOCUS[phase];
    const tasks = focusList.map((f,i)=>{
      const lib = ROADMAP_LIBRARY[f.key] || {30:`Take one concrete step on ${f.cat}.`,60:`Review progress on ${f.cat}.`,90:`Solidify gains in ${f.cat}.`};
      return `<div class="roadmap-task"><div class="rt-num">${i+1}</div><div class="rt-body"><b>${f.cat}</b><span>${lib[phase]}</span></div></div>`;
    }).join('');
    const learnItems = channels.map(c=>`<div class="learn-item"><div class="li-icon">${c.icon}</div><div class="li-body"><b>${c.name}</b><span>${c.note}</span><div class="li-tag">${LEARN_STAGE_LABEL[phase]}</div></div></div>`).join('');
    document.getElementById('roadmap-'+phase).innerHTML =
      `<div class="roadmap-stage"><div class="rs-title">${stage.icon} ${stage.title}</div><div class="rs-desc">${stage.desc}</div></div>
       <div class="roadmap-goal">${paceMap[band.tone]}</div>
       ${tasks}
       <div class="learn-block"><h4>📡 Learning Channels to Refer</h4><div style="font-size:11px; color:var(--ink-soft); margin:-4px 0 8px;">${contextLine}</div>${learnItems}</div>`;
  });
  showRoadmapPhase('30');
}

/* ---- weekly trend: real history stored per-user in localStorage ---- */
function historyKey(){ return 'w3m_history_' + (currentUser ? currentUser.username : 'guest'); }
function loadHistory(){ try{ return JSON.parse(localStorage.getItem(historyKey())) || []; }catch(e){ return []; } }
function saveHistorySnapshot(){
  const answered = userAnswers.filter(a=>a.key);
  if(!answered.length) return;
  const overall = avgPct(answered.map(a=>a.key));
  const burnout = pctByKey('burnout'), stress = pctByKey('stress'), motivation = pctByKey('motivation');
  const hist = loadHistory();
  hist.push({t: Date.now(), overall, burnout, stress, motivation});
  try{ localStorage.setItem(historyKey(), JSON.stringify(hist.slice(-12))); }catch(e){}
}
function renderWeeklyTrend(){
  let hist = loadHistory();
  if(hist.length < 2){
    // seed a gentle illustrative lead-in so the current point has context, clearly labeled as such
    const last = hist[hist.length-1] || {overall:60, burnout:60, stress:60, motivation:60};
    const seed = [];
    for(let i=3;i>=1;i--){
      seed.push({
        t: last.t - i*7*24*3600*1000,
        overall: Math.max(20, Math.min(95, last.overall - (i*4))),
        burnout: Math.max(20, Math.min(95, (last.burnout||60) - (i*3))),
        stress: Math.max(20, Math.min(95, (last.stress||60) - (i*3))),
        motivation: Math.max(20, Math.min(95, (last.motivation||60) - (i*3)))
      });
    }
    hist = seed.concat(hist);
  }
  const series = [
    {key:'overall', color:'#132A52', label:'Overall'},
    {key:'burnout', color:'#C1543D', label:'Burnout'},
    {key:'stress', color:'#C6932A', label:'Stress'},
    {key:'motivation', color:'#4C8F6B', label:'Motivation'}
  ];
  const W=300,H=150,pad=18;
  const n = hist.length;
  const x = i => pad + (i/(n-1||1))*(W-2*pad);
  const y = v => H-pad - ((v||0)/100)*(H-2*pad);
  let svg = `<line x1="${pad}" y1="${H-pad}" x2="${W-pad}" y2="${H-pad}" stroke="var(--line)"/>`;
  series.forEach(s=>{
    const pts = hist.map((h,i)=>`${x(i)},${y(h[s.key])}`).join(' ');
    svg += `<polyline points="${pts}" fill="none" stroke="${s.color}" stroke-width="2"/>`;
    hist.forEach((h,i)=>{ svg += `<circle cx="${x(i)}" cy="${y(h[s.key])}" r="2.2" fill="${s.color}"/>`; });
  });
  document.getElementById('trendSvg').innerHTML = svg;
  document.getElementById('trendLegend').innerHTML = series.map(s=>`<div class="tl-item"><span class="tl-dot" style="background:${s.color};"></span>${s.label}</div>`).join('');
  const realCount = loadHistory().length;
  document.getElementById('trendNote').textContent = realCount >= 2
    ? `Based on ${realCount} completed diagnostics for this account.`
    : 'Earlier weeks shown are illustrative until you\'ve completed a few diagnostics — the most recent point is your real result.';
}

function restartDiagnostic(){ go('setup'); }

/* ================= PAYMENT (UPI) — must clear before booking ================= */
const PAY_UPI_ID = '9650084311@ptsbi';   // kept out of the visible DOM — only encoded into QR / deep link
const PAY_PAYEE_NAME = 'Neeraj Kapil';
const PAY_AMOUNT = 999; // INR — edit this constant to change the session fee
let paymentCleared = false;

function buildUpiUri(){
  const note = 'W3M Career Coaching Call';
  return `upi://pay?pa=${encodeURIComponent(PAY_UPI_ID)}&pn=${encodeURIComponent(PAY_PAYEE_NAME)}&am=${PAY_AMOUNT}&cu=INR&tn=${encodeURIComponent(note)}`;
}
function renderPaymentScreen(){
  document.getElementById('payAmountVal').textContent = PAY_AMOUNT;
  const uri = buildUpiUri();
  document.getElementById('payQrImg').src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(uri)}`;
  document.getElementById('payConfirmCheck').checked = false;
  document.getElementById('payContinueBtn').disabled = true;
}
function openUpiApp(){
  try{ window.location.href = buildUpiUri(); }
  catch(e){ toast('Open your UPI app and scan the QR instead.'); }
}
function startScheduleFlow(){
  paymentCleared = false;
  go('payment');
  renderPaymentScreen();
}
function completePaymentStep(){
  if(!document.getElementById('payConfirmCheck').checked){ toast('Please confirm your payment first'); return; }
  paymentCleared = true;
  toast('Payment confirmed — pick your slot');
  go('schedule');
}

/* ================= SCHEDULE A CALL WITH NEERAJ ================= */
let scheduleSelectedDay = null, scheduleSelectedSlot = null, scheduleDays = [];
const SLOT_TIMES = ['9:00 AM','10:30 AM','12:00 PM','2:00 PM','3:30 PM','5:00 PM'];
function resetScheduleScreen(){
  if(!paymentCleared){ go('payment'); renderPaymentScreen(); return; }
  scheduleSelectedDay = null; scheduleSelectedSlot = null;
  document.getElementById('scheduleBookingArea').style.display = 'block';
  document.getElementById('scheduleConfirmArea').style.display = 'none';
  document.getElementById('confirmSlotBtn').disabled = true;
  buildScheduleDays();
  renderDayRow();
  renderSlotGrid();
}
function buildScheduleDays(){
  scheduleDays = [];
  const now = new Date();
  for(let i=1; i<=7; i++){
    const d = new Date(now); d.setDate(now.getDate()+i);
    scheduleDays.push(d);
  }
}
function renderDayRow(){
  document.getElementById('dayRow').innerHTML = scheduleDays.map((d,i)=>
    `<div class="day-pill ${i===scheduleSelectedDay?'sel':''}" onclick="selectDay(${i})">
      <div class="dow">${d.toLocaleDateString('en-US',{weekday:'short'})}</div>
      <div class="dnum">${d.getDate()}</div>
    </div>`).join('');
}
function selectDay(i){
  scheduleSelectedDay = i; scheduleSelectedSlot = null;
  document.getElementById('confirmSlotBtn').disabled = true;
  renderDayRow(); renderSlotGrid();
}
function renderSlotGrid(){
  const grid = document.getElementById('slotGrid');
  if(scheduleSelectedDay===null){
    grid.innerHTML = '<p style="font-size:11.5px; color:var(--ink-soft); grid-column:1/-1;">Pick a day above to see Neeraj\'s open times.</p>';
    return;
  }
  const seed = scheduleDays[scheduleSelectedDay].getDate();
  grid.innerHTML = SLOT_TIMES.map((t,i)=>{
    const busy = (seed+i) % 5 === 0;
    return `<button type="button" class="slot-btn ${scheduleSelectedSlot===i?'sel':''}" ${busy?'disabled':''} onclick="selectSlot(${i})">${t}${busy?' · Booked':''}</button>`;
  }).join('');
}
function selectSlot(i){
  scheduleSelectedSlot = i;
  document.getElementById('confirmSlotBtn').disabled = false;
  renderSlotGrid();
}
let lastBookedStart = null, lastBookedEnd = null;
function getBookedEventTimes(){
  if(scheduleSelectedDay===null || scheduleSelectedSlot===null) return null;
  const d = new Date(scheduleDays[scheduleSelectedDay]);
  const [time, ampm] = SLOT_TIMES[scheduleSelectedSlot].split(' ');
  let [hh,mm] = time.split(':').map(Number);
  if(ampm==='PM' && hh!==12) hh += 12;
  if(ampm==='AM' && hh===12) hh = 0;
  d.setHours(hh, mm, 0, 0);
  const end = new Date(d.getTime() + 30*60000);
  return {start:d, end};
}
function confirmSchedule(){
  if(!paymentCleared){ toast('Please complete payment first'); go('payment'); renderPaymentScreen(); return; }
  if(scheduleSelectedDay===null || scheduleSelectedSlot===null){ toast('Pick a day and time first'); return; }
  const times = getBookedEventTimes();
  lastBookedStart = times.start; lastBookedEnd = times.end;
  const d = scheduleDays[scheduleSelectedDay];
  const dateStr = d.toLocaleDateString('en-US',{weekday:'long', month:'long', day:'numeric'});
  const timeStr = SLOT_TIMES[scheduleSelectedSlot];
  document.getElementById('confirmSummary').textContent = `${dateStr} at ${timeStr} with Neeraj Kapil`;
  document.getElementById('scheduleBookingArea').style.display = 'none';
  document.getElementById('scheduleConfirmArea').style.display = 'block';
  toast('Call scheduled with Neeraj');
}
function downloadIcs(){
  if(!lastBookedStart || !lastBookedEnd) return;
  const fmt = dt => dt.toISOString().replace(/[-:]/g,'').split('.')[0]+'Z';
  const ics = ['BEGIN:VCALENDAR','VERSION:2.0','BEGIN:VEVENT',
    'SUMMARY:Career Call with Neeraj Kapil',
    `DTSTART:${fmt(lastBookedStart)}`, `DTEND:${fmt(lastBookedEnd)}`,
    'DESCRIPTION:Career coaching call booked via W3M. Paid session — confirmed via UPI.',
    'ATTENDEE;CN=Neeraj Kapil:mailto:recreationeeraj@gmail.com',
    'END:VEVENT','END:VCALENDAR'].join('\r\n');
  try{
    const blob = new Blob([ics], {type:'text/calendar'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'neeraj-call.ics'; a.click();
    URL.revokeObjectURL(url);
  }catch(e){ toast('Could not generate calendar file in this browser.'); }
}
function addToGoogleCalendar(){
  if(!lastBookedStart || !lastBookedEnd){ toast('Book a slot first'); return; }
  const fmt = dt => dt.toISOString().replace(/[-:]/g,'').split('.')[0]+'Z';
  const params = new URLSearchParams({
    action:'TEMPLATE',
    text:'Career Call with Neeraj Kapil',
    dates:`${fmt(lastBookedStart)}/${fmt(lastBookedEnd)}`,
    details:'Paid 1:1 career coaching call booked via W3M. Confirmed via UPI payment.',
    add:'recreationeeraj@gmail.com'
  });
  window.open(`https://calendar.google.com/calendar/render?${params.toString()}`, '_blank');
}

/* ================= AUTO DEMO — guided, hands-free walkthrough ================= */
let demoActive = false;
let demoCurrentStep = 0, demoTotalSteps = 0;
let demoSkipResolve = null, demoStepTimeoutId = null;
const DEMO_PROFILE = {name:'Ava Demo', email:'ava.demo@w3me.in', username:'autodemo', password:'demo', role:'Product Manager', location:'Bengaluru, IN'};

function demoWait(ms){
  return new Promise(resolve=>{
    demoSkipResolve = resolve;
    demoStepTimeoutId = setTimeout(()=>{ demoSkipResolve = null; resolve(); }, ms);
  });
}
function demoSkipStep(){
  if(demoStepTimeoutId){ clearTimeout(demoStepTimeoutId); demoStepTimeoutId = null; }
  if(demoSkipResolve){ const r = demoSkipResolve; demoSkipResolve = null; r(); }
}
function demoPause(ms){ return new Promise(resolve=>setTimeout(resolve, ms)); }
function setDemoCaption(text){ document.getElementById('demoCaptionText').textContent = text; }
function updateDemoProgress(){
  const pct = demoTotalSteps ? Math.round(((demoCurrentStep+1)/demoTotalSteps)*100) : 0;
  document.getElementById('demoProgressFill').style.width = pct + '%';
}

async function demoSimulateResumeUpload(){
  try{
    const file = new File(["Ava Demo — Product Manager, 8 years experience, led 3 launches."], "ava-demo-resume.pdf", {type:"application/pdf"});
    handleResumeUpload(file);
  }catch(e){}
}
async function demoRunAssessment(){
  await demoPause(300);
  const liveCount = Math.min(3, workingCategories.length);
  for(let i=0; i<workingCategories.length; i++){
    if(!demoActive) return;
    const cat = workingCategories[stepIndex];
    if(!cat) break;
    const isLive = i < liveCount;
    const idx = i===1 ? 0 : Math.min(2 + (i%2), 3); // one deliberately low answer to showcase the follow-up prompt
    try{
      if(isLive){
        setDemoCaption(`Answering: "${cat.title}"…`);
        const optEls = document.querySelectorAll('#mcArea .mc-opt');
        if(optEls[idx]) selectOpt(optEls[idx], idx);
        else { selectedScore = cat.options[idx].s; selectedText = cat.options[idx].t; }
        await demoPause(700);
      } else {
        selectedScore = cat.options[idx].s; selectedText = cat.options[idx].t;
      }
      submitAnswer();
      if(!demoActive) return;
      if(document.getElementById('followupBox').style.display === 'block'){
        await demoPause(isLive ? 500 : 60);
        const note = "Trying to work through this — it's been a recurring challenge lately.";
        document.getElementById('followupInput').value = note;
        finalizeAnswer(note);
      }
      await demoPause(isLive ? 550 : 50);
    }catch(e){ break; }
  }
}
async function demoPickSlot(){
  try{
    selectDay(0);
    await demoPause(450);
    const slotBtns = Array.from(document.querySelectorAll('#slotGrid .slot-btn'));
    let idx = slotBtns.findIndex(b=>!b.disabled);
    if(idx < 0) idx = 0;
    selectSlot(idx);
    await demoPause(450);
  }catch(e){}
}

function buildDemoSteps(){
  return [
    { caption:"This is W3M — an AI-powered career diagnostic. Sit back, this runs itself.", duration:2400,
      run: async()=>{ go('entry'); } },
    { caption:"Every session opens with a short, plain-language consent screen.", duration:2000,
      run: async()=>{ go('consent'); } },
    { caption:"Consent given. Sign-in supports Google, Microsoft, biometric, or a classic account.", duration:2200,
      run: async()=>{ const cb=document.getElementById('consentBox'); if(cb){ cb.checked=true; } document.getElementById('consentContinue').disabled=false; await demoPause(500); go('signon'); } },
    { caption:"Signing in with a demo profile…", duration:2000,
      run: async()=>{ loginAs(DEMO_PROFILE); } },
    { caption:"Home dashboard — burnout, role match, happiness, leadership and stability at a glance.", duration:3000,
      run: async()=>{ go('home'); } },
    { caption:"Starting a new diagnostic. Career stage, industry, and skills sharpen the AI's questions.", duration:2200,
      run: async()=>{ go('setup'); } },
    { caption:"Uploading a resume gives instant ATS scoring and feedback.", duration:2600,
      run: async()=>{ await demoSimulateResumeUpload(); } },
    { caption:"Consent confirmed — continuing to response mode.", duration:1800,
      run: async()=>{ const cc=document.getElementById('consentCheck'); if(cc) cc.checked=true; document.getElementById('setupContinue').disabled=false; await demoPause(500); continueFromSetup(); } },
    { caption:"There's a Video Interview mode too — camera + mic, so you can just talk it through.", duration:2600,
      run: async()=>{ selectTrack('voice'); await demoPause(600); go('hardware'); await requestHardware(); } },
    { caption:"Camera & mic ready — and Neeraj's voice narrates every step of the journey, not just here.", duration:2800,
      run: async()=>{ await demoPause(400); } },
    { caption:"Switching to Written mode for this run-through — Voice/Video works exactly the same way.", duration:2200,
      run: async()=>{ try{ if(hwStream){ hwStream.getTracks().forEach(t=>t.stop()); hwStream=null; } }catch(e){} go('track'); selectTrack('mcq'); await demoPause(600); continueFromTrack(); } },
    { caption:"Neeraj, the AI coach, walks through each question — here are a few, answered live.", duration:400,
      run: async()=>{ await demoRunAssessment(); } },
    { caption:"Diagnostic complete — generating the full report now.", duration:1600, run: async()=>{} },
    { caption:"An overall situation rating — Critical, Sensitive, Medium, or Normal — flags how urgently to act.", duration:2800,
      run: async()=>{ document.getElementById('ratingBand')?.scrollIntoView({behavior:'smooth', block:'center'}); } },
    { caption:"A wellbeing radar covering burnout, stress, behavior, motivation, direction and focus.", duration:2800,
      run: async()=>{ document.getElementById('radarSvg')?.scrollIntoView({behavior:'smooth', block:'center'}); } },
    { caption:"Key areas to work on — resume, interview readiness, peer/org pressure, project load.", duration:2800,
      run: async()=>{ document.getElementById('focusAreas')?.scrollIntoView({behavior:'smooth', block:'center'}); } },
    { caption:"A 30/60/90-day roadmap, auto-built from the weakest areas.", duration:2800,
      run: async()=>{ document.querySelector('.roadmap-tabs')?.scrollIntoView({behavior:'smooth', block:'center'}); } },
    { caption:"Ready for a coach? Booking a paid call with Neeraj starts right from the report.", duration:2200,
      run: async()=>{ document.getElementById('screen-report')?.querySelector('.btn-gold')?.scrollIntoView({behavior:'smooth', block:'center'}); } },
    { caption:"Every booking is secured with UPI payment first — scan the QR or pay in-app.", duration:2800,
      run: async()=>{ startScheduleFlow(); } },
    { caption:"Simulating a completed payment…", duration:1600,
      run: async()=>{ const pc=document.getElementById('payConfirmCheck'); if(pc) pc.checked=true; document.getElementById('payContinueBtn').disabled=false; } },
    { caption:"Payment confirmed — now picking an open day and time.", duration:2600,
      run: async()=>{ completePaymentStep(); await demoPause(500); await demoPickSlot(); } },
    { caption:"Call booked — a real Google Calendar invite goes out in one tap, plus a downloadable .ics.", duration:3200,
      run: async()=>{ confirmSchedule(); } },
    { caption:"That's the full W3M journey, start to finish. Explore freely, or run the demo again anytime.", duration:3800,
      run: async()=>{} }
  ];
}

async function runAutoDemoSequence(){
  const steps = buildDemoSteps();
  demoTotalSteps = steps.length;
  for(let i=0; i<steps.length; i++){
    if(!demoActive) return;
    demoCurrentStep = i;
    updateDemoProgress();
    setDemoCaption(steps[i].caption);
    try{ await steps[i].run(); }catch(e){}
    if(!demoActive) return;
    await demoWait(steps[i].duration || 2200);
  }
  if(demoActive) finishAutoDemo();
}
function startAutoDemo(){
  if(demoActive) return;
  demoActive = true;
  demoCurrentStep = 0;
  document.getElementById('demoOverlay').classList.add('active');
  runAutoDemoSequence();
}
function finishAutoDemo(){
  demoActive = false;
  document.getElementById('demoOverlay').classList.remove('active');
  toast('Demo finished — feel free to explore');
}
function exitAutoDemo(){
  demoActive = false;
  demoSkipStep();
  document.getElementById('demoOverlay').classList.remove('active');
  clearInterval(timerInterval);
  if(recognizer){ try{ recognizer.stop(); }catch(e){} }
  hideCoach();
  paymentCleared = false;
  currentUser = null;
  try{ localStorage.removeItem('w3m_session'); }catch(e){}
  go('entry');
  toast('Demo ended');
}
