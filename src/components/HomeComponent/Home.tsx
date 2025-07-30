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
        <h1>{t('planningVotes.title')}</h1>
        <p>{t('planningVotes.subtitle')}</p>
      </div>

      <div className="container">
        <ProtectedCard
          icon="✨"
          title={t('menu.createRoom')}
          description={t('planningVotes.createRoom.description')}
          onClick={() => handleNavigation('/planning-votes/createRoom')}
          variant="primary"
          className="create-room"
        />

        <ProtectedCard
          icon="🚪"
          title={t('menu.joinRoom')}
          description={t('planningVotes.joinRoom.description')}
          onClick={() => handleNavigation('/planning-votes/joinRoom')}
          variant="secondary"
          className="join-room"
        />
      </div>
    </div>
  );
}

export default HomeComponent;
