export interface FinancialData {
  currentAssets: number;
  monthlyExpenses: number;
  monthlyIncome: number;
  sideIncome?: number;
  incomeGrowthRate: number;
  inflationRate: number;
  initialAssets: number;
  monthlyReturnRate: number;
  years: number;
  currentAge: number;
  maxAnnualIncome: number;
}

export interface InvestmentScenario {
  month: number;
  assets: number;
  monthlyIncome: number;
  monthlyExpenses: number;
} 