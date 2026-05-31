// static/js/usuario_nuevo.js
document.addEventListener('DOMContentLoaded', function() {
    const formulario = document.getElementById('formularioRegistro');
    const mensajeExito = document.getElementById('mensaje-exito');
    const fechaIngreso = document.getElementById('fecha_ingreso');
    if (fechaIngreso) {
        const hoy = new Date().toISOString().split('T')[0];
        fechaIngreso.max = hoy;
        fechaIngreso.min = '1990-01-01';
    }

    if (formulario) {
        formulario.addEventListener('submit', function(e) {
            e.preventDefault();
            if (validarFormulario()) {
                enviarDatos();
            }
        });
    }

    function validarFormulario() {
        let valido = true;
        const campos = ['nombre', 'dni', 'email', 'telefono', 'departamento', 'puesto', 'superior', 'fecha_ingreso'];
        
        campos.forEach(campo => {
            const elemento = document.getElementById(campo);
            if (elemento && !elemento.value.trim()) {
                valido = false;
                elemento.style.borderColor = '#e74c3c';
                elemento.style.boxShadow = '0 0 0 2px rgba(231, 76, 60, 0.2)';
            } else if (elemento) {
                elemento.style.borderColor = '#ccc';
                elemento.style.boxShadow = 'none';
            }
        });

        const dni = document.getElementById('dni');
        if (dni && dni.value && !/^\d{7,8}$/.test(dni.value)) {
            valido = false;
            dni.style.borderColor = '#e74c3c';
            dni.style.boxShadow = '0 0 0 2px rgba(231, 76, 60, 0.2)';
            mostrarError('DNI inválido (debe tener 7 u 8 dígitos)');
        }

        const email = document.getElementById('email');
        if (email && email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
            valido = false;
            email.style.borderColor = '#e74c3c';
            email.style.boxShadow = '0 0 0 2px rgba(231, 76, 60, 0.2)';
            mostrarError('Email inválido');
        }

        const telefono = document.getElementById('telefono');
        if (telefono && telefono.value && !/^[\+]?[0-9\s\-\(\)]{8,}$/.test(telefono.value)) {
            valido = false;
            telefono.style.borderColor = '#e74c3c';
            telefono.style.boxShadow = '0 0 0 2px rgba(231, 76, 60, 0.2)';
            mostrarError('Teléfono inválido');
        }

        const fechaIngresoElem = document.getElementById('fecha_ingreso');
        if (fechaIngresoElem && fechaIngresoElem.value) {
            const fecha = new Date(fechaIngresoElem.value);
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            if (fecha > hoy) {
                valido = false;
                fechaIngresoElem.style.borderColor = '#e74c3c';
                mostrarError('La fecha de ingreso no puede ser futura');
            }
        }

        return valido;
    }

    function mostrarError(mensaje) {
        let errorDiv = document.querySelector('.error-message');
        if (errorDiv) {
            errorDiv.remove();
        }
        errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = mensaje;
        const boton = formulario.querySelector('.login-button');
        formulario.insertBefore(errorDiv, boton);
        setTimeout(() => {
            if (errorDiv) errorDiv.remove();
        }, 4000);
    }

    function enviarDatos() {
        const boton = document.querySelector('.login-button');
        const textoOriginal = boton.innerHTML;
        boton.disabled = true;
        boton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Enviando...';

        const datos = {
            nombre: document.getElementById('nombre')?.value.trim() || '',
            dni: document.getElementById('dni')?.value.trim() || '',
            email: document.getElementById('email')?.value.trim() || '',
            telefono: document.getElementById('telefono')?.value.trim() || '',
            departamento: document.getElementById('departamento')?.value.trim() || '',
            puesto: document.getElementById('puesto')?.value.trim() || '',
            superior: document.getElementById('superior')?.value.trim() || '',
            fecha_ingreso: document.getElementById('fecha_ingreso')?.value || ''
        };

        console.log('Enviando datos:', datos);

        function getCookie(name) {
            let value = null;
            if (document.cookie && document.cookie !== '') {
                document.cookie.split(';').forEach(cookie => {
                    const c = cookie.trim();
                    if (c.startsWith(name + '=')) {
                        value = decodeURIComponent(c.substring(name.length + 1));
                    }
                });
            }
            return value;
        }

        fetch('/usuarios/api/registro/', {
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
                mensajeExito.classList.add('mostrar');
                formulario.reset();
                setTimeout(() => {
                    mensajeExito.classList.remove('mostrar');
                }, 4000);
            } else {
                mostrarError(data.message || 'Error al enviar la solicitud');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            mostrarError('Error de conexión. Por favor, intente nuevamente.');
        })
        .finally(() => {
            boton.disabled = false;
            boton.innerHTML = textoOriginal;
        });
    }

    // Validación en tiempo real
    const inputs = formulario.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            this.style.borderColor = '#ccc';
            this.style.boxShadow = 'none';
            const errorDiv = document.querySelector('.error-message');
            if (errorDiv) errorDiv.remove();
        });
    });
});