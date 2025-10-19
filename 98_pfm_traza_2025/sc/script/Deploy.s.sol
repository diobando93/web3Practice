pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/SupplyChain.sol";

contract DeploySupplyChain is Script {
    
    function run() external returns (SupplyChain) {
        // Obtener la private key del deployer desde variables de entorno
        // o usar la cuenta por defecto de Anvil
        uint256 deployerPrivateKey = vm.envOr("PRIVATE_KEY", uint256(0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80));
        
        // Empezar broadcast (todas las transacciones después de esto se enviarán a la red)
        vm.startBroadcast(deployerPrivateKey);
        
        // Desplegar el contrato
        SupplyChain supplyChain = new SupplyChain();
        
        // Log de información
        console.log("SupplyChain deployed at:", address(supplyChain));
        console.log("Admin address:", supplyChain.admin());
        
        // Detener broadcast
        vm.stopBroadcast();
        
        return supplyChain;
    }
}