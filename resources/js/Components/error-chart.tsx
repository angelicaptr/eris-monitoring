import { Line, Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from "chart.js";


ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface ErrorChartProps {
    data: {
        time: string;
        critical: number;
        error: number;
        warning: number;
    }[];
    chartType: "line" | "bar";
    onClick?: (hour: string) => void;
}

import { useRef } from 'react';

export function ErrorChart({ data, chartType, onClick }: ErrorChartProps) {
    const chartRef = useRef<any>(null);

    const chartData = {
        // ... (same as before)
        labels: data.map((d) => d.time),
        datasets: [
            {
                label: "Critical",
                data: data.map((d) => d.critical),
                borderColor: "rgb(239, 68, 68)",
                backgroundColor: chartType === "line" ? "rgba(239, 68, 68, 0.1)" : "rgba(239, 68, 68, 0.8)",
                fill: chartType === "line",
                tension: 0.4,
            },
            {
                label: "Error",
                data: data.map((d) => d.error),
                borderColor: "rgb(249, 115, 22)",
                backgroundColor: chartType === "line" ? "rgba(249, 115, 22, 0.1)" : "rgba(249, 115, 22, 0.8)",
                fill: chartType === "line",
                tension: 0.4,
            },
            {
                label: "Warning",
                data: data.map((d) => d.warning),
                borderColor: "rgb(234, 179, 8)",
                backgroundColor: chartType === "line" ? "rgba(234, 179, 8, 0.1)" : "rgba(234, 179, 8, 0.8)",
                fill: chartType === "line",
                tension: 0.4,
            },
        ],
    };

    const options: any = {
        responsive: true,
        maintainAspectRatio: false,
        onClick: (_evt: any, elements: any[]) => {
            if (elements.length > 0 && onClick) {
                const index = elements[0].index;
                const hour = data[index].time;
                onClick(hour);
            }
        },
        plugins: {
            legend: {
                position: "top" as const,
                align: 'end' as const,
                labels: {
                    usePointStyle: true,
                    boxWidth: 8,
                    useBorderRadius: true,
                    borderRadius: 4,
                    padding: 20,
                    font: {
                        family: "'Inter', sans-serif",
                        size: 12
                    }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                titleColor: '#1f2937',
                bodyColor: '#4b5563',
                borderColor: '#e5e7eb',
                borderWidth: 1,
                padding: 12,
                boxPadding: 4,
                usePointStyle: true,
                titleFont: {
                    family: "'Inter', sans-serif",
                    size: 13,
                    weight: 'bold'
                },
                bodyFont: {
                    family: "'Inter', sans-serif",
                    size: 12
                },
                callbacks: {
                    labelColor: function (context: any) {
                        return {
                            borderColor: context.dataset.borderColor,
                            backgroundColor: context.dataset.borderColor,
                            borderWidth: 0,
                            borderRadius: 2,
                        };
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                border: {
                    display: false
                },
                grid: {
                    color: "rgba(0, 0, 0, 0.05)",
                    drawBorder: false,
                    tickLength: 0,
                },
                ticks: {
                    padding: 10,
                    font: {
                        family: "'Inter', sans-serif",
                        size: 11
                    },
                    color: '#6b7280'
                }
            },
            x: {
                grid: {
                    display: false,
                    drawBorder: false,
                },
                ticks: {
                    padding: 10,
                    font: {
                        family: "'Inter', sans-serif",
                        size: 11
                    },
                    color: '#6b7280'
                }
            }
        },
        interaction: {
            mode: 'index',
            intersect: false,
        },
        elements: {
            line: {
                tension: 0.4
            },
            point: {
                radius: 0,
                hitRadius: 10,
                hoverRadius: 4
            }
        }
    };

    return (
        <div className="w-full h-full p-2">
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Daily Statistics</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400">Hourly error distribution for today</p>
            </div>
            <div className="h-[320px] w-full">
                {chartType === "line" ? (
                    <Line ref={chartRef} data={chartData} options={options} />
                ) : (
                    <Bar ref={chartRef} data={chartData} options={options} />
                )}
            </div>
        </div>
    );
}
