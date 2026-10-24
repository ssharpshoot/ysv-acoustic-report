(() => {
 'use strict';
 const D=window.PROJECT_DATA,NS='http://www.w3.org/2000/svg';
 const C={ink:'#edf3f5',muted:'#a3b5c0',line:'#304351',accent:'#70d1d3',FL:'#6bb6ef',FR:'#efa36e',C:'#71d3b9',lab:'#c4b5e0',front:'#efa36e',rear:'#c4b5e0'};
 let svg;
 const node=(tag,attrs={},value)=>{const n=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(attrs))n.setAttribute(k,v);if(value!==undefined)n.textContent=value;return n;};
 const add=(tag,a,t,parent=svg)=>{const n=node(tag,a,t);parent.append(n);return n;};
 const text=(x,y,t,size=25,color=C.muted,anchor='start')=>add('text',{x,y,'font-size':size,fill:color,'text-anchor':anchor},t);
 const line=(x1,y1,x2,y2,color=C.line,width=2,dash)=>add('line',{x1,y1,x2,y2,stroke:color,'stroke-width':width,...(dash?{'stroke-dasharray':dash}:{})});
 const rect=(x,y,w,h,fill='none',stroke=C.line)=>add('rect',{x,y,width:w,height:h,fill,stroke});
 const circle=(x,y,r,fill,stroke='none')=>add('circle',{cx:x,cy:y,r,fill,stroke});
 function setup(){const box=document.getElementById('visual');box.replaceChildren();svg=node('svg',{viewBox:'0 0 1200 650',role:'img'});box.append(svg);return box;}
 function axes(lo,hi,low,high,{percent=false,band=null}={}){
  const a={l:80,r:1150,t:65,b:550},X=f=>a.l+Math.log(f/lo)/Math.log(hi/lo)*(a.r-a.l),Y=v=>a.b-(v-low)/(high-low)*(a.b-a.t);
  if(band)rect(X(band[0]),a.t,X(band[1])-X(band[0]),a.b-a.t,'#70d1d31b','none');
  const ticks=percent?[.1,.3,1,3,10]:Array.from({length:Math.floor((high-low)/5)+1},(_,i)=>low+i*5);
  if(!percent)for(const v of ticks){line(a.l,Y(v),a.r,Y(v),v===0?'#536c7d':C.line,1);if(v%10===0||v===high)text(a.l-15,Y(v)+7,v,21,C.muted,'end');}
  const ft=lo<100?[20,27,38,55,80,120,200,300,500]:[100,200,500,1000,2000,5000,10000,20000];
  for(const f of ft)if(f>=lo&&f<=hi){line(X(f),a.t,X(f),a.b,C.line,1);text(X(f),a.b+36,f>=1000?f/1000+'k':f,21,C.muted,'middle');}
  const defs=add('defs'),clip=node('clipPath',{id:'curveClip'});clip.append(node('rect',{x:a.l,y:a.t,width:a.r-a.l,height:a.b-a.t}));defs.append(clip);
  text(a.l,30,percent?'额外杂音成分 / %':'相对电平 / dB',21);text(a.r,625,'频率 / Hz',20,C.muted,'end');
  return {X,Y,a,curve(points,color,opacity=1,dash=''){add('path',{d:points.filter(p=>p[0]>=lo&&p[0]<=hi).map(([f,v],i)=>(i?'L':'M')+X(f).toFixed(2)+','+Y(v).toFixed(2)).join(' '),fill:'none',stroke:color,'stroke-width':3,opacity,'stroke-dasharray':dash,'clip-path':'url(#curveClip)','data-real-curve':true});}};
 }
 const legend=items=>document.getElementById('visualLegend').replaceChildren(...items.map(([label,col])=>{const n=document.createElement('span');n.textContent=label;n.style.color=col;return n;}));
 function steps(items,part){items.forEach(([title,detail],i)=>{const y=100+i*163;rect(55,y-45,1090,125,i===part?'#70d1d311':'none',i===part?C.accent:C.line);text(85,y+5,String(i+1).padStart(2,'0'),40,C.accent);text(185,y,title,34,i===part?C.ink:C.muted);text(185,y+42,detail,24,C.muted);});}
 function room(part,kind='room',seat=3.6){
  const b={x:90,y:115,w:1010,h:455},X=x=>b.x+x/6.2*b.w,Y=y=>b.y+y/3*b.h;
  rect(b.x,b.y,b.w,b.h,'#132431',C.muted);rect(b.x,b.y,X(.8)-b.x,b.h,'#70d1d30d','none');line(X(.8),b.y,X(.8),b.y+b.h,C.accent,4);text(X(.8)+12,b.y-20,'幕布',24,C.accent);text(b.x,b.y-50,'前墙',25);text(b.x+b.w,b.y-50,'后墙',25,C.muted,'end');
  if(kind==='mode'){
   for(let i=0;i<100;i++){const value=Math.abs(Math.cos(i/99*Math.PI));rect(b.x+i*b.w/100,b.y,b.w/100+1,b.h,`rgba(112,209,211,${.07+.6*value})`,'none');}
   line(X(3.1),b.y,X(3.1),b.y+b.h,C.ink,2,'6 7');text(X(3.1),b.y+40,'中间较弱',23,C.ink,'middle');
  }
  const speakers=[['左主',.65,.27],['中置',.65,1.5],['右主',.65,2.73],['左侧',4,0.08],['右侧',4,2.92],['左后',6,.16],['右后',6,2.84]];
  if(kind==='equipment')for(const[n,x,y]of speakers){circle(X(x),Y(y),13,part===0&&x<1?C.accent:C.muted);text(X(x)+18,Y(y)+6,n,19);}
  const subs=[['左前',.15,.13],['右前',.15,2.87],['右后',6.05,2.87],['左后',6.05,.13]];
  subs.forEach(([name,x,y],i)=>{const active=kind==='subs'?i===[0,1,3][part]:part===2;rect(X(x)-12,Y(y)-12,24,24,active?C.accent:'#738d9b','none');if(kind==='subs'){const out=D.delivered.find(r=>r.channel==='SW'+(i+1));const yy=y<1?Y(y)+55:Y(y)-35;text(X(x)+(x<1?18:-18),yy,name,22,C.ink,x<1?'start':'end');if(out)text(X(x)+(x<1?18:-18),yy+28,part===0?(i===1||i===2?'反向配合':'原方向'):part===1?`${out.distance_m} m 等效时间距离`:`电平 ${Number(out.trim_db)>0?'+':''}${out.trim_db} dB`,19,C.accent,x<1?'start':'end');}});
  const sx=.8+Number(seat);circle(X(sx),Y(1.5),15,C.front,C.ink);text(X(sx),Y(1.5)-30,'主听位',23,C.ink,'middle');
  if(kind==='room'){text(b.x+30,b.y+70,'幕后约0.8 m',23,C.muted);line(X(.8),b.y+b.h+35,X(6.2),b.y+b.h+35,C.muted);text((X(.8)+X(6.2))/2,b.y+b.h+67,'幕布到后墙 5.4 m',24,C.muted,'middle');}
  if(kind==='seating'){text(600,620,`距幕 ${Number(seat).toFixed(1)} m · 距后墙 ${(5.4-Number(seat)).toFixed(1)} m`,29,C.accent,'middle');}
 }
 const controls=(items,onSelect)=>{const p=document.getElementById('visualControls');p.replaceChildren();for(const[key,label,active]of items){const b=document.createElement('button');b.textContent=label;b.setAttribute('aria-pressed',String(!!active));b.addEventListener('click',()=>onSelect(key));p.append(b);}};
 function render(page,part,opts={},onSelect=()=>{}){
  setup();legend([]);document.getElementById('visualControls').replaceChildren();
  document.getElementById('visualTitle').textContent=({room:'房间与主听位',equipment:'器材摆位',surfaces:'墙面与顶部结构',process:'测量与检查流程',fault:'左右后环绕对照',high:'实验室与现场对照',early:'主声之后的声音结构',mode:'长向共振分布示意',position:'同一只炮，不同位置',decay:'不同频段的收声趋势',ceiling:'四只天空声道对照',findings:'问题与处理对象',why:'现有系统怎样配合',settings:'音箱与低音炮的分工',subs:'四角低音炮设置',integration:'主箱与炮的计算合成',listening:'写入后的现场试听',seating:'座位比较区',actions:'器材与声路检查',treatment:'房间处理建议',verification:'后续检查方法',summary:'本阶段结论'})[page.type]||page.title;
  document.getElementById('visualNote').textContent='';
  let source='现场资料与本次技术分析';
  switch(page.type){
   case 'room':case 'equipment':room(part,page.type);source='房间尺寸、摆位：业主提供与现场视频核对；示意图含约值';break;
   case 'surfaces':case 'treatment':{
    text(90,70,'墙面：薄板直接贴墙',34,C.ink);rect(90,115,90,410,'#627483',C.muted);rect(180,115,20,410,C.accent,'none');text(235,180,'原墙面',25);text(235,235,'1.2 cm 聚酯纤维板',28,C.accent);
    text(635,70,'顶部：薄板下方有空腔',34,C.ink);rect(635,115,500,55,'#627483',C.muted);rect(635,170,500,240,part===2?'#70d1d319':'#ffffff04',C.line);rect(635,410,500,20,C.accent,'none');text(885,285,'18 cm 空腔 · 未填棉',28,part===2?C.accent:C.muted,'middle');text(885,480,'聚酯纤维板饰面',26,C.accent,'middle');
    text(600,605,page.type==='treatment'?['中高频：局部做可恢复的表面对照','低频：先比较位置和四炮配合','吊顶：看构造与安装，再定处理'][part]:['四面墙直接贴板','薄板更容易吸收中高频','空腔吊顶与直贴墙面构造不同'][part],30,C.ink,'middle');source='构造来自业主确认；图为剖面示意';break;}
   case 'process':steps([['REW 准备检查','7地面声道＋4单炮＋四炮合成'],['正式多点采集','主位重复，左右前后各25厘米'],['计算调整与数据复核','原始响应导入REW继续检查']],part);source='原生REW准备测量与GSonic原始批次；导入复核不是新增现场采集';break;
   case 'fault':{
    const a=axes(100,3000,-1.5,1.3,{percent:true});for(const v of [.1,.3,1,3,10]){line(a.a.l,a.Y(Math.log10(v)),a.a.r,a.Y(Math.log10(v)),C.line,1);text(a.a.l-15,a.Y(Math.log10(v))+6,v,21,C.muted,'end');}
    a.curve(D.distortion.BL.map(([f,v])=>[f,Math.log10(Math.max(v,.001))]),C.FL,part===1?.35:1);a.curve(D.distortion.BR.map(([f,v])=>[f,Math.log10(Math.max(v,.001))]),C.FR,part===0?.35:1);legend([['左后环绕',C.FL],['右后环绕（故障）',C.FR]]);source='原生REW扫频的失真记录；同批测量，故障由现场确认';break;}
   case 'high':{
    const selected=opts.channel||'all';const a=axes(200,20000,-25,15,{band:part>=1?[5000,10000]:null});
    for(const key of ['lab','FL','FR','C'])a.curve(D.lcr[key],C[key],key==='lab'||selected==='all'||selected===key?1:.12,key==='lab'?'9 7':'');
    legend([['实验室参照',C.lab],['左主箱',C.FL],['右主箱',C.FR],['中置',C.C]]);controls([['all','三只',selected==='all'],['FL','左',selected==='FL'],['FR','右',selected==='FR'],['C','中置',selected==='C']],key=>onSelect({channel:key}));source='现场GSonic主位；HT Labs同型号实验室曲线；各自500–2000 Hz作参考';break;}
   case 'early':{
    const names=['FL','FR','C'];for(let i=0;i<3;i++){const key=names[i],yy=130+i*175;line(100,yy,1130,yy,C.line);text(45,yy+7,{FL:'左',FR:'右',C:'中'}[key],25,C[key]);for(const peak of D.groups[key].earlyStrongest?Object.values(D.groups[key].earlyStrongest).slice(0,1):[]){const x=110+peak.delayMs/10*1000;line(x,yy,x,yy-75,C[key],part===i?6:3);text(x+14,yy-83,peak.delayMs.toFixed(2)+' ms',26,C[key]);}text(1130,yy+38,'主声后 0–10毫秒',19,C.muted,'end');}source='GSonic主位脉冲响应中的早到结构；标记来自测量，不指定反射物';break;}
   case 'mode':{
    room(part,'mode');text(600,45,'长向一阶 · 理论约27.7 Hz',32,C.accent,'middle');source='上图按6.2米房长计算，为理论分布；约27 Hz拖尾由两批实际测量支持';break;}
   case 'position':{
    const sw=opts.sw||'SW1',a=axes(20,120,-35,15,{band:[35,42]});for(const [p,col]of [['1',C.FL],['4',C.FR],['5',C.lab]])a.curve(D.positions[sw][p],col,part===0&&p!=='1'?.18:1);legend([['主位',C.FL],['前25厘米',C.FR],['后25厘米',C.lab]]);controls([['SW1','左前炮',sw==='SW1'],['SW2','右前炮',sw==='SW2'],['SW3','右后炮',sw==='SW3'],['SW4','左后炮',sw==='SW4']],key=>onSelect({sw:key}));source='GSonic校准前单炮多点；同一只炮各位置共用主位80–120 Hz参考，不比较四炮合成增益';break;}
   case 'decay':{
    const bars=D.decay;bars.forEach((b,i)=>{const x=125+i*170,h=b.seconds/.35*365;rect(x,520-h,90,h,i>=part*2&&i<part*2+2?C.accent:'#45616f','none');text(x+45,555,b.frequency>=1000?b.frequency/1000+'k':b.frequency,25,C.muted,'middle');text(x+45,500-h,b.seconds.toFixed(2)+' s',25,C.ink,'middle');});text(80,60,'中高频衰减时间趋势',31,C.ink);text(1120,615,'频率 / Hz',22,C.muted,'end');source='GSonic多点响应的独立分频段衰减估计；中位数表示趋势，不作为全房统一标准';break;}
   case 'ceiling':{
    const a=axes(60,500,-15,20,{band:[140,185]}),focus=part===0?'TFL':part===1?'TFR':null;for(const[k,col]of [['TFL',C.FL],['TFR',C.FR],['TRL',C.C],['TRR',C.lab]])a.curve(D.sky[k],col,!focus||focus===k?1:.22);legend([['前左',C.FL],['前右',C.FR],['后左',C.C],['后右',C.lab]]);source='GSonic天空声道主位原始测量；相对各自500–2000 Hz';break;}
   case 'findings':steps([['右后环绕故障','先修复单元，再纳入整套调试'],['前三声音失衡','高频偏弱，同时检查部分中频偏多'],['低频不均衡','共振拖尾与部分频段变弱并存']],part);break;
   case 'why':steps([['采集实际声音','记录每只音箱在几个位置的表现'],['计算怎样配合','低音分工、声音大小、到达时间'],['利用现有功放执行','协调系统配合，器材故障单独维修']],part);break;
   case 'settings':{
    const groups=[['左右主箱',60],['中置/侧环绕',80],['后环绕',60],['前天空',120],['后天空',110]];groups.forEach(([n,v],i)=>{const yy=100+i*100;text(70,yy,n,28);rect(340,yy-31,v/140*600,42,(part===0&&i<3)||(part===1&&i>=3)||part===2?C.accent:'#46606e','none');text(350+v/140*600,yy,v+' Hz',28,C.ink);});source='Evo32实际输出的分频设置；另有各声道电平和等效距离调整';break;}
   case 'subs':room(part,'subs');source='Evo32实际输出；SW1左前/SW2右前/SW3右后/SW4左后；距离含时间调整作用';break;
   case 'integration':{
    svg.setAttribute('viewBox','0 0 1769 730');add('image',{href:'assets/review-bass.png',x:0,y:0,width:1769,height:1408});if(part===1)rect(915,120,820,550,'none',C.accent);if(part===2)rect(30,120,820,550,'none',C.accent);source='Evo32 Review原图上半部；灰为主箱，紫为炮组，绿为计算合成';break;}
   case 'listening':steps([['高频','仍不够明亮、有劲'],['低频','能量和力度仍不足'],['下一阶段','针对器材故障、声路与房间继续处理']],part);source='现场写入后的试听反馈，与测量和Review反映的问题对应';break;
   case 'seating':{
    const seat=opts.seat||[3.6,3.3,3.0][part];room(part,'seating',seat);controls([[3.6,'当前3.6 m',Number(seat)===3.6],[3.3,'试3.3 m',Number(seat)===3.3],[3,'试3.0 m',Number(seat)===3]],key=>onSelect({seat:key}));source='按房间尺寸推算的候选位置，需兼顾38–60 Hz与观影舒适度；不是全系统最佳座位定论';break;}
   case 'actions':steps([['先维修','右后环绕恢复正常'],['查前三音箱','统一条件检查本体和朝向'],['做幕布对照','固定箱位麦位，分开看声路影响']],part);break;
   case 'verification':steps([['记清新状态','位置、音量、路由和设备设置'],['单路与合成比较','主箱、炮组、两者一起工作'],['多点测量与试听','声音是否更自然、连续、有力度']],part);break;
   case 'summary':steps([['已完成','系统检查、多点测量和配合调整'],['已找出','故障、前三高频偏弱、低频不均衡'],['按顺序继续','维修 → 声路 → 配合与房间处理']],part);break;
  }
  document.getElementById('source').textContent=source;
  svg.setAttribute('aria-label',page.title);
  document.getElementById('visual').dataset.part=part;
 }
 window.ReportVisuals={render};
})();
