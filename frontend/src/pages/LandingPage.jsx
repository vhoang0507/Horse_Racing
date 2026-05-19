import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Typography } from 'antd';
import { TrophyOutlined, ThunderboltOutlined, CrownOutlined, LineChartOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const features = [
  { icon: <TrophyOutlined />, title: 'Tournaments', desc: 'Create and manage championship tournaments with full scheduling.' },
  { icon: <ThunderboltOutlined />, title: 'Live Races', desc: 'Real-time race tracking with Socket.io live updates.' },
  { icon: <LineChartOutlined />, title: 'Predictions', desc: 'Spectators predict outcomes and earn reward points.' },
  { icon: <CrownOutlined />, title: 'Leaderboard', desc: 'Global ranking of horses, jockeys, and top predictors.' },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      {/* Hero */}
      <div className="hero-bg" style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
        {/* Decorative blobs */}
        <div style={{
          position: 'absolute', top: '-20%', right: '-10%', width: 600, height: 600,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,160,23,0.15), transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-10%', left: '-10%', width: 500, height: 500,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,160,23,0.1), transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Nav */}
        <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 60px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12,
              background: 'linear-gradient(135deg, #d4a017, #f5c842)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
            }}>🏇</div>
            <span style={{ color: '#fff', fontWeight: 800, fontSize: 22 }}>
              Horse<span style={{ color: '#d4a017' }}>Pro</span>
            </span>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Button ghost onClick={() => navigate('/auth')} style={{ borderColor: '#d4a017', color: '#d4a017', borderRadius: 8, fontWeight: 600 }}>
              Sign In
            </Button>
            <Button className="btn-gold" onClick={() => navigate('/auth')} style={{
              background: 'linear-gradient(135deg, #d4a017, #f5c842)', color: '#1a1a1a',
              border: 'none', borderRadius: 8, fontWeight: 700,
            }}>
              Get Started
            </Button>
          </div>
        </nav>

        {/* Hero content */}
        <div style={{ textAlign: 'center', padding: '80px 40px 60px' }}>
          <div style={{
            display: 'inline-block', background: 'rgba(212,160,23,0.15)',
            border: '1px solid rgba(212,160,23,0.4)', borderRadius: 30,
            padding: '6px 20px', marginBottom: 24, color: '#d4a017', fontSize: 13, fontWeight: 600,
          }}>
            🏆 Vietnam's #1 Racing Management Platform
          </div>
          <Title style={{ color: '#fff', fontSize: 'clamp(36px,6vw,72px)', lineHeight: 1.1, marginBottom: 24, fontWeight: 900 }}>
            Where Champions<br />
            <span style={{ background: 'linear-gradient(135deg,#d4a017,#f5c842)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Are Made
            </span>
          </Title>
          <Text style={{ color: '#8892a4', fontSize: 18, display: 'block', maxWidth: 600, margin: '0 auto 40px' }}>
            A complete horse racing tournament management system for owners, jockeys, referees, and spectators.
          </Text>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button size="large" onClick={() => navigate('/auth')} style={{
              height: 52, padding: '0 36px', fontSize: 16, fontWeight: 700,
              background: 'linear-gradient(135deg, #d4a017, #f5c842)',
              border: 'none', borderRadius: 12, color: '#1a1a1a',
              boxShadow: '0 8px 32px rgba(212,160,23,0.35)',
            }}>
              Start Racing →
            </Button>
            <Button ghost size="large" onClick={() => navigate('/leaderboard')} style={{
              height: 52, padding: '0 36px', fontSize: 16, fontWeight: 600,
              borderColor: 'rgba(255,255,255,0.3)', color: '#fff', borderRadius: 12,
            }}>
              View Leaderboard
            </Button>
          </div>
        </div>

        {/* Stats bar */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: 60, flexWrap: 'wrap',
          padding: '40px 40px', borderTop: '1px solid rgba(255,255,255,0.08)',
          marginTop: 20,
        }}>
          {[['150+', 'Horses Registered'], ['50+', 'Active Jockeys'], ['20+', 'Tournaments'], ['10K+', 'Predictions Made']].map(([val, lbl]) => (
            <div key={lbl} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 36, fontWeight: 900, color: '#d4a017' }}>{val}</div>
              <div style={{ color: '#8892a4', fontSize: 14 }}>{lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features section */}
      <div style={{ background: '#f8f9fc', padding: '80px 40px' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: 16 }}>
          Everything You Need to Manage Racing
        </Title>
        <Text style={{ display: 'block', textAlign: 'center', color: '#8892a4', fontSize: 16, marginBottom: 50 }}>
          Built for every stakeholder in the racing ecosystem
        </Text>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24, maxWidth: 1000, margin: '0 auto' }}>
          {features.map(f => (
            <div key={f.title} className="glass-card hover-lift" style={{ padding: 32, textAlign: 'center' }}>
              <div style={{
                width: 64, height: 64, borderRadius: 16,
                background: 'linear-gradient(135deg, rgba(212,160,23,0.2), rgba(245,200,66,0.1))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28, color: '#d4a017', margin: '0 auto 20px',
              }}>{f.icon}</div>
              <Title level={4} style={{ marginBottom: 10 }}>{f.title}</Title>
              <Text style={{ color: '#8892a4', lineHeight: 1.7 }}>{f.desc}</Text>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="hero-bg" style={{ padding: '80px 40px', textAlign: 'center' }}>
        <Title style={{ color: '#fff', marginBottom: 16 }}>Ready to Join the Race?</Title>
        <Text style={{ color: '#8892a4', display: 'block', marginBottom: 32, fontSize: 16 }}>
          Create your account and start managing or watching races today.
        </Text>
        <Button size="large" onClick={() => navigate('/auth')} style={{
          height: 52, padding: '0 40px', fontSize: 16, fontWeight: 700,
          background: 'linear-gradient(135deg, #d4a017, #f5c842)',
          border: 'none', borderRadius: 12, color: '#1a1a1a',
        }}>
          Create Free Account
        </Button>
      </div>
    </div>
  );
}
