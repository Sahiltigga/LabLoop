import React from 'react';
import { Link } from 'react-router-dom';
import { Cpu, MapPin, Building, ShieldAlert, Calendar } from 'lucide-react';
import StatusBadge from './StatusBadge';

export const EquipmentCard = ({ equipment, onBook, onReportFault }) => {
  const isAvailable =
    equipment.status === 'Available' || equipment.status === 'Partially Available';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group">
      <div>
        {/* Header with Category and Status */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700">
            {equipment.category}
          </span>
          <StatusBadge status={equipment.status} />
        </div>

        {/* Title and Code */}
        <Link
          to={`/equipment/${equipment._id}`}
          className="block group-hover:text-primary-600 transition-colors"
        >
          <h3 className="font-semibold text-slate-900 text-base leading-snug line-clamp-1">
            {equipment.name}
          </h3>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            {equipment.equipmentCode}
          </p>
        </Link>

        {/* Description */}
        <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
          {equipment.description}
        </p>

        {/* Meta badges: Department & Laboratory */}
        <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
          <div className="flex items-center space-x-2">
            <Building className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate font-medium">
              {equipment.department?.name || 'Department Resource'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate">
              {equipment.laboratory?.name || 'Main Lab'} ({equipment.laboratory?.location || 'Campus'})
            </span>
          </div>
        </div>

        {/* Availability / Quantity Stats */}
        <div className="mt-3 flex items-center justify-between text-xs py-2 px-3 bg-slate-50 rounded-xl">
          <span className="text-slate-500 font-medium">Quantity Stock:</span>
          <span className="font-semibold text-slate-800">
            <span className={equipment.availableQuantity > 0 ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
              {equipment.availableQuantity}
            </span>
            <span className="text-slate-400"> / {equipment.quantity} available</span>
          </span>
        </div>

        {/* Training Requirement Alert */}
        {equipment.requiresTraining && (
          <div className="mt-2.5 flex items-center space-x-1.5 text-[11px] text-amber-700 bg-amber-50/80 px-2.5 py-1 rounded-lg">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
            <span>Requires faculty/training verification</span>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
        <Link
          to={`/equipment/${equipment._id}`}
          className="flex-1 text-center py-2 px-3 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
        >
          Details
        </Link>
        {onBook && (
          <button
            onClick={() => onBook(equipment)}
            disabled={!isAvailable || equipment.availableQuantity === 0}
            className={`flex-1 py-2 px-3 text-xs font-semibold rounded-xl flex items-center justify-center space-x-1 transition-all ${
              isAvailable && equipment.availableQuantity > 0
                ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-2xs hover:shadow-xs'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 mr-1" />
            <span>Reserve</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default EquipmentCard;

