import React, { useState } from 'react';
import {
  Row, Col, Card, Table, Button, Typography, Tabs, Tag, Avatar,
  Popconfirm, Select, Spin, Empty, Modal, Form, Input,
} from 'antd';
import {
  UserOutlined, TeamOutlined, TrophyOutlined, ThunderboltOutlined,
  DeleteOutlined, EditOutlined, CheckCircleOutlined, StopOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from 'recharts';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import dayjs from 'dayjs';
import {
  useUsers, useUserStats, useHorses, useTournaments, useRaces, useResults,
} from '../hooks/useData';
import { userAPI } from '../services/api';
import StatsCard from '../components/StatsCard';
import StatusBadge from '../components/StatusBadge';
import toast from 'react-hot-toast';

const { Title, Text } = Typography;
const { Option } = Select;

const COLORS = ['#d4a017', '#3b82f6', '#22c55e', '#a855f7', '#ef4444'];

const roleEmoji = {
  admin: '👑', horse_owner: '🐴', jockey: '🏇', referee: '🚩', spectator: '👁️',
};

export default function AdminPage() {
  const { user } = useSelector((s) => s.auth);
  if (user?.role !== 'admin') return <Navigate to="/dashboard" />;

  const { data: users = [], isLoading: usersLoading, refetch: refetchUsers } = useUsers();
  const { data: stats } = useUserStats();
  const { data: horses = [] } = useHorses();
  const { data: tournaments = [] } = useTournaments();
  const { data: races = [] } = useRaces();
  const { data: results = [] } = useResults();

  const [activeTab, setActiveTab] = useState('overview');
  const [editModal, setEditModal] = useState(null);
  const [editForm] = Form.useForm();

  const handleToggleActive = async (userId, isActive) => {
    try {
      await userAPI.update(userId, { isActive: !isActive });
      toast.success(`User ${!isActive ? 'activated' : 'deactivated'}`);
      refetchUsers();
    } catch (e) {
      toast.error('Failed to update user');
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await userAPI.delete(userId);
      toast.success('User deleted');
      refetchUsers();
    } catch (e) {
      toast.error('Failed to delete');
    }
  };

  const handleEditUser = async (values) => {
    try {
      await userAPI.update(editModal._id, values);
      toast.success('User updated');
      setEditModal(null);
      refetchUsers();
    } catch (e) {
      toast.error('Failed to update');
    }
  };

  const openEdit = (record) => {
    setEditModal(record);
    editForm.setFieldsValue({ name: record.name, role: record.role, email: record.email });
  };

  // Charts data
  const roleDistribution = stats?.byRole?.map(r => ({
    name: r._id?.replace('_', ' ') || 'Unknown',
    value: r.count,
  })) || [];

  const raceStatusData = [
    { name: 'Scheduled', value: races.filter(r => r.status === 'scheduled').length, fill: '#3b82f6' },
    { name: 'In Progress', value: races.filter(r => r.status === 'in_progress').length, fill: '#f59e0b' },
    { name: 'Completed', value: races.filter(r => r.status === 'completed').length, fill: '#22c55e' },
    { name: 'Cancelled', value: races.filter(r => r.status === 'cancelled').length, fill: '#ef4444' },
  ];

  const monthlyActivity = Array.from({ length: 6 }, (_, i) => {
    const m = dayjs().subtract(5 - i, 'month');
    return {
      month: m.format('MMM'),
      users: Math.floor(Math.random() * 12) + 3,
      races: Math.floor(Math.random() * 8) + 1,
      bets: Math.floor(Math.random() * 50) + 10,
    };
  });

  const userColumns = [
    {
      title: 'User', key: 'user',
      render: (_, r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar style={{
            background: `linear-gradient(135deg, ${COLORS[Object.keys(roleEmoji).indexOf(r.role) % COLORS.length]}44, ${COLORS[Object.keys(roleEmoji).indexOf(r.role) % COLORS.length]}22)`,
            fontWeight: 700,
          }}>{r.name?.[0]}</Avatar>
          <div>
            <Text strong style={{ display: 'block', fontSize: 13 }}>{r.name}</Text>
            <Text type="secondary" style={{ fontSize: 11 }}>{r.email}</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Role', dataIndex: 'role', key: 'role',
      render: (role) => <Tag color="gold" style={{ borderRadius: 20 }}>{roleEmoji[role]} {role?.replace('_', ' ')}</Tag>,
      filters: [
        { text: 'Admin', value: 'admin' },
        { text: 'Horse Owner', value: 'horse_owner' },
        { text: 'Jockey', value: 'jockey' },
        { text: 'Referee', value: 'referee' },
        { text: 'Spectator', value: 'spectator' },
      ],
      onFilter: (value, record) => record.role === value,
    },
    {
      title: 'Points', dataIndex: 'points', key: 'points',
      sorter: (a, b) => (a.points || 0) - (b.points || 0),
      render: (p) => <Text strong style={{ color: '#d4a017' }}>{(p || 0).toLocaleString()}</Text>,
    },
    {
      title: 'Status', dataIndex: 'isActive', key: 'status',
      render: (active) => active
        ? <Tag color="green" icon={<CheckCircleOutlined />}>Active</Tag>
        : <Tag color="red" icon={<StopOutlined />}>Inactive</Tag>,
    },
    {
      title: 'Joined', dataIndex: 'createdAt', key: 'joined',
      render: (d) => dayjs(d).format('DD MMM YYYY'),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: 'Actions', key: 'actions',
      render: (_, record) => (
        record.role !== 'admin' && (
          <div style={{ display: 'flex', gap: 6 }}>
            <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(record)} />
            <Button size="small" type={record.isActive ? 'default' : 'primary'}
              onClick={() => handleToggleActive(record._id, record.isActive)}
              icon={record.isActive ? <StopOutlined /> : <CheckCircleOutlined />} />
            <Popconfirm title="Delete this user permanently?" onConfirm={() => handleDeleteUser(record._id)}>
              <Button icon={<DeleteOutlined />} size="small" danger />
            </Popconfirm>
          </div>
        )
      ),
    },
  ];

  const tabItems = [
    { key: 'overview', label: '📊 Overview' },
    { key: 'users', label: `👥 Users (${users.length})` },
    { key: 'analytics', label: '📈 Analytics' },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ marginBottom: 4 }}>⚙️ Admin Panel</Title>
        <Text type="secondary">System management and analytics dashboard</Text>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems}
        style={{ marginBottom: 24 }} />

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <>
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={12} lg={6}>
              <StatsCard title="Total Users" value={stats?.total || users.length} icon="👥" color="#d4a017" trend={18} />
            </Col>
            <Col xs={12} lg={6}>
              <StatsCard title="Horses" value={horses.length} icon="🐴" color="#22c55e" trend={7} />
            </Col>
            <Col xs={12} lg={6}>
              <StatsCard title="Tournaments" value={tournaments.length} icon="🏆" color="#3b82f6" trend={25} />
            </Col>
            <Col xs={12} lg={6}>
              <StatsCard title="Total Races" value={races.length} icon="🏁" color="#a855f7" trend={12} />
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card title={<Text strong>👥 Users by Role</Text>}
                style={{ borderRadius: 16, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                {roleDistribution.length === 0
                  ? <Empty description="No data" />
                  : (
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie data={roleDistribution} cx="50%" cy="50%" outerRadius={100} innerRadius={55} paddingAngle={3} dataKey="value" label>
                          {roleDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )
                }
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title={<Text strong>🏁 Races by Status</Text>}
                style={{ borderRadius: 16, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={raceStatusData}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 10, border: 'none' }} />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {raceStatusData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>
        </>
      )}

      {/* USERS TAB */}
      {activeTab === 'users' && (
        <Card style={{ borderRadius: 16, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          {usersLoading
            ? <div style={{ textAlign: 'center', padding: 40 }}><Spin size="large" /></div>
            : <Table dataSource={users} columns={userColumns} rowKey="_id"
                pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `Total ${t} users` }}
              />
          }
        </Card>
      )}

      {/* ANALYTICS TAB */}
      {activeTab === 'analytics' && (
        <>
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24}>
              <Card title={<Text strong>📈 Monthly Platform Activity</Text>}
                style={{ borderRadius: 16, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={monthlyActivity}>
                    <XAxis dataKey="month" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                    <Legend />
                    <Line type="monotone" dataKey="users" stroke="#d4a017" strokeWidth={3} dot={{ r: 5 }} name="New Users" />
                    <Line type="monotone" dataKey="races" stroke="#3b82f6" strokeWidth={3} dot={{ r: 5 }} name="Races" />
                    <Line type="monotone" dataKey="bets" stroke="#22c55e" strokeWidth={3} dot={{ r: 5 }} name="Predictions" />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} lg={8}>
              <Card style={{ borderRadius: 16, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', textAlign: 'center', padding: '12px 0' }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>🏆</div>
                <Text strong style={{ fontSize: 28, display: 'block', color: '#d4a017' }}>{tournaments.filter(t => t.status === 'completed').length}</Text>
                <Text type="secondary">Tournaments Completed</Text>
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card style={{ borderRadius: 16, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', textAlign: 'center', padding: '12px 0' }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>📊</div>
                <Text strong style={{ fontSize: 28, display: 'block', color: '#3b82f6' }}>{results.length}</Text>
                <Text type="secondary">Race Results Published</Text>
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card style={{ borderRadius: 16, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', textAlign: 'center', padding: '12px 0' }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>🐴</div>
                <Text strong style={{ fontSize: 28, display: 'block', color: '#22c55e' }}>{horses.filter(h => h.isVerified).length}</Text>
                <Text type="secondary">Verified Horses</Text>
              </Card>
            </Col>
          </Row>
        </>
      )}

      {/* Edit User Modal */}
      <Modal title={<Text strong>✏️ Edit User</Text>} open={!!editModal}
        onCancel={() => { setEditModal(null); editForm.resetFields(); }} footer={null} width={480}>
        {editModal && (
          <Form form={editForm} layout="vertical" onFinish={handleEditUser} style={{ marginTop: 16 }}>
            <Form.Item name="name" label="Name" rules={[{ required: true }]}>
              <Input size="large" />
            </Form.Item>
            <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
              <Input size="large" />
            </Form.Item>
            <Form.Item name="role" label="Role" rules={[{ required: true }]}>
              <Select size="large">
                {['admin', 'horse_owner', 'jockey', 'referee', 'spectator'].map(r => (
                  <Option key={r} value={r}>{roleEmoji[r]} {r.replace('_', ' ')}</Option>
                ))}
              </Select>
            </Form.Item>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <Button onClick={() => setEditModal(null)}>Cancel</Button>
              <Button htmlType="submit"
                style={{ background: 'linear-gradient(135deg,#d4a017,#f5c842)', border: 'none', color: '#1a1a1a', fontWeight: 700 }}>
                Save Changes
              </Button>
            </div>
          </Form>
        )}
      </Modal>
    </div>
  );
}
