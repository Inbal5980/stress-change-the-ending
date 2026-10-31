/* "שנו את הסוף" · גרסה 3: פתיחה + 3 שלבים קצרים + משפט לפדלט. כל הטקסטים ב-config.js */
(function(){
'use strict';
var C=window.GAME_CONFIG, ART=window.ART;
var $=function(s,r){return (r||document).querySelector(s)}, $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function fill(s){return String(s==null?'':s).replace(/\{S\}/g,C.STRESSED||'').replace(/\{C\}/g,C.CALM||'')}
function F(s){return esc(fill(s))}
function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a}
var S={name:C.STRESSED,avatar:(C.CHARACTER||{}).avatar||{}}, K={name:C.CALM,avatar:(C.CHARACTER||{}).avatar||{}};
function face(who,mood,cls){return '<div class="face '+(cls||'')+'">'+ART.avatar(who,mood)+'</div>'}
var screen=$('#screen');
var STEPS=C.STEPS||[];
var state={step:0,chosen:null,tried:{}};

/* ---------- header / progress ---------- */
$('#t-title').textContent=C.TITLE;
document.title=C.TITLE+' · מודל האינטראקציה של לזרוס';
function setProgress(n){
  var p=$('#progress');
  if(!n){p.classList.add('hidden');return}
  p.classList.remove('hidden');
  $$('.p-bar i',p).forEach(function(b,i){b.className=(i<n-1||n>3)?'done':(i===n-1?'cur':'')});
  if(n>3){$('#p-step').textContent='סיום';$('#p-name').textContent=''}
  else{$('#p-step').textContent='שלב '+n+' מתוך 3';$('#p-name').textContent='· '+fill(STEPS[n-1].title)}
}
function go(html,n){
  setProgress(n);
  screen.innerHTML=html;
  screen.classList.remove('enter'); void screen.offsetWidth; screen.classList.add('enter');
  window.scrollTo(0,0);
}
var toastT;
function toast(msg){var t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(toastT);toastT=setTimeout(function(){t.classList.remove('show')},2200)}

/* ---------- help ---------- */
var hb='<div class="quote key">"'+esc(C.KEY_QUOTE.text)+'"<span class="src">'+esc(C.KEY_QUOTE.source)+'</span></div>';
C.DEFINITIONS.forEach(function(d){hb+='<div class="quote"><div class="qt">'+esc(d.term)+'</div>"'+esc(d.text)+'"<span class="src">'+esc(d.source)+'</span></div>'});
$('#help-body').innerHTML=hb;
$('#help-btn').addEventListener('click',function(){$('#help').classList.remove('hidden');$('#help-close').focus()});
$('#help-close').addEventListener('click',function(){$('#help').classList.add('hidden')});
$('#help').addEventListener('click',function(e){if(e.target.id==='help')$('#help').classList.add('hidden')});
document.addEventListener('keydown',function(e){if(e.key==='Escape')$('#help').classList.add('hidden')});

/* ---------- the model diagram (shared by steps 1 and 2) ---------- */
var MAIN=['stressor','stage1','stage2','stress'];
var CARD={}; C.STAGE_CARDS.forEach(function(c){ if(c.kind!=='nostress' && !CARD[c.kind]) CARD[c.kind]=c; });
function slotInner(kind){var c=CARD[kind];return '<span class="s-lbl">'+esc(c.label)+'</span>'+(c.sub?'<span class="s-sub">'+esc(c.sub)+'</span>':'')}
function diagram(filled){
  function slot(kind,i){
    var f=filled||{};
    return '<button type="button" class="slot'+(f[kind]?' filled':'')+'" data-slot="'+kind+'" aria-label="מקום '+(i+1)+' בתרשים">'+
      '<span class="s-num">'+(i+1)+'</span><span class="s-body">'+(f[kind]?slotInner(kind):'<span class="s-q">?</span>')+'</span><span class="s-count" hidden></span></button>';
  }
  function branch(label){return '<div class="branch"><span class="b-arrow">'+esc(label)+' ←</span><span class="b-out">אין לחץ 😌</span></div>'}
  function arrow(label,id){return '<div class="arrow" data-arrow="'+id+'"><span class="a-line"></span>'+(label?'<em>'+esc(label)+'</em>':'')+'</div>'}
  return '<div class="model" id="model">'+
    '<div class="m-row">'+slot('stressor',0)+'<div></div></div>'+arrow('','a0')+
    '<div class="m-row">'+slot('stage1',1)+branch('לא מאיים')+'</div>'+arrow('מאיים','a1')+
    '<div class="m-row">'+slot('stage2',2)+branch('מסוגל')+'</div>'+arrow('לא מסוגל','a2')+
    '<div class="m-row">'+slot('stress',3)+'<div></div></div>'+
  '</div>';
}

/* ---------- intro ---------- */
function intro(){
  var steps=STEPS.map(function(s,i){return '<li><b>'+(i+1)+'</b><div><strong>'+F(s.title)+'</strong><span>'+F(s.sub)+'</span></div></li>'}).join('');
  go('<section class="card intro">'+
    '<div class="duo">'+
      '<figure>'+face(S,'stress','big')+'<figcaption><b>'+esc(C.STRESSED)+'</b><span class="tag bad">לחוץ 😟</span></figcaption></figure>'+
      '<figure>'+face(K,'calm','big')+'<figcaption><b>'+esc(C.CALM)+'</b><span class="tag good">רגוע 😌</span></figcaption></figure>'+
    '</div>'+
    '<p class="story"><span>🚗 </span>'+F(C.CHARACTER.intro)+'</p>'+
    (C.INTRO||[]).map(function(p){return '<p class="story2">'+F(p)+'</p>'}).join('')+
    '<h2 class="ov-title">3 שלבים קצרים</h2><ol class="ov">'+steps+'<li class="fin"><b>✓</b><div><strong>'+F(C.FINISH_TITLE||'')+'</strong><span>קוד סיום למורה</span></div></li></ol>'+
    '<button type="button" class="btn big wide" id="start">יאללה, מתחילים ←</button>'+
  '</section>',0);
  $('#start').addEventListener('click',step1);
}

/* ---------- step 1: build the model (4 cards → 4 slots) ---------- */
function step1(){
  var placed={}, sel=null, firstDone=false;
  var cards=shuffle(MAIN);
  go('<section class="card step s1">'+
    '<p class="instr"><span class="n">1</span>'+F(STEPS[0].instruction)+'</p>'+
    '<div class="s1-grid">'+
      '<div class="tray" id="tray">'+cards.map(function(k){var c=CARD[k];return '<button type="button" class="chip" data-kind="'+k+'"><span class="s-lbl">'+esc(c.label)+'</span>'+(c.sub?'<span class="s-sub">'+esc(c.sub)+'</span>':'')+'</button>'}).join('')+'</div>'+
      '<div class="dwrap">'+diagram()+'<div class="hand" id="ghost" aria-hidden="true">👆</div></div>'+
    '</div>'+
    '<div class="fb" id="fb" aria-live="polite"></div>'+
    '<div class="next-row hidden" id="next-row"><div class="quote key small">"'+esc(C.KEY_QUOTE.text)+'"<span class="src">'+esc(C.KEY_QUOTE.source)+'</span></div><button type="button" class="btn big wide" id="next">לשלב 2 ←</button></div>'+
  '</section>',1);
  var model=$('#model');
  model.classList.add('picking');
  /* ghost hand demo: stressor card → slot 1 */
  setTimeout(function(){
    var g=$('#ghost'), wrap=$('.s1-grid'); if(!g||firstDone) return;
    var a=$('.chip[data-kind="stressor"]'), b=$('.slot[data-slot="stressor"]'), w=wrap.getBoundingClientRect();
    var ra=a.getBoundingClientRect(), rb=b.getBoundingClientRect();
    wrap.appendChild(g);
    g.style.setProperty('--x0',(ra.left-w.left+ra.width*.5)+'px'); g.style.setProperty('--y0',(ra.top-w.top+ra.height*.45)+'px');
    g.style.setProperty('--x1',(rb.left-w.left+rb.width*.5)+'px'); g.style.setProperty('--y1',(rb.top-w.top+rb.height*.45)+'px');
    g.classList.add('play');
  },500);
  function stopGhost(){firstDone=true;var g=$('#ghost');if(g)g.remove()}
  function select(chip){
    stopGhost();
    $$('.chip').forEach(function(c){c.classList.toggle('sel',c===chip)});
    sel=chip?chip.getAttribute('data-kind'):null;
    model.classList.toggle('armed',!!sel);
    if(sel) fb('<b>נבחר: '+esc(CARD[sel].label)+'.</b> עכשיו הקישו על המקום שלו בתרשים 👇','info');
  }
  function fb(h,cls){var e=$('#fb');e.className='fb show '+(cls||'');e.innerHTML=h}
  function tryPlace(kind,slotKind){
    var slot=$('.slot[data-slot="'+slotKind+'"]');
    if(placed[slotKind]) return;
    if(kind===slotKind){
      placed[kind]=true;
      slot.classList.add('filled','pop'); $('.s-body',slot).innerHTML=slotInner(kind);
      var chip=$('.chip[data-kind="'+kind+'"]'); if(chip) chip.remove();
      select(null);
      fb('✅ <b>נכון!</b> '+esc(fill(C.STAGE_HINTS[kind]||'')),'good');
      if(MAIN.every(function(k){return placed[k]})) done();
    } else {
      slot.classList.remove('shake'); void slot.offsetWidth; slot.classList.add('shake'); setTimeout(function(){slot.classList.remove('shake')},700);
      fb('✋ <b>לא כאן.</b> רמז: '+esc(fill(C.STAGE_HINTS[kind]||'')),'bad');
    }
  }
  function done(){
    model.classList.remove('picking','armed'); model.classList.add('complete');
    $('#tray').classList.add('hidden');
    fb('🎉 <b>המודל מוכן!</b> עכשיו נשתמש בו כדי להבין את '+esc(C.STRESSED)+'.','good');
    $('#next-row').classList.remove('hidden');
    $('#next').addEventListener('click',step2);
    setTimeout(function(){$('#next-row').scrollIntoView({behavior:'smooth',block:'nearest'})},150);
  }
  /* tap to place */
  $('#tray').addEventListener('click',function(e){var c=e.target.closest('.chip');if(!c||c.__dragged){if(c)c.__dragged=false;return}select(c.classList.contains('sel')?null:c)});
  model.addEventListener('click',function(e){var s=e.target.closest('.slot');if(!s||placed[s.getAttribute('data-slot')])return;
    if(!sel){stopGhost();fb('👆 קודם הקישו על אחד הכרטיסים, ואז על המקום שלו.','info');return}
    tryPlace(sel,s.getAttribute('data-slot'))});
  /* drag (bonus) */
  var drag=null;
  $('#tray').addEventListener('pointerdown',function(e){var c=e.target.closest('.chip');if(!c)return;drag={c:c,x:e.clientX,y:e.clientY,on:false,id:e.pointerId}});
  window.addEventListener('pointermove',function(e){
    if(!drag) return;
    if(!drag.on){ if(Math.abs(e.clientX-drag.x)+Math.abs(e.clientY-drag.y)<10) return;
      drag.on=true; stopGhost(); var r=drag.c.getBoundingClientRect(); var gh=drag.c.cloneNode(true); gh.className='chip dragging'; gh.style.width=r.width+'px'; document.body.appendChild(gh); drag.g=gh; drag.c.classList.add('ghosted'); model.classList.add('armed'); }
    drag.g.style.left=(e.clientX-drag.g.offsetWidth/2)+'px'; drag.g.style.top=(e.clientY-drag.g.offsetHeight/2)+'px';
    var el=document.elementFromPoint(e.clientX,e.clientY), s=el&&el.closest&&el.closest('.slot');
    $$('.slot').forEach(function(x){x.classList.toggle('over',x===s)});
  });
  function endDrag(e){
    if(!drag) return; var d=drag; drag=null; if(!d.on) return;
    d.c.__dragged=true; setTimeout(function(){d.c.__dragged=false},50);
    d.g.remove(); d.c.classList.remove('ghosted'); $$('.slot').forEach(function(x){x.classList.remove('over')}); model.classList.toggle('armed',!!sel);
    var el=document.elementFromPoint(e.clientX,e.clientY), s=el&&el.closest&&el.closest('.slot');
    if(s) tryPlace(d.c.getAttribute('data-kind'),s.getAttribute('data-slot'));
  }
  window.onpointerup=endDrag; window.onpointercancel=function(){if(drag&&drag.g){drag.g.remove();drag.c.classList.remove('ghosted')}drag=null};
}

/* ---------- step 2: one sentence at a time ---------- */
function step2(){
  var all={}; MAIN.forEach(function(k){all[k]=true});
  var i=0, counts={}, locked=false;
  go('<section class="card step s2">'+
    '<p class="instr"><span class="n">2</span>'+F(STEPS[1].instruction)+'</p>'+
    '<div class="s2-grid">'+
      '<div class="s2-side">'+
        '<div class="sent-head">'+face(S,'neutral','sm')+'<div><b>המחשבות של '+esc(C.STRESSED)+'</b><span id="s-count"></span></div><div class="dots" id="dots"></div></div>'+
        '<div class="sentence" id="sentence"></div>'+
        '<div class="fbbar" id="fbbar"><div class="fb" id="fb" aria-live="polite"></div>'+
        '<button type="button" class="btn big wide hidden" id="nextS">המשפט הבא ←</button></div>'+
        '<div class="result hidden" id="result"></div>'+
      '</div>'+
      '<div class="dwrap">'+diagram(all)+'</div>'+
    '</div>'+
  '</section>',2);
  var model=$('#model'); model.classList.add('answer');
  $('#dots').innerHTML=C.SENTENCES.map(function(){return '<i></i>'}).join('');
  function show(){
    locked=false;
    var s=C.SENTENCES[i];
    $('#s-count').textContent='משפט '+(i+1)+' מתוך '+C.SENTENCES.length;
    $$('#dots i').forEach(function(d,j){d.className=j<i?'done':(j===i?'cur':'')});
    var el=$('#sentence'); el.innerHTML='<span class="qm">“</span>'+F(s.text)+'<span class="qm">”</span>';
    el.classList.remove('enter'); void el.offsetWidth; el.classList.add('enter');
    $('#fb').className='fb'; $('#fb').innerHTML='';
    $('#nextS').classList.add('hidden');
    $$('.slot',model).forEach(function(x){x.classList.remove('right','wrong')});
    model.classList.add('armed');
  }
  model.addEventListener('click',function(e){
    var sl=e.target.closest('.slot'); if(!sl||locked) return;
    var s=C.SENTENCES[i], k=sl.getAttribute('data-slot'), fbE=$('#fb');
    if(k===s.slot){
      locked=true; model.classList.remove('armed');
      sl.classList.add('right','pop'); counts[k]=(counts[k]||0)+1;
      var cnt=$('.s-count',sl); cnt.hidden=false; cnt.textContent=counts[k];
      fbE.className='fb show good'; fbE.innerHTML='✅ <b>נכון! '+esc(CARD[k].label)+'.</b> '+F(s.hint);
      var last=i===C.SENTENCES.length-1;
      var nb=$('#nextS'); nb.textContent=last?'מה יצא? ←':'המשפט הבא ←'; nb.classList.remove('hidden');
      
    } else {
      sl.classList.remove('wrong'); void sl.offsetWidth; sl.classList.add('wrong'); setTimeout(function(){sl.classList.remove('wrong')},700);
      fbE.className='fb show bad'; fbE.innerHTML='✋ <b>לא בדיוק, נסו שוב.</b> רמז: '+F(s.hint);
    }
  });
  $('#nextS').addEventListener('click',function(){ if(i<C.SENTENCES.length-1){i++;show()} else finish2(); });
  function finish2(){
    $('#sentence').classList.add('hidden'); $('#fbbar').classList.add('hidden');
    $$('#dots i').forEach(function(d){d.className='done'}); $('#s-count').textContent='כל המשפטים במקום ✓';
    $('.sent-head .face').innerHTML=ART.avatar(S,'stress');
    model.classList.remove('armed'); model.classList.add('path-stress');
    var r=$('#result'); r.classList.remove('hidden');
    r.innerHTML='<h3>זה המסלול של '+esc(C.STRESSED)+' 😟</h3>'+
      '<div class="path"><span>הטסט מאיים</span><i>←</i><span>לא מסוגל להתמודד</span><i>←</i><span class="bad">יש לחץ</span></div>'+
      '<div class="contrast">'+face(K,'calm','xs')+'<span>אצל '+esc(C.CALM)+' המסלול נעצר כבר בשלב הראשון: הטסט לא מאיים עליו, ולכן אין לחץ.</span></div>'+
      '<button type="button" class="btn big wide" id="to3">לשלב 3: משנים את הסוף ←</button>';
    $('#to3').addEventListener('click',step3);
    setTimeout(function(){r.scrollIntoView({behavior:'smooth',block:'nearest'})},150);
  }
  show();
}

/* ---------- step 3: change card → before / after ---------- */
function pathCol(title,mood,st1,st2,out,changed,cls){
  function row(label,val,good,key,skip){
    return '<div class="pc-row'+(changed===key?' changed':'')+(skip?' skip':'')+'"><span class="pc-k">'+label+'</span><span class="pc-v '+(skip?'':good?'good':'bad')+'">'+val+'</span>'+(changed===key?'<em class="pc-badge">כאן השינוי פעל</em>':'')+'</div>';
  }
  return '<div class="pcol '+(cls||'')+'"><div class="pc-title">'+title+'</div>'+face(S,mood,'md')+
    row('שלב 1',st1[0],st1[1],1)+row('שלב 2',st2[0],st2[1],2,st2[2])+row('תוצאה',out[0],out[1],0)+'</div>';
}
function step3(){
  var ch=C.CHANGES;
  go('<section class="card step s3">'+
    '<p class="instr"><span class="n">3</span>'+F(STEPS[2].instruction)+'</p>'+
    '<div class="now">'+face(S,'stress','sm')+'<span>עכשיו: <b>'+esc(C.STRESSED)+'</b> לחוץ לפני הטסט. איזה שינוי יעזור לו?</span></div>'+
    '<div class="changes" id="changes">'+ch.map(function(c){return '<button type="button" class="change'+(state.tried[c.id]?' tried':'')+'" data-id="'+esc(c.id)+'"><span class="c-emo">'+esc(c.emoji)+'</span><span class="c-txt"><b>'+F(c.title)+'</b><span>'+F(c.text)+'</span></span>'+(state.tried[c.id]?'<span class="c-tried">✓ ניסיתם</span>':'')+'</button>'}).join('')+'</div>'+
    '<div id="outcome"></div>'+
  '</section>',3);
  $('#changes').addEventListener('click',function(e){var b=e.target.closest('.change');if(!b)return;var c=ch.filter(function(x){return x.id===b.getAttribute('data-id')})[0];if(c)outcome(c)});
}
function outcome(c){
  state.chosen=c; state.tried[c.id]=true;
  var st1=c.stage===1;
  var before=pathCol('לפני','stress',['מאיים',false],['לא מסוגל',false],['יש לחץ 😟',false],null,'before');
  var after=st1
    ? pathCol('אחרי','calm',['לא מאיים',true],['לא מגיעים לשלב הזה',false,true],['אין לחץ 😌',true],1,'after')
    : pathCol('אחרי','calm',['מאיים',false],['מסוגל',true],['אין לחץ 😌',true],2,'after');
  var stageName=st1?('בשלב הראשון: '+C.STAGE1):('בשלב השני: '+C.STAGE2);
  go('<section class="card step s3 res">'+
    '<p class="instr small"><span class="n">3</span><span>השינוי שבחרתם: <b>'+esc(c.emoji)+' '+F(c.title)+'</b></span></p>'+
    '<div class="ba">'+before+'<div class="ba-arrow" aria-hidden="true">←</div>'+after+'</div>'+
    '<div class="verdict-line '+(st1?'v1':'v2')+'">השינוי פעל <b>'+esc(stageName)+'</b>'+(c.resource?'<span class="res-tag">משאב: '+esc(c.resource)+'</span>':'')+'</div>'+
    '<p class="expl">'+F(c.explanation)+'</p>'+
    '<div class="btns"><button type="button" class="btn ghost" id="again">🔄 לנסות שינוי אחר</button><button type="button" class="btn big" id="toFin">לסיום ←</button></div>'+
  '</section>',3);
  $('#again').addEventListener('click',step3);
  $('#toFin').addEventListener('click',finish);
}

/* ---------- finish: one sentence + copy + code ---------- */
function finish(){
  var c=state.chosen;
  go('<section class="card step fin">'+
    '<div class="fin-head">'+face(S,'calm','sm')+'<div><h2>'+fill('{S} כבר לא לחוץ 😌')+'</h2>'+(c?'<p class="dim">השינוי שבחרתם: '+esc(c.emoji)+' '+F(c.title)+'</p>':'')+'</div></div>'+
    '<div class="codebox hidden" id="codebox"></div>'+
    '<button type="button" class="link" id="restart">התחלה מחדש</button>'+
  '</section>',4);
  reveal();
  $('#restart').addEventListener('click',function(){state={step:0,chosen:null,tried:{}};intro()});
}
function copyText(txt,fallbackEl){
  var ok=false;
  try{ if(navigator.clipboard&&window.isSecureContext){ navigator.clipboard.writeText(txt).catch(function(){legacy()}); ok=true; } }catch(e){}
  if(!ok) legacy();
  function legacy(){ try{ var t=document.createElement('textarea'); t.value=txt; t.setAttribute('readonly',''); t.style.position='fixed'; t.style.opacity='0'; document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove(); }catch(e){} }
}
function reveal(){
  var b=$('#codebox'); if(!b.classList.contains('hidden')) return;
  if(!C.COMPLETION_CODE){ b.innerHTML='<b>🎉 כל הכבוד, סיימתם!</b>'; b.classList.remove('hidden'); return; }
  b.innerHTML='<div class="cb-t">🎉 כל הכבוד, סיימתם! קוד הסיום שלכם:</div><div class="code" id="code">'+esc(C.COMPLETION_CODE)+'</div><button type="button" class="btn ghost" id="copyCode">העתקת הקוד</button>';
  b.classList.remove('hidden');
  $('#copyCode').addEventListener('click',function(){copyText(C.COMPLETION_CODE);toast('הקוד הועתק ✓')});
  setTimeout(function(){b.scrollIntoView({behavior:'smooth',block:'center'})},100);
  if(window.CONFETTI) setTimeout(CONFETTI,200);
}

window.__g2={intro:intro,step1:step1,step2:step2,step3:step3,finish:finish};
intro();
})();
