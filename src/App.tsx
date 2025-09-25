import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Users, 
  Calendar, 
  BarChart3, 
  Shield, 
  Settings,
  QrCode, // Used for generating
  ScanLine, // Used for scanning
  Wifi,
  Bell,
  ChevronLeft,
  ChevronRight,
  User,
  GraduationCap,
  UserCheck,
  LogOut
} from 'lucide-react';

// Types
interface Student {
  id: string;
  name: string;
  rollNo: string;
  present: boolean;
  deviceId: string;
  lastSeen: string;
  attendancePercentage: number;
}

interface AttendanceRecord {
  date: string;
  present: number;
  total: number;
  percentage: number;
}

interface FraudAlert {
  id: number;
  student: string;
  reason: string;
  severity: 'high' | 'medium' | 'low';
  time: string;
}

type UserRole = 'student' | 'faculty' | 'admin';

interface BaseUser {
  id: string;
  name: string;
  password; // In a real app, this would be a hash
  role: UserRole;
}
interface StudentUser extends BaseUser { role: 'student'; studentId: string; subjects: string[]; }
interface FacultyUser extends BaseUser { role: 'faculty'; subjects: string[]; } // In a real app, these would be subject IDs
interface AdminUser extends BaseUser { role: 'admin'; }

type UserType = StudentUser | FacultyUser | AdminUser;


// Sample Data
const sampleStudents: Student[] = [
  { id: '1', name: 'Aarav Sharma', rollNo: 'CS001', present: true, deviceId: 'DEV001', lastSeen: '10:15 AM', attendancePercentage: 85 },
  { id: '2', name: 'Priya Patel', rollNo: 'CS002', present: true, deviceId: 'DEV002', lastSeen: '10:14 AM', attendancePercentage: 92 },
  { id: '3', name: 'Rohan Kumar', rollNo: 'CS003', present: false, deviceId: 'DEV003', lastSeen: '9:45 AM', attendancePercentage: 67 },
  { id: '4', name: 'Anisha Singh', rollNo: 'CS004', present: true, deviceId: 'DEV004', lastSeen: '10:16 AM', attendancePercentage: 88 },
  { id: '5', name: 'Vikram Mehta', rollNo: 'CS005', present: false, deviceId: 'DEV005', lastSeen: '9:30 AM', attendancePercentage: 72 },
];

const attendanceHistory: AttendanceRecord[] = [
  { date: '2025-01-20', present: 45, total: 50, percentage: 90 },
  { date: '2025-01-19', present: 42, total: 50, percentage: 84 },
  { date: '2025-01-18', present: 48, total: 50, percentage: 96 },
  { date: '2025-01-17', present: 41, total: 50, percentage: 82 },
  { date: '2025-01-16', present: 46, total: 50, percentage: 92 },
];

