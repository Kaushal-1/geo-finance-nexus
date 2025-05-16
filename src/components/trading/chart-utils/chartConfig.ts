
import { ChartOptions } from 'chart.js';

// Professional chart styling for financial data visualization
export const createChartOptions = (showVolume = true): ChartOptions<'candlestick'> => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 10,
        right: 10,
        bottom: 0,
        left: 10
      }
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      x: {
        grid: {
          display: true,
          color: "rgba(255, 255, 255, 0.05)",
          drawBorder: false,
        },
        ticks: {
          color: "#9ca3af",
          font: {
            family: "'Inter', sans-serif",
            size: 11
          },
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 10,
        },
        border: {
          display: false
        }
      },
      y: {
        position: 'right',
        grid: {
          color: "rgba(255, 255, 255, 0.05)",
          drawBorder: false,
        },
        ticks: {
          color: "#9ca3af",
          font: {
            family: "'Inter', sans-serif",
            size: 11
          },
          callback: (value) => `$${Number(value).toFixed(2)}`,
          count: 5,
        },
        border: {
          display: false
        }
      },
      ...(showVolume ? {
        y1: {
          position: 'left',
          grid: {
            drawOnChartArea: false,
            drawBorder: false,
          },
          ticks: {
            color: "#9ca3af",
            font: {
              family: "'Inter', sans-serif",
              size: 11
            },
            callback: (value) => {
              const numValue = Number(value);
              if (numValue >= 1000000) {
                return `${(numValue / 1000000).toFixed(1)}M`;
              } else if (numValue >= 1000) {
                return `${(numValue / 1000).toFixed(1)}K`;
              }
              return value;
            },
            count: 3,
          },
          border: {
            display: false
          }
        }
      } : {})
    },
    plugins: {
      legend: {
        position: 'top',
        align: 'start',
        labels: {
          color: '#e5e7eb',
          font: {
            family: "'Inter', sans-serif",
            size: 12
          },
          usePointStyle: true,
          padding: 15
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleFont: {
          family: "'Inter', sans-serif",
          size: 14,
          weight: 600 
        },
        bodyFont: {
          family: "'Inter', sans-serif",
          size: 12
        },
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        borderColor: 'rgba(107, 114, 128, 0.3)',
        borderWidth: 1,
        callbacks: {
          label: (context) => {
            const datasetLabel = context.dataset.label || '';
            const value = context.parsed.y;
            
            if (context.dataset.yAxisID === 'y1') {
              // Format volume with commas
              return `${datasetLabel}: ${value.toLocaleString()}`;
            }
            
            // Format price with precision
            return `${datasetLabel}: $${value.toFixed(2)}`;
          },
          title: (tooltipItems) => {
            // Format the date for the tooltip title
            return tooltipItems[0].label;
          }
        }
      },
      crosshair: {
        line: {
          color: 'rgba(107, 114, 128, 0.6)',
          width: 1,
          dashPattern: [5, 5]
        },
        sync: {
          enabled: true
        },
        zoom: {
          enabled: true
        }
      }
    },
    animation: false
  };
};

export const darkThemeColors = {
  green: {
    base: '#22c55e',
    gradient: {
      start: 'rgba(34, 197, 94, 0.2)',
      end: 'rgba(34, 197, 94, 0)'
    }
  },
  red: {
    base: '#ef4444',
    gradient: {
      start: 'rgba(239, 68, 68, 0.2)',
      end: 'rgba(239, 68, 68, 0)'
    }
  },
  blue: {
    base: '#3b82f6',
    gradient: {
      start: 'rgba(59, 130, 246, 0.2)',
      end: 'rgba(59, 130, 246, 0)'
    }
  },
  amber: {
    base: '#f59e0b',
    gradient: {
      start: 'rgba(245, 158, 11, 0.2)',
      end: 'rgba(245, 158, 11, 0)'
    }
  },
  purple: {
    base: '#a855f7',
    gradient: {
      start: 'rgba(168, 85, 247, 0.2)',
      end: 'rgba(168, 85, 247, 0)'
    }
  },
  gray: {
    light: '#9ca3af',
    medium: '#6b7280',
    dark: '#374151'
  }
};
