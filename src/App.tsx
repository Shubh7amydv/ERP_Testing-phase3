import React, { useState } from 'react';
import {
  Users, UserPlus, FileSpreadsheet, Wallet, Settings,
  BookOpen, Calendar, Search, AlertTriangle,
  CheckCircle, Contact, Receipt, Printer, X, Trash2,
  ChevronDown, ChevronRight, LayoutDashboard, Clock,
  ShieldCheck, ChevronLeft, Award, DollarSign,
  CalendarDays, Ticket, CreditCard,
  Terminal, ShieldAlert, CalendarCheck, FileText,
  MessageSquare, Package, Bus, Building, DoorOpen, Trophy,
  BarChart3, GraduationCap, IndianRupee, ClipboardList, TrendingDown
} from 'lucide-react';
import { api } from './api';
import { LibraryView, HostelView, TransportView, AccountsView, PermissionsView } from './NewModules';
import { RoleDashboard } from './RoleDashboards';
import { AttendanceView, TimetableView, ExaminationView, HRView, CommunicationView, InventoryView } from './AdvancedModules';
import { FacultyModule, type FacultySubView } from './FacultyModule';
import { AccountModule, type AccountSubView } from './AccountModule';

// Types
interface Student {
  id: string;
  admissionNo: string;
  name: string;
  class: string;
  section: string;
  gender: string;
  fatherName: string;
  phone: string;
  type: string;
  status: string; // 'Active', 'Inactive', 'Blocked', etc.
  blood: string;
  category: string;
  caste: string;
  house: string;
  aadhar: string;
  photoName?: string;
  photoUrl?: string;
  dob?: string;

  // Added Fields
  pen?: string;
  apaarId?: string;
  rollNo?: string;
  fatherOccupation?: string;
  fatherIncome?: string;
  fatherAadhar?: string;
  motherName?: string;
  motherOccupation?: string;
  motherIncome?: string;
  motherAadhar?: string;
  alternatePhone?: string;
  email?: string;
  dateOfAdmission?: string;
  shortAddress?: string;
  password?: string;
  religion?: string;
  busDetail?: string;
  location?: string;
  height?: string;
  weight?: string;
  staffWard?: string;
  sssmid?: string;
  parentsPhoto?: string;
  penFile?: string;
  tcFile?: string;
  marksheetFile?: string;
  dobCertificateFile?: string;
  studentAadharFile?: string;
  fatherAadharFile?: string;
  motherAadharFile?: string;
}

interface FeeRecord {
  id: number;
  class: string;
  section: string;
  type: string;
  amount: number;
  due: string;
  status: 'Paid' | 'Pending' | 'Overdue';
}

interface MonthlyFee {
  month: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
  dueDate: string;
}

interface StudentMonthlyFee {
  studentId: string;
  months: MonthlyFee[];
}

interface Teacher {
  id: string;
  name: string;
  subject: string;
  phone: string;
  status: 'Active' | 'On Leave';
  classTeacher: string;
}

interface Gatepass {
  id: string;
  studentName: string;
  class: string;
  reason: string;
  outTime: string;
  status: 'Approved' | 'Pending' | 'Rejected';
}

interface ActivityEvent {
  id: string;
  title: string;
  date: string;
  coordinator: string;
  status: 'Completed' | 'Planned' | 'In Progress';
}

interface SystemLog {
  id: number;
  time: string;
  message: string;
  type: 'success' | 'warning' | 'info';
}

interface Toast {
  id: number;
  title: string;
  message: string;
  type: 'success' | 'error';
}

interface FeePaymentHistoryRecord {
  id: string;
  studentId: string;
  studentName: string;
  class: string;
  month: string;
  amount: number;
  date: string;
  paymentMethod: string;
}
interface Book {
  id: string;
  title: string;
  isbn: string;
  author: string;
  quantity: number;
  available: number;
  category: string;
}

interface HostelRoom {
  id: string;
  block: string;
  roomNumber: string;
  capacity: number;
  occupied: number;
  students: string[];
}

interface TransportRoute {
  id: string;
  routeName: string;
  vehicleNumber: string;
  driverName: string;
  driverPhone: string;
  stops: string[];
  studentCount: number;
}


