import React, { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import RecommendationCard from '../components/RecommendationCard';
import BookingForm from '../components/BookingForm';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import recommendationService from '../services/recommendationService';
import departmentService from '../services/departmentService';
import bookingService from '../services/bookingService';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  Layers,
  ArrowRight,
  TrendingDown,
  Repeat,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Search,
} from 'lucide-react';

export const Recommendations = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('idle'); // 'idle', 'matching', 'demand'

  const [idleList, setIdleList] = useState([]);
  const [matches, setMatches] = useState([]);
  const [demandAnalysis, setDemandAnalysis] = useState(null);
  const [departments, setDepartments] = useState([]);

  // Match Engine Interactive Filters
  const [matchCategory, setMatchCategory] = useState('All');
  const [matchQuantity, setMatchQuantity] = useState(1);
  const [selectedDept, setSelectedDept] = useState('');

  // Booking Modal
  const [selectedEquipmentForBooking, setSelectedEquipmentForBooking] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);

      const [idleRes, matchRes, demandRes, deptRes] = await Promise.all([
        recommendationService.getIdleEquipment(),
        recommendationService.getEquipmentMatches({
          category: matchCategory === 'All' ? undefined : matchCategory,
          departmentId: selectedDept || user?.department?._id || user?.department,
          minQuantity: matchQuantity,
        }),
        recommendationService.getDemandAnalysis(),
        departmentService.getAll(),
      ]);

      setIdleList(idleRes.recommendations || []);
      setMatches(matchRes.matches || []);
      setDemandAnalysis(demandRes.analysis || null);
      setDepartments(deptRes.departments || []);
      if (!selectedDept && deptRes.departments?.length > 0) {
        setSelectedDept(user?.department?._id || user?.department || deptRes.departments[0]._id);
      }
    } catch (err) {
      setError(err.message || 'Failed to execute Resource Intelligence Engine.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [matchCategory, matchQuantity, selectedDept]);

  const handleBookingSubmit = async (bookingData) => {
    try {
      await bookingService.create(bookingData);
      showToast('Sharing transfer booking submitted! Awaiting department approval.');
      fetchRecommendations();
    } catch (err) {
      throw err;
    }
  };

  const handleActionOnRec = (rec) => {
    if (rec.equipment) {
      setSelectedEquipmentForBooking(rec.equipment);
    } else if (rec.equipmentId) {
      // Create minimal equipment reference
      setSelectedEquipmentForBooking({
        _id: rec.equipmentId,
        name: rec.equipmentName,
        equipmentCode: rec.equipmentCode,
        quantity: rec.quantity,
        availableQuantity: rec.quantity,
        department: rec.department,
      });
    }
  };

  return (
    <AppLayout pageTitle="Resource Intelligence Engine">
      {toastMessage && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2 animate-in fade-in duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Innovation Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-primary-950 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-md mb-8">
        <div className="flex items-start space-x-3">
          <div className="p-2.5 rounded-2xl bg-primary-600/30 text-primary-300 border border-primary-500/30 flex-shrink-0">
            <Sparkles className="w-6 h-6 text-primary-400" />
          </div>
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary-500/20 text-primary-300 border border-primary-500/30 mb-2">
              Core Project Innovation • Module 7
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              LabLoop Resource Intelligence Engine
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Transparent, rule-based algorithmic matching designed to solve the college laboratory underutilization dilemma. It pairs idle instruments with departments experiencing shortages, factoring in maintenance health, training prerequisites, location suitability, and category compatibility.
            </p>
          </div>
        </div>
      </div>

      {/* Engine Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200/80 pb-3 mb-6">
        <button
          onClick={() => setActiveTab('idle')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
            activeTab === 'idle'
              ? 'bg-primary-600 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <TrendingDown className="w-4 h-4" />
          <span>Idle Asset Sharing Candidates ({idleList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('matching')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
            activeTab === 'matching'
              ? 'bg-primary-600 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Repeat className="w-4 h-4" />
          <span>Cross-Department Matching Engine</span>
        </button>

        <button
          onClick={() => setActiveTab('demand')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
            activeTab === 'demand'
              ? 'bg-primary-600 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          <span>Equipment Demand & Bottlenecks</span>
        </button>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchRecommendations} />}

      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner message="Calculating explainable resource sharing algorithms..." size="large" />
        </div>
      ) : activeTab === 'idle' ? (
        /* Feature A: Idle Equipment Detection */
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 text-xs text-slate-600">
            <h3 className="font-bold text-slate-900 text-sm mb-1">
              Rule-Based Idle Asset Detection Logic
            </h3>
            <p className="leading-relaxed">
              Assets qualify for inter-departmental sharing when 30-day utilization is below 25%, operating condition is Good/Excellent, and no scheduled maintenance or reservations conflict with the transfer period.
            </p>
          </div>

          {idleList.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center text-xs text-slate-500">
              No idle equipment detected. All campus instruments are currently meeting target utilization thresholds!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {idleList.map((rec) => (
                <RecommendationCard
                  key={rec.equipmentId}
                  recommendation={rec}
                  type="idle"
                  onAction={handleActionOnRec}
                />
              ))}
            </div>
          )}
        </div>
      ) : activeTab === 'matching' ? (
        /* Feature B: Cross-Department Matching Engine */
        <div className="space-y-6">
          {/* Interactive Match Controller */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
            <h3 className="font-bold text-slate-900 text-sm mb-3">
              Configure Inter-Department Matching Query
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Target Category
                </label>
                <select
                  value={matchCategory}
                  onChange={(e) => setMatchCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                >
                  <option value="All">All Categories</option>
                  <option value="Computing & IoT">Computing & IoT</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Testing & Measurement">Testing & Measurement</option>
                  <option value="Prototyping">Prototyping</option>
                  <option value="Optics & Physics">Optics & Physics</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Requesting Department
                </label>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                >
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Required Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={matchQuantity}
                  onChange={(e) => setMatchQuantity(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Weights explanation breakdown */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
              <span className="font-semibold text-slate-700">Algorithm Weights:</span>
              <span className="bg-slate-100 px-2 py-0.5 rounded-md">Category: 30%</span>
              <span className="bg-slate-100 px-2 py-0.5 rounded-md">Availability: 25%</span>
              <span className="bg-slate-100 px-2 py-0.5 rounded-md">Quantity Stock: 20%</span>
              <span className="bg-slate-100 px-2 py-0.5 rounded-md">Location: 15%</span>
              <span className="bg-slate-100 px-2 py-0.5 rounded-md">Sharing Incentive: 10%</span>
            </div>
          </div>

          {/* Matches Grid */}
          {matches.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center text-xs text-slate-500">
              No cross-department matches met the minimum availability constraints.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matches.map((m) => (
                <RecommendationCard
                  key={m.equipment._id}
                  recommendation={m}
                  type="match"
                  onAction={handleActionOnRec}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Feature C: Equipment Demand Analysis */
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* High Demand Equipment */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs">
              <h3 className="font-bold text-slate-900 text-base mb-1">
                Frequently Requested Equipment
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                High-utilization resources with continuous academic demand
              </p>

              <div className="space-y-3">
                {demandAnalysis?.highDemandEquipment?.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4">No demand spikes detected.</p>
                ) : (
                  demandAnalysis?.highDemandEquipment?.map((item) => (
                    <div
                      key={item.equipment._id}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-semibold text-slate-800 text-sm">
                          {item.equipment.name}
                        </span>
                        <p className="text-slate-400 text-[11px] font-mono mt-0.5">
                          {item.equipment.equipmentCode} • {item.equipment.department?.name}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-primary-600 text-sm">
                          {item.totalBookings} Bookings
                        </span>
                        <p className="text-[10px] text-slate-400">
                          {item.approvalRate}% Approval Rate
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Shortage Bottlenecks */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs">
              <h3 className="font-bold text-slate-900 text-base mb-1">
                Detected Bottlenecks & Shortages
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Equipment with high contention or zero available stock
              </p>

              <div className="space-y-3">
                {demandAnalysis?.bottleneckEquipment?.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4">No contention bottlenecks detected.</p>
                ) : (
                  demandAnalysis?.bottleneckEquipment?.map((b) => (
                    <div
                      key={b.equipment._id}
                      className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/60 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-amber-950 text-sm">
                          {b.equipment.name}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900">
                          Shortage Alert
                        </span>
                      </div>
                      <p className="text-amber-800 mt-1.5 leading-relaxed">
                        {b.recommendation}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Form Modal */}
      {selectedEquipmentForBooking && (
        <BookingForm
          equipment={selectedEquipmentForBooking}
          isOpen={!!selectedEquipmentForBooking}
          onClose={() => setSelectedEquipmentForBooking(null)}
          onSuccess={handleBookingSubmit}
        />
      )}
    </AppLayout>
  );
};

export default Recommendations;

