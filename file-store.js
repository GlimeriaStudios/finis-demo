let dbPromise,queued;
function db(){return dbPromise??=new Promise((resolve,reject)=>{const r=indexedDB.open('finis-receipts',1);r.onupgradeneeded=()=>r.result.createObjectStore('files',{keyPath:'id'});r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
export async function storage(method,value){const d=await db();return new Promise((resolve,reject)=>{const tx=d.transaction('files',method==='get'?'readonly':'readwrite'),req=tx.objectStore('files')[method](value);let result;req.onsuccess=()=>result=req.result;tx.oncomplete=()=>resolve(result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});}
export const queueFile=(file,kind)=>{queued={file,kind};};
export const takeFile=()=>{const q=queued;queued=null;return q;};
export async function fileHash(file){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',await file.arrayBuffer())),b=>b.toString(16).padStart(2,'0')).join('');}
