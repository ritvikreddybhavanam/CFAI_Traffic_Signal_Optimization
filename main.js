// ===== HERO CANVAS =====
const heroCanvas = document.getElementById('heroCanvas');
const hCtx = heroCanvas.getContext('2d');
let heroW, heroH;

function resizeHero() {
  heroW = heroCanvas.width = heroCanvas.offsetWidth;
  heroH = heroCanvas.height = heroCanvas.offsetHeight;
}
window.addEventListener('resize', resizeHero);
resizeHero();

// Animated road grid in hero
const roads = [];
for(let i=0;i<8;i++){
  roads.push({x: Math.random()*heroW, y: heroH, vx:(Math.random()-0.5)*0.5, vy:-1-Math.random()*1.5, alpha:Math.random()});
}
const particles = [];
for(let i=0;i<60;i++){
  particles.push({x:Math.random()*heroW, y:Math.random()*heroH, r:Math.random()*1.5+0.5, vx:(Math.random()-0.5)*0.3, vy:(Math.random()-0.5)*0.3, alpha:Math.random()*0.5+0.1});
}

function drawHero() {
  hCtx.clearRect(0,0,heroW,heroH);
  // dark gradient bg
  const grad = hCtx.createRadialGradient(heroW/2,heroH/2,0,heroW/2,heroH/2,heroW*0.7);
  grad.addColorStop(0,'rgba(10,20,50,0.9)');
  grad.addColorStop(1,'rgba(5,8,16,0.98)');
  hCtx.fillStyle = grad;
  hCtx.fillRect(0,0,heroW,heroH);

  // Moving road lights
  roads.forEach(r => {
    hCtx.beginPath();
    hCtx.arc(r.x, r.y, 2, 0, Math.PI*2);
    hCtx.fillStyle = `rgba(0,229,255,${r.alpha*0.7})`;
    hCtx.fill();
    r.x += r.vx; r.y += r.vy;
    if(r.y < -10){ r.y=heroH; r.x=Math.random()*heroW; }
  });

  // Particles
  particles.forEach(p => {
    hCtx.beginPath();
    hCtx.arc(p.x, p.y, p.r, 0, Math.PI*2);
    hCtx.fillStyle = `rgba(0,255,136,${p.alpha})`;
    hCtx.fill();
    p.x += p.vx; p.y += p.vy;
    if(p.x<0) p.x=heroW; if(p.x>heroW) p.x=0;
    if(p.y<0) p.y=heroH; if(p.y>heroH) p.y=0;
  });

  // Intersection lines
  const cx=heroW/2, cy=heroH/2;
  const t = Date.now()*0.001;
  hCtx.save();
  hCtx.globalAlpha = 0.12 + 0.04*Math.sin(t);
  hCtx.strokeStyle = '#00e5ff';
  hCtx.lineWidth = 2;
  // vertical road
  hCtx.strokeRect(cx-60, cy-60, 120, 120);
  hCtx.beginPath(); hCtx.moveTo(cx,0); hCtx.lineTo(cx,heroH); hCtx.stroke();
  hCtx.beginPath(); hCtx.moveTo(0,cy); hCtx.lineTo(heroW,cy); hCtx.stroke();
  hCtx.restore();

  requestAnimationFrame(drawHero);
}
drawHero();

// ===== SIMULATION STATE =====
const roads_data = {
  north: { vehicles: 0, wait: 0, queue: 0, signal: 'red', countdown: 0 },
  south: { vehicles: 0, wait: 0, queue: 0, signal: 'red', countdown: 0 },
  east:  { vehicles: 0, wait: 0, queue: 0, signal: 'red', countdown: 0 },
  west:  { vehicles: 0, wait: 0, queue: 0, signal: 'red', countdown: 0 }
};
const roadKeys = ['north','south','east','west'];
let simRunning = false;
let activeRoad = null;
let minGreenTimer = 0;
let simTime = 0;
let signalChanges = 0;
let vehiclesProcessed = 0;
let totalWait = 0;
let waitSamples = 0;
let cycles = 0;
let emergencyActive = false;
let flowStep = -1;
let simInterval, countdownInterval;

// Chart data
const chartLabels = [];
const chartDataSets = { north:[], south:[], east:[], west:[] };
const waitDataSets = { north:[], south:[], east:[], west:[] };
let vehicleChart, waitChart;

// ===== MINI CHARTS =====
function initCharts() {
  // Simple canvas bar charts — no Chart.js, pure canvas
}

