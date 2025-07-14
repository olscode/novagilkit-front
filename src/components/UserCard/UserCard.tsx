// UserCard.tsx
import { useTranslation } from 'react-i18next';
import './UserCard.scss';

interface UserCardProps {
  username: string;
  voteNumber: string;
  isCurrentUser?: boolean;
}

const UserCard = ({
  username,
  voteNumber,
  isCurrentUser = false,
}: UserCardProps) => {
  const { t } = useTranslation();
  // Estado de votación: voted, pending, o empty
  const voteStatus = voteNumber ? 'voted' : 'pending';

  return (
    <div
      className={`user-card ${
        isCurrentUser ? 'current-user' : ''
      } ${voteStatus}`}
    >
      {' '}
      <div
        className="vote-number"
        title={
          voteNumber
            ? `${username} ${t(
                'pokerPlanning.room.userStatus.voted'
              )}: ${voteNumber}`
            : `${username} ${t('pokerPlanning.room.userStatus.pending')}`
        }
      >
        {' '}
        {voteNumber}
      </div>{' '}
      <div className="username">
        <span className="username-text" title={username}>
          {username}
        </span>
        {isCurrentUser && (
          <span className="current-user-badge">
            {t('pokerPlanning.room.you')}
          </span>
        )}
      </div>
      <div className="vote-status">
        {voteNumber
          ? t('pokerPlanning.room.userStatus.voted')
          : t('pokerPlanning.room.userStatus.pending')}
      </div>
    </div>
  );
};

export default UserCard;
