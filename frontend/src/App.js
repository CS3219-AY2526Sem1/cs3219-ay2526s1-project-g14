import './App.css';
import { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate
} from "react-router-dom";
import { useSelector } from "react-redux";

import { PAGES } from "./constants/pages"
import NavigationBar from './components/NavigationBar';
import Home from "./views/home";
import Auth from "./views/Auth";
import QuestionsPage from './views/questions-page';

import CollaborationSession from './views/collaboration-session';

import MatchingStatus from "./views/matching-status";


function AppContent() {
  const navigate = useNavigate();
  const username = useSelector((state) => state.auth.username);

  const checkAuthenticated = () => {
    if (username == null) {
      navigate(PAGES.LOGIN)
    }
  }

  useEffect(() => {
    checkAuthenticated()
  },[])

  return (
    <>
      <NavigationBar />

      <Routes>
        <Route path={PAGES.HOME} element={<Home />} />
        <Route path={PAGES.LOGIN} element={<Auth />} />
        <Route path={PAGES.REGISTER} element={<Auth />} />
        <Route path="/questions" element={<QuestionsPage />} />
        <Route path="/collaboration/:sessionId" element={<CollaborationSession />} />
        <Route path="/match" element={<MatchingStatus />} />
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
