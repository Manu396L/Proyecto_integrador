// Elementos DOM - ASEGURANDO QUE EXISTAN
const cuerpoTabla = document.getElementById('cuerpoTabla');
const estadoVacio = document.getElementById('estado-vacio');
const tablaUbicaciones = document.getElementById('tablaUbicaciones');
const btnAgregar = document.getElementById('btn-guardar');
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
const dropdownMenuButton = document.getElementById('dropdownMenuButton') || document.querySelector('[id="dropdown"]');
const dropdownMenu = document.getElementById('dropdownMenu') || document.querySelector('.dropdown-menu');
const opcionFiltros = document.getElementById('opcion-filtros');
const opcionModificarTodo = document.getElementById('opcion-modificar-todo');
const opcionEliminarTodo = document.getElementById('opcion-eliminar-todo');

// Variables de estado
let ubicaciones = [];
let sedesCache = [];
let areasCache = [];
let editandoIndex = null;
let editandoId = null;
let editandoTipo = null;

// Función para cargar ubicaciones desde la API
async function cargarUbicaciones() {
    try {
        // Cargar sedes
        console.log('%c[CARGANDO UBICACIONES] Solicitando sedes...', 'background: #3498db; color: white; padding: 3px 8px;');
        const respSedes = await fetch('/sedes/api/sedes/');
        sedesCache = await respSedes.json();
        console.log(`  ✅ Sedes cargadas: ${sedesCache.length} sedes`);
        console.log('  Datos:', sedesCache);
        
        // Cargar áreas
        console.log('%c[CARGANDO UBICACIONES] Solicitando áreas...', 'background: #3498db; color: white; padding: 3px 8px;');
        const respAreas = await fetch('/sedes/api/areas/');
        areasCache = await respAreas.json();
        console.log(`  ✅ Áreas cargadas: ${areasCache.length} áreas`);
        console.log('  Datos:', areasCache);
        
        // Combinar sedes y áreas en el array ubicaciones
        ubicaciones = [];
        
        // Agregar sedes
        sedesCache.forEach(sede => {
            // Las sedes usan el nivel de seguridad más bajo de sus áreas
            const areasDelaSede = areasCache.filter(a => a.sede_id === sede.id);
            let nivelSede = 'bajo'; // Default bajo
            
            // Si hay áreas, usar el nivel más restrictivo (alto > medio > bajo)
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
                ciudad: sede.ciudad,
                dispositivo: 'acceso_general',
                seguridad: nivelSede  // ✅ Usar nivel real basado en áreas
            });
        });
        
        // Agregar áreas
        areasCache.forEach(area => {
            console.log(`  [ÁREA] Código: ${area.codigo_acceso}, Nivel: ${area.nivel_seguridad}, Dispositivo: ${area.dispositivo_biometrico}`);
            ubicaciones.push({
                id: area.id,
                tipo: 'area',
                codigo: area.codigo_acceso,
                nombre: area.nombre,
                piso: area.piso,
                sede_id: area.sede_id,
                dispositivo: area.dispositivo_biometrico || 'huella',
                seguridad: area.nivel_seguridad || 'bajo'
            });
        });
        
        console.log(`%c[✅ UBICACIONES COMPLETO] Total: ${ubicaciones.length} ubicaciones`, 'background: #27ae60; color: white; padding: 3px 8px;');
        console.log('  Array ubicaciones:', ubicaciones);
        
        actualizarTabla();
        
        if (ubicaciones.length === 0) {
            console.log('%c[ADVERTENCIA] No hay ubicaciones registradas', 'background: #f39c12; color: white; padding: 3px 8px;');
            mostrarMensaje('ℹ️ No hay ubicaciones registradas', 'info');
        }
    } catch (error) {
        console.error('%c[ERROR CRÍTICO EN CARGARUBICACIONES]', 'background: #e74c3c; color: white; padding: 5px 10px;');
        console.error('Error:', error);
        console.error('Stack:', error.stack);
        mostrarMensaje('Error al cargar ubicaciones', 'error');
    }
}

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
                    <button class="btn-accion btn-editar" data-type="${ubicacion.tipo}" data-id="${ubicacion.id}">
                        <i class="fa-solid fa-pen"></i> Editar
                    </button>
                    <button class="btn-accion btn-eliminar" data-type="${ubicacion.tipo}" data-id="${ubicacion.id}">
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
                const tipo = btn.getAttribute('data-type');
                const id = parseInt(btn.getAttribute('data-id'));
                editarUbicacion(tipo, id);
            });
        });
        
        document.querySelectorAll('.btn-eliminar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const tipo = btn.getAttribute('data-type');
                const id = parseInt(btn.getAttribute('data-id'));
                eliminarUbicacion(tipo, id);
            });
        });
    }
}

