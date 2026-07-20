import React, { useState } from 'react';
import { 
  CreditCard, DollarSign, Wallet, TrendingUp, TrendingDown, FileText, 
  Building, ArrowUpRight, ArrowDownLeft, PlusCircle, Search, Filter, 
  Download, Printer, Check, Trash2, Eye, RefreshCw, AlertTriangle, 
  Settings, CheckCircle2, ShieldAlert, Layers, Receipt, Landmark
} from 'lucide-react';

// --- DATA TYPES ---
export interface IncomeRecord {
  id: string;
  receiptNo: string;
  date: string;
  category: string;
  payerName: string;
  amount: number;
  mode: string;
  bankAccount: string;
  refNo: string;
  description: string;
  status: 'Received' | 'Pending' | 'Cancelled';
}

export interface ExpenseRecord {
  id: string;
  voucherNo: string;
  date: string;
  categoryHead: string;
  payeeName: string;
  amount: number;
  mode: string;
  bankAccount: string;
  refNo: string;
  description: string;
  status: 'Paid' | 'Pending' | 'Cancelled';
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountNo: string;
  branch: string;
  ifscCode: string;
  openingBalance: number;
  currentBalance: number;
  status: 'Active' | 'Inactive';
}

export interface BankTransaction {
  id: string;
  transactionNo: string;
  date: string;
  type: 'Deposit' | 'Withdrawal';
  bankName: string;
  accountNo: string;
  amount: number;
  mode: string;
  refNo: string;
  remarks: string;
  performedBy: string;
}

export interface FineSettingRule {
  id: string;
  ruleTitle: string;
  gracePeriodDays: number;
  fineAmount: number;
  chargeFrequency: 'Per Day' | 'Per Week' | 'Flat One-Time';
  status: 'Active' | 'Inactive';
}

export type AccountSubView = 
  | 'manage-income'
  | 'manage-expense'
  // Reports (12)
  | 'report-expense-date'
  | 'report-expense-head'
  | 'report-extra-income'
  | 'report-balance-sheet'
  | 'report-outstanding'
  | 'report-collection'
  | 'report-dues-sheet'
  | 'report-dues-head'
  | 'report-inventory-dcr'
  | 'report-demand-bill'
  | 'report-discount'
  | 'report-cancel'
  // Bank (5)
  | 'bank-deposit'
  | 'bank-withdraw'
  | 'bank-report-deposit'
  | 'bank-report-withdraw'
  | 'bank-ledger'
  // Settings (5)
  | 'setting-income-mode'
  | 'setting-expense-mode'
  | 'setting-add-bank'
  | 'setting-fine-rule'
  | 'setting-apply-fine';

interface AccountModuleProps {
  initialSubView?: AccountSubView;
  onNavigateSubView?: (subView: AccountSubView) => void;
}

// --- INITIAL MOCK DATA ---
const INITIAL_INCOME: IncomeRecord[] = [
  { id: 'inc-1', receiptNo: 'REC-2026-001', date: '2026-07-20', category: 'Tuition Fee Collection', payerName: 'Rahul Sharma (Class 10-A)', amount: 15500, mode: 'UPI', bankAccount: 'State Bank of India - 9876', refNo: 'UPI987123', description: 'Q2 Tuition & Transport Fee', status: 'Received' },
  { id: 'inc-2', receiptNo: 'REC-2026-002', date: '2026-07-19', category: 'Extra Income', payerName: 'Sports Event Sponsorship', amount: 45000, mode: 'Cheque', bankAccount: 'HDFC Bank - 5432', refNo: 'CHQ-88712', description: 'Annual Inter-School Sports Sponsorship', status: 'Received' },
  { id: 'inc-3', receiptNo: 'REC-2026-003', date: '2026-07-18', category: 'Inventory Sale', payerName: 'Cafeteria Daily Token Register', amount: 8200, mode: 'Cash', bankAccount: 'Petty Cash', refNo: 'CSH-091', description: 'Cafeteria Sales DCR', status: 'Received' },
  { id: 'inc-4', receiptNo: 'REC-2026-004', date: '2026-07-17', category: 'Government Grant', payerName: 'State Education Department', amount: 120000, mode: 'NEFT', bankAccount: 'State Bank of India - 9876', refNo: 'NEFT77123', description: 'Lab Development Grant 2026', status: 'Received' },
  { id: 'inc-5', receiptNo: 'REC-2026-005', date: '2026-07-15', category: 'Late Fee Fine', payerName: 'Various Students', amount: 3400, mode: 'UPI', bankAccount: 'State Bank of India - 9876', refNo: 'UPI112998', description: 'Overdue Fee Penalty Collection', status: 'Received' }
];

const INITIAL_EXPENSES: ExpenseRecord[] = [
  { id: 'exp-1', voucherNo: 'VOU-2026-081', date: '2026-07-20', categoryHead: 'Staff Salaries', payeeName: 'Faculty & Support Staff', amount: 385000, mode: 'NEFT', bankAccount: 'State Bank of India - 9876', refNo: 'SAL-JULY-01', description: 'July Faculty Base Salary Disbursement', status: 'Paid' },
  { id: 'exp-2', voucherNo: 'VOU-2026-082', date: '2026-07-18', categoryHead: 'Electricity & Utilities', payeeName: 'State Electricity Board', amount: 42500, mode: 'Net Banking', bankAccount: 'HDFC Bank - 5432', refNo: 'UTIL-99812', description: 'School Campus Electricity Bill', status: 'Paid' },
  { id: 'exp-3', voucherNo: 'VOU-2026-083', date: '2026-07-16', categoryHead: 'Transport Fuel', payeeName: 'HP Fuel Station', amount: 28400, mode: 'UPI', bankAccount: 'State Bank of India - 9876', refNo: 'FUEL-8871', description: 'School Bus Fleet Diesel Supply', status: 'Paid' },
  { id: 'exp-4', voucherNo: 'VOU-2026-084', date: '2026-07-14', categoryHead: 'Building Maintenance', payeeName: 'Apex Construction Co.', amount: 18500, mode: 'Cheque', bankAccount: 'HDFC Bank - 5432', refNo: 'CHQ-10029', description: 'Roof Waterproofing Repairs', status: 'Paid' },
  { id: 'exp-5', voucherNo: 'VOU-2026-085', date: '2026-07-10', categoryHead: 'Lab Supplies', payeeName: 'Scientific Equipment Suppliers', amount: 14200, mode: 'NEFT', bankAccount: 'State Bank of India - 9876', refNo: 'NEFT99231', description: 'Chemistry Reagents & Beakers', status: 'Paid' }
];

