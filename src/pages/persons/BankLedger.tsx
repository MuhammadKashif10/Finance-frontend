import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Topbar from '@/components/Topbar';
import Table, { Column } from '@/components/Table';
import Modal from '@/components/Modal';
import BalanceDisplay from '@/components/BalanceDisplay';
import { calculateRemainingAmount, formatNumber } from '@/data/dummyData';
import { bankLedgerAPI, tradersAPI } from '@/lib/api';
import { ArrowLeft, Edit, CreditCard, Plus, Loader2 } from 'lucide-react';

interface BankLedgerEntry {
  id: string;
  date: string;
  referenceType: 'Online' | 'Cash';
  amountAdded: number;
  amountWithdrawn: number;
  runningBalance?: number;
}

interface BankLedgerEntryWithBalance extends BankLedgerEntry {
  runningBalance: number;
}

/**
 * Bank Ledger page
 * Shows ledger entries for a specific bank of a trader
 */
const BankLedger = () => {
  const { traderId, bankId } = useParams<{ traderId: string; bankId: string }>();
  const navigate = useNavigate();

  const [trader, setTrader] = useState<any>(null);
  const [bank, setBank] = useState<any>(null);
  const [entries, setEntries] = useState<BankLedgerEntryWithBalance[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<BankLedgerEntry | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form state for edit modal
  const [formData, setFormData] = useState({
    referenceType: 'Online' as 'Online' | 'Cash',
    amountAdded: '',
    amountWithdrawn: '',
  });

  // Form state for add modal
  const [addFormData, setAddFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    referenceType: 'Online' as 'Online' | 'Cash',
    amountAdded: '',
    amountWithdrawn: '',
  });

  const [addFormErrors, setAddFormErrors] = useState<Record<string, string>>({});

  // Fetch trader, bank, and ledger entries
  useEffect(() => {
    const fetchData = async () => {
      if (!traderId || !bankId || bankId === 'undefined') {
        console.error('Missing or invalid traderId or bankId:', { traderId, bankId });
        setIsLoading(false);
        setError('Invalid bank ID. Please go back and try again.');
        return;
      }

      try {
        setIsLoading(true);

        // Fetch trader data with banks
        const traderData = await tradersAPI.getOne(traderId);
        
        if (!traderData) {
          setIsLoading(false);
          return;
        }

        // Normalize banks array (ensure all banks have id instead of _id)
        const normalizedBanks = (traderData.banks || []).map((bank: any) => {
          const { _id, ...rest } = bank;
          return {
            ...rest,
            id: bank.id || _id?.toString() || '',
          };
        });

        const normalizedTrader = {
          ...traderData,
          banks: normalizedBanks,
        };

        setTrader(normalizedTrader);

        // Find bank in trader's banks
        const foundBank = normalizedBanks.find((b: any) => b.id === bankId);
        if (!foundBank) {
          console.error('Bank not found:', { 
            bankId, 
            banks: normalizedBanks.map((b: any) => ({ id: b.id, name: b.name }))
          });
          setIsLoading(false);
          return;
        }

        setBank(foundBank);

        // Fetch ledger entries
        const ledgerData = await bankLedgerAPI.getAll(traderId, bankId);
        
        // Normalize entries and calculate running balance
        let runningBalance = 0;
        const entriesWithBalance = (ledgerData.entries || []).map((entry: any) => {
          // Normalize entry (ensure id instead of _id)
          const { _id, ...rest } = entry;
          const normalizedEntry = {
            ...rest,
            id: entry.id || _id?.toString() || '',
            amountAdded: entry.amountAdded || 0,
            amountWithdrawn: entry.amountWithdrawn || 0,
          };
          
          // Calculate running balance
          runningBalance += normalizedEntry.amountAdded - normalizedEntry.amountWithdrawn;
          
          return {
            ...normalizedEntry,
            runningBalance,
          };
        });

        setEntries(entriesWithBalance);
        setTotalBalance(ledgerData.totalBalance !== undefined ? ledgerData.totalBalance : runningBalance);
      } catch (error) {
        console.error('Error fetching bank ledger data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [traderId, bankId]);

  const handleEdit = (entry: BankLedgerEntry) => {
    setSelectedEntry(entry);
    setFormData({
      referenceType: entry.referenceType,
      amountAdded: entry.amountAdded.toString(),
      amountWithdrawn: entry.amountWithdrawn.toString(),
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!selectedEntry || !traderId || !bankId) return;

    setIsSaving(true);
    try {
      await bankLedgerAPI.update(traderId, bankId, selectedEntry.id, {
        referenceType: formData.referenceType,
        amountAdded: parseFloat(formData.amountAdded) || 0,
        amountWithdrawn: parseFloat(formData.amountWithdrawn) || 0,
      });
      setIsModalOpen(false);
      // Refresh data
      const ledgerData = await bankLedgerAPI.getAll(traderId!, bankId!);
      setEntries(ledgerData.entries as BankLedgerEntryWithBalance[]);
      setTotalBalance(ledgerData.totalBalance);
    } catch (error) {
      console.error('Error updating entry:', error);
      alert('Failed to update entry. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Validate add form
  const validateAddForm = () => {
    const errors: Record<string, string> = {};

    if (!addFormData.date) errors.date = 'Date is required';
    
    // At least one amount must be provided
    const amountAdded = parseFloat(addFormData.amountAdded) || 0;
    const amountWithdrawn = parseFloat(addFormData.amountWithdrawn) || 0;
    
    if (amountAdded <= 0 && amountWithdrawn <= 0) {
      errors.amountAdded = 'Either amount added or amount withdrawn must be greater than 0';
    }

    setAddFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddEntry = async () => {
    if (!validateAddForm() || !traderId || !bankId) return;

    setIsSaving(true);
    try {
      await bankLedgerAPI.create(traderId, bankId, {
        date: addFormData.date,
        referenceType: addFormData.referenceType,
        amountAdded: parseFloat(addFormData.amountAdded) || 0,
        amountWithdrawn: parseFloat(addFormData.amountWithdrawn) || 0,
      });
      setIsAddModalOpen(false);
      // Reset form
      setAddFormData({
        date: new Date().toISOString().split('T')[0],
        referenceType: 'Online',
        amountAdded: '',
        amountWithdrawn: '',
      });
      setAddFormErrors({});
      // Refresh data
      const ledgerData = await bankLedgerAPI.getAll(traderId, bankId);
      setEntries(ledgerData.entries as BankLedgerEntryWithBalance[]);
      setTotalBalance(ledgerData.totalBalance);
    } catch (error) {
      console.error('Error creating entry:', error);
      alert('Failed to create entry. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <Topbar
          title="Loading..."
          breadcrumbs={[
            { label: 'Dashboard', path: '/dashboard' },
            { label: 'Pakistani Hisaab Kitaab', path: '/dashboard/persons/pakistani' },
          ]}
        />
        <main className="p-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        </main>
      </div>
    );
  }

  if (!trader || !bank) {
    return (
      <div className="animate-fade-in">
        <Topbar
          title="Not Found"
          breadcrumbs={[
            { label: 'Dashboard', path: '/dashboard' },
            { label: 'Pakistani Hisaab Kitaab', path: '/dashboard/persons/pakistani' },
            { label: 'Not Found' },
          ]}
        />
        <main className="p-6">
          <div className="text-center py-12">
            <p className="text-muted-foreground">The requested bank ledger was not found.</p>
            <button
              onClick={() => navigate('/dashboard/persons/pakistani')}
              className="btn-primary mt-4"
            >
              Go Back
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Table column definitions
  const columns: Column<BankLedgerEntryWithBalance>[] = [
    { key: 'date', header: 'Date' },
    {
      key: 'referenceType',
      header: 'Reference Type',
      render: (row: BankLedgerEntryWithBalance) => (
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
            row.referenceType === 'Online'
              ? 'bg-accent/10 text-accent'
              : 'bg-warning/10 text-warning'
          }`}
        >
          {row.referenceType}
        </span>
      ),
    },
    {
      key: 'amountAdded',
      header: 'Amount Added',
      render: (row: BankLedgerEntryWithBalance) =>
        row.amountAdded > 0 ? (
          <span className="text-success font-medium">
            +{formatNumber(row.amountAdded)} PKR
          </span>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      key: 'amountWithdrawn',
      header: 'Amount Withdrawn',
      render: (row: BankLedgerEntryWithBalance) =>
        row.amountWithdrawn > 0 ? (
          <span className="text-destructive font-medium">
            -{formatNumber(row.amountWithdrawn)} PKR
          </span>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      key: 'remainingAmount',
      header: 'Remaining Amount',
      render: (row: BankLedgerEntryWithBalance) => (
        <BalanceDisplay amount={row.runningBalance} currency="PKR" />
      ),
    },
    {
      key: 'action',
      header: 'Action',
      render: (row: BankLedgerEntryWithBalance) => (
        <button
          onClick={() => handleEdit(row)}
          className="btn-primary text-xs py-1.5 px-3"
        >
          <Edit className="w-3.5 h-3.5 mr-1" />
          Edit
        </button>
      ),
    },
  ];


  return (
    <div className="animate-fade-in">
      <Topbar
        title={`${bank.name} - ${trader.name}`}
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Pakistani Hisaab Kitaab', path: '/dashboard/persons/pakistani' },
          { label: trader.name, path: `/dashboard/persons/pakistani/${traderId}` },
          { label: bank.name },
        ]}
      />

      <main className="p-6">
        {/* Back Button */}
        <button
          onClick={() => navigate(`/dashboard/persons/pakistani/${traderId}`)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {trader.name}</span>
        </button>

        {/* Bank Info Header */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center">
              <CreditCard className="w-7 h-7 text-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{bank.name}</h2>
              <p className="text-muted-foreground">{trader.name}</p>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-sm text-muted-foreground mb-1">Total Balance</p>
            <p
              className={`text-2xl font-bold ${
                totalBalance >= 0 ? 'text-success' : 'text-destructive'
              }`}
            >
              {totalBalance >= 0 ? '+' : ''}
              {new Intl.NumberFormat('en-PK').format(totalBalance)} PKR
            </p>
          </div>
        </div>

        {/* Header with Add Button */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg flex-1">
            <p className="text-sm text-foreground">
              <strong>Remaining Amount Formula:</strong> Amount Added - Amount Withdrawn (running balance)
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-accent flex items-center gap-2 px-6 py-3"
          >
            <Plus className="w-5 h-5" />
            Add New Entry
          </button>
        </div>

        {/* Table */}
        {entries.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl border border-border">
            <p className="text-muted-foreground mb-4">No ledger entries found.</p>
            <p className="text-sm text-muted-foreground">Click "Add New Entry" to create your first entry.</p>
          </div>
        ) : (
          <Table columns={columns} data={entries} />
        )}
      </main>

      {/* Add New Entry Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setAddFormErrors({});
        }}
        title="Add New Entry - Bank Ledger"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Date <span className="text-destructive">*</span>
            </label>
            <input
              type="date"
              value={addFormData.date}
              onChange={(e) => {
                setAddFormData({ ...addFormData, date: e.target.value });
                setAddFormErrors({ ...addFormErrors, date: '' });
              }}
              className={`input-field ${addFormErrors.date ? 'border-destructive' : ''}`}
              required
            />
            {addFormErrors.date && (
              <p className="text-sm text-destructive mt-1">{addFormErrors.date}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Reference Type <span className="text-destructive">*</span>
            </label>
            <select
              value={addFormData.referenceType}
              onChange={(e) =>
                setAddFormData({ ...addFormData, referenceType: e.target.value as 'Online' | 'Cash' })
              }
              className="select-field"
            >
              <option value="Online">Online</option>
              <option value="Cash">Cash</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Amount Added
            </label>
            <input
              type="number"
              step="0.01"
              value={addFormData.amountAdded}
              onChange={(e) => {
                setAddFormData({ ...addFormData, amountAdded: e.target.value });
                setAddFormErrors({ ...addFormErrors, amountAdded: '' });
              }}
              className={`input-field ${addFormErrors.amountAdded ? 'border-destructive' : ''}`}
              placeholder="0.00"
            />
            {addFormErrors.amountAdded && (
              <p className="text-sm text-destructive mt-1">{addFormErrors.amountAdded}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Leave empty if no amount was added
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Amount Withdrawn
            </label>
            <input
              type="number"
              step="0.01"
              value={addFormData.amountWithdrawn}
              onChange={(e) => {
                setAddFormData({ ...addFormData, amountWithdrawn: e.target.value });
                setAddFormErrors({ ...addFormErrors, amountWithdrawn: '' });
              }}
              className="input-field"
              placeholder="0.00"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Leave empty if no amount was withdrawn
            </p>
          </div>

          <div className="flex gap-3 pt-4 border-t border-border">
            <button
              onClick={handleAddEntry}
              disabled={isSaving}
              className="btn-accent flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Entry'
              )}
            </button>
            <button
              onClick={() => {
                setIsAddModalOpen(false);
                setAddFormErrors({});
              }}
              disabled={isSaving}
              className="btn-outline flex-1 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Edit Ledger Entry"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Reference Type
            </label>
            <select
              value={formData.referenceType}
              onChange={(e) =>
                setFormData({ ...formData, referenceType: e.target.value as 'Online' | 'Cash' })
              }
              className="select-field"
            >
              <option value="Online">Online</option>
              <option value="Cash">Cash</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Amount Added
            </label>
            <input
              type="number"
              value={formData.amountAdded}
              onChange={(e) => setFormData({ ...formData, amountAdded: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Amount Withdrawn
            </label>
            <input
              type="number"
              value={formData.amountWithdrawn}
              onChange={(e) => setFormData({ ...formData, amountWithdrawn: e.target.value })}
              className="input-field"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="btn-accent flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
            <button
              onClick={() => setIsModalOpen(false)}
              disabled={isSaving}
              className="btn-outline flex-1 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BankLedger;
