'use strict';
// Fern & Fossil: configuration and object types are separate to make expansions easier.
const CONFIG = Object.freeze({width:900,height:500,duration:45,startLives:3,playerSpeed:390,spawnEvery:0.85,levelEvery:7});
// Question bank can be expanded for future levels and age groups.
const QUESTIONS = [
  {question:'How did most ferns reproduce?',options:['By spores','By dinosaur eggs','By seashells'],answer:0,fact:'Ferns reproduce using spores instead of flowers and seeds.'},
  {question:'What does herbivore mean?',options:['An animal that eats only rocks','An animal that eats plants','An animal that hunts other animals'],answer:1,fact:'Herbivores eat plants. Many long-necked dinosaurs were herbivores.'},
  {question:'What do paleontologists study?',options:['Fossils and ancient life','Tomorrow’s weather','Modern computer programs'],answer:0,fact:'Paleontologists use fossils to learn about organisms that lived long ago.'},
  {question:'Which of these could become a fossil?',options:['A footprint in mud','A sunbeam','The wind'],answer:0,fact:'Trace fossils can preserve evidence such as footprints and burrows.'},
  {question:'Which era included the non-bird dinosaurs?',options:['The Mesozoic Era','The current day only','The Ice Age only'],answer:0,fact:'Dinosaurs lived during the Triassic, Jurassic, and Cretaceous periods of the Mesozoic Era.'},
  {question:'Why were prehistoric plants important to plant-eating dinosaurs?',options:['They supplied food and energy','They made all dinosaurs fly','They stopped the rain'],answer:0,fact:'Plants formed the base of food webs that supported many prehistoric animals.'},
  {question:'What is an ecosystem?',options:['A community of living things and their environment','One dinosaur tooth','A type of rock only'],answer:0,fact:'Ecosystems include living organisms interacting with water, air, soil, and other surroundings.'},
  {question:'Which animal is a dinosaur?',options:['Triceratops','Pteranodon','Mosasaurus'],answer:0,fact:'Triceratops was a dinosaur. Pteranodon was a flying reptile and Mosasaurus was a marine reptile.'}
];
const TYPES = Object.freeze({fern:{weight:0.76,points:1},rock:{weight:0.24,damage:1}});
// Dinosaur discoveries are kept in one data array so new journal pages are easy to add.
const FOSSILS = [
  {
    id: 'triceratops', name: 'Triceratops', icon: '🦕', period: 'Late Cretaceous',
    diet: 'Herbivore', clue: 'A three-horned dinosaur',
    fact: 'Triceratops had three facial horns and a large bony frill. Its beak helped it crop plants.'
  },
  {
    id: 'stegosaurus', name: 'Stegosaurus', icon: '🌿', period: 'Late Jurassic',
    diet: 'Herbivore', clue: 'Plates along its back',
    fact: 'Stegosaurus had a row of plates along its back and spikes on its tail for defense.'
  },
  {
    id: 'brachiosaurus', name: 'Brachiosaurus', icon: '🌳', period: 'Late Jurassic',
    diet: 'Herbivore', clue: 'A towering long-necked dinosaur',
    fact: 'Brachiosaurus had longer front legs than back legs, giving its body a high-shouldered shape.'
  },
  {
    id: 'ankylosaurus', name: 'Ankylosaurus', icon: '🪨', period: 'Late Cretaceous',
    diet: 'Herbivore', clue: 'Armored from head to tail',
    fact: 'Ankylosaurus was protected by bony armor and had a heavy club at the end of its tail.'
  },
  {
    id: 'parasaurolophus', name: 'Parasaurolophus', icon: '🍃', period: 'Late Cretaceous',
    diet: 'Herbivore', clue: 'A long curved head crest',
    fact: 'Parasaurolophus had a long, hollow crest. Scientists think the crest may have helped it make sounds.'
  },
  {
    id: 'coelophysis', name: 'Coelophysis', icon: '🦴', period: 'Late Triassic',
    diet: 'Carnivore', clue: 'A small, fast early dinosaur',
    fact: 'Coelophysis was a light-built, two-legged predator and one of the early dinosaurs from the Triassic.'
  }
];
const JOURNAL_STORAGE_KEY = 'fernAndFossil_fossils_v1';
function loadDiscoveries() {
  try {
    const saved = JSON.parse(localStorage.getItem(JOURNAL_STORAGE_KEY) || '[]');
    return Array.isArray(saved) ? saved.filter(id => FOSSILS.some(f => f.id === id)) : [];
  } catch (error) {
    return [];
  }
}
let unlockedFossils = loadDiscoveries();
function saveDiscoveries() {
  try { localStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(unlockedFossils)); }
  catch (error) { /* Gameplay still works when browser storage is unavailable. */ }
}
function unlockNextFossil() {
  const fossil = FOSSILS.find(entry => !unlockedFossils.includes(entry.id));
  if (!fossil) return null;
  unlockedFossils.push(fossil.id);
  saveDiscoveries();
  renderJournal();
  return fossil;
}
function renderJournal() {
  const entries = document.getElementById('journalEntries');
  const count = unlockedFossils.length;
  document.getElementById('journalCount').textContent = `${count} of ${FOSSILS.length} fossils discovered`;
  document.getElementById('journalProgress').textContent = `🦴 Fossils discovered: ${count} of ${FOSSILS.length} · Open your journal to explore!`;
  entries.replaceChildren();
  FOSSILS.forEach((fossil, index) => {
    const unlocked = unlockedFossils.includes(fossil.id);
    const card = document.createElement('article');
    card.className = `fossil-card ${unlocked ? 'discovered' : 'locked'}`;
    const heading = document.createElement('h3');
    heading.textContent = unlocked ? `${fossil.icon} ${fossil.name}` : `🔒 Mystery fossil ${index + 1}`;
    const status = document.createElement('span');
    status.className = 'fossil-status';
    status.textContent = unlocked ? 'Discovered!' : 'Not yet discovered';
    const period = document.createElement('p');
    period.className = 'fossil-meta';
    period.textContent = unlocked ? `${fossil.period} · ${fossil.diet}` : fossil.clue;
    card.append(heading, status, period);
    if (unlocked) {
      const fact = document.createElement('p');
      fact.className = 'fossil-fact';
      fact.textContent = fossil.fact;
      card.append(fact);
    }
    entries.append(card);
  });
}

