(() => {
 'use strict';
 const pages=window.NARRATION_DATA,deck=document.querySelector('deck-stage'),audio=document.getElementById('narrationAudio');
 const $=id=>document.getElementById(id),button=$('narrationToggle'),status=$('narrationStatus'),panel=$('narrationPanel');
 let index=-1,frame=0,started=false;
 function tick(){cancelAnimationFrame(frame);if(!started)return;window.dispatchEvent(new CustomEvent('narrationtime',{detail:{index,time:audio.currentTime,duration:audio.duration}}));if(!audio.paused&&!audio.ended)frame=requestAnimationFrame(tick);}
 function select(next){if(index===next)return;audio.pause();cancelAnimationFrame(frame);started=false;index=next;audio.src=pages[index].src;audio.load();panel.hidden=true;$('narrationTitle').textContent=pages[index].title;$('notesBody').textContent=pages[index].text;button.textContent='播放讲解';status.textContent='点击播放本页讲解';}
 async function play(){try{await audio.play();}catch{status.textContent='音频暂时无法播放，请稍后重试';}}
 button.addEventListener('click',()=>audio.paused?play():audio.pause());
 $('narrationControls').addEventListener('click',()=>{panel.hidden=!panel.hidden;});$('narrationClose').addEventListener('click',()=>{panel.hidden=true;});
 $('narrationReplay').addEventListener('click',()=>{audio.currentTime=0;window.dispatchEvent(new CustomEvent('narrationrestart'));play();});
 audio.addEventListener('play',()=>{started=true;button.textContent='暂停讲解';status.textContent='正在播放 · 画面按配音时间联动';tick();});
 audio.addEventListener('pause',()=>{button.textContent='播放讲解';if(!audio.ended)status.textContent='已暂停';tick();});
 audio.addEventListener('seeked',()=>{if(audio.currentTime>0)started=true;tick();});audio.addEventListener('timeupdate',()=>{if(audio.paused)tick();});
 audio.addEventListener('ended',()=>{button.textContent='播放讲解';status.textContent='本页讲解结束，可重播';tick();});
 audio.addEventListener('error',()=>{status.textContent='音频未载入，请检查网络或本地资源';button.textContent='播放讲解';});
 window.addEventListener('message',e=>{if(e.source===window&&typeof e.data?.slideIndexChanged==='number')select(e.data.slideIndexChanged);});
 window.addEventListener('pagehide',()=>audio.pause());customElements.whenDefined('deck-stage').then(()=>select(deck.currentSlide||0));
})();
