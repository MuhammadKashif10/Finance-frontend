// Dummy data for the finance dashboard
// Easy to replace with API calls later

export interface SaudiEntry {
  id: string;
  date: string;
  time: string;
  refNo: string;
  pkrAmount: number;
  riyalRate: number;
  submittedSar: number;
  reference2: string;
}

export interface SpecialEntry {
  id: string;
  userName: string;
  date: string;
  balanceType: 'Online' | 'Cash';
  nameRupees: number;
  submittedRupees: number;
}

export interface BankLedgerEntry {
  id: string;
  date: string;
  referenceType: 'Online' | 'Cash';
  amountAdded: number;
  amountWithdrawn: number;
}

export interface Bank {
  id: string;
  name: string;
  code: string;
  entries: BankLedgerEntry[];
}

export interface Trader {
  id: string;
  name: string;
  shortName: string;
  color: string;
  banks: Bank[];
}

// Saudi Hisaab Kitaab Data
export const saudiData: SaudiEntry[] = [
  {
    id: '1',
    date: '2024-12-20',
    time: '09:30 AM',
    refNo: 'SAU-001',
    pkrAmount: 500000,
    riyalRate: 75.50,
    submittedSar: 6000,
    reference2: 'Monthly Transfer',
  },
  {
    id: '2',
    date: '2024-12-19',
    time: '02:15 PM',
    refNo: 'SAU-002',
    pkrAmount: 750000,
    riyalRate: 75.25,
    submittedSar: 9500,
    reference2: 'Business Payment',
  },
  {
    id: '3',
    date: '2024-12-18',
    time: '11:45 AM',
    refNo: 'SAU-003',
    pkrAmount: 300000,
    riyalRate: 75.00,
    submittedSar: 4200,
    reference2: 'Supplier Payment',
  },
  {
    id: '4',
    date: '2024-12-17',
    time: '04:00 PM',
    refNo: 'SAU-004',
    pkrAmount: 1200000,
    riyalRate: 74.80,
    submittedSar: 15000,
    reference2: 'Investment Return',
  },
  {
    id: '5',
    date: '2024-12-16',
    time: '10:20 AM',
    refNo: 'SAU-005',
    pkrAmount: 450000,
    riyalRate: 75.10,
    submittedSar: 6500,
    reference2: 'Commission',
  },
  {
    id: '6',
    date: '2024-12-15',
    time: '03:30 PM',
    refNo: 'SAU-006',
    pkrAmount: 680000,
    riyalRate: 74.90,
    submittedSar: 8800,
    reference2: 'Trade Settlement',
  },
];

// Special Hisaab Kitaab Data
export const specialData: SpecialEntry[] = [
  {
    id: '1',
    userName: 'Ahmed Khan',
    date: '2024-12-20',
    balanceType: 'Online',
    nameRupees: 150000,
    submittedRupees: 120000,
  },
  {
    id: '2',
    userName: 'Muhammad Ali',
    date: '2024-12-19',
    balanceType: 'Cash',
    nameRupees: 250000,
    submittedRupees: 280000,
  },
  {
    id: '3',
    userName: 'Fatima Bibi',
    date: '2024-12-18',
    balanceType: 'Online',
    nameRupees: 180000,
    submittedRupees: 180000,
  },
  {
    id: '4',
    userName: 'Hassan Raza',
    date: '2024-12-17',
    balanceType: 'Cash',
    nameRupees: 320000,
    submittedRupees: 290000,
  },
  {
    id: '5',
    userName: 'Zainab Malik',
    date: '2024-12-16',
    balanceType: 'Online',
    nameRupees: 95000,
    submittedRupees: 110000,
  },
];

