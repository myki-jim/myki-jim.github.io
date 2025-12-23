'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RotateCw,
  Undo,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Trophy,
  Gamepad2,
  Sparkles
} from 'lucide-react';

// 游戏状态类型
type Direction = 'up' | 'down' | 'left' | 'right';

interface TilePosition {
  row: number;
  col: number;
  value: number;
  id: string;
  isNew?: boolean;
  isMerged?: boolean;
  fromRow?: number;
  fromCol?: number;
}

interface GameState {
  grid: number[][];
  score: number;
  gameOver: boolean;
  won: boolean;
}

// 初始化网格
const initializeGrid = (): number[][] => {
  const newGrid = Array(4).fill(null).map(() => Array(4).fill(0));
  return addNewTile(addNewTile(newGrid));
};

// 添加新方块
const addNewTile = (grid: number[][]): number[][] => {
  const emptyCells: { row: number; col: number }[] = [];
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (grid[i][j] === 0) {
        emptyCells.push({ row: i, col: j });
      }
    }
  }

  if (emptyCells.length > 0) {
    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    grid[randomCell.row][randomCell.col] = Math.random() < 0.9 ? 2 : 4;
  }

  return grid;
};

// 向左移动逻辑
const moveLeft = (grid: number[][]): { grid: number[][]; scoreIncrease: number; moved: boolean } => {
  const newGrid = grid.map(row => [...row]);
  let scoreIncrease = 0;
  let moved = false;

  for (let i = 0; i < 4; i++) {
    let row = newGrid[i].filter(val => val !== 0);
    const merged: boolean[] = [];

    for (let j = 0; j < row.length - 1; j++) {
      if (row[j] === row[j + 1] && !merged.includes(j) && !merged.includes(j + 1)) {
        row[j] *= 2;
        scoreIncrease += row[j];
        row.splice(j + 1, 1);
        merged.push(j);
      }
    }

    while (row.length < 4) {
      row.push(0);
    }

    if (JSON.stringify(row) !== JSON.stringify(newGrid[i])) {
      moved = true;
    }

    newGrid[i] = row;
  }

  return { grid: newGrid, scoreIncrease, moved };
};

// 旋转网格
const rotateGrid = (grid: number[][], times: number): number[][] => {
  let newGrid = grid.map(row => [...row]);
  for (let t = 0; t < times; t++) {
    const rotated = Array(4).fill(null).map(() => Array(4).fill(0));
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        rotated[j][3 - i] = newGrid[i][j];
      }
    }
    newGrid = rotated;
  }
  return newGrid;
};

// 检查是否有可用移动
const hasAvailableMoves = (grid: number[][]): boolean => {
  // 检查空单元格
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (grid[i][j] === 0) return true;
    }
  }

  // 检查可能的合并
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const current = grid[i][j];
      if (i < 3 && current === grid[i + 1][j]) return true;
      if (j < 3 && current === grid[i][j + 1]) return true;
    }
  }

  return false;
};

// 获取方块颜色
const getTileColor = (value: number): string => {
  const colors: Record<number, string> = {
    0: 'bg-[var(--glass-surface-hover)]',
    2: 'bg-gradient-to-br from-cyan-400/30 to-blue-400/30 border-cyan-400/50',
    4: 'bg-gradient-to-br from-cyan-400/40 to-blue-400/40 border-cyan-400/60',
    8: 'bg-gradient-to-br from-blue-400/50 to-indigo-400/50 border-blue-400/70',
    16: 'bg-gradient-to-br from-blue-500/50 to-indigo-500/50 border-blue-500/70',
    32: 'bg-gradient-to-br from-indigo-500/60 to-purple-500/60 border-indigo-500/70',
    64: 'bg-gradient-to-br from-indigo-500/70 to-purple-500/70 border-indigo-500/80',
    128: 'bg-gradient-to-br from-purple-500/70 to-pink-500/70 border-purple-500/80',
    256: 'bg-gradient-to-br from-purple-500/80 to-pink-500/80 border-purple-500/90',
    512: 'bg-gradient-to-br from-pink-500/80 to-rose-500/80 border-pink-500/90',
    1024: 'bg-gradient-to-br from-pink-500/90 to-rose-500/90 border-pink-500',
    2048: 'bg-gradient-to-br from-rose-500 to-orange-500 border-rose-500 shadow-lg shadow-rose-500/50',
  };
  return colors[value] || 'bg-gradient-to-br from-orange-500/90 to-red-500/90 border-orange-500';
};

