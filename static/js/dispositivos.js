// dispositivos.js - FINAL CON CHECKBOXES

let dispositivos = [];
let editandoIndex = null;

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
const selectModeloDispositivo = document.getElementById('modelo_dispositivo');
const textareaObservaciones = document.getElementById('observaciones');

// ========== FUNCIONES PRINCIPALES ==========

function actualizarTabla() {
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
    
    cuerpoTabla.innerHTML = '';
    
    if (dispositivosFiltrados.length === 0) {
        estadoVacio.style.display = 'block';
        tablaDispositivos.style.display = 'none';
    } else {
        estadoVacio.style.display = 'none';
        tablaDispositivos.style.display = 'table';
        
        dispositivosFiltrados.forEach(dispositivo => {
            const fila = document.createElement('tr');
            fila.setAttribute('data-id', dispositivo.id);
            
            // Tipo de Autenticación
            let tipoTexto = '';
            let tipoIcono = '';
            switch(dispositivo.tipoDispositivo) {
                case 'pin': tipoTexto = 'PIN'; tipoIcono = '<i class="fa-solid fa-keyboard"></i>'; break;
                case 'huella': tipoTexto = 'Huella'; tipoIcono = '<i class="fa-solid fa-fingerprint"></i>'; break;
                case 'tarjeta': tipoTexto = 'Tarjeta'; tipoIcono = '<i class="fa-solid fa-credit-card"></i>'; break;
                case 'pin_huella': tipoTexto = 'PIN + Huella'; tipoIcono = '<i class="fa-solid fa-keyboard"></i> + <i class="fa-solid fa-fingerprint"></i>'; break;
                case 'pin_tarjeta': tipoTexto = 'PIN + Tarjeta'; tipoIcono = '<i class="fa-solid fa-keyboard"></i> + <i class="fa-solid fa-credit-card"></i>'; break;
                case 'huella_tarjeta': tipoTexto = 'Huella + Tarjeta'; tipoIcono = '<i class="fa-solid fa-fingerprint"></i> + <i class="fa-solid fa-credit-card"></i>'; break;
                default: tipoTexto = dispositivo.tipoDispositivo; tipoIcono = '<i class="fa-solid fa-microchip"></i>';
            }
            
            // Modelo
            let modeloTexto = dispositivo.modeloDispositivo === 'reloj_ip65' ? 'Reloj IP65' : 'Molinete ZK TS2022';
            let modeloIcono = '<i class="fa-solid fa-microchip"></i>';
            
            // Estado
            let estadoTexto = '';
            let estadoIcono = '';
            let estadoClase = '';
            switch(dispositivo.estado) {
                case 'activo': estadoTexto = 'Activo'; estadoIcono = '<i class="fa-solid fa-check-circle"></i>'; estadoClase = 'badge-activo'; break;
                case 'pausado': estadoTexto = 'Pausado'; estadoIcono = '<i class="fa-solid fa-pause-circle"></i>'; estadoClase = 'badge-pausado'; break;
                case 'error': estadoTexto = 'Error'; estadoIcono = '<i class="fa-solid fa-exclamation-circle"></i>'; estadoClase = 'badge-error'; break;
                case 'sin_conexion': estadoTexto = 'Sin conexion'; estadoIcono = '<i class="fa-solid fa-wifi"></i>'; estadoClase = 'badge-sin_conexion'; break;
                default: estadoTexto = 'Apagado'; estadoIcono = '<i class="fa-solid fa-power-off"></i>'; estadoClase = 'badge-apagado';
            }
            
            fila.innerHTML = `
                <td class="checkbox-cell">
                    <input type="checkbox" class="checkbox-dispositivo" data-id="${dispositivo.id}" data-nombre="${dispositivo.nombre}" onchange="actualizarContadorSeleccionados()">
                </td>
                <td><strong>${dispositivo.nombre}</strong></td>
                <td>${dispositivo.numeroSerie}</td>
                <td>${dispositivo.direccionIP}</td>
                <td>${dispositivo.area}</td>
                <td>${dispositivo.tipoSede}</td>
                <td><span class="badge-modelo">${modeloIcono} ${modeloTexto}</span></td>
                <td><span class="badge-tipo">${tipoIcono} ${tipoTexto}</span></td>
                <td><span class="badge-estado ${estadoClase}">${estadoIcono} ${estadoTexto}</span></td>
                <td>${dispositivo.ultimaConexion}</td>
                <td class="acciones">
                    <button class="btn-accion btn-editar" onclick="editarDispositivo(${dispositivo.id})">
                        <i class="fa-solid fa-pen"></i> Editar
                    </button>
                    <button class="btn-accion btn-eliminar" onclick="eliminarDispositivo(${dispositivo.id})">
                        <i class="fa-solid fa-trash"></i> Eliminar
                    </button>
                </td>
            `;
            cuerpoTabla.appendChild(fila);
        });
        
        actualizarContadorSeleccionados();
    }
}

