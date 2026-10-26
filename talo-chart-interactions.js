// Presentation only: delegated events survive the application's existing redraws.
const intro='Välj en punkt eller kategori för exakta belopp.';
function chartOf(el){return el?.closest?.('.talo-chart');}
function reset(chart){if(!chart)return;chart.querySelectorAll('[data-chart-detail]').forEach(el=>el.setAttribute('aria-pressed','false'));const tip=chart.querySelector('[data-chart-tip]');if(tip)tip.textContent=intro;const select=chart.querySelector('[data-chart-select]');if(select)select.value='';}
function show(el,pin=false){const chart=chartOf(el);if(!chart)return;const tip=chart.querySelector('[data-chart-tip]');if(!tip)return;tip.textContent=el.dataset.chartDetail;if(pin){chart.querySelectorAll('[data-chart-detail]').forEach(p=>p.setAttribute('aria-pressed',String(p===el)));const select=chart.querySelector('[data-chart-select]');if(select)select.value=el.dataset.chartIndex??'';}}
if(typeof document!=='undefined'){
 document.addEventListener('pointerover',e=>{if(e.pointerType==='touch')return;const el=e.target.closest?.('[data-chart-detail]');if(el)show(el);});
 document.addEventListener('pointerout',e=>{if(e.pointerType==='touch')return;const el=e.target.closest?.('[data-chart-detail]');if(!el||el.contains(e.relatedTarget))return;const chart=chartOf(el),pinned=chart?.querySelector('[aria-pressed=true][data-chart-detail]');if(pinned)show(pinned);else reset(chart);});
 document.addEventListener('focusin',e=>{const el=e.target.closest?.('[data-chart-detail]');if(el)show(el);});
 document.addEventListener('focusout',e=>{const chart=chartOf(e.target);if(chart&&!chart.contains(e.relatedTarget)&&!chart.querySelector('[aria-pressed=true][data-chart-detail]'))reset(chart);});
 document.addEventListener('click',e=>{const el=e.target.closest?.('[data-chart-detail]');if(el){if(el.getAttribute('aria-pressed')==='true')reset(chartOf(el));else show(el,true);}else if(!chartOf(e.target))document.querySelectorAll('.talo-chart').forEach(reset);});
 document.addEventListener('keydown',e=>{const el=e.target.closest?.('[data-chart-detail]');if(e.key==='Escape'){document.querySelectorAll('.talo-chart').forEach(reset);return;}if(el&&el.tagName.toLowerCase()==='g'&&['Enter',' '].includes(e.key)){e.preventDefault();el.dispatchEvent(new MouseEvent('click',{bubbles:true}));}});
 document.addEventListener('change',e=>{if(!e.target.matches?.('[data-chart-select]'))return;const chart=chartOf(e.target),el=chart.querySelector(`[data-chart-index="${e.target.value}"]`);if(el)show(el,true);else reset(chart);});
 // Only first display or an actual series/period change animates, never unrelated redraws.
 const seen=new Map();let pending=false;
 const mark=()=>{pending=false;document.querySelectorAll('[data-chart-key]').forEach(el=>{const slot=el.dataset.chartKey.split('-')[0];if(seen.get(slot)===el.dataset.chartKey)return;seen.set(slot,el.dataset.chartKey);el.classList.add('talo-chart-fresh');el.addEventListener('animationend',()=>el.classList.remove('talo-chart-fresh'),{once:true});});};
 const root=document.getElementById('app');if(root){new MutationObserver(()=>{if(!pending){pending=true;requestAnimationFrame(mark);}}).observe(root,{childList:true,subtree:true});mark();}
}
