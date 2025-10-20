import React, { useState, useEffect } from 'react'

const Typewriter = ({
                        texts = [],
                        typingSpeed = 50,
                        erasingSpeed = 50,
                        delayBeforeErase = 1500,
                        delayBeforeType = 800,
                    }) => {
    const [textIndex, setTextIndex] = useState(0)
    const [displayText, setDisplayText] = useState('')
    const [isTyping, setIsTyping] = useState(true)
    const [isErasing, setIsErasing] = useState(false)

    useEffect(() => {
        if (!texts || texts.length === 0) return
        
        let timer
        const currentText = texts[textIndex]

        if (isTyping) {
            if (displayText.length < currentText.length) {
                timer = setTimeout(() => {
                    setDisplayText((prev) => prev + currentText[prev.length])
                }, typingSpeed)
            } else {
                timer = setTimeout(() => {
                    setIsTyping(false)
                }, delayBeforeErase)
            }
        } else {
            if (displayText.length > 0) {
                setIsErasing(true)
                timer = setTimeout(() => {
                    setDisplayText((prev) => prev.slice(0, -1))
                }, erasingSpeed)
            } else {
                setIsErasing(false)
                timer = setTimeout(() => {
                    setTextIndex((prev) => (prev + 1) % texts.length)
                    setIsTyping(true)
                }, delayBeforeType)
            }
        }

        return () => clearTimeout(timer)
    }, [displayText, isTyping, textIndex, texts, typingSpeed, erasingSpeed, delayBeforeErase, delayBeforeType])

    return (
        <span className={`text-sm md:text-base font-medium max-w-xl relative whitespace-nowrap transition-all duration-[2000ms] ${isErasing ? 'text-gray-400' : 'text-white'}`}>
      {displayText}
            <span className="inline-block w-[2px] h-[1.2em] relative top-1 bg-gray-100 ml-1 animate-neon-blink" />
    </span>
    )
}

export default Typewriter
