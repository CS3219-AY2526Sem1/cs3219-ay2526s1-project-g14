import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route
} from "react-router-dom";

import Home from "./views/home";
import Login from "./views/login";
import QuestionsPage from './views/questions';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/questions" element={<QuestionsPage/>} />
      </Routes>
    </Router>
  );
}

export default App;
