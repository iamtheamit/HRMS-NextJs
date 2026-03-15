import type {
  SalaryBreakdown,
  SalaryComponents,
  SalaryComputed,
  SalaryRates,
  SalaryTemplate
} from '@/entities/salary/types/salary.types';

export type SalaryOverride = {
  rates?: Partial<SalaryRates>;
  components?: Partial<SalaryComponents>;
  status?: SalaryTemplate['status'];
};

const roundCurrency = (value: number) => Math.round(value * 100) / 100;

export function calculateSalaryBreakdown(
  components: SalaryComponents,
  rates: SalaryRates
): SalaryBreakdown {
  const grossPay =
    components.basic +
    components.hra +
    components.allowances +
    components.bonus +
    components.otherEarnings;

  const pfEmployee = components.basic * (rates.pfEmployeeRate / 100);
  const pfEmployer = components.basic * (rates.pfEmployerRate / 100);
  const esi = grossPay * (rates.esiRate / 100);
  const tds = grossPay * (rates.tdsRate / 100);
  const totalDeductions = pfEmployee + esi + tds + components.otherDeductions;

  return {
    grossPay: roundCurrency(grossPay),
    pfEmployee: roundCurrency(pfEmployee),
    pfEmployer: roundCurrency(pfEmployer),
    esi: roundCurrency(esi),
    tds: roundCurrency(tds),
    totalDeductions: roundCurrency(totalDeductions),
    netPay: roundCurrency(grossPay - totalDeductions)
  };
}

export function applySalaryOverride(template: SalaryTemplate, override?: SalaryOverride): SalaryComputed {
  const mergedRates: SalaryRates = {
    ...template.rates,
    ...override?.rates
  };

  const mergedComponents: SalaryComponents = {
    ...template.components,
    ...override?.components
  };

  const breakdown = calculateSalaryBreakdown(mergedComponents, mergedRates);

  return {
    ...template,
    rates: mergedRates,
    components: mergedComponents,
    status: override?.status ?? template.status,
    breakdown
  };
}
