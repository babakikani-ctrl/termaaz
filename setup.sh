#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════
# TERMAAZ - Auto Setup Script
# ═══════════════════════════════════════════════════════════════════════════

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color
BOLD='\033[1m'

echo -e "${CYAN}"
cat << "EOF"
 ████████╗███████╗██████╗ ███╗   ███╗ █████╗  █████╗ ███████╗
 ╚══██╔══╝██╔════╝██╔══██╗████╗ ████║██╔══██╗██╔══██╗╚══███╔╝
    ██║   █████╗  ██████╔╝██╔████╔██║███████║███████║  ███╔╝
    ██║   ██╔══╝  ██╔══██╗██║╚██╔╝██║██╔══██║██╔══██║ ███╔╝
    ██║   ███████╗██║  ██║██║ ╚═╝ ██║██║  ██║██║  ██║███████╗
    ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝
EOF
echo -e "${NC}"
echo -e "${BOLD}P2P Terminal Collaboration Platform${NC}"
echo ""

# Check Node.js
echo -e "${YELLOW}[1/4]${NC} Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "  ${GREEN}✓${NC} Node.js ${NODE_VERSION} found"
else
    echo -e "  ${RED}✗${NC} Node.js not found!"
    echo -e "  Please install Node.js 18+ from: ${CYAN}https://nodejs.org${NC}"
    exit 1
fi

# Check npm
echo -e "${YELLOW}[2/4]${NC} Checking npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo -e "  ${GREEN}✓${NC} npm ${NPM_VERSION} found"
else
    echo -e "  ${RED}✗${NC} npm not found!"
    exit 1
fi

# Install dependencies
echo -e "${YELLOW}[3/4]${NC} Installing dependencies..."
npm install --silent
if [ $? -eq 0 ]; then
    echo -e "  ${GREEN}✓${NC} Dependencies installed"
else
    echo -e "  ${RED}✗${NC} Failed to install dependencies"
    exit 1
fi

# Build project
echo -e "${YELLOW}[4/4]${NC} Building project..."
npm run build --silent 2>/dev/null
if [ $? -eq 0 ]; then
    echo -e "  ${GREEN}✓${NC} Build complete"
else
    echo -e "  ${YELLOW}!${NC} Build skipped (will use dev mode)"
fi

echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  TERMAAZ installed successfully!${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "  ${BOLD}Quick Start:${NC}"
echo ""
echo -e "  ${CYAN}Create a new room:${NC}"
echo -e "    ./termaaz --create"
echo -e "    ${YELLOW}or${NC}"
echo -e "    npm start -- --create"
echo ""
echo -e "  ${CYAN}Join a room:${NC}"
echo -e "    ./termaaz <room-id>"
echo -e "    ${YELLOW}or${NC}"
echo -e "    npm start -- <room-id>"
echo ""
echo -e "  ${CYAN}See all commands:${NC}"
echo -e "    Type ${BOLD}/h${NC} or ${BOLD}/help${NC} inside Termaaz"
echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
