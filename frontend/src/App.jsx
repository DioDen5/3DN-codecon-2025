import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Modal from './components/Modal'
import LoginForm from './components/LoginForm'
import SignupForm from './components/SignupForm'
import ResetPasswordForm from './components/ResetPasswordForm'
import HomePage from './pages/HomePage'
import ForumPage from './pages/ForumPage'
import ForumPostPage from './pages/ForumPostPage.jsx'
import CreateDiscussionPage from './pages/CreateDiscussionPage.jsx'
import TeachersPage from './pages/TeachersPage.jsx'
import TeacherProfilePage from './pages/TeacherProfilePage'

function App() {
    const [modalType, setModalType] = useState(null)

    const closeModal = () => setModalType(null)

    return (
        <Router>
            <Header
                onLoginOpen={() => setModalType('login')}
                onSignupOpen={() => setModalType('signup')}
            />

            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/forum" element={<ForumPage />} />
                <Route path="/forum/:id" element={<ForumPostPage />} />
                <Route path="/forum/create" element={<CreateDiscussionPage />} />
                <Route path="/teachers" element={<TeachersPage />} />
                <Route path="/teachers/:id" element={<TeacherProfilePage />} />
            </Routes>

            <Modal isOpen={modalType !== null} onClose={closeModal}>
                {modalType === 'login' && (
                    <LoginForm switchToReset={() => setModalType('reset')} />
                )}

                {modalType === 'signup' && (
                    <SignupForm switchToLogin={() => setModalType('login')} />
                )}

                {modalType === 'reset' && (
                    <ResetPasswordForm switchToLogin={() => setModalType('login')} />
                )}
            </Modal>
        </Router>
    )
}

export default App
