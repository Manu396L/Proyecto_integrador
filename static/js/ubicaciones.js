// ubicaciones.js - COMPLETO CON CHECKBOXES Y SELECCIÓN MÚLTIPLE

let ubicaciones = [];
let sedesCache = [];
let areasCache = [];
let editandoId = null;
let editandoTipo = null;

// Elementos DOM
const cuerpoTabla = document.getElementById('cuerpoTabla');
const estadoVacio = document.getElementById('estado-vacio');
const tablaUbicaciones = document.getElementById('tablaUbicaciones');
const btnGuardar = document.getElementById('btn-guardar');
const btnCancelar = document.getElementById('btn-cancelar');
const btnNuevo = document.getElementById('btn-nuevo');
const btnAgregarPrimero = document.getElementById('btn-agregar-primero');
const btnLimpiarFiltros = document.getElementById('btn-limpiar-filtros');
const formTitle = document.getElementById('form-title');
const mensajeTexto = document.getElementById('mensaje-texto');

// Elementos de filtro
const filtroNombre = document.getElementById('filtro-nombre');
const filtroTipo = document.getElementById('filtro-tipo');
const filtroDispositivo = document.getElementById('filtro-dispositivo');
const filtroSeguridad = document.getElementById('filtro-seguridad');
const seccionFiltros = document.getElementById('filtros');

// Elementos del formulario
const formulario = document.getElementById('formularioUbicacion');
const inputCodigo = document.getElementById('codigo_unico');
const inputNombre = document.getElementById('nombre_sede');
const selectTipo = document.getElementById('tipo_ubicacion');
const selectDispositivo = document.getElementById('dispositivo_biometrico');
const selectSeguridad = document.getElementById('nivel_seguridad');
const inputDireccion = document.getElementById('direccion');
const grupoSede = document.getElementById('grupo-sede');
const selectSedePadre = document.getElementById('sede_padre');
const grupoPiso = document.getElementById('grupo-piso');
const inputPiso = document.getElementById('piso');

// Elementos del dropdown
const dropdownMenuButton = document.getElementById('dropdownMenuButton');
const dropdownMenu = document.getElementById('dropdownMenu');
const opcionFiltros = document.getElementById('opcion-filtros');
const opcionRefresh = document.getElementById('opcion-refresh');

// ===== FUNCIONES PRINCIPALES =====

function mostrarOpcionesPorTipo() {
    const tipo = selectTipo.value;
    if (tipo === 'sede') {
        grupoSede.style.display = 'none';
        grupoPiso.style.display = 'none';
        inputDireccion.required = false;
    } else if (tipo === 'area') {
        grupoSede.style.display = 'block';
        grupoPiso.style.display = 'block';
        cargarSedesEnSelect();
        inputDireccion.required = false;
    }
}

function cargarSedesEnSelect() {
    fetch('/sedes/api/sedes/')
        .then(response => response.json())
        .then(data => {
            selectSedePadre.innerHTML = '<option value="" disabled selected>Seleccione una sede</option>';
            data.forEach(sede => {
                selectSedePadre.innerHTML += `<option value="${sede.id}">${sede.nombre}</option>`;
            });
        })
        .catch(error => console.error('Error cargando sedes:', error));
}

async function cargarUbicaciones() {
    try {
        const respSedes = await fetch('/sedes/api/sedes/');
        sedesCache = await respSedes.json();
        
        const respAreas = await fetch('/sedes/api/areas/');
        areasCache = await respAreas.json();
        
        ubicaciones = [];
        
        sedesCache.forEach(sede => {
            const areasDelaSede = areasCache.filter(a => a.sede_id === sede.id);
            let nivelSede = 'bajo';
            if (areasDelaSede.length > 0) {
                const niveles = areasDelaSede.map(a => a.nivel_seguridad || 'bajo');
                if (niveles.includes('alto')) nivelSede = 'alto';
                else if (niveles.includes('medio')) nivelSede = 'medio';
                else nivelSede = 'bajo';
            }
            
            ubicaciones.push({
                id: sede.id,
                tipo: 'sede',
                codigo: sede.nombre,
                nombre: sede.nombre,
                direccion: sede.direccion,
                dispositivo: 'acceso_general',
                seguridad: nivelSede,
                activo: true
            });
        });
        
        areasCache.forEach(area => {
            ubicaciones.push({
                id: area.id,
                tipo: 'area',
                codigo: area.codigo_acceso || area.nombre,
                nombre: area.nombre,
                piso: area.piso,
                sede_id: area.sede_id,
                sede_nombre: area.sede_nombre,
                dispositivo: area.dispositivo_biometrico || 'huella',
                seguridad: area.nivel_seguridad || 'bajo'
            });
        });
        
        actualizarTabla();
        
        if (ubicaciones.length === 0) {
            estadoVacio.style.display = 'block';
            tablaUbicaciones.style.display = 'none';
        }
    } catch (error) {
        console.error('Error cargando ubicaciones:', error);
        mostrarMensaje('Error al cargar ubicaciones', 'error');
    }
}

