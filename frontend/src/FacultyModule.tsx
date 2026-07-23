import React, { useState } from 'react';
import { 
  Users, PlusCircle, Building2, FileText, UserX, BarChart3, 
  BookOpen, CreditCard, Printer, Eye, Search, Filter, Trash2, 
  Edit, CheckCircle2, AlertCircle, Download, Check, Sparkles,
  Phone, Mail, Calendar, ShieldCheck, MapPin, Award, UserCheck, RefreshCw, UserPlus, Camera, Upload
} from 'lucide-react';

// --- DATA TYPES ---
export interface StaffMember {
  id: string;
  sNo: number;
  serialNo: string;
  biometricId: string;
  empId: string;
  name: string;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  fatherName: string;
  motherName: string;
  spouseName: string;
  phone: string;
  email: string;
  qualification: string;
  joiningDate: string;
  department: string;
  designation: string;
  subject: string;
  password: string;
  role: string;
  salary: number | string;
  accountNo: string;
  ifscCode: string;
  panNo: string;
  uanNo: string;
  aadhaar: string;
  photoUrl: string;
  address: string;
  status: 'Active' | 'Inactive';
  exitDate?: string;
  exitReason?: string;
}

export interface Department {
  id: number;
  name: string;
}

export interface TeacherActivity {
  teacherId: string;
  teacherName: string;
  department: string;
  assignedClasses: string[];
  assignedSubjects: string[];
  scheduledPeriodsPerWeek: number;
  conductedPeriodsPerWeek: number;
  syllabusCompletionPct: number;
  attendancePct: number;
  rating: number;
  recentActivities: { id: string; date: string; class: string; topic: string; status: string }[];
}

export interface ClassActivity {
  classId: string;
  className: string;
  section: string;
  classTeacher: string;
  subjectTeachers: { subject: string; teacherName: string; periodsPerWeek: number; completionPct: number }[];
}