// Pakistani Hisaab Kitaab Data - Traders with Banks
export const tradersData: Trader[] = [
  {
    id: 'sulman',
    name: 'Sulman Traders',
    shortName: 'ST',
    color: 'from-blue-500 to-blue-600',
    banks: [
      {
        id: 'hbl',
        name: 'HBL',
        code: 'HBL',
        entries: [
          { id: '1', date: '2024-12-20', referenceType: 'Online', amountAdded: 500000, amountWithdrawn: 200000 },
          { id: '2', date: '2024-12-19', referenceType: 'Cash', amountAdded: 300000, amountWithdrawn: 150000 },
          { id: '3', date: '2024-12-18', referenceType: 'Online', amountAdded: 0, amountWithdrawn: 100000 },
        ],
      },
      {
        id: 'ubl',
        name: 'UBL',
        code: 'UBL',
        entries: [
          { id: '1', date: '2024-12-20', referenceType: 'Cash', amountAdded: 400000, amountWithdrawn: 180000 },
          { id: '2', date: '2024-12-19', referenceType: 'Online', amountAdded: 250000, amountWithdrawn: 300000 },
        ],
      },
      {
        id: 'meezan',
        name: 'Meezan',
        code: 'MZN',
        entries: [
          { id: '1', date: '2024-12-20', referenceType: 'Online', amountAdded: 600000, amountWithdrawn: 400000 },
        ],
      },
    ],
  },
  {
    id: 'shahzaib',
    name: 'Shahzaib Traders',
    shortName: 'SHT',
    color: 'from-emerald-500 to-emerald-600',
    banks: [
      {
        id: 'alfalah',
        name: 'Bank Alfalah',
        code: 'ALF',
        entries: [
          { id: '1', date: '2024-12-20', referenceType: 'Online', amountAdded: 350000, amountWithdrawn: 120000 },
          { id: '2', date: '2024-12-19', referenceType: 'Cash', amountAdded: 200000, amountWithdrawn: 250000 },
        ],
      },
      {
        id: 'mcb',
        name: 'MCB',
        code: 'MCB',
        entries: [
          { id: '1', date: '2024-12-20', referenceType: 'Cash', amountAdded: 450000, amountWithdrawn: 200000 },
        ],
      },
    ],
  },
  {
    id: 'kashif',
    name: 'Kashif Traders',
    shortName: 'KT',
    color: 'from-purple-500 to-purple-600',
    banks: [
      {
        id: 'hbl',
        name: 'HBL',
        code: 'HBL',
        entries: [
          { id: '1', date: '2024-12-20', referenceType: 'Online', amountAdded: 280000, amountWithdrawn: 100000 },
        ],
      },
      {
        id: 'jazzcash',
        name: 'JazzCash',
        code: 'JZC',
        entries: [
          { id: '1', date: '2024-12-20', referenceType: 'Online', amountAdded: 150000, amountWithdrawn: 80000 },
          { id: '2', date: '2024-12-19', referenceType: 'Online', amountAdded: 100000, amountWithdrawn: 120000 },
        ],
      },
    ],
  },
  {
    id: 'abid',
    name: 'Abid Traders',
    shortName: 'AT',
    color: 'from-orange-500 to-orange-600',
    banks: [
      {
        id: 'ubl',
        name: 'UBL',
        code: 'UBL',
        entries: [
          { id: '1', date: '2024-12-20', referenceType: 'Cash', amountAdded: 520000, amountWithdrawn: 300000 },
          { id: '2', date: '2024-12-18', referenceType: 'Online', amountAdded: 180000, amountWithdrawn: 200000 },
        ],
      },
    ],
  },
  {
    id: 'yousuf',
    name: 'Yousuf Traders',
    shortName: 'YT',
    color: 'from-cyan-500 to-cyan-600',
    banks: [
      {
        id: 'meezan',
        name: 'Meezan',
        code: 'MZN',
        entries: [
          { id: '1', date: '2024-12-20', referenceType: 'Online', amountAdded: 380000, amountWithdrawn: 150000 },
        ],
      },
      {
        id: 'easypaisa',
        name: 'Easypaisa',
        code: 'EPY',
        entries: [
          { id: '1', date: '2024-12-20', referenceType: 'Online', amountAdded: 90000, amountWithdrawn: 45000 },
        ],
      },
    ],
  },
  {
    id: 'noor',
    name: 'Noor Traders',
    shortName: 'NT',
    color: 'from-pink-500 to-pink-600',
    banks: [
      {
        id: 'allied',
        name: 'Allied Bank',
        code: 'ABL',
        entries: [
          { id: '1', date: '2024-12-20', referenceType: 'Cash', amountAdded: 420000, amountWithdrawn: 180000 },
          { id: '2', date: '2024-12-19', referenceType: 'Online', amountAdded: 310000, amountWithdrawn: 350000 },
        ],
      },
    ],
  },
  {
    id: 'khaliq',
    name: 'Khaliq Traders',
    shortName: 'KHT',
    color: 'from-indigo-500 to-indigo-600',
    banks: [
      {
        id: 'hbl',
        name: 'HBL',
        code: 'HBL',
        entries: [
          { id: '1', date: '2024-12-20', referenceType: 'Online', amountAdded: 550000, amountWithdrawn: 220000 },
        ],
      },
      {
        id: 'askari',
        name: 'Askari Bank',
        code: 'ASK',
        entries: [
          { id: '1', date: '2024-12-20', referenceType: 'Cash', amountAdded: 280000, amountWithdrawn: 150000 },
        ],
      },
      {
        id: 'faysal',
        name: 'Faysal Bank',
        code: 'FYS',
        entries: [
          { id: '1', date: '2024-12-19', referenceType: 'Online', amountAdded: 190000, amountWithdrawn: 100000 },
        ],
      },
    ],
  },
];

// Helper functions for calculations
export const calculateSaudiBalance = (pkrAmount: number, riyalRate: number, submittedSar: number): number => {
  return (pkrAmount / riyalRate) - submittedSar;
};

export const calculateSpecialBalance = (nameRupees: number, submittedRupees: number): number => {
  return nameRupees - submittedRupees;
};

export const calculateRemainingAmount = (amountAdded: number, amountWithdrawn: number): number => {
  return amountAdded - amountWithdrawn;
};

// Format currency for display
export const formatCurrency = (amount: number, currency: string = 'PKR'): string => {
  return new Intl.NumberFormat('en-PK', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount) + ` ${currency}`;
};

export const formatNumber = (amount: number): string => {
  return new Intl.NumberFormat('en-PK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};
