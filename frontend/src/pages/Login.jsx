import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Database, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import PasswordInput from '../components/PasswordInput';
import Button from '../components/Button';
import ErrorMessage from '../components/ErrorMessage';

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const errs = {};
    if (!formData.email.trim()) {
      errs.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      errs.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errs.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (serverError) {
      setServerError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate() || isSubmitting) return;

    setIsSubmitting(true);
    setServerError('');

    try {
      const result = await login({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (result.hasDatabaseCredentials) {
        navigate('/playground', { replace: true });
      } else {
        navigate('/database-setup', { replace: true });
      }
    } catch (err) {
      setServerError(err.message || 'Failed to sign in. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Header */}
        <div className="flex items-center justify-center gap-2.5 mb-6">
          <div className="w-8 h-8 rounded bg-brand text-white flex items-center justify-center shadow-subtle">
            <Database className="w-4 h-4" />
          </div>
          <span className="text-base font-bold tracking-tight text-text-primary">
            QueryWhisper
          </span>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-xl font-semibold tracking-tight text-text-primary">
            Sign in to your workspace
          </h1>
          <p className="text-xs text-text-secondary mt-1.5">
            Access your connected databases and SQL workspace
          </p>
        </div>

        {/* Card Surface */}
        <div className="bg-white py-8 px-6 sm:px-8 border border-border rounded-lg shadow-card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <ErrorMessage
              error={serverError}
              onDismiss={() => setServerError('')}
            />

            <Input
              label="Email"
              id="email"
              name="email"
              type="email"
              placeholder="name@company.com"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              required
              disabled={isSubmitting}
              autoComplete="email"
              autoFocus
            />

            <PasswordInput
              label="Password"
              id="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              required
              disabled={isSubmitting}
              autoComplete="current-password"
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSubmitting}
                disabled={isSubmitting}
                className="w-full font-medium"
              >
                Sign In
              </Button>
            </div>
          </form>

          {/* Footer Link */}
          <div className="mt-6 pt-5 border-t border-border text-center text-xs text-text-secondary">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="font-medium text-text-primary hover:underline inline-flex items-center gap-0.5"
            >
              <span>Create account</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
