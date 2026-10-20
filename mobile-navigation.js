import {workspaceNav} from './workspace-index.js';
const icons={
 overview:'<path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5"/>',
 invoices:'<path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z"/><path d="M9 7h6M9 11h6M9 15h3"/>',
 capture:'<path d="M3 7h4l2-3h6l2 3h4v13H3V7Z"/><circle cx="12" cy="13" r="4"/>',
 reports:'<path d="M4 20V10h4v10M10 20V4h4v16M16 20V7h4v13"/>',
 more:'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>'
};
const icon=key=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[key]}</svg>`;
export function mobileNavigation(current){
 const active=current==='financial'?'reports':current;
 const items=[['overview','Översikt'],['invoices','Fakturor'],['capture','Skanna'],['reports','Rapporter']];
 return `<nav class="mobile-bottom-nav" aria-label="Mobil huvudmeny">${items.map(([route,label])=>`<a href="#${route}" ${active===route?'class="selected" aria-current="page"':''}>${icon(route)}<span>${label}</span></a>`).join('')}<button type="button" id="mobile-more" class="${items.some(([r])=>r===active)?'':'selected'}" aria-label="Mer — alla menyval" aria-haspopup="dialog" aria-controls="mobile-more-dialog" aria-expanded="false">${icon('more')}<span>Mer</span></button></nav>
 <dialog class="mobile-more-dialog" id="mobile-more-dialog" aria-labelledby="mobile-more-title"><header><h2 id="mobile-more-title">Alla menyval</h2><button type="button" id="mobile-more-close" aria-label="Stäng menyn">Stäng</button></header><nav class="mobile-more-links" aria-label="Alla menyval">${workspaceNav(current)}</nav></dialog>`;
}
export function bindMobileNavigation(){
 const button=document.getElementById('mobile-more'),dialog=document.getElementById('mobile-more-dialog');
 if(!button||!dialog)return;
 button.onclick=()=>{dialog.showModal();button.setAttribute('aria-expanded','true');};
 dialog.onclose=()=>button.setAttribute('aria-expanded','false');
 document.getElementById('mobile-more-close').onclick=()=>dialog.close();
 dialog.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>dialog.close()));
 dialog.onclick=e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}};
}
if(typeof matchMedia==='function')matchMedia('(max-width:900px)').addEventListener('change',e=>{if(!e.matches)document.getElementById('mobile-more-dialog')?.close();});
