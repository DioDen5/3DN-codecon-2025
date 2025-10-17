import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Header from "./components/Header";
import Modal from "./components/Modal";
import LoginForm from "./components/LoginForm";
import SignupForm from "./components/SignupForm";
import ResetPasswordForm from "./components/ResetPasswordForm";

import HomePage from "./pages/HomePage";
import ForumPage from "./pages/ForumPage";
import ForumPostPage from "./pages/ForumPostPage.jsx";
import CreateDiscussionPage from "./pages/CreateDiscussionPage.jsx";
import TeachersPage from "./pages/TeachersPage.jsx";
import TeacherProfilePage from "./pages/TeacherProfilePage";

import RequireAuth from "./utils/RequireAuth";
import ErrorBoundary from "./components/ErrorBoundary";

function App() {
    const [modalType, setModalType] = useState(null);
    const closeModal = () => setModalType(null);

    useEffect(() => {
        const openLogin = () => setModalType("login");
        window.addEventListener("open-login", openLogin);
        return () => window.removeEventListener("open-login", openLogin);
    }, []);

    useEffect(() => {
        const onAuthChanged = (e) => {
            if (e.detail?.isAuth) setModalType(null);
        };
        window.addEventListener("auth-changed", onAuthChanged);
        return () => window.removeEventListener("auth-changed", onAuthChanged);
    }, []);

    return (
        <Router>
            <Header
                onLoginOpen={() => setModalType("login")}
                onSignupOpen={() => setModalType("signup")}
            />

            <ErrorBoundary>
                <Routes>
                    <Route path="/" element={<HomePage />} />

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
                </Routes>
            </ErrorBoundary>

            <Modal isOpen={modalType !== null} onClose={closeModal}>
                {modalType === "login" && (
                    <LoginForm
                        switchToReset={() => setModalType("reset")}
                        onSuccess={() => setModalType(null)}
                    />
                )}

                {modalType === "signup" && (
                    <SignupForm switchToLogin={() => setModalType("login")} />
                )}

                {modalType === "reset" && (
                    <ResetPasswordForm switchToLogin={() => setModalType("login")} />
                )}
            </Modal>
        </Router>
    );
}

export default App;