function actualizarTabla() {
    let ubicacionesFiltradas = ubicaciones;
    
    if (filtroNombre.value) {
        const busqueda = filtroNombre.value.toLowerCase();
        ubicacionesFiltradas = ubicacionesFiltradas.filter(u => 
            u.nombre.toLowerCase().includes(busqueda) || 
            u.codigo.toLowerCase().includes(busqueda)
        );
    }
    
    if (filtroTipo.value) {
        ubicacionesFiltradas = ubicacionesFiltradas.filter(u => u.tipo === filtroTipo.value);
    }
    
    if (filtroDispositivo.value) {
        ubicacionesFiltradas = ubicacionesFiltradas.filter(u => u.dispositivo === filtroDispositivo.value);
    }
    
    if (filtroSeguridad.value) {
        ubicacionesFiltradas = ubicacionesFiltradas.filter(u => u.seguridad === filtroSeguridad.value);
    }
    
    cuerpoTabla.innerHTML = '';
    
    if (ubicacionesFiltradas.length === 0) {
        estadoVacio.style.display = 'block';
        tablaUbicaciones.style.display = 'none';
    } else {
        estadoVacio.style.display = 'none';
        tablaUbicaciones.style.display = 'table';
        
        ubicacionesFiltradas.forEach(ubicacion => {
            const fila = document.createElement('tr');
            fila.setAttribute('data-id', ubicacion.id);
            fila.setAttribute('data-tipo', ubicacion.tipo);
            
            const tipoTexto = ubicacion.tipo === 'sede' ? 'Sede' : 'Área';
            const tipoBadgeClass = ubicacion.tipo === 'sede' ? 'badge-sede' : 'badge-area';
            
            const dispositivoTexto = {
                'huella': 'Huella',
                'Tarjeta': 'Tarjeta',
                'PIN': 'PIN',
                'acceso_general': 'Acceso General'
            }[ubicacion.dispositivo] || ubicacion.dispositivo;
            
            const seguridadTexto = {
                'bajo': 'Bajo',
                'medio': 'Medio',
                'alto': 'Alto'
            }[ubicacion.seguridad] || ubicacion.seguridad;
            
            const seguridadBadgeClass = {
                'bajo': 'badge-bajo',
                'medio': 'badge-medio',
                'alto': 'badge-alto'
            }[ubicacion.seguridad] || '';
            
            fila.innerHTML = `
                <td class="checkbox-cell">
                    <input type="checkbox" class="checkbox-ubicacion" data-id="${ubicacion.id}" data-tipo="${ubicacion.tipo}" data-nombre="${ubicacion.nombre}" onchange="actualizarContadorSeleccionados()">
                </td>
                <td>${ubicacion.codigo}</td>
                <td><strong>${ubicacion.nombre}</strong></td>
                <td><span class="badge-tipo ${tipoBadgeClass}">${tipoTexto}</span></td>
                <td>${dispositivoTexto}</td>
                <td><span class="badge-seguridad ${seguridadBadgeClass}">${seguridadTexto}</span></td>
                <td class="acciones">
                    <button class="btn-accion btn-editar" onclick="editarUbicacion('${ubicacion.tipo}', ${ubicacion.id})">
                        <i class="fa-solid fa-pen"></i> Editar
                    </button>
                    <button class="btn-accion btn-eliminar" onclick="eliminarUbicacion('${ubicacion.tipo}', ${ubicacion.id})">
                        <i class="fa-solid fa-trash"></i> Eliminar
                    </button>
                </td>
            `;
            
            cuerpoTabla.appendChild(fila);
        });
        
        actualizarContadorSeleccionados();
    }
}

