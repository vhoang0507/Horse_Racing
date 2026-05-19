import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown, Badge, Button, Tooltip, Typography } from 'antd';
import {
  DashboardOutlined, TrophyOutlined, ScheduleOutlined, TeamOutlined,
  UserOutlined, LineChartOutlined, ThunderboltOutlined, CrownOutlined,
  SettingOutlined, LogoutOutlined, BellOutlined, MenuFoldOutlined,
  MenuUnfoldOutlined, BulbOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import { toggleDarkMode, toggleSidebar } from '../redux/slices/uiSlice';
import { useNotifications } from '../hooks/useData';
import { useSocket } from '../hooks/useSocket';
import toast from 'react-hot-toast';

const { Sider, Header, Content } = Layout;
const { Text } = Typography;

const roleLabel = {
  admin: '👑 Admin', horse_owner: '🐴 Horse Owner',
  jockey: '🏇 Jockey', referee: '🚩 Referee', spectator: '👁️ Spectator',
};

const navItems = [
  { key: '/dashboard',   icon: <DashboardOutlined />,  label: 'Dashboard',   roles: ['all'] },
  { key: '/tournaments', icon: <TrophyOutlined />,     label: 'Tournaments', roles: ['all'] },
  { key: '/races',       icon: <ScheduleOutlined />,   label: 'Race Schedule',roles: ['all'] },
  { key: '/horses',      icon: <ThunderboltOutlined />,label: 'Horses',      roles: ['admin','horse_owner','referee'] },
  { key: '/jockeys',     icon: <TeamOutlined />,       label: 'Jockeys',     roles: ['admin','horse_owner','jockey'] },
  { key: '/predictions', icon: <LineChartOutlined />,  label: 'Predictions', roles: ['spectator','horse_owner','admin'] },
  { key: '/leaderboard', icon: <CrownOutlined />,      label: 'Leaderboard', roles: ['all'] },
  { key: '/admin',       icon: <SettingOutlined />,    label: 'Admin Panel', roles: ['admin'] },
];

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { darkMode, sidebarCollapsed } = useSelector((s) => s.ui);
  const { data: notifications = [] } = useNotifications();
  const unread = notifications.filter(n => !n.isRead).length;

  useSocket(
    (data) => {
      toast.success(`🔥 Race "${data.raceName}" has STARTED! Navigate to the Race Schedule page.`, {
        duration: 6000,
        icon: '🏇',
        style: {
          background: darkMode ? '#1e293b' : '#fff',
          color: darkMode ? '#f8fafc' : '#0f172a',
          border: '1px solid #d4a017',
        },
      });
    },
    (data) => {
      toast.success(`🏆 Race result confirmed! Check the Leaderboard page.`, {
        duration: 6000,
        icon: '🏅',
        style: {
          background: darkMode ? '#1e293b' : '#fff',
          color: darkMode ? '#f8fafc' : '#0f172a',
          border: '1px solid #d4a017',
        },
      });
    }
  );

  useEffect(() => {
    document.body.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const filteredNav = navItems.filter(item =>
    item.roles.includes('all') || item.roles.includes(user?.role)
  );

  const userMenuItems = [
    { key: 'profile', icon: <UserOutlined />, label: 'Profile' },
    { key: 'divider', type: 'divider' },
    { key: 'logout', icon: <LogoutOutlined />, label: 'Logout', danger: true },
  ];

  const handleMenuClick = ({ key }) => {
    if (key === 'logout') dispatch(logout());
    else if (key === 'profile') navigate('/dashboard');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sider
        collapsed={sidebarCollapsed}
        collapsible trigger={null}
        width={240} collapsedWidth={70}
        style={{
          background: darkMode ? '#0d0f14' : '#1a1a2e',
          borderRight: darkMode ? '1px solid #252d3d' : '1px solid #2d2d5e',
          position: 'fixed', height: '100vh', zIndex: 100, overflow: 'auto',
        }}
      >
        {/* Logo */}
        <div style={{
          padding: sidebarCollapsed ? '20px 10px' : '20px 16px',
          display: 'flex', alignItems: 'center', gap: 10,
          borderBottom: '1px solid rgba(212,160,23,0.2)',
          marginBottom: 8,
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: 'linear-gradient(135deg, #d4a017, #f5c842)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, flexShrink: 0,
          }}>🏇</div>
          {!sidebarCollapsed && (
            <div>
              <div style={{ color: '#d4a017', fontWeight: 800, fontSize: 14, lineHeight: 1.2 }}>HorsePro</div>
              <div style={{ color: '#8892a4', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Racing System</div>
            </div>
          )}
        </div>

        {/* Role badge */}
        {!sidebarCollapsed && (
          <div style={{ padding: '8px 16px 12px' }}>
            <div style={{
              background: 'rgba(212,160,23,0.1)', borderRadius: 8, padding: '8px 12px',
              border: '1px solid rgba(212,160,23,0.2)',
            }}>
              <div style={{ color: '#8892a4', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Logged in as</div>
              <div style={{ color: '#d4a017', fontWeight: 700, fontSize: 13, marginTop: 2 }}>
                {roleLabel[user?.role]}
              </div>
            </div>
          </div>
        )}

        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          onClick={({ key }) => navigate(key)}
          style={{ background: 'transparent', border: 'none', padding: '0 8px' }}
          items={filteredNav.map(item => ({
            key: item.key, icon: item.icon, label: item.label,
            style: { borderRadius: 10, marginBottom: 4, color: '#c0cce0' },
          }))}
          theme="dark"
        />
      </Sider>

      {/* Main area */}
      <Layout style={{ marginLeft: sidebarCollapsed ? 70 : 240, transition: 'margin 0.2s' }}>
        {/* Header */}
        <Header style={{
          padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: darkMode ? '#161b27' : '#fff',
          borderBottom: darkMode ? '1px solid #252d3d' : '1px solid #f0f0f0',
          position: 'sticky', top: 0, zIndex: 99,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          height: 64,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Button
              type="text" size="large"
              icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => dispatch(toggleSidebar())}
              style={{ color: darkMode ? '#c0cce0' : '#666' }}
            />
            <Text style={{ fontWeight: 600, fontSize: 16, color: darkMode ? '#e8eaf0' : '#1a1a2e' }}>
              {filteredNav.find(n => n.key === location.pathname)?.label || 'Dashboard'}
            </Text>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Tooltip title={darkMode ? 'Light Mode' : 'Dark Mode'}>
              <Button type="text" icon={<BulbOutlined />}
                onClick={() => dispatch(toggleDarkMode())}
                style={{ color: darkMode ? '#d4a017' : '#666' }}
              />
            </Tooltip>

            <Badge count={unread} size="small">
              <Button type="text" icon={<BellOutlined />}
                style={{ color: darkMode ? '#c0cce0' : '#666' }}
              />
            </Badge>

            <Dropdown menu={{ items: userMenuItems, onClick: handleMenuClick }} placement="bottomRight">
              <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                padding: '6px 12px', borderRadius: 10,
                background: darkMode ? 'rgba(212,160,23,0.1)' : 'rgba(212,160,23,0.08)',
                border: '1px solid rgba(212,160,23,0.2)',
              }}>
                <Avatar style={{ background: 'linear-gradient(135deg,#d4a017,#f5c842)', color: '#1a1a1a', fontWeight: 700 }}>
                  {user?.name?.[0]?.toUpperCase()}
                </Avatar>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: darkMode ? '#e8eaf0' : '#1a1a2e', lineHeight: 1.2 }}>
                    {user?.name}
                  </div>
                  <div style={{ fontSize: 11, color: '#d4a017', lineHeight: 1.2 }}>{user?.role?.replace('_', ' ')}</div>
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>

        {/* Page content */}
        <Content style={{ padding: 24, minHeight: 'calc(100vh - 64px)' }}>
          <div className="page-enter">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
