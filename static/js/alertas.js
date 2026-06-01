// static/js/alertas.js - COMPLETO

document.addEventListener('DOMContentLoaded', function() {
    inicializarEventos();
});

function inicializarEventos() {
    const btnAplicar = document.querySelector('.btn-aplicar');
    const btnLimpiar = document.querySelector('.btn-limpiar');
    const filtroSede = document.getElementById('filtro-sede');
    const filtroEstado = document.getElementById('filtro-estado');
    const filtroAutenticacion = document.getElementById('filtro-autenticacion');
    const filtroDispositivo = document.getElementById('filtro-dispositivo');
    
    if (btnAplicar) btnAplicar.addEventListener('click', aplicarFiltros);
    if (btnLimpiar) btnLimpiar.addEventListener('click', limpiarFiltros);
    
    if (filtroSede) filtroSede.addEventListener('change', aplicarFiltros);
    if (filtroEstado) filtroEstado.addEventListener('change', aplicarFiltros);
    if (filtroAutenticacion) filtroAutenticacion.addEventListener('change', aplicarFiltros);
    if (filtroDispositivo) filtroDispositivo.addEventListener('input', aplicarFiltros);
    
    // Formulario de reporte
    const form = document.getElementById('formReportar');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            enviarReporte();
        });
    }
}

function aplicarFiltros() {
    const filtroSede = document.getElementById('filtro-sede')?.value.toLowerCase() || '';
    const filtroEstado = document.getElementById('filtro-estado')?.value.toLowerCase() || '';
    const filtroAutenticacion = document.getElementById('filtro-autenticacion')?.value.toLowerCase() || '';
    const filtroDispositivo = document.getElementById('filtro-dispositivo')?.value.toLowerCase() || '';
    
    const filas = document.querySelectorAll('.tabla-alertas tbody tr:not(.sin-resultados)');
    let visibles = 0;
    
    filas.forEach(fila => {
        const textoDispositivo = fila.querySelector('td:nth-child(3)')?.textContent.toLowerCase() || '';
        const textoEstado = fila.querySelector('.estado-alerta')?.textContent.toLowerCase() || '';
        const textoNivel = fila.querySelector('.nivel-alerta')?.textContent.toLowerCase() || '';
        
        let mostrar = true;
        
        if (filtroDispositivo && !textoDispositivo.includes(filtroDispositivo)) mostrar = false;
        if (filtroEstado && !textoEstado.includes(filtroEstado)) mostrar = false;
        
        fila.style.display = mostrar ? '' : 'none';
        if (mostrar) visibles++;
    });
    
    mostrarNotificacion(`Filtros aplicados: ${visibles} alertas visibles`, 'info');
    
    if (visibles === 0) {
        mostrarMensajeSinResultados();
    } else {
        ocultarMensajeSinResultados();
    }
}

function limpiarFiltros() {
    document.getElementById('filtro-sede').value = '';
    document.getElementById('filtro-estado').value = '';
    document.getElementById('filtro-autenticacion').value = '';
    document.getElementById('filtro-dispositivo').value = '';
    
    const filas = document.querySelectorAll('.tabla-alertas tbody tr');
    filas.forEach(fila => fila.style.display = '');
    
    ocultarMensajeSinResultados();
    mostrarNotificacion('Filtros limpiados', 'info');
}

function mostrarMensajeSinResultados() {
    let mensaje = document.querySelector('.sin-resultados');
    if (!mensaje) {
        const tbody = document.querySelector('.tabla-alertas tbody');
        if (tbody) {
            mensaje = document.createElement('tr');
            mensaje.className = 'sin-resultados';
            mensaje.innerHTML = `
                <td colspan="8" style="text-align: center; padding: 40px;">
                    <i class="fa-solid fa-search" style="font-size: 48px;"></i>
                    <p>No se encontraron alertas con los filtros seleccionados</p>
                </td>
            `;
            tbody.appendChild(mensaje);
        }
    }
}

function ocultarMensajeSinResultados() {
    const mensaje = document.querySelector('.sin-resultados');
    if (mensaje) mensaje.remove();
}

function marcarAlertaResuelta(alertaId) {
    if (!confirm('¿Marcar esta alerta como resuelta?')) return;
    
    fetch(`/alertas/api/resolver/${alertaId}/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            location.reload();
        } else {
            mostrarNotificacion('Error: ' + data.message, 'error');
        }
    })
    .catch(error => mostrarNotificacion('Error al resolver alerta', 'error'));
}

function marcarAlertaLeida(alertaId) {
    fetch(`/alertas/api/leida/${alertaId}/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const alertaRow = document.querySelector(`tr[data-id="${alertaId}"]`);
            if (alertaRow) {
                const estadoSpan = alertaRow.querySelector('.estado-alerta');
                if (estadoSpan) {
                    estadoSpan.innerHTML = '<i class="fa-solid fa-circle"></i> Leída';
                    estadoSpan.classList.remove('estado-pendiente');
                    estadoSpan.classList.add('estado-leida');
                }
            }
            mostrarNotificacion('Alerta marcada como leída', 'success');
        }
    })
    .catch(error => mostrarNotificacion('Error', 'error'));
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
    .catch(error => mostrarNotificacion('Error al enviar reporte', 'error'));
}

function mostrarNotificacion(mensaje, tipo = 'info') {
    const notificacion = document.getElementById('notificacion');
    if (notificacion) {
        notificacion.textContent = mensaje;
        notificacion.className = `notificacion notificacion-${tipo}`;
        notificacion.style.display = 'block';
        setTimeout(() => notificacion.style.display = 'none', 3000);
    } else {
        alert(mensaje);
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