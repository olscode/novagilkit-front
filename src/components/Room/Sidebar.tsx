import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { useAppSelector } from '../../redux/hooks';
import './Sidebar.scss';

export default function Sidebar() {
  // On desktop: true = expanded, false = collapsed
  // On mobile: true = visible overlay, false = hidden
  const [isOpened, setIsOpened] = useState<boolean>(true);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const { roomId } = useParams<{ roomId: string }>();

  // ✅ Usar hooks tipados para obtener información del estado de Redux
  const users = useAppSelector((state) => state.room.users);
  const tasks = useAppSelector((state) => state.room.tasks);
  const creatorId = useAppSelector((state) => state.room.creatorId);
  const currentTaskId = useAppSelector((state) => state.room.currentTaskId);

  const handleToggleSidebar = () => {
    setIsOpened(!isOpened);
  };

  // Handle clicks outside sidebar on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Only handle on mobile and when sidebar is open
      if (window.innerWidth <= 768 && isOpened && sidebarRef.current) {
        const target = event.target as Element;
        const isClickOutsideSidebar = !sidebarRef.current.contains(target);
        const isClickOnToggleButton = target.closest('.sidebar-toggle-button');

        if (isClickOutsideSidebar && !isClickOnToggleButton) {
          setIsOpened(false);
        }
      }
    };

    if (isOpened) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpened]);

  const copyRoomIdToClipboard = () => {
    if (!roomId) return;

    navigator.clipboard
      .writeText(roomId)
      .then(() => {
        // Optional: Add feedback to the user, e.g., a toast notification
        console.log(t('planningVotes.room.sidebar.copySuccess'));
      })
      .catch((err) => {
        console.error('Failed to copy Room ID: ', err);
      });
  };

  const sidebarClass = `sidebar_component 
  ${isOpened ? 'sidebar_component--open' : 'sidebar_component--closed'}`;

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        className={`sidebar-toggle-button ${
          isOpened ? 'sidebar-toggle-button--active' : ''
        }`}
        onClick={handleToggleSidebar}
      >
        <div className="hamburger-line"></div>
        <div className="hamburger-line"></div>
        <div className="hamburger-line"></div>
      </button>

      <div className={sidebarClass} ref={sidebarRef}>
        <div className="sidebar_header">
          <h2
            className={
              isOpened ? 'sidebar_title' : 'sidebar_title sidebar_title--closed'
            }
          >
            {t('planningVotes.room.sidebar.title')}
          </h2>
        </div>
        <div
          className={
            isOpened
              ? 'sidebar_details'
              : 'sidebar_details sidebar_details--closed'
          }
        >
          <div className="room-id-container">
            {' '}
            <span className="room-id-text">
              {t('planningVotes.room.sidebar.roomId')}: {roomId}
            </span>
            <button
              onClick={copyRoomIdToClipboard}
              className="copy-room-id-button"
              title={t('common.copy')}
            >
              {t('common.copy')}
            </button>
          </div>
          <ul>
            <li>
              {t('planningVotes.room.sidebar.participants')} ({users.length})
            </li>{' '}
            <ul>
              {' '}
              {users.length > 0 ? (
                users.map((user) => {
                  // Verificamos si el usuario es el creador comparando con el creatorId
                  const isUserCreator = creatorId === user.userId;
                  // For now, we'll use a simple check - you might need to adjust this based on your User type
                  const hasVoted = false; // TODO: Implement proper voting check based on your data structure

                  return (
                    <li
                      key={user.userId}
                      className={`${isUserCreator ? 'creator' : ''} ${
                        hasVoted ? 'voted' : 'pending'
                      }`}
                    >
                      {user.username}
                      {isUserCreator && (
                        <span className="current-user-indicator">
                          {t('planningVotes.room.sidebar.admin')}
                        </span>
                      )}
                    </li>
                  );
                })
              ) : (
                <li className="empty-message">
                  {t('planningVotes.room.sidebar.noUsers')}
                </li>
              )}
            </ul>{' '}
            <li>
              {t('planningVotes.room.sidebar.tasks')} ({tasks.length})
            </li>
            <ul>
              {tasks.length > 0 ? (
                tasks.map((task) => {
                  // Usar title si existe, si no usar description
                  const displayText = task.title || task.description;
                  const isJiraTask = !!task.jiraKey;

                  return (
                    <li
                      key={task.id}
                      className={`task-item ${
                        task.id === currentTaskId ? 'active-task' : ''
                      } ${isJiraTask ? 'jira-task' : ''}`}
                    >
                      {isJiraTask && (
                        <span
                          className="jira-icon"
                          title={t('planningVotes.room.sidebar.jiraTask')}
                        >
                          🔗
                        </span>
                      )}
                      <span className="task-text">{displayText}</span>
                      {isJiraTask && task.jiraKey && (
                        <span className="jira-key-small">{task.jiraKey}</span>
                      )}
                    </li>
                  );
                })
              ) : (
                <li className="empty-message">
                  {t('planningVotes.room.sidebar.noTasks')}
                </li>
              )}
            </ul>
          </ul>
        </div>
        {/* Only show desktop collapse/expand button on desktop */}
        <div
          className="shorten-container desktop-only"
          onClick={handleToggleSidebar}
        >
          <span>
            {isOpened
              ? t('planningVotes.room.sidebar.close')
              : t('planningVotes.room.sidebar.open')}
          </span>
        </div>
      </div>
    </>
  );
}
