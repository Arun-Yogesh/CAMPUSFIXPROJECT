import React from 'react';
import { AlertCircle, AlertTriangle, ArrowDown, ArrowUp } from 'lucide-react';

export const PriorityBadge = ({ priority }) => {
  const getConfig = (p) => {
    switch (p) {
      case 'Critical':
        return { className: 'badge-critical', icon: AlertCircle, label: 'Critical' };
      case 'High':
        return { className: 'badge-high', icon: AlertTriangle, label: 'High' };
      case 'Medium':
        return { className: 'badge-medium', icon: ArrowUp, label: 'Medium' };
      case 'Low':
        return { className: 'badge-low', icon: ArrowDown, label: 'Low' };
      default:
        return { className: 'badge-low', icon: ArrowDown, label: p || 'Normal' };
    }
  };

  const config = getConfig(priority);
  const Icon = config.icon;

  return (
    <span className={`badge ${config.className}`}>
      <Icon size={12} strokeWidth={2.5} />
      <span>{config.label}</span>
    </span>
  );
};
