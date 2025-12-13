"use client";

import { cn } from "@repo/ui";
import { Calculator, Percent } from "lucide-react";
import { useEffect, useState } from "react";

interface MortgageCalculatorProps {
  price: number;
}

type LoanType = "vip" | "biess" | "private";

const LOAN_TYPES = {
  vip: {
    label: "Crédito VIP/VIS",
    rate: 4.99,
    maxTerm: 25,
    description: "Tasa subsidiada (4.99%) para primera vivienda nueva hasta $105,340 (aprox).",
  },
  biess: {
    label: "BIESS / IESS",
    rate: 8.5,
    maxTerm: 25,
    description: "Préstamo hipotecario para afiliados al IESS.",
  },
  private: {
    label: "Banca Privada",
    rate: 10.5,
    maxTerm: 20,
    description: "Crédito hipotecario estándar de bancos privados.",
  },
};

export function MortgageCalculator({ price }: MortgageCalculatorProps) {
  const [loanType, setLoanType] = useState<LoanType>("private");
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [termYears, setTermYears] = useState(20);
  const [interestRate, setInterestRate] = useState(10.5);

  // Auto-update defaults when loan type changes
  useEffect(() => {
    const type = LOAN_TYPES[loanType];
    setInterestRate(type.rate);
    setTermYears(type.maxTerm);

    // VIP usually requires less down payment (5%), others 20%
    if (loanType === "vip") {
      setDownPaymentPercent(5);
    } else {
      setDownPaymentPercent(20);
    }
  }, [loanType]);

  // Calculations
  const downPaymentAmount = (price * downPaymentPercent) / 100;
  const loanAmount = price - downPaymentAmount;
  
  // Monthly Payment Calculation (Amortization)
  const calculateMonthlyPayment = () => {
    if (loanAmount <= 0) return 0;
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = termYears * 12;

    if (interestRate === 0) return loanAmount / numberOfPayments;

    const numerator = monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments);
    const denominator = Math.pow(1 + monthlyRate, numberOfPayments) - 1;
    
    return loanAmount * (numerator / denominator);
  };

  const monthlyPayment = calculateMonthlyPayment();

  // Format currency
  const formatMoney = (val: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <div className="bg-white dark:bg-oslo-gray-900 rounded-2xl p-6 shadow-sm border border-oslo-gray-200 dark:border-oslo-gray-800 space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-primary/10 rounded-lg text-primary">
          <Calculator className="w-5 h-5" />
        </div>
        <h3 className="text-xl font-bold text-oslo-gray-950 dark:text-white">
          Calculadora Hipotecaria
        </h3>
      </div>

      {/* Loan Type Selector */}
      <div className="grid grid-cols-3 gap-2 p-1 bg-oslo-gray-100 dark:bg-oslo-gray-800 rounded-xl">
        {(Object.keys(LOAN_TYPES) as LoanType[]).map((type) => (
          <button
            key={type}
            onClick={() => setLoanType(type)}
            className={cn(
              "py-2 px-3 text-sm font-medium rounded-lg transition-all duration-200",
              loanType === type
                ? "bg-white dark:bg-oslo-gray-800 text-primary shadow-sm border border-transparent dark:border-oslo-gray-700"
                : "text-oslo-gray-500 hover:text-oslo-gray-900 dark:hover:text-white hover:bg-oslo-gray-200/50 dark:hover:bg-oslo-gray-800/50"
            )}
          >
            {type === 'vip' ? 'VIP 4.87%' : type === 'biess' ? 'BIESS' : 'Banco'}
          </button>
        ))}
      </div>

      <p className="text-xs text-oslo-gray-500 dark:text-oslo-gray-400 -mt-2 px-1">
        {LOAN_TYPES[loanType].description}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Col: Inputs */}
        <div className="space-y-5">
          {/* Down Payment */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-oslo-gray-600 dark:text-oslo-gray-300">Entrada ({downPaymentPercent}%)</span>
              <span className="font-semibold text-oslo-gray-900 dark:text-white">{formatMoney(downPaymentAmount)}</span>
            </div>
            <input
              type="range"
              min="5"
              max="80"
              step="1"
              value={downPaymentPercent}
              onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
              className="w-full h-2 bg-oslo-gray-200 dark:bg-oslo-gray-800 rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>

          {/* Term */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-oslo-gray-600 dark:text-oslo-gray-300">Plazo</span>
              <span className="font-semibold text-oslo-gray-900 dark:text-white">{termYears} Años</span>
            </div>
            <input
              type="range"
              min="5"
              max="30"
              step="1"
              value={termYears}
              onChange={(e) => setTermYears(Number(e.target.value))}
              className="w-full h-2 bg-oslo-gray-200 dark:bg-oslo-gray-800 rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>

           {/* Interest Rate (Editable) */}
           <div className="space-y-1">
            <label className="text-sm text-oslo-gray-600 dark:text-oslo-gray-300">Tasa de Interés (%)</label>
             <div className="relative">
                <input 
                    type="number" 
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="w-full bg-oslo-gray-50 dark:bg-oslo-gray-800 border border-oslo-gray-200 dark:border-oslo-gray-700 rounded-lg py-2 pl-3 pr-8 text-sm text-oslo-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
                <Percent className="absolute right-3 top-2.5 w-4 h-4 text-oslo-gray-400" />
             </div>
          </div>
        </div>

        {/* Right Col: Result */}
        <div className="bg-primary/5 dark:bg-primary/10 rounded-xl p-6 flex flex-col justify-center items-center text-center border border-primary/10">
          <span className="text-sm font-medium text-oslo-gray-500 dark:text-oslo-gray-400 uppercase tracking-wider mb-2">
            Cuota Mensual Estimada
          </span>
          <div className="text-4xl font-bold text-primary mb-1">
             {formatMoney(monthlyPayment)}
          </div>
          <span className="text-xs text-oslo-gray-400 dark:text-oslo-gray-500">
            *No incluye seguros ni impuestos
          </span>

          <div className="w-full h-px bg-primary/10 my-4" />
          
          <div className="w-full flex justify-between text-xs text-oslo-gray-500 dark:text-oslo-gray-400">
            <span>Monto Préstamo:</span>
            <span className="font-semibold">{formatMoney(loanAmount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
