import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const ROLES = {
    ADMIN: 'Admin',
    DIRECTOR: 'Director',
};

export function AuthProvider({ children }) {
    const [currentRole, setCurrentRole] = useState(ROLES.ADMIN);

    const isAdmin = currentRole === ROLES.ADMIN;
    const isDirector = currentRole === ROLES.DIRECTOR;

    const toggleRole = () => {
        setCurrentRole((prev) =>
            prev === ROLES.ADMIN ? ROLES.DIRECTOR : ROLES.ADMIN
        );
    };

    const value = {
        currentRole,
        setCurrentRole,
        isAdmin,
        isDirector,
        toggleRole,
        ROLES,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
