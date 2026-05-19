import React from 'react';
import { Row, Col, Card, Typography, Avatar, Tag, Spin, Empty } from 'antd';
import { TrophyOutlined, CrownOutlined, StarOutlined } from '@ant-design/icons';
import { useLeaderboard, useResults } from '../hooks/useData';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const roleColors = {
  horse_owner: '#d4a017', jockey: '#a855f7',
  spectator: '#3b82f6', referee: '#22c55e',
};

const roleEmoji = {
  horse_owner: '🐴', jockey: '🏇', spectator: '👁️', referee: '🚩',
};

const podiumConfig = [
  { size: 80, medal: '🥇', height: 120, bg: 'linear-gradient(135deg,#d4a017,#f5c842)' },
  { size: 64, medal: '🥈', height: 90, bg: 'linear-gradient(135deg,#9ca3af,#e5e7eb)' },
  { size: 64, medal: '🥉', height: 70, bg: 'linear-gradient(135deg,#92400e,#d97706)' },
];

export default function LeaderboardPage() {
  const { data: leaders = [], isLoading } = useLeaderboard();
  const { data: results = [] } = useResults();

  const top3 = leaders.slice(0, 3);
  const rest = leaders.slice(3);

  // Recent race results
  const recentResults = results.slice(0, 5);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ marginBottom: 4 }}>👑 Leaderboard</Title>
        <Text type="secondary">Top performers across all roles — updated every 30 seconds</Text>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', paddingTop: 80 }}><Spin size="large" /></div>
      ) : (
        <>
          {/* Podium */}
          {top3.length >= 3 && (
            <Card style={{ borderRadius: 20, marginBottom: 24, background: 'linear-gradient(135deg,#1a1a2e,#2d1b0e)', border: 'none', overflow: 'hidden' }}>
              <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <Title level={3} style={{ color: '#d4a017', marginBottom: 0 }}>🏆 Top 3 Champions</Title>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 32, padding: '0 0 24px' }}>
                {[top3[1], top3[0], top3[2]].map((user, displayIndex) => {
                  const actualIndex = displayIndex === 0 ? 1 : displayIndex === 1 ? 0 : 2;
                  const cfg = podiumConfig[actualIndex];
                  return (
                    <div key={user._id} style={{ textAlign: 'center', width: 160 }}>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>{cfg.medal}</div>
                      <Avatar size={cfg.size} style={{ background: cfg.bg, fontSize: cfg.size / 2.5, fontWeight: 800, border: '3px solid rgba(255,255,255,0.3)', marginBottom: 12 }}>
                        {user.name[0]}
                      </Avatar>
                      <div style={{ color: '#fff', fontWeight: 700, fontSize: actualIndex === 0 ? 16 : 14, marginBottom: 4 }}>
                        {user.name}
                      </div>
                      <Tag style={{ background: 'rgba(212,160,23,0.2)', border: '1px solid rgba(212,160,23,0.4)', color: '#d4a017', borderRadius: 20 }}>
                        {roleEmoji[user.role]} {user.role?.replace('_', ' ')}
                      </Tag>
                      <div style={{
                        marginTop: 12, background: 'rgba(255,255,255,0.05)',
                        borderRadius: 12, padding: '12px 0',
                        borderTop: `2px solid ${cfg.bg.includes('d4a017') ? '#d4a017' : '#9ca3af'}`,
                        height: cfg.height,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <div>
                          <StarOutlined style={{ color: '#d4a017' }} />
                          <Text strong style={{ color: '#fff', marginLeft: 4, fontSize: 18 }}>{user.points || 0}</Text>
                          <Text style={{ color: '#8892a4', fontSize: 11, display: 'block' }}>points</Text>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          <Row gutter={[20, 20]}>
            {/* Full ranking list */}
            <Col xs={24} lg={14}>
              <Card title={<Text strong>📋 Full Rankings</Text>}
                style={{ borderRadius: 16, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                {leaders.length === 0
                  ? <Empty description="No data yet" />
                  : leaders.map((user, index) => (
                    <div key={user._id} style={{
                      display: 'flex', alignItems: 'center', gap: 16,
                      padding: '14px 0',
                      borderBottom: index < leaders.length - 1 ? '1px solid #f0f0f0' : 'none',
                    }}>
                      {/* Rank */}
                      <div style={{
                        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: 14,
                        background: index < 3
                          ? ['linear-gradient(135deg,#d4a017,#f5c842)', 'linear-gradient(135deg,#9ca3af,#e5e7eb)', 'linear-gradient(135deg,#92400e,#d97706)'][index]
                          : '#f3f4f6',
                        color: index < 3 && index !== 1 ? '#fff' : '#374151',
                      }}>
                        {index < 3 ? ['🥇', '🥈', '🥉'][index] : `#${index + 1}`}
                      </div>

                      <Avatar size={42} style={{
                        background: `linear-gradient(135deg, ${roleColors[user.role] || '#8892a4'}44, ${roleColors[user.role] || '#8892a4'}22)`,
                        color: roleColors[user.role] || '#8892a4',
                        fontWeight: 700,
                      }}>
                        {user.name[0]}
                      </Avatar>

                      <div style={{ flex: 1 }}>
                        <Text strong style={{ display: 'block', fontSize: 14 }}>{user.name}</Text>
                        <Tag style={{ fontSize: 11, borderRadius: 20, marginTop: 2 }} color={roleColors[user.role]}>
                          {roleEmoji[user.role]} {user.role?.replace('_', ' ')}
                        </Tag>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <Text strong style={{ fontSize: 18, color: '#d4a017', display: 'block' }}>
                          {(user.points || 0).toLocaleString()}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 11 }}>points</Text>
                      </div>
                    </div>
                  ))
                }
              </Card>
            </Col>

            {/* Recent race results */}
            <Col xs={24} lg={10}>
              <Card title={<Text strong>🏁 Recent Race Results</Text>}
                style={{ borderRadius: 16, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                {recentResults.length === 0
                  ? <Empty description="No results yet" />
                  : recentResults.map(result => (
                    <div key={result._id} style={{ padding: '16px 0', borderBottom: '1px solid #f0f0f0' }}>
                      <Text strong style={{ display: 'block', marginBottom: 10 }}>
                        🏁 {result.race?.name}
                      </Text>
                      {result.rankings?.slice(0, 3).map(r => (
                        <div key={r.position} style={{
                          display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6,
                        }}>
                          <span style={{ fontSize: 16 }}>
                            {r.position === 1 ? '🥇' : r.position === 2 ? '🥈' : '🥉'}
                          </span>
                          <Text style={{ flex: 1, fontSize: 13 }}>{r.horse?.name}</Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {r.finishTime?.toFixed(1)}s
                          </Text>
                          {r.prize > 0 && (
                            <Text strong style={{ fontSize: 12, color: '#d4a017' }}>
                              ₫{(r.prize / 1000000).toFixed(0)}M
                            </Text>
                          )}
                        </div>
                      ))}
                    </div>
                  ))
                }
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
}
