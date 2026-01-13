#!/bin/bash

# Vitapharm Clinic - Automated Setup Script
# This script automates the initial setup process

set -e

echo "🏥 Vitapharm Clinic - Automated Setup"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check prerequisites
echo "📋 Checking prerequisites..."

command -v node >/dev/null 2>&1 || { echo -e "${RED}❌ Node.js is required but not installed. Aborting.${NC}" >&2; exit 1; }
command -v npm >/dev/null 2>&1 || { echo -e "${RED}❌ npm is required but not installed. Aborting.${NC}" >&2; exit 1; }
command -v psql >/dev/null 2>&1 || { echo -e "${RED}❌ PostgreSQL is required but not installed. Aborting.${NC}" >&2; exit 1; }

echo -e "${GREEN}✅ All prerequisites found${NC}"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo "📦 Installing frontend dependencies..."
cd frontend
npm install

echo "📦 Installing backend dependencies..."
cd ../backend
npm install
cd ..

echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Setup database
echo "🗄️  Setting up database..."
read -p "Enter PostgreSQL database name [vitapharm_clinic]: " DB_NAME
DB_NAME=${DB_NAME:-vitapharm_clinic}

read -p "Enter PostgreSQL username [postgres]: " DB_USER
DB_USER=${DB_USER:-postgres}

read -sp "Enter PostgreSQL password: " DB_PASSWORD
echo ""

# Create database
echo "Creating database..."
PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -h localhost -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || echo "Database might already exist, continuing..."

echo -e "${GREEN}✅ Database ready${NC}"
echo ""

# Setup environment
echo "⚙️  Setting up environment..."
cd backend

if [ ! -f .env ]; then
    cp .env.example .env || cp .env.template .env
    
    # Update database credentials
    sed -i.bak "s/DB_NAME=.*/DB_NAME=$DB_NAME/" .env
    sed -i.bak "s/DB_USER=.*/DB_USER=$DB_USER/" .env
    sed -i.bak "s/DB_PASSWORD=.*/DB_PASSWORD=$DB_PASSWORD/" .env
    
    # Generate random JWT secret
    JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)
    sed -i.bak "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
    
    rm .env.bak
    
    echo -e "${GREEN}✅ Environment file created${NC}"
else
    echo -e "${YELLOW}⚠️  .env file already exists, skipping${NC}"
fi

echo ""
echo -e "${YELLOW}📧 Email Configuration${NC}"
echo "You need to configure SMTP settings for OTP emails."
read -p "Do you want to configure email now? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "SMTP Host [smtp.gmail.com]: " SMTP_HOST
    SMTP_HOST=${SMTP_HOST:-smtp.gmail.com}
    
    read -p "SMTP Port [587]: " SMTP_PORT
    SMTP_PORT=${SMTP_PORT:-587}
    
    read -p "SMTP User (email): " SMTP_USER
    read -sp "SMTP Password (app password): " SMTP_PASS
    echo ""
    
    sed -i.bak "s/SMTP_HOST=.*/SMTP_HOST=$SMTP_HOST/" .env
    sed -i.bak "s/SMTP_PORT=.*/SMTP_PORT=$SMTP_PORT/" .env
    sed -i.bak "s/SMTP_USER=.*/SMTP_USER=$SMTP_USER/" .env
    sed -i.bak "s/SMTP_PASS=.*/SMTP_PASS=$SMTP_PASS/" .env
    
    rm .env.bak
    
    echo -e "${GREEN}✅ Email configured${NC}"
else
    echo -e "${YELLOW}⚠️  Remember to configure email in backend/.env${NC}"
fi

cd ..
echo ""

# Run migrations
echo "🔄 Running database migrations..."
cd backend
npm run migrate

echo -e "${GREEN}✅ Database initialized${NC}"
cd ..
echo ""

# Summary
echo "======================================"
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo "======================================"
echo ""
echo "Next steps:"
echo "1. Start the application:"
echo "   ${YELLOW}npm run dev${NC}"
echo ""
echo "2. Access the application:"
echo "   Frontend: ${YELLOW}http://localhost:5173${NC}"
echo "   Backend:  ${YELLOW}http://localhost:3000${NC}"
echo ""
echo "3. Default admin login:"
echo "   Email:    ${YELLOW}admin@vitapharm.com${NC}"
echo "   Password: ${YELLOW}admin123${NC}"
echo ""
echo "For more information, see:"
echo "  - README.md for full documentation"
echo "  - SETUP_GUIDE.md for detailed setup"
echo "  - FEATURES.md for feature documentation"
echo ""
echo "Happy coding! 🚀"

