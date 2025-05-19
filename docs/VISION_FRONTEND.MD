## Visualización en el Frontend

### Vista de DASHBOARD

vistas a determinar con todos los endpoints que tenemos ahora mismo en fastAPI

primero las ponemos todas y ya ire desbrozando cuales son utiles y cuales NO

### Vista de Explotaciones

La interfaz de usuario para explotaciones debe:

1. Mostrar una lista de tarjetas (cards), una por cada explotación única (basado en el campo `explotacio` de los animales)
2. Cada tarjeta debe mostrar:

   - Nombre de la explotación en mayúsculas
   - Recuento total de animales
   - Recuentos parciales de:
     - Toros (animales con género "M")
     - Vacas (animales con género "F")
     - Terneros (calculado por el estado de amamantamiento de las vacas)
3. Al hacer clic en una explotación, mostrar una lista ordenada de animales:

   - Toros
   - Vacas sin amamantar
   - Vacas con 2 terneros
   - Vacas con 1 ternero
   - Animales fallecidos (estado "DEF")
4. Incluir opciones para exportar los datos en formatos como PDF.

### Vista de ANIMALES



creo que es mejor empezar por ANIMALES que es el nucleo central de la aplicacion, luego con EXPLOTACIONES, luego DASHBOARD, luego IMPORTACIONES, y leugo ya vemos BACKUP, y cuando tengamos todos eso ya le metemos mano a USUARIOS y con todo ya generamos los ROLES efectivos y decidimos a que va a tener acceso cada ROL

la barra lateral y la superior ahora mismo me gusta como se ven. LAS MANTENEMOS ASI.

sobre la ventana/pestaña ANIMALES:@dom-element:div
ahora mismo los botones + neuvo animal y actualizar me gustan donde estan (cuando veamos como funciona el responsive en el movil ya veremos si hayq ue acmbairlos un poco, de momento ahi estan bien.@dom-element:a@dom-element:button:refreshBtn@dom-element:div
me gusta la vista que tiene ahora en general, la primera CARD@dom-element:div prefiero que la priemra barra de bsuqueda arriba de la card se el buscador y debajo los filtros de expltoacion, genero, estado...
me gusta donde estan los botones de limpiar y aplicar filtro (aunque el texto aplicar filtro lo quiero cambiar por BUSCAR)
la siguiente card de lsitado de animales  me gusta mucho@dom-element:div
esa matriz con las columnas tipo, nombre explotacion, estado y ACCIONES me gusta (el codigo de momento en ese resumen de lsitado lo quitamos)
cuando pinchamos en el boton ver @dom-element🅰️AnimalTable@dom-element:div me gusta mucho la ventana que sale
con una primera card @dom-element:div donde se ven campos utiles y ademas esta el boton de actualizar a mano @dom-element:a
la car de abajo me gusta mas aun@dom-element:div con sus pestañas de:
INFORMACION COMPLETA: que deben eatr todos los campos menos los del parto (sobran dos @dom-element:h3@dom-element:h3  y como bien has mencioando hay algunos terminos que utilizxan que no son los de nuestras reglas de negocio
HISTORIAL DE PARTOS:@dom-element:div  aqui sobra lod e ficha de ternero, aqui igual si que dejamos la opcion de ver foto(por si en un momento como mejora implementamos que el ganadero cuelgue una foto del ternero, parto etc)
HISTORIAL DE CAMBIOS:@dom-element:div  (este la informacion me parece4 muy correcta y completa tal y como esta en esa simulacion.

si pinchamos en actualizar:@dom-element:a@dom-element:main tambien esta muy bien, la primera card @dom-element:div esat bien en formato.  es cierto que hay dos pestañas, la de datos generales (que tienen que estar todos los datos para actualizar@dom-element:div, menos los que figuran en  cambios habituales@dom-element:div  que aqui si estan todos, los datos de estado, almamantar y luego los de registro de aprto neuvo con una ventana de observaciones que peude estar muy bien tambien.

cuando estas dentro de una ficha animal, desde estas subventanas deberiamos tener una opcion para vovler a la ventana principal de animales en la aprte baja de la ventans (pensando en caundo estemos con el movil no tener que subir arriba. esta la de volver atras que es muy util, @dom-element:a , pero no vuelves a la principal de animales

otra vez en la ventana principal si pinchasmo + nuevo animal @dom-element:a@dom-element:div sale una ventana que en estructura esta bien pero tiene que aparacer todos los campos de neustra regla de negocio, todos te diria menos los de un nuevo parto, siendo obligatorios, los que ya tenemos ahbaldo marcados con un asterisco.

por ultimo te dejo los tres errores que da de consola el preview @web-context:console-logs

si te digo que aqui hay como ya has dicho antes y te confirmo muchas inconsistencia de nomenclaturas y de campos de nuestras reglas de negocio y ademas todo los datos que hay aqui son simualdos, y ya es improtante que conectemos todo con los endpoitns del backend con datos reales.

Ficha de Animal

Debe incluir:

1. Información completa del animal
2. Historial de cambios realizados (desde `animal_history`)
3. Para hembras, mostrar historial de partos


### Vista de USUARIOS

### Vista de IMPORTACIONES

### Vista de BACKUP
