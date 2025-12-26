import { useState, useEffect } from 'react';
import Topbar from '@/components/Topbar';
import Table, { Column } from '@/components/Table';
import Modal from '@/components/Modal';
import BalanceDisplay from '@/components/BalanceDisplay';
import { calculateSpecialBalance, formatNumber, SpecialEntry } from '@/data/dummyData';
import { specialAPI } from '@/lib/api';
import { Edit, Plus, Loader2 } from 'lucide-react';

/**
 * Special Hisaab Kitaab page
 * Displays user transactions with balance type dropdown
 */
const Special = () => {
  const [entries, setEntries] = useState<SpecialEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<SpecialEntry | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form state for edit modal
  const [formData, setFormData] = useState({
    userName: '',
    balanceType: 'Online' as 'Online' | 'Cash',
    nameRupees: '',
    submittedRupees: '',
  });

  // Form state for add modal
  const [addFormData, setAddFormData] = useState({
    userName: '',
    date: new Date().toISOString().split('T')[0],
    balanceType: 'Online' as 'Online' | 'Cash',
    nameRupees: '',
    submittedRupees: '',
  });

  const [addFormErrors, setAddFormErrors] = useState<Record<string, string>>({});

  // Fetch entries from API
  const fetchEntries = async () => {
    try {
      setIsLoading(true);
      const data = await specialAPI.getAll();
      setEntries(data);
    } catch (error) {
      console.error('Error fetching entries:', error);
      setEntries([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleEdit = (entry: SpecialEntry) => {
    setSelectedEntry(entry);
    setFormData({
      userName: entry.userName,
      balanceType: entry.balanceType,
      nameRupees: entry.nameRupees.toString(),
      submittedRupees: entry.submittedRupees.toString(),
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!selectedEntry) return;
    
    setIsSaving(true);
    try {
      await specialAPI.update(selectedEntry.id, {
        userName: formData.userName,
        balanceType: formData.balanceType,
        nameRupees: parseFloat(formData.nameRupees),
        submittedRupees: parseFloat(formData.submittedRupees),
      });
      setIsModalOpen(false);
      fetchEntries(); // Refresh table
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

    if (!addFormData.userName.trim()) errors.userName = 'User name is required';
    if (!addFormData.date) errors.date = 'Date is required';
    if (!addFormData.nameRupees || parseFloat(addFormData.nameRupees) <= 0) {
      errors.nameRupees = 'Name rupees must be greater than 0';
    }
    if (!addFormData.submittedRupees || parseFloat(addFormData.submittedRupees) < 0) {
      errors.submittedRupees = 'Submitted rupees must be 0 or greater';
    }

    setAddFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddEntry = async () => {
    if (!validateAddForm()) return;

    setIsSaving(true);
    try {
      await specialAPI.create({
        userName: addFormData.userName.trim(),
        date: addFormData.date,
        balanceType: addFormData.balanceType,
        nameRupees: parseFloat(addFormData.nameRupees),
        submittedRupees: parseFloat(addFormData.submittedRupees),
      });
      setIsAddModalOpen(false);
      // Reset form
      setAddFormData({
        userName: '',
        date: new Date().toISOString().split('T')[0],
        balanceType: 'Online',
        nameRupees: '',
        submittedRupees: '',
      });
      setAddFormErrors({});
      fetchEntries(); // Refresh table
    } catch (error) {
      console.error('Error creating entry:', error);
      alert('Failed to create entry. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Table column definitions
  const columns: Column<SpecialEntry>[] = [
    { key: 'userName', header: 'User Name' },
    { key: 'date', header: 'Date' },
    {
      key: 'balanceType',
      header: 'Balance Type',
      render: (row: SpecialEntry) => (
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
            row.balanceType === 'Online'
              ? 'bg-accent/10 text-accent'
              : 'bg-warning/10 text-warning'
          }`}
        >
          {row.balanceType}
        </span>
      ),
    },
    {
      key: 'nameRupees',
      header: 'Name Rupees',
      render: (row: SpecialEntry) => formatNumber(row.nameRupees) + ' PKR',
    },
    {
      key: 'submittedRupees',
      header: 'Submitted Rupees',
      render: (row: SpecialEntry) => formatNumber(row.submittedRupees) + ' PKR',
    },
    {
      key: 'balance',
      header: 'Balance',
      render: (row: SpecialEntry & { balance?: number }) => {
        // Use backend-calculated balance if available, otherwise calculate client-side
        const balance = row.balance !== undefined 
          ? row.balance 
          : calculateSpecialBalance(row.nameRupees, row.submittedRupees);
        return <BalanceDisplay amount={balance} currency="PKR" />;
      },
    },
    {
      key: 'action',
      header: 'Action',
      render: (row: SpecialEntry) => (
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
        title="Special Hisaab Kitaab"
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Persons', path: '/dashboard' },
          { label: 'Special Hisaab Kitaab' },
        ]}
      />

      <main className="p-6">
        {/* Header with Add Button */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg flex-1">
            <p className="text-sm text-foreground">
              <strong>Balance Formula:</strong> Name Rupees - Submitted Rupees
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
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
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
        title="Add New Entry - Special Hisaab Kitaab"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* User Name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                User Name <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={addFormData.userName}
                onChange={(e) => {
                  setAddFormData({ ...addFormData, userName: e.target.value });
                  setAddFormErrors({ ...addFormErrors, userName: '' });
                }}
                className={`input-field ${addFormErrors.userName ? 'border-destructive' : ''}`}
                placeholder="Ahmed Khan"
                required
              />
              {addFormErrors.userName && (
                <p className="text-sm text-destructive mt-1">{addFormErrors.userName}</p>
              )}
            </div>

            {/* Date */}
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

            {/* Balance Type */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Balance Type <span className="text-destructive">*</span>
              </label>
              <select
                value={addFormData.balanceType}
                onChange={(e) =>
                  setAddFormData({ ...addFormData, balanceType: e.target.value as 'Online' | 'Cash' })
                }
                className="select-field"
              >
                <option value="Online">Online</option>
                <option value="Cash">Cash</option>
              </select>
            </div>

            {/* Name Rupees */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Name Rupees <span className="text-destructive">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={addFormData.nameRupees}
                onChange={(e) => {
                  setAddFormData({ ...addFormData, nameRupees: e.target.value });
                  setAddFormErrors({ ...addFormErrors, nameRupees: '' });
                }}
                className={`input-field ${addFormErrors.nameRupees ? 'border-destructive' : ''}`}
                placeholder="150000"
                required
              />
              {addFormErrors.nameRupees && (
                <p className="text-sm text-destructive mt-1">{addFormErrors.nameRupees}</p>
              )}
            </div>

            {/* Submitted Rupees */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Submitted Rupees <span className="text-destructive">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={addFormData.submittedRupees}
                onChange={(e) => {
                  setAddFormData({ ...addFormData, submittedRupees: e.target.value });
                  setAddFormErrors({ ...addFormErrors, submittedRupees: '' });
                }}
                className={`input-field ${addFormErrors.submittedRupees ? 'border-destructive' : ''}`}
                placeholder="120000"
                required
              />
              {addFormErrors.submittedRupees && (
                <p className="text-sm text-destructive mt-1">{addFormErrors.submittedRupees}</p>
              )}
            </div>
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
        title={`Edit Entry - ${selectedEntry?.userName}`}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              User Name
            </label>
            <input
              type="text"
              value={formData.userName}
              onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Balance Type
            </label>
            <select
              value={formData.balanceType}
              onChange={(e) =>
                setFormData({ ...formData, balanceType: e.target.value as 'Online' | 'Cash' })
              }
              className="select-field"
            >
              <option value="Online">Online</option>
              <option value="Cash">Cash</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Name Rupees
            </label>
            <input
              type="number"
              value={formData.nameRupees}
              onChange={(e) => setFormData({ ...formData, nameRupees: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Submitted Rupees
            </label>
            <input
              type="number"
              value={formData.submittedRupees}
              onChange={(e) => setFormData({ ...formData, submittedRupees: e.target.value })}
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

export default Special;
