// personal.js - COMPLETO CON CHECKBOXES Y SELECCIÓN MÚLTIPLE

let empleados = [];
let editandoIndex = null;
let fotoActual = null;

// Elementos DOM
const cuerpoTabla = document.getElementById('cuerpoTabla');
const estadoVacio = document.getElementById('estado-vacio');
const tablaEmpleados = document.getElementById('tablaEmpleados');
const btnGuardar = document.getElementById('btn-guardar');
const btnCancelar = document.getElementById('btn-cancelar');
const btnNuevo = document.getElementById('btn-nuevo');
const btnAgregarPrimero = document.getElementById('btn-agregar-primero');
const btnLimpiarFiltros = document.getElementById('btn-limpiar-filtros');
const formTitle = document.getElementById('form-title');
const mensajeTexto = document.getElementById('mensaje-texto');

// Elementos de filtro
const filtroNombre = document.getElementById('filtro-nombre');
const filtroArea = document.getElementById('filtro-area');
const filtroSede = document.getElementById('filtro-sede');

// Elementos del formulario
const formulario = document.getElementById('formularioEmpleado');
const inputNombre = document.getElementById('nombre');
const inputCargo = document.getElementById('cargo');
const selectArea = document.getElementById('area');
const inputAreaPersonalizada = document.getElementById('area_personalizada');
const containerAreaPersonalizada = document.getElementById('container-area-personalizada');
const inputCorreo = document.getElementById('correo');
const selectTipoSede = document.getElementById('tipo_sede');
const inputNombreSede = document.getElementById('nombre_sede');
const inputIdEmpleado = document.getElementById('id_empleado');
const selectDispositivo = document.getElementById('dispositivo_biometrico');
const selectNivelSeguridad = document.getElementById('nivel_seguridad');
const inputFoto = document.getElementById('foto_empleado');
const fotoPreview = document.getElementById('foto-preview');

// Elementos de credenciales
const seccionCredenciales = document.getElementById('seccion-credenciales');
const opcionHuella = document.getElementById('opcion-huella');
const opcionTarjeta = document.getElementById('opcion-tarjeta');
const opcionPin = document.getElementById('opcion-pin');
const inputNumeroTarjeta = document.getElementById('numero_tarjeta');
const inputPin = document.getElementById('pin');
const huellaStatus = document.getElementById('huella-status');

// Elementos del método adicional
const toggleAdicional = document.getElementById('toggle_metodo_adicional');
const contenedorAdicional = document.getElementById('contenedor_metodo_adicional');
const tipoAdicional = document.getElementById('tipo_metodo_adicional');
const nivelSeguridadAdicional = document.getElementById('nivel_seguridad_adicional');
const opcionCredencialAdicional = document.getElementById('opcion-credencial-adicional');
const credencialAdicional = document.getElementById('credencial_adicional');
const btnGenerarAdicional = document.getElementById('btn-generar-adicional');
const adicionalStatus = document.getElementById('adicional-status');

// Elementos del dropdown
const dropdownMenuButton = document.getElementById('dropdownMenuButton');
const dropdownMenu = document.getElementById('dropdownMenu');
const opcionImportar = document.getElementById('opcion-importar');
const opcionExportar = document.getElementById('opcion-exportar');
const opcionRefresh = document.getElementById('opcion-refresh');

// Input oculto para importar CSV
let csvInput = null;

// ===== FUNCIONES DEL MÉTODO ADICIONAL =====

function mostrarSeccionAdicional() {
    if (toggleAdicional && toggleAdicional.checked) {
        contenedorAdicional.style.display = 'block';
        adicionalStatus.innerHTML = '<i class="fa-solid fa-info-circle"></i> Configurando método adicional...';
        adicionalStatus.classList.remove('registrado');
        adicionalStatus.classList.remove('error');
    } else {
        contenedorAdicional.style.display = 'none';
        limpiarCamposAdicionales();
        adicionalStatus.innerHTML = '<i class="fa-solid fa-info-circle"></i> Método adicional no configurado';
        adicionalStatus.classList.remove('registrado');
        adicionalStatus.classList.remove('error');
    }
}

function manejarTipoAdicional() {
    if (!tipoAdicional) return;
    const tipo = tipoAdicional.value;
    if (tipo === 'tarjeta' || tipo === 'pin') {
        opcionCredencialAdicional.style.display = 'block';
        if (tipo === 'tarjeta') {
            credencialAdicional.placeholder = 'Número de tarjeta';
            btnGenerarAdicional.innerHTML = '<i class="fa-solid fa-barcode"></i> Generar Tarjeta';
        } else {
            credencialAdicional.placeholder = 'PIN de acceso';
            btnGenerarAdicional.innerHTML = '<i class="fa-solid fa-key"></i> Generar PIN';
        }
        credencialAdicional.value = '';
    } else if (tipo === 'huella') {
        opcionCredencialAdicional.style.display = 'none';
        credencialAdicional.value = 'huella_registrada';
    } else {
        opcionCredencialAdicional.style.display = 'none';
        credencialAdicional.value = '';
    }
    actualizarStatusAdicional();
}

