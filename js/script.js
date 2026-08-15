/* ============================================================
   Date With Me — Romantic Date Invitation
   Vanilla JavaScript — no frameworks, no backend.
   ============================================================ */

/* ============================================================
   ❤️ CONFIGURATION
   Edit these values to personalise your invitation.
   ============================================================ */

const APP_CONFIG = {
    // Your name (shown at the end of the WhatsApp message)
    senderName: "Your Name",

    // Her name / the recipient's name.
    // Leave blank ("") to hide the name entirely.
    recipientName: "Someone Special",

    // Your WhatsApp number in international format, digits only
    // (country code included, no +, spaces or dashes).
    // Example (US): "15551234567"
    whatsappNumber: "923334944778"
};

// Compatibility alias read everywhere by the app.
const WHATSAPP_NUMBER = APP_CONFIG.whatsappNumber;

/* ============================================================
   🍽️ SELECTABLE OPTIONS
   Edit these lists to change what she can pick.
   ============================================================ */

const FOOD_OPTIONS = [
    { emoji: "🍕", name: "Pizza",          desc: "Hot, cheesy & shareable" },
    { emoji: "🍔", name: "Burger",         desc: "Juicy and satisfying" },
    { emoji: "🍝", name: "Pasta",          desc: "Cozy & comforting" },
    { emoji: "🍣", name: "Sushi",          desc: "Fresh & elegant" },
    { emoji: "🌮", name: "Tacos",          desc: "Fun, colorful bites" },
    { emoji: "🍗", name: "Fried Chicken",  desc: "Crispy & delicious" },
    { emoji: "🥘", name: "Chinese",        desc: "Flavorful & warm" },
    { emoji: "🍛", name: "Pakistani Food", desc: "Bold, rich & hearty" },
    { emoji: "🍰", name: "Dessert",        desc: "Something sweet to end" },
    { emoji: "☕",  name: "Coffee",        desc: "Warm drinks & chat" }
];

const LOCATION_OPTIONS = [
    { emoji: "🍽️", name: "Restaurant",    desc: "A nice sit-down meal" },
    { emoji: "☕",  name: "Café",          desc: "Relaxed & cozy vibe" },
    { emoji: "🎬",  name: "Cinema",        desc: "Movie & popcorn" },
    { emoji: "🌳",  name: "Park",          desc: "Fresh air & walks" },
    { emoji: "🛍️",  name: "Mall",          desc: "Shopping & exploring" },
    { emoji: "🏍️",  name: "Bike Riding With Me", desc: "High speed, wind & freedom" },
    { emoji: "🌅",  name: "Rooftop",        desc: "City lights & cool breeze" },
    { emoji: "🎁",  name: "Surprise Me",   desc: "You choose, I plan it" }
];

const STYLE_OPTIONS = [
    { emoji: "❤️", name: "Romantic Dinner",       desc: "Candles & quiet moments" },
    { emoji: "☕",  name: "Coffee & Conversation", desc: "Deep talk, no rush" },
    { emoji: "🎬",  name: "Movie Date",           desc: "Snacks & shared laughs" },
    { emoji: "🌳",  name: "Outdoor Adventure",    desc: "Explore something new" },
    { emoji: "🏍️",  name: "Bike Riding With Me", desc: "High-speed thrills, wind in my hair" },
    { emoji: "🌹",  name: "Dinner & Walk",        desc: "Good food, then a slow stroll" },
    { emoji: "🌸",  name: "Cute Café Date",       desc: "Pastel vibes, iced drinks & sweet talk" },
    { emoji: "🎁",  name: "Surprise Date",        desc: "Let me plan the magic" }
];

/* ============================================================
   📝 CENTRAL STATE — every selection lives here and is saved
   to localStorage so a refresh never loses progress.
   ============================================================ */

const datePlan = {
    answer: "",
    date: "",
    time: "",
    foods: [],
    otherFood: "",
    location: "",
    customLocation: "",
    dateType: "",
    message: ""
};

