---
layout: post
title: Troubleshooting the Qualcomm QCA6390 Chipset on Linux
---

# Troubleshooting the Qualcomm QCA6390 Chipset on Linux: Why It Happens and How to Fix It

The Qualcomm **QCA6390** is a modern wireless chipset used in a variety of laptops and embedded systems. It provides high-speed Wi-Fi and Bluetooth connectivity, but on Linux systems it has developed a reputation for being unreliable or non-functional unless the kernel and firmware are configured correctly.

This article unpacks the underlying cause of the problem, the current state of Linux support, and practical steps you can take to get your QCA6390-based wireless working.

## 📌 What’s the Problem?

Many Linux users have reported that **the Qualcomm QCA6390 wireless adapter stops working when upgrading to newer Linux kernels** (above 5.15) or on distributions with modern kernel branches. Common symptoms include:

* Wi-Fi won’t connect — the adapter fails to associate with access points.
* Bluetooth stops working entirely.
* The hardware appears present (`lspci` shows the card), but networking tools (NetworkManager, GNOME settings) don’t show Wi-Fi or Bluetooth options.
* The kernel may wrongly report that the hardware is blocked by a radio kill switch (even though none exists).

This behavior is a **driver/firmware regression**. Modern kernels use the `ath11k` driver for Qualcomm Wi-Fi 6E/7 chipsets like the QCA6390, but full support (firmware and driver integration) is not always provided by distributions out-of-the-box.

## 🧠 Why It Happens

### 1. **Incomplete Firmware in Linux Distributions**

The Linux kernel driver (`ath11k_pci`) expects specific firmware binaries to be present in `/lib/firmware/ath11k/QCA6390/hw2.0/` — but many distributions omit these, causing the hardware to fail. The kernel may fail to initialize the card or get stuck during association.

### 2. **Driver Code and Kernel Version Sensitivity**

Users have found that **kernel versions above ~5.15** can break support for QCA6390, especially for Wi-Fi and Bluetooth together. This appears to stem from changes around how RF-kill, device initialization, and firmware loading are handled.

### 3. **Bluetooth Warm-Boot Problems**

In some cases, Bluetooth works initially but **fails after a warm reboot or module toggling**, suggesting kernel driver stability issues related to Qualcomm’s Bluetooth stack.

## 🛠️ Step-By-Step Fixes

Here are practical steps to tackle the QCA6390 issues on Linux.

### **1. Verify the Kernel and Driver**

Check kernel version:

```bash
uname -r
```

If you are on a very new or very old kernel, try a **mainline or LTS release** that’s known to work.

List the driver in use:

```bash
lspci -k | grep -A3 -i wireless
```

The driver should appear as **ath11k_pci**.

### **2. Install the Correct Firmware**

Most distributions don’t ship the full QCA6390 firmware. You may need to manually install it:

1. Clone the **ath11k firmware repository** maintained upstream:

   ```bash
   git clone https://github.com/kvalo/ath11k-firmware.git
   ```
2. Copy the required firmware files to the system firmware directory:

   ```bash
   sudo mkdir -p /lib/firmware/ath11k/QCA6390/hw2.0/
   sudo cp ath11k-firmware/QCA6390/hw2.0/* /lib/firmware/ath11k/QCA6390/hw2.0/
   ```
3. Rebuild initramfs:

   ```bash
   sudo update-initramfs -u
   ```
4. Reboot.

This ensures that `ath11k` has the firmware it needs to initialize the hardware correctly.

### **3. Kernel Boot Parameters (Optional Workaround)**

Some users find that adding kernel parameters can help with PCIe quirks that break wireless behavior (this is more common with Atheros 802.11ac chips but could help in some Qualcomm cases):

Edit `/etc/default/grub`:

```
GRUB_CMDLINE_LINUX_DEFAULT="pcie_aspm=off"
```

Then update and reboot:

```bash
sudo update-grub
```

This disables PCIe power management that can interfere with device power states.

### **4. Try a Different Distribution or Kernel Version**

Certain distributions (especially rolling ones like Arch or Fedora Rawhide) tend to get newer firmware and kernel drivers sooner.

If your current distribution isn’t providing working firmware, consider using:

* A **mainline kernel** from your distro’s testing repository.
* A distribution image with newer firmware packages.

Sometimes upgrading simply “makes it work”.

### **5. Bluetooth Issues After Warm Boot**

For Bluetooth specifically, a full power-cycle of the device (shut down, remove power, restart) often fixes failures after suspend/resume or warm reboot. This isn’t ideal, but it’s a known workaround while kernel fixes continue upstream.

