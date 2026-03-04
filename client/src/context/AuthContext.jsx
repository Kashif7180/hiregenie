import { createContext, useContext, useReducer, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

// Initial state
const initialState = {
    user: null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
};

// Reducer
const authReducer = (state, action) => {
    switch (action.type) {
        case 'AUTH_START':
            return { ...state, isLoading: true, error: null };
        case 'AUTH_SUCCESS':
            return {
                ...state,
                user: action.payload.user,
                token: action.payload.token,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            };
        case 'AUTH_FAILURE':
            return {
                ...state,
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
                error: action.payload,
            };
        case 'LOGOUT':
            return {
                ...state,
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
            };
        case 'CLEAR_ERROR':
            return { ...state, error: null };
        case 'UPDATE_USER':
            return { ...state, user: action.payload };
        case 'SET_LOADING':
            return { ...state, isLoading: action.payload };
        default:
            return state;
    }
};

// Provider component
export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Check if user is already logged in (on app load)
    useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                dispatch({ type: 'SET_LOADING', payload: false });
                return;
            }

            try {
                const { data } = await api.get('/auth/me');
                dispatch({
                    type: 'AUTH_SUCCESS',
                    payload: { user: data.user, token },
                });
            } catch (error) {
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                dispatch({ type: 'AUTH_FAILURE', payload: null });
            }
        };

        loadUser();
    }, []);

    // Register
    const register = async (name, email, password) => {
        dispatch({ type: 'AUTH_START' });
        try {
            const { data } = await api.post('/auth/register', {
                name,
                email,
                password,
            });
            localStorage.setItem('token', data.token);
            if (data.refreshToken) {
                localStorage.setItem('refreshToken', data.refreshToken);
            }
            dispatch({
                type: 'AUTH_SUCCESS',
                payload: { user: data.user, token: data.token },
            });
            return { success: true };
        } catch (error) {
            const message =
                error.response?.data?.message || 'Registration failed';
            dispatch({ type: 'AUTH_FAILURE', payload: message });
            return { success: false, message };
        }
    };

    // Login
    const login = async (email, password) => {
        dispatch({ type: 'AUTH_START' });
        try {
            const { data } = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', data.token);
            if (data.refreshToken) {
                localStorage.setItem('refreshToken', data.refreshToken);
            }
            dispatch({
                type: 'AUTH_SUCCESS',
                payload: { user: data.user, token: data.token },
            });
            return { success: true };
        } catch (error) {
            const message =
                error.response?.data?.message || 'Login failed';
            dispatch({ type: 'AUTH_FAILURE', payload: message });
            return { success: false, message };
        }
    };

    // Logout
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        dispatch({ type: 'LOGOUT' });
    };

    // Clear error
    const clearError = () => {
        dispatch({ type: 'CLEAR_ERROR' });
    };

    return (
        <AuthContext.Provider
            value={{
                ...state,
                register,
                login,
                logout,
                clearError,
                dispatch,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
