import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Task } from './Task';

type TaskListProps = {
  taskList: Array<string | undefined>;
  onTaskListChange?: (taskList: Array<string | undefined>) => void;
};

export default function TaskList({
  taskList,
  onTaskListChange,
}: TaskListProps) {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState<Array<string | undefined>>(taskList);

  const onAddTask = () => {
    const newTasks = [...tasks, ''];
    setTasks(newTasks);
    if (onTaskListChange) {
      onTaskListChange(newTasks);
    }
  };
  const handleTaskChange = (index: number, newTask: string | undefined) => {
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
      <h2>{t('pokerPlanning.tasks.title')}</h2>
      <p className="task-list-description">
        {t('pokerPlanning.tasks.description')}
      </p>
      {tasks.length === 0 ? (
        <div className="no-tasks-message">
          <p>{t('pokerPlanning.tasks.noTasks')}</p>
        </div>
      ) : (
        <div className="tasks-wrapper">
          {tasks.map((task, index) => (
            <Task
              key={index}
              index={index}
              taskValue={task}
              onTaskChange={(newTask) => handleTaskChange(index, newTask)}
              onTaskDelete={() => handleTaskDelete(index)}
            />
          ))}
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
        {t('pokerPlanning.tasks.addTask')}
      </button>
    </div>
  );
}
