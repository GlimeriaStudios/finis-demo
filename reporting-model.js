import {ACCOUNTS, balances, totals, validDate} from './ledger.js';
const iso=d=>d.toISOString().slice(0,10);
export function periodRange(mode,anchor){
 validDate(anchor); const [y,m,d]=anchor.split('-').map(Number);
 if(mode==='day')return {from:anchor,to:anchor};
 if(mode==='month')return {from:iso(new Date(Date.UTC(y,m-1,1))),to:iso(new Date(Date.UTC(y,m,0)))};
 if(mode==='quarter'){const q=Math.floor((m-1)/3)*3;return {from:iso(new Date(Date.UTC(y,q,1))),to:iso(new Date(Date.UTC(y,q+3,0)))};}
 if(mode==='year')return {from:y+'-01-01',to:y+'-12-31'};
 throw Error('Välj dag, månad, kvartal eller år.');
}
export function previousYear(date){validDate(date);const [y,m,d]=date.split('-').map(Number);return iso(new Date(Date.UTC(y-1,m-1,Math.min(d,new Date(Date.UTC(y-1,m,0)).getUTCDate()))));}
export function changePercent(current,previous){return previous===0?null:(current-previous)/Math.abs(previous)*100;}
export function reportData(s,from,to){
 validDate(from);validDate(to);if(from>to)throw Error('Startdatum måste vara före slutdatum.');
 const current=totals(s,from,to),prior=totals(s,previousYear(from),previousYear(to)),closing=totals(s,'',to),before=iso(new Date(Date.parse(from+'T00:00:00Z')-86400000)),opening=balances(s,'',before);
 for(const values of [current,prior,closing])for(const key of Object.keys(values))if(Object.is(values[key],-0))values[key]=0;
 const accounts=Object.entries(ACCOUNTS).map(([key,a])=>({key,...a,opening:opening[key],movement:current.balances[key],closing:closing.balances[key]}));
 const sum=type=>accounts.filter(a=>a.type===type).reduce((n,a)=>n+a.closing,0);
 return {from,to,current,prior,closing,accounts,assets:sum('asset'),liabilities:-sum('liability'),equity:-sum('equity')+closing.profit,priorFrom:previousYear(from),priorTo:previousYear(to),hasPriorEntries:s.journal.some(j=>j.date>=previousYear(from)&&j.date<=previousYear(to))};
}
export function accountEntries(s,account,from,to){return s.journal.filter(j=>j.date>=from&&j.date<=to).flatMap(j=>j.lines.filter(l=>l.account===account).map(l=>({id:j.id,date:j.date,description:j.description,basAccount:l.basAccount||'',debit:l.debit,credit:l.credit}))).sort((a,b)=>a.date.localeCompare(b.date));}
