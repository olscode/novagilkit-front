import { useState } from 'react';
import { useTranslation } from 'react-i18next';

type TaskProps = {
  taskValue: string | undefined;
  onTaskChange?: (task: string | undefined) => void;
  onTaskDelete?: () => void; // Añadir función para eliminar tarea
  index: number; // Añadir índice para mostrar número de tarea
};

export function Task({
  taskValue,
  onTaskChange,
  onTaskDelete,
  index,
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

  return (
    <div className="task-item">
      <div className="task-header">
        <label htmlFor={`task-${index}`} className="task-label">
          {t('planningVotes.tasks.taskLabel')} {index + 1}
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
