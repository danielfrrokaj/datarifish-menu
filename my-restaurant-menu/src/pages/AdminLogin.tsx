import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import '../styles/AdminLogin.css';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim()
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      if (data?.user) {
        setIsSuccess(true);
        setTimeout(() => {
          navigate('/admin');
        }, 1000);
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <form onSubmit={handleAuth} className={`admin-login-form ${isSuccess ? 'success' : ''}`}>
        <h2>Admin Login</h2>
        
        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}

        {isSuccess && (
          <div className="success-message" role="alert">
            Login successful!
          </div>
        )}

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading || isSuccess}
            placeholder="Enter your email"
            autoComplete="email"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading || isSuccess}
            placeholder="Enter your password"
            autoComplete="current-password"
            minLength={6}
          />
        </div>

        <button 
          type="submit" 
          disabled={isLoading || isSuccess}
          className={isLoading ? 'loading' : ''}
        >
          {isLoading ? 'Please wait...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default AdminLogin; 