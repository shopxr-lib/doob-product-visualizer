import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Plop from "./pages/Plop";
import Oomph from "./pages/Oomph";
import Plopsta from "./pages/Plopsta";
import Platoopat from "./pages/Platoopat";
import Toonacan from "./pages/Toonacan";
import Doobsta from "./pages/Doobsta";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Plop />} />
        <Route path="/plop" element={<Plop />} />
        <Route path="/oomph" element={<Oomph />} />
        <Route path="/plopsta" element={<Plopsta />} />
        <Route path="/platoopat" element={<Platoopat />} />
        <Route path="/toonacan" element={<Toonacan />} />
        <Route path="/doobsta" element={<Doobsta />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
