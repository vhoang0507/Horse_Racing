import React, { useState } from 'react';
import {
  Row, Col, Card, Button, Table, Modal, Form, Input, DatePicker,
  InputNumber, Select, Typography, Space, Popconfirm, Spin, Tag, Tabs,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, PlayCircleOutlined, EyeOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import { useRaces, useTournaments, useCreateRace, useUpdateRace, useDeleteRace } from '../hooks/useData';
import { raceAPI } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import StatsCard from '../components/StatsCard';
import toast from 'react-hot-toast';

const { Title, Text } = Typography;
const { Option } = Select;

export default function RacesPage() {
  const { user } = useSelector((s) => s.auth);
  const isAdmin = user?.role === 'admin';
  const { data: races = [], isLoading, refetch } = useRaces();
  const { data: tournaments = [] } = useTournaments();
  const createMutation = useCreateRace();
  const updateMutation = useUpdateRace();
  const deleteMutation = useDeleteRace();

  const [modalOpen, setModalOpen] = useState(false);
  const [viewModal, setViewModal] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [form] = Form.useForm();

  const openCreate = () => { setEditingId(null); form.resetFields(); setModalOpen(true); };
  const openEdit = (record) => {
    setEditingId(record._id);
    form.setFieldsValue({ ...record, raceDate: dayjs(record.raceDate), tournament: record.tournament?._id });
    setModalOpen(true);
  };

  const handleSubmit = async (values) => {
    const payload = { ...values, raceDate: values.raceDate.toISOString() };
    if (editingId) await updateMutation.mutateAsync({ id: editingId, data: payload });
    else await createMutation.mutateAsync(payload);
    setModalOpen(false);
    form.resetFields();
  };

  const handleStart = async (raceId) => {
    try {
      await raceAPI.start(raceId);
      toast.success('Race started!');
      refetch();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to start race');
    }
  };

  const filteredRaces = activeTab === 'all' ? races : races.filter(r => r.status === activeTab);

  const columns = [
    {
      title: 'Race', dataIndex: 'name', key: 'name',
      render: (name, record) => (
        <div>
          <Text strong style={{ display: 'block' }}>{name}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.tournament?.name} · {record.trackLength}m {record.trackType}
          </Text>
        </div>
      ),
    },
    {
      title: 'Date', dataIndex: 'raceDate', key: 'date',
      render: (d) => dayjs(d).format('DD MMM YYYY, HH:mm'),
    },
    {
      title: 'Participants', dataIndex: 'participants', key: 'p',
      render: (p, r) => <Tag color="blue">{p?.length || 0}/{r.maxParticipants}</Tag>,
    },
    {
      title: 'Weather', dataIndex: 'weather', key: 'weather',
      render: (w) => {
        const icons = { clear: '☀️', cloudy: '☁️', windy: '💨', 'light rain': '🌧️' };
        return <span>{icons[w] || '🌤️'} {w}</span>;
      },
    },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s) => <StatusBadge status={s} /> },
    {
      title: 'Actions', key: 'actions',
      render: (_, record) => (
        <Space>
          <Button icon={<EyeOutlined />} size="small" onClick={() => setViewModal(record)} />
          {isAdmin && (
            <>
              {record.status === 'scheduled' && (
                <Button icon={<PlayCircleOutlined />} size="small" type="primary" style={{ background: '#22c55e', border: 'none' }}
                  onClick={() => handleStart(record._id)} />
              )}
              <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(record)} />
              <Popconfirm title="Delete this race?" onConfirm={() => deleteMutation.mutate(record._id)}>
                <Button icon={<DeleteOutlined />} size="small" danger />
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  const tabItems = [
    { key: 'all', label: `All (${races.length})` },
    { key: 'scheduled', label: `📅 Scheduled (${races.filter(r => r.status === 'scheduled').length})` },
    { key: 'in_progress', label: `🔥 In Progress (${races.filter(r => r.status === 'in_progress').length})` },
    { key: 'completed', label: `✅ Completed (${races.filter(r => r.status === 'completed').length})` },
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ marginBottom: 4 }}>🏁 Race Schedule</Title>
          <Text type="secondary">View and manage all races across tournaments</Text>
        </div>
        {isAdmin && (
          <Button type="primary" icon={<PlusOutlined />} size="large"
            onClick={openCreate}
            style={{ background: 'linear-gradient(135deg,#d4a017,#f5c842)', border: 'none', color: '#1a1a1a', fontWeight: 700, borderRadius: 10 }}>
            Schedule Race
          </Button>
        )}
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} lg={6}><StatsCard title="Total Races" value={races.length} icon="🏁" color="#d4a017" /></Col>
        <Col xs={12} lg={6}><StatsCard title="Scheduled" value={races.filter(r => r.status === 'scheduled').length} icon="📅" color="#3b82f6" /></Col>
        <Col xs={12} lg={6}><StatsCard title="In Progress" value={races.filter(r => r.status === 'in_progress').length} icon="🔥" color="#f59e0b" /></Col>
        <Col xs={12} lg={6}><StatsCard title="Completed" value={races.filter(r => r.status === 'completed').length} icon="✅" color="#22c55e" /></Col>
      </Row>

      <Card style={{ borderRadius: 16, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} style={{ marginBottom: 16 }} />
        {isLoading ? <div style={{ textAlign: 'center', padding: 40 }}><Spin size="large" /></div> : (
          <Table dataSource={filteredRaces} columns={columns} rowKey="_id"
            pagination={{ pageSize: 10, showSizeChanger: true }} />
        )}
      </Card>

      {/* View Modal */}
      <Modal title={<Text strong>🏁 Race Details</Text>} open={!!viewModal}
        onCancel={() => setViewModal(null)} footer={null} width={600}>
        {viewModal && (
          <div>
            <Title level={4}>{viewModal.name}</Title>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              {[
                ['Tournament', viewModal.tournament?.name],
                ['Date', dayjs(viewModal.raceDate).format('DD MMM YYYY, HH:mm')],
                ['Track Length', `${viewModal.trackLength}m`],
                ['Track Type', viewModal.trackType],
                ['Weather', viewModal.weather],
                ['Participants', `${viewModal.participants?.length || 0}/${viewModal.maxParticipants}`],
              ].map(([label, val]) => (
                <Col span={12} key={label} style={{ marginBottom: 12 }}>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>{label}</Text>
                  <Text strong>{val}</Text>
                </Col>
              ))}
            </Row>
            <Title level={5}>Participants ({viewModal.participants?.length || 0})</Title>
            {viewModal.participants?.map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0',
                borderBottom: '1px solid #f0f0f0' }}>
                <Tag color="gold">Lane {p.laneNumber}</Tag>
                <Text>{p.horse?.name || 'Unknown Horse'}</Text>
                <Text type="secondary">— {p.jockey?.name || 'No Jockey'}</Text>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Create/Edit Modal */}
      <Modal title={<Text strong>{editingId ? '✏️ Edit Race' : '➕ Schedule Race'}</Text>}
        open={modalOpen} onCancel={() => { setModalOpen(false); form.resetFields(); }} footer={null} width={600}>
        <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 16 }}>
          <Form.Item name="name" label="Race Name" rules={[{ required: true }]}>
            <Input placeholder="e.g. Sprint Qualifier Round 1" size="large" />
          </Form.Item>
          <Form.Item name="tournament" label="Tournament" rules={[{ required: true }]}>
            <Select size="large" placeholder="Select tournament">
              {tournaments.map(t => <Option key={t._id} value={t._id}>{t.name}</Option>)}
            </Select>
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="raceDate" label="Race Date & Time" rules={[{ required: true }]}>
                <DatePicker showTime style={{ width: '100%' }} size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="trackLength" label="Track Length (m)" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} size="large" min={400} max={5000} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="trackType" label="Track Type" rules={[{ required: true }]}>
                <Select size="large">
                  {['dirt', 'turf', 'synthetic'].map(t => <Option key={t} value={t}>{t}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="maxParticipants" label="Max Participants">
                <InputNumber style={{ width: '100%' }} size="large" min={2} max={20} defaultValue={12} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="weather" label="Expected Weather">
            <Select size="large" defaultValue="clear">
              {['clear', 'cloudy', 'windy', 'light rain'].map(w => <Option key={w} value={w}>{w}</Option>)}
            </Select>
          </Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button htmlType="submit" loading={createMutation.isPending || updateMutation.isPending}
              style={{ background: 'linear-gradient(135deg,#d4a017,#f5c842)', border: 'none', color: '#1a1a1a', fontWeight: 700 }}>
              {editingId ? 'Update' : 'Schedule'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
