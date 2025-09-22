// SPDX-License-Identifier: glp-3.0
pragma solidity 0.8.30;

contract Constructors{

    uint public publicNumber = 10;
    uint internal internalNumber = 20; 
    uint private privateNumber = 30; 

    address public publicAddress;
    bool public enter = false;


/*  Example of constructor to initialize variables before the deploy

    constructor(bool boolInsideConstructor, uint numberTest){
        publicAddress = msg.sender;
        enter = boolInsideConstructor;
        publicNumber = numberTest; 
    }
*/
    // there are some objects that have a global values for example msg 
    // variables in differents contexts

    // message context

    function returnBinaryValueFromPayload() public pure returns ( bytes memory) {
        return msg.data;
    }

    function balanceInContract() public payable {
        uint256 balance = address(this).balance;
        balance += msg.value;
    }

    function returnBinaryValueFromPayload(uint numero) public pure returns ( bytes memory ){
        return msg.data;
    }

    // transaction context 
    function returnTxGasPriceView( uint number ) public view returns ( uint256 ){
        return tx.gasprice;
    }

    function returnTxOrigin() public view returns ( address ) {
        return tx.origin;
    }
    // blocks context
    function returnBlockNumber() public view returns ( uint ) {
        return block.number;
    }
    function returnMiner() public view returns ( address payable ) {
        return block.coinbase;
    }
    function returnChainIdGasLimitTimeStamp() public view returns (uint, uint, uint) {
        return (block.chainid, block.gaslimit, block.timestamp);
    }

    // address context
    function sendCryptoToWallet(address payable destinataryDirection) public payable {
        destinataryDirection.transfer(msg.value);

    }

    // we can call a contract with the id and the abi code




}