import { useEffect, useState } from 'react'

export default function DoveAnimation() {
  const [doves, setDoves] = useState([])

  useEffect(() => {
    // Create 8-10 doves with random properties
    const doveCount = Math.random() < 0.5 ? 8 : 10
    const newDoves = Array.from({ length: doveCount }, (_, i) => ({
      id: i,
      left: Math.random() * 100, // Random horizontal start position
      delay: Math.random() * 0.3, // Stagger animation start
      duration: 3 + Math.random() * 1, // 3-4 second duration
      drift: Math.random() * 30 - 15, // Random left/right drift
    }))
    setDoves(newDoves)

    // Clean up after animation completes
    const timer = setTimeout(() => setDoves([]), 4500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="dove-animation-container">
      {doves.map(dove => (
        <div
          key={dove.id}
          className="dove"
          style={{
            left: `${dove.left}%`,
            '--delay': `${dove.delay}s`,
            '--duration': `${dove.duration}s`,
            '--drift': `${dove.drift}px`,
          }}
        >
          🕊️
        </div>
      ))}
    </div>
  )
}
