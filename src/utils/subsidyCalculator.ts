// Simple subsidy estimation utilities

export type EstimateResult = {
  grossCost: number;
  central: number;
  stateSubsidy: number;
  netCost: number;
  systemKw: number;
};

// Basic configuration (can be moved to a config file)
const DEFAULT_COST_PER_KW = 65000; // INR per kW
const DEFAULT_ANNUAL_PRODUCTION_PER_KW = 1100; // kWh per kW per year
const DEFAULT_AREA_PER_KW = 8; // m2 per kW usable

export function estimateSystemSizeKw(opts: { roofArea?: number; annualConsumptionKWh?: number }) {
  const { roofArea = 0, annualConsumptionKWh = 0 } = opts;
  if (annualConsumptionKWh > 0) {
    return Math.max(0.5, Math.min(10, annualConsumptionKWh / DEFAULT_ANNUAL_PRODUCTION_PER_KW));
  }
  if (roofArea > 0) {
    return Math.max(0.5, Math.min(10, roofArea / DEFAULT_AREA_PER_KW));
  }
  return 1; // fallback
}

// Very small built-in scheme sample (real app should load from data files)
const builtinCentralSchemes = [
  {
    id: 'pm-surya-ghar',
    name: 'PM Surya Ghar',
    subsidyPercent: 40,
    maxAmountINR: 200000,
  },
];

const builtinStatePolicy = {
  capexSubsidyPercent: 0,
};

export function estimateSubsidy(systemKw: number, costPerKw = DEFAULT_COST_PER_KW, schemes = builtinCentralSchemes, statePolicy = builtinStatePolicy): EstimateResult {
  const grossCost = systemKw * costPerKw;

  let central = 0;
  schemes.forEach(s => {
    if (s.subsidyPercent) {
      central += Math.min(grossCost * (s.subsidyPercent / 100), s.maxAmountINR ?? Infinity);
    }
  });

  const stateSubsidy = Math.min(grossCost * (statePolicy.capexSubsidyPercent / 100 || 0), Infinity);

  const netCost = Math.max(0, grossCost - central - stateSubsidy);

  return { grossCost, central, stateSubsidy, netCost, systemKw };
}

export default estimateSubsidy;