function generarCredencialAdicional() {
    const tipo = tipoAdicional.value;
    if (tipo === 'tarjeta') {
        const numero = 'TARJ-' + Math.random().toString(36).substr(2, 8).toUpperCase();
        credencialAdicional.value = numero;
    } else if (tipo === 'pin') {
        const pin = Math.floor(100000 + Math.random() * 900000).toString();
        credencialAdicional.value = pin;
    }
    actualizarStatusAdicional();
    mostrarMensaje(`${tipo === 'tarjeta' ? 'Tarjeta' : 'PIN'} generado correctamente`, 'success');
}

function actualizarStatusAdicional() {
    if (!toggleAdicional || !toggleAdicional.checked) return;
    
    const tipo = tipoAdicional.value;
    const nivel = nivelSeguridadAdicional.value;
    
    if (!tipo || !nivel) {
        adicionalStatus.innerHTML = '<i class="fa-solid fa-exclamation-triangle"></i> Complete los campos del método adicional';
        adicionalStatus.classList.remove('registrado');
        adicionalStatus.classList.add('error');
        return;
    }
    
    let credencialTexto = '';
    if (tipo === 'huella') {
        credencialTexto = 'Huella a registrar';
    } else if (tipo === 'tarjeta') {
        credencialTexto = credencialAdicional.value ? `Tarjeta: ${credencialAdicional.value}` : 'Tarjeta pendiente';
    } else {
        credencialTexto = credencialAdicional.value ? `PIN: ${credencialAdicional.value}` : 'PIN pendiente';
    }
    
    const tipoTexto = getTipoTexto(tipo);
    const nivelTexto = getNivelTexto(nivel);
    
    adicionalStatus.innerHTML = `<i class="fa-solid fa-check-circle"></i> Método adicional configurado: ${tipoTexto} - Nivel: ${nivelTexto} - ${credencialTexto}`;
    adicionalStatus.classList.add('registrado');
    adicionalStatus.classList.remove('error');
}

function getTipoTexto(tipo) {
    const tipos = { 'huella': 'Huella', 'tarjeta': 'Tarjeta', 'pin': 'PIN' };
    return tipos[tipo] || tipo;
}

function getNivelTexto(nivel) {
    const niveles = { 'bajo': 'Bajo', 'medio': 'Medio', 'alto': 'Alto' };
    return niveles[nivel] || nivel;
}

function getIconoMetodo(tipo) {
    const iconos = { 'huella': 'fa-fingerprint', 'tarjeta': 'fa-credit-card', 'pin': 'fa-key' };
    return iconos[tipo] || 'fa-microchip';
}

function limpiarCamposAdicionales() {
    if (tipoAdicional) tipoAdicional.value = '';
    if (nivelSeguridadAdicional) nivelSeguridadAdicional.value = '';
    if (credencialAdicional) credencialAdicional.value = '';
    if (opcionCredencialAdicional) opcionCredencialAdicional.style.display = 'none';
}

function validarCamposAdicionales() {
    if (!toggleAdicional || !toggleAdicional.checked) return true;
    
    if (!tipoAdicional.value) {
        mostrarMensaje('Seleccione el método de autenticación adicional', 'error');
        tipoAdicional.focus();
        return false;
    }
    
    if (!nivelSeguridadAdicional.value) {
        mostrarMensaje('Seleccione el nivel de seguridad para el método adicional', 'error');
        nivelSeguridadAdicional.focus();
        return false;
    }
    
    if ((tipoAdicional.value === 'tarjeta' || tipoAdicional.value === 'pin') && !credencialAdicional.value) {
        mostrarMensaje(`Genere la ${tipoAdicional.value === 'tarjeta' ? 'tarjeta' : 'PIN'} para el método adicional`, 'error');
        return false;
    }
    
    actualizarStatusAdicional();
    return true;
}

function obtenerDatosAdicionales() {
    if (!toggleAdicional || !toggleAdicional.checked) return null;
    
    if (!tipoAdicional.value || !nivelSeguridadAdicional.value) return null;
    
    return {
        activo: true,
        tipo: tipoAdicional.value,
        tipo_texto: getTipoTexto(tipoAdicional.value),
        nivel_seguridad: nivelSeguridadAdicional.value,
        nivel_texto: getNivelTexto(nivelSeguridadAdicional.value),
        credencial: credencialAdicional.value || '',
        icono: getIconoMetodo(tipoAdicional.value)
    };
}

