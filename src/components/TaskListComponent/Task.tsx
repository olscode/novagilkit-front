import { useState } from 'react';
import { useTranslation } from 'react-i18next';

type TaskProps = {
  taskValue: string | undefined;
  onTaskChange?: (task: string | undefined) => void;
  onTaskDelete?: () => void;
  index: number;
  isJiraTask?: boolean; // Nuevo prop para identificar si es de Jira
};

export function Task({
  taskValue,
  onTaskChange,
  onTaskDelete,
  index,
  isJiraTask = false,
}: TaskProps) {
  const { t } = useTranslation();
  const [task, setTask] = useState<string | undefined>(taskValue);

  const onChangeTask = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = event.target.value;
    setTask(newValue);
    if (onTaskChange) {
      onTaskChange(newValue);
    }
  };

  // Detectar si parece ser una tarea de Jira por el formato
  const looksLikeJiraTask =
    taskValue?.includes(' - ') && taskValue?.match(/^[A-Z]+-\d+/);
  const isFromJira = isJiraTask || looksLikeJiraTask;

  return (
    <div className={`task-item ${isFromJira ? 'task-item--jira' : ''}`}>
      <div className="task-header">
        <label htmlFor={`task-${index}`} className="task-label">
          {isFromJira ? (
            <span className="task-label-jira">
              <svg
                className="jira-icon"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M11.53 2c0 2.4 1.97 4.35 4.35 4.35h1.78v1.7c0 2.4 1.97 4.35 4.35 4.35V2.84c-.5-.84-1.36-1.39-2.35-1.39L11.53 2zm-4.35 4.35c0 2.4 1.97 4.35 4.35 4.35h1.78v1.7c0 2.4 1.97 4.35 4.35 4.35V7.19c-.5-.84-1.36-1.39-2.35-1.39L7.18 6.35zm-4.35 4.35c0 2.4 1.97 4.35 4.35 4.35h1.78v1.7c0 2.4 1.97 4.35 4.35 4.35v-9.55c-.5-.84-1.36-1.39-2.35-1.39L2.83 10.7z" />
              </svg>
              {t('planningVotes.tasks.jiraTaskLabel')} {index + 1}
            </span>
          ) : (
            `${t('planningVotes.tasks.taskLabel')} ${index + 1}`
          )}
        </label>
        {onTaskDelete && (
          <button
            type="button"
            className="button-delete-task"
            onClick={onTaskDelete}
            title={t('planningVotes.tasks.deleteTask')}
            aria-label={t('planningVotes.tasks.deleteTask')}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 6h18"></path>
              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"></path>
              <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </button>
        )}
      </div>{' '}
      <textarea
        id={`task-${index}`}
        className="task-textarea"
        placeholder={t('planningVotes.tasks.taskPlaceholder')}
        onChange={onChangeTask}
        value={task || ''}
      />
    </div>
  );
}
