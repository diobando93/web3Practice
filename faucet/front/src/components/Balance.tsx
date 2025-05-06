import { useContext, useEffect, useState } from "react";
import { UserContext  } from "@/App";

export function Balance() {
  const { state, setState } = useContext(UserContext);
  const [ balance, setBalance ] = useState<number>(0);
  
  useEffect(() => {
    const ethereum = (window as any).ethereum;
    if(ethereum == null) {
      alert("Install metamask");
      return;
    }
    ethereum.request({ method: "eth_getBalance", params: [state.acc]})
    .then((balance: string) => {
      setBalance(Number(balance) / 10**18);
    })
  }, [state.acc]);
    return <div>
      <h1>Balance</h1>
      <p>el address {state.acc} tiene balance : {balance} </p>
    </div>
  }