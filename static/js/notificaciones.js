// static/js/notificaciones.js

// Datos de ejemplo para las notificaciones
const notificaciones = [
    {
        id: 1,
        titulo: "Dispositivo BIO-001 Caído",
        mensaje: "El dispositivo de huella dactilar en Recepción Principal ha dejado de responder. No se están registrando accesos desde las 08:45 AM.",
        tipo: "Alerta de Dispositivo",
        prioridad: "critica",
        estado: "no-leida",
        fecha: "Hace 15 minutos",
        origen: "Sistema de Monitoreo",
        usuario: "Sistema Automático",
        dispositivo: "BIO-001 - Recepción Principal"
    },
    {
        id: 2,
        titulo: "Intento de Acceso No Autorizado",
        mensaje: "Múltiples intentos fallidos de autenticación en el dispositivo BIO-045. Usuario: Carlos Mendoza. Se ha bloqueado temporalmente el acceso.",
        tipo: "Evento de Seguridad",
        prioridad: "alta",
        estado: "no-leida",
        fecha: "Hace 2 horas",
        origen: "Sistema de Seguridad",
        usuario: "Carlos Mendoza",
        dispositivo: "BIO-045 - RH Piso 3"
    },
    {
        id: 3,
        titulo: "Backup Completado Exitosamente",
        mensaje: "El backup automático de la base de datos se ha completado correctamente. Tamaño del archivo: 2.4 GB. Duración: 15 minutos.",
        tipo: "Mantenimiento del Sistema",
        prioridad: "media",
        estado: "leida",
        fecha: "Hoy, 02:30 AM",
        origen: "Sistema de Backup",
        usuario: "Sistema Automático",
        dispositivo: "Servidor Central"
    },
    {
        id: 4,
        titulo: "Nuevo Usuario Registrado",
        mensaje: "Se ha registrado un nuevo usuario en el sistema: Laura Martínez. Departamento: Ventas. Dispositivo asignado: BIO-201.",
        tipo: "Gestión de Usuarios",
        prioridad: "baja",
        estado: "no-leida",
        fecha: "Ayer, 04:15 PM",
        origen: "Sistema de Usuarios",
        usuario: "Administrador",
        dispositivo: "BIO-201 - Ventas Piso 2"
    },
    {
        id: 5,
        titulo: "Actualización de Software Disponible",
        mensaje: "Nueva versión 2.1.5 del sistema Biometrika disponible. Incluye mejoras en el rendimiento y corrección de errores menores.",
        tipo: "Actualización del Sistema",
        prioridad: "informativa",
        estado: "leida",
        fecha: "Ayer, 10:20 AM",
        origen: "Sistema de Actualizaciones",
        usuario: "Sistema Automático",
        dispositivo: "Todos los dispositivos"
    },
    {
        id: 6,
        titulo: "Problema de Conectividad en Sede Norte",
        mensaje: "Se detectó pérdida de conectividad con los dispositivos biométricos en la Sede Norte. Verificando estado de la red.",
        tipo: "Problema de Red",
        prioridad: "critica",
        estado: "no-leida",
        fecha: "15/03/2024, 09:30 AM",
        origen: "Sistema de Red",
        usuario: "Sistema Automático",
        dispositivo: "Sede Norte - Todos"
    }
];

// Variables globales
let notificacionesFiltradas = [...notificaciones];

// Funcionalidad para la página de notificaciones
document.addEventListener('DOMContentLoaded', function() {
    inicializarEventos();
    mostrarNotificacionesFiltradas();
    actualizarResumen();
});

function inicializarEventos() {
    // Botones de filtro
    const btnAplicar = document.getElementById('btnAplicar');
    const btnLimpiar = document.getElementById('btnLimpiar');
    const btnMarcarTodas = document.getElementById('btnMarcarTodas');
    
    if (btnAplicar) btnAplicar.addEventListener('click', aplicarFiltros);
    if (btnLimpiar) btnLimpiar.addEventListener('click', limpiarFiltros);
    if (btnMarcarTodas) btnMarcarTodas.addEventListener('click', marcarTodasComoLeidas);
    
    // Modal de detalles
    const closeModal = document.querySelector('.close');
    const btnCerrarDetalle = document.getElementById('btnCerrarDetalle');
    const btnAccionDetalle = document.getElementById('btnAccionDetalle');
    
    if (closeModal) closeModal.addEventListener('click', cerrarModal);
    if (btnCerrarDetalle) btnCerrarDetalle.addEventListener('click', cerrarModal);
    if (btnAccionDetalle) btnAccionDetalle.addEventListener('click', tomarAccion);
    
    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('modalDetalle');
        if (event.target === modal) {
            cerrarModal();
        }
    });
    
    // Eventos de las tarjetas de resumen
    document.querySelectorAll('.resumen-item').forEach(item => {
        item.addEventListener('click', function() {
            const clases = this.classList;
            if (clases.contains('no-leidas')) filtrarPorTipo('no-leidas');
            else if (clases.contains('criticas')) filtrarPorTipo('criticas');
            else if (clases.contains('hoy')) filtrarPorTipo('hoy');
            else if (clases.contains('total')) filtrarPorTipo('total');
        });
    });
}

