import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FaChartLine,
  FaCheckCircle,
  FaExclamationCircle,
  FaExternalLinkAlt,
  FaFlag,
  FaPlus,
  FaProjectDiagram,
  FaSpinner,
  FaTasks,
  FaTimesCircle,
} from 'react-icons/fa';
import { SiJira } from 'react-icons/si';
import {
  jiraBackendService,
  JiraEpic,
  JiraExportStatus,
  JiraProject,
} from '../../services/JiraBackendService';
import Dropdown, { DropdownOption } from '../Dropdown/Dropdown';
import Modal from '../Modal/Modal';
import './JiraExportModal.scss';

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
  consensus: number;
}

interface JiraExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: TaskStats[];
}

type ExportStep =
  | 'auth'
  | 'select'
  | 'create-epic'
  | 'preview'
  | 'creating'
  | 'results';

interface AuthState {
  isAuthenticated: boolean;
  user?: {
    accountId: string;
    displayName: string;
    emailAddress: string;
  };
  instance?: {
    cloudId: string;
    url: string;
    name: string;
  };
}

interface ExportConfig {
  projectKey: string;
  epicKey: string;
  createNewEpic: boolean;
  newEpicSummary: string;
}

interface CreateResult {
  success: boolean;
  taskId: string;
  taskTitle?: string;
  taskDescription: string;
  jiraKey?: string;
  jiraUrl?: string;
  error?: string;
}

