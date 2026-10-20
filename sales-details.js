import {pennies} from './ledger.js';
export const units=['st','tim','dag','m','m²','kg','månad'];
export function invoiceAmounts(rows,defaultRate=25){
 if(!Array.isArray(rows)||!rows.length)throw Error('Lägg till minst en fakturarad.');
 const items=rows.map(r=>{
  const description=String(r.description||'').trim(),qty=Number(r.qty),unit=pennies(r.unit),vatRate=Number(r.vatRate??defaultRate),discount=Number(r.discount||0),unitName=String(r.unitName||'st');
  if(!description||!Number.isFinite(qty)||qty<=0||qty>100000||unit<0||![0,6,12,25].includes(vatRate)||!Number.isFinite(discount)||discount<0||discount>100||!units.includes(unitName))throw Error('Kontrollera beskrivning, antal, enhet, pris, rabatt och moms.');
  const net=Math.round(qty*unit*(100-discount)/100);
  if(!Number.isSafeInteger(net)||net>1e11)throw Error('Radbeloppet är för stort.');
  return {description,qty,unit,unitName,discount,vatRate,net};
 });
 const groups=[...new Set(items.map(r=>r.vatRate))].sort((a,b)=>a-b).map(rate=>{const net=items.filter(r=>r.vatRate===rate).reduce((n,r)=>n+r.net,0);return {rate,net,vat:Math.round(net*rate/100)};});
 const net=items.reduce((n,r)=>n+r.net,0),vat=groups.reduce((n,g)=>n+g.vat,0);
 if(!Number.isSafeInteger(net)||net<=0||net+vat>1e11)throw Error('Kontrollera fakturans totalbelopp.');
 return {items,net,vat,total:net+vat,vatGroups:groups,vatRate:groups.length===1?groups[0].rate:null};
}
export function savedArticles(s){
 return (s.registers?.articles||[]).flatMap(r=>{
  try{const [name,unitName,price,rate,type]=r.cells;const unit=pennies(String(price).replace(',','.')),vatRate=Number(String(rate).replace('%','').trim());if(!name||unit<0||!units.includes(unitName)||![0,6,12,25].includes(vatRate))return [];return [{id:r.id,name,unitName,unit,vatRate,type}];}catch{return [];}
 });
}
export function supplierBalances(s){
 return [...new Set([...s.bills,...s.expenses].map(x=>x.supplier))].map(name=>{
  const bills=s.bills.filter(x=>x.supplier===name),expenses=s.expenses.filter(x=>x.supplier===name);
  return {name,count:bills.length,purchases:bills.reduce((n,b)=>n+b.amount,0)+expenses.reduce((n,e)=>n+e.net+e.vat,0),unpaid:bills.filter(b=>!['Paid','Payment recorded'].includes(b.status)).reduce((n,b)=>n+b.amount,0)};
 });
}
