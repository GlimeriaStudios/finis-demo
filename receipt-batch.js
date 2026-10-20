import {readDocument,supportedFile} from './file-intake.js';
import {parseReceipt} from './workflow-model.js';
import {fileHash,storage} from './file-store.js';
import {validDate} from './ledger.js';
const key='finis-demo-receipt-batch-v1';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function validBatchReceipt(p){
 try{validDate(p?.date);}catch{return false;}
 return Boolean(p?.supplier?.trim()&&String(p.total??'').trim()!==''&&Number.isFinite(Number(p.total))&&Number(p.total)>0&&String(p.vat??'').trim()!==''&&Number(p.vat)>=0&&Number(p.vat)<Number(p.total));
}
export const approvableReceipts=items=>items.filter(r=>r.selected&&!r.approved&&!r.error&&r.status==='ready'&&validBatchReceipt(r.fields));
export function batchMarkup(){return `<section class="panel batch-panel" aria-labelledby="batch-title">
 <div class="panel-head"><div><span class="batch-eyebrow">ENDAST DEMO</span><h2 id="batch-title">Prova flera kvitton</h2></div></div>
 <div class="panel-body"><p>Använd fiktiva kvitton. Fota ett kvitto eller välj flera filer samtidigt. Bilder och OCR sparas bara i den här webbläsaren.</p>
 <div class="batch-actions"><button type="button" class="btn" id="batch-demo-button">Läs in 6 demokvitton</button><button type="button" class="btn outline" id="batch-camera-button">Fota kvitto</button><button type="button" class="btn" id="batch-files-button">Välj filer</button></div>
 <input hidden id="batch-camera" type="file" accept="image/*" capture="environment"><input hidden id="batch-files" type="file" multiple accept=".jpg,.jpeg,.png,.webp,.bmp,.heic,.heif,.pdf">
 <p class="smallprint">Inga egna filer? Läs in sex färdiga, fiktiva kvitton med exempel på OCR-uppgifter och prova granskning och godkännande.</p><p class="smallprint">Högst 30 kvitton · 10 MB per fil · PDF högst 10 sidor. En fil räknas som ett kvitto. Ingen bokföring eller betalning utförs.</p>
 <p id="batch-status" role="status" aria-live="polite"></p><div id="batch-content"></div></div>
 <dialog id="batch-review" class="batch-dialog" aria-labelledby="batch-review-title"></dialog></section>`;}