const canvas = document.getElementById('dinoCanvas');
const ctx = canvas.getContext('2d');
const el = id => document.getElementById(id);
const ui = {score:el('score'),level:el('level'),lives:el('lives'),time:el('time'),knowledge:el('knowledge'),message:el('gameMessage'),overlay:el('overlay'),title:el('overlayTitle'),description:el('overlayText'),start:el('startButton'),pause:el('pauseButton')};
const keyState = {left:false,right:false};
let state,rafId=0,lastFrame=0;
let quizIndex=0;
const quizUI={overlay:el('quizOverlay'),question:el('quizQuestion'),options:el('quizOptions'),feedback:el('quizFeedback'),continue:el('quizContinue')};
const journalUI = {dialog:el('journalDialog'),open:el('journalButton'),close:el('closeJournal'),clear:el('clearJournal')};
let modeBeforeJournal = 'ready';
const rand=(min,max)=>min+Math.random()*(max-min);
const clamp=(n,lo,hi)=>Math.max(lo,Math.min(hi,n));
function initialState(){return {mode:'ready',score:0,knowledge:0,questionsAnswered:0,lives:CONFIG.startLives,time:CONFIG.duration,level:1,spawnClock:0,items:[],particles:[],player:{x:CONFIG.width/2,y:415,w:115,h:98},lastMessage:'Every fern counts. You can do this!'};}
state=initialState();
function updateUI(){ui.score.textContent=state.score;ui.knowledge.textContent=state.knowledge;ui.level.textContent=state.level;ui.lives.textContent='♥ '.repeat(state.lives).trim()||'None';ui.time.textContent=Math.ceil(state.time)+'s';ui.message.textContent=state.lastMessage;ui.pause.disabled=state.mode==='ready'||state.mode==='done'||state.mode==='quiz'||state.mode==='journal';journalUI.open.disabled=state.mode==='quiz'||state.mode==='journal';ui.pause.textContent=state.mode==='paused'?'Resume':'Pause';}
function showOverlay(title,description,button){ui.title.textContent=title;ui.description.textContent=description;ui.start.textContent=button;ui.overlay.hidden=false;}
function start(){quizUI.overlay.hidden=true;quizIndex=0;state=initialState();state.mode='playing';keyState.left=keyState.right=false;ui.overlay.hidden=true;lastFrame=performance.now();updateUI();if(!rafId)rafId=requestAnimationFrame(loop);}
function endGame(){state.mode='done';keyState.left=keyState.right=false;state.lastMessage=`You saved ${state.score} ferns and earned ${state.knowledge} knowledge points!`;updateUI();showOverlay(state.lives<=0?'Pip needs a little rest!':'The forest thanks you!',`You saved ${state.score} ferns, answered ${state.questionsAnswered} nature questions, and earned ${state.knowledge} knowledge points. Try to beat your score!`,'Play Again');}
function togglePause(){if(state.mode==='playing'){state.mode='paused';keyState.left=keyState.right=false;showOverlay('Adventure paused','Take your time. Pip will wait for you.','Resume Game');}else if(state.mode==='paused'){state.mode='playing';ui.overlay.hidden=true;lastFrame=performance.now();}updateUI();}

