// static/js/notificaciones.js
let notificaciones = [];
let notificacionesFiltradas = [];
let paginaActual = 1;
let itemsPorPagina = 10;
let intervaloActualizacion = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('Notificaciones JS cargado');
    inicializarEventos();
    cargarNotificaciones();
    iniciarActualizacionTiempoReal();
});

function iniciarActualizacionTiempoReal() {
    if (intervaloActualizacion) clearInterval(intervaloActualizacion);
    intervaloActualizacion = setInterval(cargarNotificaciones, 30000);
}

function inicializarEventos() {
    const btnAplicar = document.getElementById('btnAplicar');
    const btnLimpiar = document.getElementById('btnLimpiar');
    const btnMarcarTodas = document.getElementById('btnMarcarTodas');
    const btnConfiguracion = document.getElementById('btnConfiguracion');
    const btnGuardarConfig = document.getElementById('btnGuardarConfig');
    
    if (btnAplicar) btnAplicar.addEventListener('click', aplicarFiltros);
    if (btnLimpiar) btnLimpiar.addEventListener('click', limpiarFiltros);
    if (btnMarcarTodas) btnMarcarTodas.addEventListener('click', marcarTodasComoLeidas);
    if (btnConfiguracion) btnConfiguracion.addEventListener('click', abrirModalConfiguracion);
    if (btnGuardarConfig) btnGuardarConfig.addEventListener('click', guardarConfiguracion);
    
    // Configurar modales
    configurarModales();
    
    // Eventos de filtros
    const filtroTipo = document.getElementById('filtro-tipo');
    const filtroPrioridad = document.getElementById('filtro-prioridad');
    const filtroEstado = document.getElementById('filtro-estado');
    
    if (filtroTipo) filtroTipo.addEventListener('change', aplicarFiltros);
    if (filtroPrioridad) filtroPrioridad.addEventListener('change', aplicarFiltros);
    if (filtroEstado) filtroEstado.addEventListener('change', aplicarFiltros);
    
    // Eventos de las tarjetas de resumen
    document.querySelectorAll('.resumen-item').forEach(item => {
        item.addEventListener('click', function() {
            const filtro = this.getAttribute('data-filtro');
            if (filtro === 'no-leidas') {
                notificacionesFiltradas = notificaciones.filter(n => !n.leida);
            } else if (filtro === 'criticas') {
                notificacionesFiltradas = notificaciones.filter(n => n.prioridad === 'critica');
            } else if (filtro === 'hoy') {
                notificacionesFiltradas = notificaciones.filter(n => n.fecha.includes('Hoy') || n.fecha.includes('hace'));
            } else {
                notificacionesFiltradas = [...notificaciones];
            }
            paginaActual = 1;
            actualizarTabla();
            
            document.querySelectorAll('.resumen-item').forEach(i => i.classList.remove('activa'));
            item.classList.add('activa');
        });
    });
    
    // Configurar email condicional
    const cfgEmail = document.getElementById('cfg-email');
    if (cfgEmail) {
        cfgEmail.addEventListener('change', function() {
            const emailConfig = document.getElementById('email-config');
            if (emailConfig) emailConfig.style.display = this.checked ? 'block' : 'none';
        });
    }
}

function configurarModales() {
    // Modal Configuración
    const modalConfig = document.getElementById('modalConfig');
    const closeConfig = document.querySelectorAll('.close-config');
    const closeDetalle = document.querySelectorAll('.close-detalle');
    
    closeConfig.forEach(btn => {
        btn.addEventListener('click', function() {
            if (modalConfig) modalConfig.style.display = 'none';
        });
    });
    
    // Modal Detalle
    const modalDetalle = document.getElementById('modalDetalle');
    closeDetalle.forEach(btn => {
        btn.addEventListener('click', function() {
            if (modalDetalle) modalDetalle.style.display = 'none';
        });
    });
    
    // Cerrar al hacer clic fuera
    window.addEventListener('click', function(e) {
        if (modalConfig && e.target === modalConfig) modalConfig.style.display = 'none';
        if (modalDetalle && e.target === modalDetalle) modalDetalle.style.display = 'none';
    });
    
    // Botón marcar como leída en detalle
    const btnMarcarLeida = document.getElementById('btnMarcarLeida');
    if (btnMarcarLeida) {
        btnMarcarLeida.addEventListener('click', function() {
            const notiId = this.getAttribute('data-id');
            if (notiId) marcarComoLeida(notiId, true);
        });
    }
}

