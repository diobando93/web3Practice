# ⚡ Quick Start - Supply Chain Tracker

Guía de inicio rápido en 5 minutos.

---

## 🚀 Inicio Rápido (Automático)

### Paso 1: Ejecutar el script de inicio
```bash
./start.sh
```

Este script automáticamente:
- ✅ Verifica Docker
- ✅ Levanta Anvil (blockchain local)
- ✅ Despliega el smart contract
- ✅ Configura el frontend
- ✅ Instala dependencias (si es necesario)

**Tiempo estimado:** 1-2 minutos

---

### Paso 2: Configurar MetaMask

1. **Agregar red Anvil Local:**
   - Click en selector de red → "Add Network" → "Add manually"
   - Network name: `Anvil Local`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `31337`
   - Currency: `ETH`
   - Click "Save"

2. **Importar cuenta de prueba:**
   - Click en icono de perfil → "Import Account"
   - Pegar private key: 
```
     0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```
   - Esta cuenta es el **Admin** con 10,000 ETH

**Tiempo estimado:** 2 minutos

---

### Paso 3: Iniciar el frontend
```bash
cd web
npm run dev
```

**Abrir:** [http://localhost:3000](http://localhost:3000)

**Tiempo estimado:** 1 minuto

---

## ✅ ¡Listo para usar!

Deberías ver la aplicación funcionando. 

### Primera vez usando la app:

1. **Conectar wallet** (botón arriba a la derecha)
2. Como eres **Admin**, verás "Welcome Back!"
3. **Explorar el dashboard**

### Para probar el flujo completo:

1. **Importa otra cuenta** en MetaMask:
```
   Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
   Dirección: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
```

2. **Regístrate como Producer**:
   - Cambia a la nueva cuenta en MetaMask
   - Ir a `/register`
   - Rol: Producer
   - Metadata: `{"name":"Farm ABC","location":"Valencia"}`
   - Register

3. **Aprueba el usuario** (como Admin):
   - Cambia a cuenta Admin
   - Ir a `/admin/users`
   - Click "Approve"

4. **Crea un token** (como Producer):
   - Cambia a cuenta Producer
   - Ir a `/tokens/create`
   - Name: `Organic Wheat`
   - Amount: `1000`
   - Metadata: `{"type":"grain","origin":"Valencia"}`

**¡Ya tienes tu primer token en el supply chain!** 🎉

---

## 🛑 Detener todo
```bash
./stop.sh
```

Esto detendrá:
- ✅ Anvil (blockchain)
- ✅ Contenedores de Docker

**Nota:** Anvil es una blockchain en memoria. Al detenerla, perderás:
- ❌ Contratos desplegados
- ❌ Usuarios registrados
- ❌ Tokens creados
- ❌ Transacciones

---

## 🔄 Reiniciar después de apagar

1. Ejecutar de nuevo:
```bash
   ./start.sh
   cd web && npm run dev
```

2. **Importante:** La dirección del contrato habrá cambiado. El script `start.sh` actualiza automáticamente la configuración.

3. En MetaMask, puede que necesites:
   - Cambiar de red y volver
   - O refrescar la conexión

---

## 📚 Más información

- **README.md** - Documentación completa
- **DEPLOY.md** - Guía de despliegue en testnet
- **IA.md** - Retrospectiva del uso de IA

---

## 🐛 Problemas comunes

### "Docker is not running"
**Solución:** Inicia Docker Desktop primero.

### "Anvil no responde"
**Solución:**
```bash
./stop.sh
./start.sh
```

### MetaMask no conecta
**Solución:** Usa `127.0.0.1` en lugar de `localhost`

### Frontend muestra errores
**Solución:**
```bash
cd web
rm -rf node_modules .next
npm install
npm run dev
```

---

## 💡 Tips

- **Usa Hard Refresh** (Ctrl+Shift+R) si la página no actualiza
- **Revisa la consola del navegador** (F12) para ver errores
- **Cada vez que reinicies** tendrás que registrar usuarios de nuevo
- **Guarda las private keys** en un lugar seguro (solo para desarrollo)

---

## 🎬 Video Demo

[Ver demostración completa en YouTube](https://www.youtube.com/watch?v=4TbbK-3A30w)



## 📁 **Estructura final:**
```
supply-chain-tracker/
├── start.sh           ✅ Script de inicio automático
├── stop.sh            ✅ Script de parada
├── QUICKSTART.md      ✅ Instrucciones rápidas
├── README.md          ✅ Documentación completa
├── IA.md              ✅ Retrospectiva de IA
├── DEPLOY.md          ✅ Guía de despliegue
├── docker-compose.yml
├── sc/
└── web/