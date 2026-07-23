import React, { useState, useEffect } from 'react';
import { timetableService } from './services/timetableService';
import { 
  Clock, Calendar, UserCheck, Users, BookOpen, AlertCircle, 
  Bell, Volume2, PlusCircle, CheckCircle2, Edit, Trash2, 
  Printer, Download, Search, Check, Sparkles, Sliders, Smartphone,
  Layers, Coffee, ShieldAlert, ArrowRight, Play, RefreshCw
} from 'lucide-react';

// --- DATA TYPES ---
export interface SubstituteRecord {
  id: string;
  date: string;
  absentTeacher: string;
  className: string;
  period: string;
  subject: string;
  substituteTeacher: string;
  status: 'Assigned' | 'Completed' | 'Pending';
}

export interface TeacherSubjectMapping {
  id: string;
  teacherName: string;
  department: string;
  className: string;
  subject: string;
  weeklyQuota: number;
}

export interface PeriodSlot {
  id: string;
  periodNo: number;
  periodName: string;
  startTime: string;
  endTime: string;
  isBreak: boolean;
}

export interface TimetableEntry {
  id: string;
  className: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  periodNo: number;
  subject: string;
  teacherName: string;
  roomNo: string;
}

export interface ExamSchedule {
  id: string;
  examTitle: string;
  className: string;
  subject: string;
  examDate: string;
  startTime: string;
  endTime: string;
  roomNo: string;
}

export interface BellRule {
  id: string;
  periodName: string;
  triggerTime: string;
  soundName: string;
  status: 'Active' | 'Inactive';
}

export type TimeTableSubView = 
  | 'add-substitute'
  // Class time Table (5)
  | 'cls-teacher-subject'
  | 'cls-assign-subject'
  | 'cls-apply-break'
  | 'cls-add-routine'
  | 'cls-manage'
  // Time Table Report (3)
  | 'report-class-routine'
  | 'report-teacher-routine'
  | 'report-substitute-chart'
  // Time Table Setting (3)
  | 'setting-add-exam'
  | 'setting-create-period'
  | 'setting-app-sync'
  // Bell System (3)
  | 'bell-add-period'
  | 'bell-assign'
  | 'bell-add-sound';

interface TimeTableModuleProps {
  initialSubView?: TimeTableSubView;
  onNavigateSubView?: (subView: TimeTableSubView) => void;
}

// --- INITIAL MOCK DATA ---
const INITIAL_PERIODS: PeriodSlot[] = [
  { id: 'p-1', periodNo: 1, periodName: 'Period 1', startTime: '08:00 AM', endTime: '08:45 AM', isBreak: false },
  { id: 'p-2', periodNo: 2, periodName: 'Period 2', startTime: '08:45 AM', endTime: '09:30 AM', isBreak: false },
  { id: 'p-brk1', periodNo: 0, periodName: 'Assembly Break', startTime: '09:30 AM', endTime: '09:45 AM', isBreak: true },
  { id: 'p-3', periodNo: 3, periodName: 'Period 3', startTime: '09:45 AM', endTime: '10:30 AM', isBreak: false },
  { id: 'p-4', periodNo: 4, periodName: 'Period 4', startTime: '10:30 AM', endTime: '11:15 AM', isBreak: false },
  { id: 'p-brk2', periodNo: 0, periodName: 'Lunch Break', startTime: '11:15 AM', endTime: '11:50 AM', isBreak: true },
  { id: 'p-5', periodNo: 5, periodName: 'Period 5', startTime: '11:50 AM', endTime: '12:35 PM', isBreak: false },
  { id: 'p-6', periodNo: 6, periodName: 'Period 6', startTime: '12:35 PM', endTime: '01:20 PM', isBreak: false }
];

const INITIAL_SUBSTITUTES: SubstituteRecord[] = [
  { id: 'sub-1', date: '2026-07-20', absentTeacher: 'Mr Ajay Kumar Sharma', className: 'Class 10-A', period: 'Period 2 (08:45 AM)', subject: 'Social Science', substituteTeacher: 'Ms Seema Solanki', status: 'Assigned' },
  { id: 'sub-2', date: '2026-07-20', absentTeacher: 'Ms Ragini Gupta', className: 'Class 12-A', period: 'Period 4 (10:30 AM)', subject: 'Chemistry', substituteTeacher: 'Ms Mona Arora', status: 'Assigned' }
];

