
import { Card } from "antd";

function CurrentBalance({ inr }) {
 
  return (
    <Card title="Current Balance" style={{ width: "100%" }} className="card">
      <div className="currentBalance">
        <div style={{ lineHeight: "70px" , fontWeight: "bold"}}>₹ {inr}</div>
        <div style={{ fontSize: "20px", fontWeight: "bold" }}>Available</div>
      </div>
   
    </Card>

    
  );
}

export default CurrentBalance;