// Función para agregar o actualizar ubicación
function agregarUbicacion(e) {
    console.log('%c===== GUARDAR UBICACION INICIADO =====', 'background: #ff6b6b; color: white; padding: 5px 10px; border-radius: 3px;');
    console.log('Event object:', e);
    console.log('Event type:', e?.type);
    
    if (e) {
        e.preventDefault();
        console.log('✅ preventDefault() ejecutado');
    }
    
    console.log('---Obteniendo valores del formulario---');
    const codigo = inputCodigo.value.trim();
    const nombre = inputNombre.value.trim();
    const tipo = selectTipo.value;
    const dispositivo = selectDispositivo.value;
    const seguridad = selectSeguridad.value;
    
    console.log('Código:', codigo, '| Vacío:', !codigo);
    console.log('Nombre:', nombre, '| Vacío:', !nombre);
    console.log('Tipo:', tipo, '| Vacío:', !tipo);
    console.log('Dispositivo:', dispositivo);
    console.log('Seguridad:', seguridad);
    console.log('Editando ID:', editandoId);
    console.log('Editando Tipo:', editandoTipo);
        if (!codigo || !nombre || !tipo) {
        console.log('%c❌ VALIDACION HTML FALLIDA', 'background: #ff4444; color: white; padding: 5px 10px; border-radius: 3px;');
        console.log('Campos faltantes:');
        if (!codigo) console.log('  - Código está vacío');
        if (!nombre) console.log('  - Nombre está vacío');
        if (!tipo) console.log('  - Tipo está vacío (ESTO BLOQUEARÁ ENVÍO)');
        mostrarMensaje('❌ Por favor, complete los campos obligatorios (Código, Nombre y Tipo)', 'error');
        return false;  // RETORNAR FALSE PARA DETENER
    }
    console.log('%c✅ Validación HTML PASADA', 'background: #44dd44; color: white; padding: 5px 10px; border-radius: 3px;');
    // Obtener CSRF token
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value || getCookie('csrftoken');
    console.log('CSRF Token obtenido:', csrfToken ? '✅ SÍ' : '❌ NO');
    
    // Preparar datos para enviar a la API
    let url, datos, metodo;
    console.log('%c--- PREPARANDO SOLICITUD SEGÚN TIPO ---', 'background: #4a90e2; color: white; padding: 3px 8px; border-radius: 2px;');
    
    if (editandoId !== null) {
        // ACTUALIZAR ubicación existente
        console.log('MODO: ACTUALIZAR (editandoId = ' + editandoId + ')');
        metodo = 'PUT';
        
        if (editandoTipo === 'sede') {
            console.log('  Tipo: SEDE');
            url = `/sedes/api/sedes/${editandoId}/`;
            datos = {
                nombre: nombre,
                direccion: '',
                ciudad: 'N/A',
                telefono: '',
                email: codigo + '@empresa.com',
                encargado: ''
            };
        } else if (editandoTipo === 'area') {
            console.log('  Tipo: ÁREA');
            url = `/sedes/api/areas/${editandoId}/`;
            // Extraer número de piso del código
            const pisoMatch = codigo.match(/\d+/);
            datos = {
                nombre: nombre,
                descripcion: '',
                piso: pisoMatch ? parseInt(pisoMatch[0]) : 1,
                codigo_acceso: codigo,
                dispositivo: dispositivo,
                nivel_seguridad: seguridad
            };
        }
    } else {
        // CREAR nueva ubicación
        console.log('MODO: CREAR (editandoId = null)');
        metodo = 'POST';
        
        if (tipo === 'sede') {
            console.log('  Tipo: SEDE');
            url = '/sedes/api/crear/';
            datos = {
                nombre: nombre,
                direccion: '',
                ciudad: 'N/A',
                telefono: '',
                email: codigo + '@empresa.com',
                encargado: ''
            };
        } else if (tipo === 'area') {
            console.log('  Tipo: ÁREA');
            url = '/sedes/api/areas/crear/';
            // Extraer número de piso del código
            const pisoMatch = codigo.match(/\d+/);
            datos = {
                sede_id: 1,
                nombre: nombre,
                descripcion: '',
                piso: pisoMatch ? parseInt(pisoMatch[0]) : 1,
                codigo_acceso: codigo,
                dispositivo: dispositivo,
                nivel_seguridad: seguridad
            };
            console.log('Datos a enviar (crear área):', datos);
        } else {
            console.log('%c❌ TIPO NO VÁLIDO', 'background: #ff4444; color: white; padding: 3px 8px;');
            mostrarMensaje('❌ Tipo de ubicación no válido', 'error');
            return false;
        }
    }
    
    // PUNTO CRÍTICO: Aquí es donde se va a enviar
    console.log('%c--- LISTA PARA ENVIAR ---', 'background: #9b59b6; color: white; padding: 5px 10px; border-radius: 3px;');
    console.log('URL final:', url);
    console.log('Método:', metodo);
    console.log('Datos a enviar:', JSON.stringify(datos, null, 2));
    console.log('CSRF Token:', csrfToken?.substring(0, 20) + '...' || 'NO ENCONTRADO');
    
    // Enviar a la API
    fetch(url, {
        method: metodo,
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
        },
        body: JSON.stringify(datos)
    })
    .then(async response => {
        console.log('%c--- RESPUESTA RECIBIDA DEL SERVIDOR ---', 'background: #27ae60; color: white; padding: 5px 10px; border-radius: 3px;');
        console.log('HTTP Status:', response.status);
        console.log('HTTP OK:', response.ok);
        console.log('Content-Type:', response.headers.get('content-type'));
        
        // Intentar parsear como JSON
        let data;
        try {
            data = await response.json();
            console.log('✅ JSON parseado correctamente');
            console.log('Response data:', data);
        } catch (e) {
            console.log('%c❌ ERROR al parsear JSON', 'background: #ff4444; color: white;');
            console.log('Response text:', await response.text());
            throw new Error('Invalid JSON response: ' + e.message);
        }
        
        return data;
    })
    .then(async data => {
        console.log('%c===== PROCESANDO RESPUESTA =====', 'background: #2980b9; color: white; padding: 5px 10px; border-radius: 3px;');
        console.log('Response completo:', data);
        console.log('Success:', data.success);
        console.log('========================================');
            if (editandoId !== null) {
                mostrarMensaje('✅ Ubicación actualizada correctamente', 'success');
            } else {
                mostrarMensaje('✅ ' + data.message, 'success');
            }
            
            // Limpiar formulario
            limpiarFormulario();
            editandoId = null;
            editandoTipo = null;
            editandoIndex = null;
            btnAgregar.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Guardar Cambios';
            
            // Recargar ubicaciones desde la API
            console.log('Recargando ubicaciones desde API...');
            cargarUbicaciones();
        } else {
            console.log('%c❌ FALLO EN RESPUESTA DEL SERVIDOR', 'background: #e74c3c; color: white; padding: 5px 10px; border-radius: 3px;');
            console.log('Mensaje de error:', data.message);
            mostrarMensaje('❌ Error: ' + data.message, 'error');
        }
    })
    .catch(error => {
        console.log('%c===== ERROR CRÍTICO EN FETCH =====', 'background: #c0392b; color: white; padding: 5px 10px; border-radius: 3px;');
        console.error('Error object:', error);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        console.log('====================================');
        mostrarMensaje('❌ Error al guardar: ' + error.message, 'error');
    });
    
    console.log('%c===== FUNCION AGREGARUBICACION COMPLETADA =====', 'background: #95a5a6; color: white; padding: 3px 8px; border-radius: 2px;');
}

