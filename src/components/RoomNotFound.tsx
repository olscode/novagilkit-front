import { Trans, useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import './RoomNotFound.scss';

export default function RoomNotFound() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="room-not-found-container">
      <div className="room-not-found-content">
        <img
          src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExb2J6b2Z2b2F2d3F2b2J6b2Z2b2F2d3F2b2J6b2Z2b2F2d3F2/g01ZnwAUvutuK8GIQn/giphy.gif"
          alt={t('roomNotFound.gifAlt')}
          className="room-not-found-gif"
        />
        <h1>{t('roomNotFound.title')}</h1>
        <p>
          <Trans
            i18nKey="roomNotFound.description"
            values={{ roomId }}
            components={{ 1: <span className="room-id" /> }}
          />
        </p>
        <button
          className="room-not-found-btn"
          onClick={() => navigate('/', { replace: true })}
        >
          <span>{t('roomNotFound.backButton')}</span>
        </button>
      </div>
    </div>
  );
}
