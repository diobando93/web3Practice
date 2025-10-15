// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/SupplyChain.sol";

contract SupplyChainTest is Test {
    
    // ========== VARIABLES ==========
    SupplyChain public supplyChain;
    
    address public admin;
    address public user1;
    address public user2;
    address public user3;
    
    // ========== SETUP ==========
    
    /// @notice Se ejecuta antes de cada test
    function setUp() public {
        // Configurar direcciones de prueba
        admin = address(this);  // El contrato de test es el admin
        user1 = address(0x1);
        user2 = address(0x2);
        user3 = address(0x3);
        
        // Desplegar el contrato
        supplyChain = new SupplyChain();
    }
    
    // ========== TESTS DEL CONSTRUCTOR ==========
    
    /// @notice Test: El admin debe ser quien desplegó el contrato
    function test_AdminIsDeployer() public {
        assertEq(supplyChain.admin(), admin, "Admin should be the deployer");
    }
    
    /// @notice Test: El admin debe estar auto-registrado
    function test_AdminIsRegistered() public {
        (
            address userAddress,
            SupplyChain.Role role,
            SupplyChain.UserStatus status,
            string memory metadata,
            uint256 registeredAt
        ) = supplyChain.users(admin);
        
        assertEq(userAddress, admin, "Admin address should be registered");
        assertEq(uint(role), uint(SupplyChain.Role.None), "Admin should have Role.None");
        assertEq(uint(status), uint(SupplyChain.UserStatus.Approved), "Admin should be approved");
        assertGt(registeredAt, 0, "Admin should have registration timestamp");
    }
    
    /// @notice Test: Los contadores deben iniciar en 0
    function test_CountersStartAtZero() public {
        assertEq(supplyChain.tokenCounter(), 0, "Token counter should start at 0");
        assertEq(supplyChain.transferCounter(), 0, "Transfer counter should start at 0");
    }
    
    /// @notice Test: Usuarios no registrados deben tener status None
    function test_UnregisteredUserHasNoneStatus() public {
        (
            ,
            ,
            SupplyChain.UserStatus status,
            ,
        ) = supplyChain.users(user1);
        
        assertEq(uint(status), uint(SupplyChain.UserStatus.None), "Unregistered user should have None status");
    }
}