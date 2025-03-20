import { CompB } from "./CompB";

export default function CompA(props) {
  return <div> 
        <p>  {props.b} </p>
        <CompB b={props.b + 100}></CompB>
        </div>;
    
}