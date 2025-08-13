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
  const [importedJiraTasks, setImportedJiraTasks] = useState<ImportedTask[]>(
    []
  );
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

    // Convertir tareas manuales al formato correcto
    const manualTasks = tasks
      .filter((task) => task && task.trim() !== '')
      .map((task) => ({
        id: uuidv4(),
        title: undefined,
        description: task || '',
        jiraKey: undefined,
        jiraUrl: undefined,
        type: undefined,
        priority: undefined,
        originalStoryPoints: undefined,
        voting: {
          status: VotingStatus.NOT_STARTED,
          votes: {},
        },
      }));

    // Convertir tareas importadas de Jira al formato correcto
    const jiraTasks = importedJiraTasks.map((task) => ({
      id: uuidv4(),
      title: `${task.jiraKey} - ${task.description}`,
      description: task.details || task.description,
      jiraKey: task.jiraKey,
      jiraUrl: task.jiraUrl,
      type: task.type,
      priority: task.priority,
      originalStoryPoints: task.originalStoryPoints,
      voting: {
        status: VotingStatus.NOT_STARTED,
        votes: {},
      },
    }));

    // Combinar todas las tareas
    const allTasks = [...manualTasks, ...jiraTasks];

    console.log(`🏠 Creando sala: ${roomId} con usuario: ${userId}`);
    console.log(
      `📝 Tareas totales: ${allTasks.length} (${manualTasks.length} manuales + ${jiraTasks.length} de Jira)`
    );

    // Primero actualizar el estado de Redux
    dispatch(
      createRoom({
        roomId: roomId,
        creatorId: userId,
        tasks: allTasks,
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
    crearSala(roomId, userId, username, allTasks);

    // Navegar a la sala después de emitir los eventos
    navigate(`/planning-votes/room/${roomId}`);
  }

  const onHandleChangeTaskList = (taskList: Array<string | undefined>) => {
    setTasks(taskList);
  };

  const handleTasksImported = (importedTasks: ImportedTask[]) => {
    console.log('📥 Tareas importadas desde Jira:', importedTasks);

    // Guardar las tareas importadas con toda su información
    setImportedJiraTasks((prev) => [...prev, ...importedTasks]);

    // NO añadir las tareas al TaskList visual - solo las mantenemos separadas
    // El TaskList solo mostrará tareas manuales
    console.log(
      '📝 Tareas de Jira guardadas (no se añaden al TaskList):',
      importedTasks
    );
    setShowImportModal(false);
  };

  const isDisabled =
    (tasks.length < 1 && importedJiraTasks.length < 1) ||
    username.trim() === '';
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

          {/* Tareas manuales */}
          <TaskList
            taskList={tasks}
            onTaskListChange={onHandleChangeTaskList}
          />

          {/* Tareas importadas de Jira */}
          {importedJiraTasks.length > 0 && (
            <div className="imported-tasks-section">
              <h4 className="imported-tasks-title">
                📋 {t('planningVotes.createRoom.tasks.importedFromJira')} (
                {importedJiraTasks.length})
              </h4>
              <div className="imported-tasks-list">
                {importedJiraTasks.map((task, index) => (
                  <div key={task.id || index} className="imported-task-item">
                    <div className="imported-task-header">
                      <span className="jira-key-badge">{task.jiraKey}</span>
                      <span className="task-title">{task.description}</span>
                      <button
                        type="button"
                        className="btn-remove-imported"
                        onClick={() => {
                          setImportedJiraTasks((prev) =>
                            prev.filter((_, i) => i !== index)
                          );
                        }}
                        title={t(
                          'planningVotes.createRoom.tasks.removeImported'
                        )}
                      >
                        ✕
                      </button>
                    </div>
                    <div className="task-meta">
                      {task.type && (
                        <span className="meta-badge meta-type">
                          {task.type}
                        </span>
                      )}
                      {task.priority && (
                        <span className="meta-badge meta-priority">
                          {task.priority}
                        </span>
                      )}
                      {task.originalStoryPoints && (
                        <span className="meta-badge meta-points">
                          {task.originalStoryPoints} SP
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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
