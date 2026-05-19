import React, { useState } from 'react';
import {
  Row, Col, Card, Button, Table, Tag, Modal, Form, Input, DatePicker,
  InputNumber, Select, Typography, Space, Popconfirm, Spin,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, TrophyOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import { useTournaments, useCreateTournament, useUpdateTournament, useDeleteTournament } from '../hooks/useData';
import StatusBadge from '../components/StatusBadge';
import StatsCard from '../components/StatsCard';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export default function TournamentsPage() {
  const { user } = useSelector((s) => s.auth);
  const isAdmin = user?.role === 'admin';
  const { data: tournaments = [], isLoading } = useTournaments();
  const createMutation = useCreateTournament();
  const updateMutation = useUpdateTournament();
  const deleteMutation = useDeleteTournament();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  const openCreate = () => { setEditingId(null); form.resetFields(); setModalOpen(true); };
  const openEdit = (record) => {
    setEditingId(record._id);
    form.setFieldsValue({
      ...record,
      startDate: dayjs(record.startDate),
      endDate: dayjs(record.endDate),
    });
    setModalOpen(true);
  };

  const handleSubmit = async (values) => {
    const payload = {
      ...values,
      startDate: values.startDate.toISOString(),
      endDate: values.endDate.toISOString(),
    };
    if (editingId) {
      await updateMutation.mutateAsync({ id: editingId, data: payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    setModalOpen(false);
    form.resetFields();
  };

  const stats = {
    total: tournaments.length,
    upcoming: tournaments.filter(t => t.status === 'upcoming').length,
    ongoing: tournaments.filter(t => t.status === 'ongoing').length,
    completed: tournaments.filter(t => t.status === 'completed').length,
  };

  const columns = [
    {
      title: 'Tournament', dataIndex: 'name', key: 'name',
      render: (name, record) => (
        <div>
          <Text strong style={{ display: 'block' }}>{name}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>📍 {record.location}</Text>
        </div>
      ),
    },
    {
      title: 'Dates', key: 'dates',
      render: (_, r) => (
        <div>
          <div style={{ fontSize: 12, color: '#8892a4' }}>Start: {dayjs(r.startDate).format('DD MMM YYYY')}</div>
          <div style={{ fontSize: 12, color: '#8892a4' }}>End: {dayjs(r.endDate).format('DD MMM YYYY')}</div>
        </div>
      ),
    },
    {
      title: 'Prize Pool', dataIndex: 'prizePool', key: 'prize',
      render: (v) => <Text strong style={{ color: '#d4a017' }}>₫{Number(v).toLocaleString()}</Text>,
    },
    {
      title: 'Max Horses', dataIndex: 'maxHorses', key: 'maxHorses',
      render: (v) => <Tag color="blue">{v} horses</Tag>,
    },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s) => <StatusBadge status={s} /> },
    ...(isAdmin ? [{
      title: 'Actions', key: 'actions',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(record)} />
          <Popconfirm title="Delete this tournament?" onConfirm={() => deleteMutation.mutate(record._id)}>
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    }] : []),
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ marginBottom: 4 }}>🏆 Tournament Management</Title>
          <Text type="secondary">Manage all racing championships and events</Text>
        </div>
        {isAdmin && (
          <Button type="primary" icon={<PlusOutlined />} size="large"
            onClick={openCreate}
            style={{ background: 'linear-gradient(135deg,#d4a017,#f5c842)', border: 'none', color: '#1a1a1a', fontWeight: 700, borderRadius: 10 }}>
            New Tournament
          </Button>
        )}
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} lg={6}><StatsCard title="Total" value={stats.total} icon="🏆" color="#d4a017" /></Col>
        <Col xs={12} lg={6}><StatsCard title="Upcoming" value={stats.upcoming} icon="⏳" color="#3b82f6" /></Col>
        <Col xs={12} lg={6}><StatsCard title="Ongoing" value={stats.ongoing} icon="🔥" color="#22c55e" /></Col>
        <Col xs={12} lg={6}><StatsCard title="Completed" value={stats.completed} icon="✅" color="#a855f7" /></Col>
      </Row>

      <Card style={{ borderRadius: 16, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
        {isLoading ? <div style={{ textAlign: 'center', padding: 40 }}><Spin size="large" /></div> : (
          <Table
            dataSource={tournaments}
            columns={columns}
            rowKey="_id"
            pagination={{ pageSize: 10, showSizeChanger: true }}
          />
        )}
      </Card>

      <Modal
        title={<Text strong>{editingId ? '✏️ Edit Tournament' : '➕ New Tournament'}</Text>}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 16 }}>
          <Form.Item name="name" label="Tournament Name" rules={[{ required: true }]}>
            <Input placeholder="e.g. Vietnam Grand Prix 2025" size="large" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <TextArea rows={3} placeholder="Tournament description..." />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="startDate" label="Start Date" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="endDate" label="End Date" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} size="large" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="location" label="Location" rules={[{ required: true }]}>
            <Input placeholder="e.g. Hanoi Racecourse" size="large" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="prizePool" label="Prize Pool (₫)" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} size="large" min={0} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="maxHorses" label="Max Horses" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} size="large" min={2} max={50} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="status" label="Status">
            <Select size="large" defaultValue="upcoming">
              {['upcoming', 'ongoing', 'completed', 'cancelled'].map(s => (
                <Option key={s} value={s}><StatusBadge status={s} /></Option>
              ))}
            </Select>
          </Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button htmlType="submit" loading={createMutation.isPending || updateMutation.isPending}
              style={{ background: 'linear-gradient(135deg,#d4a017,#f5c842)', border: 'none', color: '#1a1a1a', fontWeight: 700 }}>
              {editingId ? 'Update' : 'Create'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
