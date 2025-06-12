import { FinancialData, InvestmentScenario } from '../types';

export const calculateSurvivalMonths = (data: FinancialData): number => {
  const monthlyIncome = data.monthlyIncome + (data.sideIncome || 0);
  if (monthlyIncome >= data.monthlyExpenses) {
    return Infinity;
  }
  return Math.floor(data.currentAssets / (data.monthlyExpenses - monthlyIncome));
};

export const calculateTargetAchievementTime = (
  data: FinancialData,
  targetAmount: number
): number => {
  const monthlyIncome = data.monthlyIncome + (data.sideIncome || 0);
  const monthlySavings = monthlyIncome - data.monthlyExpenses;
  
  if (monthlySavings <= 0) {
    return Infinity;
  }

  const annualIncomeGrowthRate = data.incomeGrowthRate / 100;
  const monthlyIncomeGrowthRate = Math.pow(1 + annualIncomeGrowthRate, 1/12) - 1;
  const monthlyInflationRate = data.inflationRate / 100 / 12;
  let currentAssets = data.currentAssets;
  let currentMonthlySavings = monthlySavings;
  let months = 0;

  while (currentAssets < targetAmount && months < 1200) {
    currentAssets += currentMonthlySavings;
    currentMonthlySavings *= (1 + monthlyIncomeGrowthRate - monthlyInflationRate);
    months++;
  }

  return months;
};

export const calculateSafetyScore = (data: FinancialData): number => {
  const survivalMonths = calculateSurvivalMonths(data);
  const targetTime = calculateTargetAchievementTime(data, data.currentAssets * 300);
  
  if (survivalMonths === Infinity) {
    return 100;
  }
  
  if (survivalMonths <= 0) {
    return 0;
  }

  const survivalScore = Math.min(100, (survivalMonths / 120) * 100);
  const targetScore = Math.min(100, (1200 / targetTime) * 100);
  
  return Math.round((survivalScore + targetScore) / 2);
};

export const simulateInvestment = (
  data: FinancialData,
  annualReturnRate: number,
  retirementYear: number | null
): InvestmentScenario[] => {
  const monthlyIncome = data.monthlyIncome + (data.sideIncome || 0);
  
  const monthlyReturnRate = Math.pow(1 + annualReturnRate / 100, 1/12) - 1;
  const monthlyIncomeGrowthRate = Math.pow(1 + data.incomeGrowthRate / 100, 1/12) - 1;
  const monthlyInflationRate = Math.pow(1 + data.inflationRate / 100, 1/12) - 1;
  
  let currentAssets = data.currentAssets;
  let currentMonthlyIncome = monthlyIncome;
  let currentMonthlyExpenses = data.monthlyExpenses;
  let months = 0;
  const scenarios: InvestmentScenario[] = [];

  scenarios.push({
    month: 0,
    assets: currentAssets,
    monthlyIncome: currentMonthlyIncome,
    monthlyExpenses: currentMonthlyExpenses
  });

  while (months < 1200) {
    const year = Math.floor(months / 12);
    const isRetired = retirementYear !== null && year >= retirementYear;
    
    const investmentReturn = currentAssets * monthlyReturnRate;
    
    const monthlyNetIncome = isRetired ? -currentMonthlyExpenses : (currentMonthlyIncome - currentMonthlyExpenses);
    
    currentAssets = currentAssets + investmentReturn + monthlyNetIncome;
    
    if (!isRetired) {
      currentMonthlyIncome *= (1 + monthlyIncomeGrowthRate);
    }
    currentMonthlyExpenses *= (1 + monthlyInflationRate);
    
    scenarios.push({
      month: months + 1,
      assets: currentAssets,
      monthlyIncome: isRetired ? 0 : currentMonthlyIncome,
      monthlyExpenses: currentMonthlyExpenses
    });
    
    months++;
  }

  return scenarios;
};

// 자녀 양육비 계산을 위한 인터페이스 추가
export interface ChildRearingCost {
  childBirthYear: number;  // 자녀 출생 예정 연도
  monthlyCost: number;     // 월별 추가 양육비
}

