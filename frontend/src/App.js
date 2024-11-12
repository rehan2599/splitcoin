import React, { useState, useEffect } from 'react';
import { Connect } from '@stacks/connect-react';
import { AppConfig, UserSession } from '@stacks/connect';
import { StacksMainnet, StacksTestnet } from '@stacks/transactions';
import Typography from '@mui/material/Typography';

import WalletConnect from './components/WalletConnect';
import ProductList from './components/ProductList';
import './App.css';

function App() {
  const [userSession, setUserSession] = useState(null);
  const [stacksAddress, setStacksAddress] = useState(null);
  const [stackBalance, setStackBalance] = useState(null);

  useEffect(() => {
    const appConfig = new AppConfig(['store_write', 'publish_data']);
    const session = new UserSession({ appConfig });
    setUserSession(session);

    if (session.isUserSignedIn()) {
      getUserInfo(session);
    }
  }, []);

  const getUserInfo = async (session) => {
    if (!session.isUserSignedIn()) return;

    const userData = session.loadUserData();
    console.log("User Data:", userData);

    const address = userData.profile.stxAddress.testnet;
    console.log("Testnet Address:", address);
    
    if (!address) {
      console.error('No Stacks address found');
      return;
    }

    setStacksAddress(address);
    console.log("Stacks Address:", address);

    try {
      console.log("waiting");
      const balance = await getStacksBalance(address);
      console.log("found");
      setStackBalance(balance);
    } catch (error) {
      console.error("Error fetching balance:", error);
      setStackBalance(null);
    }
  };

  const getStacksBalance = async (address) => {
    const url = `/v2/accounts/${address}`;

    const response = await fetch(url);
    const data = await response.json();
    console.log(data);

    if (data && data.balance) {
      return data.balance / 1_000_000;
    } else {
      throw new Error('Unable to fetch balance');
    }
  };

  const handleSignOut = () => {
    if (userSession) {
      userSession.signUserOut();
      setStacksAddress(null);
      setStackBalance(null);
    }
  };

  if (!userSession) {
    return <div>Loading...</div>;
  }

  return (
    <Connect
      authOptions={{
        appDetails: {
          name: 'Splitcoin',
          icon: '/logo192.png',
        },
        redirectTo: '/',
        onFinish: () => getUserInfo(userSession),
        userSession,
      }}
    >
      <div className="App">
        <div className="titlewrapper">
          <img className="logo" src="https://firebasestorage.googleapis.com/v0/b/crlspathfinders-82886.appspot.com/o/other-images%2Fsplitcoinlogo.jpg?alt=media&token=38faf2c3-6fc9-4ae3-8e02-45577d443ab0"></img>
          <img className="logo" src="https://firebasestorage.googleapis.com/v0/b/crlspathfinders-82886.appspot.com/o/other-images%2Fsplitcoinmotto.jpg?alt=media&token=f885cc3f-61f7-45b7-b15c-962a77378a4c"></img>
        </div>
        
        {!userSession.isUserSignedIn() ? (
          <WalletConnect />
        ) : (
          <div className="user-info">

            <div className="balances">
              <Typography variant="h5" component="h5">
                <u>Stacks Address</u>: {stacksAddress}
              </Typography>
              
              {stackBalance !== null ? (
                <Typography variant="h5" component="h5">
                  <u>Balance</u>: {stackBalance} STX
                </Typography>
              ) : (
                <Typography variant="h5" component="h5">
                  Loading balance...
                </Typography>
              )}
            </div>
            
            <button className="allbuttons" onClick={handleSignOut}>Sign Out</button>
            <ProductList userSession={userSession} />
          </div>
        )}
      </div>
    </Connect>
  );
}

export default App;