function cargarDatosAdicionales(datos) {
    if (datos && datos.activo && datos.tipo) {
        toggleAdicional.checked = true;
        contenedorAdicional.style.display = 'block';
        tipoAdicional.value = datos.tipo || '';
        nivelSeguridadAdicional.value = datos.nivel_seguridad || '';
        
        if (datos.tipo === 'tarjeta' || datos.tipo === 'pin') {
            opcionCredencialAdicional.style.display = 'block';
            credencialAdicional.value = datos.credencial || '';
        } else if (datos.tipo === 'huella') {
            opcionCredencialAdicional.style.display = 'none';
            credencialAdicional.value = 'huella_registrada';
        }
        
        adicionalStatus.innerHTML = `<i class="fa-solid fa-check-circle"></i> Método adicional configurado: ${datos.tipo_texto} - Nivel: ${datos.nivel_texto}`;
        adicionalStatus.classList.add('registrado');
        adicionalStatus.classList.remove('error');
    } else {
        toggleAdicional.checked = false;
        contenedorAdicional.style.display = 'none';
        limpiarCamposAdicionales();
    }
}

// ===== FUNCIONES PRINCIPALES =====

function manejarAreaPersonalizada() {
    if (selectArea.value === 'otro') {
        containerAreaPersonalizada.style.display = 'block';
        inputAreaPersonalizada.required = true;
        inputAreaPersonalizada.focus();
    } else {
        containerAreaPersonalizada.style.display = 'none';
        inputAreaPersonalizada.required = false;
        inputAreaPersonalizada.value = '';
    }
}

function getAreaValue() {
    if (selectArea.value === 'otro') {
        return inputAreaPersonalizada.value.trim();
    }
    return selectArea.value;
}

function mostrarOpcionesCredencial() {
    const dispositivo = selectDispositivo.value;
    seccionCredenciales.style.display = 'block';
    
    opcionHuella.style.display = 'none';
    opcionTarjeta.style.display = 'none';
    opcionPin.style.display = 'none';
    
    if (dispositivo === 'huella') {
        opcionHuella.style.display = 'block';
    } else if (dispositivo === 'tarjeta') {
        opcionTarjeta.style.display = 'block';
    } else if (dispositivo === 'pin') {
        opcionPin.style.display = 'block';
    }
}

function registrarHuella() {
    mostrarMensaje('Por favor, coloque su dedo en el lector...', 'info');
    setTimeout(() => {
        huellaStatus.className = 'huella-status registrada';
        huellaStatus.innerHTML = '<i class="fa-solid fa-check-circle"></i> Huella registrada';
        mostrarMensaje('Huella registrada correctamente');
    }, 2000);
}

function generarNumeroTarjeta() {
    const numero = 'TARJ-' + Math.random().toString(36).substr(2, 8).toUpperCase();
    inputNumeroTarjeta.value = numero;
    return numero;
}

function generarPIN() {
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    inputPin.value = pin;
    return pin;
}

