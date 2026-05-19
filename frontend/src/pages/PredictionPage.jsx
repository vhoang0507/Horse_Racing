import React, { useState } from 'react';
import {
  Row, Col, Card, Table, Button, Modal, Form, InputNumber, Select,
  Typography, Tag, Spin, Empty, Alert,
} from 'antd';
import { LineChartOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import { useRaces, useMyBets, useCreateBet, useHorses } from '../hooks/useData';
import StatusBadge from '../components/StatusBadge';
import StatsCard from '../components/StatsCard';

const { Title, Text } = Typography;
const { Option } = Select;

export default function PredictionPage() {
  const { user } = useSelector((s) => s.auth);
  const { data: races = [], isLoading: raceLoading } = useRaces({ status: 'scheduled' });
  const { data: allRaces = [] } = useRaces();
  const { data: myBets = [], isLoading: betLoading } = useMyBets();
  const { data: horses = [] } = useHorses();
  const createBet = useCreateBet();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRace, setSelectedRace] = useState(null);
  const [form] = Form.useForm();

  const openPredict = (race) => {
    setSelectedRace(race);
    form.resetFields();
    setModalOpen(true);
  };

  const handleSubmit = async (values) => {
    await createBet.mutateAsync({ ...values, race: selectedRace._id });
    setModalOpen(false);
    form.resetFields();
  };

  const wonBets = myBets.filter(b => b.status === 'won').length;
  const totalPayout = myBets.reduce((acc, b) => acc + (b.payout || 0), 0);
  const winRate = myBets.length ? Math.round((wonBets / myBets.length) * 100) : 0;

  const betColumns = [
    {
      title: 'Race', dataIndex: 'race', key: 'race',
      render: (r) => <Text strong>{r?.name || 'Unknown'}</Text>,
    },
    {
      title: 'Predicted Horse', dataIndex: 'predictedHorse', key: 'horse',
      render: (h) => <Tag color="blue">🐴 {h?.name || 'Unknown'}</Tag>,
    },
    { title: 'Position', dataIndex: 'predictedPosition', key: 'pos', render: (p) => `#${p}` },
    { title: 'Amount', dataIndex: 'amount', key: 'amount', render: (a) => `₫${Number(a).toLocaleString()}` },
    { title: 'Odds', dataIndex: 'odds', key: 'odds', render: (o) => `×${o}` },
    {
      title: 'Payout', dataIndex: 'payout', key: 'payout',
      render: (p) => p > 0
        ? <Text strong style={{ color: '#22c55e' }}>₫{Number(p).toLocaleString()}</Text>
        : <Text type="secondary">—</Text>,
    },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s) => <StatusBadge status={s} /> },
    {
      title: 'Date', dataIndex: 'createdAt', key: 'date',
      render: (d) => dayjs(d).format('DD MMM YYYY'),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ marginBottom: 4 }}>🎯 Race Predictions</Title>
        <Text type="secondary">Predict race outcomes and earn reward points</Text>
      </div>

      {/* Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} lg={6}><StatsCard title="Total Bets" value={myBets.length} icon="🎯" color="#d4a017" /></Col>
        <Col xs={12} lg={6}><StatsCard title="Wins" value={wonBets} icon="🏆" color="#22c55e" /></Col>
        <Col xs={12} lg={6}><StatsCard title="Win Rate" value={winRate} suffix="%" icon="📊" color="#3b82f6" /></Col>
        <Col xs={12} lg={6}><StatsCard title="Total Payout" value={`₫${(totalPayout / 1000).toFixed(0)}K`} icon="💰" color="#a855f7" /></Col>
      </Row>

      {/* Available races to bet */}
      <Card title={<Text strong>📅 Available Races to Predict</Text>}
        style={{ borderRadius: 16, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', marginBottom: 24 }}>
        {raceLoading ? <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div>
          : races.length === 0
          ? <Empty description="No upcoming races available for predictions" />
          : (
            <Row gutter={[16, 16]}>
              {races.map(race => (
                <Col key={race._id} xs={24} sm={12} lg={8}>
                  <Card className="hover-lift" style={{
                    borderRadius: 16, border: '1px solid #f0f0f0',
                    background: 'linear-gradient(135deg, #fafbff, #fff)',
                  }}>
                    <Text strong style={{ display: 'block', fontSize: 16, marginBottom: 8 }}>{race.name}</Text>
                    <div style={{ color: '#8892a4', fontSize: 13, marginBottom: 4 }}>
                      🏆 {race.tournament?.name}
                    </div>
                    <div style={{ color: '#8892a4', fontSize: 13, marginBottom: 4 }}>
                      📅 {dayjs(race.raceDate).format('DD MMM YYYY, HH:mm')}
                    </div>
                    <div style={{ color: '#8892a4', fontSize: 13, marginBottom: 16 }}>
                      🏇 {race.participants?.length || 0} horses · {race.trackLength}m
                    </div>
                    <StatusBadge status={race.status} />
                    <Button block type="primary" style={{
                      marginTop: 16, background: 'linear-gradient(135deg,#d4a017,#f5c842)',
                      border: 'none', color: '#1a1a1a', fontWeight: 700, borderRadius: 8,
                    }} onClick={() => openPredict(race)}
                      icon={<LineChartOutlined />}>
                      Place Prediction
                    </Button>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
      </Card>

      {/* My bets */}
      <Card title={<Text strong>📋 My Predictions History</Text>}
        style={{ borderRadius: 16, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
        {betLoading ? <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div> : (
          <Table dataSource={myBets} columns={betColumns} rowKey="_id" pagination={{ pageSize: 8 }} />
        )}
      </Card>

      {/* Place prediction modal */}
      <Modal title={<Text strong>🎯 Place Prediction — {selectedRace?.name}</Text>}
        open={modalOpen} onCancel={() => { setModalOpen(false); form.resetFields(); }} footer={null} width={480}>
        {selectedRace && (
          <div>
            <Alert
              style={{ marginBottom: 20, borderRadius: 10 }}
              message={`📅 Race: ${dayjs(selectedRace.raceDate).format('DD MMM YYYY, HH:mm')}`}
              description={`🏇 ${selectedRace.participants?.length || 0} participants · ${selectedRace.trackLength}m track`}
              type="info"
            />
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              <Form.Item name="predictedHorse" label="Pick Your Horse" rules={[{ required: true }]}>
                <Select size="large" placeholder="Select horse to win">
                  {(selectedRace.participants || []).map((p, i) => (
                    <Option key={p.horse?._id || i} value={p.horse?._id}>
                      🐴 {p.horse?.name || `Horse ${i + 1}`} (Lane {p.laneNumber})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="predictedPosition" label="Predicted Finish Position" rules={[{ required: true }]}>
                <Select size="large" placeholder="Select position">
                  {[1, 2, 3].map(p => (
                    <Option key={p} value={p}>
                      {['🥇 1st Place', '🥈 2nd Place', '🥉 3rd Place'][p - 1]}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="amount" label="Prediction Amount (₫)" rules={[{ required: true }]}>
                <InputNumber
                  style={{ width: '100%' }} size="large"
                  min={10000} max={10000000} step={50000}
                  formatter={v => `₫ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                />
              </Form.Item>
              <Form.Item name="odds" label="Odds" initialValue={2.0}>
                <InputNumber style={{ width: '100%' }} size="large" min={1.1} max={20} step={0.1}
                  formatter={v => `× ${v}`} />
              </Form.Item>
              <Alert type="warning" style={{ marginBottom: 16, borderRadius: 10 }}
                message="This is a simulated prediction system for entertainment purposes." />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <Button onClick={() => setModalOpen(false)}>Cancel</Button>
                <Button htmlType="submit" loading={createBet.isPending}
                  style={{ background: 'linear-gradient(135deg,#d4a017,#f5c842)', border: 'none', color: '#1a1a1a', fontWeight: 700 }}>
                  Confirm Prediction
                </Button>
              </div>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
}
