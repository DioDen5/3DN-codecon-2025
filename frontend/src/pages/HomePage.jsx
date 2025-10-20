import React from 'react'
import { Link } from 'react-router-dom'
import circlesImg from '../assets/circles.png'
import gridImg from '../assets/grid.png'
import Typewriter from '../components/Typewriter'

const HomePage = () => {
    return (
        <div className="h-[calc(100vh-68px)] w-full bg-gradient-to-b from-black to-gray-900 relative overflow-hidden">
            <img
                src={gridImg}
                alt="Grid background"
                className="absolute inset-0 w-full h-full object-cover opacity-90 z-0"
            />
            <img
                src={circlesImg}
                alt="Circles decoration"
                className="absolute right-0 top-1/2 transform -translate-y-1/2 w-[400px] md:w-[500px] lg:w-[600px] pointer-events-none select-none opacity-80 z-10"
            />
            <div
                className="relative z-10 max-w-7xl mx-auto px-6 flex flex-col justify-center min-h-[calc(100vh-72px)]">
                <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-4 text-white fade-mask">
                    Твій <br/> університетський <br/> простір для навчання
                </h1>


                <p className="text-white text-sm md:text-base font-medium mb-10 max-w-xl">
                    <Typewriter
                        texts={[
                            'Об\'єднуємо студентів і знання. Все для твого успіху в університеті.',
                            'Створи обговорення, залиш відгук, або звернись до адміністрації — все в одному місці.',
                            'Ділись досвідом, знаходь відповіді й заробляй репутацію серед активних студентів.',
                        ]}
                        typingSpeed={50}
                        erasingSpeed={30}
                        delayBeforeErase={2000}
                        delayBeforeType={500}
                    />
                </p>

                <Link
                    to="/forum"
                    className="btn-primary "
                >
                    Почати обговорення
                </Link>
            </div>
        </div>
    )
}

export default HomePage
