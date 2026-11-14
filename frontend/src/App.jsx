import { useAuth } from './context/AuthContext.jsx';
import AuthPage from './pages/AuthPage.jsx';
import BoardPage from './pages/BoardPage.jsx';

// Due sole schermate: non serve un router. Loggato -> bacheca, altrimenti -> accesso.
export default function App() {
  const { user } = useAuth();
  return user ? <BoardPage /> : <AuthPage />;
}