// --- INITIAL MOCK DATA ---
const INITIAL_STAFF: StaffMember[] = [
  {
    id: 'stf-1',
    sNo: 1,
    serialNo: '153',
    biometricId: 'BIO-101',
    empId: 'EMP-1056',
    name: 'Mr Rahul Rathi',
    gender: 'Male',
    dob: '1980-05-12',
    fatherName: 'Mr S.K. Rathi',
    motherName: 'Mrs S. Rathi',
    spouseName: 'Mrs Ritu Rathi',
    phone: '9897619531',
    email: 'rahul.rathi@school.edu',
    qualification: 'M.Tech',
    joiningDate: '2015-04-01',
    department: 'DIRECTOR',
    designation: 'DIRECTOR',
    subject: 'Management',
    password: '1770',
    role: 'Director',
    salary: 95000,
    accountNo: '98765432101',
    ifscCode: 'SBIN0001234',
    panNo: 'ABCDE1234F',
    uanNo: '100987654321',
    aadhaar: '1234-5678-9012',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    address: 'City Center, Main Road',
    status: 'Active'
  },
  {
    id: 'stf-2',
    sNo: 2,
    serialNo: '154',
    biometricId: 'BIO-102',
    empId: 'EMP-1057',
    name: 'Ms Geeta Dang',
    gender: 'Female',
    dob: '1982-10-18',
    fatherName: 'Mr H.L. Dang',
    motherName: 'Mrs K. Dang',
    spouseName: 'Mr A. Dang',
    phone: '7417684900',
    email: 'geeta.dang@school.edu',
    qualification: 'M.A., M.Ed.',
    joiningDate: '2016-07-15',
    department: 'PRINCIPAL',
    designation: 'PRINCIPAL',
    subject: 'Administration',
    password: '1771',
    role: 'Principal',
    salary: 85000,
    accountNo: '98765432102',
    ifscCode: 'SBIN0001234',
    panNo: 'BCDEF2345G',
    uanNo: '100987654322',
    aadhaar: '2345-6789-0123',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    address: 'Sector 4, Green Avenue',
    status: 'Active'
  },
  {
    id: 'stf-3',
    sNo: 3,
    serialNo: '155',
    biometricId: 'BIO-103',
    empId: 'EMP-1058',
    name: 'Ms Babita Sharma',
    gender: 'Female',
    dob: '1985-03-22',
    fatherName: 'Mr R.P. Sharma',
    motherName: 'Mrs V. Sharma',
    spouseName: 'Mr S. Sharma',
    phone: '8218722753',
    email: 'babita.sharma@school.edu',
    qualification: 'M.Sc., B.Ed.',
    joiningDate: '2018-01-10',
    department: 'VICE PRINCIPAL',
    designation: 'VICE PRINCIPAL',
    subject: 'Science',
    password: '1772',
    role: 'Vice Principal',
    salary: 75000,
    accountNo: '98765432103',
    ifscCode: 'SBIN0001234',
    panNo: 'CDEFG3456H',
    uanNo: '100987654323',
    aadhaar: '3456-7890-1234',
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    address: 'Civil Lines, Model Town',
    status: 'Active'
  },
  {
    id: 'stf-4',
    sNo: 4,
    serialNo: '156',
    biometricId: 'BIO-104',
    empId: 'EMP-1059',
    name: 'Ms Seema Solanki',
    gender: 'Female',
    dob: '1988-08-05',
    fatherName: 'Mr V.S. Solanki',
    motherName: 'Mrs M. Solanki',
    spouseName: 'Mr N. Solanki',
    phone: '9997525366',
    email: 'seema.solanki@school.edu',
    qualification: 'M.A., B.Ed.',
    joiningDate: '2019-09-01',
    department: 'TEACHING',
    designation: 'TEACHER',
    subject: 'Social Studies',
    password: '1773',
    role: 'Teacher',
    salary: 55000,
    accountNo: '98765432104',
    ifscCode: 'SBIN0001234',
    panNo: 'DEFGH4567I',
    uanNo: '100987654324',
    aadhaar: '4567-8901-2345',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    address: 'Vasundhara Enclave',
    status: 'Active'
  },
  {
    id: 'stf-5',
    sNo: 5,
    serialNo: '157',
    biometricId: 'BIO-105',
    empId: 'EMP-1060',
    name: 'Mr Mohit Verma',
    gender: 'Male',
    dob: '1990-11-14',
    fatherName: 'Mr R.K. Verma',
    motherName: 'Mrs S. Verma',
    spouseName: 'Mrs P. Verma',
    phone: '9027032033',
    email: 'mohit.verma@school.edu',
    qualification: 'M.COM,M.A.,B.ED',
    joiningDate: '2020-02-15',
    department: 'TEACHING',
    designation: 'TEACHER',
    subject: 'ENGLISH',
    password: '1774',
    role: 'Teacher',
    salary: 58000,
    accountNo: '98765432105',
    ifscCode: 'SBIN0001234',
    panNo: 'EFGHI5678J',
    uanNo: '100987654325',
    aadhaar: '5678-9012-3456',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    address: 'Rajendra Nagar, Gali 3',
    status: 'Active'
  },
  {
    id: 'stf-6',
    sNo: 6,
    serialNo: '158',
    biometricId: 'BIO-106',
    empId: 'EMP-1061',
    name: 'Ms Mona Arora',
    gender: 'Female',
    dob: '1992-06-25',
    fatherName: 'Mr P.C. Arora',
    motherName: 'Mrs L. Arora',
    spouseName: '',
    phone: '9045873884',
    email: 'mona.arora@school.edu',
    qualification: 'M.Sc. Physics',
    joiningDate: '2021-08-10',
    department: 'TEACHING',
    designation: 'TEACHER',
    subject: 'Physics',
    password: '1775',
    role: 'Teacher',
    salary: 52000,
    accountNo: '98765432106',
    ifscCode: 'SBIN0001234',
    panNo: 'FGHIJ6789K',
    uanNo: '100987654326',
    aadhaar: '6789-0123-4567',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    address: 'Preet Vihar',
    status: 'Active'
  },
  {
    id: 'stf-7',
    sNo: 7,
    serialNo: '159',
    biometricId: 'BIO-107',
    empId: 'EMP-1062',
    name: 'Mr Sonu Verma',
    gender: 'Male',
    dob: '1993-01-30',
    fatherName: 'Mr O.P. Verma',
    motherName: 'Mrs D. Verma',
    spouseName: '',
    phone: '9457259457',
    email: 'sonu.verma@school.edu',
    qualification: 'M.A. Hindi',
    joiningDate: '2022-04-01',
    department: 'TEACHING',
    designation: 'TEACHER',
    subject: 'Hindi',
    password: '1776',
    role: 'Teacher',
    salary: 48000,
    accountNo: '98765432107',
    ifscCode: 'SBIN0001234',
    panNo: 'GHIJK7890L',
    uanNo: '100987654327',
    aadhaar: '7890-1234-5678',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    address: 'Shanti Nagar',
    status: 'Active'
  },
  {
    id: 'stf-8',
    sNo: 8,
    serialNo: '160',
    biometricId: 'BIO-108',
    empId: 'EMP-1063',
    name: 'Mr Fakruddin Khan',
    gender: 'Male',
    dob: '1989-12-04',
    fatherName: 'Mr A.K. Khan',
    motherName: 'Mrs F. Khan',
    spouseName: 'Mrs S. Khan',
    phone: '9568154727',
    email: 'fakruddin.khan@school.edu',
    qualification: 'M.Sc. Math',
    joiningDate: '2020-11-01',
    department: 'TEACHING',
    designation: 'TEACHER',
    subject: 'Mathematics',
    password: '1777',
    role: 'Teacher',
    salary: 54000,
    accountNo: '98765432108',
    ifscCode: 'SBIN0001234',
    panNo: 'HIJKL8901M',
    uanNo: '100987654328',
    aadhaar: '8901-2345-6789',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    address: 'Civil Lines, Gali 2',
    status: 'Active'
  },
  {
    id: 'stf-9',
    sNo: 9,
    serialNo: '161',
    biometricId: 'BIO-109',
    empId: 'EMP-1064',
    name: 'Ms Meena',
    gender: 'Female',
    dob: '1991-04-16',
    fatherName: 'Mr Ram Swaroop',
    motherName: 'Mrs M. Swaroop',
    spouseName: '',
    phone: '8384818410',
    email: 'meena@school.edu',
    qualification: 'B.Com',
    joiningDate: '2021-05-15',
    department: 'OFFICE',
    designation: 'OFFICE',
    subject: 'Accounts',
    password: '1778',
    role: 'Staff',
    salary: 35000,
    accountNo: '98765432109',
    ifscCode: 'SBIN0001234',
    panNo: 'IJKLM9012N',
    uanNo: '100987654329',
    aadhaar: '9012-3456-7890',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    address: 'Surajpur',
    status: 'Active'
  },
  {
    id: 'stf-10',
    sNo: 10,
    serialNo: '162',
    biometricId: 'BIO-110',
    empId: 'EMP-1065',
    name: 'Ms Ragini Gupta',
    gender: 'Female',
    dob: '1994-07-20',
    fatherName: 'Mr S.K. Gupta',
    motherName: 'Mrs R. Gupta',
    spouseName: '',
    phone: '9837332097',
    email: 'ragini.gupta@school.edu',
    qualification: 'M.Sc. Chemistry',
    joiningDate: '2022-07-10',
    department: 'TEACHING',
    designation: 'TEACHER',
    subject: 'Chemistry',
    password: '1779',
    role: 'Teacher',
    salary: 50000,
    accountNo: '98765432110',
    ifscCode: 'SBIN0001234',
    panNo: 'JKLMN0123O',
    uanNo: '100987654330',
    aadhaar: '0123-4567-8901',
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    address: 'Indirapuram',
    status: 'Active'
  },

  // INACTIVE STAFF RECORDS (MATCHING NEW SCREENSHOT)
  {
    id: 'stf-in1',
    sNo: 1,
    serialNo: '201',
    biometricId: 'BIO-201',
    empId: 'EMP-1201',
    name: 'Ms Gargi Vats',
    gender: 'Female',
    dob: '1991-09-12',
    fatherName: 'Mr V.K. Vats',
    motherName: 'Mrs S. Vats',
    spouseName: '',
    phone: '7088988950',
    email: 'gargi.vats@school.edu',
    qualification: 'M.A., B.Ed.',
    joiningDate: '2019-04-01',
    department: 'TEACHING',
    designation: 'TEACHER',
    subject: 'English',
    password: '1801',
    role: 'Teacher',
    salary: 45000,
    accountNo: '',
    ifscCode: '',
    panNo: '',
    uanNo: '',
    aadhaar: '',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    address: 'Delhi',
    status: 'Inactive',
    exitDate: '2026-03-31',
    exitReason: 'Personal Leave'
  },
  {
    id: 'stf-in2',
    sNo: 2,
    serialNo: '202',
    biometricId: 'BIO-202',
    empId: 'EMP-1202',
    name: 'Ms Raksha Gupta',
    gender: 'Female',
    dob: '1993-04-18',
    fatherName: 'Mr P.K. Gupta',
    motherName: 'Mrs R. Gupta',
    spouseName: '',
    phone: '8449967296',
    email: 'raksha.gupta@school.edu',
    qualification: 'M.Sc., B.Ed.',
    joiningDate: '2020-07-15',
    department: 'TEACHING',
    designation: 'TEACHER',
    subject: 'Science',
    password: '1802',
    role: 'Teacher',
    salary: 48000,
    accountNo: '',
    ifscCode: '',
    panNo: '',
    uanNo: '',
    aadhaar: '',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    address: 'Noida',
    status: 'Inactive',
    exitDate: '2026-02-28',
    exitReason: 'Relocated'
  },
  {
    id: 'stf-in3',
    sNo: 3,
    serialNo: '203',
    biometricId: 'BIO-203',
    empId: 'EMP-1203',
    name: 'Ms Shivangi Mehta',
    gender: 'Female',
    dob: '1994-11-05',
    fatherName: 'Mr S.K. Mehta',
    motherName: 'Mrs M. Mehta',
    spouseName: '',
    phone: '6397513270',
    email: 'shivangi.mehta@school.edu',
    qualification: 'M.A., B.Ed.',
    joiningDate: '2021-09-01',
    department: 'TEACHING',
    designation: 'TEACHER',
    subject: 'Social Studies',
    password: '1803',
    role: 'Teacher',
    salary: 46000,
    accountNo: '',
    ifscCode: '',
    panNo: '',
    uanNo: '',
    aadhaar: '',
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    address: 'Ghaziabad',
    status: 'Inactive',
    exitDate: '2026-01-15',
    exitReason: 'Resigned'
  },
  {
    id: 'stf-in4',
    sNo: 4,
    serialNo: '204',
    biometricId: 'BIO-204',
    empId: 'EMP-1204',
    name: 'Mr Laxi Chandra Shastri',
    gender: 'Male',
    dob: '1986-07-22',
    fatherName: 'Mr B.R. Shastri',
    motherName: 'Mrs S. Shastri',
    spouseName: '',
    phone: '',
    email: 'laxi.shastri@school.edu',
    qualification: 'M.A. Sanskrit',
    joiningDate: '2018-04-01',
    department: 'TEACHING',
    designation: 'Teacher',
    subject: 'Sanskrit',
    password: '1804',
    role: 'Teacher',
    salary: 50000,
    accountNo: '',
    ifscCode: '',
    panNo: '',
    uanNo: '',
    aadhaar: '',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    address: 'Haridwar',
    status: 'Inactive',
    exitDate: '2025-12-31',
    exitReason: 'Retired'
  },
  {
    id: 'stf-in5',
    sNo: 5,
    serialNo: '205',
    biometricId: 'BIO-205',
    empId: 'EMP-1205',
    name: 'sweta sharma 2',
    gender: 'Female',
    dob: '1995-02-14',
    fatherName: 'Mr R. Sharma',
    motherName: 'Mrs K. Sharma',
    spouseName: '',
    phone: '8178738721',
    email: 'sweta.sharma@school.edu',
    qualification: 'M.Com',
    joiningDate: '2022-01-10',
    department: 'TEACHING',
    designation: 'TEACHER',
    subject: 'Commerce',
    password: '1805',
    role: 'Teacher',
    salary: 42000,
    accountNo: '',
    ifscCode: '',
    panNo: '',
    uanNo: '',
    aadhaar: '',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    address: 'Gurugram',
    status: 'Inactive',
    exitDate: '2026-02-15',
    exitReason: 'Career change'
  },
  {
    id: 'stf-in6',
    sNo: 6,
    serialNo: '206',
    biometricId: 'BIO-206',
    empId: 'EMP-1206',
    name: 'Shwetanuj sharma',
    gender: 'Male',
    dob: '1992-10-30',
    fatherName: 'Mr A. Sharma',
    motherName: 'Mrs G. Sharma',
    spouseName: '',
    phone: '8178738721',
    email: 'shwetanuj@school.edu',
    qualification: 'M.Tech',
    joiningDate: '2021-06-01',
    department: 'TEACHING',
    designation: 'TEACHER',
    subject: 'Computer Science',
    password: '1806',
    role: 'Teacher',
    salary: 52000,
    accountNo: '',
    ifscCode: '',
    panNo: '',
    uanNo: '',
    aadhaar: '',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    address: 'Delhi',
    status: 'Inactive',
    exitDate: '2026-03-15',
    exitReason: 'Higher Education'
  }
];

