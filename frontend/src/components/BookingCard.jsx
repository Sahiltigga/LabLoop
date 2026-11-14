import React from 'react';
import StatusBadge from './StatusBadge';
import { Calendar, Clock, User, Building, Check, X, LogIn, LogOut, Trash2 } from 'lucide-react';

export const BookingCard = ({
  booking,
  currentUserRole,
  onApprove,
  onReject,
  onCheckIn,
  onCheckOut,
  onCancel,
}) => {
  const start = new Date(booking.startTime);
  const end = new Date(booking.endTime);
  const durationHours = Math.max(0.5, ((end - start) / (1000 * 60 * 60))).toFixed(1);

  const isPending = booking.status === 'Pending';
  const isApproved = booking.status === 'Approved';
  const isCheckedOut = booking.status === 'Checked-Out';
  const isCompleted = booking.status === 'Completed';

  const canManageStatus =
    ['admin', 'faculty'].includes(currentUserRole) && isPending;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
      <div>
        {/* Top bar */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h4 className="font-semibold text-slate-900 text-base leading-snug">
              {booking.equipment?.name || 'Equipment Reservation'}
            </h4>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              {booking.equipment?.equipmentCode || 'CODE'} • {booking.requestedQuantity} unit(s)
            </p>
          </div>
          <StatusBadge status={booking.status} />
        </div>

        {/* User Info (Visible to Faculty/Admin/Tech) */}
        {booking.user && (
          <div className="mt-3 flex items-center space-x-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl">
            <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="font-medium text-slate-800">{booking.user.name}</span>
            <span className="text-slate-400">({booking.user.role})</span>
            {booking.user.studentOrEmployeeId && (
              <span className="text-slate-400 font-mono">
                • {booking.user.studentOrEmployeeId}
              </span>
            )}
          </div>
        )}

        {/* Time and Duration */}
        <div className="mt-3 space-y-1.5 text-xs text-slate-600">
          <div className="flex items-center space-x-2">
            <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span>
              {start.toLocaleDateString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span>
              {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
              {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({durationHours} hrs)
            </span>
          </div>
          {booking.department && (
            <div className="flex items-center space-x-2">
              <Building className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span>Dept: {booking.department.name}</span>
            </div>
          )}
        </div>

        {/* Purpose */}
        <div className="mt-3 text-xs bg-blue-50/50 border border-blue-100/60 p-2.5 rounded-xl">
          <span className="font-semibold text-slate-700">Purpose: </span>
          <span className="text-slate-600 leading-relaxed">{booking.purpose}</span>
        </div>

        {/* Rejection / Note */}
        {booking.rejectionReason && (
          <div className="mt-2 text-xs bg-rose-50 border border-rose-100 p-2 rounded-xl text-rose-700">
            <span className="font-semibold">Rejection Reason: </span>
            <span>{booking.rejectionReason}</span>
          </div>
        )}

        {/* Recorded actual usage */}
        {booking.actualUsageHours > 0 && (
          <div className="mt-2 text-xs text-slate-500 font-medium">
            Recorded usage: {booking.actualUsageHours} hours
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
        {/* Faculty / Admin Approval Actions */}
        {canManageStatus && (
          <>
            <button
              onClick={() => onApprove(booking._id)}
              className="flex-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-1 transition-colors shadow-2xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Approve</span>
            </button>
            <button
              onClick={() => onReject(booking._id)}
              className="flex-1 py-1.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reject</span>
            </button>
          </>
        )}

        {/* Check-In / Handover Button */}
        {isApproved && onCheckIn && (
          <button
            onClick={() => onCheckIn(booking._id)}
            className="flex-1 py-1.5 px-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-1 transition-colors shadow-2xs"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Check Out Equipment</span>
          </button>
        )}

        {/* Check-Out / Return Button */}
        {isCheckedOut && onCheckOut && (
          <button
            onClick={() => onCheckOut(booking._id)}
            className="flex-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-1 transition-colors shadow-2xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Return Equipment</span>
          </button>
        )}

        {/* Cancel Button (For pending or approved bookings) */}
        {(isPending || isApproved) && onCancel && (
          <button
            onClick={() => onCancel(booking._id)}
            className="py-1.5 px-2.5 text-xs text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
            title="Cancel Reservation"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default BookingCard;

