import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Task } from './Task';

type TaskData = {
  title?: string;
  description?: string;
};

type TaskListProps = {
  taskList: Array<string | undefined | TaskData>;
  onTaskListChange?: (taskList: Array<string | undefined | TaskData>) => void;
};

export default function TaskList({
  taskList,
  onTaskListChange,
}: TaskListProps) {
  const { t } = useTranslation();
  const [tasks, setTasks] =
    useState<Array<string | undefined | TaskData>>(taskList);

  // Sincronizar el estado interno cuando cambian las props
  useEffect(() => {
    setTasks(taskList);
  }, [taskList]);

  const onAddTask = () => {
    const newTask = { title: '', description: '' }; // Siempre usar campos separados
    const newTasks = [...tasks, newTask];
    setTasks(newTasks);
    if (onTaskListChange) {
      onTaskListChange(newTasks);
    }
  };

  const handleTaskChange = (
    index: number,
    newTask: string | undefined | TaskData
  ) => {
    const newTasks = tasks.map((task, i) => (i === index ? newTask : task));
    setTasks(newTasks);
    if (onTaskListChange) {
      onTaskListChange(newTasks);
    }
  };

  const handleTaskDelete = (indexToDelete: number) => {
    const newTasks = tasks.filter((_, index) => index !== indexToDelete);
    setTasks(newTasks);
    if (onTaskListChange) {
      onTaskListChange(newTasks);
    }
  };

  return (
    <div className="task-list-container">
      <h2>{t('planningVotes.tasks.title')}</h2>
      <p className="task-list-description">
        {t('planningVotes.tasks.description')}
      </p>
      {tasks.length === 0 ? (
        <div className="no-tasks-message">
          <p>{t('planningVotes.tasks.noTasks')}</p>
        </div>
      ) : (
        <div className="tasks-wrapper">
          {tasks.map((task, index) => {
            // Detectar si es una tarea de Jira
            const taskText =
              typeof task === 'string'
                ? task
                : task?.title || task?.description || '';
            const isJiraTask = Boolean(
              taskText?.includes(' - ') && taskText?.match(/^[A-Z]+-\d+/)
            );

            return (
              <Task
                key={index}
                index={index}
                taskValue={task}
                onTaskChange={(newTask) => handleTaskChange(index, newTask)}
                onTaskDelete={() => handleTaskDelete(index)}
                isJiraTask={isJiraTask}
              />
            );
          })}
        </div>
      )}{' '}
      <button
        type="button"
        className="button-secondary button-add-task"
        onClick={onAddTask}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path
            d="M12 4V20M4 12H20"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {t('planningVotes.tasks.addTask')}
      </button>
    </div>
  );
}
