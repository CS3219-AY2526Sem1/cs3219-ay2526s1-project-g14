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
import ProtectedRoute from './components/auth/ProtectedRoute';
import Home from "./views/home";
import Auth from "./views/Auth";
import QuestionsPage from './views/questions-page';
import AdminAddQuestion from './views/add-question';
import CollaborationSession from './views/collaboration-session';
import MatchingStatus from "./views/matching-status";

function AppContent() {
  const navigate = useNavigate();
  const username = useSelector((state) => state.auth.username);
  const role = useSelector((state) => state.auth.role);

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
        <Route path={PAGES.QUESTIONS} element={<QuestionsPage />} />
        <Route path={PAGES.COLLABORATION} element={<CollaborationSession />} />
        <Route path={PAGES.MATCH} element={<MatchingStatus />} />

        {/* Admin-only route */}
        <Route
          path={PAGES.ADDQUESTION}
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminAddQuestion />
            </ProtectedRoute>
          }
        />
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
