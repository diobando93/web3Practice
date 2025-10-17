// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SupplyChain {
    
    // ========== ENUMS ==========
    
    /// @notice Roles disponibles en el sistema
    enum Role {
        None,       // 0 - Sin rol asignado
        Admin,      // 1 - Administrador del sistema
        Producer,   // 2 - Productor de materias primas
        Factory,    // 3 - Fábrica que transforma materias primas
        Retailer,   // 4 - Minorista que vende productos
        Consumer    // 5 - Consumidor final
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
        
        // El admin se auto-registra como aprobado con rol Admin
        users[admin] = User({
            userAddress: admin,
            role: Role.Admin,  // ✅ Ahora tiene rol Admin explícito
            status: UserStatus.Approved,
            metadata: "System Administrator",
            registeredAt: block.timestamp
        });
        
        emit UserRegistered(admin, Role.Admin, block.timestamp);
    }
    
     // ========== MODIFIERS ==========
    
    /// @notice Solo el administrador puede ejecutar
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }
    
    /// @notice Solo usuarios aprobados pueden ejecutar
    modifier onlyApproved() {
        require(
            users[msg.sender].status == UserStatus.Approved,
            "User must be approved"
        );
        _;
    }
    
    /// @notice Solo usuarios con un rol específico pueden ejecutar
    modifier onlyRole(Role _role) {
        require(
            users[msg.sender].role == _role && users[msg.sender].status == UserStatus.Approved,
            "User must have the required role and be approved"
        );
        _;
    }
    
    // ========== USER MANAGEMENT FUNCTIONS ==========
    
    /// @notice Registrar un nuevo usuario con un rol específico
    /// @param _role El rol que solicita el usuario
    /// @param _metadata JSON con información adicional del usuario
    function register(Role _role, string memory _metadata) external {
        require(_role != Role.None, "Cannot register with Role.None");
        require(_role != Role.Admin, "Cannot register as Admin");  // ✅ NUEVO
        require(users[msg.sender].status == UserStatus.None, "User already registered");
        require(bytes(_metadata).length > 0, "Metadata cannot be empty");
        
        users[msg.sender] = User({
            userAddress: msg.sender,
            role: _role,
            status: UserStatus.Pending,
            metadata: _metadata,
            registeredAt: block.timestamp
        });
        
        emit UserRegistered(msg.sender, _role, block.timestamp);
    }
    /// @notice El admin aprueba un usuario registrado
    /// @param _user Dirección del usuario a aprobar
    function approveUser(address _user) external onlyAdmin {
        require(users[_user].status == UserStatus.Pending, "User must be in Pending status");
        
        users[_user].status = UserStatus.Approved;
        
        emit UserStatusChanged(_user, UserStatus.Approved, block.timestamp);
    }
    
    /// @notice El admin rechaza un usuario registrado
    /// @param _user Dirección del usuario a rechazar
    function rejectUser(address _user) external onlyAdmin {
        require(users[_user].status == UserStatus.Pending, "User must be in Pending status");
        
        users[_user].status = UserStatus.Rejected;
        
        emit UserStatusChanged(_user, UserStatus.Rejected, block.timestamp);
    }
    
    /// @notice Un usuario cancela su propia solicitud
    function cancelRegistration() external {
        require(users[msg.sender].status == UserStatus.Pending, "Only pending users can cancel");
        
        users[msg.sender].status = UserStatus.Canceled;
        
        emit UserStatusChanged(msg.sender, UserStatus.Canceled, block.timestamp);
    }
    
    // ========== VIEW FUNCTIONS ==========
    
    /// @notice Obtener información de un usuario
    /// @param _user Dirección del usuario
    /// @return User struct con toda la información
    function getUser(address _user) external view returns (User memory) {
        return users[_user];
    }
    
    /// @notice Verificar si un usuario está aprobado
    /// @param _user Dirección del usuario
    /// @return true si está aprobado
    function isApproved(address _user) external view returns (bool) {
        return users[_user].status == UserStatus.Approved;
    }
    
} 
