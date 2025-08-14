import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FaArrowLeft,
  FaArrowsAltH,
  FaCalculator,
  FaChartArea,
  FaChartLine,
  FaChartPie,
  FaExclamationTriangle,
  FaHandshake,
  FaHome,
  FaList,
  FaRedo,
  FaSpinner,
  FaTasks,
  FaTh,
  FaUsers,
  FaVoteYea,
} from 'react-icons/fa';
import { SiJira } from 'react-icons/si';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router';
import { JiraExportModal } from '../JiraExport/JiraExportModal';
import './ResumeVotes.scss';

// Tipos para las vistas
type ViewMode = 'grid' | 'list';

interface TaskStats {
  id: string;
  title?: string; // Título de la tarea
  description: string;
  jiraKey?: string; // Si existe, la tarea ya fue exportada
  jiraUrl?: string; // URL de Jira si existe
  votes: Record<string, number>;
  average: number;
  median: number;
  min: number;
  max: number;
  count: number;
  consensus: number; // Porcentaje de consenso
}

// Tipos para datos de MongoDB
interface VotingSession {
  _id?: string;
  roomId: string;
  sessionId: string;
  createdAt: Date;
  completedAt: Date;
  expiresAt: Date;
  room: {
    roomId: string;
    creatorId: string;
    app: string;
    users: Array<{
      username: string;
      userId: string;
      active: boolean;
    }>;
    tasks: Array<{
      id: string;
      description: string;
      voting: {
        status: string;
        votes: Record<string, number>;
      };
    }>;
  };
  metadata: {
    totalTasks: number;
    totalUsers: number;
    totalVotes: number;
    duration: number; // en minutos
  };
}

