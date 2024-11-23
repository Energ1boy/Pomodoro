let timer;
let isRunning = false;
let mode = "pomodoro"; // Default mode
let timeLeft; // Time left in seconds (will be initialized)

// Mode durations in minutes
const durations = {
  pomodoro: 25,
  shortBreak: 5,
  longBreak: 10,
};

// Get references to UI elements
const modeButtons = document.querySelectorAll(".mode-btn");
const minutesDisplay = document.getElementById("minutes");
const secondsDisplay = document.getElementById("seconds");

// Initialize the timer
function initializeTimer() {
  if (!durations[mode]) {
    console.error(`Invalid mode: ${mode}`);
    return;
  }
  timeLeft = durations[mode] * 60; // Set time in seconds based on the current mode
  updateDisplay();
}

// Update the timer display
function updateDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  minutesDisplay.textContent = minutes.toString().padStart(2, "0");
  secondsDisplay.textContent = seconds.toString().padStart(2, "0");
}

// Switch modes
function switchMode(newMode) {
  if (!durations[newMode]) {
    console.error(`Invalid mode: ${newMode}`);
    return;
  }

  mode = newMode;
  initializeTimer(); // Reinitialize the timer for the selected mode

  // Update active button styling
  modeButtons.forEach((btn) => btn.classList.remove("active"));
  const activeButton = document.getElementById(`${mode}-mode`);
  if (activeButton) activeButton.classList.add("active");

  resetTimer(); // Ensure the timer is reset
}

// Start the timer
function startTimer() {
  if (isRunning) return;
  isRunning = true;

  timer = setInterval(() => {
    if (timeLeft > 0) {
      timeLeft--;
      updateDisplay();
    } else {
      clearInterval(timer);
      isRunning = false;
      alert("Time's up!");
    }
  }, 1000);
}

// Pause the timer
function pauseTimer() {
  clearInterval(timer);
  isRunning = false;
}

// Reset the timer
function resetTimer() {
  clearInterval(timer);
  isRunning = false;
  initializeTimer(); // Reset the timeLeft value and display
}

// Add event listeners to buttons
document.getElementById("start").addEventListener("click", startTimer);
document.getElementById("pause").addEventListener("click", pauseTimer);
document.getElementById("reset").addEventListener("click", resetTimer);

// Add event listeners to mode buttons
modeButtons.forEach((button) =>
  button.addEventListener("click", (e) => {
    const newMode = e.target.id.replace("-mode", ""); // Strip "-mode" to get the valid mode key
    switchMode(newMode);
  })
);

// Initialize the timer on page load
initializeTimer();