const STORAGE_KEY = "dateWithMePlan";

/* ============================================================
   🛠️ DOM HELPERS
   ============================================================ */

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const el = (tag, attrs, children) => {
    const node = document.createElement(tag);
    if (attrs) {
        Object.entries(attrs).forEach(([k, v]) => {
            if (k === "class") node.className = v;
            else if (k === "html") node.innerHTML = v;
            else if (k === "dataset") Object.entries(v).forEach(([dk, dv]) => (node.dataset[dk] = dv));
            else if (k.startsWith("on")) node.addEventListener(k.slice(2), v);
            else node.setAttribute(k, v);
        });
    }
    if (children) {
        (Array.isArray(children) ? children : [children]).forEach((c) => {
            node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
        });
    }
    return node;
};

/* ============================================================
   💾 PERSISTENCE (localStorage — this device/browser only)
   ============================================================ */

function savePlan() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(datePlan));
    } catch (e) { /* storage unavailable — ignore */ }
}

function loadPlan() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const saved = JSON.parse(raw);
        Object.keys(datePlan).forEach((k) => {
            if (saved[k] !== undefined && saved[k] !== null) datePlan[k] = saved[k];
        });
    } catch (e) { /* corrupted data — start fresh */ }
}

function clearSaved() {
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* ignore */ }
}
/* ============================================================
   🔤 FORMAT HELPERS
   ============================================================ */

// "2026-08-20" -> "Thursday, August 20, 2026"
function formatDate(iso) {
    if (!iso) return "Not chosen yet";
    const parts = iso.split("-");
    if (parts.length !== 3) return iso;
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    if (isNaN(d)) return iso;
    return d.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    });
}

// "19:30" -> "7:30 PM"
function formatTime(t) {
    if (!t) return "Not chosen yet";
    const [h, m] = t.split(":").map(Number);
    if (isNaN(h) || isNaN(m)) return t;
    const ampm = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return hour12 + ":" + String(m).padStart(2, "0") + " " + ampm;
}

/* ============================================================
   💬 TOAST (custom validation messages)
   ============================================================ */

let toastTimer = null;
function toast(message) {
    const node = $("#toast");
    if (!node) return;
    node.textContent = message;
    node.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => node.classList.remove("show"), 2800);
}

/* ============================================================
   🖥️ SCREEN NAVIGATION
   ============================================================ */

const LANDING = "screen-landing";

const PLANNING_SCREENS = new Set([
    "screen-date",
    "screen-food",
    "screen-location",
    "screen-style",
    "screen-message",
    "screen-confirm"
]);

const STEP_ORDER = [
    "screen-date",
    "screen-food",
    "screen-location",
    "screen-style",
    "screen-message",
    "screen-confirm"
];

