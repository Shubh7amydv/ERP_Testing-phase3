// Local Mock Database API client for Dettroin School ERP (Supabase removed)

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

const INITIAL_STUDENTS: Student[] = [
  {
    id: '00000000-0000-4000-a000-000000000001',
    admissionNo: 'ADM-2026-001',
    name: 'Aarav Sharma',
    class: 'Class 5',
    section: 'Section A',
    gender: 'Male',
    fatherName: 'Rajesh Sharma',
    phone: '9875543210',
    type: 'New',
    status: 'Approved',
    blood: 'O+',
    category: 'General',
    caste: 'Hinduism',
    house: 'Red House',
    aadhar: '1234-5678-9012',
    rollNo: '1',
    pen: 'PEN-2026-001',
    apaarId: 'APAAR-789012-001',
    fatherOccupation: 'Business',
    fatherIncome: '650000',
    fatherAadhar: '9999-8888-7777',
    motherName: 'Meena Sharma',
    motherOccupation: 'Homemaker',
    motherIncome: '0',
    motherAadhar: '8888-7777-6666',
    alternatePhone: '9875543211',
    email: 'aarav@gmail.com',
    dateOfAdmission: '2026-04-01',
    shortAddress: 'Noida Sec 12',
    password: 'password123',
    religion: 'Hinduism',
    busDetail: 'Route-1',
    location: 'Noida Sector 62',
    height: '145',
    weight: '40',
    staffWard: 'No',
    sssmid: '123456789'
  },
  {
    id: '00000000-0000-4000-a000-000000000002',
    admissionNo: 'ADM-2026-002',
    name: 'Priya Das',
    class: 'Class 4',
    section: 'Section B',
    gender: 'Female',
    fatherName: 'Sunil Das',
    phone: '9812345678',
    type: 'New',
    status: 'Approved',
    blood: 'A+',
    category: 'General',
    caste: 'Hinduism',
    house: 'Blue House',
    aadhar: '2345-6789-0123',
    rollNo: '2',
    pen: 'PEN-2026-002',
    apaarId: 'APAAR-789012-002',
    fatherOccupation: 'Service',
    fatherIncome: '450000',
    fatherAadhar: '7777-6666-5555',
    motherName: 'Anita Das',
    motherOccupation: 'Teacher',
    motherIncome: '300000',
    motherAadhar: '6666-5555-4444',
    alternatePhone: '9812345679',
    email: 'priya@gmail.com',
    dateOfAdmission: '2026-04-01',
    shortAddress: 'Delhi Green Park',
    password: 'password123',
    religion: 'Hinduism',
    busDetail: 'Route-2',
    location: 'Delhi Green Park',
    height: '135',
    weight: '32',
    staffWard: 'Yes',
    sssmid: '987654321'
  },
  {
    id: '00000000-0000-4000-a000-000000000003',
    admissionNo: 'ADM-2026-003',
    name: 'Rohan Ghosh',
    class: 'Class 6',
    section: 'Section A',
    gender: 'Male',
    fatherName: 'Amit Ghosh',
    phone: '9988776655',
    type: 'Transfer',
    status: 'Pending',
    blood: 'B+',
    category: 'OBC',
    caste: 'Hinduism',
    house: 'Green House',
    aadhar: '3456-7890-1234',
    rollNo: '3',
    pen: 'PEN-2026-003',
    apaarId: 'APAAR-789012-003',
    fatherOccupation: 'Engineer',
    fatherIncome: '900000',
    fatherAadhar: '5555-4444-3333',
    motherName: 'Sunita Ghosh',
    motherOccupation: 'Doctor',
    motherIncome: '1200000',
    motherAadhar: '4444-3333-2222',
    alternatePhone: '9988776656',
    email: 'rohan@gmail.com',
    dateOfAdmission: '2026-04-15',
    shortAddress: 'Kolkata Lake Town',
    password: 'password123',
    religion: 'Hinduism',
    busDetail: 'Route-1',
    location: 'Kolkata Lake Town',
    height: '150',
    weight: '44',
    staffWard: 'No',
    sssmid: '456789123'
  },
  {
    id: '00000000-0000-4000-a000-000000000004',
    admissionNo: 'ADM-2026-004',
    name: 'Sneha Mondal',
    class: 'Class 3',
    section: 'Section B',
    gender: 'Female',
    fatherName: 'Dipak Mondal',
    phone: '9123456789',
    type: 'New',
    status: 'Approved',
    blood: 'AB+',
    category: 'General',
    caste: 'Hinduism',
    house: 'Red House',
    aadhar: '4567-8901-2345',
    rollNo: '4',
    pen: 'PEN-2026-004',
    apaarId: 'APAAR-789012-004',
    fatherOccupation: 'Teacher',
    fatherIncome: '350000',
    fatherAadhar: '3333-2222-1111',
    motherName: 'Rita Mondal',
    motherOccupation: 'Homemaker',
    motherIncome: '0',
    motherAadhar: '2222-1111-0000',
    alternatePhone: '9123456780',
    email: 'sneha@gmail.com',
    dateOfAdmission: '2026-04-01',
    shortAddress: 'Kolkata Park Street',
    password: 'password123',
    religion: 'Hinduism',
    busDetail: 'Route-2',
    location: 'Kolkata Park Street',
    height: '128',
    weight: '28',
    staffWard: 'No',
    sssmid: '789123456'
  },
  {
    id: '00000000-0000-4000-a000-000000000005',
    admissionNo: 'ADM-2026-005',
    name: 'Arjun Paul',
    class: 'Class 5',
    section: 'Section A',
    gender: 'Male',
    fatherName: 'Sanjay Paul',
    phone: '9654321098',
    type: 'Transfer',
    status: 'Rejected',
    blood: 'O-',
    category: 'SC',
    caste: 'Hinduism',
    house: 'Blue House',
    aadhar: '5678-9012-3456',
    rollNo: '5',
    pen: 'PEN-2026-005',
    apaarId: 'APAAR-789012-005',
    fatherOccupation: 'Driver',
    fatherIncome: '180000',
    fatherAadhar: '1111-0000-9999',
    motherName: 'Kavita Paul',
    motherOccupation: 'Homemaker',
    motherIncome: '0',
    motherAadhar: '0000-9999-8888',
    alternatePhone: '9654321099',
    email: 'arjun@gmail.com',
    dateOfAdmission: '2026-04-20',
    shortAddress: 'Gurgaon MG Road',
    password: 'password123',
    religion: 'Hinduism',
    busDetail: 'Route-1',
    location: 'Gurgaon MG Road',
    height: '142',
    weight: '39',
    staffWard: 'No',
    sssmid: '159263487'
  },
  {
    id: '00000000-0000-4000-a000-000000000006',
    admissionNo: 'ADM-2026-006',
    name: 'Ritka Sen',
    class: 'Class 4',
    section: 'Section B',
    gender: 'Female',
    fatherName: 'Bikash Sen',
    phone: '9778543210',
    type: 'Transfer',
    status: 'Pending',
    blood: 'O+',
    category: 'ST',
    caste: 'Hinduism',
    house: 'Green House',
    aadhar: '6789-0123-4567',
    rollNo: '6',
    pen: 'PEN-2026-006',
    apaarId: 'APAAR-789012-006',
    fatherOccupation: 'Farmer',
    fatherIncome: '120000',
    fatherAadhar: '2222-3333-4444',
    motherName: 'Mamata Sen',
    motherOccupation: 'Homemaker',
    motherIncome: '0',
    motherAadhar: '3333-4444-5555',
    alternatePhone: '9778543211',
    email: 'ritka@gmail.com',
    dateOfAdmission: '2026-05-01',
    shortAddress: 'Bhopal Station Rd',
    password: 'password123',
    religion: 'Hinduism',
    busDetail: 'Route-2',
    location: 'Bhopal Station Rd',
    height: '138',
    weight: '31',
    staffWard: 'No',
    sssmid: '258369147'
  },
  {
    id: '00000000-0000-4000-a000-000000000007',
    admissionNo: 'ADM-2026-007',
    name: 'Vikram Singh',
    class: 'Class 5',
    section: 'Section B',
    gender: 'Male',
    fatherName: 'Harpreet Singh',
    phone: '9911223344',
    type: 'New',
    status: 'Approved',
    blood: 'A+',
    category: 'General',
    caste: 'Sikhism',
    house: 'Yellow House',
    aadhar: '7890-1234-5678',
    rollNo: '7',
    pen: 'PEN-2026-007',
    apaarId: 'APAAR-789012-007',
    fatherOccupation: 'Business',
    fatherIncome: '800000',
    fatherAadhar: '4444-5555-6666',
    motherName: 'Gurleen Kaur',
    motherOccupation: 'Designer',
    motherIncome: '400000',
    motherAadhar: '5555-6666-7777',
    alternatePhone: '9911223345',
    email: 'vikram@gmail.com',
    dateOfAdmission: '2026-04-01',
    shortAddress: 'Amritsar Model Town',
    password: 'password123',
    religion: 'Sikhism',
    busDetail: 'Route-1',
    location: 'Amritsar Model Town',
    height: '148',
    weight: '45',
    staffWard: 'No',
    sssmid: '369147258'
  }
];

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
    await delay();
    const students = getLocalStorageItem<Student[]>('dettroin_students', INITIAL_STUDENTS);
    return students;
  },

  async createAdmission(schoolId: string, student: any): Promise<Student> {
    void schoolId;
    await delay();
    const students = getLocalStorageItem<Student[]>('dettroin_students', INITIAL_STUDENTS);
    const newStudent: Student = {
      id: student.id || `std_${Math.floor(100000 + Math.random() * 900000)}`,
      admissionNo: student.admissionNo || student.admission_no || `ADM-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      name: student.name || `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Unknown Name',
      class: student.class || student.admission_class || 'Class 5',
      section: student.section || 'Section A',
      gender: student.gender || 'Male',
      fatherName: student.fatherName || student.father_name || '',
      phone: student.phone || '',
      type: student.status === 'Approved' ? 'New' : 'Transfer',
      status: student.status || 'Approved',
      blood: student.blood || student.blood_group || 'O+',
      category: student.category || 'General',
      caste: student.caste || 'Hinduism',
      house: student.house || 'None',
      aadhar: student.aadhar || student.aadhaar_no || '',
      photoUrl: student.photoUrl || student.photo_url || undefined,

      // New fields mapping
      pen: student.pen || '',
      apaarId: student.apaarId || '',
      rollNo: student.rollNo || '',
      fatherOccupation: student.fatherOccupation || '',
      fatherIncome: student.fatherIncome || '',
      fatherAadhar: student.fatherAadhar || '',
      motherName: student.motherName || '',
      motherOccupation: student.motherOccupation || '',
      motherIncome: student.motherIncome || '',
      motherAadhar: student.motherAadhar || '',
      alternatePhone: student.alternatePhone || '',
      email: student.email || '',
      dateOfAdmission: student.dateOfAdmission || '',
      shortAddress: student.shortAddress || '',
      password: student.password || 'password123',
      religion: student.religion || 'Hinduism',
      busDetail: student.busDetail || '',
      location: student.location || '',
      height: student.height || '',
      weight: student.weight || '',
      staffWard: student.staffWard || 'No',
      sssmid: student.sssmid || '',
      parentsPhoto: student.parentsPhoto || '',
      penFile: student.penFile || '',
      tcFile: student.tcFile || '',
      marksheetFile: student.marksheetFile || '',
      dobCertificateFile: student.dobCertificateFile || '',
      studentAadharFile: student.studentAadharFile || '',
      fatherAadharFile: student.fatherAadharFile || '',
      motherAadharFile: student.motherAadharFile || ''
    };
    students.unshift(newStudent);
    setLocalStorageItem('dettroin_students', students);
    return newStudent;
  },

  async updateAdmission(id: string, updatedFields: Partial<Student>): Promise<Student> {
    await delay();
    const students = getLocalStorageItem<Student[]>('dettroin_students', INITIAL_STUDENTS);
    const index = students.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Student not found');
    students[index] = { ...students[index], ...updatedFields };
    setLocalStorageItem('dettroin_students', students);
    return students[index];
  },

  async bulkUpdateAdmissions(updates: { id: string, fields: Partial<Student> }[]): Promise<boolean> {
    await delay();
    const students = getLocalStorageItem<Student[]>('dettroin_students', INITIAL_STUDENTS);
    updates.forEach(u => {
      const idx = students.findIndex(s => s.id === u.id);
      if (idx !== -1) {
        students[idx] = { ...students[idx], ...u.fields };
      }
    });
    setLocalStorageItem('dettroin_students', students);
    return true;
  },

  async deleteAdmission(id: string) {
    await delay();
    let students = getLocalStorageItem<Student[]>('dettroin_students', INITIAL_STUDENTS);
    students = students.filter(s => s.id !== id);
    setLocalStorageItem('dettroin_students', students);
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
