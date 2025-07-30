export const loginAdmin = async (
  username: string,
  password: string
): Promise<void> => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Importante: incluir cookies
      body: JSON.stringify({ email: username, password }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    // Ya no necesitamos manejar el token manualmente
    // El backend lo establece como httpOnly cookie
    const data = await response.json();
    console.log('Login successful:', data.message);
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

// Nuevo: Función para logout
export const logoutAdmin = async (): Promise<void> => {
  try {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Logout failed');
    }
  } catch (error) {
    console.error('Error logging out:', error);
    throw error;
  }
};

// Nuevo: Función para verificar autenticación
export const verifyAuth = async (): Promise<boolean> => {
  try {
    const response = await fetch('/api/auth/verify', {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) return false;

    const data = await response.json();
    return !!data.authenticated;
  } catch (error) {
    console.error('Error verifying auth:', error);
    return false;
  }
};
