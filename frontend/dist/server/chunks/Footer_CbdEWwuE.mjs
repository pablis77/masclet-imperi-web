import { c as createComponent, m as maybeRenderHead, d as addAttribute, b as renderTemplate, a as createAstro, r as renderComponent } from './vendor_XrHmsJ5B.mjs';
import 'kleur/colors';
import 'clsx';
/* empty css                        */

const common$1 = {
	welcome: "Bienvenido a Masclet Imperi",
	home: "Inicio",
	animals: "Animales",
	exploitations: "Explotaciones",
	partos: "Partos",
	dashboard: "Panel de control",
	imports: "Importaciones",
	users: "Usuarios",
	settings: "Configuración",
	logout: "Cerrar sesión",
	login: "Iniciar sesión",
	search: "Buscar",
	save: "Guardar",
	cancel: "Cancelar",
	"delete": "Eliminar",
	edit: "Editar",
	view: "Ver",
	back: "Volver",
	next: "Siguiente",
	previous: "Anterior",
	loading: "Cargando...",
	error: "Error",
	success: "Éxito",
	warning: "Advertencia",
	info: "Información",
	confirm: "Confirmar",
	accept: "Aceptar",
	yes: "Sí",
	no: "No",
	male: "Macho",
	female: "Hembra",
	active: "Vivo",
	dead: "Muerto",
	not_available: "No disponible",
	esforrada: "Esforra",
	no_results: "No se han encontrado resultados",
	current_month: "Mes actual"
};
const auth$1 = {
	username: "Usuario",
	password: "Contraseña",
	login: "Iniciar sesión",
	logout: "Cerrar sesión",
	login_error: "Error al iniciar sesión",
	login_success: "Sesión iniciada correctamente"
};
const animals$1 = {
	title: "Listado de Animales",
	update: {
		loading: "Cargando...",
		loading_message: "Cargando datos del animal...",
		error: "Error",
		error_message: "Error al cargar los datos del animal",
		error_loading: "Error al cargar el animal",
		return_to_detail: "Volver al detalle",
		edit: "Editar",
		general_data: "Datos Generales",
		common_changes: "Cambios Habituales",
		confirm_delete_title: "Confirmar eliminación",
		confirm_delete_text: "¿Estás seguro de que quieres eliminar este animal? Esta acción no se puede deshacer.",
		delete_permanently: "Eliminar definitivamente"
	},
	form: {
		show_debug: "Mostrar debug",
		debug_mode: "MODO DEPURACIÓN",
		clear: "Limpiar",
		name: "Nombre",
		gender: "Género",
		male: "Macho",
		female: "Hembra",
		birth_date: "Fecha de nacimiento",
		code: "Código",
		serial_number: "Número de serie",
		exploitation: "Explotación",
		origin: "Origen",
		father: "Padre",
		mother: "Madre",
		mother_hint: "(Usa el botón 'Guardar Cambios' al final del formulario para actualizar este campo)",
		observations: "Observaciones (máx. 2000 caracteres)",
		observations_hint: "Añade notas o información adicional sobre el animal",
		pending_changes: "Los campos marcados con borde azul indican cambios pendientes de guardar.",
		back: "Volver",
		view_detail: "Ver Detalle",
		save_changes: "Guardar Cambios"
	},
	habitual: {
		title: "Estado y Amamantamiento",
		status: "Estado",
		active: "Activo",
		deceased: "Fallecido",
		nursing_status: "Estado de amamantamiento",
		not_nursing: "No amamanta",
		nursing_one: "Un ternero",
		nursing_two: "Dos terneros",
		save_changes: "Guardar Cambios",
		new_birth_title: "Registrar Nuevo Parto",
		birth_date: "Fecha de Parto",
		offspring_gender: "Género Cría",
		select: "Seleccionar...",
		miscarriage: "Esforrada",
		offspring_status: "Estado Cría",
		observations: "Observaciones (máx. 200 caracteres)",
		observations_hint: "Notas breves sobre el cambio realizado",
		register_birth: "Registrar Parto"
	},
	filter_placeholder: "Buscar por nombre, explotación...",
	tab_all: "Todos",
	tab_vacas: "Vacas",
	tab_toros: "Toros",
	edit: "Editar",
	"delete": "Eliminar",
	no_observations: "Sin observaciones",
	"new": "Nuevo animal",
	details: "Detalles del animal",
	list: "Lista de animales",
	search: "Buscar animal",
	filters: "Filtros",
	gender: "Género",
	male: "Macho",
	female: "Hembra",
	status: "Estado",
	table: {
		type: "Tipo",
		name: "Nombre",
		code: "Código",
		exploitation: "Explotación",
		status: "Estado",
		actions: "Acciones",
		update: "Actualizar",
		view: "Ver",
		active: "Activo",
		inactive: "Baja",
		loading: "Cargando...",
		total_animals: "Total: {0} animales",
		search_results: "Búsqueda: \"{0}\" ({1} coincidencias)",
		mock_data: "DATOS SIMULADOS",
		mock_warning: "Mostrando datos simulados. No se pudo conectar con el servidor. Los animales mostrados son de ejemplo y no reflejan datos reales."
	},
	active: "Activo",
	deceased: "Fallecido",
	name: "Nombre",
	exploitation: "Explotación",
	birth_date: "Fecha de nacimiento",
	father: "Padre",
	mother: "Madre",
	stable: "Cuadra",
	code: "Código",
	serial_number: "Número de serie",
	nursing: "Amamantamiento",
	not_nursing: "No amamantando",
	nursing_one: "Amamantando 1 ternero",
	nursing_two: "Amamantando 2 terneros",
	delete_confirm: "¿Está seguro de que desea eliminar este animal?",
	no_results: "No se encontraron animales"
};
const partos$1 = {
	title: "Partos",
	"new": "Nuevo parto",
	edit: "Editar parto",
	details: "Detalles del parto",
	date: "Fecha del parto",
	gender: "Género de la cría",
	male: "Macho",
	female: "Hembra",
	miscarriage: "Esforrada",
	status: "Estado de la cría",
	active: "Activo",
	deceased: "Fallecido",
	changes_history: "Historial de Cambios",
	changes_registry: "Registro de cambios realizados en este animal",
	no_changes: "Aún no hay cambios registrados para este animal",
	delete_confirm: "¿Está seguro de que desea eliminar este parto?",
	no_partos: "No hay registros de partos para este animal",
	delete_birth: "Eliminar parto",
	edit_birth: "Editar",
	delete_birth_message: "¿Seguro que desea eliminar este parto? Esta acción no se puede deshacer.",
	cancel: "Cancelar",
	confirm: "Confirmar"
};
const explotations$1 = {
	title: "Explotaciones",
	"new": "Nueva explotación",
	edit: "Editar explotación",
	details: "Detalles de la explotación",
	list: "Lista de explotaciones",
	search: "Buscar explotación",
	code: "Código",
	name: "Nombre",
	delete_confirm: "¿Está seguro de que desea eliminar esta explotación?",
	no_results: "No se encontraron explotaciones",
	animals_count: "Número de animales"
};
const dashboard$1 = {
	title: "Panel de Control",
	welcome: "Bienvenido al Panel de Control",
	loading_exploitations: "Cargando información de explotaciones...",
	no_exploitations_data: "No hay datos de explotaciones disponibles",
	summary_card: {
		period: "Período",
		days: "días",
		animals_summary: "Resumen de Animales",
		total_animals: "Total de animales",
		active_animals: "Animales activos",
		active_males: "Machos activos",
		active_females: "Hembras activas",
		nursing_status: "Estado de Amamantamiento",
		cows_not_nursing: "Vacas no amamantando",
		nursing_one_calf: "Amamantando 1 ternero",
		nursing_two_calves: "Amamantando 2 terneros",
		population_analysis: "Análisis Poblacional (Total)",
		bulls: "Toros",
		cows: "Vacas",
		deceased: "Fallecidos",
		male_female_ratio: "Ratio Machos/Hembras",
		last_update: "Última actualización"
	},
	exploitations: "Explotaciones",
	exploitation: "Explotación",
	total_active: "Total Activos",
	active_bulls: "Toros Activos",
	cows_nursing_one: "Vacas amamantando 1 ternero",
	cows_nursing_two: "Vacas amamantando 2 terneros",
	cows_not_nursing: "Vacas no amamantando",
	births: "Partos",
	ratio: "Ratio",
	summary: "Resumen general",
	animals_count: "Total de animales",
	partos_count: "Total de partos",
	exploitations_count: "Total de explotaciones",
	active_animals: "Animales activos",
	deceased_animals: "Animales fallecidos",
	gender_distribution: "Distribución por género",
	partos_analysis: "Análisis de partos",
	yearly_distribution: "Distribución anual",
	monthly_distribution: "Distribución mensual",
	loading: "Cargando resumen general...",
	loading_error: "Error al cargar estadísticas",
	section_animals_summary: "Resumen de Animales",
	section_nursing_status: "Estado de Amamantamiento",
	section_population: "Análisis Poblacional",
	females: "Hembras",
	males: "Machos",
	by_gender: "Por género",
	by_status: "Por estado",
	nursing_stats: "Estadísticas de amamantamiento",
	not_nursing: "No amamantando",
	nursing_one: "Amamantando 1",
	nursing_two: "Amamantando 2",
	active: "Activos",
	deceased: "Fallecidos",
	others: "Otros",
	cows_with_two_calves: "Vacas con Dos Terneros (Activas)",
	population_analysis: "Análisis Poblacional",
	male_female_ratio: "Ratio Machos/Hembras",
	survival_rate: "Supervivencia",
	terneros_count: "Total de Terneros",
	refresh: "Actualizar",
	loading_data: "Cargando datos del panel...",
	trends: "Tendencias",
	previous_month_births: "Partos mes anterior",
	current_month_births: "Partos mes actual",
	variation: "Variación",
	animals_distribution: "Distribución de Animales",
	average_births_per_month: "Nacimientos promedio mensual",
	analysis_period: "Período de Análisis",
	from: "Desde",
	to: "hasta",
	total: "Total",
	calves_proportion: "Proporción de Terneros",
	animals: "animales",
	average_births_per_cow: "Promedio de Partos por Vaca",
	total_births: "Total partos",
	active_exploitations: "Explotaciones Activas",
	with_activity_in_period: "Con actividad en el periodo"
};
const dashboard_compare$1 = {
	title: "Comparación de Dashboards",
	side_by_side: "Vista Lado a Lado",
	toggle_view: "Vista Alternar"
};
const dashboard_direct$1 = {
	title: "Dashboard (Versión Directa)"
};
const backup$1 = {
	title: "Copias de Seguridad del Sistema",
	subtitle: "Gestiona y restaura copias de seguridad del sistema",
	protocol: "Protocolo de copias de seguridad",
	automatic: "Copias automáticas",
	automaticDesc: "El sistema realiza backups automáticos en las siguientes situaciones:",
	autoDaily: "Cada día a las 2:00 AM (copia diaria completa)",
	autoNewAnimals: "Cuando se crean nuevas fichas de animales",
	autoEditedAnimals: "Cuando se editan datos importantes en fichas existentes",
	autoAfterImport: "Después de cada importación de datos",
	retentionPolicy: "Política de retención",
	retentionDesc: "Se mantienen las últimas 14 copias de seguridad:",
	retentionDaily: "7 copias diarias más recientes",
	retentionWeekly: "7 copias semanales históricas",
	storage: "Almacenamiento",
	storageDesc: "Todas las copias se almacenan de forma segura en la nube con cifrado, asegurando la recuperación en caso de cualquier incidencia.",
	manualBackups: "Copias manuales",
	manualDesc: "Como administrador, puedes crear copias de seguridad manuales adicionales en cualquier momento desde esta sección, especialmente antes de realizar cambios importantes en el sistema.",
	createBackup: "Crear copia de seguridad",
	createDesc: "Crea una copia de seguridad completa de la base de datos, incluyendo todos los animales, partos y configuraciones del sistema.",
	includeAnimals: "Incluir datos de animales",
	includeBirths: "Incluir datos de partos",
	includeConfig: "Incluir configuración de usuarios",
	createButton: "Crear copia de seguridad ahora",
	restoreBackup: "Restaurar copia de seguridad",
	restoreDesc: "Restaura el sistema a partir de una copia de seguridad previamente creada.",
	warning: "¡Precaución! Esta acción reemplazará todos los datos actuales.",
	selectFile: "Selecciona un archivo de copia",
	or: "o",
	selectButton: "Seleccionar archivo",
	restoreButton: "Restaurar sistema",
	historyTitle: "Historial de copias de seguridad",
	date: "Fecha",
	size: "Tamaño",
	createdBy: "Creado por",
	type: "Tipo",
	description: "Descripción",
	actions: "Acciones",
	download: "Descargar",
	restore: "Restaurar",
	"delete": "Eliminar",
	loading: "Cargando...",
	confirm_delete: "¿Está seguro que desea eliminar esta copia de seguridad?",
	confirm_restore: "¿Está seguro que desea restaurar el sistema con esta copia de seguridad? Esta acción reemplazará todos los datos actuales.",
	no_backups: "No hay copias de seguridad disponibles",
	backup_created: "Copia de seguridad creada con éxito",
	backup_error: "Error al crear la copia de seguridad",
	restore_success: "Sistema restaurado correctamente",
	restore_error: "Error al restaurar el sistema",
	error: "Error",
	restoreInProgress: "Restaurando sistema...",
	deleteSuccess: "Copia de seguridad eliminada correctamente",
	deleteInProgress: "Eliminando...",
	backupInProgress: "Creando copia de seguridad...",
	autoBackup: "Copia automática",
	systemBackup: "Copia del sistema",
	manualBackup: "Copia manual"
};
const ui$1 = {
	edit_profile: "Editar Perfil",
	change_password: "Cambiar Contraseña",
	logout: "Cerrar Sesión",
	operation_success: "Operación completada con éxito",
	operation_error: "Ha ocurrido un error",
	processing: "Procesando solicitud...",
	required_field: "Campo obligatorio",
	invalid_format: "Formato incorrecto",
	min_length: "Debe tener al menos {0} caracteres",
	confirm_continue: "¿Está seguro que desea continuar?",
	action_irreversible: "Esta acción no se puede deshacer",
	cancel: "Cancelar",
	confirm: "Confirmar"
};
const footer$1 = {
	rights_reserved: "Todos los derechos reservados",
	version: "Versión",
	about: "Acerca de",
	help: "Ayuda",
	privacy: "Privacidad",
	terms: "Términos"
};
const imports$1 = {
	title: "Importaciones",
	"new": "Nueva importación",
	history: "Historial de importaciones",
	file: "Archivo",
	status: "Estado",
	date: "Fecha",
	records: "Registros",
	success: "Éxito",
	failed: "Fallida",
	pending: "Pendiente",
	processing: "Procesando",
	completed: "Completada",
	upload: "Subir archivo",
	drag_drop: "Arrastre y suelte el archivo aquí",
	select_file: "Seleccionar archivo",
	uploaded: "Archivo subido correctamente",
	processing_file: "Procesando archivo...",
	import_success: "Importación completada correctamente",
	import_error: "Error al procesar la importación"
};
const users$1 = {
	table: {
		loading: "Cargando usuarios...",
		error: "Error al cargar la lista de usuarios. Por favor, inténtalo de nuevo.",
		showing: "Mostrando",
		of: "de",
		users: "usuarios",
		show: "Mostrar:",
		user: "Usuario",
		email: "Correo electrónico",
		role: "Rol",
		status: "Estado",
		actions: "Acciones",
		no_users: "No hay usuarios para mostrar",
		active: "Activo",
		inactive: "Inactivo",
		edit: "Editar",
		"delete": "Eliminar",
		confirm_delete_title: "Confirmar eliminación",
		confirm_delete_message: "¿Estás seguro de que deseas eliminar al usuario {username}?",
		confirm: "Eliminar",
		cancel: "Cancelar",
		delete_error: "Error al eliminar el usuario. Por favor, inténtalo de nuevo."
	},
	form: {
		title_new: "Nuevo usuario",
		title_edit: "Editar usuario",
		username: "Nombre de usuario",
		username_placeholder: "Introduce el nombre de usuario",
		email: "Correo electrónico",
		email_placeholder: "Introduce el correo electrónico",
		password: "Contraseña",
		password_placeholder: "Introduce la contraseña",
		confirm_password: "Confirmar contraseña",
		confirm_password_placeholder: "Confirma la contraseña",
		full_name: "Nombre completo",
		full_name_placeholder: "Introduce el nombre completo",
		role: "Rol",
		select_role: "Selecciona un rol",
		administrator: "Administrador",
		manager: "Gerente",
		editor: "Editor",
		user: "Usuario",
		active: "Activo",
		save: "Guardar",
		cancel: "Cancelar",
		validation: {
			username_required: "El nombre de usuario es obligatorio",
			email_required: "El correo electrónico es obligatorio",
			email_invalid: "El correo electrónico no es válido",
			password_required: "La contraseña es obligatoria",
			password_min_length: "La contraseña debe tener al menos 6 caracteres",
			passwords_not_match: "Las contraseñas no coinciden",
			role_required: "El rol es obligatorio"
		},
		success_create: "Usuario creado correctamente",
		success_update: "Usuario actualizado correctamente",
		error_create: "Error al crear el usuario",
		error_update: "Error al actualizar el usuario"
	}
};
const errors$1 = {
	generic: "Ha ocurrido un error",
	not_found: "No encontrado",
	unauthorized: "No autorizado",
	forbidden: "Acceso denegado",
	server_error: "Error del servidor",
	validation_error: "Error de validación",
	required_field: "Este campo es obligatorio",
	invalid_format: "Formato inválido",
	try_again: "Intentar de nuevo",
	go_home: "Ir al inicio"
};
const menu$1 = {
	dashboard: "Panel de Control",
	exploitations: "Explotaciones",
	animals: "Animales",
	listings: "Listados",
	imports: "Importaciones",
	users: "Usuarios",
	backup: "Copias de Seguridad",
	settings: "Configuración"
};
const listings$1 = {
	title: "Listados",
	description: "Gestiona los listados de animales",
	create: "Crear Listado",
	loading: "Cargando listados...",
	table: {
		name: "Nombre",
		category: "Categoría",
		animals: "Animales",
		createdAt: "Fecha de creación",
		actions: "Acciones"
	}
};
const settings$1 = {
	title: "Configuración",
	description: "Personaliza tu experiencia en Masclet Imperi",
	user_preferences: "Preferencias de usuario",
	language: "Idioma",
	languages: {
		spanish: "Español",
		catalan: "Catalán"
	},
	theme: "Tema visual",
	themes: {
		light: "Claro",
		dark: "Oscuro",
		system: "Usar preferencia del sistema"
	},
	notifications: "Notificaciones",
	notify_backups: "Avisos de copias de seguridad",
	notify_backups_desc: "Recibir notificación cuando se realicen copias de seguridad automáticas",
	notify_imports: "Avisos de importaciones",
	notify_imports_desc: "Recibir notificación cuando se completen importaciones",
	notify_animals: "Avisos sobre animales",
	notify_animals_desc: "Recibir notificación sobre cambios importantes en los animales",
	save_success: "Configuración guardada correctamente"
};
const notification$1 = {
	title: "Notificaciones",
	system_alerts: "Alertas del sistema",
	mark_all_read: "Marcar todo como leído",
	view_all: "Ver todas las alertas",
	view_all_description: "Gestiona todas tus notificaciones del sistema",
	no_notifications: "No hay notificaciones",
	test_create: "Crear notificaciones de prueba",
	filter_by: "Filtrar por",
	all_types: "Todos los tipos",
	clear_all: "Eliminar todas",
	loading: "Cargando notificaciones...",
	total_count: "notificaciones en total",
	load_more: "Cargar más",
	types: {
		system: "Sistema",
		backup: "Copia de seguridad",
		animal: "Animal",
		"import": "Importación"
	},
	priorities: {
		low: "Baja",
		medium: "Media",
		high: "Alta"
	}
};
const es$1 = {
	common: common$1,
	auth: auth$1,
	animals: animals$1,
	partos: partos$1,
	explotations: explotations$1,
	dashboard: dashboard$1,
	dashboard_compare: dashboard_compare$1,
	dashboard_direct: dashboard_direct$1,
	backup: backup$1,
	ui: ui$1,
	footer: footer$1,
	imports: imports$1,
	users: users$1,
	errors: errors$1,
	menu: menu$1,
	listings: listings$1,
	settings: settings$1,
	notification: notification$1
};

