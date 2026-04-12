// static/js/soporte.js - VERSIÓN COMPLETA CON GUARDADO EN BD

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('formularioProblema');
    const mensajeExito = document.getElementById('mensaje-exito');

    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Obtener los datos del formulario
            const datos = {
                nombre: document.getElementById('nombre').value,
                email: document.getElementById('email').value,
                categoria: document.getElementById('categoria').value,
                asunto: document.getElementById('asunto').value,
                descripcion: document.getElementById('descripcion').value
            };
            
            // Validar campos
            if (!datos.nombre || !datos.email || !datos.categoria || !datos.asunto || !datos.descripcion) {
                mostrarNotificacion('Por favor, complete todos los campos requeridos', 'error');
                return;
            }
            
            // Validar formato de email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(datos.email)) {
                mostrarNotificacion('Por favor, ingrese un correo electrónico válido', 'error');
                return;
            }
            
            console.log('Enviando ticket:', datos);
            
            // ✅ NUEVA: Enviar al servidor a guardar en BD
            enviarTicket(datos);
        });
    }
    
    function enviarTicket(datos) {
        const boton = form.querySelector('.btn');
        const textoOriginal = boton.innerHTML;
        boton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Enviando...';
        boton.disabled = true;
        
        fetch('/soporte/api/crear-ticket/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify(datos)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('✅ Ticket guardado - ID:', data.ticket_id);
                mostrarMensajeExito();
                form.reset();
            } else {
                mostrarNotificacion(data.message || 'Error al crear el ticket', 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            mostrarNotificacion('Error de conexión. Por favor, intente nuevamente.', 'error');
        })
        .finally(() => {
            boton.innerHTML = textoOriginal;
            boton.disabled = false;
        });
    }
    
    function mostrarMensajeExito() {
        if (mensajeExito) {
            mensajeExito.classList.add('mostrar');
            mensajeExito.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            setTimeout(() => {
                mensajeExito.classList.remove('mostrar');
            }, 5000);
        }
    }
    
    function mostrarNotificacion(mensaje, tipo) {
        // Crear notificación temporal
        const notificacion = document.createElement('div');
        notificacion.className = `notificacion-temp ${tipo}`;
        notificacion.innerHTML = `
            <i class="fa-solid fa-${tipo === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${mensaje}</span>
        `;
        notificacion.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${tipo === 'error' ? '#f8d7da' : '#d4edda'};
            color: ${tipo === 'error' ? '#721c24' : '#155724'};
            padding: 12px 20px;
            border-radius: 8px;
            border-left: 4px solid ${tipo === 'error' ? '#dc3545' : '#28a745'};
            z-index: 10000;
            font-size: 13px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            display: flex;
            align-items: center;
            gap: 10px;
        `;
        
        document.body.appendChild(notificacion);
        
        setTimeout(() => {
            notificacion.remove();
        }, 3000);
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
});