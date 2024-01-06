import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const accounts = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(accounts);
    }
  }

  const handleAccount = (accounts) => {
    if (accounts.length > 0) {
      console.log("Account connected: ", accounts[0]);
      setAccount(accounts[0]);
    } else {
      console.log("No account found");
    }
  }

  const connectAccount = async () => {
    if (!ethWallet) {
      alert('MetaMask wallet is required to connect');
      return;
    }

    const accounts = await ethWallet.request({ method: 'eth_requestAccounts' });
    handleAccount(accounts);

    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  }

  const getBalance = async () => {
    if (atm) {
      const newBalance = await atm.getBalance();
      setBalance(newBalance.toString());
    }
  }

  const deposit = async () => {
    if (atm) {
      let tx = await atm.deposit(1);
      await tx.wait();
      getBalance();
      getTransactionHistory();
    }
  }

  const withdraw = async () => {
    if (atm) {
      let tx = await atm.withdraw(1);
      await tx.wait();
      getBalance();
      getTransactionHistory();
    }
  }

  const burnTokens = async () => {
    if (atm) {
        let tx = await atm.burn(1); 
        await tx.wait();
        getBalance();
    }
  };

  const getTransactionHistory = async () => {
    if (atm) {
      const history = await atm.getTransactionHistory();
      const formattedHistory = history.map(tx => ({
        from: tx.from.toString(),
        amount: tx.amount.toNumber(),
        timestamp: tx.timestamp.toNumber(),
      }));
      setTransactionHistory(formattedHistory);
    }
  }

  const initUser = () => {
    if (!ethWallet) {
      return <p>Please install Metamask to use this ATM.</p>
    }

    if (!account) {
      return (
        <div>
          <button onClick={connectAccount}>Connect Metamask Wallet</button>
          <hr />
          <h3>Good morning, sir! Have a nice day</h3>
        </div>
      );
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
      <div className="main">
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance}</p>
        <h2>Token deposition section</h2>
        <p><button className="hoverable-button" onClick={deposit}>Deposit 1 ETH</button></p>
        <hr />
        <h2>Token withdrawal section</h2>
        <button className="hoverable-button" onClick={withdraw}>Withdraw 1 ETH</button>
        <br />
        <hr />
        <button className="hoverable-button" onClick={() => burnTokens(1)}>Burn 1</button>
        <br />
        <h2>Transaction History</h2>
        <ul>
          {transactionHistory.map((tx, index) => (
            <li key={index}>
              From: {tx.from}, Amount: {tx.amount}, Timestamp: {tx.timestamp}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  useEffect(() => {
    getWallet();
    const intervalId = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div>
      <div className="clock" style={{ backgroundColor: "black", color: "white", padding: "10px", textAlign: "right" }}>
        {currentTime.toLocaleTimeString()}
      </div>
      <div className="backscreen">
        <div className="divi">
          <main className="container">
            <header>
              <h1 style={{ color: '#000000' }}>
                Hey welcome to my Transaction site
              </h1>
            </header>
            {initUser()}
            <style jsx>{`
              .main {
                height: 100vh;
                width: 100vh;
                background-color: lightblue; /* Change div color to light blue */
              }
              .container {
                background-color: rgba(27, 27, 27, 0.5); /* More transparent black color */
                text-align: center;
                color: #000000; /* Change heading color to black */
                display: inline-block;
                border-radius: 10px;
                padding: 20px;
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
              }
              .backscreen {
                background-color: #000000; /* Black background color */
                position: fixed;
                top: 0;
                right: 0;
                bottom: 0;
                left: 0;
              }
              .hoverable-button {
                background-color: #3498db;
                color: #ffffff;
                padding: 10px 15px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                transition: background-color 0.3s;
              }
              .hoverable-button:hover {
                background-color: #87CEEB;
              }
              .clock {
                position: fixed;
                top: 0;
                right: 0;
              }
            `}</style>
          </main>
        </div>
      </div>
    </div>
  );
}
