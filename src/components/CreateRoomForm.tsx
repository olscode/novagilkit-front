import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { v4 as uuidv4 } from 'uuid';
import { useSocket } from '../hooks/useSocket';
import { useAppDispatch } from '../redux/hooks';
import {
  createProfile,
  createRoom,
  Task,
  VotingStatus,
} from '../redux/reducers';
import './CreateRoom.scss';
import TaskList from './TaskListComponent/TaskList';

function CreateRoomForm() {
  const dispatch = useAppDispatch(); // ✅ Tipado automático para dispatch
  const navigate = useNavigate();
  const { socket } = useSocket();
  const { t } = useTranslation();

  const [username, setUsername] = useState('');
  const [tasks, setTasks] = useState<Array<string | undefined>>([]);

  function createRoomId() {
    return uuidv4();
  }

  const crearSala = (
    roomId: string,
    userId: string | undefined,
    username: string | undefined,
    tasks: Array<Task> = []
  ) => {
    socket?.emit('createRoom', roomId, userId, username, tasks);
  };

  function handleSubmit() {
    const userId = uuidv4();
    const roomId = createRoomId();

    // Convertir las tareas al formato correcto para el reducer
    const formattedTasks = tasks
      .filter((task) => task && task.trim() !== '')
      .map((task) => ({
        id: uuidv4(),
        description: task || '',
        voting: {
          status: VotingStatus.NOT_STARTED, // Estado inicial de la votación
          votes: {}, // Inicialmente no hay votos
        },
      }));

    console.log(`🏠 Creando sala: ${roomId} con usuario: ${userId}`);

    // Primero actualizar el estado de Redux
    dispatch(
      createRoom({
        roomId: roomId,
        creatorId: userId,
        tasks: formattedTasks,
        users: [{ username, userId, active: true }],
        app: 'poker-planning',
        currentTaskId: null,
      })
    );

    dispatch(createProfile({ username, userId, active: true }));

    // Verificar que el socket esté disponible y conectado
    if (!socket || !socket.connected) {
      console.error('⚠️ Socket no conectado. No se puede crear la sala.');
      return;
    }

    // Primero crear la sala y luego unirse a ella
    console.log(`📤 Emitiendo createRoom: ${roomId}, ${userId}, ${username}`);
    crearSala(roomId, userId, username, formattedTasks);

    // Navegar a la sala después de emitir los eventos
    navigate(`/poker-planning/room/${roomId}`);
  }

  const onHandleChangeTaskList = (taskList: Array<string | undefined>) => {
    setTasks(taskList);
  };
  const isDisabled = tasks.length < 1 || username.trim() === '';
  return (
    <div className="create-room-container">
      {' '}
      <div className="create-room-form">
        <div className="form-header">
          <h1>{t('pokerPlanning.createRoom.title')}</h1>
          <p>{t('pokerPlanning.createRoom.description')}</p>
        </div>{' '}
        <div className="form-group">
          <label htmlFor="username">
            {t('pokerPlanning.createRoom.username')}
          </label>
          <input
            id="username"
            className="input-username"
            type="text"
            placeholder={t('pokerPlanning.createRoom.usernameLabel')}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <TaskList taskList={tasks} onTaskListChange={onHandleChangeTaskList} />
        <div className="form-actions">
          <button
            className="button-primary"
            disabled={isDisabled}
            onClick={handleSubmit}
          >
            {t('pokerPlanning.createRoom.createButton')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateRoomForm;
