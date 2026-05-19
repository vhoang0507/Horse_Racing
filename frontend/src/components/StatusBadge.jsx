import React from 'react';
import { Tag } from 'antd';

const statusConfig = {
  upcoming:    { color: 'blue',    label: 'Upcoming' },
  ongoing:     { color: 'green',   label: 'Ongoing' },
  completed:   { color: 'default', label: 'Completed' },
  cancelled:   { color: 'red',     label: 'Cancelled' },
  scheduled:   { color: 'purple',  label: 'Scheduled' },
  in_progress: { color: 'orange',  label: 'In Progress' },
  available:   { color: 'green',   label: 'Available' },
  racing:      { color: 'orange',  label: 'Racing' },
  injured:     { color: 'red',     label: 'Injured' },
  retired:     { color: 'default', label: 'Retired' },
  pending:     { color: 'blue',    label: 'Pending' },
  won:         { color: 'green',   label: 'Won' },
  lost:        { color: 'red',     label: 'Lost' },
  approved:    { color: 'green',   label: 'Approved' },
  rejected:    { color: 'red',     label: 'Rejected' },
};

const StatusBadge = ({ status }) => {
  const cfg = statusConfig[status] || { color: 'default', label: status };
  return <Tag color={cfg.color} style={{ borderRadius: 20, fontWeight: 600, fontSize: 11, textTransform: 'uppercase' }}>{cfg.label}</Tag>;
};

export default StatusBadge;
