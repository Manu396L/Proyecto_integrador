// ubicaciones.js - COMPLETO Y CORREGIDO

let ubicaciones = [];
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

// ===== FUNCION PARA GENERAR CODIGO UNICO =====

function generarCodigoUnico() {
    const nombre = inputNombre.value.trim();
    const tipo = selectTipo.value;

    if (!nombre || !tipo) return;

    let nombreLimpio = nombre
        .toUpperCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^A-Z0-9]/g, "");

    if (nombreLimpio.length > 6) nombreLimpio = nombreLimpio.substring(0, 6);
    if (nombreLimpio.length === 0) nombreLimpio = "UBIC";

    const ahora = new Date();
    const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    const dia = ahora.getDate().toString().padStart(2, '0');
    const mes = (ahora.getMonth() + 1).toString().padStart(2, '0');

    let numeroUnico = `${dia}${mes}${random}`;
    let codigo = tipo === 'sede' ? `SED-${nombreLimpio}-${numeroUnico}` : `ARE-${nombreLimpio}-${numeroUnico}`;

    inputCodigo.value = codigo;
}

// ===== FUNCIONES PRINCIPALES =====

function mostrarOpcionesPorTipo() {
    const tipo = selectTipo.value;
    if (tipo === 'sede') {
        grupoSede.style.display = 'none';
        grupoPiso.style.display = 'none';
    } else if (tipo === 'area') {
        grupoSede.style.display = 'block';
        grupoPiso.style.display = 'block';
        cargarSedesEnSelect();
    }
    if (inputNombre.value.trim()) generarCodigoUnico();
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
        const [respSedes, respAreas] = await Promise.all([
            fetch('/sedes/api/sedes/'),
            fetch('/sedes/api/areas/')
        ]);

        const sedes = await respSedes.json();
        const areas = await respAreas.json();

        ubicaciones = [];

        sedes.forEach(sede => {
            ubicaciones.push({
                id: sede.id,
                tipo: 'sede',
                codigo: sede.codigo_unico || sede.nombre,
                nombre: sede.nombre,
                direccion: sede.direccion || '',
                dispositivo: sede.dispositivo_biometrico || null,
                seguridad: sede.nivel_seguridad || null
            });
        });

        areas.forEach(area => {
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
        } else {
            estadoVacio.style.display = 'none';
            tablaUbicaciones.style.display = 'table';
        }
    } catch (error) {
        console.error('Error cargando ubicaciones:', error);
        mostrarMensaje('Error al cargar ubicaciones', 'error');
    }
}

