import React, { useState } from 'react';
import { 
  Users, UserPlus, FileText, Check, PlusCircle, Search, Download, 
  Printer, CheckCircle2, XCircle, Edit, Trash2, RefreshCw, 
  BookOpen, Building, MessageSquare, DollarSign, Settings, 
  Award, GraduationCap, Contact, ClipboardList, Bell, 
  Upload, ChevronDown, Calendar, Phone, Mail, Star, 
  IndianRupee, BarChart3, Layers, Shield, Tag, Package, 
  Bus, Clock, Video, ArrowRight, Send, AlertCircle, Eye, AlertTriangle, FileSpreadsheet, Lock
} from 'lucide-react';

import { studentService } from './services/studentService';

// ===========================================================
// TYPES
// ===========================================================
export type HRSubView = 
  | 'hr-staff-list' | 'hr-add-staff' | 'hr-department' | 'hr-designation' 
  | 'hr-leave-apply' | 'hr-leave-approve' | 'hr-leave-type' | 'hr-holiday';

export type CertificateSubView = 
  | 'cert-bonafide' | 'cert-transfer' | 'cert-character' | 'cert-migration' 
  | 'cert-sports' | 'cert-marksheet-duplicate' | 'cert-design';

export type AcademicSubView = 
  | 'academic-subject' | 'academic-chapter' | 'academic-lesson-plan' 
  | 'academic-homework' | 'academic-homework-report' | 'academic-syllabus';

export type FrontOfficeSubView = 
  | 'fo-enquiry-add' | 'fo-enquiry-list' | 'fo-followup' | 'fo-visitor-book' 
  | 'fo-postal-receive' | 'fo-postal-dispatch' | 'fo-phone-call' | 'fo-complain';

export type SendSMSSubView = 
  | 'sms-send-student' | 'sms-send-staff' | 'sms-send-custom' 
  | 'sms-notice-board' | 'sms-template' | 'sms-log' | 'sms-balance';

export type PayrollSubView = 
  | 'payroll-salary-structure' | 'payroll-generate' | 'payroll-slip' 
  | 'payroll-advance' | 'payroll-pf-esi' | 'payroll-report';

export type LibrarySubView = 
  | 'lib-add-book' | 'lib-book-list' | 'lib-issue-book' | 'lib-return-book' 
  | 'lib-due-books' | 'lib-member' | 'lib-report';

export type InventorySubView = 
  | 'inv-item-list' | 'inv-add-stock' | 'inv-issue-item' 
  | 'inv-category' | 'inv-supplier' | 'inv-store' | 'inv-report';

export type TransportSubView = 
  | 'trans-route-list' | 'trans-add-route' | 'trans-vehicle-list' 
  | 'trans-assign-student' | 'trans-driver-staff' | 'trans-fee-report';

export type HostelSubView = 
  | 'hostel-room-list' | 'hostel-add-room' | 'hostel-room-type' 
  | 'hostel-allotment' | 'hostel-fees' | 'hostel-report';

export type EContentSubView = 
  | 'econtent-add' | 'econtent-list' | 'econtent-homework' | 'econtent-exam';

export type MasterSubView = 
  | 'master-class' | 'master-section' | 'master-subject' | 'master-session' 
  | 'master-category' | 'master-religion' | 'master-caste' | 'master-house'
  | 'master-id-card' | 'master-permissions' | 'master-gallery';

// ===========================================================
// HR & STAFF MODULE
// ===========================================================
const HR_STAFF = [
  { id: 'STF001', name: 'Mr. Rahul Rathi', dept: 'Administration', desig: 'Director', phone: '9876543210', email: 'rahul@school.edu', joinDate: '2018-04-01', status: 'Active' },
  { id: 'STF002', name: 'Ms. Geeta Dang', dept: 'Administration', desig: 'Principal', phone: '9876543211', email: 'geeta@school.edu', joinDate: '2019-06-15', status: 'Active' },
  { id: 'STF003', name: 'Ms. Babita Sharma', dept: 'Administration', desig: 'Vice Principal', phone: '9876543212', email: 'babita@school.edu', joinDate: '2020-01-10', status: 'Active' },
  { id: 'STF004', name: 'Ms. Seema Solanki', dept: 'Teaching', desig: 'PGT Teacher', phone: '9876543213', email: 'seema@school.edu', joinDate: '2021-07-01', status: 'Active' },
  { id: 'STF005', name: 'Mr. Mohit Verma', dept: 'Teaching', desig: 'TGT Teacher', phone: '9876543214', email: 'mohit@school.edu', joinDate: '2021-07-01', status: 'Active' },
  { id: 'STF006', name: 'Ms. Mona Arora', dept: 'Teaching', desig: 'PRT Teacher', phone: '9876543215', email: 'mona@school.edu', joinDate: '2022-04-05', status: 'Active' },
  { id: 'STF007', name: 'Mr. Sonu Verma', dept: 'Non-Teaching', desig: 'Peon', phone: '9876543216', email: 'sonu@school.edu', joinDate: '2023-01-01', status: 'Inactive' },
];

const HR_LEAVES = [
  { id: 'LV001', staffName: 'Ms. Seema Solanki', leaveType: 'Casual Leave', fromDate: '2026-07-18', toDate: '2026-07-19', days: 2, reason: 'Personal Work', status: 'Approved' },
  { id: 'LV002', staffName: 'Mr. Mohit Verma', leaveType: 'Medical Leave', fromDate: '2026-07-22', toDate: '2026-07-23', days: 2, reason: 'Health Issues', status: 'Pending' },
  { id: 'LV003', staffName: 'Ms. Mona Arora', leaveType: 'Casual Leave', fromDate: '2026-07-25', toDate: '2026-07-25', days: 1, reason: 'Family Function', status: 'Rejected' },
];

