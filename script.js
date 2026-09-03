// ======================================================
// LOCALLIFT - SCRIPT.JS
// ======================================================

// ---------- SUPABASE CONFIG ----------
const SUPABASE_URL = "https://lhfpowxkmbyyewwxihtw.supabase.co";

// PASTE YOUR EXISTING SUPABASE PUBLISHABLE/ANON KEY HERE
const SUPABASE_KEY = "sb_publishable_PvjBQAO6FTmtv-F1KYPZVg_6sYUZf84";

// ---------- LOCALLIFT WHATSAPP ----------
const OWNER_CONTACT = "923498092089";

// ---------- DOM ----------
const businessGrid = document.getElementById("businessGrid");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const locationFilter = document.getElementById("locationFilter");
const sortSelect = document.getElementById("sortSelect");

let businesses = [];
let filteredBusinesses = [];

// ======================================================
// DEMO BUSINESSES
// These are only shown if Supabase has no businesses.
// ======================================================

const demoBusinesses = [
    {
        id: "demo-1",
        name: "LocalLift Electronics",
        category: "Electronics",
        location: "Mirpur",
        phone: "03000000000",
        description: "Phones, accessories and everyday electronics.",
        plan: "premium"
    },
    {
        id: "demo-2",
        name: "Mangla Sports Hub",
        category: "Sports",
        location: "Mangla",
        phone: "03111111111",
        description: "Cricket equipment, sports accessories and more.",
        plan: "featured"
    },
    {
        id: "demo-3",
        name: "Mirpur Fashion Store",
        category: "Fashion",
        location: "Mirpur",
        phone: "03222222222",
        description: "Modern clothing and fashion accessories.",
        plan: "free"
    }
];

// ======================================================
// INITIALIZE
// ======================================================

document.addEventListener("DOMContentLoaded", () => {
    loadBusinesses();
    setupEvents();
    updateFavoriteCount();
});

// ======================================================
// LOAD BUSINESSES FROM SUPABASE
// ======================================================

async function loadBusinesses() {
    showLoading();

    try {
        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/Business?select=*`,
            {
                method: "GET",
                headers: {
                    apikey: SUPABASE_KEY,
                    Authorization: `Bearer ${SUPABASE_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText);
        }

        const data = await response.json();

        businesses = Array.isArray(data) && data.length > 0
            ? data
            : demoBusinesses;

        filteredBusinesses = [...businesses];

        populateFilters();
        renderBusinesses();
        updateStats();

    } catch (error) {
        console.error("Supabase error:", error);

        // Keep the site usable if Supabase temporarily fails.
        businesses = [...demoBusinesses];
        filteredBusinesses = [...businesses];

        populateFilters();
        renderBusinesses();
        updateStats();

        showToast(
            "Could not connect to the database. Showing demo businesses.",
            "error"
        );
    }
}

// ======================================================
// RENDER BUSINESSES
// ======================================================

function renderBusinesses() {
    if (!businessGrid) return;

    if (filteredBusinesses.length === 0) {
        businessGrid.innerHTML = `
            <div class="empty-state">
                <h3>No businesses found</h3>
                <p>Try another search or category.</p>
            </div>
        `;
        return;
    }

    businessGrid.innerHTML = filteredBusinesses
        .map((business) => createBusinessCard(business))
        .join("");
}

// ======================================================
// BUSINESS CARD
// ======================================================

function createBusinessCard(business) {
    const name = escapeHTML(business.name || "Unnamed Business");
    const category = escapeHTML(business.category || "General");
    const location = escapeHTML(business.location || "Not specified");
    const phone = escapeHTML(business.phone || "");
    const description = escapeHTML(
        business.description || "No description available."
    );

    const id = String(business.id || "");
    const plan = business.plan || "free";

    const isFavorite = getFavorites().includes(id);

    let badge = "";

    if (plan === "premium") {
        badge = `<span class="business-badge premium">PREMIUM</span>`;
    } else if (plan === "featured") {
        badge = `<span class="business-badge featured">FEATURED</span>`;
    }

    return `
        <article class="business-card">

            <div class="business-card-top">
                <div class="business-icon">
                    ${getCategoryIcon(category)}
                </div>

                ${badge}

                <button
                    class="favorite-btn ${isFavorite ? "active" : ""}"
                    onclick="toggleFavorite('${escapeJS(id)}')"
                    aria-label="Favorite business"
                >
                    ${isFavorite ? "♥" : "♡"}
                </button>
            </div>

            <div class="business-card-body">

                <p class="business-category">
                    ${category}
                </p>

                <h3>
                    ${name}
                </h3>

                <p class="business-location">
                    📍 ${location}
                </p>

                <p class="business-description">
                    ${description}
                </p>

                <div class="business-actions">

                    <button
                        class="details-btn"
                        onclick="openBusinessDetails('${escapeJS(id)}')"
                    >
                        View Details
                    </button>

                    ${
                        phone
                            ? `
                            <a
                                class="call-btn"
                                href="tel:${escapeHTML(phone)}"
                            >
                                Call
                            </a>
                            `
                            : ""
                    }

                </div>

            </div>
        </article>
    `;
}