// 获取方块文字颜色
const getTileTextColor = (value: number): string => {
  if (value === 0) return 'text-transparent';
  if (value <= 4) return 'text-[var(--text-primary)]';
  return 'text-white';
};

const Game2048: React.FC = () => {
  const [mounted, setMounted] = useState(false);

  const [grid, setGrid] = useState<number[][]>(initializeGrid);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  // 客户端挂载后加载保存的游戏状态
  useEffect(() => {
    setMounted(true);
    const savedGame = localStorage.getItem('2048-game-state');
    if (savedGame) {
      try {
        const parsedGame = JSON.parse(savedGame);
        setGrid(parsedGame.grid || initializeGrid());
        setScore(parsedGame.score || 0);
        setGameOver(parsedGame.gameOver || false);
        setWon(parsedGame.won || false);
      } catch (e) {
        // 使用初始状态
      }
    }
    setBestScore(parseInt(localStorage.getItem('2048-best-score') || '0', 10));
  }, []);

  const [history, setHistory] = useState<GameState[]>([]);
  const [showContinue, setShowContinue] = useState(false);
  const [animatingTiles, setAnimatingTiles] = useState<Set<string>>(new Set());

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const gameContainerRef = useRef<HTMLDivElement>(null);

  // 保存游戏状态
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const gameState = { grid, score, gameOver, won, timestamp: Date.now() };
      localStorage.setItem('2048-game-state', JSON.stringify(gameState));
    }
  }, [grid, score, gameOver, won]);

  // 移动逻辑
  const move = useCallback((direction: Direction) => {
    if (gameOver || (won && !showContinue)) return;

    let newGrid = grid.map(row => [...row]);
    let scoreIncrease = 0;
    let moved = false;

    switch (direction) {
      case 'left':
        const resultLeft = moveLeft(newGrid);
        newGrid = resultLeft.grid;
        scoreIncrease = resultLeft.scoreIncrease;
        moved = resultLeft.moved;
        break;
      case 'right':
        newGrid = rotateGrid(newGrid, 2);
        const resultRight = moveLeft(newGrid);
        newGrid = rotateGrid(resultRight.grid, 2);
        scoreIncrease = resultRight.scoreIncrease;
        moved = resultRight.moved;
        break;
      case 'up':
        newGrid = rotateGrid(newGrid, 3);
        const resultUp = moveLeft(newGrid);
        newGrid = rotateGrid(resultUp.grid, 1);
        scoreIncrease = resultUp.scoreIncrease;
        moved = resultUp.moved;
        break;
      case 'down':
        newGrid = rotateGrid(newGrid, 1);
        const resultDown = moveLeft(newGrid);
        newGrid = rotateGrid(resultDown.grid, 3);
        scoreIncrease = resultDown.scoreIncrease;
        moved = resultDown.moved;
        break;
    }

    if (moved) {
      // 保存历史状态用于撤销
      setHistory(prev => [...prev.slice(-5), { grid, score, gameOver, won }]);

      const newGridWithTile = addNewTile(newGrid);
      setGrid(newGridWithTile);
      const newScore = score + scoreIncrease;
      setScore(newScore);

      if (newScore > bestScore) {
        setBestScore(newScore);
        if (typeof window !== 'undefined') {
          localStorage.setItem('2048-best-score', newScore.toString());
        }
      }

      // 检查胜利
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          if (newGridWithTile[i][j] === 2048 && !won) {
            setWon(true);
            setShowContinue(true);
          }
        }
      }

      // 检查游戏结束
      if (!hasAvailableMoves(newGridWithTile)) {
        setGameOver(true);
      }
    }
  }, [grid, score, gameOver, won, showContinue, bestScore]);

  // 撤销
  const undo = useCallback(() => {
    if (history.length > 0) {
      const prevState = history[history.length - 1];
      setGrid(prevState.grid);
      setScore(prevState.score);
      setGameOver(prevState.gameOver);
      setWon(prevState.won);
      setHistory(prev => prev.slice(0, -1));
    }
  }, [history]);

  // 新游戏
  const newGame = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('2048-game-state');
    }
    setGrid(initializeGrid());
    setScore(0);
    setGameOver(false);
    setWon(false);
    setShowContinue(false);
    setHistory([]);
  }, []);

  // 继续游戏（胜利后）
  const continueGame = useCallback(() => {
    setShowContinue(false);
    setWon(false);
  }, []);

  // 键盘事件
  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (gameOver || (won && !showContinue)) return;

    switch (e.key.toLowerCase()) {
      case 'arrowleft':
      case 'a':
        e.preventDefault();
        move('left');
        break;
      case 'arrowright':
      case 'd':
        e.preventDefault();
        move('right');
        break;
      case 'arrowup':
      case 'w':
        e.preventDefault();
        move('up');
        break;
      case 'arrowdown':
      case 's':
        e.preventDefault();
        move('down');
        break;
    }
  }, [move, gameOver, won, showContinue]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  // 触摸事件
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;

    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
    };

    const dx = touchEnd.x - touchStartRef.current.x;
    const dy = touchEnd.y - touchStartRef.current.y;

    const minSwipeDistance = 50;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (Math.abs(dx) > minSwipeDistance) {
        move(dx > 0 ? 'right' : 'left');
      }
    } else {
      if (Math.abs(dy) > minSwipeDistance) {
        move(dy > 0 ? 'down' : 'up');
      }
    }

    touchStartRef.current = null;
  }, [move]);

  return (
    <div className="w-full space-y-6">
      {/* 游戏信息栏 */}
      <div className="flex flex-wrap items-center justify-between gap-4 max-w-lg mx-auto">
        <div className="flex gap-3">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="px-5 py-3 rounded-2xl bg-[var(--glass-surface)] border border-[var(--glass-border)] text-center min-w-[90px]"
            style={{ backdropFilter: 'blur(var(--glass-blur))' }}
          >
            <div className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">分数</div>
            <div className="text-xl font-bold text-[var(--accent-color)]" suppressHydrationWarning>{score}</div>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="px-5 py-3 rounded-2xl bg-[var(--glass-surface)] border border-[var(--glass-border)] text-center min-w-[90px]"
            style={{ backdropFilter: 'blur(var(--glass-blur))' }}
          >
            <div className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">最高分</div>
            <div className="text-xl font-bold text-[var(--accent-color)]" suppressHydrationWarning>{bestScore}</div>
          </motion.div>
        </div>

        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={undo}
            disabled={history.length === 0}
            className="p-3 rounded-xl bg-[var(--glass-surface)] border border-[var(--glass-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="撤销"
          >
            <Undo size={18} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={newGame}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[var(--accent-color)] text-black font-bold hover:opacity-90 transition-opacity"
          >
            <RotateCw size={18} />
            新游戏
          </motion.button>
        </div>
      </div>

      {/* 游戏区域 */}
      <div className="relative max-w-lg mx-auto">
        <motion.div
          ref={gameContainerRef}
          className="p-3 rounded-3xl bg-[var(--glass-surface)] border border-[var(--glass-border)]"
          style={{ backdropFilter: 'blur(var(--glass-blur))' }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* 网格 */}
          <div className="grid grid-cols-4 gap-3" style={{ aspectRatio: '1 / 1' }}>
            {grid.map((row, i) =>
              row.map((value, j) => (
                <motion.div
                  key={`${i}-${j}`}
                  initial={value !== 0 ? { scale: 0, opacity: 0 } : false}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 20,
                    duration: 0.1
                  }}
                  style={{ aspectRatio: '1 / 1' }}
                  className={`
                    rounded-xl flex items-center justify-center text-2xl md:text-3xl font-bold
                    border transition-all duration-300
                    ${getTileColor(value)} ${getTileTextColor(value)}
                    ${value !== 0 ? 'shadow-lg' : ''}
                  `}
                >
                  {value !== 0 && (
                    <span className="text-2xl md:text-3xl font-bold">
                      {value}
                    </span>
                  )}
                </motion.div>
              ))
            )}
          </div>

          {/* 游戏结束/胜利覆盖层 */}
          <AnimatePresence>
            {(gameOver || (won && showContinue)) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 rounded-3xl flex items-center justify-center z-10"
                style={{
                  background: 'rgba(0, 0, 0, 0.7)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <motion.div
                  initial={{ scale: 0.8, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.8, y: 20 }}
                  className="text-center p-8"
                >
                  {won ? (
                    <>
                      <motion.div
                        initial={{ rotate: 0 }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.6, ease: 'easeInOut' }}
                        className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center"
                      >
                        <Trophy size={40} className="text-white" />
                      </motion.div>
                      <h3 className="text-3xl font-bold text-white mb-2">恭喜胜利！</h3>
                      <p className="text-[var(--text-secondary)] mb-6">你达到了 2048！</p>
                      <div className="flex gap-3 justify-center">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={continueGame}
                          className="px-6 py-3 rounded-xl bg-[var(--glass-surface)] border border-[var(--glass-border)] text-[var(--text-primary)] font-semibold"
                        >
                          继续游戏
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={newGame}
                          className="px-6 py-3 rounded-xl bg-[var(--accent-color)] text-black font-bold"
                        >
                          新游戏
                        </motion.button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
                        <Gamepad2 size={40} className="text-white" />
                      </div>
                      <h3 className="text-3xl font-bold text-white mb-2">游戏结束</h3>
                      <p className="text-[var(--text-secondary)] mb-2">最终得分</p>
                      <p className="text-4xl font-bold text-[var(--accent-color)] mb-6">{score}</p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={newGame}
                        className="px-6 py-3 rounded-xl bg-[var(--accent-color)] text-black font-bold"
                      >
                        再来一局
                      </motion.button>
                    </>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* 控制按钮（移动端友好） */}
      <div className="flex justify-center">
        <div className="grid grid-cols-3 gap-2 md:hidden">
          <div></div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => move('up')}
            disabled={gameOver || (won && showContinue)}
            className="p-4 rounded-xl bg-[var(--glass-surface)] border border-[var(--glass-border)] text-[var(--text-secondary)] disabled:opacity-50"
          >
            <ArrowUp size={24} />
          </motion.button>
          <div></div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => move('left')}
            disabled={gameOver || (won && showContinue)}
            className="p-4 rounded-xl bg-[var(--glass-surface)] border border-[var(--glass-border)] text-[var(--text-secondary)] disabled:opacity-50"
          >
            <ArrowLeft size={24} />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => move('down')}
            disabled={gameOver || (won && showContinue)}
            className="p-4 rounded-xl bg-[var(--glass-surface)] border border-[var(--glass-border)] text-[var(--text-secondary)] disabled:opacity-50"
          >
            <ArrowDown size={24} />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => move('right')}
            disabled={gameOver || (won && showContinue)}
            className="p-4 rounded-xl bg-[var(--glass-surface)] border border-[var(--glass-border)] text-[var(--text-secondary)] disabled:opacity-50"
          >
            <ArrowRight size={24} />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default Game2048;
