import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { loginAdmin } from '../../services/AdminDashboardService';
import './AdminDashboardLogin.scss';

interface LoginFormData {
  username: string;
  password: string;
}

const AdminDashboardLogin: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const validateForm = (): boolean => {
    if (!formData.username.trim()) {
      setError(t('adminLogin.errors.usernameRequired'));
      return false;
    }

    if (!formData.password.trim()) {
      setError(t('adminLogin.errors.passwordRequired'));
      return false;
    }

    if (formData.password.length < 6) {
      setError(t('adminLogin.errors.passwordTooShort'));
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setError('');

    try {
      // Use the actual authentication service
      await loginAdmin(formData.username, formData.password);

      // Navigate to admin dashboard on successful login
      navigate('/admin/dashboard');
    } catch (err) {
      // Handle different types of errors
      if (err instanceof Error) {
        setError(t('adminLogin.errors.invalidCredentials'));
      } else {
        setError(t('adminLogin.errors.loginFailed'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-background">
        <div className="admin-login-card">
          <div className="admin-login-header">
            <div className="admin-login-logo">
              <div className="logo-icon">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <rect
                    width="40"
                    height="40"
                    rx="8"
                    fill="currentColor"
                    fillOpacity="0.1"
                  />
                  <path
                    d="M20 10L30 18V30C30 31.1046 29.1046 32 28 32H12C10.8954 32 10 31.1046 10 30V18L20 10Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M16 32V20H24V32"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h1 className="admin-login-title">{t('adminLogin.title')}</h1>
            </div>
            <p className="admin-login-subtitle">{t('adminLogin.subtitle')}</p>
          </div>

          <form className="admin-login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username" className="form-label">
                {t('adminLogin.username')}
              </label>
              <div className="input-wrapper">
                <div className="input-icon">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M10 10C12.7614 10 15 7.76142 15 5C15 2.23858 12.7614 0 10 0C7.23858 0 5 2.23858 5 5C5 7.76142 7.23858 10 10 10Z"
                      fill="currentColor"
                      fillOpacity="0.6"
                    />
                    <path
                      d="M10 12.5C5.85786 12.5 2.5 15.8579 2.5 20H17.5C17.5 15.8579 14.1421 12.5 10 12.5Z"
                      fill="currentColor"
                      fillOpacity="0.6"
                    />
                  </svg>
                </div>
                <input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    handleInputChange('username', e.target.value)
                  }
                  placeholder={t('adminLogin.usernamePlaceholder')}
                  className="form-input"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                {t('adminLogin.password')}
              </label>
              <div className="input-wrapper">
                <div className="input-icon">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M15.833 8.333H15V5.833C15 2.612 12.388 0 9.167 0S3.333 2.612 3.333 5.833V8.333H2.5C1.583 8.333 0.833 9.083 0.833 10V17.5C0.833 18.417 1.583 19.167 2.5 19.167H15.833C16.75 19.167 17.5 18.417 17.5 17.5V10C17.5 9.083 16.75 8.333 15.833 8.333ZM5 5.833C5 3.533 6.867 1.667 9.167 1.667S13.333 3.533 13.333 5.833V8.333H5V5.833Z"
                      fill="currentColor"
                      fillOpacity="0.6"
                    />
                  </svg>
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange('password', e.target.value)
                  }
                  placeholder={t('adminLogin.passwordPlaceholder')}
                  className="form-input"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path
                        d="M14.95 14.95C13.4815 16.0939 11.6884 16.7155 9.84375 16.7188C4.375 16.7188 0.625 10 0.625 10C1.99268 7.45071 4.04268 5.32321 6.53125 3.90625L14.95 14.95Z"
                        fill="currentColor"
                        fillOpacity="0.6"
                      />
                      <path
                        d="M19.375 10C19.375 10 15.625 16.7188 9.84375 16.7188C8.84375 16.7188 7.90625 16.5313 7.03125 16.2188L4.6875 18.5625L3.75 17.625L17.625 3.75L18.5625 4.6875L16.2188 7.03125C17.8125 8.09375 19.375 10 19.375 10Z"
                        fill="currentColor"
                        fillOpacity="0.6"
                      />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path
                        d="M10 7.5C8.61929 7.5 7.5 8.61929 7.5 10C7.5 11.3807 8.61929 12.5 10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 10 7.5Z"
                        fill="currentColor"
                        fillOpacity="0.6"
                      />
                      <path
                        d="M19.375 10C19.375 10 15.625 16.7188 10 16.7188C4.375 16.7188 0.625 10 0.625 10C0.625 10 4.375 3.28125 10 3.28125C15.625 3.28125 19.375 10 19.375 10ZM10 5.625C7.23858 5.625 5 7.86358 5 10.625C5 13.3864 7.23858 15.625 10 15.625C12.7614 15.625 15 13.3864 15 10.625C15 7.86358 12.7614 5.625 10 5.625Z"
                        fill="currentColor"
                        fillOpacity="0.6"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="error-message">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M8 0C3.58 0 0 3.58 0 8C0 12.42 3.58 16 8 16C12.42 16 16 12.42 16 8C16 3.58 12.42 0 8 0ZM8.8 12H7.2V10.4H8.8V12ZM8.8 8.8H7.2V4H8.8V8.8Z"
                    fill="currentColor"
                  />
                </svg>
                {error}
              </div>
            )}

            <div className="form-actions">
              <button
                type="submit"
                className="login-button"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="button-loading">
                    <div className="spinner"></div>
                    {t('adminLogin.loggingIn')}
                  </div>
                ) : (
                  t('adminLogin.loginButton')
                )}
              </button>

              <button
                type="button"
                className="back-button"
                onClick={handleBackToHome}
                disabled={isLoading}
              >
                {t('adminLogin.backToHome')}
              </button>
            </div>
          </form>

          <div className="admin-login-footer">
            <p className="footer-text">{t('adminLogin.footerText')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardLogin;