function showScreen(id) {
    $$(".screen").forEach((sec) => sec.classList.toggle("active", sec.id === id));

    const planning = $("#planning");
    if (planning) planning.hidden = !PLANNING_SCREENS.has(id);

    updateProgress(id);

    if (id === "screen-date") syncDateField();

    // Focus the section for keyboard / screen readers
    const active = document.getElementById(id);
    if (active && !active.contains(document.activeElement)) {
        active.setAttribute("tabindex", "-1");
        active.focus({ preventScroll: true });
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
}

/* Progress indicator: highlights the current step + fills the bar. */
function updateProgress(currentId) {
    const idx = STEP_ORDER.indexOf(currentId);
    $$(".pstep").forEach((step) => {
        step.classList.toggle("active", step.dataset.ptarget === currentId);
    });
    const fill = $("#progressFill");
    if (!fill) return;
    if (idx >= 0) {
        fill.style.width = ((idx + 1) / STEP_ORDER.length) * 100 + "%";
    } else {
        fill.style.width = "0%";
    }
}
/* ============================================================
   🧩 RENDER OPTION CARDS
   ============================================================ */

function buildCard(option, kind) {
    const key = kind + "-" + option.name;
    return el("div", {
        class: "select-card",
        role: "button",
        tabindex: "0",
        "aria-pressed": "false",
        "aria-label": option.name + ". " + option.desc,
        dataset: { key, kind }
    }, [
        el("span", { class: "sc-check", "aria-hidden": "true" }, "✓"),
        el("span", { class: "sc-emoji", "aria-hidden": "true" }, option.emoji),
        el("span", { class: "sc-name" }, option.name),
        el("span", { class: "sc-desc" }, option.desc)
    ]);
}

function setSelected(card, on) {
    card.classList.toggle("selected", on);
    card.setAttribute("aria-pressed", String(Boolean(on)));
}

function renderFoods() {
    const grid = $("#foodGrid");
    if (!grid) return;
    grid.innerHTML = "";
    FOOD_OPTIONS.forEach((option) => {
        const card = buildCard(option, "food");
        card.addEventListener("click", () => toggleFood(card, option.name));
        card.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleFood(card, option.name);
            }
        });
        if (datePlan.foods.includes(option.name)) setSelected(card, true);
        grid.appendChild(card);
    });
}

function toggleFood(card, name) {
    const i = datePlan.foods.indexOf(name);
    if (i === -1) {
        datePlan.foods.push(name);
        setSelected(card, true);
    } else {
        datePlan.foods.splice(i, 1);
        setSelected(card, false);
    }
    savePlan();
}

function renderLocations() {
    const grid = $("#locationGrid");
    if (!grid) return;
    grid.innerHTML = "";
    LOCATION_OPTIONS.forEach((option) => {
        const card = buildCard(option, "location");
        card.addEventListener("click", () => selectLocation(card, option.name));
        card.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                selectLocation(card, option.name);
            }
        });
        if (datePlan.location === option.name) setSelected(card, true);
        grid.appendChild(card);
    });
}

function selectLocation(card, name) {
    datePlan.location = name;
    datePlan.customLocation = "";
    const input = $("#customLocationInput");
    if (input) input.value = "";
    $$("#locationGrid .select-card").forEach((c) => setSelected(c, false));
    setSelected(card, true);
    savePlan();
}

function renderStyles() {
    const grid = $("#styleGrid");
    if (!grid) return;
    grid.innerHTML = "";
    STYLE_OPTIONS.forEach((option) => {
        const card = buildCard(option, "style");
        card.addEventListener("click", () => selectStyle(card, option.name));
        card.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                selectStyle(card, option.name);
            }
        });
        if (datePlan.dateType === option.name) setSelected(card, true);
        grid.appendChild(card);
    });
}

function selectStyle(card, name) {
    datePlan.dateType = name;
    $$("#styleGrid .select-card").forEach((c) => setSelected(c, false));
    setSelected(card, true);
    savePlan();
}
/* ============================================================
   📥 SYNC INPUT FIELDS <-> STATE (never lose on back-nav)
   ============================================================ */

function syncDateField() {
    const input = $("#dateInput");
    if (input && datePlan.date && input.value !== datePlan.date) {
        input.value = datePlan.date;
    }
}

function populateFields() {
    if ($("#dateInput")) $("#dateInput").value = datePlan.date || "";
    if ($("#timeInput")) $("#timeInput").value = datePlan.time || "";
    if ($("#otherFoodInput")) $("#otherFoodInput").value = datePlan.otherFood || "";
    if ($("#customLocationInput")) $("#customLocationInput").value = datePlan.customLocation || "";
    if ($("#messageInput")) $("#messageInput").value = datePlan.message || "";
}

/* ============================================================
   📋 SUMMARY BUILDERS
   ============================================================ */

function buildSummaryRow(icon, label, value) {
    return el("div", { class: "summary-row" }, [
        el("span", { class: "sum-row-icon", "aria-hidden": "true" }, icon),
        el("span", { class: "sum-row-body" }, [
            el("span", { class: "sum-label" }, label),
            el("div", { class: "sum-value" }, value || "")
        ])
    ]);
}

