'use client'

export function Waveform() {
  const bars = Array.from({ length: 40 }, (_, i) => i)

  return (
    <div className="flex items-center justify-center gap-[3px] h-14 w-full">
      {bars.map((bar) => (
        <div
          key={bar}
          className="w-[3px] bg-gradient-to-t from-[#1DB954] to-emerald-400 rounded-full transition-all"
          style={{
            height: `${20 + Math.random() * 80}%`,
            animation: `pulse ${0.4 + Math.random() * 0.6}s ease-in-out infinite alternate`,
            animationDelay: `${bar * 0.02}s`,
          }}
        />
      ))}

      {/* Dynamic pulse keyframe animation style injection */}
      <style jsx global>{`
        @keyframes pulse {
          0% {
            transform: scaleY(0.3);
            opacity: 0.5;
          }
          100% {
            transform: scaleY(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}
