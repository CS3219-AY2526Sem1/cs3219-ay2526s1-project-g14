import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate
} from "react-router-dom";
import { useSelector } from "react-redux";

import { PAGES } from "./constants/pages"
import NavigationBar from './components/NavigationBar';
import Home from "./views/home";
import Auth from "./views/Auth";
import QuestionsPage from './views/questions-page';
import { useEffect, useState } from 'react';
import CollaborationSession from './views/collaboration-session';

function AppContent() {
  const navigate = useNavigate();
  const { username } = useSelector((state) => state.auth);
  
  // const checkAuthenticated = () => {
  //   if (username == null) {
  //     navigate(PAGES.LOGIN)
  //   }
  // }
  // 🧪 DISABLE AUTH - Skip authentication completely
  useEffect(() => {
    // Set a default mock user for auth bypass
    const mockUser = {
      user: {
        token: 'mock-jwt-token-for-testing',
        _id: 'user123',
        email: 'alice@test.com',
        username: 'Alice'
      }
    };
    localStorage.setItem('state', JSON.stringify(mockUser));
    console.log('🧪 AUTH DISABLED: Default user set (will be overridden by UserSelector)');
  }, []);

  // Skip all authentication checks
  // const checkAuthenticated = () => {
  //   if (username == null) {
  //     navigate(PAGES.LOGIN)
  //   }
  // }

  return (
    <>
      <NavigationBar />

      <Routes>
        <Route path={PAGES.HOME} element={<Home />} />
        <Route path={PAGES.LOGIN} element={<Auth />} />
        <Route path={PAGES.REGISTER} element={<Auth />} />
        <Route path="/questions" element={<QuestionsPage />} />
        <Route path="/collaboration/:sessionId" element={<CollaborationSession />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
