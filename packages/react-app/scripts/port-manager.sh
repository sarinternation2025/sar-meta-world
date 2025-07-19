#!/usr/bin/env bash

echo "🔧 SAR Meta World - Port Manager"
echo "================================="

# Define the ports used by the application
# Format: "port:service_name"
PORT_DEFINITIONS=(
    "3000:Grafana/Frontend"
    "3001:Backend API"
    "5173:Vite Dev Server (old)"
    "8080:Static Server/Dev Dashboard"
    "9000:3D Dashboard (Vite)"
    "9090:Prometheus"
    "9999:WebSocket Server"
)

# Function to get service name for a port
get_service_name() {
    local port=$1
    for definition in "${PORT_DEFINITIONS[@]}"; do
        if [[ "$definition" =~ ^$port: ]]; then
            echo "${definition#*:}"
            return
        fi
    done
    echo "Unknown"
}

# Function to get all ports
get_all_ports() {
    for definition in "${PORT_DEFINITIONS[@]}"; do
        echo "${definition%%:*}"
    done | sort -n
}

# Function to check if a port is in use
check_port() {
  local port=$1
  if lsof -ti:$port >/dev/null 2>&1; then
    return 0  # Port is in use
  else
    return 1  # Port is free
  fi
}

# Function to kill processes on a port
kill_port() {
  local port=$1
  local service_name=$(get_service_name $port)
  
  if check_port $port; then
    echo "🔄 Killing processes on port $port ($service_name)..."
    local pids=$(lsof -ti:$port)
    if [ -n "$pids" ]; then
      echo "$pids" | xargs kill -9 2>/dev/null
      sleep 1
      if check_port $port; then
        echo "⚠️  Warning: Port $port may still be in use"
      else
        echo "✅ Port $port is now free"
      fi
    fi
  else
    echo "✅ Port $port is already free"
  fi
}

# Function to show port status
show_status() {
  echo ""
  echo "📊 Current Port Status:"
  echo "-----------------------"
  
  for port in $(get_all_ports); do
    local service_name=$(get_service_name $port)
    if check_port $port; then
      local pid=$(lsof -ti:$port | head -1)
      local process_name=$(ps -p $pid -o comm= 2>/dev/null || echo "unknown")
      echo "🔴 Port $port: IN USE by $process_name (PID: $pid) - $service_name"
    else
      echo "🟢 Port $port: FREE - $service_name"
    fi
  done
}

# Function to clean all development ports
clean_all() {
  echo ""
  echo "🧩 Cleaning all development ports..."
  echo "====================================="
  
  for port in $(get_all_ports); do
    kill_port $port
  done
  
  echo ""
  echo "✨ Port cleanup complete!"
}

# Function to start development servers on correct ports
start_dev_servers() {
  echo ""
  echo "🚀 Starting development servers..."
  echo "=================================="
  
  # Ensure ports are free first
  kill_port 9000  # 3D Dashboard
  kill_port 3001  # Backend API
  kill_port 8080  # Static server
  
  echo ""
  echo "✅ Ports prepared for development servers"
  echo "📍 Access points:"
  echo "   • 3D Dashboard: http://localhost:9000"
  echo "   • Backend API: http://localhost:3001"
  echo "   • Dev Dashboard: http://localhost:8080"
}

# Main command handling
case ${1:-status} in
  "status"|"s")
    show_status
    ;;
  "clean"|"c")
    clean_all
    show_status
    ;;
  "kill"|"k")
    if [ -z "$2" ]; then
      echo "❌ Usage: $0 kill <port>"
      echo "💡 Example: $0 kill 9000"
      exit 1
    fi
    kill_port $2
    ;;
  "start"|"dev")
    start_dev_servers
    ;;
  "help"|"h"|*)
    echo ""
    echo "📚 SAR Meta World Port Manager Usage:"
    echo "======================================"
    echo ""
    echo "Commands:"
    echo "  status (s)     Show current port status"
    echo "  clean (c)      Clean all development ports"
    echo "  kill <port>    Kill processes on specific port"
    echo "  start (dev)    Prepare ports for development"
    echo "  help (h)       Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 status      # Show port status"
    echo "  $0 clean       # Clean all ports"
    echo "  $0 kill 9000   # Kill process on port 9000"
    echo "  $0 start       # Prepare for development"
    echo ""
    ;;
esac
