import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import './MenuAppSelection.scss';

export default function MenuAppSelection() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Función genérica para manejar la navegación
  const handleNavigation = (route: string) => {
    navigate(route);
  };

  return (
    <div className="menu-app-selection">
      <div className="menu-app-selection__container">
        {' '}
        <h1 className="menu-app-selection__title">{t('appSelection.title')}</h1>
        <p className="menu-app-selection__subtitle">
          {t('appSelection.subtitle')}
        </p>{' '}
        <div className="menu-app-selection__apps">
          <div
            className="menu-app-selection__app-button"
            onClick={() => handleNavigation('/planning-votes/menu')}
          >
            <img
              className="menu-app-selection__app-image"
              src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiBAH9dsagNL9BMuGv1tb7EoDjXdldq0QmVM84OD3guzzuuIfKegU1vMuT0-R18zmauMMWlOpnZcE66WHzQCkjEaMZPOGKjqy1tskunLEBBmfKtTW8xikXVQ7HkOS7hldFYtczG4qAhEmrY/s1600/dados-rojos-vector_621212.jpg"
              alt="planning-votes"
            />
            <div className="menu-app-selection__app-info">
              {' '}
              <h4>{t('appSelection.planningVotes.title')}</h4>
              <p>{t('appSelection.planningVotes.description')}</p>
            </div>
          </div>
          <div
            className="menu-app-selection__app-button"
            onClick={() => handleNavigation('/quiz')}
          >
            <img
              className="menu-app-selection__app-image"
              src="https://www.educaciontrespuntocero.com/wp-content/uploads/2017/08/kahoot-1-978x652.jpg"
              alt="Quiz Interactivo"
            />
            <div className="menu-app-selection__app-info">
              {' '}
              <h4>{t('appSelection.quiz.title')}</h4>
              <p>{t('appSelection.quiz.description')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
