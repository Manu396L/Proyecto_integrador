// static/js/reporte.js - VERSIÓN COMPLETA PARA EXPORTACIÓN

document.addEventListener('DOMContentLoaded', function() {
    inicializarEventos();
    cargarEstadisticas();
});

function inicializarEventos() {
    // Botones de filtro
    const btnAplicar = document.getElementById('btnAplicar');
    const btnLimpiar = document.getElementById('btnLimpiar');
    
    if (btnAplicar) btnAplicar.addEventListener('click', aplicarFiltros);
    if (btnLimpiar) btnLimpiar.addEventListener('click', limpiarFiltros);
}

// ==================== FILTROS ====================

function aplicarFiltros() {
    const fechaInicio = document.getElementById('fecha_inicio')?.value || '';
    const fechaFin = document.getElementById('fecha_fin')?.value || '';
    const dispositivoId = document.getElementById('dispositivo_id')?.value || '';
    const tipoAcceso = document.getElementById('tipo_acceso')?.value || '';
    
    const params = new URLSearchParams();
    if (fechaInicio) params.append('fecha_inicio', fechaInicio);
    if (fechaFin) params.append('fecha_fin', fechaFin);
    if (dispositivoId) params.append('dispositivo_id', dispositivoId);
    if (tipoAcceso) params.append('tipo_acceso', tipoAcceso);
    
    window.location.href = `/reportes/?${params.toString()}`;
}

function limpiarFiltros() {
    window.location.href = '/reportes/';
}

// ==================== EXPORTACIÓN DE DATOS ====================

function exportarDatos(formato) {
    const fechaInicio = document.getElementById('fecha_inicio')?.value || '';
    const fechaFin = document.getElementById('fecha_fin')?.value || '';
    const dispositivoId = document.getElementById('dispositivo_id')?.value || '';
    const tipoAcceso = document.getElementById('tipo_acceso')?.value || '';
    
    const params = new URLSearchParams();
    if (fechaInicio) params.append('fecha_inicio', fechaInicio);
    if (fechaFin) params.append('fecha_fin', fechaFin);
    if (dispositivoId) params.append('dispositivo_id', dispositivoId);
    if (tipoAcceso) params.append('tipo_acceso', tipoAcceso);
    
    const url = `/reportes/exportar/${formato}/?${params.toString()}`;
    
    mostrarNotificacion(`Exportando en formato ${formato.toUpperCase()}...`, 'info');
    
    // Crear un enlace temporal para descarga
    fetch(url, {
        method: 'GET',
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error en la exportación');
        }
        return response.blob();
    })
    .then(blob => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `reporte_${new Date().toISOString().slice(0,19).replace(/:/g, '-')}.${formato}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(downloadUrl);
        
        mostrarNotificacion(`Exportación completada (${formato.toUpperCase()})`, 'success');
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarNotificacion(`Error al exportar en formato ${formato.toUpperCase()}`, 'error');
    });
}

// ==================== ESTADÍSTICAS ====================

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

// ==================== REPORTES GUARDADOS ====================

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

// ==================== NOTIFICACIONES ====================

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

// ==================== UTILIDADES ====================

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

// ==================== PAGINACIÓN (opcional) ====================

let paginaActual = 1;
const registrosPorPagina = 10;

function cambiarPagina(pagina) {
    paginaActual = pagina;
    // Aquí iría la lógica para cargar la página correspondiente
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