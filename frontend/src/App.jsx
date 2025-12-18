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
import TeacherProfilePage from "./pages/TeacherProfilePage";
import UserProfilePage from "./pages/UserProfilePage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ResetPasswordVerifyPage from "./pages/ResetPasswordVerifyPage";

import RequireAuth from "./utils/RequireAuth";
import ErrorBoundary from "./components/ErrorBoundary";
import { NotificationProvider } from "./contexts/NotificationContext";
import { TeacherDataProvider } from "./contexts/TeacherDataContext";
import { useAuthState } from "./api/useAuthState";
import { getMe } from "./api/auth";

function AppContent() {
    const location = useLocation();
    const [modalType, setModalType] = useState(null);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const { user } = useAuthState();
    const closeModal = () => setModalType(null);

    useEffect(() => {
        const currentUser = getMe();
        if (currentUser) {
            const flag = sessionStorage.getItem('teacherRequiresPasswordSetup');
            if (flag === 'true') {
                sessionStorage.removeItem('teacherRequiresPasswordSetup');
            }
        }
    }, []);

    useEffect(() => {
        const openLogin = () => setModalType("login");
        window.addEventListener("open-login", openLogin);
        return () => window.removeEventListener("open-login", openLogin);
    }, []);

    useEffect(() => {
        const onAuthChanged = (e) => {
            if (e.detail?.isAuth) setModalType(null);

            setTimeout(() => {
                const requiresPasswordSetup = sessionStorage.getItem('teacherRequiresPasswordSetup') === 'true';
                const currentUser = getMe();
                if (requiresPasswordSetup && !showPasswordModal && currentUser && currentUser.role === 'teacher') {
                    setShowPasswordModal(true);
                    sessionStorage.removeItem('teacherRequiresPasswordSetup');
                } else if (requiresPasswordSetup) {
                    sessionStorage.removeItem('teacherRequiresPasswordSetup');
                }
            }, 100);
        };
        window.addEventListener("auth-changed", onAuthChanged);
        return () => window.removeEventListener("auth-changed", onAuthChanged);
    }, [showPasswordModal]);

    useEffect(() => {
        const checkPasswordSetup = () => {
            const requiresPasswordSetup = sessionStorage.getItem('teacherRequiresPasswordSetup') === 'true';
            const currentUser = getMe();

            if (requiresPasswordSetup && !showPasswordModal && currentUser && currentUser.role === 'teacher') {
                setTimeout(() => {
                    setShowPasswordModal(true);
                    sessionStorage.removeItem('teacherRequiresPasswordSetup');
                }, 200);
            } else if (requiresPasswordSetup) {
                sessionStorage.removeItem('teacherRequiresPasswordSetup');
            }
        };

        checkPasswordSetup();
    }, [location.pathname, showPasswordModal, user]);

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
                    <Route path="/teachers/:id" element={<TeacherProfilePage />} />

                    <Route
                        path="/profile"
                        element={
                            <RequireAuth>
                                <UserProfilePage />
                            </RequireAuth>
                        }
                    />

                    <Route path="/reset-password/verify" element={<ResetPasswordVerifyPage />} />
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

                }}
                onSuccess={() => {

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
