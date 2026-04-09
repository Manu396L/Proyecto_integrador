// Datos de ejemplo
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

// Elementos del dropdown
const dropdownMenuButton = document.getElementById('dropdownMenuButton');
const dropdownMenu = document.getElementById('dropdownMenu');
const opcionImportar = document.getElementById('opcion-importar');
const opcionExportar = document.getElementById('opcion-exportar');
const opcionRefresh = document.getElementById('opcion-refresh');

// Input oculto para importar CSV
let csvInput = null;

// Función para crear input de archivo CSV
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

// Función para actualizar la tabla
function actualizarTabla() {
    // Aplicar filtros
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
    
    // Limpiar tabla
    cuerpoTabla.innerHTML = '';
    
    // Mostrar estado vacío o tabla
    if (empleadosFiltrados.length === 0) {
        estadoVacio.style.display = 'block';
        tablaEmpleados.style.display = 'none';
    } else {
        estadoVacio.style.display = 'none';
        tablaEmpleados.style.display = 'table';
        
        // Llenar tabla con empleados
        empleadosFiltrados.forEach((empleado, index) => {
            const fila = document.createElement('tr');
            
            // Determinar clases para badges
            const areaBadgeClass = {
                'ti': 'badge-ti',
                'rh': 'badge-rh',
                'finanzas': 'badge-finanzas',
                'operaciones': 'badge-operaciones',
                'marketing': 'badge-marketing',
                'ventas': 'badge-ventas'
            }[empleado.area] || '';
            
            const sedeBadgeClass = {
                'sede': 'badge-sede-principal',
                'oficina': 'badge-oficina',
                'area': 'badge-area-especifica'
            }[empleado.tipoSede] || '';
            
            const dispositivoBadgeClass = {
                'huella': 'badge-huella',
                'tarjeta': 'badge-tarjeta',
                'pin': 'badge-pin'
            }[empleado.dispositivo] || '';
            
            // Textos para mostrar
            const areaTexto = {
                'ti': 'TI',
                'rh': 'RH',
                'finanzas': 'Finanzas',
                'operaciones': 'Operaciones',
                'marketing': 'Marketing',
                'ventas': 'Ventas'
            }[empleado.area] || empleado.area;
            
            const sedeTexto = {
                'sede': 'Sede Principal',
                'oficina': 'Oficina',
                'area': 'Área Específica'
            }[empleado.tipoSede] || empleado.tipoSede;
            
            const dispositivoTexto = {
                'huella': 'Huella',
                'tarjeta': 'Tarjeta',
                'pin': 'PIN'
            }[empleado.dispositivo] || empleado.dispositivo;
            
            fila.innerHTML = `
                <td>
                    ${empleado.foto ? 
                        `<img src="${empleado.foto}" alt="Foto" class="foto-tabla">` : 
                        `<div class="foto-placeholder"><i class="fa-solid fa-user"></i></div>`
                    }
                </td>
                <td>${empleado.id}</td>
                <td>${empleado.nombre}</td>
                <td>${empleado.cargo}</td>
                <td><span class="badge-area ${areaBadgeClass}">${areaTexto}</span></td>
                <td><span class="badge-sede ${sedeBadgeClass}">${sedeTexto}</span></td>
                <td><span class="badge-dispositivo ${dispositivoBadgeClass}">${dispositivoTexto}</span></td>
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
                editarEmpleado(index);
            });
        });
        
        document.querySelectorAll('.btn-eliminar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(btn.getAttribute('data-index'));
                eliminarEmpleado(index);
            });
        });
    }
}

// Función para agregar/editar empleado
function guardarEmpleado(e) {
    e.preventDefault();
    
    const nombre = inputNombre.value.trim();
    const cargo = inputCargo.value.trim();
    const area = selectArea.value;
    const correo = inputCorreo.value.trim();
    const tipoSede = selectTipoSede.value;
    const nombreSede = inputNombreSede.value.trim();
    const id = inputIdEmpleado.value.trim();
    const dispositivo = selectDispositivo.value;
    const nivelSeguridad = selectNivelSeguridad.value;
    
    // Validaciones básicas
    if (!nombre || !cargo || !area || !correo || !tipoSede || !nombreSede || !id || !dispositivo || !nivelSeguridad) {
        mostrarMensaje('Por favor, complete todos los campos obligatorios', 'error');
        return;
    }
    
    // Validar formato de correo
    if (!correo.endsWith('@biometrika.com')) {
        mostrarMensaje('El correo debe terminar con @biometrika.com', 'error');
        return;
    }
    
    // Obtener credencial según el dispositivo
    let credencial = '';
    if (dispositivo === 'tarjeta') {
        credencial = inputNumeroTarjeta.value.trim() || generarNumeroTarjeta();
    } else if (dispositivo === 'pin') {
        credencial = inputPin.value || generarPIN();
    } else if (dispositivo === 'huella') {
        credencial = huellaStatus.classList.contains('registrada') ? 'huella_registrada' : '';
    }
    
    const nuevoEmpleado = {
        id,
        nombre,
        cargo,
        area,
        correo,
        tipoSede,
        nombreSede,
        dispositivo,
        nivelSeguridad,
        credencial,
        foto: fotoActual
    };
    
    if (editandoIndex !== null) {
        // Actualizar empleado existente
        empleados[editandoIndex] = nuevoEmpleado;
        editandoIndex = null;
        mostrarMensaje('Empleado actualizado correctamente');
    } else {
        // Agregar nuevo empleado
        empleados.push(nuevoEmpleado);
        mostrarMensaje('Empleado registrado correctamente');
    }
    
    // Limpiar formulario
    limpiarFormulario();
    
    // Actualizar tabla
    actualizarTabla();
}

// Función para mostrar mensaje
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

// Función para limpiar formulario
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
}

// Función para editar empleado
function editarEmpleado(index) {
    const empleado = empleados[index];
    
    // Llenar formulario con datos existentes
    inputNombre.value = empleado.nombre;
    inputCargo.value = empleado.cargo;
    selectArea.value = empleado.area;
    inputCorreo.value = empleado.correo;
    selectTipoSede.value = empleado.tipoSede;
    inputNombreSede.value = empleado.nombreSede;
    inputIdEmpleado.value = empleado.id;
    selectDispositivo.value = empleado.dispositivo;
    selectNivelSeguridad.value = empleado.nivelSeguridad;
    
    // Mostrar credenciales según el dispositivo
    mostrarOpcionesCredencial();
    if (empleado.dispositivo === 'tarjeta') {
        inputNumeroTarjeta.value = empleado.credencial;
    } else if (empleado.dispositivo === 'pin') {
        inputPin.value = empleado.credencial;
    } else if (empleado.dispositivo === 'huella' && empleado.credencial === 'huella_registrada') {
        huellaStatus.className = 'huella-status registrada';
        huellaStatus.innerHTML = '<i class="fa-solid fa-check-circle"></i> Huella registrada';
    }
    
    // Mostrar foto si existe
    if (empleado.foto) {
        fotoActual = empleado.foto;
        fotoPreview.innerHTML = `<img src="${empleado.foto}" alt="Foto del empleado">`;
        fotoPreview.classList.add('has-image');
    }
    
    // Cambiar a modo edición
    editandoIndex = index;
    btnCancelar.style.display = 'inline-flex';
    formTitle.textContent = 'Editar Empleado';
    
    // Hacer scroll al formulario
    document.querySelector('.form-panel').scrollIntoView({ behavior: 'smooth' });
    
    mostrarMensaje(`Editando empleado: ${empleado.nombre}`);
}

// Función para eliminar empleado
function eliminarEmpleado(index) {
    if (confirm('¿Está seguro de que desea eliminar este empleado?')) {
        empleados.splice(index, 1);
        actualizarTabla();
        mostrarMensaje('Empleado eliminado correctamente');
        
        // Si estábamos editando y eliminamos el mismo empleado, limpiar formulario
        if (editandoIndex === index) {
            limpiarFormulario();
        }
    }
}

// Función para nuevo empleado
function nuevoEmpleado() {
    limpiarFormulario();
    mostrarMensaje('Listo para agregar un nuevo empleado');
}

// Función para cancelar edición
function cancelarEdicion() {
    limpiarFormulario();
    mostrarMensaje('Edición cancelada');
}

// Función para mostrar opciones de credencial según el dispositivo
function mostrarOpcionesCredencial() {
    const dispositivo = selectDispositivo.value;
    seccionCredenciales.style.display = 'block';
    
    // Ocultar todas las opciones primero
    opcionHuella.style.display = 'none';
    opcionTarjeta.style.display = 'none';
    opcionPin.style.display = 'none';
    
    // Mostrar la opción correspondiente
    if (dispositivo === 'huella') {
        opcionHuella.style.display = 'block';
    } else if (dispositivo === 'tarjeta') {
        opcionTarjeta.style.display = 'block';
    } else if (dispositivo === 'pin') {
        opcionPin.style.display = 'block';
    }
}

// Función para registrar huella (simulación)
function registrarHuella() {
    mostrarMensaje('Por favor, coloque su dedo en el lector...', 'info');
    
    // Simular proceso de registro de huella
    setTimeout(() => {
        huellaStatus.className = 'huella-status registrada';
        huellaStatus.innerHTML = '<i class="fa-solid fa-check-circle"></i> Huella registrada';
        mostrarMensaje('Huella registrada correctamente');
    }, 2000);
}

// Función para generar número de tarjeta
function generarNumeroTarjeta() {
    const numero = 'TARJ-' + Math.random().toString().substr(2, 6);
    inputNumeroTarjeta.value = numero;
    return numero;
}

// Función para generar PIN aleatorio
function generarPIN() {
    const pin = Math.random().toString().substr(2, 6);
    inputPin.value = pin;
    return pin;
}

// Función para manejar archivo CSV
function manejarArchivoCSV(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const csvData = e.target.result;
            const empleadosImportados = parsearCSV(csvData);
            
            if (empleadosImportados.length > 0) {
                // Mostrar modal de confirmación
                mostrarModalImportacion(empleadosImportados);
            } else {
                mostrarMensaje('No se encontraron datos válidos en el archivo CSV', 'error');
            }
        } catch (error) {
            console.error('Error al procesar CSV:', error);
            mostrarMensaje('Error al procesar el archivo CSV: ' + error.message, 'error');
        }
    };
    
    reader.onerror = function() {
        mostrarMensaje('Error al leer el archivo', 'error');
    };
    
    reader.readAsText(file);
    
    // Limpiar input para permitir seleccionar el mismo archivo otra vez
    event.target.value = '';
}

// Función para parsear CSV
function parsearCSV(csvText) {
    const lines = csvText.split('\n').filter(line => line.trim() !== '');
    if (lines.length < 2) {
        throw new Error('El archivo CSV está vacío o no tiene el formato correcto');
    }
    
    const headers = lines[0].split(',').map(header => header.trim().toLowerCase());
    
    // Validar headers mínimos requeridos
    const headersRequeridos = ['nombre', 'cargo', 'area', 'correo'];
    const headersFaltantes = headersRequeridos.filter(header => !headers.includes(header));
    
    if (headersFaltantes.length > 0) {
        throw new Error(`Faltan las siguientes columnas requeridas: ${headersFaltantes.join(', ')}`);
    }
    
    const empleados = [];
    
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const values = parsearLineaCSV(line);
        const empleado = {};
        
        // Mapear valores a propiedades del empleado
        headers.forEach((header, index) => {
            if (index < values.length) {
                const value = values[index].trim();
                
                switch (header) {
                    case 'nombre':
                        empleado.nombre = value;
                        break;
                    case 'cargo':
                        empleado.cargo = value;
                        break;
                    case 'area':
                        empleado.area = mapearArea(value);
                        break;
                    case 'correo':
                        empleado.correo = value.endsWith('@biometrika.com') ? value : value + '@biometrika.com';
                        break;
                    case 'tipo_sede':
                    case 'tiposede':
                        empleado.tipoSede = mapearTipoSede(value);
                        break;
                    case 'nombre_sede':
                    case 'nombresede':
                        empleado.nombreSede = value || 'Sede Central';
                        break;
                    case 'id':
                    case 'id_empleado':
                        empleado.id = value || generarID(empleado.nombre);
                        break;
                    case 'dispositivo':
                    case 'dispositivo_biometrico':
                        empleado.dispositivo = mapearDispositivo(value);
                        break;
                    case 'nivel_seguridad':
                    case 'nivelseguridad':
                        empleado.nivelSeguridad = mapearNivelSeguridad(value);
                        break;
                }
            }
        });
        
        // Valores por defecto para campos faltantes
        if (!empleado.id) empleado.id = generarID(empleado.nombre);
        if (!empleado.tipoSede) empleado.tipoSede = 'sede';
        if (!empleado.nombreSede) empleado.nombreSede = 'Sede Central';
        if (!empleado.dispositivo) empleado.dispositivo = 'huella';
        if (!empleado.nivelSeguridad) empleado.nivelSeguridad = 'medio';
        
        // Generar credencial según el dispositivo
        empleado.credencial = generarCredencial(empleado.dispositivo);
        empleado.foto = null;
        
        empleados.push(empleado);
    }
    
    return empleados;
}

// Función para parsear línea CSV considerando comas dentro de comillas
function parsearLineaCSV(line) {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            values.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    
    values.push(current);
    return values;
}

// Funciones de mapeo para valores CSV
function mapearArea(valor) {
    const areas = {
        'ti': 'ti', 'tecnologia': 'ti', 'tecnología': 'ti', 'sistemas': 'ti',
        'rh': 'rh', 'recursos humanos': 'rh', 'personal': 'rh',
        'finanzas': 'finanzas', 'contabilidad': 'finanzas',
        'operaciones': 'operaciones', 'produccion': 'operaciones', 'producción': 'operaciones',
        'marketing': 'marketing', 'mercadotecnia': 'marketing',
        'ventas': 'ventas', 'comercial': 'ventas'
    };
    return areas[valor.toLowerCase()] || 'ti';
}

function mapearTipoSede(valor) {
    const tipos = {
        'sede': 'sede', 'principal': 'sede', 'central': 'sede',
        'oficina': 'oficina', 'sucursal': 'oficina',
        'area': 'area', 'área': 'area', 'especifica': 'area', 'específica': 'area'
    };
    return tipos[valor.toLowerCase()] || 'sede';
}

function mapearDispositivo(valor) {
    const dispositivos = {
        'huella': 'huella', 'fingerprint': 'huella',
        'tarjeta': 'tarjeta', 'card': 'tarjeta',
        'pin': 'pin', 'password': 'pin', 'contraseña': 'pin'
    };
    return dispositivos[valor.toLowerCase()] || 'huella';
}

function mapearNivelSeguridad(valor) {
    const niveles = {
        'bajo': 'bajo', 'low': 'bajo',
        'medio': 'medio', 'medium': 'medio',
        'alto': 'alto', 'high': 'alto'
    };
    return niveles[valor.toLowerCase()] || 'medio';
}

// Función para generar ID automático
function generarID(nombre) {
    const nombreBase = nombre.split(' ')[0].toLowerCase();
    const random = Math.random().toString().substr(2, 3);
    return `EMP-${nombreBase}-${random}`.toUpperCase();
}

// Función para generar credencial según dispositivo
function generarCredencial(dispositivo) {
    switch (dispositivo) {
        case 'tarjeta':
            return 'TARJ-' + Math.random().toString().substr(2, 6);
        case 'pin':
            return Math.random().toString().substr(2, 6);
        case 'huella':
            return 'huella_registrada';
        default:
            return '';
    }
}

// Función para mostrar modal de confirmación de importación
function mostrarModalImportacion(empleadosImportados) {
    // Crear modal
    const modal = document.createElement('div');
    modal.className = 'modal-importacion';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
    `;
    
    modal.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 12px; max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto;">
            <h3 style="color: #2c3e50; margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
                <i class="fa-solid fa-file-import" style="color: #1abc9c;"></i>
                Confirmar Importación
            </h3>
            <p>Se encontraron <strong>${empleadosImportados.length}</strong> empleados en el archivo CSV.</p>
            <div style="max-height: 300px; overflow-y: auto; margin: 20px 0; border: 1px solid #e0e0e0; border-radius: 8px; padding: 15px;">
                <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                    <thead>
                        <tr style="background: #f8f9fa;">
                            <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e0e0e0;">Nombre</th>
                            <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e0e0e0;">Cargo</th>
                            <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e0e0e0;">Área</th>
                            <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e0e0e0;">ID</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${empleadosImportados.map(emp => `
                            <tr>
                                <td style="padding: 8px; border-bottom: 1px solid #f0f0f0;">${emp.nombre}</td>
                                <td style="padding: 8px; border-bottom: 1px solid #f0f0f0;">${emp.cargo}</td>
                                <td style="padding: 8px; border-bottom: 1px solid #f0f0f0;">${emp.area}</td>
                                <td style="padding: 8px; border-bottom: 1px solid #f0f0f0;">${emp.id}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
                <button id="btn-cancelar-import" class="btn btn-secondary">
                    <i class="fa-solid fa-times"></i> Cancelar
                </button>
                <button id="btn-confirmar-import" class="btn btn-success">
                    <i class="fa-solid fa-check"></i> Importar ${empleadosImportados.length} Empleados
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Event listeners para los botones del modal
    document.getElementById('btn-cancelar-import').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    document.getElementById('btn-confirmar-import').addEventListener('click', () => {
        // Agregar empleados importados a la lista
        empleados.push(...empleadosImportados);
        actualizarTabla();
        mostrarMensaje(`Se importaron ${empleadosImportados.length} empleados correctamente`);
        document.body.removeChild(modal);
    });
    
    // Cerrar modal al hacer clic fuera
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

// Función para importar empleados
function importarEmpleados() {
    crearInputCSV();
    csvInput.click();
}

// Función para exportar empleados
function exportarEmpleados() {
    if (empleados.length === 0) {
        mostrarMensaje('No hay empleados para exportar', 'error');
        return;
    }
    
    // Crear CSV
    const headers = ['ID', 'Nombre', 'Cargo', 'Área', 'Correo', 'Tipo Sede', 'Nombre Sede', 'Dispositivo', 'Nivel Seguridad', 'Credencial'];
    const csvRows = [headers.join(',')];
    
    empleados.forEach(emp => {
        const row = [
            emp.id,
            `"${emp.nombre}"`,
            `"${emp.cargo}"`,
            emp.area,
            emp.correo,
            emp.tipoSede,
            `"${emp.nombreSede}"`,
            emp.dispositivo,
            emp.nivelSeguridad,
            emp.credencial
        ];
        csvRows.push(row.join(','));
    });
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `empleados_biometrika_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    mostrarMensaje('Empleados exportados correctamente');
}

// Función para actualizar listado
function actualizarListado() {
    actualizarTabla();
    mostrarMensaje('Listado actualizado');
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
    formulario.addEventListener('submit', guardarEmpleado);
    
    // Foto
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
    
    // Dispositivo biométrico
    selectDispositivo.addEventListener('change', mostrarOpcionesCredencial);
    
    // Filtros
    btnLimpiarFiltros.addEventListener('click', function() {
        filtroNombre.value = '';
        filtroArea.value = '';
        filtroSede.value = '';
        actualizarTabla();
    });
    
    filtroNombre.addEventListener('input', actualizarTabla);
    filtroArea.addEventListener('change', actualizarTabla);
    filtroSede.addEventListener('change', actualizarTabla);
    
    // Dropdown functionality
    dropdownMenuButton.addEventListener('click', toggleDropdown);
    
    // Opciones del dropdown
    opcionImportar.addEventListener('click', function(e) {
        e.stopPropagation();
        importarEmpleados();
        dropdownMenu.classList.remove('show');
    });
    
    opcionExportar.addEventListener('click', function(e) {
        e.stopPropagation();
        exportarEmpleados();
        dropdownMenu.classList.remove('show');
    });
    
    opcionRefresh.addEventListener('click', function(e) {
        e.stopPropagation();
        actualizarListado();
        dropdownMenu.classList.remove('show');
    });
    
    // Cerrar dropdown al hacer clic fuera
    document.addEventListener('click', cerrarDropdown);
    
    // Prevenir que el dropdown se cierre cuando se hace clic dentro de él
    dropdownMenu.addEventListener('click', function(e) {
        e.stopPropagation();
    });
    
    // Generar ID automático
    inputNombre.addEventListener('blur', function() {
        if (!inputIdEmpleado.value && inputNombre.value) {
            const nombre = inputNombre.value.split(' ')[0].toLowerCase();
            const random = Math.random().toString().substr(2, 3);
            inputIdEmpleado.value = `EMP-${nombre}-${random}`.toUpperCase();
        }
    });
    
    // Generar correo automático
    inputNombre.addEventListener('blur', function() {
        if (!inputCorreo.value && inputNombre.value) {
            const nombre = inputNombre.value.split(' ')[0].toLowerCase();
            const apellido = inputNombre.value.split(' ')[1] || '';
            const correo = apellido ? 
                `${nombre}.${apellido.toLowerCase()}@biometrika.com` : 
                `${nombre}@biometrika.com`;
            inputCorreo.value = correo.replace(/[^a-zA-Z0-9.@]/g, '');
        }
    });
    
    // Inicializar tabla con datos de ejemplo
    empleados = [
        {
            id: 'EMP-Juan-123',
            nombre: 'Juan Pérez',
            cargo: 'Analista de Sistemas',
            area: 'ti',
            correo: 'juan.perez@biometrika.com',
            tipoSede: 'sede',
            nombreSede: 'Sede Central',
            dispositivo: 'huella',
            nivelSeguridad: 'alto',
            credencial: 'huella_registrada',
            foto: null
        },
        {
            id: 'EMP-Maria-456',
            nombre: 'María García',
            cargo: 'Gerente de RH',
            area: 'rh',
            correo: 'maria.garcia@biometrika.com',
            tipoSede: 'oficina',
            nombreSede: 'Oficina Administrativa',
            dispositivo: 'tarjeta',
            nivelSeguridad: 'medio',
            credencial: 'TARJ-789123',
            foto: null
        }
    ];
    
    actualizarTabla();
});