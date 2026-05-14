import React, { useState, useMemo, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  UserPlus, 
  UserMinus, 
  Download, 
  Code, 
  BarChart3, 
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  FileJson,
  Info,
  Moon,
  Sun,
  LayoutDashboard,
  FileDown,
  CheckSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Login from './Login';

// --- Types ---
type Status = 'present' | 'late' | 'absent' | 'leave';

interface AttendanceRecord {
  date: string;
  present: string[];
  late: string[];
  absent: string[];
  leave: string[];
  percentage: number;
}

// --- Initial Data ---
const INITIAL_TEAM = ["Arjun", "Meera", "Vikram", "Sneha", "Rahul", "Priya", "Amit"];

const MOCK_HISTORY: AttendanceRecord[] = [
  { date: '2026-05-09', present: ['Arjun', 'Meera', 'Vikram', 'Sneha', 'Rahul'], late: ['Priya'], absent: ['Amit'], leave: [], percentage: 85.7 },
  { date: '2026-05-10', present: ['Arjun', 'Meera', 'Vikram', 'Sneha', 'Rahul', 'Priya', 'Amit'], late: [], absent: [], leave: [], percentage: 100 },
  { date: '2026-05-11', present: ['Arjun', 'Meera', 'Sneha', 'Priya'], late: ['Vikram', 'Rahul'], absent: ['Amit'], leave: [], percentage: 85.7 },
  { date: '2026-05-12', present: ['Arjun', 'Meera', 'Vikram', 'Sneha'], late: ['Priya'], absent: ['Amit'], leave: ['Rahul'], percentage: 83.3 },
  { date: '2026-05-13', present: ['Arjun', 'Meera', 'Vikram', 'Sneha', 'Rahul', 'Priya'], late: [], absent: [], leave: ['Amit'], percentage: 100 },
];

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [team, setTeam] = useState<string[]>(INITIAL_TEAM);
  const [statusMap, setStatusMap] = useState<Record<string, Status>>({});
  const [showPythonCode, setShowPythonCode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'tracker' | 'history'>('tracker');
  const [history, setHistory] = useState<AttendanceRecord[]>(MOCK_HISTORY);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Apply dark class to document html to support Login dark mode and overall background
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // --- Logic ---
  const { present, late, absent, leave, attendanceRate } = useMemo(() => {
    const p: string[] = [];
    const l: string[] = [];
    const a: string[] = [];
    const v: string[] = [];

    team.forEach(name => {
      const status = statusMap[name] || 'absent';
      if (status === 'present') p.push(name);
      else if (status === 'late') l.push(name);
      else if (status === 'leave') v.push(name);
      else a.push(name);
    });

    const activeTotal = team.length - v.length;
    const rate = activeTotal > 0 ? ((p.length + l.length) / activeTotal) * 100 : 0;

    return { 
      present: p, 
      late: l, 
      absent: a, 
      leave: v,
      attendanceRate: rate.toFixed(1) 
    };
  }, [team, statusMap]);

  const updateStatus = (name: string, status: Status) => {
    setStatusMap(prev => ({ ...prev, [name]: status }));
  };

  const markAllPresent = () => {
    setStatusMap(prev => {
      const newMap = { ...prev };
      team.forEach(name => {
        // Only override if absent (allows keeping 'leave' or 'late' intact if already set)
        if (!newMap[name] || newMap[name] === 'absent') {
          newMap[name] = 'present';
        }
      });
      return newMap;
    });
  };

  const handleSaveJson = () => {
    const record: AttendanceRecord = {
      date: new Date().toLocaleDateString(),
      present,
      late,
      absent,
      leave,
      percentage: parseFloat(attendanceRate)
    };
    
    // Add to history
    setHistory(prev => [...prev, record]);
    
    const blob = new Blob([JSON.stringify(record, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    // Generate CSV content
    let csvContent = "Employee Name,Status\n";
    team.forEach(name => {
      const status = statusMap[name] || 'absent';
      csvContent += `${name},${status}\n`;
    });
    csvContent += `\nSummary\n`;
    csvContent += `Present,${present.length}\n`;
    csvContent += `Late,${late.length}\n`;
    csvContent += `Absent,${absent.length}\n`;
    csvContent += `Leave,${leave.length}\n`;
    csvContent += `Attendance Rate,${attendanceRate}%\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredTeam = team.filter(name => 
    name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isLoggedIn) {
    return <Login onLogin={setIsLoggedIn} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-100 dark:selection:bg-indigo-900 flex flex-col transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30 shadow-sm transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-24 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-100 dark:shadow-none">
              T
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">TeamStand Attendance</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Morning Stand-up Tool &middot; Daily Tracker</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-lg border border-slate-200 dark:border-slate-600">
              <button
                onClick={() => setActiveTab('tracker')}
                className={`px-4 py-2 text-sm font-semibold rounded-md flex items-center gap-2 transition-all ${activeTab === 'tracker' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
              >
                <LayoutDashboard size={16} />
                Tracker
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-4 py-2 text-sm font-semibold rounded-md flex items-center gap-2 transition-all ${activeTab === 'history' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
              >
                <BarChart3 size={16} />
                History
              </button>
            </div>

            <div className="w-[1px] h-10 bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-600"
                aria-label="Toggle Dark Mode"
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button 
                onClick={handleSaveJson}
                className="hidden lg:flex items-center gap-2 px-5 py-2.5 bg-slate-800 dark:bg-slate-700 text-white font-semibold rounded-lg shadow-md hover:bg-slate-700 dark:hover:bg-slate-600 transition-all active:scale-95"
              >
                <FileJson size={16} />
                JSON
              </button>
              <button 
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg shadow-md shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition-all active:scale-95"
              >
                <FileDown size={16} />
                Export CSV
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 lg:px-10 flex-1 py-8 space-y-8 w-full">
        {activeTab === 'tracker' ? (
          <>
            {/* Key Metrics Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Attendance Rate</div>
                <div className="text-4xl font-black text-indigo-600 dark:text-indigo-400">{attendanceRate}%</div>
              </div>
              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm border-l-4 border-l-purple-500">
                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Active Team</div>
                <div className="text-4xl font-black text-slate-800 dark:text-white">
                  {team.length - leave.length} <span className="text-lg font-medium text-slate-400">/ {team.length}</span>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm border-l-4 border-l-emerald-500">
                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">On-Time</div>
                <div className="text-4xl font-black text-emerald-600 dark:text-emerald-400">
                  {present.length}
                </div>
              </div>
              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm border-l-4 border-l-amber-500">
                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Incidents</div>
                <div className="text-4xl font-black text-amber-600 dark:text-amber-400">
                  {late.length + absent.length}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Tracker Section */}
              <section className="lg:col-span-7 space-y-4">
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex flex-wrap gap-4 items-center justify-between">
                    <h2 className="font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
                      <UserPlus size={18} className="text-indigo-600 dark:text-indigo-400" />
                      Daily Tracker
                    </h2>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={markAllPresent}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors border border-emerald-200 dark:border-emerald-500/20"
                      >
                        <CheckSquare size={14} />
                        Mark All Present
                      </button>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input 
                          type="text" 
                          placeholder="Search employee..." 
                          className="pl-9 pr-4 py-1.5 text-sm border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-48 transition-all placeholder-slate-400 dark:placeholder-slate-500"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="divide-y divide-slate-100 dark:divide-slate-700/50 max-h-[500px] overflow-y-auto">
                    {filteredTeam.map((name) => (
                      <div key={name} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-500 dark:text-slate-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 dark:text-slate-200">{name}</div>
                            <div className="text-xs text-slate-400 dark:text-slate-500">
                              {statusMap[name] === 'present' ? 'Checked in' : 
                               statusMap[name] === 'late' ? 'Delayed arrival' : 
                               statusMap[name] === 'leave' ? 'On Leave / PTO' : 'Pending status'}
                            </div>
                          </div>
                        </div>
                        <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-lg gap-1 border border-slate-200 dark:border-slate-600 overflow-x-auto max-w-[200px] sm:max-w-none">
                          <StatusButton 
                            active={statusMap[name] === 'present'} 
                            onClick={() => updateStatus(name, 'present')}
                            color="bg-emerald-500"
                            label="Present"
                          />
                          <StatusButton 
                            active={statusMap[name] === 'late'} 
                            onClick={() => updateStatus(name, 'late')}
                            color="bg-amber-500"
                            label="Late"
                          />
                          <StatusButton 
                            active={statusMap[name] === 'absent'} 
                            onClick={() => updateStatus(name, 'absent')}
                            color="bg-rose-500"
                            label="Absent"
                          />
                          <StatusButton 
                            active={statusMap[name] === 'leave'} 
                            onClick={() => updateStatus(name, 'leave')}
                            color="bg-purple-500"
                            label="Leave"
                          />
                        </div>
                      </div>
                    ))}
                    {filteredTeam.length === 0 && (
                      <div className="p-12 text-center text-slate-400 dark:text-slate-500">
                        <UserMinus size={32} className="mx-auto mb-2 opacity-20" />
                        <p>No matches found in team list</p>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* Report Preview */}
              <section className="lg:col-span-5 space-y-6">
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 overflow-hidden relative">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
                      <FileJson size={18} className="text-indigo-600 dark:text-indigo-400" />
                      Live Report Preview
                    </h2>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-widest bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                      CLI Standard
                    </span>
                  </div>
                  
                  <div className="font-mono text-sm bg-slate-900 text-slate-300 p-6 rounded-xl shadow-inner border border-slate-800 space-y-2">
                    <p><span className="text-emerald-400 font-bold">Present ({present.length}):</span> {present.length > 0 ? present.join(', ') : 'None'}</p>
                    <p><span className="text-amber-400 font-bold">Late ({late.length}):</span> {late.length > 0 ? late.join(', ') : 'None'}</p>
                    <p><span className="text-rose-400 font-bold">Absent ({absent.length}):</span> {absent.length > 0 ? absent.join(', ') : 'None'}</p>
                    <p><span className="text-purple-400 font-bold">Leave ({leave.length}):</span> {leave.length > 0 ? leave.join(', ') : 'None'}</p>
                    <hr className="border-slate-800 my-4" />
                    <p className="text-white"><span className="text-indigo-400">Attendance Rate:</span> {attendanceRate}%</p>
                  </div>

                  <div className="mt-6 flex gap-4 p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100/50 dark:border-indigo-800/30">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg text-indigo-600 dark:text-indigo-400 shrink-0 h-fit">
                      <Info size={16} />
                    </div>
                    <p className="text-xs text-indigo-800 dark:text-indigo-300 leading-relaxed">
                      Members marked as <span className="font-semibold italic">Leave</span> are omitted from the attendance rate calculation.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </>
        ) : (
          /* History & Analytics Tab */
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-8">
              <div className="mb-8">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BarChart3 className="text-indigo-600 dark:text-indigo-400" />
                  Attendance Trends
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Historical view of the team's attendance rate over the last few days.</p>
              </div>
              
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#334155' : '#e2e8f0'} />
                    <XAxis dataKey="date" stroke={isDarkMode ? '#94a3b8' : '#64748b'} />
                    <YAxis domain={[0, 100]} stroke={isDarkMode ? '#94a3b8' : '#64748b'} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                        borderColor: isDarkMode ? '#334155' : '#e2e8f0',
                        color: isDarkMode ? '#f8fafc' : '#0f172a',
                        borderRadius: '0.5rem'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="percentage" 
                      stroke="#4f46e5" 
                      strokeWidth={3}
                      activeDot={{ r: 8 }} 
                      name="Attendance %"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                <h2 className="font-semibold text-slate-900 dark:text-white">Recent Records</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                  <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th scope="col" className="px-6 py-3">Date</th>
                      <th scope="col" className="px-6 py-3">Rate</th>
                      <th scope="col" className="px-6 py-3">Present</th>
                      <th scope="col" className="px-6 py-3">Late</th>
                      <th scope="col" className="px-6 py-3">Absent</th>
                      <th scope="col" className="px-6 py-3">Leave</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((record, idx) => (
                      <tr key={idx} className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                          {record.date}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            record.percentage >= 90 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                            record.percentage >= 70 ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' :
                            'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400'
                          }`}>
                            {record.percentage}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-emerald-600 dark:text-emerald-400">{record.present.length}</td>
                        <td className="px-6 py-4 text-amber-600 dark:text-amber-400">{record.late.length}</td>
                        <td className="px-6 py-4 text-rose-600 dark:text-rose-400">{record.absent.length}</td>
                        <td className="px-6 py-4 text-purple-600 dark:text-purple-400">{record.leave.length}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function StatusButton({ active, onClick, color, label }: { active: boolean, onClick: () => void, color: string, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`px-2 py-1.5 sm:px-3 text-[9px] sm:text-[10px] uppercase font-black tracking-widest rounded-md transition-all ${
        active 
          ? `${color} text-white shadow-md shadow-slate-200/50 dark:shadow-none scale-105 z-10` 
          : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
      }`}
    >
      {label}
    </button>
  );
}
