import "./App.css";
import AppRoutes from "./Routes";
import NavBar from "./components/NavBar";
import { AuthProvider } from "./context/AuthContext";

const App = () => {
  return (
    <AuthProvider>
      <div className="app">
        <NavBar />
        <main className="app-main">
          <AppRoutes />
        </main>
      </div>
    </AuthProvider>
  );
};

export default App;