const esTranslations = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  animals: animals$1,
  auth: auth$1,
  backup: backup$1,
  common: common$1,
  dashboard: dashboard$1,
  dashboard_compare: dashboard_compare$1,
  dashboard_direct: dashboard_direct$1,
  default: es$1,
  errors: errors$1,
  explotations: explotations$1,
  footer: footer$1,
  imports: imports$1,
  listings: listings$1,
  menu: menu$1,
  notification: notification$1,
  partos: partos$1,
  settings: settings$1,
  ui: ui$1,
  users: users$1
}, Symbol.toStringTag, { value: 'Module' }));

const common = {
	welcome: "Benvingut a Masclet Imperi",
	home: "Inici",
	animals: "Animals",
	exploitations: "Explotacions",
	partos: "Parts",
	dashboard: "Tauler de control",
	imports: "Importacions",
	users: "Usuaris",
	settings: "Configuració",
	logout: "Tancar sessió",
	login: "Iniciar sessió",
	search: "Cercar",
	save: "Guardar",
	cancel: "Cancel·lar",
	"delete": "Eliminar",
	edit: "Editar",
	view: "Veure",
	back: "Tornar",
	next: "Següent",
	previous: "Anterior",
	loading: "Carregant...",
	error: "Error",
	success: "Èxit",
	warning: "Advertència",
	info: "Informació",
	confirm: "Confirmar",
	accept: "Acceptar",
	yes: "Sí",
	no: "No",
	male: "Mascle",
	female: "Femella",
	active: "Viu",
	dead: "Mort",
	not_available: "No disponible",
	esforrada: "Esforrada",
	no_results: "No s'han trobat resultats",
	current_month: "Mes actual"
};
const auth = {
	username: "Usuari",
	password: "Contrasenya",
	login: "Iniciar sessió",
	logout: "Tancar sessió",
	login_error: "Error al iniciar sessió",
	login_success: "Sessió iniciada correctament"
};
const animals = {
	title: "Llistat d'Animals",
	update: {
		loading: "Carregant...",
		loading_message: "Carregant dades de l'animal...",
		error: "Error",
		error_message: "Error en carregar les dades de l'animal",
		error_loading: "Error en carregar l'animal",
		return_to_detail: "Tornar al detall",
		edit: "Editar",
		general_data: "Dades Generals",
		common_changes: "Canvis Habituals",
		confirm_delete_title: "Confirmar eliminació",
		confirm_delete_text: "Estàs segur que vols eliminar aquest animal? Aquesta acció no es pot desfer.",
		delete_permanently: "Eliminar definitivament"
	},
	details: "Detalls de l'animal",
	id: "ID Animal:",
	add: "Afegir animal",
	"delete": "Eliminar animal",
	delete_birth: "Eliminar part",
	edit_birth: "Editar part",
	no_observations: "Sense observacions",
	no_births_record: "No hi ha registres de parts per a aquest animal",
	back_to_list: "Tornar al llistat",
	animal_file: "Fitxa d'Animal",
	form: {
		show_debug: "Mostrar debug",
		debug_mode: "MODE DEPURACIÓ",
		clear: "Netejar",
		name: "Nom",
		gender: "Gènere",
		male: "Mascle",
		female: "Femella",
		birth_date: "Data de naixement",
		code: "Codi",
		serial_number: "Número de sèrie",
		exploitation: "Explotació",
		origin: "Origen",
		father: "Pare",
		mother: "Mare",
		mother_hint: "(Fes servir el botó 'Guardar Canvis' al final del formulari per actualitzar aquest camp)",
		observations: "Observacions (màx. 2000 caràcters)",
		observations_hint: "Afegeix notes o informació addicional sobre l'animal",
		pending_changes: "Els camps marcats amb vora blava indiquen canvis pendents de guardar.",
		back: "Tornar",
		view_detail: "Veure Detall",
		save_changes: "Guardar Canvis"
	},
	habitual: {
		title: "Estat i Alletament",
		status: "Estat",
		active: "Actiu",
		deceased: "Mort",
		nursing_status: "Estat d'alletament",
		not_nursing: "No alleta",
		nursing_one: "Un vedell",
		nursing_two: "Dos vedells",
		save_changes: "Guardar Canvis",
		new_birth_title: "Registrar Nou Part",
		birth_date: "Data de Part",
		offspring_gender: "Gènere Cria",
		select: "Seleccionar...",
		miscarriage: "Esforrada",
		offspring_status: "Estat Cria",
		observations: "Observacions (màx. 200 caràcters)",
		observations_hint: "Notes breus sobre el canvi realitzat",
		register_birth: "Registrar Part"
	},
	filter_placeholder: "Cercar per nom, explotació...",
	tab_all: "Tots",
	tab_vacas: "Vaques",
	tab_toros: "Toros",
	table: {
		type: "Tipus",
		name: "Nom",
		code: "Codi",
		exploitation: "Explotació",
		status: "Estat",
		actions: "Accions",
		update: "Actualitzar",
		view: "Veure",
		active: "Actiu",
		inactive: "Baixa",
		loading: "Carregant...",
		total_animals: "Total: {0} animals",
		search_results: "Cerca: \"{0}\" ({1} coincidències)",
		mock_data: "DADES SIMULADES",
		mock_warning: "Mostrant dades simulades. No s'ha pogut connectar amb el servidor. Els animals mostrats són d'exemple i no reflecteixen dades reals."
	},
	active: "Actiu",
	deceased: "Mort",
	name: "Nom",
	exploitation: "Explotació",
	birth_date: "Data de naixement",
	father: "Pare",
	mother: "Mare",
	stable: "Quadra",
	code: "Codi",
	serial_number: "Número de sèrie",
	nursing: "Alletament",
	not_nursing: "No alletant",
	nursing_one: "Alletant 1 vedell",
	nursing_two: "Alletant 2 vedells",
	delete_confirm: "Està segur que vol eliminar aquest animal?",
	no_results: "No s'han trobat animals"
};
const partos = {
	title: "Parts",
	"new": "Nou part",
	edit: "Editar part",
	details: "Detalls del part",
	date: "Data del part",
	gender: "Gènere de la cria",
	male: "Mascle",
	female: "Femella",
	miscarriage: "Esforrada",
	status: "Estat de la cria",
	active: "Actiu",
	deceased: "Mort",
	changes_history: "Historial de Canvis",
	changes_registry: "Registre de canvis realitzats en aquest animal",
	no_changes: "Encara no hi ha canvis registrats per a aquest animal",
	animal_file: "Fitxa d'Animal",
	delete_confirm: "Està segur que vol eliminar aquest part?",
	no_partos: "No hi ha registres de parts per aquest animal",
	delete_birth: "Eliminar part",
	edit_birth: "Editar",
	delete_birth_message: "Segur que vol eliminar aquest part? Aquesta acció no es pot desfer.",
	cancel: "Cancel·lar",
	confirm: "Confirmar"
};
const explotations = {
	title: "Explotacions",
	"new": "Nova explotació",
	edit: "Editar explotació",
	details: "Detalls de l'explotació",
	list: "Llista d'explotacions",
	search: "Cercar explotació",
	code: "Codi",
	name: "Nom",
	delete_confirm: "Està segur que vol eliminar aquesta explotació?",
	no_results: "No s'han trobat explotacions",
	animals_count: "Nombre d'animals"
};
const dashboard = {
	title: "Tauler de control",
	welcome: "Benvingut al Tauler de control",
	loading_exploitations: "Carregant informació d'explotacions...",
	no_exploitations_data: "No hi ha dades d'explotacions disponibles",
	summary_card: {
		period: "Període",
		days: "dies",
		animals_summary: "Resum d'Animals",
		total_animals: "Total d'animals",
		active_animals: "Animals actius",
		active_males: "Mascles actius",
		active_females: "Femelles actives",
		nursing_status: "Estat d'Alletament",
		cows_not_nursing: "Vaques sense alletar",
		nursing_one_calf: "Alletant 1 vedell",
		nursing_two_calves: "Alletant 2 vedells",
		population_analysis: "Anàlisi Poblacional (Total)",
		bulls: "Toros",
		cows: "Vaques",
		deceased: "Morts",
		male_female_ratio: "Ràtio Mascles/Femelles",
		last_update: "Última actualització"
	},
	exploitations: "Explotacions",
	exploitation: "Explotació",
	total_active: "Total Actius",
	active_bulls: "Toros Actius",
	cows_nursing_one: "Vaques alletant 1 vedell",
	cows_nursing_two: "Vaques alletant 2 vedells",
	cows_not_nursing: "Vaques sense alletar",
	births: "Parts",
	ratio: "Ràtio",
	summary: "Resum general",
	animals_count: "Total d'animals",
	partos_count: "Total de parts",
	exploitations_count: "Total d'explotacions",
	active_animals: "Animals actius",
	deceased_animals: "Animals morts",
	gender_distribution: "Distribució per gènere",
	partos_analysis: "Anàlisi de parts",
	yearly_distribution: "Distribució anual",
	monthly_distribution: "Distribució mensual",
	loading: "Carregant resum general...",
	loading_error: "Error en carregar estadístiques",
	section_animals_summary: "Resum d'Animals",
	section_nursing_status: "Estat d'Alletament",
	section_population: "Anàlisi Poblacional",
	females: "Femelles",
	males: "Mascles",
	by_gender: "Per gènere",
	by_status: "Per estat",
	nursing_stats: "Estadístiques d'alletament",
	not_nursing: "No alletant",
	nursing_one: "Alletant 1",
	nursing_two: "Alletant 2",
	active: "Actius",
	deceased: "Morts",
	others: "Altres",
	cows_with_two_calves: "Vaques amb Dos Vedells (Actives)",
	population_analysis: "Anàlisi Poblacional",
	male_female_ratio: "Ràtio Mascles/Femelles",
	survival_rate: "Supervivència",
	terneros_count: "Total de Vedells",
	refresh: "Actualitzar",
	loading_data: "Carregant dades del tauler...",
	trends: "Tendències",
	previous_month_births: "Parts mes anterior",
	current_month_births: "Parts mes actual",
	variation: "Variació",
	animals_distribution: "Distribució d'Animals",
	average_births_per_month: "Naixements promig mensual",
	analysis_period: "Període d'Anàlisi",
	from: "Des de",
	to: "fins a",
	total: "Total",
	calves_proportion: "Proporció de Vedells",
	animals: "animals",
	average_births_per_cow: "Promig de Parts per Vaca",
	total_births: "Total parts",
	active_exploitations: "Explotacions Actives",
	with_activity_in_period: "Amb activitat en el període"
};
const dashboard_compare = {
	title: "Comparació de Taulers",
	side_by_side: "Vista Costat a Costat",
	toggle_view: "Vista Alternar"
};
const dashboard_direct = {
	title: "Tauler de Control (Versió Directa)"
};
const menu = {
	dashboard: "Tauler de control",
	animals: "Animals",
	exploitations: "Explotacions",
	users: "Usuaris",
	imports: "Importació",
	backup: "Còpies de seguretat",
	listings: "Llistats Personalitzats"
};
const listings = {
	title: "Llistats Personalitzats",
	description: "Crea i gestiona llistats personalitzats d'animals per a vacunació i altres propòsits.",
	empty: "No hi ha llistats personalitzats disponibles.",
	create: "Crear Nou Llistat",
	loading: "Carregant llistats...",
	error: "Error al carregar els llistats.",
	category: "Categoria",
	animalsCount: "Animals",
	actionsLabel: "Accions",
	viewBtn: "Veure",
	editBtn: "Editar",
	deleteBtn: "Eliminar",
	confirmDelete: "Esteu segur que voleu eliminar aquest llistat?",
	"export": "Exportar",
	table: {
		name: "Nom",
		category: "Categoria",
		animals: "Animals",
		createdAt: "Creat el",
		actions: "Accions"
	},
	detail: {
		title: "Detalls del Llistat",
		loading: "Carregant detalls del llistat..."
	},
	edit: {
		title: "Editar Llistat"
	},
	"new": {
		title: "Nou Llistat"
	}
};
const backup = {
	title: "Còpia de Seguretat del Sistema",
	subtitle: "Gestiona i restaura còpies de seguretat del sistema",
	protocol: "Protocol de còpies de seguretat",
	automatic: "Còpies automàtiques",
	automaticDesc: "El sistema realitza còpies de seguretat automàtiques en les següents situacions:",
	autoDaily: "Cada dia a les 2:00 AM (còpia diària completa)",
	autoNewAnimals: "Quan es creen noves fitxes d'animals",
	autoEditedAnimals: "Quan s'editen dades importants en fitxes existents",
	autoAfterImport: "Després de cada importació de dades",
	retentionPolicy: "Política de retenció",
	retentionDesc: "Es mantenen les últimes 14 còpies de seguretat:",
	retentionDaily: "7 còpies diàries més recents",
	retentionWeekly: "7 còpies setmanals històriques",
	storage: "Emmagatzematge",
	storageDesc: "Totes les còpies s'emmagatzemen de forma segura en el núvol amb xifrat, assegurant la recuperació en cas de qualsevol incidència.",
	manualBackups: "Còpies manuals",
	manualDesc: "Com a administrador, pots crear còpies de seguretat manuals addicionals en qualsevol moment des d'aquesta secció, especialment abans de realitzar canvis importants en el sistema.",
	createBackup: "Crear còpia de seguretat",
	createDesc: "Crea una còpia de seguretat completa de la base de dades, incloent tots els animals, parts i configuracions del sistema.",
	includeAnimals: "Incloure dades d'animals",
	includeBirths: "Incloure dades de parts",
	includeConfig: "Incloure configuració d'usuaris",
	createButton: "Crear còpia de seguretat ara",
	restoreBackup: "Restaurar còpia de seguretat",
	restoreDesc: "Restaura el sistema a partir d'una còpia de seguretat prèviament creada.",
	warning: "Precaució! Aquesta acció reemplaçarà totes les dades actuals.",
	selectFile: "Selecciona un arxiu de còpia",
	or: "o",
	selectButton: "Seleccionar arxiu",
	restoreButton: "Restaurar sistema",
	historyTitle: "Historial de còpies de seguretat",
	date: "Data",
	size: "Mida",
	createdBy: "Creat per",
	type: "Tipus",
	description: "Descripció",
	actions: "Accions",
	download: "Descarregar",
	restore: "Restaurar",
	"delete": "Eliminar",
	loading: "Carregant...",
	confirm_delete: "Està segur que vol eliminar aquesta còpia de seguretat?",
	confirm_restore: "Està segur que vol restaurar el sistema amb aquesta còpia de seguretat? Aquesta acció substituirà totes les dades actuals.",
	no_backups: "No hi ha còpies de seguretat disponibles",
	backup_created: "Còpia de seguretat creada amb èxit",
	backup_error: "Error al crear la còpia de seguretat",
	restore_success: "Sistema restaurat correctament",
	restore_error: "Error al restaurar el sistema",
	error: "Error",
	restoreInProgress: "Restaurant sistema...",
	deleteSuccess: "Còpia de seguretat eliminada correctament",
	deleteInProgress: "Eliminant...",
	backupInProgress: "Creant còpia de seguretat...",
	autoBackup: "Còpia automàtica",
	systemBackup: "Còpia del sistema",
	manualBackup: "Còpia manual"
};
const ui = {
	edit_profile: "Editar Perfil",
	change_password: "Canviar Contrasenya",
	logout: "Tancar Sessió",
	operation_success: "Operació completada amb èxit",
	operation_error: "S'ha produït un error",
	processing: "Processant sol·licitud...",
	required_field: "Camp obligatori",
	invalid_format: "Format incorrecte",
	min_length: "Ha de tenir almenys {0} caràcters",
	confirm_continue: "Està segur que vol continuar?",
	action_irreversible: "Aquesta acció no es pot desfer",
	cancel: "Cancel·lar",
	confirm: "Confirmar"
};
const footer = {
	rights_reserved: "Tots els drets reservats",
	version: "Versió",
	about: "Sobre nosaltres",
	help: "Ajuda",
	privacy: "Privacitat",
	terms: "Termes"
};
const imports = {
	title: "Importacions",
	"new": "Nova importació",
	history: "Historial d'importacions",
	file: "Arxiu",
	status: "Estat",
	date: "Data",
	records: "Registres",
	success: "Èxit",
	failed: "Fallida",
	pending: "Pendent",
	processing: "Processant",
	completed: "Completada",
	upload: "Pujar arxiu",
	drag_drop: "Arrossega i deixa anar l'arxiu aquí",
	select_file: "Seleccionar arxiu",
	uploaded: "Arxiu pujat correctament",
	processing_file: "Processant arxiu...",
	import_success: "Importació completada correctament",
	import_error: "Error al processar la importació"
};
const users = {
	table: {
		loading: "Carregant usuaris...",
		error: "Error en carregar la llista d'usuaris. Si us plau, torneu-ho a intentar.",
		showing: "Mostrant",
		of: "de",
		users: "usuaris",
		show: "Mostrar:",
		user: "Usuari",
		email: "Correu electrònic",
		role: "Rol",
		status: "Estat",
		actions: "Accions",
		no_users: "No hi ha usuaris per mostrar",
		active: "Actiu",
		inactive: "Inactiu",
		edit: "Editar",
		"delete": "Eliminar",
		confirm_delete_title: "Confirmar eliminació",
		confirm_delete_message: "Esteu segur que voleu eliminar l'usuari {username}?",
		confirm: "Eliminar",
		cancel: "Cancel·lar",
		delete_error: "Error en eliminar l'usuari. Si us plau, torneu-ho a intentar."
	},
	form: {
		title_new: "Nou usuari",
		title_edit: "Editar usuari",
		username: "Nom d'usuari",
		username_placeholder: "Introduïu el nom d'usuari",
		email: "Correu electrònic",
		email_placeholder: "Introduïu el correu electrònic",
		password: "Contrasenya",
		password_placeholder: "Introduïu la contrasenya",
		confirm_password: "Confirmar contrasenya",
		confirm_password_placeholder: "Confirmeu la contrasenya",
		full_name: "Nom complet",
		full_name_placeholder: "Introduïu el nom complet",
		role: "Rol",
		select_role: "Seleccioneu un rol",
		administrator: "Administrador",
		manager: "Gerent",
		editor: "Editor",
		user: "Usuari",
		active: "Actiu",
		save: "Guardar",
		cancel: "Cancel·lar",
		validation: {
			username_required: "El nom d'usuari és obligatori",
			email_required: "El correu electrònic és obligatori",
			email_invalid: "El correu electrònic no és vàlid",
			password_required: "La contrasenya és obligatòria",
			password_min_length: "La contrasenya ha de tenir almenys 6 caràcters",
			passwords_not_match: "Les contrasenyes no coincideixen",
			role_required: "El rol és obligatori"
		},
		success_create: "Usuari creat correctament",
		success_update: "Usuari actualitzat correctament",
		error_create: "Error en crear l'usuari",
		error_update: "Error en actualitzar l'usuari"
	}
};
const errors = {
	generic: "Ha ocorregut un error",
	not_found: "No trobat",
	unauthorized: "No autoritzat",
	forbidden: "Accés denegat",
	server_error: "Error del servidor",
	validation_error: "Error de validació",
	required_field: "Aquest camp és obligatori",
	invalid_format: "Format invàlid",
	try_again: "Intentar de nou",
	go_home: "Anar a l'inici"
};
const settings = {
	title: "Configuració",
	description: "Personalitza la teva experiència a Masclet Imperi",
	user_preferences: "Preferències d'usuari",
	language: "Idioma",
	languages: {
		spanish: "Espanyol",
		catalan: "Català"
	},
	theme: "Tema visual",
	themes: {
		light: "Clar",
		dark: "Fosc",
		system: "Utilitzar preferència del sistema"
	},
	notifications: "Notificacions",
	notify_backups: "Avisos de còpies de seguretat",
	notify_backups_desc: "Rebre notificació quan es facin còpies de seguretat automàtiques",
	notify_imports: "Avisos d'importacions",
	notify_imports_desc: "Rebre notificació quan es completin importacions",
	notify_animals: "Avisos sobre animals",
	notify_animals_desc: "Rebre notificació sobre canvis importants en els animals",
	save_success: "Configuració desada correctament"
};
const notification = {
	title: "Notificacions",
	system_alerts: "Alertes del sistema",
	mark_all_read: "Marcar tot com llegit",
	view_all: "Veure totes les alertes",
	view_all_description: "Gestiona totes les teves notificacions del sistema",
	no_notifications: "No hi ha notificacions",
	test_create: "Crear notificacions de prova",
	filter_by: "Filtrar per",
	all_types: "Tots els tipus",
	clear_all: "Eliminar totes",
	loading: "Carregant notificacions...",
	total_count: "notificacions en total",
	load_more: "Carregar més",
	types: {
		system: "Sistema",
		backup: "Còpia de seguretat",
		animal: "Animal",
		"import": "Importació"
	},
	priorities: {
		low: "Baixa",
		medium: "Mitjana",
		high: "Alta"
	}
};
const ca$1 = {
	common: common,
	auth: auth,
	animals: animals,
	partos: partos,
	explotations: explotations,
	dashboard: dashboard,
	dashboard_compare: dashboard_compare,
	dashboard_direct: dashboard_direct,
	menu: menu,
	listings: listings,
	backup: backup,
	ui: ui,
	footer: footer,
	imports: imports,
	users: users,
	errors: errors,
	settings: settings,
	notification: notification
};

