// static/js/dashboard-charts.js
document.addEventListener('DOMContentLoaded', function() {
    // Verificar si Chart.js está disponible
    if (typeof Chart === 'undefined') {
        console.error('Chart.js no está cargado');
        return;
    }

    // Gráfico de Asistencia (Doughnut)
    const asistenciaCanvas = document.getElementById('asistenciaChart');
    if (asistenciaCanvas) {
        const asistenciaChart = new Chart(asistenciaCanvas.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Asistencia', 'Ausencia', 'Tardanzas'],
                datasets: [{
                    data: [245, 45, 30],
                    backgroundColor: ['#2ecc71', '#e74c3c', '#f39c12'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            usePointStyle: true
                        }
                    }
                },
                cutout: '70%'
            }
        });
    }
    
    // Gráfico de Estado de Dispositivos (Doughnut)
    const dispositivosCanvas = document.getElementById('dispositivosChart');
    if (dispositivosCanvas) {
        const dispositivosChart = new Chart(dispositivosCanvas.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Online', 'Offline', 'No Autorizado'],
                datasets: [{
                    data: [57, 8, 2],
                    backgroundColor: ['#2ecc71', '#e74c3c', '#f39c12'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            usePointStyle: true
                        }
                    }
                },
                cutout: '70%'
            }
        });
    }
    
    // Gráfico de Presentismo (Doughnut)
    const presentismoCanvas = document.getElementById('presentismoChart');
    if (presentismoCanvas) {
        const presentismoChart = new Chart(presentismoCanvas.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Presentes', 'Ausentes', 'Tardanzas'],
                datasets: [{
                    data: [245, 45, 30],
                    backgroundColor: ['#2ecc71', '#e74c3c', '#3498db'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            usePointStyle: true
                        }
                    }
                },
                cutout: '70%'
            }
        });
    }
    
    // Gráfico de Excepciones de Asistencia (Bar)
    const excepcionesCanvas = document.getElementById('excepcionesChart');
    if (excepcionesCanvas) {
        const excepcionesChart = new Chart(excepcionesCanvas.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
                datasets: [
                    {
                        label: 'Llegadas tarde',
                        data: [8, 6, 7, 5, 4, 0, 0],
                        backgroundColor: '#3498db',
                        borderRadius: 4
                    },
                    {
                        label: 'Salidas temprano',
                        data: [3, 4, 2, 5, 6, 0, 0],
                        backgroundColor: '#e74c3c',
                        borderRadius: 4
                    },
                    {
                        label: 'Ausencia',
                        data: [7, 6, 8, 9, 15, 0, 0],
                        backgroundColor: '#f39c12',
                        borderRadius: 4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 5
                        }
                    }
                }
            }
        });
    }
});