export const JiraExportModal: React.FC<JiraExportModalProps> = ({
  isOpen,
  onClose,
  tasks,
}) => {
  const { t } = useTranslation();

  // Estados principales
  const [step, setStep] = useState<ExportStep>('auth');
  const [authState, setAuthState] = useState<AuthState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  // Estados de datos
  const [projects, setProjects] = useState<JiraProject[]>([]);
  const [epics, setEpics] = useState<JiraEpic[]>([]);
  const [exportConfig, setExportConfig] = useState<ExportConfig>({
    projectKey: '',
    epicKey: '',
    createNewEpic: false,
    newEpicSummary: '',
  });

  // Estados de creación/exportación
  const [exportJobId, setExportJobId] = useState<string | null>(null);
  const [exportStatus, setExportStatus] = useState<JiraExportStatus | null>(
    null
  );
  const [createResults, setCreateResults] = useState<CreateResult[]>([]);

  // Validar sesión al abrir el modal (solo una vez)
  useEffect(() => {
    if (isOpen && !initialCheckDone) {
      setInitialCheckDone(true);
      checkAuthState();
    }
  }, [isOpen, initialCheckDone]);

  // No hay polling automático, solo verificación cuando se cierre el popup

  // Polling para el estado de exportación
  useEffect(() => {
    let interval: number;

    if (
      exportJobId &&
      (step === 'creating' || exportStatus?.status === 'processing')
    ) {
      interval = window.setInterval(async () => {
        try {
          const status = await jiraBackendService.getExportStatus(exportJobId);
          if (status) {
            setExportStatus(status);

            if (status.status === 'completed' || status.status === 'failed') {
              setStep('results');
              if (status.results) {
                setCreateResults(status.results);
              }
            }
          }
        } catch (error) {
          console.error('Error polling export status:', error);
        }
      }, 2000);
    }

    return () => {
      if (interval) {
        window.clearInterval(interval);
      }
    };
  }, [exportJobId, step, exportStatus?.status]);

  const checkAuthState = async () => {
    setLoading(true);
    setError(null);

    try {
      const validation = await jiraBackendService.validateSession();

      if (validation.valid && validation.user && validation.instance) {
        setAuthState({
          isAuthenticated: true,
          user: validation.user,
          instance: validation.instance,
        });
        setStep('select');
        await loadProjects();
      } else {
        setAuthState(null);
        setStep('auth');
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
      setError(t('common.error'));
      setStep('auth');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const authResponse = await jiraBackendService.startAuth();

      if (authResponse.success && authResponse.authUrl) {
        console.log('🔗 Abriendo URL de autenticación:', authResponse.authUrl);

        // Abrir ventana de OAuth con la URL de Jira
        const popup = window.open(
          authResponse.authUrl,
          'jira-oauth',
          'width=600,height=700,scrollbars=yes,resizable=yes'
        );

        if (!popup) {
          setError(t('jiraExport.auth.popupBlockedMessage'));
          setLoading(false);
          return;
        }

        // Escuchar mensajes del popup del backend
        const handleMessage = (event: MessageEvent) => {
          console.log('📨 Mensaje recibido:', event.data);
          console.log('📍 Origen del mensaje:', event.origin);

          // Verificar que viene del backend (localhost:3000) o del frontend
          const validOrigins = [
            'http://localhost:3000',
            'http://localhost:5173',
            'http://localhost:5174',
          ];
          if (!validOrigins.includes(event.origin)) {
            console.log('❌ Origen no válido:', event.origin);
            return;
          }

          if (event.data.type === 'JIRA_AUTH_SUCCESS') {
            console.log('✅ Autenticación exitosa via postMessage!');
            setError(null);
            setLoading(true);

            // Limpiar el intervalo de detección de cierre para evitar llamadas duplicadas
            clearInterval(checkClosed);

            // Cerrar el popup
            if (popup && !popup.closed) {
              popup.close();
            }

            // Remover el listener
            window.removeEventListener('message', handleMessage);

            // Verificar el estado de autenticación y transicionar
            setTimeout(async () => {
              try {
                console.log(
                  '🔄 Verificando autenticación después del postMessage...'
                );
                const validation = await jiraBackendService.validateSession();
                if (
                  validation.valid &&
                  validation.user &&
                  validation.instance
                ) {
                  console.log('✅ Validación exitosa, cambiando a step select');
                  setAuthState({
                    isAuthenticated: true,
                    user: validation.user,
                    instance: validation.instance,
                  });
                  setStep('select');
                  await loadProjects();
                  setLoading(false);
                } else {
                  console.log(
                    '⚠️ Validación falló después del mensaje de éxito'
                  );
                  setLoading(false);
                  checkAuthState();
                }
              } catch (error) {
                console.error('Error validating after success message:', error);
                setLoading(false);
                checkAuthState();
              }
            }, 500);
          } else if (event.data.type === 'JIRA_AUTH_ERROR') {
            console.error('❌ Error en autenticación:', event.data.error);
            setError(event.data.error || t('jiraExport.auth.authError'));
            setLoading(false);

            // Limpiar el intervalo de detección de cierre
            clearInterval(checkClosed);

            // Remover el listener
            window.removeEventListener('message', handleMessage);
          }
        };

        // Agregar listener para mensajes
        window.addEventListener('message', handleMessage);

        // Mostrar mensaje informativo
        setError(t('jiraExport.auth.completeAuthMessage'));

        // Detectar si la ventana se cierra y verificar auth
        const checkClosed = setInterval(() => {
          if (popup && popup.closed) {
            console.log('🔒 Popup cerrado, verificando autenticación...');
            clearInterval(checkClosed);
            window.removeEventListener('message', handleMessage);
            setLoading(false);

            // Verificar una última vez por si la auth se completó antes del cierre
            setTimeout(() => {
              console.log(
                '🔍 Verificando estado final después del cierre del popup...'
              );
              checkAuthState();
            }, 500);
          }
        }, 1000);
      } else {
        setError(authResponse.error || t('common.error'));
        setLoading(false);
      }
    } catch (error) {
      console.error('Error during login:', error);
      setError(t('common.error'));
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    setLoading(true);
    try {
      const projectList = await jiraBackendService.getProjects();
      setProjects(projectList);
    } catch (error) {
      console.error('Error loading projects:', error);
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleProjectSelect = async (projectKey: string) => {
    setExportConfig((prev) => ({ ...prev, projectKey, epicKey: '' }));
    setLoading(true);

    try {
      const epicList = await jiraBackendService.getEpics(projectKey);
      console.log('📋 Épicas recibidas:', epicList);
      setEpics(epicList);
    } catch (error) {
      console.error('Error loading epics:', error);
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEpic = async () => {
    if (!exportConfig.newEpicSummary.trim()) {
      setError(t('common.error'));
      return;
    }

    setLoading(true);
    try {
      const newEpic = await jiraBackendService.createEpic(
        exportConfig.projectKey,
        exportConfig.newEpicSummary
      );

      setExportConfig((prev) => ({
        ...prev,
        epicKey: newEpic.key,
        createNewEpic: false,
      }));
      setEpics((prev) => [newEpic, ...prev]);
      setError(null);
      setStep('preview');
    } catch (error) {
      console.error('Error creating epic:', error);
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setLoading(true);
    setStep('creating');

    try {
      const { existingTasks, newTasks } = separateTasks();

      const exportData = {
        projectKey: exportConfig.projectKey,
        epicKey: exportConfig.epicKey || undefined,
        createNewEpic: exportConfig.createNewEpic,
        newEpicSummary: exportConfig.newEpicSummary || undefined,
        // Separar las tareas por tipo de operación
        tasksToCreate: newTasks.map((task) => ({
          id: task.id,
          title: task.title,
          description: task.description,
          average: task.average,
          median: task.median,
          consensus: task.consensus,
          min: task.min,
          max: task.max,
          count: task.count,
          votes: task.votes,
        })),
        tasksToUpdate: existingTasks.map((task) => ({
          id: task.id,
          title: task.title,
          description: task.description,
          jiraKey: task.jiraKey,
          jiraUrl: task.jiraUrl,
          average: task.average,
          median: task.median,
          consensus: task.consensus,
          min: task.min,
          max: task.max,
          count: task.count,
          votes: task.votes,
        })),
        // Mantener backward compatibility
        tasks: tasks.map((task) => ({
          id: task.id,
          title: task.title,
          description: task.description,
          jiraKey: task.jiraKey,
          jiraUrl: task.jiraUrl,
          average: task.average,
          median: task.median,
          consensus: task.consensus,
          min: task.min,
          max: task.max,
          count: task.count,
          votes: task.votes,
        })),
      };

      const response = await jiraBackendService.exportTasks(exportData);

      if (response.success && response.jobId) {
        setExportJobId(response.jobId);
        // El polling se encargará de actualizar el estado
      } else {
        setError(response.error || t('common.error'));
        setStep('preview');
      }
    } catch (error) {
      console.error('Error exporting tasks:', error);
      setError(t('common.error'));
      setStep('preview');
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setStep('auth');
    setAuthState(null);
    setError(null);
    setInitialCheckDone(false);
    setProjects([]);
    setEpics([]);
    setExportConfig({
      projectKey: '',
      epicKey: '',
      createNewEpic: false,
      newEpicSummary: '',
    });
    setExportJobId(null);
    setExportStatus(null);
    setCreateResults([]);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const dismissError = () => {
    setError(null);
  };

  // Separar tareas en dos grupos: nuevas vs. existentes
  const separateTasks = () => {
    const existingTasks = tasks.filter((task) => task.jiraKey || task.jiraUrl);
    const newTasks = tasks.filter((task) => !task.jiraKey && !task.jiraUrl);
    return { existingTasks, newTasks };
  };

  // Renderizar el modal basado en el step actual
  const renderContent = () => {
    switch (step) {
      case 'auth':
        return renderAuthStep();
      case 'select':
        return renderSelectStep();
      case 'create-epic':
        return renderCreateEpicStep();
      case 'preview':
        return renderPreviewStep();
      case 'creating':
        return renderCreatingStep();
      case 'results':
        return renderResultsStep();
      default:
        return null;
    }
  };

  const renderAuthStep = () => (
    <div className="jira-export-step">
      <div className="step-header">
        <div className="step-icon">
          <SiJira />
        </div>
        <h3>{t('jiraExport.auth.title')}</h3>
        <p>{t('jiraExport.auth.description')}</p>
      </div>

      <div className="step-content">
        {authState?.isAuthenticated ? (
          <div className="auth-info">
            <div className="info-item">
              <FaCheckCircle className="success-icon" />
              <span>{t('jiraExport.auth.benefits.integration')}</span>
            </div>
            <div className="info-item">
              <FaCheckCircle className="success-icon" />
              <span>{t('jiraExport.auth.benefits.automation')}</span>
            </div>
            <div className="info-item">
              <FaCheckCircle className="success-icon" />
              <span>{t('jiraExport.auth.benefits.traceability')}</span>
            </div>
          </div>
        ) : (
          <div className="auth-help">
            <h4>{t('jiraExport.auth.whyConnectTitle')}</h4>
            <ul>
              <li>{t('jiraExport.auth.automaticallyExportTasks')}</li>
              <li>{t('jiraExport.auth.maintainEstimationTraceability')}</li>
              <li>{t('jiraExport.auth.integrateWithExistingWorkflow')}</li>
            </ul>
          </div>
        )}

        <div className="step-actions">
          <button className="btn-secondary" onClick={handleClose}>
            {t('common.cancel')}
          </button>
          {authState?.isAuthenticated ? (
            <button
              className="btn-primary"
              onClick={() => setStep('select')}
              disabled={loading}
            >
              <FaProjectDiagram />
              {t('jiraExport.actions.continue')}
            </button>
          ) : (
            <>
              <button
                className="btn-primary"
                onClick={handleLogin}
                disabled={loading}
              >
                {loading ? <FaSpinner className="fa-spin" /> : <SiJira />}
                {t('jiraExport.auth.login')}
              </button>
              {error && !loading && (
                <button
                  className="btn-secondary"
                  onClick={checkAuthState}
                  disabled={loading}
                >
                  <FaCheckCircle />
                  {t('jiraExport.auth.verifyManually')}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );

  const renderSelectStep = () => {
    const { existingTasks, newTasks } = separateTasks();
    const onlyUpdating = newTasks.length === 0 && existingTasks.length > 0;

    return (
      <div className="jira-export-step">
        <div className="step-header">
          <div className="step-icon">
            <FaProjectDiagram />
          </div>
          <h3>{t('jiraExport.select.title')}</h3>
          <p>
            {onlyUpdating
              ? 'Solo actualizaremos tareas existentes, no necesitas seleccionar una épica.'
              : t('jiraExport.select.description')}
          </p>
        </div>

        <div className="step-content">
          <div className="form-group">
            <label>{t('jiraExport.select.project')}</label>
            <Dropdown
              options={projects.map(
                (project): DropdownOption => ({
                  value: project.key,
                  label: project.name,
                  description: `${t('common.key')}: ${project.key}`,
                })
              )}
              value={exportConfig.projectKey}
              onChange={handleProjectSelect}
              placeholder={t('jiraExport.select.selectProject')}
              disabled={loading}
              searchable
              size="medium"
            />
          </div>

          {/* Solo mostrar selección de épica si hay tareas nuevas para crear */}
          {exportConfig.projectKey && !onlyUpdating && (
            <div className="epic-selection">
              <div className="form-group">
                <label>{t('jiraExport.select.epic')}</label>
                <div className="radio-group">
                  <div className="radio-option">
                    <input
                      type="radio"
                      id="create-new-epic"
                      checked={exportConfig.createNewEpic}
                      onChange={() =>
                        setExportConfig((prev) => ({
                          ...prev,
                          createNewEpic: true,
                          epicKey: '',
                        }))
                      }
                    />
                    <span>{t('jiraExport.select.createNewEpic')}</span>
                  </div>
                  {epics.length > 0 && (
                    <div className="radio-option">
                      <input
                        type="radio"
                        id="use-existing-epic"
                        checked={!exportConfig.createNewEpic}
                        onChange={() =>
                          setExportConfig((prev) => ({
                            ...prev,
                            createNewEpic: false,
                          }))
                        }
                      />
                      <span>{t('jiraExport.select.existingEpic')}</span>
                    </div>
                  )}
                </div>
              </div>

              {exportConfig.createNewEpic ? (
                <div className="form-group">
                  <label>{t('jiraExport.createEpic.summary')}</label>
                  <input
                    type="text"
                    value={exportConfig.newEpicSummary}
                    onChange={(e) =>
                      setExportConfig((prev) => ({
                        ...prev,
                        newEpicSummary: e.target.value,
                      }))
                    }
                    placeholder={t('jiraExport.createEpic.summaryPlaceholder')}
                  />
                </div>
              ) : (
                <div className="form-group">
                  <label>{t('jiraExport.select.epic')}</label>
                  <Dropdown
                    options={epics.map(
                      (epic): DropdownOption => ({
                        value: epic.key,
                        label:
                          epic.summary ||
                          `${t('jiraExport.select.epic')} ${epic.key}`,
                        description: `${t('common.key')}: ${epic.key}`,
                      })
                    )}
                    value={exportConfig.epicKey}
                    onChange={(value) =>
                      setExportConfig((prev) => ({
                        ...prev,
                        epicKey: value,
                      }))
                    }
                    placeholder={t('jiraExport.select.selectEpic')}
                    disabled={loading}
                    searchable
                    clearable
                    size="medium"
                  />
                </div>
              )}
            </div>
          )}

          {/* Información sobre las tareas a procesar */}
          {exportConfig.projectKey && (
            <div className="task-summary-info">
              {existingTasks.length > 0 && (
                <div className="info-item">
                  <FaExternalLinkAlt />
                  <span>{existingTasks.length} tareas serán actualizadas</span>
                </div>
              )}
              {newTasks.length > 0 && (
                <div className="info-item">
                  <FaPlus />
                  <span>{newTasks.length} tareas nuevas serán creadas</span>
                </div>
              )}
            </div>
          )}

          <div className="step-actions">
            <button className="btn-secondary" onClick={() => setStep('auth')}>
              {t('jiraExport.actions.back')}
            </button>
            <button
              className="btn-primary"
              onClick={() => setStep('preview')}
              disabled={
                !exportConfig.projectKey ||
                (!onlyUpdating &&
                  ((!exportConfig.createNewEpic && !exportConfig.epicKey) ||
                    (exportConfig.createNewEpic &&
                      !exportConfig.newEpicSummary.trim())))
              }
            >
              <FaFlag />
              {t('jiraExport.actions.continue')}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderCreateEpicStep = () => (
    <div className="jira-export-step">
      <div className="step-header">
        <div className="step-icon">
          <FaPlus />
        </div>
        <h3>{t('jiraExport.createEpic.title')}</h3>
        <p>{t('jiraExport.createEpic.description')}</p>
      </div>

      <div className="step-content">
        <div className="form-group">
          <label>{t('jiraExport.createEpic.summary')}</label>
          <input
            type="text"
            value={exportConfig.newEpicSummary}
            onChange={(e) =>
              setExportConfig((prev) => ({
                ...prev,
                newEpicSummary: e.target.value,
              }))
            }
            placeholder={t('jiraExport.createEpic.summaryPlaceholder')}
            autoFocus
          />
        </div>

        <div className="step-actions">
          <button className="btn-secondary" onClick={() => setStep('select')}>
            {t('jiraExport.actions.back')}
          </button>
          <button
            className="btn-primary"
            onClick={handleCreateEpic}
            disabled={loading || !exportConfig.newEpicSummary.trim()}
          >
            {loading ? <FaSpinner className="fa-spin" /> : <FaPlus />}
            {t('jiraExport.createEpic.create')}
          </button>
        </div>
      </div>
    </div>
  );

  const renderPreviewStep = () => {
    const { existingTasks, newTasks } = separateTasks();

    return (
      <div className="jira-export-step">
        <div className="step-header">
          <div className="step-icon">
            <FaChartLine />
          </div>
          <h3>{t('jiraExport.preview.title')}</h3>
          <p>{t('jiraExport.preview.description')}</p>
        </div>

        <div className="step-content">
          <div className="export-summary">
            <div className="summary-item">
              <strong>{t('jiraExport.preview.project')}:</strong>{' '}
              {projects.find((p) => p.key === exportConfig.projectKey)?.name} (
              {exportConfig.projectKey})
            </div>
            {exportConfig.createNewEpic ? (
              <div className="summary-item">
                <strong>{t('jiraExport.preview.epic')}:</strong>{' '}
                {exportConfig.newEpicSummary}
                <span className="new-epic-badge">
                  <FaPlus />
                  {t('jiraExport.preview.newEpic')}
                </span>
              </div>
            ) : (
              <div className="summary-item">
                <strong>{t('jiraExport.preview.epic')}:</strong>{' '}
                {epics.find((e) => e.key === exportConfig.epicKey)?.summary} (
                {exportConfig.epicKey})
              </div>
            )}
            <div className="summary-item">
              <strong>{t('jiraExport.preview.totalTasks')}:</strong>{' '}
              {tasks.length}
              {existingTasks.length > 0 && (
                <span className="task-breakdown">
                  ({newTasks.length} nuevas, {existingTasks.length} a
                  actualizar)
                </span>
              )}
            </div>
          </div>

          {/* Tareas nuevas para crear */}
          {newTasks.length > 0 && (
            <div className="tasks-preview">
              <h4>
                <FaPlus className="section-icon" />
                Tareas nuevas para crear ({newTasks.length})
              </h4>
              <div className="tasks-list">
                {newTasks.map((task, index) => (
                  <div key={task.id} className="task-preview-item new-task">
                    <div className="task-number">{index + 1}</div>
                    <div className="task-content">
                      <div className="task-title">
                        {task.title || task.description}
                      </div>
                      <div className="task-stats">
                        <div className="stat">
                          <FaChartLine />
                          {task.average.toFixed(1)}{' '}
                          {t('jiraExport.preview.points')} (
                          {t('common.average')})
                        </div>
                        <div className="stat">
                          <FaTasks />
                          {task.count} {t('jiraExport.preview.votes')}
                        </div>
                        <div className="stat">
                          <FaCheckCircle />
                          {task.consensus}% {t('jiraExport.preview.consensus')}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tareas existentes para actualizar */}
          {existingTasks.length > 0 && (
            <div className="tasks-preview">
              <h4>
                <FaExternalLinkAlt className="section-icon" />
                Tareas existentes para actualizar ({existingTasks.length})
              </h4>
              <div className="tasks-list">
                {existingTasks.map((task, index) => (
                  <div
                    key={task.id}
                    className="task-preview-item existing-task"
                  >
                    <div className="task-number">{index + 1}</div>
                    <div className="task-content">
                      <div className="task-title">
                        <span className="jira-key-badge">{task.jiraKey}</span>
                        {task.title || task.description}
                      </div>
                      <div className="task-stats">
                        <div className="stat">
                          <FaChartLine />
                          {task.average.toFixed(1)}{' '}
                          {t('jiraExport.preview.points')} (
                          {t('common.average')})
                        </div>
                        <div className="stat">
                          <FaTasks />
                          {task.count} {t('jiraExport.preview.votes')}
                        </div>
                        <div className="stat">
                          <FaCheckCircle />
                          {task.consensus}% {t('jiraExport.preview.consensus')}
                        </div>
                        {task.jiraUrl && (
                          <div className="stat">
                            <a
                              href={task.jiraUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="jira-link-preview"
                            >
                              <FaExternalLinkAlt />
                              Ver en Jira
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="step-actions">
            <button className="btn-secondary" onClick={() => setStep('select')}>
              {t('jiraExport.actions.back')}
            </button>
            <button
              className="btn-primary"
              onClick={handleExport}
              disabled={loading}
            >
              {loading ? <FaSpinner className="fa-spin" /> : <SiJira />}
              {existingTasks.length > 0 && newTasks.length > 0
                ? 'Crear y actualizar tareas'
                : existingTasks.length > 0
                  ? 'Actualizar tareas'
                  : 'Crear tareas'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderCreatingStep = () => (
    <div className="jira-export-step">
      <div className="step-header">
        <div className="step-icon fa-spin">
          <FaSpinner />
        </div>
        <h3>{t('jiraExport.creating.title')}</h3>
        <p>{t('jiraExport.creating.description')}</p>
      </div>

      <div className="step-content">
        <div className="creating-progress">
          <div className="progress-info">
            <div className="progress-icon">
              <FaSpinner className="fa-spin" />
            </div>
            <span>
              {exportStatus
                ? `${t('jiraExport.creating.progress')} ${exportStatus.progress.completed}/${exportStatus.progress.total}`
                : t('jiraExport.creating.progress')}
            </span>
          </div>

          {exportStatus && (
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${(exportStatus.progress.completed / exportStatus.progress.total) * 100}%`,
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderResultsStep = () => {
    const successCount = createResults.filter((r) => r.success).length;
    const failureCount = createResults.filter((r) => !r.success).length;

    return (
      <div className="jira-export-step">
        <div className="step-header">
          <div className={`step-icon ${failureCount === 0 ? 'success' : ''}`}>
            {failureCount === 0 ? <FaCheckCircle /> : <FaExclamationCircle />}
          </div>
          <h3>{t('jiraExport.results.title')}</h3>
          <p>
            {failureCount === 0
              ? t('jiraExport.results.description')
              : `${successCount} ${t('jiraExport.results.successful')}, ${failureCount} ${t('jiraExport.results.failed')}`}
          </p>
        </div>

        <div className="step-content">
          <div className="results-summary">
            <div className="summary-stats">
              <div className="stat success">
                <FaCheckCircle />
                {successCount} {t('jiraExport.results.successful')}
              </div>
              {failureCount > 0 && (
                <div className="stat error">
                  <FaTimesCircle />
                  {failureCount} {t('jiraExport.results.failed')}
                </div>
              )}
            </div>
          </div>

          <div className="results-list">
            {createResults.map((result) => (
              <div key={result.taskId} className="result-item">
                <div className="result-status">
                  {result.success ? (
                    <FaCheckCircle className="fa-check-circle" />
                  ) : (
                    <FaTimesCircle className="fa-times-circle" />
                  )}
                </div>
                <div className="result-content">
                  <div className="result-title">
                    {result.taskTitle || result.taskDescription}
                  </div>
                  {result.success ? (
                    <div className="result-details">
                      <span className="jira-key">{result.jiraKey}</span>
                      {result.jiraUrl && (
                        <a
                          href={result.jiraUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="jira-link"
                        >
                          <FaExternalLinkAlt />
                          {t('jiraExport.results.openInJira')}
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className="result-error">{result.error}</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="step-actions">
            <button className="btn-primary" onClick={handleClose}>
              <FaCheckCircle />
              {t('jiraExport.actions.close')}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t('jiraExport.title')}>
      <div className="jira-export-modal">
        {error && (
          <div className="error-message">
            <FaExclamationCircle />
            <div className="error-content">
              <span>{error}</span>
              <button
                className="error-dismiss"
                onClick={dismissError}
                title={t('common.closeErrorMessage')}
                aria-label={t('common.closeErrorMessage')}
              >
                <FaTimesCircle />
              </button>
            </div>
          </div>
        )}

        {renderContent()}
      </div>
    </Modal>
  );
};