const caTranslations = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  animals,
  auth,
  backup,
  common,
  dashboard,
  dashboard_compare,
  dashboard_direct,
  default: ca$1,
  errors,
  explotations,
  footer,
  imports,
  listings,
  menu,
  notification,
  partos,
  settings,
  ui,
  users
}, Symbol.toStringTag, { value: 'Module' }));

const defaultLang = "es";
const supportedLanguages = ["es", "ca"];
const es = esTranslations;
const ca = caTranslations;
console.log(
  "[i18n] Traducciones cargadas:",
  "ES:",
  Object.keys(es).length,
  "secciones",
  "CA:",
  Object.keys(ca).length,
  "secciones"
);
function t(key, lang = defaultLang) {
  try {
    const parts = key.split(".");
    if (parts.length < 2) return key;
    const dict = lang === "ca" ? ca : es;
    let current = dict;
    for (const part of parts) {
      if (current && current[part]) {
        current = current[part];
      } else {
        console.warn(`Traducción no encontrada para la clave: ${key} (parte: ${part})`);
        return key;
      }
    }
    if (typeof current === "string") {
      return current;
    }
    console.warn(`Valor no válido para la clave: ${key}`);
    return key;
  } catch (e) {
    console.error(`Error en traducción para la clave: ${key}`, e);
    return key;
  }
}
function getCurrentLanguage() {
  if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlLang = urlParams.get("lang");
      if (urlLang && supportedLanguages.includes(urlLang)) {
        console.log("[i18n] Usando idioma desde URL:", urlLang);
        localStorage.setItem("userLanguage", urlLang);
        return urlLang;
      }
    } catch (e) {
      console.error("[i18n] Error al leer parámetros URL:", e);
    }
    const savedLang = localStorage.getItem("userLanguage");
    if (savedLang && supportedLanguages.includes(savedLang)) {
      console.log("[i18n] Usando idioma desde localStorage:", savedLang);
      return savedLang;
    }
    try {
      const browserLang = navigator.language.split("-")[0];
      if (supportedLanguages.includes(browserLang)) {
        console.log("[i18n] Usando idioma del navegador:", browserLang);
        localStorage.setItem("userLanguage", browserLang);
        return browserLang;
      }
    } catch (e) {
      console.error("[i18n] Error al detectar idioma del navegador:", e);
    }
  }
  console.log("[i18n] Usando idioma por defecto:", defaultLang);
  return defaultLang;
}

