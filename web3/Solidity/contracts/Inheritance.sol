// SPDX-License-Identifier: glp-3.0
pragma solidity 0.8.18;

contract Inheritance {

    uint public publicNumber = 10; // we can access from inside the contract and external
    uint private privateNumber = 20;  // we can access only inside this contract
    uint internal internalNumber = 30; // we can access only from inside and inheritance of the contract

    //functions
    //view in functions --> only for reading
    //with a external modifier in the function we can only called from external contract 
    function returnPublicValueWithOutOperations() public view returns ( uint ) {
        return publicNumber;
    }

    function returnPublicValueWithOperations() public returns ( uint ) {

        publicNumber = 3; //internal acess
        return publicNumber;

    }

    function returnExternalValueWithOperations() external returns (uint){

        privateNumber = 99;
        return privateNumber;

    }

    function callFunctionsExternalModifier() external returns (uint) {

        privateNumber = 99; //as we are inside the contract we can access private variable
        return returnPublicValueWithOutOperations();
        // return returnExternalValueWithOperations this action is prohibited 
        // because the function has a external modifier

    }

    // pure modifier, variables only exits inside the function
    function returnPureValue() public pure returns (uint) {
        uint pureNumber = 99;
        return pureNumber;
    }

    // data type payable, must send tokens
    function sendTokensToTheContractBalance() public payable {
        uint256 balance = address(this).balance;
        balance += msg.value;
    }

    function contractBalance() public view returns (uint256) {
        uint256 balance = address(this).balance;
        return balance;
    }

}

contract callContracts {
    
    Inheritance inheritanceContract = new Inheritance();
    
    function callInheritanceContractVariable() public view returns (uint) {
        return inheritanceContract.publicNumber();
    }

    function callInheritanceContractExternalMethod() public returns (uint) {
        return  inheritanceContract.returnExternalValueWithOperations();
    }
}

contract Child is Inheritance { 

    function testMethod() public returns (uint) {
        internalNumber = 3;
        return internalNumber;
    }

}