const INITIAL_BANKS: BankAccount[] = [
  { id: 'bank-1', bankName: 'State Bank of India', accountNo: '98765432101', branch: 'Main Branch, City Center', ifscCode: 'SBIN0001234', openingBalance: 500000, currentBalance: 874100, status: 'Active' },
  { id: 'bank-2', bankName: 'HDFC Bank', accountNo: '54321098765', branch: 'Sector 18 Branch', ifscCode: 'HDFC0005432', openingBalance: 350000, currentBalance: 495000, status: 'Active' },
  { id: 'bank-3', bankName: 'ICICI Bank', accountNo: '12345678909', branch: 'Civil Lines', ifscCode: 'ICIC0001234', openingBalance: 200000, currentBalance: 230000, status: 'Active' }
];

const INITIAL_BANK_TXNS: BankTransaction[] = [
  { id: 'btx-1', transactionNo: 'DEP-2026-101', date: '2026-07-19', type: 'Deposit', bankName: 'State Bank of India', accountNo: '98765432101', amount: 150000, mode: 'Cash', refNo: 'SLIP-9981', remarks: 'Fee counter cash deposit', performedBy: 'Head Accountant' },
  { id: 'btx-2', transactionNo: 'WTH-2026-042', date: '2026-07-17', type: 'Withdrawal', bankName: 'HDFC Bank', accountNo: '54321098765', amount: 30000, mode: 'Self Cheque', refNo: 'CHQ-9901', remarks: 'Petty cash refill', performedBy: 'Cashier' }
];

const INITIAL_FINE_RULES: FineSettingRule[] = [
  { id: 'fine-1', ruleTitle: 'Standard Tuition Fee Delay', gracePeriodDays: 10, fineAmount: 50, chargeFrequency: 'Per Week', status: 'Active' },
  { id: 'fine-2', ruleTitle: 'Transport & Mess Fee Overdue', gracePeriodDays: 5, fineAmount: 20, chargeFrequency: 'Per Day', status: 'Active' }
];

export function AccountModule({ initialSubView = 'manage-income', onNavigateSubView }: AccountModuleProps) {
  const [activeSubView, setActiveSubView] = useState<AccountSubView>(initialSubView);

  React.useEffect(() => {
    if (initialSubView) setActiveSubView(initialSubView);
  }, [initialSubView]);

  const handleSubViewChange = (view: AccountSubView) => {
    setActiveSubView(view);
    if (onNavigateSubView) onNavigateSubView(view);
  };

  const [incomes, setIncomes] = useState<IncomeRecord[]>(INITIAL_INCOME);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(INITIAL_EXPENSES);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(INITIAL_BANKS);
  const [bankTxns, setBankTxns] = useState<BankTransaction[]>(INITIAL_BANK_TXNS);
  const [fineRules, setFineRules] = useState<FineSettingRule[]>(INITIAL_FINE_RULES);
  const [incomeModes, setIncomeModes] = useState(['Cash', 'UPI', 'Cheque', 'NEFT', 'Net Banking', 'Debit/Credit Card']);
  const [expenseModes, setExpenseModes] = useState(['NEFT', 'Cheque', 'UPI', 'Net Banking', 'Cash']);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px', backgroundColor: '#00696b', color: '#ffffff',
          padding: '12px 20px', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center', gap: '10px', zIndex: 9999, fontWeight: 600, fontSize: '13px'
        }}>
          <CheckCircle2 size={18} />
          {toastMessage}
        </div>
      )}

      {/* Module Header */}
      <div className="view-header">
        <div>
          <h2 className="view-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CreditCard size={22} color="#00696b" />
            Financial Accounts & Fee Ledger Console
          </h2>
          <span className="view-subtitle">
            Manage income collections, expense vouchers, 12 financial audit reports, bank accounts & fine settings
          </span>
        </div>
      </div>

      {/* SUB-VIEW CONTENT RENDER */}
      {activeSubView === 'manage-income' && (
        <ManageIncomeSection 
          incomes={incomes} 
          setIncomes={setIncomes} 
          bankAccounts={bankAccounts}
          incomeModes={incomeModes}
          showToast={showToast} 
        />
      )}

      {activeSubView === 'manage-expense' && (
        <ManageExpenseSection 
          expenses={expenses} 
          setExpenses={setExpenses} 
          bankAccounts={bankAccounts}
          expenseModes={expenseModes}
          showToast={showToast} 
        />
      )}

      {/* REPORTS (12) */}
      {activeSubView.startsWith('report-') && (
        <AccountReportsSection 
          subView={activeSubView} 
          incomes={incomes} 
          expenses={expenses}
        />
      )}

      {/* BANK VIEWS (5) */}
      {activeSubView.startsWith('bank-') && (
        <ManageBankSection 
          subView={activeSubView} 
          bankAccounts={bankAccounts}
          setBankAccounts={setBankAccounts}
          bankTxns={bankTxns}
          setBankTxns={setBankTxns}
          showToast={showToast}
        />
      )}

      {/* SETTINGS VIEWS (5) */}
      {activeSubView.startsWith('setting-') && (
        <AccountSettingsSection 
          subView={activeSubView}
          bankAccounts={bankAccounts}
          setBankAccounts={setBankAccounts}
          incomeModes={incomeModes}
          setIncomeModes={setIncomeModes}
          expenseModes={expenseModes}
          setExpenseModes={setExpenseModes}
          fineRules={fineRules}
          setFineRules={setFineRules}
          showToast={showToast}
        />
      )}

    </div>
  );
}


