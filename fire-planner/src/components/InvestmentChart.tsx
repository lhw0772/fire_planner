import React, { useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { InvestmentScenario } from '../types';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartType
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface InvestmentChartProps {
  scenarios: InvestmentScenario[];
  currentAge: number;
  retirementOffsetYear: number | null;
  onRetirementOffsetChange: (year: number | null) => void;
}

const InvestmentChart: React.FC<InvestmentChartProps> = ({
  scenarios,
  currentAge,
  retirementOffsetYear,
  onRetirementOffsetChange
}) => {
  const chartRef = useRef<ChartJS<"line">>(null);
  
  console.log('InvestmentChart - received scenarios (first 5 expenses):', scenarios.slice(0, 5).map(s => s.monthlyExpenses));

  const annualExpensesData = scenarios.map(s => s.monthlyExpenses * 12);
  console.log('InvestmentChart - annualExpensesData (first 5):', annualExpensesData.slice(0, 5));

  const data = {
    labels: scenarios.map((_, index) => `${currentAge + Math.floor(index / 12)}세`),
    datasets: [
      {
        label: '예상 자산',
        data: scenarios.map(s => s.assets),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.1,
        yAxisID: 'y'
      },
      {
        label: '연 수입',
        data: scenarios.map(s => s.monthlyIncome * 12),
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        tension: 0.1,
        yAxisID: 'y1'
      },
      {
        label: '연 지출',
        data: annualExpensesData,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        tension: 0.1,
        yAxisID: 'y1'
      }
    ]
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      title: {
        display: true,
        text: 'FIRE 시뮬레이션'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              const value = context.parsed.y / 10000;
              label += `${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}만원`;
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: '예상 자산 (만원)'
        },
        beginAtZero: true,
        ticks: {
          callback: function(value, index, ticks) {
            const valueInManwon = (value as number / 10000);
            return `${valueInManwon.toLocaleString(undefined, { maximumFractionDigits: 0 })}만`;
          }
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: '연 수입/지출 (만원)'
        },
        grid: {
          drawOnChartArea: false,
        },
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return `${(value as number / 10000).toLocaleString(undefined, { maximumFractionDigits: 0 })}만`;
          }
        }
      }
    }
  };

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    const handleClick = (event: MouseEvent) => {
      const elements = chart.getElementsAtEventForMode(
        event,
        'nearest',
        { intersect: true },
        false
      );

      if (elements.length > 0) {
        const element = elements[0];
        const offsetYear = Math.floor(element.index / 12);
        onRetirementOffsetChange(offsetYear);
      }
    };

    const canvas = chart.canvas;
    canvas.addEventListener('click', handleClick);
    return () => {
      canvas.removeEventListener('click', handleClick);
    };
  }, [onRetirementOffsetChange]);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <Line ref={chartRef} data={data} options={options} />
      {retirementOffsetYear !== null && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            선택된 은퇴 나이: {currentAge + retirementOffsetYear}세
          </p>
          <button
            className="mt-2 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            onClick={() => onRetirementOffsetChange(null)}
          >
            선택 해제
          </button>
        </div>
      )}
    </div>
  );
};

export default InvestmentChart; 