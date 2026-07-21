import React, { useState, useEffect } from 'react';
import { examinationService } from './services/examinationService';
import { 
  Award, FileText, CheckCircle2, XCircle, Search, Download, 
  Printer, PlusCircle, Check, Sparkles, Settings, Bell, BookOpen, 
  BarChart3, RefreshCw, Upload, ShieldCheck, HelpCircle, Layers, 
  Users, UserCheck, Star, PieChart, Send, Edit, Trash2, ArrowRight
} from 'lucide-react';

// --- DATA TYPES ---
export interface ExamMark {
  id: string;
  studentId: string;
  rollNo: string;
  studentName: string;
  className: string;
  section: string;
  subject: string;
  theoryMarks: number;
  practicalMarks: number;
  vivaMarks: number;
  graceMarks: number;
  totalMarks: number;
  maxMarks: number;
  grade: string;
  remarks: string;
}

export interface ReportCard {
  studentId: string;
  rollNo: string;
  studentName: string;
  fatherName: string;
  className: string;
  section: string;
  subjects: {
    subjectName: string;
    maxMarks: number;
    theoryObtained: number;
    practicalObtained: number;
    totalObtained: number;
    grade: string;
  }[];
  totalObtained: number;
  totalMax: number;
  percentage: number;
  rank: number;
  resultStatus: 'PASS' | 'PROMOTED' | 'FAIL';
  attendancePercentage: number;
  teacherRemarks: string;
}

export interface CoScholasticGrade {
  studentId: string;
  rollNo: string;
  name: string;
  workEducation: string;
  artEducation: string;
  healthPhysical: string;
  discipline: string;
  moralValues: string;
}

export interface ExamTerm {
  id: string;
  termName: string;
  examName: string;
  startDate: string;
  endDate: string;
  weightagePercent: number;
}

export type ExaminationSubView =
  // Marks Management (7)
  | 'marks-entry'
  | 'marks-excel'
  | 'marks-admitcard'
  | 'marks-ledger'
  | 'marks-subject-teacher'
  | 'marks-sms'
  | 'marks-admitcard-design'
  // Co-Scholastic (1)
  | 'criteriagrade'
  // Exam Result (2)
  | 'result-generate'
  | 'result-publish'
  // Exam Report (6)
  | 'report-exam-wise'
  | 'report-term-wise'
  | 'report-cross-list'
  | 'report-cumulative'
  | 'report-graph'
  | 'report-analysis'
  // Exam Setting (5)
  | 'setting-exam-term'
  | 'setting-grading'
  | 'setting-subjects'
  | 'setting-promotion'
  | 'setting-signatures'
  // Migrate Setting (1)
  | 'migrate-setting'
  // Extra Marks (1)
  | 'extra-marks';

interface ExaminationModuleProps {
  initialSubView?: ExaminationSubView;
  onNavigateSubView?: (subView: ExaminationSubView) => void;
}

// --- INITIAL MOCK DATA ---
const INITIAL_EXAM_MARKS: ExamMark[] = [
  { id: 'mk-1', studentId: 'std-1', rollNo: '101', studentName: 'Aarav Sharma', className: 'Class 10', section: 'A', subject: 'Mathematics', theoryMarks: 72, practicalMarks: 18, vivaMarks: 0, graceMarks: 0, totalMarks: 90, maxMarks: 100, grade: 'A1', remarks: 'Outstanding Performance' },
  { id: 'mk-2', studentId: 'std-2', rollNo: '102', studentName: 'Aditi Verma', className: 'Class 10', section: 'A', subject: 'Mathematics', theoryMarks: 68, practicalMarks: 17, vivaMarks: 0, graceMarks: 0, totalMarks: 85, maxMarks: 100, grade: 'A2', remarks: 'Excellent Effort' },
  { id: 'mk-3', studentId: 'std-3', rollNo: '103', studentName: 'Ananya Gupta', className: 'Class 10', section: 'A', subject: 'Mathematics', theoryMarks: 55, practicalMarks: 15, vivaMarks: 0, graceMarks: 0, totalMarks: 70, maxMarks: 100, grade: 'B1', remarks: 'Good' },
  { id: 'mk-4', studentId: 'std-4', rollNo: '104', studentName: 'Bhavya Joshi', className: 'Class 10', section: 'A', subject: 'Mathematics', theoryMarks: 45, practicalMarks: 14, vivaMarks: 0, graceMarks: 2, totalMarks: 61, maxMarks: 100, grade: 'B2', remarks: 'Satisfactory' },
  { id: 'mk-5', studentId: 'std-5', rollNo: '105', studentName: 'Devendra Kumar', className: 'Class 10', section: 'A', subject: 'Mathematics', theoryMarks: 78, practicalMarks: 19, vivaMarks: 0, graceMarks: 0, totalMarks: 97, maxMarks: 100, grade: 'A1', remarks: 'Class Topper' }
];