function guardarDispositivo(e) {
    e.preventDefault();
    
    const datosDispositivo = {
        nombre: inputNombre.value.trim(),
        numero_serie: inputNumeroSerie.value.trim(),
        tipo_sede: selectTipoSede.value,
        area: inputArea.value.trim(),
        direccion: inputDireccion.value.trim(),
        direccion_ip: inputDireccionIP.value.trim(),
        zona_horaria: selectZonaHoraria.value,
        intervalo: inputIntervalo.value || 5,
        estado: selectEstado.value,
        tipo_dispositivo: selectTipoDispositivo.value,
        modelo_dispositivo: selectModeloDispositivo.value,
        observaciones: textareaObservaciones.value.trim()
    };
    
    if (!datosDispositivo.nombre || !datosDispositivo.numero_serie || !datosDispositivo.tipo_sede || 
        !datosDispositivo.area || !datosDispositivo.direccion_ip || !datosDispositivo.zona_horaria || !datosDispositivo.estado) {
        mostrarMensaje('Complete todos los campos obligatorios', 'error');
        return;
    }
    
    const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
    if (!ipRegex.test(datosDispositivo.direccion_ip)) {
        mostrarMensaje('IP valida requerida', 'error');
        return;
    }
    
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value || getCookie('csrftoken');
    const url = editandoIndex ? `/dispositivos/api/dispositivos/${editandoIndex}/` : '/dispositivos/api/dispositivos/';
    const method = editandoIndex ? 'PUT' : 'POST';
    
    fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken },
        body: JSON.stringify(datosDispositivo)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            mostrarMensaje(editandoIndex ? 'Dispositivo actualizado' : 'Dispositivo registrado');
            limpiarFormulario();
            cargarDispositivos();
        } else {
            mostrarMensaje(`Error: ${data.error}`, 'error');
        }
    })
    .catch(error => mostrarMensaje('Error en la operacion', 'error'));
}

function limpiarFormulario() {
    formulario.reset();
    btnCancelar.style.display = 'none';
    formTitle.textContent = 'Nuevo Dispositivo';
    editandoIndex = null;
}

function editarDispositivo(dispositivoId) {
    const dispositivo = dispositivos.find(d => d.id === dispositivoId);
    if (!dispositivo) return mostrarMensaje('Dispositivo no encontrado', 'error');
    
    inputNombre.value = dispositivo.nombre;
    inputNumeroSerie.value = dispositivo.numeroSerie;
    selectTipoSede.value = dispositivo.tipoSede;
    inputArea.value = dispositivo.area;
    inputDireccion.value = dispositivo.direccion || '';
    inputDireccionIP.value = dispositivo.direccionIP;
    selectZonaHoraria.value = dispositivo.zonaHoraria;
    inputIntervalo.value = dispositivo.intervalo;
    selectEstado.value = dispositivo.estado;
    selectTipoDispositivo.value = dispositivo.tipoDispositivo;
    selectModeloDispositivo.value = dispositivo.modeloDispositivo;
    textareaObservaciones.value = dispositivo.observaciones || '';
    
    editandoIndex = dispositivoId;
    btnCancelar.style.display = 'inline-flex';
    formTitle.textContent = 'Editar Dispositivo';
    document.querySelector('.form-panel').scrollIntoView({ behavior: 'smooth' });
    mostrarMensaje(`Editando: ${dispositivo.nombre}`);
}

