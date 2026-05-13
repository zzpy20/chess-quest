const GUIDE = [
  {
    white: '♔', black: '♚', name: 'King', zh_name: '国王',
    moves: 'Moves 1 square, any direction',
    zh: '就是象棋的将/帅。每次走1格，8个方向都行。最重要的棋子！',
  },
  {
    white: '♕', black: '♛', name: 'Queen', zh_name: '女王',
    moves: 'Any direction, any distance',
    zh: '象棋没有对应棋子。= 车 + 象合体，最强棋子！直线斜线都能走。',
  },
  {
    white: '♖', black: '♜', name: 'Rook', zh_name: '车',
    moves: 'Straight lines only, any distance',
    zh: '就是象棋的车！走法完全一样——上下左右直线走。',
  },
  {
    white: '♗', black: '♝', name: 'Bishop', zh_name: '象',
    moves: 'Diagonal only, any distance',
    zh: '象棋没有完全对应的棋子。只走斜线，无限远，但一辈子只在一种颜色格上。',
  },
  {
    white: '♘', black: '♞', name: 'Knight', zh_name: '马',
    moves: 'L-shape jump, leaps over pieces',
    zh: '就是象棋的马，走日字形。但可以跳过其他棋子——不会被"蹩马腿"！',
  },
  {
    white: '♙', black: '♟', name: 'Pawn', zh_name: '兵',
    moves: 'Forward 1 step; captures diagonally',
    zh: '类似象棋的兵/卒。平时直走，吃子斜走。走到对面最后一行可升变成任何棋子！',
  },
]

export default function PiecesGuide({ onBack }) {
  return (
    <div className="min-h-screen px-6 py-8">
      <div className="max-w-[700px] mx-auto">

        <button onClick={onBack} className="text-white/70 hover:text-white mb-6 flex items-center gap-2 text-base">
          ← Home
        </button>

        <div className="text-center mb-8">
          <div className="text-6xl mb-3">📖</div>
          <h1 className="text-4xl font-black text-white">Pieces Guide</h1>
          <p className="text-white/60 text-base mt-2">Learn to recognise every piece</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {GUIDE.map(p => (
            <div key={p.name} className="bg-white/10 rounded-3xl p-5">
              {/* Symbols + name row */}
              <div className="flex items-center gap-4 mb-4">
                <div className="text-6xl" style={{ color: '#f0d9b5', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.9))' }}>
                  {p.white}
                </div>
                <div className="text-6xl" style={{ color: '#1a1a1a', filter: 'drop-shadow(0 2px 8px rgba(255,255,255,0.4))' }}>
                  {p.black}
                </div>
                <div className="ml-2">
                  <div className="text-white font-black text-2xl">{p.name}</div>
                  <div className="text-white/50 text-base">{p.zh_name}</div>
                </div>
              </div>

              {/* Descriptions */}
              <div className="bg-white/5 rounded-2xl px-4 py-3 space-y-2">
                <p className="text-white/80 text-sm font-semibold">🇬🇧 {p.moves}</p>
                <p className="text-yellow-200/90 text-sm leading-relaxed">👨 {p.zh}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-white/30 text-sm mt-8 pb-6">
          Tip: White pieces are light-coloured ♔ — black pieces are dark ♚
        </p>
      </div>
    </div>
  )
}
