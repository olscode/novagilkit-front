import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import './MainMenu.scss';

function MainMenu() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  // Placeholder for navigation logic
  const handleStart = () => {
    console.log('Navegar a la página de selección de aplicación...');
    // Aquí iría la lógica de navegación, ej: usando react-router-dom history.push('/app-selection')
    navigate('/menu-app-selection');
  };

  return (
    <div className="main-menu">
      <div className="main-menu__container">
        <div className="main-menu__split-panel main-menu__split-panel--left">
          {/* Elementos decorativos o parte de la animación para el panel izquierdo */}
        </div>
        <div className="main-menu__split-panel main-menu__split-panel--right">
          {/* Elementos decorativos o parte de la animación para el panel derecho */}
        </div>

        {/* Capa de animación decorativa */}
        <div className="main-menu__decorative-animation">
          <div className="main-menu__shape main-menu__shape--1"></div>
          <div className="main-menu__shape main-menu__shape--2"></div>
          <div className="main-menu__shape main-menu__shape--3"></div>
        </div>

        {/* Superposición de contenido central */}
        <div className="main-menu__content-overlay">
          {' '}
          <h1 className="main-menu__title">{t('mainMenu.title')}</h1>
          <p className="main-menu__subtitle">{t('mainMenu.subtitle')}</p>
          <button className="main-menu__start-button" onClick={handleStart}>
            {t('mainMenu.startButton')}
          </button>
        </div>
      </div>{' '}
      <div className="main-menu__footer">
        <span className="main-menu__footer-text">
          {t('app.title')} - {new Date().getFullYear()}
        </span>
      </div>
    </div>
  );
}

export default MainMenu;