function eliminarDispositivo(dispositivoId) {
    if (!confirm('¿Eliminar este dispositivo?')) return;
    
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value || getCookie('csrftoken');
    
    fetch(`/dispositivos/api/dispositivos/${dispositivoId}/`, {
        method: 'DELETE',
        headers: { 'X-CSRFToken': csrfToken }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            mostrarMensaje('Dispositivo eliminado');
            if (editandoIndex === dispositivoId) limpiarFormulario();
            cargarDispositivos();
        } else {
            mostrarMensaje(`Error: ${data.error}`, 'error');
        }
    })
    .catch(error => mostrarMensaje('Error al eliminar', 'error'));
}

function nuevoDispositivo() {
    limpiarFormulario();
    mostrarMensaje('Nuevo dispositivo');
}

function mostrarMensaje(mensaje, tipo = 'success') {
    const msgDiv = document.getElementById('mensaje-exito');
    const msgText = document.getElementById('mensaje-texto');
    msgText.textContent = mensaje;
    
    if (tipo === 'error') {
        msgDiv.style.background = '#f8d7da';
        msgDiv.style.borderLeftColor = '#dc3545';
        msgDiv.style.color = '#721c24';
        msgDiv.querySelector('i').className = 'fa-solid fa-exclamation-circle';
    } else {
        msgDiv.style.background = '#d4edda';
        msgDiv.style.borderLeftColor = '#28a745';
        msgDiv.style.color = '#155724';
        msgDiv.querySelector('i').className = 'fa-solid fa-check';
    }
    
    msgDiv.classList.add('mostrar');
    setTimeout(() => msgDiv.classList.remove('mostrar'), 3000);
}

// ========== MENU DESPLEGABLE ==========
let menuAbierto = null;

function toggleDropdown(menuId) {
    const menu = document.getElementById(menuId);
    if (menuAbierto === menuId) {
        menu.classList.remove('show');
        menuAbierto = null;
        return;
    }
    document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove('show'));
    menu.classList.add('show');
    menuAbierto = menuId;
}

document.addEventListener('click', function(e) {
    if (!e.target.closest('.dropdown-group')) {
        document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove('show'));
        menuAbierto = null;
    }
});

// ========== FUNCIONES CON CHECKBOX ==========

function obtenerSeleccionados() {
    const checkboxes = document.querySelectorAll('.checkbox-dispositivo:checked');
    return Array.from(checkboxes).map(cb => ({
        id: parseInt(cb.getAttribute('data-id')),
        nombre: cb.getAttribute('data-nombre')
    }));
}

function actualizarContadorSeleccionados() {
    const seleccionados = obtenerSeleccionados();
    const contador = seleccionados.length;
    const footer = document.getElementById('selection-footer');
    const contadorSpan = document.getElementById('contador-seleccionados');
    
    if (contadorSpan) contadorSpan.textContent = contador;
    if (footer) footer.style.display = contador > 0 ? 'flex' : 'none';
    
    // Resaltar filas seleccionadas
    document.querySelectorAll('tbody tr').forEach(row => {
        const checkbox = row.querySelector('.checkbox-dispositivo');
        if (checkbox && checkbox.checked) {
            row.classList.add('seleccionado');
        } else {
            row.classList.remove('seleccionado');
        }
    });
    
    // Actualizar checkbox "Seleccionar todos"
    const totalCheckboxes = document.querySelectorAll('.checkbox-dispositivo').length;
    const checkboxesMarcados = document.querySelectorAll('.checkbox-dispositivo:checked').length;
    const checkboxTodos = document.getElementById('checkbox-seleccionar-todos');
    
    if (checkboxTodos) {
        if (totalCheckboxes > 0 && checkboxesMarcados === totalCheckboxes) {
            checkboxTodos.checked = true;
            checkboxTodos.indeterminate = false;
        } else if (checkboxesMarcados > 0 && checkboxesMarcados < totalCheckboxes) {
            checkboxTodos.checked = false;
            checkboxTodos.indeterminate = true;
        } else {
            checkboxTodos.checked = false;
            checkboxTodos.indeterminate = false;
        }
    }
}

