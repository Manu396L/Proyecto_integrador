// Datos de ejemplo
let dispositivos = [];
let editandoIndex = null;
let dispositivoSeleccionado = null;

// Elementos DOM
const cuerpoTabla = document.getElementById('cuerpoTabla');
const estadoVacio = document.getElementById('estado-vacio');
const tablaDispositivos = document.getElementById('tablaDispositivos');
const btnGuardar = document.getElementById('btn-guardar');
const btnCancelar = document.getElementById('btn-cancelar');
const btnNuevo = document.getElementById('btn-nuevo');
const btnAgregarPrimero = document.getElementById('btn-agregar-primero');
const btnLimpiarFiltros = document.getElementById('btn-limpiar-filtros');
const formTitle = document.getElementById('form-title');
const mensajeTexto = document.getElementById('mensaje-texto');

// Elementos de filtro
const filtroNombre = document.getElementById('filtro-nombre');
const filtroEstado = document.getElementById('filtro-estado');
const filtroTipo = document.getElementById('filtro-tipo');

// Elementos del formulario
const formulario = document.getElementById('formularioDispositivo');
const inputNombre = document.getElementById('nombre_dispositivo');
const inputNumeroSerie = document.getElementById('numero_serie');
const selectTipoSede = document.getElementById('tipo_sede');
const inputArea = document.getElementById('area');
const inputDireccion = document.getElementById('direccion');
const inputDireccionIP = document.getElementById('direccion_ip');
const selectZonaHoraria = document.getElementById('zona_horaria');
const inputIntervalo = document.getElementById('intervalo_solicitud');
const selectEstado = document.getElementById('estado');
const selectTipoDispositivo = document.getElementById('tipo_dispositivo');
const textareaObservaciones = document.getElementById('observaciones');

// ========== FUNCIONES PRINCIPALES ==========

function actualizarTabla() {
    // Aplicar filtros
    let dispositivosFiltrados = dispositivos;
    
    if (filtroNombre.value) {
        const busqueda = filtroNombre.value.toLowerCase();
        dispositivosFiltrados = dispositivosFiltrados.filter(d => 
            d.nombre.toLowerCase().includes(busqueda) || 
            d.numeroSerie.toLowerCase().includes(busqueda)
        );
    }
    
    if (filtroEstado.value) {
        dispositivosFiltrados = dispositivosFiltrados.filter(d => d.estado === filtroEstado.value);
    }
    
    if (filtroTipo.value) {
        dispositivosFiltrados = dispositivosFiltrados.filter(d => d.tipoSede === filtroTipo.value);
    }
    
    // Limpiar tabla
    cuerpoTabla.innerHTML = '';
    
    // Mostrar estado vacío o tabla
    if (dispositivosFiltrados.length === 0) {
        estadoVacio.style.display = 'block';
        tablaDispositivos.style.display = 'none';
    } else {
        estadoVacio.style.display = 'none';
        tablaDispositivos.style.display = 'table';
        
        // Llenar tabla con dispositivos
        dispositivosFiltrados.forEach((dispositivo, index) => {
            const fila = document.createElement('tr');
            
            // Determinar clases para badges
            const estadoBadgeClass = {
                'activo': 'badge-activo',
                'pausado': 'badge-pausado',
                'error': 'badge-error',
                'sin_conexion': 'badge-sin-conexion',
                'apagado': 'badge-apagado'
            }[dispositivo.estado] || '';
            
            const sedeBadgeClass = {
                'sede': 'badge-sede-principal',
                'oficina': 'badge-oficina',
                'area': 'badge-area',
                'almacen': 'badge-almacen'
            }[dispositivo.tipoSede] || '';
            
            // Textos para mostrar
            const estadoTexto = {
                'activo': 'Activo',
                'pausado': 'Pausado',
                'error': 'Error',
                'sin_conexion': 'Sin Conexión',
                'apagado': 'Apagado'
            }[dispositivo.estado] || dispositivo.estado;
            
            const sedeTexto = {
                'sede': 'Sede Principal',
                'oficina': 'Oficina',
                'area': 'Área Específica',
                'almacen': 'Almacén'
            }[dispositivo.tipoSede] || dispositivo.tipoSede;
            
            fila.innerHTML = `
                <td>${dispositivo.nombre}</td>
                <td>${dispositivo.numeroSerie}</td>
                <td>${dispositivo.direccionIP}</td>
                <td>${dispositivo.area}</td>
                <td><span class="badge-sede ${sedeBadgeClass}">${sedeTexto}</span></td>
                <td><span class="badge-estado ${estadoBadgeClass}">${estadoTexto}</span></td>
                <td>${dispositivo.ultimaConexion}</td>
                <td class="acciones">
                    <button class="btn-accion btn-editar" data-index="${index}" onclick="seleccionarDispositivo(${index})">
                        <i class="fa-solid fa-pen"></i> Editar
                    </button>
                    <button class="btn-accion btn-eliminar" data-index="${index}" onclick="eliminarDispositivo(${index})">
                        <i class="fa-solid fa-trash"></i> Eliminar
                    </button>
                </td>
            `;
            
            cuerpoTabla.appendChild(fila);
        });
    }
}

