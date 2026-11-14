import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { Calendar, Eye, Wrench } from 'lucide-react';

export const EquipmentTable = ({
  equipment = [],
  onBook,
  onReportFault,
}) => {
  if (equipment.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
        <p className="text-sm text-slate-500 font-medium">
          No equipment records matched your search or filters.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
      <table className="w-full text-left text-xs sm:text-sm text-slate-600">
        <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] uppercase font-semibold text-slate-500 tracking-wider">
          <tr>
            <th className="py-3 px-4">Equipment & Code</th>
            <th className="py-3 px-4">Category</th>
            <th className="py-3 px-4">Department & Lab</th>
            <th className="py-3 px-4 text-center">Available / Total</th>
            <th className="py-3 px-4">Condition</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {equipment.map((item) => {
            const isUsable =
              ['Available', 'Partially Available'].includes(item.status) &&
              item.availableQuantity > 0;

            return (
              <tr key={item._id} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3.5 px-4 font-medium text-slate-900">
                  <Link
                    to={`/equipment/${item._id}`}
                    className="hover:text-primary-600 transition-colors font-semibold block"
                  >
                    {item.name}
                  </Link>
                  <span className="text-slate-400 font-mono text-xs">
                    {item.equipmentCode}
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <span className="inline-flex px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-700">
                    {item.category}
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <div className="font-medium text-slate-800">
                    {item.department?.name || 'Department'}
                  </div>
                  <div className="text-xs text-slate-400">
                    {item.laboratory?.name || 'Lab'}
                  </div>
                </td>
                <td className="py-3.5 px-4 text-center font-medium">
                  <span
                    className={
                      item.availableQuantity > 0
                        ? 'text-emerald-600 font-semibold'
                        : 'text-slate-400'
                    }
                  >
                    {item.availableQuantity}
                  </span>
                  <span className="text-slate-400"> / {item.quantity}</span>
                </td>
                <td className="py-3.5 px-4">
                  <StatusBadge status={item.condition} />
                </td>
                <td className="py-3.5 px-4">
                  <StatusBadge status={item.status} />
                </td>
                <td className="py-3.5 px-4 text-right">
                  <div className="inline-flex items-center space-x-2">
                    <Link
                      to={`/equipment/${item._id}`}
                      className="p-1.5 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    {onBook && (
                      <button
                        onClick={() => onBook(item)}
                        disabled={!isUsable}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isUsable
                            ? 'text-primary-600 hover:bg-primary-50'
                            : 'text-slate-300 cursor-not-allowed'
                        }`}
                        title="Book Equipment"
                      >
                        <Calendar className="w-4 h-4" />
                      </button>
                    )}
                    {onReportFault && (
                      <button
                        onClick={() => onReportFault(item)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Report Fault"
                      >
                        <Wrench className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default EquipmentTable;

