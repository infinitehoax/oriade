'use client'

export function Waveform() {
  const bars = Array.from({ length: 50 }, (_, i) => i)

  return (
    <div className="flex items-center justify-center gap-1 h-12">
      {bars.map((bar) => (
        <div
          key={bar}
          className="w-1 bg-gradient-to-t from-primary to-primary-dark rounded-full"
          style={{
            height: `${Math.random() * 100}%`,
            animation: `pulse ${0.4 + Math.random() * 0.6}s ease-in-out infinite`,
            animationDelay: `${bar * 0.02}s`,
          }}
        />
      ))}
    </div>
  )
}