const INITIAL_MAPPINGS: TeacherSubjectMapping[] = [
  { id: 'm-1', teacherName: 'Mr Mohit Verma', department: 'TEACHING', className: 'Class 10-A', subject: 'ENGLISH', weeklyQuota: 6 },
  { id: 'm-2', teacherName: 'Ms Mona Arora', department: 'TEACHING', className: 'Class 12-A', subject: 'Physics', weeklyQuota: 5 },
  { id: 'm-3', teacherName: 'Mr Fakruddin Khan', department: 'TEACHING', className: 'Class 10-A', subject: 'Mathematics', weeklyQuota: 6 },
  { id: 'm-4', teacherName: 'Ms Seema Solanki', department: 'TEACHING', className: 'Class 9-B', subject: 'Social Studies', weeklyQuota: 5 },
  { id: 'm-5', teacherName: 'Mr Sonu Verma', department: 'TEACHING', className: 'Class 11-A', subject: 'Hindi', weeklyQuota: 4 }
];

const INITIAL_TIMETABLE_ENTRIES: TimetableEntry[] = [
  { id: 'tt-1', className: 'Class 10-A', day: 'Monday', periodNo: 1, subject: 'ENGLISH', teacherName: 'Mr Mohit Verma', roomNo: 'Room 102' },
  { id: 'tt-2', className: 'Class 10-A', day: 'Monday', periodNo: 2, subject: 'Mathematics', teacherName: 'Mr Fakruddin Khan', roomNo: 'Room 102' },
  { id: 'tt-3', className: 'Class 10-A', day: 'Monday', periodNo: 3, subject: 'Physics', teacherName: 'Ms Mona Arora', roomNo: 'Lab 2' },
  { id: 'tt-4', className: 'Class 10-A', day: 'Monday', periodNo: 4, subject: 'Hindi', teacherName: 'Mr Sonu Verma', roomNo: 'Room 102' },
  { id: 'tt-5', className: 'Class 10-A', day: 'Monday', periodNo: 5, subject: 'Social Studies', teacherName: 'Ms Seema Solanki', roomNo: 'Room 102' },
  { id: 'tt-6', className: 'Class 10-A', day: 'Monday', periodNo: 6, subject: 'Chemistry', teacherName: 'Ms Ragini Gupta', roomNo: 'Lab 1' }
];

const INITIAL_EXAMS: ExamSchedule[] = [
  { id: 'ex-1', examTitle: 'Half-Yearly Examination 2026', className: 'Class 10-A', subject: 'Mathematics', examDate: '2026-09-15', startTime: '09:00 AM', endTime: '12:00 PM', roomNo: 'Hall A' },
  { id: 'ex-2', examTitle: 'Half-Yearly Examination 2026', className: 'Class 10-A', subject: 'Science', examDate: '2026-09-17', startTime: '09:00 AM', endTime: '12:00 PM', roomNo: 'Hall A' }
];

const INITIAL_BELL_RULES: BellRule[] = [
  { id: 'b-1', periodName: 'School Assembly Bell', triggerTime: '07:55 AM', soundName: 'Classic Brass Bell', status: 'Active' },
  { id: 'b-2', periodName: 'Period 1 Start Bell', triggerTime: '08:00 AM', soundName: 'Digital Electronic Chime', status: 'Active' },
  { id: 'b-3', periodName: 'Lunch Break Bell', triggerTime: '11:15 AM', soundName: 'Double Warning Chime', status: 'Active' },
  { id: 'b-4', periodName: 'School Dismissal Siren', triggerTime: '01:20 PM', soundName: 'Long Dismissal Gong', status: 'Active' }
];

