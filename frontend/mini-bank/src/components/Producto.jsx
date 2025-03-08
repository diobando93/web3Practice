import { useQuery } from "@tanstack/react-query";
import axios from "axios";

function getProducts() {
  return axios.get("http://localhost:8080/sql?sql=select * from products order by product_name");
}

export function Producto() {
    const { data: productos, isLoading, isError } = useQuery(
        {
            queryKey: ['productos'],
            queryFn: getProducts,
        });
    if (isLoading) return <div>Loading...</div>;
    return (
        <table className="table">
            <thead>
                <tr>
                    <th>Id</th>
                    <th>Nombre</th>
                    <th>Precio</th>
                </tr>
            </thead>
            <tbody>
                {productos.data.map((producto) => (
                    <tr key={producto.product_id}>
                        <td>{producto.product_id}</td>
                        <td>{producto.product_name}</td>
                        <td className="text-endpr">{producto.unit_price}</td>
                    </tr>
                ))}
            </tbody>
        </table>
  );
}