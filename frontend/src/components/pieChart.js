import Chart from 'chart.js/auto';

export function createPieChart(ctx, data, year, text) {
    const backgroundColors = [
        '#1E40AF', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE',
        '#2563EB', '#1D4ED8', '#1E3A8A', '#172554', '#0EA5E9',
        '#0284C7', '#0C4A6E'
    ];

    const categories = data?.category?.[year] || {};
    const categoryKeys = Object.keys(categories);
    const total = Object.values(categories).reduce((acc, val) => acc + val, 0);

    return new Chart(ctx, {
        type: 'pie',
        data: {
            labels: categoryKeys,
            datasets: [{
                label: text,
                data: Object.values(categories),
                backgroundColor: backgroundColors.slice(0, total),
                borderColor: '#FFFFFF',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        usePointStyle: true,
                        padding: 20
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                            return `${label}: RM ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}