import React from 'react';
import { FinancialData } from '../types';

interface FinancialInputProps {
  data: FinancialData;
  onDataChange: (data: FinancialData) => void;
}

const FinancialInput: React.FC<FinancialInputProps> = ({ data, onDataChange }) => {
  const handleInputChange = (field: keyof FinancialData, valueAsString: string) => {
    // 빈 문자열이면 0으로 처리
    if (valueAsString === '') {
      onDataChange({ ...data, [field]: 0 });
      return;
    }
    
    // 앞의 0을 제거하고 숫자로 변환
    const cleanValue = valueAsString.replace(/^0+/, '');
    const value = Number(cleanValue);
    
    // 유효한 숫자인 경우에만 업데이트
    if (!isNaN(value)) {
      onDataChange({ ...data, [field]: value * 10000 });
    }
  };

  const formatToManwon = (value: number | undefined): number => {
    return value ? Math.round(value / 10000) : 0;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">재정 정보 입력</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">현재 자산 (만원)</label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={formatToManwon(data.currentAssets)}
            onChange={(e) => handleInputChange('currentAssets', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">월 수입 (만원)</label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={formatToManwon(data.monthlyIncome)}
            onChange={(e) => handleInputChange('monthlyIncome', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">월 지출 (만원)</label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={formatToManwon(data.monthlyExpenses)}
            onChange={(e) => handleInputChange('monthlyExpenses', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">부수입 (만원)</label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={formatToManwon(data.sideIncome)}
            onChange={(e) => handleInputChange('sideIncome', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>
    </div>
  );
};

export default FinancialInput; 