// guardados.js - Funcionalidad completa para la página de reportes guardados

let reporteActualId = null;

document.addEventListener('DOMContentLoaded', function() {
    inicializarEventos();
    actualizarContadores();
});

function inicializarEventos() {
    // Modal exportar
    const modalExportar = document.getElementById('modalExportar');
    const closeModal = document.querySelector('.close');
    const btnExportarAhora = document.getElementById('btnExportarAhora');
    
    if (closeModal && modalExportar) {
        closeModal.onclick = function() {
            modalExportar.style.display = 'none';
        }
        
        window.onclick = function(event) {
            if (event.target === modalExportar) {
                modalExportar.style.display = 'none';
            }
        }
    }
    
    if (btnExportarAhora) {
        btnExportarAhora.onclick = function() {
            if (reporteActualId) {
                const formato = document.querySelector('input[name="export-format"]:checked').value;
                descargarReporte(reporteActualId, formato);
                cerrarModal();
            }
        }
    }
}

function actualizarContadores() {
    const filas = document.querySelectorAll('#tbodyReportes tr:not(.empty-row)');
    const total = filas.length;
    
    let completados = 0;
    let pendientes = 0;
    
    filas.forEach(fila => {
        const estadoCell = fila.querySelector('td:nth-child(4)');
        if (estadoCell) {
            const texto = estadoCell.innerText;
            if (texto.includes('Completado')) {
                completados++;
            } else {
                pendientes++;
            }
        }
    });
    
    document.getElementById('totalReportes').textContent = total;
    document.getElementById('completadosCount').textContent = completados;
    document.getElementById('pendientesCount').textContent = pendientes;
}

function verDetalle(reporteId) {
    window.location.href = `/reportes/detalle/${reporteId}/`;
}

function eliminarReporte(reporteId) {
    if (!confirm('¿Está seguro de eliminar este reporte? Esta acción no se puede deshacer.')) return;
    
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
    .catch(error => {
        console.error('Error:', error);
        mostrarNotificacion('Error al eliminar reporte', 'error');
    });
}

function descargarReporte(reporteId, formato) {
    mostrarNotificacion(`Generando archivo ${formato.toUpperCase()}...`, 'info');
    
    window.location.href = `/reportes/exportar/${reporteId}/${formato}/`;
    
    setTimeout(() => {
        mostrarNotificacion(`Reporte exportado en formato ${formato.toUpperCase()}`, 'success');
    }, 1000);
}

function mostrarModalExportar(reporteId) {
    reporteActualId = reporteId;
    const modal = document.getElementById('modalExportar');
    if (modal) {
        modal.style.display = 'block';
    }
}

function cerrarModal() {
    const modal = document.getElementById('modalExportar');
    if (modal) {
        modal.style.display = 'none';
        reporteActualId = null;
    }
}

function actualizarListado() {
    mostrarNotificacion('Actualizando listado...', 'info');
    setTimeout(() => location.reload(), 500);
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