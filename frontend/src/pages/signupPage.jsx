import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { signupUser } from '../redux/slices/userSlice';
import { useNavigate } from 'react-router-dom';
import './../styles/login.css';

const SignupPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isLoading, error } = useSelector((state) => state.user);
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');

    const handleSignUp = async (e) => {
        e.preventDefault();
        dispatch(signupUser({ name, email, password }))
            .unwrap()
            .then(() => {
                navigate('/login');
            })
            .catch(() => { 'Invalid email and passwords!' });
    };

    return (
        <div className="login-container">
            <h1>Finance App</h1>
            <h2>Sign Up</h2>
            <form onSubmit={handleSignUp} className="login-form">
                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    required
                    onChange={(e) => setName(e.target.value)}
                />
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
                    {isLoading ? 'Singing up...' : 'Register'}
                </button>
                <p>
                    Already have an account? <a href="/login">Sign in</a>
                </p>
                {error && <p className="error">{error}</p>}
            </form>
        </div>
    );
};

export default SignupPage;