function actualizarTabla() {
    let empleadosFiltrados = empleados;
    
    if (filtroNombre.value) {
        const busqueda = filtroNombre.value.toLowerCase();
        empleadosFiltrados = empleadosFiltrados.filter(e => 
            e.nombre.toLowerCase().includes(busqueda) || 
            e.id.toLowerCase().includes(busqueda)
        );
    }
    
    if (filtroArea.value) {
        empleadosFiltrados = empleadosFiltrados.filter(e => e.area === filtroArea.value);
    }
    
    if (filtroSede.value) {
        empleadosFiltrados = empleadosFiltrados.filter(e => e.tipoSede === filtroSede.value);
    }
    
    cuerpoTabla.innerHTML = '';
    
    if (empleadosFiltrados.length === 0) {
        estadoVacio.style.display = 'block';
        tablaEmpleados.style.display = 'none';
    } else {
        estadoVacio.style.display = 'none';
        tablaEmpleados.style.display = 'table';
        
        empleadosFiltrados.forEach(empleado => {
            const fila = document.createElement('tr');
            fila.setAttribute('data-id', empleado.id);
            
            const areaBadgeClass = {
                'ti': 'badge-ti', 'rh': 'badge-rh', 'finanzas': 'badge-finanzas',
                'operaciones': 'badge-operaciones', 'marketing': 'badge-marketing', 'ventas': 'badge-ventas'
            }[empleado.area] || '';
            
            const sedeBadgeClass = {
                'sede': 'badge-sede-principal', 'oficina': 'badge-oficina', 'area': 'badge-area-especifica'
            }[empleado.tipoSede] || '';
            
            const dispositivoBadgeClass = {
                'huella': 'badge-huella', 'tarjeta': 'badge-tarjeta', 'pin': 'badge-pin'
            }[empleado.dispositivo] || '';
            
            const areaTexto = {
                'ti': 'TI', 'rh': 'RH', 'finanzas': 'Finanzas',
                'operaciones': 'Operaciones', 'marketing': 'Marketing', 'ventas': 'Ventas'
            }[empleado.area] || empleado.area;
            
            // Método Acceso (principal)
            const metodoIcono = empleado.dispositivo === 'huella' ? 'fa-fingerprint' : 
                                empleado.dispositivo === 'tarjeta' ? 'fa-credit-card' : 'fa-key';
            const metodoTexto = empleado.dispositivo === 'huella' ? 'Huella' : 
                                empleado.dispositivo === 'tarjeta' ? 'Tarjeta' : 'PIN';
            
            // Método Adicional (si existe)
            let adicionalHtml = '';
            if (empleado.metodo_adicional && empleado.metodo_adicional.activo && empleado.metodo_adicional.tipo) {
                const iconoAdicional = getIconoMetodo(empleado.metodo_adicional.tipo);
                const nivelClase = `nivel-${empleado.metodo_adicional.nivel_seguridad || 'medio'}`;
                adicionalHtml = `
                    <div class="metodos-adicionales">
                        <span class="badge-metodo-adicional">
                            <i class="fa-solid ${iconoAdicional}"></i>
                            ${empleado.metodo_adicional.tipo_texto}
                            <small class="nivel-badge ${nivelClase}">${empleado.metodo_adicional.nivel_texto || (empleado.metodo_adicional.nivel_seguridad === 'bajo' ? 'Bajo' : empleado.metodo_adicional.nivel_seguridad === 'medio' ? 'Medio' : 'Alto')}</small>
                        </span>
                    </div>
                `;
            } else {
                adicionalHtml = '<span class="badge-metodo-adicional vacio"><i class="fa-solid fa-minus-circle"></i> Ninguno</span>';
            }
            
            fila.innerHTML = `
                <td class="checkbox-cell">
                    <input type="checkbox" class="checkbox-empleado" data-id="${empleado.id}" data-nombre="${empleado.nombre}" onchange="actualizarContadorSeleccionados()">
                </td>
                <td class="foto-cell">
                    ${empleado.foto ? 
                        `<img src="${empleado.foto}" alt="Foto" class="foto-tabla">` : 
                        `<div class="foto-placeholder"><i class="fa-solid fa-user"></i></div>`
                    }
                </td>
                <td class="id-cell">${empleado.id}</td>
                <td class="nombre-cell"><strong>${empleado.nombre}</strong></td>
                <td class="cargo-cell">${empleado.cargo}</td>
                <td class="area-cell"><span class="badge-area ${areaBadgeClass}">${areaTexto}</span></td>
                <td class="sede-cell"><span class="badge-sede ${sedeBadgeClass}">${empleado.tipoSede === 'sede' ? 'Sede Principal' : empleado.tipoSede === 'oficina' ? 'Oficina' : 'Área Específica'}</span></td>
                <td class="dispositivo-cell"><span class="badge-dispositivo ${dispositivoBadgeClass}"><i class="fa-solid ${metodoIcono}"></i> ${metodoTexto}</span></td>
                <td class="metodo-adicional-cell">${adicionalHtml}</td>
                <td class="acciones">
                    <button class="btn-accion btn-editar" data-id="${empleado.id}">
                        <i class="fa-solid fa-pen"></i> Editar
                    </button>
                    <button class="btn-accion btn-eliminar" data-id="${empleado.id}">
                        <i class="fa-solid fa-trash"></i> Eliminar
                    </button>
                </td>
            `;
            
            cuerpoTabla.appendChild(fila);
        });
        
        document.querySelectorAll('.btn-editar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const empleadoId = btn.getAttribute('data-id');
                editarEmpleado(empleadoId);
            });
        });
        
        document.querySelectorAll('.btn-eliminar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const empleadoId = btn.getAttribute('data-id');
                eliminarEmpleado(empleadoId);
            });
        });
        
        actualizarContadorSeleccionados();
    }
}

