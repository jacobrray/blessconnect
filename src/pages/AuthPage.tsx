import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AuthPageProps {
    onAuthSuccess: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
            }
            onAuthSuccess();
        } catch (err: any) {
            setError(err.message || 'An error occurred during authentication.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl premium-glass shadow-2xl p-8"
            >
                <div className="flex justify-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                        <MapPin className="w-8 h-8 text-white" />
                    </div>
                </div>

                <h1 className="text-3xl font-black text-center text-gray-900 mb-2">
                    BLESS Connect
                </h1>
                <p className="text-center text-gray-500 mb-8">
                    {isLogin ? 'Welcome back to the neighborhood.' : 'Join the movement.'}
                </p>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-medium border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                            type="email"
                            required
                            placeholder="Email address"
                            className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all outline-none"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                            type="password"
                            required
                            placeholder="Password"
                            className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all outline-none"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !email || !password}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] flex items-center justify-center disabled:opacity-50 disabled:active:scale-100"
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            isLogin ? 'Sign In' : 'Create Account'
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center bg-gray-50/50 -mx-8 -mb-8 p-6 border-t border-gray-100">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors"
                    >
                        {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