export function TimeTableModule({ initialSubView = 'cls-manage', onNavigateSubView }: TimeTableModuleProps) {
  const [activeSubView, setActiveSubView] = useState<TimeTableSubView>(initialSubView);

  React.useEffect(() => {
    if (initialSubView) setActiveSubView(initialSubView);
  }, [initialSubView]);

  const handleSubViewChange = (view: TimeTableSubView) => {
    setActiveSubView(view);
    if (onNavigateSubView) onNavigateSubView(view);
  };

  const [substitutes, setSubstitutes] = useState<SubstituteRecord[]>(INITIAL_SUBSTITUTES);
  const [mappings, setMappings] = useState<TeacherSubjectMapping[]>(INITIAL_MAPPINGS);
  const [periods, setPeriods] = useState<PeriodSlot[]>(INITIAL_PERIODS);
  const [timetableEntries, setTimetableEntries] = useState<TimetableEntry[]>(INITIAL_TIMETABLE_ENTRIES);
  const [exams, setExams] = useState<ExamSchedule[]>(INITIAL_EXAMS);
  const [bellRules, setBellRules] = useState<BellRule[]>(INITIAL_BELL_RULES);
  const [sounds, setSounds] = useState(['Classic Brass Bell', 'Digital Electronic Chime', 'Double Warning Chime', 'Long Dismissal Gong', 'Soft Piano Alert']);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    timetableService.getRoutines()
      .then(res => {
        const rawList = Array.isArray(res) ? res : (res?.data || res?.results || []);
        if (rawList && rawList.length > 0) {
          const mapped: TimetableEntry[] = rawList.map((item: any, idx: number) => ({
            id: item.id || `tt-${idx}`,
            className: item.admission_class || 'Class 10',
            section: item.section || 'A',
            day: item.day_of_week || 'Monday',
            periodNo: item.period_no || 1,
            periodName: item.period_name || 'Period 1',
            subject: item.subject_name || 'Mathematics',
            teacher: item.teacher_name || 'Sunita Verma',
            roomNo: item.room_no || '101'
          }));
          setTimetableEntries(mapped);
        }
      })
      .catch(err => console.log('Timetable service fetch info:', err?.message));
  }, []);

  return (
    <div>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px', backgroundColor: '#2563eb', color: '#ffffff',
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
            <Clock size={22} color="#2563eb" />
            Time Table & Automated School Bell Console
          </h2>
          <span className="view-subtitle">
            Manage class routine matrices, teacher allocations, substitution charts, exam timetables & automated bell schedules
          </span>
        </div>
      </div>

      {/* SUB-VIEW CONTENT RENDER */}
      {activeSubView === 'add-substitute' && (
        <AddSubstituteSection 
          substitutes={substitutes} 
          setSubstitutes={setSubstitutes} 
          showToast={showToast} 
        />
      )}

      {/* CLASS TIME TABLE (5 VIEWS) */}
      {activeSubView.startsWith('cls-') && (
        <ClassTimeTableSection 
          subView={activeSubView} 
          mappings={mappings}
          setMappings={setMappings}
          periods={periods}
          setPeriods={setPeriods}
          timetableEntries={timetableEntries}
          setTimetableEntries={setTimetableEntries}
          showToast={showToast}
        />
      )}

      {/* TIME TABLE REPORTS (3 VIEWS) */}
      {activeSubView.startsWith('report-') && (
        <TimeTableReportsSection 
          subView={activeSubView}
          timetableEntries={timetableEntries}
          substitutes={substitutes}
        />
      )}

      {/* TIME TABLE SETTINGS (3 VIEWS) */}
      {activeSubView.startsWith('setting-') && (
        <TimeTableSettingsSection 
          subView={activeSubView}
          periods={periods}
          setPeriods={setPeriods}
          exams={exams}
          setExams={setExams}
          showToast={showToast}
        />
      )}

      {/* BELL SYSTEM (3 VIEWS) */}
      {activeSubView.startsWith('bell-') && (
        <BellSystemSection 
          subView={activeSubView}
          bellRules={bellRules}
          setBellRules={setBellRules}
          sounds={sounds}
          setSounds={setSounds}
          showToast={showToast}
        />
      )}

    </div>
  );
}


