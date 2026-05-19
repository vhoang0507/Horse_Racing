import React, { useState } from 'react';
import { Row, Col, Card, Typography, Tag, Avatar, Spin, Empty, Progress, Tabs, Table, Button, Space } from 'antd';
import { TrophyOutlined, StarOutlined, CheckCircleOutlined, CloseCircleOutlined, MailOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import { useJockeys, useInvitations, useRespondInvitation } from '../hooks/useData';

const { Title, Text } = Typography;

export default function JockeysPage() {
  const { user } = useSelector((s) => s.auth);
  const isJockey = user?.role === 'jockey';

  const { data: jockeys = [], isLoading: loadingJockeys } = useJockeys();
  const { data: invitations = [], isLoading: loadingInvitations, refetch: refetchInvitations } = useInvitations();
  const respondInviteMutation = useRespondInvitation();

  const [activeTab, setActiveTab] = useState('roster');

  const maxPoints = Math.max(...jockeys.map(j => j.points || 0), 1);

  const handleRespond = async (inviteId, response) => {
    await respondInviteMutation.mutateAsync({ id: inviteId, response });
    refetchInvitations();
  };

  const invitationColumns = [
    {
      title: 'Horse Info',
      key: 'horse',
      render: (_, r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 24 }}>🐴</span>
          <div>
            <Text strong style={{ display: 'block' }}>{r.horse?.name || 'Unknown Horse'}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>{r.horse?.breed} · {r.horse?.color}</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Horse Owner',
      key: 'owner',
      render: (_, r) => (
        <div>
          <Text strong style={{ display: 'block' }}>{r.owner?.name}</Text>
          <Text type="secondary" style={{ fontSize: 11 }}>{r.owner?.email}</Text>
        </div>
      ),
    },
    {
      title: 'Date Invited',
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
          pending: '⏳ Pending',
          accepted: '👍 Accepted',
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
        if (record.status === 'pending') {
          return (
            <Space>
              <Button
                type="primary"
                size="small"
                icon={<CheckCircleOutlined />}
                style={{ background: '#22c55e', border: 'none', fontWeight: 600 }}
                onClick={() => handleRespond(record._id, 'accepted')}
              >
                Accept
              </Button>
              <Button
                danger
                size="small"
                icon={<CloseCircleOutlined />}
                onClick={() => handleRespond(record._id, 'rejected')}
              >
                Decline
              </Button>
            </Space>
          );
        }
        return null;
      },
    },
  ];

  const rosterContent = (
    <Row gutter={[20, 20]}>
      {jockeys.map((jockey, index) => (
        <Col key={jockey._id} xs={24} sm={12} lg={8} xl={6}>
          <Card className="hover-lift" style={{
            borderRadius: 20, border: 'none',
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
            overflow: 'hidden',
          }}
            bodyStyle={{ padding: 0 }}>
            {/* Header gradient */}
            <div style={{
              background: index === 0
                ? 'linear-gradient(135deg, #d4a017, #f5c842)'
                : index === 1
                ? 'linear-gradient(135deg, #9ca3af, #e5e7eb)'
                : index === 2
                ? 'linear-gradient(135deg, #92400e, #d97706)'
                : 'linear-gradient(135deg, #1a1a2e, #2d1b4e)',
              padding: '32px 20px 20px',
              textAlign: 'center', position: 'relative',
            }}>
              {index < 3 && (
                <div style={{ position: 'absolute', top: 12, right: 12, fontSize: 22 }}>
                  {['🥇', '🥈', '🥉'][index]}
                </div>
              )}
              <Avatar size={72} style={{
                background: 'rgba(255,255,255,0.2)',
                fontSize: 32, fontWeight: 800,
                border: '3px solid rgba(255,255,255,0.4)',
              }}>
                {jockey.name[0]}
              </Avatar>
              <Title level={4} style={{
                color: index < 3 && index !== 0 ? '#1a1a2e' : '#fff',
                marginTop: 12, marginBottom: 2,
              }}>{jockey.name}</Title>
              <Text style={{ color: index < 3 && index !== 0 ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.7)', fontSize: 12 }}>
                Professional Jockey
              </Text>
            </div>

            {/* Stats */}
            <div style={{ padding: '20px 24px' }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>Performance Score</Text>
                  <Text strong style={{ color: '#d4a017' }}>{jockey.points || 0} pts</Text>
                </div>
                <Progress
                  percent={Math.round((jockey.points || 0) / maxPoints * 100)}
                  strokeColor={{ from: '#d4a017', to: '#f5c842' }}
                  showInfo={false} strokeWidth={8}
                  style={{ marginBottom: 0 }}
                />
              </div>

              <Row gutter={8}>
                <Col span={12}>
                  <div style={{ textAlign: 'center', padding: '12px 8px', background: '#f9fafb', borderRadius: 10 }}>
                    <TrophyOutlined style={{ color: '#d4a017', fontSize: 18, display: 'block', marginBottom: 4 }} />
                    <Text strong style={{ fontSize: 18, display: 'block', color: '#1a1a2e' }}>
                      #{jockeys.indexOf(jockey) + 1}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 11 }}>Rank</Text>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ textAlign: 'center', padding: '12px 8px', background: '#f9fafb', borderRadius: 10 }}>
                    <StarOutlined style={{ color: '#f59e0b', fontSize: 18, display: 'block', marginBottom: 4 }} />
                    <Text strong style={{ fontSize: 18, display: 'block', color: '#1a1a2e' }}>
                      {jockey.points || 0}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 11 }}>Points</Text>
                  </div>
                </Col>
              </Row>

              {jockey.bio && (
                <div style={{ marginTop: 16, padding: '12px', background: '#f9fafb', borderRadius: 10 }}>
                  <Text style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.6 }}>{jockey.bio}</Text>
                </div>
              )}

              <div style={{ marginTop: 12 }}>
                <Tag color={jockey.isActive ? 'green' : 'red'} style={{ borderRadius: 20 }}>
                  {jockey.isActive ? '● Active' : '● Inactive'}
                </Tag>
              </div>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );

  const tabItems = [
    {
      key: 'roster',
      label: '🏇 Jockey Roster',
      children: rosterContent,
    },
    isJockey && {
      key: 'invitations',
      label: `✉️ Incoming Invitations (${invitations.length})`,
      children: (
        <Card style={{ borderRadius: 16, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <Table
            dataSource={invitations}
            columns={invitationColumns}
            rowKey="_id"
            loading={loadingInvitations}
            pagination={{ pageSize: 10 }}
          />
        </Card>
      ),
    },
  ].filter(Boolean);

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={3} style={{ marginBottom: 4 }}>
            {isJockey ? '🏇 Jockeys & Invitations' : '🏇 Jockey Roster'}
          </Title>
          <Text type="secondary">
            {isJockey
              ? 'View all professional jockeys and manage your incoming ride invitations'
              : 'All registered professional jockeys and their performance'}
          </Text>
        </div>
      </div>

      {loadingJockeys ? (
        <div style={{ textAlign: 'center', paddingTop: 80 }}><Spin size="large" /></div>
      ) : jockeys.length === 0 ? (
        <Empty description="No jockeys found" />
      ) : isJockey ? (
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      ) : (
        rosterContent
      )}
    </div>
  );
}
