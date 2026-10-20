import {createInvoice,editInvoice,issueInvoice,audit,pennies} from './ledger.js';
import {addCustomer,salesLines} from './suite-model.js';
import {invoiceAmounts} from './sales-details.js';
export function saveInvoiceLines(s,d,rawLines,invoiceId){
 const amounts=invoiceAmounts(rawLines,Number(d.vatRate??25));
 const i=saveInvoiceForm(s,{...d,vatRate:amounts.vatRate??0,description:amounts.items.map(l=>l.description).join('; '),net:(amounts.net/100).toFixed(2)},invoiceId);
 Object.assign(i,amounts);return i;
}
export function customerDetails(d){const c={name:String(d.name||'').trim(),email:String(d.email||'').trim(),org:String(d.org||'').trim(),address:String(d.address||'').trim()};if(!c.name)throw Error('Ange kundens namn.');if(c.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email))throw Error('Ange en giltig e-postadress.');return c;}
export function updateCustomer(s,id,d){const c=s.customers.find(c=>c.id===id);if(!c)throw Error('Kunden saknas.');const details=customerDetails(d);if(s.customers.some(x=>x.id!==id&&x.name.toLowerCase()===details.name.toLowerCase()))throw Error('Kunden finns redan.');Object.assign(c,details);audit(s,'Kunduppgifter uppdaterade',id);return c;}
export function saveInvoiceForm(s,d,invoiceId){
 const draft=structuredClone(s);let c;
 if(d.customerId==='new')c=addCustomer(draft,customerDetails({name:d.customer,email:d.email,org:d.org,address:d.address}));
 else {c=draft.customers.find(c=>c.id===d.customerId);if(!c)throw Error('Välj en sparad kund eller lägg till en ny.');}
 const details=customerDetails({name:c.name,email:d.email,org:d.org,address:d.address});
 const values={customer:c.name,description:d.description,date:d.date,due:d.due,net:pennies(d.net),vatRate:Number(d.vatRate)};
 const i=invoiceId?editInvoice(draft,invoiceId,values):createInvoice(draft,values);
 Object.assign(i,{customerId:c.id,customerDetails:{...details}});
 Object.assign(s,draft);return i;
}
export function sendInvoiceDemo(s,id,{email,subject,message}){
 const i=s.invoices.find(i=>i.id===id);if(!i||i.status==='Credited')throw Error('Fakturan kan inte skickas.');
 if(i.deliveryDemo)throw Error('Utskicket har redan simulerats.');
 email=String(email||'').trim();subject=String(subject||'').trim();
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw Error('Ange en giltig mottagaradress.');
 if(!subject)throw Error('Ange en ämnesrad.');
 if(i.status==='Draft')issueInvoice(s,id);
 i.deliveryDemo=true;i.delivery={mode:'demo',email,subject,message:String(message||''),at:new Date().toISOString(),status:'Simulerat — inget mejl skickat'};
 audit(s,'Fakturautskick simulerat (inget mejl)',id);return i;
}