function guardarUbicacion(e) {
    e.preventDefault();
    
    const codigo = inputCodigo.value.trim();
    const nombre = inputNombre.value.trim();
    const tipo = selectTipo.value;
    const dispositivo = selectDispositivo.value;
    const seguridad = selectSeguridad.value;
    const direccion = inputDireccion.value.trim();
    
    if (!codigo || !nombre || !tipo) {
        mostrarMensaje('Complete los campos obligatorios', 'error');
        return;
    }
    
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value || getCookie('csrftoken');
    let url, datos, method;
    
    if (editandoId !== null) {
        method = 'PUT';
        if (editandoTipo === 'sede') {
            url = `/sedes/api/sedes/${editandoId}/`;
            datos = {
                nombre: nombre,
                direccion: direccion || '',
                ciudad: 'N/A',
                telefono: '',
                email: codigo + '@empresa.com',
                encargado: ''
            };
        } else {
            url = `/sedes/api/areas/${editandoId}/`;
            datos = {
                nombre: nombre,
                descripcion: '',
                piso: parseInt(inputPiso.value) || 1,
                codigo_acceso: codigo,
                dispositivo: dispositivo,
                nivel_seguridad: seguridad
            };
        }
    } else {
        method = 'POST';
        if (tipo === 'sede') {
            url = '/sedes/api/crear/';
            datos = {
                nombre: nombre,
                direccion: direccion || '',
                ciudad: 'N/A',
                telefono: '',
                email: codigo + '@empresa.com',
                encargado: ''
            };
        } else {
            const sedeId = selectSedePadre.value;
            if (!sedeId) {
                mostrarMensaje('Seleccione la sede principal', 'error');
                return;
            }
            url = '/sedes/api/areas/crear/';
            datos = {
                sede_id: parseInt(sedeId),
                nombre: nombre,
                descripcion: '',
                piso: parseInt(inputPiso.value) || 1,
                codigo_acceso: codigo,
                dispositivo: dispositivo,
                nivel_seguridad: seguridad
            };
        }
    }
    
    fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken },
        body: JSON.stringify(datos)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            mostrarMensaje(editandoId ? 'Ubicación actualizada' : 'Ubicación registrada');
            limpiarFormulario();
            cargarUbicaciones();
        } else {
            mostrarMensaje(`Error: ${data.message}`, 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarMensaje('Error al guardar', 'error');
    });
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

function limpiarFormulario() {
    formulario.reset();
    btnCancelar.style.display = 'none';
    formTitle.textContent = 'Nueva Ubicación';
    editandoId = null;
    editandoTipo = null;
    grupoSede.style.display = 'none';
    grupoPiso.style.display = 'none';
}

function editarUbicacion(tipo, id) {
    const ubicacion = ubicaciones.find(u => u.id === id && u.tipo === tipo);
    
    if (!ubicacion) {
        mostrarMensaje('Ubicación no encontrada', 'error');
        return;
    }
    
    inputCodigo.value = ubicacion.codigo;
    inputNombre.value = ubicacion.nombre;
    selectTipo.value = ubicacion.tipo;
    selectDispositivo.value = ubicacion.dispositivo === 'acceso_general' ? 'huella' : ubicacion.dispositivo;
    selectSeguridad.value = ubicacion.seguridad;
    inputDireccion.value = ubicacion.direccion || '';
    
    mostrarOpcionesPorTipo();
    
    if (tipo === 'area') {
        if (inputPiso) inputPiso.value = ubicacion.piso || 1;
        if (selectSedePadre && ubicacion.sede_id) {
            setTimeout(() => {
                selectSedePadre.value = ubicacion.sede_id;
            }, 100);
        }
    }
    
    editandoId = id;
    editandoTipo = tipo;
    btnCancelar.style.display = 'inline-flex';
    formTitle.textContent = 'Editar Ubicación';
    
    document.querySelector('.add-panel').scrollIntoView({ behavior: 'smooth' });
    mostrarMensaje(`Editando: ${ubicacion.nombre}`);
}

function eliminarUbicacion(tipo, id) {
    if (!confirm('¿Eliminar esta ubicación?')) return;
    
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value || getCookie('csrftoken');
    const url = tipo === 'sede' ? `/sedes/api/sedes/${id}/` : `/sedes/api/areas/${id}/`;
    
    fetch(url, {
        method: 'DELETE',
        headers: { 'X-CSRFToken': csrfToken }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            mostrarMensaje('Ubicación eliminada');
            if (editandoId === id) limpiarFormulario();
            cargarUbicaciones();
        } else {
            mostrarMensaje(`Error: ${data.message}`, 'error');
        }
    })
    .catch(error => mostrarMensaje('Error al eliminar', 'error'));
}

function nuevoUbicacion() {
    limpiarFormulario();
    mostrarMensaje('Nueva ubicación');
}

function cancelarEdicion() {
    limpiarFormulario();
    mostrarMensaje('Edición cancelada');
}

// ===== FUNCIONES DE SELECCIÓN MÚLTIPLE =====

