import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import './NotFound.scss';

function NotFound() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="not-found">
      <div className="not-found__container">
        <div className="not-found__decorative-animation">
          <div className="not-found__shape not-found__shape--1"></div>
          <div className="not-found__shape not-found__shape--2"></div>
          <div className="not-found__shape not-found__shape--3"></div>
          <div className="not-found__shape not-found__shape--4"></div>
        </div>

        <div className="not-found__content">
          <div className="not-found__error-code">404</div>
          <h1 className="not-found__title">{t('notFound.title')}</h1>
          <p className="not-found__subtitle">{t('notFound.subtitle')}</p>
          <p className="not-found__description">{t('notFound.description')}</p>

          <div className="not-found__actions">
            <button
              className="not-found__button not-found__button--primary"
              onClick={handleGoHome}
            >
              {t('notFound.goHome')}
            </button>
            <button
              className="not-found__button not-found__button--secondary"
              onClick={handleGoBack}
            >
              {t('notFound.goBack')}
            </button>
          </div>
        </div>
      </div>

      <div className="not-found__footer">
        <span className="not-found__footer-text">
          {t('app.title')} - {new Date().getFullYear()}
        </span>
      </div>
    </div>
  );
}

export default NotFound;
