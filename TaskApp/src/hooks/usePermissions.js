import { useEffect } from 'react';
import { requestInitialPermissions } from '../utils/permissions';

const usePermissions = () => {
  useEffect(() => {
    requestInitialPermissions();
  }, []);
};

export default usePermissions;
