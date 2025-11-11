# 🌐 家庭服务器公网访问方案（PVE + 哪吒探针 + 宝塔面板）

**作者：** Martin Zeng  
**域名：** astraluster.top  
**目标访问：** `home.astraluster.top` / `blog.home.astraluster.top`  
**方案特点：** 无公网 IP，通过 VPS + 哪吐反向代理安全访问家中服务。  

---

## 🧩 一、总体架构

```text
                🌍 公网 (VPS)
          ┌──────────────────────────┐
          │  Debian + 宝塔面板        │
          │  哪吒 Dashboard + 反代   │
          │  SSL: home.astraluster.top │
          └────────────┬─────────────┘
                       │
          🔒 哪吒Agent反向通道 (TCP:5555)
                       │
          ┌────────────┴─────────────┐
          │ 家用服务器 (PVE虚拟化)    │
          │ ├─ Windows 10 办公系统      │
          │ └─ Ubuntu Server (宝塔+Agent) │
          └──────────────────────────┘
```

**工作原理：** 家中 Ubuntu Server 安装哪吒 Agent 主动连接 VPS，VPS Nginx + 宝塔面板提供 HTTPS 入口并反代至家庭服务，实现公网访问。

---

## ⚙️ 二、硬件配置

| 项目 | 规格 |
|------|------|
| 主板 | X99 |
| CPU | Intel Xeon E5-2666 v3（10核20线程） |
| 内存 | 32 GB DDR3 ECC |
| 显卡 | Intel DG1 独显（直通 Windows） |
| 硬盘 | M.2 NVMe SSD 1TB |
| 网络 | 千兆有线连接路由器 |
| 虚拟化平台 | Proxmox VE 8.x |

---

## 🧮 三、PVE 虚拟机分配 (32GB内存)

| 虚拟机 | 系统 | 内存 | 硬盘 | CPU | 用途 |
|--------|------|------|------|-----|------|
| Windows 10 | Windows 10/11 | 22 GB | 800 GB | 6 核/12 线程 | 前台办公，GPU DG1直通 |
| Ubuntu Server | Ubuntu 22.04 LTS | 8 GB | 100 GB | 4 核 | 宝塔 + 哪吒Agent + 后台服务 |
| PVE宿主 | - | 2 GB | - | 余量CPU | 系统管理与虚拟机监控 |

---

## 🖥️ 四、PVE 图形化配置指南

### 1️⃣ 创建虚拟机

1. 打开浏览器访问 PVE Web 界面：`https://<PVE-IP>:8006`
2. 左侧节点 → 点击 **创建虚拟机 (Create VM)**
3. 配置 Windows VM：
   - ISO 文件：Windows 10/11
   - 内存：22GB
   - CPU：6 核/12 线程
   - 硬盘：800GB
   - 网络：桥接 vmbr0
   - GPU：Intel DG1 直通
4. 配置 Ubuntu VM：
   - ISO 文件：Ubuntu Server 22.04
   - 内存：8GB
   - CPU：4 核
   - 硬盘：100GB
   - 网络：桥接 vmbr0

### 2️⃣ 网络桥接 (vmbr0)

- 节点 → 系统 → 网络 → 创建 → Linux Bridge
- 名称：`vmbr0`
- 绑定物理网卡
- 设置静态 IP 或 DHCP
- 保存并应用配置

### 3️⃣ GPU 直通到 Windows

- 节点 → 硬件 → PCI 设备 → 添加 Intel DG1 → 选择 Windows VM
- 启动 Windows VM → 安装 Intel 驱动

> 内存分配和 PCI 设备均可通过图形化界面操作，无需命令行。  

---

## 🐧 五、VPS 配置（Debian）

### 1️⃣ 安装哪吒 Dashboard

```bash
curl -L https://raw.githubusercontent.com/naiba/nezha/master/script/install.sh -o nezha.sh
chmod +x nezha.sh
sudo ./nezha.sh
```
- 选择安装 Dashboard
- 编辑 `/opt/nezha/dashboard/config.yaml`:
```yaml
reverse:
  enable: true
  listen_port: 5555
```
- 重启：`systemctl restart nezha-dashboard`

### 2️⃣ 安装宝塔面板

```bash
wget -O install.sh http://download.bt.cn/install/install_panel.sh && bash install.sh
```
- 添加站点：`home.astraluster.top`
- 配置 SSL（Let's Encrypt）
- 配置反向代理：目标 URL → `http://127.0.0.1:8008`
- 访问：`https://home.astraluster.top/admin`

---

## 🏠 六、Ubuntu Server 配置

### 1️⃣ 安装宝塔面板
```bash
wget -O install.sh http://download.bt.cn/install/install_panel.sh && bash install.sh
```

### 2️⃣ 安装哪吒 Agent
```bash
curl -L https://raw.githubusercontent.com/naiba/nezha/master/script/install.sh -o nezha.sh
chmod +x nezha.sh
sudo ./nezha.sh
```
- 服务器地址：`astraluster.top`
- 端口：5555
- Token：从 VPS 哪吒面板获取

> 节点连接成功后在面板显示在线

---

## 🌐 七、设置反向代理子域

- 哪吒面板 → 节点管理 → 家中 Ubuntu 节点 → 反向代理 → 添加

| 字段 | 示例 |
|------|------|
| 名称 | blog |
| 域名 | blog.home.astraluster.top |
| 本地地址 | http://127.0.0.1:8080 |
| 路径 | / |

- DNS 设置：`blog.home.astraluster.top → VPS 公网 IP`
- 访问：`https://blog.home.astraluster.top`

---

## 🔐 八、安全与维护

| 项目 | 建议 |
|------|------|
| VPS 防火墙 | 仅开放 443/5555 端口 |
| 哪吒端口 | Dashboard 仅本地访问，通过 Nginx 反代 |
| 宝塔面板 | 修改默认端口，启用登录验证 |
| 系统更新 | 每月执行 apt update && upgrade |
| Token | 保密 |

---

## 🧠 九、后续拓展

- 多子域服务：`nas.home.astraluster.top`、`media.home.astraluster.top`
- Ubuntu 使用 Docker 管理多服务
- 配合 Cloudflare 提升安全与解析速度
- PVE Snapshot 定期备份 VM

---

## 📘 十、总结

- **32GB 内存分配**：Windows 22GB / Ubuntu 8GB / PVE 2GB
- **PVE 图形化操作**：创建 VM、桥接网络、GPU 直通、内存调整均通过 Web 界面完成
- **哪吒 + 宝塔反代**：实现家庭服务器公网访问，无需公网 IP，支持多子域
- **可扩展性**：多 VM、多服务、多子域、容器管理均可扩展