// ====================================================================
// 1. MANAGE INCOME SECTION
// ====================================================================
function ManageIncomeSection({
  incomes,
  setIncomes,
  bankAccounts,
  incomeModes,
  showToast
}: {
  incomes: IncomeRecord[];
  setIncomes: React.Dispatch<React.SetStateAction<IncomeRecord[]>>;
  bankAccounts: BankAccount[];
  incomeModes: string[];
  showToast: (msg: string) => void;
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [search, setSearch] = useState('');

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    category: 'Tuition Fee Collection',
    payerName: '',
    amount: '',
    mode: incomeModes[0] || 'UPI',
    bankAccount: bankAccounts[0]?.bankName ? `${bankAccounts[0].bankName} - ${bankAccounts[0].accountNo.slice(-4)}` : 'State Bank of India',
    refNo: `REC-${Math.floor(10000 + Math.random() * 90000)}`,
    description: ''
  });

  const totalIncome = incomes.reduce((acc, curr) => curr.status === 'Received' ? acc + curr.amount : acc, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.payerName || !formData.amount) {
      alert('Payer Name and Amount are required!');
      return;
    }

    const created: IncomeRecord = {
      id: `inc-${Date.now()}`,
      receiptNo: formData.refNo,
      date: formData.date,
      category: formData.category,
      payerName: formData.payerName,
      amount: Number(formData.amount),
      mode: formData.mode,
      bankAccount: formData.bankAccount,
      refNo: formData.refNo,
      description: formData.description || 'Income Receipt',
      status: 'Received'
    };

    setIncomes([created, ...incomes]);
    showToast(`Income receipt of ₹${formData.amount} recorded successfully!`);
    setShowAddForm(false);
  };

  const filtered = incomes.filter(i => 
    i.payerName.toLowerCase().includes(search.toLowerCase()) || 
    i.receiptNo.toLowerCase().includes(search.toLowerCase()) ||
    i.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Metric Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <div className="erp-card" style={{ padding: '16px', borderLeft: '4px solid #00696b', margin: 0 }}>
          <div style={{ color: '#64748b', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}>TOTAL RECEIVED INCOME</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#00696b', marginTop: '4px' }}>₹{totalIncome.toLocaleString()}</div>
        </div>
        <div className="erp-card" style={{ padding: '16px', borderLeft: '4px solid #0284c7', margin: 0 }}>
          <div style={{ color: '#64748b', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}>INCOME TRANSACTIONS</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>{incomes.length} Entries</div>
        </div>
      </div>

      {/* Top Action & Search Bar */}
      <div className="erp-card" style={{ marginBottom: '16px' }}>
        <div className="erp-card-body" style={{ padding: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input 
                type="text" 
                placeholder="Search by payer, receipt no, or category..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ width: '100%', paddingLeft: '32px' }}
              />
            </div>
            <button onClick={() => setShowAddForm(!showAddForm)} className="erp-btn btn-primary" style={{ backgroundColor: '#00696b', borderColor: '#00696b' }}>
              <PlusCircle size={14} /> {showAddForm ? 'Close Form' : 'Record New Income'}
            </button>
          </div>
        </div>
      </div>

      {/* Income Entry Form (Collapsible) */}
      {showAddForm && (
        <div className="erp-card" style={{ marginBottom: '20px' }}>
          <div className="erp-card-header">
            <span className="erp-card-title">Record Income Entry</span>
          </div>
          <form onSubmit={handleSubmit} style={{ padding: '16px' }}>
            <div className="form-grid">
              <div className="form-group">
                <label>Receipt / Reference No *</label>
                <input type="text" required value={formData.refNo} onChange={e => setFormData({ ...formData, refNo: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Date *</label>
                <input type="date" required value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Income Category Head *</label>
                <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                  <option value="Tuition Fee Collection">Tuition Fee Collection</option>
                  <option value="Registration & Admission Fee">Registration & Admission Fee</option>
                  <option value="Extra Income">Extra Income</option>
                  <option value="Cafeteria & Canteen">Cafeteria & Canteen</option>
                  <option value="Government Grant">Government Grant</option>
                  <option value="Late Fee Fine">Late Fee Fine</option>
                </select>
              </div>
              <div className="form-group col-span-2">
                <label>Payer Name / Received From *</label>
                <input type="text" required placeholder="Student Name or Organization" value={formData.payerName} onChange={e => setFormData({ ...formData, payerName: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Amount (₹) *</label>
                <input type="number" required placeholder="0.00" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Payment Mode</label>
                <select value={formData.mode} onChange={e => setFormData({ ...formData, mode: e.target.value })}>
                  {incomeModes.map((m, idx) => <option key={idx} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="form-group col-span-2">
                <label>Deposit To Bank Account</label>
                <select value={formData.bankAccount} onChange={e => setFormData({ ...formData, bankAccount: e.target.value })}>
                  {bankAccounts.map(b => <option key={b.id} value={`${b.bankName} - ${b.accountNo.slice(-4)}`}>{b.bankName} ({b.accountNo})</option>)}
                </select>
              </div>
              <div className="form-group col-span-2">
                <label>Description / Particulars</label>
                <input type="text" placeholder="Transaction notes..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
              </div>
            </div>
            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button type="submit" className="erp-btn btn-primary" style={{ backgroundColor: '#00696b' }}>
                <Check size={14} /> Save Income Entry
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Income Table */}
      <div className="erp-card">
        <div className="table-container">
          <table className="erp-table">
            <thead>
              <tr style={{ backgroundColor: '#00696b', color: '#ffffff' }}>
                <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>S.No</th>
                <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>Receipt No</th>
                <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>Date</th>
                <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>Category Head</th>
                <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>Payer Name</th>
                <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>Amount</th>
                <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>Payment Mode</th>
                <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>Bank / Account</th>
                <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800, textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inc, idx) => (
                <tr key={inc.id}>
                  <td style={{ fontWeight: 800 }}>{idx + 1}</td>
                  <td style={{ fontWeight: 800, color: '#00696b' }}>{inc.receiptNo}</td>
                  <td style={{ fontWeight: 600, color: '#475569' }}>{inc.date}</td>
                  <td style={{ fontWeight: 700, color: '#0f172a' }}>{inc.category}</td>
                  <td style={{ fontWeight: 700, color: '#0f172a' }}>{inc.payerName}</td>
                  <td style={{ fontWeight: 800, color: '#16a34a' }}>₹{inc.amount.toLocaleString()}</td>
                  <td style={{ fontWeight: 600, color: '#475569' }}>{inc.mode}</td>
                  <td style={{ fontWeight: 600, color: '#475569' }}>{inc.bankAccount}</td>
                  <td style={{ textAlign: 'center' }}>
                    <button 
                      onClick={() => alert(`Receipt #${inc.receiptNo}\nAmount: ₹${inc.amount}\nPayer: ${inc.payerName}`)}
                      style={{ backgroundColor: '#ff7849', color: '#ffffff', border: 'none', borderRadius: '16px', padding: '4px 14px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Print
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <PaginationFooter currentCount={filtered.length} totalCount={filtered.length} />
      </div>
    </div>
  );
}


// ====================================================================
// 2. MANAGE EXPENSE SECTION
// ====================================================================
function ManageExpenseSection({
  expenses,
  setExpenses,
  bankAccounts,
  expenseModes,
  showToast
}: {
  expenses: ExpenseRecord[];
  setExpenses: React.Dispatch<React.SetStateAction<ExpenseRecord[]>>;
  bankAccounts: BankAccount[];
  expenseModes: string[];
  showToast: (msg: string) => void;
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [search, setSearch] = useState('');

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    categoryHead: 'Staff Salaries',
    payeeName: '',
    amount: '',
    mode: expenseModes[0] || 'NEFT',
    bankAccount: bankAccounts[0]?.bankName ? `${bankAccounts[0].bankName} - ${bankAccounts[0].accountNo.slice(-4)}` : 'State Bank of India',
    voucherNo: `VOU-${Math.floor(10000 + Math.random() * 90000)}`,
    description: ''
  });

  const totalExpense = expenses.reduce((acc, curr) => curr.status === 'Paid' ? acc + curr.amount : acc, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.payeeName || !formData.amount) {
      alert('Payee Name and Amount are required!');
      return;
    }

    const created: ExpenseRecord = {
      id: `exp-${Date.now()}`,
      voucherNo: formData.voucherNo,
      date: formData.date,
      categoryHead: formData.categoryHead,
      payeeName: formData.payeeName,
      amount: Number(formData.amount),
      mode: formData.mode,
      bankAccount: formData.bankAccount,
      refNo: formData.voucherNo,
      description: formData.description || 'Expense Payment',
      status: 'Paid'
    };

    setExpenses([created, ...expenses]);
    showToast(`Expense voucher of ₹${formData.amount} created successfully!`);
    setShowAddForm(false);
  };

  const filtered = expenses.filter(e => 
    e.payeeName.toLowerCase().includes(search.toLowerCase()) || 
    e.voucherNo.toLowerCase().includes(search.toLowerCase()) ||
    e.categoryHead.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <div className="erp-card" style={{ padding: '16px', borderLeft: '4px solid #dc2626', margin: 0 }}>
          <div style={{ color: '#64748b', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}>TOTAL EXPENSES PAID</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#dc2626', marginTop: '4px' }}>₹{totalExpense.toLocaleString()}</div>
        </div>
        <div className="erp-card" style={{ padding: '16px', borderLeft: '4px solid #eab308', margin: 0 }}>
          <div style={{ color: '#64748b', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}>EXPENSE VOUCHERS</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>{expenses.length} Vouchers</div>
        </div>
      </div>

      <div className="erp-card" style={{ marginBottom: '16px' }}>
        <div className="erp-card-body" style={{ padding: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input 
                type="text" 
                placeholder="Search by payee, voucher no, category..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ width: '100%', paddingLeft: '32px' }}
              />
            </div>
            <button onClick={() => setShowAddForm(!showAddForm)} className="erp-btn btn-primary" style={{ backgroundColor: '#00696b', borderColor: '#00696b' }}>
              <PlusCircle size={14} /> {showAddForm ? 'Close Form' : 'Record New Expense'}
            </button>
          </div>
        </div>
      </div>

      {showAddForm && (
        <div className="erp-card" style={{ marginBottom: '20px' }}>
          <div className="erp-card-header">
            <span className="erp-card-title">Record Expense Voucher</span>
          </div>
          <form onSubmit={handleSubmit} style={{ padding: '16px' }}>
            <div className="form-grid">
              <div className="form-group">
                <label>Voucher / Bill No *</label>
                <input type="text" required value={formData.voucherNo} onChange={e => setFormData({ ...formData, voucherNo: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Date *</label>
                <input type="date" required value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Expense Category Head *</label>
                <select value={formData.categoryHead} onChange={e => setFormData({ ...formData, categoryHead: e.target.value })}>
                  <option value="Staff Salaries">Staff Salaries</option>
                  <option value="Electricity & Utilities">Electricity & Utilities</option>
                  <option value="Transport Fuel">Transport Fuel</option>
                  <option value="Building Maintenance">Building Maintenance</option>
                  <option value="Lab Supplies">Lab Supplies</option>
                  <option value="Printing & Stationery">Printing & Stationery</option>
                </select>
              </div>
              <div className="form-group col-span-2">
                <label>Payee / Vendor Name *</label>
                <input type="text" required placeholder="Payee Person or Supplier Name" value={formData.payeeName} onChange={e => setFormData({ ...formData, payeeName: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Amount (₹) *</label>
                <input type="number" required placeholder="0.00" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Payment Mode</label>
                <select value={formData.mode} onChange={e => setFormData({ ...formData, mode: e.target.value })}>
                  {expenseModes.map((m, idx) => <option key={idx} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="form-group col-span-2">
                <label>Paid From Bank Account</label>
                <select value={formData.bankAccount} onChange={e => setFormData({ ...formData, bankAccount: e.target.value })}>
                  {bankAccounts.map(b => <option key={b.id} value={`${b.bankName} - ${b.accountNo.slice(-4)}`}>{b.bankName} ({b.accountNo})</option>)}
                </select>
              </div>
              <div className="form-group col-span-2">
                <label>Description / Particulars</label>
                <input type="text" placeholder="Payment purpose..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
              </div>
            </div>
            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button type="submit" className="erp-btn btn-primary" style={{ backgroundColor: '#00696b' }}>
                <Check size={14} /> Save Expense Voucher
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="erp-card">
        <div className="table-container">
          <table className="erp-table">
            <thead>
              <tr style={{ backgroundColor: '#00696b', color: '#ffffff' }}>
                <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>S.No</th>
                <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>Voucher No</th>
                <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>Date</th>
                <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>Category Head</th>
                <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>Payee / Vendor</th>
                <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>Amount</th>
                <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>Payment Mode</th>
                <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>Paid Account</th>
                <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800, textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((exp, idx) => (
                <tr key={exp.id}>
                  <td style={{ fontWeight: 800 }}>{idx + 1}</td>
                  <td style={{ fontWeight: 800, color: '#dc2626' }}>{exp.voucherNo}</td>
                  <td style={{ fontWeight: 600, color: '#475569' }}>{exp.date}</td>
                  <td style={{ fontWeight: 700, color: '#0f172a' }}>{exp.categoryHead}</td>
                  <td style={{ fontWeight: 700, color: '#0f172a' }}>{exp.payeeName}</td>
                  <td style={{ fontWeight: 800, color: '#dc2626' }}>₹{exp.amount.toLocaleString()}</td>
                  <td style={{ fontWeight: 600, color: '#475569' }}>{exp.mode}</td>
                  <td style={{ fontWeight: 600, color: '#475569' }}>{exp.bankAccount}</td>
                  <td style={{ textAlign: 'center' }}>
                    <button 
                      onClick={() => alert(`Voucher #${exp.voucherNo}\nAmount: ₹${exp.amount}\nPayee: ${exp.payeeName}`)}
                      style={{ backgroundColor: '#ff7849', color: '#ffffff', border: 'none', borderRadius: '16px', padding: '4px 14px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <PaginationFooter currentCount={filtered.length} totalCount={filtered.length} />
      </div>
    </div>
  );
}


// ====================================================================
// 3. ACCOUNT REPORTS SECTION (12 REPORT VIEWS)
// ====================================================================
function AccountReportsSection({
  subView,
  incomes,
  expenses
}: {
  subView: AccountSubView;
  incomes: IncomeRecord[];
  expenses: ExpenseRecord[];
}) {
  const getTitle = () => {
    switch (subView) {
      case 'report-expense-date': return 'Expense Date-Wise Report';
      case 'report-expense-head': return 'Expense Head-Wise Report';
      case 'report-extra-income': return 'Extra Income Report';
      case 'report-balance-sheet': return 'Financial Balance Sheet Statement';
      case 'report-outstanding': return 'Student Outstanding Fee Dues Report';
      case 'report-collection': return 'Daily & Monthly Fee Collection Sheet';
      case 'report-dues-sheet': return 'Class-Wise Fee Dues Summary Sheet';
      case 'report-dues-head': return 'Head-Wise Dues Breakdown (Tuition, Transport, Exam)';
      case 'report-inventory-dcr': return 'Inventory & Uniform Daily Collection Register (DCR)';
      case 'report-demand-bill': return 'Student Demand Bill & Fee Notice Generator';
      case 'report-discount': return 'Fee Concession & Scholarship Discount Report';
      case 'report-cancel': return 'Cancelled Records & Voided Receipts Audit Log';
      default: return 'Financial Report';
    }
  };

  const totalIncome = incomes.reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div>
      {/* Purple Header Banner matching screenshot styling */}
      <div style={{
        backgroundColor: '#8b4570',
        color: '#ffffff',
        borderRadius: '8px 8px 0 0',
        padding: '14px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
          {getTitle()} : (Session: 2026-2027)
        </h3>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => alert('Exporting report as CSV...')} 
            style={{ backgroundColor: '#0d9488', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '6px 16px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Download size={14} /> Export
          </button>

          <button 
            onClick={() => window.print()} 
            style={{ backgroundColor: '#0d9488', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '6px 20px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
          >
            Print
          </button>
        </div>
      </div>

      {/* Balance Sheet special layout */}
      {subView === 'report-balance-sheet' ? (
        <div className="erp-card" style={{ borderRadius: '0 0 8px 8px', marginTop: 0, padding: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div style={{ backgroundColor: '#f0fdf4', padding: '16px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
              <h4 style={{ color: '#16a34a', margin: 0, fontSize: '16px', fontWeight: 800 }}>TOTAL REVENUE / INCOME</h4>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#15803d', marginTop: '6px' }}>₹{totalIncome.toLocaleString()}</div>
            </div>
            <div style={{ backgroundColor: '#fef2f2', padding: '16px', borderRadius: '8px', border: '1px solid #fecaca' }}>
              <h4 style={{ color: '#dc2626', margin: 0, fontSize: '16px', fontWeight: 800 }}>TOTAL EXPENSES</h4>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#b91c1c', marginTop: '6px' }}>₹{totalExpense.toLocaleString()}</div>
            </div>
          </div>
          <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>NET SURPLUS / DEFICIT:</span>
            <span style={{ fontSize: '24px', fontWeight: 800, color: totalIncome >= totalExpense ? '#16a34a' : '#dc2626' }}>
              ₹{(totalIncome - totalExpense).toLocaleString()}
            </span>
          </div>
        </div>
      ) : (
        /* Standard Table View for other reports */
        <div className="erp-card" style={{ borderRadius: '0 0 8px 8px', marginTop: 0 }}>
          <div className="table-container">
            <table className="erp-table">
              <thead>
                <tr style={{ backgroundColor: '#00696b', color: '#ffffff' }}>
                  <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>S.No</th>
                  <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>Reference / Ref No</th>
                  <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>Date</th>
                  <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>Particulars / Category</th>
                  <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>Payer / Payee</th>
                  <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>Amount (₹)</th>
                  <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>Payment Mode</th>
                  <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800, textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {incomes.map((inc, idx) => (
                  <tr key={inc.id}>
                    <td style={{ fontWeight: 800 }}>{idx + 1}</td>
                    <td style={{ fontWeight: 800, color: '#00696b' }}>{inc.receiptNo}</td>
                    <td style={{ fontWeight: 600, color: '#475569' }}>{inc.date}</td>
                    <td style={{ fontWeight: 700, color: '#0f172a' }}>{inc.category}</td>
                    <td style={{ fontWeight: 700, color: '#0f172a' }}>{inc.payerName}</td>
                    <td style={{ fontWeight: 800, color: '#16a34a' }}>₹{inc.amount.toLocaleString()}</td>
                    <td style={{ fontWeight: 600, color: '#475569' }}>{inc.mode}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="erp-badge badge-approved">{inc.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <PaginationFooter currentCount={incomes.length} totalCount={incomes.length} />
        </div>
      )}
    </div>
  );
}


// ====================================================================
// 4. MANAGE BANK SECTION (5 VIEWS)
// ====================================================================
function ManageBankSection({
  subView,
  bankAccounts,
  setBankAccounts,
  bankTxns,
  setBankTxns,
  showToast
}: {
  subView: AccountSubView;
  bankAccounts: BankAccount[];
  setBankAccounts: React.Dispatch<React.SetStateAction<BankAccount[]>>;
  bankTxns: BankTransaction[];
  setBankTxns: React.Dispatch<React.SetStateAction<BankTransaction[]>>;
  showToast: (msg: string) => void;
}) {
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    bankName: bankAccounts[0]?.bankName || 'State Bank of India',
    accountNo: bankAccounts[0]?.accountNo || '',
    amount: '',
    mode: 'Cash',
    refNo: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
    remarks: ''
  });

  const handleBankTxnSubmit = (e: React.FormEvent, txnType: 'Deposit' | 'Withdrawal') => {
    e.preventDefault();
    if (!formData.amount) {
      alert('Amount is required!');
      return;
    }

    const amt = Number(formData.amount);

    const created: BankTransaction = {
      id: `btx-${Date.now()}`,
      transactionNo: formData.refNo,
      date: new Date().toISOString().split('T')[0],
      type: txnType,
      bankName: formData.bankName,
      accountNo: formData.accountNo,
      amount: amt,
      mode: formData.mode,
      refNo: formData.refNo,
      remarks: formData.remarks || `${txnType} transaction`,
      performedBy: 'Accountant'
    };

    setBankTxns([created, ...bankTxns]);

    // Update bank balance
    setBankAccounts(prev => prev.map(b => {
      if (b.bankName === formData.bankName) {
        const nextBal = txnType === 'Deposit' ? b.currentBalance + amt : b.currentBalance - amt;
        return { ...b, currentBalance: nextBal };
      }
      return b;
    }));

    showToast(`Bank ${txnType} of ₹${amt} recorded successfully!`);
    setShowForm(false);
  };

  if (subView === 'bank-deposit' || subView === 'bank-withdraw') {
    const isDeposit = subView === 'bank-deposit';
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Bank {isDeposit ? 'Deposit' : 'Withdrawal'} Console
            </h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Record bank cash/cheque {isDeposit ? 'deposits' : 'withdrawals'} and generate transaction slips
            </span>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="erp-btn btn-primary" style={{ backgroundColor: '#00696b', borderColor: '#00696b' }}>
            <PlusCircle size={14} /> {showForm ? 'Close Form' : `Record New ${isDeposit ? 'Deposit' : 'Withdrawal'}`}
          </button>
        </div>

        {showForm && (
          <div className="erp-card" style={{ marginBottom: '20px' }}>
            <div className="erp-card-header">
              <span className="erp-card-title">{isDeposit ? 'Record Bank Deposit' : 'Record Bank Withdrawal'}</span>
            </div>
            <form onSubmit={e => handleBankTxnSubmit(e, isDeposit ? 'Deposit' : 'Withdrawal')} style={{ padding: '16px' }}>
              <div className="form-grid">
                <div className="form-group col-span-2">
                  <label>Select School Bank Account *</label>
                  <select value={formData.bankName} onChange={e => setFormData({ ...formData, bankName: e.target.value })}>
                    {bankAccounts.map(b => <option key={b.id} value={b.bankName}>{b.bankName} - Account: {b.accountNo}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Transaction Amount (₹) *</label>
                  <input type="number" required placeholder="0.00" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Mode</label>
                  <select value={formData.mode} onChange={e => setFormData({ ...formData, mode: e.target.value })}>
                    <option value="Cash">Cash Deposit</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Self Cheque">Self Cheque</option>
                    <option value="NEFT/RTGS">NEFT / RTGS</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Deposit Slip / Ref No</label>
                  <input type="text" value={formData.refNo} onChange={e => setFormData({ ...formData, refNo: e.target.value })} />
                </div>
                <div className="form-group col-span-2">
                  <label>Remarks / Notes</label>
                  <input type="text" placeholder="Remarks..." value={formData.remarks} onChange={e => setFormData({ ...formData, remarks: e.target.value })} />
                </div>
              </div>
              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="erp-btn btn-primary" style={{ backgroundColor: '#00696b' }}>
                  <Check size={14} /> Complete {isDeposit ? 'Deposit' : 'Withdrawal'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="erp-card">
          <div className="table-container">
            <table className="erp-table">
              <thead>
                <tr style={{ backgroundColor: '#00696b', color: '#ffffff' }}>
                  <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>S.No</th>
                  <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>Txn No</th>
                  <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>Date</th>
                  <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>Bank Name</th>
                  <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>Amount (₹)</th>
                  <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>Mode</th>
                  <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>Remarks</th>
                  <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800, textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {bankTxns.filter(t => t.type === (isDeposit ? 'Deposit' : 'Withdrawal')).map((t, idx) => (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 800 }}>{idx + 1}</td>
                    <td style={{ fontWeight: 800, color: '#00696b' }}>{t.transactionNo}</td>
                    <td style={{ fontWeight: 600, color: '#475569' }}>{t.date}</td>
                    <td style={{ fontWeight: 700, color: '#0f172a' }}>{t.bankName}</td>
                    <td style={{ fontWeight: 800, color: isDeposit ? '#16a34a' : '#dc2626' }}>₹{t.amount.toLocaleString()}</td>
                    <td style={{ fontWeight: 600, color: '#475569' }}>{t.mode}</td>
                    <td style={{ fontWeight: 500, color: '#475569' }}>{t.remarks}</td>
                    <td style={{ textAlign: 'center' }}>
                      <button style={{ backgroundColor: '#ff7849', color: '#ffffff', border: 'none', borderRadius: '16px', padding: '4px 14px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                        Slip
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <PaginationFooter currentCount={bankTxns.length} totalCount={bankTxns.length} />
        </div>
      </div>
    );
  }

  // BANK LEDGER VIEW
  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
          School Bank Account Balances & Ledger Statement
        </h3>
        <span style={{ fontSize: '12px', color: '#64748b' }}>
          Comprehensive view of registered bank accounts, opening balances & current liquid funds
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        {bankAccounts.map(b => (
          <div key={b.id} className="erp-card" style={{ margin: 0, padding: '16px', borderLeft: '4px solid #00696b' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>{b.bankName}</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>Acc No: {b.accountNo}</div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>Branch: {b.branch} | IFSC: {b.ifscCode}</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#00696b', marginTop: '10px' }}>₹{b.currentBalance.toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}


// ====================================================================
// 5. ACCOUNT SETTINGS SECTION (5 VIEWS)
// ====================================================================
function AccountSettingsSection({
  subView,
  bankAccounts,
  setBankAccounts,
  incomeModes,
  setIncomeModes,
  expenseModes,
  setExpenseModes,
  fineRules,
  setFineRules,
  showToast
}: {
  subView: AccountSubView;
  bankAccounts: BankAccount[];
  setBankAccounts: React.Dispatch<React.SetStateAction<BankAccount[]>>;
  incomeModes: string[];
  setIncomeModes: React.Dispatch<React.SetStateAction<string[]>>;
  expenseModes: string[];
  setExpenseModes: React.Dispatch<React.SetStateAction<string[]>>;
  fineRules: FineSettingRule[];
  setFineRules: React.Dispatch<React.SetStateAction<FineSettingRule[]>>;
  showToast: (msg: string) => void;
}) {
  const [newModeInput, setNewModeInput] = useState('');
  const [newBank, setNewBank] = useState({ bankName: '', accountNo: '', branch: '', ifscCode: '', openingBalance: '' });
  const [newFineRule, setNewFineRule] = useState({ ruleTitle: '', gracePeriodDays: 5, fineAmount: 50, chargeFrequency: 'Per Week' as const });

  if (subView === 'setting-add-bank') {
    const handleAddBank = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newBank.bankName || !newBank.accountNo) return;
      const created: BankAccount = {
        id: `bank-${Date.now()}`,
        bankName: newBank.bankName,
        accountNo: newBank.accountNo,
        branch: newBank.branch || 'Main Branch',
        ifscCode: newBank.ifscCode || 'SBIN0001234',
        openingBalance: Number(newBank.openingBalance) || 0,
        currentBalance: Number(newBank.openingBalance) || 0,
        status: 'Active'
      };
      setBankAccounts([...bankAccounts, created]);
      showToast(`Bank account "${newBank.bankName}" added!`);
      setNewBank({ bankName: '', accountNo: '', branch: '', ifscCode: '', openingBalance: '' });
    };

    return (
      <div>
        <div className="erp-card" style={{ marginBottom: '20px' }}>
          <div className="erp-card-header"><span className="erp-card-title">Add School Bank Account</span></div>
          <form onSubmit={handleAddBank} style={{ padding: '16px' }}>
            <div className="form-grid">
              <div className="form-group col-span-2">
                <label>Bank Name *</label>
                <input type="text" required placeholder="e.g. State Bank of India" value={newBank.bankName} onChange={e => setNewBank({ ...newBank, bankName: e.target.value })} />
              </div>
              <div className="form-group col-span-2">
                <label>Account Number *</label>
                <input type="text" required placeholder="Account Number" value={newBank.accountNo} onChange={e => setNewBank({ ...newBank, accountNo: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Branch Name</label>
                <input type="text" placeholder="Branch" value={newBank.branch} onChange={e => setNewBank({ ...newBank, branch: e.target.value })} />
              </div>
              <div className="form-group">
                <label>IFSC Code</label>
                <input type="text" placeholder="IFSC" value={newBank.ifscCode} onChange={e => setNewBank({ ...newBank, ifscCode: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Opening Balance (₹)</label>
                <input type="number" placeholder="0.00" value={newBank.openingBalance} onChange={e => setNewBank({ ...newBank, openingBalance: e.target.value })} />
              </div>
            </div>
            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="erp-btn btn-primary" style={{ backgroundColor: '#00696b' }}>
                <Check size={14} /> Add Bank Account
              </button>
            </div>
          </form>
        </div>

        <div className="erp-card">
          <div className="table-container">
            <table className="erp-table">
              <thead>
                <tr style={{ backgroundColor: '#00696b', color: '#ffffff' }}>
                  <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>ID</th>
                  <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>Bank Name</th>
                  <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>Account No</th>
                  <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>IFSC Code</th>
                  <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>Current Balance</th>
                  <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800, textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {bankAccounts.map((b, idx) => (
                  <tr key={b.id}>
                    <td style={{ fontWeight: 800 }}>{idx + 1}</td>
                    <td style={{ fontWeight: 800, color: '#0f172a' }}>{b.bankName}</td>
                    <td style={{ fontWeight: 700, color: '#00696b' }}>{b.accountNo}</td>
                    <td style={{ fontWeight: 600, color: '#475569' }}>{b.ifscCode}</td>
                    <td style={{ fontWeight: 800, color: '#16a34a' }}>₹{b.currentBalance.toLocaleString()}</td>
                    <td style={{ textAlign: 'center' }}>
                      <button style={{ backgroundColor: '#ff7849', color: '#ffffff', border: 'none', borderRadius: '16px', padding: '4px 14px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // FINE SETTINGS VIEW
  if (subView === 'setting-fine-rule' || subView === 'setting-apply-fine') {
    return (
      <div>
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Fee Fine Rules & Overdue Calculation Tool
          </h3>
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            Configure late fee fine slabs, grace periods & batch apply fines to student dues
          </span>
        </div>

        <div className="erp-card">
          <div className="table-container">
            <table className="erp-table">
              <thead>
                <tr style={{ backgroundColor: '#00696b', color: '#ffffff' }}>
                  <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>Rule Title</th>
                  <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>Grace Period</th>
                  <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>Fine Amount</th>
                  <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>Frequency</th>
                  <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800, textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {fineRules.map(r => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 800, color: '#0f172a' }}>{r.ruleTitle}</td>
                    <td style={{ fontWeight: 600, color: '#475569' }}>{r.gracePeriodDays} Days Grace</td>
                    <td style={{ fontWeight: 800, color: '#dc2626' }}>₹{r.fineAmount}</td>
                    <td style={{ fontWeight: 600, color: '#475569' }}>{r.chargeFrequency}</td>
                    <td style={{ textAlign: 'center' }}>
                      <button onClick={() => showToast('Fine applied to overdue student accounts!')} style={{ backgroundColor: '#ff7849', color: '#ffffff', border: 'none', borderRadius: '16px', padding: '4px 14px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                        Apply Fine
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // PAYMENT MODES VIEW (INCOME/EXPENSE MODE)
  return (
    <div>
      <div className="erp-card" style={{ marginBottom: '16px' }}>
        <div className="erp-card-header">
          <span className="erp-card-title">Configure Payment Modes ({subView === 'setting-income-mode' ? 'Income' : 'Expense'})</span>
        </div>
        <div className="erp-card-body">
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
            <input 
              type="text" 
              placeholder="e.g. Bank Transfer / QR Pay" 
              value={newModeInput} 
              onChange={e => setNewModeInput(e.target.value)} 
              style={{ flex: 1 }}
            />
            <button 
              onClick={() => {
                if (!newModeInput) return;
                if (subView === 'setting-income-mode') setIncomeModes([...incomeModes, newModeInput]);
                else setExpenseModes([...expenseModes, newModeInput]);
                showToast(`Payment mode "${newModeInput}" added!`);
                setNewModeInput('');
              }}
              className="erp-btn btn-primary" style={{ backgroundColor: '#00696b' }}
            >
              Add Mode
            </button>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {(subView === 'setting-income-mode' ? incomeModes : expenseModes).map((m, idx) => (
              <span key={idx} className="erp-badge" style={{ backgroundColor: '#e0f2fe', color: '#0369a1', borderColor: '#bae6fd', fontSize: '13px', padding: '6px 12px' }}>
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


// ====================================================================
// PAGINATION FOOTER
// ====================================================================
function PaginationFooter({ currentCount, totalCount }: { currentCount: number; totalCount: number }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px',
      borderTop: '1px solid #e2e8f0', fontSize: '13px', color: '#64748b', fontWeight: 600, backgroundColor: '#f8fafc'
    }}>
      <div>Showing 1 to {currentCount} of {totalCount} entries</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
        <span style={{ color: '#94a3b8', cursor: 'pointer' }}>First</span>
        <span style={{ color: '#94a3b8', cursor: 'pointer', fontWeight: 800 }}>‹</span>
        <div style={{ backgroundColor: '#ff7849', color: '#ffffff', fontWeight: 800, padding: '2px 10px', borderRadius: '4px' }}>1</div>
        <span style={{ color: '#94a3b8', cursor: 'pointer', fontWeight: 800 }}>›</span>
        <span style={{ color: '#94a3b8', cursor: 'pointer' }}>Last</span>
      </div>
    </div>
  );
}