// ====================================================================
// 1. ADD SUBSTITUTE SECTION
// ====================================================================
function AddSubstituteSection({
  substitutes,
  setSubstitutes,
  showToast
}: {
  substitutes: SubstituteRecord[];
  setSubstitutes: React.Dispatch<React.SetStateAction<SubstituteRecord[]>>;
  showToast: (msg: string) => void;
}) {
  const [showAddForm, setShowAddForm] = useState(false);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    absentTeacher: 'Mr Ajay Kumar Sharma',
    className: 'Class 10-A',
    period: 'Period 2 (08:45 AM)',
    subject: 'Social Science',
    substituteTeacher: 'Ms Seema Solanki'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.absentTeacher || !formData.substituteTeacher) {
      alert('Absent Teacher and Substitute Teacher are required!');
      return;
    }

    const created: SubstituteRecord = {
      id: `sub-${Date.now()}`,
      date: formData.date,
      absentTeacher: formData.absentTeacher,
      className: formData.className,
      period: formData.period,
      subject: formData.subject,
      substituteTeacher: formData.substituteTeacher,
      status: 'Assigned'
    };

    setSubstitutes([created, ...substitutes]);
    showToast(`Substitute teacher ${formData.substituteTeacher} assigned successfully!`);
    setShowAddForm(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Daily Faculty Substitution Manager
          </h3>
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            Assign substitute teachers for absent staff members to prevent free periods
          </span>
        </div>
        <button onClick={() => setShowAddForm(!showAddForm)} className="erp-btn btn-primary" style={{ backgroundColor: '#2563eb', borderColor: '#2563eb' }}>
          <PlusCircle size={14} /> {showAddForm ? 'Close Form' : 'Assign New Substitute'}
        </button>
      </div>

      {showAddForm && (
        <div className="erp-card" style={{ marginBottom: '20px' }}>
          <div className="erp-card-header">
            <span className="erp-card-title">Assign Period Substitute</span>
          </div>
          <form onSubmit={handleSubmit} style={{ padding: '16px' }}>
            <div className="form-grid">
              <div className="form-group">
                <label>Date *</label>
                <input type="date" required value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
              </div>
              <div className="form-group col-span-2">
                <label>Absent Teacher *</label>
                <input type="text" required value={formData.absentTeacher} onChange={e => setFormData({ ...formData, absentTeacher: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Class & Section</label>
                <select value={formData.className} onChange={e => setFormData({ ...formData, className: e.target.value })}>
                  <option value="Class 10-A">Class 10-A</option>
                  <option value="Class 9-B">Class 9-B</option>
                  <option value="Class 11-A">Class 11-A</option>
                  <option value="Class 12-A">Class 12-A</option>
                </select>
              </div>
              <div className="form-group">
                <label>Period Slot</label>
                <select value={formData.period} onChange={e => setFormData({ ...formData, period: e.target.value })}>
                  <option value="Period 1 (08:00 AM)">Period 1 (08:00 AM)</option>
                  <option value="Period 2 (08:45 AM)">Period 2 (08:45 AM)</option>
                  <option value="Period 3 (09:45 AM)">Period 3 (09:45 AM)</option>
                  <option value="Period 4 (10:30 AM)">Period 4 (10:30 AM)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Subject</label>
                <input type="text" value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} />
              </div>
              <div className="form-group col-span-2">
                <label>Assign Substitute Teacher *</label>
                <input type="text" required placeholder="Select available free teacher" value={formData.substituteTeacher} onChange={e => setFormData({ ...formData, substituteTeacher: e.target.value })} />
              </div>
            </div>
            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="erp-btn btn-primary" style={{ backgroundColor: '#2563eb' }}>
                <Check size={14} /> Confirm Substitution
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="erp-card">
        <div className="table-container">
          <table className="erp-table">
            <thead>
              <tr style={{ backgroundColor: '#2563eb', color: '#ffffff' }}>
                <th style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 800 }}>S.No</th>
                <th style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 800 }}>Date</th>
                <th style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 800 }}>Absent Teacher</th>
                <th style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 800 }}>Class</th>
                <th style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 800 }}>Period</th>
                <th style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 800 }}>Subject</th>
                <th style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 800 }}>Substitute Assigned</th>
                <th style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 800, textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {substitutes.map((sub, idx) => (
                <tr key={sub.id}>
                  <td style={{ fontWeight: 800 }}>{idx + 1}</td>
                  <td style={{ fontWeight: 600, color: '#475569' }}>{sub.date}</td>
                  <td style={{ fontWeight: 800, color: '#dc2626' }}>{sub.absentTeacher}</td>
                  <td style={{ fontWeight: 800, color: '#0f172a' }}>{sub.className}</td>
                  <td style={{ fontWeight: 700, color: '#2563eb' }}>{sub.period}</td>
                  <td style={{ fontWeight: 700, color: '#0f172a' }}>{sub.subject}</td>
                  <td style={{ fontWeight: 800, color: '#10b981' }}>{sub.substituteTeacher}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span className="erp-badge badge-approved">{sub.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <PaginationFooter currentCount={substitutes.length} totalCount={substitutes.length} />
      </div>
    </div>
  );
}


// ====================================================================
// 2. CLASS TIME TABLE SECTION (5 VIEWS)
// ====================================================================
function ClassTimeTableSection({
  subView,
  mappings,
  setMappings,
  periods,
  setPeriods,
  timetableEntries,
  setTimetableEntries,
  showToast
}: {
  subView: TimeTableSubView;
  mappings: TeacherSubjectMapping[];
  setMappings: React.Dispatch<React.SetStateAction<TeacherSubjectMapping[]>>;
  periods: PeriodSlot[];
  setPeriods: React.Dispatch<React.SetStateAction<PeriodSlot[]>>;
  timetableEntries: TimetableEntry[];
  setTimetableEntries: React.Dispatch<React.SetStateAction<TimetableEntry[]>>;
  showToast: (msg: string) => void;
}) {
  const [selectedClass, setSelectedClass] = useState('Class 10-A');
  const [newMapping, setNewMapping] = useState({ teacherName: '', className: 'Class 10-A', subject: '', weeklyQuota: 5 });

  if (subView === 'cls-teacher-subject') {
    const handleAddMapping = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newMapping.teacherName || !newMapping.subject) return;
      const created: TeacherSubjectMapping = {
        id: `m-${Date.now()}`,
        teacherName: newMapping.teacherName,
        department: 'TEACHING',
        className: newMapping.className,
        subject: newMapping.subject,
        weeklyQuota: Number(newMapping.weeklyQuota) || 5
      };
      setMappings([...mappings, created]);
      showToast(`Subject "${newMapping.subject}" assigned to ${newMapping.teacherName}`);
      setNewMapping({ teacherName: '', className: 'Class 10-A', subject: '', weeklyQuota: 5 });
    };

    return (
      <div>
        <div className="erp-card" style={{ marginBottom: '20px' }}>
          <div className="erp-card-header"><span className="erp-card-title">Assign Teacher to Class Subject</span></div>
          <form onSubmit={handleAddMapping} style={{ padding: '16px' }}>
            <div className="form-grid">
              <div className="form-group col-span-2">
                <label>Teacher Name *</label>
                <input type="text" required placeholder="e.g. Mr Mohit Verma" value={newMapping.teacherName} onChange={e => setNewMapping({ ...newMapping, teacherName: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Class & Section</label>
                <select value={newMapping.className} onChange={e => setNewMapping({ ...newMapping, className: e.target.value })}>
                  <option value="Class 10-A">Class 10-A</option>
                  <option value="Class 9-B">Class 9-B</option>
                  <option value="Class 11-A">Class 11-A</option>
                  <option value="Class 12-A">Class 12-A</option>
                </select>
              </div>
              <div className="form-group">
                <label>Subject *</label>
                <input type="text" required placeholder="e.g. ENGLISH" value={newMapping.subject} onChange={e => setNewMapping({ ...newMapping, subject: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Weekly Period Quota</label>
                <input type="number" value={newMapping.weeklyQuota} onChange={e => setNewMapping({ ...newMapping, weeklyQuota: Number(e.target.value) })} />
              </div>
            </div>
            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="erp-btn btn-primary" style={{ backgroundColor: '#2563eb' }}>
                <Check size={14} /> Save Allocation
              </button>
            </div>
          </form>
        </div>

        <div className="erp-card">
          <div className="table-container">
            <table className="erp-table">
              <thead>
                <tr style={{ backgroundColor: '#2563eb', color: '#ffffff' }}>
                  <th style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 800 }}>S.No</th>
                  <th style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 800 }}>Teacher Name</th>
                  <th style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 800 }}>Class</th>
                  <th style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 800 }}>Assigned Subject</th>
                  <th style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 800 }}>Weekly Quota</th>
                </tr>
              </thead>
              <tbody>
                {mappings.map((m, idx) => (
                  <tr key={m.id}>
                    <td style={{ fontWeight: 800 }}>{idx + 1}</td>
                    <td style={{ fontWeight: 800, color: '#0f172a' }}>{m.teacherName}</td>
                    <td style={{ fontWeight: 800, color: '#2563eb' }}>{m.className}</td>
                    <td style={{ fontWeight: 700, color: '#0f172a' }}>{m.subject}</td>
                    <td style={{ fontWeight: 800, color: '#10b981' }}>{m.weeklyQuota} Periods / Wk</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // MASTER TIMETABLE MATRIX GRID (cls-manage & cls-add-routine)
  const days: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday')[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Master Timetable Matrix Grid
          </h3>
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            Weekly timetable schedule by class and period slots
          </span>
        </div>
        <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} style={{ width: '180px' }}>
          <option value="Class 10-A">Class 10-A</option>
          <option value="Class 9-B">Class 9-B</option>
          <option value="Class 11-A">Class 11-A</option>
          <option value="Class 12-A">Class 12-A</option>
        </select>
      </div>

      <div className="erp-card">
        <div className="table-container">
          <table className="erp-table">
            <thead>
              <tr style={{ backgroundColor: '#2563eb', color: '#ffffff' }}>
                <th style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 800, width: '120px' }}>Day / Period</th>
                {periods.map(p => (
                  <th key={p.id} style={{ backgroundColor: p.isBreak ? '#2563eb' : '#2563eb', color: '#ffffff', fontWeight: 800, textAlign: 'center' }}>
                    <div>{p.periodName}</div>
                    <div style={{ fontSize: '10px', opacity: 0.85 }}>{p.startTime} - {p.endTime}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {days.map(day => (
                <tr key={day}>
                  <td style={{ fontWeight: 800, color: '#2563eb', backgroundColor: '#f8fafc' }}>{day}</td>
                  {periods.map(p => {
                    if (p.isBreak) {
                      return (
                        <td key={p.id} style={{ backgroundColor: '#fff7ed', color: '#c2410c', fontWeight: 800, textAlign: 'center', fontSize: '11px' }}>
                          BREAK
                        </td>
                      );
                    }
                    const entry = timetableEntries.find(e => e.day === day && e.periodNo === p.periodNo && e.className === selectedClass);
                    return (
                      <td key={p.id} style={{ textAlign: 'center', padding: '10px' }}>
                        {entry ? (
                          <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '6px' }}>
                            <div style={{ fontWeight: 800, color: '#10b981', fontSize: '13px' }}>{entry.subject}</div>
                            <div style={{ fontSize: '11px', color: '#475569', fontWeight: 600 }}>{entry.teacherName}</div>
                            <div style={{ fontSize: '10px', color: '#94a3b8' }}>{entry.roomNo}</div>
                          </div>
                        ) : (
                          <span style={{ fontSize: '11px', color: '#cbd5e1', fontStyle: 'italic' }}>Unassigned</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


// ====================================================================
// 3. TIME TABLE REPORTS SECTION (3 VIEWS)
// ====================================================================
function TimeTableReportsSection({
  subView,
  timetableEntries,
  substitutes
}: {
  subView: TimeTableSubView;
  timetableEntries: TimetableEntry[];
  substitutes: SubstituteRecord[];
}) {
  const getTitle = () => {
    switch (subView) {
      case 'report-class-routine': return 'Class-Wise Weekly Routine Report';
      case 'report-teacher-routine': return 'Teacher-Wise Routine & Workload Report';
      case 'report-substitute-chart': return 'Faculty Substitution Allocation Chart';
      default: return 'Time Table Report';
    }
  };

  return (
    <div>
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
          <button onClick={() => alert('Exporting report...')} style={{ backgroundColor: '#6366f1', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '6px 16px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Download size={14} /> Export
          </button>
          <button onClick={() => window.print()} style={{ backgroundColor: '#6366f1', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '6px 20px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
            Print
          </button>
        </div>
      </div>

      <div className="erp-card" style={{ borderRadius: '0 0 8px 8px', marginTop: 0 }}>
        <div className="table-container">
          <table className="erp-table">
            <thead>
              <tr style={{ backgroundColor: '#2563eb', color: '#ffffff' }}>
                <th style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 800 }}>S.No</th>
                <th style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 800 }}>Class / Teacher</th>
                <th style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 800 }}>Day</th>
                <th style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 800 }}>Period</th>
                <th style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 800 }}>Subject</th>
                <th style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 800 }}>Faculty Allocated</th>
                <th style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 800, textAlign: 'center' }}>Room No</th>
              </tr>
            </thead>
            <tbody>
              {timetableEntries.map((t, idx) => (
                <tr key={t.id}>
                  <td style={{ fontWeight: 800 }}>{idx + 1}</td>
                  <td style={{ fontWeight: 800, color: '#2563eb' }}>{t.className}</td>
                  <td style={{ fontWeight: 700, color: '#0f172a' }}>{t.day}</td>
                  <td style={{ fontWeight: 700, color: '#0f172a' }}>Period {t.periodNo}</td>
                  <td style={{ fontWeight: 800, color: '#10b981' }}>{t.subject}</td>
                  <td style={{ fontWeight: 700, color: '#0f172a' }}>{t.teacherName}</td>
                  <td style={{ textAlign: 'center', fontWeight: 600, color: '#475569' }}>{t.roomNo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <PaginationFooter currentCount={timetableEntries.length} totalCount={timetableEntries.length} />
      </div>
    </div>
  );
}


// ====================================================================
// 4. TIME TABLE SETTINGS SECTION (3 VIEWS)
// ====================================================================
function TimeTableSettingsSection({
  subView,
  periods,
  setPeriods,
  exams,
  setExams,
  showToast
}: {
  subView: TimeTableSubView;
  periods: PeriodSlot[];
  setPeriods: React.Dispatch<React.SetStateAction<PeriodSlot[]>>;
  exams: ExamSchedule[];
  setExams: React.Dispatch<React.SetStateAction<ExamSchedule[]>>;
  showToast: (msg: string) => void;
}) {
  const [newExam, setNewExam] = useState({ examTitle: 'Half-Yearly Examination 2026', className: 'Class 10-A', subject: '', examDate: '', startTime: '09:00 AM', endTime: '12:00 PM', roomNo: 'Hall A' });

  if (subView === 'setting-add-exam') {
    const handleAddExam = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newExam.subject || !newExam.examDate) return;
      const created: ExamSchedule = {
        id: `ex-${Date.now()}`,
        examTitle: newExam.examTitle,
        className: newExam.className,
        subject: newExam.subject,
        examDate: newExam.examDate,
        startTime: newExam.startTime,
        endTime: newExam.endTime,
        roomNo: newExam.roomNo
      };
      setExams([...exams, created]);
      showToast(`Exam schedule for ${newExam.subject} created!`);
    };

    return (
      <div>
        <div className="erp-card" style={{ marginBottom: '20px' }}>
          <div className="erp-card-header"><span className="erp-card-title">Schedule Examination Date-Sheet</span></div>
          <form onSubmit={handleAddExam} style={{ padding: '16px' }}>
            <div className="form-grid">
              <div className="form-group col-span-2">
                <label>Exam Title *</label>
                <input type="text" required value={newExam.examTitle} onChange={e => setNewExam({ ...newExam, examTitle: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Class & Section</label>
                <select value={newExam.className} onChange={e => setNewExam({ ...newExam, className: e.target.value })}>
                  <option value="Class 10-A">Class 10-A</option>
                  <option value="Class 9-B">Class 9-B</option>
                  <option value="Class 11-A">Class 11-A</option>
                </select>
              </div>
              <div className="form-group">
                <label>Subject *</label>
                <input type="text" required placeholder="e.g. Mathematics" value={newExam.subject} onChange={e => setNewExam({ ...newExam, subject: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Exam Date *</label>
                <input type="date" required value={newExam.examDate} onChange={e => setNewExam({ ...newExam, examDate: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Start Time</label>
                <input type="text" value={newExam.startTime} onChange={e => setNewExam({ ...newExam, startTime: e.target.value })} />
              </div>
              <div className="form-group">
                <label>End Time</label>
                <input type="text" value={newExam.endTime} onChange={e => setNewExam({ ...newExam, endTime: e.target.value })} />
              </div>
            </div>
            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="erp-btn btn-primary" style={{ backgroundColor: '#2563eb' }}>
                <Check size={14} /> Save Exam Slot
              </button>
            </div>
          </form>
        </div>

        <div className="erp-card">
          <div className="table-container">
            <table className="erp-table">
              <thead>
                <tr style={{ backgroundColor: '#2563eb', color: '#ffffff' }}>
                  <th style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 800 }}>Exam Title</th>
                  <th style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 800 }}>Class</th>
                  <th style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 800 }}>Subject</th>
                  <th style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 800 }}>Date</th>
                  <th style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 800 }}>Timing</th>
                  <th style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 800 }}>Hall / Room</th>
                </tr>
              </thead>
              <tbody>
                {exams.map(e => (
                  <tr key={e.id}>
                    <td style={{ fontWeight: 800, color: '#0f172a' }}>{e.examTitle}</td>
                    <td style={{ fontWeight: 800, color: '#2563eb' }}>{e.className}</td>
                    <td style={{ fontWeight: 700, color: '#10b981' }}>{e.subject}</td>
                    <td style={{ fontWeight: 600, color: '#475569' }}>{e.examDate}</td>
                    <td style={{ fontWeight: 600, color: '#475569' }}>{e.startTime} - {e.endTime}</td>
                    <td style={{ fontWeight: 700, color: '#0f172a' }}>{e.roomNo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // PERIOD TIMING CONFIGURATION VIEW (setting-create-period)
  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
          Period Duration & Timing Configurations
        </h3>
        <span style={{ fontSize: '12px', color: '#64748b' }}>
          Define period start times, end times, assembly, and lunch break durations
        </span>
      </div>

      <div className="erp-card">
        <div className="table-container">
          <table className="erp-table">
            <thead>
              <tr style={{ backgroundColor: '#2563eb', color: '#ffffff' }}>
                <th style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 800 }}>Period No</th>
                <th style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 800 }}>Period Name</th>
                <th style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 800 }}>Start Time</th>
                <th style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 800 }}>End Time</th>
                <th style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 800, textAlign: 'center' }}>Type</th>
              </tr>
            </thead>
            <tbody>
              {periods.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 800 }}>{p.periodNo || '-'}</td>
                  <td style={{ fontWeight: 800, color: '#0f172a' }}>{p.periodName}</td>
                  <td style={{ fontWeight: 700, color: '#2563eb' }}>{p.startTime}</td>
                  <td style={{ fontWeight: 700, color: '#2563eb' }}>{p.endTime}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`erp-badge ${p.isBreak ? 'badge-warning' : 'badge-approved'}`}>
                      {p.isBreak ? 'Break Slot' : 'Teaching Period'}
                    </span>
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


