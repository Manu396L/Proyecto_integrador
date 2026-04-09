// static/js/reporte.js - VERSIÓN COMPLETA CON EXPORTACIÓN REAL

// Datos de ejemplo para los reportes
const datosReportes = [
    { id: 'BIO-2024-001', usuario: 'Juan Carlos Rodríguez', tipo: 'huella', fecha: '15/03/2024 08:30:25', dispositivo: 'Terminal 1 - Recepción', estado: 'exitoso', confianza: 98 },
    { id: 'BIO-2024-002', usuario: 'María Elena González', tipo: 'facial', fecha: '15/03/2024 08:32:10', dispositivo: 'Terminal 2 - Oficinas', estado: 'exitoso', confianza: 94 },
    { id: 'BIO-2024-003', usuario: 'Carlos Alberto Méndez', tipo: 'huella', fecha: '15/03/2024 08:35:42', dispositivo: 'Terminal 3 - Laboratorio', estado: 'fallido', confianza: 45 },
    { id: 'BIO-2024-004', usuario: 'Ana Patricia Silva', tipo: 'voz', fecha: '15/03/2024 08:40:15', dispositivo: 'Dispositivo Móvil', estado: 'exitoso', confianza: 87 },
    { id: 'BIO-2024-005', usuario: 'Roberto José Hernández', tipo: 'iris', fecha: '15/03/2024 08:45:33', dispositivo: 'Terminal 1 - Recepción', estado: 'exitoso', confianza: 96 },
    { id: 'BIO-2024-006', usuario: 'Laura Isabel Fernández', tipo: 'huella', fecha: '15/03/2024 08:50:22', dispositivo: 'Terminal 2 - Oficinas', estado: 'pendiente', confianza: 0 },
    { id: 'BIO-2024-007', usuario: 'Miguel Ángel Torres', tipo: 'facial', fecha: '15/03/2024 08:55:47', dispositivo: 'Terminal 3 - Laboratorio', estado: 'exitoso', confianza: 91 },
    { id: 'BIO-2024-008', usuario: 'Sofía Alejandra Ramírez', tipo: 'huella', fecha: '15/03/2024 09:02:18', dispositivo: 'Terminal 1 - Recepción', estado: 'fallido', confianza: 32 },
    { id: 'BIO-2024-009', usuario: 'David Eduardo Castro', tipo: 'facial', fecha: '15/03/2024 09:08:33', dispositivo: 'Terminal 2 - Oficinas', estado: 'exitoso', confianza: 89 },
    { id: 'BIO-2024-010', usuario: 'Carmen Rosa Vargas', tipo: 'iris', fecha: '15/03/2024 09:15:47', dispositivo: 'Terminal 3 - Laboratorio', estado: 'exitoso', confianza: 97 }
];

// Variables globales
let datosFiltrados = [...datosReportes];
let paginaActual = 1;
const registrosPorPagina = 8;

// Funcionalidad para la página de reportes
document.addEventListener('DOMContentLoaded', function() {
    inicializarEventos();
    inicializarFiltros();
    cargarDatosTabla();
    actualizarPaginacion();
});

function inicializarEventos() {
    document.getElementById('btnAplicar').addEventListener('click', aplicarFiltros);
    document.getElementById('btnLimpiar').addEventListener('click', limpiarFiltros);
    document.getElementById('btnExportar').addEventListener('click', mostrarModalExportar);
    
    document.querySelector('.close').addEventListener('click', cerrarModal);
    document.getElementById('btnExportarAhora').addEventListener('click', exportarReporte);
    document.getElementById('btnProgramar').addEventListener('click', programarExportacion);
    
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('modalExportar');
        if (event.target === modal) cerrarModal();
    });
}

function inicializarFiltros() {
    const hoy = new Date();
    const hace7Dias = new Date();
    hace7Dias.setDate(hoy.getDate() - 7);
    
    document.getElementById('filtro-fecha-inicio').value = formatearFechaInput(hace7Dias);
    document.getElementById('filtro-fecha-fin').value = formatearFechaInput(hoy);
}

