import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation
} from "react-router-dom";
import NavigationBar from './components/NavigationBar';
import Home from "./views/home";
import Login from "./views/login";
import QuestionsPage from './views/questions-page';

function AppContent() {
  const location = useLocation();

  return (
    <>
      {location.pathname !== "/login" && (
        <NavigationBar />
      )}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/questions" element={<QuestionsPage />} />
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