function foodSummary() {
    const list = datePlan.foods.slice();
    if (datePlan.otherFood && datePlan.otherFood.trim()) {
        list.push(datePlan.otherFood.trim());
    }
    return list.length ? list.join(", ") : "";
}

function locationSummary() {
    if (datePlan.customLocation && datePlan.customLocation.trim()) {
        return datePlan.customLocation.trim();
    }
    return datePlan.location || "";
}

function renderSummary(container) {
    if (!container) return { foods: "", location: "" };
    const foods = foodSummary();
    const location = locationSummary();
    container.innerHTML = "";
    container.appendChild(buildSummaryRow("📅", "Date", formatDate(datePlan.date)));
    container.appendChild(buildSummaryRow("⏰", "Time", formatTime(datePlan.time)));
    container.appendChild(buildSummaryRow("🍕", "Food", foods));
    container.appendChild(buildSummaryRow("📍", "Location", location));
    container.appendChild(buildSummaryRow("✨", "Date Style", datePlan.dateType));
    container.appendChild(buildSummaryRow("💌", "Message", datePlan.message || ""));
    return { foods, location };
}

/* ============================================================
   💬 WHATSAPP MESSAGE GENERATION
   Builds a friendly summary and opens wa.me with it.
   ============================================================ */

function buildWhatsAppMessage() {
    const foods = foodSummary();
    const location = locationSummary();

    const lines = [
        "❤️ DATE PLAN ❤️",
        "",
        "I said YES! ❤️",
        "",
        "📅 Date: " + formatDate(datePlan.date),
        "⏰ Time: " + formatTime(datePlan.time),
        "",
        "🍕 Food:",
        foods || "—",
        "",
        "📍 Location:",
        location || "—",
        "",
        "✨ Date Type:",
        datePlan.dateType || "—"
    ];

    if (datePlan.message && datePlan.message.trim()) {
        lines.push("", "💌 Message:", datePlan.message.trim());
    }

    lines.push("", "See you! ❤️");

    if (APP_CONFIG.senderName && APP_CONFIG.senderName !== "Your Name") {
        lines.push("- " + APP_CONFIG.senderName);
    }

    return lines.join("\n");
}

function sendWhatsApp() {
    const number = (WHATSAPP_NUMBER || "").replace(/[^0-9]/g, "");
    if (!number || number === "YOUR_NUMBER_HERE") {
        toast("Please set your WhatsApp number in script.js first ❤️");
        return;
    }
    const text = encodeURIComponent(buildWhatsAppMessage());
    window.open("https://wa.me/" + number + "?text=" + text, "_blank");
}
/* ============================================================
   🎊 CONFETTI (canvas-based celebration)
   ============================================================ */

const confettiPieces = [];
let confettiActive = false;

