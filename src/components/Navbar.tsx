import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Gamepad2, User as UserIcon } from 'lucide-react';

interface NavbarProps {
  username: string;
}

export default function Navbar({ username }: NavbarProps) {
  return (
    <nav style={{
      padding: '16px 24px',
      background: 'white',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          background: 'var(--primary)',
          color: 'white',
          padding: '8px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Gamepad2 size={24} />
        </div>
        <span style={{ fontWeight: '700', fontSize: '1.2rem', letterSpacing: '-0.02em' }}>Arc Puzzle</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          padding: '6px 12px',
          background: '#f0f4ff',
          borderRadius: '100px',
          color: 'var(--primary)',
          fontWeight: '600',
          fontSize: '0.9rem'
        }}>
          <UserIcon size={16} />
          <span>{username}</span>
        </div>
        <ConnectButton showBalance={false} chainStatus="icon" accountStatus="avatar" />
      </div>
    </nav>
  );
}