// Función para mostrar mensaje de éxito
function mostrarMensaje(mensaje, tipo = 'success') {
    const mensajeExito = document.getElementById('mensaje-exito');
    if (!mensajeExito) return;
    
    mensajeExito.innerHTML = mensaje;
    
    if (tipo === 'error') {
        mensajeExito.style.background = '#f8d7da';
        mensajeExito.style.borderLeftColor = '#dc3545';
        mensajeExito.style.color = '#721c24';
    } else {
        mensajeExito.style.background = '#d4edda';
        mensajeExito.style.borderLeftColor = '#28a745';
        mensajeExito.style.color = '#155724';
    }
    
    mensajeExito.classList.add('mostrar');
    
    setTimeout(() => {
        mensajeExito.classList.remove('mostrar');
    }, 3000);
}

// Función para obtener CSRF token
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

// Función para limpiar formulario
function limpiarFormulario() {
    inputCodigo.value = '';
    inputNombre.value = '';
    selectTipo.value = '';
    selectDispositivo.value = '';
    selectSeguridad.value = '';
    editandoIndex = null;
    editandoId = null;
    editandoTipo = null;
    btnAgregar.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Guardar Cambios';
    if (btnAgregarPrimero) {
        btnAgregarPrimero.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Guardar Cambios';
    }
}

