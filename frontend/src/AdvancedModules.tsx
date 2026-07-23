import React, { useState } from 'react';
import {
  Search, Check, Clock, Calendar, Users, BookOpen,
  PlusCircle, CheckCircle, AlertTriangle, X, FileText,
  DollarSign, MessageSquare, Package, Trash2
} from 'lucide-react';

// --- TYPES ---
interface AttendanceRecord {
  id: string;
  studentName: string;
  class: string;
  section: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'half_day' | 'leave';
}

interface TimetableEntry {
  id: string;
  day: string;
  period: number;
  subject: string;
  teacher: string;
  class: string;
  room: string;
  startTime: string;
  endTime: string;
}

interface ExamRecord {
  id: string;
  examName: string;
  subject: string;
  class: string;
  date: string;
  maxMarks: number;
  passingMarks: number;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
}

interface StaffMember {
  id: string;
  name: string;
  department: string;
  designation: string;
  phone: string;
  email: string;
  joinDate: string;
  salary: number;
  status: 'active' | 'on_leave' | 'resigned';
}

interface LeaveRequest {
  id: string;
  staffName: string;
  type: string;
  from: string;
  to: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface Notice {
  id: string;
  title: string;
  type: 'general' | 'academic' | 'event' | 'emergency' | 'holiday';
  date: string;
  audience: string;
  published: boolean;
}

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  minStock: number;
  location: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

// ==========================================
// 1. ATTENDANCE MODULE VIEW
// ==========================================
export function AttendanceView({ students }: { students: { id: string; name: string; class: string; section: string }[] }) {
  const [selectedClass, setSelectedClass] = useState('Class 5');
  const [selectedSection, setSelectedSection] = useState('Section A');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState<Record<string, string>>({});
  const [savedRecords, setSavedRecords] = useState<AttendanceRecord[]>([
    { id: 'ATT-001', studentName: 'Aarav Sharma', class: 'Class 5', section: 'Section A', date: '2026-07-08', status: 'present' },
    { id: 'ATT-002', studentName: 'Arjun Paul', class: 'Class 5', section: 'Section A', date: '2026-07-08', status: 'absent' },
    { id: 'ATT-003', studentName: 'Priya Das', class: 'Class 4', section: 'Section B', date: '2026-07-08', status: 'present' },
    { id: 'ATT-004', studentName: 'Rohan Ghosh', class: 'Class 6', section: 'Section A', date: '2026-07-08', status: 'late' },
    { id: 'ATT-005', studentName: 'Sneha Mondal', class: 'Class 3', section: 'Section B', date: '2026-07-08', status: 'present' },
  ]);

  const classStudents = students.filter(s => s.class === selectedClass && s.section === selectedSection);
  const presentCount = savedRecords.filter(r => r.date === selectedDate && r.status === 'present').length;
  const absentCount = savedRecords.filter(r => r.date === selectedDate && r.status === 'absent').length;
  const lateCount = savedRecords.filter(r => r.date === selectedDate && (r.status === 'late' || r.status === 'half_day')).length;

  const markAttendance = (studentId: string, status: string) => {
    setAttendanceData(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSaveAttendance = () => {
    const newRecords: AttendanceRecord[] = classStudents
      .filter(s => attendanceData[s.id])
      .map((s, idx) => ({
        id: `ATT-${Date.now()}-${idx}`,
        studentName: s.name,
        class: s.class,
        section: s.section,
        date: selectedDate,
        status: attendanceData[s.id] as any
      }));
    setSavedRecords(prev => [...newRecords, ...prev]);
    setAttendanceData({});
  };

  return (
    <div>
      <div className="view-header">
        <div>
          <h2 className="view-title">Attendance Management</h2>
          <span className="view-subtitle">Mark and track daily student attendance across all classes</span>
        </div>
      </div>

      <div className="metrics-row" style={{ marginBottom: '20px' }}>
        <div className="metric-box" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)', borderColor: '#bbf7d0' }}>
          <div>
            <div className="metric-value" style={{ color: '#047857' }}>{presentCount}</div>
            <div className="metric-label">Present Today</div>
          </div>
          <div style={{ backgroundColor: '#10b981', padding: '10px', borderRadius: '8px' }}>
            <CheckCircle size={20} style={{ color: '#ffffff' }} />
          </div>
        </div>
        <div className="metric-box" style={{ background: 'linear-gradient(135deg, #fef2f2 0%, #ffffff 100%)', borderColor: '#fecaca' }}>
          <div>
            <div className="metric-value" style={{ color: '#dc2626' }}>{absentCount}</div>
            <div className="metric-label">Absent Today</div>
          </div>
          <div style={{ backgroundColor: '#ef4444', padding: '10px', borderRadius: '8px' }}>
            <X size={20} style={{ color: '#ffffff' }} />
          </div>
        </div>
        <div className="metric-box" style={{ background: 'linear-gradient(135deg, #fff7ed 0%, #ffffff 100%)', borderColor: '#ffedd5' }}>
          <div>
            <div className="metric-value" style={{ color: '#2563eb' }}>{lateCount}</div>
            <div className="metric-label">Late / Half Day</div>
          </div>
          <div style={{ backgroundColor: '#f97316', padding: '10px', borderRadius: '8px' }}>
            <Clock size={20} style={{ color: '#ffffff' }} />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', alignItems: 'start' }}>
        <div className="erp-card">
          <div className="erp-card-header" style={{ backgroundColor: '#eff6ff' }}>
            <span className="erp-card-title" style={{ color: '#1e3a8a' }}>Mark Attendance</span>
          </div>
          <div className="erp-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input type="date" className="erp-input" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Class</label>
              <select className="erp-input" value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
                <option>Class 3</option>
                <option>Class 4</option>
                <option>Class 5</option>
                <option>Class 6</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Section</label>
              <select className="erp-input" value={selectedSection} onChange={e => setSelectedSection(e.target.value)}>
                <option>Section A</option>
                <option>Section B</option>
              </select>
            </div>

            {classStudents.length > 0 && (
              <div style={{ marginTop: '12px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Students ({classStudents.length})
                </div>
                {classStudents.map(s => (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600 }}>{s.name}</span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {['present', 'absent', 'late'].map(status => (
                        <button
                          key={status}
                          onClick={() => markAttendance(s.id, status)}
                          className="erp-btn"
                          style={{
                            height: '22px', padding: '0 8px', fontSize: '9px', fontWeight: 700, textTransform: 'uppercase',
                            backgroundColor: attendanceData[s.id] === status
                              ? (status === 'present' ? '#10b981' : status === 'absent' ? '#ef4444' : '#f97316')
                              : '#f1f5f9',
                            color: attendanceData[s.id] === status ? '#fff' : '#64748b',
                            border: 'none'
                          }}
                        >
                          {status === 'present' ? 'P' : status === 'absent' ? 'A' : 'L'}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                <button className="erp-btn btn-primary" style={{ width: '100%', marginTop: '12px' }} onClick={handleSaveAttendance}>
                  Save Attendance
                </button>
              </div>
            )}
            {classStudents.length === 0 && (
              <div style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center', padding: '20px 0' }}>
                No students found for selected class/section
              </div>
            )}
          </div>
        </div>

        <div className="erp-card">
          <div className="erp-card-header">
            <span className="erp-card-title">Recent Attendance Records</span>
          </div>
          <div className="table-container">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Class</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {savedRecords.slice(0, 10).map(rec => (
                  <tr key={rec.id}>
                    <td><strong>{rec.studentName}</strong></td>
                    <td>{rec.class} - {rec.section}</td>
                    <td>{rec.date}</td>
                    <td>
                      <span className={`erp-badge ${
                        rec.status === 'present' ? 'badge-approved' :
                        rec.status === 'absent' ? 'badge-rejected' : 'badge-pending'
                      }`}>
                        {rec.status.charAt(0).toUpperCase() + rec.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 2. TIMETABLE MODULE VIEW
// ==========================================
export function TimetableView({ editable = false }: { editable?: boolean }) {
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [selectedClass, setSelectedClass] = useState('Class 5');
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const [timetable, setTimetable] = useState<TimetableEntry[]>([
    { id: 'TT-01', day: 'Monday', period: 1, subject: 'Mathematics', teacher: 'Sunita Verma', class: 'Class 5', room: 'Room 201', startTime: '09:00', endTime: '09:45' },
    { id: 'TT-02', day: 'Monday', period: 2, subject: 'English', teacher: 'Gurpreet Kaur', class: 'Class 5', room: 'Room 201', startTime: '09:45', endTime: '10:30' },
    { id: 'TT-03', day: 'Monday', period: 3, subject: 'Science', teacher: 'Anand Mishra', class: 'Class 5', room: 'Lab 1', startTime: '10:45', endTime: '11:30' },
    { id: 'TT-04', day: 'Monday', period: 4, subject: 'Hindi', teacher: 'Rajesh Kulkarni', class: 'Class 5', room: 'Room 201', startTime: '11:30', endTime: '12:15' },
    { id: 'TT-05', day: 'Monday', period: 5, subject: 'Social Science', teacher: 'Rajesh Kulkarni', class: 'Class 5', room: 'Room 201', startTime: '01:00', endTime: '01:45' },
    { id: 'TT-06', day: 'Monday', period: 6, subject: 'Computer', teacher: 'Sunita Verma', class: 'Class 5', room: 'Comp Lab', startTime: '01:45', endTime: '02:30' },
    { id: 'TT-07', day: 'Tuesday', period: 1, subject: 'English', teacher: 'Gurpreet Kaur', class: 'Class 5', room: 'Room 201', startTime: '09:00', endTime: '09:45' },
    { id: 'TT-08', day: 'Tuesday', period: 2, subject: 'Mathematics', teacher: 'Sunita Verma', class: 'Class 5', room: 'Room 201', startTime: '09:45', endTime: '10:30' },
    { id: 'TT-09', day: 'Tuesday', period: 3, subject: 'Physical Education', teacher: 'Anand Mishra', class: 'Class 5', room: 'Ground', startTime: '10:45', endTime: '11:30' },
    { id: 'TT-10', day: 'Tuesday', period: 4, subject: 'Art & Craft', teacher: 'Gurpreet Kaur', class: 'Class 5', room: 'Art Room', startTime: '11:30', endTime: '12:15' },
    { id: 'TT-11', day: 'Tuesday', period: 5, subject: 'Science', teacher: 'Anand Mishra', class: 'Class 5', room: 'Lab 1', startTime: '01:00', endTime: '01:45' },
    { id: 'TT-12', day: 'Tuesday', period: 6, subject: 'Mathematics', teacher: 'Sunita Verma', class: 'Class 5', room: 'Room 201', startTime: '01:45', endTime: '02:30' },
    { id: 'TT-13', day: 'Wednesday', period: 1, subject: 'Science', teacher: 'Anand Mishra', class: 'Class 5', room: 'Lab 1', startTime: '09:00', endTime: '09:45' },
    { id: 'TT-14', day: 'Wednesday', period: 2, subject: 'Hindi', teacher: 'Rajesh Kulkarni', class: 'Class 5', room: 'Room 201', startTime: '09:45', endTime: '10:30' },
    { id: 'TT-15', day: 'Wednesday', period: 3, subject: 'Mathematics', teacher: 'Sunita Verma', class: 'Class 5', room: 'Room 201', startTime: '10:45', endTime: '11:30' },
    { id: 'TT-16', day: 'Wednesday', period: 4, subject: 'English', teacher: 'Gurpreet Kaur', class: 'Class 5', room: 'Room 201', startTime: '11:30', endTime: '12:15' },
    { id: 'TT-17', day: 'Wednesday', period: 5, subject: 'Social Science', teacher: 'Rajesh Kulkarni', class: 'Class 5', room: 'Room 201', startTime: '01:00', endTime: '01:45' },
    { id: 'TT-18', day: 'Wednesday', period: 6, subject: 'Library', teacher: 'Gurpreet Kaur', class: 'Class 5', room: 'Library', startTime: '01:45', endTime: '02:30' },
    { id: 'TT-19', day: 'Thursday', period: 1, subject: 'Hindi', teacher: 'Rajesh Kulkarni', class: 'Class 5', room: 'Room 201', startTime: '09:00', endTime: '09:45' },
    { id: 'TT-20', day: 'Thursday', period: 2, subject: 'Science', teacher: 'Anand Mishra', class: 'Class 5', room: 'Lab 1', startTime: '09:45', endTime: '10:30' },
    { id: 'TT-21', day: 'Thursday', period: 3, subject: 'English', teacher: 'Gurpreet Kaur', class: 'Class 5', room: 'Room 201', startTime: '10:45', endTime: '11:30' },
    { id: 'TT-22', day: 'Thursday', period: 4, subject: 'Mathematics', teacher: 'Sunita Verma', class: 'Class 5', room: 'Room 201', startTime: '11:30', endTime: '12:15' },
    { id: 'TT-23', day: 'Thursday', period: 5, subject: 'Computer', teacher: 'Sunita Verma', class: 'Class 5', room: 'Comp Lab', startTime: '01:00', endTime: '01:45' },
    { id: 'TT-24', day: 'Thursday', period: 6, subject: 'Physical Education', teacher: 'Anand Mishra', class: 'Class 5', room: 'Ground', startTime: '01:45', endTime: '02:30' },
    { id: 'TT-25', day: 'Friday', period: 1, subject: 'Mathematics', teacher: 'Sunita Verma', class: 'Class 5', room: 'Room 201', startTime: '09:00', endTime: '09:45' },
    { id: 'TT-26', day: 'Friday', period: 2, subject: 'Science', teacher: 'Anand Mishra', class: 'Class 5', room: 'Lab 1', startTime: '09:45', endTime: '10:30' },
    { id: 'TT-27', day: 'Friday', period: 3, subject: 'Hindi', teacher: 'Rajesh Kulkarni', class: 'Class 5', room: 'Room 201', startTime: '10:45', endTime: '11:30' },
    { id: 'TT-28', day: 'Friday', period: 4, subject: 'English', teacher: 'Gurpreet Kaur', class: 'Class 5', room: 'Room 201', startTime: '11:30', endTime: '12:15' },
    { id: 'TT-29', day: 'Friday', period: 5, subject: 'Art & Craft', teacher: 'Gurpreet Kaur', class: 'Class 5', room: 'Art Room', startTime: '01:00', endTime: '01:45' },
    { id: 'TT-30', day: 'Friday', period: 6, subject: 'Social Science', teacher: 'Rajesh Kulkarni', class: 'Class 5', room: 'Room 201', startTime: '01:45', endTime: '02:30' },
    { id: 'TT-31', day: 'Saturday', period: 1, subject: 'Mathematics', teacher: 'Sunita Verma', class: 'Class 5', room: 'Room 201', startTime: '09:00', endTime: '09:45' },
    { id: 'TT-32', day: 'Saturday', period: 2, subject: 'English', teacher: 'Gurpreet Kaur', class: 'Class 5', room: 'Room 201', startTime: '09:45', endTime: '10:30' },
    { id: 'TT-33', day: 'Saturday', period: 3, subject: 'Science', teacher: 'Anand Mishra', class: 'Class 5', room: 'Lab 1', startTime: '10:45', endTime: '11:30' },
    { id: 'TT-34', day: 'Saturday', period: 4, subject: 'Activity Period', teacher: 'Gurpreet Kaur', class: 'Class 5', room: 'Hall', startTime: '11:30', endTime: '12:15' },
  ]);

  const filteredTimetable = timetable.filter(t => t.day === selectedDay && t.class === selectedClass);

  const subjectColors: Record<string, string> = {
    'Mathematics': '#2563eb', 'English': '#7c3aed', 'Science': '#10b981',
    'Hindi': '#2563eb', 'Social Science': '#ca8a04', 'Computer': '#0284c7',
    'Physical Education': '#10b981', 'Art & Craft': '#e11d48', 'Library': '#6366f1',
    'Activity Period': '#f59e0b'
  };

  const subjects = ['Mathematics', 'English', 'Science', 'Hindi', 'Social Science', 'Computer', 'Physical Education', 'Art & Craft', 'Library', 'Activity Period'];
  const teachers = ['Sunita Verma', 'Gurpreet Kaur', 'Anand Mishra', 'Rajesh Kulkarni'];
  const rooms = ['Room 201', 'Room 202', 'Lab 1', 'Comp Lab', 'Art Room', 'Ground', 'Library', 'Hall'];

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editSubject, setEditSubject] = useState('');
  const [editTeacher, setEditTeacher] = useState('');
  const [editRoom, setEditRoom] = useState('');

  const [showAddForm, setShowAddForm] = useState(false);
  const [newSubject, setNewSubject] = useState('Mathematics');
  const [newTeacher, setNewTeacher] = useState('Sunita Verma');
  const [newRoom, setNewRoom] = useState('Room 201');
  const [newStart, setNewStart] = useState('09:00');
  const [newEnd, setNewEnd] = useState('09:45');

  const startEdit = (entry: TimetableEntry) => {
    setEditingId(entry.id);
    setEditSubject(entry.subject);
    setEditTeacher(entry.teacher);
    setEditRoom(entry.room);
  };

  const saveEdit = (id: string) => {
    setTimetable(prev => prev.map(t => t.id === id ? { ...t, subject: editSubject, teacher: editTeacher, room: editRoom } : t));
    setEditingId(null);
  };

  const deleteEntry = (id: string) => {
    setTimetable(prev => prev.filter(t => t.id !== id));
  };

  const addEntry = () => {
    const nextPeriod = filteredTimetable.length + 1;
    const newEntry: TimetableEntry = {
      id: `TT-${Date.now()}`,
      day: selectedDay,
      period: nextPeriod,
      subject: newSubject,
      teacher: newTeacher,
      class: selectedClass,
      room: newRoom,
      startTime: newStart,
      endTime: newEnd
    };
    setTimetable(prev => [...prev, newEntry]);
    setShowAddForm(false);
  };

  return (
    <div>
      <div className="view-header">
        <div>
          <h2 className="view-title">Class Timetable</h2>
          <span className="view-subtitle">Weekly period schedule with subject and teacher assignment</span>
        </div>
        {editable && (
          <button className="erp-btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
            <PlusCircle size={14} style={{ marginRight: '4px' }} /> Add Period
          </button>
        )}
      </div>

      {editable && showAddForm && (
        <div className="erp-card" style={{ marginBottom: '20px' }}>
          <div className="erp-card-header" style={{ backgroundColor: '#eff6ff' }}>
            <span className="erp-card-title" style={{ color: '#1e3a8a' }}>Add New Period — {selectedDay}, {selectedClass}</span>
          </div>
          <div className="erp-card-body" style={{ padding: '16px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ flex: 1, minWidth: '130px' }}>
              <label className="form-label">Subject</label>
              <select className="erp-input" value={newSubject} onChange={e => setNewSubject(e.target.value)}>
                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ flex: 1, minWidth: '130px' }}>
              <label className="form-label">Teacher</label>
              <select className="erp-input" value={newTeacher} onChange={e => setNewTeacher(e.target.value)}>
                {teachers.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ flex: 1, minWidth: '100px' }}>
              <label className="form-label">Room</label>
              <select className="erp-input" value={newRoom} onChange={e => setNewRoom(e.target.value)}>
                {rooms.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ minWidth: '90px' }}>
              <label className="form-label">Start</label>
              <input type="time" className="erp-input" value={newStart} onChange={e => setNewStart(e.target.value)} />
            </div>
            <div className="form-group" style={{ minWidth: '90px' }}>
              <label className="form-label">End</label>
              <input type="time" className="erp-input" value={newEnd} onChange={e => setNewEnd(e.target.value)} />
            </div>
            <button className="erp-btn btn-primary" style={{ height: '34px' }} onClick={addEntry}>Save</button>
            <button className="erp-btn btn-outline" style={{ height: '34px' }} onClick={() => setShowAddForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="erp-card" style={{ marginBottom: '20px' }}>
        <div className="erp-card-body" style={{ padding: '12px', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select className="erp-input" style={{ width: '140px' }} value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
            <option>Class 3</option>
            <option>Class 4</option>
            <option>Class 5</option>
            <option>Class 6</option>
          </select>
          <div style={{ display: 'flex', gap: '4px' }}>
            {days.map(day => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className="erp-btn"
                style={{
                  height: '30px', padding: '0 12px', fontSize: '11px', fontWeight: 600,
                  backgroundColor: selectedDay === day ? '#1e3a8a' : '#f1f5f9',
                  color: selectedDay === day ? '#fff' : '#475569',
                  border: selectedDay === day ? 'none' : '1px solid #e2e8f0'
                }}
              >
                {day.substring(0, 3)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="erp-card">
        <div className="erp-card-header">
          <span className="erp-card-title">{selectedDay} — {selectedClass}</span>
          <span style={{ fontSize: '11px', color: '#64748b' }}>{filteredTimetable.length} Periods</span>
        </div>
        <div className="erp-card-body" style={{ padding: '16px' }}>
          {filteredTimetable.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {filteredTimetable.map(entry => (
                <div key={entry.id} style={{
                  display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 16px',
                  backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0'
                }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: subjectColors[entry.subject] || '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '12px' }}>
                    P{entry.period}
                  </div>
                  {editingId === entry.id ? (
                    <>
                      <div style={{ flex: 1, display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <select className="erp-input" style={{ width: '120px', height: '28px', fontSize: '11px' }} value={editSubject} onChange={e => setEditSubject(e.target.value)}>
                          {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <select className="erp-input" style={{ width: '120px', height: '28px', fontSize: '11px' }} value={editTeacher} onChange={e => setEditTeacher(e.target.value)}>
                          {teachers.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <select className="erp-input" style={{ width: '100px', height: '28px', fontSize: '11px' }} value={editRoom} onChange={e => setEditRoom(e.target.value)}>
                          {rooms.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button onClick={() => saveEdit(entry.id)} className="erp-btn" style={{ height: '24px', padding: '0 8px', fontSize: '9px', backgroundColor: '#10b981', color: '#fff', border: 'none' }}>Save</button>
                        <button onClick={() => setEditingId(null)} className="erp-btn" style={{ height: '24px', padding: '0 8px', fontSize: '9px', backgroundColor: '#64748b', color: '#fff', border: 'none' }}>Cancel</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>{entry.subject}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{entry.teacher} &bull; {entry.room}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 600, fontSize: '12px', color: '#0f172a' }}>{entry.startTime} - {entry.endTime}</div>
                        <div style={{ fontSize: '10px', color: '#94a3b8' }}>45 min</div>
                      </div>
                      {editable && (
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button onClick={() => startEdit(entry)} className="erp-btn" style={{ height: '24px', padding: '0 8px', fontSize: '9px', backgroundColor: '#2563eb', color: '#fff', border: 'none' }}>Edit</button>
                          <button onClick={() => deleteEntry(entry.id)} className="erp-btn" style={{ height: '24px', padding: '0 8px', fontSize: '9px', backgroundColor: '#ef4444', color: '#fff', border: 'none' }}>Del</button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
              {filteredTimetable.length >= 4 && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '16px', padding: '10px 16px',
                  backgroundColor: '#fef3c7', borderRadius: '8px', border: '1px dashed #f59e0b'
                }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '10px' }}>
                    BRK
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '13px', color: '#92400e' }}>Lunch Break</div>
                    <div style={{ fontSize: '11px', color: '#a16207' }}>Canteen / Playground</div>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '12px', color: '#92400e' }}>12:15 - 01:00</div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
              <Calendar size={32} style={{ marginBottom: '8px', opacity: 0.5 }} />
              <div style={{ fontSize: '13px' }}>No timetable entries for this selection</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 3. EXAMINATION MODULE VIEW
// ==========================================
export function ExaminationView({ students }: { students: { id: string; name: string; class: string }[] }) {
  const [activeTab, setActiveTab] = useState<'schedule' | 'results' | 'report_cards'>('schedule');
  const [exams] = useState<ExamRecord[]>([
    { id: 'EXM-01', examName: 'Unit Test 1', subject: 'Mathematics', class: 'Class 5', date: '2026-07-15', maxMarks: 50, passingMarks: 18, status: 'scheduled' },
    { id: 'EXM-02', examName: 'Unit Test 1', subject: 'Science', class: 'Class 5', date: '2026-07-16', maxMarks: 50, passingMarks: 18, status: 'scheduled' },
    { id: 'EXM-03', examName: 'Unit Test 1', subject: 'English', class: 'Class 5', date: '2026-07-17', maxMarks: 50, passingMarks: 18, status: 'scheduled' },
    { id: 'EXM-04', examName: 'Unit Test 1', subject: 'Hindi', class: 'Class 5', date: '2026-07-18', maxMarks: 50, passingMarks: 18, status: 'scheduled' },
    { id: 'EXM-05', examName: 'Mid Term', subject: 'Mathematics', class: 'Class 5', date: '2026-09-10', maxMarks: 100, passingMarks: 35, status: 'scheduled' },
    { id: 'EXM-06', examName: 'Mid Term', subject: 'Science', class: 'Class 5', date: '2026-09-12', maxMarks: 100, passingMarks: 35, status: 'scheduled' },
    { id: 'EXM-07', examName: 'Half Yearly', subject: 'Mathematics', class: 'Class 4', date: '2026-10-01', maxMarks: 100, passingMarks: 35, status: 'scheduled' },
  ]);

  const [results] = useState([
    { student: 'Aarav Sharma', class: 'Class 5', subject: 'Mathematics', marks: 42, maxMarks: 50, grade: 'A+' },
    { student: 'Aarav Sharma', class: 'Class 5', subject: 'Science', marks: 38, maxMarks: 50, grade: 'A' },
    { student: 'Priya Das', class: 'Class 4', subject: 'Mathematics', marks: 45, maxMarks: 50, grade: 'A+' },
    { student: 'Priya Das', class: 'Class 4', subject: 'English', marks: 40, maxMarks: 50, grade: 'A' },
    { student: 'Rohan Ghosh', class: 'Class 6', subject: 'Mathematics', marks: 28, maxMarks: 50, grade: 'B' },
    { student: 'Rohan Ghosh', class: 'Class 6', subject: 'Science', marks: 22, maxMarks: 50, grade: 'C' },
  ]);

  return (
    <div>
      <div className="view-header">
        <div>
          <h2 className="view-title">Examination Module</h2>
          <span className="view-subtitle">Schedule exams, enter marks, and generate report cards</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {(['schedule', 'results', 'report_cards'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="erp-btn"
            style={{
              height: '32px', padding: '0 16px', fontSize: '11px', fontWeight: 600,
              backgroundColor: activeTab === tab ? '#1e3a8a' : '#f1f5f9',
              color: activeTab === tab ? '#fff' : '#475569',
              border: activeTab === tab ? 'none' : '1px solid #e2e8f0'
            }}
          >
            {tab === 'schedule' ? 'Exam Schedule' : tab === 'results' ? 'Mark Entry' : 'Report Cards'}
          </button>
        ))}
      </div>

      {activeTab === 'schedule' && (
        <div className="erp-card">
          <div className="erp-card-header">
            <span className="erp-card-title">Upcoming Examinations</span>
          </div>
          <div className="table-container">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Exam</th>
                  <th>Subject</th>
                  <th>Class</th>
                  <th>Date</th>
                  <th>Max Marks</th>
                  <th>Pass Marks</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {exams.map(exam => (
                  <tr key={exam.id}>
                    <td><strong>{exam.examName}</strong></td>
                    <td>{exam.subject}</td>
                    <td>{exam.class}</td>
                    <td>{exam.date}</td>
                    <td>{exam.maxMarks}</td>
                    <td>{exam.passingMarks}</td>
                    <td>
                      <span className={`erp-badge ${
                        exam.status === 'completed' ? 'badge-approved' :
                        exam.status === 'scheduled' ? 'badge-pending' : 'badge-rejected'
                      }`}>
                        {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'results' && (
        <div className="erp-card">
          <div className="erp-card-header">
            <span className="erp-card-title">Student Results — Unit Test 1</span>
          </div>
          <div className="table-container">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Class</th>
                  <th>Subject</th>
                  <th>Marks</th>
                  <th>Percentage</th>
                  <th>Grade</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, idx) => (
                  <tr key={idx}>
                    <td><strong>{r.student}</strong></td>
                    <td>{r.class}</td>
                    <td>{r.subject}</td>
                    <td>{r.marks} / {r.maxMarks}</td>
                    <td>{((r.marks / r.maxMarks) * 100).toFixed(0)}%</td>
                    <td>
                      <span style={{ fontWeight: 700, color: r.grade.startsWith('A') ? '#10b981' : r.grade === 'B' ? '#2563eb' : '#2563eb' }}>
                        {r.grade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'report_cards' && (
        <div className="erp-card">
          <div className="erp-card-header">
            <span className="erp-card-title">Report Card Generation</span>
          </div>
          <div className="erp-card-body" style={{ padding: '24px', textAlign: 'center' }}>
            <FileText size={40} style={{ color: '#94a3b8', marginBottom: '12px' }} />
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Report Cards Ready</div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '16px' }}>
              Generate consolidated report cards after all exams are completed and results entered.
            </div>
            <button className="erp-btn btn-primary">Generate Report Cards for Class 5</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 4. HR & STAFF MODULE VIEW
// ==========================================
export function HRView() {
  const [activeTab, setActiveTab] = useState<'staff' | 'leave' | 'payroll'>('staff');
  const [staffList] = useState<StaffMember[]>([
    { id: 'EMP-001', name: 'Sunita Verma', department: 'Academics', designation: 'Senior Teacher', phone: '9876543210', email: 'sunita@school.com', joinDate: '2020-04-01', salary: 45000, status: 'active' },
    { id: 'EMP-002', name: 'Anand Mishra', department: 'Academics', designation: 'Teacher', phone: '9898765432', email: 'anand@school.com', joinDate: '2021-06-15', salary: 38000, status: 'active' },
    { id: 'EMP-003', name: 'Rajesh Kulkarni', department: 'Academics', designation: 'Teacher', phone: '9123450987', email: 'rajesh@school.com', joinDate: '2019-08-01', salary: 42000, status: 'on_leave' },
    { id: 'EMP-004', name: 'Gurpreet Kaur', department: 'Academics', designation: 'Teacher', phone: '9009887766', email: 'gurpreet@school.com', joinDate: '2022-01-10', salary: 35000, status: 'active' },
    { id: 'EMP-005', name: 'Ramesh Yadav', department: 'Administration', designation: 'Office Manager', phone: '9876000111', email: 'ramesh@school.com', joinDate: '2018-03-01', salary: 32000, status: 'active' },
    { id: 'EMP-006', name: 'Pooja Sharma', department: 'Accounts', designation: 'Accountant', phone: '9811223344', email: 'pooja@school.com', joinDate: '2021-09-01', salary: 30000, status: 'active' },
    { id: 'EMP-007', name: 'Suresh Kumar', department: 'Transport', designation: 'Transport Manager', phone: '9765432100', email: 'suresh@school.com', joinDate: '2020-11-15', salary: 28000, status: 'active' },
    { id: 'EMP-008', name: 'Meera Nair', department: 'Library', designation: 'Librarian', phone: '9654321000', email: 'meera@school.com', joinDate: '2023-02-01', salary: 26000, status: 'active' },
  ]);

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([
    { id: 'LV-01', staffName: 'Rajesh Kulkarni', type: 'Sick Leave', from: '2026-07-08', to: '2026-07-10', days: 3, reason: 'Fever and cold', status: 'approved' },
    { id: 'LV-02', staffName: 'Sunita Verma', type: 'Casual Leave', from: '2026-07-15', to: '2026-07-15', days: 1, reason: 'Personal work', status: 'pending' },
    { id: 'LV-03', staffName: 'Gurpreet Kaur', type: 'Casual Leave', from: '2026-07-20', to: '2026-07-21', days: 2, reason: 'Family function', status: 'pending' },
  ]);

  const approveLeave = (id: string) => {
    setLeaveRequests(prev => prev.map(l => l.id === id ? { ...l, status: 'approved' as const } : l));
  };

  const rejectLeave = (id: string) => {
    setLeaveRequests(prev => prev.map(l => l.id === id ? { ...l, status: 'rejected' as const } : l));
  };

  const totalSalary = staffList.reduce((sum, s) => sum + s.salary, 0);

  return (
    <div>
      <div className="view-header">
        <div>
          <h2 className="view-title">HR & Staff Management</h2>
          <span className="view-subtitle">Employee records, leave management, and payroll processing</span>
        </div>
      </div>

      <div className="metrics-row" style={{ marginBottom: '20px' }}>
        <div className="metric-box" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)', borderColor: '#bfdbfe' }}>
          <div>
            <div className="metric-value" style={{ color: '#1e3a8a' }}>{staffList.length}</div>
            <div className="metric-label">Total Staff</div>
          </div>
          <div style={{ backgroundColor: '#2563eb', padding: '10px', borderRadius: '8px' }}>
            <Users size={20} style={{ color: '#ffffff' }} />
          </div>
        </div>
        <div className="metric-box" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)', borderColor: '#bbf7d0' }}>
          <div>
            <div className="metric-value" style={{ color: '#047857' }}>{staffList.filter(s => s.status === 'active').length}</div>
            <div className="metric-label">Active Today</div>
          </div>
          <div style={{ backgroundColor: '#10b981', padding: '10px', borderRadius: '8px' }}>
            <CheckCircle size={20} style={{ color: '#ffffff' }} />
          </div>
        </div>
        <div className="metric-box" style={{ background: 'linear-gradient(135deg, #fff7ed 0%, #ffffff 100%)', borderColor: '#ffedd5' }}>
          <div>
            <div className="metric-value" style={{ color: '#2563eb' }}>{leaveRequests.filter(l => l.status === 'pending').length}</div>
            <div className="metric-label">Pending Leaves</div>
          </div>
          <div style={{ backgroundColor: '#f97316', padding: '10px', borderRadius: '8px' }}>
            <Clock size={20} style={{ color: '#ffffff' }} />
          </div>
        </div>
        <div className="metric-box" style={{ background: 'linear-gradient(135deg, #faf5ff 0%, #ffffff 100%)', borderColor: '#f3e8ff' }}>
          <div>
            <div className="metric-value" style={{ color: '#6b21a8' }}>₹{(totalSalary / 1000).toFixed(0)}k</div>
            <div className="metric-label">Monthly Payroll</div>
          </div>
          <div style={{ backgroundColor: '#7c3aed', padding: '10px', borderRadius: '8px' }}>
            <DollarSign size={20} style={{ color: '#ffffff' }} />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {(['staff', 'leave', 'payroll'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="erp-btn"
            style={{
              height: '32px', padding: '0 16px', fontSize: '11px', fontWeight: 600,
              backgroundColor: activeTab === tab ? '#1e3a8a' : '#f1f5f9',
              color: activeTab === tab ? '#fff' : '#475569',
              border: activeTab === tab ? 'none' : '1px solid #e2e8f0'
            }}
          >
            {tab === 'staff' ? 'Employee Directory' : tab === 'leave' ? 'Leave Management' : 'Payroll'}
          </button>
        ))}
      </div>

      {activeTab === 'staff' && (
        <div className="erp-card">
          <div className="erp-card-header">
            <span className="erp-card-title">Employee Directory</span>
          </div>
          <div className="table-container">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Phone</th>
                  <th>Joined</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {staffList.map(staff => (
                  <tr key={staff.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{staff.id}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#1d4ed8', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '10px' }}>
                          {staff.name.substring(0, 2).toUpperCase()}
                        </div>
                        <strong>{staff.name}</strong>
                      </div>
                    </td>
                    <td>{staff.department}</td>
                    <td>{staff.designation}</td>
                    <td>{staff.phone}</td>
                    <td>{staff.joinDate}</td>
                    <td>
                      <span className={`erp-badge ${staff.status === 'active' ? 'badge-approved' : staff.status === 'on_leave' ? 'badge-pending' : 'badge-rejected'}`}>
                        {staff.status === 'active' ? 'Active' : staff.status === 'on_leave' ? 'On Leave' : 'Resigned'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'leave' && (
        <div className="erp-card">
          <div className="erp-card-header">
            <span className="erp-card-title">Leave Requests</span>
          </div>
          <div className="table-container">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Staff</th>
                  <th>Type</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {leaveRequests.map(leave => (
                  <tr key={leave.id}>
                    <td><strong>{leave.staffName}</strong></td>
                    <td>{leave.type}</td>
                    <td>{leave.from}</td>
                    <td>{leave.to}</td>
                    <td>{leave.days}</td>
                    <td>{leave.reason}</td>
                    <td>
                      <span className={`erp-badge ${leave.status === 'approved' ? 'badge-approved' : leave.status === 'pending' ? 'badge-pending' : 'badge-rejected'}`}>
                        {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      {leave.status === 'pending' && (
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button onClick={() => approveLeave(leave.id)} className="erp-btn" style={{ height: '22px', padding: '0 8px', fontSize: '9px', backgroundColor: '#10b981', color: '#fff', border: 'none' }}>Approve</button>
                          <button onClick={() => rejectLeave(leave.id)} className="erp-btn" style={{ height: '22px', padding: '0 8px', fontSize: '9px', backgroundColor: '#ef4444', color: '#fff', border: 'none' }}>Reject</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'payroll' && (
        <div className="erp-card">
          <div className="erp-card-header">
            <span className="erp-card-title">Monthly Payroll — July 2026</span>
          </div>
          <div className="table-container">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Basic</th>
                  <th>HRA</th>
                  <th>Deductions</th>
                  <th>Net Salary</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {staffList.map(staff => {
                  const hra = Math.round(staff.salary * 0.2);
                  const deductions = Math.round(staff.salary * 0.12);
                  const net = staff.salary + hra - deductions;
                  return (
                    <tr key={staff.id}>
                      <td><strong>{staff.name}</strong></td>
                      <td>{staff.department}</td>
                      <td>₹{staff.salary.toLocaleString()}</td>
                      <td>₹{hra.toLocaleString()}</td>
                      <td style={{ color: '#ef4444' }}>-₹{deductions.toLocaleString()}</td>
                      <td style={{ fontWeight: 700, color: '#10b981' }}>₹{net.toLocaleString()}</td>
                      <td><span className="erp-badge badge-pending">Pending</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '12px 16px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>
              Total Net Payroll: ₹{staffList.reduce((sum, s) => sum + Math.round(s.salary * 1.08), 0).toLocaleString()}
            </span>
            <button className="erp-btn btn-primary" style={{ height: '30px', fontSize: '11px' }}>Process All Payments</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 5. COMMUNICATION MODULE VIEW
// ==========================================
export function CommunicationView() {
  const [activeTab, setActiveTab] = useState<'notices' | 'sms'>('notices');
  const [notices, setNotices] = useState<Notice[]>([
    { id: 'NT-01', title: 'Summer Vacation Announcement', type: 'holiday', date: '2026-07-01', audience: 'All', published: true },
    { id: 'NT-02', title: 'Unit Test 1 Schedule Released', type: 'academic', date: '2026-07-05', audience: 'Class 5, Class 6', published: true },
    { id: 'NT-03', title: 'PTA Meeting on July 18', type: 'event', date: '2026-07-07', audience: 'Parents', published: false },
    { id: 'NT-04', title: 'Sports Day Registration Open', type: 'event', date: '2026-07-09', audience: 'All Students', published: true },
    { id: 'NT-05', title: 'Library Week Celebration', type: 'general', date: '2026-07-10', audience: 'All', published: false },
  ]);

  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<Notice['type']>('general');
  const [newAudience, setNewAudience] = useState('All');

  const handlePublish = (id: string) => {
    setNotices(prev => prev.map(n => n.id === id ? { ...n, published: true } : n));
  };

  const handleAddNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;
    const notice: Notice = {
      id: `NT-${Date.now()}`,
      title: newTitle,
      type: newType,
      date: new Date().toISOString().split('T')[0],
      audience: newAudience,
      published: false
    };
    setNotices(prev => [notice, ...prev]);
    setNewTitle('');
  };

  const typeColors: Record<string, string> = {
    general: '#64748b', academic: '#2563eb', event: '#7c3aed', emergency: '#ef4444', holiday: '#10b981'
  };

  return (
    <div>
      <div className="view-header">
        <div>
          <h2 className="view-title">Communication Center</h2>
          <span className="view-subtitle">Notices, circulars, and SMS communication to students and parents</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <button onClick={() => setActiveTab('notices')} className="erp-btn" style={{ height: '32px', padding: '0 16px', fontSize: '11px', fontWeight: 600, backgroundColor: activeTab === 'notices' ? '#1e3a8a' : '#f1f5f9', color: activeTab === 'notices' ? '#fff' : '#475569', border: activeTab === 'notices' ? 'none' : '1px solid #e2e8f0' }}>
          Notices & Circulars
        </button>
        <button onClick={() => setActiveTab('sms')} className="erp-btn" style={{ height: '32px', padding: '0 16px', fontSize: '11px', fontWeight: 600, backgroundColor: activeTab === 'sms' ? '#1e3a8a' : '#f1f5f9', color: activeTab === 'sms' ? '#fff' : '#475569', border: activeTab === 'sms' ? 'none' : '1px solid #e2e8f0' }}>
          SMS Gateway
        </button>
      </div>

      {activeTab === 'notices' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', alignItems: 'start' }}>
          <div className="erp-card">
            <div className="erp-card-header" style={{ backgroundColor: '#eff6ff' }}>
              <span className="erp-card-title" style={{ color: '#1e3a8a' }}>Create Notice</span>
            </div>
            <form className="erp-card-body" onSubmit={handleAddNotice} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input type="text" className="erp-input" placeholder="Notice title..." value={newTitle} onChange={e => setNewTitle(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select className="erp-input" value={newType} onChange={e => setNewType(e.target.value as any)}>
                  <option value="general">General</option>
                  <option value="academic">Academic</option>
                  <option value="event">Event</option>
                  <option value="emergency">Emergency</option>
                  <option value="holiday">Holiday</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Target Audience</label>
                <select className="erp-input" value={newAudience} onChange={e => setNewAudience(e.target.value)}>
                  <option value="All">All</option>
                  <option value="Students">All Students</option>
                  <option value="Parents">Parents</option>
                  <option value="Staff">Staff Only</option>
                  <option value="Class 5">Class 5</option>
                  <option value="Class 6">Class 6</option>
                </select>
              </div>
              <button type="submit" className="erp-btn btn-primary" style={{ marginTop: '8px' }}>
                <PlusCircle size={14} style={{ marginRight: '4px' }} /> Create Notice
              </button>
            </form>
          </div>

          <div className="erp-card">
            <div className="erp-card-header">
              <span className="erp-card-title">Notice Board</span>
            </div>
            <div className="table-container">
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Date</th>
                    <th>Audience</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {notices.map(notice => (
                    <tr key={notice.id}>
                      <td><strong>{notice.title}</strong></td>
                      <td>
                        <span style={{ fontSize: '10px', fontWeight: 700, color: typeColors[notice.type], textTransform: 'uppercase' }}>
                          {notice.type}
                        </span>
                      </td>
                      <td>{notice.date}</td>
                      <td>{notice.audience}</td>
                      <td>
                        <span className={`erp-badge ${notice.published ? 'badge-approved' : 'badge-pending'}`}>
                          {notice.published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td>
                        {!notice.published && (
                          <button onClick={() => handlePublish(notice.id)} className="erp-btn" style={{ height: '22px', padding: '0 8px', fontSize: '9px', backgroundColor: '#10b981', color: '#fff', border: 'none' }}>Publish</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'sms' && (
        <div className="erp-card">
          <div className="erp-card-header">
            <span className="erp-card-title">SMS Gateway</span>
          </div>
          <div className="erp-card-body" style={{ padding: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div className="form-group">
                <label className="form-label">Recipient Group</label>
                <select className="erp-input">
                  <option>All Parents</option>
                  <option>Class 5 Parents</option>
                  <option>Class 6 Parents</option>
                  <option>All Staff</option>
                  <option>Transport Parents</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Template</label>
                <select className="erp-input">
                  <option>Fee Reminder</option>
                  <option>Attendance Alert</option>
                  <option>Event Notification</option>
                  <option>Holiday Notice</option>
                  <option>Custom Message</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Message</label>
              <textarea className="erp-input" style={{ height: '80px', resize: 'none' }} placeholder="Type your message here... (160 chars per SMS)" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
              <span style={{ fontSize: '11px', color: '#64748b' }}>SMS Credits: 450 remaining</span>
              <button className="erp-btn btn-primary">
                <MessageSquare size={14} style={{ marginRight: '4px' }} /> Send SMS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 6. INVENTORY MODULE VIEW
// ==========================================
export function InventoryView() {
  const [items, setItems] = useState<InventoryItem[]>([
    { id: 'INV-001', name: 'Whiteboard Markers (Pack of 10)', category: 'Stationery', quantity: 45, minStock: 20, location: 'Store Room A', status: 'in_stock' },
    { id: 'INV-002', name: 'A4 Paper Ream (500 sheets)', category: 'Stationery', quantity: 12, minStock: 10, location: 'Store Room A', status: 'in_stock' },
    { id: 'INV-003', name: 'Projector Bulb', category: 'Electronics', quantity: 3, minStock: 5, location: 'IT Room', status: 'low_stock' },
    { id: 'INV-004', name: 'First Aid Kit', category: 'Medical', quantity: 8, minStock: 5, location: 'Medical Room', status: 'in_stock' },
    { id: 'INV-005', name: 'Cricket Bat (Senior)', category: 'Sports', quantity: 6, minStock: 4, location: 'Sports Room', status: 'in_stock' },
    { id: 'INV-006', name: 'Lab Beakers (250ml)', category: 'Lab Equipment', quantity: 2, minStock: 10, location: 'Science Lab', status: 'low_stock' },
    { id: 'INV-007', name: 'Desk Chair (Student)', category: 'Furniture', quantity: 0, minStock: 5, location: 'Warehouse', status: 'out_of_stock' },
    { id: 'INV-008', name: 'Wall Clock (Battery)', category: 'General', quantity: 15, minStock: 5, location: 'Store Room B', status: 'in_stock' },
  ]);

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const filteredItems = items.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.category.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === '' || item.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const inStock = items.filter(i => i.status === 'in_stock').length;
  const lowStock = items.filter(i => i.status === 'low_stock').length;
  const outOfStock = items.filter(i => i.status === 'out_of_stock').length;

  return (
    <div>
      <div className="view-header">
        <div>
          <h2 className="view-title">Inventory Management</h2>
          <span className="view-subtitle">School assets, supplies, and procurement tracking</span>
        </div>
      </div>

      <div className="metrics-row" style={{ marginBottom: '20px' }}>
        <div className="metric-box" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)', borderColor: '#bbf7d0' }}>
          <div>
            <div className="metric-value" style={{ color: '#047857' }}>{inStock}</div>
            <div className="metric-label">In Stock</div>
          </div>
          <div style={{ backgroundColor: '#10b981', padding: '10px', borderRadius: '8px' }}>
            <Package size={20} style={{ color: '#ffffff' }} />
          </div>
        </div>
        <div className="metric-box" style={{ background: 'linear-gradient(135deg, #fff7ed 0%, #ffffff 100%)', borderColor: '#ffedd5' }}>
          <div>
            <div className="metric-value" style={{ color: '#2563eb' }}>{lowStock}</div>
            <div className="metric-label">Low Stock</div>
          </div>
          <div style={{ backgroundColor: '#f97316', padding: '10px', borderRadius: '8px' }}>
            <AlertTriangle size={20} style={{ color: '#ffffff' }} />
          </div>
        </div>
        <div className="metric-box" style={{ background: 'linear-gradient(135deg, #fef2f2 0%, #ffffff 100%)', borderColor: '#fecaca' }}>
          <div>
            <div className="metric-value" style={{ color: '#dc2626' }}>{outOfStock}</div>
            <div className="metric-label">Out of Stock</div>
          </div>
          <div style={{ backgroundColor: '#ef4444', padding: '10px', borderRadius: '8px' }}>
            <X size={20} style={{ color: '#ffffff' }} />
          </div>
        </div>
      </div>

      <div className="erp-card">
        <div className="erp-card-header">
          <span className="erp-card-title">Inventory Items</span>
        </div>
        <div className="erp-card-body" style={{ padding: '12px', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <input type="text" placeholder="Search items..." className="erp-input" style={{ paddingLeft: '32px', width: '100%' }} value={search} onChange={e => setSearch(e.target.value)} />
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: '#64748b' }} />
            </div>
            <select className="erp-input" style={{ width: '150px' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">All Status</option>
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>
        </div>
        <div className="table-container">
          <table className="erp-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Item Name</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Min Stock</th>
                <th>Location</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item => (
                <tr key={item.id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{item.id}</td>
                  <td><strong>{item.name}</strong></td>
                  <td>{item.category}</td>
                  <td style={{ fontWeight: 700, color: item.quantity <= item.minStock ? '#ef4444' : '#10b981' }}>{item.quantity}</td>
                  <td>{item.minStock}</td>
                  <td>{item.location}</td>
                  <td>
                    <span className={`erp-badge ${
                      item.status === 'in_stock' ? 'badge-approved' :
                      item.status === 'low_stock' ? 'badge-pending' : 'badge-rejected'
                    }`}>
                      {item.status === 'in_stock' ? 'In Stock' : item.status === 'low_stock' ? 'Low Stock' : 'Out of Stock'}
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
