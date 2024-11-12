import { useConnect } from '@stacks/connect-react';

function WalletConnect() {
  const { doOpenAuth } = useConnect();

  return (
    <button className="allbuttons" onClick={() => doOpenAuth()}>
      Connect Wallet
    </button>
  );
}

export default WalletConnect;