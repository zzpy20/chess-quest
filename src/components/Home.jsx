export default function Home({ progress, onNavigate }) {
  const totalBadges = progress.badges.length
  const totalPieces = 6

  return (
    <div className="min-h-screen px-6 py-10 flex flex-col items-center">
      <div className="w-full max-w-[600px]">

        {/* Hero */}
        <div className="text-center mb-10">
          <div className="text-8xl mb-4" style={{ filter: 'drop-shadow(0 4px 24px rgba(255,215,0,0.6))' }}>
            ♞
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white leading-tight">
            Austin's
            <br />
            <span className="text-yellow-300">Chess Quest</span>
          </h1>
          <p className="text-white/60 mt-3 text-base md:text-lg">Your chess adventure awaits!</p>
        </div>

        {/* Stats */}
        <div className="bg-white/10 rounded-3xl p-5 mb-8 flex justify-around text-center">
          <div>
            <div className="text-3xl font-black text-yellow-300">⭐ {progress.stars}</div>
            <div className="text-white/60 text-sm mt-1">Stars</div>
          </div>
          <div className="w-px bg-white/20" />
          <div>
            <div className="text-3xl font-black text-purple-300">🏅 {totalBadges}/{totalPieces}</div>
            <div className="text-white/60 text-sm mt-1">Pieces</div>
          </div>
          <div className="w-px bg-white/20" />
          <div>
            <div className="text-3xl font-black text-orange-300">🔥 {progress.streak || 0}</div>
            <div className="text-white/60 text-sm mt-1">Streak</div>
          </div>
        </div>

        {/* Main buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <button
            onClick={() => onNavigate('guide')}
            className="bg-gradient-to-r from-teal-500 to-cyan-500 rounded-3xl p-6 text-white shadow-xl hover:scale-[1.02] active:scale-[0.97] transition-transform text-left"
          >
            <span className="text-5xl block mb-3">📖</span>
            <div className="font-black text-2xl">Pieces Guide</div>
            <div className="text-white/70 text-sm mt-1">Which piece is which? 👨 爸爸先看这个</div>
          </button>

          <button
            onClick={() => onNavigate('learn')}
            className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl p-6 text-white shadow-xl hover:scale-[1.02] active:scale-[0.97] transition-transform text-left"
          >
            <span className="text-5xl block mb-3">🎓</span>
            <div className="font-black text-2xl">Learn a Piece</div>
            <div className="text-white/70 text-sm mt-1">Meet every chess character!</div>
          </button>

          <button
            onClick={() => onNavigate('quest')}
            className="bg-gradient-to-r from-orange-500 to-yellow-500 rounded-3xl p-6 text-white shadow-xl hover:scale-[1.02] active:scale-[0.97] transition-transform text-left md:col-span-2"
          >
            <span className="text-5xl block mb-3">🗺️</span>
            <div className="font-black text-2xl">Today's Quest</div>
            <div className="text-white/70 text-sm mt-1">Solve a fun chess puzzle!</div>
            {progress.questsCompleted.length > 0 && (
              <div className="mt-3 text-sm text-yellow-200 font-bold">
                ✅ {progress.questsCompleted.length} quests completed!
              </div>
            )}
          </button>

          <button
            onClick={() => onNavigate('checkmate')}
            className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-3xl p-6 text-white shadow-xl hover:scale-[1.02] active:scale-[0.97] transition-transform text-left"
          >
            <span className="text-5xl block mb-3">♟</span>
            <div className="font-black text-2xl">Checkmate!</div>
            <div className="text-white/70 text-sm mt-1">Trap the King in 1 move</div>
            {(progress.checkmateSolved || []).length > 0 && (
              <div className="mt-2 text-sm text-green-200 font-bold">
                ✅ {progress.checkmateSolved.length}/10 solved
              </div>
            )}
          </button>

          <button
            onClick={() => onNavigate('play')}
            className="bg-gradient-to-r from-rose-500 to-pink-600 rounded-3xl p-6 text-white shadow-xl hover:scale-[1.02] active:scale-[0.97] transition-transform text-left"
          >
            <span className="text-5xl block mb-3">🤖</span>
            <div className="font-black text-2xl">Play with Buddy</div>
            <div className="text-white/70 text-sm mt-1">vs AI — 3 skill levels</div>
          </button>

          <button
            onClick={() => onNavigate('pass')}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-xl hover:scale-[1.02] active:scale-[0.97] transition-transform text-left md:col-span-2"
          >
            <span className="text-5xl block mb-3">👥</span>
            <div className="font-black text-2xl">2-Player Game</div>
            <div className="text-white/70 text-sm mt-1">Play a friend face-to-face on the iPad! 👨 两人对弈</div>
          </button>
        </div>

        {/* Badges */}
        {totalBadges > 0 && (
          <div className="mt-8 bg-white/10 rounded-3xl p-5">
            <h3 className="text-white font-black text-base mb-3">My Badges</h3>
            <div className="flex flex-wrap gap-2">
              {progress.badges.map(badge => {
                const pieceId = badge.replace('piece-', '')
                const emojis = { pawn: '♟', rook: '♜', bishop: '♝', knight: '♞', queen: '♛', king: '♚' }
                return (
                  <div key={badge} className="bg-yellow-400/20 border border-yellow-400/40 rounded-2xl px-4 py-2 text-base text-yellow-200 font-bold">
                    {emojis[pieceId] || '🏅'} {pieceId.charAt(0).toUpperCase() + pieceId.slice(1)} Master
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <p className="text-center text-white/40 text-sm mt-8">
          {totalBadges === 0
            ? 'Start by learning the Knight — the most fun piece! 🐴'
            : totalBadges < 3
            ? 'Great start! Keep learning more pieces! 🌟'
            : totalBadges < 6
            ? "You're becoming a real chess player! 🏆"
            : "🎊 All 6 pieces mastered! You're amazing!"}
        </p>

        {/* Dad's dashboard link */}
        <button
          onClick={() => onNavigate('parent')}
          className="mt-6 w-full text-white/30 hover:text-white/60 text-sm py-2 transition-colors"
        >
          👨 Dad's Dashboard
        </button>
      </div>
    </div>
  )
}