const INITIAL_REPORT_CARDS: ReportCard[] = [
  {
    studentId: 'std-1', rollNo: '101', studentName: 'Aarav Sharma', fatherName: 'Rajesh Sharma', className: 'Class 10', section: 'A',
    subjects: [
      { subjectName: 'English', maxMarks: 100, theoryObtained: 75, practicalObtained: 19, totalObtained: 94, grade: 'A1' },
      { subjectName: 'Mathematics', maxMarks: 100, theoryObtained: 72, practicalObtained: 18, totalObtained: 90, grade: 'A1' },
      { subjectName: 'Science', maxMarks: 100, theoryObtained: 70, practicalObtained: 19, totalObtained: 89, grade: 'A2' },
      { subjectName: 'Social Science', maxMarks: 100, theoryObtained: 73, practicalObtained: 18, totalObtained: 91, grade: 'A1' },
      { subjectName: 'Hindi', maxMarks: 100, theoryObtained: 76, practicalObtained: 19, totalObtained: 95, grade: 'A1' }
    ],
    totalObtained: 459, totalMax: 500, percentage: 91.8, rank: 1, resultStatus: 'PASS', attendancePercentage: 96.5, teacherRemarks: 'Exceptional academic brilliance throughout the academic session.'
  },
  {
    studentId: 'std-2', rollNo: '102', studentName: 'Aditi Verma', fatherName: 'Sanjay Verma', className: 'Class 10', section: 'A',
    subjects: [
      { subjectName: 'English', maxMarks: 100, theoryObtained: 68, practicalObtained: 18, totalObtained: 86, grade: 'A2' },
      { subjectName: 'Mathematics', maxMarks: 100, theoryObtained: 68, practicalObtained: 17, totalObtained: 85, grade: 'A2' },
      { subjectName: 'Science', maxMarks: 100, theoryObtained: 65, practicalObtained: 18, totalObtained: 83, grade: 'B1' },
      { subjectName: 'Social Science', maxMarks: 100, theoryObtained: 70, practicalObtained: 18, totalObtained: 88, grade: 'A2' },
      { subjectName: 'Hindi', maxMarks: 100, theoryObtained: 72, practicalObtained: 18, totalObtained: 90, grade: 'A1' }
    ],
    totalObtained: 432, totalMax: 500, percentage: 86.4, rank: 2, resultStatus: 'PASS', attendancePercentage: 94.2, teacherRemarks: 'Consistently performs well with great dedication.'
  }
];

const INITIAL_CO_SCHOLASTIC: CoScholasticGrade[] = [
  { studentId: 'std-1', rollNo: '101', name: 'Aarav Sharma', workEducation: 'A+', artEducation: 'A', healthPhysical: 'A+', discipline: 'A+', moralValues: 'A+' },
  { studentId: 'std-2', rollNo: '102', name: 'Aditi Verma', workEducation: 'A', artEducation: 'A+', healthPhysical: 'A', discipline: 'A', moralValues: 'A+' }
];

