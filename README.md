# 🧊 Interactive 3D Widget 🚀

This project implements an **interactive 3D cube widget** using **React** and **Three.js** 🎯

---

## ✨ Features ✨

🎲 **3D Rotating Object:** Displays a dynamic 3D cube rendered with Three.js.  
🔄 **Continuous Rotation:** The cube continuously rotates along its Y-axis.  
🖱️ **Mouse Interaction:** Tilts on its X and Y axes in response to mouse movement over the widget area
📱 **Responsive Container:** Fits responsively in defined container (600x400px) adapting width to viewport 
💡 **Basic Lighting:** Ambient + directional lighting for depth & realism 🎨  
❌ **WebGL Fallback:** Displays a friendly message if the browser doesn’t support WebGL 🌐  
🎛️ **Rotation Speed Control:** A slick slider lets users control rotation speed in real-time 🕹️  
⏳ **Loading Animation (Bonus):** Minimal spinner shows while the scene initializes ⌛  
🧭 **Shadows (Bonus):** Cube casts and receives shadows on a ground plane for extra depth 🌫️  

---

## 🛠️ Technical Approach

This project uses:

⚛️ **React** – Component-based UI + state management  
🔺 **Three.js** – Handles 3D rendering, scene management & lighting  
🧱 **HTML/CSS** – For layout & styling: widget container, UI controls & fallback states  

📦 The `Interactive3DWidget` component encapsulates all Three.js logic inside a `useEffect` hook:

### 🎬 Scene Setup
- 🔧 Initializes the Three.js scene, camera, and WebGL renderer on mount

### 🧊 Object & Lighting
- 🧊 Cube: `THREE.BoxGeometry` + `THREE.MeshStandardMaterial`  
- 🌞 Lighting: `THREE.AmbientLight` & `THREE.DirectionalLight`  
- 🕶️ Shadows: Enabled for realism

### 🔄 Animation Loop
- ⚙️ `requestAnimationFrame` for continuous rotation + mouse tilt

### 🖱️ Mouse Interaction
- 📐 Normalized coordinates + `targetRotationRef` for smooth interpolation

### 📐 Responsiveness
- 📏 `ResizeObserver` watches container and updates renderer + camera

### 🧹 Cleanup
- 🗑️ `useEffect` cleanup disposes of renderer, geometry & materials, and removes listeners

### 🌐 WebGL Check
- ✅ Uses `webGLSupported` to check compatibility

### ⌛ Loading State
- 💡 `useState` manages `isLoading` for the spinner UX

---

## 🧱 Code Organization & Comments

🧩 **Component-Based:** Uses `App` and `Interactive3DWidget` components for modularity  
📊 **State Management:** Uses `useState` and `useRef` for dynamic control and Three.js persistence  
🔁 **`useEffect` Lifecycle:** Manages setup, animation, and cleanup  
🎯 **Refs:** DOM + Three.js objects stay intact across renders  
📝 **Inline Comments:** Clarifies logic, variable use, and 3D setup steps  
🎨 **CSS Styling:** Inlined in `<style>` in `index.html`. In real apps, would be split into files/modules  

---

