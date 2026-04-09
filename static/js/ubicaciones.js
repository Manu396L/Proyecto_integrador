// Datos de ejemplo
let ubicaciones = [];

// Elementos DOM
const cuerpoTabla = document.getElementById('cuerpoTabla');
const estadoVacio = document.getElementById('estado-vacio');
const tablaUbicaciones = document.getElementById('tablaUbicaciones');
const btnAgregar = document.querySelector('.btn');
const btnAgregarPrimero = document.getElementById('btn-agregar-primero');
const btnLimpiarFiltros = document.getElementById('btn-limpiar-filtros');

// Elementos de filtro
const filtroNombre = document.getElementById('filtro-nombre');
const filtroTipo = document.getElementById('filtro-tipo');
const filtroDispositivo = document.getElementById('filtro-dispositivo');
const seccionFiltros = document.getElementById('filtros');

// Elementos del formulario
const inputCodigo = document.getElementById('codigo_unico');
const inputNombre = document.getElementById('nombre_sede');
const selectTipo = document.getElementById('tipo_ubicacion');
const selectDispositivo = document.getElementById('dispositivo_biometrico');
const selectSeguridad = document.getElementById('nivel_seguridad');

// Elementos del dropdown
const dropdownMenuButton = document.getElementById('dropdownMenuButton');
const dropdownMenu = document.getElementById('dropdownMenu');
const opcionFiltros = document.getElementById('opcion-filtros');
const opcionModificarTodo = document.getElementById('opcion-modificar-todo');
const opcionEliminarTodo = document.getElementById('opcion-eliminar-todo');

// Variable para controlar si estamos editando
let editandoIndex = null;

// Función para actualizar la tabla
function actualizarTabla() {
    // Aplicar filtros
    let ubicacionesFiltradas = ubicaciones;
    
    if (filtroNombre.value) {
        ubicacionesFiltradas = ubicacionesFiltradas.filter(u => 
            u.nombre.toLowerCase().includes(filtroNombre.value.toLowerCase())
        );
    }
    
    if (filtroTipo.value) {
        ubicacionesFiltradas = ubicacionesFiltradas.filter(u => u.tipo === filtroTipo.value);
    }
    
    if (filtroDispositivo.value) {
        ubicacionesFiltradas = ubicacionesFiltradas.filter(u => u.dispositivo === filtroDispositivo.value);
    }
    
    // Limpiar tabla
    cuerpoTabla.innerHTML = '';
    
    // Mostrar estado vacío o tabla
    if (ubicacionesFiltradas.length === 0) {
        estadoVacio.style.display = 'block';
        tablaUbicaciones.style.display = 'none';
    } else {
        estadoVacio.style.display = 'none';
        tablaUbicaciones.style.display = 'table';
        
        // Llenar tabla con ubicaciones
        ubicacionesFiltradas.forEach((ubicacion, index) => {
            const fila = document.createElement('tr');
            
            // Formatear valores para mostrar
            const tipoTexto = {
                'sede': 'Sede',
                'oficina': 'Oficina',
                'area': 'Área'
            }[ubicacion.tipo] || ubicacion.tipo;
            
            const dispositivoTexto = {
                'huella': 'Lector de Huella',
                'Tarjeta': 'Tarjeta de Acceso',
                'PIN': 'PIN'
            }[ubicacion.dispositivo] || ubicacion.dispositivo;
            
            const seguridadTexto = {
                'bajo': 'Bajo',
                'medio': 'Medio',
                'alto': 'Alto'
            }[ubicacion.seguridad] || ubicacion.seguridad;
            
            // Determinar clases para badges
            const tipoBadgeClass = {
                'sede': 'badge-sede',
                'oficina': 'badge-oficina',
                'area': 'badge-area'
            }[ubicacion.tipo] || '';
            
            const seguridadBadgeClass = {
                'bajo': 'badge-bajo',
                'medio': 'badge-medio',
                'alto': 'badge-alto'
            }[ubicacion.seguridad] || '';
            
            fila.innerHTML = `
                <td>${ubicacion.codigo}</td>
                <td>${ubicacion.nombre}</td>
                <td><span class="badge-tipo ${tipoBadgeClass}">${tipoTexto}</span></td>
                <td>${dispositivoTexto}</td>
                <td><span class="badge-seguridad ${seguridadBadgeClass}">${seguridadTexto}</span></td>
                <td class="acciones">
                    <button class="btn-accion btn-editar" data-index="${index}">
                        <i class="fa-solid fa-pen"></i> Editar
                    </button>
                    <button class="btn-accion btn-eliminar" data-index="${index}">
                        <i class="fa-solid fa-trash"></i> Eliminar
                    </button>
                </td>
            `;
            
            cuerpoTabla.appendChild(fila);
        });
        
        // Agregar event listeners a los botones de editar y eliminar
        document.querySelectorAll('.btn-editar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(btn.getAttribute('data-index'));
                editarUbicacion(index);
            });
        });
        
        document.querySelectorAll('.btn-eliminar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(btn.getAttribute('data-index'));
                eliminarUbicacion(index);
            });
        });
    }
}