function seleccionarDispositivo(index) {
    dispositivoSeleccionado = index;
    editarDispositivo(index);
}

function guardarDispositivo(e) {
    e.preventDefault();
    
    const nombre = inputNombre.value.trim();
    const numeroSerie = inputNumeroSerie.value.trim();
    const tipoSede = selectTipoSede.value;
    const area = inputArea.value.trim();
    const direccion = inputDireccion.value.trim();
    const direccionIP = inputDireccionIP.value.trim();
    const zonaHoraria = selectZonaHoraria.value;
    const intervalo = inputIntervalo.value;
    const estado = selectEstado.value;
    const tipoDispositivo = selectTipoDispositivo.value;
    const observaciones = textareaObservaciones.value.trim();
    
    // Validaciones básicas
    if (!nombre || !numeroSerie || !tipoSede || !area || !direccionIP || !zonaHoraria || !estado) {
        mostrarMensaje('Por favor, complete todos los campos obligatorios', 'error');
        return;
    }
    
    // Validar formato de IP
    const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
    if (!ipRegex.test(direccionIP)) {
        mostrarMensaje('Por favor, ingrese una dirección IP válida', 'error');
        return;
    }
    
    const nuevoDispositivo = {
        nombre,
        numeroSerie,
        tipoSede,
        area,
        direccion,
        direccionIP,
        zonaHoraria,
        intervalo: intervalo || 5,
        estado,
        tipoDispositivo,
        observaciones,
        ultimaConexion: new Date().toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    };
    
    if (editandoIndex !== null) {
        // Actualizar dispositivo existente
        dispositivos[editandoIndex] = nuevoDispositivo;
        editandoIndex = null;
        mostrarMensaje('Dispositivo actualizado correctamente');
    } else {
        // Agregar nuevo dispositivo
        dispositivos.push(nuevoDispositivo);
        mostrarMensaje('Dispositivo registrado correctamente');
    }
    
    // Limpiar formulario
    limpiarFormulario();
    
    // Actualizar tabla
    actualizarTabla();
}

function mostrarMensaje(mensaje, tipo = 'success') {
    const mensajeExito = document.getElementById('mensaje-exito');
    mensajeTexto.textContent = mensaje;
    
    if (tipo === 'error') {
        mensajeExito.style.background = '#f8d7da';
        mensajeExito.style.borderLeftColor = '#dc3545';
        mensajeExito.style.color = '#721c24';
        mensajeExito.querySelector('i').className = 'fa-solid fa-exclamation-circle';
        mensajeExito.querySelector('i').style.color = '#dc3545';
    } else {
        mensajeExito.style.background = '#d4edda';
        mensajeExito.style.borderLeftColor = '#28a745';
        mensajeExito.style.color = '#155724';
        mensajeExito.querySelector('i').className = 'fa-solid fa-check';
        mensajeExito.querySelector('i').style.color = '#28a745';
    }
    
    mensajeExito.classList.add('mostrar');
    
    setTimeout(() => {
        mensajeExito.classList.remove('mostrar');
    }, 3000);
}

function limpiarFormulario() {
    formulario.reset();
    btnCancelar.style.display = 'none';
    formTitle.textContent = 'Nuevo Dispositivo';
    editandoIndex = null;
    dispositivoSeleccionado = null;
}

function editarDispositivo(index) {
    const dispositivo = dispositivos[index];
    
    // Llenar formulario con datos existentes
    inputNombre.value = dispositivo.nombre;
    inputNumeroSerie.value = dispositivo.numeroSerie;
    selectTipoSede.value = dispositivo.tipoSede;
    inputArea.value = dispositivo.area;
    inputDireccion.value = dispositivo.direccion || '';
    inputDireccionIP.value = dispositivo.direccionIP;
    selectZonaHoraria.value = dispositivo.zonaHoraria;
    inputIntervalo.value = dispositivo.intervalo;
    selectEstado.value = dispositivo.estado;
    selectTipoDispositivo.value = dispositivo.tipoDispositivo || 'huella';
    textareaObservaciones.value = dispositivo.observaciones || '';
    
    // Cambiar a modo edición
    editandoIndex = index;
    btnCancelar.style.display = 'inline-flex';
    formTitle.textContent = 'Editar Dispositivo';
    
    // Hacer scroll al formulario
    document.querySelector('.form-panel').scrollIntoView({ behavior: 'smooth' });
    
    mostrarMensaje(`Editando dispositivo: ${dispositivo.nombre}`);
}

