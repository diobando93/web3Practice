import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useForm } from 'react-hook-form';
const { ethereum } = window;

export function Balance() {
    const { register, handleSubmit } = useForm();
    const [cuenta, setCuenta] = useState(null);
    const [balance, setBalance] = useState(null);
    const [ok, setOk] = useState(null);
    const [ko, setKo] = useState(null);

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

    async function submit(data){
        setKo(null)
        setOk(null)
        const parameters = {
            from: cuenta,
            to: data.address,
            value: ethers.parseEther(data.amount).toString(16)
        }
        console.log(parameters)
        try {
            const txHash = await ethereum.request({ method: 'eth_sendTransaction', params: [parameters] })
            setOk(txHash)
        } catch (error) {
            setKo(error)
        }
    }

    if (!ethereum) {
        return <div> No se detecta MetaMask </div>
    }

    return (
                <div>
                    <p>
                        Cuenta:
                    {
                        cuenta ? cuenta: "Cargando"      
                    }
                    </p>
                    <p>
                        Balance:
                    {
                        balance ? balance: "Cargando"
                    }
                    </p>
                    <form className= "form-inline" onSubmit={handleSubmit(submit)}>
                        <div className="form-group mb-3">
                            <label htmlFor="address">Address</label>
                            <input defaultValue="0x0cf0A30167070C3e8c3FF6f9d006910df06f78ea" id="address" className="form-control" {...register("address")} />
                        </div>
                        <div className="form-group mb-3">
                            <label htmlFor="amount">Amount</label>
                            <input defaultValue={0.0012} id="amount" className="form-control" {...register("amount")} />
                        </div>
                        <button type = "submit" className="btn btn-primary mb-3">Send</button>
                    </form>
                    {ok && <div className="alert alert-info m-3">{ok}</div>}
                    {ko && <div className="alert alert-danger mt-3">{ko}</div>}
                </div>
        );
}