function drawMiniChart(canvasId, datasets, colors, maxVal) {
  const canvas = document.getElementById(canvasId);
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width = canvas.offsetWidth;
  const H = canvas.height = 130;
  ctx.clearRect(0,0,W,H);

  // Background
  ctx.fillStyle = 'transparent';
  ctx.fillRect(0,0,W,H);

  // Grid lines
  ctx.strokeStyle = 'rgba(30,45,80,0.6)';
  ctx.lineWidth = 1;
  for(let i=0;i<=4;i++){
    const y = H - (i/4)*H;
    ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke();
  }

  const pts = datasets[roadKeys[0]].length;
  if(pts < 2) return;

  const roadColors = ['#00e5ff','#00ff88','#ffb300','#ff3d57'];
  roadKeys.forEach((rk, ri) => {
    const data = datasets[rk];
    if(data.length < 2) return;
    const n = Math.min(data.length, 20);
    const slice = data.slice(-n);
    ctx.beginPath();
    slice.forEach((v,i) => {
      const x = (i/(n-1))*W;
      const y = H - (v/maxVal)*H*0.9 - 6;
      i===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
    });
    ctx.strokeStyle = roadColors[ri];
    ctx.lineWidth = 2;
    ctx.stroke();

    // last dot
    const lv = slice[slice.length-1];
    const lx = W;
    const ly = H - (lv/maxVal)*H*0.9 - 6;
    ctx.beginPath();
    ctx.arc(lx-1, ly, 3, 0, Math.PI*2);
    ctx.fillStyle = roadColors[ri];
    ctx.fill();
  });

  // Legend
  roadKeys.forEach((rk,ri) => {
    ctx.fillStyle = roadColors[ri];
    ctx.fillRect(8 + ri*55, H-18, 8, 8);
    ctx.fillStyle = 'rgba(140,163,200,0.9)';
    ctx.font = '9px monospace';
    ctx.fillText(rk[0].toUpperCase()+rk.slice(1), 20+ri*55, H-11);
  });
}

// ===== LOG =====
function addLog(msg, cls='') {
  const log = document.getElementById('simLog');
  const mins = String(Math.floor(simTime/60)).padStart(2,'0');
  const secs = String(simTime%60).padStart(2,'0');
  const entry = document.createElement('div');
  entry.className = 'log-entry';
  entry.innerHTML = `<span class="log-time">[${mins}:${secs}]</span><span class="log-event ${cls}">${msg}</span>`;
  log.appendChild(entry);
  log.scrollTop = log.scrollHeight;
  if(log.children.length > 50) log.removeChild(log.firstChild);
}

// ===== SIGNAL UPDATE =====
function setSignal(road, state) {
  ['r','y','g'].forEach(l => document.getElementById(`sl-${road}-${l}`).classList.remove('on'));
  const su = document.getElementById(`su-${road}`);
  su.classList.remove('green-active','red-active');
  document.getElementById(`sig-${road}`).setAttribute('fill','#0d1020');

  if(state==='green'){
    document.getElementById(`sl-${road}-g`).classList.add('on');
    su.classList.add('green-active');
    document.getElementById(`sig-${road}`).setAttribute('fill','var(--signal-green)');
  } else if(state==='yellow'){
    document.getElementById(`sl-${road}-y`).classList.add('on');
    document.getElementById(`sig-${road}`).setAttribute('fill','var(--signal-yellow)');
  } else {
    document.getElementById(`sl-${road}-r`).classList.add('on');
    su.classList.add('red-active');
    document.getElementById(`sig-${road}`).setAttribute('fill','var(--signal-red)');
  }
}

function updateSignalCountdown(road, val) {
  document.getElementById(`sc-${road}`).textContent = val>0 ? val+'s' : '--';
}

// ===== INTERSECTION CARDS =====
function updateRoadCard(road) {
  const d = roads_data[road];
  document.getElementById(`${road[0]}-veh`).textContent = d.vehicles;
  document.getElementById(`${road[0]}-wait`).textContent = d.wait + 's';
  document.getElementById(`${road[0]}-queue`).textContent = d.queue;
  document.getElementById(`${road[0]}-density`).style.width = Math.min(100,(d.vehicles/50)*100)+'%';

  const card = document.getElementById(`card-${road}`);
  card.classList.toggle('active-road', road === activeRoad);
}

// ===== PRIORITY CALCULATION =====
function calcPriority(road) {
  const d = roads_data[road];
  let score = d.vehicles * 2 + d.wait * 0.5;
  if(d.wait > 90) score += 20; // waiting time bonus
  return Math.round(score*10)/10;
}

