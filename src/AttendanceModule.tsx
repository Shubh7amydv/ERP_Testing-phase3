import React, { useState } from 'react';
import { 
  CalendarCheck, Calendar, Users, UserCheck, CheckCircle2, XCircle, 
  Clock, AlertCircle, FileText, Search, PlusCircle, Filter, Download, 
  Printer, Check, Sparkles, Settings, Bell, BookOpen, Coffee, Sun, 
  ShieldAlert, RefreshCw, BarChart3, Radio
} from 'lucide-react';

// --- DATA TYPES ---
export interface StudentAttendance {
  studentId: string;
  rollNo: string;
  name: string;
  className: string;
  section: string;
  status: 'Present' | 'Absent' | 'Late' | 'Leave';
  inTime: string;
  remarks: string;
}

export interface FacultyAttendance {
  facultyId: string;
  empId: string;
  name: string;
  department: string;
  designation: string;
  status: 'Present' | 'Absent' | 'Late' | 'Leave';
  biometricTime: string;
  remarks: string;
}

export interface HolidayEntry {
  id: string;
  title: string;
  targetGroup: 'Student' | 'Faculty' | 'All';
  startDate: string;
  endDate: string;
  totalDays: number;
  description: string;
}

export interface SubjectPeriodAttendance {
  id: string;
  date: string;
  className: string;
  section: string;
  subject: string;
  teacherName: string;
  periodNo: number;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
}

export type AttendanceSubView = 
  // Faculty Report (5)
  | 'faculty-report-single'
  | 'faculty-report-month'
  | 'faculty-report-date'
  | 'faculty-report-teacher'
  | 'faculty-report-leave'
  // Student Report (5)
  | 'student-report-month'
  | 'student-report-class'
  | 'student-report-overall'
  | 'student-report-date'
  | 'student-report-live'
  // Mark Holiday (2)
  | 'holiday-student'
  | 'holiday-faculty'
  // Mark Attendance (2)
  | 'mark-student'
  | 'mark-faculty'
  // Time Setting (1)
  | 'time-setting'
  // Attendance Subject (1)
  | 'attendance-subject';

interface AttendanceModuleProps {
  initialSubView?: AttendanceSubView;
  onNavigateSubView?: (subView: AttendanceSubView) => void;
}

// --- INITIAL MOCK DATA ---
const INITIAL_STUDENTS_ATTENDANCE: StudentAttendance[] = [
  { studentId: 'std-1', rollNo: '101', name: 'Aarav Sharma', className: 'Class 10', section: 'A', status: 'Present', inTime: '07:52 AM', remarks: 'On Time' },
  { studentId: 'std-2', rollNo: '102', name: 'Aditi Verma', className: 'Class 10', section: 'A', status: 'Present', inTime: '07:55 AM', remarks: 'On Time' },
  { studentId: 'std-3', rollNo: '103', name: 'Ananya Gupta', className: 'Class 10', section: 'A', status: 'Late', inTime: '08:14 AM', remarks: 'Bus Delayed' },
  { studentId: 'std-4', rollNo: '104', name: 'Bhavya Joshi', className: 'Class 10', section: 'A', status: 'Absent', inTime: '--', remarks: 'Informed' },
  { studentId: 'std-5', rollNo: '105', name: 'Devendra Kumar', className: 'Class 10', section: 'A', status: 'Leave', inTime: '--', remarks: 'Medical Leave' },
  { studentId: 'std-6', rollNo: '106', name: 'Ishita Patel', className: 'Class 10', section: 'A', status: 'Present', inTime: '07:48 AM', remarks: 'On Time' },
  { studentId: 'std-7', rollNo: '107', name: 'Kavya Singh', className: 'Class 10', section: 'A', status: 'Present', inTime: '07:58 AM', remarks: 'On Time' }
];