// 자녀 연령대별 월별 양육비 계산 함수
function calculateChildMonthlyCost(childAge: number): number {
  if (childAge < 0) return 0;  // 출생 전
  if (childAge <= 3) return 750000;  // 0-3세: 월 75만원
  if (childAge <= 6) return 500000;  // 4-6세: 월 50만원
  if (childAge <= 12) return 750000; // 7-12세: 월 75만원
  if (childAge <= 18) return 1100000; // 13-18세: 월 110만원
  if (childAge <= 22) return 1250000; // 19-22세: 월 125만원 (대학교)
  return 0;  // 23세 이상
}

// 자녀 양육비 계산 함수
function calculateChildRearingCost(
  currentYear: number,
  childBirthYear: number,
  currentAge: number
): number {
  const childAge = currentYear - childBirthYear;
  return calculateChildMonthlyCost(childAge);
}

export function calculateInvestmentScenarios(
  initialAssets: number,
  monthlyIncome: number,
  monthlyExpenses: number,
  monthlyReturnRate: number,
  inflationRate: number,
  incomeGrowthRate: number,
  years: number,
  childRearingCost?: ChildRearingCost,
  retirementOffsetYear?: number | null,
  maxAnnualIncome?: number
): InvestmentScenario[] {
  const scenarios: InvestmentScenario[] = [];
  let currentAssets = initialAssets;
  let currentMonthlyIncome = monthlyIncome;
  let currentMonthlyExpenses = monthlyExpenses;
  const currentYear = new Date().getFullYear();
  const currentAge = new Date().getMonth() < 3 ? 0 : 1; // 1월-3월은 0, 4월-12월은 1

  for (let i = 0; i < years * 12; i++) {
    const year = Math.floor(i / 12);
    const month = i % 12;
    
    // 은퇴 나이 이후에는 수입을 0으로 설정
    let monthlyIncomeAfterRetirement = currentMonthlyIncome;
    if (retirementOffsetYear !== undefined && retirementOffsetYear !== null && year >= retirementOffsetYear) {
      monthlyIncomeAfterRetirement = 0;
    }
    
    // 자녀 양육비 계산 주석 처리
    // let childCost = 0;
    // if (childRearingCost) {
    //   const baseChildCost = calculateChildRearingCost(
    //     currentYear + year,
    //     childRearingCost.childBirthYear,
    //     currentAge
    //   );
    //   // 인플레이션 적용 (연 단위로 적용)
    //   childCost = baseChildCost * Math.pow(1 + inflationRate / 100, year);
    // }

    // 월별 자산 업데이트
    currentAssets = currentAssets * (1 + monthlyReturnRate) + 
                   (monthlyIncomeAfterRetirement - currentMonthlyExpenses /* - childCost */);

    // 연말에만 수입 증가와 인플레이션 적용
    if (month === 11) {
      // 수입 증가 전에 최대 연봉 확인
      const currentAnnualIncome = currentMonthlyIncome * 12;
      const growthFactor = 1 + incomeGrowthRate / 100;
      
      if (maxAnnualIncome && currentAnnualIncome * growthFactor > maxAnnualIncome * 10000) { // 만원에서 원으로 변환
        // 최대 연봉에 도달했거나 초과할 경우 최대 연봉으로 제한
        currentMonthlyIncome = maxAnnualIncome * 10000 / 12; // 만원에서 원으로 변환 후 월 단위로 계산
      } else {
        // 최대 연봉 미만인 경우 정상적으로 증가
        currentMonthlyIncome *= growthFactor;
      }
      
      currentMonthlyExpenses *= (1 + inflationRate / 100);
    }

    scenarios.push({
      month: i,
      assets: currentAssets,
      monthlyIncome: monthlyIncomeAfterRetirement,
      monthlyExpenses: currentMonthlyExpenses /* + childCost */
    });
  }

  return scenarios;
} 