#!/bin/bash

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║         Deteniendo Supply Chain Tracker...                ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# Parar contenedores
echo -e "${YELLOW}[1/2]${NC} Deteniendo contenedores..."
docker-compose down > /dev/null 2>&1
echo -e "${GREEN}✓ Contenedores detenidos${NC}"
echo ""

# Mensaje final
echo -e "${YELLOW}[2/2]${NC} Limpieza completada"
echo -e "${GREEN}✓ Todos los servicios detenidos${NC}"
echo ""
echo -e "${YELLOW}💡 Para reiniciar, ejecuta: ${GREEN}./start.sh${NC}"
echo ""