import { useLogContext } from '../context/LogContext';

export const useLog = () => {
  const { log } = useLogContext();
  return log;
};
