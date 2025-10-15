#!/bin/bash

# Kill all Next.js dev server processes
echo "Checking for Next.js processes..."

# Find and kill processes (try graceful first, then force)
pkill -f "next-server" 2>/dev/null
pkill -f "turbopack" 2>/dev/null
pkill -f "node.*next dev" 2>/dev/null
pkill -f "sh -c next dev" 2>/dev/null

sleep 1

# Force kill if still running
pkill -9 -f "next-server" 2>/dev/null
pkill -9 -f "turbopack" 2>/dev/null
pkill -9 -f "node.*next dev" 2>/dev/null
pkill -9 -f "sh -c next dev" 2>/dev/null

# Wait for ports to be released
sleep 2

# Check if ports are free
echo "Checking ports..."
if ss -tulpn 2>/dev/null | grep -E ":(3000|3001|8976|8977)" > /dev/null; then
  echo "Warning: Some ports are still in use:"
  ss -tulpn 2>/dev/null | grep -E ":(3000|3001|8976|8977)"

  # Try to kill processes using those ports directly
  echo "Attempting to free ports..."
  for port in 3000 3001 8976 8977; do
    pid=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$pid" ]; then
      echo "Killing process $pid using port $port"
      kill -9 $pid 2>/dev/null
    fi
  done

  sleep 1

  if ss -tulpn 2>/dev/null | grep -E ":(3000|3001|8976|8977)" > /dev/null; then
    echo "⚠ Warning: Some ports still in use, but attempting to continue..."
  else
    echo "✓ All ports successfully freed"
  fi
else
  echo "✓ All Next.js ports are now free (3000, 3001, 8976, 8977)"
fi

echo "✓ Cleanup complete"
