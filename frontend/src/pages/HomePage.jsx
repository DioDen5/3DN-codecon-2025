import React from 'react'
import { Link } from 'react-router-dom'
import circlesImg from '../assets/circles.png'
import gridImg from '../assets/grid.png'

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
            <div className="relative z-10 max-w-7xl mx-auto px-6 flex flex-col justify-center min-h-[calc(100vh-72px)]">
                <h1 className="text-white text-5xl md:text-6xl font-extrabold leading-tight mb-4">
                    Твій <br /> університетський <br /> простір для навчання
                </h1>

                <p className="text-white text-sm md:text-base font-medium mb-10 max-w-xl">
                    Об’єднуємо студентів і знання. Все для твого успіху в університеті.
                </p>

                <Link
                    to="/forum"
                    className="w-fit px-6 py-3 border border-purple-400 text-white rounded-full hover:bg-purple-600 hover:border-transparent transition-all text-sm md:text-base"
                >
                    Почати обговорення
                </Link>
            </div>
        </div>
    )
}

export default HomePage
