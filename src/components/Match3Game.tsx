import { useState, useEffect } from 'react';
import { useMatch3, TileType, Tile } from '../hooks/useMatch3';
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { LEADERBOARD_ABI, LEADERBOARD_ADDRESS } from '../wagmi';
import { 
  Trophy, RefreshCw, Calendar, Send, Loader2, CheckCircle2, 
  Star, ArrowRight, ArrowLeftRight, ArrowUpDown, Sparkles, Medal, User as UserIcon
} from 'lucide-react';

interface Match3GameProps {
  username: string;
}

export default function Match3Game({ username }: Match3GameProps) {
  const { 
    grid, score, moves, isProcessing, currentLevel, targetScore, 
    isLevelComplete, swapTiles, resetGame, startNextLevel 
  } = useMatch3();
  
  const { address } = useAccount();
  const { writeContractAsync, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  // Read Top Scores
  const { data: topScores, refetch: refetchLeaderboard } = useReadContract({
    address: LEADERBOARD_ADDRESS as `0x${string}`,
    abi: LEADERBOARD_ABI,
    functionName: 'getTopScores',
  });

  const [draggingTile, setDraggingTile] = useState<Tile | null>(null);
  const [localTxStatus, setLocalTxStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (isConfirmed) {
      setLocalTxStatus('success');
      refetchLeaderboard();
    }
  }, [isConfirmed, refetchLeaderboard]);

  // Reset status when game starts/resets
  useEffect(() => {
    if (moves > 0 && !isLevelComplete) {
      setLocalTxStatus('idle');
    }
  }, [moves, isLevelComplete]);

  const handleDragStart = (tile: Tile) => {
    if (isProcessing || moves <= 0 || isLevelComplete) return;
    setDraggingTile(tile);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetTile: Tile) => {
    if (!draggingTile || isProcessing || moves <= 0 || isLevelComplete) return;
    
    const rDiff = Math.abs(draggingTile.row - targetTile.row);
    const cDiff = Math.abs(draggingTile.col - targetTile.col);
    
    if ((rDiff === 1 && cDiff === 0) || (rDiff === 0 && cDiff === 1)) {
      swapTiles(draggingTile.row, draggingTile.col, targetTile.row, targetTile.col);
    }
    
    setDraggingTile(null);
  };

  const handleSubmitScore = async () => {
    if (!address) {
      alert("Please connect your wallet first!");
      return;
    }

    if ((LEADERBOARD_ADDRESS as string) === '0x0000000000000000000000000000000000000000') {
       alert("Please deploy your contract and update LEADERBOARD_ADDRESS in wagmi.ts first!");
       return;
    }
    
    try {
      setLocalTxStatus('pending');
      console.log('Submitting score:', { username, score, address });
      
      const tx = await writeContractAsync({
        address: LEADERBOARD_ADDRESS as `0x${string}`,
        abi: LEADERBOARD_ABI,
        functionName: 'submitScore',
        args: [username, BigInt(score)],
      });
      
      console.log('Transaction submitted:', tx);
    } catch (e: any) {
      console.error('Submission error:', e);
      setLocalTxStatus('error');
      // Extract readable error if possible
      const errorMsg = e.shortMessage || e.message || "Transaction failed";
      alert(`Submission failed: ${errorMsg}`);
    }
  };

  const getTileColor = (type: TileType) => {
    switch (type) {
      case 'blue': return '#0052ff';
      case 'purple': return '#7c3aed';
      case 'green': return '#10b981';
      case 'yellow': return '#f59e0b';
      case 'pink': return '#ec4899';
      case 'red': return '#ef4444';
      default: return '#ccc';
    }
  };

  const progress = Math.min((score / targetScore) * 100, 100);

  return (
    <div className="game-screen animate-fade">
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 350px',
        gap: '40px',
        alignItems: 'start'
      }}>
        {/* Left: Game Board */}
        <div style={{ 
          background: 'var(--card-bg)', 
          padding: '20px', 
          borderRadius: 'var(--radius-lg)', 
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative'
        }}>
          {/* Progress Bar Header */}
          <div style={{ width: '100%', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontWeight: '700', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Level Goal</span>
              <span style={{ color: 'var(--primary)' }}>{score} / {targetScore}</span>
            </div>
            <div style={{ 
              width: '100%', 
              height: '12px', 
              background: '#f1f5f9', 
              borderRadius: '100px',
              overflow: 'hidden',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{ 
                width: `${progress}%`, 
                height: '100%', 
                background: 'linear-gradient(90deg, var(--primary) 0%, #3b82f6 100%)',
                transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 0 10px rgba(0, 82, 255, 0.3)'
              }} />
            </div>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(8, 1fr)', 
            gap: '8px',
            background: '#f1f5f9',
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            width: '100%',
            aspectRatio: '1/1',
            maxWidth: '600px',
            position: 'relative'
          }}>
            {grid.map((row, r) => row.map((tile, c) => (
              <div
                key={tile.id}
                draggable={!isProcessing && moves > 0 && !isLevelComplete}
                onDragStart={() => handleDragStart(tile)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(tile)}
                className={tile.special !== 'none' ? 'special-tile-glow' : ''}
                style={{
                  background: tile.type ? getTileColor(tile.type) : 'transparent',
                  borderRadius: '12px',
                  aspectRatio: '1/1',
                  cursor: (isProcessing || isLevelComplete) ? 'default' : 'grab',
                  transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  transform: tile.isMatching ? 'scale(0)' : 'scale(1)',
                  opacity: tile.isMatching ? 0 : 1,
                  boxShadow: tile.type ? '0 4px 8px rgba(0,0,0,0.1)' : 'none',
                  border: draggingTile?.id === tile.id ? '3px solid white' : (tile.special !== 'none' ? '2px solid rgba(255,255,255,0.8)' : 'none'),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  position: 'relative'
                }}
              >
                {tile.special === 'row-bomb' && <ArrowLeftRight size={20} strokeWidth={3} className="animate-pulse-subtle" />}
                {tile.special === 'col-bomb' && <ArrowUpDown size={20} strokeWidth={3} className="animate-pulse-subtle" />}
                {tile.special === 'rainbow' && <Sparkles size={24} strokeWidth={2.5} className="animate-pulse-subtle" />}
              </div>
            )))}

            {isLevelComplete && (
              <div className="animate-scale-in" style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(4px)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
                textAlign: 'center'
              }}>
                <div style={{ background: 'white', padding: '40px', borderRadius: 'var(--radius-lg)', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', maxWidth: '80%' }}>
                  <div style={{ color: '#f59e0b', marginBottom: '16px' }}>
                    <Star size={64} fill="#f59e0b" className="animate-bounce" />
                  </div>
                  <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '8px' }}>Level Up!</h2>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Reached Level {currentLevel}!</p>
                  <button onClick={startNextLevel} style={{ background: 'var(--primary)', color: 'white', padding: '16px 32px', borderRadius: 'var(--radius-md)', fontWeight: '700', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '12px', width: '100%', justifyContent: 'center' }}>
                    Next Level <ArrowRight size={24} />
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div style={{ marginTop: '24px', display: 'flex', gap: '20px' }}>
             <button onClick={resetGame} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#f1f5f9', color: 'var(--text-main)', borderRadius: 'var(--radius-md)', fontWeight: '600' }}>
               <RefreshCw size={18} /> Restart
             </button>
          </div>
        </div>

        {/* Right: Stats & Leaderboard */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Stats Card */}
          <div style={{ background: 'var(--card-bg)', padding: '24px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', textAlign: 'center' }}>
             <div style={{ background: 'var(--primary)', color: 'white', padding: '8px', borderRadius: 'var(--radius-md)', marginBottom: '16px', fontWeight: '700' }}>LEVEL {currentLevel}</div>
             <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary)' }}>{score}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>SCORE</div>
              </div>
              <div style={{ width: '1px', height: '30px', background: 'var(--border-color)' }}></div>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: '800', color: moves < 5 ? '#ef4444' : 'var(--text-main)' }}>{moves}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>MOVES</div>
              </div>
            </div>
            
            {(moves === 0 || isLevelComplete) && !isProcessing && (
              <div style={{ marginTop: '20px' }}>
                <button 
                  onClick={handleSubmitScore}
                  disabled={localTxStatus === 'pending' || isConfirming}
                  style={{
                    width: '100%', padding: '12px', 
                    background: localTxStatus === 'success' ? '#10b981' : 'var(--primary)', 
                    color: 'white',
                    borderRadius: 'var(--radius-md)', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    transition: 'all 0.3s'
                  }}
                >
                  {(localTxStatus === 'pending' || isConfirming) ? (
                    <Loader2 className="animate-spin" />
                  ) : localTxStatus === 'success' ? (
                    <CheckCircle2 size={18} />
                  ) : (
                    <Medal size={18} />
                  )}
                  {localTxStatus === 'success' ? 'Score Submitted!' : 
                   localTxStatus === 'pending' ? 'Signing...' :
                   isConfirming ? 'Confirming...' : 'Submit to Leaderboard'}
                </button>
                {localTxStatus === 'error' && (
                  <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '8px', textAlign: 'center' }}>
                    Submission failed. Try again.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Leaderboard Card */}
          <div style={{ background: 'var(--card-bg)', padding: '24px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Trophy size={20} color="#f59e0b" />
              On-Chain Leaderboard
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(!topScores || (topScores as any).length === 0) ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>No scores yet. Be the first!</p>
              ) : (
                (topScores as any).map((entry: any, index: number) => (
                  <div key={index} style={{ 
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                    padding: '10px 12px', background: index === 0 ? '#fffbeb' : '#f8fafc',
                    borderRadius: 'var(--radius-sm)', border: index === 0 ? '1px solid #fde68a' : '1px solid transparent'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontWeight: '700', color: index < 3 ? '#f59e0b' : 'var(--text-secondary)', width: '20px' }}>{index + 1}</span>
                      <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{entry.username}</span>
                    </div>
                    <span style={{ fontWeight: '700', color: 'var(--primary)' }}>{entry.score.toString()}</span>
                  </div>
                ))
              )}
            </div>

            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', fontSize: '0.7rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
               Network: <span style={{ fontWeight: '600', color: 'var(--primary)' }}>Arc Testnet</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