function eliminarDispositivo(index) {
    if (confirm('¿Está seguro de que desea eliminar este dispositivo?')) {
        dispositivos.splice(index, 1);
        actualizarTabla();
        mostrarMensaje('Dispositivo eliminado correctamente');
        
        // Si estábamos editando y eliminamos el mismo dispositivo, limpiar formulario
        if (editandoIndex === index) {
            limpiarFormulario();
        }
    }
}

function nuevoDispositivo() {
    limpiarFormulario();
    mostrarMensaje('Listo para agregar un nuevo dispositivo');
}

function cancelarEdicion() {
    limpiarFormulario();
    mostrarMensaje('Edición cancelada');
}

// ========== FUNCIONES DE LOS MENÚS DESPLEGABLES ==========

// Variable para controlar el menú abierto
let menuAbierto = null;

function toggleDropdown(menuId) {
    const menu = document.getElementById(menuId);
    
    // Si el menú ya está abierto, cerrarlo
    if (menuAbierto === menuId) {
        menu.classList.remove('show');
        menuAbierto = null;
        return;
    }
    
    // Cerrar otros menús abiertos
    document.querySelectorAll('.dropdown-menu').forEach(m => {
        m.classList.remove('show');
    });
    
    // Abrir el menú actual
    menu.classList.add('show');
    menuAbierto = menuId;
}

// Cerrar menús al hacer clic fuera
document.addEventListener('click', function(e) {
    const dropdowns = document.querySelectorAll('.dropdown-group');
    let clickEnDropdown = false;
    
    // Verificar si el clic fue en un dropdown
    dropdowns.forEach(dropdown => {
        if (dropdown.contains(e.target)) {
            clickEnDropdown = true;
        }
    });
    
    // Si el clic no fue en un dropdown, cerrar todos los menús
    if (!clickEnDropdown) {
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
            menu.classList.remove('show');
        });
        menuAbierto = null;
    }
});

// Prevenir que los clics dentro del menú lo cierren
document.querySelectorAll('.dropdown-menu').forEach(menu => {
    menu.addEventListener('click', function(e) {
        e.stopPropagation();
    });
});

// ========== MENÚ ACCESO RÁPIDO ==========

function modificarSeleccionado() {
    if (dispositivoSeleccionado !== null) {
        editarDispositivo(dispositivoSeleccionado);
        // Cerrar menú después de la acción
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
            menu.classList.remove('show');
        });
        menuAbierto = null;
    } else {
        mostrarMensaje('Por favor, seleccione un dispositivo primero', 'error');
    }
}

function borrarSeleccionado() {
    if (dispositivoSeleccionado !== null) {
        eliminarDispositivo(dispositivoSeleccionado);
        // Cerrar menú después de la acción
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
            menu.classList.remove('show');
        });
        menuAbierto = null;
    } else {
        mostrarMensaje('Por favor, seleccione un dispositivo primero', 'error');
    }
}

function actualizarListado() {
    actualizarTabla();
    mostrarMensaje('Listado actualizado');
    // Cerrar menú después de la acción
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
        menu.classList.remove('show');
    });
    menuAbierto = null;
}

// ========== MENÚ DISPOSITIVO ==========

function leerInformacion() {
    if (dispositivoSeleccionado !== null) {
        const dispositivo = dispositivos[dispositivoSeleccionado];
        mostrarMensaje(`Leyendo información del dispositivo: ${dispositivo.nombre}...`);
        
        // Simular lectura de información
        setTimeout(() => {
            const info = `
                <strong>Información del Dispositivo:</strong><br>
                • Nombre: ${dispositivo.nombre}<br>
                • N° Serie: ${dispositivo.numeroSerie}<br>
                • IP: ${dispositivo.direccionIP}<br>
                • Estado: ${dispositivo.estado}<br>
                • Última conexión: ${dispositivo.ultimaConexion}<br>
                • Firmware: v2.1.4<br>
                • Huellas registradas: 142<br>
                • Memoria disponible: 78%
            `;
            alert(info);
            mostrarMensaje('Información del dispositivo leída correctamente');
        }, 2000);
    } else {
        mostrarMensaje('Por favor, seleccione un dispositivo primero', 'error');
    }
    
    // Cerrar menú después de la acción
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
        menu.classList.remove('show');
    });
    menuAbierto = null;
}