function formatearFechaInput(fecha) {
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${año}-${mes}-${dia}`;
}

function aplicarFiltros() {
    const tipo = document.getElementById('filtro-tipo').value;
    const estado = document.getElementById('filtro-estado').value;
    const dispositivo = document.getElementById('filtro-dispositivo').value;
    const usuario = document.getElementById('filtro-usuario').value.toLowerCase();
    
    datosFiltrados = datosReportes.filter(registro => {
        if (tipo && registro.tipo !== tipo) return false;
        if (estado && registro.estado !== estado) return false;
        if (dispositivo && registro.dispositivo !== dispositivo) return false;
        if (usuario && !registro.usuario.toLowerCase().includes(usuario)) return false;
        return true;
    });
    
    paginaActual = 1;
    cargarDatosTabla();
    actualizarPaginacion();
    mostrarNotificacion('Filtros aplicados correctamente', 'success');
}

function limpiarFiltros() {
    document.getElementById('filtro-tipo').value = '';
    document.getElementById('filtro-estado').value = '';
    document.getElementById('filtro-dispositivo').value = '';
    document.getElementById('filtro-usuario').value = '';
    inicializarFiltros();
    
    datosFiltrados = [...datosReportes];
    paginaActual = 1;
    cargarDatosTabla();
    actualizarPaginacion();
    mostrarNotificacion('Filtros limpiados', 'info');
}

function cargarDatosTabla() {
    const tbody = document.getElementById('tbodyReportes');
    tbody.innerHTML = '';
    
    const inicio = (paginaActual - 1) * registrosPorPagina;
    const fin = inicio + registrosPorPagina;
    const registrosPagina = datosFiltrados.slice(inicio, fin);
    
    registrosPagina.forEach(registro => {
        const fila = document.createElement('tr');
        
        let iconoTipo = '';
        let textoTipo = '';
        switch(registro.tipo) {
            case 'huella': iconoTipo = 'fa-fingerprint'; textoTipo = 'Huella Dactilar'; break;
            case 'facial': iconoTipo = 'fa-face-smile'; textoTipo = 'Reconocimiento Facial'; break;
            case 'voz': iconoTipo = 'fa-microphone'; textoTipo = 'Reconocimiento de Voz'; break;
            case 'iris': iconoTipo = 'fa-eye'; textoTipo = 'Escaneo de Iris'; break;
        }
        
        let claseEstado = '';
        let textoEstado = '';
        switch(registro.estado) {
            case 'exitoso': claseEstado = 'estado-exitoso'; textoEstado = 'Exitoso'; break;
            case 'fallido': claseEstado = 'estado-fallido'; textoEstado = 'Fallido'; break;
            case 'pendiente': claseEstado = 'estado-pendiente'; textoEstado = 'Pendiente'; break;
        }
        
        fila.innerHTML = `
            <td><strong>${registro.id}</strong></td>
            <td>${registro.usuario}</td>
            <td><span class="tipo-biometrico"><i class="fa-solid ${iconoTipo}"></i>${textoTipo}</span></td>
            <td>${registro.fecha}</td>
            <td>${registro.dispositivo}</td>
            <td><span class="estado-registro ${claseEstado}">${textoEstado}</span></td>
            <td>${registro.confianza}%</td>
            <td><button class="btn-detalle" onclick="mostrarDetalleRegistro('${registro.id}')"><i class="fa-solid fa-eye"></i> Detalles</button></td>
        `;
        tbody.appendChild(fila);
    });
    
    actualizarInfoPaginacion();
}

function actualizarPaginacion() {
    const totalPaginas = Math.ceil(datosFiltrados.length / registrosPorPagina);
    const controles = document.getElementById('controlesPaginacion');
    controles.innerHTML = '';
    
    const btnAnterior = document.createElement('button');
    btnAnterior.className = `btn-pagina anterior ${paginaActual === 1 ? 'disabled' : ''}`;
    btnAnterior.innerHTML = '<i class="fa-solid fa-chevron-left"></i> Anterior';
    btnAnterior.disabled = paginaActual === 1;
    btnAnterior.addEventListener('click', () => { if (paginaActual > 1) { paginaActual--; cargarDatosTabla(); actualizarPaginacion(); } });
    controles.appendChild(btnAnterior);
    
    const maxPaginasVisibles = 5;
    let inicioPagina = Math.max(1, paginaActual - Math.floor(maxPaginasVisibles / 2));
    let finPagina = Math.min(totalPaginas, inicioPagina + maxPaginasVisibles - 1);
    
    if (finPagina - inicioPagina + 1 < maxPaginasVisibles) {
        inicioPagina = Math.max(1, finPagina - maxPaginasVisibles + 1);
    }
    
    if (inicioPagina > 1) {
        const btnPuntosInicio = document.createElement('button');
        btnPuntosInicio.className = 'btn-pagina';
        btnPuntosInicio.textContent = '...';
        btnPuntosInicio.disabled = true;
        controles.appendChild(btnPuntosInicio);
    }
    
    for (let i = inicioPagina; i <= finPagina; i++) {
        const btnPagina = document.createElement('button');
        btnPagina.className = `btn-pagina ${i === paginaActual ? 'activa' : ''}`;
        btnPagina.textContent = i;
        btnPagina.addEventListener('click', () => { paginaActual = i; cargarDatosTabla(); actualizarPaginacion(); });
        controles.appendChild(btnPagina);
    }
    
    if (finPagina < totalPaginas) {
        const btnPuntosFin = document.createElement('button');
        btnPuntosFin.className = 'btn-pagina';
        btnPuntosFin.textContent = '...';
        btnPuntosFin.disabled = true;
        controles.appendChild(btnPuntosFin);
    }
    
    const btnSiguiente = document.createElement('button');
    btnSiguiente.className = `btn-pagina siguiente ${paginaActual === totalPaginas ? 'disabled' : ''}`;
    btnSiguiente.innerHTML = 'Siguiente <i class="fa-solid fa-chevron-right"></i>';
    btnSiguiente.disabled = paginaActual === totalPaginas;
    btnSiguiente.addEventListener('click', () => { if (paginaActual < totalPaginas) { paginaActual++; cargarDatosTabla(); actualizarPaginacion(); } });
    controles.appendChild(btnSiguiente);
}

function actualizarInfoPaginacion() {
    const inicio = (paginaActual - 1) * registrosPorPagina + 1;
    const fin = Math.min(paginaActual * registrosPorPagina, datosFiltrados.length);
    const total = datosFiltrados.length;
    document.getElementById('infoPaginacion').textContent = `Mostrando ${inicio}-${fin} de ${total} registros`;
}

function mostrarModalExportar() {
    document.getElementById('modalExportar').style.display = 'block';
}

function cerrarModal() {
    document.getElementById('modalExportar').style.display = 'none';
}

// ===== FUNCIONES DE EXPORTACIÓN REAL =====
function exportarReporte() {
    const formato = document.querySelector('input[name="export-format"]:checked').value;
    const incluirResumen = document.getElementById('section-resumen').checked;
    const datosExportar = datosFiltrados.length > 0 ? datosFiltrados : datosReportes;
    
    if (datosExportar.length === 0) {
        mostrarNotificacion('No hay datos para exportar', 'error');
        return;
    }
    
    switch(formato) {
        case 'csv': exportarCSV(datosExportar, incluirResumen); break;
        case 'excel': exportarExcel(datosExportar, incluirResumen); break;
        case 'pdf': exportarPDF(datosExportar, incluirResumen); break;
        default: exportarCSV(datosExportar, incluirResumen);
    }
    
    cerrarModal();
    mostrarNotificacion(`Reporte exportado en formato ${formato.toUpperCase()}`, 'success');
}

function exportarCSV(datos, incluirResumen) {
    const columnas = ['ID Registro', 'Usuario', 'Tipo Biométrico', 'Fecha/Hora', 'Dispositivo', 'Estado', 'Nivel Confianza'];
    const filas = datos.map(registro => [
        registro.id, registro.usuario, getTipoTexto(registro.tipo),
        registro.fecha, registro.dispositivo, getEstadoTexto(registro.estado), `${registro.confianza}%`
    ]);
    
    if (incluirResumen) {
        const exitosos = datos.filter(r => r.estado === 'exitoso').length;
        const fallidos = datos.filter(r => r.estado === 'fallido').length;
        filas.push(['', '', '', '', '', '', '']);
        filas.push(['RESUMEN', '', '', '', '', '', '']);
        filas.push(['Total Registros', datos.length, '', '', '', '', '']);
        filas.push(['Autenticaciones Exitosas', exitosos, '', '', '', '', '']);
        filas.push(['Autenticaciones Fallidas', fallidos, '', '', '', '', '']);
        filas.push(['Tasa de Éxito', `${((exitosos/datos.length)*100).toFixed(2)}%`, '', '', '', '', '']);
    }
    
    const csvContent = [columnas, ...filas].map(row => 
        row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n');
    
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    descargarArchivo(blob, `reporte_biometrico_${new Date().toISOString().split('T')[0]}.csv`);
}

function exportarExcel(datos, incluirResumen) {
    let html = `<table><thead><tr><th>ID Registro</th><th>Usuario</th><th>Tipo Biométrico</th><th>Fecha/Hora</th><th>Dispositivo</th><th>Estado</th><th>Nivel Confianza</th></tr></thead><tbody>`;
    
    datos.forEach(registro => {
        html += `<tr><td>${registro.id}</td><td>${registro.usuario}</td><td>${getTipoTexto(registro.tipo)}</td><td>${registro.fecha}</td><td>${registro.dispositivo}</td><td>${getEstadoTexto(registro.estado)}</td><td>${registro.confianza}%</td></tr>`;
    });
    
    if (incluirResumen) {
        const exitosos = datos.filter(r => r.estado === 'exitoso').length;
        const fallidos = datos.filter(r => r.estado === 'fallido').length;
        html += `<tr><td colspan="7"></td></tr>`;
        html += `<tr><td colspan="7"><strong>RESUMEN ESTADÍSTICO</strong></td></tr>`;
        html += `<tr><td colspan="2"><strong>Total Registros:</strong></td><td colspan="5">${datos.length}</td></tr>`;
        html += `<tr><td colspan="2"><strong>Exitosos:</strong></td><td colspan="5">${exitosos}</td></tr>`;
        html += `<tr><td colspan="2"><strong>Fallidos:</strong></td><td colspan="5">${fallidos}</td></tr>`;
        html += `<tr><td colspan="2"><strong>Tasa de Éxito:</strong></td><td colspan="5">${((exitosos/datos.length)*100).toFixed(2)}%</td></tr>`;
    }
    
    html += `</tbody></table>`;
    const fullHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Reporte Biométrico</title><style>th{background:#2c3e50;color:white;padding:8px;}td{padding:8px;border:1px solid #ddd;}</style></head><body><h2>Reporte de Autenticaciones Biométricas</h2><p>Generado: ${new Date().toLocaleString()}</p>${html}</body></html>`;
    const blob = new Blob([fullHtml], { type: 'application/vnd.ms-excel' });
    descargarArchivo(blob, `reporte_biometrico_${new Date().toISOString().split('T')[0]}.xls`);
}

