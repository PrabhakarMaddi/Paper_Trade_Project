import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Trade from './pages/Trade';
import Portfolio from './pages/Portfolio';
import History from './pages/History';
import Leaderboard from './pages/Leaderboard';

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <Router>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />

                        <Route path="/" element={
                            <ProtectedRoute>
                                <Layout />
                            </ProtectedRoute>
                        }>
                            <Route index element={<Dashboard />} />
                            <Route path="trade" element={<Trade />} />
                            <Route path="portfolio" element={<Portfolio />} />
                            <Route path="history" element={<History />} />
                            <Route path="leaderboard" element={<Leaderboard />} />
                        </Route>
                    </Routes>
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            style: {
                                background: '#151d27',
                                color: '#fff',
                                border: '1px solid rgba(255,255,255,0.1)'
                            }
                        }}
                    />
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
