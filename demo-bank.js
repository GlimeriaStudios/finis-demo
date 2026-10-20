import {demoReceipts} from './demo-bank-data.js';
import {importBank} from './ledger.js';
export function ensureDemoBank(s){
 if(s.demoReceiptPack===1)return;
 const csv='date,description,amount,reference\n'+demoReceipts.map(r=>`${r.date},${r.description},-${(r.total/100).toFixed(2)},${r.reference}`).join('\n');
 importBank(s,csv);s.demoReceiptPack=1;
}
export function bankSuggestion(s,b){
 const known=demoReceipts.find(r=>r.reference===b.reference);
 if(known)return {code:known.basAccount,name:{office:'Kontorsmateriel',software:'Programvaror',professional:'Konsultarvoden'}[known.category],receipt:known.receipt};
 const text=b.description.toLowerCase();
 if(/programvara|software|designmolnet/.test(text))return {code:'5420',name:'Programvaror'};
 if(/kontorsmateriel/.test(text))return {code:'6110',name:'Kontorsmateriel'};
 if(/konsultarvode/.test(text))return {code:'6550',name:'Konsultarvoden'};
 return null;
}
