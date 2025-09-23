// SPDX-License-Identifier: glp-3.0
pragma solidity 0.8.30;

contract Properties {

    address public creator;
    bool public callSuccess;

    constructor() {
        creator = msg.sender;
    }

    // Modifiers
    
    modifier ifTheContractCreator() {
        require(msg.sender == creator, "You are not the creator of the contract");
        _;
    }

    modifier modifierWithParams(uint8 number){
        require(number > 0 && number < 4, "El numero es mayor que 4");
        _;
    }

    function checkCreator(address newCreator) public ifTheContractCreator {

        creator = newCreator;
    }

    function testModifierWithParams(uint8 number) public modifierWithParams(number) ifTheContractCreator {
        callSuccess = true;
    }

    // Events

    event testObject(address wallet, string message);
    event Log(uint256 sum, address wallet);

    function testErrorHandler(uint number) external {
        require(number > 3, "the number should be up 3");
        assert(number > 10);

        string memory finalMessage = "";
        if ( number > 20 && number < 50 ){
            finalMessage = "Number up to 20 and below to 50";
        }else {
            finalMessage = "Number up to 50";
        }

        emit testObject(msg.sender, finalMessage);

    }

    // try-catch only for external calls

    function testTryCatchExternalCall(uint numberA, uint numberB) public {
        try new ExternalContract().sum(numberA, numberB) returns (uint256 sum, address wallet){
            emit Log(sum, wallet);
        }catch {
            emit testObject(msg.sender, "ERROR");
        }
    }

    // In Solidity no uses loops for a large amount of data


}
contract ExternalContract {
    uint256 public result;
    address public user;

    constructor () {
        user = msg.sender;
    }

    function sum(uint256 a, uint256 b) public returns (uint256, address){
        result = a + b;
        user = msg.sender;
        return (result, user);
    }
}