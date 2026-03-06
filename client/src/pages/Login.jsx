import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { LineChart, Lock, Mail } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await login(email, password);
            toast.success('Namaste! Welcome back to Paper Bull.');
            navigate('/');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed. Check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-bg-dark p-6 relative overflow-hidden">
            {/* Background Decorative Blobs */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[100px]"></div>

            <div className="glass-card w-full max-max-w-[420px] p-10 animate-in fade-in zoom-in duration-500 relative z-10">
                <div className="flex flex-col items-center gap-3 mb-10 text-center">
                    <div className="bg-primary/20 p-4 rounded-2xl">
                        <LineChart className="text-primary" size={40} />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tighter logo-text">Paper Bull</h1>
                    <p className="text-slate-400 font-medium">India's Premium Trading Simulator</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-400 ml-1">Email Address</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={20} />
                            <input
                                type="email"
                                className="form-input pl-12"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-400 ml-1">Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={20} />
                            <input
                                type="password"
                                className="form-input pl-12"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn-primary w-full py-4 text-lg mt-4 shadow-xl shadow-primary/20 active:translate-y-0"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Signing in...' : 'Sign In Now'}
                    </button>
                </form>

                <p className="mt-10 text-center text-slate-500 text-sm font-medium">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-primary hover:text-white transition-colors font-bold">
                        Create free account
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