function aplicarFiltros() {
    const tipo = document.getElementById('filtro-tipo')?.value || '';
    const prioridad = document.getElementById('filtro-prioridad')?.value || '';
    const estado = document.getElementById('filtro-estado')?.value || '';
    
    notificacionesFiltradas = notificaciones.filter(notif => {
        if (tipo && notif.tipo !== tipo) return false;
        if (prioridad && notif.prioridad !== prioridad) return false;
        if (estado && notif.estado !== estado) return false;
        return true;
    });
    
    mostrarNotificacionesFiltradas();
    mostrarNotificacionSistema('Filtros aplicados correctamente', 'success');
}

function limpiarFiltros() {
    const filtroTipo = document.getElementById('filtro-tipo');
    const filtroPrioridad = document.getElementById('filtro-prioridad');
    const filtroEstado = document.getElementById('filtro-estado');
    const filtroFecha = document.getElementById('filtro-fecha');
    
    if (filtroTipo) filtroTipo.value = '';
    if (filtroPrioridad) filtroPrioridad.value = '';
    if (filtroEstado) filtroEstado.value = '';
    if (filtroFecha) filtroFecha.value = '';
    
    notificacionesFiltradas = [...notificaciones];
    mostrarNotificacionesFiltradas();
    mostrarNotificacionSistema('Filtros limpiados', 'info');
}

function filtrarPorTipo(tipo) {
    switch(tipo) {
        case 'no-leidas':
            notificacionesFiltradas = notificaciones.filter(n => n.estado === 'no-leida');
            break;
        case 'criticas':
            notificacionesFiltradas = notificaciones.filter(n => n.prioridad === 'critica');
            break;
        case 'hoy':
            notificacionesFiltradas = notificaciones.filter(n => n.fecha.includes('Hoy') || n.fecha.includes('Hace'));
            break;
        case 'total':
            notificacionesFiltradas = [...notificaciones];
            break;
    }
    
    mostrarNotificacionesFiltradas();
    actualizarResumen();
    
    // Actualizar clases activas
    document.querySelectorAll('.resumen-item').forEach(item => {
        item.classList.remove('activa');
    });
    const selector = `.resumen-item.${tipo}`;
    const activo = document.querySelector(selector);
    if (activo) activo.classList.add('activa');
}

function mostrarNotificacionesFiltradas() {
    const container = document.querySelector('.notificaciones-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (notificacionesFiltradas.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 40px; color: #7f8c8d;">No hay notificaciones que coincidan con los filtros</div>';
        return;
    }
    
    notificacionesFiltradas.forEach(notif => {
        const notificacionElement = crearElementoNotificacion(notif);
        container.appendChild(notificacionElement);
    });
    
    inicializarBotonesNotificaciones();
    actualizarResumen();
}

function crearElementoNotificacion(notif) {
    const div = document.createElement('div');
    div.className = `notificacion-item ${notif.estado} ${notif.prioridad}`;
    div.setAttribute('data-id', notif.id);
    
    let icono = 'fa-bell';
    const tipoNotif = notif.tipo;
    if (tipoNotif.includes('Dispositivo')) icono = 'fa-microchip';
    else if (tipoNotif.includes('Seguridad')) icono = 'fa-shield-halved';
    else if (tipoNotif.includes('Mantenimiento')) icono = 'fa-database';
    else if (tipoNotif.includes('Usuario')) icono = 'fa-user-plus';
    else if (tipoNotif.includes('Actualización')) icono = 'fa-cloud-arrow-down';
    else if (tipoNotif.includes('Red')) icono = 'fa-network-wired';
    
    div.innerHTML = `
        <div class="notificacion-icono">
            <i class="fa-solid ${icono}"></i>
        </div>
        <div class="notificacion-contenido">
            <div class="notificacion-header">
                <h4>${notif.titulo}</h4>
                <span class="notificacion-fecha">${notif.fecha}</span>
            </div>
            <p class="notificacion-mensaje">${notif.mensaje}</p>
            <div class="notificacion-detalles">
                <span class="notificacion-tipo">${notif.tipo}</span>
                <span class="notificacion-prioridad ${notif.prioridad}">${notif.prioridad}</span>
            </div>
        </div>
        <div class="notificacion-acciones">
            <button class="btn-notificacion btn-marcar" title="Marcar como leída">
                <i class="fa-solid fa-check"></i>
            </button>
            <button class="btn-notificacion btn-archivar" title="Archivar">
                <i class="fa-solid fa-box-archive"></i>
            </button>
            <button class="btn-notificacion btn-detalle" title="Ver detalles">
                <i class="fa-solid fa-ellipsis-vertical"></i>
            </button>
        </div>
    `;
    
    return div;
}