export async function bindBatch(recognize){
 const host=document.getElementById('batch-content');if(!host)return;
 const status=document.getElementById('batch-status'),dialog=document.getElementById('batch-review');
 let items=[],density=6,busy=false;const urls=new Map();
 const persist=()=>storage('put',{id:key,items,density});
 function preview(r){if(!r.preview)return '';if(typeof r.preview==='string')return r.preview;if(!urls.has(r.id))urls.set(r.id,URL.createObjectURL(r.preview));return urls.get(r.id);}
 const amount=v=>v===''||v==null?'Ej avläst':Number(v).toLocaleString('sv-SE',{minimumFractionDigits:2,maximumFractionDigits:2})+' kr';
 function draw(){
  if(!host.isConnected)return;
  const pending=items.filter(r=>!r.approved),allSelected=pending.length>0&&pending.every(r=>r.selected);
  host.dataset.density=String(density);
  host.innerHTML=items.length?`<div class="batch-toolbar"><div class="batch-selection"><label><input id="batch-all" type="checkbox" ${allSelected?'checked':''} ${busy||!pending.length?'disabled':''}> Välj alla</label><span>${items.length} kvitton</span></div><div class="batch-density" role="group" aria-label="Kvittostorlek"><button type="button" data-density="6" aria-pressed="${density===6}">Översikt · 6</button><button type="button" data-density="12" aria-pressed="${density===12}">Kompakt · 12</button></div></div>
  <p class="batch-scroll-hint">${density===6?'Två kvitton i bredd':'Utzoomad vy'} · rulla för fler · tryck på ett kvitto för detaljer</p>
  <div class="receipt-batch-grid">${items.map(r=>`<article class="batch-card ${r.approved?'is-approved':''}">
  <button class="batch-open" data-review="${r.id}" ${busy?'disabled':''} aria-label="Granska ${esc(r.name)}">
  <span class="batch-banner"><span class="batch-identity"><strong title="${esc(r.fields?.supplier||r.name)}">${esc(r.fields?.supplier||r.name)}</strong><time>${esc(r.fields?.date||'Datum saknas')}</time></span><span class="batch-totals"><span>Belopp <b>${amount(r.fields?.total)}</b></span><span>Moms <b>${amount(r.fields?.vat)}</b></span></span></span>
  ${preview(r)?`<img src="${esc(preview(r))}" alt="Kvitto: ${esc(r.name)}" loading="lazy">`:'<span class="batch-placeholder">Kvitto</span>'}</button>
  <label class="batch-check"><input type="checkbox" data-select="${r.id}" ${r.selected||r.approved?'checked':''} ${r.approved||busy?'disabled':''} aria-label="Välj ${esc(r.name)}"><span>${r.approved?'Godkänt':r.error?'Kontrollera fel':r.status==='reading'?'Läser OCR…':!validBatchReceipt(r.fields)?'Uppgifter saknas':r.selected?'Valt':'Ej valt'}</span></label></article>`).join('')}</div>
  <div class="batch-approval"><div><strong>${approvableReceipts(items).length} redo att godkänna</strong><p class="smallprint">Kontrollera uppgifterna. Kvitton med fel lämnas kvar.</p></div><button class="btn" id="batch-approve" ${busy||!approvableReceipts(items).length?'disabled':''}>${allSelected?'Godkänn alla':'Godkänn valda'}</button></div>`:'<div class="batch-empty">Dina kvitton visas här med företagsnamn, datum, belopp och moms ovanför varje bild.</div>';
  host.querySelectorAll('[data-density]').forEach(el=>el.onclick=async()=>{density=Number(el.dataset.density);draw();host.querySelector(`[data-density="${density}"]`).focus({preventScroll:true});await safeSave();});
  host.querySelectorAll('[data-select]').forEach(el=>el.onchange=async()=>{const r=items.find(r=>r.id===el.dataset.select);r.selected=el.checked;await safeSave();draw();});
  const all=host.querySelector('#batch-all');if(all)all.indeterminate=pending.some(r=>r.selected)&&!allSelected;if(all)all.onchange=async()=>{items.filter(r=>!r.approved).forEach(r=>r.selected=all.checked);await safeSave();draw();};
  host.querySelectorAll('[data-review]').forEach(el=>el.onclick=()=>review(items.find(r=>r.id===el.dataset.review)));
  const approve=host.querySelector('#batch-approve');if(approve)approve.onclick=async()=>{
   const approved=approvableReceipts(items);approved.forEach(r=>{r.approved=true;r.selected=false;});
   try{await persist();status.textContent=`${approved.length} kvitton godkända i demon. Ingen bokföring utfördes.`;}
   catch{approved.forEach(r=>{r.approved=false;r.selected=true;});status.textContent='Kunde inte spara. Inga kvitton godkändes. Kontrollera webbläsarens lagringsutrymme.';}draw();
  };
 }
 async function safeSave(){try{await persist();}catch{status.textContent='Kunde inte spara lokalt. Behåll sidan öppen och frigör lagringsutrymme.';}}
 function review(r){
  dialog.innerHTML=`<header><div><span class="batch-eyebrow">ENDAST DEMO</span><h2 id="batch-review-title">Granska kvitto</h2></div><button class="btn outline small" id="batch-close" aria-label="Stäng kvittogranskning">Stäng</button></header>
  <div class="batch-review-layout"><div>${preview(r)?`<img class="batch-full-image" src="${esc(preview(r))}" alt="${esc(r.name)}">`:'<p>Ingen förhandsvisning tillgänglig.</p>'}<button type="button" class="btn outline small" id="batch-original">Öppna originalfil</button></div>
  <form id="batch-edit"><p>${esc(r.name)}</p>${r.error?`<p role="alert">${esc(r.error)}. Fyll i uppgifterna manuellt.</p>`:''}
  ${[['supplier','Leverantör','text'],['date','Datum','date'],['total','Totalbelopp (SEK)','number'],['vat','Moms (SEK)','number']].map(([name,label,type])=>`<label class="field">${label}<input name="${name}" type="${type}" value="${esc(r.fields?.[name]||'')}" ${type==='number'?'step="0.01" min="0"':''} required ${r.approved?'readonly':''}></label>`).join('')}
  <details><summary>Visa OCR-text</summary><pre class="batch-ocr">${esc(r.text||'Ingen text avläst.')}</pre></details>
  <label class="checkbox"><input name="selected" type="checkbox" ${r.selected?'checked':''} ${r.approved?'disabled':''}>Ta med vid godkännande</label>
  <p id="batch-edit-error" role="alert"></p>${r.approved?'<p>Godkänt i demon.</p>':'<button class="btn">Spara granskning</button>'}</form></div>`;
  dialog.showModal();dialog.querySelector('#batch-close').onclick=()=>dialog.close();
  dialog.querySelector('#batch-original').onclick=()=>{const u=URL.createObjectURL(r.file);const a=document.createElement('a');a.href=u;a.download=r.name;a.click();setTimeout(()=>URL.revokeObjectURL(u),30000);};
  dialog.querySelector('form').onsubmit=async e=>{e.preventDefault();const form=e.currentTarget,p=Object.fromEntries(new FormData(form));if(!validBatchReceipt(p)){dialog.querySelector('#batch-edit-error').textContent='Kontrollera datum och belopp. Moms måste vara lägre än totalbeloppet.';return;}const before={...r};Object.assign(r,{fields:p,selected:form.elements.selected.checked,status:'ready',error:''});try{await persist();dialog.close();draw();}catch{Object.assign(r,before);dialog.querySelector('#batch-edit-error').textContent='Kunde inte spara ändringen lokalt.';}};
 }
 async function intake(files){
  if(busy||!files.length)return;busy=true;document.getElementById('batch-files-button').disabled=true;document.getElementById('batch-camera-button').disabled=true;
  let duplicates=0,added=0;const errors=[];
  try{for(const file of files){
   if(items.length>=30){errors.push('Gränsen är 30 kvitton.');break;}
   if(!supportedFile(file)){errors.push(`${file.name}: formatet stöds inte eller filen är större än 10 MB.`);continue;}
   const id=await fileHash(file);if(items.some(r=>r.id===id)){duplicates++;continue;}
   const r={id,name:file.name,file,selected:true,approved:false,status:'reading',fields:{},text:'',preview:null};items.push(r);added++;draw();
   try{const result=await readDocument(file,status,recognize);r.text=result.text;r.fields=parseReceipt(result.text);r.preview=await (await fetch(result.preview)).blob();if(result.preview.startsWith('blob:'))URL.revokeObjectURL(result.preview);r.status='ready';}
   catch(e){r.error=e.message;r.status='error';if(/^image\/(jpeg|png|webp|bmp)$/.test(file.type))r.preview=file;}
   await safeSave();draw();
  }}catch(e){errors.push(e.message);}finally{busy=false;document.getElementById('batch-files-button')?.removeAttribute('disabled');document.getElementById('batch-camera-button')?.removeAttribute('disabled');status.textContent=[`${added} kvitton tillagda.`,duplicates?`${duplicates} dubbletter hoppades över.`:'',...errors].filter(Boolean).join(' ');draw();}
 }
 document.getElementById('batch-demo-button').onclick=async()=>{
  if(busy)return;
  const samples=[['Demo Kontorsbutiken',349,69.8,'Kontorsmaterial'],['Demo Kafé Torget',112,12,'Fika'],['Demo Teknikbutiken',1245,249,'Tangentbord'],['Demo Reseservice',280,15.85,'Tågbiljett'],['Demo Hotell Hamnen',1120,120,'Övernattning'],['Demo Programvara',499,99.8,'Programabonnemang']];
  const missing=samples.map((v,i)=>({v,i,id:`finis-sample-receipt-${i+1}`})).filter(r=>!items.some(item=>item.id===r.id));
  if(items.length+missing.length>30){status.textContent='Det finns inte plats för demokvittona. Högst 30 kvitton kan sparas.';return;}
  if(!missing.length){draw();status.textContent='Demokvittona finns redan i din lista.';return;}
  busy=true;document.getElementById('batch-demo-button').disabled=true;
  const before=[...items];
  try{
   for(const {v,i,id} of missing){
    const [supplier,total,vat,description]=v,date=`2026-10-${String(10+i).padStart(2,'0')}`;
    const text=[supplier,'FIKTIVT DEMOKVITTO',`Datum: ${date}`,`Kvitto: DEMO-${i+1}`,description,`Totalt: ${total.toFixed(2)} SEK`,`Moms: ${vat.toFixed(2)} SEK`,'Ej giltigt som underlag'].join('\n');
    const canvas=document.createElement('canvas');canvas.width=600;canvas.height=900;const ctx=canvas.getContext('2d');ctx.fillStyle='#fffdf7';ctx.fillRect(0,0,600,900);ctx.fillStyle='#22343c';ctx.font='bold 28px monospace';ctx.fillText(supplier,40,80);ctx.font='22px monospace';text.split('\n').slice(1).forEach((line,n)=>ctx.fillText(line,40,150+n*75));ctx.strokeStyle='#cbd2ce';ctx.strokeRect(20,20,560,860);
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw Error('Bild kunde inte skapas');
    const name=`demokvitto-${i+1}.png`,file=new File([blob],name,{type:'image/png'});
    items.push({id,name,file,preview:blob,selected:true,approved:false,status:'ready',fields:{supplier,date,total,vat},text});
   }
   await persist();status.textContent=`${missing.length} fiktiva demokvitton tillagda med förifyllda OCR-exempel. Öppna ett kvitto för att granska. Ingen bokföring utförs.`;
  }catch{items=before;status.textContent='Kunde inte spara demokvittona. Kontrollera webbläsarens lagringsutrymme.';}
  finally{busy=false;document.getElementById('batch-demo-button').disabled=false;draw();}
 };
 for(const kind of ['files','camera']){const input=document.getElementById(`batch-${kind}`);document.getElementById(`batch-${kind}-button`).onclick=()=>input.click();input.onchange=()=>{const files=[...input.files];input.value='';intake(files);};}
 try{const saved=await storage('get',key);items=saved?.items||[];density=saved?.density===12?12:6;items.forEach(r=>{if(r.status==='reading'){r.status='error';r.error='Läsningen avbröts';}});}catch{status.textContent='Lokal lagring är inte tillgänglig.';}
 draw();
 const cleanup=new MutationObserver(()=>{if(!host.isConnected){urls.forEach(u=>URL.revokeObjectURL(u));cleanup.disconnect();}});cleanup.observe(document.getElementById('app'),{childList:true});
}