function toggleSeleccionarTodos(checkbox) {
    document.querySelectorAll('.checkbox-dispositivo').forEach(cb => {
        cb.checked = checkbox.checked;
    });
    actualizarContadorSeleccionados();
}

function seleccionarTodos() {
    document.querySelectorAll('.checkbox-dispositivo').forEach(cb => cb.checked = true);
    actualizarContadorSeleccionados();
}

function deseleccionarTodos() {
    document.querySelectorAll('.checkbox-dispositivo').forEach(cb => cb.checked = false);
    actualizarContadorSeleccionados();
}

function eliminarSeleccionados() {
    const seleccionados = obtenerSeleccionados();
    
    if (seleccionados.length === 0) {
        mostrarMensaje('No hay dispositivos seleccionados', 'error');
        return;
    }
    
    if (!confirm(`¿Eliminar ${seleccionados.length} dispositivo(s) seleccionado(s)?`)) return;
    
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value || getCookie('csrftoken');
    let eliminados = 0;
    let errores = 0;
    
    const promesas = seleccionados.map(disp => {
        return fetch(`/dispositivos/api/dispositivos/${disp.id}/`, {
            method: 'DELETE',
            headers: { 'X-CSRFToken': csrfToken }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) eliminados++;
            else errores++;
        })
        .catch(() => errores++);
    });
    
    Promise.all(promesas).then(() => {
        mostrarMensaje(`✅ Eliminados: ${eliminados} | ❌ Errores: ${errores}`);
        if (editandoIndex && seleccionados.some(s => s.id === editandoIndex)) limpiarFormulario();
        cargarDispositivos();
    });
}

function leerInformacionSeleccionado() {
    const seleccionados = obtenerSeleccionados();
    
    if (seleccionados.length === 0) {
        mostrarMensaje('Seleccione al menos un dispositivo', 'error');
        return;
    }
    
    if (seleccionados.length > 1) {
        mostrarMensaje('Seleccione solo un dispositivo para leer información', 'error');
        return;
    }
    
    const dispositivo = seleccionados[0];
    mostrarMensaje(`Leyendo información de ${dispositivo.nombre}...`);
    
    fetch(`/dispositivos/api/acciones/${dispositivo.id}/leer-info/`, {
        method: 'POST',
        headers: { 'X-CSRFToken': getCookie('csrftoken') }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const info = data.info;
            alert(`INFORMACION DEL DISPOSITIVO\n\n` +
                  `Nombre: ${info.nombre}\n` +
                  `Serie: ${info.numero_serie}\n` +
                  `IP: ${info.ip}\n` +
                  `Estado: ${info.estado}\n` +
                  `Tipo: ${info.tipo}\n` +
                  `Modelo: ${info.modelo}\n` +
                  `Ultima conexion: ${info.ultima_conexion}\n` +
                  `Firmware: ${info.firmware}`);
            mostrarMensaje('Informacion leida');
        } else {
            mostrarMensaje(`Error: ${data.error}`, 'error');
        }
    })
    .catch(error => mostrarMensaje('Error al leer informacion', 'error'));
    
    cerrarMenus();
}

