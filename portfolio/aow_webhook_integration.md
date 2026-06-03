# AOW Webhook Integration Guide
*Date: 2026-05-25*

This document is to share the `aow_webhook.service` configuration and `python3 aow_webhook_receiver.py` startup commands with **sami**.

## 1. Local Python Receiver (`scripts/aow_webhook_receiver.py`)
This script uses the standard library `http.server` to receive incoming webhook payloads on port 5005. No `requirements.txt` is needed.
Start it locally to test:
```bash
python3 scripts/aow_webhook_receiver.py
```

## 2. systemd User Service (`aow-webhook.service`)
To keep the webhook receiver running permanently without `sudo`, use a user-level systemd service.

**Create the file:** `~/.config/systemd/user/aow-webhook.service`

**Content:**
```ini
[Unit]
Description=AOW Webhook Receiver (Port 5005)
After=network.target

[Service]
Type=simple
WorkingDirectory=/home/ubuntu/workspace-sami
ExecStart=/usr/bin/python3 scripts/aow_webhook_receiver.py
Restart=on-failure
RestartSec=5

[Install]
WantedBy=default.target
```

**Enable and Start:**
```bash
systemctl --user daemon-reload
systemctl --user enable aow-webhook.service
systemctl --user start aow-webhook.service
systemctl --user status aow-webhook.service
```

Make sure port `5005` is open in the EC2 Security Group.

---
*Created for sami's EC2 deployment.*