// Pause gameplay at each third fern and ask a multiple-choice question.
function openQuiz(){
  state.mode='quiz';
  keyState.left=keyState.right=false;
  const q=QUESTIONS[quizIndex%QUESTIONS.length];
  quizIndex++;
  quizUI.question.textContent=q.question;
  quizUI.feedback.textContent='';
  quizUI.continue.hidden=true;
  quizUI.options.replaceChildren();
  q.options.forEach((option,index)=>{
    const button=document.createElement('button');
    button.type='button';
    button.textContent=option;
    button.addEventListener('click',()=>{
      if(state.mode!=='quiz'||!quizUI.continue.hidden)return;
      const correct=index===q.answer;
      state.questionsAnswered++;
      if(correct)state.knowledge+=10;
      let discovery = null;
      if (correct) discovery = unlockNextFossil();
      quizUI.feedback.textContent=(correct?'Correct! +10 knowledge points. ':'Not quite. ')+q.fact+
        (discovery ? ` New discovery: ${discovery.name}! Find it in your fossil journal.` :
        (correct && unlockedFossils.length === FOSSILS.length ? ' Your fossil journal is complete!' : ''));
      [...quizUI.options.children].forEach((b,i)=>{
        b.disabled=true;
        if(i===q.answer)b.classList.add('correct');
        else if(i===index)b.classList.add('incorrect');
      });
      quizUI.continue.hidden=false;
      quizUI.continue.focus();
      updateUI();
    });
    quizUI.options.append(button);
  });
  quizUI.overlay.hidden=false;
  quizUI.options.querySelector('button').focus();
  updateUI();
}
quizUI.continue.addEventListener('click',()=>{
  quizUI.overlay.hidden=true;
  state.mode='playing';
  lastFrame=performance.now();
  updateUI();
});

// Opening the journal pauses the round. Closing it resumes the previous state.
journalUI.open.addEventListener('click', () => {
  if (state.mode === 'quiz' || journalUI.dialog.open) return;
  modeBeforeJournal = state.mode;
  if (state.mode === 'playing') {
    state.mode = 'journal';
    keyState.left = keyState.right = false;
  }
  renderJournal();
  journalUI.dialog.showModal();
  updateUI();
});
journalUI.close.addEventListener('click', () => journalUI.dialog.close());
journalUI.dialog.addEventListener('close', () => {
  if (state.mode === 'journal') {
    state.mode = modeBeforeJournal;
    lastFrame = performance.now();
  }
  updateUI();
  journalUI.open.focus();
});
journalUI.clear.addEventListener('click', () => {
  if (window.confirm('Clear all fossil discoveries saved in this browser?')) {
    unlockedFossils = [];
    saveDiscoveries();
    renderJournal();
  }
});