function enrolamientoRemoto() {
    const seleccionados = obtenerSeleccionados();
    
    if (seleccionados.length === 0) {
        mostrarMensaje('Seleccione al menos un dispositivo', 'error');
        return;
    }
    
    const disp = seleccionados[0];
    const tiposConHuella = ['huella', 'pin_huella', 'huella_tarjeta'];
    
    if (!tiposConHuella.includes(disp.tipoDispositivo)) {
        mostrarMensaje('Este dispositivo no soporta enrolamiento de huellas', 'error');
        return;
    }
    
    mostrarMensaje(`Activando enrolamiento en ${disp.nombre}...`);
    
    fetch(`/dispositivos/api/acciones/${disp.id}/enrolamiento/`, {
        method: 'POST',
        headers: { 'X-CSRFToken': getCookie('csrftoken') }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) mostrarMensaje(data.message);
        else mostrarMensaje(`Error: ${data.error}`, 'error');
    })
    .catch(error => mostrarMensaje('Error en enrolamiento', 'error'));
    
    cerrarMenus();
}

function configurarEnrolamiento() {
    const seleccionados = obtenerSeleccionados();
    
    if (seleccionados.length === 0) {
        mostrarMensaje('Seleccione al menos un dispositivo', 'error');
        return;
    }
    
    const disp = seleccionados[0];
    const tiposConHuella = ['huella', 'pin_huella', 'huella_tarjeta'];
    
    if (!tiposConHuella.includes(disp.tipoDispositivo)) {
        mostrarMensaje('Este dispositivo no soporta configuración de enrolamiento', 'error');
        return;
    }
    
    const config = prompt('Configuracion de enrolamiento:\nEj: intentos=3, timeout=30, calidad=alto', 'intentos=3, timeout=30, calidad=alto');
    if (!config) return;
    
    mostrarMensaje(`Configurando enrolamiento en ${disp.nombre}...`);
    
    fetch(`/dispositivos/api/acciones/${disp.id}/configurar-enrolamiento/`, {
        method: 'POST',
        headers: { 'X-CSRFToken': getCookie('csrftoken'), 'Content-Type': 'application/json' },
        body: JSON.stringify({ configuracion: config })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) mostrarMensaje(data.message);
        else mostrarMensaje(`Error: ${data.error}`, 'error');
    })
    .catch(error => mostrarMensaje('Error en configuracion', 'error'));
    
    cerrarMenus();
}

function reiniciarDispositivo() {
    const seleccionados = obtenerSeleccionados();
    
    if (seleccionados.length === 0) {
        mostrarMensaje('Seleccione al menos un dispositivo', 'error');
        return;
    }
    
    const disp = seleccionados[0];
    if (!confirm(`¿Reiniciar ${disp.nombre}?`)) return;
    
    mostrarMensaje(`Reiniciando ${disp.nombre}...`);
    
    fetch(`/dispositivos/api/acciones/${disp.id}/reiniciar/`, {
        method: 'POST',
        headers: { 'X-CSRFToken': getCookie('csrftoken') }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            mostrarMensaje(data.message);
            cargarDispositivos();
        } else {
            mostrarMensaje(`Error: ${data.error}`, 'error');
        }
    })
    .catch(error => mostrarMensaje('Error al reiniciar', 'error'));
    
    cerrarMenus();
}

function actualizarFirmware() {
    const seleccionados = obtenerSeleccionados();
    
    if (seleccionados.length === 0) {
        mostrarMensaje('Seleccione al menos un dispositivo', 'error');
        return;
    }
    
    const disp = seleccionados[0];
    if (!confirm(`¿Actualizar firmware de ${disp.nombre}?`)) return;
    
    mostrarMensaje(`Actualizando firmware de ${disp.nombre}...`);
    
    fetch(`/dispositivos/api/acciones/${disp.id}/actualizar-firmware/`, {
        method: 'POST',
        headers: { 'X-CSRFToken': getCookie('csrftoken') }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) mostrarMensaje(data.message);
        else mostrarMensaje(`Error: ${data.error}`, 'error');
    })
    .catch(error => mostrarMensaje('Error al actualizar', 'error'));
    
    cerrarMenus();
}

