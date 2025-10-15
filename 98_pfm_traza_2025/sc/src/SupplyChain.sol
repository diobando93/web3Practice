// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SupplyChain {
    
    // ========== ENUMS ==========
    
    /// @notice Roles disponibles en el sistema
    enum Role {
        None,       // 0 - Sin rol asignado
        Producer,   // 1 - Productor de materias primas
        Factory,    // 2 - Fábrica que transforma materias primas
        Retailer,   // 3 - Minorista que vende productos
        Consumer    // 4 - Consumidor final
    }
    
    /// @notice Estados posibles de un usuario
    enum UserStatus {
        None,       // 0 - No registrado
        Pending,    // 1 - Esperando aprobación
        Approved,   // 2 - Aprobado por admin
        Rejected,   // 3 - Rechazado por admin
        Canceled    // 4 - Usuario canceló su solicitud
    }
    
    /// @notice Estados de una transferencia
    enum TransferStatus {
        Pending,    // 0 - Esperando aceptación del receptor
        Accepted,   // 1 - Aceptada por el receptor
        Rejected    // 2 - Rechazada por el receptor
    }
    
    // ========== STRUCTS ==========
    struct User {
        address userAddress;
        Role role;
        UserStatus status;
        string metadata;
        uint256 registeredAt;
    }
    
    struct Token {
        uint256 id;
        string name;
        string metadata;
        address creator;
        uint256 parentId;
        uint256 createdAt;
        bool exists;
    }
    
    struct Transfer {
        uint256 id;
        uint256 tokenId;
        address from;
        address to;
        uint256 amount;
        TransferStatus status;
        uint256 createdAt;
        uint256 resolvedAt;
    }
     // ========== STATE VARIABLES ==========
    address public admin;
    uint256 public tokenCounter;
    uint256 public transferCounter;
    
    mapping(address => User) public users;
    mapping(uint256 => Token) public tokens;
    mapping(uint256 => Transfer) public transfers;
    mapping(address => mapping(uint256 => uint256)) public balances;
    mapping(address => uint256[]) public userTokens;
    mapping(address => uint256[]) public pendingTransfers;
    
    // ========== EVENTS ==========
    event UserRegistered(address indexed user, Role role, uint256 timestamp);
    event UserStatusChanged(address indexed user, UserStatus status, uint256 timestamp);
    event TokenCreated(uint256 indexed tokenId, address indexed creator, string name, uint256 parentId);
    event TransferInitiated(uint256 indexed transferId, uint256 indexed tokenId, address from, address to, uint256 amount);
    event TransferAccepted(uint256 indexed transferId, uint256 timestamp);
    event TransferRejected(uint256 indexed transferId, uint256 timestamp);
    
    // ========== CONSTRUCTOR ==========
    constructor() {
        admin = msg.sender;
        
        users[admin] = User({
            userAddress: admin,
            role: Role.None,
            status: UserStatus.Approved,
            metadata: "System Administrator",
            registeredAt: block.timestamp
        });
        
        emit UserRegistered(admin, Role.None, block.timestamp);
    }
    
    // ========== AQUÍ IRÁN LAS FUNCIONES ==========
    // (Las agregaremos en los siguientes pasos)
    
} 
