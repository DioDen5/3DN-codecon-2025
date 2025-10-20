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
                timer = setTimeout(() => {
                    setDisplayText((prev) => prev.slice(0, -1))
                }, erasingSpeed)
            } else {
                timer = setTimeout(() => {
                    setTextIndex((prev) => (prev + 1) % texts.length)
                    setIsTyping(true)
                }, delayBeforeType)
            }
        }

        return () => clearTimeout(timer)
    }, [displayText, isTyping, textIndex, texts, typingSpeed, erasingSpeed, delayBeforeErase, delayBeforeType])

    return (
        <span className="text-white text-sm md:text-base font-medium max-w-xl relative whitespace-nowrap">
      {displayText}
            <span className="inline-block w-[1px] h-[1.2em] relative top-1 bg-white ml-1 animate-blink" />
    </span>
    )
}

export default Typewriter
