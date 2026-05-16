import { useState, useEffect } from 'react';
import { useAccount, useSwitchChain } from 'wagmi';
import { arcTestnet } from './wagmi';
import Onboarding from './components/Onboarding';
import Match3Game from './components/Match3Game';
import Navbar from './components/Navbar';

function App() {
  const { isConnected, chain } = useAccount();
  const { switchChain } = useSwitchChain();
  const [username, setUsername] = useState<string>(() => localStorage.getItem('arc_username') || '');
  const [isStarted, setIsStarted] = useState(false);

  // Check network enforcement for Arc Testnet
  const isCorrectNetwork = chain?.id === arcTestnet.id;

  useEffect(() => {
    if (username) {
      localStorage.setItem('arc_username', username);
    }
  }, [username]);

  const handleStart = (name: string) => {
    setUsername(name);
    setIsStarted(true);
  };

  if (!isConnected || !isStarted || !username) {
    return (
      <div className="app-container">
        <Onboarding onStart={handleStart} initialUsername={username} />
      </div>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <div className="network-warning animate-fade" style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        textAlign: 'center',
        background: 'var(--bg-color)'
      }}>
        <div style={{
          background: 'var(--card-bg)',
          padding: '40px',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)',
          maxWidth: '500px'
        }}>
          <h2 style={{ marginBottom: '15px' }}>Wrong Network</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>
            You are currently on {chain?.name || 'an unsupported network'}. 
            Please switch to <strong>Arc Testnet</strong> to continue.
          </p>
          <button 
            onClick={() => switchChain({ chainId: arcTestnet.id })}
            style={{
              background: 'var(--primary)',
              color: 'white',
              padding: '12px 24px',
              borderRadius: 'var(--radius-md)',
              fontWeight: '600',
              fontSize: '1rem'
            }}
          >
            Switch to Arc Testnet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Navbar username={username} />
      <main style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <Match3Game username={username} />
      </main>
    </div>
  );
}

export default App;
