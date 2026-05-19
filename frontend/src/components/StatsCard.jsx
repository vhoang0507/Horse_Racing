import React from 'react';
import { Card, Statistic } from 'antd';
import { ArrowUpOutlined } from '@ant-design/icons';

const StatsCard = ({ title, value, prefix, suffix, icon, color = '#d4a017', trend }) => (
  <Card
    className="hover-lift"
    style={{
      borderRadius: 16,
      border: 'none',
      background: `linear-gradient(135deg, ${color}15, ${color}05)`,
      borderLeft: `4px solid ${color}`,
    }}
    bodyStyle={{ padding: '20px 24px' }}
  >
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <div style={{ fontSize: 12, color: '#8892a4', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
          {title}
        </div>
        <Statistic
          value={value}
          prefix={prefix}
          suffix={suffix}
          valueStyle={{ fontSize: 28, fontWeight: 800, color }}
        />
        {trend != null && (
          <div style={{ marginTop: 6, fontSize: 12, color: trend >= 0 ? '#22c55e' : '#ef4444' }}>
            <ArrowUpOutlined style={{ transform: trend < 0 ? 'rotate(180deg)' : 'none' }} />
            {' '}{Math.abs(trend)}% this month
          </div>
        )}
      </div>
      <div style={{
        width: 56, height: 56, borderRadius: 14, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: `linear-gradient(135deg, ${color}30, ${color}15)`,
        fontSize: 26,
      }}>
        {icon}
      </div>
    </div>
  </Card>
);

export default StatsCard;
