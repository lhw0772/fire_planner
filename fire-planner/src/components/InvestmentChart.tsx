import React, { useRef, useState, useEffect } from 'react';
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
}

const InvestmentChart: React.FC<InvestmentChartProps> = ({
  scenarios,
  currentAge,
  retirementOffsetYear
}) => {
  const chartRef = useRef<ChartJS<"line">>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // 금액을 적절한 단위로 변환하는 함수
  const formatAmount = (amount: number): string => {
    const amountInManwon = amount / 10000; // 원 단위를 만원 단위로 변환
    
    if (amountInManwon >= 10000) { // 1억 이상
      const billions = Math.floor(amountInManwon / 10000);
      const remainder = amountInManwon % 10000;
      if (remainder === 0) {
        return `${billions}억원`;
      }
      return `${billions}억 ${remainder.toLocaleString()}만원`;
    } else if (amountInManwon >= 1000) { // 1천만원 이상
      const thousands = Math.floor(amountInManwon / 1000);
      const remainder = amountInManwon % 1000;
      if (remainder === 0) {
        return `${thousands}천만원`;
      }
      return `${thousands}천 ${remainder.toLocaleString()}만원`;
    } else {
      return `${Math.round(amountInManwon).toLocaleString()}만원`;
    }
  };

  // 파산 시점을 찾는 함수
  const findBankruptcyAge = (): number | null => {
    for (let i = 0; i < scenarios.length; i++) {
      if (scenarios[i].assets < 0) {
        return currentAge + Math.floor(i / 12);
      }
    }
    return null;
  };

  const bankruptcyAge = findBankruptcyAge();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      title: {
        display: true,
        text: 'FIRE 시뮬레이션',
        font: {
          size: isMobile ? 16 : 20
        }
      },
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false,
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
      },
      legend: {
        position: isMobile ? 'bottom' : 'top',
        labels: {
          boxWidth: isMobile ? 12 : 40,
          padding: isMobile ? 10 : 20,
          font: {
            size: isMobile ? 12 : 14
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
          text: '예상 자산 (만원)',
          font: {
            size: isMobile ? 12 : 14
          }
        },
        beginAtZero: true,
        ticks: {
          callback: function(value, index, ticks) {
            const valueInManwon = (value as number / 10000);
            return `${valueInManwon.toLocaleString(undefined, { maximumFractionDigits: 0 })}만`;
          },
          font: {
            size: isMobile ? 10 : 12
          },
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: isMobile ? 5 : 8
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: '연 수입/지출 (만원)',
          font: {
            size: isMobile ? 12 : 14
          }
        },
        grid: {
          drawOnChartArea: false,
        },
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return `${(value as number / 10000).toLocaleString(undefined, { maximumFractionDigits: 0 })}만`;
          },
          font: {
            size: isMobile ? 10 : 12
          },
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: isMobile ? 5 : 8
        }
      },
      x: {
        ticks: {
          font: {
            size: isMobile ? 10 : 12
          },
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: isMobile ? 6 : 12
        }
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 md:p-6">
      {scenarios && scenarios.length > 0 ? (
        <>
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">자산 시뮬레이션 결과</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-yellow-100 rounded-lg p-4 shadow-sm border border-yellow-200">
                <p className="text-base mb-2 h-8" style={{ fontWeight: 800, color: '#1a202c' }}>현재 자산</p>
                <p className="text-2xl" style={{ color: '#dc2626' }}>
                  {formatAmount(scenarios[0].assets)}
                </p>
              </div>

              {retirementOffsetYear !== null && (
                <div className="bg-yellow-100 rounded-lg p-4 shadow-sm border border-yellow-200">
                  <p className="text-base mb-2 h-8" style={{ fontWeight: 800, color: '#1a202c' }}>
                    {currentAge + retirementOffsetYear}세 은퇴 시점 자산
                  </p>
                  <p className="text-2xl" style={{ color: '#dc2626' }}>
                    {formatAmount(scenarios[retirementOffsetYear * 12].assets)}
                  </p>
                </div>
              )}

              <div className="bg-yellow-100 rounded-lg p-4 shadow-sm border border-yellow-200">
                <p className="text-base mb-2 h-8" style={{ fontWeight: 800, color: '#1a202c' }}>
                  {bankruptcyAge ? `${bankruptcyAge}세 파산` : '100세 시점 자산'}
                </p>
                <p className="text-2xl" style={{ color: '#dc2626' }}>
                  {bankruptcyAge ? '0원' : formatAmount(scenarios[scenarios.length - 1].assets)}
                </p>
              </div>
            </div>
          </div>

          <div style={{ height: isMobile ? '300px' : '500px' }}>
            <Line ref={chartRef} data={data} options={options} />
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">재정 정보를 입력하면 시뮬레이션 결과가 표시됩니다.</p>
        </div>
      )}
    </div>
  );
};

export default InvestmentChart; 