// static/js/reporte.js - VERSIÓN CORREGIDA

let paginaActual = 1;
const registrosPorPagina = 10;

document.addEventListener('DOMContentLoaded', function() {
    inicializarEventos();
    cargarEstadisticas();
});

function inicializarEventos() {
    const btnAplicar = document.getElementById('btnAplicar');
    const btnLimpiar = document.getElementById('btnLimpiar');
    const modalExportar = document.getElementById('modalExportar');
    const closeModal = document.querySelector('.close');
    const btnExportarAhora = document.getElementById('btnExportarAhora');
    const btnProgramar = document.getElementById('btnProgramar');
    
    if (btnAplicar) btnAplicar.addEventListener('click', aplicarFiltros);
    if (btnLimpiar) btnLimpiar.addEventListener('click', limpiarFiltros);
    
    // Botón exportar (si existe en la página)
    const btnExportar = document.getElementById('btnExportar');
    if (btnExportar && modalExportar) {
        btnExportar.addEventListener('click', () => modalExportar.style.display = 'block');
    }
    
    if (closeModal && modalExportar) {
        closeModal.addEventListener('click', () => modalExportar.style.display = 'none');
        window.addEventListener('click', (event) => {
            if (event.target === modalExportar) modalExportar.style.display = 'none';
        });
    }
    
    if (btnExportarAhora) btnExportarAhora.addEventListener('click', exportarReporteActual);
    if (btnProgramar) btnProgramar.addEventListener('click', () => mostrarNotificacion('Funcionalidad en desarrollo', 'info'));
}

async function cargarEstadisticas() {
    try {
        const response = await fetch('/reportes/api/estadisticas/?dias=30');
        const data = await response.json();
        
        if (data.success) {
            const totalElement = document.getElementById('totalRegistros');
            const tasaElement = document.getElementById('tasaExito');
            
            if (totalElement) totalElement.textContent = data.total_registros || 0;
            if (tasaElement) tasaElement.textContent = `${data.tasa_exito}%`;
        }
    } catch (error) {
        console.error('Error cargando estadísticas:', error);
    }
}

function aplicarFiltros() {
    const fechaInicio = document.getElementById('filtro-fecha-inicio')?.value || '';
    const fechaFin = document.getElementById('filtro-fecha-fin')?.value || '';
    const tipo = document.getElementById('filtro-tipo')?.value || '';
    const estado = document.getElementById('filtro-estado')?.value || '';
    const dispositivo = document.getElementById('filtro-dispositivo')?.value || '';
    const usuario = document.getElementById('filtro-usuario')?.value || '';
    
    const params = new URLSearchParams();
    if (fechaInicio) params.append('fecha_inicio', fechaInicio);
    if (fechaFin) params.append('fecha_fin', fechaFin);
    if (tipo) params.append('tipo_acceso', tipo);
    if (estado) params.append('estado', estado);
    if (dispositivo) params.append('dispositivo_id', dispositivo);
    if (usuario) params.append('usuario', usuario);
    
    window.location.href = `/reportes/?${params.toString()}`;
}

function limpiarFiltros() {
    window.location.href = '/reportes/';
}

function exportarReporteActual() {
    const formato = document.querySelector('input[name="export-format"]:checked')?.value || 'csv';
    const params = new URLSearchParams(window.location.search);
    
    params.append('formato', formato);
    params.append('exportar', 'true');
    
    window.location.href = `${window.location.pathname}?${params.toString()}`;
    
    mostrarNotificacion(`Exportando reporte en formato ${formato.toUpperCase()}...`, 'success');
    cerrarModal();
}

function verDetalleReporte(reporteId) {
    window.location.href = `/reportes/detalle/${reporteId}/`;
}

function eliminarReporte(reporteId) {
    if (!confirm('¿Está seguro de eliminar este reporte?')) return;
    
    fetch(`/reportes/api/eliminar/${reporteId}/`, {
        method: 'DELETE',
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            mostrarNotificacion('Reporte eliminado correctamente', 'success');
            setTimeout(() => location.reload(), 1500);
        } else {
            mostrarNotificacion(`Error: ${data.message}`, 'error');
        }
    })
    .catch(error => mostrarNotificacion('Error al eliminar reporte', 'error'));
}

function generarNuevoReporte() {
    const titulo = document.getElementById('reporte-titulo')?.value;
    const tipo = document.getElementById('reporte-tipo')?.value;
    const fechaInicio = document.getElementById('reporte-fecha-inicio')?.value;
    const fechaFin = document.getElementById('reporte-fecha-fin')?.value;
    const dispositivoId = document.getElementById('reporte-dispositivo')?.value;
    
    if (!fechaInicio || !fechaFin) {
        mostrarNotificacion('Seleccione un rango de fechas', 'error');
        return;
    }
    
    fetch('/reportes/api/generar/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({
            titulo: titulo,
            tipo: tipo || 'PERSONALIZADO',
            fecha_inicio: fechaInicio,
            fecha_fin: fechaFin,
            dispositivo_id: dispositivoId
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            mostrarNotificacion('Reporte generado correctamente', 'success');
            setTimeout(() => window.location.href = '/reportes/guardados/', 1500);
        } else {
            mostrarNotificacion(`Error: ${data.message}`, 'error');
        }
    })
    .catch(error => mostrarNotificacion('Error al generar reporte', 'error'));
}

function cerrarModal() {
    const modal = document.getElementById('modalExportar');
    if (modal) modal.style.display = 'none';
}

function mostrarNotificacion(mensaje, tipo) {
    const notificacion = document.getElementById('notificacion');
    if (!notificacion) return;
    
    notificacion.textContent = mensaje;
    notificacion.className = `notificacion notificacion-${tipo}`;
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

function cambiarPagina(pagina) {
    paginaActual = pagina;
}

function actualizarPaginacion(totalRegistros) {
    const totalPaginas = Math.ceil(totalRegistros / registrosPorPagina);
    const paginacionDiv = document.getElementById('paginacion');
    if (!paginacionDiv) return;
    
    let html = '';
    for (let i = 1; i <= Math.min(totalPaginas, 10); i++) {
        html += `<button class="btn-pagina ${i === paginaActual ? 'activa' : ''}" onclick="cambiarPagina(${i})">${i}</button>`;
    }
    paginacionDiv.innerHTML = html;
}