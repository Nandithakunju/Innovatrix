// KTU Result Radar
// Competition prototype: statuses below are demo data only.

const OFFICIAL_RESULTS_URL = "https://www.ktu.edu.in/Exam/result";

const DEFAULT_SEMESTERS = Array.from({ length: 8 }, (_, index) => ({
  id: `S${index + 1}`,
  name: `Semester ${index + 1}`,
  status: "Awaited",
  demo: true
}));

const STORAGE_KEY = "ktu-result-radar-demo-v1";

const grid = document.getElementById("semesterGrid");
const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const demoSemester = document.getElementById("demoSemester");

const totalCount = document.getElementById("totalCount");
const publishedCount = document.getElementById("publishedCount");
const awaitedCount = document.getElementById("awaitedCount");
const emptyMessage = document.getElementById("emptyMessage");

const overlay = document.getElementById("notificationOverlay");
const popupTitle = document.getElementById("popupTitle");
const popupMessage = document.getElementById("popupMessage");
const closePopup = document.getElementById("closePopup");
const dismissPopup = document.getElementById("dismissPopup");

const simulateBtn = document.getElementById("simulateBtn");
const resetBtn = document.getElementById("resetBtn");
const toast = document.getElementById("toast");

let semesters = loadSemesters();
let toastTimeout;

// Load saved demo data, if available.
function loadSemesters() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      const parsed = JSON.parse(saved);

      if (
        Array.isArray(parsed) &&
        parsed.length === 8 &&
        parsed.every(item =>
          /^S[1-8]$/.test(item.id) &&
          ["Published", "Awaited"].includes(item.status)
        )
      ) {
        return parsed;
      }
    }
  } catch (error) {
    console.warn("Could not load saved demo data.", error);
  }

  return DEFAULT_SEMESTERS.map(item => ({ ...item }));
}

// Save demo state in this browser.
function saveSemesters() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(semesters));
  } catch (error) {
    console.warn("Could not save demo data.", error);
  }
}

// Render all visible semester cards.
function renderSemesters() {
  const query = searchInput.value.trim().toLowerCase();
  const selectedStatus = statusFilter.value;

  const filtered = semesters.filter(semester => {
    const matchesSearch =
      semester.id.toLowerCase().includes(query) ||
      semester.name.toLowerCase().includes(query);

    const matchesStatus =
      selectedStatus === "all" ||
      semester.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  grid.replaceChildren();

  filtered.forEach(semester => {
    const card = document.createElement("article");
    card.className = "semester-card";

    const top = document.createElement("div");
    top.className = "card-top";

    const number = document.createElement("span");
    number.className = "semester-number";
    number.textContent = semester.id;

    const badge = document.createElement("span");
    badge.className =
      "status " +
      (semester.status === "Published" ? "published" : "awaited");
    badge.textContent = semester.status;

    top.append(number, badge);

    const heading = document.createElement("h3");
    heading.textContent = semester.name;

    const description = document.createElement("p");
    description.textContent =
      semester.status === "Published"
        ? "Marked published in demo data."
        : "Awaiting a simulated publication.";

    const link = document.createElement("a");
    link.className = "card-link";
    link.href = OFFICIAL_RESULTS_URL;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Check official page ↗";

    card.append(top, heading, description, link);
    grid.appendChild(card);
  });

  emptyMessage.hidden = filtered.length !== 0;

  totalCount.textContent = semesters.length;
  publishedCount.textContent = semesters.filter(
    item => item.status === "Published"
  ).length;
  awaitedCount.textContent = semesters.filter(
    item => item.status === "Awaited"
  ).length;
}

// Display a popup for a simulated publication.
function showNotification(semester) {
  popupTitle.textContent = `${semester.name} result published!`;

  popupMessage.textContent =
    `${semester.name} has been marked as published in the demo. ` +
    "Visit the official KTU result page to verify actual availability.";

  overlay.hidden = false;
  closePopup.focus();
}

// Close the notification popup.
function hideNotification() {
  overlay.hidden = true;
  simulateBtn.focus();
}

closePopup.addEventListener("click", hideNotification);
dismissPopup.addEventListener("click", hideNotification);

// Also close when the user clicks outside the dialog.
overlay.addEventListener("click", event => {
  if (event.target === overlay) {
    hideNotification();
  }
});

// Escape key closes the popup.
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !overlay.hidden) {
    hideNotification();
  }
});

// Search and status filters update the dashboard.
searchInput.addEventListener("input", renderSemesters);
statusFilter.addEventListener("change", renderSemesters);

// Simulate a newly published result for the competition.
simulateBtn.addEventListener("click", () => {
  const selectedId = demoSemester.value;

  const semester = semesters.find(
    item => item.id === selectedId
  );

  if (!semester) return;

  if (semester.status === "Published") {
    showToast(`${semester.name} is already published in this demo.`);
    return;
  }

  semester.status = "Published";

  saveSemesters();
  renderSemesters();
  showNotification(semester);
});

// Reset all semesters to Awaited.
resetBtn.addEventListener("click", () => {
  const confirmed = window.confirm(
    "Reset all demo statuses to Awaited?"
  );

  if (!confirmed) return;

  semesters = DEFAULT_SEMESTERS.map(item => ({ ...item }));

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn("Could not clear saved demo data.", error);
  }

  statusFilter.value = "all";
  searchInput.value = "";

  renderSemesters();
  hideNotification();
  showToast("Demo reset. All semesters are Awaited.");
});

// Small confirmation message at the bottom of the page.
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  window.clearTimeout(toastTimeout);

  toastTimeout = window.setTimeout(() => {
    toast.classList.remove("show");
  }, 2800);
}

// Initial page load does not generate fake notifications.
renderSemesters();


  