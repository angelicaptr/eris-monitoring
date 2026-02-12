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
import { useTheme } from "next-themes";

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

// Shared props
interface ChartProps {
    data: any[];
    title?: string;
    onClick?: (label: string) => void;
}

const getChartColors = (isDark: boolean) => ({
    grid: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
    text: isDark ? '#94a3b8' : '#64748b',
    title: isDark ? '#f1f5f9' : '#1e293b',
    tooltipBg: isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
    tooltipText: isDark ? '#f1f5f9' : '#1e293b',
});

// Helper to determine dark mode
const useIsDark = () => {
    const { theme, systemTheme } = useTheme();
    return theme === 'dark' || (theme === 'system' && systemTheme === 'dark');
};

export function TrendChart({ data, title = "Error Trend (Last 7 Days)" }: { data: { date: string; count: number }[]; title?: string }) {
    const isDark = useIsDark();
    const colors = getChartColors(isDark);

    const chartData = {
        labels: data.map(d => {
            const date = new Date(d.date);
            return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        }),
        datasets: [
            {
                label: 'Total Errors',
                data: data.map(d => d.count),
                borderColor: 'rgb(239, 68, 68)',
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
            legend: { display: false },
            title: {
                display: true,
                text: title,
                color: colors.title
            },
            tooltip: {
                backgroundColor: colors.tooltipBg,
                titleColor: colors.tooltipText,
                bodyColor: colors.tooltipText,
                borderColor: isDark ? '#334155' : '#e2e8f0',
                borderWidth: 1,
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: { stepSize: 1, color: colors.text },
                grid: { color: colors.grid }
            },
            x: {
                ticks: { color: colors.text },
                grid: { display: false }
            }
        },
    };

    return <Line options={options} data={chartData} />;
}


export function DistributionChart({ data, title = "Top Errors", onClick }: ChartProps) {
    const isDark = useIsDark();
    const colors = getChartColors(isDark);

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
                borderColor: isDark ? 'rgba(30, 41, 59, 1)' : '#fff',
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
                labels: { color: colors.text }
            },
            title: { display: true, text: title, color: colors.title },
            tooltip: {
                backgroundColor: colors.tooltipBg,
                titleColor: colors.tooltipText,
                bodyColor: colors.tooltipText,
                borderColor: isDark ? '#334155' : '#e2e8f0',
                borderWidth: 1,
            }
        },
        onClick: (event: any, elements: any) => {
            if (onClick && elements.length > 0) {
                const index = elements[0].index;
                const label = data[index].label;
                onClick(label);
            }
        },
        onHover: (event: any, chartElement: any) => {
            event.native.target.style.cursor = chartElement[0] ? 'pointer' : 'default';
        }
    };

    return <Doughnut options={options} data={chartData} />;
}

export function ComparisonChart({ data, title = "App Comparison", onClick }: ChartProps) {
    const isDark = useIsDark();
    const colors = getChartColors(isDark);

    const chartData = {
        labels: data.map(d => d.label),
        datasets: [
            {
                label: 'Total Errors',
                data: data.map(d => d.value),
                backgroundColor: 'rgba(79, 70, 229, 0.7)',
                borderColor: 'rgba(79, 70, 229, 1)',
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: { display: true, text: title, color: colors.title },
            tooltip: {
                backgroundColor: colors.tooltipBg,
                titleColor: colors.tooltipText,
                bodyColor: colors.tooltipText,
                borderColor: isDark ? '#334155' : '#e2e8f0',
                borderWidth: 1,
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: { color: colors.text },
                grid: { color: colors.grid }
            },
            x: {
                ticks: {
                    color: colors.text,
                    callback: function (this: any, val: any) {
                        const label = this.getLabelForValue(val) as string;
                        return label.length > 15 ? label.substr(0, 15) + '...' : label;
                    }
                },
                grid: { display: false }
            }
        },
        onClick: (event: any, elements: any) => {
            if (onClick && elements.length > 0) {
                const index = elements[0].index;
                const label = data[index].label;
                onClick(label);
            }
        },
        onHover: (event: any, chartElement: any) => {
            event.native.target.style.cursor = chartElement[0] ? 'pointer' : 'default';
        }
    };

    return <Bar options={options} data={chartData} />;
}

export function SeverityChart({ data, title = "Severity Distribution", onClick }: ChartProps) {
    const isDark = useIsDark();
    const colors = getChartColors(isDark);

    const severityColors: Record<string, string> = {
        critical: 'rgba(239, 68, 68, 0.8)',
        error: 'rgba(249, 115, 22, 0.8)',
        warning: 'rgba(234, 179, 8, 0.8)',
        info: 'rgba(59, 130, 246, 0.8)',
    };

    const chartData = {
        labels: data.map(d => d.label.toUpperCase()),
        datasets: [
            {
                label: 'Count',
                data: data.map(d => d.value),
                backgroundColor: data.map(d => severityColors[d.label] || 'rgba(156, 163, 175, 0.8)'),
                borderWidth: isDark ? 0 : 1,
                borderColor: isDark ? 'transparent' : '#fff'
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right' as const,
                labels: { color: colors.text }
            },
            title: { display: true, text: title, color: colors.title },
            tooltip: {
                backgroundColor: colors.tooltipBg,
                titleColor: colors.tooltipText,
                bodyColor: colors.tooltipText,
                borderColor: isDark ? '#334155' : '#e2e8f0',
                borderWidth: 1,
            }
        },
        onClick: (event: any, elements: any) => {
            if (onClick && elements.length > 0) {
                const index = elements[0].index;
                const label = data[index].label;
                onClick(label);
            }
        },
        onHover: (event: any, chartElement: any) => {
            event.native.target.style.cursor = chartElement[0] ? 'pointer' : 'default';
        }
    };

    return <Pie options={options} data={chartData} />;
}
