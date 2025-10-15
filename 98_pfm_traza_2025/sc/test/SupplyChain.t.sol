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

    // ========== TESTS DE REGISTRO ==========
    
    /// @notice Test: Un usuario puede registrarse correctamente
    function test_UserCanRegister() public {
        vm.prank(user1);  // Simular que user1 llama la función
        supplyChain.register(SupplyChain.Role.Producer, '{"name":"Farm ABC"}');
        
        (
            address userAddress,
            SupplyChain.Role role,
            SupplyChain.UserStatus status,
            string memory metadata,
            uint256 registeredAt
        ) = supplyChain.users(user1);
        
        assertEq(userAddress, user1, "User address should match");
        assertEq(uint(role), uint(SupplyChain.Role.Producer), "Role should be Producer");
        assertEq(uint(status), uint(SupplyChain.UserStatus.Pending), "Status should be Pending");
        assertEq(metadata, '{"name":"Farm ABC"}', "Metadata should match");
        assertGt(registeredAt, 0, "Should have registration timestamp");
    }
    
    /// @notice Test: No se puede registrar con Role.None
    function test_CannotRegisterWithRoleNone() public {
        vm.prank(user1);
        vm.expectRevert("Cannot register with Role.None");
        supplyChain.register(SupplyChain.Role.None, '{"name":"Test"}');
    }
    
    /// @notice Test: No se puede registrar dos veces
    function test_CannotRegisterTwice() public {
        vm.prank(user1);
        supplyChain.register(SupplyChain.Role.Producer, '{"name":"Farm ABC"}');
        
        vm.prank(user1);
        vm.expectRevert("User already registered");
        supplyChain.register(SupplyChain.Role.Factory, '{"name":"Factory XYZ"}');
    }
    
    /// @notice Test: No se puede registrar sin metadata
    function test_CannotRegisterWithEmptyMetadata() public {
        vm.prank(user1);
        vm.expectRevert("Metadata cannot be empty");
        supplyChain.register(SupplyChain.Role.Producer, "");
    }
    
    /// @notice Test: Admin puede aprobar un usuario
    function test_AdminCanApproveUser() public {
        // user1 se registra
        vm.prank(user1);
        supplyChain.register(SupplyChain.Role.Producer, '{"name":"Farm ABC"}');
        
        // admin aprueba
        supplyChain.approveUser(user1);
        
        (, , SupplyChain.UserStatus status, ,) = supplyChain.users(user1);
        assertEq(uint(status), uint(SupplyChain.UserStatus.Approved), "User should be approved");
    }
    
    /// @notice Test: Admin puede rechazar un usuario
    function test_AdminCanRejectUser() public {
        // user1 se registra
        vm.prank(user1);
        supplyChain.register(SupplyChain.Role.Producer, '{"name":"Farm ABC"}');
        
        // admin rechaza
        supplyChain.rejectUser(user1);
        
        (, , SupplyChain.UserStatus status, ,) = supplyChain.users(user1);
        assertEq(uint(status), uint(SupplyChain.UserStatus.Rejected), "User should be rejected");
    }
    
    /// @notice Test: Solo el admin puede aprobar usuarios
    function test_OnlyAdminCanApproveUsers() public {
        // user1 se registra
        vm.prank(user1);
        supplyChain.register(SupplyChain.Role.Producer, '{"name":"Farm ABC"}');
        
        // user2 intenta aprobar (no es admin)
        vm.prank(user2);
        vm.expectRevert("Only admin can perform this action");
        supplyChain.approveUser(user1);
    }
    
    /// @notice Test: Usuario puede cancelar su propia solicitud
    function test_UserCanCancelRegistration() public {
        // user1 se registra
        vm.prank(user1);
        supplyChain.register(SupplyChain.Role.Producer, '{"name":"Farm ABC"}');
        
        // user1 cancela
        vm.prank(user1);
        supplyChain.cancelRegistration();
        
        (, , SupplyChain.UserStatus status, ,) = supplyChain.users(user1);
        assertEq(uint(status), uint(SupplyChain.UserStatus.Canceled), "User should be canceled");
    }
    
    /// @notice Test: Solo usuarios Pending pueden cancelar
    function test_OnlyPendingUsersCanCancel() public {
        vm.prank(user1);
        vm.expectRevert("Only pending users can cancel");
        supplyChain.cancelRegistration();
    }
    
    /// @notice Test: getUser devuelve la información correcta
    function test_GetUserReturnsCorrectInfo() public {
        vm.prank(user1);
        supplyChain.register(SupplyChain.Role.Producer, '{"name":"Farm ABC"}');
        
        SupplyChain.User memory user = supplyChain.getUser(user1);
        
        assertEq(user.userAddress, user1, "Address should match");
        assertEq(uint(user.role), uint(SupplyChain.Role.Producer), "Role should match");
        assertEq(uint(user.status), uint(SupplyChain.UserStatus.Pending), "Status should match");
    }
    
    /// @notice Test: isApproved devuelve true solo para usuarios aprobados
    function test_IsApprovedWorksCorrectly() public {
        // user1 no registrado
        assertFalse(supplyChain.isApproved(user1), "Unregistered user should not be approved");
        
        // user1 se registra (Pending)
        vm.prank(user1);
        supplyChain.register(SupplyChain.Role.Producer, '{"name":"Farm ABC"}');
        assertFalse(supplyChain.isApproved(user1), "Pending user should not be approved");
        
        // admin aprueba
        supplyChain.approveUser(user1);
        assertTrue(supplyChain.isApproved(user1), "Approved user should be approved");
    }
}