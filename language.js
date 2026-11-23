import {englishToSwedish,fragments,swedishToEnglish} from './language-catalog.js';
import {websiteEnglish} from './website-english.js?v=20261123c';
import {detailsEnglish} from './website-details-english.js';
export const LANGUAGES=[['sv','Svenska'],['en','English']];
export const validLanguage=value=>LANGUAGES.some(([code])=>code===value);
const inverse=Object.fromEntries(Object.entries(englishToSwedish).map(([en,sv])=>[sv,en]));
const englishCatalog={...inverse,...swedishToEnglish,...websiteEnglish,...detailsEnglish},reverseFragments=fragments.map(([en,sv])=>[sv,en]);
export function translateText(text,language){
 if(!validLanguage(language))return text;
 const trimmed=text.trim(),dict=language==='en'?englishCatalog:englishToSwedish;
 const exact=dict[trimmed];if(exact)return text.replace(trimmed,exact);
 if(language==='en'&&trimmed.startsWith('LÖSNINGAR / ')){const label=trimmed.slice(12);const entry=Object.entries(englishCatalog).find(([sv])=>sv.toLocaleUpperCase('sv')===label);return text.replace(trimmed,'SOLUTIONS / '+(entry?entry[1].toUpperCase():label));}
 let result=text;
 const pairs=language==='en'?reverseFragments:fragments;
 for(const [from,to]of pairs)result=result.replaceAll(from,to);
 if(language==='en'){
  result=result.replace(/^Arbetsyta \/ (.+)/,(_,label)=>'Workspace / '+(swedishToEnglish[label]||inverse[label]||label))
   .replace(/^(\d+) öppna fakturor$/,'$1 open invoices').replace(/^(\d+) kontorader att matcha$/,'$1 statement items to match')
   .replace(/^Förra året /,'Previous year ').replace(/ % mot samma period$/,' % vs the same period')
   .replace(/^Bokförda demoposter · /,'Posted demo entries · ').replace(/ · jämförelse /,' · comparison ').replace(/\. Utkast ingår inte\.$/,'. Drafts are excluded.')
   .replace(/^Steg (\d+) av (\d+)$/,'Step $1 of $2').replace(/^Granska /,'Review ').replace(/^Förfaller /,'Due ').replace(/^Underlag: /,'Evidence: ');
 }else{
  result=result.replace(/^Workspace \/ (.+)/,(_,label)=>'Arbetsyta / '+(englishToSwedish[label]||label))
   .replace(/^(\d+) open invoices$/,'$1 öppna fakturor').replace(/^(\d+) statement items to match$/,'$1 kontorader att matcha')
   .replace(/^Due /,'Förfaller ').replace(/^Review /,'Granska ').replace(/^Evidence: /,'Underlag: ');
 }
 return result;
}
export function readLanguage(storage,scope='device',fallback='sv'){
 try{const saved=storage.getItem('talo-language:'+scope);return validLanguage(saved)?saved:validLanguage(fallback)?fallback:'sv';}catch{return validLanguage(fallback)?fallback:'sv';}
}
export function writeLanguage(storage,scope,language){if(!validLanguage(language))throw Error('Välj ett språk som stöds.');storage.setItem('talo-language:'+scope,language);}
export function languageSettingsMarkup(language){return `<section class="panel"><div class="panel-head"><h2>Språk</h2></div><div class="panel-body"><label class="field">Appens språk<select id="app-language" aria-describedby="app-language-help">${LANGUAGES.map(([code,label])=>`<option value="${code}" lang="${code}" translate="no" ${code===language?'selected':''}>${label}</option>`).join('')}</select></label><p id="app-language-help" class="smallprint">Språket ändras direkt och sparas för den här arbetsytan på enheten. Svenska bokföringsregler och SEK påverkas inte.</p><p id="app-language-status" role="status" aria-live="polite"></p></div></section>`;}
