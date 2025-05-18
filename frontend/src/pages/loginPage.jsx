import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../redux/slices/userSlice';
import { useNavigate } from 'react-router-dom';
import './../styles/login.css';

const LoginPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isLoading, error } = useSelector((state) => state.user);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        dispatch(loginUser({ email, password }))
            .unwrap()
            .then(() => {
                navigate('/user/income');
            })
            .catch(() => { 'Invalid email and passwords!' });
    };

    return (
        <div className="login-container">
            <h1>Finance App</h1>
            <h2>Sign In</h2>
            <form onSubmit={handleLogin} className="login-form">
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    required
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    required
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Logging in...' : 'Login'}
                </button>
                <p>
                    <a href="/forgot-password">Forgot Password?</a>
                </p>
                <p>
                    Don't have an account? <a href="/register">Register</a>
                </p>
                {error && <p className="error">{error}</p>}
            </form>
        </div>
    );
};

export default LoginPage;
