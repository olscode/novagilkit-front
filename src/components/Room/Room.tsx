import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import { v4 as uuidv4 } from 'uuid';
import { useJoinRoomOnce } from '../../hooks/useJoinRoomOnce';
import { useSocket } from '../../hooks/useSocket';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
  addUserToRoom,
  createProfile,
  registerUserVote,
  selectAllTasksCompleted,
  selectCurrentTaskDescription,
  selectCurrentTaskVotesMap,
  selectCurrentTaskVoteStats,
  selectCurrentUserVote,
  selectHasCurrentUserVoted,
  selectIsLastTask,
  selectIsUserCreator,
  selectVotingProgress,
  setCurrentTaskId,
  Task,
  updateListUsers,
  updateRoomCreator,
  updateTasks,
  updateVotingStatus,
  User,
  VotingStatus,
} from '../../redux/reducers';
import FibonacciButtons from '../FibonacciButtons';
import Modal from '../Modal/Modal';
import Spinner from '../Spinner/Spinner';
import { useToast } from '../Toast/ToastContext';
import { Tooltip } from '../Tooltip/Tooltip';
import UserCard from '../UserCard/UserCard';
import './Room.scss';
import Sidebar from './Sidebar';

export default function Room() {
  const [username, setUsername] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [shouldShowSpinner, setShouldShowSpinner] = useState(false);
  const [roomError, setRoomError] = useState('');
  const navigate = useNavigate();

  const { roomId } = useParams<{ roomId: string }>();
  const dispatch = useAppDispatch(); // ✅ Tipado automático
  const { addToast } = useToast();
  const { t } = useTranslation();
  //const room = useSelector((state: RootState) => state.room);
  const room = useAppSelector((state) => state.room);
  const profile = useAppSelector((state) => state.profile); // ✅ Sin RootState manual
  const currentTaskDescription = useAppSelector(selectCurrentTaskDescription()); // ✅ Tipado automático
  const isCreator = useAppSelector(selectIsUserCreator()); // ✅ Tipado automático
  const voteStats = useAppSelector(selectCurrentTaskVoteStats()); // ✅ Tipado automático
  const votingProgress = useAppSelector(selectVotingProgress()); // ✅ Tipado automático
  const hasCurrentUserVoted = useAppSelector(selectHasCurrentUserVoted()); // ✅ Tipado automático

  const currentVote = useAppSelector(selectCurrentUserVote()); // ✅ Tipado automático

  const votesMap = useAppSelector(selectCurrentTaskVotesMap()); // ✅ Tipado automático

  const isLastTask = useAppSelector(selectIsLastTask());

  // Verificar si todas las tareas están completadas
  const allTasksCompleted = useAppSelector(selectAllTasksCompleted());

  const { socket } = useSocket();

  // 1. Comprobar existencia de sala SOLO si no hay perfil
  useEffect(() => {
    if (!profile.username && roomId && socket) {
      setShouldShowSpinner(true);
      setRoomError('');
      socket.emit('room_exists', roomId);
      const handleRoomExistsResponse = (data: { exists: boolean }) => {
        if (data.exists) {
          setShouldShowSpinner(false);
          setModalIsOpen(true);
        } else {
          setModalIsOpen(true);
          setRoomError(`La sala ${roomId} no existe.`);
          setTimeout(() => {
            // Redirigir a la página principal si la sala no existe
            setModalIsOpen(false);
            setShouldShowSpinner(false);
            navigate(`/room-not-found/${roomId}`, { replace: true });
          }, 3500); // Timeout para mostrar el error
        }
      };
      socket.on('room_exists_response', handleRoomExistsResponse);
      return () => {
        socket.off('room_exists_response', handleRoomExistsResponse);
      };
    }
  }, [profile.username, roomId, socket]);

  // 2. Solo join si ya hay username (hook)
  useJoinRoomOnce({
    socket,
    roomId,
    profile,
    setModalIsOpen,
  });

  useEffect(() => {
    // Configurar listeners para eventos de socket directamente
    if (!socket || !roomId) {
      console.log('⚠️ Socket no disponible o roomId no definido');
      return;
    }

    console.log(`🔌 Configurando socket listeners para sala ${roomId}`);

    // Evento: Cuando un usuario se une a la sala
    const handleUserJoined = (data: User) => {
      console.log('🔄 Socket event: user_joined recibido', data);

      if (!data || !data.username) {
        console.log('⚠️ Datos de usuario inválidos recibidos en user_joined');
        return;
      }

      if (data.userId !== profile.userId) {
        console.log(`📢 Mostrando notificación para ${data.username}`);
        addToast({
          message: t('pokerPlanning.room.notifications.userJoined', {
            username: data.username,
          }),
          type: 'info',
          duration: 5000,
          icon: '👋',
        });
      } else {
        console.log(
          `👤 Usuario actual (${data.username}) se unió - sin notificación`
        );
      }
    }; // Evento: Actualización de la lista de usuarios
    const handleUpdateUserList = (data: Record<User['userId'], User>) => {
      console.log('🔄 Socket event: updateUserList recibido', data);

      if (!data) {
        console.log('⚠️ No se recibieron datos en updateUserList');
        return;
      }

      try {
        // Convertir objeto de usuarios a array
        const listUsers = Object.values(data).map((u: User) => ({
          ...u,
        }));

        console.log(
          `👥 Lista de usuarios actualizada: ${listUsers.length} usuarios`
        );
        // Actualizar en Redux en lugar del estado local
        dispatch(updateListUsers(listUsers));
      } catch (error) {
        console.error('❌ Error procesando la lista de usuarios:', error);
      }
    }; // Evento: Información completa de la sala
    const handleRoomInfo = (info: any) => {
      console.log('🔄 Socket event: room_info recibido', info);

      // Este evento llega después de unirse exitosamente a una sala

      if (info?.tasks && Array.isArray(info.tasks)) {
        console.log(`📑 Recibidas ${info.tasks.length} tareas en room_info`);

        // Solo actualizar tareas si no somos el creador
        if (!isCreator) {
          dispatch(updateTasks(info.tasks));
        }

        // Seleccionar primera tarea si hay tareas y no hay tarea seleccionada
        if (info.tasks.length > 0 && !room.currentTaskId) {
          const firstTaskId = info.tasks[0].id;
          dispatch(setCurrentTaskId(firstTaskId));
        }
      }

      // Solo registrar creador de la sala si no somos nosotros
      if (info.creatorId && !isCreator) {
        console.log(`👑 Creador de la sala: ${info.creatorId}`);
        dispatch(updateRoomCreator(info.creatorId));
      }
    }; // Evento: Voto registrado
    const handleVoteRegistered = (data: {
      taskId: string;
      userId: string;
      vote: number;
    }) => {
      console.log('🔄 Socket event: vote_registered recibido', data);

      // Actualizar el voto en Redux
      dispatch(
        registerUserVote({
          userId: data.userId,
          taskId: data.taskId,
          vote: data.vote,
        })
      );

      // Mostrar notificación si no es el voto del usuario actual
      if (data.userId !== profile.userId) {
        addToast({
          message: t('pokerPlanning.room.notifications.userVoted', {
            username:
              room.users.find((user) => user.userId === data.userId)
                ?.username || 'Usuario',
          }),
          type: 'info',
          duration: 3000,
          icon: '🗳️',
        });
      }
    }; // Evento: Todos los usuarios han votado
    const handleAllVotesIn = (data: {
      taskId: string;
      votes: { userId: string; vote: number }[];
      votingProgress: {
        totalUsers: number;
        votedUsers: number;
        pendingUsers: number;
        percentage: number;
        status: string;
      };
    }) => {
      console.log('🔄 Socket event: all_votes_in recibido', data);

      // Actualizar el estado de la votación a "finished" en Redux
      if (data.taskId && data.votingProgress.status === VotingStatus.FINISHED) {
        dispatch(
          updateVotingStatus({
            taskId: data.taskId,
            status: VotingStatus.FINISHED,
          })
        );

        addToast({
          message: t('pokerPlanning.room.notifications.allVotesIn'),
          type: 'success',
          duration: 4000,
          icon: '✅',
        });

        console.log(
          '✅ Todos los votos recibidos, estado actualizado a VotingStatus.FINISHED'
        );
      }
    };

    const handleVotingStarted = (data: {
      taskId: string;
      status: VotingStatus;
    }) => {
      console.log('🎮 Socket event: voting_started recibido', data);

      // Solo para la tarea actual
      if (room.currentTaskId === data.taskId) {
        // 1️⃣ Actualizar el estado de la votación en Redux
        dispatch(
          updateVotingStatus({
            taskId: data.taskId,
            status: VotingStatus.IN_PROGRESS,
          })
        );

        console.log('🚀 Votación iniciada, estado actualizado en Redux');

        // 2️⃣ Mostrar notificación al usuario
        addToast({
          message: t('pokerPlanning.room.notifications.votingStarted'),
          type: 'info',
          duration: 4000,
          icon: '🎮',
        });
      }
    }; // Evento: Usuario desconectado
    const handleUserLeft = (data: { userId: string; username: string }) => {
      console.log('🔄 Socket event: user_left recibido', data);

      addToast({
        message: t('pokerPlanning.room.notifications.userLeft', {
          username: data.username,
        }),
        type: 'warning',
        duration: 5000,
        icon: '👋',
      });
    };

    // Evento: Actualización completa de tareas
    const handleTasksUpdate = (tasks: Task[]) => {
      console.log('🔄 Socket event: tasks_update recibido', tasks);

      if (Array.isArray(tasks)) {
        // Actualizar todas las tareas en Redux
        dispatch(updateTasks(tasks));

        console.log(`📑 ${tasks.length} tareas actualizadas en Redux`);
      }
    }; // Evento: Cambio de tarea
    const handleTaskChanged = (data: {
      taskId: string;
      previousTaskId: string;
    }) => {
      console.log('🔄 Socket event: task_changed recibido', data);

      // Solo actualizamos si es una tarea diferente a la actual
      if (data.taskId !== room.currentTaskId) {
        // Actualizar la tarea actual en Redux
        dispatch(setCurrentTaskId(data.taskId));

        // Establecer el estado inicial de votación para la nueva tarea
        const nextTask = room.tasks.find((t) => t.id === data.taskId);

        // Si la tarea no tiene un estado de votación definido, establecerlo como "not_started"
        if (nextTask && (!nextTask.voting || !nextTask.voting.status)) {
          dispatch(
            updateVotingStatus({
              taskId: data.taskId,
              status: VotingStatus.NOT_STARTED, // Estado inicial para la nueva tarea
            })
          );
          console.log(
            `🆕 Estableciendo estado inicial de votación para nueva tarea ${data.taskId}`
          );
        }

        // Notificar el cambio de tarea
        addToast({
          message: t('pokerPlanning.room.notifications.taskChangedByCreator'),
          type: 'info',
          duration: 4000,
          icon: '📋',
        });

        // Reiniciar el estado de notificación para la nueva tarea
        if (notifiedTasksRef.current) {
          notifiedTasksRef.current[data.taskId] = false;
        }
      }
    }; // Registrar todos los listeners

    const handleVotingFinished = () => {
      console.log('🔄 Socket event: voting_finished recibido');

      // Mostrar notificación de finalización de votación
      addToast({
        message: t('pokerPlanning.room.notifications.votingFinished'),
        type: 'success',
        duration: 4000,
        icon: '🏁',
      });

      setTimeout(() => {
        navigate(`/poker-planning/room/${roomId}/resumeVotes`, {
          replace: true,
        });
      }, 5000); // Esperar 5 segundos antes de limpiar el estado de votación
    };

    socket.on('user_joined', handleUserJoined);
    socket.on('updateUserList', handleUpdateUserList);
    socket.on('room_info', handleRoomInfo);
    socket.on('vote_registered', handleVoteRegistered);
    socket.on('all_votes_in', handleAllVotesIn);
    socket.on('voting_started', handleVotingStarted);
    socket.on('tasks_update', handleTasksUpdate); // Listener para actualizaciones completas de tareas
    socket.on('task_changed', handleTaskChanged); // Listener para cambio de tarea
    socket.on('user_left', handleUserLeft);
    socket.on('voting_session_completed', handleVotingFinished);

    console.log('🔌 Todos los listeners configurados correctamente'); // Cleanup: eliminar todos los listeners al desmontar el componente
    return () => {
      console.log('🧹 Limpiando socket event listeners');
      socket.off('user_joined', handleUserJoined);
      socket.off('updateUserList', handleUpdateUserList);
      socket.off('room_info', handleRoomInfo);
      socket.off('vote_registered', handleVoteRegistered);
      socket.off('all_votes_in', handleAllVotesIn);
      socket.off('voting_started', handleVotingStarted);
      socket.off('tasks_update', handleTasksUpdate);
      socket.off('task_changed', handleTaskChanged); // Limpiar el listener de cambio de tarea
      socket.off('user_left', handleUserLeft);
      socket.off('voting_session_completed', handleVotingFinished);
      console.log('✅ Todos los listeners limpiados correctamente');
    };
  }, [
    socket,
    roomId,
    dispatch,
    profile.userId,
    addToast,
    t,
    room.currentTaskId,
  ]);

  // Referencia para llevar registro de las notificaciones por tarea
  const notifiedTasksRef = useRef<{ [key: string]: boolean }>({}); // Referencia para las notificaciones

  const closeModal = () => {
    if (username.trim() && roomId) {
      const userId = uuidv4();
      const user: User = { username, userId, active: true };

      dispatch(createProfile(user)); // Esto activará useJoinRoomOnce
      dispatch(addUserToRoom({ roomId, user }));
      setModalIsOpen(false);
    }
  };
  const handleStartNewVoteClick = () => {
    if (room.currentTaskId && roomId) {
      console.log(
        `🎮 Iniciando nueva votación para tarea ${room.currentTaskId} en sala ${roomId}`,
        { status: votingProgress.status, isCreator }
      );
      // Emitir explícitamente evento de inicio de votación si no existe ya en el servidor
      // Esto es clave para asegurarnos de que la votación se inicia
      socket?.emit('start_voting', {
        roomId,
        taskId: room.currentTaskId,
        creatorId: profile.userId,
      });
    }
  };

  const handleVote = (newVote: number) => {
    if (room.currentTaskId && profile.userId && roomId) {
      console.log(
        `🗳️ Usuario ${profile.userId} votando ${newVote} para tarea ${room.currentTaskId}`
      );

      // Enviar voto al servidor
      socket?.emit('registerVote', {
        roomId,
        taskId: room.currentTaskId,
        userId: profile.userId,
        vote: newVote,
      });
    }
  }; // Función para avanzar a la siguiente tarea
  const handleNextTask = () => {
    if (!room.tasks.length || !room.currentTaskId || !roomId) return;

    // Encontrar el índice de la tarea actual
    const currentIndex = room.tasks.findIndex(
      (task) => task.id === room.currentTaskId
    );

    // Si hay más tareas después de la actual, avanzar a la siguiente
    if (currentIndex < room.tasks.length - 1) {
      const nextTaskId = room.tasks[currentIndex + 1].id;

      // Actualizar la tarea actual en Redux
      dispatch(setCurrentTaskId(nextTaskId));

      // Emitir evento al servidor para notificar el cambio de tarea
      socket?.emit('change_task', {
        roomId,
        taskId: nextTaskId,
        previousTaskId: room.currentTaskId,
        creatorId: profile.userId,
      });

      // Notificar el cambio de tarea localmente
      addToast({
        message: t('pokerPlanning.room.notifications.taskChanged'),
        type: 'info',
        duration: 4000,
        icon: '📋',
      });

      // Reiniciar el estado de notificación para la nueva tarea
      if (notifiedTasksRef.current) {
        notifiedTasksRef.current[nextTaskId] = false;
      }
    } else {
      // Si es la última tarea, mostrar mensaje
      addToast({
        message: t('pokerPlanning.room.notifications.lastTask'),
        type: 'warning',
        duration: 4000,
        icon: '🏁',
      });
    }
  }; // Debug para rastrear el flujo de estados de la votación
  console.log('🔍 Room component renderizado', {
    votingProgress,
    isCreator,
    votingStatus: votingProgress.status,
    showStartButton: isCreator && votingProgress.status === 'not_started',
    currentTaskId: room.currentTaskId,
    hasCurrentUserVoted,
    currentVote,
    votesCount: Object.keys(votesMap).length,
    totalUsers: room.users.length,
  });

  return (
    <div id="room_component">
      {shouldShowSpinner && <Spinner />}
      <Modal
        isOpen={modalIsOpen}
        title={t('pokerPlanning.room.welcomeModal.title')}
        showCloseButton={false}
      >
        <div className="modal-description">
          {t('pokerPlanning.room.welcomeModal.description')}
        </div>
        {roomError && (
          <div
            className="modal-error-message"
            style={{ color: 'red', marginBottom: 8 }}
          >
            {roomError}
          </div>
        )}
        <div className="modal-input-container">
          <span className="modal-input-icon">👤</span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={t('pokerPlanning.room.welcomeModal.usernameLabel')}
            maxLength={20}
            disabled={!!roomError}
          />
        </div>
        <button
          onClick={closeModal}
          disabled={!username || !!roomError}
          className="modal-action-button"
        >
          {username
            ? t('pokerPlanning.room.welcomeModal.joinButton')
            : t('pokerPlanning.room.welcomeModal.continueButton')}
        </button>
      </Modal>
      <div className="room-header">
        <h1>
          {t('pokerPlanning.room.title')} {roomId}
        </h1>
      </div>{' '}
      <div className="room-content">
        {' '}
        {room.currentTaskId && (
          <div className="current-task-banner">
            {t('pokerPlanning.room.currentTask')}: {currentTaskDescription}{' '}
            {votingProgress.totalUsers > 0 && (
              <div className="voting-progress">
                <div className="progress-bar">
                  <div
                    className={`progress-fill ${
                      votingProgress.status === VotingStatus.FINISHED
                        ? 'complete'
                        : ''
                    }`}
                    style={{ width: `${votingProgress.percentage}%` }}
                  ></div>
                </div>
                <div className="progress-text">
                  {votingProgress.status === VotingStatus.FINISHED ? (
                    // 1️⃣ Caso finished
                    <span className="complete-badge">
                      {t('pokerPlanning.room.votingComplete')}
                    </span>
                  ) : votingProgress.status === VotingStatus.IN_PROGRESS ? (
                    // 2️⃣ Caso in_progress
                    <span className="vote-count">
                      {votingProgress.votedUsers}/{votingProgress.totalUsers}{' '}
                      {t('pokerPlanning.room.usersVoted')}
                    </span>
                  ) : (
                    // 3️⃣ Caso not_started
                    <span className="waiting-text">
                      {t('pokerPlanning.room.waitingForVoting')}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        {votingProgress.status === VotingStatus.FINISHED && (
          <div className="vote-statistics animate-stats">
            <h3>{t('pokerPlanning.room.statistics')}</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <Tooltip
                  content={t('pokerPlanning.room.tooltips.average')}
                  position="top"
                >
                  <div className="stat-label">
                    {t('pokerPlanning.room.average')}
                  </div>
                </Tooltip>
                <div className="stat-value">{voteStats.average.toFixed(1)}</div>
              </div>
              <div className="stat-item">
                <Tooltip
                  content={t('pokerPlanning.room.tooltips.median')}
                  position="top"
                >
                  <div className="stat-label">
                    {t('pokerPlanning.room.median')}
                  </div>
                </Tooltip>
                <div className="stat-value">{voteStats.median}</div>
              </div>
              <div className="stat-item">
                <Tooltip
                  content={t('pokerPlanning.room.tooltips.min')}
                  position="top"
                >
                  <div className="stat-label">
                    {t('pokerPlanning.room.min')}
                  </div>
                </Tooltip>
                <div className="stat-value">{voteStats.min}</div>
              </div>
              <div className="stat-item">
                <Tooltip
                  content={t('pokerPlanning.room.tooltips.max')}
                  position="top"
                >
                  <div className="stat-label">
                    {t('pokerPlanning.room.max')}
                  </div>
                </Tooltip>
                <div className="stat-value">{voteStats.max}</div>
              </div>
            </div>
          </div>
        )}
        <div className="users-grid">
          {room.users.map((user) => {
            const hasVoted = votesMap[user.userId] != null;
            const voteValue = hasVoted ? String(votesMap[user.userId]) : '';
            const isCurrentUser = user.userId === profile.userId;
            return (
              <div
                className={`user-card-container ${hasVoted ? 'has-voted' : ''}`}
                key={user.userId}
              >
                <UserCard
                  username={user.username}
                  voteNumber={voteValue}
                  isCurrentUser={isCurrentUser}
                />
              </div>
            );
          })}
          {room.users.length === 0 && (
            <div className="no-users-message">
              {t('pokerPlanning.room.noUsers')}
            </div>
          )}
        </div>{' '}
        <div className="room-actions">
          {isCreator && votingProgress.status === 'not_started' && (
            <button
              className="new-vote-button"
              onClick={handleStartNewVoteClick}
              disabled={!room.currentTaskId}
            >
              {t('pokerPlanning.room.startVoting')}
            </button>
          )}
          {isCreator &&
            votingProgress.status === VotingStatus.FINISHED &&
            !isLastTask && (
              <button
                className="next-task-button"
                onClick={handleNextTask}
                disabled={
                  !room.currentTaskId ||
                  room.tasks.findIndex(
                    (task) => task.id === room.currentTaskId
                  ) ===
                    room.tasks.length - 1
                }
              >
                {t('pokerPlanning.room.nextTask')}
              </button>
            )}
          {isCreator && isLastTask && allTasksCompleted && (
            <button
              className="finish-voting-button"
              onClick={() => {
                socket?.emit('finish_voting', roomId);
              }}
            >
              {t('pokerPlanning.room.finishVoting')}
            </button>
          )}
          <FibonacciButtons
            key={room.currentTaskId}
            handleVote={handleVote}
            disabled={
              votingProgress.status !== VotingStatus.IN_PROGRESS ||
              hasCurrentUserVoted
            }
            currentVote={currentVote}
          />{' '}
          {votingProgress.status === VotingStatus.IN_PROGRESS ? (
            hasCurrentUserVoted ? (
              <div className="vote-message">
                {t('pokerPlanning.room.alreadyVoted')}
              </div>
            ) : (
              <div className="vote-message">
                {t('pokerPlanning.room.pleaseVote')}
              </div>
            )
          ) : votingProgress.status === VotingStatus.NOT_STARTED &&
            !(isLastTask && allTasksCompleted) ? (
            <div className="vote-message waiting">
              {t('pokerPlanning.room.waitingForVoting')}
            </div>
          ) : null}
        </div>
      </div>
      <Sidebar />
    </div>
  );
}
// This shouldn't be defined here but imported from redux/reducers
// Remove this function and import it properly
