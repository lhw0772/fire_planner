import React, { useState, useEffect } from 'react';
import FinancialInput from '../components/FinancialInput';
import InvestmentChart from '../components/InvestmentChart';
import { FinancialData, InvestmentScenario } from '../types';
import {
  calculateSurvivalMonths,
  calculateTargetAchievementTime,
  calculateSafetyScore,
  simulateInvestment,
  calculateInvestmentScenarios,
  ChildRearingCost
} from '../utils/calculations';

const Home: React.FC = () => {
  const [financialData, setFinancialData] = useState<FinancialData>(() => {
    const initialAge = 30;
    return {
      currentAssets: 0,
      monthlyIncome: 0,
      monthlyExpenses: 0,
      sideIncome: 0,
      incomeGrowthRate: 3,
      inflationRate: 2,
      initialAssets: 0,
      monthlyReturnRate: 0.5,
      years: 100 - initialAge, // 초기 years 계산
      currentAge: initialAge,
      maxAnnualIncome: 12000 // 1억 2천만원 (만원 단위)
    };
  });

  const [selectedRate, setSelectedRate] = useState<number>(6);
  const [retirementOffsetYear, setRetirementOffsetYear] = useState<number | null>(null);
  const [childBirthUserAge, setChildBirthUserAge] = useState<number | null>(null);
  const [showChildCost, setShowChildCost] = useState(false);
  const [investmentScenarios, setInvestmentScenarios] = useState<InvestmentScenario[]>([]);
  
  useEffect(() => {
    let actualChildBirthYear: number | undefined = undefined;
    if (showChildCost && childBirthUserAge !== null && childBirthUserAge >= financialData.currentAge) {
      const yearsUntilBirth = childBirthUserAge - financialData.currentAge;
      actualChildBirthYear = new Date().getFullYear() + yearsUntilBirth;
    }

    const childRearingCost: ChildRearingCost | undefined = showChildCost && actualChildBirthYear
      ? {
          childBirthYear: actualChildBirthYear,
          monthlyCost: 0 // 실제 비용은 calculateChildMonthlyCost 함수에서 계산됨
        }
      : undefined;

    console.log('Home useEffect - childRearingCost (calculated year):', childRearingCost);
    console.log('Home useEffect - retirementOffsetYear:', retirementOffsetYear);
    console.log('Home useEffect - maxAnnualIncome:', financialData.maxAnnualIncome, '만원');

    // 시뮬레이션 기간을 100세까지로 동적 계산
    const yearsToSimulate = 100 - financialData.currentAge;

    const calculatedScenarios = calculateInvestmentScenarios(
      financialData.currentAssets,
      financialData.monthlyIncome,
      financialData.monthlyExpenses,
      selectedRate / 100 / 12, // 연 수익률을 월 수익률로 변환
      financialData.inflationRate,
      financialData.incomeGrowthRate,
      yearsToSimulate, // 동적으로 계산된 years 사용
      childRearingCost,
      retirementOffsetYear, // 은퇴 나이 전달
      financialData.maxAnnualIncome // 최대 연봉 전달
    );
    
    console.log('Home useEffect - calculatedScenarios expenses (first 5):', calculatedScenarios.slice(0, 5).map(s => s.monthlyExpenses));
    setInvestmentScenarios(calculatedScenarios);
  }, [financialData, selectedRate, showChildCost, childBirthUserAge, retirementOffsetYear]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">FIRE 플래너</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">재정 정보 입력</h2>
          
          <div className="flex items-center gap-4">
            <input
              type="number"
              min="0"
              max="99" // 100세 미만으로 제한
              value={financialData.currentAge}
              onChange={(e) => {
                const newAge = Number(e.target.value);
                setFinancialData({
                  ...financialData,
                  currentAge: newAge,
                  years: 100 - newAge // 나이 변경 시 years도 업데이트
                });
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            <span className="text-lg font-medium text-gray-900 w-16 text-right">
              세
            </span>
          </div>

          <FinancialInput data={financialData} onDataChange={setFinancialData} />
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">연 투자수익률</h2>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="20"
                value={selectedRate}
                onChange={(e) => setSelectedRate(Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-lg font-medium text-gray-900 w-16 text-right">
                {selectedRate}%
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">연 수입 상승률</h2>
            <div className="flex items-center gap-4 mb-4">
              <input
                type="range"
                min="0"
                max="20"
                value={financialData.incomeGrowthRate}
                onChange={(e) => setFinancialData({
                  ...financialData,
                  incomeGrowthRate: Number(e.target.value)
                })}
                className="flex-1"
              />
              <span className="text-lg font-medium text-gray-900 w-16 text-right">
                {financialData.incomeGrowthRate}%
              </span>
            </div>
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">
                최대 연봉 (만원):
              </label>
              <input
                type="number"
                min="0"
                step="100"
                value={financialData.maxAnnualIncome}
                onChange={(e) => setFinancialData({
                  ...financialData,
                  maxAnnualIncome: Number(e.target.value)
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="최대 연봉 (만원)"
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">물가 상승률</h2>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="10"
                value={financialData.inflationRate}
                onChange={(e) => setFinancialData({
                  ...financialData,
                  inflationRate: Number(e.target.value)
                })}
                className="flex-1"
              />
              <span className="text-lg font-medium text-gray-900 w-16 text-right">
                {financialData.inflationRate}%
              </span>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              자녀 양육비 계산
            </label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showChildCost}
                  onChange={(e) => setShowChildCost(e.target.checked)}
                  className="mr-2"
                />
                자녀 양육비 계산 포함
              </label>
            </div>
          </div>

          {showChildCost && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                자녀 출생 시 나의 나이
              </label>
              <input
                type="number"
                value={childBirthUserAge || ''}
                onChange={(e) => setChildBirthUserAge(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder={`예: ${financialData.currentAge + 1}`}
                min={financialData.currentAge}
              />
              <p className="text-sm text-gray-500 mt-1">
                현재 나이: {financialData.currentAge}세
              </p>
            </div>
          )}
        </div>

        <InvestmentChart 
          scenarios={investmentScenarios} 
          currentAge={financialData.currentAge}
          retirementOffsetYear={retirementOffsetYear}
          onRetirementOffsetChange={setRetirementOffsetYear}
        />
      </div>
    </div>
  );
};

export default Home; 