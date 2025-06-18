import"./hoisted.Aq9NsjF5.js";import{e as i}from"./vendor.DPE1g--N.js";import"./LanguageSwitcher.astro_astro_type_script_index_0_lang.DhuIQNJ0.js";const o=i([]);let c=0;function n(t,e,r,s=5e3){const l=`msg-${Date.now()}-${c++}`,a={id:l,type:t,title:e,content:r,duration:s,dismissible:!0};return o.set([...o.get(),a]),s>0&&setTimeout(()=>{d(l)},s),l}function d(t){const e=o.get();o.set(e.filter(r=>r.id!==t))}const x=(t,e,r)=>n("success",t,e,r),p=(t,e,r)=>n("error",t,e,r);function u(t){let e,r,s,l;switch(t.type){case"success":e="bg-green-50 dark:bg-green-900/20",r="border-green-500 dark:border-green-700",s="text-green-800 dark:text-green-300",l=`<svg class="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>`;break;case"error":e="bg-red-50 dark:bg-red-900/20",r="border-red-500 dark:border-red-700",s="text-red-800 dark:text-red-300",l=`<svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>`;break;case"warning":e="bg-yellow-50 dark:bg-yellow-900/20",r="border-yellow-500 dark:border-yellow-700",s="text-yellow-800 dark:text-yellow-300",l=`<svg class="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>`;break;default:e="bg-blue-50 dark:bg-blue-900/20",r="border-blue-500 dark:border-blue-700",s="text-blue-800 dark:text-blue-300",l=`<svg class="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>`}const a=document.createElement("div");return a.id=`message-${t.id}`,a.className=`message-alert rounded-lg border ${r} ${e} p-4 shadow-lg transform transition-all duration-300 ease-in-out opacity-0 translate-x-4`,a.setAttribute("role","alert"),a.innerHTML=`
      <div class="flex items-start">
        <div class="flex-shrink-0">
          ${l}
        </div>
        <div class="ml-3 flex-grow">
          ${t.title?`<h3 class="text-sm font-medium ${s}">${t.title}</h3>`:""}
          <div class="mt-1 text-sm ${s}">
            <p>${t.content}</p>
          </div>
        </div>
        ${t.dismissible?`
          <div class="ml-auto pl-3">
            <div class="-mx-1.5 -my-1.5">
              <button 
                type="button" 
                class="inline-flex rounded-md p-1.5 text-gray-500 hover:text-gray-600 focus:outline-none" 
                aria-label="Cerrar"
                onclick="document.dispatchEvent(new CustomEvent('dismiss-message', { detail: { id: '${t.id}' } }))"
              >
                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        `:""}
      </div>
    `,a}function g(t){const e=document.getElementById("message-container");if(!e)return;const r=u(t);return e.appendChild(r),setTimeout(()=>{r.classList.remove("opacity-0","translate-x-4"),r.classList.add("opacity-100","translate-x-0")},10),r}function m(t){const e=document.getElementById(`message-${t}`);e&&(e.classList.add("opacity-0","translate-x-4"),setTimeout(()=>{e.remove()},300))}document.addEventListener("DOMContentLoaded",()=>{document.addEventListener("dismiss-message",t=>{const{id:e}=t.detail;d(e)}),o.subscribe(t=>{const e=document.getElementById("message-container");if(!e)return;const r=Array.from(e.children).map(s=>s.id.replace("message-",""));t.forEach(s=>{r.includes(s.id)||g(s)}),r.forEach(s=>{t.some(l=>l.id===s)||m(s)})})});export{p as a,x as s};
