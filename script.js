let timer;
let isRunning = false;
let mode = "pomodoro"; // Default mode
let timeLeft; // Time left in seconds
let originalDuration; // To store the original duration for progress calculation
let completedSessions = 0;
let sessionsGoal = 4; // Default sessions before long break

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
const progressCircle = document.querySelector(".timer-circle .progress");
const completedCountEl = document.getElementById("completed-count");
const targetCountEl = document.getElementById("target-count");
const sessionDotsContainer = document.getElementById("session-dots");
const bodyElement = document.body;

// Setting related elements
const settingsBtn = document.getElementById("settings-btn");
const settingsModal = document.getElementById("settings-modal");
const saveSettingsBtn = document.getElementById("save-settings");
const closeSettingsBtn = document.getElementById("close-settings");
const pomodoroInput = document.getElementById("pomodoro-duration");
const shortBreakInput = document.getElementById("short-break-duration");
const longBreakInput = document.getElementById("long-break-duration");
const sessionsGoalInput = document.getElementById("sessions-goal");

// Notification element
const notificationEl = document.getElementById("notification");

// Calculate circumference for the progress circle
const radius = 45;
const circumference = 2 * Math.PI * radius;

// Initialize session dots
function initSessionDots() {
  sessionDotsContainer.innerHTML = '';
  for (let i = 0; i < sessionsGoal; i++) {
    const dot = document.createElement('div');
    dot.className = 'session-dot';
    if (i < completedSessions) {
      dot.classList.add('completed');
    }
    sessionDotsContainer.appendChild(dot);
  }
  
  completedCountEl.textContent = completedSessions;
  targetCountEl.textContent = sessionsGoal;
}

// Set progress circle
function setProgress(percentage) {
  const dashoffset = circumference * (1 - percentage / 100);
  progressCircle.style.strokeDasharray = circumference;
  progressCircle.style.strokeDashoffset = dashoffset;
}

// Initialize the timer
function initializeTimer() {
  if (!durations[mode]) {
    console.error(`Invalid mode: ${mode}`);
    return;
  }
  
  timeLeft = durations[mode] * 60; // Set time in seconds
  originalDuration = timeLeft; // Store for progress calculation
  updateDisplay();
  setProgress(100); // Full circle at start
}

// Update the timer display
function updateDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  minutesDisplay.textContent = minutes.toString().padStart(2, "0");
  secondsDisplay.textContent = seconds.toString().padStart(2, "0");
  
  // Update progress circle
  const progressPercentage = (timeLeft / originalDuration) * 100;
  setProgress(progressPercentage);
  
  // Update document title
  document.title = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")} - Pomodoro Timer`;
}

// Switch modes
function switchMode(newMode) {
  if (!durations[newMode]) {
    console.error(`Invalid mode: ${newMode}`);
    return;
  }

  mode = newMode;
  resetTimer(); // Reset the timer for the selected mode
  
  // Remove all mode classes from body
  bodyElement.className = '';
  // Add the current mode class
  bodyElement.classList.add(`${mode}-mode`);

  // Update active button styling
  modeButtons.forEach((btn) => btn.classList.remove("active"));
  const activeButton = document.getElementById(`${mode}-mode`);
  if (activeButton) activeButton.classList.add("active");
}

// Start the timer
function startTimer() {
  if (isRunning) return;
  isRunning = true;

  updateStartButton();

  timer = setInterval(() => {
    if (timeLeft > 0) {
      timeLeft--;
      updateDisplay();
    } else {
      clearInterval(timer);
      isRunning = false;
      updateStartButton();
      timerComplete();
    }
  }, 1000);
}

// Handle timer completion
function timerComplete() {
  // Play notification sound
  const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-digital-clock-digital-alarm-buzzer-992.mp3');
  audio.play().catch(e => console.log('Audio play prevented:', e));
  
  // Show notification
  showNotification(`${mode === 'pomodoro' ? 'Focus session' : 'Break'} completed!`);
  
  // If pomodoro session completed, increment counter
  if (mode === 'pomodoro') {
    completedSessions++;
    updateSessionCounter();
    
    // Automatically switch to break mode
    if (completedSessions % sessionsGoal === 0) {
      // Time for a long break
      switchMode('longBreak');
    } else {
      // Time for a short break
      switchMode('shortBreak');
    }
  } else {
    // After break, go back to pomodoro
    switchMode('pomodoro');
  }
}

// Update start button text based on timer state
function updateStartButton() {
  const startBtn = document.getElementById("start");
  startBtn.innerHTML = isRunning ? '<i class="bi bi-play-fill"></i> Resume' : '<i class="bi bi-play-fill"></i> Start';
}

// Update session counter and dots
function updateSessionCounter() {
  completedCountEl.textContent = completedSessions;
  
  // Update dots
  const dots = document.querySelectorAll('.session-dot');
  for (let i = 0; i < dots.length; i++) {
    if (i < completedSessions) {
      dots[i].classList.add('completed');
    } else {
      dots[i].classList.remove('completed');
    }
  }
}

// Show notification
function showNotification(message) {
  notificationEl.textContent = message;
  notificationEl.classList.add('show');
  
  setTimeout(() => {
    notificationEl.classList.remove('show');
  }, 3000);
}

// Pause the timer
function pauseTimer() {
  clearInterval(timer);
  isRunning = false;
  updateStartButton();
}

// Reset the timer
function resetTimer() {
  clearInterval(timer);
  isRunning = false;
  initializeTimer();
  updateStartButton();
}

// Open settings modal
function openSettings() {
  settingsModal.classList.add('show');
  
  // Populate current values
  pomodoroInput.value = durations.pomodoro;
  shortBreakInput.value = durations.shortBreak;
  longBreakInput.value = durations.longBreak;
  sessionsGoalInput.value = sessionsGoal;
}

// Close settings modal
function closeSettings() {
  settingsModal.classList.remove('show');
}

// Save settings
function saveSettings() {
  // Validate inputs
  const pomodoroValue = parseInt(pomodoroInput.value, 10);
  const shortBreakValue = parseInt(shortBreakInput.value, 10);
  const longBreakValue = parseInt(longBreakInput.value, 10);
  const sessionsValue = parseInt(sessionsGoalInput.value, 10);
  
  if (isNaN(pomodoroValue) || isNaN(shortBreakValue) || isNaN(longBreakValue) || isNaN(sessionsValue)) {
    showNotification('Please enter valid numbers');
    return;
  }
  
  // Update durations
  durations.pomodoro = pomodoroValue;
  durations.shortBreak = shortBreakValue;
  durations.longBreak = longBreakValue;
  sessionsGoal = sessionsValue;
  
  // Reset timer to apply new duration
  resetTimer();
  
  // Reinitialize session dots
  initSessionDots();
  
  // Close modal
  closeSettings();
  
  // Show confirmation
  showNotification('Settings saved successfully');
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

// Settings event listeners
settingsBtn.addEventListener("click", openSettings);
closeSettingsBtn.addEventListener("click", closeSettings);
saveSettingsBtn.addEventListener("click", saveSettings);

// Close settings modal when clicking outside
settingsModal.addEventListener("click", (e) => {
  if (e.target === settingsModal) {
    closeSettings();
  }
});

// Document visibility change detection for better user experience
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && isRunning) {
    // Sync the timer when tab becomes visible again
    clearInterval(timer);
    startTimer();
  }
});

// Initialize everything on page load
window.addEventListener('load', () => {
  initializeTimer();
  initSessionDots();
  
  // Set initial progress circle properties
  progressCircle.style.strokeDasharray = circumference;
  progressCircle.style.strokeDashoffset = 0;
});
