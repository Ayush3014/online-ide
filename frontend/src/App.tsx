import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { CodingPage } from './components/CodingPage';
import { CodingPagePostPodCreation } from './components/CodingPage';
import Landing from './components/Landing';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/coding" element={<CodingPage />} />
        {/* temp path coding2 for testing */}
        <Route path="/coding2" element={<CodingPagePostPodCreation />} />
        <Route path="/" element={<Landing />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
