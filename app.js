const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const definitions=[
{id:'variable',label:'Variable',symbol:'x',group:'GRUNDLAGEN',fields:['Wert'],values:['x']},
{id:'number',label:'Zahl',symbol:'123',group:'GRUNDLAGEN',fields:['Wert'],values:['2']},
{id:'placeholder',label:'Platzhalter',symbol:'□',group:'GRUNDLAGEN',fields:['Bezeichnung'],values:['']},
{id:'fraction',label:'Bruch',symbol:'<span class="fraction"><span>a</span><span>b</span></span>',group:'STRUKTUREN',fields:['Zähler','Nenner'],values:['a','b']},
{id:'power',label:'Potenz',symbol:'x<sup>n</sup>',group:'STRUKTUREN',fields:['Basis','Exponent'],values:['x','2']},
{id:'subscript',label:'Index',symbol:'x<sub>i</sub>',group:'STRUKTUREN',fields:['Basis','Index'],values:['x','i']},
{id:'root',label:'Wurzel',symbol:'√x',group:'STRUKTUREN',fields:['Radikand'],values:['x']},
{id:'parentheses',label:'Klammer',symbol:'(x)',group:'STRUKTUREN',fields:['Inhalt'],values:['x']},
{id:'abs',label:'Betrag',symbol:'|x|',group:'STRUKTUREN',fields:['Inhalt'],values:['x']},
{id:'plus',label:'Plus',symbol:'+',group:'OPERATOREN',values:[]},
{id:'minus',label:'Minus',symbol:'−',group:'OPERATOREN',values:[]},
{id:'multiply',label:'Mal',symbol:'×',group:'OPERATOREN',values:[]},
{id:'divide',label:'Geteilt',symbol:'÷',group:'OPERATOREN',values:[]},
{id:'equal',label:'Gleich',symbol:'=',group:'OPERATOREN',values:[]},
{id:'approx',label:'Ungefähr',symbol:'≈',group:'OPERATOREN',values:[]},
{id:'sum',label:'Summe',symbol:'∑',group:'FUNKTIONEN & SYMBOLE',fields:['Untere Grenze','Obere Grenze','Term'],values:['i=1','n','x']},
{id:'integral',label:'Integral',symbol:'∫',group:'FUNKTIONEN & SYMBOLE',fields:['Untere Grenze','Obere Grenze','Integrand','Variable'],values:['0','1','x','x']},
{id:'function',label:'Funktion',symbol:'ƒ(x)',group:'FUNKTIONEN & SYMBOLE',fields:['Funktion','Argument'],values:['sin','x']},
{id:'pi',label:'Pi',symbol:'π',group:'FUNKTIONEN & SYMBOLE',values:[]},
{id:'infinity',label:'Unendlich',symbol:'∞',group:'FUNKTIONEN & SYMBOLE',values:[]},
{id:'theta',label:'Theta',symbol:'θ',group:'FUNKTIONEN & SYMBOLE',values:[]},
{id:'product',label:'Produkt',symbol:'∏',group:'WEITERE ELEMENTE',fields:['Untere Grenze','Obere Grenze','Term'],values:['i=1','n','x']},
{id:'limit',label:'Grenzwert',symbol:'lim',group:'WEITERE ELEMENTE',fields:['Variable','Zielwert','Term'],values:['x','0','f(x)']},
{id:'factorial',label:'Fakultät',symbol:'n!',group:'WEITERE ELEMENTE',fields:['Wert'],values:['n']},
{id:'binomial',label:'Binomial',symbol:'(ⁿₖ)',group:'WEITERE ELEMENTE',fields:['Oben','Unten'],values:['n','k']},
{id:'vector',label:'Vektor',symbol:'v⃗',group:'WEITERE ELEMENTE',fields:['Variable'],values:['v']},
{id:'log',label:'Logarithmus',symbol:'log',group:'WEITERE ELEMENTE',fields:['Basis','Argument'],values:['2','x']},
{id:'less',label:'Kleiner als',symbol:'<',group:'WEITERE ELEMENTE',values:[]},
{id:'greater',label:'Größer als',symbol:'>',group:'WEITERE ELEMENTE',values:[]},
{id:'notequal',label:'Ungleich',symbol:'≠',group:'WEITERE ELEMENTE',values:[]},
{id:'plusminus',label:'Plusminus',symbol:'±',group:'WEITERE ELEMENTE',values:[]}];
const def=id=>definitions.find(d=>d.id===id);
let seq=0;
const make=(type,values)=>({id:++seq,type,values:values||[...def(type).values],...(type==='fraction'?{slots:[[],[]]}:{})});
let tokens=[make('variable',['E']),make('equal'),make('variable',['m']),make('power',['c','2'])],selected=null,activeSlot=null,tab='preview',zoom=100,undo=[],redo=[];
function restore(list,depth=0){
 if(!Array.isArray(list)||depth>20||list.length>1000)throw Error('Ungültige Formel');
 return list.map(t=>{const d=def(t.type);if(!d||!Array.isArray(t.values)||t.values.length!==d.values.length||!t.values.every(v=>typeof v==='string'&&v.length<=1000))throw Error('Ungültiger Baustein');const item=make(t.type,[...t.values]);if(t.type==='fraction'&&t.slots){if(t.slots.length!==2)throw Error('Ungültiger Bruch');item.slots=t.slots.map(slot=>restore(slot,depth+1))}return item});
}
try{const saved=JSON.parse(localStorage.getItem('forma-document'));if(saved){tokens=restore(saved.tokens);$('#title').value=String(saved.title||'Unbenannte Formel');}}catch{}
function locate(id,list=tokens){for(let index=0;index<list.length;index++){const token=list[index];if(token.id===id)return {token,list,index};for(const slot of token.slots||[]){const found=locate(id,slot);if(found)return found}}return null}
function descendants(t,id){return t.id===id||(t.slots||[]).some(slot=>slot.some(child=>descendants(child,id)))}
function count(list=tokens){return list.reduce((n,t)=>n+1+(t.slots||[]).reduce((m,slot)=>m+count(slot),0),0)}
function tokenHTML(t){return `<span class="token ${selected===t.id?'selected':''}" draggable="true" tabindex="0" role="button" aria-label="${def(t.type).label} bearbeiten" data-id="${t.id}">${math(t,true)}</span>`}
function snapshot(){return JSON.stringify(tokens)}
function change(fn){undo.push(snapshot());if(undo.length>100)undo.shift();redo=[];fn();render();}
function save(){try{localStorage.setItem('forma-document',JSON.stringify({title:$('#title').value,tokens}));$('#saved').textContent='Alle Änderungen gespeichert'}catch{$('#saved').textContent='Speichern nicht verfügbar'}}
function val(v){return v?esc(v):'<span class="placeholder">□</span>'}
function math(t,editing=false){const v=t.values.map(val);switch(t.type){case'variable':return '<i>'+v[0]+'</i>';case'number':return v[0];case'placeholder':return '<span class="placeholder">'+(esc(t.values[0])||'□')+'</span>';case'fraction':return `<span class="fraction compound-fraction">${[0,1].map(i=>`<span ${editing?`class="fraction-slot ${activeSlot?.id===t.id&&activeSlot.index===i?'slot-active':''}" data-owner="${t.id}" data-slot="${i}" tabindex="0" role="group" aria-label="${i===0?'Zähler':'Nenner'}: Elemente hier ablegen"`:''}>${t.slots?.[i]?.length?t.slots[i].map(child=>editing?tokenHTML(child):math(child)).join(' '):editing?`<span class="slot-placeholder">${t.values[i]?val(t.values[i]):i===0?'Zähler':'Nenner'}<small>＋ hier ablegen</small></span>`:val(t.values[i])}</span>`).join('')}</span>`;case'power':return `<i>${v[0]}</i><sup>${v[1]}</sup>`;case'subscript':return `<i>${v[0]}</i><sub>${v[1]}</sub>`;case'root':return `√<span class="root-content">${v[0]}</span>`;case'parentheses':return `(${v[0]})`;case'abs':return `|${v[0]}|`;case'sum':return `<span class="sum">∑</span><sub>${v[0]}</sub><sup>${v[1]}</sup> ${v[2]}`;case'integral':return `<span class="sum">∫</span><sub>${v[0]}</sub><sup>${v[1]}</sup> ${v[2]} d${v[3]}`;case'function':return `${v[0]}(${v[1]})`;case'product':return `<span class="sum">∏</span><sub>${v[0]}</sub><sup>${v[1]}</sup> ${v[2]}`;case'limit':return `lim<sub>${v[0]} → ${v[1]}</sub> ${v[2]}`;case'factorial':return `${v[0]}!`;case'binomial':return `<span class="binomial">(<span class="fraction"><span>${v[0]}</span><span>${v[1]}</span></span>)</span>`;case'vector':return `<span class="vector-mark">${v[0]}</span>`;case'log':return `log<sub>${v[0]}</sub>(${v[1]})`;default:return esc(def(t.type).symbol)}}
function latexText(v){return v.replace(/[\\{}%&#_$]/g,c=>'\\'+c).replace(/\^/g,'\\textasciicircum{}').replace(/~/g,'\\textasciitilde{}')||'\\square'}
function latex(t){const v=t.values.map(latexText);switch(t.type){case'variable':case'number':return v[0];case'placeholder':return t.values[0]?'\\underbrace{\\square}_{\\text{'+v[0]+'}}':'\\square';case'fraction':return `\\frac{${t.slots?.[0]?.length?t.slots[0].map(latex).join(' '):v[0]}}{${t.slots?.[1]?.length?t.slots[1].map(latex).join(' '):v[1]}}`;case'power':return `{${v[0]}}^{${v[1]}}`;case'subscript':return `{${v[0]}}_{${v[1]}}`;case'root':return `\\sqrt{${v[0]}}`;case'parentheses':return `\\left(${v[0]}\\right)`;case'abs':return `\\left|${v[0]}\\right|`;case'sum':return `\\sum_{${v[0]}}^{${v[1]}} ${v[2]}`;case'integral':return `\\int_{${v[0]}}^{${v[1]}} ${v[2]}\\,d${v[3]}`;case'function':return `\\operatorname{${v[0]}}\\left(${v[1]}\\right)`;case'product':return `\\prod_{${v[0]}}^{${v[1]}} ${v[2]}`;case'limit':return `\\lim_{${v[0]} \\to ${v[1]}} ${v[2]}`;case'factorial':return `{${v[0]}}!`;case'binomial':return `\\binom{${v[0]}}{${v[1]}}`;case'vector':return `\\vec{${v[0]}}`;case'log':return `\\log_{${v[0]}}\\left(${v[1]}\\right)`;default:return ({less:'<',greater:'>',notequal:'\\neq',plusminus:'\\pm',plus:'+',minus:'-',multiply:'\\times',divide:'\\div',equal:'=',approx:'\\approx',pi:'\\pi',infinity:'\\infty',theta:'\\theta'})[t.type]}}
function renderPalette(){const query=$('#search').value.toLowerCase();const found=definitions.filter(d=>(d.label+' '+d.group).toLowerCase().includes(query));$('#blocks').innerHTML=[...new Set(found.map(d=>d.group))].map(group=>`<div class="group-title">${group}</div><div class="block-grid">${found.filter(d=>d.group===group).map(d=>`<button class="block" draggable="true" data-type="${d.id}" title="${d.label} hinzufügen"><span class="symbol">${d.symbol==='<'?'&lt;':d.symbol}</span><span class="block-label">${d.label}</span></button>`).join('')}</div>`).join('')||'<p class="empty">Keine Bausteine gefunden.</p>';}
function renderFormula(){const f=$('#formula');f.innerHTML=tokens.length?tokens.map(tokenHTML).join(''):'<span class="empty">Hier beginnt deine nächste Idee.</span>';$('#element-count').textContent=count()+' Elemente';}
function render(){renderFormula();$('#undo').disabled=!undo.length;$('#redo').disabled=!redo.length;renderProperties();renderOutput();save();}
function renderOutput(){$('#output').classList.toggle('code',tab==='latex');if(tab==='latex')$('#output').textContent=tokens.map(latex).join(' ');else $('#output').innerHTML=tokens.length?tokens.map(t=>`<span style="margin:0 4px">${math(t)}</span>`).join(''):'<span class="empty">Deine Vorschau erscheint hier.</span>';}
function renderProperties(){
 const t=locate(selected)?.token,p=$('#properties');p.classList.toggle('editing',!!t);
 if(!t){p.innerHTML='<div><span class="property-icon">⌁</span><strong>Mach die Formel zu deiner.</strong><p>Wähle einen Baustein aus, um seine Werte zu bearbeiten.</p></div>';return}
 const d=def(t.type);
 p.innerHTML=`<strong>${d.label}</strong>`+(d.fields||[]).map((f,i)=>`<label class="field">${f}<input data-field="${i}" value="${esc(t.values[i])}" placeholder="Platzhalter" maxlength="120" ${t.slots?.[i]?.length?'disabled title="Enthaltene Bausteine direkt im Bruch bearbeiten"':''}></label>`).join('')+(t.type==='fraction'?'<p class="fraction-help">Zähler oder Nenner anklicken, dann Bausteine hinzufügen – oder direkt hineinziehen.</p>':'')+`<button class="remove" id="remove">Entfernen ×</button>`;
 $('#remove').onclick=()=>change(()=>{const found=locate(selected);if(found)found.list.splice(found.index,1);selected=null;activeSlot=null});
 p.querySelectorAll('input').forEach(input=>{input.addEventListener('focus',()=>{input.dataset.before=snapshot()});input.addEventListener('input',()=>{t.values[Number(input.dataset.field)]=input.value;renderFormula();renderOutput();save()});input.addEventListener('change',()=>{if(input.dataset.before&&input.dataset.before!==snapshot()){undo.push(input.dataset.before);redo=[];$('#undo').disabled=false;$('#redo').disabled=true}})});
}
function slotList(slot){const owner=slot&&locate(slot.id)?.token;return owner?.slots?.[slot.index]}
function add(type){change(()=>{const t=make(type);const list=slotList(activeSlot)||tokens;list.push(t);selected=t.id})}
$('#blocks').onclick=e=>{const b=e.target.closest('[data-type]');if(b)add(b.dataset.type)};
$('#search').oninput=renderPalette;
$('#formula').onclick=e=>{const t=e.target.closest('[data-id]'),slot=e.target.closest('[data-slot]');selected=t?Number(t.dataset.id):null;activeSlot=slot?{id:Number(slot.dataset.owner),index:Number(slot.dataset.slot)}:null;render()};
$('#formula').onkeydown=e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('[data-slot]')){e.preventDefault();activeSlot={id:Number(e.target.dataset.owner),index:Number(e.target.dataset.slot)};selected=activeSlot.id;render();toast((activeSlot.index===0?'Zähler':'Nenner')+' ausgewählt – Baustein in der Palette wählen.');return}if((e.key==='Enter'||e.key===' ')&&e.target.dataset.id){e.preventDefault();selected=Number(e.target.dataset.id);activeSlot=null;render();$('#properties input:not(:disabled)')?.focus()}};
document.addEventListener('dragstart',e=>{const b=e.target.closest('[data-type]'),t=e.target.closest('[data-id]');if(b)e.dataTransfer.setData('application/forma',JSON.stringify({type:b.dataset.type}));else if(t)e.dataTransfer.setData('application/forma',JSON.stringify({id:Number(t.dataset.id)}));if(b||t)e.dataTransfer.effectAllowed='copyMove'});
const canvas=$('#canvas');
canvas.onclick=e=>{if(!e.target.closest('[data-id]')){selected=null;activeSlot=null;render()}};
function clearDrag(){canvas.classList.remove('dragover');canvas.querySelectorAll('.drop-active').forEach(el=>el.classList.remove('drop-active'))}
canvas.ondragover=e=>{if([...e.dataTransfer.types].includes('application/forma')){e.preventDefault();clearDrag();const slot=e.target.closest('[data-slot]');(slot||canvas).classList.add(slot?'drop-active':'dragover')}};
canvas.ondragleave=e=>{if(!canvas.contains(e.relatedTarget))clearDrag()};document.addEventListener('dragend',clearDrag);
canvas.ondrop=e=>{
 e.preventDefault();clearDrag();let data;try{data=JSON.parse(e.dataTransfer.getData('application/forma'))}catch{return}
 if(!data||typeof data!=='object')return;
 const slot=e.target.closest('[data-slot]'),destination=slot?{id:Number(slot.dataset.owner),index:Number(slot.dataset.slot)}:null;
 const list=destination?slotList(destination):tokens;if(!list)return;
 const target=e.target.closest('[data-id]');let index=target?list.findIndex(t=>t.id===Number(target.dataset.id)):-1;
 if(index<0)index=list.length;else if(e.clientX>target.getBoundingClientRect().left+target.getBoundingClientRect().width/2)index++;
 if(data.type&&def(data.type)){change(()=>{const t=make(data.type);list.splice(index,0,t);selected=t.id;activeSlot=destination});return}
 const source=locate(data.id);if(!source)return;
 if(destination&&descendants(source.token,destination.id)){toast('Ein Bruch kann nicht in sich selbst verschoben werden.');return}
 change(()=>{const [t]=source.list.splice(source.index,1);if(source.list===list&&source.index<index)index--;list.splice(index,0,t);selected=t.id;activeSlot=destination});
};
$('#undo').onclick=()=>{if(undo.length){redo.push(snapshot());tokens=JSON.parse(undo.pop());selected=null;activeSlot=null;render()}};$('#redo').onclick=()=>{if(redo.length){undo.push(snapshot());tokens=JSON.parse(redo.pop());selected=null;activeSlot=null;render()}};
function setZoom(delta){zoom=Math.min(150,Math.max(60,zoom+delta));$('#zoom-value').textContent=zoom+'%';$('#formula').style.setProperty('--zoom',zoom/100)}$('#zoom-in').onclick=()=>setZoom(10);$('#zoom-out').onclick=()=>setZoom(-10);
document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{tab=b.dataset.tab;document.querySelectorAll('[data-tab]').forEach(x=>x.classList.toggle('selected',x===b));renderOutput()});
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').classList.remove('show'),2600)}
$('#copy').onclick=async()=>{const text=tokens.map(latex).join(' ');try{await navigator.clipboard.writeText(text);toast('LaTeX in die Zwischenablage kopiert')}catch{tab='latex';document.querySelector('[data-tab="latex"]').click();const range=document.createRange();range.selectNodeContents($('#output'));getSelection().removeAllRanges();getSelection().addRange(range);toast('LaTeX markiert – mit Strg/Cmd + C kopieren')}};
$('#delete-all').onclick=()=>{if(tokens.length)change(()=>{tokens=[];selected=null;activeSlot=null})};$('#new').onclick=()=>{change(()=>{tokens=[];selected=null;activeSlot=null});$('#title').value='Unbenannte Formel';save();$('#title').focus();$('#title').select();toast('Neue Formel angelegt. Vorherige Formel mit ↶ wiederherstellen.');};$('#title').oninput=save;
$('#library').onclick=()=>toast('Deine aktuelle Formel wird automatisch in diesem Browser gespeichert.');
document.addEventListener('keydown',e=>{const input=['INPUT','TEXTAREA'].includes(document.activeElement.tagName);if(!input&&e.key==='/'){e.preventDefault();$('#search').focus()}if(!input&&(e.ctrlKey||e.metaKey)&&e.key==='z'){e.preventDefault();$(e.shiftKey?'#redo':'#undo').click()}if(!input&&(e.key==='Delete'||e.key==='Backspace')&&selected){e.preventDefault();$('#remove')?.click()}if(e.key==='Escape'){selected=null;activeSlot=null;render();document.activeElement.blur()}});
renderPalette();render();

