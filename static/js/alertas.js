// static/js/alertas.js
document.addEventListener('DOMContentLoaded', function() {
    console.log('Alertas JS cargado');
    
    // Botones de filtro
    const btnAplicar = document.getElementById('btn-aplicar-filtros');
    const btnLimpiar = document.getElementById('btn-limpiar-filtros');
    
    if (btnAplicar) btnAplicar.addEventListener('click', aplicarFiltros);
    if (btnLimpiar) btnLimpiar.addEventListener('click', limpiarFiltros);
    
    // Delegación de eventos para botones Resolver (funciona incluso con elementos dinámicos)
    document.getElementById('tbodyAlertas').addEventListener('click', function(e) {
        const btn = e.target.closest('.btn-resolver');
        if (btn) {
            const fila = btn.closest('tr');
            const alertaId = fila.getAttribute('data-id');
            if (alertaId) {
                marcarAlertaResuelta(alertaId);
            }
        }
    });
    
    // Formulario de reporte
    const form = document.getElementById('formReportar');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            enviarReporte();
        });
    }
});

function aplicarFiltros() {
    const filtroSede = document.getElementById('filtro-sede')?.value.toLowerCase() || '';
    const filtroEstado = document.getElementById('filtro-estado')?.value.toLowerCase() || '';
    const filtroNivel = document.getElementById('filtro-nivel')?.value.toLowerCase() || '';
    const filtroDispositivo = document.getElementById('filtro-dispositivo')?.value.toLowerCase() || '';
    
    const filas = document.querySelectorAll('#tbodyAlertas tr:not(.empty-row)');
    let visibles = 0;
    
    filas.forEach(fila => {
        const celdas = fila.querySelectorAll('td');
        if (celdas.length === 0) return;
        
        const textoDispositivo = celdas[2]?.textContent.toLowerCase() || '';
        const textoEstadoSpan = celdas[6]?.textContent.toLowerCase() || '';
        const textoNivelSpan = celdas[1]?.textContent.toLowerCase() || '';
        
        let mostrar = true;
        if (filtroDispositivo && !textoDispositivo.includes(filtroDispositivo)) mostrar = false;
        if (filtroEstado && !textoEstadoSpan.includes(filtroEstado)) mostrar = false;
        if (filtroNivel && !textoNivelSpan.includes(filtroNivel)) mostrar = false;
        
        fila.style.display = mostrar ? '' : 'none';
        if (mostrar) visibles++;
    });
    
    mostrarNotificacion(`${visibles} alertas visibles`, 'info');
}

function limpiarFiltros() {
    document.getElementById('filtro-sede').value = '';
    document.getElementById('filtro-estado').value = '';
    document.getElementById('filtro-nivel').value = '';
    document.getElementById('filtro-dispositivo').value = '';
    
    const filas = document.querySelectorAll('#tbodyAlertas tr');
    filas.forEach(fila => fila.style.display = '');
    
    mostrarNotificacion('Filtros limpiados', 'info');
}

function marcarAlertaResuelta(alertaId) {
    if (!confirm('¿Marcar esta alerta como resuelta?')) return;
    
    fetch(`/alertas/api/resolver/${alertaId}/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken'),
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            mostrarNotificacion('Alerta resuelta correctamente', 'success');
            setTimeout(() => location.reload(), 1000);
        } else {
            mostrarNotificacion('Error: ' + data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarNotificacion('Error al conectar con el servidor', 'error');
    });
}

function reportarDispositivo(id, nombre) {
    document.getElementById('dispositivo_id_reportar').value = id;
    document.getElementById('dispositivo_nombre_reportar').value = nombre;
    document.getElementById('modalReportar').style.display = 'block';
}

function cerrarModal() {
    document.getElementById('modalReportar').style.display = 'none';
    document.getElementById('formReportar').reset();
}

function enviarReporte() {
    const dispositivo_id = document.getElementById('dispositivo_id_reportar').value;
    const descripcion = document.getElementById('descripcion_reporte').value;
    
    if (!dispositivo_id || !descripcion.trim()) {
        mostrarNotificacion('Complete todos los campos', 'error');
        return;
    }
    
    const datos = new FormData();
    datos.append('dispositivo_id', dispositivo_id);
    datos.append('descripcion', descripcion);
    
    fetch('/alertas/reportar/', {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: datos
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            mostrarNotificacion('Reporte enviado correctamente', 'success');
            cerrarModal();
            setTimeout(() => location.reload(), 1500);
        } else {
            mostrarNotificacion('Error: ' + data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarNotificacion('Error al enviar reporte', 'error');
    });
}

function mostrarNotificacion(mensaje, tipo = 'info') {
    const notificacion = document.getElementById('notificacion');
    if (notificacion) {
        notificacion.textContent = mensaje;
        notificacion.className = `notificacion notificacion-${tipo}`;
        notificacion.style.display = 'block';
        setTimeout(() => {
            notificacion.style.display = 'none';
        }, 3000);
    } else {
        console.log(mensaje);
    }
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