/* All plotted curves use archived numeric evidence. The room heat map is an ideal modal field. */
(() => {
  'use strict';
  const D=window.SHOWCASE_DATA, $=id=>document.getElementById(id);
  const state={mode:'length',pos:'1',channel:'all'};
  const positions=Object.fromEntries(D.positions.map(p=>[p.id,p]));
  const NS='http://www.w3.org/2000/svg';
  const style=()=>getComputedStyle(document.body);
  const col=n=>style().getPropertyValue('--'+n).trim();
  function el(tag,attrs,text){const n=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(attrs||{}))n.setAttribute(k,String(v));if(text!==undefined)n.textContent=text;return n;}
  function add(svg,tag,attrs,text){const n=el(tag,attrs,text);svg.append(n);return n;}
  function label(svg,x,y,text,size=23,fill=col('muted'),anchor='start'){return add(svg,'text',{x,y,fill,'font-size':size,'text-anchor':anchor},text);}
  function line(svg,x1,y1,x2,y2,stroke=col('grid'),width=1,dash=''){return add(svg,'line',{x1,y1,x2,y2,stroke,'stroke-width':width,'stroke-dasharray':dash});}
  function pressure(mode,x,y){return mode==='length'?Math.cos(2*Math.PI*x/D.room.length):Math.cos(Math.PI*y/D.room.width);}
  function heat(v){const dark=document.body.classList.contains('theater');const a=dark?[20,38,52]:document.body.classList.contains('field')?[246,241,230]:[242,247,250];const b=dark?[92,191,196]:document.body.classList.contains('field')?[164,91,50]:[22,110,142];return `rgb(${a.map((c,i)=>Math.round(c+(b[i]-c)*v)).join(',')})`;}
  function room(){
    const svg=$('roomPlot');svg.replaceChildren();const box={x:62,y:28,w:735,h:735*3/6.2},p=positions[state.pos];
    const X=x=>box.x+x/D.room.length*box.w,Y=y=>box.y+y/D.room.width*box.h;
    for(let i=0;i<62;i++)for(let j=0;j<24;j++){const x=(i+.5)*D.room.length/62,y=(j+.5)*D.room.width/24;add(svg,'rect',{x:X(i*D.room.length/62),y:Y(j*D.room.width/24),width:box.w/62+.3,height:box.h/24+.3,fill:heat(Math.abs(pressure(state.mode,x,y)))});}
    add(svg,'rect',{x:box.x,y:box.y,width:box.w,height:box.h,fill:'none',stroke:col('muted'),'stroke-width':2});
    add(svg,'rect',{x:box.x,y:box.y,width:X(.8)-box.x,height:box.h,fill:col('ink'),opacity:.06});
    line(svg,X(.8),box.y,X(.8),box.y+box.h,col('ink'),3);label(svg,X(.8)+10,box.y+26,'幕布',20,col('ink'));
    for(const xx of[.32,5.88])for(const yy of[.32,2.68])add(svg,'rect',{x:X(xx)-14,y:Y(yy)-14,width:28,height:28,fill:col('ink'),rx:3,opacity:.8});
    if(state.mode==='length'){for(const x of[1.55,4.65])line(svg,X(x),box.y,X(x),box.y+box.h,col('muted'),1.7,'6 6');}
    else line(svg,box.x,Y(1.5),box.x+box.w,Y(1.5),col('muted'),1.7,'6 6');
    const measured=[...D.positions,{id:'2',x:4.4,y:1.25},{id:'3',x:4.4,y:1.75}];
    for(const q of measured)add(svg,'circle',{cx:X(q.x),cy:Y(q.y),r:q.id===state.pos?12:6,fill:q.id===state.pos?col('front'):col('paper'),stroke:col('ink'),'stroke-width':2});
    label(svg,X(p.x)-20,Y(p.y)-24,p.label,21,col('ink'),'end');
    label(svg,box.x,box.y+box.h+27,'前墙',18);label(svg,box.x+box.w,box.y+box.h+27,'后墙',18,col('muted'),'end');
    label(svg,box.x+box.w/2,box.y+box.h+27,'总长约6.2 m · 宽约3 m',18,col('muted'),'middle');
    label(svg,850,62,state.mode==='length'?'长向二阶':'宽向一阶',26,col('ink'));label(svg,850,104,state.mode==='length'?'55.3 Hz':'57.2 Hz',32,col('accent'));
    label(svg,850,158,'颜色表示',22);label(svg,850,192,'该模态的相对强弱',22);
    for(let i=0;i<10;i++)add(svg,'rect',{x:850+i*20,y:220,width:21,height:17,fill:heat(i/9)});
    label(svg,850,266,'弱',19);label(svg,1050,266,'强',19,col('muted'),'end');label(svg,850,324,'虚线：理想节点',19);
    $('positionName').textContent=p.label;$('nullValue').textContent=p.nullHz.toFixed(1);
    $('modeName').textContent=state.mode==='length'?'长向二阶 · 55.3 Hz':'宽向一阶 · 57.2 Hz';
    $('pressureValue').previousSibling.textContent='该点理论相对声压 ';
    $('pressureValue').textContent=Math.abs(pressure(state.mode,p.x,p.y)).toFixed(2);
    svg.dataset.pressure=Math.abs(pressure(state.mode,p.x,p.y)).toFixed(8);
  }
  function pointsPath(points,X,Y){return points.map(([f,v],i)=>(i?'L':'M')+X(f).toFixed(2)+','+Y(v).toFixed(2)).join(' ');}
  function bass(){
    const svg=$('bassPlot');svg.replaceChildren();const a={l:65,r:1090,t:29,b:193},X=f=>a.l+(Math.log(f/28)/Math.log(90/28))*(a.r-a.l),Y=v=>a.b-(v+45)/65*(a.b-a.t);
    const defs=add(svg,'defs',{});defs.append(el('clipPath',{id:'bassClip'}));defs.firstChild.append(el('rect',{x:a.l,y:a.t,width:a.r-a.l,height:a.b-a.t}));
    for(const v of[-40,-20,0,20]){line(svg,a.l,Y(v),a.r,Y(v));label(svg,a.l-12,Y(v)+7,String(v),22,col('muted'),'end');}
    for(const f of[30,40,50,60,80]){line(svg,X(f),a.t,X(f),a.b);label(svg,X(f),a.b+27,String(f),22,col('muted'),'middle');}
    label(svg,a.l-5,20,'相对dB',17);label(svg,a.r,a.b+27,'Hz',18,col('muted'),'end');
    const colors={'4':col('front'),'1':col('mid'),'5':col('rear')};
    for(const key of['4','1','5'])add(svg,'path',{d:pointsPath(D.sw[key],X,Y),fill:'none',stroke:colors[key],'stroke-width':state.pos===key?4.4:2.4,opacity:state.pos===key?1:.42,'clip-path':'url(#bassClip)'});
    for(const [i,key]of['4','1','5'].entries()){line(svg,540+i*185,12,568+i*185,12,colors[key],4);label(svg,577+i*185,19,positions[key].label,22,colors[key]);}
  }
  const hfAxis={l:66,r:1092,t:43,b:500};
  const HF_X=f=>hfAxis.l+Math.log10(f/200)/2*(hfAxis.r-hfAxis.l),HF_Y=v=>hfAxis.b-(v+22)/32*(hfAxis.b-hfAxis.t);
  function hf(){
    const svg=$('hfPlot');svg.replaceChildren();const a=hfAxis;
    add(svg,'rect',{x:HF_X(5000),y:a.t,width:HF_X(10000)-HF_X(5000),height:a.b-a.t,fill:col('accent'),opacity:.07});
    const defs=add(svg,'defs',{}),clip=el('clipPath',{id:'hfClip'});clip.append(el('rect',{x:a.l,y:a.t,width:a.r-a.l,height:a.b-a.t}));defs.append(clip);
    for(const v of[-20,-15,-10,-5,0,5,10]){line(svg,a.l,HF_Y(v),a.r,HF_Y(v),col('grid'),v===0?2:1);label(svg,a.l-15,HF_Y(v)+8,String(v),21,col('muted'),'end');}
    for(const f of[200,500,1000,2000,5000,10000,20000]){line(svg,HF_X(f),a.t,HF_X(f),a.b);label(svg,HF_X(f),a.b+37,f>=1000?(f/1000)+'k':String(f),22,col('muted'),'middle');}
    label(svg,a.l,24,'相对dB',19);label(svg,a.r,a.b+67,'频率 / Hz',19,col('muted'),'end');
    label(svg,(HF_X(5000)+HF_X(10000))/2,29,'5–10 kHz',21,col('accent'),'middle');
    const colors={lab:col('lab'),FL:col('fl'),FR:col('fr'),C:col('center')};
    for(const key of['lab','FL','FR','C']){
      const visible=state.channel==='all'||state.channel===key||key==='lab';
      add(svg,'path',{d:pointsPath(D.lcr[key],HF_X,HF_Y),fill:'none',stroke:colors[key],'stroke-width':key==='lab'?3.7:3.2,opacity:visible?1:.10,'stroke-dasharray':key==='lab'?'10 5':'','clip-path':'url(#hfClip)','data-curve':key});
    }
    add(svg,'line',{id:'crosshair',x1:a.l,y1:a.t,x2:a.l,y2:a.b,stroke:col('ink'),'stroke-width':1,'stroke-dasharray':'3 5',visibility:'hidden'});
  }
  function interp(points,f){if(f<points[0][0]||f>points.at(-1)[0])return null;let i=1;while(i<points.length&&points[i][0]<f)i++;if(i>=points.length)return points.at(-1)[1];const [fa,va]=points[i-1],[fb,vb]=points[i];return fb===fa?vb:va+(vb-va)*Math.log(f/fa)/Math.log(fb/fa);}
  function readAt(event){const svg=$('hfPlot'),point=svg.createSVGPoint();point.x=event.clientX;point.y=event.clientY;const p=point.matrixTransform(svg.getScreenCTM().inverse());if(p.x<hfAxis.l||p.x>hfAxis.r||p.y<hfAxis.t||p.y>hfAxis.b)return;const f=200*10**((p.x-hfAxis.l)/(hfAxis.r-hfAxis.l)*2);const keys=state.channel==='all'?['FL','FR','C']: [state.channel],names={FL:'左',FR:'右',C:'中置',lab:'实验室'};const fields=['lab',...keys].map(k=>{const v=interp(D.lcr[k],f);return v===null?null:names[k]+' '+v.toFixed(1)+' dB';}).filter(Boolean);$('hfReadout').textContent=Math.round(f)+' Hz　'+fields.join('　');const cross=$('crosshair');cross.setAttribute('x1',p.x);cross.setAttribute('x2',p.x);cross.setAttribute('visibility','visible');}
  function active(group,key,value){for(const b of $(group).querySelectorAll('button')){const on=b.dataset[key]===value;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));}}
  $('modeControls').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;state.mode=b.dataset.mode;active('modeControls','mode',state.mode);room();});
  $('positionControls').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;state.pos=b.dataset.pos;active('positionControls','pos',state.pos);room();bass();});
  $('channelControls').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;state.channel=b.dataset.channel;active('channelControls','channel',state.channel);hf();$('hfReadout').textContent='点按曲线，可查看对应频率的相对电平。';});
  $('hfPlot').addEventListener('pointermove',readAt);$('hfPlot').addEventListener('pointerdown',readAt);
  const deck=document.querySelector('deck-stage');
  const notes=window.NARRATION_DATA.map(page=>page.text);
  function updateNotes(){$('notesBody').textContent=notes[deck.currentSlide||0];$('previous').disabled=(deck.currentSlide===0);$('next').disabled=(deck.currentSlide===1);}
  $('previous').addEventListener('click',()=>{deck.prev();updateNotes();});$('next').addEventListener('click',()=>{deck.next();updateNotes();});
  function toggleNotes(show){$('speakerNotes').hidden=!show;$('notesToggle').setAttribute('aria-expanded',String(show));updateNotes();}
  $('notesToggle').addEventListener('click',()=>toggleNotes($('speakerNotes').hidden));$('notesClose').addEventListener('click',()=>toggleNotes(false));
  $('fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{$('fullscreen').textContent='请按F11';}});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')toggleNotes(false);});
  window.addEventListener('message',e=>{if(e.source===window&&typeof e.data?.slideIndexChanged==='number')updateNotes();});
  customElements.whenDefined('deck-stage').then(()=>requestAnimationFrame(()=>{
    const s=document.createElement('style');s.textContent='.nav-zone{display:none!important}.counter{bottom:24px;right:20px;border-radius:5px;font-size:14px;opacity:1}';deck.shadowRoot.append(s);
    const r=$('hfPlot');r.style.touchAction='pan-y';updateNotes();
  }));
  room();bass();hf();for(const args of[['modeControls','mode',state.mode],['positionControls','pos',state.pos],['channelControls','channel',state.channel]])active(...args);
  window.SHOWCASE_TEST={state,pressure,interp,expectedHighBand:D.highBand,room:D.room};window.__ready=true;
})();
