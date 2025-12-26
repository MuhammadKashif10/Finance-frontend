import { useState, useEffect } from 'react';
import Topbar from '@/components/Topbar';
import Card from '@/components/Card';
import { Link } from 'react-router-dom';
import {
  Globe,
  Landmark,
  Star,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { saudiAPI, specialAPI, tradersAPI } from '@/lib/api';
import { formatNumber } from '@/data/dummyData';

interface RecentActivity {
  type: 'credit' | 'debit';
  label: string;
  amount: string;
  time: string;
  timestamp: Date;
}

/**
 * Format relative time (e.g., "2 hours ago", "1 day ago")
 */
const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }
  const days = Math.floor(diffInSeconds / 86400);
  return `${days} ${days === 1 ? 'day' : 'days'} ago`;
};

/**
 * Main Dashboard page - overview of all Hisaab Kitaab sections
 */
const Dashboard = () => {
  const [summaryCards, setSummaryCards] = useState([
    {
      title: 'Saudi Hisaab Kitaab',
      description: 'Track Saudi Riyal transactions and balances',
      icon: Globe,
      path: '/dashboard/persons/saudi',
      color: 'from-blue-500 to-blue-600',
      stats: { label: 'Total Entries', value: '0' },
    },
    {
      title: 'Pakistani Hisaab Kitaab',
      description: 'Manage trader accounts and bank ledgers',
      icon: Landmark,
      path: '/dashboard/persons/pakistani',
      color: 'from-emerald-500 to-emerald-600',
      stats: { label: 'Active Traders', value: '0' },
    },
    {
      title: 'Special Hisaab Kitaab',
      description: 'Special transactions and user balances',
      icon: Star,
      path: '/dashboard/persons/special',
      color: 'from-amber-500 to-amber-600',
      stats: { label: 'Total Users', value: '0' },
    },
  ]);

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        // Fetch all data in parallel
        const [saudiEntries, specialEntries, traders] = await Promise.all([
          saudiAPI.getAll().catch(() => []),
          specialAPI.getAll().catch(() => []),
          tradersAPI.getAll().catch(() => []),
        ]);

        // Update summary cards with real counts
        setSummaryCards((prev) => [
          {
            ...prev[0],
            stats: { label: 'Total Entries', value: saudiEntries.length.toString() },
          },
          {
            ...prev[1],
            stats: { label: 'Active Traders', value: traders.length.toString() },
          },
          {
            ...prev[2],
            stats: { label: 'Total Users', value: specialEntries.length.toString() },
          },
        ]);

        // Build recent activity from all sources
        const activities: RecentActivity[] = [];

        // Saudi entries
        saudiEntries.forEach((entry: any) => {
          // Parse date and time - handle different time formats
          let dateTime: Date;
          try {
            // Try to parse as ISO string first
            if (entry.createdAt) {
              dateTime = new Date(entry.createdAt);
            } else {
              // Parse date and time separately
              const timeStr = entry.time.replace(/\s*(AM|PM)\s*/i, ''); // Remove AM/PM if present
              const [hours, minutes] = timeStr.split(':').map(Number);
              dateTime = new Date(entry.date);
              if (!isNaN(hours) && !isNaN(minutes)) {
                dateTime.setHours(hours, minutes || 0, 0, 0);
              }
            }
          } catch {
            dateTime = new Date(entry.date);
          }

          activities.push({
            type: entry.submittedSar > 0 ? 'debit' : 'credit',
            label: `Saudi Transfer - ${entry.refNo}`,
            amount: `-${formatNumber(entry.submittedSar)} SAR`,
            time: formatRelativeTime(dateTime),
            timestamp: dateTime,
          });
        });

        // Special entries
        specialEntries.forEach((entry: any) => {
          // Use createdAt if available, otherwise parse date
          let dateTime: Date;
          try {
            dateTime = entry.createdAt ? new Date(entry.createdAt) : new Date(entry.date);
          } catch {
            dateTime = new Date();
          }
          const balance = entry.nameRupees - entry.submittedRupees;
          activities.push({
            type: balance >= 0 ? 'credit' : 'debit',
            label: `${entry.userName} - ${entry.balanceType}`,
            amount: `${balance >= 0 ? '+' : ''}${formatNumber(Math.abs(balance))} PKR`,
            time: formatRelativeTime(dateTime),
            timestamp: dateTime,
          });
        });

        // Traders bank ledger entries
        for (const trader of traders) {
          if (trader.banks && Array.isArray(trader.banks)) {
            for (const bank of trader.banks) {
              if (bank.entries && Array.isArray(bank.entries)) {
                bank.entries.forEach((entry: any) => {
                  // Use createdAt if available, otherwise parse date
                  let dateTime: Date;
                  try {
                    dateTime = entry.createdAt ? new Date(entry.createdAt) : new Date(entry.date);
                  } catch {
                    dateTime = new Date();
                  }
                  const netAmount = entry.amountAdded - entry.amountWithdrawn;
                  activities.push({
                    type: netAmount >= 0 ? 'credit' : 'debit',
                    label: `${trader.name} - ${bank.name} ${netAmount >= 0 ? 'Deposit' : 'Withdrawal'}`,
                    amount: `${netAmount >= 0 ? '+' : ''}${formatNumber(Math.abs(netAmount))} PKR`,
                    time: formatRelativeTime(dateTime),
                    timestamp: dateTime,
                  });
                });
              }
            }
          }
        }

        // Sort by timestamp (most recent first) and take top 4
        activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        setRecentActivity(activities.slice(0, 4));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="animate-fade-in">
      <Topbar
        title="Dashboard"
        breadcrumbs={[{ label: 'Dashboard' }]}
      />

      <main className="p-6 space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-6 text-primary-foreground">
          <h2 className="text-2xl font-bold mb-2">Welcome to Finance Dashboard</h2>
          <p className="text-primary-foreground/80">
            Manage your Hisaab Kitaab transactions across Saudi, Pakistani, and Special accounts.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {summaryCards.map((card) => (
            <Link key={card.path} to={card.path}>
              <Card interactive className="h-full">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${card.color}`}>
                    <card.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">
                      {card.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {card.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">{card.stats.label}</p>
                        <p className="text-xl font-bold text-foreground">{card.stats.value}</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Recent Activity */}
        <Card>
          <h3 className="font-semibold text-foreground mb-4">Recent Activity</h3>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-accent" />
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No recent activity</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-full ${
                        activity.type === 'credit'
                          ? 'bg-success/10 text-success'
                          : 'bg-destructive/10 text-destructive'
                      }`}
                    >
                      {activity.type === 'credit' ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {activity.label}
                      </p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                  <span
                    className={`font-semibold ${
                      activity.type === 'credit' ? 'text-success' : 'text-destructive'
                    }`}
                  >
                    {activity.amount}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