function spawnItem(){const kind=Math.random()<TYPES.fern.weight?'fern':'rock';const level=state.level;state.items.push({kind,x:rand(40,860),y:-32,r:kind==='fern'?19:23,speed:rand(115,185)+level*22,angle:rand(-1,1),spin:rand(-1.3,1.3)});}
function burst(x,y,color){for(let i=0;i<10;i++)state.particles.push({x,y,vx:rand(-85,85),vy:rand(-140,-20),life:rand(.35,.75),maxLife:.75,color});}
function hit(item){const p=state.player;const nearestX=clamp(item.x,p.x-47,p.x+50);const nearestY=clamp(item.y,p.y-18,p.y+42);return Math.hypot(item.x-nearestX,item.y-nearestY)<item.r+3;}
function tick(dt){state.time=Math.max(0,state.time-dt);const direction=Number(keyState.right)-Number(keyState.left);state.player.x=clamp(state.player.x+direction*CONFIG.playerSpeed*dt,70,830);state.level=1+Math.floor(state.score/CONFIG.levelEvery);state.spawnClock+=dt;const interval=Math.max(.37,CONFIG.spawnEvery-(state.level-1)*.065);while(state.spawnClock>=interval){spawnItem();state.spawnClock-=interval;}
for(let i=state.items.length-1;i>=0;i--){const obj=state.items[i];obj.y+=obj.speed*dt;obj.angle+=obj.spin*dt;if(hit(obj)){if(obj.kind==='fern'){state.score+=TYPES.fern.points;state.lastMessage=state.score%CONFIG.levelEvery===0?'The forest is growing! A new stage!':'Wonderful! Another fern saved 🌿';burst(obj.x,obj.y,'#67ad60');}else{state.lives-=TYPES.rock.damage;state.lastMessage='Ouch! Dodge those rocks!';burst(obj.x,obj.y,'#d6a16e');}state.items.splice(i,1);if(obj.kind==='fern'&&state.score%3===0){openQuiz();break;}}else if(obj.y>CONFIG.height+40){state.items.splice(i,1);}}
for(let i=state.particles.length-1;i>=0;i--){const p=state.particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=240*dt;p.life-=dt;if(p.life<=0)state.particles.splice(i,1);}if(state.time<=0||state.lives<=0){if(state.mode!=='quiz')endGame();}updateUI();}
function ellipse(x,y,rx,ry,color,rotation=0){ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,rx,ry,rotation,0,Math.PI*2);ctx.fill();}
function drawLeaf(x,y,s,rotation,color='#599f62'){ctx.save();ctx.translate(x,y);ctx.rotate(rotation);ellipse(0,0,s,s*.48,color,-.55);ctx.strokeStyle='#285e3b';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(-s*.75,s*.24);ctx.lineTo(s*.9,-s*.3);ctx.stroke();ctx.restore();}
function background(t){const sky=ctx.createLinearGradient(0,0,0,500);sky.addColorStop(0,'#b9e3d5');sky.addColorStop(.7,'#eef8cf');sky.addColorStop(1,'#d2e4b0');ctx.fillStyle=sky;ctx.fillRect(0,0,900,500);ellipse(725,76,47,47,'#fff5b8');for(let i=0;i<5;i++){const x=100+i*185;ellipse(x+25,348,145,95,'#a3c9a2');ellipse(x-55,370,125,77,'#91ba90');}for(let i=0;i<10;i++){let x=i*105+38;ctx.fillStyle=i%2?'#447f5c':'#55956a';ctx.fillRect(x,220+(i%3)*19,12,170);ellipse(x+5,222+(i%3)*19,38,67,i%2?'#4d8e65':'#69a877');ellipse(x-20,245+(i%3)*19,28,42,'#5b9e70');}ctx.fillStyle='#739d65';ctx.fillRect(0,451,900,49);ctx.fillStyle='#8dbb78';ctx.fillRect(0,468,900,32);for(let i=0;i<20;i++){const x=i*47+18;drawLeaf(x,459,9,-.5,'#3f8654');drawLeaf(x+11,471,8,.7,'#6eae66');}const count=Math.min(12,state.score);for(let i=0;i<count;i++){const x=32+(i*79)%850;drawLeaf(x,405-(i%3)*15,15,Math.sin(t*.0005+i)*.3,'#3d9b65');}ctx.fillStyle='#5d8157';ctx.font='bold 15px system-ui';ctx.fillText('FERN FOREST',20,32);}
function drawDino(){const p=state.player;ctx.save();ctx.translate(p.x,p.y);ctx.scale(keyState.left?-1:1,1);ellipse(-22,48,52,10,'#4b72533d');ellipse(-24,31,13,21,'#3c876d');ellipse(17,31,14,21,'#3c876d');ellipse(-12,0,67,41,'#58ac87');ctx.save();ctx.translate(36,-14);ctx.rotate(-.23);ellipse(0,-27,21,65,'#58ac87');ctx.restore();ellipse(53,-75,40,27,'#65ba8f',.12);ellipse(77,-66,19,15,'#84cda1');ellipse(-62,6,28,12,'#4a9775',-.3);for(let i=0;i<4;i++){ellipse(-48+i*24,-36+(i%2)*4,10,14,'#398e70');}ellipse(56,-80,4,5,'#203d33');ellipse(75,-57,4,3,'#3f6e58');ellipse(65,-60,8,4,'#efa5a0');ctx.strokeStyle='#265b45';ctx.lineWidth=2;ctx.beginPath();ctx.arc(82,-64,8,.4,2.6);ctx.stroke();ellipse(-20,3,23,17,'#78c39d');ctx.restore();}
function drawRock(obj){ctx.save();ctx.translate(obj.x,obj.y);ctx.rotate(obj.angle);ctx.fillStyle='#8c8a7c';ctx.beginPath();ctx.moveTo(-22,3);ctx.lineTo(-13,-19);ctx.lineTo(7,-23);ctx.lineTo(23,-6);ctx.lineTo(18,17);ctx.lineTo(-11,21);ctx.closePath();ctx.fill();ellipse(-7,-7,7,5,'#a8a698',-.4);ellipse(11,7,4,3,'#6c7169');ctx.restore();}
function drawFern(obj){ctx.save();ctx.translate(obj.x,obj.y);ctx.rotate(obj.angle);ctx.strokeStyle='#337044';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,20);ctx.quadraticCurveTo(-5,-3,2,-25);ctx.stroke();for(let i=0;i<5;i++){const y=13-i*8;drawLeaf(-7,y,9,-.4,'#4eab63');drawLeaf(7,y-3,9,.4,'#74bf6f');}ctx.restore();}
function draw(){background(performance.now());for(const obj of state.items){obj.kind==='fern'?drawFern(obj):drawRock(obj);}drawDino();for(const p of state.particles){ctx.globalAlpha=clamp(p.life/p.maxLife,0,1);ellipse(p.x,p.y,4,4,p.color);}ctx.globalAlpha=1;}
function loop(now){rafId=0;const dt=Math.min((now-lastFrame)/1000,.04);lastFrame=now;if(state.mode==='playing')tick(dt);draw();rafId=requestAnimationFrame(loop);}
function setDir(dir,on){keyState[dir]=on;}
for(const [id,dir] of [['leftButton','left'],['rightButton','right']]){const btn=el(id);btn.addEventListener('pointerdown',e=>{e.preventDefault();btn.setPointerCapture(e.pointerId);setDir(dir,true);});for(const ev of ['pointerup','pointercancel','lostpointercapture'])btn.addEventListener(ev,()=>setDir(dir,false));}
document.addEventListener('keydown',e=>{if(state.mode!=='quiz'&&['ArrowLeft','ArrowRight','KeyA','KeyD','Space'].includes(e.code)&&!['INPUT','TEXTAREA'].includes(document.activeElement.tagName)){e.preventDefault();}if(state.mode==='quiz')return;if(e.code==='ArrowLeft'||e.code==='KeyA')setDir('left',true);if(e.code==='ArrowRight'||e.code==='KeyD')setDir('right',true);if(e.code==='Space'&& !e.repeat && (state.mode==='playing'||state.mode==='paused'))togglePause();});document.addEventListener('keyup',e=>{if(e.code==='ArrowLeft'||e.code==='KeyA')setDir('left',false);if(e.code==='ArrowRight'||e.code==='KeyD')setDir('right',false);});window.addEventListener('blur',()=>{keyState.left=keyState.right=false;if(state.mode==='playing')togglePause();});
ui.start.addEventListener('click',()=>state.mode==='paused'?togglePause():start());ui.pause.addEventListener('click',togglePause);el('restartButton').addEventListener('click',start);
renderJournal();updateUI();draw();rafId=requestAnimationFrame(loop);
