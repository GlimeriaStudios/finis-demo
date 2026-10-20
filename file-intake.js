let heicLib;
export function supportedFile(file){return /\.(jpe?g|png|webp|bmp|heic|heif|pdf)$/i.test(file.name)&&file.size<=10*1024*1024;}
export async function readDocument(file,status,ocr){
 if(!supportedFile(file))throw Error('Välj en bild eller PDF under 10 MB.');
 if(/\.pdf$/i.test(file.name)){
 const pdfjs=await import('./vendor/pdf/pdf.min.js');pdfjs.GlobalWorkerOptions.workerSrc='/finis-demo/vendor/pdf/pdf.worker.min.js';
 const loading=pdfjs.getDocument({data:new Uint8Array(await file.arrayBuffer()),isEvalSupported:false});const pdf=await loading.promise;
 try{if(pdf.numPages>10)throw Error('Demon stöder högst 10 PDF-sidor.');let text='',preview='';
 for(let i=1;i<=pdf.numPages;i++){status.textContent=`Läser PDF, sida ${i} av ${pdf.numPages}…`;const page=await pdf.getPage(i),content=await page.getTextContent();let pageText=content.items.map(x=>x.str+(x.hasEOL?'\n':' ')).join('');if(i===1||pageText.trim().length<30){const viewport=page.getViewport({scale:Math.min(2,1800/page.getViewport({scale:1}).width)}),canvas=document.createElement('canvas');canvas.width=viewport.width;canvas.height=viewport.height;await page.render({canvasContext:canvas.getContext('2d'),viewport}).promise;if(i===1)preview=canvas.toDataURL('image/png');if(pageText.trim().length<30)pageText=await ocr(await new Promise(resolve=>canvas.toBlob(resolve)),status);canvas.width=canvas.height=1;}text+=pageText+'\n';page.cleanup();}
 return {text,preview,pages:pdf.numPages};}finally{await loading.destroy();}}
 let image=file;if(/\.hei[cf]$/i.test(file.name)){status.textContent='Konverterar HEIC för granskning…';if(!heicLib)heicLib=new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='/finis-demo/vendor/heic/heic2any.min.js';script.onload=resolve;script.onerror=()=>{heicLib=null;reject(Error('HEIC-avkodaren kunde inte laddas.'));};document.head.append(script);});await heicLib;const result=await window.heic2any({blob:file,toType:'image/png'});image=Array.isArray(result)?result[0]:result;if(Array.isArray(result)&&result.length>1)throw Error('HEIC med flera bilder: exportera en enskild bild först.');}
 return {text:await ocr(image,status),preview:URL.createObjectURL(image),pages:1};
}