const $$LanguageSwitcher = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<div class="language-switcher" data-astro-cid-a2mxz4y6> <select id="language-selector" class="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-white rounded py-1 px-2 text-sm" data-astro-cid-a2mxz4y6> <option value="es"${addAttribute(getCurrentLanguage() === "es", "selected")} data-astro-cid-a2mxz4y6>Español</option> <option value="ca"${addAttribute(getCurrentLanguage() === "ca", "selected")} data-astro-cid-a2mxz4y6>Català</option> </select> <div id="current-lang-indicator" class="hidden text-xs mt-1 text-white p-1 rounded bg-green-600" data-astro-cid-a2mxz4y6>
Idioma: ${getCurrentLanguage()} </div> </div>  `;
}, "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/LanguageSwitcher.astro", void 0);

const $$Astro$2 = createAstro();
const $$Navbar = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$Navbar;
  const {
    userRole = "administrador",
    currentPath = "/",
    title = "Masclet Imperi"
  } = Astro2.props;
  const serverLang = getCurrentLanguage();
  const translations = {
    es: {
      dashboard: "Dashboard Masclet Imperi",
      listings: "Listados Personalizados",
      listings_detail: "Detalles del Listado",
      listings_edit: "Editar Listado",
      listings_new: "Nuevo Listado"
    },
    ca: {
      dashboard: "Tauler de control Masclet Imperi",
      listings: "Llistats Personalitzats",
      listings_detail: "Detalls del Llistat",
      listings_edit: "Editar Llistat",
      listings_new: "Nou Llistat"
    }
  };
  const menuItems = [
    { name: "Dashboard", url: "/", icon: "\u{1F4CA}", roles: ["administrador", "gerente", "editor", "usuario"] },
    { name: "Explotaciones", url: "/explotaciones-react", icon: "\u{1F3E1}", roles: ["administrador", "gerente", "editor", "usuario"] },
    { name: "Animales", url: "/animals", icon: "\u{1F404}", roles: ["administrador", "gerente", "editor", "usuario"] },
    { name: "Usuarios", url: "/users", icon: "\u{1F465}", roles: ["administrador", "gerente"] },
    { name: "Importaci\xF3n", url: "/imports", icon: "\u{1F4E5}", roles: ["administrador"] },
    { name: "Backup", url: "/backup", icon: "\u{1F4BE}", roles: ["administrador"] }
  ];
  const filteredMenu = menuItems;
  const isActive = (itemUrl) => {
    if (itemUrl === "/" && currentPath === "/") return true;
    if (itemUrl !== "/" && currentPath.startsWith(itemUrl)) return true;
    return false;
  };
  return renderTemplate`${maybeRenderHead()}<header class="bg-primary text-white shadow-md relative z-30"> <div class="container mx-auto px-3 py-3 flex justify-between items-center"> <!-- Título de la página actual --> <div class="font-bold text-xl" id="page-title"${addAttribute(currentPath, "data-current-path")}> ${(() => {
    if (currentPath === "/animals/[id]") {
      return t("animal_file");
    } else if (currentPath === "/" || currentPath === "/dashboard") {
      return serverLang === "ca" ? translations.ca.dashboard : translations.es.dashboard;
    } else if (currentPath === "/listados") {
      return serverLang === "ca" ? translations.ca.listings : translations.es.listings;
    } else if (currentPath === "/listados/[id]") {
      return serverLang === "ca" ? translations.ca.listings_detail : translations.es.listings_detail;
    } else if (currentPath === "/listados/edit/[id]") {
      return serverLang === "ca" ? translations.ca.listings_edit : translations.es.listings_edit;
    } else if (currentPath === "/listados/new") {
      return serverLang === "ca" ? translations.ca.listings_new : translations.es.listings_new;
    } else {
      return title || "Masclet Imperi";
    }
  })()} </div> <!-- Menú de navegación (visible solo en escritorio) --> <nav class="hidden md:flex space-x-2 lg:space-x-4"> ${filteredMenu.map((item) => renderTemplate`<a${addAttribute(item.url, "href")}${addAttribute([
    "flex items-center transition-colors duration-150 px-2 py-2 rounded-md text-sm font-medium",
    {
      "bg-primary-dark text-white": isActive(item.url),
      "hover:bg-primary/20": !isActive(item.url)
    }
  ], "class:list")}> <span class="text-xl mr-1">${item.icon}</span> ${item.name} </a>`)} </nav> <!-- Controles de la derecha --> <div class="flex items-center"> <!-- Botón de menú móvil --> <button id="mobile-menu-button" class="text-white text-2xl p-2 mr-2 md:hidden">