function guardarEmpleado(e) {
    e.preventDefault();
    
    const nombre = inputNombre.value.trim();
    const cargo = inputCargo.value.trim();
    const area = getAreaValue();
    const correo = inputCorreo.value.trim();
    const tipoSede = selectTipoSede.value;
    const nombreSede = inputNombreSede.value.trim();
    const id = inputIdEmpleado.value.trim();
    const dispositivo = selectDispositivo.value;
    const nivelSeguridad = selectNivelSeguridad.value;
    
    if (!nombre || !cargo || !area || !correo || !tipoSede || !nombreSede || !id || !dispositivo || !nivelSeguridad) {
        mostrarMensaje('Complete todos los campos obligatorios', 'error');
        return;
    }
    
    if (!correo.endsWith('@biometrika.com')) {
        mostrarMensaje('El correo debe terminar con @biometrika.com', 'error');
        return;
    }
    
    if (!validarCamposAdicionales()) return;
    
    let credencial = '';
    if (dispositivo === 'tarjeta') {
        credencial = inputNumeroTarjeta.value.trim() || generarNumeroTarjeta();
    } else if (dispositivo === 'pin') {
        credencial = inputPin.value || generarPIN();
    } else if (dispositivo === 'huella') {
        credencial = huellaStatus.classList.contains('registrada') ? 'huella_registrada' : '';
    }
    
    const datosEmpleado = {
        id,
        nombre,
        email: correo,
        cargo,
        area,
        tipo_sede: tipoSede,
        nombre_sede: nombreSede,
        dispositivo,
        nivel_seguridad: nivelSeguridad,
        credencial,
        foto: fotoActual,
        metodo_adicional: obtenerDatosAdicionales()
    };
    
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value || getCookie('csrftoken');
    
    if (editandoIndex !== null) {
        fetch(`/personal/api/personal/${editandoIndex}/`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken },
            body: JSON.stringify(datosEmpleado)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                mostrarMensaje('Empleado actualizado');
                limpiarFormulario();
                cargarPersonal();
            } else {
                mostrarMensaje(`Error: ${data.error}`, 'error');
            }
        })
        .catch(error => mostrarMensaje('Error al actualizar', 'error'));
    } else {
        fetch('/personal/api/personal/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken },
            body: JSON.stringify(datosEmpleado)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                mostrarMensaje('Empleado registrado');
                limpiarFormulario();
                cargarPersonal();
            } else {
                mostrarMensaje(`Error: ${data.error}`, 'error');
            }
        })
        .catch(error => mostrarMensaje('Error al registrar', 'error'));
    }
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
    } else if (tipo === 'info') {
        mensajeExito.style.background = '#e3f2fd';
        mensajeExito.style.borderLeftColor = '#2196f3';
        mensajeExito.style.color = '#0c5460';
        mensajeExito.querySelector('i').className = 'fa-solid fa-info-circle';
        mensajeExito.querySelector('i').style.color = '#2196f3';
    } else {
        mensajeExito.style.background = '#d4edda';
        mensajeExito.style.borderLeftColor = '#28a745';
        mensajeExito.style.color = '#155724';
        mensajeExito.querySelector('i').className = 'fa-solid fa-check';
        mensajeExito.querySelector('i').style.color = '#28a745';
    }
    
    mensajeExito.classList.add('mostrar');
    setTimeout(() => mensajeExito.classList.remove('mostrar'), 3000);
}

function limpiarFormulario() {
    formulario.reset();
    fotoActual = null;
    fotoPreview.innerHTML = '<i class="fa-solid fa-user"></i><span>Sin foto</span>';
    fotoPreview.classList.remove('has-image');
    seccionCredenciales.style.display = 'none';
    opcionHuella.style.display = 'none';
    opcionTarjeta.style.display = 'none';
    opcionPin.style.display = 'none';
    huellaStatus.className = 'huella-status';
    huellaStatus.innerHTML = '<i class="fa-solid fa-times-circle"></i> Huella no registrada';
    btnCancelar.style.display = 'none';
    formTitle.textContent = 'Nuevo Empleado';
    editandoIndex = null;
    containerAreaPersonalizada.style.display = 'none';
    inputAreaPersonalizada.required = false;
    inputAreaPersonalizada.value = '';
    selectArea.value = '';
    
    if (toggleAdicional) {
        toggleAdicional.checked = false;
        contenedorAdicional.style.display = 'none';
        limpiarCamposAdicionales();
    }
}

function editarEmpleado(empleadoId) {
    const empleado = empleados.find(e => e.id == empleadoId);
    
    if (!empleado) {
        mostrarMensaje('Empleado no encontrado', 'error');
        return;
    }
    
    inputNombre.value = empleado.nombre;
    inputCargo.value = empleado.cargo;
    
    const areasPredefinidas = ['ti', 'rh', 'finanzas', 'operaciones', 'marketing', 'ventas'];
    if (areasPredefinidas.includes(empleado.area)) {
        selectArea.value = empleado.area;
        containerAreaPersonalizada.style.display = 'none';
    } else {
        selectArea.value = 'otro';
        containerAreaPersonalizada.style.display = 'block';
        inputAreaPersonalizada.value = empleado.area;
        inputAreaPersonalizada.required = true;
    }
    
    inputCorreo.value = empleado.correo;
    selectTipoSede.value = empleado.tipoSede;
    inputNombreSede.value = empleado.nombreSede;
    inputIdEmpleado.value = empleado.id;
    selectDispositivo.value = empleado.dispositivo;
    selectNivelSeguridad.value = empleado.nivelSeguridad;
    
    mostrarOpcionesCredencial();
    if (empleado.dispositivo === 'tarjeta') {
        inputNumeroTarjeta.value = empleado.credencial;
    } else if (empleado.dispositivo === 'pin') {
        inputPin.value = empleado.credencial;
    } else if (empleado.dispositivo === 'huella' && empleado.credencial === 'huella_registrada') {
        huellaStatus.className = 'huella-status registrada';
        huellaStatus.innerHTML = '<i class="fa-solid fa-check-circle"></i> Huella registrada';
    }
    
    if (empleado.foto) {
        fotoActual = empleado.foto;
        fotoPreview.innerHTML = `<img src="${empleado.foto}" alt="Foto del empleado">`;
        fotoPreview.classList.add('has-image');
    }
    
    cargarDatosAdicionales(empleado.metodo_adicional);
    
    editandoIndex = empleadoId;
    btnCancelar.style.display = 'inline-flex';
    formTitle.textContent = 'Editar Empleado';
    document.querySelector('.form-panel').scrollIntoView({ behavior: 'smooth' });
    mostrarMensaje(`Editando: ${empleado.nombre}`);
}