function descargarInformacionSeleccionado() {
    const seleccionados = obtenerSeleccionados();
    
    if (seleccionados.length === 0) {
        mostrarMensaje('Seleccione un dispositivo', 'error');
        return;
    }
    
    const dispositivo = seleccionados[0];
    const dispData = dispositivos.find(d => d.id === dispositivo.id);
    if (!dispData) return;
    
    let modeloTexto = dispData.modeloDispositivo === 'reloj_ip65' ? 'Reloj IP65' : 'Molinete ZK TS2022';
    
    const info = `INFORMACION DEL DISPOSITIVO
===================
Nombre: ${dispData.nombre}
Numero de Serie: ${dispData.numeroSerie}
Direccion IP: ${dispData.direccionIP}
Area: ${dispData.area}
Tipo de Sede: ${dispData.tipoSede}
Modelo: ${modeloTexto}
Tipo Autenticacion: ${dispData.tipoDispositivo}
Estado: ${dispData.estado}
Ultima Conexion: ${dispData.ultimaConexion}
Observaciones: ${dispData.observaciones || 'Ninguna'}`;
    
    const blob = new Blob([info], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dispositivo_${dispData.nombre.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    mostrarMensaje('Informacion descargada');
    cerrarMenus();
}

function modificarSeleccionado() {
    const seleccionados = obtenerSeleccionados();
    
    if (seleccionados.length === 0) {
        mostrarMensaje('Seleccione un dispositivo para modificar', 'error');
        return;
    }
    
    if (seleccionados.length > 1) {
        mostrarMensaje('Seleccione solo un dispositivo para modificar', 'error');
        return;
    }
    
    editarDispositivo(seleccionados[0].id);
    cerrarMenus();
}

function borrarSeleccionado() {
    const seleccionados = obtenerSeleccionados();
    
    if (seleccionados.length === 0) {
        mostrarMensaje('Seleccione al menos un dispositivo', 'error');
        return;
    }
    
    eliminarSeleccionados();
    cerrarMenus();
}

function cargarModelosManual() {
    const seleccionados = obtenerSeleccionados();
    
    if (seleccionados.length === 0) {
        mostrarMensaje('Seleccione un dispositivo', 'error');
        return;
    }
    
    if (seleccionados.length > 1) {
        mostrarMensaje('Seleccione solo un dispositivo para cargar modelos', 'error');
        return;
    }
    
    const dispositivo = dispositivos.find(d => d.id === seleccionados[0].id);
    if (!dispositivo) return;
    
    const tiposConHuella = ['huella', 'pin_huella', 'huella_tarjeta'];
    if (!tiposConHuella.includes(dispositivo.tipoDispositivo)) {
        mostrarMensaje('Este dispositivo no soporta carga de modelos', 'error');
        return;
    }
    
    window.dispositivoParaModelos = dispositivo;
    document.getElementById('modal-dispositivo-nombre').textContent = dispositivo.nombre;
    window.archivosModelos = [];
    actualizarListaModelosModal();
    document.getElementById('modal-cargar-modelos').style.display = 'flex';
    cerrarMenus();
}

function exportarInformacion() {
    if (dispositivos.length === 0) {
        mostrarMensaje('No hay dispositivos', 'error');
        return;
    }
    
    const headers = ['ID', 'Nombre', 'Serie', 'IP', 'Area', 'Tipo Sede', 'Modelo', 'Tipo Autenticacion', 'Estado', 'Ultima Conexion'];
    const rows = [headers.join(',')];
    
    dispositivos.forEach(d => {
        let modeloTexto = d.modeloDispositivo === 'reloj_ip65' ? 'Reloj IP65' : 'Molinete ZK TS2022';
        rows.push([
            d.id, `"${d.nombre}"`, `"${d.numeroSerie}"`, d.direccionIP, `"${d.area}"`,
            d.tipoSede, modeloTexto, d.tipoDispositivo, d.estado, `"${d.ultimaConexion}"`
        ].join(','));
    });
    
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dispositivos_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    mostrarMensaje(`Exportados ${dispositivos.length} dispositivos`);
    cerrarMenus();
}

function importarInformacion() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = async (ev) => {
            const content = ev.target.result;
            const lineas = content.split('\n').filter(l => l.trim());
            
            if (lineas.length <= 1) {
                mostrarMensaje('Archivo vacío', 'error');
                return;
            }
            
            const encabezados = lineas[0].split(',').map(h => h.replace(/^"|"$/g, '').trim().toLowerCase());
            const datosLineas = lineas.slice(1);
            let importados = 0, errores = 0;
            const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value || getCookie('csrftoken');
            
            for (let i = 0; i < datosLineas.length; i++) {
                const linea = datosLineas[i];
                if (!linea.trim()) continue;
                
                const columnas = [];
                let enComillas = false, valorActual = '';
                for (let char of linea) {
                    if (char === '"') enComillas = !enComillas;
                    else if (char === ',' && !enComillas) {
                        columnas.push(valorActual.trim());
                        valorActual = '';
                    } else valorActual += char;
                }
                columnas.push(valorActual.trim());
                
                const dispositivo = {};
                encabezados.forEach((enc, idx) => {
                    dispositivo[enc] = columnas[idx] ? columnas[idx].replace(/^"|"$/g, '').trim() : '';
                });
                
                if (!dispositivo['nombre'] || !dispositivo['numero serie']) {
                    errores++;
                    continue;
                }
                
                const datosAPI = {
                    nombre: dispositivo['nombre'],
                    numero_serie: dispositivo['numero serie'],
                    direccion_ip: dispositivo['ip'] || '192.168.1.1',
                    area: dispositivo['area'] || 'Sin area',
                    tipo_sede: dispositivo['tipo sede'] || 'area',
                    tipo_dispositivo: dispositivo['autenticacion'] || 'pin_huella',
                    modelo_dispositivo: dispositivo['modelo'] || 'reloj_ip65',
                    estado: dispositivo['estado'] || 'activo',
                    observaciones: dispositivo['observaciones'] || '',
                    zona_horaria: 'America/Buenos_Aires',
                    intervalo: 5,
                    direccion: ''
                };
                
                try {
                    const response = await fetch('/dispositivos/api/dispositivos/', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken },
                        body: JSON.stringify(datosAPI)
                    });
                    const result = await response.json();
                    if (result.success) importados++;
                    else errores++;
                } catch (error) {
                    errores++;
                }
            }
            
            mostrarMensaje(`✅ Importados: ${importados} | ❌ Errores: ${errores}`);
            cargarDispositivos();
        };
        reader.readAsText(file, 'UTF-8');
    };
    input.click();
    cerrarMenus();
}

