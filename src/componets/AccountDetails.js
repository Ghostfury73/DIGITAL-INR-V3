import React, { useState, useEffect } from "react";
import { Card, Input, Button } from "antd";
import { UserOutlined } from "@ant-design/icons";
import matic from "../matic.png";
import { ethers } from "ethers";
import abi from "../abi.json"; 

function AccountDetails({ address, name, balance }) {
  const [username, setUsername] = useState(""); // State variable for username
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [provider, setProvider] = useState(null);

  const contractAddress = "0x1a8ADF45C6fD606203F6EE640e0f748E7cdF85A1"; // Your contract address

  useEffect(() => {
    if (window.ethereum) {
      const ethProvider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(ethProvider);
    }
  }, []);

  // Fetch and set the username from the contract when the component mounts
  useEffect(() => {
    if (provider) {
      const contract = new ethers.Contract(contractAddress, abi, provider);

      contract.getMyName().then((result) => {
        const userHasName = result.hasName;
        if (userHasName) {
          setUsername(result.name);
        }
      });
    }
  }, [contractAddress, provider]);

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handleSetUsername = async () => {
    if (!provider) {
      alert("Please connect to a Web3 provider like MetaMask");
      return;
    }

    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);

    try {
      const tx = await contract.addName(username);
      await tx.wait();
      alert("Username set: " + username + " Updating username takes a few seconds to reflect");
      setIsEditingUsername(false);
    } catch (error) {
      console.error("Error setting username:", error);
      alert("Error setting username");
    }
  };

  return (
    <Card title="Account Details " style={{ width: "100%" }}className="eth-card">
      <div className="accountDetailRow ">
        <UserOutlined style={{ color: "#211920", fontSize: "25px" }} />
        <div>
          <div className="accountDetailHead">{name}</div>
          <div className="accountDetailBody ">
            Address: {address.slice(0, 4)}...{address.slice(38)}
          </div>
        </div>
      </div>
      <div className="accountDetailRow">
        <img src={matic} alt="maticLogo" width={25} />
        <div>
          <div className="accountDetailHead">Native Matic Tokens</div>
          <div className="accountDetailBody">{balance} Matic</div>
        </div>
      </div>
      <div className="balanceOptions">
        {isEditingUsername ? (
          <div>
            <Input
              value={username}
              onChange={handleUsernameChange}
              placeholder="Enter your username"
            />
            <Button type="primary" onClick={handleSetUsername}>
              Set Username
            </Button>
            <Button onClick={() => setIsEditingUsername(false)}>Cancel</Button>
          </div>
        ) : (
          <div className="extraOption"  style={{color:"black"}} onClick={() => setIsEditingUsername(true)}>
            Edit Username
          </div>
        )}
        <div className="extraOption" style={{color:"black"}}>Switch Accounts</div>
      </div>
    </Card>
  );
}

export default AccountDetails;