function eliminarEmpleado(empleadoId) {
    if (!confirm('¿Eliminar este empleado?')) return;
    
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value || getCookie('csrftoken');
    
    fetch(`/personal/api/personal/${empleadoId}/`, {
        method: 'DELETE',
        headers: { 'X-CSRFToken': csrfToken }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            mostrarMensaje('Empleado eliminado');
            if (editandoIndex == empleadoId) limpiarFormulario();
            cargarPersonal();
        } else {
            mostrarMensaje(`Error: ${data.error}`, 'error');
        }
    })
    .catch(error => mostrarMensaje('Error al eliminar', 'error'));
}

function nuevoEmpleado() {
    limpiarFormulario();
    mostrarMensaje('Nuevo empleado');
}

function cancelarEdicion() {
    limpiarFormulario();
    mostrarMensaje('Edición cancelada');
}

// ===== FUNCIONES DE SELECCIÓN MÚLTIPLE =====

function obtenerSeleccionados() {
    const checkboxes = document.querySelectorAll('.checkbox-empleado:checked');
    return Array.from(checkboxes).map(cb => ({
        id: parseInt(cb.getAttribute('data-id')),
        nombre: cb.getAttribute('data-nombre')
    }));
}

function actualizarContadorSeleccionados() {
    const checkboxes = document.querySelectorAll('.checkbox-empleado:checked');
    const contador = checkboxes.length;
    const footer = document.getElementById('selection-footer');
    const contadorSpan = document.getElementById('contador-seleccionados');
    
    if (contadorSpan) contadorSpan.textContent = contador;
    if (footer) footer.style.display = contador > 0 ? 'flex' : 'none';
    
    document.querySelectorAll('tbody tr').forEach(row => {
        const checkbox = row.querySelector('.checkbox-empleado');
        if (checkbox && checkbox.checked) {
            row.classList.add('seleccionado');
        } else {
            row.classList.remove('seleccionado');
        }
    });
    
    const totalCheckboxes = document.querySelectorAll('.checkbox-empleado').length;
    const checkboxesMarcados = document.querySelectorAll('.checkbox-empleado:checked').length;
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
    document.querySelectorAll('.checkbox-empleado').forEach(cb => {
        cb.checked = checkbox.checked;
    });
    actualizarContadorSeleccionados();
}

function seleccionarTodos() {
    document.querySelectorAll('.checkbox-empleado').forEach(cb => cb.checked = true);
    actualizarContadorSeleccionados();
}

function deseleccionarTodos() {
    document.querySelectorAll('.checkbox-empleado').forEach(cb => cb.checked = false);
    actualizarContadorSeleccionados();
}

function eliminarSeleccionados() {
    const seleccionados = obtenerSeleccionados();
    
    if (seleccionados.length === 0) {
        mostrarMensaje('No hay empleados seleccionados', 'error');
        return;
    }
    
    if (!confirm(`¿Eliminar ${seleccionados.length} empleado(s)?`)) return;
    
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value || getCookie('csrftoken');
    let eliminados = 0;
    let errores = 0;
    
    const promesas = seleccionados.map(emp => {
        return fetch(`/personal/api/personal/${emp.id}/`, {
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
        cargarPersonal();
    });
}

// ===== FUNCIONES DE IMPORTAR/EXPORTAR =====

function crearInputCSV() {
    if (!csvInput) {
        csvInput = document.createElement('input');
        csvInput.type = 'file';
        csvInput.accept = '.csv,.txt';
        csvInput.style.display = 'none';
        csvInput.addEventListener('change', manejarArchivoCSV);
        document.body.appendChild(csvInput);
    }
}

function manejarArchivoCSV(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const csvData = e.target.result;
            const empleadosImportados = parsearCSV(csvData);
            if (empleadosImportados.length > 0) {
                mostrarModalImportacion(empleadosImportados);
            } else {
                mostrarMensaje('No se encontraron datos válidos', 'error');
            }
        } catch (error) {
            mostrarMensaje('Error al procesar CSV: ' + error.message, 'error');
        }
    };
    reader.onerror = function() {
        mostrarMensaje('Error al leer el archivo', 'error');
    };
    reader.readAsText(file);
    event.target.value = '';
}