function inicializarBotonesNotificaciones() {
    document.querySelectorAll('.btn-marcar').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const item = this.closest('.notificacion-item');
            marcarComoLeida(item);
        });
    });
    
    document.querySelectorAll('.btn-archivar').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const item = this.closest('.notificacion-item');
            archivarNotificacion(item);
        });
    });
    
    document.querySelectorAll('.btn-detalle').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const item = this.closest('.notificacion-item');
            mostrarDetalles(item);
        });
    });
    
    document.querySelectorAll('.notificacion-item').forEach(item => {
        item.addEventListener('click', function() {
            mostrarDetalles(this);
        });
    });
}

function marcarComoLeida(notificacionElement) {
    const id = parseInt(notificacionElement.getAttribute('data-id'));
    const notificacion = notificaciones.find(n => n.id === id);
    
    if (notificacion && notificacion.estado === 'no-leida') {
        notificacion.estado = 'leida';
        notificacionElement.classList.remove('no-leida');
        notificacionElement.classList.add('leida');
        mostrarNotificacionSistema('Notificación marcada como leída', 'success');
        actualizarResumen();
    }
}

function archivarNotificacion(notificacionElement) {
    notificacionElement.style.opacity = '0.5';
    notificacionElement.style.pointerEvents = 'none';
    
    setTimeout(() => {
        notificacionElement.remove();
        mostrarNotificacionSistema('Notificación archivada', 'info');
        actualizarResumen();
    }, 300);
}

function mostrarDetalles(notificacionElement) {
    const id = parseInt(notificacionElement.getAttribute('data-id'));
    const notificacion = notificaciones.find(n => n.id === id);
    
    if (notificacion) {
        const tituloElem = document.getElementById('detalle-titulo');
        const mensajeElem = document.getElementById('detalle-mensaje');
        const fechaElem = document.getElementById('detalle-fecha');
        const prioridadElem = document.getElementById('detalle-prioridad');
        const tipoElem = document.getElementById('detalle-tipo');
        const origenElem = document.getElementById('detalle-origen');
        const usuarioElem = document.getElementById('detalle-usuario');
        const dispositivoElem = document.getElementById('detalle-dispositivo');
        
        if (tituloElem) tituloElem.textContent = notificacion.titulo;
        if (mensajeElem) mensajeElem.textContent = notificacion.mensaje;
        if (fechaElem) fechaElem.textContent = notificacion.fecha;
        if (prioridadElem) {
            prioridadElem.textContent = notificacion.prioridad;
            prioridadElem.className = `detalle-prioridad ${notificacion.prioridad}`;
        }
        if (tipoElem) tipoElem.textContent = notificacion.tipo;
        if (origenElem) origenElem.textContent = notificacion.origen;
        if (usuarioElem) usuarioElem.textContent = notificacion.usuario;
        if (dispositivoElem) dispositivoElem.textContent = notificacion.dispositivo;
        
        const modal = document.getElementById('modalDetalle');
        if (modal) modal.style.display = 'block';
        
        if (notificacion.estado === 'no-leida') {
            marcarComoLeida(notificacionElement);
        }
    }
}

function cerrarModal() {
    const modal = document.getElementById('modalDetalle');
    if (modal) modal.style.display = 'none';
}

function tomarAccion() {
    mostrarNotificacionSistema('Acción ejecutada correctamente', 'success');
    cerrarModal();
}

function marcarTodasComoLeidas() {
    notificaciones.forEach(notif => {
        notif.estado = 'leida';
    });
    
    document.querySelectorAll('.notificacion-item').forEach(item => {
        item.classList.remove('no-leida');
        item.classList.add('leida');
    });
    
    mostrarNotificacionSistema('Todas las notificaciones marcadas como leídas', 'success');
    actualizarResumen();
}

function actualizarResumen() {
    const noLeidas = notificaciones.filter(n => n.estado === 'no-leida').length;
    const criticas = notificaciones.filter(n => n.prioridad === 'critica').length;
    const hoy = notificaciones.filter(n => n.fecha.includes('Hoy') || n.fecha.includes('Hace')).length;
    const total = notificaciones.length;
    
    const noLeidasElem = document.querySelector('.resumen-item.no-leidas .resumen-valor');
    const criticasElem = document.querySelector('.resumen-item.criticas .resumen-valor');
    const hoyElem = document.querySelector('.resumen-item.hoy .resumen-valor');
    const totalElem = document.querySelector('.resumen-item.total .resumen-valor');
    const paginacionInfo = document.querySelector('.paginacion-info');
    
    if (noLeidasElem) noLeidasElem.textContent = noLeidas;
    if (criticasElem) criticasElem.textContent = criticas;
    if (hoyElem) hoyElem.textContent = hoy;
    if (totalElem) totalElem.textContent = total;
    if (paginacionInfo) {
        paginacionInfo.textContent = `Mostrando ${notificacionesFiltradas.length} de ${notificaciones.length} notificaciones`;
    }
}

function mostrarNotificacionSistema(mensaje, tipo) {
    const notificacion = document.getElementById('notificacionSistema');
    if (!notificacion) return;
    
    notificacion.textContent = mensaje;
    notificacion.className = `notificacion-sistema ${tipo}`;
    notificacion.style.display = 'block';
    
    setTimeout(() => {
        notificacion.style.display = 'none';
    }, 3000);
}