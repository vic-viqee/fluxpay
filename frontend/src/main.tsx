import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';

import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import MainLayout from './layouts/MainLayout';

const Index = lazy(() => import('./pages/Index'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Payments = lazy(() => import('./pages/Payments'));
const Customers = lazy(() => import('./pages/Customers'));
const Subscriptions = lazy(() => import('./pages/Subscriptions'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Settings = lazy(() => import('./pages/Settings'));
const Pricing = lazy(() => import('./pages/Pricing'));
const Documentation = lazy(() => import('./pages/Documentation'));
const SubscriptionCheckout = lazy(() => import('./pages/SubscriptionCheckout'));
const Plans = lazy(() => import('./pages/Plans'));
const GoogleCallback = lazy(() => import('./pages/GoogleCallback'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const GoogleRegistrationCompletion = lazy(() => import('./pages/GoogleRegistrationCompletion'));
const Admin = lazy(() => import('./pages/Admin'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));

const Loading = () => (
  <div className="min-h-screen bg-primary-bg flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-main"></div>
  </div>
);

const persistedTheme = localStorage.getItem('themeMode');
if (persistedTheme === 'light') {
  document.documentElement.classList.add('theme-light');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/documentation" element={<Documentation />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/subscribe" element={<SubscriptionCheckout />} />
            <Route path="/auth/google/callback" element={<GoogleCallback />} />
            <Route path="/google-register-complete" element={<GoogleRegistrationCompletion />} />
            
            <Route element={<PrivateRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/payments" element={<Payments />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/subscriptions" element={<Subscriptions />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/plans" element={<Plans />} />
                <Route path="/admin" element={<Admin />} />
              </Route>
            </Route>

          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);