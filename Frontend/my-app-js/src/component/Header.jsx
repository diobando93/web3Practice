import { Link } from "react-router-dom";
export function Header() {
    return <div>  
                <ul>
                    <li><Link to="/productos">productos</Link></li>
                    <li><Link to="/clientes">clientes</Link></li>
                    <li><Link to="/lista">lista</Link></li>
                </ul>  
            </div>
}
