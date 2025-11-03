import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

import Header from "./components/Header";
import Modal from "./components/Modal";
import LoginForm from "./components/LoginForm";
import SignupForm from "./components/SignupForm";
import ResetPasswordForm from "./components/ResetPasswordForm";
import SetTeacherPasswordModal from "./components/SetTeacherPasswordModal";

import HomePage from "./pages/HomePage";
import ForumPage from "./pages/ForumPage";
import ForumPostPage from "./pages/ForumPostPage.jsx";
import CreateDiscussionPage from "./pages/CreateDiscussionPage.jsx";
import TeachersPage from "./pages/TeachersPage.jsx";
import TeacherProfilePageNew from "./pages/TeacherProfilePageNew.jsx";
import UserProfilePage from "./pages/UserProfilePage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

import RequireAuth from "./utils/RequireAuth";
import ErrorBoundary from "./components/ErrorBoundary";
import { NotificationProvider } from "./contexts/NotificationContext";
import { TeacherDataProvider } from "./contexts/TeacherDataContext";

function AppContent() {
    const location = useLocation();
    const [modalType, setModalType] = useState(null);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const closeModal = () => setModalType(null);

    useEffect(() => {
        const openLogin = () => setModalType("login");
        window.addEventListener("open-login", openLogin);
        return () => window.removeEventListener("open-login", openLogin);
    }, []);

    useEffect(() => {
        const onAuthChanged = (e) => {
            if (e.detail?.isAuth) setModalType(null);
            
            // Перевіряємо чи потрібно показати модальне вікно для встановлення пароля після авторизації
            // Використовуємо setTimeout, щоб дати час на встановлення флагу в sessionStorage
            setTimeout(() => {
                const requiresPasswordSetup = sessionStorage.getItem('teacherRequiresPasswordSetup') === 'true';
                if (requiresPasswordSetup && !showPasswordModal) {
                    setShowPasswordModal(true);
                    sessionStorage.removeItem('teacherRequiresPasswordSetup');
                }
            }, 100);
        };
        window.addEventListener("auth-changed", onAuthChanged);
        return () => window.removeEventListener("auth-changed", onAuthChanged);
    }, [showPasswordModal]);

    // Перевіряємо чи потрібно показати модальне вікно для встановлення пароля
    // Перевіряємо при кожній зміні маршруту та одразу після монтування
    useEffect(() => {
        const checkPasswordSetup = () => {
            const requiresPasswordSetup = sessionStorage.getItem('teacherRequiresPasswordSetup') === 'true';
            if (requiresPasswordSetup && !showPasswordModal) {
                // Невелика затримка, щоб модальне вікно з'явилось після завершення навігації
                setTimeout(() => {
                    setShowPasswordModal(true);
                    sessionStorage.removeItem('teacherRequiresPasswordSetup'); // Видаляємо флаг
                }, 200);
            }
        };
        
        checkPasswordSetup();
    }, [location.pathname, showPasswordModal]);

    return (
        <>
            <Header
                    onLoginOpen={() => setModalType("login")}
                    onSignupOpen={() => setModalType("signup")}
                />

                <ErrorBoundary>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    
                    <Route 
                        path="/login" 
                        element={
                            <Modal isOpen={true} onClose={() => window.history.back()}>
                                <LoginForm
                                    switchToReset={() => setModalType("reset")}
                                    onSuccess={() => window.history.back()}
                                />
                            </Modal>
                        } 
                    />

                    <Route
                        path="/forum"
                        element={
                            <RequireAuth>
                                <ForumPage />
                            </RequireAuth>
                        }
                    />

                    <Route
                        path="/forum/create"
                        element={
                            <RequireAuth>
                                <CreateDiscussionPage />
                            </RequireAuth>
                        }
                    />

                    <Route
                        path="/forum/:id"
                        element={
                            <RequireAuth>
                                <ForumPostPage />
                            </RequireAuth>
                        }
                    />

                    <Route path="/teachers" element={<TeachersPage />} />
                    <Route path="/teachers/:id" element={<TeacherProfilePageNew />} />
                    
                    <Route
                        path="/profile"
                        element={
                            <RequireAuth>
                                <UserProfilePage />
                            </RequireAuth>
                        }
                    />
                    
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                </Routes>
            </ErrorBoundary>

            <Modal isOpen={modalType !== null && modalType !== "signup"} onClose={closeModal}>
                {modalType === "login" && (
                    <LoginForm
                        switchToReset={() => setModalType("reset")}
                        onSuccess={() => setModalType(null)}
                    />
                )}

                {modalType === "reset" && (
                    <ResetPasswordForm switchToLogin={() => setModalType("login")} />
                )}
            </Modal>
            {modalType === "signup" && (
                <SignupForm 
                    switchToLogin={() => setModalType("login")}
                    onClose={() => setModalType(null)}
                />
            )}

            <SetTeacherPasswordModal
                isOpen={showPasswordModal}
                onClose={() => {
                    // Не дозволяємо закривати модальне вікно - це обов'язковий крок
                    // Модальне вікно закривається тільки після успішного встановлення пароля через onSuccess
                }}
                onSuccess={() => {
                    // Пароль успішно встановлено - тепер можна закрити
                    setShowPasswordModal(false);
                }}
            />
        </>
    );
}

function App() {
    return (
        <NotificationProvider>
            <Router>
                <TeacherDataProvider>
                    <AppContent />
                </TeacherDataProvider>
            </Router>
        </NotificationProvider>
    );
}

export default App;