function parsearCSV(csvText) {
    const lines = csvText.split('\n').filter(line => line.trim() !== '');
    if (lines.length < 2) throw new Error('Archivo vacío');
    
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const headersRequeridos = ['nombre', 'cargo', 'area', 'correo'];
    const headersFaltantes = headersRequeridos.filter(h => !headers.includes(h));
    if (headersFaltantes.length > 0) {
        throw new Error(`Faltan columnas: ${headersFaltantes.join(', ')}`);
    }
    
    const empleadosImportados = [];
    
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const values = [];
        let current = '', inQuotes = false;
        for (let char of line) {
            if (char === '"') inQuotes = !inQuotes;
            else if (char === ',' && !inQuotes) {
                values.push(current);
                current = '';
            } else current += char;
        }
        values.push(current);
        
        const empleado = {};
        headers.forEach((header, idx) => {
            if (idx < values.length) {
                const value = values[idx].trim();
                switch (header) {
                    case 'nombre': empleado.nombre = value; break;
                    case 'cargo': empleado.cargo = value; break;
                    case 'area': empleado.area = value; break;
                    case 'correo': empleado.correo = value.endsWith('@biometrika.com') ? value : value + '@biometrika.com'; break;
                    case 'tipo_sede': empleado.tipoSede = value || 'sede'; break;
                    case 'nombre_sede': empleado.nombreSede = value || 'Sede Central'; break;
                    case 'id': empleado.id = value; break;
                    case 'dispositivo': empleado.dispositivo = value || 'huella'; break;
                    case 'nivel_seguridad': empleado.nivelSeguridad = value || 'medio'; break;
                }
            }
        });
        
        if (!empleado.id) empleado.id = generarID(empleado.nombre);
        if (!empleado.tipoSede) empleado.tipoSede = 'sede';
        if (!empleado.nombreSede) empleado.nombreSede = 'Sede Central';
        if (!empleado.dispositivo) empleado.dispositivo = 'huella';
        if (!empleado.nivelSeguridad) empleado.nivelSeguridad = 'medio';
        empleado.credencial = generarCredencial(empleado.dispositivo);
        empleado.foto = null;
        empleado.metodo_adicional = null;
        
        empleadosImportados.push(empleado);
    }
    
    return empleadosImportados;
}

function parsearLineaCSV(line) {
    const values = [];
    let current = '', inQuotes = false;
    for (let char of line) {
        if (char === '"') inQuotes = !inQuotes;
        else if (char === ',' && !inQuotes) {
            values.push(current);
            current = '';
        } else current += char;
    }
    values.push(current);
    return values;
}

function generarID(nombre) {
    const nombreBase = nombre.split(' ')[0].toLowerCase();
    const random = Math.random().toString().substr(2, 3);
    return `EMP-${nombreBase}-${random}`.toUpperCase();
}

function generarCredencial(dispositivo) {
    switch (dispositivo) {
        case 'tarjeta': return 'TARJ-' + Math.random().toString(36).substr(2, 8).toUpperCase();
        case 'pin': return Math.floor(100000 + Math.random() * 900000).toString();
        case 'huella': return 'huella_registrada';
        default: return '';
    }
}

function mostrarModalImportacion(empleadosImportados) {
    const modal = document.createElement('div');
    modal.className = 'modal-importacion';
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:2000;';
    
    modal.innerHTML = `
        <div style="background:white;padding:30px;border-radius:12px;max-width:600px;width:90%;max-height:80vh;overflow-y:auto;">
            <h3 style="color:#2c3e50;margin-bottom:20px;"><i class="fa-solid fa-file-import" style="color:#1abc9c;"></i> Confirmar Importación</h3>
            <p>Se encontraron <strong>${empleadosImportados.length}</strong> empleados.</p>
            <div style="max-height:300px;overflow-y:auto;margin:20px 0;border:1px solid #e0e0e0;border-radius:8px;padding:15px;">
                <table style="width:100%;border-collapse:collapse;font-size:12px;">
                    <thead><tr style="background:#f8f9fa;"><th>Nombre</th><th>Cargo</th><th>Área</th><th>ID</th></tr></thead>
                    <tbody>${empleadosImportados.map(emp => `<tr><td>${emp.nombre}</td><td>${emp.cargo}</td><td>${emp.area}</td><td>${emp.id}</td></tr>`).join('')}</tbody>
                </table>
            </div>
            <div style="display:flex;gap:10px;justify-content:flex-end;">
                <button id="btn-cancelar-import" class="btn btn-secondary">Cancelar</button>
                <button id="btn-confirmar-import" class="btn btn-success">Importar ${empleadosImportados.length}</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.getElementById('btn-cancelar-import').onclick = () => document.body.removeChild(modal);
    document.getElementById('btn-confirmar-import').onclick = () => {
        empleados.push(...empleadosImportados);
        actualizarTabla();
        mostrarMensaje(`Importados ${empleadosImportados.length} empleados`);
        document.body.removeChild(modal);
    };
    modal.onclick = (e) => { if (e.target === modal) document.body.removeChild(modal); };
}

function importarEmpleados() { crearInputCSV(); csvInput.click(); }

function exportarEmpleados() {
    if (empleados.length === 0) {
        mostrarMensaje('No hay empleados para exportar', 'error');
        return;
    }
    
    const headers = ['ID', 'Nombre', 'Cargo', 'Área', 'Correo', 'Tipo Sede', 'Nombre Sede', 'Dispositivo', 'Nivel Seguridad', 'Credencial', 'Metodo Adicional'];
    const csvRows = [headers.join(',')];
    
    empleados.forEach(emp => {
        const row = [emp.id, `"${emp.nombre}"`, `"${emp.cargo}"`, emp.area, emp.correo, emp.tipoSede, `"${emp.nombreSede}"`, emp.dispositivo, emp.nivelSeguridad, emp.credencial, emp.metodo_adicional ? emp.metodo_adicional.tipo : ''];
        csvRows.push(row.join(','));
    });
    
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `empleados_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    mostrarMensaje('Empleados exportados');
}