function enrolamientoRemoto() {
    if (dispositivoSeleccionado !== null) {
        const dispositivo = dispositivos[dispositivoSeleccionado];
        mostrarMensaje(`Iniciando enrolamiento remoto en: ${dispositivo.nombre}...`);
        
        // Simular enrolamiento remoto
        setTimeout(() => {
            mostrarMensaje('Modo de enrolamiento remoto activado. El dispositivo está listo para registrar nuevas huellas.');
        }, 1500);
    } else {
        mostrarMensaje('Por favor, seleccione un dispositivo primero', 'error');
    }
    
    // Cerrar menú después de la acción
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
        menu.classList.remove('show');
    });
    menuAbierto = null;
}

function configurarEnrolamiento() {
    if (dispositivoSeleccionado !== null) {
        const dispositivo = dispositivos[dispositivoSeleccionado];
        
        // Simular configuración de enrolamiento
        const configuracion = prompt(
            `Configurar enrolamiento para: ${dispositivo.nombre}\n\n` +
            'Ingrese los parámetros de configuración (separados por coma):\n' +
            'Ej: intentos=3, timeout=30, calidad=alto',
            'intentos=3, timeout=30, calidad=alto'
        );
        
        if (configuracion) {
            mostrarMensaje(`Configuración de enrolamiento actualizada para: ${dispositivo.nombre}`);
        }
    } else {
        mostrarMensaje('Por favor, seleccione un dispositivo primero', 'error');
    }
    
    // Cerrar menú después de la acción
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
        menu.classList.remove('show');
    });
    menuAbierto = null;
}

// ========== MENÚ MANTENIMIENTO ==========

function reiniciarDispositivo() {
    if (dispositivoSeleccionado !== null) {
        const dispositivo = dispositivos[dispositivoSeleccionado];
        if (confirm(`¿Está seguro de que desea reiniciar el dispositivo "${dispositivo.nombre}"?`)) {
            mostrarMensaje(`Reiniciando dispositivo: ${dispositivo.nombre}...`);
            
            // Simular reinicio
            setTimeout(() => {
                // Actualizar estado del dispositivo
                dispositivo.estado = 'activo';
                dispositivo.ultimaConexion = new Date().toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                
                actualizarTabla();
                mostrarMensaje('Dispositivo reiniciado correctamente');
            }, 3000);
        }
    } else {
        mostrarMensaje('Por favor, seleccione un dispositivo primero', 'error');
    }
    
    // Cerrar menú después de la acción
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
        menu.classList.remove('show');
    });
    menuAbierto = null;
}

function actualizarFirmware() {
    if (dispositivoSeleccionado !== null) {
        const dispositivo = dispositivos[dispositivoSeleccionado];
        if (confirm(`¿Actualizar firmware del dispositivo "${dispositivo.nombre}" a la versión más reciente?`)) {
            mostrarMensaje(`Actualizando firmware del dispositivo: ${dispositivo.nombre}...`);
            
            // Simular actualización de firmware
            setTimeout(() => {
                mostrarMensaje('Firmware actualizado correctamente a la versión v2.2.0');
            }, 4000);
        }
    } else {
        mostrarMensaje('Por favor, seleccione un dispositivo primero', 'error');
    }
    
    // Cerrar menú después de la acción
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
        menu.classList.remove('show');
    });
    menuAbierto = null;
}

function descargarInformacion() {
    if (dispositivoSeleccionado !== null) {
        const dispositivo = dispositivos[dispositivoSeleccionado];
        mostrarMensaje(`Descargando información del dispositivo: ${dispositivo.nombre}...`);
        
        // Simular descarga
        setTimeout(() => {
            const blob = new Blob([`Información del dispositivo: ${JSON.stringify(dispositivo, null, 2)}`], 
                { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `info_${dispositivo.nombre.replace(/\s+/g, '_')}.txt`;
            a.click();
            URL.revokeObjectURL(url);
            
            mostrarMensaje('Información descargada correctamente');
        }, 2000);
    } else {
        mostrarMensaje('Por favor, seleccione un dispositivo primero', 'error');
    }
    
    // Cerrar menú después de la acción
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
        menu.classList.remove('show');
    });
    menuAbierto = null;
}

