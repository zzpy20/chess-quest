export default function Home({ progress, onNavigate }) {
  const totalBadges = progress.badges.length
  const totalPieces = 6

  return (
    <div className="min-h-screen px-4 py-8 flex flex-col items-center">
      <div className="w-full max-w-sm">
        {/* Hero */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-3" style={{ filter: 'drop-shadow(0 4px 20px rgba(255,215,0,0.5))' }}>
            ♞
          </div>
          <h1 className="text-4xl font-black text-white leading-tight">
            Austin's
            <br />
            <span className="text-yellow-300">Chess Quest</span>
          </h1>
          <p className="text-white/60 mt-2 text-sm">Your chess adventure awaits!</p>
        </div>

        {/* Stats bar */}
        <div className="bg-white/10 rounded-2xl p-4 mb-6 flex justify-around text-center">
          <div>
            <div className="text-2xl font-black text-yellow-300">⭐ {progress.stars}</div>
            <div className="text-white/60 text-xs">Stars</div>
          </div>
          <div className="w-px bg-white/20" />
          <div>
            <div className="text-2xl font-black text-purple-300">🏅 {totalBadges}/{totalPieces}</div>
            <div className="text-white/60 text-xs">Pieces</div>
          </div>
          <div className="w-px bg-white/20" />
          <div>
            <div className="text-2xl font-black text-orange-300">🔥 {progress.streak || 0}</div>
            <div className="text-white/60 text-xs">Streak</div>
          </div>
        </div>

        {/* Main buttons */}
        <div className="flex flex-col gap-4">
          <button
            onClick={() => onNavigate('learn')}
            className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-5 text-white shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-transform text-left"
          >
            <div className="flex items-center gap-4">
              <span className="text-4xl">🎓</span>
              <div>
                <div className="font-black text-xl">Learn a Piece</div>
                <div className="text-white/70 text-sm">Meet every chess character!</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('quest')}
            className="bg-gradient-to-r from-orange-500 to-yellow-500 rounded-2xl p-5 text-white shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-transform text-left"
          >
            <div className="flex items-center gap-4">
              <span className="text-4xl">🗺️</span>
              <div>
                <div className="font-black text-xl">Today's Quest</div>
                <div className="text-white/70 text-sm">Solve a fun chess puzzle!</div>
              </div>
            </div>
            {progress.questsCompleted.length > 0 && (
              <div className="mt-2 text-xs text-yellow-200 font-semibold">
                ✅ {progress.questsCompleted.length} quests completed!
              </div>
            )}
          </button>
        </div>

        {/* Badges */}
        {totalBadges > 0 && (
          <div className="mt-6 bg-white/10 rounded-2xl p-4">
            <h3 className="text-white font-black text-sm mb-3">My Badges</h3>
            <div className="flex flex-wrap gap-2">
              {progress.badges.map(badge => {
                const pieceId = badge.replace('piece-', '')
                const emojis = { pawn: '♟', rook: '♜', bishop: '♝', knight: '♞', queen: '♛', king: '♚' }
                return (
                  <div key={badge} className="bg-yellow-400/20 border border-yellow-400/40 rounded-xl px-3 py-1.5 text-sm text-yellow-200 font-bold">
                    {emojis[pieceId] || '🏅'} {pieceId.charAt(0).toUpperCase() + pieceId.slice(1)} Master
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Motivational message */}
        <p className="text-center text-white/40 text-xs mt-6">
          {totalBadges === 0
            ? 'Start by learning the Knight — the most fun piece! 🐴'
            : totalBadges < 3
            ? 'Great start! Keep learning more pieces! 🌟'
            : totalBadges < 6
            ? "You're becoming a real chess player! 🏆"
            : '🎊 All 6 pieces mastered! You\'re amazing!'}
        </p>
      </div>
    </div>
  )
}
