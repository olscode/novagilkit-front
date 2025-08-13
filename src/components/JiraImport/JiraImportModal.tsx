import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FaCheckCircle,
  FaDownload,
  FaExclamationCircle,
  FaProjectDiagram,
  FaSearch,
  FaSpinner,
  FaTasks,
  FaTimesCircle,
} from 'react-icons/fa';
import { SiJira } from 'react-icons/si';
import {
  jiraBackendService,
  JiraEpic,
  JiraProject,
} from '../../services/JiraBackendService';
import {
  ImportedTask,
  JiraImportConfig,
  JiraImportJob,
  jiraImportService,
} from '../../services/JiraImportService';
import Dropdown, { DropdownOption } from '../Dropdown/Dropdown';
import Modal from '../Modal/Modal';
import './JiraImportModal.scss';

interface JiraImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTasksImported: (tasks: ImportedTask[]) => void;
}

type ImportStep = 'auth' | 'config' | 'importing' | 'results';

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

export const JiraImportModal: React.FC<JiraImportModalProps> = ({
  isOpen,
  onClose,
  onTasksImported,
}) => {
  const { t } = useTranslation();

  // Estados principales
  const [step, setStep] = useState<ImportStep>('auth');
  const [authState, setAuthState] = useState<AuthState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  // Estados de datos
  const [projects, setProjects] = useState<JiraProject[]>([]);
  const [epics, setEpics] = useState<JiraEpic[]>([]);
  const [importConfig, setImportConfig] = useState<JiraImportConfig>({
    projectKey: '',
    epicKey: '',
    jql: '',
    issueTypes: ['Story', 'Task'],
  });

  // Estados de importación
  const [importJobId, setImportJobId] = useState<string | null>(null);
  const [importJob, setImportJob] = useState<JiraImportJob | null>(null);
  const [importedTasks, setImportedTasks] = useState<ImportedTask[]>([]);
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(
    new Set()
  );

  // Validar sesión al abrir el modal
  useEffect(() => {
    if (isOpen && !initialCheckDone) {
      setInitialCheckDone(true);
      checkAuthState();
    }
  }, [isOpen, initialCheckDone]);

  // Polling para el estado de importación
  useEffect(() => {
    let interval: number;

    if (
      importJobId &&
      (step === 'importing' || importJob?.status === 'processing')
    ) {
      interval = window.setInterval(async () => {
        try {
          const response = await jiraImportService.getImportStatus(importJobId);
          if (response.success && response.data) {
            setImportJob(response.data);

            if (response.data.status === 'completed') {
              setStep('results');
              setImportedTasks(response.data.tasks);
              // Seleccionar todas las tareas por defecto
              setSelectedTaskIds(
                new Set(response.data.tasks.map((task) => task.id))
              );
            } else if (response.data.status === 'failed') {
              setError(response.data.error || 'Error en la importación');
              setStep('results');
            }
          }
        } catch (error) {
          console.error('Error polling import status:', error);
        }
      }, 2000);
    }

    return () => {
      if (interval) {
        window.clearInterval(interval);
      }
    };
  }, [importJobId, step, importJob?.status]);

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
        setStep('config');
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
        const popup = window.open(
          authResponse.authUrl,
          'jira-oauth',
          'width=600,height=700,scrollbars=yes,resizable=yes'
        );

        if (!popup) {
          setError(t('jiraImport.auth.popupBlockedMessage'));
          setLoading(false);
          return;
        }

        const handleMessage = (event: MessageEvent) => {
          const validOrigins = [
            'http://localhost:3000',
            'http://localhost:5173',
            'http://localhost:5174',
          ];
          if (!validOrigins.includes(event.origin)) {
            return;
          }

          if (event.data.type === 'JIRA_AUTH_SUCCESS') {
            setError(null);
            setLoading(true);
            clearInterval(checkClosed);

            if (popup && !popup.closed) {
              popup.close();
            }

            window.removeEventListener('message', handleMessage);

            setTimeout(async () => {
              try {
                const validation = await jiraBackendService.validateSession();
                if (
                  validation.valid &&
                  validation.user &&
                  validation.instance
                ) {
                  setAuthState({
                    isAuthenticated: true,
                    user: validation.user,
                    instance: validation.instance,
                  });
                  setStep('config');
                  await loadProjects();
                  setLoading(false);
                } else {
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
            setError(event.data.error || t('jiraImport.auth.authError'));
            setLoading(false);
            clearInterval(checkClosed);
            window.removeEventListener('message', handleMessage);
          }
        };

        window.addEventListener('message', handleMessage);
        setError(t('jiraImport.auth.completeAuthMessage'));

        const checkClosed = setInterval(() => {
          if (popup && popup.closed) {
            clearInterval(checkClosed);
            window.removeEventListener('message', handleMessage);
            setLoading(false);

            setTimeout(() => {
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
    setImportConfig((prev) => ({ ...prev, projectKey, epicKey: '' }));
    setLoading(true);

    try {
      const epicList = await jiraBackendService.getEpics(projectKey);
      setEpics(epicList);
    } catch (error) {
      console.error('Error loading epics:', error);
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    setLoading(true);
    setStep('importing');

    try {
      const response = await jiraImportService.startImport(importConfig);

      if (response.success && response.data?.jobId) {
        setImportJobId(response.data.jobId);
        // El polling se encargará de actualizar el estado
      } else {
        setError(response.error || t('common.error'));
        setStep('config');
      }
    } catch (error) {
      console.error('Error starting import:', error);
      setError(t('common.error'));
      setStep('config');
    } finally {
      setLoading(false);
    }
  };

  const handleUseImportedTasks = () => {
    const selectedTasks = importedTasks.filter((task) =>
      selectedTaskIds.has(task.id)
    );
    console.log('✅ Enviando tareas seleccionadas:', selectedTasks);
    onTasksImported(selectedTasks);
    handleClose();
  };

  const handleTaskSelection = (taskId: string, selected: boolean) => {
    setSelectedTaskIds((prev) => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(taskId);
      } else {
        newSet.delete(taskId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    setSelectedTaskIds(new Set(importedTasks.map((task) => task.id)));
  };

  const handleDeselectAll = () => {
    setSelectedTaskIds(new Set());
  };

  const resetModal = () => {
    setStep('auth');
    setAuthState(null);
    setError(null);
    setInitialCheckDone(false);
    setProjects([]);
    setEpics([]);
    setImportConfig({
      projectKey: '',
      epicKey: '',
      jql: '',
      issueTypes: ['Story', 'Task'],
    });
    setImportJobId(null);
    setImportJob(null);
    setImportedTasks([]);
    setSelectedTaskIds(new Set());
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const dismissError = () => {
    setError(null);
  };

  const renderContent = () => {
    switch (step) {
      case 'auth':
        return renderAuthStep();
      case 'config':
        return renderConfigStep();
      case 'importing':
        return renderImportingStep();
      case 'results':
        return renderResultsStep();
      default:
        return null;
    }
  };

  const renderAuthStep = () => (
    <div className="jira-import-step">
      <div className="step-header">
        <div className="step-icon">
          <SiJira />
        </div>
        <h3>{t('jiraImport.auth.title')}</h3>
        <p>{t('jiraImport.auth.description')}</p>
      </div>

      <div className="step-content">
        <div className="auth-help">
          <h4>{t('jiraImport.auth.benefits.title')}</h4>
          <ul>
            <li>{t('jiraImport.auth.benefits.importTasks')}</li>
            <li>{t('jiraImport.auth.benefits.maintainTraceability')}</li>
            <li>{t('jiraImport.auth.benefits.saveTime')}</li>
          </ul>
        </div>

        <div className="step-actions">
          <button className="btn-secondary" onClick={handleClose}>
            {t('common.cancel')}
          </button>
          {authState?.isAuthenticated ? (
            <button
              className="btn-primary"
              onClick={() => setStep('config')}
              disabled={loading}
            >
              <FaProjectDiagram />
              {t('jiraImport.actions.continue')}
            </button>
          ) : (
            <button
              className="btn-primary"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? <FaSpinner className="fa-spin" /> : <SiJira />}
              {t('jiraImport.auth.login')}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const renderConfigStep = () => (
    <div className="jira-import-step">
      <div className="step-header">
        <div className="step-icon">
          <FaSearch />
        </div>
        <h3>{t('jiraImport.config.title')}</h3>
        <p>{t('jiraImport.config.description')}</p>
      </div>

      <div className="step-content">
        <div className="form-group">
          <label>{t('jiraImport.config.project')}</label>
          <Dropdown
            options={projects.map(
              (project): DropdownOption => ({
                value: project.key,
                label: project.name,
                description: `${t('common.key')}: ${project.key}`,
              })
            )}
            value={importConfig.projectKey || ''}
            onChange={handleProjectSelect}
            placeholder={t('jiraImport.config.selectProject')}
            disabled={loading}
            searchable
            size="medium"
          />
        </div>

        {importConfig.projectKey && (
          <>
            <div className="form-group">
              <label>
                {t('jiraImport.config.epic')} ({t('common.optional')})
              </label>
              <Dropdown
                options={epics.map(
                  (epic): DropdownOption => ({
                    value: epic.key,
                    label: epic.summary || `Epic ${epic.key}`,
                    description: `${t('common.key')}: ${epic.key}`,
                  })
                )}
                value={importConfig.epicKey || ''}
                onChange={(value: string) =>
                  setImportConfig((prev) => ({ ...prev, epicKey: value }))
                }
                placeholder={t('jiraImport.config.selectEpic')}
                disabled={loading}
                searchable
                clearable
                size="medium"
              />
            </div>

            <div className="form-group">
              <label>
                {t('jiraImport.config.jql')} ({t('common.optional')})
              </label>
              <input
                type="text"
                value={importConfig.jql || ''}
                onChange={(e) =>
                  setImportConfig((prev) => ({ ...prev, jql: e.target.value }))
                }
                placeholder={t('jiraImport.config.jqlPlaceholder')}
              />
              <small className="form-help">
                {t('jiraImport.config.jqlHelp')}
              </small>
            </div>

            <div className="form-group">
              <label>{t('jiraImport.config.issueTypes')}</label>
              <div className="checkbox-group">
                {['Story', 'Task', 'Epic'].map((type) => (
                  <div key={type} className="checkbox-option">
                    <input
                      type="checkbox"
                      id={`type-${type}`}
                      checked={importConfig.issueTypes?.includes(type) || false}
                      onChange={(e) => {
                        const types = importConfig.issueTypes || [];
                        if (e.target.checked) {
                          setImportConfig((prev) => ({
                            ...prev,
                            issueTypes: [...types, type],
                          }));
                        } else {
                          setImportConfig((prev) => ({
                            ...prev,
                            issueTypes: types.filter((t) => t !== type),
                          }));
                        }
                      }}
                    />
                    <label htmlFor={`type-${type}`}>{type}</label>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="step-actions">
          <button className="btn-secondary" onClick={() => setStep('auth')}>
            {t('jiraImport.actions.back')}
          </button>
          <button
            className="btn-primary"
            onClick={handleImport}
            disabled={!importConfig.projectKey || loading}
          >
            {loading ? <FaSpinner className="fa-spin" /> : <FaDownload />}
            {t('jiraImport.actions.import')}
          </button>
        </div>
      </div>
    </div>
  );

  const renderImportingStep = () => (
    <div className="jira-import-step">
      <div className="step-header">
        <div className="step-icon fa-spin">
          <FaSpinner />
        </div>
        <h3>{t('jiraImport.importing.title')}</h3>
        <p>{t('jiraImport.importing.description')}</p>
      </div>

      <div className="step-content">
        <div className="importing-progress">
          <div className="progress-info">
            <div className="progress-icon">
              <FaSpinner className="fa-spin" />
            </div>
            <span>
              {importJob
                ? `${t('jiraImport.importing.progress')} ${importJob.progress.completed}/${importJob.progress.total}`
                : t('jiraImport.importing.starting')}
            </span>
          </div>

          {importJob && (
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${(importJob.progress.completed / importJob.progress.total) * 100}%`,
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderResultsStep = () => {
    const successCount = importedTasks.length;
    const selectedCount = selectedTaskIds.size;
    const failureCount = importJob?.progress.failed || 0;
    const hasError = !!error || failureCount > 0;

    return (
      <div className="jira-import-step">
        <div className="step-header">
          <div className={`step-icon ${!hasError ? 'success' : ''}`}>
            {!hasError ? <FaCheckCircle /> : <FaExclamationCircle />}
          </div>
          <h3>{t('jiraImport.results.title')}</h3>
          <p>
            {!hasError
              ? t('jiraImport.results.successDescription', {
                  count: successCount,
                })
              : t('jiraImport.results.errorDescription', {
                  success: successCount,
                  failed: failureCount,
                })}
          </p>
        </div>

        <div className="step-content">
          {error && (
            <div className="error-summary">
              <FaExclamationCircle />
              <span>{error}</span>
            </div>
          )}

          {successCount > 0 && (
            <>
              <div className="results-summary">
                <div className="summary-stats">
                  <div className="stat success">
                    <FaCheckCircle />
                    {successCount} {t('jiraImport.results.tasksImported')}
                  </div>
                  <div className="stat info">
                    <FaTasks />
                    {selectedCount} {t('jiraImport.results.tasksSelected')}
                  </div>
                  {failureCount > 0 && (
                    <div className="stat error">
                      <FaTimesCircle />
                      {failureCount} {t('jiraImport.results.tasksFailed')}
                    </div>
                  )}
                </div>
              </div>

              <div className="tasks-preview">
                <div className="tasks-header">
                  <h4>{t('jiraImport.results.selectTasks')}</h4>
                  <div className="selection-controls">
                    <button
                      className="btn-link"
                      onClick={handleSelectAll}
                      disabled={selectedCount === successCount}
                    >
                      {t('jiraImport.results.selectAll')}
                    </button>
                    <button
                      className="btn-link"
                      onClick={handleDeselectAll}
                      disabled={selectedCount === 0}
                    >
                      {t('jiraImport.results.deselectAll')}
                    </button>
                  </div>
                </div>

                <div className="tasks-list selectable">
                  {importedTasks.map((task, index) => (
                    <div
                      key={task.id}
                      className={`task-preview-item selectable ${selectedTaskIds.has(task.id) ? 'selected' : ''}`}
                    >
                      <div className="task-checkbox">
                        <input
                          type="checkbox"
                          id={`task-${task.id}`}
                          checked={selectedTaskIds.has(task.id)}
                          onChange={(e) =>
                            handleTaskSelection(task.id, e.target.checked)
                          }
                        />
                      </div>
                      <div className="task-number">{index + 1}</div>
                      <div className="task-content">
                        <div className="task-title">
                          <span className="jira-key">{task.jiraKey}</span>
                          {task.description}
                        </div>
                        <div className="task-meta">
                          <span className="task-type">{task.type}</span>
                          <span className="task-priority">{task.priority}</span>
                          {task.originalStoryPoints && (
                            <span className="story-points">
                              {task.originalStoryPoints} SP
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="step-actions">
            <button className="btn-secondary" onClick={handleClose}>
              {t('common.close')}
            </button>
            {selectedCount > 0 && (
              <button className="btn-primary" onClick={handleUseImportedTasks}>
                <FaTasks />
                {t('jiraImport.results.useSelectedTasks', {
                  count: selectedCount,
                })}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t('jiraImport.title')}>
      <div className="jira-import-modal">
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
