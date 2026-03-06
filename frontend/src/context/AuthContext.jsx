import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('pt_user');
        return saved ? JSON.parse(saved) : null;
    });

    const login = (userData) => {
        localStorage.setItem('pt_token', userData.token);
        localStorage.setItem('pt_user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('pt_token');
        localStorage.removeItem('pt_user');
        setUser(null);
    };

    const updateBalance = (newBalance) => {
        const updated = { ...user, balance: newBalance };
        localStorage.setItem('pt_user', JSON.stringify(updated));
        setUser(updated);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, updateBalance }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
