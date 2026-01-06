import useNotificationStore from '../store/notification.store';

const useNotifications = () => {
  const notifications = useNotificationStore((s) => s.notifications);
  const setNotifications = useNotificationStore((s) => s.setNotifications);
  return { notifications, setNotifications };
};

export default useNotifications;
