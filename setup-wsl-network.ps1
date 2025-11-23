# StreamHub AI - WSL2 Network Setup Script
# Run this in PowerShell as Administrator on Windows

Write-Host "StreamHub AI - WSL2 Network Setup" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Get WSL IP
Write-Host "Getting WSL IP address..." -ForegroundColor Yellow
$wslIp = bash.exe -c "hostname -I | awk '{print `$1}'"
Write-Host "WSL IP: $wslIp" -ForegroundColor Green

# Get Windows IP
Write-Host ""
Write-Host "Your Windows PC Network Information:" -ForegroundColor Yellow
Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.*"} | Format-Table IPAddress, InterfaceAlias -AutoSize

Write-Host ""
Write-Host "Setting up port forwarding..." -ForegroundColor Yellow

# Remove existing rules if any
netsh interface portproxy delete v4tov4 listenport=5173 listenaddress=0.0.0.0 2>$null
netsh interface portproxy delete v4tov4 listenport=3001 listenaddress=0.0.0.0 2>$null

# Add port forwarding
netsh interface portproxy add v4tov4 listenport=5173 listenaddress=0.0.0.0 connectport=5173 connectaddress=$wslIp
netsh interface portproxy add v4tov4 listenport=3001 listenaddress=0.0.0.0 connectport=3001 connectaddress=$wslIp

Write-Host "Port forwarding configured!" -ForegroundColor Green

# Configure Windows Firewall
Write-Host ""
Write-Host "Configuring Windows Firewall..." -ForegroundColor Yellow

# Remove existing rules if any
Remove-NetFirewallRule -DisplayName "StreamHub Frontend" -ErrorAction SilentlyContinue
Remove-NetFirewallRule -DisplayName "StreamHub Backend" -ErrorAction SilentlyContinue

# Add new rules
New-NetFirewallRule -DisplayName "StreamHub Frontend" -Direction Inbound -LocalPort 5173 -Protocol TCP -Action Allow | Out-Null
New-NetFirewallRule -DisplayName "StreamHub Backend" -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Allow | Out-Null

Write-Host "Firewall rules configured!" -ForegroundColor Green

# Show current configuration
Write-Host ""
Write-Host "Current Port Forwarding:" -ForegroundColor Yellow
netsh interface portproxy show all

Write-Host ""
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "===============" -ForegroundColor Green
Write-Host ""
Write-Host "Access StreamHub from your Smart TV:" -ForegroundColor Cyan
Write-Host "  Development: http://YOUR_WINDOWS_IP:5173" -ForegroundColor White
Write-Host "  Production:  http://YOUR_WINDOWS_IP:3001" -ForegroundColor White
Write-Host ""
Write-Host "Replace YOUR_WINDOWS_IP with one of the IP addresses shown above" -ForegroundColor Yellow
Write-Host "(Usually starts with 192.168 or 10.0)" -ForegroundColor Yellow
Write-Host ""
Write-Host "Note: WSL IP may change on reboot. Re-run this script if needed." -ForegroundColor Yellow