function actualizarListado() {
    cargarDispositivos();
    mostrarMensaje('Listado actualizado');
    cerrarMenus();
}

function cerrarMenus() {
    document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove('show'));
    menuAbierto = null;
}

// ========== MODAL PARA MODELOS ==========

let archivosModelos = [];

function cerrarModalCargarModelos() {
    document.getElementById('modal-cargar-modelos').style.display = 'none';
    archivosModelos = [];
    window.dispositivoParaModelos = null;
}

function inicializarModal() {
    const uploadArea = document.getElementById('uploadAreaModal');
    const fileInput = document.getElementById('modelos_file_input');
    const btnSelect = document.getElementById('btn-select-files-modal');
    const btnSubir = document.getElementById('btn-subir-modelos');
    
    if (!uploadArea) return;
    
    uploadArea.onclick = () => fileInput.click();
    btnSelect.onclick = (e) => { e.stopPropagation(); fileInput.click(); };
    
    fileInput.onchange = (e) => {
        archivosModelos = [...archivosModelos, ...Array.from(e.target.files)];
        actualizarListaModelosModal();
        fileInput.value = '';
    };
    
    uploadArea.ondragover = (e) => { e.preventDefault(); uploadArea.classList.add('drag-over'); };
    uploadArea.ondragleave = () => uploadArea.classList.remove('drag-over');
    uploadArea.ondrop = (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        archivosModelos = [...archivosModelos, ...Array.from(e.dataTransfer.files)];
        actualizarListaModelosModal();
    };
    
    btnSubir.onclick = () => {
        if (archivosModelos.length === 0) {
            mostrarMensaje('Seleccione archivos', 'error');
            return;
        }
        
        const formData = new FormData();
        archivosModelos.forEach((f, i) => formData.append(`modelo_${i}`, f));
        formData.append('dispositivo_id', window.dispositivoParaModelos.id);
        
        mostrarMensaje('Subiendo modelos...');
        
        fetch('/dispositivos/api/cargar-modelos/', {
            method: 'POST',
            headers: { 'X-CSRFToken': getCookie('csrftoken') },
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                mostrarMensaje(`${data.modelos_cargados} modelo(s) cargado(s)`);
                cerrarModalCargarModelos();
                cargarDispositivos();
            } else {
                mostrarMensaje(`Error: ${data.error}`, 'error');
            }
        })
        .catch(() => mostrarMensaje('Error al subir', 'error'));
    };
}