// Theme preference is independent of the document and defaults to dark.
function updateThemeButton(){const dark=document.documentElement.dataset.theme!=='light';$('#theme-toggle').textContent=dark?'☀ Heller Modus':'☾ Dunkler Modus';$('#theme-toggle').setAttribute('aria-label',dark?'Hellen Modus aktivieren':'Dunklen Modus aktivieren')}
$('#theme-toggle').onclick=()=>{const theme=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=theme;try{localStorage.setItem('forma-theme',theme)}catch{}updateThemeButton()};updateThemeButton();
function download(blob,extension){const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=($('#title').value.trim().replace(/[^\p{L}\p{N}_-]+/gu,'-').slice(0,80)||'formel')+'.'+extension;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
$('#download-tex').onclick=()=>{if(!tokens.length)return toast('Füge zuerst eine Formel hinzu.');const source='\\documentclass{article}\n\\usepackage{amsmath,amssymb}\n\\pagestyle{empty}\n\\begin{document}\n\\[\n'+tokens.map(latex).join(' ')+'\n\\]\n\\end{document}\n';download(new Blob([source],{type:'application/x-tex;charset=utf-8'}),'tex');toast('LaTeX-Datei heruntergeladen')};

// Lay out mathematical boxes directly on canvas, without external fonts or services.
function imageLayout(ctx){
 const text=(value,size)=>{value=String(value||'□');ctx.font=`${size}px Georgia, serif`;const width=ctx.measureText(value).width+3;return {width,ascent:size*.95,descent:size*.3,draw(x,y){ctx.font=`${size}px Georgia, serif`;ctx.fillText(value,x,y)}}};
 const row=boxes=>({width:boxes.reduce((n,b)=>n+b.width,0),ascent:Math.max(0,...boxes.map(b=>b.ascent)),descent:Math.max(0,...boxes.map(b=>b.descent)),draw(x,y){for(const b of boxes){b.draw(x,y);x+=b.width}}});
 const frac=(a,b,size,line=true)=>{const width=Math.max(a.width,b.width)+size*.6,axis=-size*.25,gap=size*.22;return {width,ascent:-axis+gap+a.ascent+a.descent,descent:axis+gap+b.ascent+b.descent,draw(x,y){a.draw(x+(width-a.width)/2,y+axis-gap-a.descent);b.draw(x+(width-b.width)/2,y+axis+gap+b.ascent);if(line){ctx.lineWidth=Math.max(1,size/28);ctx.beginPath();ctx.moveTo(x,y+axis);ctx.lineTo(x+width,y+axis);ctx.stroke()}}}};
 const script=(base,sup,sub,size)=>{const up=sup?size*.7:0,down=sub?size*.35:0;return {width:base.width+Math.max(sup?.width||0,sub?.width||0),ascent:Math.max(base.ascent,sup?up+sup.ascent:0),descent:Math.max(base.descent,sub?down+sub.descent:0),draw(x,y){base.draw(x,y);sup?.draw(x+base.width,y-up);sub?.draw(x+base.width,y+down)}}};
 const list=(items,size)=>row(items.map(t=>box(t,size)));
 function box(t,size){const v=t.values,txt=x=>text(x,size),small=x=>text(x,size*.6);switch(t.type){
 case'fraction':return frac(...[0,1].map(i=>t.slots?.[i]?.length?list(t.slots[i],size*.85):text(v[i],size*.85)),size);
 case'power':return script(txt(v[0]),small(v[1]),null,size);
 case'subscript':return script(txt(v[0]),null,small(v[1]),size);
 case'root':{const body=txt(v[0]),sign=txt('√');return {width:sign.width+body.width,ascent:body.ascent+4,descent:body.descent,draw(x,y){sign.draw(x,y);body.draw(x+sign.width,y);ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(x+sign.width,y-body.ascent);ctx.lineTo(x+sign.width+body.width,y-body.ascent);ctx.stroke()}}}
 case'parentheses':return txt('('+v[0]+')');case'abs':return txt('|'+v[0]+'|');
 case'sum':case'product':return row([script(txt(t.type==='sum'?'∑':'∏'),small(v[1]),small(v[0]),size),txt(' '+v[2])]);
 case'integral':return row([script(txt('∫'),small(v[1]),small(v[0]),size),txt(' '+v[2]+' d'+v[3])]);
 case'limit':return row([script(txt('lim'),null,small(v[0]+' → '+v[1]),size),txt(' '+v[2])]);
 case'factorial':return txt(v[0]+'!');case'binomial':return row([txt('('),frac(text(v[0],size*.8),text(v[1],size*.8),size,false),txt(')')]);
 case'vector':{const base=txt(v[0]),arrow=text('→',size*.75);return {width:Math.max(base.width,arrow.width),ascent:base.ascent+size*.55,descent:base.descent,draw(x,y){base.draw(x,y);arrow.draw(x,y-base.ascent)}}}
 case'log':return row([script(txt('log'),null,small(v[0]),size),txt('('+v[1]+')')]);
 case'function':return txt(v[0]+'('+v[1]+')');case'placeholder':return txt(v[0]||'□');case'variable':case'number':return txt(v[0]);default:return txt(def(t.type).symbol)
 }}return list(tokens,40);
}
$('#download-png').onclick=()=>{if(!tokens.length)return toast('Füge zuerst eine Formel hinzu.');try{const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d'),layout=imageLayout(ctx);const width=Math.ceil(layout.width+64),height=Math.ceil(layout.ascent+layout.descent+64);if(width>16000||height>16000||width*height>8000000)throw Error('Die Formel ist zu groß für einen PNG-Export.');canvas.width=width*2;canvas.height=height*2;ctx.scale(2,2);ctx.fillStyle='#ffffff';ctx.fillRect(0,0,width,height);ctx.fillStyle='#292333';ctx.strokeStyle='#292333';layout.draw(32,32+layout.ascent);canvas.toBlob(blob=>{if(!blob)return toast('Bild konnte nicht erstellt werden.');download(blob,'png');toast('PNG-Datei heruntergeladen')},'image/png')}catch(error){toast(error.message||'Bild konnte nicht erstellt werden.')}};