// Función para agregar ubicación
function agregarUbicacion(e) {
    if (e) e.preventDefault();
    
    const codigo = inputCodigo.value.trim();
    const nombre = inputNombre.value.trim();
    const tipo = selectTipo.value;
    const dispositivo = selectDispositivo.value;
    const seguridad = selectSeguridad.value;
    
    if (!codigo || !nombre || !tipo) {
        alert('Por favor, complete los campos obligatorios (Código, Nombre y Tipo)');
        return;
    }
    
    const nuevaUbicacion = {
        codigo,
        nombre,
        tipo,
        dispositivo,
        seguridad
    };
    
    if (editandoIndex !== null) {
        // Actualizar ubicación existente
        ubicaciones[editandoIndex] = nuevaUbicacion;
        editandoIndex = null;
        btnAgregar.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Guardar Cambios';
        mostrarMensaje('Ubicación actualizada correctamente');
    } else {
        // Agregar nueva ubicación
        ubicaciones.push(nuevaUbicacion);
        mostrarMensaje('Ubicación registrada correctamente');
    }
    
    // Limpiar formulario
    limpiarFormulario();
    
    // Actualizar tabla
    actualizarTabla();
}

// Función para mostrar mensaje de éxito
function mostrarMensaje(mensaje) {
    const mensajeExito = document.getElementById('mensaje-exito');
    mensajeExito.innerHTML = `<i class="fa-solid fa-check"></i> ${mensaje}`;
    mensajeExito.classList.add('mostrar');
    
    setTimeout(() => {
        mensajeExito.classList.remove('mostrar');
    }, 3000);
}

// Función para limpiar formulario
function limpiarFormulario() {
    inputCodigo.value = '';
    inputNombre.value = '';
    selectTipo.value = '';
    selectDispositivo.value = '';
    selectSeguridad.value = '';
}

// Función para editar ubicación - CORREGIDA
function editarUbicacion(index) {
    console.log('Editando ubicación:', index); // Para debug
    
    // Encontrar la ubicación original (sin filtros aplicados)
    const ubicacionOriginal = ubicaciones[index];
    
    if (!ubicacionOriginal) {
        console.error('Ubicación no encontrada en el índice:', index);
        return;
    }
    
    console.log('Datos de la ubicación:', ubicacionOriginal);
    
    // Llenar formulario con datos existentes
    inputCodigo.value = ubicacionOriginal.codigo;
    inputNombre.value = ubicacionOriginal.nombre;
    selectTipo.value = ubicacionOriginal.tipo;
    selectDispositivo.value = ubicacionOriginal.dispositivo || '';
    selectSeguridad.value = ubicacionOriginal.seguridad || '';
    
    // Cambiar el botón a "Actualizar"
    editandoIndex = index;
    btnAgregar.innerHTML = '<i class="fa-solid fa-sync"></i> Actualizar Ubicación';
    
    // Cambiar el texto del botón "Agregar Primera Ubicación" si existe
    if (btnAgregarPrimero) {
        btnAgregarPrimero.innerHTML = '<i class="fa-solid fa-sync"></i> Actualizar Ubicación';
    }
    
    // Hacer scroll al formulario
    document.querySelector('.add-panel').scrollIntoView({ behavior: 'smooth' });
    
    // Mostrar mensaje informativo
    mostrarMensaje(`Editando ubicación: ${ubicacionOriginal.nombre}`);
}

// Función para eliminar ubicación
function eliminarUbicacion(index) {
    if (confirm('¿Está seguro de que desea eliminar esta ubicación?')) {
        ubicaciones.splice(index, 1);
        actualizarTabla();
        mostrarMensaje('Ubicación eliminada correctamente');
        
        // Si estábamos editando y eliminamos la misma ubicación, limpiar formulario
        if (editandoIndex === index) {
            editandoIndex = null;
            btnAgregar.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Guardar Cambios';
            if (btnAgregarPrimero) {
                btnAgregarPrimero.innerHTML = '<i class="fa-solid fa-plus"></i> Agregar Primera Ubicación';
            }
            limpiarFormulario();
        }
    }
}

// Función para limpiar filtros
function limpiarFiltros() {
    filtroNombre.value = '';
    filtroTipo.value = '';
    filtroDispositivo.value = '';
    actualizarTabla();
}

