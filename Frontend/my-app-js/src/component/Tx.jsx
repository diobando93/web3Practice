import {useMutation} from '@tanstack/react-query';

export function Tx(){

    const mutation = useMutation ({
        mutationKey: ["mutation1"],
        mutationFn: () => {
            console.log("Ejecutando la mutación")
            console.log(JSON.stringify(mutation))
        }
        });  

    return <div>
                <button onClick = {() => mutation.mutate()}>
                    Ejecutar mutación
                </button>        
            </div>
}