/* Real curves and literal construction diagrams. Motion follows the audio time, never an independent timer. */
(() => {
 'use strict';
 const M=window.REPORT_DATA,D=window.SHOWCASE_DATA,$=id=>document.getElementById(id),NS='http://www.w3.org/2000/svg';
 const state={compare:'C',boundary:'main',follow:true,manual:false,phase:'',part:-1};
 const css=()=>getComputedStyle(document.body),color=n=>css().getPropertyValue('--'+n).trim();
 function node(tag,attrs={},text){const e=document.createElementNS(NS,tag);for(const [k,v]of Object.entries(attrs))e.setAttribute(k,String(v));if(text!==undefined)e.textContent=text;return e;}
 function add(parent,tag,attrs,text){const e=node(tag,attrs,text);parent.append(e);return e;}
 function text(p,x,y,t,size=24,fill=color('muted'),anchor='start'){return add(p,'text',{x,y,'font-size':size,fill,'text-anchor':anchor},t);}
 function line(p,x1,y1,x2,y2,stroke=color('line'),width=2,dash=''){return add(p,'line',{x1,y1,x2,y2,stroke,'stroke-width':width,'stroke-dasharray':dash});}
 function rect(p,x,y,width,height,fill,stroke='none',rx=0){return add(p,'rect',{x,y,width,height,fill,stroke,rx});}
 function group(p,key){return add(p,'g',{'data-focus':key});}
 function clear(id){const s=$(id);s.replaceChildren();return s;}
 function path(points,X,Y){return points.map(([f,v],i)=>(i?'L':'M')+X(f).toFixed(2)+','+Y(v).toFixed(2)).join(' ');}
 function axes(id,lo,hi,bottom=-30,top=15,band=null){
  const s=clear(id),a={l:70,r:1120,t:55,b:540},X=f=>a.l+Math.log(f/lo)/Math.log(hi/lo)*(a.r-a.l),Y=v=>a.b-(v-bottom)/(top-bottom)*(a.b-a.t);
  if(band)rect(s,X(band[0]),a.t,X(band[1])-X(band[0]),a.b-a.t,color('accent')+'18');
  for(let v=bottom;v<=top;v+=5){line(s,a.l,Y(v),a.r,Y(v),color('grid'),v===0?2:1);if(v%10===0||v===top)text(s,a.l-14,Y(v)+7,String(v),21,color('muted'),'end');}
  const ticks=lo<100?[20,30,40,60,80,100,160,200]:[200,500,1000,2000,5000,10000,20000];
  for(const f of ticks){if(f<lo||f>hi)continue;line(s,X(f),a.t,X(f),a.b,color('grid'),1);text(s,X(f),a.b+36,f>=1000?f/1000+'k':String(f),22,color('muted'),'middle');}
  text(s,a.l,28,'相对dB',21);text(s,a.r,a.b+68,'频率 / Hz',20,color('muted'),'end');
  const defs=add(s,'defs'),clip=add(defs,'clipPath',{id:id+'Clip'});rect(clip,a.l,a.t,a.r-a.l,a.b-a.t,'white');
  return {s,a,X,Y,clip:'url(#'+id+'Clip)'};
 }
 function compare(focus='all'){
  const a=axes('comparePlot',200,20000,-25,15,[5000,10000]),curves=M.compare[state.compare];
  for(const [key,c]of [['rew',color('warn')],['gsonic',color('mid')]])add(a.s,'path',{d:path(curves[key],a.X,a.Y),fill:'none',stroke:c,'stroke-width':3.5,opacity:focus==='all'||focus===key?1:.18,'clip-path':a.clip,'data-curve':key});
  if(focus==='band'){rect(a.s,a.X(5000),a.a.t,a.X(10000)-a.X(5000),a.a.b-a.a.t,'none',color('accent'));}
  $('comparePlot').dataset.channel=state.compare;$('comparePlot').dataset.focus=focus;
 }
 function lowSum(band=null){
  const a=axes('lowSumPlot',15,200,-30,15,band);add(a.s,'path',{d:path(M.lowSum,a.X,a.Y),fill:'none',stroke:color('mid'),'stroke-width':4,'clip-path':a.clip});
  if(band){line(a.s,a.X(band[0]),a.a.t,a.X(band[0]),a.a.b,color('accent'),2);line(a.s,a.X(band[1]),a.a.t,a.X(band[1]),a.a.b,color('accent'),2);text(a.s,(a.X(band[0])+a.X(band[1]))/2,35,band.join('–')+' Hz',24,color('accent'),'middle');}
  $('lowSumPlot').dataset.band=band?band.join('-'):'all';
 }
 function roomLayout(id='layoutPlot',phase='all'){
  const s=clear(id),sub=id==='subsPlot',box=sub?{x:40,y:120,w:710,h:344}:{x:50,y:95,w:960,h:465};
  const X=x=>box.x+x/6.2*box.w,Y=y=>box.y+y/3*box.h;
  rect(s,box.x,box.y,box.w,box.h,color('panel'),color('muted'));
  rect(s,box.x,box.y,X(.8)-box.x,box.h,color('accent')+'14');line(s,X(.8),box.y,X(.8),box.y+box.h,color('accent'),3);
  text(s,X(.8)+12,box.y+30,'幕布',sub?20:24,color('accent'));text(s,box.x,box.y-25,'前墙',24);text(s,box.x+box.w,box.y-25,'后墙',24,color('muted'),'end');
  if(!sub){text(s,box.x+box.w/2,box.y-25,'左墙',22,color('muted'),'middle');text(s,box.x+box.w/2,box.y+box.h+42,'右墙 · 门在主位附近',22,color('muted'),'middle');}
  const subs=[['SW1',.28,.28,'左前','正常'],['SW2',.28,2.72,'右前','反相'],['SW3',5.92,2.72,'右后','反相'],['SW4',5.92,.28,'左后','正常']];
  for(const [name,x,y,where,pol]of subs){
   const selected=phase==='all'||phase==='front'&&x<1||phase==='rear'&&x>5||phase==='polarity'&&pol==='反相'||phase==='trim'&&(name==='SW1'||name==='SW4');
   const g=add(s,'g',{opacity:selected?1:.25,'data-sub':name});rect(g,X(x)-27,Y(y)-24,54,48,pol==='反相'?color('warn'):color('accent'),color('ink'),3);text(g,X(x),Y(y)+7,name,sub?19:22,color('paper'),'middle');
   if(sub)text(g,X(x)+(x<1?36:-36),Y(y)+7,where+' / '+pol,20,color('ink'),x<1?'start':'end');
  }
  const mlp=group(s,'room-seat');add(mlp,'circle',{cx:X(4.4),cy:Y(1.5),r:17,fill:color('warn'),stroke:color('ink'),'stroke-width':2});text(mlp,X(4.4),Y(1.5)-30,'主位',25,color('ink'),'middle');
  if(!sub){
   for(const [x,y]of [[4.15,1.5],[4.65,1.5],[4.4,1.25],[4.4,1.75]])add(mlp,'circle',{cx:X(x),cy:Y(y),r:7,fill:color('ink')});
   const front=group(s,'room-front');for(const [y,name]of [[.6,'左'],[1.5,'中'],[2.4,'右']]){rect(front,X(.65)-13,Y(y)-22,26,44,color('fl'));text(front,X(.65)-25,Y(y)+7,name,20,color('fl'),'end');}
   line(s,X(4.0),Y(3),X(4.9),Y(3),color('warn'),6,'10 5');
   text(s,box.x+box.w+25,box.y+box.h/2,'3m',25,color('ink'));
   text(s,box.x+box.w/2,box.y+box.h+80,'实体墙间总长约6.2m；幕至后墙5.4m',23,color('muted'),'middle');
   if(phase==='front')rect(s,box.x,box.y,X(1)-box.x,box.h,'none',color('accent'));
   if(phase==='seat')rect(s,X(3.9),Y(.95),X(4.95)-X(3.9),Y(2.05)-Y(.95),'none',color('accent'));
   if(phase==='rear')rect(s,X(5.6),box.y,X(6.2)-X(5.6),box.h,'none',color('accent'));
  }else{
   text(s,400,540,'极性和距离是本次配合参数',26,color('muted'),'middle');text(s,400,585,'需测实际相加，不按卷尺改回',26,color('accent'),'middle');
  }
  s.dataset.phase=phase;
 }
 function boundaries(focus='all'){
  const s=clear('boundaryPlot'),L=state.boundary==='main'?6.2:5.4,H=state.boundary==='main'?2.36:2.54;
  const rows=[['长度',L,'length'],['宽度',3,'width'],['高度',H,'height']],X=f=>210+(f-15)/145*870;
  for(let i=0;i<3;i++){
   const [name,dim,key]=rows[i],y=130+i*155,g=add(s,'g',{opacity:focus==='all'||focus===key?1:.3});
   text(g,20,y,name,33,color('ink'));text(g,20,y+45,dim.toFixed(2)+'m',24);line(g,210,y+10,1080,y+10);
   for(const n of[1,2]){const f=343/(2*dim)*n;add(g,'circle',{cx:X(f),cy:y+10,r:n===1?13:10,fill:color('accent')});line(g,X(f),y+10,X(f),y-35,color('accent'));text(g,X(f),y-52,f.toFixed(1)+'Hz',27,color('ink'),'middle');text(g,X(f),y+60,n===1?'一阶':'二阶',22,color('muted'),'middle');}
  }
  text(s,210,640,'15',20);text(s,1080,640,'160 Hz',20,color('muted'),'end');
  s.dataset.model=state.boundary;s.dataset.focus=focus;
 }
 function wall(phase='all'){
  const s=clear('wallPlot'),g=group(s,'wall-thin');
  rect(g,70,70,155,265,color('muted'));rect(g,225,70,22,265,color('accent'));text(g,145,380,'原墙',26,color('ink'),'middle');text(g,290,120,'聚酯板 12mm',32,color('accent'));line(g,247,140,420,140,color('accent'));text(g,290,180,'直接铺贴，没有厚空气层',24);
  text(s,580,100,'室内声音的反射',30,color('ink'));
  const hi=group(s,'wall-high');rect(hi,580,150,465,65,color('accent')+'22');text(hi,610,192,'中高频：更容易改变反射',28,color('accent'));
  const low=group(s,'wall-low');rect(low,580,255,465,65,color('warn')+'18');text(low,610,297,'低频：不能据面积判定有效',27,color('warn'));
  text(s,580,385,'结构示意，不是吸声系数曲线。',23);
  s.dataset.phase=phase;
 }
 function ceiling(phase='all'){
  const s=clear('ceilingPlot'),cavity=group(s,'ceiling-cavity');
  rect(cavity,95,50,900,30,color('muted'));text(cavity,1000,72,'原顶',23,color('muted'));
  rect(cavity,95,80,900,210,color('accent')+'0d',color('line'));text(cavity,545,170,'约18cm空气层',44,color('accent'),'middle');text(cavity,545,222,'未填棉',27,color('muted'),'middle');
  rect(cavity,95,290,900,14,color('accent'));text(cavity,545,350,'12mm聚酯板 · 完成面净高2.36m',29,color('ink'),'middle');
  const bass=group(s,'ceiling-bass');line(bass,65,80,65,290,color('accent'),3);text(bass,55,200,'18cm',21,color('accent'),'end');text(bass,545,410,'原顶2.54m仅作替代模型，边界待核验',24,color('muted'),'middle');
  const photo=document.querySelector('.ceiling-slide .photo-column img');
  if(photo){photo.src='assets/images/'+(phase==='ceiling-reflection'?'room-front.jpg':'room-ceiling.jpg');photo.alt=phase==='ceiling-reflection'?'业主视频中的幕前器材与硬质地面':'业主视频中的聚酯板吊顶';photo.nextElementSibling.textContent=phase==='ceiling-reflection'?'幕前器材与地面是候选反射路径，具体原因尚未定位。':'现场顶面；空气层与无填棉情况由业主确认。';}
  s.dataset.phase=phase;
 }
 function tests(phase='all',progress=0){
  const s=clear('hfTestsPlot');
  for(let i=0;i<3;i++){
   const start=i*575,g=add(s,'g',{transform:`translate(${start},0)`,opacity:phase==='all'||phase===['screen','aim','body'][i]?1:.35});
   const box=add(g,'g',{transform:i===1&&phase==='aim'?`rotate(${-22*Math.sin(progress*Math.PI)},120,210)`:'rotate(0,120,210)'});
   rect(box,70,145,100,130,color('panel'),color('fl'));rect(box,160,180,10,60,color('fl'));
   add(g,'circle',{cx:450,cy:210,r:17,fill:color('warn')});line(g,180,210,428,210,color('accent'),3);
   if(i===0){const shifted=phase==='screen'&&progress>.5;line(g,300,shifted?20:90,300,shifted?85:330,color('muted'),5,'10 5');text(g,300,360,shifted?'幕布移开':'幕布在位',27,color('muted'),'middle');}
   if(i===1)text(g,280,360,'只转朝向，箱麦不搬',25,color('muted'),'middle');
   if(i===2){line(g,270,75,270,320,color('line'),2,'5 9');text(g,280,360,'幕外统一距离',27,color('muted'),'middle');text(g,270,50,'独立本体检查',26,color('accent'),'middle');}
   text(g,120,120,'音箱',24,color('fl'),'middle');text(g,450,270,'测量点',24,color('warn'),'middle');
  }
  s.dataset.phase=phase;s.dataset.progress=progress.toFixed(3);
 }
 function highlight(active,key){
  active.classList.add('motion-on');
  for(const c of [...active.classList])if(c.startsWith('motion-')&&c!=='motion-on')active.classList.remove(c);
  active.classList.add('motion-'+key);active.dataset.motion=key;
  const aliases={
   'subs-front':['subs-SW1','subs-SW2'],'subs-polarity':['subs-SW2','subs-SW3','subs-polarity'],'subs-trim':['subs-SW1','subs-SW4','subs-trim']};
  const targets=aliases[key]||[key];for(const e of active.querySelectorAll('[data-focus]'))e.classList.toggle('is-talking',targets.includes(e.dataset.focus));
 }
 function press(selector){const e=document.querySelector(selector);if(e)e.click();}
 function act(key,progress=0){
  const active=document.querySelector('.slide.active');if(!active)return;
  highlight(active,key);
  if(key.startsWith('room-')&&key!=='room-modes')roomLayout('layoutPlot',key.split('-')[1]);
  if(key.startsWith('compare-'))compare(key==='compare-rew'?'rew':key==='compare-gsonic'?'gsonic':'band');
  if(key.startsWith('boundary-')){
   const type=key.split('-')[1];state.boundary=(type==='height'||type==='length')&&progress>.5?'alternate':'main';boundaries(type);for(const b of $('boundaryControls').querySelectorAll('button'))b.classList.toggle('active',b.dataset.boundary===state.boundary);
  }
  if(key==='mode-position'){
   const pos=['4','1','5'][Math.min(2,Math.floor(progress*3))];press(`#positionControls button[data-pos="${pos}"]`);
  }
  if(key==='mode-field'){press('#modeControls button[data-mode="length"]');press('#positionControls button[data-pos="1"]');}
  if(key==='mode-main'){press('#positionControls button[data-pos="1"]');}
  if(key.startsWith('wall-'))wall(key);
  if(key.startsWith('ceiling-'))ceiling(key);
  if(key.startsWith('subs-'))roomLayout('subsPlot',key==='subs-front'?'front':key==='subs-polarity'?'polarity':'trim');
  if(key==='hf-reference'){window.SHOWCASE_TEST.state.channel='lab';press('#channelControls button[data-channel="all"]');for(const p of $('hfPlot').querySelectorAll('[data-curve]'))if(p.dataset.curve!=='lab')p.setAttribute('opacity','.13');}
  if(key==='hf-band'){
   const ch=['FL','FR','C'][Math.min(2,Math.floor(progress*3))];press(`#channelControls button[data-channel="${ch}"]`);
   const selected={FL:'.metric-fl',FR:'.metric-fr',C:'.metric-c'}[ch];for(const e of active.querySelectorAll('.band-values>div'))e.style.opacity=e.matches(selected)?'1':'.3';
  }
  if(key==='hf-next'){press('#channelControls button[data-channel="all"]');for(const e of active.querySelectorAll('.band-values>div'))e.style.opacity='1';}
  if(['hf-screen','hf-aim','hf-body'].includes(key))tests(key.split('-')[1],progress);
  if(key.startsWith('bass-'))lowSum(key==='bass-deep'?[20,40]:key==='bass-handover'?[40,80]:[80,160]);
 }
 function resetGraphics(){
  for(const s of document.querySelectorAll('.slide')){for(const c of [...s.classList])if(c.startsWith('motion-'))s.classList.remove(c);delete s.dataset.motion;for(const e of s.querySelectorAll('.is-talking'))e.classList.remove('is-talking');}
  state.compare='C';state.boundary='main';compare();lowSum();roomLayout();roomLayout('subsPlot');boundaries();wall();ceiling();tests();
  press('#modeControls button[data-mode="length"]');press('#positionControls button[data-pos="1"]');press('#channelControls button[data-channel="all"]');
  for(const e of document.querySelectorAll('.band-values>div'))e.style.opacity='1';state.phase='';state.part=-1;
 }
 let lastTag='',lastProgress=-1;
 function motion(index,time){
  if(!state.follow)return;
  const audioPage=window.NARRATION_DATA[index];if(!audioPage?.cues?.length)return;
  const cues=audioPage.cues;let cue=cues[0];for(const c of cues)if(c.start<=time)cue=c;
  const p=Math.max(0,Math.min(.999,(time-cue.start)/Math.max(.01,cue.end-cue.start))),part=Math.floor(p*3);
  const tag=index+':'+cue.key+':'+part;
  // Position/variable demonstrations change information; do not redraw every chart each frame.
  const continuous=['hf-aim'].includes(cue.key);
  if(tag!==lastTag||continuous&&Math.abs(p-lastProgress)>.025){act(cue.key,p);lastTag=tag;lastProgress=p;state.phase=cue.key;state.part=part;}
  const labelMap={'mode-position':'前、主、后三个测点','mode-field':'按房间尺寸看的强弱分布','mode-main':'回到主位，结合周围测点','wall-thin':'12mm板直接贴在原墙上','subs-front':'四只炮的时间与电平分工','hf-reference':'实验室参照与现场曲线','hf-band':'5–10kHz与三只音箱','hf-next':'幕布对照与幕外检查'};
  const heading=document.querySelector('.slide.active [data-focus="'+cue.key+'"] h2');
  $('cueLabel').textContent='正在讲：'+(labelMap[cue.key]||heading?.textContent||M.pages[index].title);
 }
 function follow(on){state.follow=on;state.manual=!on;lastTag='';$('followMotion').setAttribute('aria-pressed',String(on));$('followMotion').textContent=on?'跟随讲解':'恢复跟随';if(on)motion(document.querySelector('deck-stage').currentSlide||0,$('narrationAudio').currentTime);else $('cueLabel').textContent='已交给手动操作；点击“恢复跟随”可继续联动。';}
 $('followMotion').addEventListener('click',()=>follow(!state.follow));
 document.addEventListener('click',e=>{if(e.isTrusted&&e.target.closest('#modeControls,#positionControls,#channelControls,#compareControls,#boundaryControls'))follow(false);},true);
 $('compareControls').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;state.compare=b.dataset.compare;for(const c of $('compareControls').querySelectorAll('button'))c.classList.toggle('active',c===b);compare();});
 $('boundaryControls').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;state.boundary=b.dataset.boundary;for(const c of $('boundaryControls').querySelectorAll('button'))c.classList.toggle('active',c===b);boundaries();});
 $('chapterSelect').addEventListener('change',()=>document.querySelector('deck-stage').goTo(Number($('chapterSelect').value)));
 window.addEventListener('narrationtime',e=>motion(e.detail.index,e.detail.time));
 window.addEventListener('narrationrestart',()=>{resetGraphics();follow(true);});
 window.addEventListener('message',e=>{if(e.source===window&&typeof e.data?.slideIndexChanged==='number'){
  $('chapterSelect').value=String(e.data.slideIndexChanged);state.follow=true;state.manual=false;lastTag='';$('followMotion').textContent='跟随讲解';$('followMotion').setAttribute('aria-pressed','true');$('cueLabel').textContent='点击播放，图表会跟随本页讲解。';
 }});
 window.addEventListener('beforeprint',()=>{$('narrationAudio').pause();resetGraphics();});
 resetGraphics();
 window.REPORT_MOTION={state};window.__reportReady=true;
})();