function exportarInformacion() {
    if (dispositivos.length === 0) {
        mostrarMensaje('No hay dispositivos para exportar', 'error');
        return;
    }
    
    // Crear CSV
    const headers = ['Nombre', 'Número Serie', 'IP', 'Área', 'Tipo Sede', 'Estado', 'Última Conexión', 'Tipo Dispositivo'];
    const csvRows = [headers.join(',')];
    
    dispositivos.forEach(dispositivo => {
        const row = [
            `"${dispositivo.nombre}"`,
            `"${dispositivo.numeroSerie}"`,
            dispositivo.direccionIP,
            `"${dispositivo.area}"`,
            dispositivo.tipoSede,
            dispositivo.estado,
            `"${dispositivo.ultimaConexion}"`,
            dispositivo.tipoDispositivo
        ];
        csvRows.push(row.join(','));
    });
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dispositivos_biometrika_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    mostrarMensaje(`Se exportaron ${dispositivos.length} dispositivos correctamente`);
    
    // Cerrar menú después de la acción
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
        menu.classList.remove('show');
    });
    menuAbierto = null;
}

function importarInformacion() {
    // Crear input de archivo
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.style.display = 'none';
    
    input.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const csvData = e.target.result;
                    const lineas = csvData.split('\n').filter(linea => linea.trim() !== '');
                    
                    if (lineas.length > 1) {
                        const dispositivosImportados = lineas.length - 1; // Excluir header
                        mostrarMensaje(`Se importaron ${dispositivosImportados} dispositivos desde el archivo CSV`);
                    } else {
                        mostrarMensaje('El archivo CSV está vacío o no tiene el formato correcto', 'error');
                    }
                } catch (error) {
                    mostrarMensaje('Error al procesar el archivo CSV: ' + error.message, 'error');
                }
            };
            reader.onerror = function() {
                mostrarMensaje('Error al leer el archivo', 'error');
            };
            reader.readAsText(file);
        }
    });
    
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
    
    // Cerrar menú después de la acción
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
        menu.classList.remove('show');
    });
    menuAbierto = null;
}

// ========== INICIALIZACIÓN ==========

document.addEventListener('DOMContentLoaded', function() {
    // Formulario
    formulario.addEventListener('submit', guardarDispositivo);
    
    // Filtros
    btnLimpiarFiltros.addEventListener('click', function() {
        filtroNombre.value = '';
        filtroEstado.value = '';
        filtroTipo.value = '';
        actualizarTabla();
    });
    
    filtroNombre.addEventListener('input', actualizarTabla);
    filtroEstado.addEventListener('change', actualizarTabla);
    filtroTipo.addEventListener('change', actualizarTabla);
    
    // Generar número de serie automático
    inputNombre.addEventListener('blur', function() {
        if (!inputNumeroSerie.value && inputNombre.value) {
            const nombre = inputNombre.value.replace(/\s+/g, '-').toLowerCase();
            const random = Math.random().toString().substr(2, 4);
            inputNumeroSerie.value = `SN-${nombre}-${random}`.toUpperCase();
        }
    });
    
    // Inicializar tabla con datos de ejemplo
    dispositivos = [
        {
            nombre: 'Lector Principal Recepción',
            numeroSerie: 'SN-LECTOR-RECEP-001',
            tipoSede: 'sede',
            area: 'Recepción Principal',
            direccion: 'Planta Baja, Edificio A',
            direccionIP: '192.168.1.100',
            zonaHoraria: 'America/Mexico_City',
            intervalo: 5,
            estado: 'activo',
            tipoDispositivo: 'huella',
            observaciones: 'Dispositivo principal de acceso',
            ultimaConexion: '15/03/2024, 08:15'
        },
        {
            nombre: 'Control Acceso Almacén',
            numeroSerie: 'SN-ALMACEN-002',
            tipoSede: 'almacen',
            area: 'Almacén Central',
            direccion: 'Planta -1, Sector B',
            direccionIP: '192.168.1.101',
            zonaHoraria: 'America/Mexico_City',
            intervalo: 10,
            estado: 'activo',
            tipoDispositivo: 'tarjeta',
            observaciones: 'Control de acceso a zona restringida',
            ultimaConexion: '15/03/2024, 07:45'
        },
        {
            nombre: 'Lector Oficina RH',
            numeroSerie: 'SN-OFICINA-RH-003',
            tipoSede: 'oficina',
            area: 'Recursos Humanos',
            direccion: 'Planta 2, Ala Este',
            direccionIP: '192.168.1.102',
            zonaHoraria: 'America/Mexico_City',
            intervalo: 5,
            estado: 'pausado',
            tipoDispositivo: 'huella',
            observaciones: 'En mantenimiento preventivo',
            ultimaConexion: '14/03/2024, 17:30'
        }
    ];
    
    actualizarTabla();
});