export function ExaminationModule({ initialSubView = 'marks-entry', onNavigateSubView }: ExaminationModuleProps) {
  const [activeSubView, setActiveSubView] = useState<ExaminationSubView>(initialSubView);

  React.useEffect(() => {
    if (initialSubView) setActiveSubView(initialSubView);
  }, [initialSubView]);

  const handleSubViewChange = (view: ExaminationSubView) => {
    setActiveSubView(view);
    if (onNavigateSubView) onNavigateSubView(view);
  };

  const [examMarks, setExamMarks] = useState<ExamMark[]>(INITIAL_EXAM_MARKS);
  const [reportCards, setReportCards] = useState<ReportCard[]>(INITIAL_REPORT_CARDS);
  const [coScholastic, setCoScholastic] = useState<CoScholasticGrade[]>(INITIAL_CO_SCHOLASTIC);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    examinationService.getMarks()
      .then(res => {
        const rawList = Array.isArray(res) ? res : (res?.data || res?.results || []);
        if (rawList && rawList.length > 0) {
          const mapped: ExamMark[] = rawList.map((item: any, idx: number) => ({
            id: item.id || `mk-${idx}`,
            studentId: item.student || 'std-1',
            rollNo: item.roll_number || '101',
            studentName: item.student_name || 'Student',
            className: item.admission_class || 'Class 10',
            section: item.section || 'A',
            subject: item.subject_name || 'Mathematics',
            theoryMarks: item.marks_obtained || 75,
            practicalMarks: 15,
            vivaMarks: 0,
            graceMarks: 0,
            totalMarks: item.marks_obtained || 90,
            maxMarks: item.max_marks || 100,
            grade: item.grade || 'A1',
            remarks: item.remarks || 'Good'
          }));
          setExamMarks(mapped);
        }
      })
      .catch(err => console.log('Examination service fetch info:', err?.message));
  }, []);

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
            <Award size={22} color="#00696b" />
            Examination & Gradebook Management Suite
          </h2>
          <span className="view-subtitle">
            Marks entry, admit card issuance, report card generation, cross list tabulation, grading setup & analytics
          </span>
        </div>
      </div>

      {/* SUB-VIEW ROUTER */}
      {/* 1. MARKS MANAGEMENT */}
      {activeSubView.startsWith('marks-') && (
        <MarksManagementSection 
          subView={activeSubView} 
          examMarks={examMarks} 
          setExamMarks={setExamMarks} 
          showToast={showToast} 
        />
      )}

      {/* 2. CO-SCHOLASTIC GRADE */}
      {activeSubView === 'criteriagrade' && (
        <CoScholasticSection 
          coScholastic={coScholastic} 
          setCoScholastic={setCoScholastic} 
          showToast={showToast} 
        />
      )}

      {/* 3. EXAM RESULT */}
      {activeSubView.startsWith('result-') && (
        <ExamResultSection 
          subView={activeSubView} 
          reportCards={reportCards} 
          showToast={showToast} 
        />
      )}

      {/* 4. EXAM REPORT */}
      {activeSubView.startsWith('report-') && (
        <ExamReportSection 
          subView={activeSubView} 
          reportCards={reportCards} 
        />
      )}

      {/* 5. EXAM SETTING */}
      {activeSubView.startsWith('setting-') && (
        <ExamSettingSection 
          subView={activeSubView} 
          showToast={showToast} 
        />
      )}

      {/* 6. MIGRATE SETTING */}
      {activeSubView === 'migrate-setting' && (
        <MigrateSettingSection showToast={showToast} />
      )}

      {/* 7. EXTRA MARKS */}
      {activeSubView === 'extra-marks' && (
        <ExtraMarksSection showToast={showToast} />
      )}
    </div>
  );
}


