import React, { useState, useEffect } from 'react';
import { libraryService } from './services/libraryService';
import { 
  Search, BookOpen, Check, Trash2, ShieldCheck, 
  MapPin, Users, Award, ShieldAlert, DollarSign, CreditCard,
  PlusCircle, RefreshCw, Calendar, Clock, BookOpen as BookIcon, CheckCircle
} from 'lucide-react';

// --- TYPES ---
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
  status: string;
  blood: string;
  category: string;
  caste: string;
  house: string;
  aadhar: string;
  photoUrl?: string;
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

interface FeeRecord {
  id: number;
  class: string;
  section: string;
  type: string;
  amount: number;
  due: string;
  status: 'Paid' | 'Pending' | 'Overdue';
}

interface IssuedBook {
  id: string;
  studentName: string;
  bookTitle: string;
  issueDate: string;
  dueDate: string;
  status: 'Issued' | 'Returned' | 'Overdue';
  fine: number;
}

interface HostelBill {
  id: string;
  studentName: string;
  roomNumber: string;
  amount: number;
  status: 'Paid' | 'Pending';
  dueDate: string;
}

// ==========================================
// 1. LIBRARY VIEW (ADVANCED)
// ==========================================
export function LibraryView({ 
  books, 
  setBooks,
  students
}: { 
  books: Book[], 
  setBooks: React.Dispatch<React.SetStateAction<Book[]>>,
  students: { name: string }[]
}) {
  const [search, setSearch] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newIsbn, setNewIsbn] = useState('');
  const [newQty, setNewQty] = useState(5);
  const [newCat, setNewCat] = useState('Computer Science');

  // Issue Book State
  const [issueStudent, setIssueStudent] = useState('');
  const [issueBookId, setIssueBookId] = useState('');
  const [issueDueDate, setIssueDueDate] = useState('');
  const [issuedHistory, setIssuedHistory] = useState<IssuedBook[]>([
    { id: "ISS-901", studentName: "Aarav Sharma", bookTitle: "Concepts of Physics", issueDate: "2026-06-15", dueDate: "2026-06-30", status: "Returned", fine: 0 },
    { id: "ISS-902", studentName: "Priya Das", bookTitle: "A Brief History of Time", issueDate: "2026-06-20", dueDate: "2026-07-01", status: "Overdue", fine: 60 },
    { id: "ISS-903", studentName: "Rohan Ghosh", bookTitle: "Introduction to Algorithms", issueDate: "2026-07-02", dueDate: "2026-07-16", status: "Issued", fine: 0 }
  ]);

  useEffect(() => {
    libraryService.getBooks()
      .then(res => {
        const rawList = Array.isArray(res) ? res : (res?.data || res?.results || []);
        if (rawList && rawList.length > 0) {
          const mapped: Book[] = rawList.map((item: any, idx: number) => ({
            id: item.id || `b-${idx}`,
            title: item.title || 'Book',
            isbn: item.isbn || '123456789',
            author: item.author || 'Author',
            quantity: item.quantity || 5,
            available: item.available_quantity || 5,
            category: item.category_name || item.category || 'General'
          }));
          setBooks(mapped);
        }
      })
      .catch(err => console.log('Library service fetch info:', err?.message));
  }, []);

  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(search.toLowerCase()) || 
    b.author.toLowerCase().includes(search.toLowerCase()) || 
    b.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newAuthor || !newIsbn) return;
    const newBook: Book = {
      id: `BK-${100 + books.length + 1}`,
      title: newTitle,
      author: newAuthor,
      isbn: newIsbn,
      quantity: Number(newQty),
      available: Number(newQty),
      category: newCat
    };
    setBooks(prev => [...prev, newBook]);
    setNewTitle('');
    setNewAuthor('');
    setNewIsbn('');
  };

  const handleIssueBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueStudent || !issueBookId || !issueDueDate) return;
    
    const targetBook = books.find(b => b.id === issueBookId);
    if (!targetBook || targetBook.available <= 0) {
      alert("Book not available in catalog!");
      return;
    }

    // Decrement available count
    setBooks(prev => prev.map(b => b.id === issueBookId ? { ...b, available: b.available - 1 } : b));

    const newIssueRecord: IssuedBook = {
      id: `ISS-${900 + issuedHistory.length + 1}`,
      studentName: issueStudent,
      bookTitle: targetBook.title,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: issueDueDate,
      status: 'Issued',
      fine: 0
    };

    setIssuedHistory(prev => [newIssueRecord, ...prev]);
    setIssueStudent('');
    setIssueBookId('');
    setIssueDueDate('');
  };

  const handleReturnBook = (recordId: string, bookTitle: string) => {
    setIssuedHistory(prev => prev.map(rec => rec.id === recordId ? { ...rec, status: 'Returned' as const } : rec));
    setBooks(prev => prev.map(b => b.title === bookTitle ? { ...b, available: b.available + 1 } : b));
  };

  return (
    <div>
      <div className="view-header">
        <div>
          <h2 className="view-title">Library Operations Center</h2>
          <span className="view-subtitle">Manage catalog, check out books to students, and track overdue logs</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '20px', alignItems: 'start', marginBottom: '20px' }}>
        {/* ISSUE BOOK FORM */}
        <div className="erp-card">
          <div className="erp-card-header" style={{ backgroundColor: '#eff6ff' }}>
            <span className="erp-card-title" style={{ color: '#1e3a8a' }}>Issue Book to Student</span>
          </div>
          <form className="erp-card-body" onSubmit={handleIssueBookSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="form-group">
              <label className="form-label">Select Student</label>
              <select className="erp-input" value={issueStudent} onChange={e => setIssueStudent(e.target.value)} required>
                <option value="">-- Select Student --</option>
                {students.map((st, i) => (
                  <option key={i} value={st.name}>{st.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Select Book Title</label>
              <select className="erp-input" value={issueBookId} onChange={e => setIssueBookId(e.target.value)} required>
                <option value="">-- Select Book --</option>
                {books.map(b => (
                  <option key={b.id} value={b.id} disabled={b.available <= 0}>
                    {b.title} (Available: {b.available})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input type="date" className="erp-input" value={issueDueDate} onChange={e => setIssueDueDate(e.target.value)} required />
            </div>
            <button type="submit" className="erp-btn btn-primary" style={{ marginTop: '8px' }}>
              <BookOpen size={14} style={{ marginRight: '4px' }} /> Issue Book
            </button>
          </form>
        </div>

        {/* BOOK LIST CARD */}
        <div className="erp-card">
          <div className="erp-card-header">
            <span className="erp-card-title">Book Catalog Stock</span>
          </div>
          <div className="api-sidebar-search" style={{ border: 'none', padding: '12px 16px' }}>
            <Search size={14} style={{ position: 'absolute', left: '26px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input 
              type="text" 
              placeholder="Search by Title, Author, or Category..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              className="api-search-input"
              style={{ width: '100%' }}
            />
          </div>
          <div className="table-container" style={{ maxHeight: '250px' }}>
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Title & Author</th>
                  <th>ISBN</th>
                  <th>Category</th>
                  <th>Stock Available</th>
                </tr>
              </thead>
              <tbody>
                {filteredBooks.map(b => (
                  <tr key={b.id}>
                    <td>
                      <div><strong>{b.title}</strong></div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>By {b.author}</div>
                    </td>
                    <td style={{ fontFamily: 'monospace' }}>{b.isbn}</td>
                    <td>{b.category}</td>
                    <td>
                      <strong style={{ color: b.available > 0 ? '#16a34a' : '#ef4444' }}>
                        {b.available} / {b.quantity}
                      </strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* STUDENT BOOK HISTORY */}
      <div className="erp-card">
        <div className="erp-card-header">
          <span className="erp-card-title">Student Library Transaction Logs</span>
        </div>
        <div className="table-container">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Record ID</th>
                <th>Student</th>
                <th>Book Title</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Fine Accrued</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {issuedHistory.map(rec => (
                <tr key={rec.id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{rec.id}</td>
                  <td><strong>{rec.studentName}</strong></td>
                  <td>{rec.bookTitle}</td>
                  <td>{rec.issueDate}</td>
                  <td>{rec.dueDate}</td>
                  <td>
                    <span className={`erp-badge ${
                      rec.status === 'Returned' ? 'badge-approved' : rec.status === 'Overdue' ? 'badge-rejected' : 'badge-pending'
                    }`}>
                      {rec.status}
                    </span>
                  </td>
                  <td>
                    <strong style={{ color: rec.fine > 0 ? '#ef4444' : '#16a34a' }}>
                      {rec.fine > 0 ? `₹${rec.fine}` : 'Nil'}
                    </strong>
                  </td>
                  <td>
                    {rec.status !== 'Returned' && (
                      <button 
                        onClick={() => handleReturnBook(rec.id, rec.bookTitle)}
                        className="erp-btn btn-outline" 
                        style={{ height: '24px', padding: '0 8px', fontSize: '10.5px', color: '#16a34a', borderColor: '#16a34a' }}
                      >
                        Mark Returned
                      </button>
                    )}
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

// ==========================================
// 2. HOSTEL VIEW (ADVANCED WITH BILLS)
// ==========================================
export function HostelView({ 
  hostelRooms, 
  setHostelRooms,
  students 
}: { 
  hostelRooms: HostelRoom[], 
  setHostelRooms: React.Dispatch<React.SetStateAction<HostelRoom[]>>,
  students: { name: string }[]
}) {
  const [selectedRoom, setSelectedRoom] = useState<HostelRoom | null>(null);
  const [allocatingStudent, setAllocatingStudent] = useState('');
  
  // Hostel Billing State
  const [hostelBills, setHostelBills] = useState<HostelBill[]>([
    { id: "HB-001", studentName: "Aarav Sharma", roomNumber: "101", amount: 6000, status: "Paid", dueDate: "2026-07-05" },
    { id: "HB-002", studentName: "Rohan Ghosh", roomNumber: "101", amount: 6000, status: "Pending", dueDate: "2026-07-05" },
    { id: "HB-003", studentName: "Priya Das", roomNumber: "201", amount: 6000, status: "Paid", dueDate: "2026-07-05" }
  ]);

  const handleAllocate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom || !allocatingStudent) return;
    if (selectedRoom.occupied >= selectedRoom.capacity) {
      alert("Room is already full!");
      return;
    }

    setHostelRooms(prev => prev.map(r => {
      if (r.id === selectedRoom.id) {
        return {
          ...r,
          occupied: r.occupied + 1,
          students: [...r.students, allocatingStudent]
        };
      }
      return r;
    }));

    // Auto generate a pending hostel fee bill
    const newBill: HostelBill = {
      id: `HB-00${hostelBills.length + 1}`,
      studentName: allocatingStudent,
      roomNumber: selectedRoom.roomNumber,
      amount: 6000,
      status: 'Pending',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days due
    };
    setHostelBills(prev => [newBill, ...prev]);

    setAllocatingStudent('');
    setSelectedRoom(null);
  };

  const handlePayHostelBill = (billId: string) => {
    setHostelBills(prev => prev.map(b => b.id === billId ? { ...b, status: 'Paid' } : b));
  };

  return (
    <div>
      <div className="view-header">
        <div>
          <h2 className="view-title">Hostel Warden & Billing Dashboard</h2>
          <span className="view-subtitle">Monitor hostel room occupancy grids, student rooms allocation, and collect monthly hostel bills</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.3fr', gap: '20px', alignItems: 'start', marginBottom: '20px' }}>
        {/* ROOM OCCUPANCY GRID */}
        <div className="erp-card">
          <div className="erp-card-header">
            <span className="erp-card-title">Room Occupancy & Block Status</span>
          </div>
          <div className="erp-card-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
            {hostelRooms.map(room => {
              const isFull = room.occupied >= room.capacity;
              return (
                <div 
                  key={room.id}
                  className="metric-box"
                  onClick={() => setSelectedRoom(room)}
                  style={{ 
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: isFull ? '#fecaca' : '#bbf7d0',
                    background: isFull ? 'linear-gradient(135deg, #fef2f2 0%, #ffffff 100%)' : 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)'
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '15px' }}>Room {room.roomNumber}</strong>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{room.block}</div>
                    <div style={{ marginTop: '8px', fontSize: '12px' }}>
                      Occupied: <strong>{room.occupied} / {room.capacity}</strong>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'flex-end' }}>
                    <span className={`erp-badge ${isFull ? 'badge-rejected' : 'badge-approved'}`} style={{ fontSize: '10px' }}>
                      {isFull ? 'Full' : 'Vacant'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* DETAILS & ALLOCATION PANEL */}
        <div className="erp-card">
          {selectedRoom ? (
            <div>
              <div className="erp-card-header" style={{ backgroundColor: '#f0fdf4' }}>
                <span className="erp-card-title">Allocation: Room {selectedRoom.roomNumber}</span>
              </div>
              <div className="erp-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                  <div style={{ fontSize: '11.5px', textTransform: 'uppercase', fontWeight: 700, color: '#64748b' }}>Current Residents:</div>
                  {selectedRoom.students.length > 0 ? (
                    <ul style={{ paddingLeft: '16px', marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {selectedRoom.students.map((st, i) => (
                        <li key={i} style={{ fontWeight: 600 }}>{st}</li>
                      ))}
                    </ul>
                  ) : (
                    <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '6px' }}>No residents allocated yet.</div>
                  )}
                </div>

                {selectedRoom.occupied < selectedRoom.capacity && (
                  <form onSubmit={handleAllocate} style={{ borderTop: '1px solid #e2e8f0', paddingTop: '15px' }}>
                    <div className="form-group">
                      <label className="form-label">Allocate Student</label>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                        <select 
                          className="erp-input"
                          value={allocatingStudent}
                          onChange={e => setAllocatingStudent(e.target.value)}
                          required
                          style={{ flex: 1 }}
                        >
                          <option value="">-- Select Student --</option>
                          {students.map((st, i) => (
                            <option key={i} value={st.name}>{st.name}</option>
                          ))}
                        </select>
                        <button type="submit" className="erp-btn btn-primary" style={{ height: '38px' }}>Allocate</button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </div>
          ) : (
            <div className="api-no-selection" style={{ padding: '40px' }}>
              <Award size={28} style={{ color: '#94a3b8', marginBottom: '8px' }} />
              <span>Select a room from the block occupancy grid to allocate students or check current residents.</span>
            </div>
          )}
        </div>
      </div>

      {/* HOSTEL BILLING LEDGER */}
      <div className="erp-card">
        <div className="erp-card-header">
          <span className="erp-card-title">Hostel Lodging Monthly Invoices</span>
        </div>
        <div className="table-container">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Invoice ID</th>
                <th>Student</th>
                <th>Room</th>
                <th>Due Date</th>
                <th>Hostel Dues</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {hostelBills.map(bill => (
                <tr key={bill.id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{bill.id}</td>
                  <td><strong>{bill.studentName}</strong></td>
                  <td>Room {bill.roomNumber}</td>
                  <td>{bill.dueDate}</td>
                  <td><strong>₹{bill.amount}</strong></td>
                  <td>
                    <span className={`erp-badge ${bill.status === 'Paid' ? 'badge-approved' : 'badge-pending'}`}>
                      {bill.status}
                    </span>
                  </td>
                  <td>
                    {bill.status !== 'Paid' && (
                      <button 
                        onClick={() => handlePayHostelBill(bill.id)}
                        className="erp-btn btn-outline" 
                        style={{ height: '24px', padding: '0 8px', fontSize: '10.5px', color: '#16a34a', borderColor: '#16a34a' }}
                      >
                        Collect Fee
                      </button>
                    )}
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

// ==========================================
// 3. TRANSPORT VIEW
// ==========================================
export function TransportView({ 
  transportRoutes, 
  setTransportRoutes, 
  students, 
  setStudents 
}: { 
  transportRoutes: TransportRoute[];
  setTransportRoutes: React.Dispatch<React.SetStateAction<TransportRoute[]>>;
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
}) {
  const [routeName, setRouteName] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [stopsText, setStopsText] = useState('');

  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedRoute, setSelectedRoute] = useState('');

  const handleCreateRoute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!routeName || !vehicleNumber || !driverName) return;

    const newRoute: TransportRoute = {
      id: `RT-${Math.floor(10 + Math.random() * 90)}`,
      routeName,
      vehicleNumber,
      driverName,
      driverPhone: driverPhone || '+91 XXXXX XXXXX',
      stops: stopsText ? stopsText.split(',').map(s => s.trim()) : [],
      studentCount: 0
    };

    setTransportRoutes(prev => [...prev, newRoute]);
    setRouteName('');
    setVehicleNumber('');
    setDriverName('');
    setDriverPhone('');
    setStopsText('');
  };

  const handleAssignStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !selectedRoute) return;

    // Update students state
    setStudents(prev => prev.map(st => st.name === selectedStudent ? { ...st, bus_route: selectedRoute } : st));

    // Update transportRoutes state studentCount
    setTransportRoutes(prev => prev.map(rt => rt.routeName === selectedRoute ? { ...rt, studentCount: rt.studentCount + 1 } : rt));

    alert(`Successfully assigned ${selectedStudent} to ${selectedRoute}!`);
    setSelectedStudent('');
    setSelectedRoute('');
  };

  const handleDeleteRoute = (id: string) => {
    setTransportRoutes(prev => prev.filter(rt => rt.id !== id));
  };

  return (
    <div>
      <div className="view-header">
        <div>
          <h2 className="view-title">Transport Fleet & Routes</h2>
          <span className="view-subtitle">Track pickup stop mapping, driver registers, and assign student routes</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '20px', alignItems: 'start', marginBottom: '20px' }}>
        {/* ADD ROUTE FORM */}
        <div className="erp-card">
          <div className="erp-card-header" style={{ backgroundColor: '#eff6ff' }}>
            <span className="erp-card-title" style={{ color: '#1e3a8a' }}>Add New Fleet Route</span>
          </div>
          <form className="erp-card-body" onSubmit={handleCreateRoute} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="form-group">
              <label className="form-label">Route Name</label>
              <input type="text" className="erp-input" value={routeName} onChange={e => setRouteName(e.target.value)} placeholder="e.g. Sector 62 Loop" required />
            </div>
            <div className="form-group">
              <label className="form-label">Vehicle Number</label>
              <input type="text" className="erp-input" value={vehicleNumber} onChange={e => setVehicleNumber(e.target.value)} placeholder="e.g. DL-1P-1234" required />
            </div>
            <div className="form-group">
              <label className="form-label">Driver Name</label>
              <input type="text" className="erp-input" value={driverName} onChange={e => setDriverName(e.target.value)} placeholder="e.g. Ramesh Kumar" required />
            </div>
            <div className="form-group">
              <label className="form-label">Driver Phone</label>
              <input type="text" className="erp-input" value={driverPhone} onChange={e => setDriverPhone(e.target.value)} placeholder="e.g. +91 99999 88888" />
            </div>
            <div className="form-group">
              <label className="form-label">Route Stops (Comma-separated)</label>
              <input type="text" className="erp-input" value={stopsText} onChange={e => setStopsText(e.target.value)} placeholder="e.g. Metro, Crossing, Stadium" />
            </div>
            <button type="submit" className="erp-btn btn-primary" style={{ marginTop: '8px' }}>
              <PlusCircle size={14} style={{ marginRight: '4px' }} /> Create Route
            </button>
          </form>
        </div>

        {/* ASSIGN STUDENT FORM */}
        <div className="erp-card">
          <div className="erp-card-header" style={{ backgroundColor: '#faf5ff' }}>
            <span className="erp-card-title" style={{ color: '#6b21a8' }}>Assign Student Bus Route</span>
          </div>
          <form className="erp-card-body" onSubmit={handleAssignStudent} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="form-group">
              <label className="form-label">Select Student</label>
              <select className="erp-input" value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)} required>
                <option value="">-- Choose Student --</option>
                {students.map((st, i) => (
                  <option key={i} value={st.name}>{st.name} ({st.class})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Select Bus Route</label>
              <select className="erp-input" value={selectedRoute} onChange={e => setSelectedRoute(e.target.value)} required>
                <option value="">-- Choose Route --</option>
                {transportRoutes.map(rt => (
                  <option key={rt.id} value={rt.routeName}>{rt.routeName} ({rt.vehicleNumber})</option>
                ))}
              </select>
            </div>
            <button type="submit" className="erp-btn btn-primary" style={{ backgroundColor: '#7c3aed', borderColor: '#7c3aed', marginTop: '8px' }}>
              <Users size={14} style={{ marginRight: '4px' }} /> Assign Route Pass
            </button>
          </form>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '20px', alignItems: 'start' }}>
        {/* ROUTES LIST */}
        <div className="erp-card">
          <div className="erp-card-header">
            <span className="erp-card-title">Active Fleet Routes</span>
          </div>
          <div className="table-container">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Route Name</th>
                  <th>Vehicle Info</th>
                  <th>Stops Mapped</th>
                  <th>Students</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {transportRoutes.map(rt => (
                  <tr key={rt.id}>
                    <td>
                      <strong>{rt.routeName}</strong>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Route ID: {rt.id}</div>
                    </td>
                    <td>
                      <div><strong>{rt.vehicleNumber}</strong></div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Driver: {rt.driverName}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {rt.stops.map((stop, i) => (
                          <span key={i} className="erp-badge badge-pending" style={{ backgroundColor: '#f1f5f9', color: '#334155', fontSize: '10px' }}>
                            {stop}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td><strong>{rt.studentCount} Students</strong></td>
                    <td>
                      <button 
                        onClick={() => handleDeleteRoute(rt.id)} 
                        className="erp-btn btn-outline" 
                        style={{ height: '24px', padding: '0 8px', fontSize: '10px', color: '#ef4444', borderColor: '#fee2e2' }}
                      >
                        <Trash2 size={11} /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* DRIVERS LEDGER */}
        <div className="erp-card">
          <div className="erp-card-header">
            <span className="erp-card-title">Driver & Vehicle Logs</span>
          </div>
          <div className="erp-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {transportRoutes.map(rt => (
              <div key={rt.id} style={{ display: 'flex', gap: '12px', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#0ea5e9', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                  {rt.driverName.substring(0, 1)}
                </div>
                <div style={{ flex: 1 }}>
                  <strong>{rt.driverName}</strong>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Phone: {rt.driverPhone}</div>
                  <div style={{ fontSize: '11px', color: '#0369a1', fontWeight: 600, marginTop: '4px' }}>Assigned: {rt.vehicleNumber}</div>
                </div>
                <div>
                  <span className="erp-badge badge-approved">Duty Active</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 4. ACCOUNTS VIEW
// ==========================================
export function AccountsView({ feeRecords }: { feeRecords: FeeRecord[] }) {
  const totalAmount = feeRecords.reduce((sum, f) => sum + f.amount, 0);
  const paidAmount = feeRecords.filter(f => f.status === 'Paid').reduce((sum, f) => sum + f.amount, 0);
  const pendingAmount = feeRecords.filter(f => f.status !== 'Paid').reduce((sum, f) => sum + f.amount, 0);

  return (
    <div>
      <div className="view-header">
        <div>
          <h2 className="view-title">Financial Accounts Console</h2>
          <span className="view-subtitle">Monitor fee transaction ledgers, cash flows, and collection progress</span>
        </div>
      </div>

      {/* METRICS SUMMARY */}
      <div className="metrics-row" style={{ marginBottom: '20px' }}>
        <div className="metric-box" style={{ backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }}>
          <div>
            <div className="metric-value" style={{ color: '#1e3a8a' }}>₹{totalAmount.toLocaleString()}</div>
            <div className="metric-label">Total Outstanding Dues</div>
          </div>
          <div style={{ backgroundColor: '#3b82f6', padding: '8px', borderRadius: '6px', color: '#ffffff' }}>
            <DollarSign size={18} />
          </div>
        </div>
        <div className="metric-box" style={{ backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}>
          <div>
            <div className="metric-value" style={{ color: '#15803d' }}>₹{paidAmount.toLocaleString()}</div>
            <div className="metric-label">Total Fees Collected</div>
          </div>
          <div style={{ backgroundColor: '#10b981', padding: '8px', borderRadius: '6px', color: '#ffffff' }}>
            <Check size={18} />
          </div>
        </div>
        <div className="metric-box" style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca' }}>
          <div>
            <div className="metric-value" style={{ color: '#991b1b' }}>₹{pendingAmount.toLocaleString()}</div>
            <div className="metric-label">Unpaid Dues Balance</div>
          </div>
          <div style={{ backgroundColor: '#ef4444', padding: '8px', borderRadius: '6px', color: '#ffffff' }}>
            <RefreshCw size={18} />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '20px', alignItems: 'start' }}>
        {/* TRANSACTIONS TABLE */}
        <div className="erp-card">
          <div className="erp-card-header">
            <span className="erp-card-title">Fee Instalment Ledger</span>
          </div>
          <div className="table-container">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Class/Section</th>
                  <th>Fee Type</th>
                  <th>Due Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {feeRecords.map(f => (
                  <tr key={f.id}>
                    <td><strong>{f.class}</strong> ({f.section})</td>
                    <td>{f.type} Installment</td>
                    <td>{f.due}</td>
                    <td><strong>₹{f.amount}</strong></td>
                    <td>
                      <span className={`erp-badge ${f.status === 'Paid' ? 'badge-approved' : f.status === 'Pending' ? 'badge-pending' : 'badge-rejected'}`}>
                        {f.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* BANKING SETTINGS */}
        <div className="erp-card">
          <div className="erp-card-header">
            <span className="erp-card-title">Active Gateway Accounts</span>
          </div>
          <div className="erp-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ border: '1px solid #e2e8f0', padding: '12px', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong>State Bank of India (Primary)</strong>
                <span className="erp-badge badge-approved">Online</span>
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Acc No: ********8901</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>IFSC Code: SBIN0001092</div>
            </div>

            <div style={{ border: '1px solid #e2e8f0', padding: '12px', borderRadius: '8px', opacity: 0.6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong>HDFC Bank Ledger (Secondary)</strong>
                <span className="erp-badge badge-pending">Offline</span>
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Acc No: ********2231</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>IFSC Code: HDFC0000889</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 5. PERMISSIONS VIEW
// ==========================================
export function PermissionsView({ 
  rolePermissions, 
  setRolePermissions 
}: { 
  rolePermissions: Record<string, string[]>, 
  setRolePermissions: React.Dispatch<React.SetStateAction<Record<string, string[]>>> 
}) {
  const roles = Object.keys(rolePermissions).filter(r => r !== 'Admin'); // Admin cannot be edited
  const modules = [
    { key: 'dashboard', label: 'Access Dashboard' },
    { key: 'students', label: 'View Student List' },
    { key: 'admission', label: 'Make Admissions' },
    { key: 'reports', label: 'View Student Reports' },
    { key: 'fees', label: 'View Fee Structure' },
    { key: 'accounts', label: 'Financial Accounts Access' },
    { key: 'library', label: 'Library Catalog Access' },
    { key: 'hostel', label: 'Hostel Allocation Access' },
    { key: 'transport', label: 'Transport Fleet Access' },
    { key: 'teacher', label: 'View Teacher Directory' }
  ];

  const handleToggle = (role: string, moduleKey: string) => {
    setRolePermissions(prev => {
      const currentPerms = prev[role] || [];
      const updatedPerms = currentPerms.includes(moduleKey)
        ? currentPerms.filter(p => p !== moduleKey)
        : [...currentPerms, moduleKey];

      return {
        ...prev,
        [role]: updatedPerms
      };
    });
  };

  return (
    <div>
      <div className="view-header">
        <div>
          <h2 className="view-title">Config Role Permissions Matrix</h2>
          <span className="view-subtitle">SuperAdmin console to assign tab and action access permissions to sub-roles</span>
        </div>
      </div>

      <div className="erp-card">
        <div className="erp-card-header" style={{ backgroundColor: '#fef2f2' }}>
          <span className="erp-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#991b1b' }}>
            <ShieldAlert size={14} />
            Master Role Matrix Control (Changes apply immediately)
          </span>
        </div>
        <div className="table-container">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Module View / Access Permission</th>
                {roles.map(r => (
                  <th key={r} style={{ textAlign: 'center' }}>{r}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {modules.map(mod => (
                <tr key={mod.key}>
                  <td><strong>{mod.label}</strong></td>
                  {roles.map(role => {
                    const isGranted = rolePermissions[role]?.includes(mod.key);
                    return (
                      <td key={role} style={{ textAlign: 'center' }}>
                        <input 
                          type="checkbox"
                          checked={isGranted}
                          onChange={() => handleToggle(role, mod.key)}
                          style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                        />
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
