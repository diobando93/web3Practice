import {useQuery} from '@tanstack/react-query';
export function Lista(){
    
    const {data, isLoading, isError} = useQuery({
        queryKey: ["query1"],
        queryFn: () => ["juan", "pedro"],
    });
    if(isLoading) return <p>Cargando...</p>
    if(isError) return <p>Error al cargar los datos</p>
    
    return <p>
            <ul>
                 {data.map((item, index) => {
                    return <li key = {index}>{item}</li>
                })} 
            </ul>
    </p>
}