import React from 'react';

export const StatusBadge = ({ status, type = 'default' }) => {
  const getBadgeStyle = (val) => {
    switch (val) {
      case 'Available':
      case 'Approved':
      case 'Completed':
      case 'Active':
      case 'Excellent':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/10';

      case 'Partially Available':
      case 'Checked-Out':
      case 'In Progress':
      case 'Good':
        return 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/10';

      case 'Pending':
      case 'Reported':
      case 'Assigned':
      case 'Awaiting Inspection':
      case 'Fair':
      case 'Medium':
        return 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/10';

      case 'Under Maintenance':
      case 'Needs Maintenance':
      case 'High':
      case 'Critical':
      case 'Poor':
        return 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/10';

      case 'Fully Booked':
      case 'Unavailable':
      case 'Rejected':
      case 'Cancelled':
      case 'Retired':
      case 'Inactive':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 ring-slate-500/10';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border shadow-xs ${getBadgeStyle(
        status
      )}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
          ['Available', 'Approved', 'Completed'].includes(status)
            ? 'bg-emerald-500'
            : ['Under Maintenance', 'Critical', 'Rejected'].includes(status)
            ? 'bg-rose-500'
            : ['Pending', 'Reported', 'Assigned'].includes(status)
            ? 'bg-amber-500'
            : 'bg-blue-500'
        }`}
      />
      {status}
    </span>
  );
};

export default StatusBadge;

