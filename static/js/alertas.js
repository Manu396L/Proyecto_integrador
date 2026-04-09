// static/js/alertas.js

document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos del DOM
    const btnAplicar = document.querySelector('.btn-aplicar');
    const btnLimpiar = document.querySelector('.btn-limpiar');
    const filtroSede = document.getElementById('filtro-sede');
    const filtroEstado = document.getElementById('filtro-estado');
    const filtroAutenticacion = document.getElementById('filtro-autenticacion');
    const filtroDispositivo = document.getElementById('filtro-dispositivo');
    const tabla = document.querySelector('.tabla-alertas tbody');
    
    let filasOriginales = [];
    
    if (tabla) {
        filasOriginales = Array.from(tabla.querySelectorAll('tr:not(.sin-resultados)'));
    }

    // Función para aplicar filtros
    function aplicarFiltros() {
        const sede = filtroSede ? filtroSede.value.toLowerCase() : '';
        const estado = filtroEstado ? filtroEstado.value.toLowerCase() : '';
        const autenticacion = filtroAutenticacion ? filtroAutenticacion.value.toLowerCase() : '';
        const dispositivo = filtroDispositivo ? filtroDispositivo.value.toLowerCase() : '';

        if (!tabla) return;

        // Mostrar todas las filas primero
        filasOriginales.forEach(fila => {
            fila.style.display = '';
        });

        // Aplicar filtros
        filasOriginales.forEach(fila => {
            const celdas = fila.querySelectorAll('td');
            if (celdas.length === 0) return;
            
            const textoDispositivo = celdas[0] ? celdas[0].textContent.toLowerCase() : '';
            const textoSede = celdas[1] ? celdas[1].textContent.toLowerCase() : '';
            const estadoSpan = celdas[6] ? celdas[6].querySelector('.estado-dispositivo') : null;
            const textoEstado = estadoSpan ? estadoSpan.textContent.toLowerCase() : '';
            const authSpan = celdas[5] ? celdas[5].querySelector('.tipo-autenticacion') : null;
            const textoAutenticacion = authSpan ? authSpan.textContent.toLowerCase() : '';

            let mostrar = true;

            if (sede && !textoSede.includes(sede)) mostrar = false;
            if (estado && textoEstado !== estado) mostrar = false;
            if (autenticacion && !textoAutenticacion.includes(autenticacion)) mostrar = false;
            if (dispositivo && !textoDispositivo.includes(dispositivo)) mostrar = false;

            fila.style.display = mostrar ? '' : 'none';
        });

        // Mostrar mensaje si no hay resultados
        const filasVisibles = Array.from(tabla.querySelectorAll('tr')).filter(fila => 
            fila.style.display !== 'none' && !fila.classList.contains('sin-resultados')
        );

        if (filasVisibles.length === 0) {
            mostrarMensajeSinResultados();
        } else {
            ocultarMensajeSinResultados();
        }

        mostrarNotificacion('Filtros aplicados correctamente', 'success');
    }

    // Función para limpiar filtros
    function limpiarFiltros() {
        if (filtroSede) filtroSede.value = '';
        if (filtroEstado) filtroEstado.value = '';
        if (filtroAutenticacion) filtroAutenticacion.value = '';
        if (filtroDispositivo) filtroDispositivo.value = '';

        if (tabla) {
            filasOriginales.forEach(fila => {
                fila.style.display = '';
            });
        }

        ocultarMensajeSinResultados();
        mostrarNotificacion('Filtros limpiados', 'info');
    }

    // Función para reportar dispositivo
    function reportarDispositivo(boton, dispositivoId) {
        if(confirm(`¿Está seguro que desea reportar el dispositivo ${dispositivoId}?`)) {
            // Enviar reporte al servidor
            fetch(`/alertas/reportar/${dispositivoId}/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken'),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ reportado: true })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    boton.innerHTML = '<i class="fa-solid fa-check"></i> Reportado';
                    boton.style.background = '#27ae60';
                    boton.disabled = true;
                    
                    const fila = boton.closest('tr');
                    const estadoCell = fila.querySelector('.estado-dispositivo');
                    if (estadoCell) {
                        estadoCell.textContent = 'Reportado';
                        estadoCell.className = 'estado-dispositivo estado-online';
                    }
                    
                    mostrarNotificacion(`Dispositivo ${dispositivoId} reportado correctamente`, 'success');
                    actualizarContadores();
                }
            })
            .catch(error => {
                mostrarNotificacion('Error al reportar dispositivo', 'error');
            });
        }
    }

    // Función para actualizar contadores
    function actualizarContadores() {
        if (!tabla) return;
        
        const dispositivosCriticos = tabla.querySelectorAll('.estado-caido').length;
        const dispositivosProblemas = tabla.querySelectorAll('.estado-inestable').length;
        const dispositivosEstables = tabla.querySelectorAll('.estado-online').length;

        const criticasElem = document.querySelector('.resumen-item.criticas .resumen-valor');
        const advertenciasElem = document.querySelector('.resumen-item.advertencias .resumen-valor');
        const establesElem = document.querySelector('.resumen-item.estables .resumen-valor');

        if (criticasElem) criticasElem.textContent = dispositivosCriticos;
        if (advertenciasElem) advertenciasElem.textContent = dispositivosProblemas;
        if (establesElem) establesElem.textContent = dispositivosEstables;
    }

    // Función para mostrar mensaje cuando no hay resultados
    function mostrarMensajeSinResultados() {
        if (!tabla) return;
        
        let mensaje = tabla.querySelector('.sin-resultados');
        if (!mensaje) {
            mensaje = document.createElement('tr');
            mensaje.className = 'sin-resultados';
            mensaje.innerHTML = `
                <td colspan="8" style="text-align: center; padding: 40px; color: #7f8c8d;">
                    <i class="fa-solid fa-search" style="font-size: 48px; margin-bottom: 15px; display: block;"></i>
                    <h3 style="margin-bottom: 10px;">No se encontraron dispositivos</h3>
                    <p>Intente ajustar los filtros de búsqueda</p>
                </td>
            `;
            tabla.appendChild(mensaje);
        }
        mensaje.style.display = '';
    }

    // Función para ocultar mensaje de no resultados
    function ocultarMensajeSinResultados() {
        if (!tabla) return;
        
        const mensaje = tabla.querySelector('.sin-resultados');
        if (mensaje) {
            mensaje.style.display = 'none';
        }
    }

    // Función para obtener CSRF token
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    // Función para mostrar notificaciones
    function mostrarNotificacion(mensaje, tipo = 'info') {
        const notificacion = document.createElement('div');
        notificacion.className = `notificacion notificacion-${tipo}`;
        
        const icono = tipo === 'success' ? 'check-circle' : tipo === 'error' ? 'exclamation-circle' : 'info-circle';
        
        notificacion.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fa-solid fa-${icono}"></i>
                <span>${mensaje}</span>
            </div>
        `;

        document.body.appendChild(notificacion);

        setTimeout(() => {
            notificacion.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notificacion.parentNode) {
                    notificacion.parentNode.removeChild(notificacion);
                }
            }, 300);
        }, 3000);
    }

    // Event Listeners
    if (btnAplicar) btnAplicar.addEventListener('click', aplicarFiltros);
    if (btnLimpiar) btnLimpiar.addEventListener('click', limpiarFiltros);

    // Eventos para botones de reportar
    document.querySelectorAll('.btn-reportar').forEach(btn => {
        btn.addEventListener('click', function() {
            const fila = this.closest('tr');
            const dispositivoId = fila ? fila.querySelector('td:first-child strong').textContent : '';
            reportarDispositivo(this, dispositivoId);
        });
    });

    // Eventos para filtros en tiempo real
    if (filtroSede) filtroSede.addEventListener('change', aplicarFiltros);
    if (filtroEstado) filtroEstado.addEventListener('change', aplicarFiltros);
    if (filtroAutenticacion) filtroAutenticacion.addEventListener('change', aplicarFiltros);
    if (filtroDispositivo) filtroDispositivo.addEventListener('input', aplicarFiltros);

    // Inicializar contadores
    actualizarContadores();
});