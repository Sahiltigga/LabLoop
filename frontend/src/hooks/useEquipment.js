import { useState, useEffect, useCallback, useMemo } from 'react';
import equipmentService from '../services/equipmentService';

export const useEquipment = (initialParams = {}) => {
  const [equipment, setEquipment] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);

  const [filters, setFilters] = useState({
    search: '',
    department: 'All',
    category: 'All',
    status: 'All',
    condition: 'All',
    ...initialParams,
  });

  const fetchEquipment = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await equipmentService.getAll(filters);
      setEquipment(res.equipment || []);
      setCategories(res.categories || []);
      setTotal(res.total || 0);
    } catch (err) {
      setError(err.message || 'Failed to load equipment data.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchEquipment();
  }, [fetchEquipment]);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      department: 'All',
      category: 'All',
      status: 'All',
      condition: 'All',
    });
  };

  // Memoized available count
  const availableCount = useMemo(() => {
    return equipment.filter(
      (e) => e.status === 'Available' || e.status === 'Partially Available'
    ).length;
  }, [equipment]);

  return {
    equipment,
    categories,
    loading,
    error,
    total,
    filters,
    availableCount,
    updateFilter,
    resetFilters,
    refetch: fetchEquipment,
  };
};

export default useEquipment;

