import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Adopcion from './pages/Adopcion';
import Login from './pages/Login';

function App() {
  return (
    <BrowserRouter>
      {/* ¡Aquí está tu nueva Navbar! */}
      <Navbar />

      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<div className="p-10 text-center"><h1>Home: Próximamente</h1></div>} />
          <Route path="/adopcion" element={<Adopcion />} />
          <Route path="/login" element={<Login />} />
          {/* Agrega más rutas placeholder aquí */}
          
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;