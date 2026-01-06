import useTaskStore from '../store/task.store';

const useTasks = () => {
  const tasks = useTaskStore((s) => s.tasks);
  const setTasks = useTaskStore((s) => s.setTasks);
  return { tasks, setTasks };
};

export default useTasks;