function actualizarListado() { cargarPersonal(); mostrarMensaje('Listado actualizado'); }

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

function cargarPersonal() {
    fetch('/personal/api/personal/')
        .then(response => response.json())
        .then(data => {
            empleados = data.map(p => ({
                id: p.id || p.numero_documento,
                nombre: p.nombre,
                cargo: p.cargo || 'N/A',
                area: p.area || 'ti',
                correo: p.email,
                tipoSede: p.tipo_sede || 'sede',
                nombreSede: p.nombre_sede || 'Sede Central',
                dispositivo: p.dispositivo || 'huella',
                nivelSeguridad: p.nivel_seguridad || 'medio',
                credencial: p.credencial || '',
                foto: p.foto,
                metodo_adicional: p.metodo_adicional
            }));
            actualizarTabla();
        })
        .catch(error => mostrarMensaje('Error al cargar datos', 'error'));
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

// ===== INICIALIZACIÓN =====

document.addEventListener('DOMContentLoaded', function() {
    formulario.addEventListener('submit', guardarEmpleado);
    
    inputFoto.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                fotoActual = e.target.result;
                fotoPreview.innerHTML = `<img src="${fotoActual}" alt="Foto del empleado">`;
                fotoPreview.classList.add('has-image');
            };
            reader.readAsDataURL(file);
        }
    });
    
    selectDispositivo.addEventListener('change', mostrarOpcionesCredencial);
    selectArea.addEventListener('change', manejarAreaPersonalizada);
    
    if (toggleAdicional) toggleAdicional.addEventListener('change', mostrarSeccionAdicional);
    if (tipoAdicional) tipoAdicional.addEventListener('change', manejarTipoAdicional);
    if (nivelSeguridadAdicional) nivelSeguridadAdicional.addEventListener('change', actualizarStatusAdicional);
    if (btnGenerarAdicional) btnGenerarAdicional.addEventListener('click', generarCredencialAdicional);
    
    btnLimpiarFiltros.addEventListener('click', () => {
        filtroNombre.value = '';
        filtroArea.value = '';
        filtroSede.value = '';
        actualizarTabla();
    });
    
    filtroNombre.addEventListener('input', actualizarTabla);
    filtroArea.addEventListener('change', actualizarTabla);
    filtroSede.addEventListener('change', actualizarTabla);
    
    dropdownMenuButton.addEventListener('click', toggleDropdown);
    opcionImportar.addEventListener('click', (e) => { e.stopPropagation(); importarEmpleados(); dropdownMenu.classList.remove('show'); });
    opcionExportar.addEventListener('click', (e) => { e.stopPropagation(); exportarEmpleados(); dropdownMenu.classList.remove('show'); });
    opcionRefresh.addEventListener('click', (e) => { e.stopPropagation(); actualizarListado(); dropdownMenu.classList.remove('show'); });
    document.addEventListener('click', cerrarDropdown);
    dropdownMenu.addEventListener('click', (e) => e.stopPropagation());
    
    inputNombre.addEventListener('blur', function() {
        if (!inputIdEmpleado.value && inputNombre.value) {
            const nombre = inputNombre.value.split(' ')[0].toLowerCase();
            const random = Math.random().toString().substr(2, 3);
            inputIdEmpleado.value = `EMP-${nombre}-${random}`.toUpperCase();
        }
    });
    
    inputNombre.addEventListener('blur', function() {
        if (!inputCorreo.value && inputNombre.value) {
            const nombre = inputNombre.value.split(' ')[0].toLowerCase();
            const apellido = inputNombre.value.split(' ')[1] || '';
            inputCorreo.value = apellido ? `${nombre}.${apellido.toLowerCase()}@biometrika.com` : `${nombre}@biometrika.com`;
            inputCorreo.value = inputCorreo.value.replace(/[^a-zA-Z0-9.@]/g, '');
        }
    });
    
    btnNuevo.addEventListener('click', nuevoEmpleado);
    btnCancelar.addEventListener('click', cancelarEdicion);
    
    cargarPersonal();
});