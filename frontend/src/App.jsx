import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./page/Home";
import GenerateCertificate from "./page/GenerateCertificate";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/generateCertificate" element={<GenerateCertificate />} />
      </Routes>
    </Router>
  );
}

export default App;
