import React, { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import DepartmentModal from '../components/DepartmentModal';
import ConfirmationModal from '../components/ConfirmationModal';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import departmentService from '../services/departmentService';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  Plus,
  MapPin,
  Clock,
  User,
  Trash2,
  Edit,
  Layers,
  CheckCircle,
} from 'lucide-react';

export const Departments = () => {
  const { user } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [selectedDeptForEdit, setSelectedDeptForEdit] = useState(null);
  const [selectedDeptForDelete, setSelectedDeptForDelete] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await departmentService.getAll();
      setDepartments(res.departments || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch departments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveDepartment = async (data) => {
    try {
      if (selectedDeptForEdit) {
        await departmentService.update(selectedDeptForEdit._id, data);
        showToast('Department updated successfully.');
      } else {
        await departmentService.create(data);
        showToast('Academic department registered successfully.');
      }
      setSelectedDeptForEdit(null);
      fetchDepartments();
    } catch (err) {
      throw err;
    }
  };

  const handleDelete = async () => {
    try {
      await departmentService.delete(selectedDeptForDelete._id);
      showToast('Department removed successfully.');
      setSelectedDeptForDelete(null);
      fetchDepartments();
    } catch (err) {
      setError(err.message || 'Failed to delete department.');
      setSelectedDeptForDelete(null);
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AppLayout pageTitle="Academic Departments & Laboratories">
      {toastMessage && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2 animate-in fade-in duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Academic Departments & Laboratory Infrastructure
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Overview of university departments, specialized research laboratories, operating hours, and location directory.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => {
              setSelectedDeptForEdit(null);
              setIsDeptModalOpen(true);
            }}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-semibold shadow-2xs hover:shadow-xs transition-all flex items-center space-x-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create Department</span>
          </button>
        )}
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchDepartments} />}

      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner message="Loading institutional departments..." size="large" />
        </div>
      ) : departments.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center text-xs text-slate-400">
          No departments registered.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {departments.map((dept) => (
            <div
              key={dept._id}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-primary-50 text-primary-700">
                      {dept.code}
                    </span>
                    <h3 className="font-bold text-slate-900 text-lg mt-1">
                      {dept.name}
                    </h3>
                  </div>

                  {isAdmin && (
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => {
                          setSelectedDeptForEdit(dept);
                          setIsDeptModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Edit Department"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setSelectedDeptForDelete(dept)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Department"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {dept.description || 'University academic department.'}
                </p>

                {dept.headOfDepartment && (
                  <p className="mt-3 text-xs text-slate-500 font-medium flex items-center space-x-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Head: {dept.headOfDepartment}</span>
                  </p>
                )}

                {/* Laboratory Sub-List */}
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                    <Layers className="w-3.5 h-3.5 text-primary-600" />
                    <span>Specialized Laboratories ({dept.laboratories?.length || 0})</span>
                  </h4>

                  {(!dept.laboratories || dept.laboratories.length === 0) ? (
                    <p className="text-xs text-slate-400 italic">
                      No laboratories associated yet.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {dept.laboratories.map((lab) => (
                        <div
                          key={lab._id}
                          className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1"
                        >
                          <div>
                            <span className="font-semibold text-slate-800">
                              {lab.name}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono ml-2">
                              {lab.laboratoryCode}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1.5 text-slate-500 text-[11px]">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{lab.location}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Department Modal */}
      {isDeptModalOpen && (
        <DepartmentModal
          department={selectedDeptForEdit}
          isOpen={isDeptModalOpen}
          onClose={() => {
            setIsDeptModalOpen(false);
            setSelectedDeptForEdit(null);
          }}
          onSubmit={handleSaveDepartment}
        />
      )}

      {/* Delete Confirmation Modal */}
      {selectedDeptForDelete && (
        <ConfirmationModal
          isOpen={!!selectedDeptForDelete}
          title="Delete Department"
          message={`Are you sure you want to delete "${selectedDeptForDelete.name}"? This action cannot be undone.`}
          confirmText="Delete Department"
          confirmVariant="danger"
          onConfirm={handleDelete}
          onClose={() => setSelectedDeptForDelete(null)}
        />
      )}
    </AppLayout>
  );
};

export default Departments;

