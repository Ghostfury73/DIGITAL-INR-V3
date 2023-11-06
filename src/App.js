import { useState, useEffect } from "react";
import "./App.css";
import logo from "./logo.png";
import { Layout, Button } from "antd";
import CurrentBalance from "./componets/CurrentBalance";
import RequestAndPay from "./componets/RequestAndPay";
import AccountDetails from "./componets/AccountDetails";
import RecentActivity from "./componets/RecentActivity";
import { useConnect, useAccount, useDisconnect } from "wagmi";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import axios from "axios";

const { Header, Content } = Layout;

function App() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { connect } = useConnect({
    connector: new MetaMaskConnector(),
  });

  const [name, setName] = useState("...");
  const [balance, setBalance] = useState("...");
  const [inr, setInr] = useState("...");
  const [history, setHistory] = useState(null);
  const [requests, setRequests] = useState({ "1": [0], "0": [] });
  const [activeMenuOption, setActiveMenuOption] = useState("Summary");


  useEffect(() => {
    const storedWalletConnected = localStorage.getItem("walletConnected");

    if (storedWalletConnected === "true") {
      connect();
    }
  }, []);

  async function fetchUserData() {
    try {
      if (isConnected) {
        const res = await axios.get(`https://puzzled-tick-wig.cyclic.app/getNameAndBalance`, {
          params: { userAddress: address },
        });

        const response = res.data;
        if (response.name[1]) {
          setName(response.name[0]);
        }
        setBalance(String(response.balance));
        setInr(String(response.inr));
        setHistory(response.history);
        setRequests(response.requests);

        // Store the wallet connection status
        localStorage.setItem("walletConnected", "true");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }

  useEffect(() => {
    if (isConnected) {

      //I am using this cuse i am using 2 api's if you want to use only one then its fine if you dont use random function
      const getRandomInterval = () => {
        const randomSeconds = Math.floor(Math.random() * 21) + 40;
        return randomSeconds * 1000;
      };


      fetchUserData();
      const intervalId = setInterval(fetchUserData, getRandomInterval()); // Fetch every 60 seconds
      return () => {
    
        clearInterval(intervalId);
      };
    }
  }, [isConnected, address]);

  return (
    <div className="App">
      
      
      <Layout>
        <Header className="header">
          <div className="headerLeft">
            <img src={logo} alt="logo" className="logo" />
            {isConnected && (
              <>
                <div
                  className={`menuOption ${activeMenuOption === "Summary" ? "active" : ""}`}
                  onClick={() => setActiveMenuOption("Summary")}
                >
                  Summary
                </div>
                <div
                  className={`menuOption ${activeMenuOption === "Activity" ? "active" : ""}`}
                  onClick={() => setActiveMenuOption("Activity")}
                >
                  Activity
                </div>
                <div
                  className={`menuOption ${activeMenuOption === "SendAndRequest" ? "active" : ""}`}
                  onClick={() => setActiveMenuOption("SendAndRequest")}
                >
                  {`Send & Request`}
                </div>
                {/* <div
                  className={`menuOption ${activeMenuOption === "Wallet" ? "active" : ""}`}
                  onClick={() => setActiveMenuOption("Wallet")}
                >
                  Wallet
                </div>
                <div
                  className={`menuOption ${activeMenuOption === "Help" ? "active" : ""}`}
                  onClick={() => setActiveMenuOption("Help")}
                >
                  Help
                </div> */}
              </>
            )}
          </div>
          {isConnected ? (
            <Button type="primary" onClick={disconnect}>
              Disconnect Wallet
            </Button>
          ) : (
            <Button type="primary" onClick={connect}>
              Connect Wallet
            </Button>
          )}
        </Header>
        <Content className="content">
          {isConnected ? (
            <>
              {activeMenuOption === "Summary" && (
                <div className="firstColumn">
                  
                  
                  <AccountDetails
                    address={address}
                    name={name}
                    balance={balance}
                  />
                </div>
              )}

              {activeMenuOption === "Activity" && (
                <div className="secondColumn">
                  <RecentActivity history={history} />
                </div>
              )}

              {activeMenuOption === "SendAndRequest" && (
                <div className="thirdColumn">
                  <CurrentBalance inr={inr} />
                  <RequestAndPay requests={requests} />
                  
                </div>
              )}

            </>
          ) : (
            <div className="loginMessage">Please Login</div>
          )}
        </Content>
      </Layout>
    </div>
  );
}

export default App;
