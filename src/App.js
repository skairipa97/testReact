import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginChat from "./loginChat";
import App1 from "./App1";

function App() {
  const isAuthenticated = localStorage.getItem("user") !== null;

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginChat />} />
        <Route path="/chat" element={isAuthenticated ? <App1 /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to={isAuthenticated ? "/chat" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;
