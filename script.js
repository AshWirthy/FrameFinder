class FrameAnimation {
  constructor() {
    this.squares = [];
    this.animationContainer = null;
    this.isAnimating = false;
    this.squareConfig = [
      { size: 900, borderWidth: 5, borderColor: "#111", className: "square-1" },
      {
        size: 750,
        borderWidth: 4,
        borderColor: "#1a1a1a",
        className: "square-2",
      },
      { size: 600, borderWidth: 4, borderColor: "#222", className: "square-3" },
      { size: 480, borderWidth: 3, borderColor: "#444", className: "square-4" },
      { size: 380, borderWidth: 3, borderColor: "#666", className: "square-5" },
      { size: 300, borderWidth: 2, borderColor: "#888", className: "square-6" },
      { size: 240, borderWidth: 2, borderColor: "#aaa", className: "square-7" },
    ];
    this.init();
  }

  init() {
    this.createAnimationElements();
    this.startAnimation();
  }

  createAnimationElements() {
    // Create animation container
    this.animationContainer = document.createElement("div");
    this.animationContainer.className = "animation-container";
    this.animationContainer.style.position = "fixed";
    this.animationContainer.style.top = "0";
    this.animationContainer.style.left = "0";
    this.animationContainer.style.width = "100vw";
    this.animationContainer.style.height = "100vh";
    this.animationContainer.style.pointerEvents = "none";
    this.animationContainer.style.zIndex = "5";
    this.animationContainer.style.overflow = "hidden";
    document.body.appendChild(this.animationContainer);

    // Create squares
    this.squareConfig.forEach((config, index) => {
      const square = document.createElement("div");
      square.className = `rotating-square ${config.className}`;

      // Apply dynamic styles
      square.style.width = `${config.size}px`;
      square.style.height = `${config.size}px`;
      square.style.borderWidth = `${config.borderWidth}px`;
      square.style.borderColor = config.borderColor;
      square.style.borderStyle = "solid";
      square.style.background = "transparent";
      square.style.position = "absolute";
      square.style.top = "50%";
      square.style.left = "50%";
      square.style.transformOrigin = "center";
      square.style.transition = "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)";
      square.style.opacity = "0";
      square.style.pointerEvents = "none";
      square.style.transform = "translate(-50%, -50%) rotate(45deg) scale(0)";

      this.animationContainer.appendChild(square);
      this.squares.push(square);
    });

    // Apply responsive sizing
    this.applyResponsiveStyles();
  }

  applyResponsiveStyles() {
    const updateSquareSizes = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const maxDimension = Math.min(width, height);
      let scaleFactor = 1;

      // Scale based on viewport size to prevent overflow
      if (maxDimension <= 480) {
        scaleFactor = 0.3;
      } else if (maxDimension <= 768) {
        scaleFactor = 0.5;
      } else if (maxDimension <= 1024) {
        scaleFactor = 0.7;
      } else {
        scaleFactor = 0.9;
      }

      this.squares.forEach((square, index) => {
        const config = this.squareConfig[index];
        const newSize = Math.min(config.size * scaleFactor, maxDimension * 0.9);
        square.style.width = `${newSize}px`;
        square.style.height = `${newSize}px`;
      });
    };

    updateSquareSizes();
    window.addEventListener("resize", updateSquareSizes);
  }

  async startAnimation() {
    if (this.isAnimating) return;
    this.isAnimating = true;

    // Reset all squares to initial state
    this.resetSquares();

    // Phase 1: Squares appear from offscreen and rotate into position
    await this.animateSquaresIn();

    // Phase 2: Quick blink like camera flash
    await this.cameraFlash();

    // Phase 3: Squares disappear from largest to smallest
    await this.animateSquaresOut();

    this.isAnimating = false;

    // Repeat animation after 3 seconds
    setTimeout(() => {
      this.startAnimation();
    }, 5000);
  }

  resetSquares() {
    this.squares.forEach((square, index) => {
      square.style.opacity = "0";
      square.style.transform = "translate(-50%, -50%) rotate(45deg) scale(0)";
    });
  }

  animateSquaresIn() {
    return new Promise((resolve) => {
      const delays = [0, 150, 300, 450, 600, 750, 900]; // Staggered timing for 7 squares
      const rotations = [45, 40, 33, 27, 20, 13, 0]; // Each square rotates less

      this.squares.forEach((square, index) => {
        setTimeout(() => {
          square.style.opacity = "1";
          square.style.transform = `translate(-50%, -50%) rotate(${rotations[index]}deg) scale(1)`;

          // Resolve when last square is in position
          if (index === this.squares.length - 1) {
            setTimeout(resolve, 500); // Wait for animation to complete
          }
        }, delays[index]);
      });
    });
  }

  cameraFlash() {
    return new Promise((resolve) => {
      // Create flash overlay dynamically
      const flash = document.createElement("div");
      flash.style.position = "fixed";
      flash.style.top = "0";
      flash.style.left = "0";
      flash.style.width = "100vw";
      flash.style.height = "100vh";
      flash.style.background = "rgba(255, 255, 255, 0.3)";
      flash.style.zIndex = "1000";
      flash.style.pointerEvents = "none";
      flash.style.opacity = "0";
      flash.style.transition = "opacity 0.15s ease-out";

      document.body.appendChild(flash);

      // Very subtle blink sequence
      let blinkCount = 0;
      const blinkInterval = setInterval(() => {
        // Flash effect - very reduced intensity
        flash.style.opacity = blinkCount % 2 === 0 ? "0.5" : "0";

        // Square blink - very subtle opacity change
        this.squares.forEach((square) => {
          square.style.opacity = square.style.opacity === "1" ? "0.85" : "1";
        });

        blinkCount++;
        if (blinkCount >= 4) {
          // Only 2 full blinks
          clearInterval(blinkInterval);
          // Ensure all squares are visible after flash
          this.squares.forEach((square) => {
            square.style.opacity = "1";
          });
          flash.style.opacity = "0";
          setTimeout(() => {
            document.body.removeChild(flash);
            resolve();
          }, 300);
        }
      }, 120);
    });
  }

  animateSquaresOut() {
    return new Promise((resolve) => {
      const delays = [0, 150, 300, 450, 600, 750, 900]; // Largest to smallest for 7 squares

      this.squares.forEach((square, index) => {
        setTimeout(() => {
          square.style.opacity = "0";
          square.style.transform =
            "translate(-50%, -50%) rotate(45deg) scale(0)";

          // Resolve when last square disappears
          if (index === this.squares.length - 1) {
            setTimeout(resolve, 500);
          }
        }, delays[index]);
      });
    });
  }

  // Clean up method to remove elements if needed
  destroy() {
    if (this.animationContainer && this.animationContainer.parentNode) {
      this.animationContainer.parentNode.removeChild(this.animationContainer);
    }
    this.squares = [];
    this.animationContainer = null;
  }
}

// Start the animation when page loads
document.addEventListener("DOMContentLoaded", () => {
  new FrameAnimation();
});
