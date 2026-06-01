// static/js/dashboard-charts.js
document.addEventListener('DOMContentLoaded', function() {
    if (typeof Chart === 'undefined') {
        console.error('Chart.js no está cargado');
        return;
    }

    // ========== 1. GRÁFICO DE ACCESOS POR HORA ==========
    const horasCanvas = document.getElementById('accesosHorasChart');
    if (horasCanvas) {
        const datosHoras = JSON.parse(horasCanvas.dataset.horas || '[]');
        new Chart(horasCanvas.getContext('2d'), {
            type: 'line',
            data: {
                labels: ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', 
                         '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'],
                datasets: [{
                    label: 'Accesos',
                    data: datosHoras,
                    borderColor: '#1abc9c',
                    backgroundColor: 'rgba(26, 188, 156, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#1abc9c',
                    pointBorderColor: '#fff',
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, title: { display: true, text: 'Número de accesos' } } }
            }
        });
    }

    // ========== 2. GRÁFICO DE ACCESOS POR DÍA ==========
    const diasCanvas = document.getElementById('accesosDiasChart');
    if (diasCanvas) {
        const datosDias = JSON.parse(diasCanvas.dataset.dias || '[]');
        const etiquetas = JSON.parse(diasCanvas.dataset.etiquetas || '[]');
        new Chart(diasCanvas.getContext('2d'), {
            type: 'bar',
            data: {
                labels: etiquetas,
                datasets: [{
                    label: 'Accesos',
                    data: datosDias,
                    backgroundColor: '#3498db',
                    borderRadius: 8,
                    barPercentage: 0.7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, title: { display: true, text: 'Accesos' } } }
            }
        });
    }

    // ========== 3. GRÁFICO ESTADO DE DISPOSITIVOS ==========
    const dispositivosCanvas = document.getElementById('dispositivosChart');
    if (dispositivosCanvas) {
        const activos = parseInt(dispositivosCanvas.dataset.activos || '0');
        const inactivos = parseInt(dispositivosCanvas.dataset.inactivos || '0');
        const error = parseInt(dispositivosCanvas.dataset.error || '0');
        
        new Chart(dispositivosCanvas.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Activos', 'Inactivos', 'Error'],
                datasets: [{
                    data: [activos, inactivos, error],
                    backgroundColor: ['#2ecc71', '#95a5a6', '#e74c3c'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { padding: 15, usePointStyle: true } } },
                cutout: '65%'
            }
        });
    }

    // ========== 4. GRÁFICO DE ALERTAS POR NIVEL ==========
    const alertasCanvas = document.getElementById('alertasChart');
    if (alertasCanvas) {
        const criticas = parseInt(alertasCanvas.dataset.criticas || '0');
        const media = parseInt(alertasCanvas.dataset.media || '0');
        const baja = parseInt(alertasCanvas.dataset.baja || '0');
        const informativa = parseInt(alertasCanvas.dataset.informativa || '0');
        
        new Chart(alertasCanvas.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Críticas', 'Media', 'Baja', 'Informativa'],
                datasets: [{
                    data: [criticas, media, baja, informativa],
                    backgroundColor: ['#e74c3c', '#f39c12', '#3498db', '#95a5a6'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { padding: 15, usePointStyle: true } }
                },
                cutout: '65%'
            }
        });
    }
});