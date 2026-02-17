# 🕋 Qibla Finder

A modern, professional web application for finding the Qibla direction from anywhere in the world. Built with Laravel, React, and cutting-edge web technologies.

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Laravel](https://img.shields.io/badge/Laravel-11-red.svg)
![React](https://img.shields.io/badge/React-18-blue.svg)

## ✨ Features

### 🧭 Real-Time Compass (Mobile)
- **Live device orientation tracking** with smooth 60fps animations
- **Automatic calibration** and jitter reduction using weighted moving average
- **Green glow indicator** when perfectly aligned with Qibla
- **Haptic feedback** on alignment (mobile devices)

### 🖥️ Static Compass (Desktop)
- **Visual compass display** showing absolute Qibla bearing from North
- Works on laptops/desktops without compass sensors
- Clear directional indicators with professional needle design

### 📍 Smart Location Detection
- **GPS-based location** for high accuracy on mobile devices
- **Automatic IP-based fallback** when GPS is unavailable (desktop/laptop)
- **Multi-level retry strategy** with exponential backoff
- **Low-accuracy fallback** (WiFi/cell tower) when GPS fails

### 🎨 Modern UI/UX
- **Animated splash screen** with smooth loading transitions
- **Real-time direction feedback**: "Turn X° left/right" or "Facing the Kaaba"
- **Professional compass design** with 3D diamond-style needles
- **Responsive design** - works perfectly on all screen sizes
- **Gradient backgrounds** and glassmorphism effects

### 📊 Additional Information
- **Distance to Mecca** in kilometers
- **Absolute Qibla bearing** in degrees from North
- **Context-aware tips** for accuracy (mobile vs desktop)

## 🚀 Technologies Used

### Backend
- **Laravel 11** - PHP framework
- **Inertia.js** - SPA without API complexity

### Frontend
- **React 18** - UI library
- **Framer Motion** - Smooth animations
- **TailwindCSS v4** - Utility-first CSS
- **Lucide React** - Modern icon library

### Geospatial
- **Spherical trigonometry** for accurate Qibla calculations
- **Haversine formula** for distance calculations
- **Device Orientation API** for compass functionality

## 📦 Installation

### Prerequisites
- PHP 8.2+
- Composer
- Node.js 18+
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/qibla-finder.git
   cd qibla-finder-laravel
   ```

2. **Install PHP dependencies**
   ```bash
   composer install
   ```

3. **Install JavaScript dependencies**
   ```bash
   npm install
   ```

4. **Configure environment**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

5. **Build assets**
   ```bash
   npm run build
   ```

6. **Start development server**
   ```bash
   php artisan serve
   ```

   Visit: `http://localhost:8000`

## 🛠️ Development

Run development mode with hot reload:

```bash
npm run dev
php artisan serve
```

## 📱 How It Works

### Mobile Devices (with Compass Sensor)
1. App requests location permission → Gets GPS coordinates
2. Calculates Qibla bearing using spherical trigonometry
3. Requests device orientation permission → Gets real-time heading
4. Displays rotating compass that updates as you move
5. Shows green glow + vibration when aligned with Qibla

### Desktop/Laptop (no Compass Sensor)
1. Requests location → Falls back to IP-based geolocation if needed
2. Calculates Qibla bearing from your location
3. Displays **static compass** with North at top
4. Green needle points to Qibla direction
5. Shows bearing like "Qibla at 75° from North"

## 🧮 Technical Details

### Qibla Calculation
Uses the **spherical law of sines** to calculate the bearing from any point to Mecca:

```javascript
bearing = atan2(
  sin(Δλ) × cos(φ2),
  cos(φ1) × sin(φ2) - sin(φ1) × cos(φ2) × cos(Δλ)
)
```

Where:
- `φ1, λ1` = User's latitude and longitude
- `φ2, λ2` = Mecca's coordinates (21.4225°N, 39.8262°E)
- `Δλ` = Difference in longitude

### Compass Smoothing
- **Weighted moving average** (5-sample buffer)
- **Exponential smoothing** (α = 0.25)
- **Circular mean** for 0/360° wraparound handling
- **60fps updates** via `requestAnimationFrame`

## 🌐 Browser Support

- ✅ Chrome/Edge 90+
- ✅ Safari 14+
- ✅ Firefox 88+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

**Note:** Compass functionality requires HTTPS and device orientation sensors (mobile only).

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

Copyright © 2026 **Waziri Kunambi**. All rights reserved.

## 👨‍💻 Author

**Waziri Kunambi**
Full-Stack Developer | Software Engineer
KiooTech

---

## 🙏 Acknowledgments

- Spherical geometry formulas from [Movable Type Scripts](https://www.movable-type.co.uk/scripts/latlong.html)
- Mecca coordinates from Islamic geographic databases
- IP geolocation fallback using ipapi.co and ip-api.com

---

Made with ❤️ for the Muslim community
