import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  interactive?: boolean;
}

/**
 * Reusable Card component with optional click handler
 * Use interactive prop for clickable cards with hover effects
 */
const Card = ({ children, onClick, className = '', interactive = false }: CardProps) => {
  const baseClasses = 'bg-card rounded-xl border border-border';
  const interactiveClasses = interactive
    ? 'card-interactive'
    : 'p-6 shadow-card';

  return (
    <div
      onClick={onClick}
      className={`${interactive ? interactiveClasses : baseClasses + ' p-6 shadow-card'} ${className}`}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {children}
    </div>
  );
};

export default Card;