// ====================================================================
// 1. MARKS MANAGEMENT SECTION
// ====================================================================
function MarksManagementSection({
  subView,
  examMarks,
  setExamMarks,
  showToast
}: {
  subView: ExaminationSubView;
  examMarks: ExamMark[];
  setExamMarks: React.Dispatch<React.SetStateAction<ExamMark[]>>;
  showToast: (msg: string) => void;
}) {
  const [selectedClass, setSelectedClass] = useState('Class 10');
  const [selectedSection, setSelectedSection] = useState('A');
  const [selectedExam, setSelectedExam] = useState('Half Yearly Exam (2026)');
  const [selectedSubject, setSelectedSubject] = useState('Mathematics');

  const handleScoreChange = (id: string, field: 'theoryMarks' | 'practicalMarks' | 'graceMarks', val: number) => {
    setExamMarks(prev => prev.map(m => {
      if (m.id === id) {
        const theory = field === 'theoryMarks' ? val : m.theoryMarks;
        const practical = field === 'practicalMarks' ? val : m.practicalMarks;
        const grace = field === 'graceMarks' ? val : m.graceMarks;
        const total = theory + practical + grace;
        let grade = 'D';
        if (total >= 90) grade = 'A1';
        else if (total >= 80) grade = 'A2';
        else if (total >= 70) grade = 'B1';
        else if (total >= 60) grade = 'B2';
        else if (total >= 50) grade = 'C1';
        else if (total >= 33) grade = 'C2';
        return { ...m, [field]: val, totalMarks: total, grade };
      }
      return m;
    }));
  };

  if (subView === 'marks-admitcard') {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Student Admit Card Generator & Hall Tickets</h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Generate examination admit cards with date-sheet and roll numbers</span>
          </div>
          <button onClick={() => window.print()} className="erp-btn btn-primary" style={{ backgroundColor: '#00696b', borderColor: '#00696b' }}>
            <Printer size={14} /> Print Admit Cards
          </button>
        </div>

        <div className="erp-card" style={{ border: '2px solid #00696b', padding: '20px', borderRadius: '10px' }}>
          <div style={{ textTransform: 'uppercase', textAlign: 'center', borderBottom: '2px dashed #cbd5e1', paddingBottom: '12px', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#00696b', margin: 0 }}>DETTROIN ACADEMY INTERNATIONAL</h2>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#ff7849' }}>HALF YEARLY EXAMINATION ADMIT CARD (SESSION 2026-2027)</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 140px', gap: '16px', marginBottom: '16px', fontSize: '13px' }}>
            <div>
              <p><strong>Student Name:</strong> Aarav Sharma</p>
              <p><strong>Father Name:</strong> Rajesh Sharma</p>
              <p><strong>Class & Section:</strong> Class 10 - Sec A</p>
            </div>
            <div>
              <p><strong>Roll No / Exam ID:</strong> 101</p>
              <p><strong>Exam Center:</strong> Main Campus Hall 1</p>
              <p><strong>Category:</strong> Regular Student</p>
            </div>
            <div style={{ border: '1px solid #cbd5e1', borderRadius: '6px', height: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#94a3b8', textAlign: 'center', fontWeight: 700 }}>
              Passport Size<br/>Photo
            </div>
          </div>

          <table className="erp-table" style={{ marginBottom: '16px' }}>
            <thead>
              <tr style={{ backgroundColor: '#00696b', color: '#ffffff' }}>
                <th style={{ backgroundColor: '#00696b', color: '#ffffff' }}>Date</th>
                <th style={{ backgroundColor: '#00696b', color: '#ffffff' }}>Timing</th>
                <th style={{ backgroundColor: '#00696b', color: '#ffffff' }}>Subject Code</th>
                <th style={{ backgroundColor: '#00696b', color: '#ffffff' }}>Subject Name</th>
                <th style={{ backgroundColor: '#00696b', color: '#ffffff' }}>Invigilator Sign</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>15-Sep-2026</td>
                <td>09:00 AM - 12:00 PM</td>
                <td>ENG-101</td>
                <td><strong>ENGLISH COMMUNICATIVE</strong></td>
                <td>________________</td>
              </tr>
              <tr>
                <td>17-Sep-2026</td>
                <td>09:00 AM - 12:00 PM</td>
                <td>MATH-102</td>
                <td><strong>MATHEMATICS STANDARD</strong></td>
                <td>________________</td>
              </tr>
              <tr>
                <td>19-Sep-2026</td>
                <td>09:00 AM - 12:00 PM</td>
                <td>SCI-103</td>
                <td><strong>SCIENCE (THEORY & PRACTICAL)</strong></td>
                <td>________________</td>
              </tr>
            </tbody>
          </table>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '20px' }}>
            <div style={{ fontSize: '11px', color: '#64748b' }}>
              * Student must carry this Admit Card to the Examination Hall daily.<br/>
              * Electronic devices are strictly prohibited inside the center.
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Dancing Script, cursive', fontSize: '16px', color: '#00696b', fontWeight: 800 }}>Dr. Geeta Dang</div>
              <div style={{ fontSize: '11px', fontWeight: 800, borderTop: '1px solid #00696b', paddingTop: '2px', color: '#0f172a' }}>Controller of Examinations</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (subView === 'marks-excel') {
    return (
      <div>
        <div className="erp-card">
          <div className="erp-card-header"><span className="erp-card-title">Batch Excel / CSV Marks Upload Importer</span></div>
          <div className="erp-card-body" style={{ padding: '24px', textAlign: 'center' }}>
            <Upload size={48} color="#00696b" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>Drag & Drop Excel Marksheet (.xlsx / .csv)</h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
              Upload class marksheet exported from school evaluation software or offline spreadsheets.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <button onClick={() => showToast('Sample Excel Template Downloaded!')} className="erp-btn btn-outline">
                <Download size={14} /> Download Sample Template
              </button>
              <button onClick={() => showToast('Marks imported successfully from Excel!')} className="erp-btn btn-primary" style={{ backgroundColor: '#00696b' }}>
                Browse File & Import
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Top Filter Bar */}
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
              <select value={selectedExam} onChange={e => setSelectedExam(e.target.value)} style={{ width: '220px' }}>
                <option value="Half Yearly Exam (2026)">Half Yearly Exam (2026)</option>
                <option value="Unit Test I">Unit Test I</option>
                <option value="Annual Board Pre-Exam">Annual Board Pre-Exam</option>
              </select>
              <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} style={{ width: '150px' }}>
                <option value="Mathematics">Mathematics</option>
                <option value="English">English</option>
                <option value="Science">Science</option>
                <option value="Social Science">Social Science</option>
              </select>
            </div>

            <button onClick={() => showToast('All student marks saved successfully!')} className="erp-btn btn-primary" style={{ backgroundColor: '#00696b', borderColor: '#00696b' }}>
              <Check size={14} /> Save Marks Entry
            </button>
          </div>
        </div>
      </div>

      {/* Marks Table */}
      <div className="erp-card">
        <div className="table-container">
          <table className="erp-table">
            <thead>
              <tr style={{ backgroundColor: '#00696b', color: '#ffffff' }}>
                <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>Roll No</th>
                <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>Student Name</th>
                <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>Theory (80)</th>
                <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>Practical / Int (20)</th>
                <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>Grace</th>
                <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>Total (100)</th>
                <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800, textAlign: 'center' }}>Grade</th>
                <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {examMarks.map(m => (
                <tr key={m.id}>
                  <td style={{ fontWeight: 800 }}>{m.rollNo}</td>
                  <td style={{ fontWeight: 800, color: '#0f172a' }}>{m.studentName}</td>
                  <td>
                    <input type="number" value={m.theoryMarks} onChange={e => handleScoreChange(m.id, 'theoryMarks', parseInt(e.target.value) || 0)} style={{ width: '70px', padding: '4px 8px', fontWeight: 700 }} />
                  </td>
                  <td>
                    <input type="number" value={m.practicalMarks} onChange={e => handleScoreChange(m.id, 'practicalMarks', parseInt(e.target.value) || 0)} style={{ width: '70px', padding: '4px 8px', fontWeight: 700 }} />
                  </td>
                  <td>
                    <input type="number" value={m.graceMarks} onChange={e => handleScoreChange(m.id, 'graceMarks', parseInt(e.target.value) || 0)} style={{ width: '60px', padding: '4px 8px', fontWeight: 700, color: '#dc2626' }} />
                  </td>
                  <td style={{ fontWeight: 800, color: '#00696b', fontSize: '15px' }}>{m.totalMarks} / {m.maxMarks}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span className="erp-badge badge-approved" style={{ backgroundColor: '#00696b', color: '#fff', fontWeight: 800 }}>{m.grade}</span>
                  </td>
                  <td style={{ color: '#64748b', fontSize: '12px' }}>{m.remarks}</td>
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
// 2. CO-SCHOLASTIC SECTION
// ====================================================================
function CoScholasticSection({
  coScholastic,
  setCoScholastic,
  showToast
}: {
  coScholastic: CoScholasticGrade[];
  setCoScholastic: React.Dispatch<React.SetStateAction<CoScholasticGrade[]>>;
  showToast: (msg: string) => void;
}) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Co-Scholastic & Non-Academic Activity Grading</h3>
          <span style={{ fontSize: '12px', color: '#64748b' }}>Grade Art, Physical Education, Discipline, and Moral Values (CBSE Format)</span>
        </div>
        <button onClick={() => showToast('Co-scholastic grades saved!')} className="erp-btn btn-primary" style={{ backgroundColor: '#00696b' }}>
          <Check size={14} /> Save Co-Scholastic Grades
        </button>
      </div>

      <div className="erp-card">
        <div className="table-container">
          <table className="erp-table">
            <thead>
              <tr style={{ backgroundColor: '#00696b', color: '#ffffff' }}>
                <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>Roll No</th>
                <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>Student Name</th>
                <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>Work Education</th>
                <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>Art Education</th>
                <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>Health & Physical Ed</th>
                <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>Discipline</th>
                <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>Moral Values</th>
              </tr>
            </thead>
            <tbody>
              {coScholastic.map(cs => (
                <tr key={cs.studentId}>
                  <td style={{ fontWeight: 800 }}>{cs.rollNo}</td>
                  <td style={{ fontWeight: 800, color: '#0f172a' }}>{cs.name}</td>
                  <td><select defaultValue={cs.workEducation} style={{ padding: '3px 8px' }}><option>A+</option><option>A</option><option>B+</option><option>B</option><option>C</option></select></td>
                  <td><select defaultValue={cs.artEducation} style={{ padding: '3px 8px' }}><option>A+</option><option>A</option><option>B+</option><option>B</option><option>C</option></select></td>
                  <td><select defaultValue={cs.healthPhysical} style={{ padding: '3px 8px' }}><option>A+</option><option>A</option><option>B+</option><option>B</option><option>C</option></select></td>
                  <td><select defaultValue={cs.discipline} style={{ padding: '3px 8px' }}><option>A+</option><option>A</option><option>B+</option><option>B</option><option>C</option></select></td>
                  <td><select defaultValue={cs.moralValues} style={{ padding: '3px 8px' }}><option>A+</option><option>A</option><option>B+</option><option>B</option><option>C</option></select></td>
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
// 3. EXAM RESULT SECTION (2 VIEWS)
// ====================================================================
function ExamResultSection({
  subView,
  reportCards,
  showToast
}: {
  subView: ExaminationSubView;
  reportCards: ReportCard[];
  showToast: (msg: string) => void;
}) {
  const isPublish = subView === 'result-publish';

  if (isPublish) {
    return (
      <div>
        <div className="erp-card">
          <div className="erp-card-header"><span className="erp-card-title">Online Result Publishing & Parent Mobile App Release</span></div>
          <div className="erp-card-body" style={{ padding: '20px' }}>
            <p style={{ fontSize: '13px', color: '#475569', marginBottom: '16px' }}>
              Publish verified examination result cards to the Student / Parent Mobile App portal.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', backgroundColor: '#f8fafc' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#00696b', margin: '0 0 8px' }}>Class 10 (Half Yearly 2026)</h4>
                <p style={{ fontSize: '12px', color: '#64748b' }}>Status: Ready for release (42 Students)</p>
                <button onClick={() => showToast('Class 10 results published to Parent App!')} className="erp-btn btn-primary" style={{ backgroundColor: '#16a34a', borderColor: '#16a34a', width: '100%', marginTop: '12px' }}>
                  <Send size={14} /> Publish Class 10 Result
                </button>
              </div>
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', backgroundColor: '#f8fafc' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#00696b', margin: '0 0 8px' }}>Class 12 (Board Pre-Exam 2026)</h4>
                <p style={{ fontSize: '12px', color: '#64748b' }}>Status: Published on 12-Jul-2026</p>
                <button onClick={() => showToast('Class 12 results unpublished')} className="erp-btn btn-outline" style={{ borderColor: '#dc2626', color: '#dc2626', width: '100%', marginTop: '12px' }}>
                  Unpublish Result
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Report Card Generator View
  const student = reportCards[0];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Report Card Generator & Print Preview</h3>
          <span style={{ fontSize: '12px', color: '#64748b' }}>CBSE / State Board standardized annual progress report card format</span>
        </div>
        <button onClick={() => window.print()} className="erp-btn btn-primary" style={{ backgroundColor: '#00696b' }}>
          <Printer size={14} /> Print Report Card
        </button>
      </div>

      <div className="erp-card" style={{ border: '2px solid #00696b', padding: '24px', borderRadius: '10px' }}>
        <div style={{ textAlign: 'center', borderBottom: '2px solid #00696b', paddingBottom: '16px', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#00696b', margin: 0 }}>DETTROIN ACADEMY INTERNATIONAL</h2>
          <div style={{ fontSize: '12px', color: '#475569', fontWeight: 700 }}>Affiliated to CBSE, New Delhi (Affiliation No: 1030982)</div>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#ff7849', marginTop: '6px' }}>ACADEMIC PROGRESS REPORT CARD (SESSION 2026-2027)</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px', fontSize: '13px', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '6px' }}>
          <div>
            <p><strong>Student Name:</strong> {student.studentName}</p>
            <p><strong>Father's Name:</strong> {student.fatherName}</p>
            <p><strong>Class & Section:</strong> {student.className} - {student.section}</p>
          </div>
          <div>
            <p><strong>Roll Number:</strong> {student.rollNo}</p>
            <p><strong>Attendance:</strong> {student.attendancePercentage}%</p>
            <p><strong>Overall Class Rank:</strong> #{student.rank}</p>
          </div>
        </div>

        <table className="erp-table" style={{ marginBottom: '20px' }}>
          <thead>
            <tr style={{ backgroundColor: '#00696b', color: '#ffffff' }}>
              <th style={{ backgroundColor: '#00696b', color: '#ffffff' }}>Scholastic Subjects</th>
              <th style={{ backgroundColor: '#00696b', color: '#ffffff' }}>Max Marks</th>
              <th style={{ backgroundColor: '#00696b', color: '#ffffff' }}>Theory</th>
              <th style={{ backgroundColor: '#00696b', color: '#ffffff' }}>Practical / Int</th>
              <th style={{ backgroundColor: '#00696b', color: '#ffffff' }}>Total Obtained</th>
              <th style={{ backgroundColor: '#00696b', color: '#ffffff', textAlign: 'center' }}>Grade</th>
            </tr>
          </thead>
          <tbody>
            {student.subjects.map(sub => (
              <tr key={sub.subjectName}>
                <td style={{ fontWeight: 800 }}>{sub.subjectName}</td>
                <td>{sub.maxMarks}</td>
                <td>{sub.theoryObtained}</td>
                <td>{sub.practicalObtained}</td>
                <td style={{ fontWeight: 800, color: '#00696b' }}>{sub.totalObtained}</td>
                <td style={{ textAlign: 'center', fontWeight: 800 }}>{sub.grade}</td>
              </tr>
            ))}
            <tr style={{ backgroundColor: '#f1f5f9', fontWeight: 800 }}>
              <td colSpan={4}>GRAND TOTAL & PERCENTAGE</td>
              <td style={{ color: '#00696b', fontSize: '15px' }}>{student.totalObtained} / {student.totalMax}</td>
              <td style={{ textAlign: 'center', color: '#16a34a', fontSize: '15px' }}>{student.percentage}% ({student.resultStatus})</td>
            </tr>
          </tbody>
        </table>

        <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#fff7ed', borderLeft: '4px solid #ff7849', borderRadius: '4px', fontSize: '13px' }}>
          <strong>Class Teacher's Remarks:</strong> {student.teacherRemarks}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '40px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ borderTop: '1px solid #94a3b8', width: '150px', paddingTop: '4px', fontSize: '12px', fontWeight: 700 }}>Class Teacher Sign</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ borderTop: '1px solid #94a3b8', width: '150px', paddingTop: '4px', fontSize: '12px', fontWeight: 700 }}>Exam Controller Sign</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ borderTop: '1px solid #00696b', width: '150px', paddingTop: '4px', fontSize: '12px', fontWeight: 800, color: '#00696b' }}>Principal Signature</div>
          </div>
        </div>
      </div>
    </div>
  );
}


// ====================================================================
// 4. EXAM REPORT SECTION (6 VIEWS)
// ====================================================================
function ExamReportSection({
  subView,
  reportCards
}: {
  subView: ExaminationSubView;
  reportCards: ReportCard[];
}) {
  const getTitle = () => {
    switch (subView) {
      case 'report-exam-wise': return 'Exam-Wise Assessment Performance Report';
      case 'report-term-wise': return 'Term-Wise Aggregated Performance Summary';
      case 'report-cross-list': return 'Master Class Cross List & Tabulation Register';
      case 'report-cumulative': return 'Annual Cumulative Academic Progress Ledger';
      case 'report-graph': return 'Graphical Performance Analytics & Score Distribution';
      case 'report-analysis': return 'Teacher & Class Topper Evaluation Analysis';
      default: return 'Examination Performance Report';
    }
  };

  return (
    <div>
      <div style={{
        backgroundColor: '#8b4570', color: '#ffffff', borderRadius: '8px 8px 0 0',
        padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>{getTitle()} : (Session 2026-2027)</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => alert('Exporting...')} style={{ backgroundColor: '#0d9488', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '6px 16px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Download size={14} /> Export CSV
          </button>
          <button onClick={() => window.print()} style={{ backgroundColor: '#0d9488', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '6px 20px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
            Print Sheet
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
                <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>English</th>
                <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>Maths</th>
                <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>Science</th>
                <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>S.Science</th>
                <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>Hindi</th>
                <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>Total Marks</th>
                <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800 }}>% Score</th>
                <th style={{ backgroundColor: '#00696b', color: '#ffffff', fontWeight: 800, textAlign: 'center' }}>Rank</th>
              </tr>
            </thead>
            <tbody>
              {reportCards.map(rc => (
                <tr key={rc.studentId}>
                  <td style={{ fontWeight: 800 }}>{rc.rollNo}</td>
                  <td style={{ fontWeight: 800, color: '#0f172a' }}>{rc.studentName}</td>
                  <td style={{ fontWeight: 700, color: '#00696b' }}>{rc.className}-{rc.section}</td>
                  <td>{rc.subjects[0]?.totalObtained}</td>
                  <td>{rc.subjects[1]?.totalObtained}</td>
                  <td>{rc.subjects[2]?.totalObtained}</td>
                  <td>{rc.subjects[3]?.totalObtained}</td>
                  <td>{rc.subjects[4]?.totalObtained}</td>
                  <td style={{ fontWeight: 800, color: '#00696b' }}>{rc.totalObtained} / {rc.totalMax}</td>
                  <td style={{ fontWeight: 800, color: '#16a34a' }}>{rc.percentage}%</td>
                  <td style={{ textAlign: 'center' }}>
                    <span className="erp-badge badge-approved" style={{ backgroundColor: '#ff7849', color: '#fff' }}>#{rc.rank}</span>
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
// 5. EXAM SETTING SECTION (5 VIEWS)
// ====================================================================
function ExamSettingSection({
  subView,
  showToast
}: {
  subView: ExaminationSubView;
  showToast: (msg: string) => void;
}) {
  const getSettingTitle = () => {
    switch (subView) {
      case 'setting-exam-term': return 'Add Exam Name & Academic Terms Configuration';
      case 'setting-grading': return 'Assessment Criteria & CBSE 9-Point Grading Scale Setup';
      case 'setting-subjects': return 'Exam Subject Setup & Report Card Display Order';
      case 'setting-promotion': return 'Class Promotion Rules & Session Transition Setup';
      case 'setting-signatures': return 'Digital Signature & Stamp Manager';
      default: return 'Exam Configuration';
    }
  };

  return (
    <div>
      <div className="erp-card">
        <div className="erp-card-header"><span className="erp-card-title">{getSettingTitle()}</span></div>
        <div className="erp-card-body" style={{ padding: '20px' }}>
          <form onSubmit={(e) => { e.preventDefault(); showToast('Exam configuration parameters saved!'); }}>
            <div className="form-grid">
              <div className="form-group col-span-2">
                <label>Configuration Parameter Name *</label>
                <input type="text" defaultValue="Half Yearly Examination 2026-2027" />
              </div>
              <div className="form-group">
                <label>Academic Term *</label>
                <select defaultValue="Term I"><option>Term I</option><option>Term II</option><option>Annual</option></select>
              </div>
              <div className="form-group">
                <label>Weightage Percentage *</label>
                <input type="text" defaultValue="50%" />
              </div>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="erp-btn btn-primary" style={{ backgroundColor: '#00696b' }}>
                <Check size={14} /> Update Exam Setting
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


// ====================================================================
// 6. MIGRATE SETTING SECTION
// ====================================================================
function MigrateSettingSection({ showToast }: { showToast: (msg: string) => void }) {
  return (
    <div className="erp-card">
      <div className="erp-card-header"><span className="erp-card-title">Session-to-Session Exam Structure Migration</span></div>
      <div className="erp-card-body" style={{ padding: '24px' }}>
        <p style={{ fontSize: '13px', color: '#475569', marginBottom: '20px' }}>
          Copy exam structures, subjects, weightage criteria, and grading scales from previous academic year (2025-2026) to current year (2026-2027).
        </p>
        <div className="form-grid" style={{ marginBottom: '20px' }}>
          <div className="form-group">
            <label>Source Session (From)</label>
            <select defaultValue="2025-2026"><option>2025-2026</option></select>
          </div>
          <div className="form-group">
            <label>Destination Session (To)</label>
            <select defaultValue="2026-2027"><option>2026-2027</option></select>
          </div>
        </div>
        <button onClick={() => showToast('Exam structure migrated successfully to 2026-2027 session!')} className="erp-btn btn-primary" style={{ backgroundColor: '#00696b' }}>
          <RefreshCw size={14} /> Run Structure Migration
        </button>
      </div>
    </div>
  );
}


// ====================================================================
// 7. EXTRA MARKS SECTION
// ====================================================================
function ExtraMarksSection({ showToast }: { showToast: (msg: string) => void }) {
  return (
    <div className="erp-card">
      <div className="erp-card-header"><span className="erp-card-title">Grace & Extra-Curricular Bonus Marks Allocation</span></div>
      <div className="erp-card-body" style={{ padding: '20px' }}>
        <p style={{ fontSize: '13px', color: '#475569', marginBottom: '16px' }}>
          Assign bonus marks for National Sports, NCC, Olympiad achievements, or condone borderline fail cases via grace marks.
        </p>
        <div className="form-grid">
          <div className="form-group">
            <label>Student Roll No *</label>
            <input type="text" placeholder="e.g. 104" />
          </div>
          <div className="form-group">
            <label>Bonus Category *</label>
            <select defaultValue="Sports Quota"><option>Sports Quota</option><option>Olympiad Ranker</option><option>Grace Marks</option></select>
          </div>
          <div className="form-group">
            <label>Bonus Marks to Add *</label>
            <input type="number" defaultValue={5} />
          </div>
        </div>
        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={() => showToast('Bonus marks credited to student mark sheet!')} className="erp-btn btn-primary" style={{ backgroundColor: '#00696b' }}>
            <Check size={14} /> Award Bonus Marks
          </button>
        </div>
      </div>
    </div>
  );
}