// ====================================================================
// 5. BELL SYSTEM SECTION (3 VIEWS)
// ====================================================================
function BellSystemSection({
  subView,
  bellRules,
  setBellRules,
  sounds,
  setSounds,
  showToast
}: {
  subView: TimeTableSubView;
  bellRules: BellRule[];
  setBellRules: React.Dispatch<React.SetStateAction<BellRule[]>>;
  sounds: string[];
  setSounds: React.Dispatch<React.SetStateAction<string[]>>;
  showToast: (msg: string) => void;
}) {
  const [newSoundInput, setNewSoundInput] = useState('');

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bell size={18} color="#2563eb" />
          Automated School Bell System & Chime Console
        </h3>
        <span style={{ fontSize: '12px', color: '#64748b' }}>
          Configure period bell timings, trigger sounds & sound library
        </span>
      </div>

      {subView === 'bell-add-sound' ? (
        <div className="erp-card">
          <div className="erp-card-header"><span className="erp-card-title">School Bell Sound Library</span></div>
          <div className="erp-card-body">
            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
              <input type="text" placeholder="Add custom chime sound name..." value={newSoundInput} onChange={e => setNewSoundInput(e.target.value)} style={{ flex: 1 }} />
              <button 
                onClick={() => {
                  if (!newSoundInput) return;
                  setSounds([...sounds, newSoundInput]);
                  showToast(`Chime sound "${newSoundInput}" added to library!`);
                  setNewSoundInput('');
                }}
                className="erp-btn btn-primary" style={{ backgroundColor: '#2563eb' }}
              >
                Upload Sound
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
              {sounds.map((snd, idx) => (
                <div key={idx} style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '13px' }}>{snd}</span>
                  <button onClick={() => showToast(`Playing sample sound: ${snd}`)} style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Play size={10} /> Test
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="erp-card">
          <div className="table-container">
            <table className="erp-table">
              <thead>
                <tr style={{ backgroundColor: '#2563eb', color: '#ffffff' }}>
                  <th style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 800 }}>S.No</th>
                  <th style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 800 }}>Period / Event Name</th>
                  <th style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 800 }}>Automated Trigger Time</th>
                  <th style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 800 }}>Assigned Chime Sound</th>
                  <th style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 800, textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {bellRules.map((b, idx) => (
                  <tr key={b.id}>
                    <td style={{ fontWeight: 800 }}>{idx + 1}</td>
                    <td style={{ fontWeight: 800, color: '#0f172a' }}>{b.periodName}</td>
                    <td style={{ fontWeight: 800, color: '#2563eb' }}>{b.triggerTime}</td>
                    <td style={{ fontWeight: 700, color: '#10b981' }}>{b.soundName}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="erp-badge badge-approved">{b.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
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
        <div style={{ backgroundColor: '#4f46e5', color: '#ffffff', fontWeight: 800, padding: '2px 10px', borderRadius: '4px' }}>1</div>
        <span style={{ color: '#94a3b8', cursor: 'pointer', fontWeight: 800 }}>›</span>
        <span style={{ color: '#94a3b8', cursor: 'pointer' }}>Last</span>
      </div>
    </div>
  );
}
