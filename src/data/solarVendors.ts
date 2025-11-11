export type SolarVendor = {
  id: string;
  name: string;
  rating: number;
  basePricePerKwINR: number;
  priceRangeINR: string;
  locations: string[];
  yearsExperience: number;
  highlights: string[];
  website?: string;
  contact?: string;
};

export const solarVendors: SolarVendor[] = [
  {
    id: 'tata-power-solar',
    name: 'Tata Power Solar',
    rating: 4.7,
    basePricePerKwINR: 70000,
    priceRangeINR: '₹65,000 – ₹80,000 per kW',
    locations: ['Pan-India', 'Tier 1 metro service centres'],
    yearsExperience: 34,
    highlights: ['MNRE empanelled', '25-year performance warranty', 'Integrated financing partners'],
    website: 'https://www.tatapowersolar.com/',
    contact: '+91 1800 419 8777',
  },
  {
    id: 'loom-solar',
    name: 'Loom Solar',
    rating: 4.5,
    basePricePerKwINR: 62000,
    priceRangeINR: '₹58,000 – ₹72,000 per kW',
    locations: ['Pan-India virtual network', 'Over 500 distributors'],
    yearsExperience: 8,
    highlights: ['Microinverter specialists', 'Express installation (3–5 days)', 'Online monitoring app'],
    website: 'https://www.loomsolar.com/',
    contact: '+91 9711 33 1444',
  },
  {
    id: 'vikram-solar',
    name: 'Vikram Solar',
    rating: 4.4,
    basePricePerKwINR: 68000,
    priceRangeINR: '₹62,000 – ₹78,000 per kW',
    locations: ['Delhi NCR', 'Mumbai', 'Bengaluru', 'Kolkata'],
    yearsExperience: 17,
    highlights: ['High-efficiency mono-PERC panels', 'Strong O&M network', 'Utility + rooftop portfolio'],
    website: 'https://www.vikramsolar.com/',
    contact: '+91 33 6609 6000',
  },
  {
    id: 'servokon-solar',
    name: 'Servokon Solar',
    rating: 4.3,
    basePricePerKwINR: 60000,
    priceRangeINR: '₹55,000 – ₹68,000 per kW',
    locations: ['North India focus', 'Delhi NCR', 'Lucknow', 'Jaipur'],
    yearsExperience: 10,
    highlights: ['Custom rooftop design', 'Hybrid inverter options', 'After-sales AMC plans'],
    website: 'https://servokonsolar.com/',
    contact: '+91 9310 66 8999',
  },
  {
    id: 'renewsys-solar',
    name: 'RenewSys Solar',
    rating: 4.2,
    basePricePerKwINR: 64000,
    priceRangeINR: '₹60,000 – ₹74,000 per kW',
    locations: ['South & West India', 'Chennai', 'Hyderabad', 'Pune'],
    yearsExperience: 12,
    highlights: ['Backward-integrated manufacturer', 'PID-resistant modules', 'PAN India service partners'],
    website: 'https://www.renewsysworld.com/',
    contact: '+91 9121 78 9917',
  },
];

export default solarVendors;