const INITIAL_DEPARTMENTS: Department[] = [
  { id: 1, name: 'TEACHING' },
  { id: 2, name: 'DIRECTOR' },
  { id: 3, name: 'VICE PRINCIPAL' },
  { id: 4, name: 'PRINCIPAL' },
  { id: 5, name: 'OFFICE' }
];

const MOCK_TEACHER_ACTIVITIES: TeacherActivity[] = [
  {
    teacherId: 'stf-5',
    teacherName: 'Mr Mohit Verma',
    department: 'TEACHING',
    assignedClasses: ['Class 9-B', 'Class 10-A', 'Class 10-C'],
    assignedSubjects: ['ENGLISH', 'English Literature'],
    scheduledPeriodsPerWeek: 26,
    conductedPeriodsPerWeek: 26,
    syllabusCompletionPct: 88,
    attendancePct: 98,
    rating: 4.9,
    recentActivities: [
      { id: 'act-1', date: '2026-07-20', class: 'Class 10-A', topic: 'English Grammar: Tenses & Active Passive', status: 'Completed' },
      { id: 'act-2', date: '2026-07-19', class: 'Class 9-B', topic: 'The Road Not Taken - Poem Explanation', status: 'Completed' }
    ]
  },
  {
    teacherId: 'stf-6',
    teacherName: 'Ms Mona Arora',
    department: 'TEACHING',
    assignedClasses: ['Class 11-A', 'Class 12-A'],
    assignedSubjects: ['Physics', 'Physics Lab'],
    scheduledPeriodsPerWeek: 24,
    conductedPeriodsPerWeek: 23,
    syllabusCompletionPct: 84,
    attendancePct: 96,
    rating: 4.8,
    recentActivities: [
      { id: 'act-3', date: '2026-07-20', class: 'Class 12-A', topic: 'Optics & Lens Formula Problems', status: 'Completed' }
    ]
  }
];

const MOCK_CLASS_ACTIVITIES: ClassActivity[] = [
  {
    classId: 'cls-10a',
    className: 'Class 10',
    section: 'A',
    classTeacher: 'Mr Mohit Verma',
    subjectTeachers: [
      { subject: 'ENGLISH', teacherName: 'Mr Mohit Verma', periodsPerWeek: 6, completionPct: 88 },
      { subject: 'Physics', teacherName: 'Ms Mona Arora', periodsPerWeek: 5, completionPct: 84 },
      { subject: 'Mathematics', teacherName: 'Mr Fakruddin Khan', periodsPerWeek: 6, completionPct: 80 }
    ]
  }
];

export type FacultySubView = 
  | 'add-staff' 
  | 'view-staff' 
  | 'department'
  | 'report-details' 
  | 'report-inactive'
  | 'activity-teacher' 
  | 'activity-class'
  | 'idcard-print' 
  | 'idcard-sample';

interface FacultyModuleProps {
  initialSubView?: FacultySubView;
  onNavigateSubView?: (subView: FacultySubView) => void;
}

export function FacultyModule({ initialSubView = 'view-staff', onNavigateSubView }: FacultyModuleProps) {
  const [activeSubView, setActiveSubView] = useState<FacultySubView>(initialSubView);

  // Synchronize internal state if parent prop changes
  React.useEffect(() => {
    if (initialSubView) {
      setActiveSubView(initialSubView);
    }
  }, [initialSubView]);

  const handleSubViewChange = (view: FacultySubView) => {
    setActiveSubView(view);
    if (onNavigateSubView) {
      onNavigateSubView(view);
    }
  };

  // State Management
  const [staffList, setStaffList] = useState<StaffMember[]>(INITIAL_STAFF);
  const [departments, setDepartments] = useState<Department[]>(INITIAL_DEPARTMENTS);
  const [selectedStaffForModal, setSelectedStaffForModal] = useState<StaffMember | null>(null);
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
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: '#6366f1',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          zIndex: 9999,
          fontWeight: 600,
          fontSize: '13px'
        }}>
          <CheckCircle2 size={18} />
          {toastMessage}
        </div>
      )}

      {/* RENDER ACTIVE SUB-VIEW DIRECTLY (NO DUPLICATE INTERNAL NAVBAR) */}
      {activeSubView === 'view-staff' && (
        <ViewStaffSection 
          staffList={staffList} 
          setStaffList={setStaffList} 
          departments={departments}
          onSelectStaffModal={(stf) => setSelectedStaffForModal(stf)}
          onNavigateAdd={() => handleSubViewChange('add-staff')}
          showToast={showToast}
        />
      )}

      {activeSubView === 'add-staff' && (
        <AddStaffSection 
          departments={departments}
          onAddStaff={(newStf) => {
            setStaffList(prev => [newStf, ...prev]);
            showToast(`Staff member "${newStf.name}" registered successfully!`);
            handleSubViewChange('view-staff');
          }}
        />
      )}

      {activeSubView === 'department' && (
        <DepartmentSection 
          departments={departments} 
          setDepartments={setDepartments}
          showToast={showToast}
        />
      )}

      {activeSubView === 'report-details' && (
        <StaffDetailsReportSection staffList={staffList} />
      )}

      {activeSubView === 'report-inactive' && (
        <InactiveReportSection 
          staffList={staffList} 
          onReactivateStaff={(id) => {
            setStaffList(prev => prev.map(s => s.id === id ? { ...s, status: 'Active' } : s));
            showToast('Staff member status updated!');
          }} 
        />
      )}

      {activeSubView === 'activity-teacher' && (
        <TeacherWiseActivitySection teacherActivities={MOCK_TEACHER_ACTIVITIES} />
      )}

      {activeSubView === 'activity-class' && (
        <ClassWiseActivitySection classActivities={MOCK_CLASS_ACTIVITIES} />
      )}

      {activeSubView === 'idcard-print' && (
        <IDCardPrintSection staffList={staffList.filter(s => s.status === 'Active')} />
      )}

      {activeSubView === 'idcard-sample' && (
        <IDCardSampleSection sampleStaff={staffList[0]} />
      )}

      {/* STAFF DETAILS MODAL */}
      {selectedStaffForModal && (
        <StaffModalDetails 
          staff={selectedStaffForModal} 
          onClose={() => setSelectedStaffForModal(null)} 
        />
      )}

    </div>
  );
}


