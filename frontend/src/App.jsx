import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider, theme as antTheme } from 'antd';
import { Toaster } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import store from './redux/store';

import AppLayout from './layouts/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import TournamentsPage from './pages/TournamentsPage';
import RacesPage from './pages/RacesPage';
import HorsesPage from './pages/HorsesPage';
import JockeysPage from './pages/JockeysPage';
import PredictionPage from './pages/PredictionPage';
import LeaderboardPage from './pages/LeaderboardPage';
import AdminPage from './pages/AdminPage';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30000 } },
});

function AppRoutes() {
  const { isAuthenticated } = useSelector((s) => s.auth);
  const { darkMode } = useSelector((s) => s.ui);

  return (
    <ConfigProvider
      theme={{
        algorithm: darkMode ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
        token: {
          colorPrimary: '#d4a017',
          colorLink: '#d4a017',
          borderRadius: 8,
          fontFamily: "'Inter', sans-serif",
        },
      }}
    >
      <Toaster
        position="top-right"
        toastOptions={{ duration: 3000, style: { borderRadius: 8, fontFamily: 'Inter' } }}
      />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={isAuthenticated ? <Navigate to="/dashboard" /> : <AuthPage />} />
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/tournaments" element={<TournamentsPage />} />
            <Route path="/races" element={<RacesPage />} />
            <Route path="/horses" element={<HorsesPage />} />
            <Route path="/jockeys" element={<JockeysPage />} />
            <Route path="/predictions" element={<PredictionPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AppRoutes />
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
