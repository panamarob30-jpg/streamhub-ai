# WSL2 Network Setup for Smart TV Access

Since you're running StreamHub AI in WSL2, you need to set up port forwarding from Windows to WSL.

## Step 1: Find Your Windows PC's Local IP

Open **PowerShell** on Windows and run:

```powershell
ipconfig
```

Look for your active network adapter (WiFi or Ethernet):
- **Wireless LAN adapter Wi-Fi** or
- **Ethernet adapter Ethernet**

Find the line: `IPv4 Address. . . . . . . . . . . : 192.168.x.x`

This is your **local network IP** that your Smart TV will use.

## Step 2: Set Up Port Forwarding (One-Time)

In **PowerShell (as Administrator)**, run these commands:

### For Development Mode (Port 5173):
```powershell
netsh interface portproxy add v4tov4 listenport=5173 listenaddress=0.0.0.0 connectport=5173 connectaddress=172.24.106.66
```

### For Backend (Port 3001):
```powershell
netsh interface portproxy add v4tov4 listenport=3001 listenaddress=0.0.0.0 connectport=3001 connectaddress=172.24.106.66
```

### Allow Through Windows Firewall:
```powershell
New-NetFirewallRule -DisplayName "StreamHub Frontend" -Direction Inbound -LocalPort 5173 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "StreamHub Backend" -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Allow
```

## Step 3: Access from Smart TV

On your Smart TV browser, navigate to:
```
http://YOUR_WINDOWS_IP:5173
```

Example: `http://192.168.1.100:5173`

## Alternative: WSL2 Mirrored Mode (Windows 11 22H2+)

If you're on recent Windows 11, you can enable network mirroring:

1. Create/edit `C:\Users\YourUsername\.wslconfig`:

```ini
[wsl2]
networkingMode=mirrored
```

2. Restart WSL:
```powershell
wsl --shutdown
```

3. Restart your WSL instance

With mirrored mode, WSL uses your Windows IP directly (no port forwarding needed).

## Verify Port Forwarding

Check if port forwarding is active:
```powershell
netsh interface portproxy show all
```

Should show:
```
Listen on ipv4:             Connect to ipv4:

Address         Port        Address         Port
--------------- ----------  --------------- ----------
0.0.0.0         5173        172.24.106.66   5173
0.0.0.0         3001        172.24.106.66   3001
```

## Remove Port Forwarding (if needed)

```powershell
netsh interface portproxy delete v4tov4 listenport=5173 listenaddress=0.0.0.0
netsh interface portproxy delete v4tov4 listenport=3001 listenaddress=0.0.0.0
```

## Quick Test

From your Windows PC, test if it works:
```
http://localhost:5173
```

Then from your phone (same WiFi):
```
http://YOUR_WINDOWS_IP:5173
```

If both work, your Smart TV should work too!

## Troubleshooting

### WSL IP Changed?
WSL2 IP can change on reboot. Update port forwarding:

1. Get new WSL IP:
```bash
hostname -I
```

2. Remove old port forwarding (in Windows PowerShell as Admin)
3. Add new port forwarding with the new WSL IP

### Firewall Blocking?
- Temporarily disable Windows Firewall to test
- If it works, re-enable and add rules above

### Can't Access from Other Devices?
- Make sure Windows PC and Smart TV are on same WiFi network
- Check router settings (some routers have device isolation)
- Try pinging Windows IP from another device
