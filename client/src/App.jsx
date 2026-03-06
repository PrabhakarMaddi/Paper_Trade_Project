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
                                background: '#ffffff',
                                color: '#0f172a',
                                border: '1px solid #e2e8f0',
                                fontWeight: '700',
                                fontSize: '14px',
                                borderRadius: '12px',
                                boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.1)'
                            }
                        }}
                    />
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