async function cargarNotificaciones() {
    try {
        const response = await fetch('/usuarios/api/notificaciones/');
        const data = await response.json();
        
        if (data.success) {
            notificaciones = data.notificaciones;
            notificacionesFiltradas = [...notificaciones];
            actualizarTabla();
            actualizarResumen();
        }
    } catch (error) {
        console.error('Error cargando notificaciones:', error);
    }
}

function actualizarTabla() {
    const container = document.getElementById('notificacionesContainer');
    if (!container) return;
    
    const inicio = (paginaActual - 1) * itemsPorPagina;
    const fin = inicio + itemsPorPagina;
    const paginadas = notificacionesFiltradas.slice(inicio, fin);
    
    if (paginadas.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 60px; color: #7f8c8d;">
                <i class="fa-solid fa-bell-slash" style="font-size: 48px; margin-bottom: 15px;"></i>
                <p>No hay notificaciones</p>
            </div>
        `;
        actualizarPaginacion();
        return;
    }
    
    container.innerHTML = '';
    paginadas.forEach(notif => {
        const notifElement = crearElementoNotificacion(notif);
        container.appendChild(notifElement);
    });
    
    actualizarPaginacion();
    inicializarBotonesNotificaciones();
}

function crearElementoNotificacion(notif) {
    const div = document.createElement('div');
    div.className = `notificacion-item ${notif.leida ? 'leida' : 'no-leida'} ${notif.prioridad}`;
    div.setAttribute('data-id', notif.id);
    
    const iconos = {
        'ALERTA': 'fa-triangle-exclamation',
        'DISPOSITIVO': 'fa-microchip',
        'PERSONAL': 'fa-user',
        'SEDE': 'fa-building',
        'REPORTE': 'fa-chart-bar',
        'BACKUP': 'fa-database',
        'CONFIGURACION': 'fa-gear',
        'SEGURIDAD': 'fa-shield-halved'
    };
    
    let tipoKey = notif.tipo;
    if (tipoKey === 'Alertas del Sistema') tipoKey = 'ALERTA';
    else if (tipoKey === 'Dispositivo') tipoKey = 'DISPOSITIVO';
    else if (tipoKey === 'Personal') tipoKey = 'PERSONAL';
    else if (tipoKey === 'Sede/Área') tipoKey = 'SEDE';
    else if (tipoKey === 'Reporte') tipoKey = 'REPORTE';
    else if (tipoKey === 'Backup') tipoKey = 'BACKUP';
    else if (tipoKey === 'Configuración') tipoKey = 'CONFIGURACION';
    else if (tipoKey === 'Seguridad') tipoKey = 'SEGURIDAD';
    
    const icono = iconos[tipoKey] || 'fa-bell';
    
    div.innerHTML = `
        <div class="notificacion-icono">
            <i class="fa-solid ${icono}"></i>
        </div>
        <div class="notificacion-contenido">
            <div class="notificacion-header">
                <h4>${escapeHtml(notif.titulo)}</h4>
                <span class="notificacion-fecha">${notif.fecha_relative}</span>
            </div>
            <p class="notificacion-mensaje">${escapeHtml(notif.mensaje)}</p>
            <div class="notificacion-detalles">
                <span class="notificacion-tipo">${notif.tipo}</span>
                <span class="notificacion-prioridad ${notif.prioridad}">${notif.prioridad}</span>
            </div>
        </div>
        <div class="notificacion-acciones">
            ${!notif.leida ? `<button class="btn-notificacion btn-marcar" title="Marcar como leída">
                <i class="fa-solid fa-check"></i>
            </button>` : ''}
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
            const id = item.getAttribute('data-id');
            marcarComoLeida(id, false);
        });
    });
    
    document.querySelectorAll('.btn-detalle').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const item = this.closest('.notificacion-item');
            const id = item.getAttribute('data-id');
            mostrarDetalle(id);
        });
    });
    
    document.querySelectorAll('.notificacion-item').forEach(item => {
        item.addEventListener('click', function(e) {
            if (!e.target.closest('.btn-notificacion')) {
                const id = this.getAttribute('data-id');
                mostrarDetalle(id);
            }
        });
    });
}

