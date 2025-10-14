// SPDX-License-Identifier: glp-3.0
pragma solidity 0.8.30;

contract CodeCrypto {

    int enteroConSigno; //entero con sigo

    uint8 enteroSinSigno8; //entero sin signo de 8 bits
    /*
    tomar en cuenta el gas, por eso hay uint8,..,uint256 
    */
    uint256 constant DECIMALES = 1 * (10 ** 18); // valores queno cambian

    string valor = "hola mundo"; //string
    bool esVerdadero = true; //booleano

    bytes1 byte1; //byte de 1       
    bytes5 byte5; //byte de 5

    address direccion;  //direccion de una wallet

    uint256[] arrayDeUint256; // array de uint256
    uint32[][5] arrayDeArray; // array dinamico y fijo con 5 posciones de uint32

    enum COLORES {ROJO, VERDE, AZUL} //enum 

    mapping ( address => uint256 ) direccionesNumeros; //mapa de direccion a uint256

    struct EstadoToken {
        uint256 cantidadCompradaToken;
        string nombreDelPropietario;
    } // tipo de dato que me lo creo

     // Inicialización inline (válida)
    EstadoToken public varible = EstadoToken({cantidadCompradaToken: 8, nombreDelPropietario: "Israel"});

    mapping (address => EstadoToken) direccionesEstadoToken; //mapa de direccion a EstadoToken

}