// ======================================================
// CATEGORY ICONS
// ======================================================

function getCategoryIcon(category) {
    const value = String(category).toLowerCase();

    if (value.includes("food") || value.includes("restaurant")) return "🍽️";
    if (value.includes("shop")) return "🛍️";
    if (value.includes("fashion")) return "👕";
    if (value.includes("electronic")) return "📱";
    if (value.includes("sport")) return "🏏";
    if (value.includes("education")) return "📚";
    if (value.includes("beauty")) return "💈";
    if (value.includes("medical")) return "🏥";
    if (value.includes("car") || value.includes("auto")) return "🚗";
    if (value.includes("hotel")) return "🏨";

    return "🏢";
}

// ======================================================
// SEARCH + FILTERS
// ======================================================

function setupEvents() {
    if (searchInput) {
        searchInput.addEventListener("input", applyFilters);
    }

    if (categoryFilter) {
        categoryFilter.addEventListener("change", applyFilters);
    }

    if (locationFilter) {
        locationFilter.addEventListener("change", applyFilters);
    }

    if (sortSelect) {
        sortSelect.addEventListener("change", applyFilters);
    }
}

function applyFilters() {
    const search = String(searchInput?.value || "")
        .toLowerCase()
        .trim();

    const category = String(categoryFilter?.value || "")
        .toLowerCase();

    const location = String(locationFilter?.value || "")
        .toLowerCase();

    filteredBusinesses = businesses.filter((business) => {
        const name = String(business.name || "").toLowerCase();
        const businessCategory = String(
            business.category || ""
        ).toLowerCase();

        const businessLocation = String(
            business.location || ""
        ).toLowerCase();

        const description = String(
            business.description || ""
        ).toLowerCase();

        const matchesSearch =
            !search ||
            name.includes(search) ||
            businessCategory.includes(search) ||
            businessLocation.includes(search) ||
            description.includes(search);

        const matchesCategory =
            !category ||
            businessCategory === category;

        const matchesLocation =
            !location ||
            businessLocation === location;

        return (
            matchesSearch &&
            matchesCategory &&
            matchesLocation
        );
    });

    sortBusinesses();
    renderBusinesses();
}

// ======================================================
// SORT
// ======================================================

function sortBusinesses() {
    const sort = sortSelect?.value || "featured";

    if (sort === "name") {
        filteredBusinesses.sort((a, b) =>
            String(a.name || "").localeCompare(
                String(b.name || "")
            )
        );
    }

    if (sort === "newest") {
        filteredBusinesses.sort(
            (a, b) =>
                new Date(b.created_at || 0) -
                new Date(a.created_at || 0)
        );
    }

    if (sort === "featured") {
        const rank = {
            premium: 3,
            featured: 2,
            free: 1
        };

        filteredBusinesses.sort(
            (a, b) =>
                (rank[b.plan] || 1) -
                (rank[a.plan] || 1)
        );
    }
}

// ======================================================
// FILTER OPTIONS
// ======================================================

function populateFilters() {
    if (categoryFilter) {
        const categories = [
            ...new Set(
                businesses
                    .map((b) => b.category)
                    .filter(Boolean)
            )
        ].sort();

        categoryFilter.innerHTML =
            `<option value="">All Categories</option>` +
            categories
                .map(
                    (category) =>
                        `<option value="${escapeHTML(
                            category
                        )}">${escapeHTML(category)}</option>`
                )
                .join("");
    }

    if (locationFilter) {
        const locations = [
            ...new Set(
                businesses
                    .map((b) => b.location)
                    .filter(Boolean)
            )
        ].sort();

        locationFilter.innerHTML =
            `<option value="">All Locations</option>` +
            locations
                .map(
                    (location) =>
                        `<option value="${escapeHTML(
                            location
                        )}">${escapeHTML(location)}</option>`
                )
                .join("");
    }
}

