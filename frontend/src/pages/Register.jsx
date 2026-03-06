import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Register() {
    const [form, setForm] = useState({ username: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (form.password.length < 6) return setError('Password must be at least 6 characters');
        setLoading(true);
        try {
            const { data } = await api.post('/auth/register', form);
            login(data);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: 'radial-gradient(ellipse at top, #1a1040 0%, #0a0e1a 60%)' }}>
            {/* Ambient blobs */}
            <div className="fixed top-20 left-20 w-72 h-72 rounded-full opacity-10 blur-3xl" style={{ background: '#6366f1' }} />
            <div className="fixed bottom-20 right-20 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: '#06b6d4' }} />

            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                className="glass-card p-8 w-full max-w-md mx-4">

                {/* Logo */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                        <TrendingUp size={20} color="white" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg gradient-text">PaperTrade</h1>
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Virtual Stock Market</p>
                    </div>
                </div>

                <h2 className="text-2xl font-bold mb-1">Create Account</h2>
                <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Start trading with $100,000 virtual money</p>

                {error && (
                    <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div style={{ position: 'relative' }}>
                        <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        <input className="input-dark" style={{ paddingLeft: '2.5rem' }} placeholder="Username" value={form.username}
                            onChange={e => setForm({ ...form, username: e.target.value })} required minLength={3} />
                    </div>
                    <div style={{ position: 'relative' }}>
                        <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        <input className="input-dark" style={{ paddingLeft: '2.5rem' }} placeholder="Email" type="email" value={form.email}
                            onChange={e => setForm({ ...form, email: e.target.value })} required />
                    </div>
                    <div style={{ position: 'relative' }}>
                        <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        <input className="input-dark" style={{ paddingLeft: '2.5rem' }} placeholder="Password (min 6 chars)" type="password" value={form.password}
                            onChange={e => setForm({ ...form, password: e.target.value })} required />
                    </div>
                    <button className="btn-primary w-full mt-2" type="submit" disabled={loading}>
                        {loading ? 'Creating Account...' : <><span>Create Account</span><ArrowRight size={16} /></>}
                    </button>
                </form>

                <p className="text-center text-sm mt-6" style={{ color: 'var(--text-secondary)' }}>
                    Already have an account?{' '}
                    <Link to="/login" style={{ color: 'var(--accent)' }} className="font-medium hover:underline">Sign In</Link>
                </p>
            </motion.div>
        </div>
    );
}
