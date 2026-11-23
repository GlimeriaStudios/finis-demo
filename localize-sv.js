import {readLanguage,writeLanguage,translateText,validLanguage} from './language.js?v=20261123c';
let storage;try{storage=window.localStorage}catch{storage={getItem:()=>null,setItem:()=>{}}}
const requested=new URLSearchParams(location.search).get('lang');
let scope='device',language=validLanguage(requested)?requested:readLanguage(storage),running=false;
if(validLanguage(requested))try{writeLanguage(storage,scope,requested)}catch{}
let titleSource;
const textSources=new WeakMap(),attributeSources=new WeakMap();
export const currentLanguage=()=>language;
export function initializeLanguage(workspace,preferred){scope=workspace;language=readLanguage(localStorage,scope,preferred||readLanguage(localStorage));localizeDocument();}
export function setLanguage(value){if(!validLanguage(value))throw Error('Välj ett språk som stöds.');try{writeLanguage(storage,scope,value)}catch{}language=value;const url=new URL(location.href);url.searchParams.set('lang',value);history.replaceState(null,'',url);localizeDocument();}
function display(source,current){if(!source||current!==source.last)source={original:current,last:current};source.last=translateText(source.original,language);return source;}
function skip(element,attribute=false){return !element||Boolean(element.closest((attribute?'':'textarea,input,')+'script,style,datalist,svg,pre,code,[contenteditable],[translate="no"],[data-no-i18n],.company strong,.suite-row strong,.transaction-receipt'))||Boolean(element.closest('td')&&!element.closest('.pill'))||Boolean(element.closest('option')&&element.closest('select[name="customerId"],select[name="employeeId"],select[name="projectId"]')&&element.value!==''&&element.value!=='new');}
export function localizeDocument(){
 if(running||!document.body)return;running=true;observer?.disconnect();
 try{
  document.documentElement.lang=language==='en'?'en':'sv-SE';
  const title=document.title;if(!titleSource||title!==titleSource.last)titleSource={original:title,last:title};titleSource.last=titleSource.original.split(' | ').map(part=>translateText(part,language)).join(' | ');if(document.title!==titleSource.last)document.title=titleSource.last;
  const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let node;
  while(node=walker.nextNode()){
   if(skip(node.parentElement))continue;
   const option=node.parentElement.closest('option');if(option&&!option.hasAttribute('value'))option.setAttribute('value',option.value);
   const source=display(textSources.get(node),node.nodeValue);textSources.set(node,source);if(source.last!==node.nodeValue)node.nodeValue=source.last;
  }
  document.querySelectorAll('[placeholder],[aria-label],[title],[alt],meta[name="description"],meta[property="og:title"],meta[property="og:description"]').forEach(element=>{
   if(skip(element,true))return;let attributes=attributeSources.get(element);if(!attributes){attributes={};attributeSources.set(element,attributes);}
   for(const name of ['placeholder','aria-label','title','alt','content'])if(element.hasAttribute(name)){const current=element.getAttribute(name),source=display(attributes[name],current);attributes[name]=source;if(source.last!==current)element.setAttribute(name,source.last);}
  });
 }finally{observer?.observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['placeholder','aria-label','title']});running=false;}
}
const observer=new MutationObserver(localizeDocument);
const switcher=document.createElement('div');switcher.className='language-switcher';switcher.setAttribute('translate','no');switcher.innerHTML='<label for="site-language">Language / Språk</label><select id="site-language" aria-label="Language / Språk"><option value="sv" lang="sv">Svenska</option><option value="en" lang="en">English</option></select>';
document.body.prepend(switcher);switcher.querySelector('select').value=language;switcher.addEventListener('change',event=>setLanguage(event.target.value));
document.addEventListener('click',event=>{const link=event.target.closest('a[href]');if(!link||link.hasAttribute('download'))return;const url=new URL(link.href,location.href);if(url.origin===location.origin&&url.pathname.startsWith('/finis-demo/')&&!/\.[a-z0-9]+$/i.test(url.pathname)){url.searchParams.set('lang',language);link.href=url.href}},true);
localizeDocument();