export default function App() {
  // Navigation
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [activeRole, setActiveRole] = useState<string>('Admin');

  // Login and multi-tenant onboarding states
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isSuperAdminUser, setIsSuperAdminUser] = useState<boolean>(false);
  const [emailInput, setEmailInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [currentSchoolId, setCurrentSchoolId] = useState<string>('9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb01');
  const [onboardedSchools, setOnboardedSchools] = useState<any[]>([
    { id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb01', name: 'Dummy School', code: 'DUMMY', affiliation: 'CBSE', address: '123 Academic Road, Delhi' }
  ]);
  const [schoolName, setSchoolName] = useState<string>('');
  const [schoolCode, setSchoolCode] = useState<string>('');
  const [schoolAff, setSchoolAff] = useState<string>('CBSE');
  const [schoolAddr, setSchoolAddr] = useState<string>('');


  // Role permissions mapping state
  const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>({
    'Admin': ['dashboard', 'students', 'admission', 'attendance', 'timetable', 'examination', 'reports', 'fees', 'hr', 'gatepass', 'activities', 'teacher', 'library', 'hostel', 'transport', 'communication', 'inventory', 'accounts', 'permissions', 'set-class', 'set-section', 'set-religion', 'set-caste', 'set-session', 'set-house', 'set-update'],
    'Principal': ['dashboard', 'students', 'admission', 'attendance', 'timetable', 'examination', 'reports', 'fees', 'hr', 'gatepass', 'activities', 'teacher', 'library', 'hostel', 'transport', 'communication', 'inventory'],
    'Vice Principal': ['dashboard', 'students', 'admission', 'attendance', 'timetable', 'examination', 'reports', 'fees', 'gatepass', 'activities', 'teacher', 'communication'],
    'Teacher': ['dashboard', 'students', 'attendance', 'timetable', 'examination', 'activities'],
    'Class Teacher': ['dashboard', 'students', 'attendance', 'timetable', 'examination', 'reports', 'gatepass', 'activities', 'communication'],
    'HR Manager': ['dashboard', 'hr', 'attendance', 'communication', 'reports'],
    'Accountant': ['dashboard', 'fees', 'students', 'reports', 'inventory', 'accounts'],
    'Librarian': ['dashboard', 'library', 'students'],
    'Hostel Warden': ['dashboard', 'hostel', 'students', 'gatepass'],
    'Transport Manager': ['dashboard', 'transport', 'students'],
    'Receptionist': ['dashboard', 'gatepass', 'communication', 'students', 'admission'],
    'Parent': ['dashboard']
  });

  // Library catalog mock data state
  const [books, setBooks] = useState<Book[]>([
    { id: "BK-101", title: "Introduction to Algorithms", isbn: "9780262033848", author: "Thomas H. Cormen", quantity: 5, available: 3, category: "Computer Science" },
    { id: "BK-102", title: "Concepts of Physics", isbn: "9788177091878", author: "H.C. Verma", quantity: 12, available: 9, category: "Physics" },
    { id: "BK-103", title: "Higher Engineering Mathematics", isbn: "9788174091956", author: "B.S. Grewal", quantity: 8, available: 8, category: "Mathematics" },
    { id: "BK-104", title: "A Brief History of Time", isbn: "9780553380163", author: "Stephen Hawking", quantity: 4, available: 1, category: "Cosmology" }
  ]);

  // Hostel Rooms mock data state
  const [hostelRooms, setHostelRooms] = useState<HostelRoom[]>([
    { id: "R-101", block: "Block A (Boys)", roomNumber: "101", capacity: 4, occupied: 3, students: ["Aarav Sharma", "Rohan Ghosh", "Arjun Paul"] },
    { id: "R-102", block: "Block A (Boys)", roomNumber: "102", capacity: 4, occupied: 0, students: [] },
    { id: "R-103", block: "Block B (Girls)", roomNumber: "201", capacity: 4, occupied: 2, students: ["Priya Das", "Sneha Mondal"] },
    { id: "R-104", block: "Block B (Girls)", roomNumber: "202", capacity: 4, occupied: 0, students: [] }
  ]);

  // Transport Routes mock data state
  const [transportRoutes, setTransportRoutes] = useState<TransportRoute[]>([
    { id: "RT-01", routeName: "South Delhi Outer Ring", vehicleNumber: "DL-1C-A-1082", driverName: "Rakesh Singh", driverPhone: "9810987654", stops: ["Saket", "Hauz Khas", "Nehru Place"], studentCount: 14 },
    { id: "RT-02", routeName: "West Delhi Dwarka Line", vehicleNumber: "DL-1C-B-9921", driverName: "Manjeet Kumar", driverPhone: "9871234509", stops: ["Janakpuri", "Dwarka Sec 6", "Uttam Nagar"], studentCount: 8 }
  ]);

  // Data Sets
  const [students, setStudents] = useState<Student[]>([
    { id: "ADM-2026-001", admissionNo: "ADM-2026-001", name: "Aarav Sharma", class: "Class 5", section: "Section A", gender: "Male", fatherName: "Rajesh Sharma", phone: "9875543210", type: "New", status: "Approved", blood: "O+", category: "General", caste: "Hinduism", house: "Red House", aadhar: "1234-5678-9012" },
    { id: "ADM-2026-002", admissionNo: "ADM-2026-002", name: "Priya Das", class: "Class 4", section: "Section B", gender: "Female", fatherName: "Sunil Das", phone: "9812345678", type: "New", status: "Approved", blood: "A+", category: "General", caste: "Hinduism", house: "Blue House", aadhar: "2345-6789-0123" },
    { id: "ADM-2026-003", admissionNo: "ADM-2026-003", name: "Rohan Ghosh", class: "Class 6", section: "Section A", gender: "Male", fatherName: "Amit Ghosh", phone: "9988776655", type: "Transfer", status: "Pending", blood: "B+", category: "OBC", caste: "Hinduism", house: "Green House", aadhar: "3456-7890-1234" },
    { id: "ADM-2026-004", admissionNo: "ADM-2026-004", name: "Sneha Mondal", class: "Class 3", section: "Section B", gender: "Female", fatherName: "Dipak Mondal", phone: "9123456789", type: "New", status: "Approved", blood: "AB+", category: "General", caste: "Hinduism", house: "Red House", aadhar: "4567-8901-2345" },
    { id: "ADM-2026-005", admissionNo: "ADM-2026-005", name: "Arjun Paul", class: "Class 5", section: "Section A", gender: "Male", fatherName: "Sanjay Paul", phone: "9654321098", type: "Transfer", status: "Rejected", blood: "O-", category: "SC", caste: "Hinduism", house: "Blue House", aadhar: "5678-9012-3456" },
    { id: "ADM-2026-006", admissionNo: "ADM-2026-006", name: "Ritka Sen", class: "Class 4", section: "Section B", gender: "Female", fatherName: "Bikash Sen", phone: "9778543210", type: "New", status: "Pending", blood: "O+", category: "ST", caste: "Hinduism", house: "Green House", aadhar: "6789-0123-4567" }
  ]);

  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([
    { id: 1, class: "Class 1", section: "Section A", type: "Tuition", amount: 2500, due: "2026-04-10", status: "Paid" },
    { id: 2, class: "Class 1", section: "Section A", type: "Transport", amount: 800, due: "2026-04-10", status: "Pending" },
    { id: 3, class: "Class 1", section: "Section B", type: "Tuition", amount: 2500, due: "2026-04-10", status: "Paid" },
    { id: 4, class: "Class 2", section: "Section A", type: "Tuition", amount: 3000, due: "2026-05-12", status: "Overdue" },
    { id: 5, class: "Class 2", section: "Section A", type: "Hostel", amount: 5000, due: "2026-05-15", status: "Paid" },
    { id: 6, class: "Class 2", section: "Section B", type: "Tuition", amount: 3000, due: "2026-06-01", status: "Pending" },
    { id: 7, class: "Class 3", section: "Section A", type: "Tuition", amount: 3500, due: "2026-06-18", status: "Paid" }
  ]);

  // Seeded Month-Wise Fee Structure for Students (April to September)
  const [studentMonthlyFees, setStudentMonthlyFees] = useState<StudentMonthlyFee[]>([
    {
      studentId: "ADM-2026-001", // Aarav
      months: [
        { month: "April", amount: 3000, status: "Paid", dueDate: "2026-04-10" },
        { month: "May", amount: 3000, status: "Paid", dueDate: "2026-05-10" },
        { month: "June", amount: 3000, status: "Pending", dueDate: "2026-06-10" },
        { month: "July", amount: 3000, status: "Pending", dueDate: "2026-07-10" },
        { month: "August", amount: 3000, status: "Pending", dueDate: "2026-08-10" },
        { month: "September", amount: 3000, status: "Pending", dueDate: "2026-09-10" }
      ]
    },
    {
      studentId: "ADM-2026-002", // Priya
      months: [
        { month: "April", amount: 3000, status: "Paid", dueDate: "2026-04-10" },
        { month: "May", amount: 3000, status: "Paid", dueDate: "2026-05-10" },
        { month: "June", amount: 3000, status: "Paid", dueDate: "2026-06-10" },
        { month: "July", amount: 3000, status: "Pending", dueDate: "2026-07-10" },
        { month: "August", amount: 3000, status: "Pending", dueDate: "2026-08-10" },
        { month: "September", amount: 3000, status: "Pending", dueDate: "2026-09-10" }
      ]
    },
    {
      studentId: "ADM-2026-003", // Rohan
      months: [
        { month: "April", amount: 3000, status: "Paid", dueDate: "2026-04-10" },
        { month: "May", amount: 3000, status: "Overdue", dueDate: "2026-05-10" },
        { month: "June", amount: 3000, status: "Pending", dueDate: "2026-06-10" },
        { month: "July", amount: 3000, status: "Pending", dueDate: "2026-07-10" },
        { month: "August", amount: 3000, status: "Pending", dueDate: "2026-08-10" },
        { month: "September", amount: 3000, status: "Pending", dueDate: "2026-09-10" }
      ]
    }
  ]);

  const [teachers] = useState<Teacher[]>([
    { id: "TCH-2026-01", name: "Sunita Verma", subject: "Mathematics", phone: "9876543210", status: "Active", classTeacher: "Class 5 - A" },
    { id: "TCH-2026-02", name: "Anand Mishra", subject: "Science & Physics", phone: "9898765432", status: "Active", classTeacher: "Class 6 - A" },
    { id: "TCH-2026-03", name: "Rajesh Kulkarni", subject: "Social Studies", phone: "9123450987", status: "On Leave", classTeacher: "Class 4 - B" },
    { id: "TCH-2026-04", name: "Gurpreet Kaur", subject: "English Literature", phone: "9009887766", status: "Active", classTeacher: "Class 3 - B" }
  ]);

  const [gatepasses, setGatepasses] = useState<Gatepass[]>([
    { id: "GP-1092", studentName: "Aarav Sharma", class: "Class 5", reason: "Medical Appointment", outTime: "11:30 AM", status: "Approved" },
    { id: "GP-1093", studentName: "Priya Das", class: "Class 4", reason: "Parent Request", outTime: "01:00 PM", status: "Pending" },
    { id: "GP-1094", studentName: "Sneha Mondal", class: "Class 3", reason: "Sickness / Fever", outTime: "10:15 AM", status: "Approved" }
  ]);

  const [activityEvents, setActivityEvents] = useState<ActivityEvent[]>([
    { id: "ACT-01", title: "Inter-School Sports Meet", date: "2026-07-05", coordinator: "Anand Mishra", status: "Planned" },
    { id: "ACT-02", title: "Science Exhibition 2026", date: "2026-06-15", coordinator: "Sunita Verma", status: "Completed" },
    { id: "ACT-03", title: "Annual Day Rehearsals", date: "2026-06-25", coordinator: "Gurpreet Kaur", status: "In Progress" }
  ]);

  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([
    { id: 1, time: "10:15 AM", message: "Admission approved for Sneha Mondal", type: "success" },
    { id: 2, time: "11:30 AM", message: "Tuition fee payment processed for Class 3", type: "info" },
    { id: 3, time: "01:45 PM", message: "Class 2 Tuition dues marked Overdue", type: "warning" },
    { id: 4, time: "02:10 PM", message: "Teacher Sunita Verma marked Present", type: "success" }
  ]);

  const [feePaymentHistory, setFeePaymentHistory] = useState<FeePaymentHistoryRecord[]>([
    { id: "TXN-2026-101", studentId: "ADM-2026-001", studentName: "Aarav Sharma", class: "Class 5", month: "April", amount: 3000, date: "2026-04-09", paymentMethod: "Cash" },
    { id: "TXN-2026-102", studentId: "ADM-2026-001", studentName: "Aarav Sharma", class: "Class 5", month: "May", amount: 3000, date: "2026-05-08", paymentMethod: "UPI" },
    { id: "TXN-2026-103", studentId: "ADM-2026-002", studentName: "Priya Das", class: "Class 4", month: "April", amount: 3000, date: "2026-04-10", paymentMethod: "Cash" },
    { id: "TXN-2026-104", studentId: "ADM-2026-002", studentName: "Priya Das", class: "Class 4", month: "May", amount: 3000, date: "2026-05-10", paymentMethod: "Card" },
    { id: "TXN-2026-105", studentId: "ADM-2026-002", studentName: "Priya Das", class: "Class 4", month: "June", amount: 3000, date: "2026-06-08", paymentMethod: "UPI" },
    { id: "TXN-2026-106", studentId: "ADM-2026-003", studentName: "Rohan Ghosh", class: "Class 6", month: "April", amount: 3000, date: "2026-04-10", paymentMethod: "Cash" },
  ]);

  // Fetch admissions from backend on load
  React.useEffect(() => {
    const loadData = async () => {
      try {
        const backendStudents = await api.getAdmissions();
        if (backendStudents && backendStudents.length > 0) {
          setStudents(backendStudents);
          addToast('Admissions Loaded', 'Successfully synchronized data from API.', 'success');
        }
      } catch (err) {
        console.warn('Failed to load from backend API, using local mock data:', err);
      }
    };
    loadData();
  }, []);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [recordsPerPage, setRecordsPerPage] = useState<number>(10);

  // Student Search Filters
  const [sSearch, setSSearch] = useState<string>('');
  const [sClass, setSClass] = useState<string>('');
  const [sStatus, setSStatus] = useState<string>('');
  const [sType, setSType] = useState<string>('');

  // Student Reports Filters
  const [rSearch, setRSearch] = useState<string>('');
  const [rClass, setRClass] = useState<string>('');
  const [rSection, setRSection] = useState<string>('');
  const [reportTab, setReportTab] = useState<string>('photos');

  // Fee Views Toggle (General Installments vs Student Month-wise)
  const [feeViewTab, setFeeViewTab] = useState<'installments' | 'monthly'>('installments');
  const [selectedFeeStudentId, setSelectedFeeStudentId] = useState<string>('ADM-2026-001');
  const [checkedMonths, setCheckedMonths] = useState<string[]>([]);

  // Fee Filters
  const [fSearch, setFSearch] = useState<string>('');
  const [fClass, setFClass] = useState<string>('');
  const [fStatus, setFStatus] = useState<string>('');

  // Gatepass Add Form State
  const [gpStudent, setGpStudent] = useState<string>('');
  const [gpClass, setGpClass] = useState<string>('Class 5');
  const [gpReason, setGpReason] = useState<string>('');
  const [gpTime, setGpTime] = useState<string>('12:00 PM');

  // Activity Add Form State
  const [actTitle, setActTitle] = useState<string>('');
  const [actDate, setActDate] = useState<string>('');
  const [actCoordinator, setActCoordinator] = useState<string>('');

  // Form State
  const [formName, setFormName] = useState<string>('');
  const [formDob, setFormDob] = useState<string>('2016-01-01');
  const [formGender, setFormGender] = useState<string>('Male');
  const [formBlood, setFormBlood] = useState<string>('O+');
  const [formAadhar, setFormAadhar] = useState<string>('');
  const [formRoll, setFormRoll] = useState<string>('');
  const [formCategory, setFormCategory] = useState<string>('General');
  const [formCaste, setFormCaste] = useState<string>('Hinduism');
  const [formHeight, setFormHeight] = useState<string>('');
  const [formWeight, setFormWeight] = useState<string>('');
  const [formClass, setFormClass] = useState<string>('');
  const [formSection, setFormSection] = useState<string>('');
  const [formFather, setFormFather] = useState<string>('');
  const [formPhone, setFormPhone] = useState<string>('');
  const [formHouse, setFormHouse] = useState<string>('');
  const [formType, setFormType] = useState<string>('New');

  // Additional Fields Form States
  const [formPen, setFormPen] = useState<string>('');
  const [formApaarId, setFormApaarId] = useState<string>('');
  const [formFatherOccupation, setFormFatherOccupation] = useState<string>('');
  const [formFatherIncome, setFormFatherIncome] = useState<string>('');
  const [formFatherAadhar, setFormFatherAadhar] = useState<string>('');
  const [formMotherName, setFormMotherName] = useState<string>('');
  const [formMotherOccupation, setFormMotherOccupation] = useState<string>('');
  const [formMotherIncome, setFormMotherIncome] = useState<string>('');
  const [formMotherAadhar, setFormMotherAadhar] = useState<string>('');
  const [formAlternatePhone, setFormAlternatePhone] = useState<string>('');
  const [formEmail, setFormEmail] = useState<string>('');
  const [formDateOfAdmission, setFormDateOfAdmission] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formShortAddress, setFormShortAddress] = useState<string>('');
  const [formPassword, setFormPassword] = useState<string>('');
  const [formReligion, setFormReligion] = useState<string>('Hinduism');
  const [formBusDetail, setFormBusDetail] = useState<string>('');
  const [formLocation, setFormLocation] = useState<string>('');
  const [formStaffWard, setFormStaffWard] = useState<string>('No');
  const [formSssmid, setFormSssmid] = useState<string>('');

  // Dummy State for Documents Filenames
  const [formStudentPhoto, setFormStudentPhoto] = useState<string>('');
  const [formParentsPhoto, setFormParentsPhoto] = useState<string>('');
  const [formPenFile, setFormPenFile] = useState<string>('');
  const [formTcFile, setFormTcFile] = useState<string>('');
  const [formMarksheetFile, setFormMarksheetFile] = useState<string>('');
  const [formDobCertificateFile, setFormDobCertificateFile] = useState<string>('');
  const [formStudentAadharFile, setFormStudentAadharFile] = useState<string>('');
  const [formFatherAadharFile, setFormFatherAadharFile] = useState<string>('');
  const [formMotherAadharFile, setFormMotherAadharFile] = useState<string>('');

  // Sidebar Subgroups Collapsible State
  const [studentMenuOpen, setStudentMenuOpen] = useState<boolean>(true);
  const [studentSubgroups, setStudentSubgroups] = useState<Record<string, boolean>>({
    admission: true,
    updateRecord: false,
    reports: false
  });
  const [facultySubView, setFacultySubView] = useState<FacultySubView>('view-staff');
  const [facultySubgroups, setFacultySubgroups] = useState<Record<string, boolean>>({
    staff: true,
    facultyReport: true,
    activityReport: true,
    idCard: true
  });
  const [accountSubView, setAccountSubView] = useState<AccountSubView>('manage-income');
  const [accountSubgroups, setAccountSubgroups] = useState<Record<string, boolean>>({
    income: true,
    expense: true,
    report: true,
    bank: true,
    setting: true
  });

  // Editing state
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  // Batch update variables
  const [batchAadhar, setBatchAadhar] = useState<Record<string, string>>({});
  const [batchRollNo, setBatchRollNo] = useState<Record<string, string>>({});
  const [batchDataSSSMID, setBatchDataSSSMID] = useState<Record<string, string>>({});
  const [batchDataPEN, setBatchDataPEN] = useState<Record<string, string>>({});
  const [batchDataAPAAR, setBatchDataAPAAR] = useState<Record<string, string>>({});
  const [batchDataHeight, setBatchDataHeight] = useState<Record<string, string>>({});
  const [batchDataWeight, setBatchDataWeight] = useState<Record<string, string>>({});

  // ID Card Modal State
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (title: string, message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Admission Submit
  const handleAdmissionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formClass || !formSection || !formFather || !formPhone) {
      addToast('Validation Failed', 'Please input all mandatory fields (*)', 'error');
      return;
    }

    const generatedId = `ADM-2026-00${students.length + 1}`;
    const newStudent: Student = {
      id: generatedId,
      admissionNo: generatedId,
      name: formName,
      class: formClass,
      section: formSection,
      gender: formGender,
      fatherName: formFather,
      phone: formPhone,
      type: formType,
      status: "Approved",
      blood: formBlood || "N/A",
      category: formCategory,
      caste: formCaste,
      house: formHouse || "None",
      aadhar: formAadhar || "N/A"
    };

    setStudents(prev => [...prev, newStudent]);
    
    // Sync with backend API
    const apiPayload = {
      first_name: formName.split(' ')[0],
      last_name: formName.split(' ')[1] || '',
      phone: formPhone,
      address: "123 School Lane",
      date_of_birth: formDob || "2016-01-01",
      gender: formGender,
      blood_group: formBlood || "O+",
      category: formCategory,
      caste: formCaste,
      religion: "Hinduism",
      aadhaar_no: formAadhar || "123456789012",
      father_name: formFather,
      father_occupation: "Business",
      mother_name: "Mother Name",
      admission_class: formClass,
      section: formSection,
      roll_number: formRoll || "1",
      house: formHouse || "Red",
      bus_route: "Route-1",
      medium: "English",
      date_of_admission: new Date().toISOString().split('T')[0],
      status: "Approved"
    };

    api.createAdmission(currentSchoolId, apiPayload).then(res => {
      console.log('Admission synced to backend:', res);
    }).catch(err => {
      console.warn('API Sync unavailable, relying on local sandbox state:', err);
    });
    
    // Auto insert tuition fee
    const newFee: FeeRecord = {
      id: Date.now(),
      class: formClass,
      section: formSection,
      type: "Tuition",
      amount: 3000,
      due: "2026-07-15",
      status: "Pending"
    };
    setFeeRecords(prev => [...prev, newFee]);

    // System log
    const newLog: SystemLog = {
      id: Date.now(),
      time: "Just Now",
      message: `Admission successfully registered: ${formName}`,
      type: "success"
    };
    setSystemLogs(prev => [newLog, ...prev]);

    addToast('Student Registered', `${formName} added. ID: ${generatedId}`, 'success');
    
    // Reset Form
    setFormName('');
    setFormRoll('');
    setFormAadhar('');
    setFormFather('');
    setFormPhone('');
    setFormHeight('');
    setFormWeight('');

    setActiveView('students');
  };

  // Gatepass Submit
  const handleGatepassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gpStudent || !gpReason) {
      addToast('Input Required', 'Please enter student name and reason.', 'error');
      return;
    }
    const newGp: Gatepass = {
      id: `GP-${Math.floor(1000 + Math.random() * 9000)}`,
      studentName: gpStudent,
      class: gpClass,
      reason: gpReason,
      outTime: gpTime,
      status: 'Pending'
    };
    setGatepasses(prev => [newGp, ...prev]);
    setGpStudent('');
    setGpReason('');
    addToast('Gatepass Filed', `Request logged for ${gpStudent}.`, 'success');
  };

  // Activity Submit
  const handleActivitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actTitle || !actCoordinator) {
      addToast('Input Required', 'Please enter event title and coordinator name.', 'error');
      return;
    }
    const newEvent: ActivityEvent = {
      id: `ACT-0${activityEvents.length + 1}`,
      title: actTitle,
      date: actDate || new Date().toISOString().split('T')[0],
      coordinator: actCoordinator,
      status: 'Planned'
    };
    setActivityEvents(prev => [...prev, newEvent]);
    setActTitle('');
    setActCoordinator('');
    addToast('Event Scheduled', `Planned event: ${actTitle}`, 'success');
  };

  // Photo uploading Mock
  const handlePhotoUpload = (studentId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setStudents(prev => prev.map(s => {
        if (s.id === studentId) {
          return { ...s, photoName: file.name, photoUrl: url };
        }
        return s;
      }));

      addToast('Photo Uploaded', `Assigned ${file.name} to registration record.`, 'success');
    }
  };

  // Process payment record dynamically
  const processPayment = (feeId: number) => {
    setFeeRecords(prev => prev.map(f => {
      if (f.id === feeId) {
        return { ...f, status: 'Paid' };
      }
      return f;
    }));
    const record = feeRecords.find(f => f.id === feeId);

    addToast('Payment Received', `Marked ${record?.type} installment for ${record?.class} as Paid.`, 'success');
  };

  // Process Multimonth payment checkout
  const processMultimonthPayment = () => {
    if (checkedMonths.length === 0) {
      addToast('Validation Failed', 'Select at least one month to pay.', 'error');
      return;
    }

    setStudentMonthlyFees(prev => prev.map(sf => {
      if (sf.studentId === selectedFeeStudentId) {
        const updatedMonths = sf.months.map(m => {
          if (checkedMonths.includes(m.month)) {
            return { ...m, status: 'Paid' as const };
          }
          return m;
        });
        return { ...sf, months: updatedMonths };
      }
      return sf;
    }));

    const totalAmount = checkedMonths.length * 3000;
    const selectedStudentObj = students.find(s => s.id === selectedFeeStudentId);

    // Create month-wise history records
    const newHistoryRecords: FeePaymentHistoryRecord[] = checkedMonths.map((m, idx) => ({
      id: `TXN-2026-${Math.floor(100 + Math.random() * 900)}${idx}`,
      studentId: selectedFeeStudentId,
      studentName: selectedStudentObj?.name || 'Unknown Student',
      class: selectedStudentObj?.class || 'N/A',
      month: m,
      amount: 3000,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'Cash'
    }));

    setFeePaymentHistory(prev => [...newHistoryRecords, ...prev]);

    // System log
    const newLog: SystemLog = {
      id: Date.now(),
      time: "Just Now",
      message: `Bulk payment ₹${totalAmount} collected for ${selectedStudentObj?.name} (${checkedMonths.join(', ')})`,
      type: "success"
    };
    setSystemLogs(prev => [newLog, ...prev]);

    addToast('Bulk Payment Collected', `Received ₹${totalAmount} for months: ${checkedMonths.join(', ')}`, 'success');
    setCheckedMonths([]);
  };

  // Delete Student
  const deleteStudent = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
    api.deleteAdmission(id).then(res => {
      console.log('Admission deleted on backend API:', res);
    }).catch(err => {
      console.warn('API Sync unavailable, relying on local sandbox state:', err);
    });
    addToast('Record Deleted', `Registration data for ID ${id} removed.`, 'error');
  };

  // Helpers
  const getStatusClass = (status: string) => {
    if (status === 'Approved' || status === 'Paid' || status === 'Completed') return 'badge-approved';
    if (status === 'Pending' || status === 'In Progress') return 'badge-pending';
    return 'badge-rejected';
  };

  // Filtered Students list
  const filteredStudents = students.filter(st => {
    const matchesQuery = st.name.toLowerCase().includes(sSearch.toLowerCase()) ||
      st.id.toLowerCase().includes(sSearch.toLowerCase()) ||
      st.phone.includes(sSearch) ||
      st.fatherName.toLowerCase().includes(sSearch.toLowerCase());
    const matchesClass = sClass === '' || st.class === sClass;
    const matchesStatus = sStatus === '' || st.status === sStatus;
    const matchesType = sType === '' || st.type === sType;
    return matchesQuery && matchesClass && matchesStatus && matchesType;
  });

  // Pagination markers
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredStudents.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredStudents.length / recordsPerPage);

  // Stats calculation
  const totalFeesPaidSum = feeRecords
    .filter(f => f.status === 'Paid')
    .reduce((sum, f) => sum + f.amount, 0);

  const monthlyFeesPaidSum = studentMonthlyFees
    .flatMap(sf => sf.months)
    .filter(m => m.status === 'Paid')
    .reduce((sum, m) => sum + m.amount, 0);

  const totalCollectedFormatted = ((totalFeesPaidSum + monthlyFeesPaidSum) / 1000).toFixed(1);

  // Month-wise checklist handler
  const handleMonthCheck = (month: string) => {
    if (checkedMonths.includes(month)) {
      setCheckedMonths(prev => prev.filter(m => m !== month));
    } else {
      setCheckedMonths(prev => [...prev, month]);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput === 'hardik@gmail.com' && passwordInput === 'admin123') {
      setIsLoggedIn(true);
      setIsSuperAdminUser(true);
      setActiveRole('Admin');
      addToast('SuperAdmin Authenticated', 'Access granted to master school onboarding panel.', 'success');
      return;
    }

    // Default seeded roles check
    const demoAccounts: Record<string, { role: any, schoolId: string }> = {
      'admin@school.com': { role: 'Admin', schoolId: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb01' },
      'principal@school.com': { role: 'Principal', schoolId: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb01' },
      'teacher@school.com': { role: 'Teacher', schoolId: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb01' },
      'classteacher@school.com': { role: 'Class Teacher', schoolId: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb01' },
      'hr@school.com': { role: 'HR Manager', schoolId: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb01' },
      'accountant@school.com': { role: 'Accountant', schoolId: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb01' },
      'library@school.com': { role: 'Librarian', schoolId: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb01' },
      'warden@school.com': { role: 'Hostel Warden', schoolId: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb01' },
      'transport@school.com': { role: 'Transport Manager', schoolId: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb01' },
      'receptionist@school.com': { role: 'Receptionist', schoolId: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb01' },
      'parent@school.com': { role: 'Parent', schoolId: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb01' }
    };

    const user = demoAccounts[emailInput.toLowerCase()];
    if (user && passwordInput === 'password123') {
      setIsLoggedIn(true);
      setIsSuperAdminUser(false);
      setActiveRole(user.role);
      setCurrentSchoolId(user.schoolId);
      addToast('Authenticated Success', `Logged in as ${user.role} of Dummy School.`, 'success');
    } else {
      addToast('Authentication Failed', 'Invalid username or password.', 'error');
    }
  };

  const handleSchoolOnboard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolName || !schoolCode) {
      addToast('Validation Failed', 'School name and code are required.', 'error');
      return;
    }

    const newSchoolObj = {
      id: `sch_${schoolCode.toLowerCase()}_${Math.floor(100 + Math.random() * 900)}`,
      name: schoolName,
      code: schoolCode,
      affiliation: schoolAff,
      address: schoolAddr || 'N/A'
    };

    setOnboardedSchools(prev => [...prev, newSchoolObj]);
    api.onboardSchool({
      name: schoolName,
      code: schoolCode,
      affiliation: schoolAff,
      address: schoolAddr
    }).then(res => {
      console.log('School onboarded successfully:', res);
      addToast('Onboarding Success', `${schoolName} has been initialized successfully.`, 'success');
    }).catch(err => {
      console.error('Failed to onboard school:', err);
    });

    addToast('School Added', `${schoolName} successfully registered!`, 'success');
    
    // Reset fields
    setSchoolName('');
    setSchoolCode('');
    setSchoolAddr('');
  };


  const hasPermission = (viewName: string) => {
    return rolePermissions[activeRole]?.includes(viewName);
  };

  if (!isLoggedIn) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', padding: '20px' }}>
        <div className="erp-card" style={{ width: '100%', maxWidth: '420px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)' }}>
          <div className="erp-card-header" style={{ textAlign: 'center', padding: '24px 20px', backgroundColor: '#1e293b', borderBottom: 'none' }}>
            <h1 style={{ color: '#ffffff', fontSize: '22px', fontWeight: 800 }}>Dettroin School ERP</h1>
            <span style={{ color: '#38bdf8', fontSize: '11px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>Central Login Portal</span>
          </div>
          <form className="erp-card-body" onSubmit={handleLoginSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label style={{ color: '#475569', fontWeight: 700 }}>Email Address</label>
              <input 
                type="email" 
                className="erp-input" 
                placeholder="e.g. hardik@gmail.com" 
                value={emailInput} 
                onChange={e => setEmailInput(e.target.value)} 
                required 
              />
            </div>
            <div className="form-group">
              <label style={{ color: '#475569', fontWeight: 700 }}>Password</label>
              <input 
                type="password" 
                className="erp-input" 
                placeholder="••••••••" 
                value={passwordInput} 
                onChange={e => setPasswordInput(e.target.value)} 
                required 
              />
            </div>
            <button type="submit" className="erp-btn btn-primary" style={{ width: '100%', height: '38px', fontSize: '13px', marginTop: '8px' }}>
              Sign In to Workspace
            </button>

            {/* Quick Demo Logins */}
            <div style={{ marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', textAlign: 'center' }}>
                Quick Demo Accounts (One-Click)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => { setEmailInput('hardik@gmail.com'); setPasswordInput('admin123'); }}
                  className="erp-btn btn-outline"
                  style={{ fontSize: '9px', height: '26px', padding: '0' }}
                >
                  SuperAdmin
                </button>
                <button
                  type="button"
                  onClick={() => { setEmailInput('admin@school.com'); setPasswordInput('password123'); }}
                  className="erp-btn btn-outline"
                  style={{ fontSize: '9px', height: '26px', padding: '0' }}
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => { setEmailInput('principal@school.com'); setPasswordInput('password123'); }}
                  className="erp-btn btn-outline"
                  style={{ fontSize: '9px', height: '26px', padding: '0' }}
                >
                  Principal
                </button>
                <button
                  type="button"
                  onClick={() => { setEmailInput('teacher@school.com'); setPasswordInput('password123'); }}
                  className="erp-btn btn-outline"
                  style={{ fontSize: '9px', height: '26px', padding: '0' }}
                >
                  Teacher
                </button>
                <button
                  type="button"
                  onClick={() => { setEmailInput('hr@school.com'); setPasswordInput('password123'); }}
                  className="erp-btn btn-outline"
                  style={{ fontSize: '9px', height: '26px', padding: '0' }}
                >
                  HR Manager
                </button>
                <button
                  type="button"
                  onClick={() => { setEmailInput('accountant@school.com'); setPasswordInput('password123'); }}
                  className="erp-btn btn-outline"
                  style={{ fontSize: '9px', height: '26px', padding: '0' }}
                >
                  Accountant
                </button>
                <button
                  type="button"
                  onClick={() => { setEmailInput('library@school.com'); setPasswordInput('password123'); }}
                  className="erp-btn btn-outline"
                  style={{ fontSize: '9px', height: '26px', padding: '0' }}
                >
                  Librarian
                </button>
                <button
                  type="button"
                  onClick={() => { setEmailInput('receptionist@school.com'); setPasswordInput('password123'); }}
                  className="erp-btn btn-outline"
                  style={{ fontSize: '9px', height: '26px', padding: '0' }}
                >
                  Receptionist
                </button>
                <button
                  type="button"
                  onClick={() => { setEmailInput('parent@school.com'); setPasswordInput('password123'); }}
                  className="erp-btn btn-outline"
                  style={{ fontSize: '9px', height: '26px', padding: '0' }}
                >
                  Parent
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (isSuperAdminUser) {
    return (
      <div className="app-container">
        {/* SUPERADMIN SIDEBAR */}
        <aside className="sidebar">
          <div className="sidebar-header" style={{ backgroundColor: '#1e293b' }}>
            <div>
              <h1 className="sidebar-title" style={{ color: '#ef4444' }}>Master Control</h1>
              <span className="sidebar-subtitle">SuperAdmin Console</span>
            </div>
          </div>
          <nav className="sidebar-menu" style={{ padding: '20px 8px' }}>
            <div className="menu-label">Tenant Operations</div>
            <div className="menu-item active">
              <ShieldAlert size={15} />
              <span>School Onboarding</span>
            </div>
            <div 
              className="menu-item" 
              onClick={() => { 
                setIsLoggedIn(false); 
                setIsSuperAdminUser(false); 
                setEmailInput(''); 
                setPasswordInput(''); 
              }}
              style={{ marginTop: 'auto', borderLeft: '3px solid #ef4444' }}
            >
              <X size={15} style={{ color: '#ef4444' }} />
              <span style={{ color: '#ef4444', fontWeight: 700 }}>Log Out</span>
            </div>
          </nav>
        </aside>

        {/* SUPERADMIN WORKSPACE */}
        <main className="main-content">
          <header className="header">
            <div className="header-title-section">
              <span className="institute-badge" style={{ backgroundColor: '#ef4444' }}>SYS</span>
              <strong>Global System Administrator Portal</strong>
            </div>
          </header>

          <div className="workspace" style={{ padding: '24px' }}>
            <div className="view-header">
              <div>
                <h2 className="view-title">School Franchise Onboarding</h2>
                <span className="view-subtitle">Register and initialize new academic campuses on the Dettroin ERP network</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '24px' }}>
              {/* ONBOARD FORM */}
              <div className="erp-card">
                <div className="erp-card-header">
                  <span className="erp-card-title">Register New Tenant Campus</span>
                </div>
                <form className="erp-card-body" onSubmit={handleSchoolOnboard} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label className="form-label">School Name *</label>
                    <input 
                      type="text" 
                      className="erp-input" 
                      placeholder="e.g. Delhi Public School" 
                      value={schoolName}
                      onChange={e => setSchoolName(e.target.value)}
                      required 
                    />
                  </div>
                  <div>
                    <label className="form-label">Unique School Code *</label>
                    <input 
                      type="text" 
                      className="erp-input" 
                      placeholder="e.g. DPS001" 
                      value={schoolCode}
                      onChange={e => setSchoolCode(e.target.value)}
                      required 
                    />
                  </div>
                  <div>
                    <label className="form-label">Affiliation Board</label>
                    <select 
                      className="erp-input" 
                      value={schoolAff}
                      onChange={e => setSchoolAff(e.target.value)}
                    >
                      <option value="CBSE">CBSE (Central Board)</option>
                      <option value="ICSE">ICSE (Indian Certificate)</option>
                      <option value="IB">IB (International Baccalaureate)</option>
                      <option value="State Board">State Board</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Campus Address</label>
                    <textarea 
                      className="erp-input" 
                      placeholder="Enter full physical address..." 
                      value={schoolAddr}
                      onChange={e => setSchoolAddr(e.target.value)}
                      style={{ height: '60px', resize: 'none' }}
                    />
                  </div>
                  <button type="submit" className="erp-btn btn-primary" style={{ marginTop: '8px' }}>
                    Onboard School
                  </button>
                </form>
              </div>

              {/* SCHOOLS LIST */}
              <div className="erp-card">
                <div className="erp-card-header">
                  <span className="erp-card-title">Registered Active Campuses ({onboardedSchools.length})</span>
                </div>
                <div className="table-container">
                  <table className="erp-table">
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>School Name</th>
                        <th>Affiliation</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {onboardedSchools.map(sch => (
                        <tr key={sch.id}>
                          <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{sch.code}</td>
                          <td>
                            <strong>{sch.name}</strong>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>{sch.address}</div>
                          </td>
                          <td>{sch.affiliation}</td>
                          <td>
                            <span className="erp-badge badge-approved">Active</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const renderPlaceholderView = (title: string, description: string, icon: React.ReactNode, features: string[]) => {
    return (
      <div>
        <div className="view-header">
          <div>
            <h2 className="view-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {icon} {title} Console
            </h2>
            <span className="view-subtitle">{description}</span>
          </div>
        </div>
        <div className="erp-card" style={{ marginTop: '20px' }}>
          <div className="erp-card-header">
            <span className="erp-card-title">Console Status & Actions</span>
          </div>
          <div className="erp-card-body">
            <p style={{ color: '#475569', marginBottom: '16px', fontSize: '13px' }}>
              This module has been initialized as part of the frontend prototype layout and is running in standalone sandbox mode.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '15px' }}>
              {features.map((feat, idx) => (
                <div key={idx} className="erp-card" style={{ padding: '15px', border: '1px solid #e2e8f0', background: '#fafaf9' }}>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '13px', color: '#1e3a8a' }}>{feat}</h4>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Ready for custom API integration</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="app-container">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div>
            <h1 className="sidebar-title">Dettroin ERP</h1>
            <span className="sidebar-subtitle">Management System</span>
          </div>
        </div>

        <nav className="sidebar-menu" style={{ overflowY: 'auto' }}>
          {selectedModule === null ? (
            <>
              <div className="menu-label">Main Console</div>
              <div
                className={`menu-item ${activeView === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveView('dashboard')}
              >
                <LayoutDashboard size={15} />
                <span>Dashboard</span>
              </div>

              <div
                className={`menu-item ${activeView === 'modules' ? 'active' : ''}`}
                onClick={() => setActiveView('modules')}
              >
                <Package size={15} />
                <span>Modules</span>
              </div>
            </>
          ) : (
            <>
              <div 
                className="back-to-modules-btn"
                onClick={() => {
                  setSelectedModule(null);
                  setActiveView('modules');
                }}
              >
                <ChevronLeft size={14} />
                <span>Back to Modules</span>
              </div>

              {selectedModule === 'student' && (
                <>
                  <div className="menu-label">Student Management</div>
                  <div>
                    {/* 1.1 Admission Group */}
                    <div 
                      className="nested-submenu-header"
                      onClick={(e) => {
                        e.stopPropagation();
                        setStudentSubgroups(prev => ({ ...prev, admission: !prev.admission }));
                      }}
                      style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: '8px' }}
                    >
                      <span>Admission</span>
                      {studentSubgroups.admission ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                    </div>
                    {studentSubgroups.admission && (
                      <div style={{ paddingLeft: '8px' }}>
                        <div 
                          className={`nested-submenu-item ${activeView === 'student-admission-make' ? 'active' : ''}`}
                          onClick={() => setActiveView('student-admission-make')}
                        >
                          <UserPlus size={11} /> Make Admission
                        </div>
                        <div 
                          className={`nested-submenu-item ${activeView === 'student-admission-view' ? 'active' : ''}`}
                          onClick={() => setActiveView('student-admission-view')}
                        >
                          <Users size={11} /> View Admission
                        </div>
                      </div>
                    )}

                    {/* 1.2 Update Record Group */}
                    <div 
                      className="nested-submenu-header"
                      onClick={(e) => {
                        e.stopPropagation();
                        setStudentSubgroups(prev => ({ ...prev, updateRecord: !prev.updateRecord }));
                      }}
                      style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: '8px', marginTop: '6px' }}
                    >
                      <span>Update Record</span>
                      {studentSubgroups.updateRecord ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                    </div>
                    {studentSubgroups.updateRecord && (
                      <div style={{ paddingLeft: '8px' }}>
                        <div 
                          className={`nested-submenu-item ${activeView === 'student-update-record' ? 'active' : ''}`}
                          onClick={() => setActiveView('student-update-record')}
                        >
                          <ClipboardList size={11} /> Student Record
                        </div>
                        <div 
                          className={`nested-submenu-item ${activeView === 'student-update-roll' ? 'active' : ''}`}
                          onClick={() => setActiveView('student-update-roll')}
                        >
                          <Clock size={11} /> Create Roll Number
                        </div>
                        <div 
                          className={`nested-submenu-item ${activeView === 'student-update-photo' ? 'active' : ''}`}
                          onClick={() => setActiveView('student-update-photo')}
                        >
                          <Users size={11} /> Update Photo
                        </div>
                        <div 
                          className={`nested-submenu-item ${activeView === 'student-update-blocked' ? 'active' : ''}`}
                          onClick={() => setActiveView('student-update-blocked')}
                        >
                          <ShieldAlert size={11} /> Blocked Students
                        </div>
                        <div 
                          className={`nested-submenu-item ${activeView === 'student-update-inactive' ? 'active' : ''}`}
                          onClick={() => setActiveView('student-update-inactive')}
                        >
                          <AlertTriangle size={11} /> Inactive Students
                        </div>
                        <div 
                          className={`nested-submenu-item ${activeView === 'student-update-aadhar' ? 'active' : ''}`}
                          onClick={() => setActiveView('student-update-aadhar')}
                        >
                          <CreditCard size={11} /> Update Aadhar
                        </div>
                        <div 
                          className={`nested-submenu-item ${activeView === 'student-update-data' ? 'active' : ''}`}
                          onClick={() => setActiveView('student-update-data')}
                        >
                          <FileSpreadsheet size={11} /> Update Data
                        </div>
                      </div>
                    )}

                    {/* 1.3 Identity Card */}
                    <div 
                      className={`nested-submenu-item ${activeView === 'student-idcard' ? 'active' : ''}`}
                      onClick={() => setActiveView('student-idcard')}
                      style={{ marginTop: '6px', fontWeight: 600, color: activeView === 'student-idcard' ? '#38bdf8' : '#cbd5e1' }}
                    >
                      <Printer size={11} /> Identity Card
                    </div>

                    {/* 1.4 Student Report Group */}
                    <div 
                      className="nested-submenu-header"
                      onClick={(e) => {
                        e.stopPropagation();
                        setStudentSubgroups(prev => ({ ...prev, reports: !prev.reports }));
                      }}
                      style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: '8px', marginTop: '6px' }}
                    >
                      <span>Student Report</span>
                      {studentSubgroups.reports ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                    </div>
                    {studentSubgroups.reports && (
                      <div style={{ paddingLeft: '8px' }}>
                        <div className={`nested-submenu-item ${activeView === 'student-report-details' ? 'active' : ''}`} onClick={() => setActiveView('student-report-details')}>Student Details</div>
                        <div className={`nested-submenu-item ${activeView === 'student-report-strength' ? 'active' : ''}`} onClick={() => setActiveView('student-report-strength')}>Student Strength</div>
                        <div className={`nested-submenu-item ${activeView === 'student-report-new' ? 'active' : ''}`} onClick={() => setActiveView('student-report-new')}>New Admission</div>
                        <div className={`nested-submenu-item ${activeView === 'student-report-enrolled-strength' ? 'active' : ''}`} onClick={() => setActiveView('student-report-enrolled-strength')}>Enrolled Strength</div>
                        <div className={`nested-submenu-item ${activeView === 'student-report-enrolled-students' ? 'active' : ''}`} onClick={() => setActiveView('student-report-enrolled-students')}>Enrolled Students</div>
                        <div className={`nested-submenu-item ${activeView === 'student-report-inactive' ? 'active' : ''}`} onClick={() => setActiveView('student-report-inactive')}>Inactive Report</div>
                        <div className={`nested-submenu-item ${activeView === 'student-report-bpl' ? 'active' : ''}`} onClick={() => setActiveView('student-report-bpl')}>BPL Students</div>
                        <div className={`nested-submenu-item ${activeView === 'student-report-sibling' ? 'active' : ''}`} onClick={() => setActiveView('student-report-sibling')}>Sibling Report</div>
                        <div className={`nested-submenu-item ${activeView === 'student-report-category' ? 'active' : ''}`} onClick={() => setActiveView('student-report-category')}>Category Report</div>
                        <div className={`nested-submenu-item ${activeView === 'student-report-staffward' ? 'active' : ''}`} onClick={() => setActiveView('student-report-staffward')}>Staff Ward</div>
                        <div className={`nested-submenu-item ${activeView === 'student-report-classwise' ? 'active' : ''}`} onClick={() => setActiveView('student-report-classwise')}>Class-wise Students</div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {selectedModule === 'faculty' && (
                <>
                  <div className="menu-label">Faculty Module</div>

                  {/* 1. Staff Subgroup */}
                  <div 
                    className="nested-submenu-header"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFacultySubgroups(prev => ({ ...prev, staff: !prev.staff }));
                    }}
                    style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: '8px', color: '#f59e0b', fontWeight: 600 }}
                  >
                    <span>Staff</span>
                    {facultySubgroups.staff ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                  </div>
                  {facultySubgroups.staff && (
                    <div style={{ paddingLeft: '8px' }}>
                      <div 
                        className={`nested-submenu-item ${activeView === 'faculty' && facultySubView === 'view-staff' ? 'active' : ''}`}
                        onClick={() => { setActiveView('faculty'); setFacultySubView('view-staff'); }}
                      >
                        View Staff
                      </div>
                      <div 
                        className={`nested-submenu-item ${activeView === 'faculty' && facultySubView === 'add-staff' ? 'active' : ''}`}
                        onClick={() => { setActiveView('faculty'); setFacultySubView('add-staff'); }}
                      >
                        Add Staff
                      </div>
                      <div 
                        className={`nested-submenu-item ${activeView === 'faculty' && facultySubView === 'department' ? 'active' : ''}`}
                        onClick={() => { setActiveView('faculty'); setFacultySubView('department'); }}
                      >
                        Department
                      </div>
                    </div>
                  )}

                  {/* 2. Faculty Report Subgroup */}
                  <div 
                    className="nested-submenu-header"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFacultySubgroups(prev => ({ ...prev, facultyReport: !prev.facultyReport }));
                    }}
                    style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: '8px', marginTop: '6px', color: '#10b981', fontWeight: 600 }}
                  >
                    <span>Faculty Report</span>
                    {facultySubgroups.facultyReport ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                  </div>
                  {facultySubgroups.facultyReport && (
                    <div style={{ paddingLeft: '8px' }}>
                      <div 
                        className={`nested-submenu-item ${activeView === 'faculty' && facultySubView === 'report-details' ? 'active' : ''}`}
                        onClick={() => { setActiveView('faculty'); setFacultySubView('report-details'); }}
                      >
                        Staff Details
                      </div>
                      <div 
                        className={`nested-submenu-item ${activeView === 'faculty' && facultySubView === 'report-inactive' ? 'active' : ''}`}
                        onClick={() => { setActiveView('faculty'); setFacultySubView('report-inactive'); }}
                      >
                        Inactive Report
                      </div>
                    </div>
                  )}

                  {/* 3. Activity Report Subgroup */}
                  <div 
                    className="nested-submenu-header"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFacultySubgroups(prev => ({ ...prev, activityReport: !prev.activityReport }));
                    }}
                    style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: '8px', marginTop: '6px', color: '#a855f7', fontWeight: 600 }}
                  >
                    <span>Activity Report</span>
                    {facultySubgroups.activityReport ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                  </div>
                  {facultySubgroups.activityReport && (
                    <div style={{ paddingLeft: '8px' }}>
                      <div 
                        className={`nested-submenu-item ${activeView === 'faculty' && facultySubView === 'activity-teacher' ? 'active' : ''}`}
                        onClick={() => { setActiveView('faculty'); setFacultySubView('activity-teacher'); }}
                      >
                        Teacher Wise
                      </div>
                      <div 
                        className={`nested-submenu-item ${activeView === 'faculty' && facultySubView === 'activity-class' ? 'active' : ''}`}
                        onClick={() => { setActiveView('faculty'); setFacultySubView('activity-class'); }}
                      >
                        Class Wise
                      </div>
                    </div>
                  )}

                  {/* 4. Staff ID Card Subgroup */}
                  <div 
                    className="nested-submenu-header"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFacultySubgroups(prev => ({ ...prev, idCard: !prev.idCard }));
                    }}
                    style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: '8px', marginTop: '6px', color: '#ef4444', fontWeight: 600 }}
                  >
                    <span>Staff ID Card</span>
                    {facultySubgroups.idCard ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                  </div>
                  {facultySubgroups.idCard && (
                    <div style={{ paddingLeft: '8px' }}>
                      <div 
                        className={`nested-submenu-item ${activeView === 'faculty' && facultySubView === 'idcard-print' ? 'active' : ''}`}
                        onClick={() => { setActiveView('faculty'); setFacultySubView('idcard-print'); }}
                      >
                        ID Card Print
                      </div>
                      <div 
                        className={`nested-submenu-item ${activeView === 'faculty' && facultySubView === 'idcard-sample' ? 'active' : ''}`}
                        onClick={() => { setActiveView('faculty'); setFacultySubView('idcard-sample'); }}
                      >
                        ID Card Sample
                      </div>
                    </div>
                  )}
                </>
              )}

              {selectedModule === 'account' && (
                <>
                  <div className="menu-label">Account Module</div>

                  {/* 1. Manage Income */}
                  <div className={`menu-item ${activeView === 'account' && accountSubView === 'manage-income' ? 'active' : ''}`} onClick={() => { setActiveView('account'); setAccountSubView('manage-income'); }}>
                    <DollarSign size={15} />
                    <span>Manage Income</span>
                  </div>

                  {/* 2. Manage Expense */}
                  <div className={`menu-item ${activeView === 'account' && accountSubView === 'manage-expense' ? 'active' : ''}`} onClick={() => { setActiveView('account'); setAccountSubView('manage-expense'); }}>
                    <TrendingDown size={15} />
                    <span>Manage Expense</span>
                  </div>

                  {/* 3. Account Report (Collapsible) */}
                  <div>
                    <div 
                      className="nested-subgroup-header" 
                      onClick={() => setAccountSubgroups(prev => ({ ...prev, report: !prev.report }))}
                      style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', color: '#64748b', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FileText size={13} color="#8b4570" /> Account Report
                      </span>
                      <span>{accountSubgroups.report ? '▾' : '▸'}</span>
                    </div>

                    {accountSubgroups.report && (
                      <div className="nested-subgroup-content" style={{ paddingLeft: '12px' }}>
                        <div className={`nested-submenu-item ${activeView === 'account' && accountSubView === 'report-expense-date' ? 'active' : ''}`} onClick={() => { setActiveView('account'); setAccountSubView('report-expense-date'); }}>Expense Date wise</div>
                        <div className={`nested-submenu-item ${activeView === 'account' && accountSubView === 'report-expense-head' ? 'active' : ''}`} onClick={() => { setActiveView('account'); setAccountSubView('report-expense-head'); }}>Expense Head wise</div>
                        <div className={`nested-submenu-item ${activeView === 'account' && accountSubView === 'report-extra-income' ? 'active' : ''}`} onClick={() => { setActiveView('account'); setAccountSubView('report-extra-income'); }}>Extra Income Report</div>
                        <div className={`nested-submenu-item ${activeView === 'account' && accountSubView === 'report-balance-sheet' ? 'active' : ''}`} onClick={() => { setActiveView('account'); setAccountSubView('report-balance-sheet'); }}>Balance Sheet</div>
                        <div className={`nested-submenu-item ${activeView === 'account' && accountSubView === 'report-outstanding' ? 'active' : ''}`} onClick={() => { setActiveView('account'); setAccountSubView('report-outstanding'); }}>Outstanding Report</div>
                        <div className={`nested-submenu-item ${activeView === 'account' && accountSubView === 'report-collection' ? 'active' : ''}`} onClick={() => { setActiveView('account'); setAccountSubView('report-collection'); }}>Collection Sheet</div>
                        <div className={`nested-submenu-item ${activeView === 'account' && accountSubView === 'report-dues-sheet' ? 'active' : ''}`} onClick={() => { setActiveView('account'); setAccountSubView('report-dues-sheet'); }}>Dues Sheet</div>
                        <div className={`nested-submenu-item ${activeView === 'account' && accountSubView === 'report-dues-head' ? 'active' : ''}`} onClick={() => { setActiveView('account'); setAccountSubView('report-dues-head'); }}>Dues Head wise</div>
                        <div className={`nested-submenu-item ${activeView === 'account' && accountSubView === 'report-inventory-dcr' ? 'active' : ''}`} onClick={() => { setActiveView('account'); setAccountSubView('report-inventory-dcr'); }}>Inventory DCR</div>
                        <div className={`nested-submenu-item ${activeView === 'account' && accountSubView === 'report-demand-bill' ? 'active' : ''}`} onClick={() => { setActiveView('account'); setAccountSubView('report-demand-bill'); }}>Demand Bill</div>
                        <div className={`nested-submenu-item ${activeView === 'account' && accountSubView === 'report-discount' ? 'active' : ''}`} onClick={() => { setActiveView('account'); setAccountSubView('report-discount'); }}>Discount report</div>
                        <div className={`nested-submenu-item ${activeView === 'account' && accountSubView === 'report-cancel' ? 'active' : ''}`} onClick={() => { setActiveView('account'); setAccountSubView('report-cancel'); }}>Cancel Record</div>
                      </div>
                    )}
                  </div>

                  {/* 4. Manage Bank (Collapsible) */}
                  <div>
                    <div 
                      className="nested-subgroup-header" 
                      onClick={() => setAccountSubgroups(prev => ({ ...prev, bank: !prev.bank }))}
                      style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', color: '#64748b', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Building size={13} color="#dc2626" /> Manage Bank
                      </span>
                      <span>{accountSubgroups.bank ? '▾' : '▸'}</span>
                    </div>

                    {accountSubgroups.bank && (
                      <div className="nested-subgroup-content" style={{ paddingLeft: '12px' }}>
                        <div className={`nested-submenu-item ${activeView === 'account' && accountSubView === 'bank-deposit' ? 'active' : ''}`} onClick={() => { setActiveView('account'); setAccountSubView('bank-deposit'); }}>Deposit</div>
                        <div className={`nested-submenu-item ${activeView === 'account' && accountSubView === 'bank-withdraw' ? 'active' : ''}`} onClick={() => { setActiveView('account'); setAccountSubView('bank-withdraw'); }}>Withdraw</div>
                        <div className={`nested-submenu-item ${activeView === 'account' && accountSubView === 'bank-report-withdraw' ? 'active' : ''}`} onClick={() => { setActiveView('account'); setAccountSubView('bank-report-withdraw'); }}>Withdraw Report</div>
                        <div className={`nested-submenu-item ${activeView === 'account' && accountSubView === 'bank-report-deposit' ? 'active' : ''}`} onClick={() => { setActiveView('account'); setAccountSubView('bank-report-deposit'); }}>Deposit Report</div>
                        <div className={`nested-submenu-item ${activeView === 'account' && accountSubView === 'bank-ledger' ? 'active' : ''}`} onClick={() => { setActiveView('account'); setAccountSubView('bank-ledger'); }}>Bank Ledger</div>
                      </div>
                    )}
                  </div>

                  {/* 5. Account Setting (Collapsible) */}
                  <div>
                    <div 
                      className="nested-subgroup-header" 
                      onClick={() => setAccountSubgroups(prev => ({ ...prev, setting: !prev.setting }))}
                      style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', color: '#64748b', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Settings size={13} color="#0284c7" /> Account Setting
                      </span>
                      <span>{accountSubgroups.setting ? '▾' : '▸'}</span>
                    </div>

                    {accountSubgroups.setting && (
                      <div className="nested-subgroup-content" style={{ paddingLeft: '12px' }}>
                        <div className={`nested-submenu-item ${activeView === 'account' && accountSubView === 'setting-income-mode' ? 'active' : ''}`} onClick={() => { setActiveView('account'); setAccountSubView('setting-income-mode'); }}>Income Mode</div>
                        <div className={`nested-submenu-item ${activeView === 'account' && accountSubView === 'setting-expense-mode' ? 'active' : ''}`} onClick={() => { setActiveView('account'); setAccountSubView('setting-expense-mode'); }}>Expense Mode</div>
                        <div className={`nested-submenu-item ${activeView === 'account' && accountSubView === 'setting-add-bank' ? 'active' : ''}`} onClick={() => { setActiveView('account'); setAccountSubView('setting-add-bank'); }}>Add Bank</div>
                        <div className={`nested-submenu-item ${activeView === 'account' && accountSubView === 'setting-fine-rule' ? 'active' : ''}`} onClick={() => { setActiveView('account'); setAccountSubView('setting-fine-rule'); }}>Fine Setting</div>
                        <div className={`nested-submenu-item ${activeView === 'account' && accountSubView === 'setting-apply-fine' ? 'active' : ''}`} onClick={() => { setActiveView('account'); setAccountSubView('setting-apply-fine'); }}>Apply Fine</div>
                      </div>
                    )}
                  </div>

                </>
              )}

              {selectedModule === 'timetable' && (
                <>
                  <div className="menu-label">Time Table Module</div>
                  <div className={`menu-item active`} onClick={() => setActiveView('timetable')}>
                    <Clock size={15} />
                    <span>Weekly Timetable</span>
                  </div>
                </>
              )}

              {selectedModule === 'attendance' && (
                <>
                  <div className="menu-label">Attendance Module</div>
                  <div className={`menu-item active`} onClick={() => setActiveView('attendance')}>
                    <CalendarCheck size={15} />
                    <span>Mark Attendance</span>
                  </div>
                </>
              )}

              {selectedModule === 'transport' && (
                <>
                  <div className="menu-label">Transport Module</div>
                  <div className={`menu-item active`} onClick={() => setActiveView('transport')}>
                    <Bus size={15} />
                    <span>Transport Routes</span>
                  </div>
                </>
              )}

              {selectedModule === 'inventory' && (
                <>
                  <div className="menu-label">Inventory Module</div>
                  <div className={`menu-item active`} onClick={() => setActiveView('inventory')}>
                    <Package size={15} />
                    <span>Inventory Console</span>
                  </div>
                </>
              )}

              {selectedModule === 'aiprogram' && (
                <>
                  <div className="menu-label">AI Program</div>
                  <div className={`menu-item active`} onClick={() => setActiveView('aiprogram')}>
                    <Trophy size={15} />
                    <span>Performance Analytics</span>
                  </div>
                </>
              )}

              {selectedModule === 'examination' && (
                <>
                  <div className="menu-label">Examination Module</div>
                  <div className={`menu-item active`} onClick={() => setActiveView('examination')}>
                    <FileText size={15} />
                    <span>Exam Grades</span>
                  </div>
                </>
              )}

              {selectedModule === 'reception' && (
                <>
                  <div className="menu-label">Reception Module</div>
                  <div className={`menu-item active`} onClick={() => setActiveView('reception')}>
                    <DoorOpen size={15} />
                    <span>Visitor Log</span>
                  </div>
                </>
              )}

              {selectedModule === 'hr' && (
                <>
                  <div className="menu-label">HR Module</div>
                  <div className={`menu-item active`} onClick={() => setActiveView('hr')}>
                    <ClipboardList size={15} />
                    <span>Staff Registry</span>
                  </div>
                </>
              )}

              {selectedModule === 'certificate' && (
                <>
                  <div className="menu-label">Certificate Module</div>
                  <div className={`menu-item active`} onClick={() => setActiveView('certificate')}>
                    <Award size={15} />
                    <span>Certificates list</span>
                  </div>
                </>
              )}

              {selectedModule === 'academic' && (
                <>
                  <div className="menu-label">Academic Module</div>
                  <div className={`menu-item active`} onClick={() => setActiveView('academic')}>
                    <GraduationCap size={15} />
                    <span>Academic Config</span>
                  </div>
                </>
              )}

              {selectedModule === 'frontoffice' && (
                <>
                  <div className="menu-label">Front Office</div>
                  <div className={`menu-item active`} onClick={() => setActiveView('frontoffice')}>
                    <Contact size={15} />
                    <span>Office Enquiries</span>
                  </div>
                </>
              )}

              {selectedModule === 'sendsms' && (
                <>
                  <div className="menu-label">Send SMS Module</div>
                  <div className={`menu-item active`} onClick={() => setActiveView('sendsms')}>
                    <MessageSquare size={15} />
                    <span>SMS Logs</span>
                  </div>
                </>
              )}

              {selectedModule === 'hostel' && (
                <>
                  <div className="menu-label">Hostel Module</div>
                  <div className={`menu-item active`} onClick={() => setActiveView('hostel')}>
                    <Building size={15} />
                    <span>Hostel Console</span>
                  </div>
                </>
              )}

              {selectedModule === 'econtent' && (
                <>
                  <div className="menu-label">Econtent Module</div>
                  <div className={`menu-item active`} onClick={() => setActiveView('econtent')}>
                    <BookOpen size={15} />
                    <span>Lecture videos</span>
                  </div>
                </>
              )}

              {selectedModule === 'payroll' && (
                <>
                  <div className="menu-label">Payroll Module</div>
                  <div className={`menu-item active`} onClick={() => setActiveView('payroll')}>
                    <DollarSign size={15} />
                    <span>Payroll Accounts</span>
                  </div>
                </>
              )}

              {selectedModule === 'library' && (
                <>
                  <div className="menu-label">Library Module</div>
                  <div className={`menu-item active`} onClick={() => setActiveView('library')}>
                    <BookOpen size={15} />
                    <span>Book Catalog</span>
                  </div>
                </>
              )}

              {selectedModule === 'master' && (
                <>
                  <div className="menu-label">Master Module</div>
                  <div className={`menu-item active`} onClick={() => setActiveView('master')}>
                    <Settings size={15} />
                    <span>Master Permissions</span>
                  </div>
                </>
              )}
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="avatar-square">{activeRole.substring(0, 1)}</div>
          <div className="user-details" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <div className="user-name">{activeRole}</div>
              <button 
                type="button"
                onClick={() => {
                  setIsLoggedIn(false);
                  setIsSuperAdminUser(false);
                  setEmailInput('');
                  setPasswordInput('');
                }}
                style={{ background: 'none', border: 'none', color: '#f87171', fontSize: '10px', cursor: 'pointer', fontWeight: 700 }}
              >
                Logout
              </button>
            </div>
            <div style={{ color: '#94a3b8', fontSize: '10px' }}>Active Session: 2026-27</div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="main-content">
        <header className="header">
          <div className="header-title-section">
            <span className="institute-badge">GRD</span>
            <strong style={{ fontSize: '13px' }}>Dettroin School Workspace</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
              <span style={{ fontWeight: 700, color: '#475569' }}>Simulate Role:</span>
              <select
                value={activeRole}
                onChange={(e) => {
                  const role = e.target.value as any;
                  setActiveRole(role);
                  setActiveView('dashboard');
                }}
                className="erp-input"
                style={{ padding: '2px 8px', fontSize: '11px', height: '26px', width: '160px', backgroundColor: '#f0fdf4', borderColor: '#86efac', fontWeight: 600 }}
              >
                <option value="Admin">Administrator</option>
                <option value="Principal">Principal</option>
                <option value="Vice Principal">Vice Principal</option>
                <option value="Teacher">Teacher</option>
                <option value="Class Teacher">Class Teacher</option>
                <option value="HR Manager">HR Manager</option>
                <option value="Accountant">Accountant</option>
                <option value="Librarian">Librarian</option>
                <option value="Hostel Warden">Hostel Warden</option>
                <option value="Transport Manager">Transport Manager</option>
                <option value="Receptionist">Receptionist</option>
                <option value="Parent">Parent / Student</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#0f766e' }}>
              <ShieldCheck size={14} />
              <span>Secure Session</span>
            </div>
            <div className="header-user-badge">
              <Calendar size={14} style={{ color: '#0f766e' }} />
              <span>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>
        </header>

        {/* Dynamic View Panel */}
        <div className="workspace">

          {/* VIEW: ALL MODULES GRID PAGE */}
          {activeView === 'modules' && (
            <div className="modules-grid-container">
              <div className="modules-grid-header">
                <h2 className="modules-grid-title">Institutional Modules</h2>
                <p style={{ margin: '8px 0 0 0', opacity: 0.9, fontSize: '13.5px' }}>
                  Select an administrative module from the console below to manage records and settings.
                </p>
              </div>

              <div className="modules-grid">
                {/* 1. STUDENT */}
                <div 
                  className="module-card" 
                  onClick={() => {
                    setSelectedModule('student');
                    setActiveView('student-admission-view');
                  }}
                >
                  <div className="module-card-icon"><Users size={20} /></div>
                  <h3 className="module-card-title">Student</h3>
                </div>

                {/* 2. TRANSPORT */}
                <div 
                  className="module-card" 
                  onClick={() => {
                    setSelectedModule('transport');
                    setActiveView('transport');
                  }}
                >
                  <div className="module-card-icon"><Bus size={20} /></div>
                  <h3 className="module-card-title">Transport</h3>
                </div>

                {/* 3. INVENTORY */}
                <div 
                  className="module-card" 
                  onClick={() => {
                    setSelectedModule('inventory');
                    setActiveView('inventory');
                  }}
                >
                  <div className="module-card-icon"><Package size={20} /></div>
                  <h3 className="module-card-title">Inventory</h3>
                </div>

                {/* 4. AI PROGRAM */}
                <div 
                  className="module-card" 
                  onClick={() => {
                    setSelectedModule('aiprogram');
                    setActiveView('aiprogram');
                  }}
                >
                  <div className="module-card-icon"><Trophy size={20} /></div>
                  <h3 className="module-card-title">AI Program</h3>
                </div>

                {/* 5. FACULTY */}
                <div 
                  className="module-card" 
                  onClick={() => {
                    setSelectedModule('faculty');
                    setActiveView('faculty');
                  }}
                >
                  <div className="module-card-icon"><ClipboardList size={20} /></div>
                  <h3 className="module-card-title">Faculty</h3>
                </div>

                {/* 6. EXAMINATION */}
                <div 
                  className="module-card" 
                  onClick={() => {
                    setSelectedModule('examination');
                    setActiveView('examination');
                  }}
                >
                  <div className="module-card-icon"><FileText size={20} /></div>
                  <h3 className="module-card-title">Examination</h3>
                </div>

                {/* 7. RECEPTION */}
                <div 
                  className="module-card" 
                  onClick={() => {
                    setSelectedModule('reception');
                    setActiveView('reception');
                  }}
                >
                  <div className="module-card-icon"><DoorOpen size={20} /></div>
                  <h3 className="module-card-title">Reception</h3>
                </div>

                {/* 8. HR */}
                <div 
                  className="module-card" 
                  onClick={() => {
                    setSelectedModule('hr');
                    setActiveView('hr');
                  }}
                >
                  <div className="module-card-icon"><ClipboardList size={20} /></div>
                  <h3 className="module-card-title">HR</h3>
                </div>

                {/* 9. ACCOUNT */}
                <div 
                  className="module-card" 
                  onClick={() => {
                    setSelectedModule('account');
                    setActiveView('account');
                  }}
                >
                  <div className="module-card-icon"><CreditCard size={20} /></div>
                  <h3 className="module-card-title">Account</h3>
                </div>

                {/* 10. CERTIFICATE */}
                <div 
                  className="module-card" 
                  onClick={() => {
                    setSelectedModule('certificate');
                    setActiveView('certificate');
                  }}
                >
                  <div className="module-card-icon"><Award size={20} /></div>
                  <h3 className="module-card-title">Certificate</h3>
                </div>

                {/* 11. ACADEMIC */}
                <div 
                  className="module-card" 
                  onClick={() => {
                    setSelectedModule('academic');
                    setActiveView('academic');
                  }}
                >
                  <div className="module-card-icon"><GraduationCap size={20} /></div>
                  <h3 className="module-card-title">Academic</h3>
                </div>

                {/* 12. FRONT OFFICE */}
                <div 
                  className="module-card" 
                  onClick={() => {
                    setSelectedModule('frontoffice');
                    setActiveView('frontoffice');
                  }}
                >
                  <div className="module-card-icon"><Contact size={20} /></div>
                  <h3 className="module-card-title">Front Office</h3>
                </div>

                {/* 13. TIME TABLE */}
                <div 
                  className="module-card" 
                  onClick={() => {
                    setSelectedModule('timetable');
                    setActiveView('timetable');
                  }}
                >
                  <div className="module-card-icon"><Clock size={20} /></div>
                  <h3 className="module-card-title">Time Table</h3>
                </div>

                {/* 14. SEND SMS */}
                <div 
                  className="module-card" 
                  onClick={() => {
                    setSelectedModule('sendsms');
                    setActiveView('sendsms');
                  }}
                >
                  <div className="module-card-icon"><MessageSquare size={20} /></div>
                  <h3 className="module-card-title">Send SMS</h3>
                </div>

                {/* 15. HOSTEL */}
                <div 
                  className="module-card" 
                  onClick={() => {
                    setSelectedModule('hostel');
                    setActiveView('hostel');
                  }}
                >
                  <div className="module-card-icon"><Building size={20} /></div>
                  <h3 className="module-card-title">Hostel</h3>
                </div>

                {/* 16. ECONTENT */}
                <div 
                  className="module-card" 
                  onClick={() => {
                    setSelectedModule('econtent');
                    setActiveView('econtent');
                  }}
                >
                  <div className="module-card-icon"><BookOpen size={20} /></div>
                  <h3 className="module-card-title">Econtent</h3>
                </div>

                {/* 17. ATTENDANCE */}
                <div 
                  className="module-card" 
                  onClick={() => {
                    setSelectedModule('attendance');
                    setActiveView('attendance');
                  }}
                >
                  <div className="module-card-icon"><CalendarCheck size={20} /></div>
                  <h3 className="module-card-title">Attendance</h3>
                </div>

                {/* 18. PAYROLL */}
                <div 
                  className="module-card" 
                  onClick={() => {
                    setSelectedModule('payroll');
                    setActiveView('payroll');
                  }}
                >
                  <div className="module-card-icon"><DollarSign size={20} /></div>
                  <h3 className="module-card-title">Payroll</h3>
                </div>

                {/* 19. LIBRARY */}
                <div 
                  className="module-card" 
                  onClick={() => {
                    setSelectedModule('library');
                    setActiveView('library');
                  }}
                >
                  <div className="module-card-icon"><BookOpen size={20} /></div>
                  <h3 className="module-card-title">Library</h3>
                </div>

                {/* 20. MASTER */}
                <div 
                  className="module-card" 
                  onClick={() => {
                    setSelectedModule('master');
                    setActiveView('master');
                  }}
                >
                  <div className="module-card-icon"><Settings size={20} /></div>
                  <h3 className="module-card-title">Master</h3>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: ENHANCED PREMIUM DASHBOARD */}
          {activeView === 'dashboard' && (
            <div>
              {/* Conditional Dashboard based on activeRole */}
              {activeRole === 'Admin' && (
                <div>
                  {/* Metrics cards */}
                  <div className="metrics-row" style={{ marginBottom: '20px' }}>
                    <div className="metric-box" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)', borderColor: '#bfdbfe' }}>
                      <div>
                        <div className="metric-value" style={{ color: '#1e3a8a' }}>{students.length}</div>
                        <div className="metric-label">Enrolled Students</div>
                        <span style={{ fontSize: '10px', color: '#2563eb', fontWeight: 700 }}>+2 added today</span>
                      </div>
                      <div style={{ backgroundColor: '#2563eb', padding: '10px', borderRadius: '8px' }}>
                        <Users size={20} style={{ color: '#ffffff' }} />
                      </div>
                    </div>
                    <div className="metric-box" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)', borderColor: '#bbf7d0' }}>
                      <div>
                        <div className="metric-value" style={{ color: '#15803d' }}>₹{totalCollectedFormatted}k</div>
                        <div className="metric-label">Total Fee Collected</div>
                        <span style={{ fontSize: '10px', color: '#166534', fontWeight: 700 }}>Lump-sum payments added</span>
                      </div>
                      <div style={{ backgroundColor: '#10b981', padding: '10px', borderRadius: '8px' }}>
                        <DollarSign size={20} style={{ color: '#ffffff' }} />
                      </div>
                    </div>
                    <div className="metric-box" style={{ background: 'linear-gradient(135deg, #faf5ff 0%, #ffffff 100%)', borderColor: '#f3e8ff' }}>
                      <div>
                        <div className="metric-value" style={{ color: '#6b21a8' }}>{teachers.length}</div>
                        <div className="metric-label">Faculty Active</div>
                        <span style={{ fontSize: '10px', color: '#7c3aed', fontWeight: 700 }}>100% active</span>
                      </div>
                      <div style={{ backgroundColor: '#7c3aed', padding: '10px', borderRadius: '8px' }}>
                        <Award size={20} style={{ color: '#ffffff' }} />
                      </div>
                    </div>
                    <div className="metric-box" style={{ background: 'linear-gradient(135deg, #fff7ed 0%, #ffffff 100%)', borderColor: '#ffedd5' }}>
                      <div>
                        <div className="metric-value" style={{ color: '#c2410c' }}>{students.filter(s => s.status === 'Pending').length}</div>
                        <div className="metric-label">Pending Reviews</div>
                        <span style={{ fontSize: '10px', color: '#ea580c', fontWeight: 700 }}>Needs validation</span>
                      </div>
                      <div style={{ backgroundColor: '#ea580c', padding: '10px', borderRadius: '8px' }}>
                        <Clock size={20} style={{ color: '#ffffff' }} />
                      </div>
                    </div>
                  </div>

                  {/* Master 2-Column Dashboard Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '20px', alignItems: 'start' }}>
                    
                    {/* LEFT COLUMN */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      
                      {/* Quick Actions Panel */}
                      <div className="erp-card" style={{ border: '1px solid rgba(37, 99, 235, 0.12)', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' }}>
                        <div className="erp-card-header" style={{ backgroundColor: '#f8fafc' }}>
                          <span className="erp-card-title">Quick Action Hub</span>
                        </div>
                        <div className="erp-card-body" style={{ padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                          <button className="quick-action-btn" onClick={() => setActiveView('admission')}>
                            <UserPlus size={18} className="icon-blue" />
                            <span className="btn-label">New Admission</span>
                          </button>
                          <button className="quick-action-btn" onClick={() => { setActiveView('fees'); setFeeViewTab('monthly'); }}>
                            <Wallet size={18} className="icon-green" />
                            <span className="btn-label">Collect Fees</span>
                          </button>
                          <button className="quick-action-btn" onClick={() => setActiveView('gatepass')}>
                            <Ticket size={18} className="icon-orange" />
                            <span className="btn-label">Issue Gatepass</span>
                          </button>
                          <button className="quick-action-btn" onClick={() => setActiveView('teacher')}>
                            <BookOpen size={18} className="icon-purple" />
                            <span className="btn-label">Staff Directory</span>
                          </button>
                          <button className="quick-action-btn" onClick={() => setActiveView('reports')}>
                            <FileSpreadsheet size={18} className="icon-teal" />
                            <span className="btn-label">Student Reports</span>
                          </button>
                        </div>
                      </div>

                      {/* SVG Chart Card */}
                      <div className="erp-card hover-card" style={{ cursor: 'pointer' }} onClick={() => setActiveView('analytics')}>
                        <div className="erp-card-header">
                          <span className="erp-card-title">Admission & Fees Collection Trend</span>
                          <div style={{ display: 'flex', gap: '12px', fontSize: '11px', fontWeight: 600 }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#2563eb' }}>
                              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2563eb', display: 'inline-block' }}></span>
                              Admissions
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981' }}>
                              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span>
                              Fees Collected
                            </span>
                          </div>
                        </div>
                        <div className="erp-card-body" style={{ padding: '18px' }}>
                          <div style={{ height: '170px' }}>
                            <svg viewBox="0 0 500 150" width="100%" height="100%">
                              <defs>
                                <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3"/>
                                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0"/>
                                </linearGradient>
                                <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.3"/>
                                  <stop offset="100%" stopColor="#10b981" stopOpacity="0"/>
                                </linearGradient>
                              </defs>
                              <line x1="50" y1="20" x2="480" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                              <line x1="50" y1="65" x2="480" y2="65" stroke="#f1f5f9" strokeWidth="1" />
                              <line x1="50" y1="110" x2="480" y2="110" stroke="#f1f5f9" strokeWidth="1" />
                              
                              <path d="M 50,110 L 120,80 L 190,95 L 260,60 L 330,45 L 400,30 L 470,25 L 470,110 Z" fill="url(#blueGrad)" />
                              <path d="M 50,110 L 120,80 L 190,95 L 260,60 L 330,45 L 400,30 L 470,25" fill="none" stroke="#2563eb" strokeWidth="2.5" />
                              
                              <path d="M 50,105 L 120,90 L 190,75 L 260,85 L 330,55 L 400,40 L 470,30 L 470,110 Z" fill="url(#greenGrad)" />
                              <path d="M 50,105 L 120,90 L 190,75 L 260,85 L 330,55 L 400,40 L 470,30" fill="none" stroke="#10b981" strokeWidth="2.5" />
                              
                              <circle cx="260" cy="60" r="3.5" fill="#2563eb" />
                              <circle cx="400" cy="30" r="3.5" fill="#2563eb" />
                              <circle cx="470" cy="25" r="3.5" fill="#2563eb" />
                              
                              <circle cx="260" cy="85" r="3.5" fill="#10b981" />
                              <circle cx="400" cy="40" r="3.5" fill="#10b981" />
                              <circle cx="470" cy="30" r="3.5" fill="#10b981" />

                              <text x="45" y="130" fill="#64748b" fontSize="9">Nov</text>
                              <text x="115" y="130" fill="#64748b" fontSize="9">Dec</text>
                              <text x="185" y="130" fill="#64748b" fontSize="9">Jan</text>
                              <text x="255" y="130" fill="#64748b" fontSize="9">Feb</text>
                              <text x="325" y="130" fill="#64748b" fontSize="9">Mar</text>
                              <text x="395" y="130" fill="#64748b" fontSize="9">Apr</text>
                              <text x="465" y="130" fill="#64748b" fontSize="9">May</text>
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Recent Admissions Ledger Card */}
                      <div className="erp-card">
                        <div className="erp-card-header">
                          <span className="erp-card-title">Recent Admissions Ledger</span>
                          <button className="erp-btn btn-outline" style={{ height: '24px', padding: '0 8px', fontSize: '10px' }} onClick={() => setActiveView('students')}>
                            View All
                          </button>
                        </div>
                        <div className="table-container">
                          <table className="erp-table">
                            <thead>
                              <tr>
                                <th>Student</th>
                                <th>Class</th>
                                <th>Parent</th>
                                <th>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {students.slice(-3).reverse().map(st => (
                                <tr key={st.id}>
                                  <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#e2e8f0', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                        {st.name.substring(0, 1)}
                                      </div>
                                      <strong>{st.name}</strong>
                                    </div>
                                  </td>
                                  <td>{st.class}</td>
                                  <td>{st.fatherName}</td>
                                  <td><span className={`erp-badge ${getStatusClass(st.status)}`}>{st.status}</span></td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                    </div>

                    {/* RIGHT COLUMN */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      
                      {/* School Insights Card */}
                      <div className="erp-card">
                        <div className="erp-card-header">
                          <span className="erp-card-title">School Insights</span>
                        </div>
                        <div className="erp-card-body" style={{ padding: '18px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: '4px' }}>
                              Enrollment by Class
                            </div>
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600 }}>
                                <span>Class 5</span>
                                <span>2 Students</span>
                              </div>
                              <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', marginTop: '3px', overflow: 'hidden' }}>
                                <div style={{ width: '40%', height: '100%', backgroundColor: '#2563eb' }}></div>
                              </div>
                            </div>

                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600 }}>
                                <span>Class 4</span>
                                <span>2 Students</span>
                              </div>
                              <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', marginTop: '3px', overflow: 'hidden' }}>
                                <div style={{ width: '40%', height: '100%', backgroundColor: '#2563eb' }}></div>
                              </div>
                            </div>

                            <div style={{ marginBottom: '8px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600 }}>
                                <span>Class 6</span>
                                <span>1 Student</span>
                              </div>
                              <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', marginTop: '3px', overflow: 'hidden' }}>
                                <div style={{ width: '20%', height: '100%', backgroundColor: '#2563eb' }}></div>
                              </div>
                            </div>

                            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '14px', marginTop: '6px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                                <span>Collection Progress</span>
                                <span style={{ color: '#16a34a' }}>78.2%</span>
                              </div>
                              <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', marginTop: '6px', overflow: 'hidden' }}>
                                <div style={{ width: '78.2%', height: '100%', backgroundColor: '#16a34a' }}></div>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: '#64748b', marginTop: '6px' }}>
                                <span>Paid: ₹{(totalFeesPaidSum + monthlyFeesPaidSum).toLocaleString()}</span>
                                <span>Target: ₹1,50,000</span>
                              </div>
                            </div>

                            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '14px', marginTop: '6px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                                <span>Staff Presence Today</span>
                                <span style={{ color: '#7c3aed' }}>100%</span>
                              </div>
                              <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', marginTop: '6px', overflow: 'hidden' }}>
                                <div style={{ width: '100%', height: '100%', backgroundColor: '#7c3aed' }}></div>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: '#64748b', marginTop: '6px' }}>
                                <span>Present: 4 / 4 Faculty</span>
                                <span>On Leave: 0</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* System Notifications Ticker */}
                      <div className="erp-card">
                        <div className="erp-card-header">
                          <span className="erp-card-title">Live System Logs</span>
                        </div>
                        <div className="erp-card-body" style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {systemLogs.map(log => (
                            <div key={log.id} style={{ display: 'flex', gap: '10px', fontSize: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                              <div style={{ 
                                width: '6px', 
                                height: '6px', 
                                borderRadius: '50%', 
                                backgroundColor: log.type === 'success' ? '#10b981' : log.type === 'warning' ? '#f59e0b' : '#3b82f6',
                                marginTop: '6px'
                              }}></div>
                              <div style={{ flex: 1 }}>
                                <div style={{ color: '#0f172a', fontWeight: 600 }}>{log.message}</div>
                                <div style={{ color: '#64748b', fontSize: '10px', marginTop: '2px' }}>{log.time}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Upcoming Academic Calendar */}
                      <div className="erp-card">
                        <div className="erp-card-header">
                          <span className="erp-card-title">Academic Schedule</span>
                        </div>
                        <div className="erp-card-body" style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <div style={{ backgroundColor: '#f1f5f9', padding: '6px 8px', borderRadius: '4px', textAlign: 'center', width: '40px' }}>
                              <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Jul</div>
                              <strong style={{ fontSize: '14px', color: '#0f172a' }}>10</strong>
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '12px' }}>Unit Examination I</div>
                              <div style={{ fontSize: '11px', color: '#64748b' }}>Class 3 to 6 syllabus</div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <div style={{ backgroundColor: '#f1f5f9', padding: '6px 8px', borderRadius: '4px', textAlign: 'center', width: '40px' }}>
                              <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Jul</div>
                              <strong style={{ fontSize: '14px', color: '#0f172a' }}>18</strong>
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '12px' }}>Parent-Teacher Meet</div>
                              <div style={{ fontSize: '11px', color: '#64748b' }}>Review session registration</div>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>

                  </div>
                </div>
              )}

              {activeRole !== 'Admin' && (
                <RoleDashboard 
                  activeRole={activeRole}
                  students={students}
                  teachers={teachers}
                  books={books}
                  totalCollectedFormatted={totalCollectedFormatted}
                  totalFeesPaidSum={totalFeesPaidSum}
                  monthlyFeesPaidSum={monthlyFeesPaidSum}
                  systemLogs={systemLogs}
                  getStatusClass={getStatusClass}
                  setActiveView={setActiveView}
                  setFeeViewTab={setFeeViewTab}
                />
              )}
            </div>
          )}

          {/* VIEW: ANALYTICAL DETAILS */}
          {activeView === 'analytics' && (
            <div>
              <div className="view-header">
                <div>
                  <h2 className="view-title">Institutional Growth & Analytics</h2>
                  <span className="view-subtitle">Detailed breakdown of admissions and fee collection trends</span>
                </div>
                <button className="erp-btn btn-outline" onClick={() => setActiveView('dashboard')}>
                  Back to Dashboard
                </button>
              </div>

              <div className="erp-card">
                <div className="erp-card-header">
                  <span className="erp-card-title">Admission & Fees Collection Trend (Detailed Breakdown)</span>
                  <div style={{ display: 'flex', gap: '15px' }}>
                    <button className="erp-btn btn-outline" style={{ height: '26px', padding: '0 10px', fontSize: '10px' }} onClick={() => addToast('Export Successful', 'Excel data downloaded successfully.', 'success')}>
                      Export CSV
                    </button>
                    <button className="erp-btn btn-primary" style={{ height: '26px', padding: '0 10px', fontSize: '10px' }} onClick={() => addToast('Print Spooling', 'Sending analytics to local printer...', 'success')}>
                      Print Report
                    </button>
                  </div>
                </div>
                <div className="erp-card-body" style={{ padding: '24px' }}>
                  <div style={{ height: '200px', marginBottom: '32px' }}>
                    <svg viewBox="0 0 500 120" width="100%" height="100%">
                      <defs>
                        <linearGradient id="blueGradHuge" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35"/>
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0"/>
                        </linearGradient>
                        <linearGradient id="greenGradHuge" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.35"/>
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0"/>
                        </linearGradient>
                      </defs>
                      <line x1="40" y1="10" x2="480" y2="10" stroke="#e2e8f0" strokeWidth="1" />
                      <line x1="40" y1="50" x2="480" y2="50" stroke="#e2e8f0" strokeWidth="1" />
                      <line x1="40" y1="90" x2="480" y2="90" stroke="#e2e8f0" strokeWidth="1" />
                      
                      <path d="M 40,90 L 110,65 L 180,78 L 250,50 L 320,38 L 390,26 L 460,20 L 460,90 Z" fill="url(#blueGradHuge)" />
                      <path d="M 40,90 L 110,65 L 180,78 L 250,50 L 320,38 L 390,26 L 460,20" fill="none" stroke="#2563eb" strokeWidth="3" />
                      
                      <path d="M 40,85 L 110,72 L 180,60 L 250,68 L 320,44 L 390,32 L 460,24 L 460,90 Z" fill="url(#greenGradHuge)" />
                      <path d="M 40,85 L 110,72 L 180,60 L 250,68 L 320,44 L 390,32 L 460,24" fill="none" stroke="#10b981" strokeWidth="3" />
                      
                      <circle cx="250" cy="50" r="4" fill="#2563eb" />
                      <circle cx="390" cy="26" r="4" fill="#2563eb" />
                      <circle cx="460" cy="20" r="4" fill="#2563eb" />
                      
                      <circle cx="250" cy="68" r="4" fill="#10b981" />
                      <circle cx="390" cy="32" r="4" fill="#10b981" />
                      <circle cx="460" cy="24" r="4" fill="#10b981" />

                      <text x="35" y="105" fill="#64748b" fontSize="8">Nov</text>
                      <text x="105" y="105" fill="#64748b" fontSize="8">Dec</text>
                      <text x="175" y="105" fill="#64748b" fontSize="8">Jan</text>
                      <text x="245" y="105" fill="#64748b" fontSize="8">Feb</text>
                      <text x="315" y="105" fill="#64748b" fontSize="8">Mar</text>
                      <text x="385" y="105" fill="#64748b" fontSize="8">Apr</text>
                      <text x="465" y="105" fill="#64748b" fontSize="8">May</text>
                    </svg>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <div>
                      <h4 style={{ fontWeight: 700, marginBottom: '12px', fontSize: '13px', color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2563eb', display: 'inline-block' }}></span>
                        Admissions Growth Ledger
                      </h4>
                      <table className="erp-table">
                        <thead>
                          <tr>
                            <th>Month</th>
                            <th>New Registrations</th>
                            <th>Growth Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr><td>November</td><td>12 Students</td><td><span style={{ color: '#16a34a', fontWeight: 'bold' }}>+4%</span></td></tr>
                          <tr><td>December</td><td>15 Students</td><td><span style={{ color: '#16a34a', fontWeight: 'bold' }}>+25%</span></td></tr>
                          <tr><td>January</td><td>8 Students</td><td><span style={{ color: '#ef4444', fontWeight: 'bold' }}>-46%</span></td></tr>
                          <tr><td>February</td><td>18 Students</td><td><span style={{ color: '#16a34a', fontWeight: 'bold' }}>+125%</span></td></tr>
                          <tr><td>March</td><td>22 Students</td><td><span style={{ color: '#16a34a', fontWeight: 'bold' }}>+22%</span></td></tr>
                          <tr><td>April</td><td>30 Students</td><td><span style={{ color: '#16a34a', fontWeight: 'bold' }}>+36%</span></td></tr>
                          <tr><td>May</td><td>35 Students</td><td><span style={{ color: '#16a34a', fontWeight: 'bold' }}>+16%</span></td></tr>
                        </tbody>
                      </table>
                    </div>

                    <div>
                      <h4 style={{ fontWeight: 700, marginBottom: '12px', fontSize: '13px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span>
                        Fees Collection Ledger
                      </h4>
                      <table className="erp-table">
                        <thead>
                          <tr>
                            <th>Month</th>
                            <th>Amount Collected</th>
                            <th>Status Goal</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr><td>November</td><td>₹35,000</td><td><span className="erp-badge badge-approved">Met</span></td></tr>
                          <tr><td>December</td><td>₹45,000</td><td><span className="erp-badge badge-approved">Met</span></td></tr>
                          <tr><td>January</td><td>₹30,000</td><td><span className="erp-badge badge-pending">Below Target</span></td></tr>
                          <tr><td>February</td><td>₹55,000</td><td><span className="erp-badge badge-approved">Met</span></td></tr>
                          <tr><td>March</td><td>₹65,000</td><td><span className="erp-badge badge-approved">Met</span></td></tr>
                          <tr><td>April</td><td>₹90,000</td><td><span className="erp-badge badge-approved">Met</span></td></tr>
                          <tr><td>May</td><td>₹1,10,000</td><td><span className="erp-badge badge-approved">Met</span></td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: STUDENT LIST WITH PAGINATION & ACTIONS */}
          {activeView === 'students' && (
            <div>
              <div className="view-header">
                <div>
                  <h2 className="view-title">All Students</h2>
                  <span className="view-subtitle">Search, filter, and view school registration profiles</span>
                </div>
                {hasPermission('admission') && (
                  <button className="erp-btn btn-primary" onClick={() => setActiveView('admission')}>
                    <UserPlus size={14} /> Make Admission
                  </button>
                )}
              </div>

              {/* Filters */}
              <div className="erp-card">
                <div className="erp-card-body" style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                      <input 
                        type="text" 
                        placeholder="Search name, admission id, mobile..." 
                        style={{ width: '100%', paddingLeft: '32px' }}
                        value={sSearch}
                        onChange={(e) => {
                          setSSearch(e.target.value);
                          setCurrentPage(1);
                        }}
                      />
                      <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: '#64748b' }} />
                    </div>
                    <select value={sClass} onChange={(e) => { setSClass(e.target.value); setCurrentPage(1); }} style={{ width: '130px' }}>
                      <option value="">All Classes</option>
                      <option value="Class 3">Class 3</option>
                      <option value="Class 4">Class 4</option>
                      <option value="Class 5">Class 5</option>
                      <option value="Class 6">Class 6</option>
                    </select>
                    <select value={sStatus} onChange={(e) => { setSStatus(e.target.value); setCurrentPage(1); }} style={{ width: '130px' }}>
                      <option value="">All Statuses</option>
                      <option value="Approved">Approved</option>
                      <option value="Pending">Pending</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                    <select value={sType} onChange={(e) => { setSType(e.target.value); setCurrentPage(1); }} style={{ width: '130px' }}>
                      <option value="">All Types</option>
                      <option value="New">New</option>
                      <option value="Transfer">Transfer</option>
                    </select>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#64748b', marginLeft: 'auto' }}>
                      <span>Rows:</span>
                      <select value={recordsPerPage} onChange={(e) => { setRecordsPerPage(Number(e.target.value)); setCurrentPage(1); }} style={{ width: '75px', height: '32px', padding: '2px 8px' }}>
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Records Table */}
              <div className="erp-card">
                <div className="erp-card-header">
                  <span className="erp-card-title">Registered Students Ledger</span>
                </div>
                <div className="table-container">
                  <table className="erp-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Student</th>
                        <th>Class</th>
                        <th>Father's Name</th>
                        <th>Phone</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentRecords.map((st) => (
                        <tr key={st.id}>
                          <td style={{ fontFamily: 'monospace', fontWeight: 600, color: '#4f46e5' }}>{st.admissionNo}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                {st.photoUrl ? (
                                  <img src={st.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                  <span style={{ fontSize: '10px', fontWeight: 'bold' }}>{st.name.substring(0, 2).toUpperCase()}</span>
                                )}
                              </div>
                              <strong>{st.name}</strong>
                            </div>
                          </td>
                          <td>{st.class} ({st.section})</td>
                          <td>{st.fatherName}</td>
                          <td>{st.phone}</td>
                          <td><span className="erp-badge" style={{ backgroundColor: '#e2e8f0', color: '#475569' }}>{st.type}</span></td>
                          <td><span className={`erp-badge ${getStatusClass(st.status)}`}>{st.status}</span></td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button 
                                className="erp-btn btn-outline" 
                                style={{ height: '26px', padding: '0 8px', fontSize: '10px' }}
                                onClick={() => setSelectedStudent(st)}
                              >
                                <Contact size={11} /> ID Card
                              </button>
                              <button 
                                className="erp-btn btn-outline" 
                                style={{ height: '26px', padding: '0 8px', fontSize: '10px', borderColor: '#fee2e2', color: '#ef4444' }}
                                onClick={() => deleteStudent(st.id)}
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 18px', borderTop: '1px solid var(--color-border)' }}>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    Showing {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, filteredStudents.length)} of {filteredStudents.length} records
                  </span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      className="erp-btn btn-outline" 
                      style={{ height: '30px', padding: '0 12px' }}
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    >
                      <ChevronLeft size={14} /> Prev
                    </button>
                    <button 
                      className="erp-btn btn-outline" 
                      style={{ height: '30px', padding: '0 12px' }}
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    >
                      Next <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: MAKE ADMISSION */}
          {activeView === 'admission' && (
            <div>
              <div className="view-header">
                <div>
                  <h2 className="view-title">Create New Admission</h2>
                  <span className="view-subtitle">Fill institutional & personal fields below</span>
                </div>
              </div>

              <form onSubmit={handleAdmissionSubmit}>
                <div className="erp-card">
                  <div className="erp-card-header">
                    <span className="erp-card-title">01 Personal Identification Details</span>
                  </div>
                  <div className="erp-card-body">
                    <div className="form-grid">
                      <div className="form-group col-span-2">
                        <label>Student Name *</label>
                        <input 
                          type="text" 
                          required 
                          placeholder="Full Name" 
                          value={formName}
                          onChange={(e) => setFormName(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Date of Birth *</label>
                        <input type="date" required value={formDob} onChange={(e) => setFormDob(e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label>Gender *</label>
                        <select value={formGender} onChange={(e) => setFormGender(e.target.value)}>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Blood Group</label>
                        <input type="text" placeholder="e.g. O+" value={formBlood} onChange={(e) => setFormBlood(e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label>Aadhar No.</label>
                        <input type="text" placeholder="12 Digit No." value={formAadhar} onChange={(e) => setFormAadhar(e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label>Roll No</label>
                        <input type="text" placeholder="e.g. 101" value={formRoll} onChange={(e) => setFormRoll(e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label>Category *</label>
                        <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)}>
                          <option value="General">General</option>
                          <option value="OBC">OBC</option>
                          <option value="SC">SC</option>
                          <option value="ST">ST</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Caste</label>
                        <select value={formCaste} onChange={(e) => setFormCaste(e.target.value)}>
                          <option value="Hinduism">Hinduism</option>
                          <option value="Islam">Islam</option>
                          <option value="Sikhism">Sikhism</option>
                          <option value="Christianity">Christianity</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Height (cm)</label>
                        <input type="text" placeholder="Height" value={formHeight} onChange={(e) => setFormHeight(e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label>Weight (kg)</label>
                        <input type="text" placeholder="Weight" value={formWeight} onChange={(e) => setFormWeight(e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label>ID No.</label>
                        <input type="text" value="6493" readOnly style={{ backgroundColor: '#faf9f6' }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="erp-card">
                  <div className="erp-card-header">
                    <span className="erp-card-title">02 Academic & Parent Parameters</span>
                  </div>
                  <div className="erp-card-body">
                    <div className="form-grid">
                      <div className="form-group">
                        <label>PEN No.</label>
                        <input type="text" value="PEN-2026-004" readOnly style={{ backgroundColor: '#faf9f6' }} />
                      </div>
                      <div className="form-group">
                        <label>Class *</label>
                        <select required value={formClass} onChange={(e) => setFormClass(e.target.value)}>
                          <option value="">Select Class</option>
                          <option value="Class 3">Class 3</option>
                          <option value="Class 4">Class 4</option>
                          <option value="Class 5">Class 5</option>
                          <option value="Class 6">Class 6</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Section *</label>
                        <select required value={formSection} onChange={(e) => setFormSection(e.target.value)}>
                          <option value="">Select Section</option>
                          <option value="Section A">Section A</option>
                          <option value="Section B">Section B</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Student Type *</label>
                        <select value={formType} onChange={(e) => setFormType(e.target.value)}>
                          <option value="New">New</option>
                          <option value="Transfer">Transfer</option>
                        </select>
                      </div>

                      <div className="form-group col-span-2">
                        <label>Father's Name *</label>
                        <input 
                          type="text" 
                          required 
                          placeholder="Father Name" 
                          value={formFather}
                          onChange={(e) => setFormFather(e.target.value)}
                        />
                      </div>
                      <div className="form-group col-span-2">
                        <label>Phone Number *</label>
                        <input 
                          type="tel" 
                          required 
                          placeholder="10 digit phone" 
                          value={formPhone}
                          onChange={(e) => setFormPhone(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button type="button" className="erp-btn btn-outline" onClick={() => setActiveView('students')}>Cancel</button>
                  <button type="submit" className="erp-btn btn-finalize">Finalize & Save</button>
                </div>
              </form>
            </div>
          )}

          {/* VIEW: STUDENT REPORTS */}
          {activeView === 'reports' && (
            <div>
              <div className="view-header">
                <div>
                  <h2 className="view-title">Student Reports</h2>
                  <span className="view-subtitle">Detailed profiles, rolls maps, and upload records</span>
                </div>
              </div>

              {/* Filters */}
              <div className="erp-card">
                <div className="erp-card-header">
                  <span className="erp-card-title">Search Student Records</span>
                </div>
                <div className="erp-card-body" style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', gap: '15px' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                      <input 
                        type="text" 
                        placeholder="Search student, father name, roll..." 
                        style={{ width: '100%', height: '32px' }}
                        value={rSearch}
                        onChange={(e) => setRSearch(e.target.value)}
                      />
                    </div>
                    <div style={{ width: '200px' }}>
                      <select value={rClass} onChange={(e) => setRClass(e.target.value)} style={{ width: '100%', height: '32px' }}>
                        <option value="">Select Class</option>
                        <option value="Class 3">Class 3</option>
                        <option value="Class 4">Class 4</option>
                        <option value="Class 5">Class 5</option>
                        <option value="Class 6">Class 6</option>
                      </select>
                    </div>
                    <div style={{ width: '200px' }}>
                      <select value={rSection} onChange={(e) => setRSection(e.target.value)} style={{ width: '100%', height: '32px' }}>
                        <option value="">Select Section</option>
                        <option value="Section A">Section A</option>
                        <option value="Section B">Section B</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sub tabs */}
              <div className="tabs-row">
                <button className={`erp-tab ${reportTab === 'photos' ? 'active' : ''}`} onClick={() => setReportTab('photos')}>Photo Upload</button>
                <button className={`erp-tab ${reportTab === 'personal' ? 'active' : ''}`} onClick={() => setReportTab('personal')}>Personal Detail</button>
                <button className={`erp-tab ${reportTab === 'roll-wise' ? 'active' : ''}`} onClick={() => setReportTab('roll-wise')}>Roll Wise</button>
                <button className={`erp-tab ${reportTab === 'house-wise' ? 'active' : ''}`} onClick={() => setReportTab('house-wise')}>House Wise</button>
                <button className={`erp-tab ${reportTab === 'sibling' ? 'active' : ''}`} onClick={() => setReportTab('sibling')}>Sibling List</button>
                <button className={`erp-tab ${reportTab === 'cancel-student' ? 'active' : ''}`} onClick={() => setReportTab('cancel-student')}>Cancel Student</button>
              </div>

              <div className="erp-card" style={{ borderTop: 'none' }}>
                <div className="erp-card-header">
                  <span className="erp-card-title">
                    {reportTab === 'photos' && "Add Photo of Students"}
                    {reportTab === 'personal' && "Student Personal Profile List"}
                    {reportTab === 'roll-wise' && "Roll Number Reference Map"}
                    {reportTab === 'house-wise' && "House Allocation Matrix"}
                    {reportTab === 'sibling' && "Family Link / Sibling Group"}
                    {reportTab === 'cancel-student' && "Archived/Rejected Registrations"}
                  </span>
                </div>
                <div className="erp-card-body">
                  
                  {reportTab === 'photos' && (
                    <div className="table-container">
                      <table className="erp-table">
                        <thead>
                          <tr>
                            <th>SNo.</th>
                            <th>Student</th>
                            <th>Father Name</th>
                            <th>Photo File Upload</th>
                          </tr>
                        </thead>
                        <tbody>
                          {students.filter(st => {
                            const matchesClass = rClass === '' || st.class === rClass;
                            const matchesSection = rSection === '' || st.section === rSection;
                            const matchesSearch = st.name.toLowerCase().includes(rSearch.toLowerCase());
                            return matchesClass && matchesSection && matchesSearch;
                          }).map((st, index) => (
                            <tr key={st.id}>
                              <td>{index + 1}</td>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#e2e8f0', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {st.photoUrl ? (
                                      <img src={st.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                      <span style={{ fontSize: '9px', fontWeight: 'bold' }}>{st.name.substring(0, 1)}</span>
                                    )}
                                  </div>
                                  <strong style={{ color: '#1d4ed8' }}>{st.name}</strong>
                                </div>
                              </td>
                              <td>{st.fatherName}</td>
                              <td>
                                <div className="file-upload-cell">
                                  <input 
                                    type="file" 
                                    accept="image/*"
                                    className="file-upload-input"
                                    onChange={(e) => handlePhotoUpload(st.id, e)}
                                  />
                                  {st.photoName && (
                                    <span style={{ fontSize: '11.5px', color: '#16a34a', fontWeight: 'bold' }}>
                                      {st.photoName}
                                    </span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {reportTab === 'personal' && (
                    <div className="table-container">
                      <table className="erp-table">
                        <thead>
                          <tr>
                            <th>S.No</th>
                            <th>Name</th>
                            <th>Class/Section</th>
                            <th>Aadhar No.</th>
                            <th>Category</th>
                            <th>Caste</th>
                            <th>House</th>
                          </tr>
                        </thead>
                        <tbody>
                          {students.filter(st => {
                            const matchesClass = rClass === '' || st.class === rClass;
                            const matchesSection = rSection === '' || st.section === rSection;
                            const matchesSearch = st.name.toLowerCase().includes(rSearch.toLowerCase());
                            return matchesClass && matchesSection && matchesSearch;
                          }).map((st, index) => (
                            <tr key={st.id}>
                              <td>{index + 1}</td>
                              <td><strong>{st.name}</strong></td>
                              <td>{st.class} ({st.section})</td>
                              <td>{st.aadhar}</td>
                              <td>{st.category}</td>
                              <td>{st.caste}</td>
                              <td>{st.house}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {['roll-wise', 'house-wise', 'sibling', 'cancel-student'].includes(reportTab) && (
                    <div className="table-container">
                      <table className="erp-table">
                        <thead>
                          <tr>
                            <th>SNo.</th>
                            <th>Student ID</th>
                            <th>Name</th>
                            <th>Class/Sec</th>
                            <th>Report Parameter Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {students.filter(st => {
                            const matchesClass = rClass === '' || st.class === rClass;
                            return matchesClass;
                          }).map((st, index) => (
                            <tr key={st.id}>
                              <td>{index + 1}</td>
                              <td style={{ fontFamily: 'monospace', fontWeight: 600, color: '#4f46e5' }}>{st.admissionNo}</td>
                              <td><strong>{st.name}</strong></td>
                              <td>{st.class} - {st.section}</td>
                              <td>
                                {reportTab === 'roll-wise' && "Roll Listed"}
                                {reportTab === 'house-wise' && `${st.house || "None Allocated"}`}
                                {reportTab === 'sibling' && "No Siblings Linked"}
                                {reportTab === 'cancel-student' && `${st.status === 'Rejected' ? 'Rejected' : 'Active'}`}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                </div>
              </div>
            </div>
          )}

          {/* VIEW: FEE STRUCTURE (MONTHLY BREAKDOWN & lump sum COLLECTION) */}
          {activeView === 'fees' && (
            <div>
              <div className="view-header">
                <div>
                  <h2 className="view-title">Fee Collection Center</h2>
                  <span className="view-subtitle">Monitor class installments or process lump sum month-wise collections</span>
                </div>
              </div>

              {/* Sub-view toggle */}
              <div className="tabs-row" style={{ marginBottom: '20px' }}>
                <button 
                  className={`erp-tab ${feeViewTab === 'installments' ? 'active' : ''}`}
                  onClick={() => setFeeViewTab('installments')}
                >
                  General Installments Ledger
                </button>
                <button 
                  className={`erp-tab ${feeViewTab === 'monthly' ? 'active' : ''}`}
                  onClick={() => setFeeViewTab('monthly')}
                >
                  Student Month-wise Collector
                </button>
              </div>

              {/* TAB 1: General Installments Ledger */}
              {feeViewTab === 'installments' && (
                <div>
                  <div className="erp-card">
                    <div className="erp-card-body" style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', gap: '15px' }}>
                        <input 
                          type="text" 
                          placeholder="Search fee type..." 
                          style={{ flex: 1, height: '32px' }}
                          value={fSearch}
                          onChange={(e) => setFSearch(e.target.value)}
                        />
                        <select value={fClass} onChange={(e) => setFClass(e.target.value)} style={{ width: '150px' }}>
                          <option value="">All Classes</option>
                          <option value="Class 1">Class 1</option>
                          <option value="Class 2">Class 2</option>
                          <option value="Class 3">Class 3</option>
                        </select>
                        <select value={fStatus} onChange={(e) => setFStatus(e.target.value)} style={{ width: '150px' }}>
                          <option value="">All Statuses</option>
                          <option value="Paid">Paid</option>
                          <option value="Pending">Pending</option>
                          <option value="Overdue">Overdue</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="erp-card">
                    <div className="erp-card-header">
                      <span className="erp-card-title">Installment breakdown list</span>
                    </div>
                    <div className="table-container">
                      <table className="erp-table">
                        <thead>
                          <tr>
                            <th>Class</th>
                            <th>Section</th>
                            <th>Fee Type</th>
                            <th>Amount (₹)</th>
                            <th>Due Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {feeRecords.filter(f => {
                            const matchesQuery = f.type.toLowerCase().includes(fSearch.toLowerCase());
                            const matchesClass = fClass === '' || f.class === fClass;
                            const matchesStatus = fStatus === '' || f.status === fStatus;
                            return matchesQuery && matchesClass && matchesStatus;
                          }).map((f) => (
                            <tr key={f.id}>
                              <td><strong>{f.class}</strong></td>
                              <td>{f.section}</td>
                              <td>{f.type}</td>
                              <td><strong>₹{f.amount}</strong></td>
                              <td>{f.due}</td>
                              <td><span className={`erp-badge ${getStatusClass(f.status)}`}>{f.status}</span></td>
                              <td>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                  <button 
                                    className="erp-btn btn-outline" 
                                    style={{ height: '26px', padding: '0 8px', fontSize: '10px' }}
                                    onClick={() => addToast('Receipt Print', `Printing receipt for record ID: ${f.id}`, 'success')}
                                  >
                                    <Receipt size={11} style={{ marginRight: '3px' }} /> Receipt
                                  </button>
                                  {f.status !== 'Paid' && (
                                    <button 
                                      className="erp-btn btn-primary" 
                                      style={{ height: '26px', padding: '0 8px', fontSize: '10px', backgroundColor: '#15803d' }}
                                      onClick={() => processPayment(f.id)}
                                    >
                                      Mark Paid
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Student Month-wise Collector ("Collect in One Hand") */}
              {feeViewTab === 'monthly' && (
                <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', alignItems: 'start' }}>
                  {/* Select Student Panel */}
                  <div className="erp-card">
                    <div className="erp-card-header">
                      <span className="erp-card-title">Select Student</span>
                    </div>
                    <div className="erp-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      <div className="form-group">
                        <label>Student Name</label>
                        <select 
                          value={selectedFeeStudentId} 
                          onChange={(e) => {
                            setSelectedFeeStudentId(e.target.value);
                            setCheckedMonths([]);
                          }}
                        >
                          {students.filter(s => s.status === 'Approved').map(s => (
                            <option key={s.id} value={s.id}>{s.name} ({s.class})</option>
                          ))}
                        </select>
                      </div>

                      {/* Display Selected Student Info */}
                      {(() => {
                        const activeSt = students.find(s => s.id === selectedFeeStudentId);
                        return activeSt ? (
                          <div style={{ border: '1px solid var(--color-border)', padding: '12px', borderRadius: '6px', backgroundColor: '#faf9f6', fontSize: '12px' }}>
                            <div style={{ marginBottom: '6px' }}><strong>ID:</strong> {activeSt.id}</div>
                            <div style={{ marginBottom: '6px' }}><strong>Father Name:</strong> {activeSt.fatherName}</div>
                            <div style={{ marginBottom: '6px' }}><strong>Contact:</strong> {activeSt.phone}</div>
                            <div><strong>Admitted Class:</strong> {activeSt.class} ({activeSt.section})</div>
                          </div>
                        ) : null;
                      })()}
                    </div>
                  </div>

                  {/* Monthly Ledger and Checkout checklist */}
                  <div className="erp-card">
                    <div className="erp-card-header">
                      <span className="erp-card-title">Month-by-month Ledger billing</span>
                    </div>
                    <div className="table-container">
                      <table className="erp-table">
                        <thead>
                          <tr>
                            <th style={{ width: '40px' }}>Select</th>
                            <th>Billing Month</th>
                            <th>Installment (₹)</th>
                            <th>Due Date</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(studentMonthlyFees.find(sf => sf.studentId === selectedFeeStudentId)?.months || [
                            { month: "April", amount: 3000, status: "Pending", dueDate: "2026-04-10" },
                            { month: "May", amount: 3000, status: "Pending", dueDate: "2026-05-10" },
                            { month: "June", amount: 3000, status: "Pending", dueDate: "2026-06-10" },
                            { month: "July", amount: 3000, status: "Pending", dueDate: "2026-07-10" }
                          ]).map((m, i) => (
                            <tr key={i}>
                              <td>
                                <input 
                                  type="checkbox" 
                                  disabled={m.status === 'Paid'}
                                  checked={checkedMonths.includes(m.month)}
                                  onChange={() => handleMonthCheck(m.month)}
                                  style={{ cursor: 'pointer' }}
                                />
                              </td>
                              <td><strong>{m.month} Billing</strong></td>
                              <td><strong>₹{m.amount}</strong></td>
                              <td>{m.dueDate}</td>
                              <td><span className={`erp-badge ${getStatusClass(m.status)}`}>{m.status}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Checkout Box */}
                    {checkedMonths.length > 0 && (
                      <div style={{ padding: '16px', borderTop: '1px solid var(--color-border)', backgroundColor: '#f0fdf4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong style={{ color: '#166534', fontSize: '13px' }}>
                            LUMP SUM CHECKOUT: {checkedMonths.join(', ')}
                          </strong>
                          <div style={{ fontSize: '11px', color: '#15803d', marginTop: '2px' }}>
                            Collect <strong>{checkedMonths.length} months</strong> in one transaction
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                          <strong style={{ fontSize: '16px', color: '#166534' }}>
                            ₹{checkedMonths.length * 3000}
                          </strong>
                          <button 
                            className="erp-btn btn-finalize" 
                            style={{ backgroundColor: '#166534', border: 'none' }}
                            onClick={processMultimonthPayment}
                          >
                            <CreditCard size={13} style={{ marginRight: '5px' }} /> Collect Payment
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="erp-card" style={{ marginTop: '20px' }}>
                  <div className="erp-card-header">
                    <span className="erp-card-title">Detailed Payment History Ledger (Month-Wise Show)</span>
                  </div>
                  <div className="table-container">
                    <table className="erp-table">
                      <thead>
                        <tr>
                          <th>Txn ID</th>
                          <th>Student Name</th>
                          <th>Class</th>
                          <th>Paid Month</th>
                          <th>Paid Date</th>
                          <th>Amount (₹)</th>
                          <th>Mode</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {feePaymentHistory.length === 0 ? (
                          <tr>
                            <td colSpan={8} style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                              No transactions recorded.
                            </td>
                          </tr>
                        ) : (
                          feePaymentHistory.map((txn) => (
                            <tr key={txn.id}>
                              <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{txn.id}</td>
                              <td><strong>{txn.studentName}</strong> <span style={{ fontSize: '10.5px', color: '#64748b' }}>({txn.studentId})</span></td>
                              <td>{txn.class}</td>
                              <td>
                                <span className="erp-badge" style={{ backgroundColor: '#e0f2fe', color: '#0369a1', borderColor: '#bae6fd' }}>
                                  {txn.month} Fee
                                </span>
                              </td>
                              <td>{txn.date}</td>
                              <td><strong>₹{txn.amount}</strong></td>
                              <td><span style={{ fontSize: '11px', color: '#475569', fontWeight: 600 }}>{txn.paymentMethod}</span></td>
                              <td>
                                <button 
                                  className="erp-btn btn-outline" 
                                  style={{ height: '24px', padding: '0 8px', fontSize: '10px' }}
                                  onClick={() => addToast('Receipt Print', `Printing receipt for transaction ID: ${txn.id}`, 'success')}
                                >
                                  <Receipt size={11} style={{ marginRight: '3px' }} /> Print
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                </>
              )}
            </div>
          )}

          {/* VIEW: GATEPASS HISTORY */}
          {activeView === 'gatepass' && (
            <div>
              <div className="view-header">
                <div>
                  <h2 className="view-title">Gatepass Registry</h2>
                  <span className="view-subtitle">Verify and manage student exit permits during operational hours</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '20px', alignItems: 'start' }}>
                <div className="erp-card">
                  <div className="erp-card-header">
                    <span className="erp-card-title">File Exit Permit</span>
                  </div>
                  <div className="erp-card-body">
                    <form onSubmit={handleGatepassSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div className="form-group">
                        <label>Student Name</label>
                        <input 
                          type="text" 
                          placeholder="Search Student" 
                          value={gpStudent} 
                          onChange={(e) => setGpStudent(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Class Parameter</label>
                        <select value={gpClass} onChange={(e) => setGpClass(e.target.value)}>
                          <option value="Class 3">Class 3</option>
                          <option value="Class 4">Class 4</option>
                          <option value="Class 5">Class 5</option>
                          <option value="Class 6">Class 6</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Reason for Permit</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Sickness, Parent Visit" 
                          value={gpReason} 
                          onChange={(e) => setGpReason(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Expected Departure Time</label>
                        <input 
                          type="text" 
                          placeholder="e.g. 11:30 AM" 
                          value={gpTime} 
                          onChange={(e) => setGpTime(e.target.value)}
                        />
                      </div>
                      <button type="submit" className="erp-btn btn-primary" style={{ marginTop: '8px' }}>
                        Issue Permit
                      </button>
                    </form>
                  </div>
                </div>

                <div className="erp-card">
                  <div className="erp-card-header">
                    <span className="erp-card-title">Active Gatepass Permits</span>
                  </div>
                  <div className="table-container">
                    <table className="erp-table">
                      <thead>
                        <tr>
                          <th>Permit ID</th>
                          <th>Student Name</th>
                          <th>Class</th>
                          <th>Reason</th>
                          <th>Departing</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {gatepasses.map(gp => (
                          <tr key={gp.id}>
                            <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{gp.id}</td>
                            <td><strong>{gp.studentName}</strong></td>
                            <td>{gp.class}</td>
                            <td>{gp.reason}</td>
                            <td>{gp.outTime}</td>
                            <td><span className={`erp-badge ${getStatusClass(gp.status)}`}>{gp.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: ACTIVITY REPORT */}
          {activeView === 'activities' && (
            <div>
              <div className="view-header">
                <div>
                  <h2 className="view-title">Activity & Co-Curricular Report</h2>
                  <span className="view-subtitle">Track cultural festivals, science meets, and academic events</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '20px', alignItems: 'start' }}>
                <div className="erp-card">
                  <div className="erp-card-header">
                    <span className="erp-card-title">Schedule Event</span>
                  </div>
                  <div className="erp-card-body">
                    <form onSubmit={handleActivitySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div className="form-group">
                        <label>Event Title</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Science Fair" 
                          value={actTitle} 
                          onChange={(e) => setActTitle(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Scheduled Date</label>
                        <input 
                          type="date" 
                          value={actDate} 
                          onChange={(e) => setActDate(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Event Coordinator</label>
                        <input 
                          type="text" 
                          placeholder="Coordinator Name" 
                          value={actCoordinator} 
                          onChange={(e) => setActCoordinator(e.target.value)}
                        />
                      </div>
                      <button type="submit" className="erp-btn btn-primary" style={{ marginTop: '8px' }}>
                        Schedule Event
                      </button>
                    </form>
                  </div>
                </div>

                <div className="erp-card">
                  <div className="erp-card-header">
                    <span className="erp-card-title">Campus Event Calendar</span>
                  </div>
                  <div className="table-container">
                    <table className="erp-table">
                      <thead>
                        <tr>
                          <th>Event ID</th>
                          <th>Event Title</th>
                          <th>Coordinator</th>
                          <th>Date</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activityEvents.map(act => (
                          <tr key={act.id}>
                            <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{act.id}</td>
                            <td><strong>{act.title}</strong></td>
                            <td>{act.coordinator}</td>
                            <td>{act.date}</td>
                            <td><span className={`erp-badge ${getStatusClass(act.status)}`}>{act.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: COMPLETE TEACHER DIRECTORY */}
          {activeView === 'teacher' && (
            <div>
              <div className="view-header">
                <div>
                  <h2 className="view-title">Teacher Register</h2>
                  <span className="view-subtitle">Assigned classrooms, active statuses, and core departments</span>
                </div>
              </div>

              <div className="erp-card">
                <div className="erp-card-header">
                  <span className="erp-card-title">Academic Faculty List</span>
                </div>
                <div className="table-container">
                  <table className="erp-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Core Subject</th>
                        <th>Phone</th>
                        <th>Class Teacher</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teachers.map((tch) => (
                        <tr key={tch.id}>
                          <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{tch.id}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#1d4ed8', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '10px' }}>
                                {tch.name.substring(0, 2).toUpperCase()}
                              </div>
                              <strong>{tch.name}</strong>
                            </div>
                          </td>
                          <td>{tch.subject}</td>
                          <td>{tch.phone}</td>
                          <td><strong>{tch.classTeacher}</strong></td>
                          <td>
                            <span className={`erp-badge ${tch.status === 'Active' ? 'badge-approved' : 'badge-pending'}`}>
                              {tch.status}
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

          {/* VIEW: SETTINGS & SUB-PANELS */}
          {['set-class', 'set-section', 'set-religion', 'set-caste', 'set-session', 'set-house', 'set-update'].includes(activeView) && (
            <div>
              <div className="view-header">
                <div>
                  <h2 className="view-title" style={{ textTransform: 'uppercase' }}>{activeView.replace('set-', '')} Config</h2>
                  <span className="view-subtitle">Operational parameters and class setups</span>
                </div>
              </div>

              <div className="erp-card">
                <div className="erp-card-header">
                  <span className="erp-card-title">Setup Parameters</span>
                </div>
                <div className="erp-card-body">
                  <p style={{ color: '#44403c', marginBottom: '15px' }}>
                    Active configuration settings for Dettroin ERP.
                  </p>
                  <div style={{ border: '1px solid #e7e5e4', padding: '10px', backgroundColor: '#f8fafc' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                      <span>Parameter Title:</span>
                      <strong>{activeView.replace('set-', '').toUpperCase()}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                      <span>Status:</span>
                      <span className="erp-badge badge-approved">Active & Verified</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: LIBRARY CATALOG */}
          {activeView === 'library' && (
            <LibraryView books={books} setBooks={setBooks} students={students} />
          )}

          {/* VIEW: HOSTEL WARDEN */}
          {activeView === 'hostel' && (
            <HostelView hostelRooms={hostelRooms} setHostelRooms={setHostelRooms} students={students} />
          )}

          {/* VIEW: TRANSPORT FLEET */}
          {activeView === 'transport' && (
            <TransportView 
              transportRoutes={transportRoutes} 
              setTransportRoutes={setTransportRoutes} 
              students={students} 
              setStudents={setStudents}
            />
          )}

          {/* VIEW: ACCOUNTS CONSOLE */}
          {activeView === 'accounts' && (
            <AccountsView feeRecords={feeRecords} />
          )}

          {/* VIEW: CONFIG PERMISSIONS */}
          {activeView === 'permissions' && (
            <PermissionsView rolePermissions={rolePermissions} setRolePermissions={setRolePermissions} />
          )}

          {/* VIEW: ATTENDANCE */}
          {activeView === 'attendance' && (
            <AttendanceView students={students} />
          )}

          {/* VIEW: TIMETABLE */}
          {activeView === 'timetable' && (
            <TimetableView editable={activeRole === 'Admin' || activeRole === 'Principal'} />
          )}

          {/* VIEW: EXAMINATION */}
          {activeView === 'examination' && (
            <ExaminationView students={students} />
          )}

          {/* VIEW: HR & STAFF */}
          {activeView === 'hr' && (
            <HRView />
          )}

          {/* VIEW: COMMUNICATION */}
          {activeView === 'communication' && (
            <CommunicationView />
          )}

          {/* VIEW: INVENTORY */}
          {activeView === 'inventory' && (
            <InventoryView />
          )}

          {/* ========================================== */}
          {/* 20 MAIN MODULES ROUTING AND PLACEHOLDERS  */}
          {/* ========================================== */}

          {/* FACULTY MODULE VIEW */}
          {activeView === 'faculty' && (
            <FacultyModule 
              initialSubView={facultySubView} 
              onNavigateSubView={(sv) => setFacultySubView(sv)} 
            />
          )}

          {/* ACCOUNT MODULE VIEW */}
          {activeView === 'account' && (
            <AccountModule 
              initialSubView={accountSubView} 
              onNavigateSubView={(sv) => setAccountSubView(sv)} 
            />
          )}

          {/* PLACEHOLDER: AI PROGRAM */}
          {activeView === 'aiprogram' && renderPlaceholderView(
            'AI Program',
            'Advanced student profiling and automated grade predictors.',
            <Trophy size={22} />,
            ['Generate Progress AI Summary', 'Predictive Performance Analytics', 'Automated Grading Assistant']
          )}

          {/* PLACEHOLDER: RECEPTION */}
          {activeView === 'reception' && renderPlaceholderView(
            'Reception',
            'Visitor pass management, dial logs and dispatch records.',
            <DoorOpen size={22} />,
            ['Visitor Pass Registry', 'Phone Call Log', 'Postal Dispatch Records']
          )}

          {/* PLACEHOLDER: CERTIFICATE */}
          {activeView === 'certificate' && renderPlaceholderView(
            'Certificate',
            'Configure, generate and print certificates and admit cards.',
            <Award size={22} />,
            ['Generate Transfer Certificate (TC)', 'Generate Character Certificate', 'Admit Card Generator']
          )}

          {/* PLACEHOLDER: ACADEMIC */}
          {activeView === 'academic' && renderPlaceholderView(
            'Academic',
            'Manage academic session parameters, subjects catalogs and class schedules.',
            <GraduationCap size={22} />,
            ['Academic Session Config', 'Subjects Catalog', 'Classroom Allocation Grid']
          )}

          {/* PLACEHOLDER: FRONT OFFICE */}
          {activeView === 'frontoffice' && renderPlaceholderView(
            'Front Office',
            'Track client enquiries, complaints registers and calendar schedules.',
            <Contact size={22} />,
            ['Admission Enquiry Log', 'Complaints Register', 'Office Schedule Calendar']
          )}

          {/* PLACEHOLDER: ECONTENT */}
          {activeView === 'econtent' && renderPlaceholderView(
            'Econtent',
            'Upload syllabus files, class e-lectures and homework registers.',
            <BookOpen size={22} />,
            ['Upload Syllabus Docs', 'Lecture Videos Links', 'Class Assignment Sheets']
          )}

          {/* PLACEHOLDER: PAYROLL */}
          {activeView === 'payroll' && renderPlaceholderView(
            'Payroll',
            'Employee payslips generator, bonus schedules and deductions.',
            <DollarSign size={22} />,
            ['Salary Structure Template', 'Payslip Generation', 'Bonus & Deduction Registry']
          )}

          {/* PLACEHOLDER: MASTER */}
          {activeView === 'master' && (
            <PermissionsView rolePermissions={rolePermissions} setRolePermissions={setRolePermissions} />
          )}


          {/* ========================================== */}
          {/* 1. STUDENT MODULE - SUBSECTIONS           */}
          {/* ========================================== */}

          {/* 1.1 MAKE ADMISSION */}
          {activeView === 'student-admission-make' && (
            <div>
              <div className="view-header">
                <div>
                  <h2 className="view-title">New Student Admission</h2>
                  <span className="view-subtitle">Enter all student, parent, transport and academic fields</span>
                </div>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                const payload = {
                  name: formName,
                  dob: formDob,
                  gender: formGender,
                  blood: formBlood,
                  aadhar: formAadhar,
                  rollNo: formRoll,
                  category: formCategory,
                  caste: formCaste,
                  height: formHeight,
                  weight: formWeight,
                  class: formClass,
                  section: formSection,
                  fatherName: formFather,
                  phone: formPhone,
                  house: formHouse,
                  type: formType,
                  pen: formPen,
                  apaarId: formApaarId,
                  fatherOccupation: formFatherOccupation,
                  fatherIncome: formFatherIncome,
                  fatherAadhar: formFatherAadhar,
                  motherName: formMotherName,
                  motherOccupation: formMotherOccupation,
                  motherIncome: formMotherIncome,
                  motherAadhar: formMotherAadhar,
                  alternatePhone: formAlternatePhone,
                  email: formEmail,
                  dateOfAdmission: formDateOfAdmission,
                  shortAddress: formShortAddress,
                  password: formPassword || 'password123',
                  religion: formReligion,
                  busDetail: formBusDetail,
                  location: formLocation,
                  staffWard: formStaffWard,
                  sssmid: formSssmid,
                  photoUrl: formStudentPhoto ? '/assets/hero.png' : undefined
                };

                api.createAdmission(currentSchoolId, payload).then(res => {
                  setStudents(prev => [res, ...prev]);
                  addToast('Admission Success', `${res.name} has been successfully admitted!`, 'success');
                  
                  // Reset form fields
                  setFormName('');
                  setFormAadhar('');
                  setFormRoll('');
                  setFormPen('');
                  setFormApaarId('');
                  setFormFather('');
                  setFormPhone('');
                  setFormSssmid('');
                  setFormFatherIncome('');
                  setFormMotherName('');
                  setFormEmail('');
                  setFormShortAddress('');

                  setActiveView('student-admission-view');
                });
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* Step 1: Personal Info */}
                  <div className="erp-card">
                    <div className="erp-card-header">
                      <span className="erp-card-title">01. Personal & Identification Details</span>
                    </div>
                    <div className="erp-card-body">
                      <div className="form-grid">
                        <div className="form-group col-span-2">
                          <label>Student Name *</label>
                          <input type="text" required placeholder="Full Name" value={formName} onChange={e => setFormName(e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label>Gender *</label>
                          <select value={formGender} onChange={e => setFormGender(e.target.value)}>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Date of Birth *</label>
                          <input type="date" required value={formDob} onChange={e => setFormDob(e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label>Blood Group</label>
                          <input type="text" placeholder="e.g. O+" value={formBlood} onChange={e => setFormBlood(e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label>Student Aadhar *</label>
                          <input type="text" required placeholder="12 Digit Aadhar No." value={formAadhar} onChange={e => setFormAadhar(e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label>SSSMID</label>
                          <input type="text" placeholder="SSSMID No." value={formSssmid} onChange={e => setFormSssmid(e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label>APAAR ID</label>
                          <input type="text" placeholder="APAAR ID" value={formApaarId} onChange={e => setFormApaarId(e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label>Password</label>
                          <input type="password" placeholder="System access password" value={formPassword} onChange={e => setFormPassword(e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label>Height (cm)</label>
                          <input type="text" placeholder="cm" value={formHeight} onChange={e => setFormHeight(e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label>Weight (kg)</label>
                          <input type="text" placeholder="kg" value={formWeight} onChange={e => setFormWeight(e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label>Staff Ward?</label>
                          <select value={formStaffWard} onChange={e => setFormStaffWard(e.target.value)}>
                            <option value="No">No</option>
                            <option value="Yes">Yes</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Parent Info */}
                  <div className="erp-card">
                    <div className="erp-card-header">
                      <span className="erp-card-title">02. Parent & Address Details</span>
                    </div>
                    <div className="erp-card-body">
                      <div className="form-grid">
                        <div className="form-group col-span-2">
                          <label>Father's Name *</label>
                          <input type="text" required placeholder="Father's Full Name" value={formFather} onChange={e => setFormFather(e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label>Father Occupation</label>
                          <input type="text" placeholder="e.g. Business" value={formFatherOccupation} onChange={e => setFormFatherOccupation(e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label>Father Annual Income</label>
                          <input type="text" placeholder="Annual Income (₹)" value={formFatherIncome} onChange={e => setFormFatherIncome(e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label>Father Aadhar</label>
                          <input type="text" placeholder="Father Aadhar No." value={formFatherAadhar} onChange={e => setFormFatherAadhar(e.target.value)} />
                        </div>

                        <div className="form-group col-span-2">
                          <label>Mother's Name *</label>
                          <input type="text" required placeholder="Mother's Full Name" value={formMotherName} onChange={e => setFormMotherName(e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label>Mother Occupation</label>
                          <input type="text" placeholder="e.g. Teacher" value={formMotherOccupation} onChange={e => setFormMotherOccupation(e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label>Mother Annual Income</label>
                          <input type="text" placeholder="Annual Income (₹)" value={formMotherIncome} onChange={e => setFormMotherIncome(e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label>Mother Aadhar</label>
                          <input type="text" placeholder="Mother Aadhar No." value={formMotherAadhar} onChange={e => setFormMotherAadhar(e.target.value)} />
                        </div>

                        <div className="form-group">
                          <label>Mobile Number *</label>
                          <input type="tel" required placeholder="Primary Mobile" value={formPhone} onChange={e => setFormPhone(e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label>Alternate Mobile</label>
                          <input type="tel" placeholder="Alternate Mobile" value={formAlternatePhone} onChange={e => setFormAlternatePhone(e.target.value)} />
                        </div>
                        <div className="form-group col-span-2">
                          <label>Parent Email</label>
                          <input type="email" placeholder="email@gmail.com" value={formEmail} onChange={e => setFormEmail(e.target.value)} />
                        </div>
                        <div className="form-group col-span-2">
                          <label>Short Address (For logs)</label>
                          <input type="text" placeholder="Short Address" value={formShortAddress} onChange={e => setFormShortAddress(e.target.value)} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 3: Academic & Uploads */}
                  <div className="erp-card">
                    <div className="erp-card-header">
                      <span className="erp-card-title">03. Academic, Transport & Documents Upload</span>
                    </div>
                    <div className="erp-card-body">
                      <div className="form-grid">
                        <div className="form-group">
                          <label>Class *</label>
                          <select required value={formClass} onChange={e => setFormClass(e.target.value)}>
                            <option value="">Select Class</option>
                            <option value="Class 3">Class 3</option>
                            <option value="Class 4">Class 4</option>
                            <option value="Class 5">Class 5</option>
                            <option value="Class 6">Class 6</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Section *</label>
                          <select required value={formSection} onChange={e => setFormSection(e.target.value)}>
                            <option value="">Select Section</option>
                            <option value="Section A">Section A</option>
                            <option value="Section B">Section B</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Roll Number</label>
                          <input type="text" placeholder="Roll No" value={formRoll} onChange={e => setFormRoll(e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label>PEN (Permanent Education No)</label>
                          <input type="text" placeholder="PEN" value={formPen} onChange={e => setFormPen(e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label>Student Category *</label>
                          <select value={formCategory} onChange={e => setFormCategory(e.target.value)}>
                            <option value="General">General</option>
                            <option value="OBC">OBC</option>
                            <option value="SC">SC</option>
                            <option value="ST">ST</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Caste</label>
                          <input type="text" placeholder="e.g. Hinduism" value={formCaste} onChange={e => setFormCaste(e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label>Religion</label>
                          <input type="text" placeholder="e.g. Hindu" value={formReligion} onChange={e => setFormReligion(e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label>House Name</label>
                          <input type="text" placeholder="e.g. Red House" value={formHouse} onChange={e => setFormHouse(e.target.value)} />
                        </div>
                        <div className="form-group col-span-2">
                          <label>Bus Detail & Route</label>
                          <input type="text" placeholder="e.g. Route-1 Bus DL-3C-1234" value={formBusDetail} onChange={e => setFormBusDetail(e.target.value)} />
                        </div>
                        <div className="form-group col-span-2">
                          <label>Pickup Location</label>
                          <input type="text" placeholder="e.g. Noida Sec 62" value={formLocation} onChange={e => setFormLocation(e.target.value)} />
                        </div>

                        {/* File uploads section */}
                        <div className="form-group col-span-4" style={{ marginTop: '16px', borderTop: '1px dashed #e2e8f0', paddingTop: '16px' }}>
                          <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#1e3a8a' }}>Required Documents Upload</h4>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                            <div className="form-group">
                              <label>Student Photo</label>
                              <input type="file" onChange={e => setFormStudentPhoto(e.target.value)} />
                            </div>
                            <div className="form-group">
                              <label>Parents Photo</label>
                              <input type="file" onChange={e => setFormParentsPhoto(e.target.value)} />
                            </div>
                            <div className="form-group">
                              <label>PEN File</label>
                              <input type="file" onChange={e => setFormPenFile(e.target.value)} />
                            </div>
                            <div className="form-group">
                              <label>TC File</label>
                              <input type="file" onChange={e => setFormTcFile(e.target.value)} />
                            </div>
                            <div className="form-group">
                              <label>Marksheet</label>
                              <input type="file" onChange={e => setFormMarksheetFile(e.target.value)} />
                            </div>
                            <div className="form-group">
                              <label>DOB Certificate</label>
                              <input type="file" onChange={e => setFormDobCertificateFile(e.target.value)} />
                            </div>
                            <div className="form-group">
                              <label>Student Aadhar Doc</label>
                              <input type="file" onChange={e => setFormStudentAadharFile(e.target.value)} />
                            </div>
                            <div className="form-group">
                              <label>Father Aadhar Doc</label>
                              <input type="file" onChange={e => setFormFatherAadharFile(e.target.value)} />
                            </div>
                            <div className="form-group">
                              <label>Mother Aadhar Doc</label>
                              <input type="file" onChange={e => setFormMotherAadharFile(e.target.value)} />
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>

                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                  <button type="button" className="erp-btn btn-outline" onClick={() => { setSelectedModule(null); setActiveView('modules'); }}>Cancel</button>
                  <button type="submit" className="erp-btn btn-finalize">Save & Admit</button>
                </div>
              </form>
            </div>
          )}

          {/* 1.2 VIEW ADMISSION */}
          {activeView === 'student-admission-view' && (
            <div>
              <div className="view-header">
                <div>
                  <h2 className="view-title">Admission Records</h2>
                  <span className="view-subtitle">Active registrations, admission dates and profiles</span>
                </div>
                <button className="erp-btn btn-primary" onClick={() => setActiveView('student-admission-make')}>
                  <UserPlus size={14} /> New Admission
                </button>
              </div>

              {/* Filters */}
              <div className="erp-card">
                <div className="erp-card-body" style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                      <input 
                        type="text" 
                        placeholder="Search name, admission id, mobile..." 
                        style={{ width: '100%', paddingLeft: '32px' }}
                        value={sSearch}
                        onChange={(e) => {
                          setSSearch(e.target.value);
                          setCurrentPage(1);
                        }}
                      />
                      <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: '#64748b' }} />
                    </div>
                    <select value={sClass} onChange={(e) => { setSClass(e.target.value); setCurrentPage(1); }} style={{ width: '130px' }}>
                      <option value="">All Classes</option>
                      <option value="Class 3">Class 3</option>
                      <option value="Class 4">Class 4</option>
                      <option value="Class 5">Class 5</option>
                      <option value="Class 6">Class 6</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="erp-card" style={{ marginTop: '15px' }}>
                <div className="table-container">
                  <table className="erp-table">
                    <thead>
                      <tr>
                        <th>Adm No</th>
                        <th>Student Name</th>
                        <th>Class & Sec</th>
                        <th>Parent Details</th>
                        <th>Phone</th>
                        <th>PEN</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students
                        .filter(s => {
                          const matchesSearch = s.name.toLowerCase().includes(sSearch.toLowerCase()) ||
                            s.admissionNo.toLowerCase().includes(sSearch.toLowerCase()) ||
                            s.phone.includes(sSearch);
                          const matchesClass = sClass ? s.class === sClass : true;
                          return matchesSearch && matchesClass;
                        })
                        .map(std => (
                          <tr key={std.id}>
                            <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{std.admissionNo}</td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div className="avatar-square" style={{ width: '28px', height: '28px', fontSize: '11px' }}>
                                  {std.name.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <strong>{std.name}</strong>
                                  <div style={{ fontSize: '10.5px', color: '#64748b' }}>APAAR: {std.apaarId || 'N/A'}</div>
                                </div>
                              </div>
                            </td>
                            <td>{std.class} ({std.section})</td>
                            <td>
                              <div>F: {std.fatherName}</div>
                              {std.motherName && <div style={{ fontSize: '10.5px', color: '#64748b' }}>M: {std.motherName}</div>}
                            </td>
                            <td>{std.phone}</td>
                            <td style={{ fontFamily: 'monospace' }}>{std.pen || 'Pending'}</td>
                            <td>
                              <span className={`erp-badge badge-approved`}>{std.status}</span>
                            </td>
                            <td>
                              <button 
                                className="erp-btn btn-outline"
                                style={{ height: '26px', padding: '0 8px', fontSize: '11px', marginRight: '4px' }}
                                onClick={() => setSelectedStudent(std)}
                              >
                                ID Card
                              </button>
                              <button 
                                className="erp-btn btn-outline"
                                style={{ height: '26px', padding: '0 8px', fontSize: '11px', color: '#ef4444', borderColor: '#fca5a5' }}
                                onClick={() => {
                                  if (confirm(`Delete student record for ${std.name}?`)) {
                                    api.deleteAdmission(std.id).then(() => {
                                      setStudents(prev => prev.filter(x => x.id !== std.id));
                                      addToast('Record Deleted', `${std.name} profile removed.`, 'error');
                                    });
                                  }
                                }}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 1.3 STUDENT RECORD (Update Details) */}
          {activeView === 'student-update-record' && (
            <div>
              {editingStudentId ? (
                <div>
                  <div className="view-header">
                    <div>
                      <h2 className="view-title">Modify Student Record</h2>
                      <span className="view-subtitle">Edit custom details and documents status</span>
                    </div>
                  </div>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const updated = {
                      name: formName,
                      dob: formDob,
                      gender: formGender,
                      blood: formBlood,
                      aadhar: formAadhar,
                      rollNo: formRoll,
                      category: formCategory,
                      caste: formCaste,
                      height: formHeight,
                      weight: formWeight,
                      class: formClass,
                      section: formSection,
                      fatherName: formFather,
                      phone: formPhone,
                      house: formHouse,
                      type: formType,
                      pen: formPen,
                      apaarId: formApaarId,
                      fatherOccupation: formFatherOccupation,
                      fatherIncome: formFatherIncome,
                      fatherAadhar: formFatherAadhar,
                      motherName: formMotherName,
                      motherOccupation: formMotherOccupation,
                      motherIncome: formMotherIncome,
                      motherAadhar: formMotherAadhar,
                      alternatePhone: formAlternatePhone,
                      email: formEmail,
                      dateOfAdmission: formDateOfAdmission,
                      shortAddress: formShortAddress,
                      password: formPassword,
                      religion: formReligion,
                      busDetail: formBusDetail,
                      location: formLocation,
                      staffWard: formStaffWard,
                      sssmid: formSssmid
                    };

                    api.updateAdmission(editingStudentId, updated).then(res => {
                      setStudents(prev => prev.map(s => s.id === editingStudentId ? res : s));
                      addToast('Record Updated', `Successfully updated profile of ${res.name}.`, 'success');
                      setEditingStudentId(null);
                    });
                  }}>
                    {/* Compact form grid */}
                    <div className="erp-card">
                      <div className="erp-card-body">
                        <div className="form-grid">
                          <div className="form-group col-span-2"><label>Name</label><input type="text" value={formName} onChange={e => setFormName(e.target.value)} /></div>
                          <div className="form-group"><label>Class</label><input type="text" value={formClass} onChange={e => setFormClass(e.target.value)} /></div>
                          <div className="form-group"><label>Section</label><input type="text" value={formSection} onChange={e => setFormSection(e.target.value)} /></div>
                          <div className="form-group"><label>Roll No</label><input type="text" value={formRoll} onChange={e => setFormRoll(e.target.value)} /></div>
                          <div className="form-group"><label>PEN</label><input type="text" value={formPen} onChange={e => setFormPen(e.target.value)} /></div>
                          <div className="form-group"><label>APAAR ID</label><input type="text" value={formApaarId} onChange={e => setFormApaarId(e.target.value)} /></div>
                          <div className="form-group"><label>SSSMID</label><input type="text" value={formSssmid} onChange={e => setFormSssmid(e.target.value)} /></div>
                          <div className="form-group"><label>Father Name</label><input type="text" value={formFather} onChange={e => setFormFather(e.target.value)} /></div>
                          <div className="form-group"><label>Mother Name</label><input type="text" value={formMotherName} onChange={e => setFormMotherName(e.target.value)} /></div>
                          <div className="form-group"><label>Aadhar No</label><input type="text" value={formAadhar} onChange={e => setFormAadhar(e.target.value)} /></div>
                          <div className="form-group"><label>Phone</label><input type="text" value={formPhone} onChange={e => setFormPhone(e.target.value)} /></div>
                          <div className="form-group"><label>Height (cm)</label><input type="text" value={formHeight} onChange={e => setFormHeight(e.target.value)} /></div>
                          <div className="form-group"><label>Weight (kg)</label><input type="text" value={formWeight} onChange={e => setFormWeight(e.target.value)} /></div>
                          <div className="form-group"><label>House</label><input type="text" value={formHouse} onChange={e => setFormHouse(e.target.value)} /></div>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
                      <button type="button" className="erp-btn btn-outline" onClick={() => setEditingStudentId(null)}>Cancel</button>
                      <button type="submit" className="erp-btn btn-finalize">Save Modifications</button>
                    </div>
                  </form>
                </div>
              ) : (
                <div>
                  <div className="view-header">
                    <div>
                      <h2 className="view-title">Modify Record Directory</h2>
                      <span className="view-subtitle">Select a student profile below to edit custom information</span>
                    </div>
                  </div>
                  <div className="erp-card">
                    <div className="table-container">
                      <table className="erp-table">
                        <thead>
                          <tr>
                            <th>Roll</th>
                            <th>Student</th>
                            <th>Class & Sec</th>
                            <th>Father Name</th>
                            <th>PEN</th>
                            <th>SSSMID</th>
                            <th>Aadhar</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {students.map(std => (
                            <tr key={std.id}>
                              <td>{std.rollNo || 'N/A'}</td>
                              <td><strong>{std.name}</strong></td>
                              <td>{std.class} - {std.section}</td>
                              <td>{std.fatherName}</td>
                              <td>{std.pen || 'N/A'}</td>
                              <td>{std.sssmid || 'N/A'}</td>
                              <td>{std.aadhar}</td>
                              <td>
                                <button 
                                  className="erp-btn btn-outline"
                                  style={{ height: '24px', padding: '0 8px', fontSize: '11px' }}
                                  onClick={() => {
                                    setEditingStudentId(std.id);
                                    setFormName(std.name);
                                    setFormClass(std.class);
                                    setFormSection(std.section);
                                    setFormRoll(std.rollNo || '');
                                    setFormPen(std.pen || '');
                                    setFormApaarId(std.apaarId || '');
                                    setFormSssmid(std.sssmid || '');
                                    setFormFather(std.fatherName);
                                    setFormMotherName(std.motherName || '');
                                    setFormAadhar(std.aadhar);
                                    setFormPhone(std.phone);
                                    setFormHeight(std.height || '');
                                    setFormWeight(std.weight || '');
                                    setFormHouse(std.house || '');
                                    setFormDob(std.dob || '2016-01-01');
                                    setFormGender(std.gender);
                                    setFormBlood(std.blood);
                                    setFormCategory(std.category);
                                    setFormCaste(std.caste);
                                    setFormType(std.type);
                                    setFormFatherOccupation(std.fatherOccupation || '');
                                    setFormFatherIncome(std.fatherIncome || '');
                                    setFormFatherAadhar(std.fatherAadhar || '');
                                    setFormMotherOccupation(std.motherOccupation || '');
                                    setFormMotherIncome(std.motherIncome || '');
                                    setFormMotherAadhar(std.motherAadhar || '');
                                    setFormAlternatePhone(std.alternatePhone || '');
                                    setFormEmail(std.email || '');
                                    setFormDateOfAdmission(std.dateOfAdmission || '');
                                    setFormShortAddress(std.shortAddress || '');
                                    setFormPassword(std.password || '');
                                    setFormReligion(std.religion || '');
                                    setFormBusDetail(std.busDetail || '');
                                    setFormLocation(std.location || '');
                                    setFormStaffWard(std.staffWard || 'No');
                                  }}
                                >
                                  Modify Profile
                                </button>
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
          )}

          {/* 1.4 CREATE ROLL NUMBER */}
          {activeView === 'student-update-roll' && (
            <div>
              <div className="view-header">
                <div>
                  <h2 className="view-title">Batch Create Roll Numbers</h2>
                  <span className="view-subtitle">Generate or edit academic rolls for students class-wise</span>
                </div>
                <button 
                  className="erp-btn btn-finalize"
                  onClick={() => {
                    const updates = Object.keys(batchRollNo).map(id => ({
                      id,
                      fields: { rollNo: batchRollNo[id] }
                    }));
                    api.bulkUpdateAdmissions(updates).then(() => {
                      setStudents(prev => prev.map(s => batchRollNo[s.id] ? { ...s, rollNo: batchRollNo[s.id] } : s));
                      addToast('Rolls Set', 'Roll numbers successfully updated!', 'success');
                      setBatchRollNo({});
                    });
                  }}
                >
                  Save Roll Sheet
                </button>
              </div>

              <div className="erp-card">
                <div className="table-container">
                  <table className="erp-table">
                    <thead>
                      <tr>
                        <th>Adm No</th>
                        <th>Student Name</th>
                        <th>Class & Sec</th>
                        <th>Current Roll No</th>
                        <th>Update New Roll</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map(std => (
                        <tr key={std.id}>
                          <td style={{ fontFamily: 'monospace' }}>{std.admissionNo}</td>
                          <td><strong>{std.name}</strong></td>
                          <td>{std.class} ({std.section})</td>
                          <td><strong>{std.rollNo || 'N/A'}</strong></td>
                          <td>
                            <input 
                              type="text" 
                              style={{ width: '80px', height: '28px', padding: '2px 8px' }}
                              placeholder="New Roll"
                              value={batchRollNo[std.id] !== undefined ? batchRollNo[std.id] : (std.rollNo || '')}
                              onChange={e => setBatchRollNo(prev => ({ ...prev, [std.id]: e.target.value }))}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 1.5 UPDATE PHOTO */}
          {activeView === 'student-update-photo' && (
            <div>
              <div className="view-header">
                <div>
                  <h2 className="view-title">Upload Profile Photos</h2>
                  <span className="view-subtitle">Upload & associate student photos in bulk</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {students.map(std => (
                  <div key={std.id} className="erp-card" style={{ padding: '16px', display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <div className="avatar-square" style={{ width: '60px', height: '60px', borderRadius: '8px', fontSize: '18px' }}>
                      {std.photoUrl ? (
                        <img src="/assets/hero.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : std.name.substring(0,2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#1e293b' }}>{std.name}</h4>
                      <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '8px' }}>ID: {std.admissionNo} | {std.class}</span>
                      <input 
                        type="file" 
                        style={{ fontSize: '10px' }} 
                        onChange={e => {
                          const filename = e.target.value.split('\\').pop() || '';
                          api.updateAdmission(std.id, { photoUrl: '/assets/hero.png' }).then(res => {
                            setStudents(prev => prev.map(s => s.id === std.id ? res : s));
                            addToast('Photo Uploaded', `Photo set for ${std.name} (File: ${filename})`, 'success');
                          });
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 1.6 BLOCKED STUDENTS */}
          {activeView === 'student-update-blocked' && (
            <div>
              <div className="view-header">
                <div>
                  <h2 className="view-title">Access Block Registry</h2>
                  <span className="view-subtitle">Suspended student profiles and safety blocks control</span>
                </div>
              </div>

              <div className="erp-card">
                <div className="table-container">
                  <table className="erp-table">
                    <thead>
                      <tr>
                        <th>Adm No</th>
                        <th>Student Name</th>
                        <th>Class & Sec</th>
                        <th>Access Status</th>
                        <th>Action Toggle</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map(std => (
                        <tr key={std.id}>
                          <td style={{ fontFamily: 'monospace' }}>{std.admissionNo}</td>
                          <td><strong>{std.name}</strong></td>
                          <td>{std.class} ({std.section})</td>
                          <td>
                            {std.status === 'Blocked' ? (
                              <span className="erp-badge" style={{ backgroundColor: '#fee2e2', color: '#b91c1c', borderColor: '#fca5a5' }}>Blocked</span>
                            ) : (
                              <span className="erp-badge badge-approved">Approved / Active</span>
                            )}
                          </td>
                          <td>
                            <button 
                              className={`erp-btn ${std.status === 'Blocked' ? 'btn-finalize' : 'btn-outline'}`}
                              style={{ height: '26px', padding: '0 10px', fontSize: '11px' }}
                              onClick={() => {
                                const newStatus = std.status === 'Blocked' ? 'Approved' : 'Blocked';
                                api.updateAdmission(std.id, { status: newStatus }).then(res => {
                                  setStudents(prev => prev.map(s => s.id === std.id ? res : s));
                                  addToast(newStatus === 'Blocked' ? 'Student Suspended' : 'Student Activated', `${std.name} access status updated.`, 'success');
                                });
                              }}
                            >
                              {std.status === 'Blocked' ? 'Unblock Access' : 'Block Student'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 1.7 INACTIVE STUDENTS */}
          {activeView === 'student-update-inactive' && (
            <div>
              <div className="view-header">
                <div>
                  <h2 className="view-title">Inactive Student Register</h2>
                  <span className="view-subtitle">Archive, mark absent or withdraw student listings</span>
                </div>
              </div>

              <div className="erp-card">
                <div className="table-container">
                  <table className="erp-table">
                    <thead>
                      <tr>
                        <th>Adm No</th>
                        <th>Student Name</th>
                        <th>Class & Sec</th>
                        <th>Current State</th>
                        <th>Status Switch</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map(std => (
                        <tr key={std.id}>
                          <td style={{ fontFamily: 'monospace' }}>{std.admissionNo}</td>
                          <td><strong>{std.name}</strong></td>
                          <td>{std.class} ({std.section})</td>
                          <td>
                            {std.status === 'Inactive' ? (
                              <span className="erp-badge" style={{ backgroundColor: '#f3f4f6', color: '#4b5563', borderColor: '#d1d5db' }}>Inactive / Withdrawn</span>
                            ) : (
                              <span className="erp-badge badge-approved">{std.status}</span>
                            )}
                          </td>
                          <td>
                            <button 
                              className={`erp-btn ${std.status === 'Inactive' ? 'btn-finalize' : 'btn-outline'}`}
                              style={{ height: '26px', padding: '0 10px', fontSize: '11px' }}
                              onClick={() => {
                                const newStatus = std.status === 'Inactive' ? 'Approved' : 'Inactive';
                                api.updateAdmission(std.id, { status: newStatus }).then(res => {
                                  setStudents(prev => prev.map(s => s.id === std.id ? res : s));
                                  addToast('State Modified', `${std.name} status set to ${newStatus}`, 'success');
                                });
                              }}
                            >
                              {std.status === 'Inactive' ? 'Mark Active' : 'Mark Inactive'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 1.8 UPDATE AADHAR */}
          {activeView === 'student-update-aadhar' && (
            <div>
              <div className="view-header">
                <div>
                  <h2 className="view-title">Update Aadhar Numbers</h2>
                  <span className="view-subtitle">Direct grid mapping to edit student Aadhar records</span>
                </div>
                <button 
                  className="erp-btn btn-finalize"
                  onClick={() => {
                    const updates = Object.keys(batchAadhar).map(id => ({
                      id,
                      fields: { aadhar: batchAadhar[id] }
                    }));
                    api.bulkUpdateAdmissions(updates).then(() => {
                      setStudents(prev => prev.map(s => batchAadhar[s.id] ? { ...s, aadhar: batchAadhar[s.id] } : s));
                      addToast('Aadhar Saved', 'Aadhar updates saved successfully.', 'success');
                      setBatchAadhar({});
                    });
                  }}
                >
                  Save Batch Aadhar
                </button>
              </div>

              <div className="erp-card">
                <div className="table-container">
                  <table className="erp-table">
                    <thead>
                      <tr>
                        <th>Student Name</th>
                        <th>Class & Sec</th>
                        <th>Current Aadhar Number</th>
                        <th>Write New Aadhar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map(std => (
                        <tr key={std.id}>
                          <td><strong>{std.name}</strong></td>
                          <td>{std.class} ({std.section})</td>
                          <td style={{ fontFamily: 'monospace' }}>{std.aadhar || 'Pending'}</td>
                          <td>
                            <input 
                              type="text" 
                              style={{ width: '180px', height: '28px', padding: '2px 8px' }}
                              placeholder="12-digit no."
                              value={batchAadhar[std.id] !== undefined ? batchAadhar[std.id] : std.aadhar}
                              onChange={e => setBatchAadhar(prev => ({ ...prev, [std.id]: e.target.value }))}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 1.9 UPDATE DATA (Bulk Data Sheet Editor) */}
          {activeView === 'student-update-data' && (
            <div>
              <div className="view-header">
                <div>
                  <h2 className="view-title">Update Student Parameters Matrix</h2>
                  <span className="view-subtitle">Bulk grid spreadsheet to modify PEN, APAAR ID, SSSMID, and metrics</span>
                </div>
                <button 
                  className="erp-btn btn-finalize"
                  onClick={() => {
                    const updates = students.map(std => {
                      const upd: any = {};
                      if (batchDataPEN[std.id] !== undefined) upd.pen = batchDataPEN[std.id];
                      if (batchDataAPAAR[std.id] !== undefined) upd.apaarId = batchDataAPAAR[std.id];
                      if (batchDataSSSMID[std.id] !== undefined) upd.sssmid = batchDataSSSMID[std.id];
                      if (batchDataHeight[std.id] !== undefined) upd.height = batchDataHeight[std.id];
                      if (batchDataWeight[std.id] !== undefined) upd.weight = batchDataWeight[std.id];
                      
                      return {
                        id: std.id,
                        fields: upd
                      };
                    }).filter(u => Object.keys(u.fields).length > 0);

                    api.bulkUpdateAdmissions(updates).then(() => {
                      setStudents(prev => prev.map(s => {
                        const upd: any = {};
                        if (batchDataPEN[s.id] !== undefined) upd.pen = batchDataPEN[s.id];
                        if (batchDataAPAAR[s.id] !== undefined) upd.apaarId = batchDataAPAAR[s.id];
                        if (batchDataSSSMID[s.id] !== undefined) upd.sssmid = batchDataSSSMID[s.id];
                        if (batchDataHeight[s.id] !== undefined) upd.height = batchDataHeight[s.id];
                        if (batchDataWeight[s.id] !== undefined) upd.weight = batchDataWeight[s.id];
                        return { ...s, ...upd };
                      }));
                      addToast('Sheet Saved', 'Batch updates applied successfully!', 'success');
                      setBatchDataPEN({});
                      setBatchDataAPAAR({});
                      setBatchDataSSSMID({});
                      setBatchDataHeight({});
                      setBatchDataWeight({});
                    });
                  }}
                >
                  Save Data Matrix
                </button>
              </div>

              <div className="erp-card">
                <div className="table-container">
                  <table className="erp-table">
                    <thead>
                      <tr>
                        <th>Student Name</th>
                        <th>PEN</th>
                        <th>APAAR ID</th>
                        <th>SSSMID</th>
                        <th>Height (cm)</th>
                        <th>Weight (kg)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map(std => (
                        <tr key={std.id}>
                          <td><strong>{std.name}</strong></td>
                          <td>
                            <input 
                              type="text" 
                              style={{ width: '120px', height: '26px' }}
                              value={batchDataPEN[std.id] !== undefined ? batchDataPEN[std.id] : (std.pen || '')}
                              onChange={e => setBatchDataPEN(prev => ({ ...prev, [std.id]: e.target.value }))}
                            />
                          </td>
                          <td>
                            <input 
                              type="text" 
                              style={{ width: '150px', height: '26px' }}
                              value={batchDataAPAAR[std.id] !== undefined ? batchDataAPAAR[std.id] : (std.apaarId || '')}
                              onChange={e => setBatchDataAPAAR(prev => ({ ...prev, [std.id]: e.target.value }))}
                            />
                          </td>
                          <td>
                            <input 
                              type="text" 
                              style={{ width: '120px', height: '26px' }}
                              value={batchDataSSSMID[std.id] !== undefined ? batchDataSSSMID[std.id] : (std.sssmid || '')}
                              onChange={e => setBatchDataSSSMID(prev => ({ ...prev, [std.id]: e.target.value }))}
                            />
                          </td>
                          <td>
                            <input 
                              type="text" 
                              style={{ width: '60px', height: '26px' }}
                              value={batchDataHeight[std.id] !== undefined ? batchDataHeight[std.id] : (std.height || '')}
                              onChange={e => setBatchDataHeight(prev => ({ ...prev, [std.id]: e.target.value }))}
                            />
                          </td>
                          <td>
                            <input 
                              type="text" 
                              style={{ width: '60px', height: '26px' }}
                              value={batchDataWeight[std.id] !== undefined ? batchDataWeight[std.id] : (std.weight || '')}
                              onChange={e => setBatchDataWeight(prev => ({ ...prev, [std.id]: e.target.value }))}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 1.10 IDENTITY CARD PAGE */}
          {activeView === 'student-idcard' && (
            <div>
              <div className="view-header">
                <div>
                  <h2 className="view-title">Student ID Cards Generator</h2>
                  <span className="view-subtitle">Generate and preview student institutional cards</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '20px' }}>
                <div className="erp-card" style={{ padding: '16px' }}>
                  <div className="erp-card-header" style={{ padding: '0 0 10px 0', borderBottom: '1px solid #e2e8f0' }}>
                    <span className="erp-card-title">Select Student</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px', maxHeight: '400px', overflowY: 'auto' }}>
                    {students.map(std => (
                      <div 
                        key={std.id}
                        onClick={() => setSelectedStudent(std)}
                        style={{
                          padding: '10px',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          backgroundColor: selectedStudent?.id === std.id ? '#eff6ff' : '#ffffff',
                          borderColor: selectedStudent?.id === std.id ? '#bfdbfe' : '#e2e8f0'
                        }}
                      >
                        <strong>{std.name}</strong>
                        <div style={{ fontSize: '10.5px', color: '#64748b' }}>Roll: {std.rollNo || 'N/A'} | {std.class}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="erp-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  {selectedStudent ? (
                    <div>
                      <div className="id-card-layout" style={{ margin: '0 auto' }}>
                        <div className="id-card-header">
                          <h3>DETTROIN ERP</h3>
                          <span>Student Identification Card</span>
                        </div>
                        <div className="id-card-body">
                          <div className="id-card-photo-box">
                            {selectedStudent.photoUrl ? (
                              <img src={selectedStudent.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : selectedStudent.name.substring(0,2).toUpperCase()}
                          </div>
                          <div className="id-card-details">
                            <h4>{selectedStudent.name}</h4>
                            <div className="id-card-detail-row"><strong>ID:</strong> {selectedStudent.id.substring(0,8)}</div>
                            <div className="id-card-detail-row"><strong>Class:</strong> {selectedStudent.class} ({selectedStudent.section})</div>
                            <div className="id-card-detail-row"><strong>Roll No:</strong> {selectedStudent.rollNo || 'N/A'}</div>
                            <div className="id-card-detail-row"><strong>Blood:</strong> {selectedStudent.blood}</div>
                            <div className="id-card-detail-row"><strong>Father:</strong> {selectedStudent.fatherName}</div>
                          </div>
                        </div>
                        <div className="id-card-footer">ACADEMIC SESSION: 2026 - 2027</div>
                      </div>
                      <button 
                        className="erp-btn btn-primary" 
                        style={{ marginTop: '20px', width: '100%' }}
                        onClick={() => window.print()}
                      >
                        <Printer size={12} style={{ marginRight: '4px' }} /> Print Identity Card
                      </button>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', color: '#64748b' }}>
                      <Printer size={32} style={{ color: '#94a3b8', marginBottom: '8px' }} />
                      <p>Select a student from the sidebar to preview and print ID card</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}


          {/* ========================================== */}
          {/* 1.11 STUDENT REPORT SUB-VIEWS (11 REPORTS) */}
          {/* ========================================== */}

          {/* REPORT 1: STUDENT DETAILS */}
          {activeView === 'student-report-details' && (
            <div>
              <div className="view-header">
                <div>
                  <h2 className="view-title">Student Details Master Report</h2>
                  <span className="view-subtitle">Full profile dump of all registered institutional profiles</span>
                </div>
                <button className="erp-btn btn-outline" onClick={() => window.print()}><Printer size={12} /> Print Report</button>
              </div>
              <div className="erp-card">
                <div className="table-container">
                  <table className="erp-table">
                    <thead>
                      <tr>
                        <th>Adm No</th>
                        <th>Name</th>
                        <th>Class</th>
                        <th>Sec</th>
                        <th>Gender</th>
                        <th>Father</th>
                        <th>Mother</th>
                        <th>Aadhar</th>
                        <th>PEN</th>
                        <th>APAAR ID</th>
                        <th>Religion</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map(s => (
                        <tr key={s.id}>
                          <td>{s.admissionNo}</td>
                          <td><strong>{s.name}</strong></td>
                          <td>{s.class}</td>
                          <td>{s.section}</td>
                          <td>{s.gender}</td>
                          <td>{s.fatherName}</td>
                          <td>{s.motherName || 'N/A'}</td>
                          <td>{s.aadhar}</td>
                          <td>{s.pen || 'N/A'}</td>
                          <td>{s.apaarId || 'N/A'}</td>
                          <td>{s.religion || 'Hinduism'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* REPORT 2: STUDENT STRENGTH */}
          {activeView === 'student-report-strength' && (
            <div>
              <div className="view-header">
                <div>
                  <h2 className="view-title">Section-wise Enrolled Strength</h2>
                  <span className="view-subtitle">Aggregated metrics counts for school classes distribution</span>
                </div>
              </div>
              <div className="erp-card" style={{ padding: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                  {['Class 3', 'Class 4', 'Class 5', 'Class 6'].map(cls => {
                    const count = students.filter(s => s.class === cls).length;
                    return (
                      <div key={cls} className="erp-card" style={{ padding: '20px', background: '#eff6ff', borderColor: '#bfdbfe', textAlign: 'center' }}>
                        <h4 style={{ margin: 0, fontSize: '13px', color: '#1e3a8a' }}>{cls}</h4>
                        <div style={{ fontSize: '32px', fontWeight: 800, color: '#2563eb', margin: '8px 0' }}>{count}</div>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>Students Registered</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* REPORT 3: NEW ADMISSION */}
          {activeView === 'student-report-new' && (
            <div>
              <div className="view-header">
                <div>
                  <h2 className="view-title">New Admission Intake Ledger</h2>
                  <span className="view-subtitle">Intake entries filtered for the 2026-27 session</span>
                </div>
              </div>
              <div className="erp-card">
                <div className="table-container">
                  <table className="erp-table">
                    <thead>
                      <tr>
                        <th>Adm No</th>
                        <th>Name</th>
                        <th>Class</th>
                        <th>Section</th>
                        <th>DOB</th>
                        <th>Date of Admission</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.filter(s => s.type === 'New').map(s => (
                        <tr key={s.id}>
                          <td>{s.admissionNo}</td>
                          <td><strong>{s.name}</strong></td>
                          <td>{s.class}</td>
                          <td>{s.section}</td>
                          <td>{s.dob || '2016-01-01'}</td>
                          <td>{s.dateOfAdmission || '2026-04-01'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* REPORT 4: ENROLLED STRENGTH */}
          {activeView === 'student-report-enrolled-strength' && (
            <div>
              <div className="view-header">
                <div>
                  <h2 className="view-title">Class Capacity & Enrolled Strength Matrix</h2>
                  <span className="view-subtitle">Check school class seats allocation ratios</span>
                </div>
              </div>
              <div className="erp-card">
                <div className="table-container">
                  <table className="erp-table">
                    <thead>
                      <tr>
                        <th>Class Name</th>
                        <th>Allocated Capacity</th>
                        <th>Currently Enrolled</th>
                        <th>Remaining Vacancies</th>
                        <th>Usage Ratio</th>
                      </tr>
                    </thead>
                    <tbody>
                      {['Class 3', 'Class 4', 'Class 5', 'Class 6'].map(cls => {
                        const count = students.filter(s => s.class === cls).length;
                        const capacity = 40;
                        return (
                          <tr key={cls}>
                            <td><strong>{cls}</strong></td>
                            <td>{capacity} Seats</td>
                            <td><strong>{count} Students</strong></td>
                            <td>{capacity - count} Seats</td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ flex: 1, height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                                  <div style={{ width: `${(count / capacity) * 100}%`, height: '100%', background: '#2563eb' }}></div>
                                </div>
                                <span style={{ fontSize: '11px', fontWeight: 600 }}>{Math.round((count / capacity) * 100)}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* REPORT 5: ENROLLED STUDENTS */}
          {activeView === 'student-report-enrolled-students' && (
            <div>
              <div className="view-header">
                <div>
                  <h2 className="view-title">Approved Enrolled Students Directory</h2>
                  <span className="view-subtitle">Active student directory profiles excluding pending registrations</span>
                </div>
              </div>
              <div className="erp-card">
                <div className="table-container">
                  <table className="erp-table">
                    <thead>
                      <tr>
                        <th>Roll</th>
                        <th>Adm No</th>
                        <th>Student Name</th>
                        <th>Class & Sec</th>
                        <th>Mobile</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.filter(s => s.status === 'Approved').map(s => (
                        <tr key={s.id}>
                          <td>{s.rollNo || 'N/A'}</td>
                          <td>{s.admissionNo}</td>
                          <td><strong>{s.name}</strong></td>
                          <td>{s.class} ({s.section})</td>
                          <td>{s.phone}</td>
                          <td><span className="erp-badge badge-approved">Approved</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* REPORT 6: INACTIVE REPORT */}
          {activeView === 'student-report-inactive' && (
            <div>
              <div className="view-header">
                <div>
                  <h2 className="view-title">Inactive & Withdrawn Profiles</h2>
                  <span className="view-subtitle">Profiles suspended or marked inactive</span>
                </div>
              </div>
              <div className="erp-card">
                <div className="table-container">
                  <table className="erp-table">
                    <thead>
                      <tr>
                        <th>Adm No</th>
                        <th>Name</th>
                        <th>Class</th>
                        <th>Father Name</th>
                        <th>Phone</th>
                        <th>Reason Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.filter(s => s.status === 'Inactive').map(s => (
                        <tr key={s.id}>
                          <td>{s.admissionNo}</td>
                          <td><strong>{s.name}</strong></td>
                          <td>{s.class}</td>
                          <td>{s.fatherName}</td>
                          <td>{s.phone}</td>
                          <td><span className="erp-badge" style={{ backgroundColor: '#f3f4f6', color: '#4b5563', borderColor: '#d1d5db' }}>Inactive</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* REPORT 7: BPL STUDENTS */}
          {activeView === 'student-report-bpl' && (
            <div>
              <div className="view-header">
                <div>
                  <h2 className="view-title">Below Poverty Line (BPL) Students</h2>
                  <span className="view-subtitle">Students eligible for economic schemes aid</span>
                </div>
              </div>
              <div className="erp-card">
                <div className="table-container">
                  <table className="erp-table">
                    <thead>
                      <tr>
                        <th>Adm No</th>
                        <th>Name</th>
                        <th>Class</th>
                        <th>Father Name</th>
                        <th>Father Income (Annual)</th>
                        <th>Category</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.filter(s => Number(s.fatherIncome || 0) <= 200000).map(s => (
                        <tr key={s.id}>
                          <td>{s.admissionNo}</td>
                          <td><strong>{s.name}</strong></td>
                          <td>{s.class}</td>
                          <td>{s.fatherName}</td>
                          <td><strong>₹{s.fatherIncome || '0'}</strong></td>
                          <td><span className="erp-badge" style={{ backgroundColor: '#fef3c7', color: '#d97706', borderColor: '#fde68a' }}>BPL Eligible</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* REPORT 8: SIBLING REPORT */}
          {activeView === 'student-report-sibling' && (
            <div>
              <div className="view-header">
                <div>
                  <h2 className="view-title">Sibling Grouping Ledger</h2>
                  <span className="view-subtitle">Students clustered by parent name details</span>
                </div>
              </div>
              <div className="erp-card">
                <div className="table-container">
                  <table className="erp-table">
                    <thead>
                      <tr>
                        <th>Parent Name</th>
                        <th>Student Siblings Group</th>
                        <th>Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from(new Set(students.map(s => s.fatherName))).map(parent => {
                        const siblings = students.filter(s => s.fatherName === parent);
                        if (siblings.length < 1) return null;
                        return (
                          <tr key={parent}>
                            <td><strong>{parent}</strong></td>
                            <td>
                              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {siblings.map(sib => (
                                  <span key={sib.id} className="erp-badge" style={{ background: '#f0fdf4', color: '#166534', borderColor: '#bbf7d0' }}>
                                    {sib.name} ({sib.class})
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td><strong>{siblings.length}</strong></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* REPORT 9: CATEGORY REPORT */}
          {activeView === 'student-report-category' && (
            <div>
              <div className="view-header">
                <div>
                  <h2 className="view-title">Category Distribution Metrics</h2>
                  <span className="view-subtitle">Registered counts per student category caste</span>
                </div>
              </div>
              <div className="erp-card" style={{ padding: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                  {['General', 'OBC', 'SC', 'ST'].map(cat => {
                    const count = students.filter(s => s.category === cat).length;
                    return (
                      <div key={cat} className="erp-card" style={{ padding: '20px', background: '#fafaf9', borderLeft: '4px solid #1e3a8a', textAlign: 'center' }}>
                        <h4 style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>{cat} Category</h4>
                        <div style={{ fontSize: '32px', fontWeight: 800, color: '#1e293b', margin: '8px 0' }}>{count}</div>
                        <span style={{ fontSize: '11px', color: '#1e3a8a', fontWeight: 600 }}>
                          {students.length > 0 ? Math.round((count / students.length) * 100) : 0}% of Strength
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* REPORT 10: STAFF WARD */}
          {activeView === 'student-report-staffward' && (
            <div>
              <div className="view-header">
                <div>
                  <h2 className="view-title">Staff Ward List</h2>
                  <span className="view-subtitle">Children of school employees and staff</span>
                </div>
              </div>
              <div className="erp-card">
                <div className="table-container">
                  <table className="erp-table">
                    <thead>
                      <tr>
                        <th>Adm No</th>
                        <th>Name</th>
                        <th>Class</th>
                        <th>Father/Mother Name</th>
                        <th>Phone</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.filter(s => s.staffWard === 'Yes').map(s => (
                        <tr key={s.id}>
                          <td>{s.admissionNo}</td>
                          <td><strong>{s.name}</strong></td>
                          <td>{s.class}</td>
                          <td>{s.fatherName}</td>
                          <td>{s.phone}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* REPORT 11: CLASS-WISE STUDENTS LIST */}
          {activeView === 'student-report-classwise' && (
            <div>
              <div className="view-header">
                <div>
                  <h2 className="view-title">Class-wise Students Directory</h2>
                  <span className="view-subtitle">Download printable rosters and rolls sheet class-wise</span>
                </div>
              </div>
              <div className="erp-card">
                <div className="erp-card-body" style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', gap: '15px' }}>
                    <div style={{ width: '220px' }}>
                      <select value={sClass} onChange={e => setSClass(e.target.value)} style={{ width: '100%', height: '32px' }}>
                        <option value="">All Classes</option>
                        <option value="Class 3">Class 3</option>
                        <option value="Class 4">Class 4</option>
                        <option value="Class 5">Class 5</option>
                        <option value="Class 6">Class 6</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="erp-card" style={{ marginTop: '15px' }}>
                <div className="table-container">
                  <table className="erp-table">
                    <thead>
                      <tr>
                        <th>Roll No</th>
                        <th>Adm No</th>
                        <th>Student Name</th>
                        <th>Section</th>
                        <th>Father's Name</th>
                        <th>Phone</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students
                        .filter(s => sClass ? s.class === sClass : true)
                        .map(std => (
                          <tr key={std.id}>
                            <td><strong>{std.rollNo || 'N/A'}</strong></td>
                            <td style={{ fontFamily: 'monospace' }}>{std.admissionNo}</td>
                            <td><strong>{std.name}</strong></td>
                            <td>{std.section}</td>
                            <td>{std.fatherName}</td>
                            <td>{std.phone}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}


        </div>
      </main>

      {/* ID CARD MODAL */}
      {selectedStudent && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
              <button 
                onClick={() => setSelectedStudent(null)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="id-card-layout">
              <div className="id-card-header">
                <h3>DETTROIN ERP</h3>
                <span>Student Identification Card</span>
              </div>
              <div className="id-card-body">
                <div className="id-card-photo-box" style={{ overflow: 'hidden' }}>
                  {selectedStudent.photoUrl ? (
                    <img src={selectedStudent.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    selectedStudent.name.substring(0, 2).toUpperCase()
                  )}
                </div>
                <div className="id-card-details">
                  <h4>{selectedStudent.name}</h4>
                  <div className="id-card-detail-row">
                    <strong>ID:</strong> {selectedStudent.id}
                  </div>
                  <div className="id-card-details-row id-card-detail-row">
                    <strong>Class:</strong> {selectedStudent.class} ({selectedStudent.section})
                  </div>
                  <div className="id-card-detail-row">
                    <strong>Blood:</strong> {selectedStudent.blood}
                  </div>
                  <div className="id-card-detail-row">
                    <strong>Father:</strong> {selectedStudent.fatherName}
                  </div>
                  <div className="id-card-detail-row">
                    <strong>Phone:</strong> {selectedStudent.phone}
                  </div>
                </div>
              </div>
              <div className="id-card-footer">
                ACADEMIC SESSION: 2026 - 2027
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button 
                className="erp-btn btn-primary" 
                style={{ flex: 1 }} 
                onClick={() => {
                  window.print();
                  setSelectedStudent(null);
                }}
              >
                <Printer size={12} style={{ marginRight: '4px' }} /> Print ID
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST CONTAINER */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            {toast.type === 'success' ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
            <div>
              <strong>{toast.title}</strong>
              <div style={{ fontSize: '10.5px', opacity: 0.9 }}>{toast.message}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