function actualizarListaModelosModal() {
    const container = document.getElementById('lista-modelos-modal');
    if (!container) return;
    
    if (archivosModelos.length === 0) {
        container.innerHTML = '';
        return;
    }
    
    container.innerHTML = archivosModelos.map((file, idx) => `
        <div class="modelo-item-modal">
            <div class="modelo-info-modal">
                <i class="fa-solid fa-fingerprint"></i>
                <div>
                    <div class="modelo-nombre">${file.name}</div>
                    <div class="modelo-tamano">${(file.size / 1024).toFixed(1)} KB</div>
                </div>
            </div>
            <button class="btn-remover-modelo-modal" onclick="removerModeloModal(${idx})">
                <i class="fa-solid fa-trash-can"></i>
            </button>
        </div>
    `).join('');
}

function removerModeloModal(index) {
    archivosModelos.splice(index, 1);
    actualizarListaModelosModal();
}

// ========== CARGAR DATOS ==========

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

function cargarDispositivos() {
    fetch('/dispositivos/api/dispositivos/')
        .then(res => res.json())
        .then(data => {
            dispositivos = data.map(d => ({
                id: d.id,
                nombre: d.nombre,
                numeroSerie: d.numero_serie,
                tipoSede: d.tipo_sede === 'sede' ? 'Sede Principal' : 
                          d.tipo_sede === 'oficina' ? 'Oficina' :
                          d.tipo_sede === 'area' ? 'Area Especifica' : 'Almacen',
                area: d.area,
                direccion: d.direccion || '',
                direccionIP: d.direccion_ip,
                zonaHoraria: d.zona_horaria,
                intervalo: d.intervalo_solicitud || 5,
                estado: d.estado,
                tipoDispositivo: d.tipo_dispositivo,
                modeloDispositivo: d.modelo_dispositivo,
                observaciones: d.observaciones || '',
                ultimaConexion: d.ultima_conexion || 'Nunca'
            }));
            actualizarTabla();
        })
        .catch(error => mostrarMensaje('Error al cargar datos', 'error'));
}

// ========== INICIALIZACION ==========

document.addEventListener('DOMContentLoaded', () => {
    formulario.addEventListener('submit', guardarDispositivo);
    btnCancelar.addEventListener('click', limpiarFormulario);
    btnNuevo.addEventListener('click', nuevoDispositivo);
    if (btnAgregarPrimero) btnAgregarPrimero.addEventListener('click', nuevoDispositivo);
    
    btnLimpiarFiltros.addEventListener('click', () => {
        filtroNombre.value = '';
        filtroEstado.value = '';
        filtroTipo.value = '';
        actualizarTabla();
    });
    
    filtroNombre.addEventListener('input', actualizarTabla);
    filtroEstado.addEventListener('change', actualizarTabla);
    filtroTipo.addEventListener('change', actualizarTabla);
    
    inputNombre.addEventListener('blur', () => {
        if (!inputNumeroSerie.value && inputNombre.value) {
            const nombre = inputNombre.value.replace(/\s+/g, '-').toLowerCase();
            inputNumeroSerie.value = `SN-${nombre}-${Math.random().toString(36).substr(2, 4)}`.toUpperCase();
        }
    });
    
    cargarDispositivos();
    inicializarModal();
});