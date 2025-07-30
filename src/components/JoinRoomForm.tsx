import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { v4 as uuidv4 } from 'uuid';
import { useSocket } from '../hooks/useSocket';
import { useAppDispatch } from '../redux/hooks';
import { createProfile } from '../redux/reducers';
import './JoinRoom.scss';

function JoinRoomForm() {
  const dispatch = useAppDispatch(); // ✅ Tipado automático para dispatch
  const navigate = useNavigate();
  const { socket } = useSocket();
  const { t } = useTranslation();

  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoinRoom = () => {
    if (!username.trim()) {
      setError(t('planningVotes.joinRoom.errors.usernameRequired'));
      return;
    }

    if (!roomId.trim()) {
      setError(t('planningVotes.joinRoom.errors.roomCodeRequired'));
      return;
    }

    setIsLoading(true);
    setError('');

    const userId = uuidv4();

    // Create user profile
    dispatch(
      createProfile({
        username,
        userId,
        active: true,
      })
    );

    // Emit event to join room
    socket?.emit('joinRoom', roomId, userId, username);

    // Navigate to room
    navigate(`/planning-votes/room/${roomId}`);
  };
  return (
    <div className="join-room-container">
      {/* Decorative elements */}
      <div className="decorative-shape decorative-shape-1"></div>
      <div className="decorative-shape decorative-shape-2"></div>
      <div className="decorative-shape decorative-shape-3"></div>

      <div className="join-room-form">
        <div className="form-header">
          <h1>{t('planningVotes.joinRoom.title')}</h1>
          <p>{t('planningVotes.joinRoom.description')}</p>
        </div>
        {error && <div className="error-message">{error}</div>}
        <div className="form-group">
          <label htmlFor="roomId">{t('planningVotes.joinRoom.roomCode')}</label>
          <div className="input-with-icon">
            <span className="input-icon">🔑</span>
            <input
              id="roomId"
              className="input-room-id"
              type="text"
              placeholder={t('planningVotes.joinRoom.roomCodeLabel')}
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            />
          </div>
          <small>{t('planningVotes.joinRoom.roomCodeHelp')}</small>
        </div>
        <div className="form-group">
          <label htmlFor="username">
            {t('planningVotes.joinRoom.username')}
          </label>
          <div className="input-with-icon">
            <span className="input-icon">👤</span>
            <input
              id="username"
              className="input-username"
              type="text"
              placeholder={t('planningVotes.joinRoom.usernameLabel')}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={20}
            />
          </div>
        </div>{' '}
        <div className="form-actions">
          <button
            className="button-primary join-button"
            onClick={handleJoinRoom}
            disabled={isLoading}
          >
            {isLoading
              ? t('common.loading')
              : t('planningVotes.joinRoom.joinButton')}
          </button>
          <button
            className="button-secondary"
            onClick={() => navigate('/planning-votes/menu')}
            disabled={isLoading}
          >
            {t('common.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default JoinRoomForm;
