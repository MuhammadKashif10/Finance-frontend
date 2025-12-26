import { useState, useEffect } from 'react';
import Topbar from '@/components/Topbar';
import Table, { Column } from '@/components/Table';
import Modal from '@/components/Modal';
import BalanceDisplay from '@/components/BalanceDisplay';
import { calculateSaudiBalance, formatNumber, SaudiEntry } from '@/data/dummyData';
import { saudiAPI } from '@/lib/api';
import { Edit, Plus, Loader2 } from 'lucide-react';

/**
 * Saudi Hisaab Kitaab page
 * Displays transactions with SAR balance calculations
 */
const Saudi = () => {
  const [entries, setEntries] = useState<SaudiEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<SaudiEntry | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form state for edit modal
  const [formData, setFormData] = useState({
    pkrAmount: '',
    riyalRate: '',
    submittedSar: '',
    reference2: '',
  });

  // Form state for add modal
  const [addFormData, setAddFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    refNo: '',
    pkrAmount: '',
    riyalRate: '',
    submittedSar: '',
    reference2: '',
  });

  const [addFormErrors, setAddFormErrors] = useState<Record<string, string>>({});

  // Fetch entries from API
  const fetchEntries = async () => {
    try {
      setIsLoading(true);
      const data = await saudiAPI.getAll();
      setEntries(data);
    } catch (error) {
      console.error('Error fetching entries:', error);
      // Fallback to empty array on error
      setEntries([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleEdit = (entry: SaudiEntry) => {
    setSelectedEntry(entry);
    setFormData({
      pkrAmount: entry.pkrAmount.toString(),
      riyalRate: entry.riyalRate.toString(),
      submittedSar: entry.submittedSar.toString(),
      reference2: entry.reference2,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!selectedEntry) return;
    
    setIsSaving(true);
    try {
      await saudiAPI.update(selectedEntry.id, {
        pkrAmount: parseFloat(formData.pkrAmount),
        riyalRate: parseFloat(formData.riyalRate),
        submittedSar: parseFloat(formData.submittedSar),
        reference2: formData.reference2,
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

    if (!addFormData.date) errors.date = 'Date is required';
    if (!addFormData.time) errors.time = 'Time is required';
    if (!addFormData.refNo.trim()) errors.refNo = 'Reference number is required';
    if (!addFormData.pkrAmount || parseFloat(addFormData.pkrAmount) <= 0) {
      errors.pkrAmount = 'PKR amount must be greater than 0';
    }
    if (!addFormData.riyalRate || parseFloat(addFormData.riyalRate) <= 0) {
      errors.riyalRate = 'Riyal rate must be greater than 0';
    }
    if (!addFormData.submittedSar || parseFloat(addFormData.submittedSar) < 0) {
      errors.submittedSar = 'Submitted SAR must be 0 or greater';
    }

    setAddFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddEntry = async () => {
    if (!validateAddForm()) return;

    setIsSaving(true);
    try {
      await saudiAPI.create({
        date: addFormData.date,
        time: addFormData.time,
        refNo: addFormData.refNo.toUpperCase(),
        pkrAmount: parseFloat(addFormData.pkrAmount),
        riyalRate: parseFloat(addFormData.riyalRate),
        submittedSar: parseFloat(addFormData.submittedSar),
        reference2: addFormData.reference2,
      });
      setIsAddModalOpen(false);
      // Reset form
      setAddFormData({
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        refNo: '',
        pkrAmount: '',
        riyalRate: '',
        submittedSar: '',
        reference2: '',
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
  const columns: Column<SaudiEntry>[] = [
    { key: 'date', header: 'Date' },
    { key: 'time', header: 'Time' },
    { key: 'refNo', header: 'Ref No' },
    {
      key: 'pkrAmount',
      header: 'PKR Amount',
      render: (row: SaudiEntry) => formatNumber(row.pkrAmount) + ' PKR',
    },
    {
      key: 'riyalRate',
      header: 'Riyal Rate',
      render: (row: SaudiEntry) => formatNumber(row.riyalRate),
    },
    {
      key: 'riyalAmount',
      header: 'Riyal Amount',
      render: (row: SaudiEntry) => {
        const riyalAmount = row.riyalRate > 0 ? row.pkrAmount / row.riyalRate : 0;
        return formatNumber(riyalAmount) + ' SAR';
      },
    },
    {
      key: 'submittedSar',
      header: 'Submitted SAR',
      render: (row: SaudiEntry) => formatNumber(row.submittedSar) + ' SAR',
    },
    { key: 'reference2', header: 'Reference 2' },
    {
      key: 'balance',
      header: 'Balance (SAR)',
      render: (row: SaudiEntry & { balance?: number }) => {
        // Use backend-calculated balance if available, otherwise calculate client-side
        const balance = row.balance !== undefined 
          ? row.balance 
          : calculateSaudiBalance(row.pkrAmount, row.riyalRate, row.submittedSar);
        return <BalanceDisplay amount={balance} currency="SAR" />;
      },
    },
    {
      key: 'action',
      header: 'Action',
      render: (row: SaudiEntry) => (
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
        title="Saudi Hisaab Kitaab"
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Persons', path: '/dashboard' },
          { label: 'Saudi Hisaab Kitaab' },
        ]}
      />

      <main className="p-6">
        {/* Header with Add Button */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg flex-1">
            <p className="text-sm text-foreground">
              <strong>Balance Formula:</strong> (PKR Amount ÷ Riyal Rate) - Submitted SAR
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
        title="Add New Entry - Saudi Hisaab Kitaab"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            {/* Time */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Time <span className="text-destructive">*</span>
              </label>
              <input
                type="time"
                value={addFormData.time}
                onChange={(e) => {
                  setAddFormData({ ...addFormData, time: e.target.value });
                  setAddFormErrors({ ...addFormErrors, time: '' });
                }}
                className={`input-field ${addFormErrors.time ? 'border-destructive' : ''}`}
                required
              />
              {addFormErrors.time && (
                <p className="text-sm text-destructive mt-1">{addFormErrors.time}</p>
              )}
            </div>

            {/* Ref No */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Ref No <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={addFormData.refNo}
                onChange={(e) => {
                  setAddFormData({ ...addFormData, refNo: e.target.value.toUpperCase() });
                  setAddFormErrors({ ...addFormErrors, refNo: '' });
                }}
                className={`input-field ${addFormErrors.refNo ? 'border-destructive' : ''}`}
                placeholder="SAU-001"
                required
              />
              {addFormErrors.refNo && (
                <p className="text-sm text-destructive mt-1">{addFormErrors.refNo}</p>
              )}
            </div>

            {/* PKR Amount */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                PKR Amount <span className="text-destructive">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={addFormData.pkrAmount}
                onChange={(e) => {
                  setAddFormData({ ...addFormData, pkrAmount: e.target.value });
                  setAddFormErrors({ ...addFormErrors, pkrAmount: '' });
                }}
                className={`input-field ${addFormErrors.pkrAmount ? 'border-destructive' : ''}`}
                placeholder="500000"
                required
              />
              {addFormErrors.pkrAmount && (
                <p className="text-sm text-destructive mt-1">{addFormErrors.pkrAmount}</p>
              )}
            </div>

            {/* Riyal Rate */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Riyal Rate <span className="text-destructive">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={addFormData.riyalRate}
                onChange={(e) => {
                  setAddFormData({ ...addFormData, riyalRate: e.target.value });
                  setAddFormErrors({ ...addFormErrors, riyalRate: '' });
                }}
                className={`input-field ${addFormErrors.riyalRate ? 'border-destructive' : ''}`}
                placeholder="75.50"
                required
              />
              {addFormErrors.riyalRate && (
                <p className="text-sm text-destructive mt-1">{addFormErrors.riyalRate}</p>
              )}
            </div>

            {/* Riyal Amount (Auto-calculated) */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Riyal Amount <span className="text-xs text-muted-foreground">(Auto-calculated)</span>
              </label>
              <input
                type="text"
                value={
                  addFormData.pkrAmount && addFormData.riyalRate && parseFloat(addFormData.riyalRate) > 0
                    ? formatNumber(parseFloat(addFormData.pkrAmount) / parseFloat(addFormData.riyalRate)) + ' SAR'
                    : '0.00 SAR'
                }
                className="input-field bg-muted cursor-not-allowed"
                readOnly
                disabled
              />
              <p className="text-xs text-muted-foreground mt-1">
                Calculated: PKR Amount ÷ Riyal Rate
              </p>
            </div>

            {/* Submitted SAR */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Submitted SAR <span className="text-destructive">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={addFormData.submittedSar}
                onChange={(e) => {
                  setAddFormData({ ...addFormData, submittedSar: e.target.value });
                  setAddFormErrors({ ...addFormErrors, submittedSar: '' });
                }}
                className={`input-field ${addFormErrors.submittedSar ? 'border-destructive' : ''}`}
                placeholder="6000"
                required
              />
              {addFormErrors.submittedSar && (
                <p className="text-sm text-destructive mt-1">{addFormErrors.submittedSar}</p>
              )}
            </div>

            {/* Reference 2 */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Reference 2
              </label>
              <input
                type="text"
                value={addFormData.reference2}
                onChange={(e) => setAddFormData({ ...addFormData, reference2: e.target.value })}
                className="input-field"
                placeholder="Monthly Transfer"
              />
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
        title={`Edit Entry - ${selectedEntry?.refNo}`}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              PKR Amount
            </label>
            <input
              type="number"
              value={formData.pkrAmount}
              onChange={(e) => setFormData({ ...formData, pkrAmount: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Riyal Rate
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.riyalRate}
              onChange={(e) => setFormData({ ...formData, riyalRate: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Riyal Amount <span className="text-xs text-muted-foreground">(Auto-calculated)</span>
            </label>
            <input
              type="text"
              value={
                formData.pkrAmount && formData.riyalRate && parseFloat(formData.riyalRate) > 0
                  ? formatNumber(parseFloat(formData.pkrAmount) / parseFloat(formData.riyalRate)) + ' SAR'
                  : '0.00 SAR'
              }
              className="input-field bg-muted cursor-not-allowed"
              readOnly
              disabled
            />
            <p className="text-xs text-muted-foreground mt-1">
              Calculated: PKR Amount ÷ Riyal Rate
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Submitted SAR
            </label>
            <input
              type="number"
              value={formData.submittedSar}
              onChange={(e) => setFormData({ ...formData, submittedSar: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Reference 2
            </label>
            <input
              type="text"
              value={formData.reference2}
              onChange={(e) => setFormData({ ...formData, reference2: e.target.value })}
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

export default Saudi;
