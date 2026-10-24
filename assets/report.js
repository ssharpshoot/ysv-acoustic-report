(() => {
 'use strict';
 const $=id=>document.getElementById(id),D=window.PROJECT_DATA,T=window.REPORT_TIMELINE,audio=$('narration');
 const state={mode:'explore',index:-1,part:-1,options:{},captions:false,ended:false,chapterWasPlaying:false};
 let pendingSeek=null;
 const format=t=>`${String(Math.floor(Math.max(0,t)/60)).padStart(2,'0')}:${String(Math.floor(Math.max(0,t)%60)).padStart(2,'0')}`;
 $('homeLength').textContent=`22页 · 约${Math.round(T.duration/60)}分钟 · 可暂停、回看、选择章节`;
 $('duration').textContent=format(T.duration);
 function showViewer(){ $('home').hidden=true;$('viewer').hidden=false; }
 function pageFor(t){for(let i=T.pages.length-1;i>=0;i--)if(t>=T.pages[i].start-.001)return i;return 0;}
 function phaseFor(index,t){let part=0;for(const cue of T.pages[index].cues)if(t-T.pages[index].start>=cue.start)part=cue.part;return part;}
 function draw(){
  const p=D.pages[state.index];window.ReportVisuals.render(p,state.part,state.options,options=>{audio.pause();state.options={...state.options,...options};draw();updatePlayback();});
  $('findings').querySelectorAll('.note').forEach((n,i)=>n.classList.toggle('active',i===state.part));
 }
 function showPage(index,part){
  const page=D.pages[index];state.index=index;state.part=part;state.options={};
  $('eyebrow').textContent=page.chapter+' / '+String(index+1).padStart(2,'0');$('title').textContent=page.title;$('lead').textContent=page.lead;
  $('transportTitle').textContent=page.title;$('pageCount').textContent=`${index+1} / ${D.pages.length}`;
  $('findings').replaceChildren(...page.notes.map((note,i)=>{const div=document.createElement('div');div.className='note';const no=document.createElement('p');no.className='note-no';no.textContent=String(i+1).padStart(2,'0');const h=document.createElement('h2');h.textContent=note;div.append(no,h);return div;}));
  $('textTitle').textContent=page.title;$('textBody').replaceChildren(...page.paragraphs.map(text=>{const p=document.createElement('p');p.textContent=text;return p;}));
  document.querySelectorAll('[data-chapter]').forEach(b=>b.setAttribute('aria-current',String(Number(b.dataset.chapter)===index)));
  $('previous').disabled=index===0;$('next').disabled=index===D.pages.length-1;
  if(state.mode!=='export')history.replaceState(null,'','#'+page.id);
  draw();
 }
 function applyTime(t){
  const index=pageFor(t),part=phaseFor(index,t);if(index!==state.index)showPage(index,part);else if(part!==state.part){state.part=part;state.options={};draw();}
  const sub=T.subtitles.find(s=>t>=s.start&&t<s.end);$('subtitle').textContent=sub?.text||'';$('subtitle').hidden=!state.captions||!sub;
  $('elapsed').textContent=format(t);$('seek').value=String(Math.min(100,t/T.duration*100));
 }
 function updatePlayback(){
  $('playPause').setAttribute('aria-label',audio.paused?'播放讲解':'暂停讲解');$('playIcon').setAttribute('d',audio.paused?'M8 5v14l11-7z':'M6 5h4v14H6zM14 5h4v14h-4z');
  $('modeLabel').textContent=state.mode==='auto'?'自动讲解':'项目查看';
 }
 async function play(){
  state.ended=false;state.options={};draw();try{await audio.play();$('status').textContent='';}catch{$('status').textContent='音频未能播放，请点击播放重试。';}updatePlayback();
 }
 function seekTo(t,playing=!audio.paused){
  const clamped=Math.max(0,Math.min(T.duration-.01,t));state.ended=false;
  pendingSeek=clamped;audio.currentTime=clamped;applyTime(clamped);if(playing)play();else{audio.pause();updatePlayback();}
 }
 function enter(mode){state.mode=mode;showViewer();state.index=-1;state.part=-1;state.ended=false;audio.pause();seekTo(0,false);if(mode==='auto')play();}
 $('startAuto').addEventListener('click',()=>enter('auto'));$('startExplore').addEventListener('click',()=>enter('explore'));
 $('homeButton').addEventListener('click',()=>{audio.pause();$('viewer').hidden=true;$('home').hidden=false;history.replaceState(null,'',location.pathname+location.search);});
 $('playPause').addEventListener('click',()=>{if(audio.paused)play();else audio.pause();});
 $('previous').addEventListener('click',()=>{const playing=state.mode==='auto'&&!audio.paused;seekTo(T.pages[Math.max(0,state.index-1)].start,playing);});
 $('next').addEventListener('click',()=>{const playing=state.mode==='auto'&&!audio.paused;seekTo(T.pages[Math.min(D.pages.length-1,state.index+1)].start,playing);});
 $('backward').addEventListener('click',()=>seekTo(audio.currentTime-10));$('forward').addEventListener('click',()=>seekTo(audio.currentTime+10));
 $('seek').addEventListener('input',()=>seekTo(Number($('seek').value)/100*T.duration));
 for(const name of ['play','pause'])audio.addEventListener(name,updatePlayback);
 audio.addEventListener('timeupdate',()=>{
  if($('viewer').hidden||state.mode==='export')return;
  if(pendingSeek!==null){if(Math.abs(audio.currentTime-pendingSeek)>.2)return;pendingSeek=null;}
  if(state.mode==='explore'&&state.index>=0&&audio.currentTime>=T.pages[state.index].end-.03){audio.pause();audio.currentTime=T.pages[state.index].end-.04;applyTime(audio.currentTime);return;}
  applyTime(audio.currentTime);
 });
 audio.addEventListener('loadedmetadata',()=>{if(pendingSeek!==null)audio.currentTime=pendingSeek;});
 audio.addEventListener('seeked',()=>{if(pendingSeek!==null&&Math.abs(audio.currentTime-pendingSeek)>.2){audio.currentTime=pendingSeek;return;}pendingSeek=null;if(!$('viewer').hidden&&state.mode!=='export')applyTime(audio.currentTime);});
 audio.addEventListener('ended',()=>{state.ended=true;audio.pause();if(state.mode==='auto')$('endDialog').showModal();updatePlayback();});
 audio.addEventListener('error',()=>{$('status').textContent='讲解音频加载失败，请检查文件或网络。';});
 let previousChapter='';
 D.pages.forEach((p,i)=>{if(p.chapter!==previousChapter){const h=document.createElement('h3');h.textContent=p.chapter;$('chaptersList').append(h);previousChapter=p.chapter;}const b=document.createElement('button');b.dataset.chapter=i;const no=document.createElement('span');no.textContent=String(i+1).padStart(2,'0');b.append(no,document.createTextNode(p.title));b.addEventListener('click',()=>{$('chaptersDialog').close();seekTo(T.pages[i].start,state.mode==='auto'&&state.chapterWasPlaying);});$('chaptersList').append(b);});
 $('chaptersButton').addEventListener('click',()=>{state.chapterWasPlaying=!audio.paused;audio.pause();$('chaptersDialog').showModal();});
 $('textButton').addEventListener('click',()=>{audio.pause();$('textDialog').showModal();});
 $('optionsButton').addEventListener('click',()=>$('optionsDialog').showModal());
 document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));
 $('speed').addEventListener('change',()=>audio.playbackRate=Number($('speed').value));$('volume').addEventListener('input',()=>audio.volume=Number($('volume').value));
 $('captions').addEventListener('click',()=>{state.captions=!state.captions;$('captions').setAttribute('aria-pressed',String(state.captions));applyTime(audio.currentTime);});
 $('restartAll').addEventListener('click',()=>{$('optionsDialog').close();enter('auto');});
 $('endRestart').addEventListener('click',()=>{$('endDialog').close();enter('auto');});$('endExplore').addEventListener('click',()=>{$('endDialog').close();state.mode='explore';updatePlayback();});
 $('fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{$('status').textContent='当前浏览器未能进入全屏。';}});
 document.addEventListener('keydown',e=>{if($('viewer').hidden||document.querySelector('dialog[open]')||['INPUT','SELECT','BUTTON'].includes(document.activeElement.tagName))return;if(e.code==='Space'){e.preventDefault();if(audio.paused)play();else audio.pause();}else if(e.key==='ArrowLeft')seekTo(audio.currentTime-10);else if(e.key==='ArrowRight')seekTo(audio.currentTime+10);});
 window.reportExport={renderAt(t){audio.pause();state.mode='export';showViewer();document.body.classList.add('export-mode');applyTime(Math.max(0,Math.min(T.duration-.001,Number(t))));return {time:t,page:state.index,part:state.part};},duration:T.duration,pages:T.pages};
 window.reportReview={enter,seekTo,state,timeline:T,applyTime};
 const params=new URLSearchParams(location.search);if(params.has('export')){window.reportExport.renderAt(Number(params.get('t')||0));document.body.dataset.exportReady='true';}
 else if(params.has('page')){enter('explore');seekTo(T.pages[Math.min(D.pages.length-1,Math.max(0,Number(params.get('page'))-1))].start,false);}
 else if(location.hash){const index=D.pages.findIndex(p=>p.id===location.hash.slice(1));if(index>=0){enter('explore');seekTo(T.pages[index].start,false);}}
})();