// Mock Users Database
const users: Record<string, UserType> = {
  'teacher1': { id: 'teacher1', name: 'Dr. Anjali Verma', password: 'password123', role: 'faculty', subjects: ['CS101 Database Systems', 'CS305 Data Mining'] },
  'teacher2': { id: 'teacher2', name: 'Prof. Rajesh Singh', password: 'password123', role: 'faculty', subjects: ['MA201 Linear Algebra', 'PHY101 Mechanics'] },
  'student1': { id: 'student1', name: 'Aarav Sharma', password: 'password123', role: 'student', studentId: '1', subjects: ['CS101 Database Systems', 'MA201 Linear Algebra', 'PHY101 Mechanics']},
  'student2': { id: 'student2', name: 'Priya Patel', password: 'password123', role: 'student', studentId: '2', subjects: ['CS101 Database Systems', 'CS305 Data Mining']},
  'admin': { id: 'admin', name: 'Admin User', password: 'admin123', role: 'admin' },
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState('dashboard');
  // userRole is now derived from currentUser
  const userRole = currentUser?.role;
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>([
    { id: 1, student: 'Rohan Kumar', reason: 'Multiple device detections', severity: 'high', time: '10:15 AM' },
    { id: 2, student: 'Vikram Mehta', reason: 'Location mismatch', severity: 'medium', time: '9:45 AM' },
  ]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogin = (username: string, password: string): boolean => {
    const user = users[username.toLowerCase()];
    if (user && user.password === password) {
      setCurrentUser(user);
      setIsLoggedIn(true);
      if (user.role === 'faculty') {
        setSelectedSubject(user.subjects[0]);
      } else if (user.role === 'student') {
        setSelectedSubject(user.subjects[0]);
      }
      setCurrentView('dashboard');
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setSelectedSubject(null);
  };

  const generateQRCode = (subject: string, teacher: string) => {
    const qrData = {
      subject,
      teacher,
      timestamp: Date.now(),
      expires: Date.now() + 300000, // 5 minutes from now
    };
    setQrCode(JSON.stringify(qrData));
    setTimeout(() => setQrCode(null), 300000); // QR expires in 5 minutes
  };

  const facultyNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'attendance', label: 'Attendance', icon: UserCheck },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'generate-qr', label: 'Generate QR', icon: QrCode },
    { id: 'wifi-tracking', label: 'Wi-Fi Tracking', icon: Wifi },
    { id: 'fraud-detection', label: 'Fraud Detection', icon: Shield },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const studentNavItems = [
    { id: 'dashboard', label: 'My Dashboard', icon: Home },
    { id: 'scan-qr', label: 'Scan QR', icon: ScanLine },
    { id: 'analytics', label: 'My Analytics', icon: BarChart3 },
  ];

  const presentStudents = sampleStudents.filter(s => s.present).length;
  const totalStudents = sampleStudents.length;
  const attendancePercentage = Math.round((presentStudents / totalStudents) * 100);

  const loggedInStudent = userRole === 'student' && currentUser
    ? sampleStudents.find(s => s.id === (currentUser as StudentUser).studentId)
    : null;

  // Determine subjects for the dropdown
  const availableSubjects = (currentUser && 'subjects' in currentUser) ? currentUser.subjects : [];

  if (!isLoggedIn) {
    return <LoginView onLogin={handleLogin} />;
  }

  const navigationItems = userRole === 'student' ? studentNavItems : facultyNavItems;  

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-white shadow-lg transition-all duration-300 flex flex-col`}>
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div>
                <h1 className="text-xl font-bold text-blue-600">UpasthitiAI</h1>
                <p className="text-sm text-gray-500">Smart Attendance</p>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
          </div>
        </div>

        <nav className="flex-1 p-4">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg mb-2 transition-colors ${
                  currentView === item.id
                    ? 'bg-blue-50 text-blue-600 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon size={20} />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-red-600 hover:bg-red-50`}
          >
            <LogOut size={20} />
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 capitalize">
                {currentView.replace('-', ' ')}
              </h2>
              <p className="text-gray-600">{currentTime.toLocaleDateString()} • {currentTime.toLocaleTimeString()}</p>
            </div>
            <div className="flex items-center gap-4">
              {/* Subject Selector */}
              {userRole !== 'admin' && (
                <div>
                  <select
                    value={selectedSubject || ''}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    {availableSubjects.map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex items-center gap-2">
                <RoleIcon role={userRole} />
                <span className="font-medium capitalize">{userRole} View</span>
              </div>
              <div className="relative">
                <Bell className="text-gray-600" size={20} />
                {fraudAlerts.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {fraudAlerts.length}
                  </span>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          {currentView === 'dashboard' && (
            userRole === 'student' && loggedInStudent ? (
              <StudentDashboardView student={loggedInStudent} />
            ) : userRole !== 'student' ? (
              <DashboardView 
                userRole={userRole} 
                presentStudents={presentStudents}
                totalStudents={totalStudents}
                attendancePercentage={attendancePercentage}
                fraudAlertsCount={fraudAlerts.length}
              />
            ) : null
          )}
          {currentView === 'attendance' && userRole !== 'student' && <AttendanceView students={sampleStudents} subject={selectedSubject} />}
          {currentView === 'analytics' && <AnalyticsView history={attendanceHistory} isStudent={userRole === 'student'} subject={selectedSubject} />}
          {currentView === 'generate-qr' && userRole === 'faculty' && <QRGeneratorView qrCode={qrCode} onGenerate={generateQRCode} user={currentUser as FacultyUser} />}
          {currentView === 'scan-qr' && userRole === 'student' && <StudentQRScanView />}
          {currentView === 'wifi-tracking' && userRole !== 'student' && <WiFiTrackingView students={sampleStudents} />}
          {currentView === 'fraud-detection' && <FraudDetectionView alerts={fraudAlerts} />}
          {currentView === 'settings' && <SettingsView />}
        </main>
      </div>
    </div>
  );
}

// Login View Component
const LoginView: React.FC<{ onLogin: (username: string, pass: string) => boolean }> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = onLogin(username, password);
    if (!success) {
      setError('Invalid username or password.');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="w-full max-w-sm p-8 space-y-8 bg-white rounded-2xl shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-blue-600">UpasthitiAI</h1>
          <p className="mt-2 text-gray-600">Smart Attendance System</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="E.g., teacher1 or student1" required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="password123" required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            className="w-full p-3 rounded-lg transition-colors bg-blue-600 text-white hover:bg-blue-700 font-semibold"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

// Role Icon Component
const RoleIcon: React.FC<{ role: UserRole | undefined }> = ({ role }) => {
  switch (role) {
    case 'student':
      return <User className="text-blue-600" size={20} />;
    case 'faculty':
      return <GraduationCap className="text-emerald-600" size={20} />;
    case 'admin':
      return <Shield className="text-purple-600" size={20} />;
    default:
      return null;
  }
};

// Student Dashboard View Component
const StudentDashboardView: React.FC<{ student: Student }> = ({ student }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Welcome, {student.name.split(' ')[0]}!</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Your Attendance</p>
              <p className="text-3xl font-bold text-emerald-600">{student.attendancePercentage}%</p>
            </div>
            <div className="bg-emerald-100 p-3 rounded-lg">
              <BarChart3 className="text-emerald-600" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Today's Status</p>
              <p className={`text-3xl font-bold ${student.present ? 'text-green-600' : 'text-red-600'}`}>
                {student.present ? 'Present' : 'Absent'}
              </p>
            </div>
            <div className={`${student.present ? 'bg-green-100' : 'bg-red-100'} p-3 rounded-lg`}>
              <UserCheck className={`${student.present ? 'text-green-600' : 'text-red-600'}`} size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Last Check-in</p>
              <p className="text-3xl font-bold text-blue-600">{student.lastSeen}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Calendar className="text-blue-600" size={24} />
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="flex gap-4">
          <button className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
            <ScanLine size={20} /> Mark Attendance
          </button>
        </div>
      </div>
    </div>
  );
};

// Dashboard View Component
const DashboardView: React.FC<{ 
  userRole: string;
  presentStudents: number;
  totalStudents: number;
  attendancePercentage: number;
  fraudAlertsCount: number;
}> = ({ userRole, presentStudents, totalStudents, attendancePercentage, fraudAlertsCount }) => {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Present Today</p>
              <p className="text-3xl font-bold text-green-600">{presentStudents}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <UserCheck className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Students</p>
              <p className="text-3xl font-bold text-blue-600">{totalStudents}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Attendance Rate</p>
              <p className="text-3xl font-bold text-emerald-600">{attendancePercentage}%</p>
            </div>
            <div className="bg-emerald-100 p-3 rounded-lg">
              <BarChart3 className="text-emerald-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Fraud Alerts</p>
              <p className="text-3xl font-bold text-red-600">{fraudAlertsCount}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <Shield className="text-red-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Recent Check-ins</h3>
          <div className="space-y-3">
            {sampleStudents.filter(s => s.present).slice(0, 5).map((student) => (
              <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{student.name}</p>
                  <p className="text-sm text-gray-600">{student.rollNo}</p>
                </div>
                <span className="text-sm text-green-600 font-medium">{student.lastSeen}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">System Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Wi-Fi Tracking</span>
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-sm">Active</span>
            </div>
            <div className="flex items-center justify-between">
              <span>QR Generation</span>
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-sm">Ready</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Fraud Detection</span>
              <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-sm">Monitoring</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Geo-fencing</span>
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-sm">Enabled</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Attendance View Component
const AttendanceView: React.FC<{ students: Student[], subject: string | null }> = ({ students, subject }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Live Attendance - {subject}</h3>
          <div className="text-sm text-gray-600">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">Student</th>
                <th className="text-left p-3">Roll No</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Last Seen</th>
                <th className="text-left p-3">Attendance %</th>
                <th className="text-left p-3">Device</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium">{student.name}</td>
                  <td className="p-3">{student.rollNo}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      student.present 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {student.present ? 'Present' : 'Absent'}
                    </span>
                  </td>
                  <td className="p-3 text-gray-600">{student.lastSeen}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-2 bg-gray-200 rounded-full">
                        <div 
                          className={`h-full rounded-full ${
                            student.attendancePercentage >= 80 ? 'bg-green-500' :
                            student.attendancePercentage >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${student.attendancePercentage}%` }}
                        />
                      </div>
                      <span className="text-sm">{student.attendancePercentage}%</span>
                    </div>
                  </td>
                  <td className="p-3 text-gray-600">{student.deviceId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Analytics View Component
const AnalyticsView: React.FC<{ history: AttendanceRecord[], isStudent: boolean, subject: string | null }> = ({ history, isStudent, subject }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Attendance Trend for {subject}</h3>
          <div className="space-y-3">
            {history.map((record, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{record.date}</span>
                <div className="flex items-center gap-3">
                  <div className="w-20 h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-full bg-blue-500 rounded-full" 
                      style={{ width: `${record.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{record.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {!isStudent && (
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">Performance Insights</h3>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-800">High Performers</h4>
                <p className="text-sm text-green-600">3 students with 90%+ attendance</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-medium text-yellow-800">At Risk</h4>
                <p className="text-sm text-yellow-600">2 students below 75% attendance</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800">Class Average</h4>
                <p className="text-sm text-blue-600">82% attendance rate</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Weekly Report</h3>
        <div className="grid grid-cols-7 gap-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
            <div key={day} className="text-center">
              <div className="text-sm text-gray-600 mb-1">{day}</div>
              <div className={`h-16 rounded-lg flex items-end justify-center ${
                index < 5 ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                <div 
                  className={`w-full rounded-lg ${
                    index < 5 ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                  style={{ height: `${Math.random() * 80 + 20}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// QR Generator View Component (for Faculty)
const QRGeneratorView: React.FC<{ qrCode: string | null; onGenerate: (subject: string, teacher: string) => void; user: FacultyUser }> = ({ qrCode, onGenerate, user }) => {
  const [subject, setSubject] = useState(user.subjects[0] || '');
  const [teacher, setTeacher] = useState(user.name);
  const qrData = qrCode ? JSON.parse(qrCode) : null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Generate QR Code</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
              <select 
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {user.subjects.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="teacher" className="block text-sm font-medium text-gray-700">Teacher Name</label>
              <input 
                type="text" 
                id="teacher"
                value={teacher}
                onChange={(e) => setTeacher(e.target.value)}
                readOnly // Teacher name is fixed to the logged-in user
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-100 cursor-not-allowed"
              />
            </div>
            <div className="text-center space-y-4 pt-4">
              {qrData ? (
                <div className="space-y-4">
                  <div className="w-48 h-48 bg-gray-900 mx-auto rounded-lg flex items-center justify-center p-2">
                    <div className="text-white text-center break-all">
                      <QrCode size={48} className="mx-auto mb-2" />
                      <p className="text-sm font-semibold">{qrData.subject}</p>
                      <p className="text-xs text-gray-300">by {qrData.teacher}</p>
                    </div>
                  </div>
                  <p className="text-sm text-green-600">QR Code Active • Expires in 5 minutes</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-48 h-48 bg-gray-100 mx-auto rounded-lg flex items-center justify-center">
                    <QrCode size={48} className="text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600">Click to generate attendance QR code</p>
                </div>
              )}
              <button
                onClick={() => onGenerate(subject, teacher)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Generate New QR Code
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Recent Scans</h3>
          <div className="space-y-3">
            {sampleStudents.filter(s => s.present).slice(0, 6).map((student) => (
              <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{student.name}</p>
                  <p className="text-sm text-gray-600">{student.rollNo}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-green-600 font-medium">Verified</p>
                  <p className="text-xs text-gray-500">{student.lastSeen}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Student QR Scan View Component
const StudentQRScanView: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border max-w-md mx-auto text-center">
      <h3 className="text-lg font-semibold mb-4">Scan Attendance QR Code</h3>
      <div className="w-full aspect-square bg-gray-900 rounded-lg flex items-center justify-center mb-4">
        <div className="w-64 h-64 border-4 border-dashed border-gray-400 rounded-lg animate-pulse"></div>
      </div>
      <p className="text-gray-600 mb-4">Point your camera at the QR code provided by your teacher.</p>
      <button
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 w-full"
      >
        <ScanLine size={20} /> Open Camera
      </button>
    </div>
  );
};

// Wi-Fi Tracking View Component
const WiFiTrackingView: React.FC<{ students: Student[] }> = ({ students }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Classroom Wi-Fi Coverage</h3>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <Wifi className="text-green-600 mx-auto mb-2" size={24} />
            <p className="text-sm font-medium">Router A</p>
            <p className="text-xs text-gray-600">Signal: Strong</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg text-center">
            <Wifi className="text-yellow-600 mx-auto mb-2" size={24} />
            <p className="text-sm font-medium">Router B</p>
            <p className="text-xs text-gray-600">Signal: Medium</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <Wifi className="text-green-600 mx-auto mb-2" size={24} />
            <p className="text-sm font-medium">Router C</p>
            <p className="text-xs text-gray-600">Signal: Strong</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-3">Triangulation Results</h4>
            <div className="space-y-2">
              {students.filter(s => s.present).map((student) => (
                <div key={student.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">{student.name}</span>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">In Classroom</span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-3">Device Detection</h4>
            <div className="space-y-2">
              {students.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">{student.deviceId}</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    student.present 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {student.present ? 'Connected' : 'Not Found'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Fraud Detection View Component
const FraudDetectionView: React.FC<{ alerts: FraudAlert[] }> = ({ alerts }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">AI Fraud Detection</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-red-50 p-4 rounded-lg">
            <Shield className="text-red-600 mb-2" size={24} />
            <h4 className="font-medium text-red-800">High Risk</h4>
            <p className="text-2xl font-bold text-red-600">2</p>
            <p className="text-sm text-red-600">Active alerts</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <Shield className="text-yellow-600 mb-2" size={24} />
            <h4 className="font-medium text-yellow-800">Medium Risk</h4>
            <p className="text-2xl font-bold text-yellow-600">1</p>
            <p className="text-sm text-yellow-600">Under review</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <Shield className="text-green-600 mb-2" size={24} />
            <h4 className="font-medium text-green-800">Low Risk</h4>
            <p className="text-2xl font-bold text-green-600">47</p>
            <p className="text-sm text-green-600">Verified students</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Active Fraud Alerts</h3>
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div key={alert.id} className={`p-4 rounded-lg border-l-4 ${
              alert.severity === 'high' ? 'border-red-500 bg-red-50' :
              alert.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' :
              'border-blue-500 bg-blue-50'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{alert.student}</h4>
                  <p className="text-sm text-gray-600">{alert.reason}</p>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    alert.severity === 'high' ? 'bg-red-100 text-red-700' :
                    alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {alert.severity.toUpperCase()}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">ML Model Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-3">Detection Accuracy</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Isolation Forest</span>
                <span className="text-sm font-medium">94.2%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '94.2%' }} />
              </div>
            </div>
            <div className="space-y-2 mt-4">
              <div className="flex justify-between">
                <span className="text-sm">Autoencoder</span>
                <span className="text-sm font-medium">91.8%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '91.8%' }} />
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-3">Recent Predictions</h4>
            <div className="space-y-2">
              <div className="text-sm">False Positive Rate: <span className="font-medium">2.1%</span></div>
              <div className="text-sm">False Negative Rate: <span className="font-medium">1.8%</span></div>
              <div className="text-sm">Model Confidence: <span className="font-medium">96.3%</span></div>
              <div className="text-sm">Last Training: <span className="font-medium">2 days ago</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Settings View Component
const SettingsView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">System Configuration</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium">Attendance Settings</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm">Auto-mark absent after</label>
                <select className="border rounded px-2 py-1 text-sm">
                  <option>15 minutes</option>
                  <option>30 minutes</option>
                  <option>1 hour</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm">QR code validity</label>
                <select className="border rounded px-2 py-1 text-sm">
                  <option>5 minutes</option>
                  <option>10 minutes</option>
                  <option>15 minutes</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm">Minimum attendance %</label>
                <input type="number" value={75} className="border rounded px-2 py-1 text-sm w-20" />
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium">Fraud Detection</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm">Sensitivity Level</label>
                <select className="border rounded px-2 py-1 text-sm">
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm">Auto-block suspicious devices</label>
                <input type="checkbox" className="rounded" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm">Geo-fence radius</label>
                <select className="border rounded px-2 py-1 text-sm">
                  <option>100m</option>
                  <option>200m</option>
                  <option>500m</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Notifications</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Low Attendance Alerts</p>
              <p className="text-sm text-gray-600">Notify when student attendance drops below threshold</p>
            </div>
            <input type="checkbox" className="rounded" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Fraud Detection Alerts</p>
              <p className="text-sm text-gray-600">Immediate alerts for suspicious activity</p>
            </div>
            <input type="checkbox" className="rounded" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Daily Reports</p>
              <p className="text-sm text-gray-600">Automatic attendance summary emails</p>
            </div>
            <input type="checkbox" className="rounded" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;