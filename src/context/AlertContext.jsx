import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import Alert from '../components/ui/Alert';

const AlertContext = createContext();

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

export const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState({
    isOpen: false,
    message: '',
    type: 'info', // 'success', 'error', 'info', 'warning'
    title: '',
  });

  useEffect(() => {
    const pending = sessionStorage.getItem('pending_alert');
    if (pending) {
      try {
        const { message, type, title } = JSON.parse(pending);
        setAlert({
          isOpen: true,
          message,
          type: type || 'info',
          title: title || type.charAt(0).toUpperCase() + type.slice(1) || 'Info',
        });
      } catch (e) {
        console.error('Failed to parse pending alert', e);
      } finally {
        sessionStorage.removeItem('pending_alert');
      }
    }
  }, []);

  const showAlert = useCallback((message, type = 'info', title = '') => {
    setAlert({
      isOpen: true,
      message,
      type,
      title: title || type.charAt(0).toUpperCase() + type.slice(1),
    });
  }, []);

  const closeAlert = useCallback(() => {
    setAlert((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert, closeAlert }}>
      {children}
      {alert.isOpen && (
        <Alert
          message={alert.message}
          type={alert.type}
          title={alert.title}
          onClose={closeAlert}
        />
      )}
    </AlertContext.Provider>
  );
};
