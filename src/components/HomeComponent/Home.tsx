import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import ProtectedCard from '../ProtectedCard/ProtectedCard';
import './Home.scss';

function HomeComponent() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleNavigation = (route: string) => {
    navigate(route);
  };

  return (
    <div className="wrapper">
      <div className="home-header">
        <h1>{t('pokerPlanning.title')}</h1>
        <p>{t('pokerPlanning.subtitle')}</p>
      </div>

      <div className="container">
        <ProtectedCard
          icon="✨"
          title={t('menu.createRoom')}
          description={t('pokerPlanning.createRoom.description')}
          onClick={() => handleNavigation('/poker-planning/createRoom')}
          variant="primary"
          className="create-room"
        />

        <ProtectedCard
          icon="🚪"
          title={t('menu.joinRoom')}
          description={t('pokerPlanning.joinRoom.description')}
          onClick={() => handleNavigation('/poker-planning/joinRoom')}
          variant="secondary"
          className="join-room"
        />
      </div>
    </div>
  );
}

export default HomeComponent;