function launchConfetti() {
    const canvas = $("#confettiCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const colors = ["#ff5e92", "#ff8fb5", "#e5386b", "#b18cff", "#ffd3e2", "#ffffff", "#ffc3d8"];
    for (let i = 0; i < 140; i++) {
        confettiPieces.push({
            x: Math.random() * canvas.width,
            y: -20 - Math.random() * canvas.height * 0.4,
            w: 6 + Math.random() * 8,
            h: 8 + Math.random() * 8,
            vx: (Math.random() - 0.5) * 2.2,
            vy: 1.6 + Math.random() * 2.6,
            rot: Math.random() * Math.PI,
            vr: (Math.random() - 0.5) * 0.2,
            color: colors[Math.floor(Math.random() * colors.length)]
        });
    }

    confettiActive = true;
    let frame = 0;
    (function tick() {
        if (!confettiActive) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        confettiPieces.forEach((p) => {
            p.x += p.vx + Math.sin(frame * 0.02 + p.rot) * 0.8;
            p.y += p.vy;
            p.rot += p.vr;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            ctx.restore();
        });
        const finished = confettiPieces.every((p) => p.y > canvas.height + 30);
        frame++;
        if (!finished) {
            requestAnimationFrame(tick);
        } else {
            confettiActive = false;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            confettiPieces.length = 0;
        }
    })();
}

/* ============================================================
   💓 FLOATING HEARTS BACKGROUND
   ============================================================ */

const HEART_GLYPHS = ["❤️", "💖", "💕", "💗", "🌹", "✨"];

function spawnHearts() {
    const layer = $("#heartsLayer");
    if (!layer) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const make = () => {
        const span = document.createElement("span");
        span.className = "heart-float";
        span.textContent = HEART_GLYPHS[Math.floor(Math.random() * HEART_GLYPHS.length)];
        span.style.left = Math.random() * 100 + "vw";
        span.style.fontSize = (0.8 + Math.random() * 1.6) + "rem";
        span.style.animationDuration = (8 + Math.random() * 10) + "s";
        span.style.animationDelay = (Math.random() * 6) + "s";
        layer.appendChild(span);
        span.addEventListener("animationend", () => span.remove());
    };

    const idle = () => {
        if (layer.childElementCount < 18) make();
        setTimeout(idle, 650);
    };
    idle();
}

/* Quick festive burst of floating hearts (used on Continue tap). */
function burstHearts(count) {
    const layer = $("#heartsLayer");
    if (!layer) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    for (let i = 0; i < (count || 12); i++) {
        const span = document.createElement("span");
        span.className = "heart-float";
        span.textContent = HEART_GLYPHS[Math.floor(Math.random() * HEART_GLYPHS.length)];
        span.style.left = Math.random() * 100 + "vw";
        span.style.fontSize = (0.9 + Math.random() * 1.8) + "rem";
        span.style.animationDuration = (2 + Math.random() * 3) + "s";
        span.style.animationDelay = "0s";
        layer.appendChild(span);
        span.addEventListener("animationend", () => span.remove());
    }
}

/* ============================================================
   🚦 VALIDATION HELPERS
   ============================================================ */

function validateDateStep() {
    const d = $("#dateInput").value;
    const t = $("#timeInput").value;

    if (!d) {
        toast("Please choose a date ❤️");
        return false;
    }

    // Reject dates in the past
    const [y, m, day] = d.split("-").map(Number);
    const chosen = new Date(y, m - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (chosen < today) {
        toast("That date has passed 🥺 Please pick a future one ❤️");
        return false;
    }

    if (!t) {
        toast("Please choose a time ⏰");
        return false;
    }

    datePlan.date = d;
    datePlan.time = t;
    savePlan();
    return true;
}

function validateFoodStep() {
    const other = $("#otherFoodInput").value.trim();
    if (!datePlan.foods.length && !other) {
        toast("Choose something delicious 😋");
        return false;
    }
    datePlan.otherFood = other;
    savePlan();
    return true;
}

function validateLocationStep() {
    const custom = $("#customLocationInput").value.trim();
    if (!datePlan.location && !custom) {
        toast("Where should we go? 📍");
        return false;
    }
    datePlan.customLocation = custom;
    savePlan();
    return true;
}

function validateStyleStep() {
    if (!datePlan.dateType) {
        toast("Pick a date style ✨");
        return false;
    }
    savePlan();
    return true;
}
/* ============================================================
   🎵 BACKGROUND MUSIC
   Starts when she taps YES (user gesture — autoplay is allowed
   by browsers only after interaction). Loops continuously and
   keeps playing across every screen. One audio element only.
   ============================================================ */

const backgroundMusic = document.getElementById("backgroundMusic");
const musicButton = document.getElementById("musicButton");

function startMusic() {
    if (!backgroundMusic) return;
    backgroundMusic.volume = 0.35;
    backgroundMusic.play().then(() => {
        if (musicButton) {
            musicButton.textContent = "🔊";
            musicButton.classList.add("on");
            musicButton.setAttribute("aria-label", "Music on — tap to mute");
        }
    }).catch((error) => {
        console.log("Background music could not start:", error);
    });
}

function stopMusic() {
    if (!backgroundMusic) return;
    backgroundMusic.pause();
    if (musicButton) {
        musicButton.textContent = "🎵";
        musicButton.classList.remove("on");
        musicButton.setAttribute("aria-label", "Music off — tap to play");
    }
}

function toggleMusic() {
    if (!backgroundMusic) return;
    if (backgroundMusic.paused) {
        startMusic();
    } else {
        stopMusic();
    }
}

/* ============================================================
   🎬 ACTION ROUTER (handles [data-action] buttons)
   ============================================================ */

function handleAction(action) {
    switch (action) {
        // ---- Introduction screen ----
        case "continueIntro":
            burstHearts(16);
            startMusic();
            const intro = document.getElementById("screen-intro");
            if (intro) intro.classList.add("leaving");
            setTimeout(() => {
                showScreen("screen-landing");
                if (intro) intro.classList.remove("leaving");
            }, 480);
            break;

        // ---- Landing ----
        case "yes":
            datePlan.answer = "yes";
            savePlan();
            startMusic();
            showScreen("screen-yay");
            break;

        case "no":
            datePlan.answer = "no";
            savePlan();
            showScreen("screen-no");
            break;

        // ---- YES flow ----
        case "startPlanning":
            renderFoods();
            renderLocations();
            renderStyles();
            populateFields();
            showScreen("screen-date");
            break;

        // ---- NO flow ----
        case "no-maybe":
            showScreen("screen-no-maybe");
            break;

        case "maybe-plan":
            datePlan.answer = "yes";
            savePlan();
            renderFoods();
            renderLocations();
            renderStyles();
            populateFields();
            showScreen("screen-yay");
            break;

        case "no-think":
            showScreen("screen-no-think");
            break;

        case "no-final":
            showScreen("screen-no-final");
            break;

        case "closePage":
            toast("You can close this tab anytime ❤️ No hard feelings.");
            break;

        // ---- Planning navigation ----
        case "back":
            goBack();
            break;

        case "continue":
            handleContinue();
            break;

        case "review":
            datePlan.message = ($("#messageInput").value || "").trim();
            savePlan();
            renderSummary($("#summaryCard"));
            showScreen("screen-confirm");
            break;

        case "confirm":
            renderSummary($("#finalSummary"));
            showScreen("screen-success");
            launchConfetti();
            break;

        case "change":
            // Back to the first planning step (Date) so she can adjust
            populateFields();
            showScreen("screen-date");
            break;

        case "startOver":
            openStartOverModal();
            break;

        case "cancelStartOver":
            closeStartOverModal();
            break;

        case "confirmStartOver":
            closeStartOverModal();
            doStartOver();
            break;

        case "whatsapp":
            sendWhatsApp();
            break;

        default:
            break;
    }
}

/* ============================================================
   🧭 NAVIGATION HELPERS
   ============================================================ */

/* Decide where the "Continue" button leads based on the step. */
function handleContinue() {
    const current = $(".screen.active");
    if (!current) return;
    switch (current.id) {
        case "screen-date":
            if (validateDateStep()) showScreen("screen-food");
            break;
        case "screen-food":
            if (validateFoodStep()) showScreen("screen-location");
            break;
        case "screen-location":
            if (validateLocationStep()) showScreen("screen-style");
            break;
        case "screen-style":
            if (validateStyleStep()) showScreen("screen-message");
            break;
        default:
            break;
    }
}

/* Back navigation within the planning steps. */
function goBack() {
    const current = $(".screen.active");
    if (!current) return;
    switch (current.id) {
        case "screen-date":
            showScreen("screen-yay");
            break;
        case "screen-food":
            showScreen("screen-date");
            break;
        case "screen-location":
            showScreen("screen-food");
            break;
        case "screen-style":
            showScreen("screen-location");
            break;
        case "screen-message":
            showScreen("screen-style");
            break;
        case "screen-confirm":
            showScreen("screen-message");
            break;
        default:
            break;
    }
}

/* ============================================================
   🔄 START OVER (with confirmation modal)
   ============================================================ */

function openStartOverModal() {
    const modal = $("#startOverModal");
    if (!modal) return;
    modal.hidden = false;
    const ok = modal.querySelector('[data-action="confirmStartOver"]');
    if (ok) ok.focus();
}

function closeStartOverModal() {
    const modal = $("#startOverModal");
    if (modal) modal.hidden = true;
}

/* Actually clear stored data and return to the very beginning. */
function doStartOver() {
    clearSaved();
    Object.keys(datePlan).forEach((k) => {
        datePlan[k] = Array.isArray(datePlan[k]) ? [] : "";
    });
    populateFields();
    showScreen(LANDING);
    toast("Started over 🧡 Ready when you are!");
}
/* ============================================================
   ⚙️ SETUP & INITIALISATION
   ============================================================ */

/* Personalise the question with the recipient's name (if set). */
function applyConfig() {
    const recipient = (APP_CONFIG.recipientName || "").trim();
    if (recipient) {
        const title = $("#landingTitle");
        if (title) title.textContent = "Will You Go On A Date With Me, " + recipient + "? ❤️";
        const eyebrow = $("#landingEyebrow");
        if (eyebrow) eyebrow.textContent = "A little question for " + recipient + "...";
    }
}

/* Stop past dates being selected. */
function setupDateMin() {
    const input = $("#dateInput");
    if (!input) return;
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    input.min = d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
}

/* Keep every input synced to state as the user types / picks. */
function setupInputs() {
    const bind = (id, key) => {
        const node = $(id);
        if (!node) return;
        node.addEventListener("input", (e) => {
            datePlan[key] = e.target.value;
            savePlan();
        });
    };
    bind("#dateInput", "date");
    bind("#timeInput", "time");
    bind("#otherFoodInput", "otherFood");
    bind("#customLocationInput", "customLocation");
    bind("#messageInput", "message");
}

/* Central click handling for all [data-action] buttons. */
function bindActions() {
    document.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-action]");
        if (!btn) return;
        e.preventDefault();
        handleAction(btn.dataset.action);
    });
}

