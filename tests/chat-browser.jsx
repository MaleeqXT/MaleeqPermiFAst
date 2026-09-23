// Development-only fixture entry; not included in the production Vite build.
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router-dom';
import CandidateChatPage from '../src/new-student-dashboard/CandidateChatPage.jsx';
import MonitorChatPage from '../src/monitordashboard/MonitorChatPage.jsx';
import AdminChatPage from '../src/Components/chat/AdminChatPage.jsx';
import http from '../src/helpers/http.jsx';

const role = new URLSearchParams(window.location.search).get('role') || 'student';
if (!import.meta.env.DEV || !['localhost', '127.0.0.1'].includes(location.hostname) || !['5174', '5175'].includes(location.port)) {
  throw new Error('This fixture runs only on dedicated local test ports.');
}
http.defaults.baseURL = 'http://127.0.0.1:8001/api';
window.__PPF_CHAT_REVERB__ = { key: 'chat-test-key', host: '127.0.0.1', port: 8081, scheme: 'http' };
const { data } = await http.get(`/chat-test/session/${role}`);
window.localStorage.setItem('ppf_auth_token', data.token);
const store = configureStore({ reducer: { auth: () => ({ user: data.user, isAuthenticated: true }) } });
const preview = role === 'admin' && new URLSearchParams(location.search).has('monitorPreview');
const monitorId = preview ? (await http.get('/chat-test/session/monitor')).data.user.monitor.id : null;
const Page = role === 'student' ? CandidateChatPage : role === 'monitor' || preview ? MonitorChatPage : AdminChatPage;
createRoot(document.getElementById('root')).render(<React.StrictMode><Provider store={store}><BrowserRouter><Page monitorId={monitorId} /></BrowserRouter></Provider></React.StrictMode>);
