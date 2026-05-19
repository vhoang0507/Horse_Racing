import React from 'react';
import { Row, Col, Typography, Card, Table, Tag, Spin, Empty } from 'antd';
import { TrophyOutlined, ThunderboltOutlined, TeamOutlined, ScheduleOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { useTournaments, useRaces, useHorses, useUsers, useResults } from '../hooks/useData';
import StatsCard from '../components/StatsCard';
import StatusBadge from '../components/StatusBadge';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const COLORS = ['#d4a017', '#f5c842', '#a07810', '#3b82f6', '#22c55e'];

export default function DashboardPage() {
  const { user } = useSelector((s) => s.auth);
  const { data: tournaments = [], isLoading: tLoading } = useTournaments();
  const { data: races = [], isLoading: rLoading } = useRaces();
  const { data: horses = [] } = useHorses();
  const { data: results = [] } = useResults();

  const upcomingRaces = races.filter(r => r.status === 'scheduled' || r.status === 'in_progress').slice(0, 5);
  const ongoingTournaments = tournaments.filter(t => t.status === 'ongoing').length;
  const completedRaces = races.filter(r => r.status === 'completed').length;

  // Chart data
  const racesByStatus = [
    { name: 'Scheduled', value: races.filter(r => r.status === 'scheduled').length },
    { name: 'In Progress', value: races.filter(r => r.status === 'in_progress').length },
    { name: 'Completed', value: races.filter(r => r.status === 'completed').length },
  ];

  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const m = dayjs().subtract(5 - i, 'month');
    return {
      month: m.format('MMM'),
      races: Math.floor(Math.random() * 8) + 2,
      horses: Math.floor(Math.random() * 20) + 5,
    };
  });

  const raceColumns = [
    { title: 'Race', dataIndex: 'name', key: 'name', render: (t) => <Text strong>{t}</Text> },
    { title: 'Date', dataIndex: 'raceDate', key: 'date', render: (d) => dayjs(d).format('DD MMM YYYY HH:mm') },
    { title: 'Track', dataIndex: 'trackLength', key: 'track', render: (l) => `${l}m` },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s) => <StatusBadge status={s} /> },
    { title: 'Participants', dataIndex: 'participants', key: 'p', render: (p) => p?.length || 0 },
  ];

  if (tLoading || rLoading) return <div style={{ textAlign: 'center', paddingTop: 80 }}><Spin size="large" /></div>;

  return (
    <div>
      {/* Welcome */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e, #2d1b0e)',
        borderRadius: 20, padding: '28px 32px', marginBottom: 24,
        border: '1px solid rgba(212,160,23,0.2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <Title level={3} style={{ color: '#fff', marginBottom: 4 }}>
              👋 Welcome back, <span style={{ color: '#d4a017' }}>{user?.name}</span>!
            </Title>
            <Text style={{ color: '#8892a4' }}>
              Here's what's happening in the racing world today.
            </Text>
          </div>
          <div style={{ fontSize: 60 }}>🏇</div>
        </div>
      </div>

      {/* Stats cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard title="Tournaments" value={tournaments.length} icon="🏆" color="#d4a017" trend={12} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard title="Total Races" value={races.length} icon="🏁" color="#3b82f6" trend={8} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard title="Horses" value={horses.length} icon="🐴" color="#22c55e" trend={5} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard title="Completed Races" value={completedRaces} icon="✅" color="#a855f7" trend={15} />
        </Col>
      </Row>

      {/* Charts row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={16}>
          <Card title={<Text strong>Racing Activity (Last 6 Months)</Text>}
            style={{ borderRadius: 16, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorRaces" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d4a017" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#d4a017" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorHorses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                <Legend />
                <Area type="monotone" dataKey="races" stroke="#d4a017" fill="url(#colorRaces)" strokeWidth={2} name="Races" />
                <Area type="monotone" dataKey="horses" stroke="#3b82f6" fill="url(#colorHorses)" strokeWidth={2} name="Horses" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title={<Text strong>Races by Status</Text>}
            style={{ borderRadius: 16, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', height: '100%' }}>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={racesByStatus} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value">
                  {racesByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Upcoming races table */}
      <Card
        title={<Text strong>📅 Upcoming & Ongoing Races</Text>}
        style={{ borderRadius: 16, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}
      >
        {upcomingRaces.length === 0
          ? <Empty description="No upcoming races" />
          : <Table
              dataSource={upcomingRaces}
              columns={raceColumns}
              rowKey="_id"
              pagination={false}
              size="middle"
            />
        }
      </Card>
    </div>
  );
}
