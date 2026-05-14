// Elementos DOM
const cuerpoTabla = document.getElementById('cuerpoTabla');
const estadoVacio = document.getElementById('estado-vacio');
const tablaTickets = document.getElementById('tablaTickets');
const btnGuardar = document.getElementById('btn-guardar');
const btnCancelar = document.getElementById('btn-cancelar');
const btnAgregarPrimero = document.getElementById('btn-agregar-primero');

// Elementos del formulario
const inputRemitenteNombre = document.getElementById('remitente_nombre');
const inputRemitenteEmail = document.getElementById('remitente_email');
const inputTitulo = document.getElementById('titulo');
const inputDescripcion = document.getElementById('descripcion');
const selectPrioridad = document.getElementById('prioridad');

// Elementos del modal
const modalResolver = document.getElementById('modal-resolver');
const ticketIdResolver = document.getElementById('ticket-id-resolver');
const ticketTituloResolver = document.getElementById('ticket-titulo-resolver');
const ticketRemitenteResolver = document.getElementById('ticket-remitente-resolver');
const ticketEmailResolver = document.getElementById('ticket-email-resolver');
const textareaSolucion = document.getElementById('solucion');
const checkboxEnviarEmail = document.getElementById('enviar_email');
const emailPreview = document.getElementById('email-preview');
const previewEmail = document.getElementById('preview-email');
const previewId = document.getElementById('preview-id');
const previewMensaje = document.getElementById('preview-mensaje');
const btnConfirmarResolver = document.getElementById('btn-confirmar-resolver');
const btnCancelarResolver = document.getElementById('btn-cancelar-resolver');
const closeModal = document.querySelector('.modal-close');

// Variables de estado
let tickets = [];
let editandoId = null;

// Función para cargar tickets
async function cargarTickets() {
    try {
        const resp = await fetch('/tickets/api/tickets/');
        tickets = await resp.json();
        console.log('Tickets cargados:', tickets);
        renderizarTabla();
    } catch (error) {
        console.error('Error cargando tickets:', error);
        mostrarMensaje('Error al cargar tickets', 'error');
    }
}

// Función para renderizar tabla con botón RESOLVER
function renderizarTabla() {
    const filtroTitulo = document.getElementById('filtro-titulo')?.value.toLowerCase() || '';
    const filtroEstado = document.getElementById('filtro-estado')?.value || '';
    const filtroPrioridad = document.getElementById('filtro-prioridad')?.value || '';
    
    let ticketsFiltrados = tickets.filter(ticket => {
        let coincide = true;
        if (filtroTitulo && !ticket.titulo.toLowerCase().includes(filtroTitulo)) coincide = false;
        if (filtroEstado && ticket.estado !== filtroEstado) coincide = false;
        if (filtroPrioridad && ticket.prioridad !== filtroPrioridad) coincide = false;
        return coincide;
    });
    
    if (ticketsFiltrados.length === 0) {
        tablaTickets.style.display = 'none';
        estadoVacio.style.display = 'block';
        return;
    }
    
    tablaTickets.style.display = 'table';
    estadoVacio.style.display = 'none';
    cuerpoTabla.innerHTML = '';
    
    ticketsFiltrados.forEach(ticket => {
        const fila = document.createElement('tr');
        
        const estadoTexto = {
            'abierto': 'Abierto',
            'en_progreso': 'En Progreso',
            'resuelto': 'Resuelto',
            'cerrado': 'Cerrado'
        }[ticket.estado] || ticket.estado;
        
        const prioridadTexto = {
            'baja': 'Baja',
            'media': 'Media',
            'alta': 'Alta',
            'urgente': 'Urgente'
        }[ticket.prioridad] || ticket.prioridad;
        
        // Mostrar botón resolver SOLO si el ticket NO está resuelto ni cerrado
        const mostrarResolver = ticket.estado !== 'resuelto' && ticket.estado !== 'cerrado';
        
        fila.innerHTML = `
            <td>${ticket.id}</td>
            <td>${ticket.titulo}</td>
            <td class="remitente-cell">
                <strong>${ticket.remitente_nombre || ticket.creado_por__username || 'N/A'}</strong><br>
                <small>${ticket.remitente_email || ''}</small>
            </td>
            <td><span class="estado-${ticket.estado}">${estadoTexto}</span></td>
            <td><span class="prioridad-${ticket.prioridad}">${prioridadTexto}</span></td>
            <td>${new Date(ticket.fecha_creacion).toLocaleDateString()}</td>
            <td class="acciones">
                <button class="btn-editar" data-id="${ticket.id}">
                    <i class="fa-solid fa-edit"></i> Editar
                </button>
                ${mostrarResolver ? `
                <button class="btn-resolver" data-id="${ticket.id}">
                    <i class="fa-solid fa-check-circle"></i> Resolver
                </button>` : ''}
                <button class="btn-eliminar" data-id="${ticket.id}">
                    <i class="fa-solid fa-trash"></i> Eliminar
                </button>
            </td>
        `;
        
        cuerpoTabla.appendChild(fila);
    });
    
    // Event listeners para botones
    document.querySelectorAll('.btn-editar').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(btn.dataset.id);
            editarTicket(id);
        });
    });
    
    document.querySelectorAll('.btn-resolver').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(btn.dataset.id);
            abrirModalResolver(id);
        });
    });
    
    document.querySelectorAll('.btn-eliminar').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(btn.dataset.id);
            eliminarTicket(id);
        });
    });
}

