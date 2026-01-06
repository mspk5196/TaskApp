import useIdentityStore from '../store/identity.store';

const useIdentity = () => {
  const currentIdentity = useIdentityStore((s) => s.currentIdentity);
  const setCurrentIdentity = useIdentityStore((s) => s.setCurrentIdentity);
  return { currentIdentity, setCurrentIdentity };
};

export default useIdentity;