☰
</button> <!-- Controles siempre visibles (incluso en móvil) --> <div class="flex items-center space-x-2 sm:space-x-4"> <!-- Selector de idiomas --> ${renderComponent($$result, "LanguageSwitcher", $$LanguageSwitcher, {})} <!-- Toggle de tema - Visible en todos los tamaños --> <button id="theme-toggle" class="text-white hover:text-gray-200 transition-colors p-2 rounded-full hover:bg-primary/20"> <span id="theme-toggle-light-icon" class="hidden">🌞</span> <span id="theme-toggle-dark-icon">🌙</span> </button> <!-- Notificaciones - Visible en todos los tamaños --> <button id="notifications-button" class="relative text-white hover:text-gray-200 transition-colors p-2 rounded-full hover:bg-primary/20"${addAttribute(t("notification.system_alerts"), "title")}> <span class="text-xl">🔔</span> <span class="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center hidden">0</span> </button> <!-- Menú de notificaciones (oculto por defecto) --> <div id="notifications-menu" class="absolute right-24 mt-12 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg overflow-hidden z-50 hidden"> <div class="p-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center"> <span class="font-bold text-gray-800 dark:text-white">${t("notification.system_alerts")}</span> <button id="mark-all-read" class="text-xs text-primary dark:text-primary-light hover:underline"> ${t("notification.mark_all_read")} </button> </div> <div class="max-h-80 overflow-y-auto"> <!-- Las notificaciones se cargarán dinámicamente desde el backend --> </div> <div class="p-2 border-t border-gray-100 dark:border-gray-700 text-center"> <a href="/notifications" class="text-sm text-primary dark:text-primary-light hover:underline"> ${t("notification.view_all")} </a> </div> </div> <!-- Indicador de rol - Visible en tablets y escritorio --> <span class="hidden sm:inline-block text-sm capitalize bg-primary-dark/30 px-3 py-1 rounded-full" id="user-role-display"> ${userRole} </span> <!-- Script para actualizar el rol desde localStorage (Versión optimizada) -->  <!-- Perfil de usuario - Visible en todos los tamaños --> <div class="relative group"> <button id="profile-button" class="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors p-2 rounded-full hover:bg-primary/20"> <div class="w-8 h-8 bg-gray-200 rounded-full overflow-hidden flex items-center justify-center text-primary"> <span>A</span> </div> </button> <!-- Menú desplegable de perfil (escritorio) --> <div id="profile-dropdown" class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg overflow-hidden z-50 hidden md:block opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300"> <div class="py-2"> <a href="/profile" class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
Mi Perfil
</a> <a href="/settings" class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
Configuración
</a> <div class="border-t border-gray-100 dark:border-gray-700 my-1"></div> <a href="/logout" class="block px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700">
Cerrar Sesión
</a> </div> </div> </div> </div> </div> </div> </header> <!-- Menú móvil (oculto por defecto) --> <div id="mobile-menu" class="fixed inset-0 bg-black bg-opacity-50 z-40 hidden"> <div class="bg-white dark:bg-gray-800 w-3/4 max-w-xs h-full overflow-y-auto shadow-xl transform transition-transform duration-300 translate-x-0"> <!-- Cabecera del menú móvil --> <div class="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center"> <span class="font-bold text-lg text-gray-800 dark:text-white">Menú</span> <button id="close-mobile-menu" class="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white">
✕
</button> </div> <!-- Información de usuario en móvil --> <div class="p-4 border-b border-gray-100 dark:border-gray-700"> <div class="flex items-center space-x-3"> <div class="w-10 h-10 bg-gray-200 rounded-full overflow-hidden flex items-center justify-center text-primary text-lg"> <span>A</span> </div> <div> <p class="font-medium text-gray-800 dark:text-white">Admin Usuario</p> <p class="text-sm text-gray-500 dark:text-gray-400 capitalize">${userRole}</p> </div> </div> <div class="mt-3 flex space-x-2"> <a href="/profile" class="flex-1 text-center text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">
Mi Perfil
</a> <a href="/settings" class="flex-1 text-center text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">
Configuración
</a> </div> </div> <!-- Navegación en móvil --> <nav class="p-4"> ${filteredMenu.map((item) => renderTemplate`<a${addAttribute(item.url, "href")}${addAttribute([
    "flex items-center py-3 px-4 text-gray-700 dark:text-gray-200 rounded-md mb-1",
    {
      "bg-primary/10 text-primary dark:bg-primary-dark/20 dark:text-primary-light": isActive(item.url),
      "hover:bg-gray-100 dark:hover:bg-gray-700": !isActive(item.url)
    }
  ], "class:list")}> <span class="text-xl mr-3">${item.icon}</span> ${item.name} </a>`)} </nav> <!-- Opciones adicionales en móvil --> <div class="p-4 border-t border-gray-100 dark:border-gray-700"> <!-- Selector de idioma en móvil --> <div class="flex justify-between items-center mb-4"> <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Idioma</span> <select id="mobile-language-selector" class="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-white rounded py-1 px-2 text-sm"> <option value="es">Español</option> <option value="ca">Català</option> </select> </div> <!-- Modo oscuro --> <div class="flex justify-between items-center mb-4"> <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Modo oscuro</span> <button id="mobile-theme-toggle" class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"> <span id="mobile-theme-toggle-light-icon" class="hidden">🌞</span> <span id="mobile-theme-toggle-dark-icon">🌙</span> </button> </div> <a href="/logout" class="block w-full text-center py-2 px-4 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md hover:bg-red-200 dark:hover:bg-red-800/30 text-sm">
