/* Local audio only. A change of slide always stops the previous explanation. */
(() => {
  'use strict';
  const pages=window.NARRATION_DATA, deck=document.querySelector('deck-stage');
  const audio=document.getElementById('narrationAudio');
  const toggle=document.getElementById('narrationToggle');
  const panel=document.getElementById('narrationPanel');
  const status=document.getElementById('narrationStatus');
  const title=document.getElementById('narrationTitle');
  let index=-1;
  function select(next){
    if(index===next)return;
    audio.pause();index=next;
    audio.src=pages[index].src;audio.load();
    title.textContent=pages[index].title;
    document.getElementById('notesBody').textContent=pages[index].text;
    status.textContent='点击播放本页讲解';toggle.textContent='播放讲解';
  }
  async function play(){
    try{await audio.play();}catch{status.textContent='暂时无法播放，请检查音频文件后重试';}
  }
  toggle.addEventListener('click',()=>audio.paused?play():audio.pause());
  document.getElementById('narrationControls').addEventListener('click',()=>{panel.hidden=!panel.hidden;});
  document.getElementById('narrationReplay').addEventListener('click',()=>{audio.currentTime=0;play();});
  document.getElementById('narrationClose').addEventListener('click',()=>{panel.hidden=true;});
  audio.addEventListener('play',()=>{toggle.textContent='暂停讲解';status.textContent='正在播放';});
  audio.addEventListener('pause',()=>{toggle.textContent='播放讲解';if(!audio.ended)status.textContent='已暂停';});
  audio.addEventListener('ended',()=>{toggle.textContent='播放讲解';status.textContent='本页讲解已结束，可重播';});
  audio.addEventListener('error',()=>{status.textContent='音频未能载入，请检查本地文件';toggle.textContent='播放讲解';});
  window.addEventListener('message',e=>{if(e.source===window&&typeof e.data?.slideIndexChanged==='number')select(e.data.slideIndexChanged);});
  window.addEventListener('pagehide',()=>audio.pause());
  customElements.whenDefined('deck-stage').then(()=>select(deck.currentSlide||0));
})();
