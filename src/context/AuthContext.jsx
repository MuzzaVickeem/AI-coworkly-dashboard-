import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const ROLES = {
    ADMIN: 'Admin',
    DIRECTOR: 'Director',
};

export function AuthProvider({ children }) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentRole, setCurrentRole] = useState(ROLES.ADMIN);
    const [selectedCompanyId, setSelectedCompanyId] = useState(null);
    const [adminEmail, setAdminEmail] = useState('');
    const [hasSeenIntro, setHasSeenIntro] = useState(() => {
        // Check sessionStorage on mount
        return sessionStorage.getItem('hasSeenIntro') === 'true';
    });

    const isAdmin = currentRole === ROLES.ADMIN;
    const isDirector = currentRole === ROLES.DIRECTOR;

    const toggleRole = () => {
        setCurrentRole((prev) =>
            prev === ROLES.ADMIN ? ROLES.DIRECTOR : ROLES.ADMIN
        );
    };

    const login = (email, role = ROLES.ADMIN) => {
        setAdminEmail(email);
        setCurrentRole(role);
        setIsLoggedIn(true);
    };

    const logout = () => {
        setIsLoggedIn(false);
        setSelectedCompanyId(null);
        setAdminEmail('');
    };

    const selectCompany = (companyId) => {
        setSelectedCompanyId(companyId);
    };

    const clearCompanySelection = () => {
        setSelectedCompanyId(null);
    };

    const markIntroSeen = () => {
        setHasSeenIntro(true);
        sessionStorage.setItem('hasSeenIntro', 'true');
    };

    const value = {
        // Login state
        isLoggedIn,
        adminEmail,
        login,
        logout,
        // Company selection
        selectedCompanyId,
        selectCompany,
        clearCompanySelection,
        // Intro state
        hasSeenIntro,
        markIntroSeen,
        // Role management
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
