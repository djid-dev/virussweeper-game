# Virus Sweeper 🦠

**Virus Sweeper** is a retro-cyberpunk styled puzzle game inspired by the classic **Minesweeper**. Your mission is to hunt down malicious viruses hidden in your system's memory grid without triggering them.

![Virus Sweeper Screenshot](./images/virus-sweeper-preview.png)

## 🕹️ How to Play

The goal is to clear the board by revealing all "safe" cells while avoiding the hidden viruses.

1. **Select Difficulty**: Choose between Easy, Normal, or Hard to start.
2. **Left Click**: Reveal a cell.
    * If it's empty, it will show a number indicating how many viruses are adjacent to it.
    * If it's a virus, **GAME OVER**! Your system is compromised.
3. **Right Click**: Flag a suspected virus with a firewall (⛨).
4. **Win**: Reveal all non-virus cells to secure your system!

## ✨ Features

* **Retro CRT Aesthetic**: Scanlines, grain, glow effects, and neon colors for an immersive 80s/90s cyberpunk feel.
* **Dynamic Sound Effects**: Mechanical keyboard sounds, victorious jingles, and alarm sounds.
* **Difficulty Levels**:
  * **Easy**: 8x8 Grid
  * **Normal**: 12x12 Grid
  * **Hard**: 16x16 Grid
* **Smart Logic**:
  * **Anti-Clumping**: Algorithms ensure viruses are spread out for fair gameplay.
  * **Safe Start**: The first click is always safe (mechanic varies, but grid generation aims for playability).

## 🛠️ Technologies Used

* **HTML5**: Semantic structure.
* **CSS3**: Custom animations (`@keyframes`), variables, and flexbox/grid for the layout.
* **JavaScript (ES6+)**:
  * Module-based logic.
  * 2D Array Matrix for board state management.
  * Recursion for the "flood fill" reveal effect.

## 🚀 Installation & Run

Simply open the `index.html` file in any modern web browser. No build steps or servers required!

```bash
# Clone the repository
git clone https://github.com/yourusername/virus-sweeper.git

# Navigate to the folder
cd virus-sweeper

# Open index.html
start index.html
```

## 👨‍💻 Author

Made with <3 by **Orlando J. Jorge**.

---
*Stay safe online!* 🛡️
