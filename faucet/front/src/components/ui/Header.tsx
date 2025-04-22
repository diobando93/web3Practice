import { Link } from "react-router-dom";
import { Button } from "./button";
import { useContext, useEffect } from "react";
import { UserContext } from "@/App";

export function Header() {
  const { state, setState } = useContext(UserContext);

  useEffect( () => {
    const ethereum = (window as any).ethereum;
    if(ethereum == null) {
      alert("Install metamask");
      return;
    }
    ethereum.request({ method: "eth_requestAccounts" }).then((accounts: string[]) => {
      setState({acc: accounts[0]});
    });
    ethereum.on("accountsChanged", (accounts: string[]) => {
      setState({acc: accounts[0]});
    })

  }, [setState]);

    return <div className="flex gap-2 justify-center pt-4">
      <Link to="/home"><Button>Home</Button></Link>
      <Link to="/faucet"><Button>Faucet</Button></Link>
      <Link to="/balance"><Button>Balance</Button></Link>
      <Link to="/transfer"><Button>Transfer</Button></Link>
      <div className="flex gap-2 justify-center pt-4"> 
        {state.acc ? <p className="text-lg font-bold text-center border-2">Account: {state.acc}</p> : <p className="text-lg font-bold">No account connected</p>}
        </div> 
    </div>
  }