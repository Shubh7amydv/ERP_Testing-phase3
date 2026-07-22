import { studentService } from './services/studentService';

export interface Student {
  id: string;
  admissionNo: string;
  name: string;
  class: string;
  section: string;
  gender: string;
  fatherName: string;
  phone: string;
  type: string;
  status: string; // 'Active', 'Inactive', 'Blocked', 'Approved', 'Pending', 'Rejected'
  blood: string;
  category: string;
  caste: string;
  house: string;
  aadhar: string;
  photoUrl?: string;

  // New Fields from Canva Design
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
  staffWard?: string; // 'Yes' | 'No'
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

export interface Book {
  id: string;
  title: string;
  isbn: string;
  author: string;
  quantity: number;
  available: number;
  category: string;
}

export interface HostelRoom {
  id: string;
  block: string;
  roomNumber: string;
  capacity: number;
  occupied: number;
  students: string[];
}

export interface TransportRoute {
  id: string;
  routeName: string;
  vehicleNumber: string;
  driverName: string;
  driverPhone: string;
  stops: string[];
  studentCount: number;
}

export interface FeeRecord {
  id: number;
  class: string;
  section: string;
  type: string;
  amount: number;
  due: string;
  status: 'Paid' | 'Pending' | 'Overdue';
}

export interface School {
  id: string;
  name: string;
  code: string;
  affiliation: string;
  address: string;
}

// Initial Mock Data
const INITIAL_SCHOOLS: School[] = [
  {
    id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb01',
    name: 'Dettroin Global School',
    code: 'DGS',
    affiliation: 'CBSE',
    address: '45 Sector 12, Noida'
  }
];

const INITIAL_STUDENTS: Student[] = [];

const INITIAL_BOOKS: Book[] = [
  { id: 'b1', title: 'Introduction to Algorithms', isbn: '9780262033848', author: 'Cormen', quantity: 5, available: 4, category: 'Computer Science' },
  { id: 'b2', title: 'Concepts of Physics', isbn: '9788177091878', author: 'H.C. Verma', quantity: 10, available: 8, category: 'Physics' },
  { id: 'b3', title: 'Higher Engineering Mathematics', isbn: '9788174091955', author: 'B.S. Grewal', quantity: 8, available: 5, category: 'Mathematics' }
];

const INITIAL_HOSTELS: HostelRoom[] = [
  { id: 'h1', block: 'Block A', roomNumber: '101', capacity: 4, occupied: 2, students: ['Aarav Sharma', 'Rohan Ghosh'] },
  { id: 'h2', block: 'Block A', roomNumber: '102', capacity: 4, occupied: 1, students: ['Vikram Singh'] },
  { id: 'h3', block: 'Block B', roomNumber: '201', capacity: 2, occupied: 1, students: ['Priya Das'] }
];

const INITIAL_TRANSPORT: TransportRoute[] = [
  { id: 't1', routeName: 'Route 12 - Noida Express', vehicleNumber: 'UP-16-AT-1234', driverName: 'Satish Kumar', driverPhone: '9876543210', stops: ['Sector 62', 'Sector 18', 'School'], studentCount: 15 },
  { id: 't2', routeName: 'Route 5 - South Delhi', vehicleNumber: 'DL-3C-BY-5678', driverName: 'Ramesh Singh', driverPhone: '9988776655', stops: ['Lajpat Nagar', 'Kalkaji', 'School'], studentCount: 22 }
];

const INITIAL_FEES: FeeRecord[] = [
  { id: 1, class: 'Class 5', section: 'Section A', type: 'Tuition', amount: 3000, due: '2026-07-15', status: 'Pending' },
  { id: 2, class: 'Class 4', section: 'Section B', type: 'Hostel', amount: 5000, due: '2026-05-15', status: 'Paid' },
  { id: 3, class: 'Class 6', section: 'Section A', type: 'Transport', amount: 1500, due: '2026-07-20', status: 'Pending' }
];

// Helper to get from localStorage or set default
function getLocalStorageItem<T>(key: string, initialValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(initialValue));
      return initialValue;
    }
    return JSON.parse(item);
  } catch (error) {
    console.warn(`Error reading localStorage key "${key}":`, error);
    return initialValue;
  }
}

function setLocalStorageItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Error writing localStorage key "${key}":`, error);
  }
}

// Simulated network delay
const delay = (ms: number = 200) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  // ==========================================
  // 1. SCHOOLS & TENANTS (Onboarding)
  // ==========================================
  async getSchools() {
    await delay();
    return getLocalStorageItem<School[]>('dettroin_schools', INITIAL_SCHOOLS);
  },

  async onboardSchool(school: { name: string, code: string, affiliation: string, address: string }) {
    await delay();
    const schools = getLocalStorageItem<School[]>('dettroin_schools', INITIAL_SCHOOLS);
    const newSchool: School = {
      id: `sch_${school.code.toLowerCase()}_${Math.floor(100 + Math.random() * 900)}`,
      ...school
    };
    schools.push(newSchool);
    setLocalStorageItem('dettroin_schools', schools);
    return newSchool;
  },

  // ==========================================
  // 2. STUDENTS (Admissions Module)
  // ==========================================
  async getAdmissions(schoolId: string = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb01'): Promise<Student[]> {
    void schoolId;
    try {
      const res = await studentService.getAdmissions({ limit: 100 });
      const rawList = Array.isArray(res) ? res : ((res as any)?.data?.admissions || (res as any)?.data || res?.results || []);
      return rawList.map((item: any) => ({
        id: item.id || item.admission_no,
        admissionNo: item.admission_no || item.id,
        name: item.first_name ? `${item.first_name} ${item.last_name || ''}`.trim() : (item.name || 'Student'),
        class: item.admission_class ? (item.admission_class.startsWith('Class') ? item.admission_class : `Class ${item.admission_class}`) : 'Class 1',
        section: item.section ? (item.section.startsWith('Section') ? item.section : `Section ${item.section}`) : 'Section A',
        gender: item.gender || 'Male',
        fatherName: item.father_name || 'N/A',
        phone: item.phone || 'N/A',
        type: 'New',
        status: item.status || 'Approved',
        blood: item.blood_group || 'O+',
        category: item.category || 'General',
        caste: item.caste || 'Hinduism',
        house: item.house || 'Red House',
        aadhar: item.aadhaar_no || 'N/A',
        pen: item.pen_no || '',
        apaarId: item.apaar_no || '',
        rollNo: item.roll_number || '',
      }));
    } catch (err) {
      console.warn('Backend API connection info:', err);
      return [];
    }
  },

  async createAdmission(schoolId: string, student: any): Promise<Student> {
    void schoolId;
    const apiPayload = {
      first_name: student.name ? student.name.split(' ')[0] : (student.first_name || 'Unknown'),
      last_name: student.name ? student.name.split(' ').slice(1).join(' ') : (student.last_name || ''),
      phone: student.phone || '9999999999',
      address: student.shortAddress || "123 School Lane",
      date_of_birth: student.dob || "2016-01-01",
      gender: student.gender || 'Male',
      blood_group: student.blood || "O+",
      category: student.category || 'General',
      caste: student.caste || 'General',
      religion: student.religion || "Hinduism",
      aadhaar_no: student.aadhar || "123456789012",
      father_name: student.fatherName || 'Father',
      father_occupation: student.fatherOccupation || "Business",
      mother_name: student.motherName || "Mother Name",
      admission_class: (student.class || '4').replace('Class ', ''),
      section: (student.section || 'A').replace('Section ', ''),
      roll_number: student.rollNo || "1",
      house: student.house || "Red",
      bus_route: "Route-1",
      medium: "English",
      date_of_admission: student.dateOfAdmission || new Date().toISOString().split('T')[0],
      status: "Approved"
    };

    const res = await studentService.createAdmission(apiPayload);
    const item = res as any;
    return {
      id: item.id || item.admission_no,
      admissionNo: item.admission_no || item.id,
      name: item.first_name ? `${item.first_name} ${item.last_name || ''}`.trim() : (item.name || 'Student'),
      class: item.admission_class ? (item.admission_class.startsWith('Class') ? item.admission_class : `Class ${item.admission_class}`) : 'Class 1',
      section: item.section ? (item.section.startsWith('Section') ? item.section : `Section ${item.section}`) : 'Section A',
      gender: item.gender || 'Male',
      fatherName: item.father_name || 'N/A',
      phone: item.phone || 'N/A',
      type: 'New',
      status: item.status || 'Approved',
      blood: item.blood_group || 'O+',
      category: item.category || 'General',
      caste: item.caste || 'Hinduism',
      house: item.house || 'Red House',
      aadhar: item.aadhaar_no || 'N/A',
      pen: item.pen_no || '',
      apaarId: item.apaar_no || '',
      rollNo: item.roll_number || '',
    };
  },

  async updateAdmission(id: string, updatedFields: Partial<Student>): Promise<Student> {
    const apiPayload: any = {};
    if (updatedFields.name) {
      apiPayload.first_name = updatedFields.name.split(' ')[0];
      apiPayload.last_name = updatedFields.name.split(' ').slice(1).join(' ') || '';
    }
    if (updatedFields.phone) apiPayload.phone = updatedFields.phone;
    if (updatedFields.status) apiPayload.status = updatedFields.status;
    if (updatedFields.class) apiPayload.admission_class = updatedFields.class.replace('Class ', '');
    if (updatedFields.section) apiPayload.section = updatedFields.section.replace('Section ', '');

    const res = await studentService.partialUpdateAdmission(id, apiPayload);
    const item = res as any;
    return {
      id: item.id || item.admission_no,
      admissionNo: item.admission_no || item.id,
      name: item.first_name ? `${item.first_name} ${item.last_name || ''}`.trim() : (item.name || 'Student'),
      class: item.admission_class ? (item.admission_class.startsWith('Class') ? item.admission_class : `Class ${item.admission_class}`) : 'Class 1',
      section: item.section ? (item.section.startsWith('Section') ? item.section : `Section ${item.section}`) : 'Section A',
      gender: item.gender || 'Male',
      fatherName: item.father_name || 'N/A',
      phone: item.phone || 'N/A',
      type: 'New',
      status: item.status || 'Approved',
      blood: item.blood_group || 'O+',
      category: item.category || 'General',
      caste: item.caste || 'Hinduism',
      house: item.house || 'Red House',
      aadhar: item.aadhaar_no || 'N/A',
      pen: item.pen_no || '',
      apaarId: item.apaar_no || '',
      rollNo: item.roll_number || '',
    };
  },

  async bulkUpdateAdmissions(updates: { id: string, fields: Partial<Student> }[]): Promise<boolean> {
    const formatted = updates.map(u => {
      const payload: any = { id: u.id };
      if (u.fields.name) {
        payload.first_name = u.fields.name.split(' ')[0];
        payload.last_name = u.fields.name.split(' ').slice(1).join(' ') || '';
      }
      if (u.fields.phone) payload.phone = u.fields.phone;
      if (u.fields.status) payload.status = u.fields.status;
      return payload;
    });
    await studentService.bulkUpdateAdmissions(formatted);
    return true;
  },

  async deleteAdmission(id: string) {
    await studentService.deleteAdmission(id);
    return true;
  },

  // ==========================================
  // 3. LIBRARY CATALOG
  // ==========================================
  async getBooks(schoolId: string): Promise<Book[]> {
    void schoolId;
    await delay();
    return getLocalStorageItem<Book[]>('dettroin_books', INITIAL_BOOKS);
  },

  async createBook(schoolId: string, book: Omit<Book, 'id'>): Promise<Book> {
    void schoolId;
    await delay();
    const books = getLocalStorageItem<Book[]>('dettroin_books', INITIAL_BOOKS);
    const newBook: Book = {
      id: `bk_${Math.floor(100 + Math.random() * 900)}`,
      ...book
    };
    books.push(newBook);
    setLocalStorageItem('dettroin_books', books);
    return newBook;
  },

  // ==========================================
  // 4. HOSTELS
  // ==========================================
  async getHostelRooms(schoolId: string): Promise<HostelRoom[]> {
    void schoolId;
    await delay();
    return getLocalStorageItem<HostelRoom[]>('dettroin_hostels', INITIAL_HOSTELS);
  },

  async allocateHostelRoom(roomId: string, studentId: string) {
    await delay();
    const hostels = getLocalStorageItem<HostelRoom[]>('dettroin_hostels', INITIAL_HOSTELS);
    const students = getLocalStorageItem<Student[]>('dettroin_students', INITIAL_STUDENTS);
    const student = students.find(s => s.id === studentId);
    const studentName = student ? student.name : 'Unknown Student';

    const room = hostels.find(r => r.id === roomId);
    if (room) {
      if (room.occupied < room.capacity && !room.students.includes(studentName)) {
        room.students.push(studentName);
        room.occupied = room.students.length;
        setLocalStorageItem('dettroin_hostels', hostels);
      }
    }
    return room;
  },

  // ==========================================
  // 5. TRANSPORT FLEET
  // ==========================================
  async getTransportRoutes(schoolId: string): Promise<TransportRoute[]> {
    void schoolId;
    await delay();
    return getLocalStorageItem<TransportRoute[]>('dettroin_transport', INITIAL_TRANSPORT);
  },

  // ==========================================
  // 6. FINANCIALS (Fees Ledger)
  // ==========================================
  async getFeeRecords(schoolId: string): Promise<FeeRecord[]> {
    void schoolId;
    await delay();
    return getLocalStorageItem<FeeRecord[]>('dettroin_fees', INITIAL_FEES);
  }
};