Cerrar Sesión
</a> </div> </div> </div> `;
}, "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/layout/Navbar.astro", void 0);

/**
 * Servicio de autenticación simplificado para Masclet Imperi
 */


// Rol por defecto para desarrollo
const DEFAULT_ROLE = 'admin';

// Comprobar si estamos en el navegador
const isBrowser = typeof window !== 'undefined';

/**
 * Servicio de autenticación
 */
const authService = {
  /**
   * Comprobar si el usuario está autenticado
   * @returns {boolean} Estado de autenticación
   */
  isAuthenticated() {
    return !!this.getToken();
  },

  /**
   * Obtener token de autenticación
   * @returns {string|null} Token JWT o null si no está autenticado
   */
  getToken() {
    // Solo acceder a localStorage en el navegador
    if (isBrowser) {
      try {
        return localStorage.getItem('token');
      } catch (e) {
        console.warn('Error accediendo a localStorage:', e);
      }
    }
    // Valor predeterminado para desarrollo, tanto en servidor como en cliente
    return 'token-desarrollo-12345';
  },

  /**
   * Iniciar sesión
   * @param {Object} credentials Credenciales del usuario
   * @returns {Promise<Object>} Datos del usuario autenticado
   */
  async login(credentials) {
    // Simulación de login para desarrollo
    if (credentials.username === 'admin' && credentials.password === 'admin123') {
      const user = {
        id: 1,
        username: 'admin',
        role: 'administrador',
        fullName: 'Administrador'
      };
      const token = 'token-simulado-admin-12345';
      
      this.saveToken(token);
      this.saveUser(user);
      
      return { user, token };
    }
    
    // En producción, usar llamada real a la API
    // const response = await fetch(`${AUTH_URL}/login`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(credentials)
    // });
    // const data = await response.json();
    // 
    // if (!response.ok) {
    //   throw new Error(data.detail || 'Error de autenticación');
    // }
    // 
    // this.saveToken(data.token);
    // this.saveUser(data.user);
    // 
    // return data;
    
    throw new Error('Credenciales inválidas');
  },
  
  /**
   * Cerrar sesión
   */
  logout() {
    this.removeToken();
    this.removeUser();
  },
  
  /**
   * Registrar un nuevo usuario
   * @param {Object} userData Datos del nuevo usuario
   * @returns {Promise<Object>} Datos del usuario creado
   */
  async register(userData) {
    // En producción, usar llamada real a la API
    // const response = await fetch(`${AUTH_URL}/register`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(userData)
    // });
    // return await response.json();
    
    // Simulación para desarrollo
    return {
      id: Date.now(),
      ...userData,
      created_at: new Date().toISOString()
    };
  },
  
  /**
   * Actualizar datos de un usuario
   * @param {number} userId ID del usuario
   * @param {Object} userData Nuevos datos
   * @returns {Promise<Object>} Datos actualizados
   */
  async updateUser(userId, userData) {
    // En producción, usar llamada real a la API
    // const response = await fetch(`${AUTH_URL}/users/${userId}`, {
    //   method: 'PUT',
    //   headers: { 
    //     'Content-Type': 'application/json',
    //     ...this.getAuthHeaders()
    //   },
    //   body: JSON.stringify(userData)
    // });
    // return await response.json();
    
    // Simulación para desarrollo
    return {
      id: userId,
      ...userData,
      updated_at: new Date().toISOString()
    };
  },
  
  /**
   * Obtener usuario almacenado en localStorage
   * @returns {Object|null} Datos del usuario o null
   */
  getStoredUser() {
    if (isBrowser) {
      try {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
      } catch (e) {
        console.warn('Error obteniendo usuario de localStorage:', e);
        return null;
      }
    }
    return null;
  },
  
  /**
   * Guardar datos de usuario en localStorage
   * @param {Object} user Datos del usuario
   */
  saveUser(user) {
    if (isBrowser && user) {
      try {
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('userRole', user.role || 'usuario');
      } catch (e) {
        console.warn('Error guardando usuario en localStorage:', e);
      }
    }
  },
  
  /**
   * Eliminar datos de usuario de localStorage
   */
  removeUser() {
    if (isBrowser) {
      try {
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
      } catch (e) {
        console.warn('Error eliminando usuario de localStorage:', e);
      }
    }
  },
  
  /**
   * Obtener usuario actual (desde localStorage o API)
   * @returns {Promise<Object|null>} Datos del usuario o null
   */
  async getCurrentUser() {
    const storedUser = this.getStoredUser();
    if (storedUser) {
      return storedUser;
    }
    
    // En una aplicación real, verificaríamos con la API
    // if (this.isAuthenticated()) {
    //   try {
    //     const response = await fetch(`${AUTH_URL}/me`, {
    //       headers: this.getAuthHeaders()
    //     });
    //     if (response.ok) {
    //       const userData = await response.json();
    //       this.saveUser(userData);
    //       return userData;
    //     }
    //   } catch (e) {
    //     console.error('Error obteniendo usuario actual:', e);
    //   }
    // }
    
    return null;
  },

  /**
   * Guardar token en localStorage
   * @param {string} token Token JWT
   */
  saveToken(token) {
    // Solo acceder a localStorage en el navegador
    if (isBrowser) {
      try {
        localStorage.setItem('token', token);
      } catch (e) {
        console.warn('Error guardando token:', e);
      }
    }
  },

  /**
   * Eliminar token (cerrar sesión)
   */
  removeToken() {
    // Solo acceder a localStorage en el navegador
    if (isBrowser) {
      try {
        localStorage.removeItem('token');
      } catch (e) {
        console.warn('Error eliminando de localStorage:', e);
      }
    }
  },

  /**
   * Verificar y restaurar sesión cuando sea necesario
   * @returns {Promise<boolean>} Estado de autenticación
   */
  async ensureAuthenticated() {
    // En desarrollo, simular siempre autenticación exitosa
    if (!this.getToken()) {
      this.saveToken('token-desarrollo-12345');
      console.info('Token de desarrollo generado automáticamente');
    }
    return true;
  },

  /**
   * Obtener encabezados de autenticación para peticiones API
   * @returns {Object} Headers con token de autenticación
   */
  getAuthHeaders() {
    const token = this.getToken() || 'token-desarrollo-12345';
    return { 'Authorization': `Bearer ${token}` };
  },
  
  /**
   * Obtener el rol del usuario actual
   * @returns {string} Rol del usuario (admin, user, etc.)
   */
  getCurrentUserRole() {
    // Solo acceder a localStorage en el navegador
    if (isBrowser) {
      try {
        // En un entorno real, esto podría decodificar el JWT para obtener el rol
        // o hacer una solicitud al servidor para obtener el perfil del usuario
        return localStorage.getItem('userRole') || DEFAULT_ROLE;
      } catch (e) {
        console.warn('Error al obtener rol de usuario:', e);
      }
    }
    // Siempre devolver un valor por defecto para el servidor
    return DEFAULT_ROLE;
  }
};

// Auto-generar token para desarrollo si se usa directamente
if (isBrowser) {
  setTimeout(() => {
    try {
      if (!localStorage.getItem('token')) {
        localStorage.setItem('token', 'token-desarrollo-12345');
        console.info('Token de desarrollo generado automáticamente');
      }
      
      if (!localStorage.getItem('userRole')) {
        localStorage.setItem('userRole', DEFAULT_ROLE);
        console.info('Rol de usuario por defecto establecido:', DEFAULT_ROLE);
      }
    } catch (e) {
      console.warn('Error inicializando valores por defecto:', e);
    }
  }, 100);
}

// Exportar funciones individuales para compatibilidad con imports existentes
const isAuthenticated = () => authService.isAuthenticated();
const getStoredUser = () => authService.getStoredUser();
const getCurrentUser = () => authService.getCurrentUser();
const getUserRole = () => authService.getCurrentUserRole();

const $$Astro$1 = createAstro();
const $$Sidebar = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$Sidebar;
  const {
    userRole = "administrador",
    currentPath = "/"
  } = Astro2.props;
  const serverLang = getCurrentLanguage();
  const sectionTitles = {
    es: {
      navigation: "NAVEGACI\xD3N",
      admin: "ADMINISTRACI\xD3N"
    },
    ca: {
      navigation: "NAVEGACI\xD3",
      admin: "ADMINISTRACI\xD3"
    }
  };
  const menuTranslations = {
    es: {
      dashboard: "Dashboard",
      animals: "Animales",
      listings: "Listados",
      exploitations: "Explotaciones",
      users: "Usuarios",
      imports: "Importaci\xF3n",
      backup: "Copias de seguridad",
      management_system: "Sistema de Gesti\xF3n Ganadera"
    },
    ca: {
      dashboard: "Tauler de control",
      animals: "Animals",
      listings: "Llistats",
      exploitations: "Explotacions",
      users: "Usuaris",
      imports: "Importaci\xF3",
      backup: "C\xF2pies de seguretat",
      management_system: "Sistema de Gesti\xF3 Ramadera"
    }
  };
  function t(key, section = "menu") {
    if (section === "section") {
      return sectionTitles[serverLang]?.[key] || key;
    }
    return menuTranslations[serverLang]?.[key] || key;
  }
  const menuSections = [
    {
      title: t("navigation", "section"),
      key: "navigation",
      items: [
        { name: t("dashboard"), key: "dashboard", url: "/", icon: "\u{1F4CA}", roles: ["administrador", "Ramon", "editor", "usuario"] },
        { name: t("exploitations"), key: "exploitations", url: "/explotaciones-react", icon: "\u{1F3E1}", roles: ["administrador", "Ramon", "editor", "usuario"] },
        { name: t("animals"), key: "animals", url: "/animals", icon: "\u{1F404}", roles: ["administrador", "Ramon", "editor", "usuario"] },
        { name: t("listings"), key: "listings", url: "/listados", icon: "\u{1F4CB}", roles: ["administrador", "Ramon", "editor", "usuario"] }
      ]
    },
    {
      title: t("admin", "section"),
      key: "admin",
      items: [
        { name: t("imports"), key: "imports", url: "/imports", icon: "\u{1F4E5}", roles: ["administrador"] },
        { name: t("users"), key: "users", url: "/users", icon: "\u{1F465}", roles: ["administrador", "Ramon"] },
        { name: t("backup"), key: "backup", url: "/backup", icon: "\u{1F4BE}", roles: ["administrador"] }
      ]
    }
  ];
  let currentUserRole = "usuario";
  if (typeof window !== "undefined") {
    document.addEventListener("DOMContentLoaded", () => {
      currentUserRole = getUserRole();
      console.log("Rol actual:", currentUserRole);
    });
  }
  const filteredSections = menuSections;
  const isActive = (itemUrl) => {
    if (itemUrl === "/" && currentPath === "/") return true;
    if (itemUrl !== "/" && currentPath.startsWith(itemUrl)) return true;
    return false;
  };
  return renderTemplate`${maybeRenderHead()}<aside class="masclet-sidebar w-64 bg-white dark:bg-gray-800 min-h-screen shadow-md border-r border-gray-100 dark:border-gray-800 z-40 fixed top-0 left-0 h-screen overflow-y-auto" data-astro-cid-k4cmclh2> <!-- Cabecera del sidebar con logo --> <div class="py-4 px-0 border-b border-gray-100 dark:border-gray-700 flex items-center justify-center" style="min-height: 150px;" data-astro-cid-k4cmclh2> <div class="w-full h-full flex items-center justify-center" data-astro-cid-k4cmclh2> <img src="/images/logo_masclet.png" alt="Masclet Imperi Logo" class="max-w-full max-h-full" style="object-fit: contain;" data-astro-cid-k4cmclh2> </div> </div> <!-- Botón para cerrar el sidebar en móvil --> <button id="close-sidebar" class="md:hidden absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" data-astro-cid-k4cmclh2> <span class="text-2xl" data-astro-cid-k4cmclh2>✕</span> </button> <!-- Título del sistema --> <div class="px-6 pt-4 pb-2 text-center" data-astro-cid-k4cmclh2> <p class="font-bold text-sm text-gray-700 dark:text-gray-300 uppercase tracking-wider" data-astro-cid-k4cmclh2> ${serverLang === "ca" ? menuTranslations.ca.management_system : menuTranslations.es.management_system} </p> </div> <!-- Navegación --> <nav class="py-2 overflow-y-auto max-h-[calc(100vh-240px)]" data-astro-cid-k4cmclh2> ${filteredSections.map((section) => renderTemplate`<div class="mb-6" data-astro-cid-k4cmclh2> ${section.key === "navigation" ? renderTemplate`<h3 class="px-6 mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider" data-section-key="navigation" id="nav-title" data-astro-cid-k4cmclh2>
NAVEGACIÓN
</h3>` : renderTemplate`<h3 class="px-6 mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"${addAttribute(section.key, "data-section-key")} data-astro-cid-k4cmclh2> ${section.title} </h3>`} <div class="space-y-1" data-astro-cid-k4cmclh2> ${section.items.map((item) => renderTemplate`<a${addAttribute(item.url, "href")}${addAttribute([
    "flex items-center px-6 py-3 text-sm font-medium transition-colors duration-150",
    {
      "text-primary-dark bg-primary/10 dark:text-primary-light dark:bg-primary-dark/20 border-r-4 border-primary dark:border-primary-light": isActive(item.url),
      "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700": !isActive(item.url)
    }
  ], "class:list")} data-astro-cid-k4cmclh2> <span class="text-xl mr-3" style="width: 2rem; display: inline-block; text-align: center;" data-astro-cid-k4cmclh2>${item.icon}</span> <span${addAttribute(`menu.${item.key}`, "data-i18n-key")} data-astro-cid-k4cmclh2>${item.name}</span> </a>`)} </div> </div>`)} </nav> <!-- Eliminado banner de versión --> <!-- Script para actualizar las traducciones del menú cuando se cambia el idioma -->  </aside>  `;
}, "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/layout/Sidebar.astro", void 0);

const $$Astro = createAstro();
const $$Footer = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Footer;
  const {
    showVersion = true,
    version = "1.0.0"
  } = Astro2.props;
  const serverLang = getCurrentLanguage();
  const translations = {
    es: {
      rights_reserved: "Todos los derechos reservados",
      version: "Versi\xF3n",
      about: "Acerca de",
      help: "Ayuda",
      privacy: "Privacidad",
      terms: "T\xE9rminos"
    },
    ca: {
      rights_reserved: "Tots els drets reservats",
      version: "Versi\xF3",
      about: "Sobre nosaltres",
      help: "Ajuda",
      privacy: "Privacitat",
      terms: "Termes"
    }
  };
  function t(key) {
    return translations[serverLang]?.[key] || key;
  }
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  return renderTemplate`${maybeRenderHead()}<footer class="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 relative z-30" data-astro-cid-35ed7um5> <div class="container mx-auto px-4 py-4 md:py-5" data-astro-cid-35ed7um5> <div class="flex flex-col md:flex-row justify-between items-center" data-astro-cid-35ed7um5> <!-- Logo y copyright --> <div class="flex items-center mb-4 md:mb-0" data-astro-cid-35ed7um5> <img src="/images/logo_masclet.png" alt="Masclet Imperi" class="h-8 w-auto mr-3" data-astro-cid-35ed7um5> <div data-astro-cid-35ed7um5> <p class="text-sm text-gray-600 dark:text-gray-300" data-astro-cid-35ed7um5>
&copy; ${currentYear} Masclet Imperi - ${t("rights_reserved")} </p> ${showVersion && renderTemplate`<p class="text-xs text-gray-500 dark:text-gray-400 mt-1" data-astro-cid-35ed7um5> ${t("version")} ${version} </p>`} </div> </div> <!-- Enlaces útiles --> <div class="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-4 md:mb-0" data-astro-cid-35ed7um5> <a href="/about" class="text-sm text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light transition-colors" data-astro-cid-35ed7um5> ${t("about")} </a> <a href="/help" class="text-sm text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light transition-colors" data-astro-cid-35ed7um5> ${t("help")} </a> <a href="/privacy" class="text-sm text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light transition-colors" data-astro-cid-35ed7um5> ${t("privacy")} </a> <a href="/terms" class="text-sm text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light transition-colors" data-astro-cid-35ed7um5> ${t("terms")} </a> </div> <!-- Botones de accesibilidad --> <div class="flex items-center space-x-3" data-astro-cid-35ed7um5> <!-- Toggle de alto contraste --> <button id="footer-contrast-toggle" class="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" data-astro-cid-35ed7um5> <span class="text-sm" data-astro-cid-35ed7um5>👁️</span> </button> <!-- Botón de accesibilidad --> <button id="accessibility-toggle" class="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" data-astro-cid-35ed7um5> <span class="text-sm" data-astro-cid-35ed7um5>♿</span> </button> </div> </div> </div> </footer>  `;
}, "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/layout/Footer.astro", void 0);

export { $$Navbar as $, getCurrentLanguage as a, $$Sidebar as b, $$Footer as c, getStoredUser as d, getCurrentUser as e, getUserRole as g, isAuthenticated as i, t };
//# sourceMappingURL=Footer_CbdEWwuE.mjs.map