function actualizarTabla() {
    let ubicacionesFiltradas = ubicaciones;

    if (filtroNombre && filtroNombre.value) {
        const busqueda = filtroNombre.value.toLowerCase();
        ubicacionesFiltradas = ubicacionesFiltradas.filter(u =>
            u.nombre.toLowerCase().includes(busqueda) ||
            (u.codigo && u.codigo.toLowerCase().includes(busqueda))
        );
    }

    if (filtroTipo && filtroTipo.value) {
        ubicacionesFiltradas = ubicacionesFiltradas.filter(u => u.tipo === filtroTipo.value);
    }

    if (filtroDispositivo && filtroDispositivo.value && filtroDispositivo.value !== '') {
        ubicacionesFiltradas = ubicacionesFiltradas.filter(u => u.dispositivo === filtroDispositivo.value);
    }

    if (filtroSeguridad && filtroSeguridad.value && filtroSeguridad.value !== '') {
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

            let dispositivoTexto = '';
            if (ubicacion.tipo === 'sede') {
                if (ubicacion.dispositivo) {
                    if (ubicacion.dispositivo === 'huella') dispositivoTexto = 'Lector de Huella';
                    else if (ubicacion.dispositivo === 'Tarjeta') dispositivoTexto = 'Tarjeta de Acceso';
                    else if (ubicacion.dispositivo === 'PIN') dispositivoTexto = 'PIN';
                    else dispositivoTexto = ubicacion.dispositivo;
                } else {
                    dispositivoTexto = '-';
                }
            } else {
                if (ubicacion.dispositivo === 'huella') dispositivoTexto = 'Lector de Huella';
                else if (ubicacion.dispositivo === 'Tarjeta') dispositivoTexto = 'Tarjeta de Acceso';
                else if (ubicacion.dispositivo === 'PIN') dispositivoTexto = 'PIN';
                else dispositivoTexto = ubicacion.dispositivo || '-';
            }

            let seguridadTexto = '';
            let seguridadBadgeClass = '';

            if (ubicacion.tipo === 'sede') {
                if (ubicacion.seguridad) {
                    if (ubicacion.seguridad === 'bajo') {
                        seguridadTexto = 'Bajo';
                        seguridadBadgeClass = 'badge-bajo';
                    } else if (ubicacion.seguridad === 'medio') {
                        seguridadTexto = 'Medio';
                        seguridadBadgeClass = 'badge-medio';
                    } else if (ubicacion.seguridad === 'alto') {
                        seguridadTexto = 'Alto';
                        seguridadBadgeClass = 'badge-alto';
                    } else {
                        seguridadTexto = ubicacion.seguridad;
                    }
                } else {
                    seguridadTexto = '-';
                }
            } else {
                if (ubicacion.seguridad === 'bajo') {
                    seguridadTexto = 'Bajo';
                    seguridadBadgeClass = 'badge-bajo';
                } else if (ubicacion.seguridad === 'medio') {
                    seguridadTexto = 'Medio';
                    seguridadBadgeClass = 'badge-medio';
                } else if (ubicacion.seguridad === 'alto') {
                    seguridadTexto = 'Alto';
                    seguridadBadgeClass = 'badge-alto';
                } else {
                    seguridadTexto = ubicacion.seguridad || '-';
                }
            }

            fila.innerHTML = `
                <td class="checkbox-cell">
                    <input type="checkbox" class="checkbox-ubicacion" data-id="${ubicacion.id}" data-tipo="${ubicacion.tipo}" data-nombre="${ubicacion.nombre}" onchange="actualizarContadorSeleccionados()">
                </td>
                <td class="codigo-cell">${escapeHtml(ubicacion.codigo || '-')} <small class="id-small">ID: ${ubicacion.id}</small></td>
                <td class="nombre-cell"><strong>${escapeHtml(ubicacion.nombre)}</strong></td>
                <td class="tipo-cell"><span class="badge-tipo ${tipoBadgeClass}">${tipoTexto}</span></td>
                <td class="dispositivo-cell">${dispositivoTexto}</td>
                <td class="seguridad-cell"><span class="badge-seguridad ${seguridadBadgeClass}">${seguridadTexto}</span></td>
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

    if (editandoId !== null) {
        let url, datos, method = 'PUT';
        if (editandoTipo === 'sede') {
            url = `/sedes/api/sedes/${editandoId}/`;
            datos = {
                nombre: nombre,
                direccion: direccion || '',
                dispositivo_biometrico: dispositivo,
                nivel_seguridad: seguridad
            };
        } else {
            url = `/sedes/api/areas/${editandoId}/`;
            datos = {
                nombre: nombre,
                piso: parseInt(inputPiso.value) || 1,
                codigo_acceso: codigo,
                dispositivo_biometrico: dispositivo,
                nivel_seguridad: seguridad
            };
        }

        fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken },
            body: JSON.stringify(datos)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                mostrarMensaje('Ubicacion actualizada');
                limpiarFormulario();
                cargarUbicaciones();
            } else {
                mostrarMensaje(`Error: ${data.message}`, 'error');
            }
        })
        .catch(error => mostrarMensaje('Error al guardar', 'error'));

    } else {
        if (tipo === 'sede') {
            fetch('/sedes/api/sedes/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken },
                body: JSON.stringify({
                    nombre: nombre,
                    direccion: direccion || '',
                    dispositivo_biometrico: dispositivo,
                    nivel_seguridad: seguridad
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    mostrarMensaje('Sede creada correctamente');
                    limpiarFormulario();
                    cargarUbicaciones();
                } else {
                    mostrarMensaje(`Error: ${data.message}`, 'error');
                }
            })
            .catch(error => mostrarMensaje('Error al guardar', 'error'));
        } else {
            const sedeId = selectSedePadre.value;
            if (!sedeId) {
                mostrarMensaje('Seleccione la sede principal', 'error');
                return;
            }
            fetch('/sedes/api/areas/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken },
                body: JSON.stringify({
                    sede_id: parseInt(sedeId),
                    nombre: nombre,
                    piso: parseInt(inputPiso.value) || 1,
                    codigo_acceso: codigo,
                    dispositivo_biometrico: dispositivo,
                    nivel_seguridad: seguridad
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    mostrarMensaje('Área creada correctamente');
                    limpiarFormulario();
                    cargarUbicaciones();
                } else {
                    mostrarMensaje(`Error: ${data.message}`, 'error');
                }
            })
            .catch(error => mostrarMensaje('Error al guardar', 'error'));
        }
    }
}

function mostrarMensaje(mensaje, tipo = 'success') {
    const msgDiv = document.getElementById('mensaje-exito');
    const msgText = document.getElementById('mensaje-texto');
    msgText.textContent = mensaje;

    msgDiv.style.display = 'flex';

    if (tipo === 'error') {
        msgDiv.style.background = '#f8d7da';
        msgDiv.style.borderLeftColor = '#dc3545';
        msgDiv.style.color = '#721c24';
        msgDiv.querySelector('i').className = 'fa-solid fa-exclamation-circle';
    } else if (tipo === 'info') {
        msgDiv.style.background = '#e3f2fd';
        msgDiv.style.borderLeftColor = '#2196f3';
        msgDiv.style.color = '#0c5460';
        msgDiv.querySelector('i').className = 'fa-solid fa-info-circle';
    } else {
        msgDiv.style.background = '#d4edda';
        msgDiv.style.borderLeftColor = '#28a745';
        msgDiv.style.color = '#155724';
        msgDiv.querySelector('i').className = 'fa-solid fa-check';
    }

    setTimeout(() => msgDiv.style.display = 'none', 3000);
}

function limpiarFormulario() {
    formulario.reset();
    btnCancelar.style.display = 'none';
    formTitle.textContent = 'Nueva Ubicacion';
    editandoId = null;
    editandoTipo = null;
    grupoSede.style.display = 'none';
    grupoPiso.style.display = 'none';
    selectTipo.value = '';
    inputCodigo.value = '';
}

function editarUbicacion(tipo, id) {
    const ubicacion = ubicaciones.find(u => u.id === id && u.tipo === tipo);
    if (!ubicacion) {
        mostrarMensaje('Ubicacion no encontrada', 'error');
        return;
    }

    inputCodigo.value = ubicacion.codigo || '';
    inputNombre.value = ubicacion.nombre;
    selectTipo.value = ubicacion.tipo;
    selectDispositivo.value = ubicacion.dispositivo || 'huella';
    selectSeguridad.value = ubicacion.seguridad || 'bajo';
    inputDireccion.value = ubicacion.direccion || '';

    mostrarOpcionesPorTipo();

    if (tipo === 'area') {
        if (inputPiso) inputPiso.value = ubicacion.piso || 1;
        if (selectSedePadre && ubicacion.sede_id) {
            setTimeout(() => selectSedePadre.value = ubicacion.sede_id, 100);
        }
    }

    editandoId = id;
    editandoTipo = tipo;
    btnCancelar.style.display = 'inline-flex';
    formTitle.textContent = 'Editar Ubicacion';
    document.querySelector('.add-panel').scrollIntoView({ behavior: 'smooth' });
    mostrarMensaje(`Editando: ${ubicacion.nombre} (ID: ${id})`);
}

function eliminarUbicacion(tipo, id) {
    if (!confirm('¿Eliminar esta ubicacion?')) return;

    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value || getCookie('csrftoken');
    const url = tipo === 'sede' ? `/sedes/api/sedes/${id}/` : `/sedes/api/areas/${id}/`;

    fetch(url, { method: 'DELETE', headers: { 'X-CSRFToken': csrfToken } })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                mostrarMensaje(data.message || 'Ubicacion eliminada');
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
    mostrarMensaje('Nueva ubicacion');
}

function cancelarEdicion() {
    limpiarFormulario();
    mostrarMensaje('Edicion cancelada');
}

// ===== FUNCIONES DE SELECCION MULTIPLE =====

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
        if (checkbox && checkbox.checked) row.classList.add('seleccionado');
        else row.classList.remove('seleccionado');
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
    document.querySelectorAll('.checkbox-ubicacion').forEach(cb => cb.checked = checkbox.checked);
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

    if (!confirm(`Eliminar ${seleccionados.length} ubicacion(es) seleccionada(s)?`)) return;

    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value || getCookie('csrftoken');
    let eliminados = 0, errores = 0;

    const promesas = seleccionados.map(ubic => {
        const url = ubic.tipo === 'sede' ? `/sedes/api/sedes/${ubic.id}/` : `/sedes/api/areas/${ubic.id}/`;
        return fetch(url, { method: 'DELETE', headers: { 'X-CSRFToken': csrfToken } })
            .then(response => response.json())
            .then(data => data.success ? eliminados++ : errores++)
            .catch(() => errores++);
    });

    Promise.all(promesas).then(() => {
        mostrarMensaje(`Eliminados: ${eliminados} | Errores: ${errores}`);
        if (editandoId && seleccionados.some(s => s.id === editandoId)) limpiarFormulario();
        cargarUbicaciones();
    });
}

// ===== FUNCIONES DE EXPORTAR/IMPORTAR =====

function exportarDatos(formato) {
    window.location.href = `/sedes/exportar/${formato}/`;
    mostrarMensaje(`Exportando datos a formato ${formato.toUpperCase()}...`, 'info');
    cerrarDropdown();
}

function importarDatos(formato) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = formato === 'json' ? '.json' : '.csv';
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('archivo', file);
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value || getCookie('csrftoken');

        mostrarMensaje(`Importando archivo ${formato.toUpperCase()}...`, 'info');

        try {
            const response = await fetch('/sedes/importar/', {
                method: 'POST',
                headers: { 'X-CSRFToken': csrfToken },
                body: formData
            });
            const result = await response.json();
            if (result.success) {
                mostrarMensaje(result.message, 'success');
                cargarUbicaciones();
            } else {
                mostrarMensaje(`Error: ${result.message}`, 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            mostrarMensaje('Error al importar datos', 'error');
        }
    };
    input.click();
    cerrarDropdown();
}

function actualizarListado() {
    cargarUbicaciones();
    mostrarMensaje('Listado actualizado');
    cerrarDropdown();
}

// ===== FUNCIONES DEL DROPDOWN PRINCIPAL =====

function toggleDropdown(e) {
    e.stopPropagation();
    dropdownMenu.classList.toggle('show');

    if (!dropdownMenu.classList.contains('show')) {
        cerrarSubmenus();
    }
}

function cerrarDropdown() {
    dropdownMenu.classList.remove('show');
    cerrarSubmenus();
}

function cerrarSubmenus() {
    document.querySelectorAll('.dropdown-submenu.open').forEach(el => el.classList.remove('open'));
}

function toggleFiltros() {
    seccionFiltros.style.display =
        seccionFiltros.style.display === 'none' || seccionFiltros.style.display === ''
            ? 'flex'
            : 'none';
    cerrarDropdown();
}

function limpiarFiltros() {
    if (filtroNombre) filtroNombre.value = '';
    if (filtroTipo) filtroTipo.value = '';
    if (filtroDispositivo) filtroDispositivo.value = '';
    if (filtroSeguridad) filtroSeguridad.value = '';
    actualizarTabla();
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

function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Exponer funciones globalmente
window.exportarDatos = exportarDatos;
window.importarDatos = importarDatos;
window.actualizarListado = actualizarListado;
window.seleccionarTodos = seleccionarTodos;
window.deseleccionarTodos = deseleccionarTodos;
window.eliminarSeleccionados = eliminarSeleccionados;
window.toggleSeleccionarTodos = toggleSeleccionarTodos;
window.editarUbicacion = editarUbicacion;
window.eliminarUbicacion = eliminarUbicacion;
window.actualizarContadorSeleccionados = actualizarContadorSeleccionados;

// ===== INICIALIZACION =====

document.addEventListener('DOMContentLoaded', function () {
    formulario.addEventListener('submit', guardarUbicacion);
    btnCancelar.addEventListener('click', cancelarEdicion);
    btnNuevo.addEventListener('click', nuevoUbicacion);
    if (btnAgregarPrimero) btnAgregarPrimero.addEventListener('click', nuevoUbicacion);

    selectTipo.addEventListener('change', mostrarOpcionesPorTipo);
    inputNombre.addEventListener('input', generarCodigoUnico);
    selectTipo.addEventListener('change', () => { if (inputNombre.value.trim()) generarCodigoUnico(); });

    btnLimpiarFiltros.addEventListener('click', limpiarFiltros);
    if (filtroNombre) filtroNombre.addEventListener('input', actualizarTabla);
    if (filtroTipo) filtroTipo.addEventListener('change', actualizarTabla);
    if (filtroDispositivo) filtroDispositivo.addEventListener('change', actualizarTabla);
    if (filtroSeguridad) filtroSeguridad.addEventListener('change', actualizarTabla);

    dropdownMenuButton.addEventListener('click', toggleDropdown);
    opcionFiltros.addEventListener('click', toggleFiltros);

    document.addEventListener('click', function (e) {
        if (!dropdownMenu.contains(e.target) && !dropdownMenuButton.contains(e.target)) {
            cerrarDropdown();
        }
    });

    dropdownMenu.addEventListener('click', (e) => e.stopPropagation());

    document.querySelectorAll('.submenu-toggle').forEach(toggle => {
        toggle.addEventListener('click', function (e) {
            e.stopPropagation();
            const parent = this.closest('.dropdown-submenu');

            document.querySelectorAll('.dropdown-submenu.open').forEach(el => {
                if (el !== parent) el.classList.remove('open');
            });

            parent.classList.toggle('open');
        });
    });

    cargarUbicaciones();
});