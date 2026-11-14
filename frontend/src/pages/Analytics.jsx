import React, { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import DashboardCard from '../components/DashboardCard';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import analyticsService from '../services/analyticsService';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Cpu,
  Clock,
  Building,
  AlertTriangle,
  HelpCircle,
  Calendar,
} from 'lucide-react';

export const Analytics = () => {
  const [dashboardStats, setDashboardStats] = useState(null);
  const [departmentData, setDepartmentData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [equipmentUtilization, setEquipmentUtilization] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const [dashRes, deptRes, trendRes, utilRes] = await Promise.all([
        analyticsService.getDashboard(),
        analyticsService.getDepartmentComparison(),
        analyticsService.getUsageHistory(),
        analyticsService.getUtilization(30),
      ]);

      setDashboardStats(dashRes.stats);
      setDepartmentData(deptRes.departmentUtilization || []);
      setTrendData(trendRes.trends || []);
      setEquipmentUtilization(utilRes.equipmentUtilization || []);
    } catch (err) {
      setError(err.message || 'Failed to aggregate laboratory analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <AppLayout pageTitle="Utilization Analytics">
        <div className="py-20 flex justify-center">
          <LoadingSpinner message="Calculating laboratory utilization metrics from MongoDB data..." size="large" />
        </div>
      </AppLayout>
    );
  }

  // Equipment status distribution for Pie Chart
  const statusPieData = [
    {
      name: 'Available',
      value: dashboardStats?.availableEquipment || 0,
      color: '#10B981',
    },
    {
      name: 'In Service / Repair',
      value: dashboardStats?.underMaintenanceEquipment || 0,
      color: '#F43F5E',
    },
    {
      name: 'Active Bookings',
      value: dashboardStats?.activeBookings || 0,
      color: '#3B82F6',
    },
    {
      name: 'Pending Review',
      value: dashboardStats?.pendingBookings || 0,
      color: '#F59E0B',
    },
  ];

  const underutilizedList = equipmentUtilization.filter((e) => e.isUnderutilized);

  return (
    <AppLayout pageTitle="Utilization Analytics & Reporting">
      {error && <ErrorMessage message={error} onRetry={fetchAnalytics} />}

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Institutional Laboratory Utilization Engine
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated utilization scoring derived dynamically from real session logs, equipment availability, and downtime.
          </p>
        </div>
      </div>

      {/* Mathematical Formula Explanation Card */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 text-white shadow-md mb-8">
        <div className="flex items-start space-x-3">
          <div className="p-2 rounded-xl bg-white/10 text-primary-300 flex-shrink-0">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary-300">
              Institutional Mathematical Standard (Module 5)
            </span>
            <h3 className="text-base font-bold mt-1">
              Academic Equipment Utilization Formula
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Utilization Rate is computed over a 30-day operating window (8 hours/day = 240 operating hours per inventory unit minus logged maintenance downtime):
            </p>
            <div className="mt-3 inline-block bg-white/10 px-4 py-2 rounded-xl text-xs sm:text-sm font-mono text-primary-200 border border-white/15">
              Utilization % = (Actual Equipment Usage Hours / Available Operating Hours) × 100
            </div>
          </div>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardCard
          title="Overall Campus Utilization"
          value={`${dashboardStats?.overallUtilizationRate || 0}%`}
          subtitle="30-day operating window"
          icon={TrendingUp}
          color="emerald"
        />
        <DashboardCard
          title="Total Reservations"
          value={dashboardStats?.totalBookings || 0}
          subtitle={`${dashboardStats?.completedBookings || 0} completed sessions`}
          icon={Calendar}
          color="blue"
        />
        <DashboardCard
          title="Underutilized Assets"
          value={underutilizedList.length}
          subtitle="Assets with < 25% utilization"
          icon={AlertTriangle}
          color="amber"
        />
        <DashboardCard
          title="Equipment in Repair"
          value={dashboardStats?.underMaintenanceEquipment || 0}
          subtitle="Current maintenance downtime"
          icon={Clock}
          color="rose"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Department Comparison Bar Chart */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Department Utilization Comparison
              </h3>
              <p className="text-xs text-slate-500">
                Average equipment utilization % by department
              </p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="departmentCode"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                <YAxis
                  unit="%"
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                <Tooltip
                  formatter={(val) => [`${val}%`, 'Avg Utilization']}
                  labelFormatter={(code) => `Department: ${code}`}
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '12px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                  }}
                />
                <Bar
                  dataKey="averageUtilization"
                  fill="#2563EB"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Booking Trends Line Chart */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Historical Monthly Booking Trends
              </h3>
              <p className="text-xs text-slate-500">
                Total vs approved reservation requests
              </p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '12px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Line
                  type="monotone"
                  dataKey="totalBookings"
                  name="Total Requests"
                  stroke="#2563EB"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="completedBookings"
                  name="Completed Sessions"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Status Distribution & Underutilized Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Pie Chart */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs">
          <h3 className="font-bold text-slate-900 text-base mb-1">
            Equipment Operational Breakdown
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Current status of institutional resources
          </p>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val, name) => [val, name]}
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '12px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 mt-2">
            {statusPieData.map((entry) => (
              <div key={entry.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-slate-600">{entry.name}</span>
                </div>
                <span className="font-bold text-slate-900">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Underutilized Assets Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-slate-900 text-base">
                Detected Underutilized Equipment (&lt; 25%)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Identified by the Resource Intelligence Engine as high-priority candidates for inter-department sharing
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400">
                  <tr>
                    <th className="py-2.5 px-3">Equipment</th>
                    <th className="py-2.5 px-3">Department</th>
                    <th className="py-2.5 px-3">Stock</th>
                    <th className="py-2.5 px-3">Usage Hours</th>
                    <th className="py-2.5 px-3">Utilization</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {underutilizedList.slice(0, 5).map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-3 font-semibold text-slate-800">
                        {item.name}
                        <span className="block text-[10px] text-slate-400 font-mono">
                          {item.equipmentCode}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">{item.department?.name}</td>
                      <td className="py-2.5 px-3">{item.quantity} units</td>
                      <td className="py-2.5 px-3">{item.actualUsageHours} hrs</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          {item.utilizationRate}%
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
    </AppLayout>
  );
};

export default Analytics;

