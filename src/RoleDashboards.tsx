import React from 'react';
import {
  Users, DollarSign, Award, Clock, UserPlus, Wallet, Ticket, BookOpen,
  FileSpreadsheet, CheckCircle, AlertTriangle, MapPin, CalendarCheck,
  FileText, MessageSquare, Package, ClipboardList, GraduationCap, CreditCard
} from 'lucide-react';

interface RoleDashboardProps {
  activeRole: string;
  students: any[];
  teachers: any[];
  books: any[];
  totalCollectedFormatted: string;
  totalFeesPaidSum: number;
  monthlyFeesPaidSum: number;
  systemLogs: any[];
  getStatusClass: (status: string) => string;
  setActiveView: (view: string) => void;
  setFeeViewTab: (tab: any) => void;
}

export function RoleDashboard({
  activeRole,
  students,
  teachers,
  books,
  totalCollectedFormatted,
  totalFeesPaidSum,
  monthlyFeesPaidSum,
  systemLogs,
  getStatusClass,
  setActiveView,
  setFeeViewTab
}: RoleDashboardProps) {
  if (activeRole === 'Teacher') {
    return (
      <div>
        <div className="view-header">
          <div>
            <h2 className="view-title">Teacher Dashboard</h2>
            <span className="view-subtitle">Monitor class attendance, timetables, and recent student notifications</span>
          </div>
        </div>
        
        <div className="metrics-row" style={{ marginBottom: '20px' }}>
          <div className="metric-box" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)', borderColor: '#bfdbfe' }}>
            <div>
              <div className="metric-value" style={{ color: '#1e3a8a' }}>2</div>
              <div className="metric-label">Assigned Classes</div>
              <span style={{ fontSize: '10px', color: '#2563eb', fontWeight: 700 }}>Class 4-A, Class 5-A</span>
            </div>
            <div style={{ backgroundColor: '#2563eb', padding: '10px', borderRadius: '8px' }}>
              <Users size={20} style={{ color: '#ffffff' }} />
            </div>
          </div>
          <div className="metric-box" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)', borderColor: '#bbf7d0' }}>
            <div>
              <div className="metric-value" style={{ color: '#15803d' }}>95%</div>
              <div className="metric-label">Today's Attendance</div>
              <span style={{ fontSize: '10px', color: '#166534', fontWeight: 700 }}>Marked for Class 5-A</span>
            </div>
            <div style={{ backgroundColor: '#10b981', padding: '10px', borderRadius: '8px' }}>
              <CheckCircle size={20} style={{ color: '#ffffff' }} />
            </div>
          </div>
          <div className="metric-box" style={{ background: 'linear-gradient(135deg, #faf5ff 0%, #ffffff 100%)', borderColor: '#f3e8ff' }}>
            <div>
              <div className="metric-value" style={{ color: '#6b21a8' }}>10:15 AM</div>
              <div className="metric-label">Next Math Class</div>
              <span style={{ fontSize: '10px', color: '#7c3aed', fontWeight: 700 }}>Starts in 25 mins</span>
            </div>
            <div style={{ backgroundColor: '#7c3aed', padding: '10px', borderRadius: '8px' }}>
              <Clock size={20} style={{ color: '#ffffff' }} />
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '20px' }}>
          <div className="erp-card">
            <div className="erp-card-header">
              <span className="erp-card-title">Daily Lecture Schedule</span>
            </div>
            <div className="table-container">
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Class</th>
                    <th>Subject</th>
                    <th>Topic</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>09:00 AM - 10:00 AM</td>
                    <td><strong>Class 4-A</strong></td>
                    <td>Mathematics</td>
                    <td>Intro to Fractions</td>
                  </tr>
                  <tr>
                    <td>10:15 AM - 11:15 AM</td>
                    <td><strong>Class 5-A</strong></td>
                    <td>Algebra</td>
                    <td>Variables & Equations</td>
                  </tr>
                  <tr>
                    <td>11:30 AM - 12:30 PM</td>
                    <td><strong>Class 6-B</strong></td>
                    <td>Geometry</td>
                    <td>Angles and Triangles</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="erp-card">
            <div className="erp-card-header">
              <span className="erp-card-title">Teacher Announcements</span>
            </div>
            <div className="erp-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ padding: '10px', borderLeft: '3px solid #3b82f6', backgroundColor: '#f8fafc' }}>
                <strong>Syllabus Submission</strong>
                <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 0' }}>Please submit your Term 1 syllabus draft to the Principal's office by Friday.</p>
              </div>
              <div style={{ padding: '10px', borderLeft: '3px solid #10b981', backgroundColor: '#f8fafc' }}>
                <strong>Parent-Teacher Meeting</strong>
                <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 0' }}>Scheduled for next Saturday. Prepare individual progress charts.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeRole === 'Librarian') {
    return (
      <div>
        <div className="view-header">
          <div>
            <h2 className="view-title">Librarian Console Dashboard</h2>
            <span className="view-subtitle">Monitor catalog stock, daily checkouts, and overdue items</span>
          </div>
        </div>

        <div className="metrics-row" style={{ marginBottom: '20px' }}>
          <div className="metric-box" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)', borderColor: '#bfdbfe' }}>
            <div>
              <div className="metric-value" style={{ color: '#1e3a8a' }}>{books.length}</div>
              <div className="metric-label">Books Cataloged</div>
              <span style={{ fontSize: '10px', color: '#2563eb', fontWeight: 700 }}>4 unique categories</span>
            </div>
            <div style={{ backgroundColor: '#2563eb', padding: '10px', borderRadius: '8px' }}>
              <BookOpen size={20} style={{ color: '#ffffff' }} />
            </div>
          </div>
          <div className="metric-box" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)', borderColor: '#bbf7d0' }}>
            <div>
              <div className="metric-value" style={{ color: '#15803d' }}>24</div>
              <div className="metric-label">Checked Out</div>
              <span style={{ fontSize: '10px', color: '#166534', fontWeight: 700 }}>Issued to active students</span>
            </div>
            <div style={{ backgroundColor: '#10b981', padding: '10px', borderRadius: '8px' }}>
              <CheckCircle size={20} style={{ color: '#ffffff' }} />
            </div>
          </div>
          <div className="metric-box" style={{ background: 'linear-gradient(135deg, #fef2f2 0%, #ffffff 100%)', borderColor: '#fecaca' }}>
            <div>
              <div className="metric-value" style={{ color: '#991b1b' }}>2</div>
              <div className="metric-label">Overdue Returns</div>
              <span style={{ fontSize: '10px', color: '#ef4444', fontWeight: 700 }}>Fine penalty active</span>
            </div>
            <div style={{ backgroundColor: '#ef4444', padding: '10px', borderRadius: '8px' }}>
              <AlertTriangle size={20} style={{ color: '#ffffff' }} />
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '20px' }}>
          <div className="erp-card">
            <div className="erp-card-header">
              <span className="erp-card-title">Pending Returns Alert</span>
            </div>
            <div className="table-container">
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Book Title</th>
                    <th>Due Date</th>
                    <th>Accrued Fine</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Priya Das</strong></td>
                    <td>A Brief History of Time</td>
                    <td style={{ color: '#ef4444', fontWeight: 600 }}>2026-07-01</td>
                    <td style={{ color: '#ef4444', fontWeight: 700 }}>₹60</td>
                  </tr>
                  <tr>
                    <td><strong>Rajesh Nair</strong></td>
                    <td>Concepts of Physics</td>
                    <td style={{ color: '#ef4444', fontWeight: 600 }}>2026-07-02</td>
                    <td style={{ color: '#ef4444', fontWeight: 700 }}>₹40</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="erp-card">
            <div className="erp-card-header">
              <span className="erp-card-title">Librarian Operations</span>
            </div>
            <div className="erp-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button className="erp-btn btn-primary" onClick={() => setActiveView('library')} style={{ justifyContent: 'center' }}>
                Open Checkout Panel
              </button>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '10px' }}>
                💡 <em>Pro-tip: Set customized fine rates from the master settings console.</em>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeRole === 'Hostel Warden') {
    return (
      <div>
        <div className="view-header">
          <div>
            <h2 className="view-title">Hostel Warden Dashboard</h2>
            <span className="view-subtitle">Manage room occupancy stats and check residential details</span>
          </div>
        </div>

        <div className="metrics-row" style={{ marginBottom: '20px' }}>
          <div className="metric-box" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)', borderColor: '#bfdbfe' }}>
            <div>
              <div className="metric-value" style={{ color: '#1e3a8a' }}>62%</div>
              <div className="metric-label">Occupancy Rate</div>
              <span style={{ fontSize: '10px', color: '#2563eb', fontWeight: 700 }}>Capacity: 16 beds</span>
            </div>
            <div style={{ backgroundColor: '#2563eb', padding: '10px', borderRadius: '8px' }}>
              <Users size={20} style={{ color: '#ffffff' }} />
            </div>
          </div>
          <div className="metric-box" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)', borderColor: '#bbf7d0' }}>
            <div>
              <div className="metric-value" style={{ color: '#15803d' }}>5</div>
              <div className="metric-label">Total Lodgers</div>
              <span style={{ fontSize: '10px', color: '#166534', fontWeight: 700 }}>Hostel Block A & B</span>
            </div>
            <div style={{ backgroundColor: '#10b981', padding: '10px', borderRadius: '8px' }}>
              <CheckCircle size={20} style={{ color: '#ffffff' }} />
            </div>
          </div>
          <div className="metric-box" style={{ background: 'linear-gradient(135deg, #fff7ed 0%, #ffffff 100%)', borderColor: '#ffedd5' }}>
            <div>
              <div className="metric-value" style={{ color: '#c2410c' }}>11</div>
              <div className="metric-label">Vacant Slots</div>
              <span style={{ fontSize: '10px', color: '#ea580c', fontWeight: 700 }}>Ready to allocate</span>
            </div>
            <div style={{ backgroundColor: '#ea580c', padding: '10px', borderRadius: '8px' }}>
              <Award size={20} style={{ color: '#ffffff' }} />
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '20px' }}>
          <div className="erp-card">
            <div className="erp-card-header">
              <span className="erp-card-title">Mess Weekly Schedule Menu</span>
            </div>
            <div className="table-container">
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>Day</th>
                    <th>Breakfast</th>
                    <th>Lunch</th>
                    <th>Dinner</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Monday</td>
                    <td>Poha & Milk</td>
                    <td>Dal Makhani, Rice, Roti</td>
                    <td>Paneer Masala, Roti, Salad</td>
                  </tr>
                  <tr>
                    <td>Tuesday</td>
                    <td>Idli & Sambar</td>
                    <td>Rajma, Rice, Curd</td>
                    <td>Aloo Gobhi, Rice, Dal</td>
                  </tr>
                  <tr>
                    <td>Wednesday</td>
                    <td>Aloo Paratha</td>
                    <td>Chana Masala, Puri, Kheer</td>
                    <td>Mix Vegetable, Roti, Rice</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="erp-card">
            <div className="erp-card-header">
              <span className="erp-card-title">Warden Quick Actions</span>
            </div>
            <div className="erp-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button className="erp-btn btn-primary" onClick={() => setActiveView('hostel')} style={{ justifyContent: 'center' }}>
                Open Room Allocation
              </button>
              <button className="erp-btn btn-outline" onClick={() => setActiveView('gatepass')} style={{ justifyContent: 'center' }}>
                Review Outward Gatepasses
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeRole === 'Transport Manager') {
    return (
      <div>
        <div className="view-header">
          <div>
            <h2 className="view-title">Transport Fleet Dashboard</h2>
            <span className="view-subtitle">Monitor pickup routes, bus capacities, and driver logs</span>
          </div>
        </div>

        <div className="metrics-row" style={{ marginBottom: '20px' }}>
          <div className="metric-box" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)', borderColor: '#bfdbfe' }}>
            <div>
              <div className="metric-value" style={{ color: '#1e3a8a' }}>2</div>
              <div className="metric-label">Active Routes</div>
              <span style={{ fontSize: '10px', color: '#2563eb', fontWeight: 700 }}>Sector 12 & Crossing Republik</span>
            </div>
            <div style={{ backgroundColor: '#2563eb', padding: '10px', borderRadius: '8px' }}>
              <MapPin size={20} style={{ color: '#ffffff' }} />
            </div>
          </div>
          <div className="metric-box" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)', borderColor: '#bbf7d0' }}>
            <div>
              <div className="metric-value" style={{ color: '#15803d' }}>2</div>
              <div className="metric-label">Buses on Road</div>
              <span style={{ fontSize: '10px', color: '#166534', fontWeight: 700 }}>DL-1P-9901, DL-1P-8802</span>
            </div>
            <div style={{ backgroundColor: '#10b981', padding: '10px', borderRadius: '8px' }}>
              <CheckCircle size={20} style={{ color: '#ffffff' }} />
            </div>
          </div>
          <div className="metric-box" style={{ background: 'linear-gradient(135deg, #faf5ff 0%, #ffffff 100%)', borderColor: '#f3e8ff' }}>
            <div>
              <div className="metric-value" style={{ color: '#6b21a8' }}>22</div>
              <div className="metric-label">Registered Students</div>
              <span style={{ fontSize: '10px', color: '#7c3aed', fontWeight: 700 }}>Pickup passes active</span>
            </div>
            <div style={{ backgroundColor: '#7c3aed', padding: '10px', borderRadius: '8px' }}>
              <Users size={20} style={{ color: '#ffffff' }} />
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '20px' }}>
          <div className="erp-card">
            <div className="erp-card-header">
              <span className="erp-card-title">Driver Information Matrix</span>
            </div>
            <div className="table-container">
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>Driver</th>
                    <th>Phone</th>
                    <th>Vehicle</th>
                    <th>Route</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Sukhvinder Singh</strong></td>
                    <td>+91 99128 33281</td>
                    <td>DL-1P-9901</td>
                    <td>Sector 12 Route</td>
                  </tr>
                  <tr>
                    <td><strong>Ram Sharan</strong></td>
                    <td>+91 98822 00121</td>
                    <td>DL-1P-8802</td>
                    <td>Crossing Republik Route</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="erp-card">
            <div className="erp-card-header">
              <span className="erp-card-title">Transport Directory</span>
            </div>
            <div className="erp-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button className="erp-btn btn-primary" onClick={() => setActiveView('transport')} style={{ justifyContent: 'center' }}>
                View Fleet Routes Mappings
              </button>
              <div style={{ padding: '8px', border: '1px dashed #e2e8f0', borderRadius: '6px', fontSize: '11px', color: '#64748b' }}>
                Emergency Hotline: <strong>+91 11-2550189</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeRole === 'Principal' || activeRole === 'Vice Principal') {
    return (
      <div>
        <div className="view-header">
          <div>
            <h2 className="view-title">{activeRole} Dashboard</h2>
            <span className="view-subtitle">Academic oversight, staff monitoring, and institutional performance</span>
          </div>
        </div>

        <div className="metrics-row" style={{ marginBottom: '20px' }}>
          <div className="metric-box" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)', borderColor: '#bfdbfe' }}>
            <div>
              <div className="metric-value" style={{ color: '#1e3a8a' }}>{students.length}</div>
              <div className="metric-label">Total Enrollment</div>
              <span style={{ fontSize: '10px', color: '#2563eb', fontWeight: 700 }}>Current session</span>
            </div>
            <div style={{ backgroundColor: '#2563eb', padding: '10px', borderRadius: '8px' }}>
              <GraduationCap size={20} style={{ color: '#ffffff' }} />
            </div>
          </div>
          <div className="metric-box" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)', borderColor: '#bbf7d0' }}>
            <div>
              <div className="metric-value" style={{ color: '#15803d' }}>{teachers.length}</div>
              <div className="metric-label">Faculty Strength</div>
              <span style={{ fontSize: '10px', color: '#166534', fontWeight: 700 }}>All departments</span>
            </div>
            <div style={{ backgroundColor: '#10b981', padding: '10px', borderRadius: '8px' }}>
              <Users size={20} style={{ color: '#ffffff' }} />
            </div>
          </div>
          <div className="metric-box" style={{ background: 'linear-gradient(135deg, #faf5ff 0%, #ffffff 100%)', borderColor: '#f3e8ff' }}>
            <div>
              <div className="metric-value" style={{ color: '#6b21a8' }}>92%</div>
              <div className="metric-label">Avg Attendance</div>
              <span style={{ fontSize: '10px', color: '#7c3aed', fontWeight: 700 }}>This week</span>
            </div>
            <div style={{ backgroundColor: '#7c3aed', padding: '10px', borderRadius: '8px' }}>
              <CalendarCheck size={20} style={{ color: '#ffffff' }} />
            </div>
          </div>
          <div className="metric-box" style={{ background: 'linear-gradient(135deg, #fff7ed 0%, #ffffff 100%)', borderColor: '#ffedd5' }}>
            <div>
              <div className="metric-value" style={{ color: '#c2410c' }}>₹{totalCollectedFormatted}k</div>
              <div className="metric-label">Fee Collected</div>
              <span style={{ fontSize: '10px', color: '#ea580c', fontWeight: 700 }}>Year to date</span>
            </div>
            <div style={{ backgroundColor: '#ea580c', padding: '10px', borderRadius: '8px' }}>
              <DollarSign size={20} style={{ color: '#ffffff' }} />
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '20px' }}>
          <div className="erp-card">
            <div className="erp-card-header">
              <span className="erp-card-title">Pending Approvals</span>
            </div>
            <div className="table-container">
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Details</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Leave Request</strong></td>
                    <td>Sunita Verma — Casual Leave (Jul 15)</td>
                    <td><span className="erp-badge badge-pending">Pending</span></td>
                  </tr>
                  <tr>
                    <td><strong>Admission</strong></td>
                    <td>Rohan Ghosh — Class 6 Transfer</td>
                    <td><span className="erp-badge badge-pending">Pending</span></td>
                  </tr>
                  <tr>
                    <td><strong>Fee Concession</strong></td>
                    <td>Ritka Sen — 20% scholarship request</td>
                    <td><span className="erp-badge badge-pending">Pending</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="erp-card">
            <div className="erp-card-header">
              <span className="erp-card-title">Quick Actions</span>
            </div>
            <div className="erp-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button className="erp-btn btn-primary" onClick={() => setActiveView('examination')} style={{ justifyContent: 'center' }}>
                <FileText size={14} style={{ marginRight: '6px' }} /> Exam Schedule
              </button>
              <button className="erp-btn btn-outline" onClick={() => setActiveView('attendance')} style={{ justifyContent: 'center' }}>
                <CalendarCheck size={14} style={{ marginRight: '6px' }} /> Attendance Overview
              </button>
              <button className="erp-btn btn-outline" onClick={() => setActiveView('communication')} style={{ justifyContent: 'center' }}>
                <MessageSquare size={14} style={{ marginRight: '6px' }} /> Send Notice
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeRole === 'Class Teacher') {
    return (
      <div>
        <div className="view-header">
          <div>
            <h2 className="view-title">Class Teacher Dashboard</h2>
            <span className="view-subtitle">Manage your assigned class — attendance, reports, and student progress</span>
          </div>
        </div>

        <div className="metrics-row" style={{ marginBottom: '20px' }}>
          <div className="metric-box" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)', borderColor: '#bfdbfe' }}>
            <div>
              <div className="metric-value" style={{ color: '#1e3a8a' }}>32</div>
              <div className="metric-label">Class Strength</div>
              <span style={{ fontSize: '10px', color: '#2563eb', fontWeight: 700 }}>Class 5-A</span>
            </div>
            <div style={{ backgroundColor: '#2563eb', padding: '10px', borderRadius: '8px' }}>
              <Users size={20} style={{ color: '#ffffff' }} />
            </div>
          </div>
          <div className="metric-box" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)', borderColor: '#bbf7d0' }}>
            <div>
              <div className="metric-value" style={{ color: '#15803d' }}>94%</div>
              <div className="metric-label">Today's Attendance</div>
              <span style={{ fontSize: '10px', color: '#166534', fontWeight: 700 }}>30/32 present</span>
            </div>
            <div style={{ backgroundColor: '#10b981', padding: '10px', borderRadius: '8px' }}>
              <CheckCircle size={20} style={{ color: '#ffffff' }} />
            </div>
          </div>
          <div className="metric-box" style={{ background: 'linear-gradient(135deg, #fff7ed 0%, #ffffff 100%)', borderColor: '#ffedd5' }}>
            <div>
              <div className="metric-value" style={{ color: '#c2410c' }}>3</div>
              <div className="metric-label">Pending Gatepasses</div>
              <span style={{ fontSize: '10px', color: '#ea580c', fontWeight: 700 }}>Needs approval</span>
            </div>
            <div style={{ backgroundColor: '#ea580c', padding: '10px', borderRadius: '8px' }}>
              <Ticket size={20} style={{ color: '#ffffff' }} />
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '20px' }}>
          <div className="erp-card">
            <div className="erp-card-header">
              <span className="erp-card-title">Today's Schedule — Class 5-A</span>
            </div>
            <div className="table-container">
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Subject</th>
                    <th>Teacher</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>09:00 - 09:45</td>
                    <td><strong>Mathematics</strong></td>
                    <td>Sunita Verma</td>
                    <td><span className="erp-badge badge-approved">Done</span></td>
                  </tr>
                  <tr>
                    <td>09:45 - 10:30</td>
                    <td><strong>English</strong></td>
                    <td>Gurpreet Kaur</td>
                    <td><span className="erp-badge badge-approved">Done</span></td>
                  </tr>
                  <tr>
                    <td>10:45 - 11:30</td>
                    <td><strong>Science</strong></td>
                    <td>Anand Mishra</td>
                    <td><span className="erp-badge badge-pending">Ongoing</span></td>
                  </tr>
                  <tr>
                    <td>11:30 - 12:15</td>
                    <td><strong>Hindi</strong></td>
                    <td>Rajesh Kulkarni</td>
                    <td><span className="erp-badge badge-pending">Upcoming</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="erp-card">
            <div className="erp-card-header">
              <span className="erp-card-title">Quick Actions</span>
            </div>
            <div className="erp-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button className="erp-btn btn-primary" onClick={() => setActiveView('attendance')} style={{ justifyContent: 'center' }}>
                <CalendarCheck size={14} style={{ marginRight: '6px' }} /> Mark Attendance
              </button>
              <button className="erp-btn btn-outline" onClick={() => setActiveView('gatepass')} style={{ justifyContent: 'center' }}>
                <Ticket size={14} style={{ marginRight: '6px' }} /> Approve Gatepasses
              </button>
              <button className="erp-btn btn-outline" onClick={() => setActiveView('examination')} style={{ justifyContent: 'center' }}>
                <FileText size={14} style={{ marginRight: '6px' }} /> Enter Marks
              </button>
              <button className="erp-btn btn-outline" onClick={() => setActiveView('communication')} style={{ justifyContent: 'center' }}>
                <MessageSquare size={14} style={{ marginRight: '6px' }} /> Send Notice to Parents
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeRole === 'HR Manager') {
    return (
      <div>
        <div className="view-header">
          <div>
            <h2 className="view-title">HR Manager Dashboard</h2>
            <span className="view-subtitle">Staff management, leave tracking, and payroll overview</span>
          </div>
        </div>

        <div className="metrics-row" style={{ marginBottom: '20px' }}>
          <div className="metric-box" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)', borderColor: '#bfdbfe' }}>
            <div>
              <div className="metric-value" style={{ color: '#1e3a8a' }}>8</div>
              <div className="metric-label">Total Staff</div>
              <span style={{ fontSize: '10px', color: '#2563eb', fontWeight: 700 }}>Across all departments</span>
            </div>
            <div style={{ backgroundColor: '#2563eb', padding: '10px', borderRadius: '8px' }}>
              <Users size={20} style={{ color: '#ffffff' }} />
            </div>
          </div>
          <div className="metric-box" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)', borderColor: '#bbf7d0' }}>
            <div>
              <div className="metric-value" style={{ color: '#15803d' }}>7</div>
              <div className="metric-label">Present Today</div>
              <span style={{ fontSize: '10px', color: '#166534', fontWeight: 700 }}>1 on leave</span>
            </div>
            <div style={{ backgroundColor: '#10b981', padding: '10px', borderRadius: '8px' }}>
              <CheckCircle size={20} style={{ color: '#ffffff' }} />
            </div>
          </div>
          <div className="metric-box" style={{ background: 'linear-gradient(135deg, #fff7ed 0%, #ffffff 100%)', borderColor: '#ffedd5' }}>
            <div>
              <div className="metric-value" style={{ color: '#c2410c' }}>2</div>
              <div className="metric-label">Pending Leaves</div>
              <span style={{ fontSize: '10px', color: '#ea580c', fontWeight: 700 }}>Needs approval</span>
            </div>
            <div style={{ backgroundColor: '#f97316', padding: '10px', borderRadius: '8px' }}>
              <Clock size={20} style={{ color: '#ffffff' }} />
            </div>
          </div>
          <div className="metric-box" style={{ background: 'linear-gradient(135deg, #faf5ff 0%, #ffffff 100%)', borderColor: '#f3e8ff' }}>
            <div>
              <div className="metric-value" style={{ color: '#6b21a8' }}>₹2.76L</div>
              <div className="metric-label">Monthly Payroll</div>
              <span style={{ fontSize: '10px', color: '#7c3aed', fontWeight: 700 }}>July processing</span>
            </div>
            <div style={{ backgroundColor: '#7c3aed', padding: '10px', borderRadius: '8px' }}>
              <DollarSign size={20} style={{ color: '#ffffff' }} />
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '20px' }}>
          <div className="erp-card">
            <div className="erp-card-header">
              <span className="erp-card-title">Pending Leave Applications</span>
            </div>
            <div className="table-container">
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>Staff</th>
                    <th>Type</th>
                    <th>Dates</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Sunita Verma</strong></td>
                    <td>Casual Leave</td>
                    <td>Jul 15 (1 day)</td>
                    <td><span className="erp-badge badge-pending">Pending</span></td>
                  </tr>
                  <tr>
                    <td><strong>Gurpreet Kaur</strong></td>
                    <td>Casual Leave</td>
                    <td>Jul 20-21 (2 days)</td>
                    <td><span className="erp-badge badge-pending">Pending</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="erp-card">
            <div className="erp-card-header">
              <span className="erp-card-title">Quick Actions</span>
            </div>
            <div className="erp-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button className="erp-btn btn-primary" onClick={() => setActiveView('hr')} style={{ justifyContent: 'center' }}>
                <ClipboardList size={14} style={{ marginRight: '6px' }} /> Open HR Module
              </button>
              <button className="erp-btn btn-outline" onClick={() => setActiveView('attendance')} style={{ justifyContent: 'center' }}>
                <CalendarCheck size={14} style={{ marginRight: '6px' }} /> Staff Attendance
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeRole === 'Accountant') {
    return (
      <div>
        <div className="view-header">
          <div>
            <h2 className="view-title">Accountant Dashboard</h2>
            <span className="view-subtitle">Fee collection, financial reports, and payment tracking</span>
          </div>
        </div>

        <div className="metrics-row" style={{ marginBottom: '20px' }}>
          <div className="metric-box" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)', borderColor: '#bbf7d0' }}>
            <div>
              <div className="metric-value" style={{ color: '#15803d' }}>₹{totalCollectedFormatted}k</div>
              <div className="metric-label">Total Collected</div>
              <span style={{ fontSize: '10px', color: '#166534', fontWeight: 700 }}>Year to date</span>
            </div>
            <div style={{ backgroundColor: '#10b981', padding: '10px', borderRadius: '8px' }}>
              <DollarSign size={20} style={{ color: '#ffffff' }} />
            </div>
          </div>
          <div className="metric-box" style={{ background: 'linear-gradient(135deg, #fff7ed 0%, #ffffff 100%)', borderColor: '#ffedd5' }}>
            <div>
              <div className="metric-value" style={{ color: '#c2410c' }}>₹42k</div>
              <div className="metric-label">Outstanding Dues</div>
              <span style={{ fontSize: '10px', color: '#ea580c', fontWeight: 700 }}>15 students pending</span>
            </div>
            <div style={{ backgroundColor: '#f97316', padding: '10px', borderRadius: '8px' }}>
              <AlertTriangle size={20} style={{ color: '#ffffff' }} />
            </div>
          </div>
          <div className="metric-box" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)', borderColor: '#bfdbfe' }}>
            <div>
              <div className="metric-value" style={{ color: '#1e3a8a' }}>12</div>
              <div className="metric-label">Today's Receipts</div>
              <span style={{ fontSize: '10px', color: '#2563eb', fontWeight: 700 }}>₹36,000 collected</span>
            </div>
            <div style={{ backgroundColor: '#2563eb', padding: '10px', borderRadius: '8px' }}>
              <CreditCard size={20} style={{ color: '#ffffff' }} />
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '20px' }}>
          <div className="erp-card">
            <div className="erp-card-header">
              <span className="erp-card-title">Recent Fee Payments</span>
            </div>
            <div className="table-container">
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Class</th>
                    <th>Amount</th>
                    <th>Mode</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Aarav Sharma</strong></td>
                    <td>Class 5-A</td>
                    <td style={{ color: '#16a34a', fontWeight: 700 }}>₹3,000</td>
                    <td>Cash</td>
                  </tr>
                  <tr>
                    <td><strong>Priya Das</strong></td>
                    <td>Class 4-B</td>
                    <td style={{ color: '#16a34a', fontWeight: 700 }}>₹3,000</td>
                    <td>UPI</td>
                  </tr>
                  <tr>
                    <td><strong>Sneha Mondal</strong></td>
                    <td>Class 3-B</td>
                    <td style={{ color: '#16a34a', fontWeight: 700 }}>₹3,000</td>
                    <td>Card</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="erp-card">
            <div className="erp-card-header">
              <span className="erp-card-title">Quick Actions</span>
            </div>
            <div className="erp-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button className="erp-btn btn-primary" onClick={() => { setActiveView('fees'); setFeeViewTab('monthly'); }} style={{ justifyContent: 'center' }}>
                <Wallet size={14} style={{ marginRight: '6px' }} /> Collect Fee
              </button>
              <button className="erp-btn btn-outline" onClick={() => setActiveView('accounts')} style={{ justifyContent: 'center' }}>
                <CreditCard size={14} style={{ marginRight: '6px' }} /> Accounts Console
              </button>
              <button className="erp-btn btn-outline" onClick={() => setActiveView('reports')} style={{ justifyContent: 'center' }}>
                <FileSpreadsheet size={14} style={{ marginRight: '6px' }} /> Fee Reports
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeRole === 'Receptionist') {
    return (
      <div>
        <div className="view-header">
          <div>
            <h2 className="view-title">Receptionist Dashboard</h2>
            <span className="view-subtitle">Front desk operations, visitor management, and admission enquiries</span>
          </div>
        </div>

        <div className="metrics-row" style={{ marginBottom: '20px' }}>
          <div className="metric-box" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)', borderColor: '#bfdbfe' }}>
            <div>
              <div className="metric-value" style={{ color: '#1e3a8a' }}>8</div>
              <div className="metric-label">Visitors Today</div>
              <span style={{ fontSize: '10px', color: '#2563eb', fontWeight: 700 }}>6 checked out</span>
            </div>
            <div style={{ backgroundColor: '#2563eb', padding: '10px', borderRadius: '8px' }}>
              <Users size={20} style={{ color: '#ffffff' }} />
            </div>
          </div>
          <div className="metric-box" style={{ background: 'linear-gradient(135deg, #fff7ed 0%, #ffffff 100%)', borderColor: '#ffedd5' }}>
            <div>
              <div className="metric-value" style={{ color: '#c2410c' }}>3</div>
              <div className="metric-label">Active Gatepasses</div>
              <span style={{ fontSize: '10px', color: '#ea580c', fontWeight: 700 }}>Students out</span>
            </div>
            <div style={{ backgroundColor: '#f97316', padding: '10px', borderRadius: '8px' }}>
              <Ticket size={20} style={{ color: '#ffffff' }} />
            </div>
          </div>
          <div className="metric-box" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)', borderColor: '#bbf7d0' }}>
            <div>
              <div className="metric-value" style={{ color: '#15803d' }}>5</div>
              <div className="metric-label">Enquiries Today</div>
              <span style={{ fontSize: '10px', color: '#166534', fontWeight: 700 }}>Admission related</span>
            </div>
            <div style={{ backgroundColor: '#10b981', padding: '10px', borderRadius: '8px' }}>
              <UserPlus size={20} style={{ color: '#ffffff' }} />
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="erp-card">
            <div className="erp-card-header">
              <span className="erp-card-title">Quick Actions</span>
            </div>
            <div className="erp-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button className="erp-btn btn-primary" onClick={() => setActiveView('gatepass')} style={{ justifyContent: 'center' }}>
                <Ticket size={14} style={{ marginRight: '6px' }} /> Issue Gatepass
              </button>
              <button className="erp-btn btn-outline" onClick={() => setActiveView('admission')} style={{ justifyContent: 'center' }}>
                <UserPlus size={14} style={{ marginRight: '6px' }} /> New Admission Enquiry
              </button>
              <button className="erp-btn btn-outline" onClick={() => setActiveView('communication')} style={{ justifyContent: 'center' }}>
                <MessageSquare size={14} style={{ marginRight: '6px' }} /> Send Notice
              </button>
            </div>
          </div>

          <div className="erp-card">
            <div className="erp-card-header">
              <span className="erp-card-title">Today's Visitor Log</span>
            </div>
            <div className="table-container">
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Purpose</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Ravi Kumar</strong></td>
                    <td>Parent meeting</td>
                    <td><span className="erp-badge badge-approved">Out</span></td>
                  </tr>
                  <tr>
                    <td><strong>Deepa Nair</strong></td>
                    <td>Admission enquiry</td>
                    <td><span className="erp-badge badge-pending">In</span></td>
                  </tr>
                  <tr>
                    <td><strong>Vendor - Stationary</strong></td>
                    <td>Delivery</td>
                    <td><span className="erp-badge badge-approved">Out</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeRole === 'Parent') {
    return (
      <div>
        <div className="view-header">
          <div>
            <h2 className="view-title">Parent Portal</h2>
            <span className="view-subtitle">Track your child's academic progress, attendance, and fee status</span>
          </div>
        </div>

        <div className="metrics-row" style={{ marginBottom: '20px' }}>
          <div className="metric-box" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)', borderColor: '#bbf7d0' }}>
            <div>
              <div className="metric-value" style={{ color: '#15803d' }}>92%</div>
              <div className="metric-label">Child's Attendance</div>
              <span style={{ fontSize: '10px', color: '#166534', fontWeight: 700 }}>Aarav Sharma - Class 5</span>
            </div>
            <div style={{ backgroundColor: '#10b981', padding: '10px', borderRadius: '8px' }}>
              <CalendarCheck size={20} style={{ color: '#ffffff' }} />
            </div>
          </div>
          <div className="metric-box" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)', borderColor: '#bfdbfe' }}>
            <div>
              <div className="metric-value" style={{ color: '#1e3a8a' }}>84%</div>
              <div className="metric-label">Academic Score</div>
              <span style={{ fontSize: '10px', color: '#2563eb', fontWeight: 700 }}>Unit Test 1 avg</span>
            </div>
            <div style={{ backgroundColor: '#2563eb', padding: '10px', borderRadius: '8px' }}>
              <GraduationCap size={20} style={{ color: '#ffffff' }} />
            </div>
          </div>
          <div className="metric-box" style={{ background: 'linear-gradient(135deg, #fff7ed 0%, #ffffff 100%)', borderColor: '#ffedd5' }}>
            <div>
              <div className="metric-value" style={{ color: '#c2410c' }}>₹6,000</div>
              <div className="metric-label">Fee Due</div>
              <span style={{ fontSize: '10px', color: '#ea580c', fontWeight: 700 }}>Jun + Jul pending</span>
            </div>
            <div style={{ backgroundColor: '#ea580c', padding: '10px', borderRadius: '8px' }}>
              <Wallet size={20} style={{ color: '#ffffff' }} />
            </div>
          </div>
        </div>

        <div className="erp-card">
          <div className="erp-card-header">
            <span className="erp-card-title">Recent Notices</span>
          </div>
          <div className="erp-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ padding: '10px', borderLeft: '3px solid #2563eb', backgroundColor: '#f8fafc' }}>
              <strong>Unit Test 1 Schedule Released</strong>
              <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 0' }}>Exams start July 15. Mathematics on Day 1.</p>
            </div>
            <div style={{ padding: '10px', borderLeft: '3px solid #16a34a', backgroundColor: '#f8fafc' }}>
              <strong>PTA Meeting on July 18</strong>
              <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 0' }}>Kindly confirm your attendance via the app.</p>
            </div>
            <div style={{ padding: '10px', borderLeft: '3px solid #f97316', backgroundColor: '#f8fafc' }}>
              <strong>Fee Reminder</strong>
              <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 0' }}>June fee is overdue. Please clear by July 12.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
