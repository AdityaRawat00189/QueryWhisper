import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Database, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import databaseApi from '../services/databaseApi';
import { extractErrorMessage } from '../services/apiClient';
import Input from '../components/Input';
import PasswordInput from '../components/PasswordInput';
import Select from '../components/Select';
import Button from '../components/Button';
import ErrorMessage from '../components/ErrorMessage';

const ENVIRONMENT_OPTIONS = [
  { value: 'staging', label: 'staging' },
  { value: 'development', label: 'development' },
  { value: 'production', label: 'production' },
];

export const DatabaseSetup = () => {
  const navigate = useNavigate();
  const { handleDatabaseConnected, logout } = useAuth();

  const [formData, setFormData] = useState({
    environment: 'staging',
    dbUser: '',
    dbHost: 'localhost',
    dbName: '',
    dbPort: '5432',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectSuccess, setConnectSuccess] = useState(false);

  const validate = () => {
    const errs = {};
    if (!formData.environment) errs.environment = 'Environment is required';
    if (!formData.dbUser.trim()) errs.dbUser = 'Database user is required';
    if (!formData.dbHost.trim()) errs.dbHost = 'Database host is required';
    if (!formData.dbName.trim()) errs.dbName = 'Database name is required';
    if (!formData.dbPort) {
      errs.dbPort = 'Port is required';
    } else if (isNaN(Number(formData.dbPort)) || Number(formData.dbPort) <= 0) {
      errs.dbPort = 'Enter a valid port number (e.g. 5432 or 3306)';
    }
    if (!formData.password) errs.password = 'Database password is required';

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
    if (!validate() || isConnecting) return;

    setIsConnecting(true);
    setServerError('');

    try {
      await databaseApi.saveCredentials({
        environment: formData.environment,
        dbUser: formData.dbUser.trim(),
        dbHost: formData.dbHost.trim(),
        dbName: formData.dbName.trim(),
        dbPort: Number(formData.dbPort),
        password: formData.password,
      });

      // Clear password from local state immediately for security
      setFormData((prev) => ({ ...prev, password: '' }));
      setConnectSuccess(true);

      // Notify AuthContext and redirect to playground
      await handleDatabaseConnected(formData.dbName.trim());

      setTimeout(() => {
        navigate('/playground', { replace: true });
      }, 700);
    } catch (err) {
      const msg = extractErrorMessage(
        err,
        'Unable to connect to the database. Check your credentials and connection details.'
      );
      setServerError(msg);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded bg-brand text-white flex items-center justify-center shadow-subtle">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-text-primary">
              Connect your database
            </h1>
            <p className="text-xs text-text-secondary mt-0.5">
              Connect the SQL database you want to query from your workspace.
            </p>
          </div>
        </div>

        {/* Card Form */}
        <div className="bg-white p-6 sm:p-8 border border-border rounded-lg shadow-card">
          {connectSuccess ? (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-status-success animate-bounce" />
              <h3 className="text-sm font-semibold text-text-primary">
                Database Connected Successfully
              </h3>
              <p className="text-xs text-text-secondary font-mono">
                Redirecting to SQL Playground...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <ErrorMessage
                error={serverError}
                onDismiss={() => setServerError('')}
              />

              {/* Environment */}
              <Select
                label="Environment"
                id="environment"
                name="environment"
                value={formData.environment}
                onChange={handleChange}
                options={ENVIRONMENT_OPTIONS}
                error={errors.environment}
                required
                disabled={isConnecting}
                helperText="Defaults to staging for workspace testing."
              />

              {/* Grid for User & Host */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Database User"
                  id="dbUser"
                  name="dbUser"
                  placeholder="postgres or root"
                  value={formData.dbUser}
                  onChange={handleChange}
                  error={errors.dbUser}
                  required
                  disabled={isConnecting}
                  autoComplete="off"
                />

                <Input
                  label="Database Host"
                  id="dbHost"
                  name="dbHost"
                  placeholder="localhost"
                  value={formData.dbHost}
                  onChange={handleChange}
                  error={errors.dbHost}
                  required
                  disabled={isConnecting}
                  helperText="Usually localhost for local development."
                />
              </div>

              {/* Grid for DB Name & Port */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Database Name"
                  id="dbName"
                  name="dbName"
                  placeholder="my_database"
                  value={formData.dbName}
                  onChange={handleChange}
                  error={errors.dbName}
                  required
                  disabled={isConnecting}
                />

                <Input
                  label="Database Port"
                  id="dbPort"
                  name="dbPort"
                  placeholder="5432"
                  value={formData.dbPort}
                  onChange={handleChange}
                  error={errors.dbPort}
                  required
                  disabled={isConnecting}
                  helperText="e.g. 5432 (PostgreSQL), 3306 (MySQL)"
                />
              </div>

              {/* Password */}
              <PasswordInput
                label="Database Password"
                id="password"
                name="password"
                placeholder="Enter SQL database password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                required
                disabled={isConnecting}
                autoComplete="new-password"
                helperText="Password will be AES-256 encrypted on the server."
              />

              {/* Form Actions */}
              <div className="pt-3 border-t border-border flex items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="md"
                  onClick={logout}
                  disabled={isConnecting}
                  className="text-xs text-text-secondary"
                >
                  Sign Out
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    isLoading={isConnecting}
                    disabled={isConnecting}
                    className="font-medium min-w-[140px]"
                  >
                    {isConnecting ? 'Connecting...' : 'Connect Database'}
                  </Button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Security Assurance */}
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-text-muted">
          <ShieldCheck className="w-4 h-4 text-text-secondary" />
          <span>Credentials are securely encrypted and verified before storing.</span>
        </div>
      </div>
    </div>
  );
};

export default DatabaseSetup;