// Función para editar ubicación - CORREGIDA
function editarUbicacion(tipo, id) {
    console.log('Editando ubicación:', tipo, id); // Para debug
    console.log('Todas las ubicaciones:', ubicaciones);
    
    // Encontrar la ubicación por ID
    const ubicacionOriginal = ubicaciones.find(u => u.id === id && u.tipo === tipo);
    
    if (!ubicacionOriginal) {
        console.error('Ubicación no encontrada con ID:', id, 'tipo:', tipo);
        console.error('Buscando en:', ubicaciones.filter(u => u.id === id));
        mostrarMensaje('Ubicación no encontrada', 'error');
        return;
    }
    
    console.log('Datos de la ubicación encontrada:', ubicacionOriginal);
    console.log('Seguridad a cargar:', ubicacionOriginal.seguridad);
    
    // ⚠️ SI ES SEDE, MOSTRAR ADVERTENCIA
    if (tipo === 'sede') {
        mostrarMensaje('ℹ️ Editando SEDE - El nivel de seguridad se calcula de sus áreas', 'info');
    }
    
    // Llenar formulario con datos existentes
    inputCodigo.value = ubicacionOriginal.codigo;
    inputNombre.value = ubicacionOriginal.nombre;
    selectTipo.value = ubicacionOriginal.tipo;
    selectDispositivo.value = ubicacionOriginal.dispositivo || '';
    selectSeguridad.value = ubicacionOriginal.seguridad || 'bajo';
    
    console.log('Valor de select después de asignar:', selectSeguridad.value);
    console.log('Atributos del select:', selectSeguridad);
    
    // Guardar datos para actualización
    editandoId = id;
    editandoTipo = tipo;
    btnAgregar.innerHTML = '<i class="fa-solid fa-sync"></i> Actualizar Ubicación';
    
    // Cambiar el texto del botón "Agregar Primera Ubicación" si existe
    if (btnAgregarPrimero) {
        btnAgregarPrimero.innerHTML = '<i class="fa-solid fa-sync"></i> Actualizar Ubicación';
    }
    
    // Hacer scroll al formulario
    document.querySelector('.add-panel').scrollIntoView({ behavior: 'smooth' });
    
    // Mostrar mensaje informativo
    mostrarMensaje(`Editando ubicación: ${ubicacionOriginal.nombre} (${tipo === 'sede' ? 'SEDE' : 'ÁREA'})`);
}

// Función para eliminar ubicación
function eliminarUbicacion(tipo, id) {
    const ubicacion = ubicaciones.find(u => u.id === id && u.tipo === tipo);
    if (!ubicacion) {
        mostrarMensaje('Ubicación no encontrada', 'error');
        return;
    }
    
    if (confirm('¿Está seguro de que desea eliminar esta ubicación?')) {
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value || getCookie('csrftoken');
        
        // Determinar el endpoint según el tipo
        let url;
        if (tipo === 'sede') {
            url = `/sedes/api/sedes/${id}/`;
        } else if (tipo === 'area') {
            url = `/sedes/api/areas/${id}/`;
        } else {
            mostrarMensaje('Tipo de ubicación inválido', 'error');
            return;
        }
        
        // Enviar DELETE
        fetch(url, {
            method: 'DELETE',
            headers: {
                'X-CSRFToken': csrfToken
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                mostrarMensaje('Ubicación eliminada correctamente', 'success');
                limpiarFormulario();
                cargarUbicaciones();
            } else {
                mostrarMensaje('Error al eliminar: ' + data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            mostrarMensaje('Error al eliminar la ubicación', 'error');
        });
        
        // Si estábamos editando esta ubicación, limpiar
        if (editandoId === id && editandoTipo === tipo) {
            limpiarFormulario();
        }
    }
}

// Función para limpiar filtros
function limpiarFiltros() {
    if (filtroNombre) filtroNombre.value = '';
    if (filtroTipo) filtroTipo.value = '';
    if (filtroDispositivo) filtroDispositivo.value = '';
    actualizarTabla();
}

// Función para mostrar/ocultar filtros
function toggleFiltros() {
    if (!seccionFiltros) return;
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
    // Cargar ubicaciones desde la API
    cargarUbicaciones();
    
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
});