function updatePriorityTable() {
  const scores = {};
  roadKeys.forEach(r => { scores[r] = calcPriority(r); });
  const maxScore = Math.max(...Object.values(scores));
  const tbody = document.getElementById('priorityBody');
  tbody.innerHTML = '';
  roadKeys.forEach(r => {
    const d = roads_data[r];
    const score = scores[r];
    const isHighest = score === maxScore;
    const tr = document.createElement('tr');
    if(isHighest) tr.className = 'highest';
    const badge = isHighest ? '<span class="priority-badge high">HIGHEST</span>' :
      score > maxScore*0.6 ? '<span class="priority-badge med">MEDIUM</span>' :
      '<span class="priority-badge low">LOW</span>';
    tr.innerHTML = `
      <td>${r[0].toUpperCase()+r.slice(1)}</td>
      <td>${d.vehicles}</td>
      <td>${d.wait}</td>
      <td>${d.queue}</td>
      <td style="font-family:var(--font-mono);font-weight:700;color:${isHighest?'var(--accent-green)':'var(--text-primary)'};">${score}</td>
      <td>${badge}</td>`;
    tbody.appendChild(tr);
  });
}

// ===== RULE ENGINE =====
function resetRuleHighlights() {
  ['emergency','maxtraffic','waittime','mingreen'].forEach(r => {
    document.getElementById(`rule-${r}`).classList.remove('triggered');
    document.getElementById(`rs-${r}`).className = 'rule-status rule-idle';
    document.getElementById(`rs-${r}`).textContent = '● STANDBY';
  });
}

function triggerRule(ruleId, label) {
  resetRuleHighlights();
  document.getElementById(`rule-${ruleId}`).classList.add('triggered');
  const el = document.getElementById(`rs-${ruleId}`);
  el.className = 'rule-status rule-active';
  el.textContent = '◉ ACTIVE';
  document.getElementById('triggered-rule').textContent = label;
}

// ===== FLOWCHART ANIMATION =====
function animateFlow(step) {
  for(let i=0;i<6;i++){
    document.getElementById(`fs${i}`).classList.remove('active-step');
    if(i<5) document.getElementById(`fa${i}`).classList.remove('active-arrow');
  }
  document.getElementById(`fs${step}`).classList.add('active-step');
  if(step>0) document.getElementById(`fa${step-1}`).classList.add('active-arrow');
}

// ===== MAIN SIMULATION CYCLE =====
function simCycle() {
  simTime++;
  cycles++;

  // Animate flowchart step 0 → 1
  animateFlow(0);
  setTimeout(()=>animateFlow(1),300);
  setTimeout(()=>animateFlow(2),600);
  setTimeout(()=>animateFlow(3),900);
  setTimeout(()=>animateFlow(4),1200);
  setTimeout(()=>animateFlow(5),1500);

  // Update random traffic values
  roadKeys.forEach(r => {
    const d = roads_data[r];
    d.vehicles = Math.floor(Math.random()*51);
    d.wait = r === activeRoad ? Math.max(0, d.wait - 10) : d.wait + Math.floor(Math.random()*8)+2;
    d.wait = Math.min(d.wait, 120);
    d.queue = Math.floor(d.vehicles * 0.4 + Math.random()*5);
    updateRoadCard(r);

    // Chart data
    chartDataSets[r].push(d.vehicles);
    waitDataSets[r].push(d.wait);
  });

  // Rule evaluation
  let newActive = null;
  let rule = '';

  // R1: Emergency override
  if(emergencyActive) {
    const emergRoad = roadKeys[Math.floor(Math.random()*4)];
    newActive = emergRoad;
    rule = 'Emergency Override (R1)';
    triggerRule('emergency', rule);
    addLog(`🚨 Emergency override → ${newActive.toUpperCase()} gets green`, 'log-rule');
    setTimeout(()=>{ emergencyActive=false; }, 8000);
  }
  // R4: Min green time
  else if(minGreenTimer > 0) {
    newActive = activeRoad;
    rule = 'Minimum Green Time (R4)';
    triggerRule('mingreen', rule);
    minGreenTimer--;
  }
  // R3: Waiting time check
  else {
    let waitBonus = null;
    roadKeys.forEach(r => {
      if(roads_data[r].wait > 90) waitBonus = r;
    });
    if(waitBonus) {
      newActive = waitBonus;
      rule = 'Waiting Time Rule (R3)';
      triggerRule('waittime', rule);
      addLog(`⏱ Waiting rule triggered → ${waitBonus.toUpperCase()} (${roads_data[waitBonus].wait}s wait)`, 'log-rule');
    } else {
      // R2: Max traffic
      let maxV = -1;
      roadKeys.forEach(r => {
        const s = calcPriority(r);
        if(s > maxV){ maxV=s; newActive=r; }
      });
      rule = 'Maximum Traffic (R2)';
      triggerRule('maxtraffic', rule);
    }
  }

  // Signal change
  if(newActive !== activeRoad) {
    signalChanges++;
    if(activeRoad) setSignal(activeRoad, 'red');
    activeRoad = newActive;
    minGreenTimer = 3; // 3 cycles minimum
    addLog(`🟢 Green → ${activeRoad.toUpperCase()} (${calcPriority(activeRoad)} pts) [${rule}]`, 'log-green');
  }

  roadKeys.forEach(r => setSignal(r, r===activeRoad?'green':'red'));

  // Countdown update
  roadKeys.forEach(r => {
    if(r===activeRoad) roads_data[r].countdown = minGreenTimer*4+8;
    else roads_data[r].countdown = 0;
    updateSignalCountdown(r, roads_data[r].countdown);
  });

  // Metrics
  vehiclesProcessed += roads_data[activeRoad]?.vehicles || 0;
  totalWait += roadKeys.reduce((s,r)=>s+roads_data[r].wait,0)/4;
  waitSamples++;

  updatePriorityTable();
  updateMetrics();
  drawMiniChart('vehicleChart', chartDataSets, null, 50);
  drawMiniChart('waitChart', waitDataSets, null, 120);
}