## 🛠️ The Unofficial systemd Band-Aid

The core idea is to:

1. **Delay device initialization** until firmware is guaranteed to be available.
2. **Force a controlled unload/reload** of the affected kernel modules.
3. **Optionally reset RF-kill state** if the driver incorrectly reports the device as blocked.

This avoids the race conditions that cause ath11k/QCA6390 to fail during early boot or resume.

### Option 1: systemd Service to Reload ath11k After Boot

This is the most common and effective workaround.

#### Create the systemd service

```bash
sudo nano /etc/systemd/system/qca6390-reload.service
```

#### Service definition

```ini
[Unit]
Description=Reload Qualcomm QCA6390 Wi-Fi driver
After=network-pre.target
Wants=network-pre.target

[Service]
Type=oneshot
ExecStart=/usr/bin/bash -c '\
  modprobe -r ath11k_pci ath11k && \
  sleep 2 && \
  modprobe ath11k_pci'

[Install]
WantedBy=multi-user.target
```

#### Enable it

```bash
sudo systemctl daemon-reload
sudo systemctl enable qca6390-reload.service
```

#### Why this works

* Ensures firmware is already mounted and available
* Forces ath11k to initialize cleanly
* Avoids PCIe timing and RF-kill misdetection bugs

### Option 2: Reload on Resume (Suspend / Hibernate Fix)

If Wi-Fi or Bluetooth breaks **after suspend**, add a sleep hook.

#### Create a sleep hook

```bash
sudo nano /usr/lib/systemd/system-sleep/qca6390
```

#### Script contents

```bash
#!/bin/sh

case "$1" in
  post)
    modprobe -r ath11k_pci ath11k
    sleep 2
    modprobe ath11k_pci
    ;;
esac
```

#### Make it executable

```bash
sudo chmod +x /usr/lib/systemd/system-sleep/qca6390
```

This ensures the chipset is reset every time the system wakes up.

### Option 3: RF-kill Reset Unit (For “Hard Blocked” Bug)

Some systems report the device as **hard blocked** when it is not.

#### Create the unit

```bash
sudo nano /etc/systemd/system/qca6390-rfkill.service
```

```ini
[Unit]
Description=Reset RFKill for Qualcomm QCA6390
After=multi-user.target

[Service]
Type=oneshot
ExecStart=/usr/sbin/rfkill unblock all

[Install]
WantedBy=multi-user.target
```

Enable it:

```bash
sudo systemctl enable qca6390-rfkill.service
```

This does not help all systems, but it is harmless and fixes a known failure mode.

### Optional: Add a Boot Delay (Highly Defensive)

If firmware loading is slow on your system:

```ini
ExecStart=/usr/bin/bash -c 'sleep 10; modprobe -r ath11k_pci ath11k; sleep 2; modprobe ath11k_pci'
```

This trades a few seconds of boot time for stability.

### What This Does *Not* Fix

* Broken or missing firmware files
* Kernel regressions in ath11k itself
* Bluetooth controller crashes requiring a full power cycle

Those still require proper firmware installation or kernel updates.

### When to Remove This Workaround

Remove these units once:

* Your distribution ships correct QCA6390 firmware by default
* Your kernel version initializes ath11k reliably without reloads
* Suspend/resume works without intervention

Until then, this systemd-based approach is **low-risk, reversible, and widely used**.

## 🔮 What’s the Long-Term Outlook?

Linux kernel developers and Qualcomm have been improving upstream support for Wi-Fi/Bluetooth on Qualcomm chipsets, but **full, trouble-free integration is still a work in progress** for many newer chips. Distributions that lag in packaging the appropriate firmware or driver updates tend to expose these issues more.

## 📌 Summary

| Problem                          | Cause                              | Fix                                        |
| -------------------------------- | ---------------------------------- | ------------------------------------------ |
| QCA6390 Wi-Fi fails to connect   | Missing / incorrect firmware       | Install firmware from ath11k-firmware repo |
| Bluetooth fails after reboot     | Bluetooth driver warm reboot issue | Power-cycle device / update kernel         |
| Wi-Fi and Bluetooth both missing | Kernel and driver mismatch         | Use supported kernel + firmware            |

## 📎 Final Notes

The QCA6390 chipset is powerful but requires up-to-date firmware and kernel support to work reliably on Linux. Manually installing the right firmware and choosing a compatible kernel version are currently the most effective ways to restore functionality. As upstream support improves and distributions catch up, these issues should become less common over time.