function exportarPDF(datos, incluirResumen) {
    const ventana = window.open('', '_blank');
    const exitosos = datos.filter(r => r.estado === 'exitoso').length;
    const fallidos = datos.filter(r => r.estado === 'fallido').length;
    const tasaExito = ((exitosos/datos.length)*100).toFixed(2);
    
    let tablaHTML = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Reporte Biométrico</title><style>
        body{font-family:Arial;margin:40px;} h1{color:#2c3e50;text-align:center;border-bottom:2px solid #1abc9c;}
        .fecha{text-align:center;color:#7f8c8d;margin-bottom:30px;}
        .resumen{display:flex;justify-content:space-around;margin-bottom:30px;flex-wrap:wrap;}
        .resumen-card{background:#f8f9fa;padding:15px;border-radius:8px;text-align:center;min-width:150px;border-top:3px solid #1abc9c;}
        .resumen-card .valor{font-size:28px;font-weight:bold;color:#2c3e50;}
        .resumen-card .label{color:#7f8c8d;font-size:12px;}
        table{width:100%;border-collapse:collapse;} th{background:#2c3e50;color:white;padding:10px;text-align:left;}
        td{padding:8px;border-bottom:1px solid #ddd;} .exitoso{color:#27ae60;font-weight:bold;} .fallido{color:#e74c3c;font-weight:bold;}
        .footer{margin-top:30px;text-align:center;color:#7f8c8d;font-size:12px;border-top:1px solid #ddd;padding-top:20px;}
    </style></head><body>
        <h1>Biometrika - Reporte de Autenticaciones</h1>
        <div class="fecha">Generado: ${new Date().toLocaleString()}</div>`;
    
    if (incluirResumen) {
        tablaHTML += `<div class="resumen">
            <div class="resumen-card"><div class="valor">${datos.length}</div><div class="label">Total Registros</div></div>
            <div class="resumen-card"><div class="valor">${exitosos}</div><div class="label">Exitosas</div></div>
            <div class="resumen-card"><div class="valor">${fallidos}</div><div class="label">Fallidas</div></div>
            <div class="resumen-card"><div class="valor">${tasaExito}%</div><div class="label">Tasa de Éxito</div></div>
        </div>`;
    }
    
    tablaHTML += `<table><thead><tr><th>ID</th><th>Usuario</th><th>Tipo</th><th>Fecha/Hora</th><th>Dispositivo</th><th>Estado</th><th>Confianza</th></tr></thead><tbody>`;
    datos.forEach(registro => {
        const estadoClass = registro.estado === 'exitoso' ? 'exitoso' : 'fallido';
        tablaHTML += `<tr><td>${registro.id}</td><td>${registro.usuario}</td><td>${getTipoTexto(registro.tipo)}</td><td>${registro.fecha}</td><td>${registro.dispositivo}</td><td class="${estadoClass}">${getEstadoTexto(registro.estado)}</td><td>${registro.confianza}%</td></tr>`;
    });
    
    tablaHTML += `</tbody></table><div class="footer"><p>Biometrika - Sistema Biométrico 2025</p></div></body></html>`;
    
    ventana.document.write(tablaHTML);
    ventana.document.close();
    ventana.onload = function() { ventana.print(); };
}

function descargarArchivo(blob, nombreArchivo) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombreArchivo;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function programarExportacion() {
    mostrarNotificacion('Funcionalidad de programación de exportaciones próximamente', 'info');
}

function mostrarDetalleRegistro(idRegistro) {
    const registro = datosReportes.find(r => r.id === idRegistro);
    if (registro) {
        alert(`Detalles del registro: ${idRegistro}\n\nUsuario: ${registro.usuario}\nTipo: ${registro.tipo}\nFecha: ${registro.fecha}\nDispositivo: ${registro.dispositivo}\nEstado: ${registro.estado}\nNivel de confianza: ${registro.confianza}%`);
    }
}

function mostrarNotificacion(mensaje, tipo) {
    const notificacion = document.getElementById('notificacion');
    notificacion.textContent = mensaje;
    notificacion.className = `notificacion notificacion-${tipo}`;
    notificacion.style.display = 'block';
    setTimeout(() => { notificacion.style.display = 'none'; }, 3000);
}

function getTipoTexto(tipo) {
    const tipos = { 'huella': 'Huella Dactilar', 'facial': 'Reconocimiento Facial', 'voz': 'Reconocimiento de Voz', 'iris': 'Escaneo de Iris' };
    return tipos[tipo] || tipo;
}

function getEstadoTexto(estado) {
    const estados = { 'exitoso': 'Exitoso', 'fallido': 'Fallido', 'pendiente': 'Pendiente' };
    return estados[estado] || estado;
}