import {createExpense,matchBank} from './ledger.js';
export const BAS={'5420':{name:'Programvaror',category:'software'},'6110':{name:'Kontorsmateriel',category:'office'},'6550':{name:'Konsultarvoden',category:'professional'}};
const norm=x=>String(x||'').toLowerCase().replace(/[^a-zåäö0-9]/g,'');
export function receiptProposal(s,p){
 const amount=Math.round(Number(p.total)*100),supplier=norm(p.supplier);
 const candidates=s.bank.filter(b=>b.amount===-amount&&amount>0).map(b=>({...b,exactDate:b.date===p.date,merchant:supplier.length>3&&norm(b.description).includes(supplier)}));
 const strong=candidates.filter(b=>b.exactDate&&b.merchant);
 const chosen=strong.length===1?strong[0]:null;
 const prior=s.expenses.filter(e=>e.status==='Recorded'&&norm(e.supplier)===supplier&&e.basAccount&&BAS[e.basAccount]);
 const codes=[...new Set(prior.map(e=>e.basAccount))];
 let code=codes.length===1?codes[0]:'';
 let reason=code?'Tidigare kontrollerat konto för samma leverantör.':'';
 if(!code){const text=(p.text||'').toLowerCase();code=/software|programvara|adobe|figma/.test(text)?'5420':/kontorsmateriel|office supplies/.test(text)?'6110':/konsultarvode|consulting fee/.test(text)?'6550':'';if(code)reason='Förslag från texten på kvittot. Kontrollera användningen.';}
 return {candidates,bankId:chosen?.id||'',matchReason:chosen?'Belopp, datum och leverantör stämmer.':candidates.length?'Beloppet stämmer. Välj och kontrollera transaktionen.':'Ingen transaktion med samma belopp.',code,category:BAS[code]?.category||'',accountReason:reason||'Inget säkert kontoförslag. Välj kategori manuellt.'};
}
export function attachReceipt(s,d){
 const bank=d.bankId?s.bank.find(b=>b.id===d.bankId):null;
 if(d.bankId&&!bank)throw Error('Transaktionen saknas.');
 if(bank&&bank.amount!==-(d.net+d.vat))throw Error('Kvittots total måste motsvara transaktionen.');
 if(d.basAccount&&BAS[d.basAccount]?.category!==d.category)throw Error('Kontoförslag och kategori måste stämma överens.');
 let existing=bank?.journalId?s.expenses.filter(e=>'expense-'+e.id===bank.journalId):s.expenses.filter(e=>e.date===d.date&&norm(e.supplier)===norm(d.supplier)&&e.net+e.vat===d.net+d.vat);
 if(existing.length>1)throw Error('Flera utlägg stämmer. Granska dem först.');
 let ex=existing[0];
 if(bank&&s.expenses.some(e=>e.pendingBankId===bank.id&&e.id!==ex?.id))throw Error('Transaktionen har redan ett utlägg för granskning.');
 if(bank?.status==='Matched'&&!ex)throw Error('Transaktionen är redan kopplad till en annan verifikation.');
 if(ex?.receiptId)throw Error('Utlägget har redan ett kvitto.');
 if(ex&&(ex.net!==d.net||ex.vat!==d.vat||ex.category!==d.category))throw Error('Befintlig bokföring skiljer sig från kvittot. Granska utlägget först.');
 if(ex&&s.bank.some(b=>b.id!==bank?.id&&b.journalId==='expense-'+ex.id))throw Error('Utlägget är redan kopplat till en annan transaktion.');
 if(!ex)ex=createExpense(s,d);
 Object.assign(ex,{vat:d.vat,receipt:d.receipt,receiptId:d.receiptId,sector:d.sector,basAccount:d.basAccount||'',pendingBankId:bank?.id||''});
 if(bank&&ex.status==='Recorded'&&bank.status==='Unmatched')matchBank(s,bank.id,'expense-'+ex.id);
 return ex;
}