/* Restore progress after a refresh — jump to the furthest step reached. */
function restoreProgress() {
    if (datePlan.answer !== "yes") return;
    renderFoods();
    renderLocations();
    renderStyles();
    populateFields();

    let target = "screen-date";
    if (datePlan.date && datePlan.time) target = "screen-food";
    if (datePlan.foods.length || datePlan.otherFood) target = "screen-location";
    if (datePlan.location || datePlan.customLocation) target = "screen-style";
    if (datePlan.dateType) target = "screen-message";
    if (datePlan.message) target = "screen-confirm";
    showScreen(target);
}

/* Boot the app once the DOM is ready. */
function init() {
    loadPlan();
    applyConfig();
    setupDateMin();
    setupInputs();
    bindActions();

    // Close the Start Over modal with the Escape key
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            const modal = $("#startOverModal");
            if (modal && !modal.hidden) closeStartOverModal();
        }
    });

    // Clicking the modal backdrop closes it (unless clicking inside the box)
    const modal = $("#startOverModal");
    if (modal) {
        modal.addEventListener("click", (e) => {
            if (e.target === modal) closeStartOverModal();
        });
    }

    // Music control button (top-right corner)
    if (musicButton) {
        musicButton.addEventListener("click", toggleMusic);
    }

    renderFoods();
    renderLocations();
    renderStyles();
    populateFields();
    spawnHearts();
    restoreProgress();
}

document.addEventListener("DOMContentLoaded", init);
