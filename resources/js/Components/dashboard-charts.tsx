import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    Filler,
    BarElement
} from 'chart.js';
import { Line, Doughnut, Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    Filler
);

interface TrendChartProps {
    data: { date: string; count: number }[];
    title?: string;
}

export function TrendChart({ data, title = "Error Trend (Last 7 Days)" }: TrendChartProps) {
    const chartData = {
        labels: data.map(d => {
            const date = new Date(d.date);
            return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        }),
        datasets: [
            {
                label: 'Total Errors',
                data: data.map(d => d.count),
                borderColor: 'rgb(239, 68, 68)', // red-500
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                fill: true,
                tension: 0.4,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: true,
                text: title,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1
                }
            },
        },
    };

    return <Line options={options} data={chartData} />;
}

interface DistributionChartProps {
    data: { label: string; value: number }[];
    title?: string;
}

export function DistributionChart({ data, title = "Top Errors" }: DistributionChartProps) {
    const chartData = {
        labels: data.map(d => d.label),
        datasets: [
            {
                label: '# of Errors',
                data: data.map(d => d.value),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 206, 86, 0.7)',
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(153, 102, 255, 0.7)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right' as const,
            },
            title: {
                display: true,
                text: title,
            },
        },
    };

    return <Doughnut options={options} data={chartData} />;
}

export function ComparisonChart({ data, title = "App Comparison" }: DistributionChartProps) {
    const chartData = {
        labels: data.map(d => d.label),
        datasets: [
            {
                label: 'Total Errors',
                data: data.map(d => d.value),
                backgroundColor: 'rgba(79, 70, 229, 0.7)', // Indigo
                borderColor: 'rgba(79, 70, 229, 1)',
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: true,
                text: title,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
            },
            x: {
                ticks: {
                    callback: function (this: any, val: any) {
                        const label = this.getLabelForValue(val) as string;
                        return label.length > 15 ? label.substr(0, 15) + '...' : label;
                    }
                }
            }
        }
    };

    return <Bar options={options} data={chartData} />;
}

export function SeverityChart({ data, title = "Severity Distribution" }: DistributionChartProps) {
    const severityColors: Record<string, string> = {
        critical: 'rgba(239, 68, 68, 0.8)', // Red
        error: 'rgba(249, 115, 22, 0.8)',    // Orange
        warning: 'rgba(234, 179, 8, 0.8)',   // Yellow
        info: 'rgba(59, 130, 246, 0.8)',     // Blue
    };

    const chartData = {
        labels: data.map(d => d.label.toUpperCase()),
        datasets: [
            {
                label: 'Count',
                data: data.map(d => d.value),
                backgroundColor: data.map(d => severityColors[d.label] || 'rgba(156, 163, 175, 0.8)'),
                borderWidth: 0,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right' as const,
            },
            title: {
                display: true,
                text: title,
            },
        },
    };

    return <Pie options={options} data={chartData} />;
}
