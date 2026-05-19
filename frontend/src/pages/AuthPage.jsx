import React, { useState } from 'react';
import { Form, Input, Button, Typography, Tabs, Select, Card, Divider, Alert } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginStart, loginSuccess, loginFail } from '../redux/slices/authSlice';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const { Title, Text } = Typography;
const { Option } = Select;

export default function AuthPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();

  const handleLogin = async (values) => {
    setLoading(true);
    dispatch(loginStart());
    try {
      const { data } = await authAPI.login(values);
      dispatch(loginSuccess(data));
      toast.success(`Welcome back, ${data.user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      dispatch(loginFail());
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (values) => {
    setLoading(true);
    try {
      const { data } = await authAPI.register(values);
      dispatch(loginSuccess(data));
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    { label: '👑 Admin', email: 'admin@horseracing.com', password: 'admin123' },
    { label: '🐴 Horse Owner', email: 'owner1@test.com', password: 'password123' },
    { label: '🏇 Jockey', email: 'jockey1@test.com', password: 'password123' },
    { label: '🚩 Referee', email: 'referee1@test.com', password: 'password123' },
    { label: '👁️ Spectator', email: 'spectator1@test.com', password: 'password123' },
  ];

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: 'linear-gradient(135deg, #0d0f14 0%, #1a1a3e 50%, #2d1b0e 100%)',
    }}>
      {/* Left Panel */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
        alignItems: 'center', padding: '60px 40px', display: window.innerWidth < 768 ? 'none' : 'flex',
      }}>
        <div style={{ textAlign: 'center', maxWidth: 480 }}>
          <div style={{ fontSize: 80, marginBottom: 24 }}>🏇</div>
          <Title style={{ color: '#fff', fontSize: 42, fontWeight: 900, marginBottom: 16 }}>
            Horse<span style={{ color: '#d4a017' }}>Pro</span>
          </Title>
          <Text style={{ color: '#8892a4', fontSize: 18, lineHeight: 1.8, display: 'block', marginBottom: 40 }}>
            The complete racing tournament management system for professionals.
          </Text>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {['🏆 Manage tournaments & races', '🐴 Track horse performance', '📊 Real-time results & analytics', '🎯 Prediction & reward system'].map(f => (
              <div key={f} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: 'rgba(212,160,23,0.08)', border: '1px solid rgba(212,160,23,0.2)',
                borderRadius: 12, padding: '12px 20px', color: '#e8eaf0', fontWeight: 500,
              }}>{f}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div style={{
        width: '100%', maxWidth: 520,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 32, background: 'rgba(255,255,255,0.03)',
        borderLeft: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14, margin: '0 auto 16px',
              background: 'linear-gradient(135deg,#d4a017,#f5c842)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
            }}>🏇</div>
            <Title level={2} style={{ color: '#fff', marginBottom: 4 }}>
              {activeTab === 'login' ? 'Welcome Back' : 'Create Account'}
            </Title>
            <Text style={{ color: '#8892a4' }}>
              {activeTab === 'login' ? 'Sign in to your racing account' : 'Join the racing community today'}
            </Text>
          </div>

          {/* Demo accounts */}
          {activeTab === 'login' && (
            <Alert
              style={{ marginBottom: 20, borderRadius: 10, background: 'rgba(212,160,23,0.08)', border: '1px solid rgba(212,160,23,0.3)' }}
              message={<Text style={{ color: '#d4a017', fontWeight: 600, fontSize: 12 }}>🔑 Demo Accounts (click to fill)</Text>}
              description={
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                  {demoAccounts.map(a => (
                    <Button key={a.label} size="small" style={{ borderRadius: 6, fontSize: 11, height: 26 }}
                      onClick={() => loginForm.setFieldsValue({ email: a.email, password: a.password })}>
                      {a.label}
                    </Button>
                  ))}
                </div>
              }
            />
          )}

          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            centered
            items={[
              { key: 'login', label: 'Sign In' },
              { key: 'register', label: 'Register' },
            ]}
            style={{ marginBottom: 24 }}
          />

          {activeTab === 'login' ? (
            <Form form={loginForm} layout="vertical" onFinish={handleLogin} requiredMark={false}>
              <Form.Item name="email" rules={[{ required: true, type: 'email', message: 'Valid email required' }]}>
                <Input prefix={<MailOutlined style={{ color: '#8892a4' }} />} placeholder="Email address"
                  size="large" style={{ borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', height: 48 }} />
              </Form.Item>
              <Form.Item name="password" rules={[{ required: true, message: 'Password required' }]}>
                <Input.Password prefix={<LockOutlined style={{ color: '#8892a4' }} />} placeholder="Password"
                  size="large" style={{ borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', height: 48 }} />
              </Form.Item>
              <Form.Item style={{ marginBottom: 0 }}>
                <Button htmlType="submit" block size="large" loading={loading}
                  style={{ height: 52, borderRadius: 12, fontWeight: 700, fontSize: 16, border: 'none',
                    background: 'linear-gradient(135deg,#d4a017,#f5c842)', color: '#1a1a1a' }}>
                  Sign In
                </Button>
              </Form.Item>
            </Form>
          ) : (
            <Form form={registerForm} layout="vertical" onFinish={handleRegister} requiredMark={false}>
              <Form.Item name="name" rules={[{ required: true, message: 'Name required' }]}>
                <Input prefix={<UserOutlined style={{ color: '#8892a4' }} />} placeholder="Full name"
                  size="large" style={{ borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', height: 48 }} />
              </Form.Item>
              <Form.Item name="email" rules={[{ required: true, type: 'email', message: 'Valid email required' }]}>
                <Input prefix={<MailOutlined style={{ color: '#8892a4' }} />} placeholder="Email address"
                  size="large" style={{ borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', height: 48 }} />
              </Form.Item>
              <Form.Item name="password" rules={[{ required: true, min: 6, message: 'Minimum 6 characters' }]}>
                <Input.Password prefix={<LockOutlined style={{ color: '#8892a4' }} />} placeholder="Password"
                  size="large" style={{ borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', height: 48 }} />
              </Form.Item>
              <Form.Item name="role" rules={[{ required: true, message: 'Please select a role' }]}>
                <Select placeholder="Select your role" size="large" style={{ height: 48 }}>
                  <Option value="horse_owner">🐴 Horse Owner</Option>
                  <Option value="jockey">🏇 Jockey</Option>
                  <Option value="spectator">👁️ Spectator</Option>
                </Select>
              </Form.Item>
              <Form.Item style={{ marginBottom: 0 }}>
                <Button htmlType="submit" block size="large" loading={loading}
                  style={{ height: 52, borderRadius: 12, fontWeight: 700, fontSize: 16, border: 'none',
                    background: 'linear-gradient(135deg,#d4a017,#f5c842)', color: '#1a1a1a' }}>
                  Create Account
                </Button>
              </Form.Item>
            </Form>
          )}

          <Divider style={{ borderColor: 'rgba(255,255,255,0.1)', marginTop: 24 }}>
            <Text style={{ color: '#8892a4', fontSize: 12 }}>OR</Text>
          </Divider>
          <div style={{ textAlign: 'center' }}>
            <Text style={{ color: '#8892a4' }}>
              {activeTab === 'login' ? "Don't have an account? " : 'Already have an account? '}
            </Text>
            <Button type="link" onClick={() => setActiveTab(activeTab === 'login' ? 'register' : 'login')}
              style={{ color: '#d4a017', fontWeight: 600, padding: 0 }}>
              {activeTab === 'login' ? 'Register now' : 'Sign in'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
