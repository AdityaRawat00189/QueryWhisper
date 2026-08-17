import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Database, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import PasswordInput from '../components/PasswordInput';
import Button from '../components/Button';
import ErrorMessage from '../components/ErrorMessage';

export const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const errs = {};
    if (!formData.username.trim()) {
      errs.username = 'Username is required';
    } else if (formData.username.trim().length < 2) {
      errs.username = 'Username must be at least 2 characters';
    }

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

    if (!formData.confirmPassword) {
      errs.confirmPassword = 'Confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
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
      await signup({
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      // New users have no database credentials configured yet, redirect to setup
      navigate('/database-setup', { replace: true });
    } catch (err) {
      setServerError(err.message || 'Failed to create account. Please try again.');
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
            Create your workspace account
          </h1>
          <p className="text-xs text-text-secondary mt-1.5">
            Connect and query your SQL databases in seconds
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
              label="Username"
              id="username"
              name="username"
              placeholder="johndoe"
              value={formData.username}
              onChange={handleChange}
              error={errors.username}
              required
              disabled={isSubmitting}
              autoComplete="username"
              autoFocus
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
            />

            <PasswordInput
              label="Password"
              id="password"
              name="password"
              placeholder="Minimum 6 characters"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              required
              disabled={isSubmitting}
              autoComplete="new-password"
            />

            <PasswordInput
              label="Confirm Password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Re-enter password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              required
              disabled={isSubmitting}
              autoComplete="new-password"
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
                Create Account
              </Button>
            </div>
          </form>

          {/* Footer Link */}
          <div className="mt-6 pt-5 border-t border-border text-center text-xs text-text-secondary">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-text-primary hover:underline inline-flex items-center gap-0.5"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Sign in</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