// Función para mostrar/ocultar filtros
function toggleFiltros() {
    if (seccionFiltros.style.display === 'none' || seccionFiltros.style.display === '') {
        seccionFiltros.style.display = 'flex';
    } else {
        seccionFiltros.style.display = 'none';
    }
}

// Función para modificar todas las ubicaciones
function modificarTodo() {
    if (ubicaciones.length === 0) {
        alert('No hay ubicaciones para modificar');
        return;
    }
    
    // Aquí podrías implementar una lógica para modificar todas las ubicaciones
    // Por ejemplo, abrir un modal con opciones de modificación masiva
    const nuevoDispositivo = prompt('Ingrese el nuevo tipo de dispositivo para todas las ubicaciones:');
    if (nuevoDispositivo) {
        ubicaciones.forEach(ubicacion => {
            ubicacion.dispositivo = nuevoDispositivo;
        });
        actualizarTabla();
        mostrarMensaje('Todas las ubicaciones han sido actualizadas');
    }
}

// Función para eliminar todas las ubicaciones
function eliminarTodo() {
    if (ubicaciones.length === 0) {
        alert('No hay ubicaciones para eliminar');
        return;
    }
    
    if (confirm('¿Está seguro de que desea eliminar TODAS las ubicaciones? Esta acción no se puede deshacer.')) {
        ubicaciones = [];
        actualizarTabla();
        mostrarMensaje('Todas las ubicaciones han sido eliminadas');
        
        // Limpiar formulario si estaba editando
        if (editandoIndex !== null) {
            editandoIndex = null;
            btnAgregar.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Guardar Cambios';
            if (btnAgregarPrimero) {
                btnAgregarPrimero.innerHTML = '<i class="fa-solid fa-plus"></i> Agregar Primera Ubicación';
            }
            limpiarFormulario();
        }
    }
}

// Función para manejar el dropdown del menú de opciones
function toggleDropdown(e) {
    e.stopPropagation();
    dropdownMenu.classList.toggle('show');
}

// Cerrar dropdown al hacer clic fuera
function cerrarDropdown(e) {
    if (!dropdownMenu.contains(e.target) && !dropdownMenuButton.contains(e.target)) {
        dropdownMenu.classList.remove('show');
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Formulario
    const formulario = document.getElementById('formularioUbicacion');
    formulario.addEventListener('submit', agregarUbicacion);
    
    // Botón "Agregar Primera Ubicación"
    btnAgregarPrimero.addEventListener('click', function(e) {
        e.preventDefault();
        if (editandoIndex !== null) {
            // Si está editando, actualizar
            agregarUbicacion(e);
        } else {
            // Si no está editando, agregar nueva
            agregarUbicacion(e);
        }
    });
    
    // Filtros
    btnLimpiarFiltros.addEventListener('click', limpiarFiltros);
    filtroNombre.addEventListener('input', actualizarTabla);
    filtroTipo.addEventListener('change', actualizarTabla);
    filtroDispositivo.addEventListener('change', actualizarTabla);
    
    // Dropdown functionality
    dropdownMenuButton.addEventListener('click', toggleDropdown);
    
    // Opciones del dropdown
    opcionFiltros.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleFiltros();
        dropdownMenu.classList.remove('show');
    });
    
    opcionModificarTodo.addEventListener('click', function(e) {
        e.stopPropagation();
        modificarTodo();
        dropdownMenu.classList.remove('show');
    });
    
    opcionEliminarTodo.addEventListener('click', function(e) {
        e.stopPropagation();
        eliminarTodo();
        dropdownMenu.classList.remove('show');
    });
    
    // Cerrar dropdown al hacer clic fuera
    document.addEventListener('click', cerrarDropdown);
    
    // Prevenir que el dropdown se cierre cuando se hace clic dentro de él
    dropdownMenu.addEventListener('click', function(e) {
        e.stopPropagation();
    });
    
    // Inicializar tabla
    actualizarTabla();
    
    // Agregar algunas ubicaciones de ejemplo
    ubicaciones = [
        {
            codigo: 'WAN-001',
            nombre: 'Sede Central',
            tipo: 'sede',
            dispositivo: 'huella',
            seguridad: 'alto'
        },
        {
            codigo: 'WAN-002',
            nombre: 'Oficina Administrativa',
            tipo: 'oficina',
            dispositivo: 'Tarjeta',
            seguridad: 'medio'
        },
        {
            codigo: 'WAN-003',
            nombre: 'Sala de Servidores',
            tipo: 'area',
            dispositivo: 'PIN',
            seguridad: 'alto'
        }
    ];
    actualizarTabla();
});