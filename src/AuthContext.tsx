import { createContext, useState } from 'react';

interface AuthContextInterface {
  loggedInUser: LoggedUserState | null;
  login: (userId: string, username: string) => void;
  logout: () => void;
  updateUsername: (newUsername: string) => void;
}

interface ChildrenInterface {
  children: React.ReactNode;
}

interface LoggedUserState {
  userId?: string;
  username: string;
}

const authContextDefaults: AuthContextInterface = {
  loggedInUser: null,
  login: () => null,
  logout: () => null,
  updateUsername: () => null,
};

export const AuthContext =
  createContext<AuthContextInterface>(authContextDefaults);

export const AuthProvider = ({ children }: ChildrenInterface) => {
  const [loggedInUser, setLoggedInUser] = useState<LoggedUserState | null>(
    null
  );

  const updateUsername = (newUsername: string) => {
    setLoggedInUser({ ...loggedInUser, username: newUsername });
  };
  const login = (userId: string, username: string) => {
    // Simulando la autenticación, estableciendo el usuario autenticado en el estado
    setLoggedInUser({ userId, username });
  };

  const logout = () => {
    // Simulando el cierre de sesión
    setLoggedInUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ loggedInUser, login, logout, updateUsername }}
    >
      {children}
    </AuthContext.Provider>
  );
};
