import React, { useState } from 'react';
import {
  Row, Col, Card, Button, Table, Modal, Form, Input, InputNumber,
  Select, Typography, Space, Popconfirm, Spin, Tag, Avatar, Tabs,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined,
  MailOutlined, TrophyOutlined
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import {
  useHorses, useCreateHorse, useUpdateHorse, useDeleteHorse, useJockeys,
  useInvitations, useCreateInvitation, useConfirmInvitation
} from '../hooks/useData';
import StatusBadge from '../components/StatusBadge';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const breedColors = {
  Thoroughbred: 'gold', Arabian: 'purple', 'Quarter Horse': 'blue',
  Standardbred: 'green', Appaloosa: 'orange'
};

export default function HorsesPage() {
  const { user } = useSelector((s) => s.auth);
  const isOwner = user?.role === 'horse_owner';
  const isAdmin = user?.role === 'admin';
  const canManage = isOwner || isAdmin;

  const { data: horses = [], isLoading, refetch: refetchHorses } = useHorses(isOwner ? { owner: user._id } : {});
  const { data: jockeys = [] } = useJockeys();
  const { data: invitations = [], refetch: refetchInvitations } = useInvitations();
  
  const createMutation = useCreateHorse();
  const updateMutation = useUpdateHorse();
  const deleteMutation = useDeleteHorse();
  const createInviteMutation = useCreateInvitation();
  const confirmInviteMutation = useConfirmInvitation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewHorse, setViewHorse] = useState(null);
  const [activeTab, setActiveTab] = useState('horses');

  // Invitation Modal States
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteHorse, setInviteHorse] = useState(null);
  const [inviteForm] = Form.useForm();
  const [form] = Form.useForm();

  const openCreate = () => { setEditingId(null); form.resetFields(); setModalOpen(true); };
  const openEdit = (record) => {
    setEditingId(record._id);
    form.setFieldsValue({ ...record, jockey: record.jockey?._id });
    setModalOpen(true);
  };

  const handleSubmit = async (values) => {
    if (editingId) await updateMutation.mutateAsync({ id: editingId, data: values });
    else await createMutation.mutateAsync(values);
    setModalOpen(false);
    form.resetFields();
    refetchHorses();
  };

  const handleOpenInvite = (horse) => {
    setInviteHorse(horse);
    inviteForm.resetFields();
    setInviteModalOpen(true);
  };

  const handleSendInvitation = async (values) => {
    await createInviteMutation.mutateAsync({
      horseId: inviteHorse._id,
      jockeyId: values.jockeyId,
    });
    setInviteModalOpen(false);
    refetchInvitations();
  };

  const handleConfirmJockey = async (inviteId) => {
    await confirmInviteMutation.mutateAsync(inviteId);
    refetchHorses();
    refetchInvitations();
  };

  const columns = [
    {
      title: 'Horse', key: 'horse',
      render: (_, r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar size={42} style={{
            background: `linear-gradient(135deg, #d4a017, #f5c842)`,
            fontSize: 20, flexShrink: 0,
          }}>🐴</Avatar>
          <div>
            <Text strong style={{ display: 'block' }}>{r.name}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>{r.color} · {r.age} yrs</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Breed', dataIndex: 'breed', key: 'breed',
      render: (b) => <Tag color={breedColors[b] || 'default'}>{b}</Tag>,
    },
    { title: 'Weight', dataIndex: 'weight', key: 'weight', render: (w) => `${w} kg` },
    {
      title: 'Jockey', key: 'jockey',
      render: (_, r) => {
        if (r.jockey) return <Tag color="purple">{r.jockey.name}</Tag>;
        if (isOwner) {
          return (
            <Button size="small" type="dashed" icon={<MailOutlined />} onClick={() => handleOpenInvite(r)}>
              Invite Jockey
            </Button>
          );
        }
        return <Text type="secondary">Unassigned</Text>;
      },
    },
    {
      title: 'Record', key: 'record',
      render: (_, r) => (
        <div>
          <span style={{ color: '#22c55e', fontWeight: 700 }}>{r.wins}W</span>
          {' / '}
          <span style={{ color: '#ef4444', fontWeight: 700 }}>{r.losses}L</span>
          <span style={{ color: '#8892a4' }}> ({r.totalRaces} races)</span>
        </div>
      ),
    },
    {
      title: 'Verified', dataIndex: 'isVerified', key: 'verified',
      render: (v) => v
        ? <CheckCircleOutlined style={{ color: '#22c55e', fontSize: 18 }} />
        : <Tag color="orange">Pending</Tag>,
    },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s) => <StatusBadge status={s} /> },
    {
      title: 'Actions', key: 'actions',
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => setViewHorse(record)}>View</Button>
          {canManage && (
            <>
              <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(record)} />
              <Popconfirm title="Delete horse?" onConfirm={() => deleteMutation.mutate(record._id)}>
                <Button icon={<DeleteOutlined />} size="small" danger />
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  const invitationColumns = [
    {
      title: 'Horse',
      key: 'horse',
      render: (_, r) => r.horse?.name || 'Unknown Horse',
    },
    {
      title: 'Jockey',
      key: 'jockey',
      render: (_, r) => (
        <div>
          <Text strong style={{ display: 'block' }}>{r.jockey?.name}</Text>
          <Text type="secondary" style={{ fontSize: 11 }}>{r.jockey?.email}</Text>
        </div>
      ),
    },
    {
      title: 'Sent Date',
      dataIndex: 'createdAt',
      key: 'date',
      render: (d) => dayjs(d).format('DD MMM YYYY, HH:mm'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (s) => {
        const colors = {
          pending: 'orange',
          accepted: 'cyan',
          rejected: 'red',
          confirmed: 'green',
          declined: 'default',
        };
        const labels = {
          pending: '⏳ Pending response',
          accepted: '👍 Accepted (Action Required)',
          rejected: '❌ Declined',
          confirmed: '🏆 Confirmed',
          declined: '⚠️ Passed Over',
        };
        return <Tag color={colors[s] || 'default'}>{labels[s] || s}</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => {
        if (record.status === 'accepted') {
          return (
            <Button
              type="primary"
              size="small"
              icon={<TrophyOutlined />}
              style={{ background: '#22c55e', border: 'none', fontWeight: 700 }}
              onClick={() => handleConfirmJockey(record._id)}
            >
              Confirm Jockey
            </Button>
          );
        }
        return null;
      },
    },
  ];

  const tabItems = [
    {
      key: 'horses',
      label: `🐴 My Horses (${horses.length})`,
      children: (
        <Table dataSource={horses} columns={columns} rowKey="_id" pagination={{ pageSize: 10 }} />
      ),
    },
    isOwner && {
      key: 'invitations',
      label: `✉️ Sent Invitations (${invitations.length})`,
      children: (
        <Table dataSource={invitations} columns={invitationColumns} rowKey="_id" pagination={{ pageSize: 10 }} />
      ),
    },
  ].filter(Boolean);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ marginBottom: 4 }}>🐴 Horse Management</Title>
          <Text type="secondary">Manage your registered horses and invitations</Text>
        </div>
        {canManage && (
          <Button type="primary" icon={<PlusOutlined />} size="large" onClick={openCreate}
            style={{ background: 'linear-gradient(135deg,#d4a017,#f5c842)', border: 'none', color: '#1a1a1a', fontWeight: 700, borderRadius: 10 }}>
            Register Horse
          </Button>
        )}
      </div>

      <Card style={{ borderRadius: 16, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><Spin size="large" /></div>
        ) : isOwner ? (
          <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
        ) : (
          <Table dataSource={horses} columns={columns} rowKey="_id" pagination={{ pageSize: 10 }} />
        )}
      </Card>

      {/* Invite Jockey Modal */}
      <Modal
        title={<Text strong>✉️ Send Jockey Invitation</Text>}
        open={inviteModalOpen}
        onCancel={() => setInviteModalOpen(false)}
        footer={null}
        width={480}
      >
        {inviteHorse && (
          <Form form={inviteForm} layout="vertical" onFinish={handleSendInvitation} style={{ marginTop: 16 }}>
            <div style={{ padding: 12, background: '#f8fafc', borderRadius: 10, marginBottom: 16, border: '1px dashed #d4a017' }}>
              <Text strong style={{ display: 'block' }}>Horse: {inviteHorse.name}</Text>
              <Text type="secondary">{inviteHorse.breed} · {inviteHorse.age} yrs</Text>
            </div>
            <Form.Item name="jockeyId" label="Choose a Jockey" rules={[{ required: true, message: 'Please select a jockey' }]}>
              <Select placeholder="Select a professional jockey" size="large">
                {jockeys.map(j => (
                  <Option key={j._id} value={j._id}>
                    {j.name} ({j.bio || 'Professional Jockey'})
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <Button onClick={() => setInviteModalOpen(false)}>Cancel</Button>
              <Button htmlType="submit" type="primary" loading={createInviteMutation.isPending}
                style={{ background: 'linear-gradient(135deg,#d4a017,#f5c842)', border: 'none', color: '#1a1a1a', fontWeight: 700 }}>
                Send Invitation
              </Button>
            </div>
          </Form>
        )}
      </Modal>

      {/* View Modal */}
      <Modal title="🐴 Horse Profile" open={!!viewHorse} onCancel={() => setViewHorse(null)} footer={null} width={560}>
        {viewHorse && (
          <div>
            <div style={{
              background: 'linear-gradient(135deg,#1a1a2e,#2d1b0e)',
              borderRadius: 16, padding: 24, textAlign: 'center', marginBottom: 24,
            }}>
              <div style={{ fontSize: 64, marginBottom: 12 }}>🐴</div>
              <Title level={3} style={{ color: '#fff', marginBottom: 4 }}>{viewHorse.name}</Title>
              <Tag color="gold">{viewHorse.breed}</Tag>
              <StatusBadge status={viewHorse.status} />
            </div>
            <Row gutter={[16, 12]}>
              {[
                ['Age', `${viewHorse.age} years`], ['Color', viewHorse.color],
                ['Weight', `${viewHorse.weight} kg`], ['Height', `${viewHorse.height} cm`],
                ['Wins', viewHorse.wins], ['Losses', viewHorse.losses],
                ['Total Races', viewHorse.totalRaces],
                ['Owner', viewHorse.owner?.name || 'Unknown'],
                ['Jockey', viewHorse.jockey?.name || 'Unassigned'],
                ['Verified', viewHorse.isVerified ? '✅ Yes' : '❌ No'],
              ].map(([label, val]) => (
                <Col span={12} key={label}>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>{label}</Text>
                  <Text strong>{val}</Text>
                </Col>
              ))}
            </Row>
            {viewHorse.description && (
              <div style={{ marginTop: 16, padding: 16, background: '#f9fafb', borderRadius: 12 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>DESCRIPTION</Text>
                <Text style={{ display: 'block', marginTop: 4 }}>{viewHorse.description}</Text>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Create/Edit Modal */}
      <Modal title={<Text strong>{editingId ? '✏️ Edit Horse' : '🐴 Register New Horse'}</Text>}
        open={modalOpen} onCancel={() => { setModalOpen(false); form.resetFields(); }} footer={null} width={600}>
        <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="Horse Name" rules={[{ required: true }]}>
                <Input size="large" placeholder="e.g. Thunder Bolt" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="breed" label="Breed" rules={[{ required: true }]}>
                <Select size="large" placeholder="Select breed">
                  {['Thoroughbred', 'Arabian', 'Quarter Horse', 'Standardbred', 'Appaloosa'].map(b => (
                    <Option key={b} value={b}>{b}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="age" label="Age (years)" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} size="large" min={1} max={30} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="weight" label="Weight (kg)" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} size="large" min={300} max={700} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="height" label="Height (cm)" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} size="large" min={100} max={200} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="color" label="Color" rules={[{ required: true }]}>
                <Select size="large" placeholder="Select color">
                  {['Bay', 'Chestnut', 'Black', 'Gray', 'Roan', 'Palomino'].map(c => (
                    <Option key={c} value={c}>{c}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="jockey" label="Assign Jockey">
                <Select size="large" placeholder="Select jockey" allowClear>
                  {jockeys.map(j => <Option key={j._id} value={j._id}>{j.name}</Option>)}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label="Description">
            <TextArea rows={3} placeholder="Describe the horse..." />
          </Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button htmlType="submit" loading={createMutation.isPending || updateMutation.isPending}
              style={{ background: 'linear-gradient(135deg,#d4a017,#f5c842)', border: 'none', color: '#1a1a1a', fontWeight: 700 }}>
              {editingId ? 'Update' : 'Register'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