async function marcarComoLeida(id, recargar = false) {
    try {
        const response = await fetch(`/usuarios/api/marcar/${id}/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        
        if (data.success) {
            const notif = notificaciones.find(n => n.id == id);
            if (notif) notif.leida = true;
            
            if (recargar) {
                const modal = document.getElementById('modalDetalle');
                if (modal) modal.style.display = 'none';
                cargarNotificaciones();
            } else {
                actualizarTabla();
                actualizarResumen();
            }
            mostrarNotificacionSistema('Notificación marcada como leída', 'success');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function marcarTodasComoLeidas() {
    try {
        const response = await fetch('/usuarios/api/marcar-todas/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        
        if (data.success) {
            notificaciones.forEach(n => n.leida = true);
            notificacionesFiltradas.forEach(n => n.leida = true);
            actualizarTabla();
            actualizarResumen();
            mostrarNotificacionSistema('Todas las notificaciones marcadas como leídas', 'success');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function mostrarDetalle(id) {
    const notif = notificaciones.find(n => n.id == id);
    if (!notif) return;
    
    const modal = document.getElementById('modalDetalle');
    const body = document.getElementById('detalleBody');
    const btnMarcarLeida = document.getElementById('btnMarcarLeida');
    
    if (!modal || !body) return;
    
    const prioridadClass = notif.prioridad;
    
    body.innerHTML = `
        <div class="detalle-header">
            <h4>${escapeHtml(notif.titulo)}</h4>
            <div class="detalle-meta">
                <span class="detalle-fecha">${notif.fecha}</span>
                <span class="detalle-prioridad ${prioridadClass}">${notif.prioridad}</span>
            </div>
        </div>
        <div class="detalle-contenido">
            <p>${escapeHtml(notif.mensaje)}</p>
            <div class="detalle-adicional">
                <h5>Información Adicional</h5>
                <div class="info-grid">
                    <div class="info-item">
                        <label>Tipo:</label>
                        <span>${notif.tipo}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    if (btnMarcarLeida) {
        btnMarcarLeida.setAttribute('data-id', notif.id);
        btnMarcarLeida.style.display = notif.leida ? 'none' : 'block';
    }
    
    modal.style.display = 'block';
    
    if (!notif.leida) {
        marcarComoLeida(notif.id, false);
    }
}

function aplicarFiltros() {
    const tipo = document.getElementById('filtro-tipo')?.value || '';
    const prioridad = document.getElementById('filtro-prioridad')?.value || '';
    const estado = document.getElementById('filtro-estado')?.value || '';
    
    notificacionesFiltradas = notificaciones.filter(notif => {
        if (tipo && notif.tipo !== tipo) return false;
        if (prioridad && notif.prioridad !== prioridad) return false;
        if (estado === 'no-leida' && notif.leida) return false;
        if (estado === 'leida' && !notif.leida) return false;
        return true;
    });
    
    paginaActual = 1;
    actualizarTabla();
    mostrarNotificacionSistema('Filtros aplicados', 'info');
}

function limpiarFiltros() {
    const filtroTipo = document.getElementById('filtro-tipo');
    const filtroPrioridad = document.getElementById('filtro-prioridad');
    const filtroEstado = document.getElementById('filtro-estado');
    
    if (filtroTipo) filtroTipo.value = '';
    if (filtroPrioridad) filtroPrioridad.value = '';
    if (filtroEstado) filtroEstado.value = '';
    
    notificacionesFiltradas = [...notificaciones];
    paginaActual = 1;
    actualizarTabla();
    mostrarNotificacionSistema('Filtros limpiados', 'info');
}

function actualizarResumen() {
    const noLeidas = notificaciones.filter(n => !n.leida).length;
    const criticas = notificaciones.filter(n => n.prioridad === 'critica' && !n.leida).length;
    const hoy = notificaciones.filter(n => n.fecha.includes('Hoy') || n.fecha.includes('hace')).length;
    const total = notificaciones.length;
    
    const noLeidasElem = document.getElementById('total-no-leidas');
    const criticasElem = document.getElementById('total-criticas');
    const hoyElem = document.getElementById('total-hoy');
    const totalElem = document.getElementById('total-general');
    
    if (noLeidasElem) noLeidasElem.textContent = noLeidas;
    if (criticasElem) criticasElem.textContent = criticas;
    if (hoyElem) hoyElem.textContent = hoy;
    if (totalElem) totalElem.textContent = total;
}

function actualizarPaginacion() {
    const totalPaginas = Math.ceil(notificacionesFiltradas.length / itemsPorPagina);
    const infoElem = document.getElementById('paginacionInfo');
    const controlesElem = document.getElementById('paginacionControles');
    
    if (infoElem) {
        infoElem.textContent = `Mostrando ${notificacionesFiltradas.length} de ${notificaciones.length} notificaciones`;
    }
    
    if (!controlesElem) return;
    
    controlesElem.innerHTML = '';
    
    const btnAnterior = document.createElement('button');
    btnAnterior.className = 'btn-pagina';
    btnAnterior.innerHTML = '<i class="fa-solid fa-chevron-left"></i> Anterior';
    btnAnterior.disabled = paginaActual === 1;
    btnAnterior.onclick = () => { if (paginaActual > 1) { paginaActual--; actualizarTabla(); } };
    controlesElem.appendChild(btnAnterior);
    
    for (let i = 1; i <= Math.min(totalPaginas, 5); i++) {
        const btn = document.createElement('button');
        btn.className = `btn-pagina ${i === paginaActual ? 'activa' : ''}`;
        btn.textContent = i;
        btn.onclick = () => { paginaActual = i; actualizarTabla(); };
        controlesElem.appendChild(btn);
    }
    
    const btnSiguiente = document.createElement('button');
    btnSiguiente.className = 'btn-pagina';
    btnSiguiente.innerHTML = 'Siguiente <i class="fa-solid fa-chevron-right"></i>';
    btnSiguiente.disabled = paginaActual === totalPaginas || totalPaginas === 0;
    btnSiguiente.onclick = () => { if (paginaActual < totalPaginas) { paginaActual++; actualizarTabla(); } };
    controlesElem.appendChild(btnSiguiente);
}

async function abrirModalConfiguracion() {
    try {
        const response = await fetch('/usuarios/api/config-notificaciones/obtener/');
        const data = await response.json();
        
        if (data.success) {
            const cfgAlertas = document.getElementById('cfg-alertas');
            const cfgDispositivos = document.getElementById('cfg-dispositivos');
            const cfgPersonal = document.getElementById('cfg-personal');
            const cfgSedes = document.getElementById('cfg-sedes');
            const cfgReportes = document.getElementById('cfg-reportes');
            const cfgSeguridad = document.getElementById('cfg-seguridad');
            const cfgPrioridad = document.getElementById('cfg-prioridad');
            const cfgEmail = document.getElementById('cfg-email');
            const cfgEmailDestino = document.getElementById('cfg-email-destino');
            
            if (cfgAlertas) cfgAlertas.checked = data.notificar_alertas;
            if (cfgDispositivos) cfgDispositivos.checked = data.notificar_dispositivos;
            if (cfgPersonal) cfgPersonal.checked = data.notificar_personal;
            if (cfgSedes) cfgSedes.checked = data.notificar_sedes;
            if (cfgReportes) cfgReportes.checked = data.notificar_reportes;
            if (cfgSeguridad) cfgSeguridad.checked = data.notificar_seguridad;
            if (cfgPrioridad) cfgPrioridad.value = data.prioridad_minima;
            if (cfgEmail) cfgEmail.checked = data.email_notificaciones;
            if (cfgEmailDestino) cfgEmailDestino.value = data.email_destino || '';
            
            const emailConfig = document.getElementById('email-config');
            if (emailConfig) emailConfig.style.display = data.email_notificaciones ? 'block' : 'none';
        }
    } catch (error) {
        console.error('Error cargando configuración:', error);
    }
    
    const modal = document.getElementById('modalConfig');
    if (modal) modal.style.display = 'block';
}

async function guardarConfiguracion() {
    const config = {
        notificar_alertas: document.getElementById('cfg-alertas')?.checked || false,
        notificar_dispositivos: document.getElementById('cfg-dispositivos')?.checked || false,
        notificar_personal: document.getElementById('cfg-personal')?.checked || false,
        notificar_sedes: document.getElementById('cfg-sedes')?.checked || false,
        notificar_reportes: document.getElementById('cfg-reportes')?.checked || false,
        notificar_seguridad: document.getElementById('cfg-seguridad')?.checked || false,
        prioridad_minima: document.getElementById('cfg-prioridad')?.value || 'baja',
        email_notificaciones: document.getElementById('cfg-email')?.checked || false,
        email_destino: document.getElementById('cfg-email-destino')?.value || ''
    };
    
    try {
        const response = await fetch('/usuarios/api/config-notificaciones/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(config)
        });
        const data = await response.json();
        
        if (data.success) {
            mostrarNotificacionSistema('Configuración guardada', 'success');
            const modal = document.getElementById('modalConfig');
            if (modal) modal.style.display = 'none';
            cargarNotificaciones();
        } else {
            mostrarNotificacionSistema('Error: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarNotificacionSistema('Error al guardar configuración', 'error');
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

function getCookie(name) {
    let value = null;
    if (document.cookie && document.cookie !== '') {
        document.cookie.split(';').forEach(cookie => {
            const c = cookie.trim();
            if (c.substring(0, name.length + 1) === (name + '=')) {
                value = decodeURIComponent(c.substring(name.length + 1));
            }
        });
    }
    return value;
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}