// ====================================================================
// 1. VIEW STAFF SECTION (IMAGE 2 ALIGNMENT)
// ====================================================================
function ViewStaffSection({ 
  staffList, 
  setStaffList, 
  departments, 
  onSelectStaffModal,
  onNavigateAdd,
  showToast 
}: {
  staffList: StaffMember[];
  setStaffList: React.Dispatch<React.SetStateAction<StaffMember[]>>;
  departments: Department[];
  onSelectStaffModal: (stf: StaffMember) => void;
  onNavigateAdd: () => void;
  showToast: (msg: string) => void;
}) {
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');

  const activeStaffOnly = staffList.filter(s => s.status === 'Active');

  const filtered = activeStaffOnly.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
                          s.empId.toLowerCase().includes(search.toLowerCase()) ||
                          s.serialNo.includes(search) ||
                          s.phone.includes(search);
    const matchesDept = selectedDept === 'All' || s.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  const toggleStatus = (id: string) => {
    setStaffList(prev => prev.map(s => {
      if (s.id === id) {
        const nextStatus = s.status === 'Active' ? 'Inactive' : 'Active';
        showToast(`Staff status updated to ${nextStatus}`);
        return { ...s, status: nextStatus };
      }
      return s;
    }));
  };

  return (
    <div>
      {/* Filter and Action Bar */}
      <div className="erp-card" style={{ marginBottom: '16px' }}>
        <div className="erp-card-body" style={{ padding: '12px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px', flex: 1 }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input 
                  type="text" 
                  placeholder="Search name, serial no, contact..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ width: '100%', paddingLeft: '32px' }}
                />
              </div>

              <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} style={{ width: '160px' }}>
                <option value="All">All Departments</option>
                {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
              </select>
            </div>

            <button onClick={onNavigateAdd} className="erp-btn btn-primary" style={{ backgroundColor: '#2563eb', borderColor: '#2563eb' }}>
              <UserPlus size={14} /> Add Staff
            </button>
          </div>
        </div>
      </div>

      {/* Staff Table (Dark Teal Header matching Image 2) */}
      <div className="erp-card">
        <div className="table-container">
          <table className="erp-table">
            <thead>
              <tr style={{ backgroundColor: '#2563eb', color: '#ffffff' }}>
                <th style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 800 }}>S.No</th>
                <th style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 800 }}>Serial No</th>
                <th style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 800 }}>Name</th>
                <th style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 800 }}>Father's Name</th>
                <th style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 800 }}>Department</th>
                <th style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 800 }}>Designation</th>
                <th style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 800 }}>Contact</th>
                <th style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 800, textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                    No staff members match the current search & filters.
                  </td>
                </tr>
              ) : (
                filtered.map((stf, idx) => (
                  <tr key={stf.id}>
                    <td style={{ fontWeight: 800, color: '#0f172a' }}>{idx + 1}</td>
                    <td style={{ fontWeight: 800, color: '#0f172a' }}>{stf.serialNo || (idx + 153).toString()}</td>
                    <td style={{ fontWeight: 800, color: '#0f172a' }}>{stf.name}</td>
                    <td style={{ color: '#475569', fontWeight: 500 }}>{stf.fatherName}</td>
                    <td style={{ fontWeight: 800, color: '#0f172a', textTransform: 'uppercase' }}>{stf.department}</td>
                    <td style={{ fontWeight: 800, color: '#0f172a', textTransform: 'uppercase' }}>{stf.designation}</td>
                    <td style={{ fontWeight: 800, color: '#0f172a' }}>{stf.phone}</td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                        <button 
                          onClick={() => onSelectStaffModal(stf)} 
                          style={{
                            backgroundColor: '#4f46e5',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '16px',
                            padding: '4px 14px',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => toggleStatus(stf.id)} 
                          style={{
                            backgroundColor: '#4f46e5',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '16px',
                            padding: '4px 12px',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          More ▾
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer matching screenshot */}
        <PaginationFooter currentCount={filtered.length} totalCount={filtered.length} />
      </div>
    </div>
  );
}


// ====================================================================
// 2. ADD STAFF SECTION (IMAGE 1 ALIGNMENT - 3 CARD COLUMNS)
// ====================================================================
function AddStaffSection({ 
  departments, 
  onAddStaff 
}: { 
  departments: Department[];
  onAddStaff: (stf: StaffMember) => void;
}) {
  const [formData, setFormData] = useState({
    biometricId: '',
    empId: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
    joiningDate: new Date().toISOString().split('T')[0],
    department: 'TEACHING',
    designation: 'TEACHER',
    qualification: '',
    gender: 'Female' as 'Male' | 'Female' | 'Other',
    subject: '',
    password: Math.floor(1000 + Math.random() * 9000).toString(),
    
    // Column 2
    name: '',
    dob: '1992-06-15',
    fatherName: '',
    motherName: '',
    spouseName: '',
    email: '',
    phone: '',
    address: '',

    // Column 3
    photoFileName: '',
    role: 'Teacher',
    salary: '',
    accountNo: '',
    ifscCode: '',
    panNo: '',
    uanNo: '',
    aadhaar: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert('Please fill out all required fields (Teacher Name, Mobile No.).');
      return;
    }

    const newStaff: StaffMember = {
      id: `stf-${Date.now()}`,
      sNo: Date.now(),
      serialNo: Math.floor(164 + Math.random() * 100).toString(),
      biometricId: formData.biometricId || `BIO-${Math.floor(100 + Math.random() * 900)}`,
      empId: formData.empId,
      name: formData.name,
      gender: formData.gender,
      dob: formData.dob,
      fatherName: formData.fatherName,
      motherName: formData.motherName,
      spouseName: formData.spouseName,
      phone: formData.phone,
      email: formData.email || `${formData.name.toLowerCase().replace(/\s+/g, '.')}@school.edu`,
      qualification: formData.qualification || 'M.A., B.Ed.',
      joiningDate: formData.joiningDate,
      department: formData.department,
      designation: formData.designation,
      subject: formData.subject || 'General',
      password: formData.password,
      role: formData.role,
      salary: formData.salary ? Number(formData.salary) : 50000,
      accountNo: formData.accountNo,
      ifscCode: formData.ifscCode,
      panNo: formData.panNo,
      uanNo: formData.uanNo,
      aadhaar: formData.aadhaar,
      photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      address: formData.address || 'Delhi NCR, India',
      status: 'Active'
    };

    onAddStaff(newStaff);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* 3 Column Cards Layout (Matching Image 1 Exactly) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '20px' }}>
        
        {/* CARD 1 (LEFT COLUMN) */}
        <div className="erp-card" style={{ margin: 0, padding: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-group">
              <label style={imageLabelStyle}>Biometric Id.</label>
              <input 
                type="text" 
                value={formData.biometricId} 
                onChange={e => setFormData({ ...formData, biometricId: e.target.value })} 
                style={imageInputStyle} 
              />
            </div>

            <div className="form-group">
              <label style={imageLabelStyle}>Employee Id.</label>
              <input 
                type="text" 
                value={formData.empId} 
                onChange={e => setFormData({ ...formData, empId: e.target.value })} 
                style={{ ...imageInputStyle, color: '#dc2626', fontWeight: 700 }} 
              />
            </div>

            <div className="form-group">
              <label style={imageLabelStyle}>Date Of Joining</label>
              <input 
                type="date" 
                value={formData.joiningDate} 
                onChange={e => setFormData({ ...formData, joiningDate: e.target.value })} 
                style={imageInputStyle} 
              />
            </div>

            <div className="form-group">
              <label style={imageLabelStyle}>Department</label>
              <select 
                value={formData.department} 
                onChange={e => setFormData({ ...formData, department: e.target.value })}
                style={{ ...imageInputStyle, color: formData.department ? '#0f172a' : '#dc2626', fontWeight: 600 }}
              >
                <option value="" style={{ color: '#dc2626' }}>Select Department</option>
                {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label style={imageLabelStyle}>Designation</label>
              <input 
                type="text" 
                value={formData.designation} 
                onChange={e => setFormData({ ...formData, designation: e.target.value })} 
                style={imageInputStyle} 
              />
            </div>

            <div className="form-group">
              <label style={imageLabelStyle}>Qualification</label>
              <input 
                type="text" 
                value={formData.qualification} 
                onChange={e => setFormData({ ...formData, qualification: e.target.value })} 
                style={imageInputStyle} 
              />
            </div>

            <div className="form-group">
              <label style={imageLabelStyle}>Gender</label>
              <select 
                value={formData.gender} 
                onChange={e => setFormData({ ...formData, gender: e.target.value as any })}
                style={{ ...imageInputStyle, color: formData.gender ? '#0f172a' : '#dc2626', fontWeight: 600 }}
              >
                <option value="" style={{ color: '#dc2626' }}>Select Gender</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label style={imageLabelStyle}>Subject</label>
              <input 
                type="text" 
                value={formData.subject} 
                onChange={e => setFormData({ ...formData, subject: e.target.value })} 
                style={imageInputStyle} 
              />
            </div>

            <div className="form-group">
              <label style={imageLabelStyle}>Password</label>
              <input 
                type="text" 
                value={formData.password} 
                onChange={e => setFormData({ ...formData, password: e.target.value })} 
                style={{ ...imageInputStyle, color: '#dc2626', fontWeight: 700 }} 
              />
            </div>
          </div>
        </div>

        {/* CARD 2 (MIDDLE COLUMN) */}
        <div className="erp-card" style={{ margin: 0, padding: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-group">
              <label style={imageLabelStyle}>Teacher Name *</label>
              <input 
                type="text" 
                required
                value={formData.name} 
                onChange={e => setFormData({ ...formData, name: e.target.value })} 
                style={imageInputStyle} 
              />
            </div>

            <div className="form-group">
              <label style={imageLabelStyle}>Date of Birth</label>
              <input 
                type="date" 
                value={formData.dob} 
                onChange={e => setFormData({ ...formData, dob: e.target.value })} 
                style={imageInputStyle} 
              />
            </div>

            <div className="form-group">
              <label style={imageLabelStyle}>Father's Name</label>
              <input 
                type="text" 
                value={formData.fatherName} 
                onChange={e => setFormData({ ...formData, fatherName: e.target.value })} 
                style={imageInputStyle} 
              />
            </div>

            <div className="form-group">
              <label style={imageLabelStyle}>Mother's Name</label>
              <input 
                type="text" 
                value={formData.motherName} 
                onChange={e => setFormData({ ...formData, motherName: e.target.value })} 
                style={imageInputStyle} 
              />
            </div>

            <div className="form-group">
              <label style={imageLabelStyle}>Spouse Name</label>
              <input 
                type="text" 
                value={formData.spouseName} 
                onChange={e => setFormData({ ...formData, spouseName: e.target.value })} 
                style={imageInputStyle} 
              />
            </div>

            <div className="form-group">
              <label style={imageLabelStyle}>Email Id</label>
              <input 
                type="email" 
                value={formData.email} 
                onChange={e => setFormData({ ...formData, email: e.target.value })} 
                style={imageInputStyle} 
              />
            </div>

            <div className="form-group">
              <label style={imageLabelStyle}>Mobile No. *</label>
              <input 
                type="text" 
                required
                value={formData.phone} 
                onChange={e => setFormData({ ...formData, phone: e.target.value })} 
                style={imageInputStyle} 
              />
            </div>

            <div className="form-group">
              <label style={imageLabelStyle}>Address</label>
              <textarea 
                rows={3} 
                value={formData.address} 
                onChange={e => setFormData({ ...formData, address: e.target.value })} 
                style={{ ...imageInputStyle, height: 'auto', resize: 'vertical' }} 
              />
            </div>
          </div>
        </div>

        {/* CARD 3 (RIGHT COLUMN) */}
        <div className="erp-card" style={{ margin: 0, padding: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            {/* File Upload Box */}
            <div style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '6px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff' }}>
              <label style={{ backgroundColor: '#e2e8f0', color: '#475569', padding: '6px 14px', borderRadius: '4px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                Choose File
                <input 
                  type="file" 
                  style={{ display: 'none' }} 
                  onChange={e => setFormData({ ...formData, photoFileName: e.target.files?.[0]?.name || '' })} 
                />
              </label>
              <span style={{ fontSize: '13px', fontWeight: 700, color: formData.photoFileName ? '#10b981' : '#dc2626' }}>
                {formData.photoFileName || 'No file chosen'}
              </span>
            </div>

            {/* Orange Open Camera Button */}
            <button 
              type="button" 
              onClick={() => alert('Camera preview feature activated!')} 
              style={{
                backgroundColor: '#4f46e5',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              Open Camera
            </button>

            <div className="form-group">
              <label style={imageLabelStyle}>Assign Role</label>
              <select 
                value={formData.role} 
                onChange={e => setFormData({ ...formData, role: e.target.value })}
                style={{ ...imageInputStyle, color: formData.role ? '#0f172a' : '#dc2626', fontWeight: 600 }}
              >
                <option value="" style={{ color: '#dc2626' }}>Select Role</option>
                <option value="Teacher">Teacher</option>
                <option value="Admin">Admin</option>
                <option value="Principal">Principal</option>
                <option value="Vice Principal">Vice Principal</option>
                <option value="Staff">Staff</option>
              </select>
            </div>

            <div className="form-group">
              <label style={imageLabelStyle}>Salary</label>
              <input 
                type="text" 
                value={formData.salary} 
                onChange={e => setFormData({ ...formData, salary: e.target.value })} 
                style={imageInputStyle} 
              />
            </div>

            <div className="form-group">
              <label style={imageLabelStyle}>Account No.</label>
              <input 
                type="text" 
                value={formData.accountNo} 
                onChange={e => setFormData({ ...formData, accountNo: e.target.value })} 
                style={imageInputStyle} 
              />
            </div>

            <div className="form-group">
              <label style={imageLabelStyle}>IFSC Code</label>
              <input 
                type="text" 
                value={formData.ifscCode} 
                onChange={e => setFormData({ ...formData, ifscCode: e.target.value })} 
                style={imageInputStyle} 
              />
            </div>

            <div className="form-group">
              <label style={imageLabelStyle}>Pan No.</label>
              <input 
                type="text" 
                value={formData.panNo} 
                onChange={e => setFormData({ ...formData, panNo: e.target.value })} 
                style={imageInputStyle} 
              />
            </div>

            <div className="form-group">
              <label style={imageLabelStyle}>UAN No.</label>
              <input 
                type="text" 
                value={formData.uanNo} 
                onChange={e => setFormData({ ...formData, uanNo: e.target.value })} 
                style={imageInputStyle} 
              />
            </div>

            <div className="form-group">
              <label style={imageLabelStyle}>Aadhaar</label>
              <input 
                type="text" 
                value={formData.aadhaar} 
                onChange={e => setFormData({ ...formData, aadhaar: e.target.value })} 
                style={imageInputStyle} 
              />
            </div>
          </div>
        </div>

      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
        <button type="submit" className="erp-btn btn-primary" style={{ backgroundColor: '#2563eb', borderColor: '#2563eb', padding: '0 28px', height: '42px', fontSize: '14px' }}>
          <Check size={16} /> Save & Register Staff Member
        </button>
      </div>

    </form>
  );
}


// ====================================================================
// 3. DEPARTMENT SECTION (IMAGE 3 ALIGNMENT)
// ====================================================================
function DepartmentSection({
  departments,
  setDepartments,
  showToast
}: {
  departments: Department[];
  setDepartments: React.Dispatch<React.SetStateAction<Department[]>>;
  showToast: (msg: string) => void;
}) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');

  const handleAddDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName) return;

    const created: Department = {
      id: Date.now(),
      name: newDeptName.toUpperCase()
    };

    setDepartments(prev => [...prev, created]);
    showToast(`Department "${newDeptName.toUpperCase()}" added!`);
    setNewDeptName('');
    setShowAddModal(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Department Directory
          </h3>
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            Manage school departments and administrative categories
          </span>
        </div>
        <button onClick={() => setShowAddModal(true)} className="erp-btn btn-primary" style={{ backgroundColor: '#2563eb', borderColor: '#2563eb' }}>
          <PlusCircle size={14} /> Add Department
        </button>
      </div>

      {/* Table matching Image 3 */}
      <div className="erp-card">
        <div className="table-container">
          <table className="erp-table">
            <thead>
              <tr style={{ backgroundColor: '#2563eb', color: '#ffffff' }}>
                <th style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 800, width: '100px' }}>ID</th>
                <th style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 800 }}>Name</th>
                <th style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 800, width: '140px', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept, idx) => (
                <tr key={dept.id}>
                  <td style={{ fontWeight: 800, color: '#0f172a' }}>{idx + 1}</td>
                  <td style={{ fontWeight: 800, color: '#0f172a', textTransform: 'uppercase' }}>{dept.name}</td>
                  <td style={{ textAlign: 'center' }}>
                    <button 
                      onClick={() => alert(`Edit Department ${dept.name}`)}
                      style={{
                        backgroundColor: '#4f46e5',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '16px',
                        padding: '4px 18px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        <PaginationFooter currentCount={departments.length} totalCount={departments.length} />
      </div>

      {/* CREATE DEPT MODAL */}
      {showAddModal && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(3px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999
        }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', width: '100%', maxWidth: '400px', border: '1px solid #cbd5e1', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div className="erp-card-header">
              <span className="erp-card-title">Add New Department</span>
            </div>
            <form onSubmit={handleAddDept} style={{ padding: '16px' }}>
              <div className="form-group">
                <label style={imageLabelStyle}>Department Name *</label>
                <input 
                  type="text" required placeholder="e.g. SPORTS" 
                  value={newDeptName} onChange={(e) => setNewDeptName(e.target.value)}
                  style={imageInputStyle}
                />
              </div>

              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="erp-btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="erp-btn btn-primary" style={{ backgroundColor: '#2563eb' }}>
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


// ====================================================================
// 4. STAFF DETAILS / STAFF REPORT (IMAGE 4 ALIGNMENT)
// ====================================================================
function StaffDetailsReportSection({ staffList }: { staffList: StaffMember[] }) {
  const exportCSV = () => {
    const headers = ["S. No", "Name", "D.O.B.", "Department", "Designation", "Qualification", "Gender", "Subject", "Contact", "Date Of Joining", "Father", "Mother"];
    const rows = staffList.map((s, i) => [i + 1, s.name, s.dob, s.department, s.designation, s.qualification, s.gender, s.subject, s.phone, s.joiningDate, s.fatherName, s.motherName]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Staff_Report_Session_2026_2027.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printReport = () => {
    window.print();
  };

  return (
    <div>
      {/* Purple Header Banner matching Image 4 Exactly */}
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
          Staff Report : (Session: 2026-2027)
        </h3>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={exportCSV} 
            style={{
              backgroundColor: '#6366f1',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 16px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Download size={14} /> Export
          </button>

          <button 
            onClick={printReport} 
            style={{
              backgroundColor: '#6366f1',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 20px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Print
          </button>
        </div>
      </div>

      {/* Staff Report Table (Image 4 Alignment) */}
      <div className="erp-card" style={{ borderRadius: '0 0 8px 8px', marginTop: 0 }}>
        <div className="table-container">
          <table className="erp-table">
            <thead>
              <tr style={{ backgroundColor: '#2563eb', color: '#ffffff' }}>
                <th style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 800 }}>S. No</th>
                <th style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 800 }}>Name</th>
                <th style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 800 }}>D.O.B.</th>
                <th style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 800 }}>Department</th>
                <th style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 800 }}>Designation</th>
                <th style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 800 }}>Qualification</th>
                <th style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 800 }}>Gender</th>
                <th style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 800 }}>Subject</th>
                <th style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 800 }}>Contact</th>
                <th style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 800 }}>Date Of Joining</th>
                <th style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 800 }}>Father</th>
                <th style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 800 }}>Mother</th>
              </tr>
            </thead>
            <tbody>
              {staffList.map((stf, idx) => (
                <tr key={stf.id}>
                  <td style={{ fontWeight: 800, color: '#0f172a' }}>{idx + 1}</td>
                  <td style={{ fontWeight: 800, color: '#0f172a' }}>{stf.name}</td>
                  <td style={{ color: '#475569', fontWeight: 600 }}>{stf.dob}</td>
                  <td style={{ fontWeight: 800, color: '#0f172a' }}>{stf.department}</td>
                  <td style={{ fontWeight: 800, color: '#0f172a' }}>{stf.designation}</td>
                  <td style={{ color: '#475569', fontWeight: 600 }}>{stf.qualification}</td>
                  <td style={{ color: '#475569', fontWeight: 600 }}>{stf.gender}</td>
                  <td style={{ color: '#0f172a', fontWeight: 700 }}>{stf.subject}</td>
                  <td style={{ fontWeight: 800, color: '#0f172a' }}>{stf.phone}</td>
                  <td style={{ color: '#475569', fontWeight: 600 }}>{stf.joiningDate}</td>
                  <td style={{ color: '#0f172a', fontWeight: 700 }}>{stf.fatherName}</td>
                  <td style={{ color: '#0f172a', fontWeight: 700 }}>{stf.motherName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <PaginationFooter currentCount={staffList.length} totalCount={staffList.length} />
      </div>
    </div>
  );
}


// ====================================================================
// 5. INACTIVE STAFF REPORT (NEW SCREENSHOT ALIGNMENT)
// ====================================================================
function InactiveReportSection({ 
  staffList, 
  onReactivateStaff 
}: { 
  staffList: StaffMember[];
  onReactivateStaff: (id: string) => void;
}) {
  const inactiveStaff = staffList.filter(s => s.status === 'Inactive');
  const [activeToggles, setActiveToggles] = useState<Record<string, boolean>>({});

  const toggleSwitch = (id: string) => {
    setActiveToggles(prev => ({ ...prev, [id]: !prev[id] }));
    onReactivateStaff(id);
  };

  return (
    <div>
      {/* Table matching the latest Screenshot */}
      <div className="erp-card">
        <div className="table-container">
          <table className="erp-table">
            <thead>
              <tr style={{ backgroundColor: '#2563eb', color: '#ffffff' }}>
                <th style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 800 }}>S.No</th>
                <th style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 800 }}>Name</th>
                <th style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 800 }}>Father's Name</th>
                <th style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 800 }}>Department</th>
                <th style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 800 }}>Designation</th>
                <th style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 800 }}>Contact</th>
                <th style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 800, textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {inactiveStaff.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                    No inactive staff records found.
                  </td>
                </tr>
              ) : (
                inactiveStaff.map((stf, idx) => (
                  <tr key={stf.id}>
                    <td style={{ fontWeight: 800, color: '#0f172a' }}>{idx + 1}</td>
                    <td style={{ fontWeight: 800, color: '#0f172a' }}>{stf.name}</td>
                    <td style={{ color: '#475569', fontWeight: 500 }}>{stf.fatherName}</td>
                    <td style={{ fontWeight: 800, color: '#0f172a', textTransform: 'uppercase' }}>{stf.department}</td>
                    <td style={{ fontWeight: 800, color: '#0f172a' }}>{stf.designation}</td>
                    <td style={{ fontWeight: 800, color: '#0f172a' }}>{stf.phone}</td>
                    <td style={{ textAlign: 'center' }}>
                      {/* Toggle Switch Component matching screenshot */}
                      <button 
                        onClick={() => toggleSwitch(stf.id)}
                        style={{
                          width: '42px',
                          height: '22px',
                          backgroundColor: activeToggles[stf.id] ? '#10b981' : '#cbd5e1',
                          borderRadius: '12px',
                          border: 'none',
                          cursor: 'pointer',
                          position: 'relative',
                          transition: 'background-color 0.2s',
                          padding: 0
                        }}
                      >
                        <div style={{
                          width: '18px',
                          height: '18px',
                          backgroundColor: '#ffffff',
                          borderRadius: '50%',
                          position: 'absolute',
                          top: '2px',
                          left: activeToggles[stf.id] ? '22px' : '2px',
                          transition: 'left 0.2s',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                        }} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer matching screenshot */}
        <PaginationFooter currentCount={inactiveStaff.length} totalCount={inactiveStaff.length} />
      </div>
    </div>
  );
}


