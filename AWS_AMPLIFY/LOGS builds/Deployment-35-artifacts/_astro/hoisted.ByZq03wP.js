import{n as u}from"./notificationService.BW46MYz-.js";import"./hoisted.BdTuqGqB.js";import"./LanguageSwitcher.astro_astro_type_script_index_0_lang.CXyVlJeA.js";import"./vendor.DPE1g--N.js";let p=0,i=20,s="all",f=!1;const n=document.getElementById("notifications-container"),x=document.getElementById("notifications-count"),m=document.getElementById("load-more-btn"),b=document.getElementById("filter-type"),y=document.getElementById("mark-all-read-btn"),v=document.getElementById("clear-all-btn");function E(e){const l=document.createElement("div");l.className=`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 ${e.read?"opacity-70":""}`;let a="bg-blue-100 dark:bg-blue-900/30",r="text-blue-600 dark:text-blue-400";switch(e.type){case"system":a="bg-amber-100 dark:bg-amber-900/30",r="text-amber-600 dark:text-amber-400";break;case"backup":a="bg-green-100 dark:bg-green-900/30",r="text-green-600 dark:text-green-400";break;case"animal":a="bg-blue-100 dark:bg-blue-900/30",r="text-blue-600 dark:text-blue-400";break;case"import":a="bg-purple-100 dark:bg-purple-900/30",r="text-purple-600 dark:text-purple-400";break}l.innerHTML=`
        <div class="flex items-start">
          <div class="flex-shrink-0 ${a} p-3 rounded-full">
            <span class="${r} text-lg">${e.icon}</span>
          </div>
          <div class="ml-4 flex-1">
            <div class="flex justify-between">
              <h3 class="text-sm font-medium text-gray-800 dark:text-white">${e.title}</h3>
              <span class="text-xs text-gray-500 dark:text-gray-400">${e.relative_time}</span>
            </div>
            <p class="mt-1 text-sm text-gray-600 dark:text-gray-300">${e.message}</p>
            <div class="mt-2 flex">
              <button class="text-xs text-primary hover:underline mr-3 mark-read-btn" data-id="${e.id}">
                ${e.read?"Ya leído":"Marcar como leído"}
              </button>
              <button class="text-xs text-red-500 hover:underline delete-btn" data-id="${e.id}">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      `;const t=l.querySelector(".mark-read-btn");t&&t.addEventListener("click",async()=>{const o=parseInt(t.getAttribute("data-id"));await u.markAsRead(o),c(p,i,s)});const d=l.querySelector(".delete-btn");return d&&d.addEventListener("click",async()=>{const o=parseInt(d.getAttribute("data-id"));await u.deleteNotification(o),c(0,i,s)}),l}async function c(e=0,l=20,a="all"){if(n){e===0&&(n.innerHTML=`
            <div class="text-center py-12 text-gray-500 dark:text-gray-400">
              <div class="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent rounded-full mb-4" role="status">
                <span class="sr-only">Cargando...</span>
              </div>
              <p>Cargando notificaciones...</p>
            </div>
          `);try{const t=await u.getNotifications(!1,l,e);if(!t||typeof t!="object"){console.error("La respuesta del servidor no es válida:",t),n.innerHTML=`
              <div class="text-center py-12 text-gray-500 dark:text-gray-400">
                <p>Error al cargar notificaciones. Respuesta inválida.</p>
              </div>
            `;return}e===0&&(n.innerHTML="");const d=t.items||[];if(x&&(x.textContent=t.total||0),m&&(t.has_more?(m.classList.remove("hidden"),f=!0):(m.classList.add("hidden"),f=!1)),d.length===0&&e===0){n.innerHTML=`
              <div class="text-center py-12 text-gray-500 dark:text-gray-400">
                <p>No hay notificaciones para mostrar</p>
              </div>
            `;return}let o=d;if(a!=="all"&&(o=d.filter(g=>g&&g.type===a)),o.length===0&&e===0){n.innerHTML=`
              <div class="text-center py-12 text-gray-500 dark:text-gray-400">
                <p>No hay notificaciones de este tipo</p>
              </div>
            `;return}o.forEach(g=>{const k=E(g);n.appendChild(k)})}catch(r){console.error("Error al cargar notificaciones:",r),n.innerHTML=`
            <div class="text-center py-12 text-red-500">
              <p>Error al cargar notificaciones. Por favor, inténtalo de nuevo.</p>
            </div>
          `}}}document.addEventListener("DOMContentLoaded",()=>{c(0,i,s),b&&b.addEventListener("change",()=>{s=b.value,p=0,c(0,i,s)}),m&&m.addEventListener("click",()=>{f&&(p+=i,c(p,i,s))}),y&&y.addEventListener("click",async()=>{await u.markAllAsRead(),c(0,i,s)}),v&&v.addEventListener("click",async()=>{confirm("¿Estás seguro de que quieres eliminar todas las notificaciones?")&&c(0,i,s)})});u.startPolling(6e4);
