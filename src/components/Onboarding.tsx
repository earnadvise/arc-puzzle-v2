import { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { Sparkles, Gamepad2, Wallet } from 'lucide-react';

interface OnboardingProps {
  onStart: (username: string) => void;
  initialUsername: string;
}

export default function Onboarding({ onStart, initialUsername }: OnboardingProps) {
  const { isConnected } = useAccount();
  const [username, setUsername] = useState(initialUsername);

  return (
    <div className="onboarding-screen animate-fade" style={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: 'linear-gradient(135deg, #f0f4ff 0%, #e6e9ff 100%)'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 20px 40px rgba(0, 82, 255, 0.1)',
        maxWidth: '450px',
        width: '100%',
        textAlign: 'center'
      }}>
        <div style={{
          background: 'var(--primary)',
          width: '64px',
          height: '64px',
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          color: 'white',
          boxShadow: '0 8px 16px rgba(0, 82, 255, 0.3)'
        }}>
          <Gamepad2 size={32} />
        </div>

        <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '8px' }}>Arc Puzzle</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
          Connect your wallet and set a username to start your adventure on Arc.
        </p>

        <div style={{ marginBottom: '24px', textAlign: 'left' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem' }}>
            1. Connect Wallet
          </label>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <ConnectButton label="Connect Wallet" />
          </div>
        </div>

        <div style={{ marginBottom: '32px', textAlign: 'left' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem' }}>
            2. Choose Username
          </label>
          <input
            type="text"
            placeholder="Enter username..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={!isConnected}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              border: '2px solid var(--border-color)',
              fontSize: '1rem',
              outline: 'none',
              transition: 'border-color 0.2s',
              background: isConnected ? 'white' : '#f5f5f5'
            }}
          />
        </div>

        <button
          onClick={() => onStart(username)}
          disabled={!isConnected || !username.trim()}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            background: (isConnected && username.trim()) ? 'var(--primary)' : '#cbd5e0',
            color: 'white',
            fontWeight: '700',
            fontSize: '1.1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: (isConnected && username.trim()) ? '0 8px 16px rgba(0, 82, 255, 0.2)' : 'none'
          }}
        >
          <Sparkles size={20} />
          Start Game
        </button>

        <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
          <Wallet size={14} />
          <span>Powered by Arc Network</span>
        </div>
      </div>
    </div>
  );
}