const INITIAL_FACULTY_ATTENDANCE: FacultyAttendance[] = [
  { facultyId: 'stf-1', empId: 'EMP-1056', name: 'Mr Rahul Rathi', department: 'DIRECTOR', designation: 'DIRECTOR', status: 'Present', biometricTime: '07:45 AM', remarks: 'Punctual' },
  { facultyId: 'stf-2', empId: 'EMP-1057', name: 'Ms Geeta Dang', department: 'PRINCIPAL', designation: 'PRINCIPAL', status: 'Present', biometricTime: '07:40 AM', remarks: 'Punctual' },
  { facultyId: 'stf-3', empId: 'EMP-1058', name: 'Ms Babita Sharma', department: 'VICE PRINCIPAL', designation: 'VICE PRINCIPAL', status: 'Present', biometricTime: '07:50 AM', remarks: 'Punctual' },
  { facultyId: 'stf-4', empId: 'EMP-1059', name: 'Ms Seema Solanki', department: 'TEACHING', designation: 'TEACHER', status: 'Present', biometricTime: '07:55 AM', remarks: 'Punctual' },
  { facultyId: 'stf-5', empId: 'EMP-1060', name: 'Mr Mohit Verma', department: 'TEACHING', designation: 'TEACHER', status: 'Present', biometricTime: '07:52 AM', remarks: 'Punctual' },
  { facultyId: 'stf-6', empId: 'EMP-1061', name: 'Ms Mona Arora', department: 'TEACHING', designation: 'TEACHER', status: 'Late', biometricTime: '08:12 AM', remarks: 'Traffic Delay' },
  { facultyId: 'stf-7', empId: 'EMP-1062', name: 'Mr Sonu Verma', department: 'TEACHING', designation: 'TEACHER', status: 'Absent', biometricTime: '--', remarks: 'Personal Leave' }
];

const INITIAL_HOLIDAYS: HolidayEntry[] = [
  { id: 'hol-1', title: 'Independence Day', targetGroup: 'All', startDate: '2026-08-15', endDate: '2026-08-15', totalDays: 1, description: 'National Holiday & Flag Hoisting Ceremony' },
  { id: 'hol-2', title: 'Janmashtami', targetGroup: 'All', startDate: '2026-09-04', endDate: '2026-09-04', totalDays: 1, description: 'Festival Holiday' },
  { id: 'hol-3', title: 'Diwali & Festival Break', targetGroup: 'All', startDate: '2026-11-01', endDate: '2026-11-05', totalDays: 5, description: 'Deepawali Vacation' }
];

const INITIAL_SUBJECT_ATTENDANCE: SubjectPeriodAttendance[] = [
  { id: 'sa-1', date: '2026-07-20', className: 'Class 10', section: 'A', subject: 'ENGLISH', teacherName: 'Mr Mohit Verma', periodNo: 1, totalStudents: 40, presentCount: 38, absentCount: 2 },
  { id: 'sa-2', date: '2026-07-20', className: 'Class 10', section: 'A', subject: 'Mathematics', teacherName: 'Mr Fakruddin Khan', periodNo: 2, totalStudents: 40, presentCount: 37, absentCount: 3 },
  { id: 'sa-3', date: '2026-07-20', className: 'Class 12', section: 'A', subject: 'Physics', teacherName: 'Ms Mona Arora', periodNo: 3, totalStudents: 35, presentCount: 34, absentCount: 1 }
];

