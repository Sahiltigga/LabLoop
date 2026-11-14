import React from 'react';
import { Sparkles, ArrowRight, CheckCircle2, Building, ShieldCheck } from 'lucide-react';

export const RecommendationCard = ({
  recommendation,
  type = 'idle', // 'idle' or 'match'
  onAction,
}) => {
  const isMatch = type === 'match';
  const score = isMatch ? recommendation.score : recommendation.idleScore;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between relative overflow-hidden">
      {/* Top Tag & Score Badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center space-x-1.5 text-xs font-semibold text-primary-600 bg-primary-50 px-2.5 py-1 rounded-lg">
          <Sparkles className="w-3.5 h-3.5" />
          <span>
            {isMatch ? 'Inter-Department Match' : 'Resource Sharing Opportunity'}
          </span>
        </div>

        {/* Score indicator */}
        <div className="flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span>{score}%</span>
          <span className="text-[10px] text-emerald-600 font-normal">
            {isMatch ? 'Match' : 'Idle Score'}
          </span>
        </div>
      </div>

      {/* Equipment Information */}
      <div className="mt-3">
        <h4 className="font-semibold text-slate-900 text-base leading-snug">
          {isMatch ? recommendation.equipment?.name : recommendation.equipmentName}
        </h4>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500 font-mono">
          <span>
            {isMatch
              ? recommendation.equipment?.equipmentCode
              : recommendation.equipmentCode}
          </span>
          <span>•</span>
          <span className="font-sans font-medium text-slate-600">
            {isMatch
              ? recommendation.equipment?.department?.name
              : recommendation.department?.name}
          </span>
        </div>

        {/* Progress bar for match / idle score */}
        <div className="mt-3">
          <div className="flex justify-between text-[11px] font-medium text-slate-500 mb-1">
            <span>Optimization Confidence</span>
            <span className="font-semibold text-slate-800">{score}/100</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                score >= 80
                  ? 'bg-emerald-500'
                  : score >= 60
                  ? 'bg-blue-500'
                  : 'bg-amber-500'
              }`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>

        {/* Explainable Logic Text */}
        <p className="mt-3 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl leading-relaxed border border-slate-100">
          {recommendation.explanation}
        </p>

        {/* Score Breakdown (if match) */}
        {isMatch && recommendation.scoreBreakdown && (
          <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Category Match: {recommendation.scoreBreakdown.categoryCompatibility}/30</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Availability: {recommendation.scoreBreakdown.availabilityCompatibility}/25</span>
            </div>
          </div>
        )}
      </div>

      {/* Action Footer */}
      {onAction && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={() => onAction(recommendation)}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold rounded-xl flex items-center space-x-1.5 shadow-2xs hover:shadow-xs transition-all"
          >
            <span>{isMatch ? 'Request Sharing Transfer' : 'Review Sharing Option'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default RecommendationCard;

