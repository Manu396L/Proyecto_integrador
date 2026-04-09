// configuracion.js - Funcionalidad para la página de configuración

document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos del DOM
    const botonesGuardar = document.querySelectorAll('.btn-guardar');
    const botonesAccion = document.querySelectorAll('.btn-accion');
    const btnBackup = document.querySelector('.btn-backup');
    const modalExportar = document.getElementById('modalExportar');
    const btnAbrirExportar = document.getElementById('btnAbrirExportar');
    const btnExportarAhora = document.getElementById('btnExportarAhora');
    const btnProgramarExport = document.getElementById('btnProgramarExport');
    const closeModal = document.querySelector('.close');
    
    // Función para mostrar notificación
    function mostrarNotificacion(mensaje, tipo = 'success') {
        // Remover notificaciones anteriores
        const notificacionesAnteriores = document.querySelectorAll('.notificacion');
        notificacionesAnteriores.forEach(notif => notif.remove());
        
        // Crear nueva notificación
        const notificacion = document.createElement('div');
        notificacion.className = `notificacion notificacion-${tipo}`;
        notificacion.innerHTML = `
            <div>
                <i class="fa-solid fa-${tipo === 'success' ? 'check' : tipo === 'error' ? 'exclamation-triangle' : 'info'}-circle"></i>
                <span>${mensaje}</span>
            </div>
        `;
        
        document.body.appendChild(notificacion);
        
        // Remover después de 3 segundos
        setTimeout(() => {
            notificacion.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notificacion.parentNode) {
                    notificacion.parentNode.removeChild(notificacion);
                }
            }, 300);
        }, 3000);
    }
    
    // Función para guardar configuración
    function guardarConfiguracion(seccion) {
        // Simular guardado de configuración
        const boton = event.target;
        const textoOriginal = boton.innerHTML;
        
        boton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando...';
        boton.disabled = true;
        
        setTimeout(() => {
            boton.innerHTML = textoOriginal;
            boton.disabled = false;
            mostrarNotificacion(`Configuración de ${seccion} guardada correctamente`, 'success');
        }, 1500);
    }
    
    // Función para realizar backup
    function realizarBackup() {
        const boton = event.target;
        const textoOriginal = boton.innerHTML;
        
        boton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Creando Backup...';
        boton.disabled = true;
        
        setTimeout(() => {
            boton.innerHTML = textoOriginal;
            boton.disabled = false;
            mostrarNotificacion('Backup creado exitosamente', 'success');
        }, 2000);
    }
    
    // Función para exportar configuración
    function exportarConfiguracion() {
        const formato = document.querySelector('input[name="formato-export"]:checked').value;
        const seccionesSeleccionadas = obtenerSeccionesSeleccionadas();
        
        if (seccionesSeleccionadas.length === 0) {
            mostrarNotificacion('Seleccione al menos una sección para exportar', 'error');
            return;
        }
        
        const configuracion = generarArchivoConfiguracion(formato, seccionesSeleccionadas);
        descargarArchivo(configuracion, formato);
        
        cerrarModal();
        mostrarNotificacion(`Configuración exportada en formato ${formato.toUpperCase()}`, 'success');
    }
    
    // Función para obtener secciones seleccionadas
    function obtenerSeccionesSeleccionadas() {
        const secciones = [];
        const checkboxes = document.querySelectorAll('.section-checkbox input[type="checkbox"]:checked');
        
        checkboxes.forEach(checkbox => {
            secciones.push(checkbox.id.replace('section-', ''));
        });
        
        return secciones;
    }
    
    // Función para generar archivo de configuración
    function generarArchivoConfiguracion(formato, secciones) {
        const configData = {
            sistema: {
                nombre: document.getElementById('nombre-sistema').value,
                timezone: document.getElementById('timezone').value,
                idioma: document.getElementById('idioma').value,
                version: '2.1.0',
                fechaExportacion: new Date().toISOString()
            },
            horarios: {
                entrada: document.getElementById('hora-entrada').value,
                salida: document.getElementById('hora-salida').value,
                tolerancia: document.getElementById('tolerancia').value,
                horarioFlexible: document.getElementById('horario-flexible').checked
            },
            seguridad: {
                huellaDigital: document.getElementById('huella-digital').checked,
                reconocimientoFacial: document.getElementById('reconocimiento-facial').checked,
                tarjetaRFID: document.getElementById('tarjeta-rfid').checked,
                intentosFallidos: document.getElementById('intentos-fallidos').value,
                longitudPassword: document.getElementById('longitud-password').value,
                requiereMayusculas: document.getElementById('mayusculas').checked,
                requiereNumeros: document.getElementById('numeros').checked,
                requiereEspeciales: document.getElementById('caracteres-especiales').checked,
                caducidadPassword: document.getElementById('caducidad-password').value
            },
            notificaciones: {
                email: document.getElementById('notificaciones-email').checked,
                sms: document.getElementById('notificaciones-sms').checked,
                tiempoReal: document.getElementById('alertas-tiempo-real').checked,
                intervalo: document.getElementById('intervalo-notificaciones').value
            },
            backup: {
                automatico: document.getElementById('backup-automatico').checked,
                frecuencia: document.getElementById('frecuencia-backup').value,
                hora: document.getElementById('hora-backup').value,
                retencion: document.getElementById('retencion-backup').value
            }
        };
        
        // Filtrar solo las secciones seleccionadas
        const configFiltrada = {};
        secciones.forEach(seccion => {
            if (configData[seccion]) {
                configFiltrada[seccion] = configData[seccion];
            }
        });
        
        switch(formato) {
            case 'cfg':
                return generarArchivoCFG(configFiltrada);
            case 'json':
                return generarArchivoJSON(configFiltrada);
            case 'xml':
                return generarArchivoXML(configFiltrada);
            default:
                return generarArchivoJSON(configFiltrada);
        }
    }
    
    // Función para generar archivo .cfg
    function generarArchivoCFG(config) {
        let contenido = `# Configuración del Sistema Biometrika\n`;
        contenido += `# Exportado: ${new Date().toLocaleString()}\n`;
        contenido += `# Versión: 2.1.0\n\n`;
        
        for (const [seccion, valores] of Object.entries(config)) {
            contenido += `[${seccion.toUpperCase()}]\n`;
            for (const [clave, valor] of Object.entries(valores)) {
                contenido += `${clave}=${valor}\n`;
            }
            contenido += '\n';
        }
        
        return contenido;
    }
    
    // Función para generar archivo .json
    function generarArchivoJSON(config) {
        return JSON.stringify(config, null, 2);
    }
    
    // Función para generar archivo .xml
    function generarArchivoXML(config) {
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<configuracion>\n';
        xml += `  <fechaExportacion>${new Date().toISOString()}</fechaExportacion>\n`;
        xml += `  <version>2.1.0</version>\n`;
        
        for (const [seccion, valores] of Object.entries(config)) {
            xml += `  <${seccion}>\n`;
            for (const [clave, valor] of Object.entries(valores)) {
                xml += `    <${clave}>${valor}</${clave}>\n`;
            }
            xml += `  </${seccion}>\n`;
        }
        
        xml += '</configuracion>';
        return xml;
    }
    
    // Función para descargar archivo
    function descargarArchivo(contenido, formato) {
        const blob = new Blob([contenido], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        const fecha = new Date().toISOString().split('T')[0];
        const nombreArchivo = `biometrika_config_${fecha}.${formato}`;
        
        a.href = url;
        a.download = nombreArchivo;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    // Funciones del modal
    function abrirModal() {
        modalExportar.style.display = 'block';
    }
    
    function cerrarModal() {
        modalExportar.style.display = 'none';
    }
    
    // Función para acciones del sistema
    function ejecutarAccionSistema(accion) {
        const boton = event.target.closest('.btn-accion');
        const textoOriginal = boton.innerHTML;
        
        boton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Procesando...';
        boton.disabled = true;
        
        let mensaje = '';
        
        switch(accion) {
            case 'reiniciar':
                mensaje = 'Servicios reiniciados correctamente';
                break;
            case 'limpiar-cache':
                mensaje = 'Caché limpiada exitosamente';
                break;
            case 'test-sistema':
                mensaje = 'Test del sistema completado';
                break;
            case 'exportar-config':
                abrirModal();
                boton.innerHTML = textoOriginal;
                boton.disabled = false;
                return;
            case 'reset-config':
                if(confirm('¿Está seguro que desea restablecer toda la configuración a los valores por defecto?')) {
                    mensaje = 'Configuración restablecida a valores por defecto';
                } else {
                    boton.innerHTML = textoOriginal;
                    boton.disabled = false;
                    return;
                }
                break;
        }
        
        setTimeout(() => {
            boton.innerHTML = textoOriginal;
            boton.disabled = false;
            if (mensaje) {
                mostrarNotificacion(mensaje, 'success');
            }
        }, 2000);
    }
    
    // Event Listeners para botones de guardar
    botonesGuardar.forEach((boton, index) => {
        boton.addEventListener('click', function() {
            const secciones = ['Configuración General', 'Horarios', 'Seguridad'];
            const seccion = secciones[index] || 'Configuración';
            guardarConfiguracion(seccion);
        });
    });
    
    // Event Listener para backup
    if (btnBackup) {
        btnBackup.addEventListener('click', realizarBackup);
    }
    
    // Event Listeners para acciones del sistema
    botonesAccion.forEach(boton => {
        boton.addEventListener('click', function() {
            const accion = this.classList[1].replace('btn-', '');
            ejecutarAccionSistema(accion);
        });
    });
    
    // Event Listeners para el modal de exportación
    btnAbrirExportar.addEventListener('click', abrirModal);
    closeModal.addEventListener('click', cerrarModal);
    btnExportarAhora.addEventListener('click', exportarConfiguracion);
    
    btnProgramarExport.addEventListener('click', function() {
        mostrarNotificacion('Exportación programada para las 02:00 AM', 'info');
        cerrarModal();
    });
    
    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', function(event) {
        if (event.target === modalExportar) {
            cerrarModal();
        }
    });
    
    // Validación de campos numéricos
    const camposNumericos = document.querySelectorAll('input[type="number"]');
    camposNumericos.forEach(campo => {
        campo.addEventListener('blur', function() {
            const min = parseInt(this.min) || 0;
            const max = parseInt(this.max) || Infinity;
            const valor = parseInt(this.value) || min;
            
            if (valor < min) {
                this.value = min;
                mostrarNotificacion(`El valor mínimo permitido es ${min}`, 'error');
            } else if (valor > max) {
                this.value = max;
                mostrarNotificacion(`El valor máximo permitido es ${max}`, 'error');
            }
        });
    });
    
    // Cargar configuración guardada (simulado)
    function cargarConfiguracion() {
        console.log('Cargando configuración del sistema...');
        // Aquí iría la lógica para cargar la configuración desde el servidor
    }
    
    // Inicializar la página
    cargarConfiguracion();
});