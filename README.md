# Load Testing Script with k6

This repository contains a simple **load testing script** built using [k6](https://k6.io/).  

⚠️ **Important Note:**  
- This script **does not bypass Cloudflare**.  
- To successfully run load tests against a server protected by Cloudflare, your **IP address must be whitelisted** in Cloudflare.  
- If your IP is not whitelisted, Cloudflare will block the requests and the script will not work.  

---

## 🚀 Prerequisites

Before running the script, ensure you have:

- Installed [k6](https://k6.io/docs/getting-started/installation/)  
- Whitelisted your IP address in Cloudflare (if the target server uses Cloudflare)  

---

## 📂 Usage

1. Install k6 on your system:
   ```bash
   # macOS (Homebrew)
   brew install k6

   # Linux (Debian/Ubuntu)
   sudo apt install k6

   # Windows (Chocolatey)
   choco install k6
   ```

2. Clone this repository or download the script.

3. Open a terminal in the directory where your script is located.

4. Run the script with k6:
   ```bash
   k6 run script.js
   ```

---

## 📊 Sample Output

When you run the script, you’ll see output similar to:

```
running (00m30.0s), 00/10 VUs, 100 complete and 0 interrupted iterations
default ✓ [======================================] 10 VUs  30s

     data_received........: 1.2 MB  40 kB/s
     data_sent............: 500 kB  16 kB/s
     http_req_duration....: avg=120ms min=95ms max=200ms
     http_reqs............: 100  3.3/s
     vus..................: 10
     vus_max..............: 10
```

This shows metrics such as request duration, throughput, and virtual user (VU) activity.

---

## 🔒 Policy

- This repository is provided **as-is** for load testing purposes.  
- **Do not modify or change the code** in this repository.  
- Any changes may affect the accuracy of the load testing results.  

