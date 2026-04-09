// static/js/usuario_nuevo.js - VERSIÓN COMPLETA

document.addEventListener('DOMContentLoaded', function() {
    const formulario = document.getElementById('formularioRegistro');
    const mensajeExito = document.getElementById('mensaje-exito');
    const btnEnviar = document.getElementById('btnEnviar');

    // Establecer fecha mínima para el campo de fecha (hoy)
    const fechaIngreso = document.getElementById('fecha_ingreso');
    if (fechaIngreso) {
        const hoy = new Date().toISOString().split('T')[0];
        fechaIngreso.min = hoy;
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
        const campos = [
            { id: 'nombre', nombre: 'Nombre Completo' },
            { id: 'email', nombre: 'Correo Electrónico' },
            { id: 'telefono', nombre: 'Teléfono' },
            { id: 'departamento', nombre: 'Departamento' },
            { id: 'puesto', nombre: 'Puesto' },
            { id: 'superior', nombre: 'Superior' },
            { id: 'fecha_ingreso', nombre: 'Fecha de Ingreso' }
        ];

        let formularioValido = true;
        let primerError = null;

        // Validar campos obligatorios
        campos.forEach(campo => {
            const elemento = document.getElementById(campo.id);
            if (elemento && !elemento.value.trim()) {
                formularioValido = false;
                resaltarError(elemento);
                if (!primerError) {
                    primerError = elemento;
                }
            } else if (elemento) {
                quitarError(elemento);
            }
        });

        // Validación específica para email
        const email = document.getElementById('email');
        if (email && email.value && !validarEmail(email.value)) {
            formularioValido = false;
            resaltarError(email);
            if (!primerError) {
                primerError = email;
            }
            mostrarError('Por favor, ingrese un correo electrónico válido.');
        }

        // Validación específica para teléfono
        const telefono = document.getElementById('telefono');
        if (telefono && telefono.value && !validarTelefono(telefono.value)) {
            formularioValido = false;
            resaltarError(telefono);
            if (!primerError) {
                primerError = telefono;
            }
            mostrarError('Por favor, ingrese un número de teléfono válido.');
        }

        if (!formularioValido && primerError) {
            primerError.focus();
            if (!document.querySelector('.error-message')) {
                mostrarError('Por favor, complete todos los campos obligatorios correctamente.');
            }
        }

        return formularioValido;
    }

    function validarEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    function validarTelefono(telefono) {
        const regex = /^[\+]?[0-9\s\-\(\)]{8,}$/;
        return regex.test(telefono);
    }

    function resaltarError(elemento) {
        elemento.style.borderColor = '#e74c3c';
        elemento.style.boxShadow = '0 0 0 2px rgba(231, 76, 60, 0.2)';
        elemento.classList.add('error');
    }

    function quitarError(elemento) {
        elemento.style.borderColor = '#ccc';
        elemento.style.boxShadow = 'none';
        elemento.classList.remove('error');
    }

    function mostrarError(mensaje) {
        const errorAnterior = document.querySelector('.error-message');
        if (errorAnterior) {
            errorAnterior.remove();
        }

        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = mensaje;
        
        const boton = formulario.querySelector('.login-button');
        formulario.insertBefore(errorDiv, boton);
    }

    function obtenerDatosFormulario() {
        return {
            nombre: document.getElementById('nombre')?.value || '',
            email: document.getElementById('email')?.value || '',
            telefono: document.getElementById('telefono')?.value || '',
            departamento: document.getElementById('departamento')?.value || '',
            puesto: document.getElementById('puesto')?.value || '',
            superior: document.getElementById('superior')?.value || '',
            fecha_ingreso: document.getElementById('fecha_ingreso')?.value || '',
            fecha_solicitud: new Date().toISOString()
        };
    }

    function enviarDatos() {
        const errorAnterior = document.querySelector('.error-message');
        if (errorAnterior) {
            errorAnterior.remove();
        }

        const boton = formulario.querySelector('.login-button');
        const textoOriginal = boton.innerHTML;
        
        boton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Enviando...';
        boton.disabled = true;

        const datos = obtenerDatosFormulario();
        
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

        // Enviar al servidor
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
                mensajeExito.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                setTimeout(() => {
                    formulario.reset();
                    mensajeExito.classList.remove('mostrar');
                }, 3000);
            } else {
                mostrarError(data.message || 'Error al enviar la solicitud');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            mostrarError('Error de conexión. Por favor, intente nuevamente.');
        })
        .finally(() => {
            boton.innerHTML = textoOriginal;
            boton.disabled = false;
        });
    }

    // Validación en tiempo real
    const inputs = formulario.querySelectorAll('input');
    inputs.forEach(campo => {
        campo.addEventListener('blur', function() {
            if (this.value.trim()) {
                quitarError(this);
                
                if (this.type === 'email' && this.value) {
                    if (!validarEmail(this.value)) {
                        resaltarError(this);
                    }
                }
                
                if (this.id === 'telefono' && this.value) {
                    if (!validarTelefono(this.value)) {
                        resaltarError(this);
                    }
                }
            }
        });

        campo.addEventListener('input', function() {
            if (this.value.trim()) {
                quitarError(this);
                const errorAnterior = document.querySelector('.error-message');
                if (errorAnterior) {
                    errorAnterior.remove();
                }
            }
        });
    });
});