// Función para guardar ticket
async function guardarTicket() {
    const remitente_nombre = inputRemitenteNombre.value.trim();
    const remitente_email = inputRemitenteEmail.value.trim();
    const titulo = inputTitulo.value.trim();
    const descripcion = inputDescripcion.value.trim();
    const prioridad = selectPrioridad.value;
    
    if (!remitente_nombre || !remitente_email || !titulo || !descripcion) {
        mostrarMensaje('Todos los campos son requeridos', 'error');
        return;
    }
    
    if (!remitente_email.includes('@')) {
        mostrarMensaje('Email inválido', 'error');
        return;
    }
    
    const datosTicket = {
        remitente_nombre: remitente_nombre,
        remitente_email: remitente_email,
        titulo: titulo,
        descripcion: descripcion,
        prioridad: prioridad
    };
    
    try {
        let resp;
        if (editandoId !== null) {
            resp = await fetch(`/tickets/api/tickets/${editandoId}/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCSRFToken()
                },
                body: JSON.stringify(datosTicket)
            });
        } else {
            resp = await fetch('/tickets/api/crear/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCSRFToken()
                },
                body: JSON.stringify(datosTicket)
            });
        }
        
        if (resp.ok) {
            const resultado = await resp.json();
            mostrarMensaje(resultado.message, 'success');
            limpiarFormulario();
            await cargarTickets();
        } else {
            const error = await resp.json();
            mostrarMensaje(error.message || 'Error al guardar', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarMensaje('Error de conexión', 'error');
    }
}

// Función para editar ticket
function editarTicket(id) {
    const ticket = tickets.find(t => t.id === id);
    if (!ticket) return;
    
    inputRemitenteNombre.value = ticket.remitente_nombre || '';
    inputRemitenteEmail.value = ticket.remitente_email || '';
    inputTitulo.value = ticket.titulo;
    inputDescripcion.value = ticket.descripcion;
    selectPrioridad.value = ticket.prioridad;
    
    editandoId = id;
    btnGuardar.innerHTML = '<i class="fa-solid fa-save"></i> Actualizar Ticket';
    btnCancelar.style.display = 'inline-flex';
    
    document.querySelector('.add-panel').scrollIntoView({ behavior: 'smooth' });
    mostrarMensaje(`Editando ticket #${id}`, 'info');
}

// Función para cancelar edición
function cancelarEdicion() {
    limpiarFormulario();
    editandoId = null;
    btnGuardar.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Crear Ticket';
    btnCancelar.style.display = 'none';
    mostrarMensaje('Edición cancelada', 'info');
}

// Función para eliminar ticket
async function eliminarTicket(id) {
    if (!confirm('¿Está seguro de eliminar este ticket?')) return;
    
    try {
        const resp = await fetch(`/tickets/api/tickets/${id}/`, {
            method: 'DELETE',
            headers: {
                'X-CSRFToken': getCSRFToken()
            }
        });
        
        if (resp.ok) {
            mostrarMensaje('Ticket eliminado correctamente', 'success');
            if (editandoId === id) limpiarFormulario();
            await cargarTickets();
        } else {
            mostrarMensaje('Error al eliminar', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarMensaje('Error de conexión', 'error');
    }
}

// Función para abrir modal resolver
function abrirModalResolver(id) {
    const ticket = tickets.find(t => t.id === id);
    if (!ticket) return;
    
    ticketIdResolver.textContent = ticket.id;
    ticketTituloResolver.textContent = ticket.titulo;
    ticketRemitenteResolver.textContent = ticket.remitente_nombre || ticket.creado_por__username || 'N/A';
    ticketEmailResolver.textContent = ticket.remitente_email || '';
    
    textareaSolucion.value = '';
    checkboxEnviarEmail.checked = true;
    
    modalResolver.dataset.ticketId = id;
    modalResolver.style.display = 'flex';
    
    actualizarPreviewEmail();
}

// Función para actualizar preview
function actualizarPreviewEmail() {
    if (!checkboxEnviarEmail.checked) {
        emailPreview.style.display = 'none';
        return;
    }
    
    emailPreview.style.display = 'block';
    previewEmail.textContent = ticketEmailResolver.textContent;
    previewId.textContent = ticketIdResolver.textContent;
    
    const solucion = textareaSolucion.value.trim();
    const fecha = new Date().toLocaleDateString();
    const remitente = ticketRemitenteResolver.textContent;
    
    previewMensaje.innerHTML = `
        <p>Estimado/a ${remitente},</p>
        <br>
        <p>Su ticket #${previewId.textContent} - "${ticketTituloResolver.textContent}" ha sido resuelto.</p>
        <br>
        <p><strong>Solución proporcionada:</strong></p>
        <p>${solucion || 'No se ha escrito una solución específica.'}</p>
        <br>
        <p>Fecha de resolución: ${fecha}</p>
        <br>
        <p>Atentamente,<br>Equipo de Soporte Técnico<br>Sistema Biométrico</p>
    `;
}

// Función para resolver ticket
async function resolverTicket() {
    const solucion = textareaSolucion.value.trim();
    
    if (!solucion) {
        mostrarMensaje('Por favor, escriba la solución del ticket', 'error');
        return;
    }
    
    const ticketId = modalResolver.dataset.ticketId;
    
    try {
        const resp = await fetch(`/tickets/api/tickets/${ticketId}/resolver/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            },
            body: JSON.stringify({
                solucion: solucion,
                enviar_email: checkboxEnviarEmail.checked
            })
        });
        
        if (resp.ok) {
            const resultado = await resp.json();
            mostrarMensaje(resultado.message, 'success');
            cerrarModal();
            await cargarTickets();
        } else {
            const error = await resp.json();
            mostrarMensaje(error.error || 'Error al resolver ticket', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarMensaje('Error de conexión', 'error');
    }
}

// Función para cerrar modal
function cerrarModal() {
    modalResolver.style.display = 'none';
    textareaSolucion.value = '';
}

// Función para limpiar formulario
function limpiarFormulario() {
    inputRemitenteNombre.value = '';
    inputRemitenteEmail.value = '';
    inputTitulo.value = '';
    inputDescripcion.value = '';
    selectPrioridad.value = 'media';
    editandoId = null;
    btnGuardar.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Crear Ticket';
    btnCancelar.style.display = 'none';
}

// Función para mostrar mensajes
function mostrarMensaje(mensaje, tipo) {
    const mensajeDiv = document.getElementById('mensaje-exito');
    const mensajeTexto = document.getElementById('mensaje-texto');
    
    mensajeTexto.textContent = mensaje;
    mensajeDiv.className = `mensaje-${tipo}`;
    mensajeDiv.style.display = 'flex';
    
    setTimeout(() => {
        mensajeDiv.style.display = 'none';
    }, 3000);
}

// Función para obtener CSRF token
function getCSRFToken() {
    return document.querySelector('[name=csrfmiddlewaretoken]').value;
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    cargarTickets();
    
    btnGuardar.addEventListener('click', guardarTicket);
    btnCancelar.addEventListener('click', cancelarEdicion);
    btnAgregarPrimero.addEventListener('click', () => {
        estadoVacio.style.display = 'none';
        inputRemitenteNombre.focus();
    });
    
    // Modal events
    btnConfirmarResolver.addEventListener('click', resolverTicket);
    btnCancelarResolver.addEventListener('click', cerrarModal);
    if (closeModal) closeModal.addEventListener('click', cerrarModal);
    modalResolver.addEventListener('click', (e) => {
        if (e.target === modalResolver) cerrarModal();
    });
    textareaSolucion.addEventListener('input', actualizarPreviewEmail);
    checkboxEnviarEmail.addEventListener('change', actualizarPreviewEmail);
    
    // Dropdown y filtros
    const dropdownToggle = document.getElementById('dropdownMenuButton');
    const dropdownMenu = document.getElementById('dropdownMenu');
    const opcionFiltros = document.getElementById('opcion-filtros');
    const opcionRefresh = document.getElementById('opcion-refresh');
    const filtrosDiv = document.getElementById('filtros');
    const btnLimpiarFiltros = document.getElementById('btn-limpiar-filtros');
    const filtroTitulo = document.getElementById('filtro-titulo');
    const filtroEstado = document.getElementById('filtro-estado');
    const filtroPrioridad = document.getElementById('filtro-prioridad');
    
    if (dropdownToggle) {
        dropdownToggle.addEventListener('click', () => {
            dropdownMenu.classList.toggle('show');
        });
    }
    
    document.addEventListener('click', (e) => {
        if (dropdownToggle && !dropdownToggle.contains(e.target) && dropdownMenu && !dropdownMenu.contains(e.target)) {
            dropdownMenu.classList.remove('show');
        }
    });
    
    if (opcionFiltros) {
        opcionFiltros.addEventListener('click', () => {
            if (filtrosDiv) {
                filtrosDiv.style.display = filtrosDiv.style.display === 'none' ? 'flex' : 'none';
            }
            if (dropdownMenu) dropdownMenu.classList.remove('show');
        });
    }
    
    if (opcionRefresh) {
        opcionRefresh.addEventListener('click', () => {
            cargarTickets();
            mostrarMensaje('Lista actualizada', 'success');
            if (dropdownMenu) dropdownMenu.classList.remove('show');
        });
    }
    
    if (btnLimpiarFiltros) {
        btnLimpiarFiltros.addEventListener('click', () => {
            if (filtroTitulo) filtroTitulo.value = '';
            if (filtroEstado) filtroEstado.value = '';
            if (filtroPrioridad) filtroPrioridad.value = '';
            renderizarTabla();
        });
    }
    
    if (filtroTitulo) filtroTitulo.addEventListener('input', renderizarTabla);
    if (filtroEstado) filtroEstado.addEventListener('change', renderizarTabla);
    if (filtroPrioridad) filtroPrioridad.addEventListener('change', renderizarTabla);
});