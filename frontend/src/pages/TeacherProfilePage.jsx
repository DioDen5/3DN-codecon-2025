import { useParams, useNavigate } from 'react-router-dom'
import teachers from '../data/teachers'
import teacherReplies from '../data/teacherReplies'
import CommentInput from '../components/CommentInput'
import RepliesList from '../components/RepliesList'

const TeacherProfilePage = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const teacher = teachers[parseInt(id)]
    const replies = teacherReplies[id] || []

    if (!teacher) {
        return <div className="text-white p-10">Викладача не знайдено</div>
    }

    return (
        <div className="min-h-[calc(100vh-68px)] bg-gradient-to-b from-black to-gray-900 px-6 py-10 text-white">
            <div className="max-w-4xl mx-auto space-y-6">
                <button
                    onClick={() => navigate(-1)}
                    className="text-sm underline text-white hover:text-purple-300 transition"
                >
                    ← Назад
                </button>
                <div className="bg-white text-black rounded-xl overflow-hidden shadow-md flex flex-col sm:flex-row gap-6">
                    <img
                        src={teacher.image}
                        alt={teacher.name}
                        className="w-full sm:w-64 h-64 object-cover"
                    />
                    <div className="p-6 space-y-2">
                        <h2 className="text-xl font-semibold">{teacher.name}</h2>
                        <p className="text-sm text-gray-600">{teacher.university}</p>
                        <p className="text-sm text-gray-600">
                            Предмет: <span className="text-black">{teacher.subject}</span>
                        </p>
                        <p className="text-sm text-gray-600">
                            Загальна оцінка:{' '}
                            <span className="text-blue-600 font-semibold">{teacher.rating}/10</span>
                        </p>
                    </div>
                </div>
                <CommentInput />
                <RepliesList replies={replies} />
            </div>
        </div>
    )
}

export default TeacherProfilePage
