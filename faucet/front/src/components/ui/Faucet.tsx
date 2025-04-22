import { useContext } from "react";
import { UserContext } from "@/App";
export function Faucet() {
  const { state, setState } = useContext(UserContext);
    return <div>
      Faucet
      {state.acc}
      </div>
  }