export function HRModule({ initialSubView = 'hr-staff-list', onNavigateSubView }: { initialSubView?: HRSubView; onNavigateSubView?: (sv: HRSubView) => void }) {
  const [subView, setSubView] = useState<HRSubView>(initialSubView);
  const [showAddForm, setShowAddForm] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  React.useEffect(() => { setSubView(initialSubView); }, [initialSubView]);
  const go = (sv: HRSubView) => { setSubView(sv); onNavigateSubView?.(sv); };
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  return (
    <div>
      {toast && <div style={{ position: 'fixed', bottom: 24, right: 24, backgroundColor: '#0f172a', color: '#fff', padding: '12px 20px', borderRadius: 8, zIndex: 9999, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 14px rgba(0,0,0,0.25)' }}><CheckCircle2 size={16} color="#38bdf8" />{toast}</div>}
      <div className="view-header">
        <div>
          <h2 className="view-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><ClipboardList size={22} color="#2563eb" /> HR & Staff Management</h2>
          <span className="view-subtitle">Staff records, leave management, departments, designations & holiday calendar</span>
        </div>
      </div>

      {/* STAFF LIST */}
      {(subView === 'hr-staff-list') && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>All Staff Registry ({HR_STAFF.length} Records)</h3>
            <button onClick={() => go('hr-add-staff')} className="erp-btn btn-primary"><PlusCircle size={14} /> Add New Staff</button>
          </div>
          <div className="erp-card"><div className="table-container"><table className="erp-table">
            <thead><tr>
              {['Emp ID', 'Staff Name', 'Department', 'Designation', 'Phone', 'Join Date', 'Status', 'Action'].map(h => <th key={h}>{h}</th>)}
            </tr></thead>
            <tbody>{HR_STAFF.map(s => (
              <tr key={s.id}>
                <td style={{ fontWeight: 800, color: '#dc2626' }}>{s.id}</td>
                <td style={{ fontWeight: 800 }}>{s.name}</td>
                <td style={{ fontWeight: 700, color: '#2563eb' }}>{s.dept}</td>
                <td>{s.desig}</td>
                <td>{s.phone}</td>
                <td>{s.joinDate}</td>
                <td><span className={`erp-badge ${s.status === 'Active' ? 'badge-approved' : 'badge-rejected'}`}>{s.status}</span></td>
                <td><button onClick={() => showToast('Staff profile opened')} style={{ padding: '4px 10px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>Edit</button></td>
              </tr>
            ))}</tbody>
          </table></div></div>
        </div>
      )}

      {/* ADD STAFF FORM */}
      {subView === 'hr-add-staff' && (
        <div className="erp-card">
          <div className="erp-card-header"><span className="erp-card-title">Add New Staff Member</span></div>
          <form onSubmit={e => { e.preventDefault(); showToast('New staff member added successfully!'); go('hr-staff-list'); }} style={{ padding: 20 }}>
            <div className="form-grid">
              <div className="form-group"><label>First Name *</label><input type="text" required placeholder="First Name" /></div>
              <div className="form-group"><label>Last Name *</label><input type="text" required placeholder="Last Name" /></div>
              <div className="form-group"><label>Employee ID *</label><input type="text" placeholder="Auto-generated" /></div>
              <div className="form-group"><label>Department *</label><select><option>Teaching</option><option>Non-Teaching</option><option>Administration</option><option>Support</option></select></div>
              <div className="form-group"><label>Designation *</label><select><option>Principal</option><option>Vice Principal</option><option>PGT Teacher</option><option>TGT Teacher</option><option>PRT Teacher</option><option>Peon</option><option>Guard</option></select></div>
              <div className="form-group"><label>Joining Date *</label><input type="date" /></div>
              <div className="form-group"><label>Mobile Number *</label><input type="tel" placeholder="10-digit mobile" /></div>
              <div className="form-group"><label>Email Address</label><input type="email" placeholder="staff@school.edu" /></div>
              <div className="form-group"><label>Date of Birth *</label><input type="date" /></div>
              <div className="form-group"><label>Gender *</label><select><option>Male</option><option>Female</option><option>Other</option></select></div>
              <div className="form-group"><label>Qualification</label><input type="text" placeholder="e.g. M.Sc., B.Ed." /></div>
              <div className="form-group"><label>Basic Salary (₹) *</label><input type="number" placeholder="Monthly gross salary" /></div>
              <div className="form-group col-span-2"><label>Residential Address</label><input type="text" placeholder="Full Address" /></div>
            </div>
            <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" onClick={() => go('hr-staff-list')} className="erp-btn btn-outline">Cancel</button>
              <button type="submit" className="erp-btn btn-primary"><Check size={14} /> Save Staff</button>
            </div>
          </form>
        </div>
      )}

      {/* LEAVE APPLY / APPROVE */}
      {(subView === 'hr-leave-apply' || subView === 'hr-leave-approve') && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>{subView === 'hr-leave-apply' ? 'Apply for Leave' : 'Leave Approval Console'}</h3>
            {subView === 'hr-leave-apply' && <button onClick={() => setShowAddForm(!showAddForm)} className="erp-btn btn-primary"><PlusCircle size={14} /> Apply Leave</button>}
          </div>
          {showAddForm && subView === 'hr-leave-apply' && (
            <div className="erp-card" style={{ marginBottom: 16 }}>
              <form onSubmit={e => { e.preventDefault(); showToast('Leave application submitted!'); setShowAddForm(false); }} style={{ padding: 20 }}>
                <div className="form-grid">
                  <div className="form-group"><label>Leave Type *</label><select><option>Casual Leave</option><option>Medical Leave</option><option>Earned Leave</option><option>Maternity Leave</option><option>Unpaid Leave</option></select></div>
                  <div className="form-group"><label>From Date *</label><input type="date" /></div>
                  <div className="form-group"><label>To Date *</label><input type="date" /></div>
                  <div className="form-group col-span-2"><label>Reason *</label><input type="text" required placeholder="Reason for leave" /></div>
                </div>
                <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="erp-btn btn-primary"><Check size={14} /> Submit Application</button>
                </div>
              </form>
            </div>
          )}
          <div className="erp-card"><div className="table-container"><table className="erp-table">
            <thead><tr>
              {['App ID', 'Staff Name', 'Leave Type', 'From', 'To', 'Days', 'Reason', 'Status', 'Action'].map(h => <th key={h}>{h}</th>)}
            </tr></thead>
            <tbody>{HR_LEAVES.map(l => (
              <tr key={l.id}>
                <td style={{ fontWeight: 800 }}>{l.id}</td>
                <td style={{ fontWeight: 800 }}>{l.staffName}</td>
                <td style={{ color: '#00696b', fontWeight: 700 }}>{l.leaveType}</td>
                <td>{l.fromDate}</td>
                <td>{l.toDate}</td>
                <td style={{ fontWeight: 800 }}>{l.days} Days</td>
                <td style={{ color: '#64748b', fontSize: 12 }}>{l.reason}</td>
                <td><span className={`erp-badge ${l.status === 'Approved' ? 'badge-approved' : l.status === 'Rejected' ? 'badge-rejected' : 'badge-pending'}`}>{l.status}</span></td>
                <td>
                  {subView === 'hr-leave-approve' && l.status === 'Pending' && (
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button onClick={() => showToast('Leave Approved!')} style={{ padding: '3px 8px', backgroundColor: '#16a34a', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>Approve</button>
                      <button onClick={() => showToast('Leave Rejected!')} style={{ padding: '3px 8px', backgroundColor: '#dc2626', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>Reject</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}</tbody>
          </table></div></div>
        </div>
      )}

      {/* DEPARTMENT / DESIGNATION / LEAVE TYPE / HOLIDAY */}
      {(subView === 'hr-department' || subView === 'hr-designation' || subView === 'hr-leave-type' || subView === 'hr-holiday') && (
        <SimpleConfigView
          title={subView === 'hr-department' ? 'Department Master' : subView === 'hr-designation' ? 'Designation Master' : subView === 'hr-leave-type' ? 'Leave Types Configuration' : 'School Holiday Calendar'}
          items={subView === 'hr-department' ? ['Teaching', 'Non-Teaching', 'Administration', 'Support Staff', 'Security'] : subView === 'hr-designation' ? ['Principal', 'Vice Principal', 'PGT Teacher', 'TGT Teacher', 'PRT Teacher', 'Librarian', 'Accountant', 'Peon', 'Guard'] : subView === 'hr-leave-type' ? ['Casual Leave (CL) - 12/year', 'Medical Leave (ML) - 12/year', 'Earned Leave (EL) - 15/year', 'Maternity Leave - 180 days', 'Unpaid Leave'] : ['Independence Day - 15 Aug 2026', 'Janmashtami - 04 Sep 2026', 'Gandhi Jayanti - 02 Oct 2026', 'Diwali Break - 01-05 Nov 2026', 'Christmas - 25 Dec 2026']}
          onAdd={() => showToast('New entry added!')}
        />
      )}
    </div>
  );
}

// ===========================================================
// CERTIFICATE MODULE
// ===========================================================
const CERT_RECORDS = [
  { id: 'CERT001', studentName: 'Aarav Sharma', class: '10-A', certType: 'Transfer Certificate', issueDate: '2026-07-15', status: 'Issued' },
  { id: 'CERT002', studentName: 'Aditi Verma', class: '12-A', certType: 'Bonafide Certificate', issueDate: '2026-07-18', status: 'Issued' },
  { id: 'CERT003', studentName: 'Bhavya Joshi', class: '9-B', certType: 'Character Certificate', issueDate: '2026-07-20', status: 'Pending' },
];

export function CertificateModule({ initialSubView = 'cert-bonafide', onNavigateSubView }: { initialSubView?: CertificateSubView; onNavigateSubView?: (sv: CertificateSubView) => void }) {
  const [subView, setSubView] = useState<CertificateSubView>(initialSubView);
  const [toast, setToast] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState('Bonafide Certificate');

  React.useEffect(() => { setSubView(initialSubView); }, [initialSubView]);
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const certTypes: Record<string, string> = {
    'cert-bonafide': 'Bonafide Certificate',
    'cert-transfer': 'Transfer Certificate (TC)',
    'cert-character': 'Character Certificate',
    'cert-migration': 'Migration Certificate',
    'cert-sports': 'Sports Achievement Certificate',
    'cert-marksheet-duplicate': 'Duplicate Marksheet'
  };

  return (
    <div>
      {toast && <div style={{ position: 'fixed', bottom: 24, right: 24, backgroundColor: '#0f172a', color: '#fff', padding: '12px 20px', borderRadius: 8, zIndex: 9999, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 14px rgba(0,0,0,0.25)' }}><CheckCircle2 size={16} color="#38bdf8" />{toast}</div>}
      <div className="view-header">
        <div>
          <h2 className="view-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Award size={22} color="#2563eb" /> Certificate Generator</h2>
          <span className="view-subtitle">Issue bonafide, transfer, character & migration certificates with digital stamps</span>
        </div>
      </div>

      {subView === 'cert-design' ? (
        <div className="erp-card">
          <div className="erp-card-header"><span className="erp-card-title">Certificate Template Designer</span></div>
          <div className="erp-card-body" style={{ padding: 20 }}>
            <div className="form-grid">
              <div className="form-group"><label>Certificate Type *</label><select value={selectedType} onChange={e => setSelectedType(e.target.value)}>{Object.values(certTypes).map(t => <option key={t}>{t}</option>)}</select></div>
              <div className="form-group"><label>Header Text *</label><input type="text" defaultValue="DETTROIN ACADEMY INTERNATIONAL" /></div>
              <div className="form-group"><label>School Affiliation</label><input type="text" defaultValue="Affiliated to CBSE, New Delhi" /></div>
              <div className="form-group"><label>Seal / Stamp</label><select><option>Official Round Stamp</option><option>Digital Seal</option></select></div>
              <div className="form-group col-span-2"><label>Body Text / Description</label><textarea rows={4} defaultValue={`This is to certify that [STUDENT_NAME], Son/Daughter of [FATHER_NAME], is a bonafide student of this school studying in Class [CLASS] during the Session [SESSION].`} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #e2e8f0' }} /></div>
            </div>
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => showToast('Certificate template saved!')} className="erp-btn btn-primary"><Check size={14} /> Save Template</button>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontWeight: 800 }}>{certTypes[subView] || 'Certificate'} Issuance Console</h3>
            <button onClick={() => showToast('Certificate generated & printed!')} className="erp-btn btn-primary"><Printer size={14} /> Generate & Print</button>
          </div>

          <div className="erp-card" style={{ marginBottom: 16 }}>
            <div className="erp-card-body" style={{ padding: 20 }}>
              <div className="form-grid">
                <div className="form-group"><label>Student Name *</label><input type="text" placeholder="Student name or roll no" /></div>
                <div className="form-group"><label>Class & Section *</label><select><option>Class 10-A</option><option>Class 10-B</option><option>Class 12-A</option><option>Class 9-A</option></select></div>
                {subView === 'cert-transfer' && (<>
                  <div className="form-group"><label>Leaving Date *</label><input type="date" /></div>
                  <div className="form-group"><label>Reason for Leaving *</label><select><option>Transfer of Parents</option><option>Going Abroad</option><option>Medical Reasons</option><option>Other</option></select></div>
                </>)}
                <div className="form-group"><label>Issue Date *</label><input type="date" defaultValue={new Date().toISOString().split('T')[0]} /></div>
                <div className="form-group"><label>Purpose / Remarks</label><input type="text" placeholder="Purpose of certificate" /></div>
              </div>
            </div>
          </div>

          <div className="erp-card">
            <div className="erp-card-header"><span className="erp-card-title">Recently Issued Certificates</span></div>
            <div className="table-container"><table className="erp-table">
              <thead><tr>
                {['Cert No', 'Student Name', 'Class', 'Certificate Type', 'Issue Date', 'Status', 'Action'].map(h => <th key={h}>{h}</th>)}
              </tr></thead>
              <tbody>{CERT_RECORDS.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 800 }}>{c.id}</td>
                  <td style={{ fontWeight: 800 }}>{c.studentName}</td>
                  <td style={{ color: '#2563eb', fontWeight: 700 }}>{c.class}</td>
                  <td>{c.certType}</td>
                  <td>{c.issueDate}</td>
                  <td><span className={`erp-badge ${c.status === 'Issued' ? 'badge-approved' : 'badge-pending'}`}>{c.status}</span></td>
                  <td><button onClick={() => showToast('Certificate re-printed!')} style={{ padding: '4px 10px', backgroundColor: '#8b4570', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>Re-Print</button></td>
                </tr>
              ))}</tbody>
            </table></div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===========================================================
// ACADEMIC MODULE
// ===========================================================
const HOMEWORK_LIST = [
  { id: 'HW001', class: 'Class 10-A', subject: 'Mathematics', topic: 'Chapter 5: Polynomials - Ex 5.2 Q1-Q10', assignDate: '2026-07-20', dueDate: '2026-07-22', teacher: 'Mr. Mohit Verma', status: 'Active' },
  { id: 'HW002', class: 'Class 12-A', subject: 'Physics', topic: 'Numericals on Laws of Motion (Unit 2)', assignDate: '2026-07-20', dueDate: '2026-07-23', teacher: 'Ms. Mona Arora', status: 'Active' },
  { id: 'HW003', class: 'Class 9-B', subject: 'English', topic: 'Write a paragraph on "My School"', assignDate: '2026-07-19', dueDate: '2026-07-21', teacher: 'Ms. Seema Solanki', status: 'Submitted' },
];

export function AcademicModule({ initialSubView = 'academic-subject', onNavigateSubView }: { initialSubView?: AcademicSubView; onNavigateSubView?: (sv: AcademicSubView) => void }) {
  const [subView, setSubView] = useState<AcademicSubView>(initialSubView);
  const [toast, setToast] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  React.useEffect(() => { setSubView(initialSubView); }, [initialSubView]);
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  return (
    <div>
      {toast && <div style={{ position: 'fixed', bottom: 24, right: 24, backgroundColor: '#0f172a', color: '#fff', padding: '12px 20px', borderRadius: 8, zIndex: 9999, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 14px rgba(0,0,0,0.25)' }}><CheckCircle2 size={16} color="#38bdf8" />{toast}</div>}
      <div className="view-header">
        <div>
          <h2 className="view-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><GraduationCap size={22} color="#2563eb" /> Academic Management</h2>
          <span className="view-subtitle">Subjects, chapters, lesson plans, homework assignments & syllabus tracking</span>
        </div>
      </div>

      {(subView === 'academic-homework' || subView === 'academic-homework-report') && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontWeight: 800 }}>{subView === 'academic-homework' ? 'Assign & Manage Homework' : 'Homework Submission Report'}</h3>
            {subView === 'academic-homework' && <button onClick={() => setShowForm(!showForm)} className="erp-btn btn-primary"><PlusCircle size={14} /> Assign Homework</button>}
          </div>
          {showForm && subView === 'academic-homework' && (
            <div className="erp-card" style={{ marginBottom: 16 }}>
              <form onSubmit={e => { e.preventDefault(); showToast('Homework assigned & SMS sent to parents!'); setShowForm(false); }} style={{ padding: 20 }}>
                <div className="form-grid">
                  <div className="form-group"><label>Class *</label><select><option>Class 10-A</option><option>Class 10-B</option><option>Class 12-A</option><option>Class 9-A</option></select></div>
                  <div className="form-group"><label>Subject *</label><select><option>Mathematics</option><option>Science</option><option>English</option><option>Social Science</option><option>Hindi</option></select></div>
                  <div className="form-group"><label>Due Date *</label><input type="date" required /></div>
                  <div className="form-group"><label>Max Marks</label><input type="number" defaultValue={10} /></div>
                  <div className="form-group col-span-2"><label>Homework Description *</label><textarea required rows={3} placeholder="Describe the homework task in detail..." style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #e2e8f0' }} /></div>
                </div>
                <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="erp-btn btn-primary"><Check size={14} /> Assign & Notify</button>
                </div>
              </form>
            </div>
          )}
          <div className="erp-card"><div className="table-container"><table className="erp-table">
            <thead><tr>
              {['ID', 'Class', 'Subject', 'Topic / Task', 'Assigned', 'Due Date', 'Teacher', 'Status'].map(h => <th key={h}>{h}</th>)}
            </tr></thead>
            <tbody>{HOMEWORK_LIST.map(hw => (
              <tr key={hw.id}>
                <td style={{ fontWeight: 800 }}>{hw.id}</td>
                <td style={{ fontWeight: 700, color: '#2563eb' }}>{hw.class}</td>
                <td style={{ fontWeight: 800 }}>{hw.subject}</td>
                <td style={{ color: '#0f172a', fontSize: 12 }}>{hw.topic}</td>
                <td>{hw.assignDate}</td>
                <td style={{ fontWeight: 700, color: '#dc2626' }}>{hw.dueDate}</td>
                <td>{hw.teacher}</td>
                <td><span className={`erp-badge ${hw.status === 'Active' ? 'badge-approved' : 'badge-pending'}`}>{hw.status}</span></td>
              </tr>
            ))}</tbody>
          </table></div></div>
        </div>
      )}

      {(subView === 'academic-subject' || subView === 'academic-chapter' || subView === 'academic-lesson-plan' || subView === 'academic-syllabus') && (
        <SimpleConfigView
          title={subView === 'academic-subject' ? 'Subject Master Configuration' : subView === 'academic-chapter' ? 'Chapter & Topic Master' : subView === 'academic-lesson-plan' ? 'Lesson Plan Builder' : 'Syllabus Completion Tracker'}
          items={subView === 'academic-subject' ? ['English', 'Mathematics', 'Science', 'Social Science', 'Hindi', 'Computer Science', 'Physical Education', 'Sanskrit'] : subView === 'academic-chapter' ? ['Chapter 1: Real Numbers', 'Chapter 2: Polynomials', 'Chapter 3: Linear Equations', 'Chapter 4: Quadratic Equations', 'Chapter 5: Arithmetic Progressions'] : subView === 'academic-lesson-plan' ? ['Week 1 (Jul): Introduction to Polynomials', 'Week 2 (Jul): Factorization Methods', 'Week 3 (Aug): Linear Equations Setup', 'Week 4 (Aug): Graphical Method Solutions'] : ['Mathematics Syllabus - 65% Completed', 'Science Syllabus - 60% Completed', 'English Syllabus - 72% Completed', 'Social Science - 55% Completed', 'Hindi - 70% Completed']}
          onAdd={() => showToast('New entry added successfully!')}
        />
      )}
    </div>
  );
}

// ===========================================================
// FRONT OFFICE MODULE
// ===========================================================
const ENQUIRIES = [
  { id: 'ENQ001', name: 'Rajesh Kumar', phone: '9876543000', forClass: 'Class 6', enquiryDate: '2026-07-18', purpose: 'Admission Query', source: 'Walk-In', status: 'Converted', followupDate: '2026-07-20' },
  { id: 'ENQ002', name: 'Sunita Sharma', phone: '9876543001', forClass: 'Class 9', enquiryDate: '2026-07-19', purpose: 'Fee Structure', source: 'Phone', status: 'Pending', followupDate: '2026-07-22' },
  { id: 'ENQ003', name: 'Vikram Singh', phone: '9876543002', forClass: 'Class 11', enquiryDate: '2026-07-20', purpose: 'Transfer Admission', source: 'Reference', status: 'Active', followupDate: '2026-07-23' },
];

const VISITORS = [
  { id: 'VIS001', visitorName: 'Ramesh Patel', purpose: 'Meeting Principal', toMeet: 'Ms. Geeta Dang', inTime: '10:30 AM', outTime: '11:15 AM', date: '2026-07-21', idType: 'Aadhaar', badge: 'B-001' },
  { id: 'VIS002', visitorName: 'Meena Joshi', purpose: 'Student Pickup', toMeet: 'Class Teacher', inTime: '01:30 PM', outTime: '01:45 PM', date: '2026-07-21', idType: 'DL', badge: 'B-002' },
];

export function FrontOfficeModule({ initialSubView = 'fo-enquiry-list', onNavigateSubView }: { initialSubView?: FrontOfficeSubView; onNavigateSubView?: (sv: FrontOfficeSubView) => void }) {
  const [subView, setSubView] = useState<FrontOfficeSubView>(initialSubView);
  const [toast, setToast] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  React.useEffect(() => { setSubView(initialSubView); }, [initialSubView]);
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  return (
    <div>
      {toast && <div style={{ position: 'fixed', bottom: 24, right: 24, backgroundColor: '#0f172a', color: '#fff', padding: '12px 20px', borderRadius: 8, zIndex: 9999, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 14px rgba(0,0,0,0.25)' }}><CheckCircle2 size={16} color="#38bdf8" />{toast}</div>}
      <div className="view-header">
        <div>
          <h2 className="view-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Contact size={22} color="#2563eb" /> Front Office & Reception Management</h2>
          <span className="view-subtitle">Enquiry management, visitor log, postal dispatch & phone call register</span>
        </div>
      </div>

      {subView === 'fo-enquiry-list' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontWeight: 800 }}>Admission Enquiry Register</h3>
            <button onClick={() => setShowForm(!showForm)} className="erp-btn btn-primary"><PlusCircle size={14} /> Add Enquiry</button>
          </div>
          {showForm && (
            <div className="erp-card" style={{ marginBottom: 16 }}>
              <form onSubmit={e => { e.preventDefault(); showToast('Enquiry recorded & follow-up scheduled!'); setShowForm(false); }} style={{ padding: 20 }}>
                <div className="form-grid">
                  <div className="form-group"><label>Parent / Guardian Name *</label><input type="text" required placeholder="Full Name" /></div>
                  <div className="form-group"><label>Mobile Number *</label><input type="tel" required placeholder="10-digit mobile" /></div>
                  <div className="form-group"><label>For Class *</label><select><option>Class 6</option><option>Class 7</option><option>Class 8</option><option>Class 9</option><option>Class 10</option><option>Class 11</option><option>Class 12</option></select></div>
                  <div className="form-group"><label>Enquiry Source *</label><select><option>Walk-In</option><option>Phone Call</option><option>Reference</option><option>Online Website</option><option>Newspaper Ad</option></select></div>
                  <div className="form-group"><label>Purpose *</label><select><option>Admission Query</option><option>Fee Structure</option><option>Transfer Admission</option><option>Scholarship Info</option><option>Other</option></select></div>
                  <div className="form-group"><label>Follow-up Date *</label><input type="date" required /></div>
                  <div className="form-group col-span-2"><label>Remarks / Notes</label><input type="text" placeholder="Additional notes" /></div>
                </div>
                <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="erp-btn btn-primary"><Check size={14} /> Save Enquiry</button>
                </div>
              </form>
            </div>
          )}
          <div className="erp-card"><div className="table-container"><table className="erp-table">
            <thead><tr>
              {['ENQ ID', 'Parent Name', 'Phone', 'For Class', 'Date', 'Purpose', 'Source', 'Follow-up', 'Status'].map(h => <th key={h}>{h}</th>)}
            </tr></thead>
            <tbody>{ENQUIRIES.map(e => (
              <tr key={e.id}>
                <td style={{ fontWeight: 800 }}>{e.id}</td>
                <td style={{ fontWeight: 800 }}>{e.name}</td>
                <td>{e.phone}</td>
                <td style={{ color: '#2563eb', fontWeight: 700 }}>{e.forClass}</td>
                <td>{e.enquiryDate}</td>
                <td style={{ fontSize: 12 }}>{e.purpose}</td>
                <td><span style={{ padding: '2px 8px', backgroundColor: '#f0f9ff', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>{e.source}</span></td>
                <td style={{ color: '#dc2626', fontWeight: 700 }}>{e.followupDate}</td>
                <td><span className={`erp-badge ${e.status === 'Converted' ? 'badge-approved' : e.status === 'Active' ? 'badge-pending' : 'badge-rejected'}`}>{e.status}</span></td>
              </tr>
            ))}</tbody>
          </table></div></div>
        </div>
      )}

      {subView === 'fo-visitor-book' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontWeight: 800 }}>Visitor Log & Gate Pass Register</h3>
            <button onClick={() => showToast('New visitor entry recorded!')} className="erp-btn btn-primary"><PlusCircle size={14} /> Add Visitor Entry</button>
          </div>
          <div className="erp-card"><div className="table-container"><table className="erp-table">
            <thead><tr>
              {['Badge No', 'Visitor Name', 'Purpose', 'To Meet', 'ID Type', 'In Time', 'Out Time', 'Date'].map(h => <th key={h}>{h}</th>)}
            </tr></thead>
            <tbody>{VISITORS.map(v => (
              <tr key={v.id}>
                <td style={{ fontWeight: 800, color: '#dc2626' }}>{v.badge}</td>
                <td style={{ fontWeight: 800 }}>{v.visitorName}</td>
                <td style={{ fontSize: 12 }}>{v.purpose}</td>
                <td>{v.toMeet}</td>
                <td><span style={{ padding: '2px 8px', backgroundColor: '#f0f9ff', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>{v.idType}</span></td>
                <td style={{ color: '#16a34a', fontWeight: 700 }}>{v.inTime}</td>
                <td style={{ color: '#dc2626', fontWeight: 700 }}>{v.outTime}</td>
                <td>{v.date}</td>
              </tr>
            ))}</tbody>
          </table></div></div>
        </div>
      )}

      {(subView === 'fo-postal-receive' || subView === 'fo-postal-dispatch' || subView === 'fo-phone-call' || subView === 'fo-complain' || subView === 'fo-followup') && (
        <SimpleConfigView
          title={subView === 'fo-postal-receive' ? 'Postal Receive Register' : subView === 'fo-postal-dispatch' ? 'Postal Dispatch Register' : subView === 'fo-phone-call' ? 'Phone Call Log Register' : subView === 'fo-complain' ? 'Grievance & Complain Log' : 'Enquiry Follow-Up Tracker'}
          items={subView === 'fo-postal-receive' ? ['CBSE Circular #2026-45 (Received: 18-Jul)', 'NCERT Book Delivery (Received: 19-Jul)', 'Staff Appointment Letter (Received: 20-Jul)'] : subView === 'fo-postal-dispatch' ? ['TC Letter for Rahul Sharma (Sent: 17-Jul)', 'Parent Invitation for PTA (Sent: 20-Jul)'] : subView === 'fo-phone-call' ? ['Parent call - Rohan Patel (10:30 AM)', 'CBSE Helpdesk (02:15 PM)', 'Supplier Quote (03:40 PM)'] : subView === 'fo-complain' ? ['BUS-04 AC not working properly (Resolved)', 'Water dispenser on 2nd floor leaking (Pending)'] : ['Rajesh Kumar - Class 6 Admission (Due: 22-Jul)', 'Sunita Sharma - Fee Structure (Due: 24-Jul)']}
          onAdd={() => showToast('Entry added!')}
        />
      )}
    </div>
  );
}

// ===========================================================
// SEND SMS MODULE
// ===========================================================
export function SendSMSModule({ initialSubView = 'sms-send-student', onNavigateSubView }: { initialSubView?: SendSMSSubView; onNavigateSubView?: (sv: SendSMSSubView) => void }) {
  const [subView, setSubView] = useState<SendSMSSubView>(initialSubView);
  const [toast, setToast] = useState<string | null>(null);

  React.useEffect(() => { setSubView(initialSubView); }, [initialSubView]);
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const SMS_LOG = [
    { id: 'SMS001', sentTo: 'All Parents - Class 10-A', message: 'PTM scheduled for 25-Jul-2026 at 10:00 AM.', sentAt: '20-Jul-2026 09:15 AM', count: 42, status: 'Delivered' },
    { id: 'SMS002', sentTo: 'All Staff', message: 'Staff meeting tomorrow at 7:45 AM in Conference Hall.', sentAt: '19-Jul-2026 05:00 PM', count: 28, status: 'Delivered' },
    { id: 'SMS003', sentTo: 'Parents of Absentees - 19-Jul', message: 'Your ward was absent today. Please contact school.', sentAt: '19-Jul-2026 10:30 AM', count: 6, status: 'Delivered' },
  ];

  return (
    <div>
      {toast && <div style={{ position: 'fixed', bottom: 24, right: 24, backgroundColor: '#0f172a', color: '#fff', padding: '12px 20px', borderRadius: 8, zIndex: 9999, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 14px rgba(0,0,0,0.25)' }}><CheckCircle2 size={16} color="#38bdf8" />{toast}</div>}
      <div className="view-header">
        <div>
          <h2 className="view-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><MessageSquare size={22} color="#2563eb" /> SMS Communication Centre</h2>
          <span className="view-subtitle">Send bulk SMS to students, parents & staff with delivery tracking</span>
        </div>
      </div>

      {subView === 'sms-balance' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
          {[{ label: 'SMS Balance', value: '4,850 Credits', color: '#2563eb' }, { label: 'Used This Month', value: '1,150 SMS', color: '#dc2626' }, { label: 'Success Rate', value: '98.2%', color: '#16a34a' }].map(s => (
            <div key={s.label} className="erp-card" style={{ padding: 16, borderLeft: `4px solid ${s.color}`, margin: 0, textAlign: 'center' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b' }}>{s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.color, marginTop: 4 }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {subView === 'sms-log' && (
        <div>
          <h3 style={{ margin: '0 0 16px', fontWeight: 800 }}>SMS Delivery Log & History</h3>
          <div className="erp-card"><div className="table-container"><table className="erp-table">
            <thead><tr>
              {['ID', 'Sent To', 'Message Preview', 'Sent At', 'Count', 'Status'].map(h => <th key={h}>{h}</th>)}
            </tr></thead>
            <tbody>{SMS_LOG.map(s => (
              <tr key={s.id}>
                <td style={{ fontWeight: 800 }}>{s.id}</td>
                <td style={{ fontWeight: 700, color: '#2563eb' }}>{s.sentTo}</td>
                <td style={{ fontSize: 12, color: '#475569' }}>{s.message}</td>
                <td style={{ fontSize: 12 }}>{s.sentAt}</td>
                <td style={{ fontWeight: 800 }}>{s.count}</td>
                <td><span className="erp-badge badge-approved">{s.status}</span></td>
              </tr>
            ))}</tbody>
          </table></div></div>
        </div>
      )}

      {(subView === 'sms-send-student' || subView === 'sms-send-staff' || subView === 'sms-send-custom') && (
        <div className="erp-card">
          <div className="erp-card-header"><span className="erp-card-title">
            {subView === 'sms-send-student' ? 'Send SMS to Students / Parents' : subView === 'sms-send-staff' ? 'Send SMS to Staff Members' : 'Send Custom Bulk SMS'}
          </span></div>
          <form onSubmit={e => { e.preventDefault(); showToast('SMS sent successfully to all recipients!'); }} style={{ padding: 20 }}>
            <div className="form-grid">
              {subView === 'sms-send-student' && (<>
                <div className="form-group"><label>Class *</label><select><option>All Classes</option><option>Class 10</option><option>Class 12</option></select></div>
                <div className="form-group"><label>Section</label><select><option>All Sections</option><option>Section A</option><option>Section B</option></select></div>
              </>)}
              {subView === 'sms-send-staff' && (
                <div className="form-group"><label>Department *</label><select><option>All Departments</option><option>Teaching</option><option>Non-Teaching</option></select></div>
              )}
              <div className="form-group"><label>SMS Template</label><select><option>Custom Message</option><option>Fee Reminder</option><option>Attendance Alert</option><option>Exam Schedule</option><option>PTM Invite</option></select></div>
              <div className="form-group col-span-2">
                <label>SMS Message * (Max 160 chars)</label>
                <textarea required rows={3} maxLength={160} placeholder="Type your message here..." style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #e2e8f0' }} />
              </div>
            </div>
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: '#64748b' }}>Estimated recipients: ~42 contacts | SMS Credits needed: ~42</span>
              <button type="submit" className="erp-btn btn-primary"><Send size={14} /> Send SMS Now</button>
            </div>
          </form>
        </div>
      )}

      {(subView === 'sms-notice-board' || subView === 'sms-template') && (
        <SimpleConfigView
          title={subView === 'sms-notice-board' ? 'School Notice Board Announcements' : 'SMS DLT Template Manager'}
          items={subView === 'sms-notice-board' ? ['Annual Sports Day Date Announcement (Posted: 15-Jul)', 'PTM Schedule for Term 1 (Posted: 18-Jul)', 'Monsoon Holiday Notice (Posted: 20-Jul)'] : ['Fee Reminder: "Dear Parent, fee for [MONTH] is due. Amount: Rs.[AMOUNT]. Pay by [DATE]."', 'Attendance Alert: "Your ward [NAME] was absent on [DATE]. Contact school."', 'PTM Invite: "PTM scheduled on [DATE] at [TIME]. Please attend."', 'Exam Schedule: "Exam for [SUBJECT] on [DATE] at [TIME]. Bring admit card."']}
          onAdd={() => showToast('Saved!')}
        />
      )}
    </div>
  );
}

// ===========================================================
// PAYROLL MODULE
// ===========================================================
const PAYROLL_DATA = [
  { empId: 'STF001', name: 'Mr. Rahul Rathi', desig: 'Director', basic: 80000, hra: 32000, ta: 5000, pf: 9600, tds: 12000, gross: 117000, net: 95400 },
  { empId: 'STF002', name: 'Ms. Geeta Dang', desig: 'Principal', basic: 60000, hra: 24000, ta: 4000, pf: 7200, tds: 8000, gross: 88000, net: 72800 },
  { empId: 'STF004', name: 'Ms. Seema Solanki', desig: 'PGT Teacher', basic: 40000, hra: 16000, ta: 2000, pf: 4800, tds: 3000, gross: 58000, net: 50200 },
  { empId: 'STF005', name: 'Mr. Mohit Verma', desig: 'TGT Teacher', basic: 35000, hra: 14000, ta: 2000, pf: 4200, tds: 2500, gross: 51000, net: 44300 },
];

export function PayrollModule({ initialSubView = 'payroll-generate', onNavigateSubView }: { initialSubView?: PayrollSubView; onNavigateSubView?: (sv: PayrollSubView) => void }) {
  const [subView, setSubView] = useState<PayrollSubView>(initialSubView);
  const [toast, setToast] = useState<string | null>(null);

  React.useEffect(() => { setSubView(initialSubView); }, [initialSubView]);
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };
  const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;

  return (
    <div>
      {toast && <div style={{ position: 'fixed', bottom: 24, right: 24, backgroundColor: '#0f172a', color: '#fff', padding: '12px 20px', borderRadius: 8, zIndex: 9999, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 14px rgba(0,0,0,0.25)' }}><CheckCircle2 size={16} color="#38bdf8" />{toast}</div>}
      <div className="view-header">
        <div>
          <h2 className="view-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><IndianRupee size={22} color="#2563eb" /> Payroll & Salary Management</h2>
          <span className="view-subtitle">Staff salary generation, salary slips, PF/ESI deductions & advance management</span>
        </div>
      </div>

      {subView === 'payroll-salary-structure' && (
        <div className="erp-card">
          <div className="erp-card-header"><span className="erp-card-title">Salary Structure Configuration</span></div>
          <form onSubmit={e => { e.preventDefault(); showToast('Salary structure saved!'); }} style={{ padding: 20 }}>
            <div className="form-grid">
              <div className="form-group"><label>Staff Member *</label><select>{PAYROLL_DATA.map(p => <option key={p.empId}>{p.name} ({p.desig})</option>)}</select></div>
              <div className="form-group"><label>Basic Salary (₹) *</label><input type="number" defaultValue={40000} /></div>
              <div className="form-group"><label>HRA (%)</label><input type="number" defaultValue={40} /></div>
              <div className="form-group"><label>TA / DA (₹)</label><input type="number" defaultValue={2000} /></div>
              <div className="form-group"><label>PF Deduction (%)</label><input type="number" defaultValue={12} /></div>
              <div className="form-group"><label>TDS Deduction (₹)</label><input type="number" defaultValue={3000} /></div>
            </div>
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="erp-btn btn-primary"><Check size={14} /> Save Salary Structure</button>
            </div>
          </form>
        </div>
      )}

      {subView === 'payroll-generate' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h3 style={{ margin: 0, fontWeight: 800 }}>Monthly Payroll Register - July 2026</h3>
              <span style={{ fontSize: 12, color: '#64748b' }}>Total Payable: ₹{PAYROLL_DATA.reduce((s, p) => s + p.net, 0).toLocaleString('en-IN')} for {PAYROLL_DATA.length} staff</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => showToast('Payroll processed & bank transfer initiated!')} className="erp-btn btn-primary"><Check size={14} /> Process Payroll</button>
              <button onClick={() => showToast('Payroll report exported!')} className="erp-btn btn-outline"><Download size={14} /> Export</button>
            </div>
          </div>

          <div className="erp-card"><div className="table-container"><table className="erp-table">
            <thead><tr>
              {['Emp ID', 'Name', 'Designation', 'Basic', 'HRA', 'TA/DA', 'Gross Salary', 'PF', 'TDS', 'Net Payable'].map(h => <th key={h}>{h}</th>)}
            </tr></thead>
            <tbody>{PAYROLL_DATA.map(p => (
              <tr key={p.empId}>
                <td style={{ fontWeight: 800, color: '#dc2626' }}>{p.empId}</td>
                <td style={{ fontWeight: 800 }}>{p.name}</td>
                <td style={{ color: '#2563eb', fontWeight: 700 }}>{p.desig}</td>
                <td>{fmt(p.basic)}</td>
                <td>{fmt(p.hra)}</td>
                <td>{fmt(p.ta)}</td>
                <td style={{ fontWeight: 800 }}>{fmt(p.gross)}</td>
                <td style={{ color: '#dc2626' }}>{fmt(p.pf)}</td>
                <td style={{ color: '#dc2626' }}>{fmt(p.tds)}</td>
                <td style={{ fontWeight: 800, color: '#16a34a', fontSize: 14 }}>{fmt(p.net)}</td>
              </tr>
            ))}</tbody>
          </table></div></div>
        </div>
      )}

      {(subView === 'payroll-slip' || subView === 'payroll-pf-esi' || subView === 'payroll-advance' || subView === 'payroll-report') && (() => {
        let items: string[];
        if (subView === 'payroll-slip') items = PAYROLL_DATA.map(p => `${p.name} (${p.desig}) - Net: ${fmt(p.net)}`);
        else if (subView === 'payroll-pf-esi') items = PAYROLL_DATA.map(p => `${p.name}: PF Emp ${fmt(p.pf)} - Employer ${fmt(Math.round(p.basic * 0.12))}`);
        else if (subView === 'payroll-advance') items = ['STF004 - Ms. Seema Solanki - Rs.10,000 advance (Approved)', 'STF005 - Mr. Mohit Verma - Rs.5,000 advance (Pending)'];
        else items = ['July 2026: Gross Rs.3,14,000 - Net Rs.2,62,700', 'June 2026: Gross Rs.3,14,000 - Net Rs.2,62,700', 'May 2026: Gross Rs.3,10,000 - Net Rs.2,60,200'];
        const title = subView === 'payroll-slip' ? 'Salary Slip Generator' : subView === 'payroll-pf-esi' ? 'PF / ESI Contribution Register' : subView === 'payroll-advance' ? 'Staff Advance Salary Requests' : 'Payroll Summary Report';
        return <SimpleConfigView title={title} items={items} onAdd={() => showToast('Action performed!')} />;
      })()}
    </div>
  );
}

// ===========================================================
// LIBRARY MODULE
// ===========================================================
const BOOKS = [
  { id: 'BK001', title: 'Mathematics NCERT Class 10', author: 'NCERT', publisher: 'NCERT Publications', isbn: '978-81-7450-845-0', category: 'Textbook', copies: 25, available: 18, rack: 'A-1' },
  { id: 'BK002', title: 'Science NCERT Class 9', author: 'NCERT', publisher: 'NCERT Publications', isbn: '978-81-7450-844-3', category: 'Textbook', copies: 20, available: 15, rack: 'A-2' },
  { id: 'BK003', title: 'Wings of Fire', author: 'Dr. A.P.J. Abdul Kalam', publisher: 'Universities Press', isbn: '978-81-7371-146-6', category: 'Biography', copies: 5, available: 3, rack: 'B-3' },
  { id: 'BK004', title: 'The Discovery of India', author: 'Jawaharlal Nehru', publisher: 'Penguin', isbn: '978-0-14-303353-2', category: 'History', copies: 3, available: 0, rack: 'B-5' },
];

const ISSUED_BOOKS = [
  { issueId: 'IS001', studentName: 'Aarav Sharma', rollNo: '101', class: '10-A', book: 'Wings of Fire', issueDate: '2026-07-10', dueDate: '2026-07-24', status: 'Issued' },
  { issueId: 'IS002', studentName: 'Aditi Verma', rollNo: '102', class: '10-A', book: 'The Discovery of India', issueDate: '2026-07-12', dueDate: '2026-07-26', status: 'Overdue' },
];

export function LibraryModule({ initialSubView = 'lib-book-list', onNavigateSubView }: { initialSubView?: LibrarySubView; onNavigateSubView?: (sv: LibrarySubView) => void }) {
  const [subView, setSubView] = useState<LibrarySubView>(initialSubView);
  const [toast, setToast] = useState<string | null>(null);

  React.useEffect(() => { setSubView(initialSubView); }, [initialSubView]);
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  return (
    <div>
      {toast && <div style={{ position: 'fixed', bottom: 24, right: 24, backgroundColor: '#0f172a', color: '#fff', padding: '12px 20px', borderRadius: 8, zIndex: 9999, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 14px rgba(0,0,0,0.25)' }}><CheckCircle2 size={16} color="#38bdf8" />{toast}</div>}
      <div className="view-header">
        <div>
          <h2 className="view-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><BookOpen size={22} color="#2563eb" /> Library & Book Management</h2>
          <span className="view-subtitle">Book catalog, issue & return management, overdue tracking & member registration</span>
        </div>
      </div>

      {subView === 'lib-book-list' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontWeight: 800 }}>Library Book Catalog ({BOOKS.length} Titles, {BOOKS.reduce((s, b) => s + b.copies, 0)} Total Copies)</h3>
            <button onClick={() => showToast('Navigate to Add Book to add')} className="erp-btn btn-primary"><PlusCircle size={14} /> Add New Book</button>
          </div>
          <div className="erp-card"><div className="table-container"><table className="erp-table">
            <thead><tr>
              {['Book ID', 'Title', 'Author', 'Publisher', 'Category', 'ISBN', 'Copies', 'Available', 'Rack', 'Action'].map(h => <th key={h}>{h}</th>)}
            </tr></thead>
            <tbody>{BOOKS.map(b => (
              <tr key={b.id}>
                <td style={{ fontWeight: 800 }}>{b.id}</td>
                <td style={{ fontWeight: 800, color: '#0f172a' }}>{b.title}</td>
                <td>{b.author}</td>
                <td style={{ fontSize: 12 }}>{b.publisher}</td>
                <td><span style={{ padding: '2px 8px', backgroundColor: '#f0f9ff', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>{b.category}</span></td>
                <td style={{ fontFamily: 'monospace', fontSize: 11 }}>{b.isbn}</td>
                <td style={{ fontWeight: 800 }}>{b.copies}</td>
                <td style={{ fontWeight: 800, color: b.available === 0 ? '#dc2626' : '#16a34a' }}>{b.available}</td>
                <td style={{ color: '#2563eb', fontWeight: 700 }}>{b.rack}</td>
                <td><button onClick={() => showToast('Book issue form opened')} style={{ padding: '4px 10px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>Issue</button></td>
              </tr>
            ))}</tbody>
          </table></div></div>
        </div>
      )}

      {subView === 'lib-add-book' && (
        <div className="erp-card">
          <div className="erp-card-header"><span className="erp-card-title">Add Book to Library Catalog</span></div>
          <form onSubmit={e => { e.preventDefault(); showToast('Book added to library catalog!'); }} style={{ padding: 20 }}>
            <div className="form-grid">
              <div className="form-group col-span-2"><label>Book Title *</label><input type="text" required placeholder="Full book title" /></div>
              <div className="form-group"><label>Author *</label><input type="text" required placeholder="Author name" /></div>
              <div className="form-group"><label>Publisher *</label><input type="text" required placeholder="Publisher name" /></div>
              <div className="form-group"><label>ISBN Number</label><input type="text" placeholder="ISBN-13 barcode" /></div>
              <div className="form-group"><label>Category *</label><select><option>Textbook</option><option>Biography</option><option>Fiction</option><option>Non-Fiction</option><option>Reference</option><option>Magazine</option></select></div>
              <div className="form-group"><label>Number of Copies *</label><input type="number" required defaultValue={5} /></div>
              <div className="form-group"><label>Price per Copy (₹)</label><input type="number" defaultValue={350} /></div>
              <div className="form-group"><label>Rack / Shelf Location *</label><input type="text" placeholder="e.g. A-3, B-1" /></div>
              <div className="form-group"><label>Purchased Date</label><input type="date" /></div>
            </div>
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="erp-btn btn-primary"><Check size={14} /> Add to Catalog</button>
            </div>
          </form>
        </div>
      )}

      {(subView === 'lib-issue-book' || subView === 'lib-return-book' || subView === 'lib-due-books') && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontWeight: 800 }}>
              {subView === 'lib-issue-book' ? 'Issue Book to Student/Staff' : subView === 'lib-return-book' ? 'Book Return Console' : 'Overdue Books & Fine Register'}
            </h3>
            {subView === 'lib-issue-book' && <button onClick={() => showToast('Book issued successfully!')} className="erp-btn btn-primary"><Check size={14} /> Issue Book</button>}
          </div>
          <div className="erp-card"><div className="table-container"><table className="erp-table">
            <thead><tr>
              {['Issue ID', 'Student Name', 'Roll No', 'Class', 'Book Title', 'Issue Date', 'Due Date', 'Status', 'Action'].map(h => <th key={h}>{h}</th>)}
            </tr></thead>
            <tbody>{ISSUED_BOOKS.map(i => (
              <tr key={i.issueId}>
                <td style={{ fontWeight: 800 }}>{i.issueId}</td>
                <td style={{ fontWeight: 800 }}>{i.studentName}</td>
                <td>{i.rollNo}</td>
                <td style={{ color: '#2563eb', fontWeight: 700 }}>{i.class}</td>
                <td style={{ fontWeight: 800 }}>{i.book}</td>
                <td>{i.issueDate}</td>
                <td style={{ fontWeight: 800, color: i.status === 'Overdue' ? '#dc2626' : '#16a34a' }}>{i.dueDate}</td>
                <td><span className={`erp-badge ${i.status === 'Issued' ? 'badge-approved' : 'badge-rejected'}`}>{i.status}</span></td>
                <td>
                  {subView !== 'lib-issue-book' && <button onClick={() => showToast('Book returned successfully!')} style={{ padding: '4px 10px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>Return</button>}
                </td>
              </tr>
            ))}</tbody>
          </table></div></div>
        </div>
      )}

      {(subView === 'lib-member' || subView === 'lib-report') && (
        <SimpleConfigView
          title={subView === 'lib-member' ? 'Library Member Registration' : 'Library Usage & Circulation Report'}
          items={subView === 'lib-member' ? ['Aarav Sharma (Class 10-A) - Member Since: 01-Jul-2026', 'Aditi Verma (Class 10-A) - Member Since: 01-Jul-2026', 'Ms. Seema Solanki (Staff) - Member Since: 01-Apr-2022'] : ['Total Books: 53 Titles - 285 Copies', 'Books Issued This Month: 42', 'Books Returned This Month: 38', 'Books Overdue: 4', 'Total Fine Collected: Rs.240']}
          onAdd={() => showToast('Member registered!')}
        />
      )}
    </div>
  );
}

// ===========================================================
// INVENTORY MODULE
// ===========================================================
const INVENTORY_ITEMS = [
  { id: 'INV001', name: 'Whiteboard Marker Pens (Box of 10)', category: 'Stationery', quantity: 45, unit: 'Boxes', store: 'Main Store A', supplier: 'Standard Stationers', reorderLevel: 10 },
  { id: 'INV002', name: 'A4 Printing Paper Reams (500 sheets)', category: 'Stationery', quantity: 120, unit: 'Reams', store: 'Main Store A', supplier: 'Paper Mill Co.', reorderLevel: 25 },
  { id: 'INV003', name: 'Science Lab Beakers 500ml', category: 'Lab Equipment', quantity: 18, unit: 'Pcs', store: 'Science Lab Store', supplier: 'Lab Tech India', reorderLevel: 5 },
  { id: 'INV004', name: 'Basketball Official Size 7', category: 'Sports Goods', quantity: 12, unit: 'Pcs', store: 'Sports Store', supplier: 'Nike Sports India', reorderLevel: 4 },
];

export function InventoryModule({ initialSubView = 'inv-item-list', onNavigateSubView }: { initialSubView?: InventorySubView; onNavigateSubView?: (sv: InventorySubView) => void }) {
  const [subView, setSubView] = useState<InventorySubView>(initialSubView);
  const [toast, setToast] = useState<string | null>(null);

  React.useEffect(() => { setSubView(initialSubView); }, [initialSubView]);
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  return (
    <div>
      {toast && <div style={{ position: 'fixed', bottom: 24, right: 24, backgroundColor: '#0f172a', color: '#fff', padding: '12px 20px', borderRadius: 8, zIndex: 9999, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 14px rgba(0,0,0,0.25)' }}><CheckCircle2 size={16} color="#38bdf8" />{toast}</div>}
      <div className="view-header">
        <div>
          <h2 className="view-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Package size={22} color="#2563eb" /> Inventory & Stock Management</h2>
          <span className="view-subtitle">Stock item catalog, stock entries, department issuing, suppliers & store rooms</span>
        </div>
      </div>

      {subView === 'inv-item-list' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontWeight: 800 }}>Inventory Stock Register ({INVENTORY_ITEMS.length} Items)</h3>
            <button onClick={() => showToast('Stock entry form opened')} className="erp-btn btn-primary"><PlusCircle size={14} /> Add Stock</button>
          </div>
          <div className="erp-card"><div className="table-container"><table className="erp-table">
            <thead><tr>
              {['Item Code', 'Item Name', 'Category', 'In Stock', 'Unit', 'Store Room', 'Supplier', 'Status'].map(h => <th key={h}>{h}</th>)}
            </tr></thead>
            <tbody>{INVENTORY_ITEMS.map(item => (
              <tr key={item.id}>
                <td style={{ fontWeight: 800 }}>{item.id}</td>
                <td style={{ fontWeight: 800, color: '#0f172a' }}>{item.name}</td>
                <td><span style={{ padding: '2px 8px', backgroundColor: '#f0f9ff', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>{item.category}</span></td>
                <td style={{ fontWeight: 800, color: item.quantity <= item.reorderLevel ? '#dc2626' : '#16a34a' }}>{item.quantity}</td>
                <td>{item.unit}</td>
                <td>{item.store}</td>
                <td style={{ fontSize: 12 }}>{item.supplier}</td>
                <td><span className={`erp-badge ${item.quantity <= item.reorderLevel ? 'badge-rejected' : 'badge-approved'}`}>{item.quantity <= item.reorderLevel ? 'Low Stock' : 'In Stock'}</span></td>
              </tr>
            ))}</tbody>
          </table></div></div>
        </div>
      )}

      {subView === 'inv-add-stock' && (
        <div className="erp-card">
          <div className="erp-card-header"><span className="erp-card-title">Add Stock Purchase Entry</span></div>
          <form onSubmit={e => { e.preventDefault(); showToast('Stock purchase recorded!'); }} style={{ padding: 20 }}>
            <div className="form-grid">
              <div className="form-group"><label>Item Category *</label><select><option>Stationery</option><option>Lab Equipment</option><option>Sports Goods</option><option>Furniture</option><option>Uniform</option></select></div>
              <div className="form-group"><label>Item Name *</label><input type="text" required placeholder="Item description" /></div>
              <div className="form-group"><label>Store Room Location *</label><select><option>Main Store A</option><option>Science Lab Store</option><option>Sports Store</option></select></div>
              <div className="form-group"><label>Supplier / Vendor *</label><select><option>Standard Stationers</option><option>Paper Mill Co.</option><option>Lab Tech India</option></select></div>
              <div className="form-group"><label>Quantity Added *</label><input type="number" required defaultValue={10} /></div>
              <div className="form-group"><label>Unit Purchase Price (₹)</label><input type="number" defaultValue={250} /></div>
              <div className="form-group"><label>Purchase Bill No.</label><input type="text" placeholder="Bill / Invoice #" /></div>
              <div className="form-group"><label>Purchase Date</label><input type="date" defaultValue={new Date().toISOString().split('T')[0]} /></div>
            </div>
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="erp-btn btn-primary"><Check size={14} /> Save Stock Entry</button>
            </div>
          </form>
        </div>
      )}

      {(subView === 'inv-issue-item' || subView === 'inv-category' || subView === 'inv-supplier' || subView === 'inv-store' || subView === 'inv-report') && (
        <SimpleConfigView
          title={subView === 'inv-issue-item' ? 'Issue Inventory Item to Staff/Dept' : subView === 'inv-category' ? 'Item Categories Setup' : subView === 'inv-supplier' ? 'Vendors & Suppliers Directory' : subView === 'inv-store' ? 'Store Rooms & Warehouse Setup' : 'Stock Audit & Consumption Report'}
          items={subView === 'inv-issue-item' ? ['Issue 5 Whiteboard Markers to Ms. Seema Solanki (20-Jul)', 'Issue 2 Reams Paper to Administration (18-Jul)'] : subView === 'inv-category' ? ['Stationery & Office Supplies', 'Science Laboratory Chemicals & Glassware', 'Sports Goods & Fitness Equipment', 'Classroom Furniture & Desks'] : subView === 'inv-supplier' ? ['Standard Stationers Ltd. - Ph: 9876500011', 'Paper Mill Supply Co. - Ph: 9876500022', 'Lab Tech Scientific India - Ph: 9876500033'] : subView === 'inv-store' ? ['Main Store A (Admin Block Basement)', 'Science Lab Store (3rd Floor Block B)', 'Sports Store (Gymnasium Ground)'] : ['Total Stock Value: Rs.4,85,000', 'Items Issued This Month: 142 Pcs', 'Low Stock Alert Items: 2 Items']}
          onAdd={() => showToast('Saved!')}
        />
      )}
    </div>
  );
}

// ===========================================================
// TRANSPORT FLEET MODULE
// ===========================================================
const ROUTES = [
  { id: 'RT001', name: 'Route 1 - City Centre to School', vehicle: 'BUS-01 (UP-32-AB-1234)', driver: 'Mr. Ram Singh', helper: 'Mr. Shyam', capacity: 52, allocated: 48, fee: 1500 },
  { id: 'RT002', name: 'Route 2 - Gomti Nagar Express', vehicle: 'BUS-02 (UP-32-AB-5678)', driver: 'Mr. Satish Kumar', helper: 'Mr. Pappu', capacity: 52, allocated: 50, fee: 1800 },
  { id: 'RT003', name: 'Route 3 - Aliganj & Mahanagar Route', vehicle: 'BUS-03 (UP-32-CD-9012)', driver: 'Mr. Dinesh Lal', helper: 'Mr. Guddu', capacity: 40, allocated: 38, fee: 1600 },
];

export function TransportModule({ initialSubView = 'trans-route-list', onNavigateSubView }: { initialSubView?: TransportSubView; onNavigateSubView?: (sv: TransportSubView) => void }) {
  const [subView, setSubView] = useState<TransportSubView>(initialSubView);
  const [toast, setToast] = useState<string | null>(null);

  React.useEffect(() => { setSubView(initialSubView); }, [initialSubView]);
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  return (
    <div>
      {toast && <div style={{ position: 'fixed', bottom: 24, right: 24, backgroundColor: '#0f172a', color: '#fff', padding: '12px 20px', borderRadius: 8, zIndex: 9999, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 14px rgba(0,0,0,0.25)' }}><CheckCircle2 size={16} color="#38bdf8" />{toast}</div>}
      <div className="view-header">
        <div>
          <h2 className="view-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Bus size={22} color="#2563eb" /> Transport Fleet Management</h2>
          <span className="view-subtitle">Routes, bus fleet, vehicle fitness/insurance, pick-up points & student transport fee</span>
        </div>
      </div>

      {subView === 'trans-route-list' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontWeight: 800 }}>Transport Routes Registry ({ROUTES.length} Routes)</h3>
            <button onClick={() => showToast('Add Route form opened')} className="erp-btn btn-primary"><PlusCircle size={14} /> Add Route</button>
          </div>
          <div className="erp-card"><div className="table-container"><table className="erp-table">
            <thead><tr>
              {['Route Code', 'Route Title', 'Vehicle Assigned', 'Driver Name', 'Capacity', 'Allocated', 'Monthly Fee (₹)'].map(h => <th key={h}>{h}</th>)}
            </tr></thead>
            <tbody>{ROUTES.map(r => (
              <tr key={r.id}>
                <td style={{ fontWeight: 800, color: '#dc2626' }}>{r.id}</td>
                <td style={{ fontWeight: 800 }}>{r.name}</td>
                <td style={{ fontWeight: 700, color: '#2563eb' }}>{r.vehicle}</td>
                <td>{r.driver}</td>
                <td style={{ fontWeight: 800 }}>{r.capacity} Seats</td>
                <td style={{ fontWeight: 800, color: r.allocated >= r.capacity ? '#dc2626' : '#16a34a' }}>{r.allocated} Students</td>
                <td style={{ fontWeight: 800 }}>₹{r.fee.toLocaleString('en-IN')}</td>
              </tr>
            ))}</tbody>
          </table></div></div>
        </div>
      )}

      {(subView === 'trans-add-route' || subView === 'trans-vehicle-list' || subView === 'trans-assign-student' || subView === 'trans-driver-staff' || subView === 'trans-fee-report') && (
        <SimpleConfigView
          title={subView === 'trans-add-route' ? 'Create New Transport Route' : subView === 'trans-vehicle-list' ? 'Bus & Vehicle Fleet Master' : subView === 'trans-assign-student' ? 'Student Transport Allocation' : subView === 'trans-driver-staff' ? 'Driver & Helper Staff Registry' : 'Transport Fee Collection Report'}
          items={subView === 'trans-vehicle-list' ? ['BUS-01 (UP-32-AB-1234) - Fitness Valid till Oct 2027', 'BUS-02 (UP-32-AB-5678) - Fitness Valid till Dec 2027', 'BUS-03 (UP-32-CD-9012) - Insurance Valid till Nov 2026'] : subView === 'trans-assign-student' ? ['Aarav Sharma (Class 10-A) -> Route 1 (City Centre)', 'Aditi Verma (Class 10-A) -> Route 2 (Gomti Nagar)'] : subView === 'trans-driver-staff' ? ['Mr. Ram Singh (Driver - Heavy DL #DL-109283)', 'Mr. Satish Kumar (Driver - Heavy DL #DL-482019)'] : ['July 2026 Collection: Rs.1,84,000 | Pending: Rs.18,000', 'Total Students Using Transport: 136 Students']}
          onAdd={() => showToast('Saved!')}
        />
      )}
    </div>
  );
}

// ===========================================================
// HOSTEL MODULE
// ===========================================================
const ROOMS = [
  { id: 'RM101', building: 'Boys Hostel A', floor: '1st Floor', roomNo: '101', roomType: '2-Seater Non-AC', capacity: 2, occupied: 2, monthlyFee: 4500, status: 'Full' },
  { id: 'RM102', building: 'Boys Hostel A', floor: '1st Floor', roomNo: '102', roomType: '3-Seater AC', capacity: 3, occupied: 2, monthlyFee: 6000, status: 'Available' },
  { id: 'RM201', building: 'Girls Hostel B', floor: '2nd Floor', roomNo: '201', roomType: '2-Seater AC', capacity: 2, occupied: 2, monthlyFee: 6500, status: 'Full' },
];

export function HostelModule({ initialSubView = 'hostel-room-list', onNavigateSubView }: { initialSubView?: HostelSubView; onNavigateSubView?: (sv: HostelSubView) => void }) {
  const [subView, setSubView] = useState<HostelSubView>(initialSubView);
  const [toast, setToast] = useState<string | null>(null);

  React.useEffect(() => { setSubView(initialSubView); }, [initialSubView]);
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  return (
    <div>
      {toast && <div style={{ position: 'fixed', bottom: 24, right: 24, backgroundColor: '#0f172a', color: '#fff', padding: '12px 20px', borderRadius: 8, zIndex: 9999, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 14px rgba(0,0,0,0.25)' }}><CheckCircle2 size={16} color="#38bdf8" />{toast}</div>}
      <div className="view-header">
        <div>
          <h2 className="view-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Building size={22} color="#2563eb" /> Hostel & Dormitory Management</h2>
          <span className="view-subtitle">Hostel rooms, room types, room allotment, hostel fees & mess reports</span>
        </div>
      </div>

      {subView === 'hostel-room-list' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontWeight: 800 }}>Hostel Rooms Occupancy Grid ({ROOMS.length} Rooms)</h3>
            <button onClick={() => showToast('Add room modal opened')} className="erp-btn btn-primary"><PlusCircle size={14} /> Add Room</button>
          </div>
          <div className="erp-card"><div className="table-container"><table className="erp-table">
            <thead><tr>
              {['Room Code', 'Hostel Building', 'Floor', 'Room No', 'Room Type', 'Capacity', 'Occupied', 'Fee (₹)', 'Status'].map(h => <th key={h}>{h}</th>)}
            </tr></thead>
            <tbody>{ROOMS.map(r => (
              <tr key={r.id}>
                <td style={{ fontWeight: 800, color: '#dc2626' }}>{r.id}</td>
                <td style={{ fontWeight: 800 }}>{r.building}</td>
                <td>{r.floor}</td>
                <td style={{ fontWeight: 800, color: '#2563eb' }}>{r.roomNo}</td>
                <td><span style={{ padding: '2px 8px', backgroundColor: '#f0f9ff', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>{r.roomType}</span></td>
                <td style={{ fontWeight: 800 }}>{r.capacity} Beds</td>
                <td style={{ fontWeight: 800, color: r.occupied >= r.capacity ? '#dc2626' : '#16a34a' }}>{r.occupied} Beds</td>
                <td style={{ fontWeight: 800 }}>₹{r.monthlyFee.toLocaleString('en-IN')}</td>
                <td><span className={`erp-badge ${r.status === 'Full' ? 'badge-rejected' : 'badge-approved'}`}>{r.status}</span></td>
              </tr>
            ))}</tbody>
          </table></div></div>
        </div>
      )}

      {(subView === 'hostel-add-room' || subView === 'hostel-room-type' || subView === 'hostel-allotment' || subView === 'hostel-fees' || subView === 'hostel-report') && (
        <SimpleConfigView
          title={subView === 'hostel-add-room' ? 'Add Hostel Room' : subView === 'hostel-room-type' ? 'Room Types & Tariff Setup' : subView === 'hostel-allotment' ? 'Student Room Allotment Register' : subView === 'hostel-fees' ? 'Hostel & Mess Fee Register' : 'Hostel Occupancy & Warden Audit'}
          items={subView === 'hostel-room-type' ? ['2-Seater Non-AC - Rs.4,500/month', '3-Seater AC - Rs.6,000/month', '2-Seater AC Premium - Rs.6,500/month'] : subView === 'hostel-allotment' ? ['Aarav Sharma (Class 10-A) -> Boys Hostel A - Room 101 Bed 1', 'Bhavya Joshi (Class 9-B) -> Boys Hostel A - Room 102 Bed 2'] : ['July 2026 Hostel Fee Collection: Rs.1,42,000', 'Total Boarder Students: 24 Students', 'Warden Night Attendance Audit: 100% Verified']}
          onAdd={() => showToast('Saved!')}
        />
      )}
    </div>
  );
}

// ===========================================================
// E-CONTENT & DIGITAL LEARNING MODULE
// ===========================================================
export function EContentModule({ initialSubView = 'econtent-list', onNavigateSubView }: { initialSubView?: EContentSubView; onNavigateSubView?: (sv: EContentSubView) => void }) {
  const [subView, setSubView] = useState<EContentSubView>(initialSubView);
  const [toast, setToast] = useState<string | null>(null);

  React.useEffect(() => { setSubView(initialSubView); }, [initialSubView]);
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const DIGITAL_ASSETS = [
    { id: 'EC001', title: 'Chapter 5 Polynomials Video Lecture', class: 'Class 10-A', subject: 'Mathematics', type: 'Video Lecture', uploadedBy: 'Mr. Mohit Verma', date: '2026-07-15' },
    { id: 'EC002', title: 'Laws of Motion NCERT Notes PDF', class: 'Class 12-A', subject: 'Physics', type: 'PDF Document', uploadedBy: 'Ms. Mona Arora', date: '2026-07-18' },
    { id: 'EC003', title: 'English Grammar Tenses Assignment Sheet', class: 'Class 9-B', subject: 'English', type: 'Assignment', uploadedBy: 'Ms. Seema Solanki', date: '2026-07-19' },
  ];

  return (
    <div>
      {toast && <div style={{ position: 'fixed', bottom: 24, right: 24, backgroundColor: '#0f172a', color: '#fff', padding: '12px 20px', borderRadius: 8, zIndex: 9999, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 14px rgba(0,0,0,0.25)' }}><CheckCircle2 size={16} color="#38bdf8" />{toast}</div>}
      <div className="view-header">
        <div>
          <h2 className="view-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Video size={22} color="#2563eb" /> E-Learning & Digital Content</h2>
          <span className="view-subtitle">Video lectures, syllabus documents, PDF notes & online homework assignments</span>
        </div>
      </div>

      {subView === 'econtent-add' && (
        <div className="erp-card">
          <div className="erp-card-header"><span className="erp-card-title">Upload E-Learning Content / Video Lecture</span></div>
          <form onSubmit={e => { e.preventDefault(); showToast('E-content uploaded to student portal!'); }} style={{ padding: 20 }}>
            <div className="form-grid">
              <div className="form-group"><label>Class *</label><select><option>Class 10-A</option><option>Class 12-A</option><option>Class 9-B</option></select></div>
              <div className="form-group"><label>Subject *</label><select><option>Mathematics</option><option>Physics</option><option>English</option><option>Chemistry</option></select></div>
              <div className="form-group col-span-2"><label>Content Title *</label><input type="text" required placeholder="e.g. Chapter 5 Video Lecture Part 1" /></div>
              <div className="form-group"><label>Content Type *</label><select><option>Video Lecture (YouTube/Drive)</option><option>PDF Notes Document</option><option>Assignment WorkSheet</option><option>Audio Podcast</option></select></div>
              <div className="form-group"><label>Video URL / File Link *</label><input type="url" required placeholder="https://..." /></div>
              <div className="form-group col-span-2"><label>Description / Instructions</label><textarea rows={3} placeholder="Brief summary for students..." style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #e2e8f0' }} /></div>
            </div>
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="erp-btn btn-primary"><Upload size={14} /> Upload Content</button>
            </div>
          </form>
        </div>
      )}

      {subView === 'econtent-list' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontWeight: 800 }}>Digital Learning Assets Library ({DIGITAL_ASSETS.length} Files)</h3>
            <button onClick={() => { setSubView('econtent-add'); onNavigateSubView?.('econtent-add'); }} className="erp-btn btn-primary"><PlusCircle size={14} /> Upload New</button>
          </div>
          <div className="erp-card"><div className="table-container"><table className="erp-table">
            <thead><tr>
              {['Asset Code', 'Title', 'Class', 'Subject', 'Type', 'Uploaded By', 'Date', 'Action'].map(h => <th key={h}>{h}</th>)}
            </tr></thead>
            <tbody>{DIGITAL_ASSETS.map(a => (
              <tr key={a.id}>
                <td style={{ fontWeight: 800 }}>{a.id}</td>
                <td style={{ fontWeight: 800, color: '#0f172a' }}>{a.title}</td>
                <td style={{ color: '#2563eb', fontWeight: 700 }}>{a.class}</td>
                <td style={{ fontWeight: 700 }}>{a.subject}</td>
                <td><span style={{ padding: '2px 8px', backgroundColor: '#f0f9ff', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>{a.type}</span></td>
                <td>{a.uploadedBy}</td>
                <td>{a.date}</td>
                <td><button onClick={() => showToast('Opening digital asset...')} style={{ padding: '4px 10px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>View</button></td>
              </tr>
            ))}</tbody>
          </table></div></div>
        </div>
      )}

      {(subView === 'econtent-homework' || subView === 'econtent-exam') && (
        <SimpleConfigView
          title={subView === 'econtent-homework' ? 'Online Homework Upload & Review' : 'Online Quiz & MCQ Test Portal'}
          items={subView === 'econtent-homework' ? ['Class 10-A Maths Homework - 38/42 Submitted', 'Class 12-A Physics Numericals - 32/35 Submitted'] : ['Weekly Quiz #4 - Mathematics (Active)', 'Physics Term 1 Mock MCQ Test (Completed)']}
          onAdd={() => showToast('Saved!')}
        />
      )}
    </div>
  );
}

// ===========================================================
// MASTER SETTINGS MODULE
// ===========================================================
export function MasterModule({ initialSubView = 'master-class', onNavigateSubView }: { initialSubView?: MasterSubView; onNavigateSubView?: (sv: MasterSubView) => void }) {
  const [subView, setSubView] = useState<MasterSubView>(initialSubView);
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Academic Session Form Fields
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [sessionName, setSessionName] = useState('');
  const [sessionStart, setSessionStart] = useState('');
  const [sessionEnd, setSessionEnd] = useState('');
  const [sessionIsCurrent, setSessionIsCurrent] = useState(false);

  const schoolId = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb01';

  React.useEffect(() => { setSubView(initialSubView); }, [initialSubView]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const isDynamic = ['master-class', 'master-section', 'master-caste', 'master-house', 'master-category', 'master-session'].includes(subView);

  const fetchSessions = async () => {
    try {
      const res = await studentService.getAcademicYears(schoolId);
      const list = Array.isArray(res) ? res : ((res as any)?.results || []);
      setSessions(list);
      const current = list.find((s: any) => s.is_current);
      if (current) {
        setSelectedSessionId(String(current.id));
      } else if (list.length > 0) {
        setSelectedSessionId(String(list[0].id));
      }
    } catch (err) {
      console.error('Failed to load academic years:', err);
    }
  };

  const fetchDynamicItems = async () => {
    setLoading(true);
    try {
      if (subView === 'master-class') {
        const res = await studentService.getClasses({ limit: 100 });
        const list = Array.isArray(res) ? res : ((res as any)?.results || []);
        setItems(list);
      } else if (subView === 'master-section') {
        const res = await studentService.getSections({ limit: 100 });
        const list = Array.isArray(res) ? res : ((res as any)?.results || []);
        setItems(list);
      } else if (subView === 'master-caste') {
        const res = await studentService.getCastes({ limit: 100 });
        const list = Array.isArray(res) ? res : ((res as any)?.results || []);
        setItems(list.map((caste: any) => caste.caste_name || caste.name || ''));
      } else if (subView === 'master-house') {
        const res = await studentService.getHouses({ limit: 100 });
        const list = Array.isArray(res) ? res : ((res as any)?.results || []);
        setItems(list.map((house: any) => house.house_name || house.name || ''));
      } else if (subView === 'master-category') {
        const res = await studentService.getCategories({ limit: 100 });
        const list = Array.isArray(res) ? res : ((res as any)?.results || []);
        setItems(list.map((cat: any) => cat.name || ''));
      } else if (subView === 'master-session') {
        const res = await studentService.getAcademicYears(schoolId);
        const list = Array.isArray(res) ? res : ((res as any)?.results || []);
        setItems(list);
      }
    } catch (err: any) {
      console.error('Failed to load master data:', err);
      showToast('Error loading master data from backend');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    if (!isDynamic) {
      // Mock mode
      setItems(prev => [...prev, newItemName]);
      showToast('New entry added (mock mode)!');
      setNewItemName('');
      setShowForm(false);
      return;
    }

    try {
      if (subView === 'master-class') {
        const CLASS_MAPPING: Record<string, string> = {
          'nursery': 'NUR', 'nur': 'NUR',
          'lkg': 'LKG',
          'ukg': 'UKG',
          'play group': 'PLAY', 'playgroup': 'PLAY', 'play': 'PLAY',
          'class 1': 'I', '1': 'I', 'i': 'I',
          'class 2': 'II', '2': 'II', 'ii': 'II',
          'class 3': 'III', '3': 'III', 'iii': 'III',
          'class 4': 'IV', '4': 'IV', 'iv': 'IV',
          'class 5': 'V', '5': 'V', 'v': 'V',
          'class 6': 'VI', '6': 'VI', 'vi': 'VI',
          'class 7': 'VII', '7': 'VII', 'vii': 'VII',
          'class 8': 'VIII', '8': 'VIII', 'viii': 'VIII',
          'class 9': 'IX', '9': 'IX', 'ix': 'IX',
          'class 10': 'X', '10': 'X', 'x': 'X',
          'class 11': 'XI', '11': 'XI', 'xi': 'XI',
          'class 12': 'XII', '12': 'XII', 'xii': 'XII'
        };
        const normalized = CLASS_MAPPING[newItemName.toLowerCase().trim()] || newItemName;
        await studentService.createClass({ 
          admission_class: normalized,
          academic_year: selectedSessionId ? Number(selectedSessionId) : undefined
        });
      } else if (subView === 'master-section') {
        const normalized = newItemName.replace(/section/i, '').trim().toUpperCase();
        await studentService.createSection({ 
          section: normalized,
          academic_year: selectedSessionId ? Number(selectedSessionId) : undefined
        });
      } else if (subView === 'master-caste') {
        await studentService.createCaste({ caste_name: newItemName });
      } else if (subView === 'master-house') {
        await studentService.createHouse({ house_name: newItemName });
      } else if (subView === 'master-category') {
        await studentService.createCategory({ name: newItemName });
      }
      showToast('New entry saved to backend database!');
      setNewItemName('');
      setShowForm(false);
      fetchDynamicItems();
    } catch (err: any) {
      console.error('Failed to save master data:', err);
      showToast(`Save failed: ${err.message || 'Error'}`);
    }
  };

  const handleAddSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionName.trim() || !sessionStart || !sessionEnd) return;
    try {
      await studentService.createAcademicYear(schoolId, {
        year: sessionName,
        start_date: sessionStart,
        end_date: sessionEnd,
        is_current: sessionIsCurrent
      });
      showToast('New academic session saved successfully!');
      setSessionName('');
      setSessionStart('');
      setSessionEnd('');
      setSessionIsCurrent(false);
      setShowForm(false);
      fetchDynamicItems();
    } catch (err: any) {
      console.error('Failed to save academic session:', err);
      showToast(`Save failed: ${err.message || 'Error'}`);
    }
  };

  const handleSetCurrentSession = async (yearId: number) => {
    try {
      await studentService.setCurrentAcademicYear(schoolId, yearId);
      showToast('Session set as current active!');
      fetchDynamicItems();
    } catch (err: any) {
      console.error('Failed to set active year:', err);
      showToast('Failed to change current session.');
    }
  };

  const staticMasterItems: Record<MasterSubView, string[]> = {
    'master-class': [],
    'master-section': [],
    'master-caste': [],
    'master-house': [],
    'master-category': [],
    'master-session': [],
    'master-subject': ['English', 'Mathematics', 'Science', 'Social Science', 'Hindi', 'Computer Science', 'Physical Education', 'Sanskrit', 'Drawing', 'Music'],
    'master-religion': ['Hinduism', 'Islam', 'Christianity', 'Sikhism', 'Buddhism', 'Jainism', 'Others'],
    'master-id-card': ['Student ID Card Template v1 (Current)', 'Staff ID Card Template v2 (Current)', 'Visitor Pass Template v1'],
    'master-permissions': ['Admin (Full Access)', 'Principal (Full Read/Write)', 'Teacher (Class & Attendance Access)', 'Accountant (Fees & Payroll Access)', 'Receptionist (Front Office Access)'],
    'master-gallery': ['School Events Gallery 2026', 'Sports Day 2026', 'Annual Day 2025', 'Science Exhibition 2025'],
  };

  const masterTitles: Record<MasterSubView, string> = {
    'master-class': 'Class / Grade Configuration', 'master-section': 'Section / Division Master',
    'master-subject': 'Subject Master Setup', 'master-session': 'Academic Session Manager',
    'master-category': 'Student Category Master', 'master-religion': 'Religion Master Setup',
    'master-caste': 'Caste / Community Master', 'master-house': 'School House & Sports Team Master',
    'master-id-card': 'ID Card Template Designer', 'master-permissions': 'Role Permissions & Access Control',
    'master-gallery': 'School Photo Gallery Manager',
  };

  React.useEffect(() => {
    if (isDynamic) {
      fetchDynamicItems();
      if (subView === 'master-class' || subView === 'master-section') {
        fetchSessions();
      }
    } else {
      setItems(staticMasterItems[subView] || []);
    }
  }, [subView]);

  return (
    <div>
      {toast && <div style={{ position: 'fixed', bottom: 24, right: 24, backgroundColor: '#0f172a', color: '#fff', padding: '12px 20px', borderRadius: 8, zIndex: 9999, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 14px rgba(0,0,0,0.25)' }}><CheckCircle2 size={16} color="#38bdf8" />{toast}</div>}
      <div className="view-header">
        <div>
          <h2 className="view-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Settings size={22} color="#2563eb" /> Master Configuration & System Setup</h2>
          <span className="view-subtitle">School master data: classes, sections, subjects, sessions, categories, ID cards & role permissions</span>
        </div>
      </div>
      
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontWeight: 800 }}>{masterTitles[subView]}</h3>
          <button onClick={() => setShowForm(!showForm)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', backgroundColor: '#00696b', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}><PlusCircle size={14} /> Add New</button>
        </div>
        
        {showForm && (
          <div className="erp-card" style={{ marginBottom: 16 }}>
            {subView === 'master-session' ? (
              <form onSubmit={handleAddSession} style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label>Session Year *</label>
                    <input type="text" required value={sessionName} onChange={e => setSessionName(e.target.value)} placeholder="e.g. 2026-2027" />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label>Start Date *</label>
                    <input type="date" required value={sessionStart} onChange={e => setSessionStart(e.target.value)} />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label>End Date *</label>
                    <input type="date" required value={sessionEnd} onChange={e => setSessionEnd(e.target.value)} />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, flexWrap: 'wrap', gap: 12 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, cursor: 'pointer' }}>
                    <input type="checkbox" checked={sessionIsCurrent} onChange={e => setSessionIsCurrent(e.target.checked)} />
                    Set as Current Active Session
                  </label>
                  <button type="submit" className="erp-btn btn-primary" style={{ height: 38 }}><Check size={14} /> Save Session</button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleAdd} style={{ padding: 16, display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div className="form-group" style={{ flex: 1, margin: 0, minWidth: 200 }}>
                  <label>New Entry Name *</label>
                  <input type="text" required value={newItemName} onChange={e => setNewItemName(e.target.value)} placeholder="Enter name..." />
                </div>
                {(subView === 'master-class' || subView === 'master-section') && (
                  <div className="form-group" style={{ width: 220, margin: 0 }}>
                    <label>Academic Session *</label>
                    <select required value={selectedSessionId} onChange={e => setSelectedSessionId(e.target.value)}>
                      <option value="">Select Session</option>
                      {sessions.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.year} {s.is_current ? '(Active)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <button type="submit" className="erp-btn btn-primary" style={{ height: 38 }}><Check size={14} /> Save</button>
              </form>
            )}
          </div>
        )}
        
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', fontWeight: 700, color: '#64748b' }}>Loading master data from backend...</div>
        ) : (
          <div className="erp-card">
            <div className="table-container">
              <table className="erp-table">
                <thead><tr>
                  <th style={{ width: 50 }}>S.No</th>
                  <th>Name / Description</th>
                  <th style={{ textAlign: 'center', width: 120 }}>Action</th>
                </tr></thead>
                <tbody>{items.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', color: '#64748b', padding: 24 }}>No entries found. Click "Add New" to add one!</td>
                  </tr>
                ) : items.map((item, idx) => {
                  const isSessionView = subView === 'master-session';
                  const name = isSessionView 
                    ? item.year 
                    : (subView === 'master-class' 
                      ? (item.admission_class_display || item.admission_class) 
                      : (subView === 'master-section' 
                        ? (item.section_display || item.section) 
                        : item));

                  return (
                    <tr key={idx}>
                      <td style={{ fontWeight: 800 }}>{idx + 1}</td>
                      <td style={{ fontWeight: 700 }}>
                        {isSessionView ? (
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: 14 }}>{name}</span>
                            <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>Duration: {item.start_date} to {item.end_date}</span>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: 14 }}>{name}</span>
                            {(subView === 'master-class' || subView === 'master-section') && item.academic_year_display && (
                              <span style={{ fontSize: 11, color: '#0369a1', backgroundColor: '#e0f2fe', padding: '2px 6px', borderRadius: 4, width: 'fit-content', marginTop: 4, fontWeight: 700 }}>
                                Session: {item.academic_year_display}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {isSessionView ? (
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', alignItems: 'center' }}>
                            {item.is_current ? (
                              <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>Current Active</span>
                            ) : (
                              <button onClick={() => handleSetCurrentSession(item.id)} style={{ padding: '3px 10px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>Set Active</button>
                            )}
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                            <button onClick={() => showToast('Edit clicked')} style={{ padding: '3px 10px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>Edit</button>
                            <button onClick={() => showToast('Delete clicked')} style={{ padding: '3px 10px', backgroundColor: '#dc2626', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>Delete</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}</tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SimpleConfigView({ title, items, onAdd }: { title: string; items: string[]; onAdd: () => void }) {
  const [showForm, setShowForm] = useState(false);
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontWeight: 800 }}>{title}</h3>
        <button onClick={() => setShowForm(!showForm)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', backgroundColor: '#00696b', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}><PlusCircle size={14} /> Add New</button>
      </div>
      {showForm && (
        <div className="erp-card" style={{ marginBottom: 16 }}>
          <form onSubmit={e => { e.preventDefault(); onAdd(); setShowForm(false); }} style={{ padding: 16, display: 'flex', gap: 12, alignItems: 'flex-end' }}>
            <div className="form-group" style={{ flex: 1, margin: 0 }}>
              <label>New Entry Name *</label>
              <input type="text" required placeholder="Enter name..." />
            </div>
            <button type="submit" className="erp-btn btn-primary" style={{ height: 38 }}><Check size={14} /> Save</button>
          </form>
        </div>
      )}
      <div className="erp-card">
        <div className="table-container">
          <table className="erp-table">
            <thead><tr>
              <th style={{ width: 50 }}>S.No</th>
              <th>Name / Description</th>
              <th style={{ textAlign: 'center', width: 120 }}>Action</th>
            </tr></thead>
            <tbody>{items.map((item, idx) => (
              <tr key={idx}>
                <td style={{ fontWeight: 800 }}>{idx + 1}</td>
                <td style={{ fontWeight: 700 }}>{item}</td>
                <td style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                    <button onClick={onAdd} style={{ padding: '3px 10px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>Edit</button>
                    <button onClick={onAdd} style={{ padding: '3px 10px', backgroundColor: '#dc2626', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
