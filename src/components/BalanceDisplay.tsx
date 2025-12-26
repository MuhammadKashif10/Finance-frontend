import { formatNumber } from '@/data/dummyData';

interface BalanceDisplayProps {
  amount: number;
  currency?: string;
  showSign?: boolean;
}

/**
 * Component to display balance with color coding
 * Positive values are green, negative values are red, zero is neutral
 */
const BalanceDisplay = ({ amount, currency = 'PKR', showSign = true }: BalanceDisplayProps) => {
  const isPositive = amount > 0;
  const isNegative = amount < 0;
  const isZero = amount === 0;

  const getColorClass = () => {
    if (isPositive) return 'balance-positive';
    if (isNegative) return 'balance-negative';
    return 'text-muted-foreground';
  };

  const getSign = () => {
    if (!showSign) return '';
    if (isPositive) return '+';
    return '';
  };

  return (
    <span className={getColorClass()}>
      {getSign()}
      {formatNumber(Math.abs(amount))} {currency}
    </span>
  );
};

export default BalanceDisplay;
