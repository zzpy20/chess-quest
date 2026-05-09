export default function StarBurst({ count = 3 }) {
  return (
    <div className="flex justify-center gap-2 my-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <span
          key={i}
          className="text-4xl"
          style={{
            animation: `star 0.5s ease-out ${i * 0.15}s forwards`,
            opacity: 0,
            display: 'inline-block',
            filter: i < count ? 'none' : 'grayscale(1) opacity(0.3)',
          }}
        >
          ⭐
        </span>
      ))}
    </div>
  )
}