// ===== METRICS =====
function updateMetrics() {
  const avgW = waitSamples > 0 ? Math.round(totalWait/waitSamples) : 0;
  document.getElementById('m-avgwait').textContent = avgW+'s';
  document.getElementById('m-avgwait-t').textContent = avgW < 45 ? '↓ Good' : '↑ High';
  document.getElementById('m-avgwait-t').className = 'metric-trend' + (avgW < 45 ? '' : ' bad');

  document.getElementById('m-processed').textContent = vehiclesProcessed;
  document.getElementById('m-processed-t').textContent = '↑ Running';

  document.getElementById('m-changes').textContent = signalChanges;
  document.getElementById('m-changes-t').textContent = `Eff: ${signalChanges > 0 ? Math.round(vehiclesProcessed/signalChanges) : 0} veh/change`;

  const maxVeh = Math.max(...roadKeys.map(r=>roads_data[r].vehicles));
  const congestion = maxVeh > 40 ? 'CRITICAL' : maxVeh > 25 ? 'HIGH' : maxVeh > 15 ? 'MODERATE' : 'LOW';
  document.getElementById('m-congestion').textContent = congestion;
  document.getElementById('m-congestion-t').textContent = `Max road: ${maxVeh} vehicles`;
  document.getElementById('m-congestion-t').className = 'metric-trend' + (maxVeh > 35 ? ' bad' : '');

  document.getElementById('m-cycles').textContent = cycles;
  document.getElementById('m-cycles-t').textContent = `${simTime}s elapsed`;

  const efficiency = Math.max(0, Math.min(100, Math.round(100 - avgW/1.2)));
  document.getElementById('m-efficiency').textContent = efficiency+'%';
  document.getElementById('m-efficiency-t').textContent = efficiency > 70 ? '↑ Optimal' : '↓ Improving';
  document.getElementById('m-efficiency-t').className = 'metric-trend' + (efficiency < 60 ? ' bad' : '');
}

// ===== START SIMULATION =====
function startSimulation() {
  if(simRunning) return;
  simRunning = true;
  document.getElementById('nav-status-text').textContent = 'SIM RUNNING';
  addLog('🚦 Simulation started. Rule engine active.', 'log-green');

  // Initial signal states
  roadKeys.forEach(r => setSignal(r,'red'));

  simInterval = setInterval(simCycle, 3500);
  simCycle(); // immediate first cycle

  document.querySelector('.btn-primary').textContent = '⏸ Running...';
  document.querySelector('.btn-primary').disabled = true;
  document.querySelector('.btn-primary').style.opacity = '0.7';
}

// ===== EMERGENCY TRIGGER =====
function triggerEmergency() {
  emergencyActive = true;
  const anim = document.getElementById('ambulanceAnim');
  const notif = document.getElementById('emergencyNotif');
  anim.style.display = 'block';
  notif.style.display = 'block';
  addLog('🚨 EMERGENCY VEHICLE DETECTED — Override initiated', 'log-rule');

  setTimeout(()=>{
    anim.style.display = 'none';
    notif.style.display = 'none';
  }, 6000);

  if(!simRunning) startSimulation();
}

// ===== INITIAL SIGNAL SETUP =====
window.addEventListener('load', ()=>{
  roadKeys.forEach(r => setSignal(r,'red'));
  updatePriorityTable();
  drawMiniChart('vehicleChart', chartDataSets, null, 50);
  drawMiniChart('waitChart', waitDataSets, null, 120);
});

window.addEventListener('resize', ()=>{
  resizeHero();
  drawMiniChart('vehicleChart', chartDataSets, null, 50);
  drawMiniChart('waitChart', waitDataSets, null, 120);
});