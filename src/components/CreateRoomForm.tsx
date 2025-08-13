import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaDownload } from 'react-icons/fa';
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
import { ImportedTask } from '../services/JiraImportService';
import './CreateRoom.scss';
import { JiraImportModal } from './JiraImport';
import TaskList from './TaskListComponent/TaskList';

function CreateRoomForm() {
  const dispatch = useAppDispatch(); // ✅ Tipado automático para dispatch
  const navigate = useNavigate();
  const { socket } = useSocket();
  const { t } = useTranslation();

  const [username, setUsername] = useState('');
  const [tasks, setTasks] = useState<Array<string | undefined>>([]);
  const [showImportModal, setShowImportModal] = useState(false);

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
        app: 'planning-votes',
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
    navigate(`/planning-votes/room/${roomId}`);
  }

  const onHandleChangeTaskList = (taskList: Array<string | undefined>) => {
    setTasks(taskList);
  };

  const handleTasksImported = (importedTasks: ImportedTask[]) => {
    // Convertir las tareas importadas al formato que espera el componente
    const taskDescriptions = importedTasks.map((task) => task.description);
    setTasks(taskDescriptions);
    setShowImportModal(false);
  };

  const isDisabled = tasks.length < 1 || username.trim() === '';
  return (
    <div className="create-room-container">
      {' '}
      <div className="create-room-form">
        <div className="form-header">
          <h1>{t('planningVotes.createRoom.title')}</h1>
          <p>{t('planningVotes.createRoom.description')}</p>
        </div>{' '}
        <div className="form-group">
          <label htmlFor="username">
            {t('planningVotes.createRoom.username')}
          </label>
          <input
            id="username"
            className="input-username"
            type="text"
            placeholder={t('planningVotes.createRoom.usernameLabel')}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="task-section">
          <div className="task-section-header">
            <h3>{t('planningVotes.createRoom.tasks.title')}</h3>
            <div className="task-actions">
              <button
                type="button"
                className="btn-import-jira"
                onClick={() => setShowImportModal(true)}
                title={t('planningVotes.createRoom.tasks.importFromJira')}
              >
                <FaDownload />
                {t('planningVotes.createRoom.tasks.importFromJira')}
              </button>
            </div>
          </div>
          <TaskList
            taskList={tasks}
            onTaskListChange={onHandleChangeTaskList}
          />
        </div>
        <div className="form-actions">
          <button
            className="button-primary"
            disabled={isDisabled}
            onClick={handleSubmit}
          >
            {t('planningVotes.createRoom.createButton')}
          </button>
        </div>
      </div>
      {/* Modal de importación de Jira */}
      <JiraImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onTasksImported={handleTasksImported}
      />
    </div>
  );
}

export default CreateRoomForm;