export default function ResumeVotes() {
  const { t } = useTranslation();
  const params = useParams();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [votingSession, setVotingSession] = useState<VotingSession | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isJiraExportModalOpen, setIsJiraExportModalOpen] = useState(false);

  // Hook para detectar si estamos en móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Forzar grid en móvil
  useEffect(() => {
    if (isMobile) {
      setViewMode('grid');
    }
  }, [isMobile]);

  // Extraer roomId de los parámetros de la URL
  const roomId = params.roomId;

  // Obtener datos del estado Redux (fallback)
  const room = useSelector((state: any) => state.room);
  const users = useSelector((state: any) => state.room.users);

  // Función para cargar datos por roomId (buscar la sesión más reciente)
  const loadLatestSessionByRoom = async (roomIdParam: string) => {
    setLoading(true);
    setError(null);

    try {
      console.log('Intentando cargar sesión para roomId:', roomIdParam);

      // Usar URL relativa que será proxificada por Vite al backend
      const apiUrl = `/api/voting-sessions/latest/${roomIdParam}`;
      console.log('URL de la API:', apiUrl);

      const response = await fetch(apiUrl);

      console.log(
        'Respuesta del servidor:',
        response.status,
        response.statusText
      );

      if (!response.ok) {
        // Si es 404, significa que no existe el endpoint o no hay sesiones
        if (response.status === 404) {
          console.log(
            'No se encontraron sesiones para esta sala, usando datos de Redux'
          );
          return; // No establecer error, solo usar Redux como fallback
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      console.log('Content-Type de la respuesta:', contentType);

      if (!contentType || !contentType.includes('application/json')) {
        // Intentar leer como texto para ver qué devuelve
        const textResponse = await response.text();
        console.log('Respuesta como texto:', textResponse.substring(0, 200));
        throw new Error('El servidor no devolvió JSON válido');
      }

      const responseData = await response.json();
      console.log('Respuesta completa del servidor:', responseData);

      // Verificar si la respuesta tiene la estructura esperada
      if (!responseData.success || !responseData.data) {
        throw new Error('Formato de respuesta inválido del servidor');
      }

      const data: VotingSession = responseData.data;
      console.log('Datos cargados desde MongoDB:', data);
      setVotingSession(data);
    } catch (err) {
      console.error('Error loading latest session:', err);

      // Si hay datos en Redux, no mostrar error
      if (room && room.tasks && room.tasks.length > 0) {
        console.log('Usando datos de Redux como fallback');
        return;
      }

      setError(err instanceof Error ? err.message : 'Failed to load session');
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    if (roomId) {
      loadLatestSessionByRoom(roomId);
    }
  }, [roomId]);

  // Determinar qué datos usar (MongoDB o Redux)
  const currentRoom = votingSession?.room || room;
  const currentUsers = votingSession?.room.users || users;

  // Verificar si hay datos válidos para mostrar
  const hasValidData = useMemo(() => {
    // Si estamos cargando, considerar que no hay datos aún
    if (loading) return false;

    // Si hay error y no hay datos de fallback, no hay datos válidos
    if (error && !room) return false;

    return (
      currentRoom &&
      currentRoom.tasks &&
      currentRoom.tasks.length > 0 &&
      currentUsers &&
      currentUsers.length > 0 &&
      currentRoom.tasks.some(
        (task: any) =>
          task.voting &&
          task.voting.votes &&
          Object.keys(task.voting.votes).length > 0
      )
    );
  }, [currentRoom, currentUsers, loading, error, room]);

  // Calcular estadísticas de todas las tareas
  const taskStats: TaskStats[] = useMemo(() => {
    if (!currentRoom || !currentRoom.tasks) return [];

    return currentRoom.tasks.map((task: any) => {
      const votes = Object.values(task.voting.votes || {}) as number[];
      const sortedVotes = [...votes].sort((a, b) => a - b);

      const count = votes.length;
      const sum = votes.reduce((a, b) => a + b, 0);
      const average = count > 0 ? sum / count : 0;
      const min = count > 0 ? Math.min(...votes) : 0;
      const max = count > 0 ? Math.max(...votes) : 0;
      const median =
        count > 0
          ? count % 2 === 0
            ? (sortedVotes[count / 2 - 1] + sortedVotes[count / 2]) / 2
            : sortedVotes[Math.floor(count / 2)]
          : 0;

      // Calcular consenso (qué tan cerca están los votos)
      const variance =
        count > 0
          ? votes.reduce((acc, vote) => acc + Math.pow(vote - average, 2), 0) /
            count
          : 0;
      const stdDev = Math.sqrt(variance);
      const consensus =
        count > 0 ? Math.max(0, 100 - (stdDev / average) * 100) : 0;

      return {
        id: task.id,
        title: task.title,
        description: task.description,
        jiraKey: task.jiraKey,
        jiraUrl: task.jiraUrl,
        votes: task.voting.votes || {},
        average,
        median,
        min,
        max,
        count,
        consensus: isNaN(consensus) ? 0 : Math.round(consensus),
      };
    });
  }, [currentRoom]);

  // Estadísticas generales
  const generalStats = useMemo(() => {
    const allVotes = taskStats.flatMap((task) => Object.values(task.votes));
    const totalTasks = taskStats.length;
    const completedTasks = taskStats.filter((task) => task.count > 0).length;
    const avgConsensus =
      totalTasks > 0
        ? taskStats.reduce((acc, task) => acc + task.consensus, 0) / totalTasks
        : 0;
    const avgEffort =
      allVotes.length > 0
        ? allVotes.reduce((a, b) => a + b, 0) / allVotes.length
        : 0;

    const totalUsers = currentUsers?.length || 0;

    return {
      totalTasks,
      completedTasks,
      avgConsensus: Math.round(avgConsensus),
      avgEffort: Math.round(avgEffort * 10) / 10,
      totalVotes: allVotes.length,
      participationRate:
        totalUsers > 0 && totalTasks > 0
          ? Math.round((allVotes.length / (totalUsers * totalTasks)) * 100)
          : 0,
    };
  }, [taskStats, currentUsers]);

  const getUsernameById = (userId: string) => {
    const user = currentUsers?.find((u: any) => u.userId === userId);
    return user?.username || t('resumeVotes.taskStats.unknownUser');
  };

  const getConsensusColor = (consensus: number) => {
    if (consensus >= 80) return 'high';
    if (consensus >= 60) return 'medium';
    return 'low';
  };
  const renderViewModeSelector = () => {
    // No mostrar toggles en móvil
    if (isMobile) {
      return null;
    }

    return (
      <div className="view-selector">
        <button
          className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
          onClick={() => setViewMode('grid')}
          title={t('resumeVotes.viewModes.grid')}
        >
          <FaTh />
          <span>{t('resumeVotes.viewModes.grid')}</span>
        </button>
        <button
          className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
          onClick={() => setViewMode('list')}
          title={t('resumeVotes.viewModes.list')}
        >
          <FaList />
          <span>{t('resumeVotes.viewModes.list')}</span>
        </button>
      </div>
    );
  };

  const renderJiraExportButton = () => (
    <div className="jira-export-section">
      <button
        className="jira-export-btn"
        onClick={() => setIsJiraExportModalOpen(true)}
        title={t('resumeVotes.actions.exportToJira')}
      >
        <SiJira />
        <span>{t('resumeVotes.actions.exportToJira')}</span>
      </button>
    </div>
  );

  const renderGeneralStats = () => (
    <div className="general-stats">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <FaTasks />
          </div>
          <div className="stat-content">
            <div className="stat-value">
              {generalStats.completedTasks}/{generalStats.totalTasks}
            </div>
            <div className="stat-label">
              {t('resumeVotes.generalStats.tasksCompleted')}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FaUsers />
          </div>
          <div className="stat-content">
            <div className="stat-value">{generalStats.participationRate}%</div>
            <div className="stat-label">
              {t('resumeVotes.generalStats.participation')}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FaHandshake />
          </div>
          <div className="stat-content">
            <div className="stat-value">{generalStats.avgConsensus}%</div>
            <div className="stat-label">
              {t('resumeVotes.generalStats.avgConsensus')}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FaCalculator />
          </div>
          <div className="stat-content">
            <div className="stat-value">{generalStats.avgEffort}</div>
            <div className="stat-label">
              {t('resumeVotes.generalStats.avgEffort')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTaskCard = (task: TaskStats, index: number) => (
    <div key={task.id} className={`task-card ${viewMode}`}>
      <div className="task-header">
        <div className="task-number">#{index + 1}</div>
        {task.jiraKey && (
          <div className="jira-indicator">
            <span className="jira-key">JIRA: {task.jiraKey}</span>
          </div>
        )}
        <div className={`consensus-badge ${getConsensusColor(task.consensus)}`}>
          {task.consensus}% {t('resumeVotes.taskStats.consensus')}
        </div>
      </div>

      <div className="task-description">{task.title || task.description}</div>

      <div className="task-stats">
        <div className="stat-row">
          <span className="stat-icon">
            <FaChartLine />
          </span>
          <span className="stat-text">
            {t('resumeVotes.taskStats.average')}:{' '}
            <strong>{Math.round(task.average * 10) / 10}</strong>
          </span>
        </div>
        <div className="stat-row">
          <span className="stat-icon">
            <FaChartArea />
          </span>
          <span className="stat-text">
            {t('resumeVotes.taskStats.median')}: <strong>{task.median}</strong>
          </span>
        </div>
        <div className="stat-row">
          <span className="stat-icon">
            <FaArrowsAltH />
          </span>
          <span className="stat-text">
            {t('resumeVotes.taskStats.range')}:{' '}
            <strong>
              {task.min} - {task.max}
            </strong>
          </span>
        </div>
        <div className="stat-row">
          <span className="stat-icon">
            <FaVoteYea />
          </span>
          <span className="stat-text">
            {t('resumeVotes.taskStats.votes')}: <strong>{task.count}</strong>
          </span>
        </div>
      </div>

      {/* Mostrar votos por usuario en grid y list (no solo en list) */}
      <div className="task-votes">
        <h4>{t('resumeVotes.taskStats.votesByUser')}</h4>
        <div className="votes-list">
          {Object.entries(task.votes).map(([userId, vote]) => {
            const username = getUsernameById(userId);
            return (
              <div
                key={userId}
                className="vote-item"
                title={`${username}: ${vote} ${t('resumeVotes.taskStats.points')}`}
              >
                <span className="username">{username}</span>
                <span className="vote-value">{vote}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    return (
      <div className={`tasks-container ${viewMode}`}>
        {taskStats.map((task, index) => renderTaskCard(task, index))}
      </div>
    );
  };

  const renderEmptyState = () => {
    // Estado de carga
    if (loading) {
      return (
        <div className="empty-state">
          <div className="empty-state-content">
            <div className="empty-state-icon">
              <FaSpinner className="fa-spin" />
            </div>
            <h3 className="empty-state-title">
              {t('resumeVotes.loading.title')}
            </h3>
            <p className="empty-state-description">
              {t('resumeVotes.loading.description')}
            </p>
          </div>
        </div>
      );
    }

    // Estado de error
    if (error) {
      return (
        <div className="empty-state">
          <div className="empty-state-content">
            <div className="empty-state-icon error">
              <FaExclamationTriangle />
            </div>
            <h3 className="empty-state-title">
              {t('resumeVotes.error.title')}
            </h3>
            <p className="empty-state-description">
              {t('resumeVotes.error.description')}
            </p>
            <div className="empty-state-error-details">
              <p className="error-message">{error}</p>
            </div>
            <div className="empty-state-actions">
              <button
                className="action-btn primary"
                onClick={() => {
                  if (roomId) {
                    loadLatestSessionByRoom(roomId);
                  }
                }}
              >
                <FaRedo />
                {t('resumeVotes.error.retry')}
              </button>
              <button
                className="action-btn secondary"
                onClick={() => window.history.back()}
              >
                <FaArrowLeft />
                {t('resumeVotes.emptyState.actions.goBack')}
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Estado vacío normal
    return (
      <div className="empty-state">
        <div className="empty-state-content">
          <div className="empty-state-icon">
            <FaChartPie />
          </div>
          <h3 className="empty-state-title">
            {t('resumeVotes.emptyState.title')}
          </h3>
          <p className="empty-state-description">
            {t('resumeVotes.emptyState.description')}
          </p>
          <div className="empty-state-suggestions">
            <div className="suggestion-item">
              <FaUsers />
              <span>
                {t('resumeVotes.emptyState.suggestions.participants')}
              </span>
            </div>
            <div className="suggestion-item">
              <FaTasks />
              <span>{t('resumeVotes.emptyState.suggestions.tasks')}</span>
            </div>
            <div className="suggestion-item">
              <FaVoteYea />
              <span>{t('resumeVotes.emptyState.suggestions.votes')}</span>
            </div>
          </div>
          <div className="empty-state-actions">
            <button
              className="action-btn primary"
              onClick={() => window.history.back()}
            >
              <FaArrowLeft />
              {t('resumeVotes.emptyState.actions.goBack')}
            </button>
            <button
              className="action-btn secondary"
              onClick={() => (window.location.href = '/')}
            >
              <FaHome />
              {t('resumeVotes.emptyState.actions.goHome')}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="resume-votes">
      {!hasValidData ? (
        renderEmptyState()
      ) : (
        <>
          <div className="resume-header">
            <div className="header-content">
              <h2>
                <FaChartPie />
                {t('resumeVotes.title')}
              </h2>
              <p className="header-subtitle">
                {t('resumeVotes.subtitle', {
                  totalTasks: generalStats.totalTasks,
                  totalVotes: generalStats.totalVotes,
                })}
              </p>
            </div>
            {renderViewModeSelector()}
          </div>

          {/* Estadísticas generales siempre visibles */}
          {renderGeneralStats()}

          {/* Vista de tareas (grid o list) */}
          {renderContent()}

          {/* Botón de exportar a Jira */}
          {renderJiraExportButton()}

          {/* Modal de exportación a Jira */}
          <JiraExportModal
            isOpen={isJiraExportModalOpen}
            onClose={() => setIsJiraExportModalOpen(false)}
            tasks={taskStats}
          />
        </>
      )}
    </div>
  );
}
