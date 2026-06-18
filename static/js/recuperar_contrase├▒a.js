// static/js/recuperar_contraseña.js
document.addEventListener('DOMContentLoaded', function() {
    const formulario = document.getElementById('formulario-recuperacion');
    const mensajeExito = document.getElementById('mensaje-exito');
    const mensajeError = document.getElementById('mensaje-error');
    const errorText = document.getElementById('error-text');
    const dniInput = document.getElementById('dni');
    const emailInput = document.getElementById('email');

    // Ocultar mensajes inicialmente
    if (mensajeExito) mensajeExito.classList.remove('mostrar');
    if (mensajeError) mensajeError.style.display = 'none';

    // Función para mostrar error
    function mostrarError(mensaje) {
        if (mensajeError && errorText) {
            errorText.textContent = mensaje;
            mensajeError.style.display = 'flex';
            setTimeout(() => {
                mensajeError.style.display = 'none';
            }, 5000);
        } else {
            alert(mensaje);
        }
    }

    // Función para mostrar mensaje de éxito
    function mostrarMensajeExito() {
        if (mensajeExito) {
            mensajeExito.classList.add('mostrar');
            mensajeExito.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
            
            // Limpiar formulario
            formulario.reset();
            
            // Ocultar mensaje después de 8 segundos
            setTimeout(() => {
                mensajeExito.classList.remove('mostrar');
            }, 8000);
        }
    }

    // Función para validar DNI (7 u 8 dígitos numéricos)
    function validarDNI(dni) {
        const dniRegex = /^\d{7,8}$/;
        return dniRegex.test(dni);
    }

    // Función para validar email
    function validarEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Envío del formulario
    formulario.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Obtener datos del formulario
        const dni = dniInput.value.trim();
        const email = emailInput.value.trim();
        
        // Validar que los campos no estén vacíos
        if (!dni || !email) {
            mostrarError('Por favor, complete todos los campos requeridos');
            return;
        }

        // Validar DNI
        if (!validarDNI(dni)) {
            mostrarError('Por favor, ingrese un DNI válido (7 u 8 dígitos numéricos)');
            dniInput.focus();
            return;
        }

        // Validar formato de email
        if (!validarEmail(email)) {
            mostrarError('Por favor, ingrese un correo electrónico válido');
            emailInput.focus();
            return;
        }
        
        const datos = {
            dni: dni,
            email: email,
            timestamp: new Date().toISOString()
        };
        
        // Obtener CSRF token
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
        
        // Enviar datos al servidor
        fetch('/usuarios/api/recuperar-contraseña/', {
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
                mostrarMensajeExito();
            } else {
                mostrarError(data.message || 'No se pudo procesar la solicitud');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            mostrarError('Ocurrió un error al procesar la solicitud. Por favor, inténtelo de nuevo.');
        });
    });

    // Solo permitir números en el campo DNI
    dniInput.addEventListener('input', function() {
        this.value = this.value.replace(/[^0-9]/g, '');
        if (this.value.length > 8) {
            this.value = this.value.slice(0, 8);
        }
        this.style.borderColor = '';
        this.style.backgroundColor = '';
    });

    // Validación en tiempo real del DNI al perder el foco
    dniInput.addEventListener('blur', function() {
        const dni = this.value.trim();
        if (dni && !validarDNI(dni)) {
            this.style.borderColor = '#c62828';
            this.style.backgroundColor = '#ffebee';
        } else {
            this.style.borderColor = '';
            this.style.backgroundColor = '';
        }
    });

    // Validación en tiempo real del email
    emailInput.addEventListener('blur', function() {
        const email = this.value.trim();
        if (email && !validarEmail(email)) {
            this.style.borderColor = '#c62828';
            this.style.backgroundColor = '#ffebee';
        } else {
            this.style.borderColor = '';
            this.style.backgroundColor = '';
        }
    });

    // Limpiar error al empezar a escribir
    emailInput.addEventListener('input', function() {
        this.style.borderColor = '';
        this.style.backgroundColor = '';
    });

    dniInput.addEventListener('blur', function() {
        this.value = this.value.trim();
    });
});