import {ACCOUNTS,pennies,validDate,post,audit} from './ledger.js';
const extended='ÇüéâäàåçêëèïîìÄÅÉæÆôöòûùÿÖÜ¢£¥₧ƒáíóúñÑªº¿⌐¬½¼¡«»░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀αßΓπΣσµτΦΘΩδ∞φε∩≡±≥≤⌠⌡÷≈°∙·√ⁿ²■ ';
export function decodePC8(bytes){return Array.from(bytes,b=>b<128?String.fromCharCode(b):extended[b-128]).join('');}
export function encodePC8(text){return Uint8Array.from(Array.from(text,c=>{const n=c.charCodeAt(0),i=extended.indexOf(c);if(n<128)return n;if(i>=0)return i+128;throw Error('Tecknet '+c+' kan inte exporteras som PC8.');}));}
function tokens(line){const out=[];let i=0;while(i<line.length){if(/\s/.test(line[i])){i++;continue;}if(line[i]==='"'){let v='',closed=false;i++;while(i<line.length){if(line[i]==='\\'&&line[i+1]==='"'){v+='"';i+=2;}else if(line[i]==='"'){i++;closed=true;break;}else v+=line[i++];}if(!closed)throw Error('Oavslutad textsträng.');out.push(v);}else if('{}'.includes(line[i]))out.push(line[i++]);else{const start=i;while(i<line.length&&!/[\s{}]/.test(line[i]))i++;out.push(line.slice(start,i));}}return out;}
const date=v=>{if(!/^\d{8}$/.test(v||''))throw Error('Ogiltigt SIE-datum.');return validDate(v.slice(0,4)+'-'+v.slice(4,6)+'-'+v.slice(6,8));};
export function parseSIE(text){
 const data={company:'',org:'',type:0,accounts:{},entries:[],balances:[],warnings:[],blockers:[]};let current=null,opened=false;const seen=new Set();
 const rows=text.replace(/^\uFEFF/,'').split(/\r?\n/);
 for(let index=0;index<rows.length;index++){const raw=rows[index].trim();if(!raw)continue;try{const a=tokens(raw),tag=a.shift();seen.add(tag);
 if(tag==='{'){if(!current||opened||a.length)throw Error('Felplacerat block.');opened=true;continue;}
 if(tag==='}'){if(!current||!opened)throw Error('Felplacerat blockslut.');if(current.lines.length<2||current.lines.reduce((n,l)=>n+l.amount,0)!==0)throw Error('Verifikationen balanserar inte.');data.entries.push(current);current=null;opened=false;continue;}
 if(tag==='#VER'){if(current)throw Error('Föregående verifikation är inte avslutad.');current={series:a[0],number:a[1],date:date(a[2]),description:a[3]||'',lines:[]};continue;}
 if(tag==='#TRANS'){if(!current||!opened)throw Error('Transaktion utanför verifikation.');const close=a.indexOf('}');if(a[1]!=='{'||close<2||(close-2)%2)throw Error('Ogiltig objektlista.');if(!/^\d{4}$/.test(a[0]))throw Error('Konton måste ha fyra siffror i denna demo.');const amount=pennies(a[close+1]);const line={account:a[0],amount,objects:a.slice(2,close),date:a[close+2]?date(a[close+2]):current.date,description:a[close+3]||''};current.lines.push(line);if(line.objects.length)data.blockers.push('Objektdimensioner kräver en fullständig kontoplan.');if(line.date!==current.date)data.blockers.push('Avvikande transaktionsdatum stöds inte vid bokföring.');continue;}
 if(current){data.blockers.push('Verifikationspost '+tag+' kan inte bokföras i demon.');continue;}
 if(tag==='#SIETYP')data.type=Number(a[0]);else if(tag==='#FNAMN')data.company=a[0];else if(tag==='#ORGNR')data.org=a[0];else if(tag==='#FORMAT'&&a[0]!=='PC8')throw Error('Endast PC8 stöds.');else if(tag==='#FLAGGA'&&a[0]!=='0')data.blockers.push('Filen är redan markerad som mottagen.');else if(tag==='#KONTO'){if(!/^\d{4}$/.test(a[0])||!a[1])throw Error('Ogiltigt konto.');if(data.accounts[a[0]]&&data.accounts[a[0]]!==a[1])throw Error('Motstridiga kontonamn.');data.accounts[a[0]]=a[1];}
 else if(['#IB','#UB','#RES','#PSALDO','#PBUDGET','#OIB','#OUB'].includes(tag)){data.balances.push({tag,fields:a});data.blockers.push('Saldo-/budgetposter kräver separat migrering; inga saldon tappas tyst.');}
 else if(!['#FORMAT','#FLAGGA','#PROGRAM','#GEN','#RAR','#VALUTA','#KPTYP','#FTYP','#FNR','#ADRESS','#PROSA','#TAXAR','#BKOD','#OMFATTN','#KTYP','#SRU','#ENHET'].includes(tag))data.blockers.push('Post '+tag+' bevaras i originalet men stöds inte vid bokföring.');
 if(tag==='#VALUTA'&&a[0]!=='SEK')data.blockers.push('Endast SEK stöds i demobokföringen.');
 }catch(e){throw Error('Rad '+(index+1)+': '+e.message);}}
 if(current)throw Error('Oavslutad verifikation.');
 for(const tag of ['#FLAGGA','#PROGRAM','#FORMAT','#GEN','#SIETYP','#FNAMN'])if(!seen.has(tag))throw Error('Obligatorisk post saknas: '+tag);
 if(![1,2,3,4].includes(data.type))throw Error('SIE 1–4 stöds för förhandsvisning. SIE 5 XML stöds inte ännu.');
 if(data.type!==4)data.blockers.push('Endast SIE 4-transaktioner kan bokföras i demon.');
 if(!data.entries.length)data.blockers.push('Inga verifikationer att bokföra.');
 data.blockers=[...new Set(data.blockers)];return data;
}
export function importSIE(s,data,mapping,hash){
 if(data.blockers.length)throw Error(data.blockers.join(' '));
 if((s.sieImports||[]).some(x=>x.hash===hash))throw Error('Filen har redan importerats.');
 const draft=structuredClone(s),keys=new Set((s.sieImports||[]).flatMap(x=>x.keys));const fresh=[];
 for(const e of data.entries){const key=JSON.stringify([data.org||data.company,e.date.slice(0,4),e.series,e.number]);if(!e.series||!e.number)throw Error('Demon kräver serie och nummer för dubblettkontroll.');if(keys.has(key))throw Error('Verifikationen finns redan: '+e.series+e.number);keys.add(key);fresh.push(key);post(draft,{id:'sie-'+hash+'-'+fresh.length,date:e.date,description:e.description,sie:{series:e.series,number:e.number,org:data.org,company:data.company},lines:e.lines.map(l=>{const account=mapping[l.account];if(!ACCOUNTS[account])throw Error('Välj kategori för konto '+l.account);return {account,basAccount:l.account,description:l.description,debit:Math.max(l.amount,0),credit:Math.max(-l.amount,0)};})});}
 (draft.sieImports??=[]).push({hash,keys:fresh,company:data.company,count:fresh.length,at:new Date().toISOString()});audit(draft,'SIE imported',hash);Object.assign(s,draft);
}
const quote=v=>'"'+String(v||'').replace(/[\x00-\x1f\x7f]/g,' ').replace(/"/finis-demo/g,'\\"')+'"';
export function exportSIE(s,mapping){
 if(!s.journal.length)throw Error('Inga verifikationer.');
 const used=new Map();for(const j of s.journal)for(const l of j.lines){const n=l.basAccount||mapping[l.account];if(!/^\d{4}$/.test(n||''))throw Error('Ange BAS-konto för '+ACCOUNTS[l.account].name);used.set(n,used.get(n)||ACCOUNTS[l.account].name);}
 const lines=['#FLAGGA 0','#PROGRAM "Finis demo" "0.1"','#FORMAT PC8','#GEN '+new Date().toISOString().slice(0,10).replaceAll('-',''),'#SIETYP 4','#FNAMN '+quote(s.company.name),'#VALUTA SEK',...Array.from(used,([n,name])=>'#KONTO '+n+' '+quote(name))];
 s.journal.forEach((j,i)=>{lines.push('#VER "FINIS" '+(i+1)+' '+j.date.replaceAll('-','')+' '+quote(j.description),'{' );for(const l of j.lines)lines.push('#TRANS '+(l.basAccount||mapping[l.account])+' {} '+((l.debit-l.credit)/100).toFixed(2)+' "" '+quote(l.description||''));lines.push('}');});
 return encodePC8(lines.join('\r\n')+'\r\n');
}

