import Chart from 'chart.js/auto';

export function createLineChart(ctx, incomes, year, text) {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

    const monthlyData = months.map((_, index) => {
        const monthNum = String(index + 1).padStart(2, '0');
        return incomes?.monthly?.[year]?.[monthNum] || 0;
    });

    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [{
                label: text,
                data: monthlyData,
                borderColor: '#1E40AF',
                backgroundColor: 'rgba(147, 197, 253, 0.2)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#1E40AF',
                pointBorderColor: '#FFFFFF',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return `RM ${context.raw}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function (value) {
                            return 'RM ' + value;
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}