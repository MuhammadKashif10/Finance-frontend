import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface TopbarProps {
  title: string;
  breadcrumbs: BreadcrumbItem[];
}

/**
 * Topbar component with page title and breadcrumbs
 * Used across all dashboard pages for consistent navigation
 */
const Topbar = ({ title, breadcrumbs }: TopbarProps) => {
  return (
    <header className="bg-card border-b border-border px-6 py-4 lg:pl-6">
      {/* Breadcrumbs */}
      <nav className="breadcrumb mb-2">
        {breadcrumbs.map((item, index) => (
          <span key={index} className="flex items-center gap-2">
            {index > 0 && <ChevronRight className="w-4 h-4 breadcrumb-separator" />}
            {item.path ? (
              <Link
                to={item.path}
                className="hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="breadcrumb-active">{item.label}</span>
            )}
          </span>
        ))}
      </nav>

      {/* Page Title */}
      <h1 className="page-title">{title}</h1>
    </header>
  );
};

export default Topbar;
