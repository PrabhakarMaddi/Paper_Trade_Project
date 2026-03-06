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
        <div className="min-h-screen flex items-center justify-center bg-bg-main p-6 relative overflow-hidden indian-gradient-subtle">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-5%] right-[-5%] w-[30%] h-[30%] bg-primary/5 rounded-full blur-[80px]"></div>
            <div className="absolute bottom-[-5%] left-[-5%] w-[30%] h-[30%] bg-accent-up/5 rounded-full blur-[80px]"></div>

            <div className="glass-card w-full max-w-[440px] animate-in fade-in zoom-in duration-500 relative z-10">
                <div className="flex flex-col items-center gap-4 mb-10 text-center">
                    <div className="bg-primary/10 p-4 rounded-2xl shadow-inner">
                        <LineChart className="text-primary" size={42} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold tracking-tighter logo-text mb-1">Paper Bull</h1>
                        <p className="text-text-muted font-medium">India's Premium Trading Simulator</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-center text-text-main ">Welcome Trader</h2>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-text-muted ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light group-focus-within:text-primary transition-colors" size={20} />
                                <input
                                    type="email"
                                    className="form-input pl-12"
                                    placeholder="rahul@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-text-muted ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light group-focus-within:text-primary transition-colors" size={20} />
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
                            className="btn-primary w-full py-4 text-lg mt-4 active:translate-y-0"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Authenticating...' : 'Sign In to Account'}
                        </button>
                    </form>

                    <div className="relative py-4">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border-main"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-bg-main px-2 text-text-light font-bold">New to Paper Bull?</span>
                        </div>
                    </div>

                    <Link
                        to="/signup"
                        className="btn-outline w-full flex items-center justify-center py-4 text-lg"
                    >
                        Create Free Account
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
