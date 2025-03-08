import { useEffect, useState } from "react";
import { ethers } from "ethers";
const { ethereum } = window;

export function Balance() {
    const [cuenta, setCuenta] = useState(null);
    const [balance, setBalance] = useState(null);

    useEffect(() => {
        ethereum && ethereum.request({ method: 'eth_requestAccounts' }).then(cuenta => {
            setCuenta(cuenta[0])
            ethereum.on('accountChanged', (i) => {
                setCuenta(i[0])    
            })
        })
    }, []);

    useEffect(() => {
            if(cuenta){
                const provider = new ethers.BrowserProvider(ethereum)
                provider.getBalance(cuenta).then(balance => {
                    console.log(ethers.formatEther(balance))
                    setBalance(ethers.formatEther(balance))    
            })
        }
    }, [cuenta]);

    if (!ethereum) {
        return 
            <h2>
                No se detecta MetaMask
            </h2>
    }
    return (
                <div>
                    <p>
                    {
                        cuenta ? cuenta: "Cargando"
                        
                    }
                    </p>
                    {
                        balance ? balance: "Cargando"
                    }
                        
                    <p>


                    </p>
                    
                </div>
        );
}