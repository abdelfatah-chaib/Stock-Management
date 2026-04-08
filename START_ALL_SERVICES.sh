#!/bin/bash

# Start All Services for Stock Management with External AI Integration
# This script starts: Spring Boot Backend and Angular Frontend

echo ""
echo "========================================"
echo "Stock Management AI System Starter"
echo "========================================"
echo ""

# Check if running from correct directory
if [ ! -d "backend" ]; then
    echo "Error: backend folder not found!"
    echo "Please run this script from the Gestion-de-Stock root directory"
    exit 1
fi

# Get the root directory
ROOT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo ""
echo "Step 1: Starting Spring Boot Backend (Port 8083)..."
echo "========================================"
cd "$ROOT_DIR/backend"

# Use Maven wrapper or maven directly
if [ -f "mvnw" ]; then
    ./mvnw spring-boot:run &
else
    mvn spring-boot:run &
fi

BACKEND_PID=$!
echo "Spring Boot Backend started with PID: $BACKEND_PID"
sleep 3

echo ""
echo "Step 2: Starting Angular Frontend (Port 4200)..."
echo "========================================"
cd "$ROOT_DIR/frontend"

npm start &
FRONTEND_PID=$!
echo "Angular Frontend started with PID: $FRONTEND_PID"
sleep 3

echo ""
echo "========================================"
echo "All services are starting..."
echo "========================================"
echo ""
echo "Waiting for services to initialize (20 seconds)..."
sleep 20

echo ""
echo "========================================"
echo "Services Status Check"
echo "========================================"
echo ""

# Check Spring Boot Backend
echo "Checking Spring Boot Backend (http://localhost:8083/api/ai/health)..."
if curl -s http://localhost:8083/api/ai/health > /dev/null; then
    echo "[OK] Spring Boot Backend is running"
else
    echo "[WAIT] Spring Boot Backend is starting, check http://localhost:8083 manually"
fi

echo ""
echo "========================================"
echo "Service URLs:"
echo "========================================"
echo ""
echo "1. Spring Boot Backend:"
echo "   Main URL: http://localhost:8083"
echo "   API Health: http://localhost:8083/api/ai/health"
echo "   Articles: http://localhost:8083/articles"
echo ""
echo "2. Angular Frontend:"
echo "   Main URL: http://localhost:4200"
echo "   AI Predictions: http://localhost:4200/ai/predictions"
echo ""
echo "========================================"
echo ""
echo "Next Steps:"
echo "1. Open http://localhost:4200 in your browser"
echo "2. Navigate to 'AI Predictions' from the menu"
echo "3. Click 'Analyze' on a single article row"
echo ""
echo "Note: Set GROQ_API_KEY before starting backend to enable AI analysis"
echo ""
echo "Process IDs:"
echo "  Backend: $BACKEND_PID"
echo "  Frontend: $FRONTEND_PID"
echo ""
echo "To stop the services, run:"
echo "  kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "Press Ctrl+C to stop this script"
echo ""

# Wait for all processes
wait
