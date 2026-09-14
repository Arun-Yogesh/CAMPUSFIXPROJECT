import React from 'react';
import { Clock, Eye, UserCheck, Play, CheckCircle, XCircle } from 'lucide-react';

export const StatusBadge = ({ status }) => {
  const getBadgeConfig = (st) => {
    switch (st) {
      case 'Submitted':
        return { className: 'badge-submitted', icon: Clock, label: 'Submitted' };
      case 'Under Review':
        return { className: 'badge-review', icon: Eye, label: 'Under Review' };
      case 'Assigned':
        return { className: 'badge-assigned', icon: UserCheck, label: 'Assigned' };
      case 'In Progress':
        return { className: 'badge-progress', icon: Play, label: 'In Progress' };
      case 'Resolved':
        return { className: 'badge-resolved', icon: CheckCircle, label: 'Resolved' };
      case 'Rejected':
        return { className: 'badge-rejected', icon: XCircle, label: 'Rejected' };
      default:
        return { className: 'badge-low', icon: Clock, label: st || 'Unknown' };
    }
  };

  const config = getBadgeConfig(status);
  const Icon = config.icon;

  return (
    <span className={`badge ${config.className}`}>
      <Icon size={12} strokeWidth={2.5} />
      <span>{config.label}</span>
    </span>
  );
};
