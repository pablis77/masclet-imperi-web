import{b as w,d as y}from"./listados-service.COETWV30.js";import{getCurrentLanguage as x,t as g}from"./config.DUTcyYPh.js";import"./hoisted.BvqcoGvE.js";import"./LanguageSwitcher.astro_astro_type_script_index_0_lang.BEmjKfY9.js";import"./apiService.CS3_UAep.js";import"./vendor.CwhrWGr6.js";function p(){try{const e=x();console.log("Listados: Actualizando traducciones al idioma:",e),document.querySelectorAll("[data-i18n-key]").forEach(s=>{const a=s.getAttribute("data-i18n-key");if(a){const i=g(a,e);i!==a&&(s.textContent=i,console.log(`Traducido '${a}' a '${i}'`))}});const n=document.getElementById("page-title");n&&(n.textContent=g("listings.title",e))}catch(e){console.error("Error al actualizar traducciones:",e)}}document.addEventListener("DOMContentLoaded",()=>{p(),window.addEventListener("storage",function(e){e.key==="userLanguage"&&p()})});document.addEventListener("DOMContentLoaded",async()=>{document.getElementById("listados-container");const e=document.getElementById("listados-table"),n=document.getElementById("listados-body"),s=document.getElementById("loading-message"),a=document.getElementById("error-message"),i=document.getElementById("empty-message");if(!localStorage.getItem("token")){window.location.href="/login";return}const m=localStorage.getItem("userLanguage")||"es",u={es:{view:"Ver",edit:"Editar",delete:"Eliminar",export:"Exportar",confirmDelete:"¿Estás seguro de que quieres eliminar este listado?",error:"Error al cargar los listados.",dateFormat:{day:"2-digit",month:"2-digit",year:"numeric"}},ca:{view:"Veure",edit:"Editar",delete:"Eliminar",export:"Exportar",confirmDelete:"Estàs segur que vols eliminar aquest llistat?",error:"Error al carregar els llistats.",dateFormat:{day:"2-digit",month:"2-digit",year:"numeric"}}},o=r=>u[m]?.[r]||r;try{const r=await w();if(s.classList.add("hidden"),r.length===0)i.classList.remove("hidden");else{e.classList.remove("hidden"),n.innerHTML="";const h=new Intl.DateTimeFormat(m==="ca"?"ca-ES":"es-ES",o("dateFormat"));r.forEach(t=>{const d=document.createElement("tr"),c=new Date(t.created_at),l=h.format(c);d.innerHTML=`
            <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-gray-100 sm:pl-6">
              ${t.nombre}
            </td>
            <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
              ${t.categoria||"-"}
            </td>
            <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
              ${t.animales_count||0}
            </td>
            <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
              ${l}
            </td>
            <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
              <div class="flex justify-end space-x-2">
                <a href="/listados/${t.id}" class="inline-flex items-center px-2 py-1 bg-primary text-white rounded hover:bg-primary/80">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                  ${o("view")}
                </a>
                <a href="/listados/editar/${t.id}" class="inline-flex items-center px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                  ${o("edit")}
                </a>
                <button 
                  data-listado-id="${t.id}" 
                  class="delete-button inline-flex items-center px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                  ${o("delete")}
                </button>
                <!-- Enlace de exportar eliminado -->
              </div>
            </td>
          `,n.appendChild(d)}),document.querySelectorAll(".delete-button").forEach(t=>{t.addEventListener("click",async d=>{const c=d.target.dataset.listadoId;if(confirm(o("confirmDelete")))try{await y(c),window.location.reload()}catch(l){console.error("Error al eliminar listado:",l),alert(l.message)}})})}}catch(r){console.error("Error al cargar listados:",r),s.classList.add("hidden"),a.classList.remove("hidden"),a.textContent=`${o("error")} ${r.message}`}});
