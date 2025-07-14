import { useEffect, useState } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router';
import './App.scss';
import { AuthProvider } from './AuthContext';
import CreateRoomForm from './components/CreateRoomForm';
import HomeComponent from './components/HomeComponent/Home';
import JoinRoomForm from './components/JoinRoomForm';
import MainMenu from './components/MainMenu/MainMenu';
import MenuAppSelection from './components/MenuAppSelection/MenuAppSelection';
import NotFound from './components/NotFound/NotFound';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import ResumeVotes from './components/ResumeVotes/ResumeVotes';
import Room from './components/Room/Room';
import RoomNotFound from './components/RoomNotFound';
import Settings from './components/Settings/Settings';
import SocketDebugger from './components/SocketDebugger/SocketDebugger';
import { ToastProvider } from './components/Toast/ToastContext';
import { SocketProvider } from './SocketContext';

function App() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    // Recuperar preferencia del localStorage o usar preferencias del sistema
    const savedMode = localStorage.getItem('darkMode');
    return savedMode
      ? JSON.parse(savedMode)
      : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Efecto para aplicar el tema usando data attributes
  useEffect(() => {
    const theme = darkMode ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);

    // Guardar preferencia en localStorage
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  return (
    <AuthProvider>
      <SocketProvider>
        <ToastProvider>
          <Router>
            <div className="app-layout">
              {/* Botón flotante de configuraciones */}
              <Settings darkMode={darkMode} onDarkModeToggle={toggleDarkMode} />

              {/* Debug del socket (solo en desarrollo) */}
              <SocketDebugger visible={false} />

              <Routes>
                <Route path="/" element={<MainMenu />} />
                <Route
                  path="/menu-app-selection"
                  element={<MenuAppSelection />}
                />
                <Route
                  path="/poker-planning/menu"
                  element={<HomeComponent />}
                />
                <Route
                  path="/poker-planning/createRoom"
                  element={
                    <ProtectedRoute showMessage={true}>
                      <CreateRoomForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/poker-planning/joinRoom"
                  element={
                    <ProtectedRoute showMessage={true}>
                      <JoinRoomForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/poker-planning/room/:roomId"
                  element={
                    <ProtectedRoute showMessage={true}>
                      <Room />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/poker-planning/room/:roomId/resumeVotes"
                  element={
                    <ProtectedRoute showMessage={true}>
                      <ResumeVotes />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/room-not-found/:roomId"
                  element={<RoomNotFound />}
                />
                {/* La autenticación de Jira ahora se maneja en el backend */}
                {/* Ruta catch-all para páginas no encontradas - debe ir al final */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </Router>
        </ToastProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