// ====================================================================
// 6. ACTIVITY REPORT - TEACHER WISE
// ====================================================================
function TeacherWiseActivitySection({ teacherActivities }: { teacherActivities: TeacherActivity[] }) {
  const [selectedTeacherId, setSelectedTeacherId] = useState(teacherActivities[0]?.teacherId || 'stf-5');

  const selected = teacherActivities.find(t => t.teacherId === selectedTeacherId) || teacherActivities[0];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Teacher-Wise Activity & Workload Log
          </h3>
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            Period quotas, syllabus coverage, and classroom lesson entries per teacher
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>Select Teacher:</span>
          <select 
            value={selectedTeacherId} 
            onChange={(e) => setSelectedTeacherId(e.target.value)}
            style={{ width: '220px' }}
          >
            {teacherActivities.map(t => (
              <option key={t.teacherId} value={t.teacherId}>{t.teacherName} ({t.department})</option>
            ))}
          </select>
        </div>
      </div>

      {selected && (
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px' }}>
          
          <div className="erp-card" style={{ margin: 0 }}>
            <div className="erp-card-header">
              <span className="erp-card-title">Teacher Profile</span>
            </div>
            <div className="erp-card-body" style={{ padding: '16px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>{selected.teacherName}</h4>
              <p style={{ color: '#2563eb', fontSize: '12px', fontWeight: 700, margin: '2px 0 14px 0' }}>{selected.department} Department</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
                <div style={{ backgroundColor: '#f8fafc', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <div style={{ color: '#64748b', fontSize: '10.5px', fontWeight: 700 }}>ASSIGNED CLASSES</div>
                  <div style={{ color: '#0f172a', fontWeight: 700, marginTop: '2px' }}>
                    {selected.assignedClasses.join(', ')}
                  </div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <div style={{ color: '#64748b', fontSize: '10.5px', fontWeight: 700 }}>WEEKLY PERIOD LOAD</div>
                  <div style={{ color: '#0f172a', fontWeight: 700, marginTop: '2px' }}>
                    {selected.conductedPeriodsPerWeek} / {selected.scheduledPeriodsPerWeek} Conducted
                  </div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <div style={{ color: '#64748b', fontSize: '10.5px', fontWeight: 700 }}>SYLLABUS PROGRESS</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <div style={{ flex: 1, backgroundColor: '#e2e8f0', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${selected.syllabusCompletionPct}%`, backgroundColor: '#2563eb', height: '100%' }} />
                    </div>
                    <span style={{ color: '#2563eb', fontWeight: 800 }}>{selected.syllabusCompletionPct}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="erp-card" style={{ margin: 0 }}>
            <div className="erp-card-header">
              <span className="erp-card-title">Recent Lesson & Classroom Activity Logs</span>
            </div>
            <div className="table-container">
              <table className="erp-table">
                <thead>
                  <tr style={{ backgroundColor: '#2563eb', color: '#ffffff' }}>
                    <th style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 800 }}>Date</th>
                    <th style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 800 }}>Class</th>
                    <th style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 800 }}>Lesson / Topic Covered</th>
                    <th style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 800 }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.recentActivities.map(act => (
                    <tr key={act.id}>
                      <td style={{ color: '#64748b' }}>{act.date}</td>
                      <td style={{ fontWeight: 800, color: '#0f172a' }}>{act.class}</td>
                      <td style={{ color: '#0f172a', fontWeight: 600 }}>{act.topic}</td>
                      <td>
                        <span className="erp-badge badge-approved">
                          {act.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}


// ====================================================================
// 7. ACTIVITY REPORT - CLASS WISE
// ====================================================================
function ClassWiseActivitySection({ classActivities }: { classActivities: ClassActivity[] }) {
  const [selectedClassId, setSelectedClassId] = useState(classActivities[0]?.classId || 'cls-10a');

  const selected = classActivities.find(c => c.classId === selectedClassId) || classActivities[0];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Class-Wise Faculty Allocation Summary
          </h3>
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            Faculty subject assignments, period load distribution and syllabus status
          </span>
        </div>
        <select value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)} style={{ width: '200px' }}>
          {classActivities.map(c => (
            <option key={c.classId} value={c.classId}>{c.className} - Section {c.section}</option>
          ))}
        </select>
      </div>

      {selected && (
        <div className="erp-card">
          <div className="erp-card-header" style={{ padding: '12px 18px' }}>
            <div>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>CLASS & SECTION: </span>
              <strong style={{ fontSize: '14px', color: '#0f172a', marginLeft: '4px' }}>{selected.className} ({selected.section})</strong>
            </div>
            <div>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>CLASS TEACHER: </span>
              <strong style={{ fontSize: '14px', color: '#2563eb', marginLeft: '4px' }}>{selected.classTeacher}</strong>
            </div>
          </div>

          <div className="table-container">
            <table className="erp-table">
              <thead>
                <tr style={{ backgroundColor: '#2563eb', color: '#ffffff' }}>
                  <th style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 800 }}>Subject</th>
                  <th style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 800 }}>Assigned Faculty</th>
                  <th style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 800 }}>Periods / Week</th>
                  <th style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 800 }}>Syllabus Completion</th>
                </tr>
              </thead>
              <tbody>
                {selected.subjectTeachers.map((st, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 800, color: '#0f172a' }}>{st.subject}</td>
                    <td style={{ color: '#334155', fontWeight: 600 }}>{st.teacherName}</td>
                    <td style={{ color: '#2563eb', fontWeight: 800 }}>{st.periodsPerWeek} Periods</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ flex: 1, backgroundColor: '#e2e8f0', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${st.completionPct}%`, backgroundColor: '#2563eb', height: '100%' }} />
                        </div>
                        <span style={{ color: '#2563eb', fontSize: '12px', fontWeight: 800 }}>{st.completionPct}%</span>
                      </div>
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
// 8. STAFF ID CARD - ID CARD PRINT
// ====================================================================
function IDCardPrintSection({ staffList }: { staffList: StaffMember[] }) {
  const [selectedIds, setSelectedIds] = useState<string[]>(staffList.map(s => s.id));

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    if (selectedIds.length === staffList.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(staffList.map(s => s.id));
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Bulk Staff ID Card Printing Console
          </h3>
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            Select staff members to render printable ID badges
          </span>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={toggleAll} className="erp-btn btn-outline">
            {selectedIds.length === staffList.length ? 'Deselect All' : 'Select All Staff'}
          </button>
          <button onClick={handlePrint} className="erp-btn btn-primary" style={{ backgroundColor: '#2563eb', borderColor: '#2563eb' }}>
            <Printer size={14} /> Print {selectedIds.length} Selected Cards
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
        {staffList.map(stf => {
          const isChecked = selectedIds.includes(stf.id);
          return (
            <div 
              key={stf.id}
              onClick={() => toggleSelect(stf.id)}
              style={{
                position: 'relative',
                cursor: 'pointer',
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                padding: '16px',
                border: isChecked ? '2px solid #2563eb' : '1px solid #e2e8f0',
                boxShadow: isChecked ? '0 4px 12px rgba(0,105,107,0.15)' : '0 1px 3px rgba(0,0,0,0.02)',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{
                position: 'absolute', top: '10px', right: '10px',
                width: '20px', height: '20px', borderRadius: '50%',
                backgroundColor: isChecked ? '#2563eb' : '#cbd5e1',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
              }}>
                {isChecked && <Check size={12} />}
              </div>

              <div style={{
                backgroundColor: '#ffffff',
                color: '#0f172a',
                borderRadius: '8px',
                padding: '14px',
                textAlign: 'center',
                border: '1px solid #cbd5e1'
              }}>
                <div style={{ borderBottom: '2px solid #2563eb', paddingBottom: '6px', marginBottom: '10px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#2563eb', letterSpacing: '0.5px' }}>
                    DETTROIN GLOBAL SCHOOL
                  </div>
                  <div style={{ fontSize: '8.5px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                    OFFICIAL STAFF IDENTITY CARD
                  </div>
                </div>

                <img 
                  src={stf.photoUrl} 
                  alt={stf.name} 
                  style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #2563eb', margin: '0 auto 8px' }} 
                />

                <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>{stf.name}</div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#2563eb', margin: '2px 0 6px' }}>{stf.designation}</div>

                <div style={{ backgroundColor: '#f8fafc', padding: '6px 8px', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '10.5px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <div><strong>EMP ID:</strong> {stf.empId}</div>
                  <div><strong>DEPT:</strong> {stf.department}</div>
                  <div><strong>MOBILE:</strong> {stf.phone}</div>
                </div>

                <div style={{ marginTop: '8px', fontSize: '9px', letterSpacing: '3px', fontFamily: 'monospace', color: '#64748b' }}>
                  ||| | |||| || ||| || ||||
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}


// ====================================================================
// 9. STAFF ID CARD - ID CARD SAMPLE
// ====================================================================
function IDCardSampleSection({ sampleStaff }: { sampleStaff: StaffMember }) {
  const [cardTheme, setCardTheme] = useState<'teal' | 'dark' | 'emerald' | 'crimson'>('teal');
  const [showQr, setShowQr] = useState(true);
  const [showLogo, setShowLogo] = useState(true);

  const themeColors = {
    teal: { bg: '#ffffff', headerBg: '#2563eb', headerText: '#ffffff', accent: '#2563eb' },
    dark: { bg: '#0f172a', headerBg: '#1e293b', headerText: '#f8fafc', accent: '#38bdf8' },
    emerald: { bg: '#ffffff', headerBg: '#065f46', headerText: '#ffffff', accent: '#059669' },
    crimson: { bg: '#ffffff', headerBg: '#991b1b', headerText: '#ffffff', accent: '#dc2626' }
  };

  const currentTheme = themeColors[cardTheme];

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
          Interactive Staff ID Card Customizer & Preview
        </h3>
        <span style={{ fontSize: '12px', color: '#64748b' }}>
          Customize card color themes, logos, barcodes and layout options in real-time
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '20px' }}>
        
        <div className="erp-card" style={{ margin: 0 }}>
          <div className="erp-card-header">
            <span className="erp-card-title">Customization Controls</span>
          </div>
          <div className="erp-card-body" style={{ padding: '16px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
              Select Theme Color
            </label>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '16px' }}>
              <button 
                onClick={() => setCardTheme('teal')} 
                className="erp-btn btn-outline"
                style={{ height: '32px', fontSize: '11px', backgroundColor: cardTheme === 'teal' ? '#2563eb' : '#f8fafc', color: cardTheme === 'teal' ? '#fff' : '#0f172a' }}
              >
                Deep Teal
              </button>
              <button 
                onClick={() => setCardTheme('dark')} 
                className="erp-btn btn-outline"
                style={{ height: '32px', fontSize: '11px', backgroundColor: cardTheme === 'dark' ? '#0f172a' : '#f8fafc', color: cardTheme === 'dark' ? '#fff' : '#0f172a' }}
              >
                Sleek Dark
              </button>
              <button 
                onClick={() => setCardTheme('emerald')} 
                className="erp-btn btn-outline"
                style={{ height: '32px', fontSize: '11px', backgroundColor: cardTheme === 'emerald' ? '#059669' : '#f8fafc', color: cardTheme === 'emerald' ? '#fff' : '#0f172a' }}
              >
                Emerald
              </button>
              <button 
                onClick={() => setCardTheme('crimson')} 
                className="erp-btn btn-outline"
                style={{ height: '32px', fontSize: '11px', backgroundColor: cardTheme === 'crimson' ? '#dc2626' : '#f8fafc', color: cardTheme === 'crimson' ? '#fff' : '#0f172a' }}
              >
                Crimson
              </button>
            </div>

            <label style={{ fontSize: '12px', color: '#0f172a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '8px' }}>
              <input type="checkbox" checked={showLogo} onChange={(e) => setShowLogo(e.target.checked)} />
              Display School Logo
            </label>

            <label style={{ fontSize: '12px', color: '#0f172a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" checked={showQr} onChange={(e) => setShowQr(e.target.checked)} />
              Include Verification Barcode
            </label>
          </div>
        </div>

        <div className="erp-card" style={{ margin: 0, padding: '32px', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
          
          <div style={{
            width: '280px',
            backgroundColor: currentTheme.bg,
            color: cardTheme === 'dark' ? '#f8fafc' : '#0f172a',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            border: '1px solid #cbd5e1'
          }}>
            <div style={{ backgroundColor: currentTheme.headerBg, color: currentTheme.headerText, padding: '14px', textAlign: 'center' }}>
              {showLogo && <Sparkles size={18} style={{ margin: '0 auto 2px' }} />}
              <div style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '0.5px' }}>
                DETTROIN GLOBAL SCHOOL
              </div>
              <div style={{ fontSize: '9px', opacity: 0.8, textTransform: 'uppercase' }}>
                FACULTY IDENTITY CARD
              </div>
            </div>

            <div style={{ padding: '18px', textAlign: 'center' }}>
              <img 
                src={sampleStaff?.photoUrl} 
                alt="Sample" 
                style={{ width: '75px', height: '75px', borderRadius: '50%', objectFit: 'cover', border: `3px solid ${currentTheme.accent}`, margin: '0 auto 10px' }}
              />

              <h4 style={{ fontSize: '15px', fontWeight: 800, margin: 0 }}>{sampleStaff?.name || 'Mr Rahul Rathi'}</h4>
              <p style={{ color: currentTheme.accent, fontSize: '11px', fontWeight: 700, margin: '2px 0 12px 0' }}>
                {sampleStaff?.designation || 'DIRECTOR'}
              </p>

              <div style={{
                backgroundColor: cardTheme === 'dark' ? '#1e293b' : '#f8fafc',
                padding: '8px 10px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '11px',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '3px'
              }}>
                <div><strong>Emp ID:</strong> {sampleStaff?.empId || 'EMP-1056'}</div>
                <div><strong>Department:</strong> {sampleStaff?.department || 'DIRECTOR'}</div>
                <div><strong>Mobile:</strong> {sampleStaff?.phone || '9897619531'}</div>
              </div>

              {showQr && (
                <div style={{ marginTop: '12px', fontSize: '9px', letterSpacing: '3px', fontFamily: 'monospace', color: cardTheme === 'dark' ? '#94a3b8' : '#64748b' }}>
                  |||| ||| |||| || |||
                </div>
              )}
            </div>

            <div style={{ backgroundColor: currentTheme.headerBg, height: '6px' }} />
          </div>

        </div>

      </div>
    </div>
  );
}


// ====================================================================
// PAGINATION FOOTER (MATCHING SCREENSHOT "Showing 1 to X of X entries")
// ====================================================================
function PaginationFooter({ currentCount, totalCount }: { currentCount: number; totalCount: number }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 16px',
      borderTop: '1px solid #e2e8f0',
      fontSize: '13px',
      color: '#64748b',
      fontWeight: 600,
      backgroundColor: '#f8fafc'
    }}>
      <div>
        Showing 1 to {currentCount} of {totalCount} entries
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
        <span style={{ color: '#94a3b8', cursor: 'pointer' }}>First</span>
        <span style={{ color: '#94a3b8', cursor: 'pointer', fontWeight: 800 }}>‹</span>
        <div style={{
          backgroundColor: '#4f46e5',
          color: '#ffffff',
          fontWeight: 800,
          padding: '2px 10px',
          borderRadius: '4px'
        }}>
          1
        </div>
        <span style={{ color: '#94a3b8', cursor: 'pointer', fontWeight: 800 }}>›</span>
        <span style={{ color: '#94a3b8', cursor: 'pointer' }}>Last</span>
      </div>
    </div>
  );
}


// ====================================================================
// STAFF MODAL DETAILS VIEW
// ====================================================================
function StaffModalDetails({ staff, onClose }: { staff: StaffMember; onClose: () => void }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(3px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999
    }}>
      <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', width: '100%', maxWidth: '640px', padding: '20px', border: '1px solid #cbd5e1', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', maxHeight: '90vh', overflowY: 'auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <img src={staff.photoUrl} alt={staff.name} style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #2563eb' }} />
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>{staff.name}</h3>
              <div style={{ fontSize: '12px', color: '#2563eb', fontWeight: 700, marginTop: '2px' }}>{staff.designation} ({staff.department})</div>
            </div>
          </div>
          <button onClick={onClose} className="erp-btn btn-outline" style={{ height: '30px' }}>Close</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', fontSize: '12px' }}>
          <div style={{ backgroundColor: '#f8fafc', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 700 }}>SERIAL NO</span>
            <div style={{ fontWeight: 700, color: '#0f172a' }}>{staff.serialNo}</div>
          </div>
          <div style={{ backgroundColor: '#f8fafc', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 700 }}>EMPLOYEE ID</span>
            <div style={{ fontWeight: 700, color: '#dc2626' }}>{staff.empId}</div>
          </div>
          <div style={{ backgroundColor: '#f8fafc', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 700 }}>BIOMETRIC ID</span>
            <div style={{ fontWeight: 700, color: '#0f172a' }}>{staff.biometricId}</div>
          </div>

          <div style={{ backgroundColor: '#f8fafc', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 700 }}>D.O.B.</span>
            <div style={{ fontWeight: 700, color: '#0f172a' }}>{staff.dob}</div>
          </div>
          <div style={{ backgroundColor: '#f8fafc', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 700 }}>JOINING DATE</span>
            <div style={{ fontWeight: 700, color: '#0f172a' }}>{staff.joiningDate}</div>
          </div>
          <div style={{ backgroundColor: '#f8fafc', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 700 }}>GENDER</span>
            <div style={{ fontWeight: 700, color: '#0f172a' }}>{staff.gender}</div>
          </div>

          <div style={{ backgroundColor: '#f8fafc', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 700 }}>FATHER'S NAME</span>
            <div style={{ fontWeight: 700, color: '#0f172a' }}>{staff.fatherName}</div>
          </div>
          <div style={{ backgroundColor: '#f8fafc', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 700 }}>MOTHER'S NAME</span>
            <div style={{ fontWeight: 700, color: '#0f172a' }}>{staff.motherName}</div>
          </div>
          <div style={{ backgroundColor: '#f8fafc', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 700 }}>SPOUSE NAME</span>
            <div style={{ fontWeight: 700, color: '#0f172a' }}>{staff.spouseName || 'N/A'}</div>
          </div>

          <div style={{ backgroundColor: '#f8fafc', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 700 }}>QUALIFICATION</span>
            <div style={{ fontWeight: 700, color: '#0f172a' }}>{staff.qualification}</div>
          </div>
          <div style={{ backgroundColor: '#f8fafc', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 700 }}>SUBJECT</span>
            <div style={{ fontWeight: 700, color: '#0f172a' }}>{staff.subject}</div>
          </div>
          <div style={{ backgroundColor: '#f8fafc', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 700 }}>ROLE</span>
            <div style={{ fontWeight: 700, color: '#0f172a' }}>{staff.role}</div>
          </div>

          <div style={{ backgroundColor: '#f8fafc', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 700 }}>CONTACT / MOBILE</span>
            <div style={{ fontWeight: 700, color: '#0f172a' }}>{staff.phone}</div>
          </div>
          <div style={{ backgroundColor: '#f8fafc', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', gridColumn: 'span 2' }}>
            <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 700 }}>EMAIL ID</span>
            <div style={{ fontWeight: 700, color: '#0f172a' }}>{staff.email}</div>
          </div>
        </div>

      </div>
    </div>
  );
}

// Inline Label and Input styles
const imageLabelStyle: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 800,
  color: '#0f172a',
  marginBottom: '4px'
};

const imageInputStyle: React.CSSProperties = {
  height: '38px',
  padding: '0 12px',
  border: '1px solid #cbd5e1',
  borderRadius: '4px',
  backgroundColor: '#ffffff',
  fontSize: '13px',
  color: '#0f172a',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box'
};