function obtenerSeleccionados() {
    const checkboxes = document.querySelectorAll('.checkbox-ubicacion:checked');
    return Array.from(checkboxes).map(cb => ({
        id: parseInt(cb.getAttribute('data-id')),
        tipo: cb.getAttribute('data-tipo'),
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
    
    document.querySelectorAll('tbody tr').forEach(row => {
        const checkbox = row.querySelector('.checkbox-ubicacion');
        if (checkbox && checkbox.checked) {
            row.classList.add('seleccionado');
        } else {
            row.classList.remove('seleccionado');
        }
    });
    
    const totalCheckboxes = document.querySelectorAll('.checkbox-ubicacion').length;
    const checkboxesMarcados = document.querySelectorAll('.checkbox-ubicacion:checked').length;
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
    document.querySelectorAll('.checkbox-ubicacion').forEach(cb => {
        cb.checked = checkbox.checked;
    });
    actualizarContadorSeleccionados();
}

function seleccionarTodos() {
    document.querySelectorAll('.checkbox-ubicacion').forEach(cb => cb.checked = true);
    actualizarContadorSeleccionados();
}

function deseleccionarTodos() {
    document.querySelectorAll('.checkbox-ubicacion').forEach(cb => cb.checked = false);
    actualizarContadorSeleccionados();
}

function eliminarSeleccionados() {
    const seleccionados = obtenerSeleccionados();
    
    if (seleccionados.length === 0) {
        mostrarMensaje('No hay ubicaciones seleccionadas', 'error');
        return;
    }
    
    if (!confirm(`¿Eliminar ${seleccionados.length} ubicación(es) seleccionada(s)?`)) return;
    
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value || getCookie('csrftoken');
    let eliminados = 0;
    let errores = 0;
    
    const promesas = seleccionados.map(ubic => {
        const url = ubic.tipo === 'sede' ? `/sedes/api/sedes/${ubic.id}/` : `/sedes/api/areas/${ubic.id}/`;
        return fetch(url, {
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
        if (editandoId && seleccionados.some(s => s.id === editandoId)) limpiarFormulario();
        cargarUbicaciones();
    });
}

// ===== FUNCIONES DEL DROPDOWN =====

function toggleFiltros() {
    if (seccionFiltros.style.display === 'none' || seccionFiltros.style.display === '') {
        seccionFiltros.style.display = 'flex';
    } else {
        seccionFiltros.style.display = 'none';
    }
    dropdownMenu.classList.remove('show');
}

function actualizarListado() {
    cargarUbicaciones();
    mostrarMensaje('Listado actualizado');
    dropdownMenu.classList.remove('show');
}

function limpiarFiltros() {
    if (filtroNombre) filtroNombre.value = '';
    if (filtroTipo) filtroTipo.value = '';
    if (filtroDispositivo) filtroDispositivo.value = '';
    if (filtroSeguridad) filtroSeguridad.value = '';
    actualizarTabla();
}

function toggleDropdown(e) {
    e.stopPropagation();
    dropdownMenu.classList.toggle('show');
}

function cerrarDropdown(e) {
    if (!dropdownMenu.contains(e.target) && !dropdownMenuButton.contains(e.target)) {
        dropdownMenu.classList.remove('show');
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

// ===== INICIALIZACIÓN =====

document.addEventListener('DOMContentLoaded', function() {
    formulario.addEventListener('submit', guardarUbicacion);
    btnCancelar.addEventListener('click', cancelarEdicion);
    btnNuevo.addEventListener('click', nuevoUbicacion);
    if (btnAgregarPrimero) btnAgregarPrimero.addEventListener('click', nuevoUbicacion);
    
    selectTipo.addEventListener('change', mostrarOpcionesPorTipo);
    
    btnLimpiarFiltros.addEventListener('click', limpiarFiltros);
    if (filtroNombre) filtroNombre.addEventListener('input', actualizarTabla);
    if (filtroTipo) filtroTipo.addEventListener('change', actualizarTabla);
    if (filtroDispositivo) filtroDispositivo.addEventListener('change', actualizarTabla);
    if (filtroSeguridad) filtroSeguridad.addEventListener('change', actualizarTabla);
    
    dropdownMenuButton.addEventListener('click', toggleDropdown);
    opcionFiltros.addEventListener('click', toggleFiltros);
    opcionRefresh.addEventListener('click', actualizarListado);
    document.addEventListener('click', cerrarDropdown);
    dropdownMenu.addEventListener('click', (e) => e.stopPropagation());
    
    cargarUbicaciones();
});