export function AttendanceModule({ initialSubView = 'mark-student', onNavigateSubView }: AttendanceModuleProps) {
  const [activeSubView, setActiveSubView] = useState<AttendanceSubView>(initialSubView);

  React.useEffect(() => {
    if (initialSubView) setActiveSubView(initialSubView);
  }, [initialSubView]);

  const handleSubViewChange = (view: AttendanceSubView) => {
    setActiveSubView(view);
    if (onNavigateSubView) onNavigateSubView(view);
  };

  const [studentsAtt, setStudentsAtt] = useState<StudentAttendance[]>(INITIAL_STUDENTS_ATTENDANCE);
  const [facultyAtt, setFacultyAtt] = useState<FacultyAttendance[]>(INITIAL_FACULTY_ATTENDANCE);
  const [holidays, setHolidays] = useState<HolidayEntry[]>(INITIAL_HOLIDAYS);
  const [subjectAtt, setSubjectAtt] = useState<SubjectPeriodAttendance[]>(INITIAL_SUBJECT_ATTENDANCE);

  const [timeRules, setTimeRules] = useState({
    arrivalTime: '08:00 AM',
    lateThreshold: '08:15 AM',
    halfDayCutoff: '11:30 AM',
    autoAbsentTime: '09:30 AM',
    enableSMSAlerts: true
  });

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
            <CalendarCheck size={22} color="#00696b" />
            Attendance & Holiday Management Console
          </h2>
          <span className="view-subtitle">
            Daily student & staff attendance marking, 10 analytical reports, holiday declaration, cutoff rules & subject tracking
          </span>
        </div>
      </div>

      {/* SUB-VIEW CONTENT RENDER */}
      {/* MARK ATTENDANCE (2 VIEWS) */}
      {activeSubView === 'mark-student' && (
        <MarkStudentAttendanceSection 
          studentsAtt={studentsAtt} 
          setStudentsAtt={setStudentsAtt} 
          showToast={showToast} 
        />
      )}

      {activeSubView === 'mark-faculty' && (
        <MarkFacultyAttendanceSection 
          facultyAtt={facultyAtt} 
          setFacultyAtt={setFacultyAtt} 
          showToast={showToast} 
        />
      )}

      {/* FACULTY REPORTS (5 VIEWS) */}
      {activeSubView.startsWith('faculty-report-') && (
        <FacultyReportsSection 
          subView={activeSubView} 
          facultyAtt={facultyAtt} 
        />
      )}

      {/* STUDENT REPORTS (5 VIEWS) */}
      {activeSubView.startsWith('student-report-') && (
        <StudentReportsSection 
          subView={activeSubView} 
          studentsAtt={studentsAtt} 
        />
      )}

      {/* MARK HOLIDAY (2 VIEWS) */}
      {activeSubView.startsWith('holiday-') && (
        <MarkHolidaySection 
          subView={activeSubView} 
          holidays={holidays} 
          setHolidays={setHolidays} 
          showToast={showToast} 
        />
      )}

      {/* TIME SETTING (1 VIEW) */}
      {activeSubView === 'time-setting' && (
        <AttendanceTimeSettingSection 
          timeRules={timeRules} 
          setTimeRules={setTimeRules} 
          showToast={showToast} 
        />
      )}

      {/* ATTENDANCE SUBJECT (1 VIEW) */}
      {activeSubView === 'attendance-subject' && (
        <AttendanceSubjectSection 
          subjectAtt={subjectAtt} 
          setSubjectAtt={setSubjectAtt} 
          showToast={showToast} 
        />
      )}

    </div>
  );
}


