import React from 'react';
import { Check, Clock, AlertTriangle, UserCheck, Play, CheckCircle } from 'lucide-react';

const STAGES = [
  { id: 'Submitted', label: 'Submitted', icon: Clock },
  { id: 'Under Review', label: 'Under Review', icon: Clock },
  { id: 'Assigned', label: 'Assigned', icon: UserCheck },
  { id: 'In Progress', label: 'In Progress', icon: Play },
  { id: 'Resolved', label: 'Resolved', icon: CheckCircle },
];

export const VisualTimeline = ({ currentStatus, resolvedAt }) => {
  const isRejected = currentStatus === 'Rejected';

  const getStageIndex = (status) => {
    switch (status) {
      case 'Submitted': return 0;
      case 'Under Review': return 1;
      case 'Assigned': return 2;
      case 'In Progress': return 3;
      case 'Resolved': return 4;
      default: return 0;
    }
  };

  const currentIndex = getStageIndex(currentStatus);

  if (isRejected) {
    return (
      <div style={{ padding: '16px', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '12px', textAlign: 'center', margin: '20px 0' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#be123c', fontWeight: 600 }}>
          <AlertTriangle size={18} />
          <span>This complaint has been reviewed and marked as Rejected.</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ margin: '20px 0 28px 0' }}>
      <div className="timeline-track">
        {STAGES.map((stage, idx) => {
          const isCompleted = idx < currentIndex;
          const isActive = idx === currentIndex;
          const StepIcon = stage.icon;

          return (
            <div
              key={stage.id}
              className={`timeline-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
            >
              <div className="timeline-node">
                {isCompleted ? <Check size={18} strokeWidth={3} /> : <StepIcon size={16} />}
              </div>
              <span className="timeline-label">{stage.label}</span>
              {isActive && (
                <span style={{ fontSize: '0.65rem', color: 'var(--primary-600)', fontWeight: 700, marginTop: '2px' }}>
                  Current
                </span>
              )}
              {stage.id === 'Resolved' && resolvedAt && idx <= currentIndex && (
                <span style={{ fontSize: '0.65rem', color: '#16a34a', marginTop: '2px' }}>
                  {new Date(resolvedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
