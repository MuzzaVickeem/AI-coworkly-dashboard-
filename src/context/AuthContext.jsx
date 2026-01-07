import { createContext, useContext, useState, useEffect } from 'react';
import { ROLES } from './roles';

const AuthContext = createContext(null);

// Re-export ROLES for backward compatibility with existing imports
export { ROLES };

export function AuthProvider({ children }) {
    // Initialize state from localStorage
    const [isLoggedIn, setIsLoggedIn] = useState(() => {
        return localStorage.getItem('isLoggedIn') === 'true';
    });
    const [currentRole, setCurrentRole] = useState(() => {
        return localStorage.getItem('currentRole') || ROLES.ADMIN;
    });
    const [selectedCompanyId, setSelectedCompanyId] = useState(() => {
        return localStorage.getItem('selectedCompanyId') || null;
    });
    const [adminEmail, setAdminEmail] = useState(() => {
        return localStorage.getItem('adminEmail') || '';
    });
    const [hasSeenIntro, setHasSeenIntro] = useState(() => {
        // Check sessionStorage on mount
        return sessionStorage.getItem('hasSeenIntro') === 'true';
    });

    // Persist auth state to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('isLoggedIn', isLoggedIn.toString());
    }, [isLoggedIn]);

    useEffect(() => {
        localStorage.setItem('currentRole', currentRole);
    }, [currentRole]);

    useEffect(() => {
        if (selectedCompanyId) {
            localStorage.setItem('selectedCompanyId', selectedCompanyId);
        } else {
            localStorage.removeItem('selectedCompanyId');
        }
    }, [selectedCompanyId]);

    useEffect(() => {
        localStorage.setItem('adminEmail', adminEmail);
    }, [adminEmail]);

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
        // Clear localStorage
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('currentRole');
        localStorage.removeItem('selectedCompanyId');
        localStorage.removeItem('adminEmail');
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