// ====================================================================
// 1. MARK STUDENT ATTENDANCE SECTION
// ====================================================================
function MarkStudentAttendanceSection({
  studentsAtt,
  setStudentsAtt,
  showToast
}: {
  studentsAtt: StudentAttendance[];
  setStudentsAtt: React.Dispatch<React.SetStateAction<StudentAttendance[]>>;
  showToast: (msg: string) => void;
}) {
  const [selectedClass, setSelectedClass] = useState('Class 10');
  const [selectedSection, setSelectedSection] = useState('A');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const toggleStatus = (studentId: string, nextStatus: 'Present' | 'Absent' | 'Late' | 'Leave') => {
    setStudentsAtt(prev => prev.map(s => s.studentId === studentId ? { ...s, status: nextStatus } : s));
  };

  const markAll = (status: 'Present' | 'Absent') => {
    setStudentsAtt(prev => prev.map(s => ({ ...s, status })));
    showToast(`Marked all students as ${status}!`);
  };

  const handleSave = () => {
    showToast(`Attendance for ${selectedClass}-${selectedSection} saved & SMS alerts dispatched!`);
  };

  const presentCount = studentsAtt.filter(s => s.status === 'Present').length;
  const absentCount = studentsAtt.filter(s => s.status === 'Absent').length;
  const lateCount = studentsAtt.filter(s => s.status === 'Late').length;
  const leaveCount = studentsAtt.filter(s => s.status === 'Leave').length;

  return (
    <div>
      {/* Top Filter & Summary */}
      <div className="erp-card" style={{ marginBottom: '16px' }}>
        <div className="erp-card-body" style={{ padding: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} style={{ width: '130px' }}>
                <option value="Class 10">Class 10</option>
                <option value="Class 9">Class 9</option>
                <option value="Class 11">Class 11</option>
                <option value="Class 12">Class 12</option>
              </select>
              <select value={selectedSection} onChange={e => setSelectedSection(e.target.value)} style={{ width: '100px' }}>
                <option value="A">Sec A</option>
                <option value="B">Sec B</option>
                <option value="C">Sec C</option>
              </select>
              <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} style={{ width: '150px' }} />
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => markAll('Present')} className="erp-btn btn-outline" style={{ borderColor: '#16a34a', color: '#16a34a' }}>
                Mark All Present
              </button>
              <button onClick={() => markAll('Absent')} className="erp-btn btn-outline" style={{ borderColor: '#dc2626', color: '#dc2626' }}>
                Mark All Absent
              </button>
              <button onClick={handleSave} className="erp-btn btn-primary" style={{ backgroundColor: '#00696b', borderColor: '#00696b' }}>
                <Check size={14} /> Submit Attendance
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Summary Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '16px' }}>
        <div className="erp-card" style={{ padding: '12px', margin: 0, borderLeft: '4px solid #16a34a' }}>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 800 }}>PRESENT</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#16a34a' }}>{presentCount} Students</div>
        </div>
        <div className="erp-card" style={{ padding: '12px', margin: 0, borderLeft: '4px solid #dc2626' }}>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 800 }}>ABSENT</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#dc2626' }}>{absentCount} Students</div>
        </div>
        <div className="erp-card" style={{ padding: '12px', margin: 0, borderLeft: '4px solid #eab308' }}>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 800 }}>LATE ARRIVAL</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#ca8a04' }}>{lateCount} Students</div>
        </div>
        <div className="erp-card" style={{ padding: '12px', margin: 0, borderLeft: '4px solid #0284c7' }}>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 800 }}>ON LEAVE</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#0284c7' }}>{leaveCount} Students</div>
        </div>
      </div>

      {/* Marking Table */}
      <div className="erp-card">
        <div className="table-container">
          <table className="erp-table">
            <thead>
              <tr style={{ backgroundColor: '#00696b', color: '#ffffff' }}>
                <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>Roll No</th>
                <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>Student Name</th>
                <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>Class & Sec</th>
                <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>In-Time</th>
                <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800, textAlign: 'center' }}>Attendance Toggle</th>
                <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {studentsAtt.map((std) => (
                <tr key={std.studentId}>
                  <td style={{ fontWeight: 800 }}>{std.rollNo}</td>
                  <td style={{ fontWeight: 800, color: '#0f172a' }}>{std.name}</td>
                  <td style={{ fontWeight: 700, color: '#00696b' }}>{std.className}-{std.section}</td>
                  <td style={{ fontWeight: 600, color: '#475569' }}>{std.inTime}</td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', gap: '4px', backgroundColor: '#f1f5f9', padding: '3px', borderRadius: '6px' }}>
                      <button 
                        onClick={() => toggleStatus(std.studentId, 'Present')}
                        style={{ padding: '4px 10px', fontSize: '11px', fontWeight: 800, borderRadius: '4px', border: 'none', cursor: 'pointer', backgroundColor: std.status === 'Present' ? '#16a34a' : 'transparent', color: std.status === 'Present' ? '#fff' : '#64748b' }}
                      >
                        Present
                      </button>
                      <button 
                        onClick={() => toggleStatus(std.studentId, 'Absent')}
                        style={{ padding: '4px 10px', fontSize: '11px', fontWeight: 800, borderRadius: '4px', border: 'none', cursor: 'pointer', backgroundColor: std.status === 'Absent' ? '#dc2626' : 'transparent', color: std.status === 'Absent' ? '#fff' : '#64748b' }}
                      >
                        Absent
                      </button>
                      <button 
                        onClick={() => toggleStatus(std.studentId, 'Late')}
                        style={{ padding: '4px 10px', fontSize: '11px', fontWeight: 800, borderRadius: '4px', border: 'none', cursor: 'pointer', backgroundColor: std.status === 'Late' ? '#eab308' : 'transparent', color: std.status === 'Late' ? '#fff' : '#64748b' }}
                      >
                        Late
                      </button>
                      <button 
                        onClick={() => toggleStatus(std.studentId, 'Leave')}
                        style={{ padding: '4px 10px', fontSize: '11px', fontWeight: 800, borderRadius: '4px', border: 'none', cursor: 'pointer', backgroundColor: std.status === 'Leave' ? '#0284c7' : 'transparent', color: std.status === 'Leave' ? '#fff' : '#64748b' }}
                      >
                        Leave
                      </button>
                    </div>
                  </td>
                  <td style={{ color: '#64748b', fontStyle: 'italic', fontSize: '12px' }}>{std.remarks}</td>
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
// 2. MARK FACULTY ATTENDANCE SECTION
// ====================================================================
function MarkFacultyAttendanceSection({
  facultyAtt,
  setFacultyAtt,
  showToast
}: {
  facultyAtt: FacultyAttendance[];
  setFacultyAtt: React.Dispatch<React.SetStateAction<FacultyAttendance[]>>;
  showToast: (msg: string) => void;
}) {
  const toggleFacultyStatus = (facultyId: string, status: 'Present' | 'Absent' | 'Late' | 'Leave') => {
    setFacultyAtt(prev => prev.map(f => f.facultyId === facultyId ? { ...f, status } : f));
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Faculty & Staff Biometric Attendance Console
          </h3>
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            Daily staff punch-in records, biometric machine sync & attendance verification
          </span>
        </div>
        <button onClick={() => showToast('Biometric machine records synced successfully!')} className="erp-btn btn-primary" style={{ backgroundColor: '#00696b', borderColor: '#00696b' }}>
          <RefreshCw size={14} /> Sync Biometric Machine
        </button>
      </div>

      <div className="erp-card">
        <div className="table-container">
          <table className="erp-table">
            <thead>
              <tr style={{ backgroundColor: '#00696b', color: '#ffffff' }}>
                <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>Emp ID</th>
                <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>Staff Name</th>
                <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>Department</th>
                <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>Designation</th>
                <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>Biometric Time</th>
                <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800, textAlign: 'center' }}>Attendance Toggle</th>
                <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {facultyAtt.map((f) => (
                <tr key={f.facultyId}>
                  <td style={{ fontWeight: 800, color: '#dc2626' }}>{f.empId}</td>
                  <td style={{ fontWeight: 800, color: '#0f172a' }}>{f.name}</td>
                  <td style={{ fontWeight: 800, color: '#00696b' }}>{f.department}</td>
                  <td style={{ fontWeight: 700, color: '#0f172a' }}>{f.designation}</td>
                  <td style={{ fontWeight: 600, color: '#475569' }}>{f.biometricTime}</td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', gap: '4px', backgroundColor: '#f1f5f9', padding: '3px', borderRadius: '6px' }}>
                      <button onClick={() => toggleFacultyStatus(f.facultyId, 'Present')} style={{ padding: '4px 10px', fontSize: '11px', fontWeight: 800, borderRadius: '4px', border: 'none', cursor: 'pointer', backgroundColor: f.status === 'Present' ? '#16a34a' : 'transparent', color: f.status === 'Present' ? '#fff' : '#64748b' }}>Present</button>
                      <button onClick={() => toggleFacultyStatus(f.facultyId, 'Absent')} style={{ padding: '4px 10px', fontSize: '11px', fontWeight: 800, borderRadius: '4px', border: 'none', cursor: 'pointer', backgroundColor: f.status === 'Absent' ? '#dc2626' : 'transparent', color: f.status === 'Absent' ? '#fff' : '#64748b' }}>Absent</button>
                      <button onClick={() => toggleFacultyStatus(f.facultyId, 'Late')} style={{ padding: '4px 10px', fontSize: '11px', fontWeight: 800, borderRadius: '4px', border: 'none', cursor: 'pointer', backgroundColor: f.status === 'Late' ? '#eab308' : 'transparent', color: f.status === 'Late' ? '#fff' : '#64748b' }}>Late</button>
                      <button onClick={() => toggleFacultyStatus(f.facultyId, 'Leave')} style={{ padding: '4px 10px', fontSize: '11px', fontWeight: 800, borderRadius: '4px', border: 'none', cursor: 'pointer', backgroundColor: f.status === 'Leave' ? '#0284c7' : 'transparent', color: f.status === 'Leave' ? '#fff' : '#64748b' }}>Leave</button>
                    </div>
                  </td>
                  <td style={{ color: '#64748b', fontSize: '12px' }}>{f.remarks}</td>
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
// 3. FACULTY REPORTS SECTION (5 VIEWS)
// ====================================================================
function FacultyReportsSection({
  subView,
  facultyAtt
}: {
  subView: AttendanceSubView;
  facultyAtt: FacultyAttendance[];
}) {
  const getTitle = () => {
    switch (subView) {
      case 'faculty-report-single': return 'Single Day Faculty Attendance Report';
      case 'faculty-report-month': return 'Month-Wise Faculty Attendance Summary';
      case 'faculty-report-date': return 'Date-Wise Staff Attendance Ledger';
      case 'faculty-report-teacher': return 'Teacher-Wise Attendance History & Leave Audit';
      case 'faculty-report-leave': return 'Staff Total Leave Balance Register';
      default: return 'Faculty Attendance Report';
    }
  };

  return (
    <div>
      <div style={{
        backgroundColor: '#8b4570', color: '#ffffff', borderRadius: '8px 8px 0 0',
        padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>{getTitle()} : (Session: 2026-2027)</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => alert('Exporting...')} style={{ backgroundColor: '#0d9488', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '6px 16px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Download size={14} /> Export
          </button>
          <button onClick={() => window.print()} style={{ backgroundColor: '#0d9488', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '6px 20px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
            Print
          </button>
        </div>
      </div>

      <div className="erp-card" style={{ borderRadius: '0 0 8px 8px', marginTop: 0 }}>
        <div className="table-container">
          <table className="erp-table">
            <thead>
              <tr style={{ backgroundColor: '#00696b', color: '#ffffff' }}>
                <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>S.No</th>
                <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>Emp ID</th>
                <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>Faculty Name</th>
                <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>Department</th>
                <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>Designation</th>
                <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>Punch-In Time</th>
                <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800, textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {facultyAtt.map((f, idx) => (
                <tr key={f.facultyId}>
                  <td style={{ fontWeight: 800 }}>{idx + 1}</td>
                  <td style={{ fontWeight: 800, color: '#dc2626' }}>{f.empId}</td>
                  <td style={{ fontWeight: 800, color: '#0f172a' }}>{f.name}</td>
                  <td style={{ fontWeight: 800, color: '#00696b' }}>{f.department}</td>
                  <td style={{ fontWeight: 700, color: '#0f172a' }}>{f.designation}</td>
                  <td style={{ fontWeight: 600, color: '#475569' }}>{f.biometricTime}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span className="erp-badge badge-approved">{f.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <PaginationFooter currentCount={facultyAtt.length} totalCount={facultyAtt.length} />
      </div>
    </div>
  );
}


// ====================================================================
// 4. STUDENT REPORTS SECTION (5 VIEWS)
// ====================================================================
function StudentReportsSection({
  subView,
  studentsAtt
}: {
  subView: AttendanceSubView;
  studentsAtt: StudentAttendance[];
}) {
  const getTitle = () => {
    switch (subView) {
      case 'student-report-month': return 'Month-Wise Student Attendance Report';
      case 'student-report-class': return 'Class-Wise Attendance Register';
      case 'student-report-overall': return 'Overall Class Attendance Percentage Summary';
      case 'student-report-date': return 'Date-Wise Student Attendance Audit';
      case 'student-report-live': return 'Live Ongoing Class Attendance Monitor';
      default: return 'Student Attendance Report';
    }
  };

  return (
    <div>
      <div style={{
        backgroundColor: '#8b4570', color: '#ffffff', borderRadius: '8px 8px 0 0',
        padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          {subView === 'student-report-live' && <Radio size={18} color="#ef4444" />}
          {getTitle()} : (Session: 2026-2027)
        </h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => alert('Exporting...')} style={{ backgroundColor: '#0d9488', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '6px 16px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Download size={14} /> Export
          </button>
          <button onClick={() => window.print()} style={{ backgroundColor: '#0d9488', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '6px 20px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
            Print
          </button>
        </div>
      </div>

      <div className="erp-card" style={{ borderRadius: '0 0 8px 8px', marginTop: 0 }}>
        <div className="table-container">
          <table className="erp-table">
            <thead>
              <tr style={{ backgroundColor: '#00696b', color: '#ffffff' }}>
                <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>Roll No</th>
                <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>Student Name</th>
                <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>Class & Sec</th>
                <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>In-Time</th>
                <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>Attendance %</th>
                <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800, textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {studentsAtt.map((std) => (
                <tr key={std.studentId}>
                  <td style={{ fontWeight: 800 }}>{std.rollNo}</td>
                  <td style={{ fontWeight: 800, color: '#0f172a' }}>{std.name}</td>
                  <td style={{ fontWeight: 700, color: '#00696b' }}>{std.className}-{std.section}</td>
                  <td style={{ fontWeight: 600, color: '#475569' }}>{std.inTime}</td>
                  <td style={{ fontWeight: 800, color: '#16a34a' }}>96.5%</td>
                  <td style={{ textAlign: 'center' }}>
                    <span className="erp-badge badge-approved">{std.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <PaginationFooter currentCount={studentsAtt.length} totalCount={studentsAtt.length} />
      </div>
    </div>
  );
}


// ====================================================================
// 5. MARK HOLIDAY SECTION (2 VIEWS)
// ====================================================================
function MarkHolidaySection({
  subView,
  holidays,
  setHolidays,
  showToast
}: {
  subView: AttendanceSubView;
  holidays: HolidayEntry[];
  setHolidays: React.Dispatch<React.SetStateAction<HolidayEntry[]>>;
  showToast: (msg: string) => void;
}) {
  const isStudent = subView === 'holiday-student';
  const [showAddForm, setShowAddForm] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    const created: HolidayEntry = {
      id: `hol-${Date.now()}`,
      title: formData.title,
      targetGroup: isStudent ? 'Student' : 'Faculty',
      startDate: formData.startDate,
      endDate: formData.endDate,
      totalDays: 1,
      description: formData.description || 'Holiday Declaration'
    };

    setHolidays([...holidays, created]);
    showToast(`Holiday "${formData.title}" declared successfully!`);
    setShowAddForm(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            {isStudent ? 'Student Holiday & Vacation Manager' : 'Faculty Non-Working Day Manager'}
          </h3>
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            Declare holidays, festival breaks & non-working days for {isStudent ? 'students' : 'staff'}
          </span>
        </div>
        <button onClick={() => setShowAddForm(!showAddForm)} className="erp-btn btn-primary" style={{ backgroundColor: '#00696b', borderColor: '#00696b' }}>
          <PlusCircle size={14} /> {showAddForm ? 'Close Form' : 'Declare New Holiday'}
        </button>
      </div>

      {showAddForm && (
        <div className="erp-card" style={{ marginBottom: '20px' }}>
          <div className="erp-card-header"><span className="erp-card-title">Declare Holiday</span></div>
          <form onSubmit={handleSubmit} style={{ padding: '16px' }}>
            <div className="form-grid">
              <div className="form-group col-span-2">
                <label>Holiday Title *</label>
                <input type="text" required placeholder="e.g. Diwali Vacation" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Start Date *</label>
                <input type="date" required value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
              </div>
              <div className="form-group">
                <label>End Date *</label>
                <input type="date" required value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} />
              </div>
              <div className="form-group col-span-2">
                <label>Description / Notice</label>
                <input type="text" placeholder="Details..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
              </div>
            </div>
            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="erp-btn btn-primary" style={{ backgroundColor: '#00696b' }}>
                <Check size={14} /> Save & Publish Holiday
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
                <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>Holiday Title</th>
                <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>Target Audience</th>
                <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>Start Date</th>
                <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>End Date</th>
                <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>Description</th>
              </tr>
            </thead>
            <tbody>
              {holidays.map(h => (
                <tr key={h.id}>
                  <td style={{ fontWeight: 800, color: '#0f172a' }}>{h.title}</td>
                  <td style={{ fontWeight: 800, color: '#00696b' }}>{h.targetGroup}</td>
                  <td style={{ fontWeight: 600, color: '#475569' }}>{h.startDate}</td>
                  <td style={{ fontWeight: 600, color: '#475569' }}>{h.endDate}</td>
                  <td style={{ color: '#64748b' }}>{h.description}</td>
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
// 6. ATTENDANCE TIME SETTING SECTION
// ====================================================================
function AttendanceTimeSettingSection({
  timeRules,
  setTimeRules,
  showToast
}: {
  timeRules: any;
  setTimeRules: React.Dispatch<React.SetStateAction<any>>;
  showToast: (msg: string) => void;
}) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Attendance time rules & cutoff settings updated successfully!');
  };

  return (
    <div>
      <div className="erp-card">
        <div className="erp-card-header"><span className="erp-card-title">Attendance Cut-off & Timing Configuration</span></div>
        <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
          <div className="form-grid">
            <div className="form-group">
              <label>School Arrival Time (Normal) *</label>
              <input type="text" value={timeRules.arrivalTime} onChange={e => setTimeRules({ ...timeRules, arrivalTime: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Late Mark Threshold Time *</label>
              <input type="text" value={timeRules.lateThreshold} onChange={e => setTimeRules({ ...timeRules, lateThreshold: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Half-Day Cut-off Time *</label>
              <input type="text" value={timeRules.halfDayCutoff} onChange={e => setTimeRules({ ...timeRules, halfDayCutoff: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Auto-Absent Trigger Time *</label>
              <input type="text" value={timeRules.autoAbsentTime} onChange={e => setTimeRules({ ...timeRules, autoAbsentTime: e.target.value })} />
            </div>
          </div>

          <div style={{ marginTop: '16px' }}>
            <label style={{ fontSize: '13px', color: '#0f172a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" checked={timeRules.enableSMSAlerts} onChange={e => setTimeRules({ ...timeRules, enableSMSAlerts: e.target.checked })} />
              Enable Automatic SMS Alerts to Parents upon Absenteeism
            </label>
          </div>

          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="erp-btn btn-primary" style={{ backgroundColor: '#00696b' }}>
              <Check size={14} /> Update Timing Rules
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


// ====================================================================
// 7. ATTENDANCE SUBJECT SECTION
// ====================================================================
function AttendanceSubjectSection({
  subjectAtt,
  setSubjectAtt,
  showToast
}: {
  subjectAtt: SubjectPeriodAttendance[];
  setSubjectAtt: React.Dispatch<React.SetStateAction<SubjectPeriodAttendance[]>>;
  showToast: (msg: string) => void;
}) {
  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
          Period & Subject-Wise Attendance Log
        </h3>
        <span style={{ fontSize: '12px', color: '#64748b' }}>
          Track attendance taken per teaching period and subject classroom
        </span>
      </div>

      <div className="erp-card">
        <div className="table-container">
          <table className="erp-table">
            <thead>
              <tr style={{ backgroundColor: '#00696b', color: '#ffffff' }}>
                <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>Date</th>
                <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>Class</th>
                <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>Subject</th>
                <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>Faculty</th>
                <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>Period</th>
                <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>Present</th>
                <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>Absent</th>
              </tr>
            </thead>
            <tbody>
              {subjectAtt.map(s => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 600, color: '#475569' }}>{s.date}</td>
                  <td style={{ fontWeight: 800, color: '#00696b' }}>{s.className}-{s.section}</td>
                  <td style={{ fontWeight: 800, color: '#0f172a' }}>{s.subject}</td>
                  <td style={{ fontWeight: 700, color: '#0f172a' }}>{s.teacherName}</td>
                  <td style={{ fontWeight: 700, color: '#00696b' }}>Period {s.periodNo}</td>
                  <td style={{ fontWeight: 800, color: '#16a34a' }}>{s.presentCount} Students</td>
                  <td style={{ fontWeight: 800, color: '#dc2626' }}>{s.absentCount} Students</td>
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
