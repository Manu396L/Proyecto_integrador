// detalle.js - Funcionalidad completa para la página de detalle de reporte

document.addEventListener('DOMContentLoaded', function() {
    inicializarAnimaciones();
});

function inicializarAnimaciones() {
    // Animar las barras de progreso
    setTimeout(() => {
        const barExito = document.querySelector('.bar-exito');
        const barFallo = document.querySelector('.bar-fallo');
        
        if (barExito) {
            const width = barExito.style.width;
            barExito.style.width = '0%';
            setTimeout(() => {
                barExito.style.width = width;
            }, 100);
        }
        
        if (barFallo) {
            const width = barFallo.style.width;
            barFallo.style.width = '0%';
            setTimeout(() => {
                barFallo.style.width = width;
            }, 100);
        }
    }, 100);
}

function exportarReporte(reporteId, formato) {
    mostrarNotificacion(`Generando archivo ${formato.toUpperCase()}...`, 'info');
    
    // Crear un enlace temporal para la descarga
    const url = `/reportes/exportar/${reporteId}/${formato}/`;
    
    fetch(url, {
        method: 'GET',
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        }
    })
    .then(response => {
        if (response.ok) {
            return response.blob();
        }
        throw new Error('Error en la exportación');
    })
    .then(blob => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `reporte_${reporteId}.${formato}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(downloadUrl);
        
        mostrarNotificacion(`Reporte exportado en formato ${formato.toUpperCase()}`, 'success');
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarNotificacion('Error al exportar reporte', 'error');
    });
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

// Función para copiar información al portapapeles
function copiarAlPortapapeles(texto) {
    navigator.clipboard.writeText(texto).then(() => {
        mostrarNotificacion('Copiado al portapapeles', 'success');
    }).catch(() => {
        mostrarNotificacion('Error al copiar', 'error');
    });
}

// Función para imprimir el reporte
function imprimirReporte() {
    window.print();
}