// ======================================================
// ADD BUSINESS
// ======================================================

async function addBusiness(event) {
    event.preventDefault();

    const form = event.target;

    const name = form.name?.value.trim();
    const category = form.category?.value.trim();
    const location = form.location?.value.trim();
    const phone = form.phone?.value.trim();
    const description = form.description?.value.trim();

    if (!name || !category || !location) {
        showToast(
            "Please fill in the required fields.",
            "error"
        );
        return;
    }

    const businessData = {
        name,
        category,
        location,
        phone: phone || "",
        description: description || ""
    };

    try {
        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/Business`,
            {
                method: "POST",
                headers: {
                    apikey: SUPABASE_KEY,
                    Authorization: `Bearer ${SUPABASE_KEY}`,
                    "Content-Type": "application/json",
                    Prefer: "return=representation"
                },
                body: JSON.stringify(businessData)
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText);
        }

        showToast(
            "Your business has been added to LocalLift! 🔥",
            "success"
        );

        form.reset();

        await loadBusinesses();

    } catch (error) {
        console.error("Insert error:", error);

        showToast(
            "Could not add the business. Check your Supabase setup.",
            "error"
        );
    }
}

// ======================================================
// BUSINESS DETAILS
// ======================================================

function openBusinessDetails(id) {
    const business = businesses.find(
        (item) => String(item.id) === String(id)
    );

    if (!business) return;

    const existingModal =
        document.getElementById("businessModal");

    if (existingModal) {
        existingModal.remove();
    }

    const name = escapeHTML(business.name || "Business");
    const category = escapeHTML(
        business.category || "General"
    );
    const location = escapeHTML(
        business.location || "Not specified"
    );
    const phone = escapeHTML(business.phone || "");
    const description = escapeHTML(
        business.description || "No description available."
    );

    const modal = document.createElement("div");

    modal.id = "businessModal";
    modal.className = "custom-modal";

    modal.innerHTML = `
        <div class="modal-overlay" onclick="closeBusinessDetails()"></div>

        <div class="modal-content">

            <button
                class="modal-close"
                onclick="closeBusinessDetails()"
            >
                ×
            </button>

            <div class="business-icon large">
                ${getCategoryIcon(category)}
            </div>

            <p class="business-category">
                ${category}
            </p>

            <h2>${name}</h2>

            <p>📍 ${location}</p>

            <p class="modal-description">
                ${description}
            </p>

            ${
                phone
                    ? `
                    <a
                        class="primary-btn"
                        href="tel:${phone}"
                    >
                        Call Business
                    </a>
                    `
                    : ""
            }

        </div>
    `;

    document.body.appendChild(modal);
}

function closeBusinessDetails() {
    const modal =
        document.getElementById("businessModal");

    if (modal) {
        modal.remove();
    }
}

// ======================================================
// FAVORITES
// ======================================================

function getFavorites() {
    try {
        return JSON.parse(
            localStorage.getItem("locallift_favorites") || "[]"
        );
    } catch {
        return [];
    }
}

function toggleFavorite(id) {
    const favorites = getFavorites();

    const index = favorites.indexOf(String(id));

    if (index >= 0) {
        favorites.splice(index, 1);
        showToast("Removed from favorites.");
    } else {
        favorites.push(String(id));
        showToast("Added to favorites ❤️", "success");
    }

    localStorage.setItem(
        "locallift_favorites",
        JSON.stringify(favorites)
    );

    updateFavoriteCount();
    renderBusinesses();
}

function updateFavoriteCount() {
    const count = getFavorites().length;

    const elements = document.querySelectorAll(
        ".favorite-count"
    );

    elements.forEach((element) => {
        element.textContent = count;
    });
}

// ======================================================
// MONETIZATION / WHATSAPP
// ======================================================

function openPromotionRequest(plan) {
    const existingModal =
        document.getElementById("promotionModal");

    if (existingModal) {
        existingModal.remove();
    }

    const safePlan = escapeHTML(plan);

    const modal = document.createElement("div");

    modal.id = "promotionModal";
    modal.className = "custom-modal";

    modal.innerHTML = `
        <div
            class="modal-overlay"
            onclick="closePromotionRequest()"
        ></div>

        <div class="modal-content">

            <button
                class="modal-close"
                onclick="closePromotionRequest()"
            >
                ×
            </button>

            <div class="business-icon large">
                🚀
            </div>

            <h2>Promote Your Business</h2>

            <p>
                You selected the
                <strong>${safePlan}</strong>
                package.
            </p>

            <form
                onsubmit="submitPromotionRequest(event)"
            >

                <input
                    type="hidden"
                    name="plan"
                    value="${safePlan}"
                >

                <input
                    type="text"
                    name="businessName"
                    placeholder="Business name"
                    required
                >

                <input
                    type="text"
                    name="ownerName"
                    placeholder="Your name"
                    required
                >

                <input
                    type="tel"
                    name="phone"
                    placeholder="Your phone number"
                    required
                >

                <button
                    type="submit"
                    class="primary-btn"
                >
                    Continue on WhatsApp
                </button>

            </form>

            <small>
                You'll be redirected to WhatsApp with your request prepared.
            </small>

        </div>
    `;

    document.body.appendChild(modal);
}

function closePromotionRequest() {
    const modal =
        document.getElementById("promotionModal");

    if (modal) {
        modal.remove();
    }
}

function submitPromotionRequest(event) {
    event.preventDefault();

    const form = event.target;

    const plan = form.plan.value;
    const businessName =
        form.businessName.value.trim();

    const ownerName =
        form.ownerName.value.trim();

    const phone =
        form.phone.value.trim();

    if (!businessName || !ownerName || !phone) {
        showToast(
            "Please complete all fields.",
            "error"
        );
        return;
    }

    const message = `
Hi LocalLift! 👋

I want to promote my business.

Business: ${businessName}
Owner: ${ownerName}
Phone: ${phone}
Package: ${plan}

Please send me the payment details and next steps.
`.trim();

    const whatsappURL =
        `https://wa.me/${OWNER_CONTACT}?text=${encodeURIComponent(
            message
        )}`;

    closePromotionRequest();

    window.open(
        whatsappURL,
        "_blank",
        "noopener,noreferrer"
    );
}

// ======================================================
// STATS
// ======================================================

function updateStats() {
    const businessCount =
        document.querySelector(".business-count");

    const categoryCount =
        document.querySelector(".category-count");

    const locationCount =
        document.querySelector(".location-count");

    if (businessCount) {
        businessCount.textContent =
            businesses.length;
    }

    if (categoryCount) {
        categoryCount.textContent =
            new Set(
                businesses
                    .map((b) => b.category)
                    .filter(Boolean)
            ).size;
    }

    if (locationCount) {
        locationCount.textContent =
            new Set(
                businesses
                    .map((b) => b.location)
                    .filter(Boolean)
            ).size;
    }
}

// ======================================================
// LOADING
// ======================================================

function showLoading() {
    if (!businessGrid) return;

    businessGrid.innerHTML = `
        <div class="loading-state">
            <div class="loader"></div>
            <p>Loading businesses...</p>
        </div>
    `;
}

// ======================================================
// TOAST
// ======================================================

function showToast(message, type = "info") {
    const oldToast =
        document.querySelector(".locallift-toast");

    if (oldToast) {
        oldToast.remove();
    }

    const toast = document.createElement("div");

    toast.className =
        `locallift-toast ${type}`;

    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add("show");
    }, 20);

    setTimeout(() => {
        toast.classList.remove("show");

        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3500);
}

// ======================================================
// SECURITY HELPERS
// ======================================================

function escapeHTML(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function escapeJS(value) {
    return String(value)
        .replaceAll("\\", "\\\\")
        .replaceAll("'", "\\'");
}

// ======================================================
// GLOBAL FUNCTIONS
// ======================================================

window.addBusiness = addBusiness;
window.openBusinessDetails = openBusinessDetails;
window.closeBusinessDetails = closeBusinessDetails;
window.toggleFavorite = toggleFavorite;
window.openPromotionRequest = openPromotionRequest;
window.closePromotionRequest = closePromotionRequest;
window.submitPromotionRequest = submitPromotionRequest;