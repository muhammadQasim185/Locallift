// ======================================================
// LOCALLIFT - SCRIPT.JS
// ======================================================

// ---------- SUPABASE CONFIG ----------
const SUPABASE_URL = "https://lhfpowxkmbyyewwxihtw.supabase.co";

// Your existing Supabase publishable/anon key
const SUPABASE_KEY = "sb_publishable_PvjBQAO6FTmtv-F1KYPZVg_6sYUZf84";

// ---------- YOUR WHATSAPP ----------
const OWNER_CONTACT = "923498092089";

// ---------- DATA ----------
let businesses = [];
let filteredBusinesses = [];

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
// START
// ======================================================

document.addEventListener("DOMContentLoaded", function () {
    setupEvents();
    loadBusinesses();
    updateFavoriteCount();
});

// ======================================================
// LOAD BUSINESSES
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
            const error = await response.text();
            throw new Error(error);
        }

        const data = await response.json();

        if (Array.isArray(data) && data.length > 0) {
            businesses = data;
        } else {
            businesses = [...demoBusinesses];
        }

        filteredBusinesses = [...businesses];

        populateFilters();
        sortBusinesses();
        renderBusinesses();
        updateStats();

    } catch (error) {
        console.error("Supabase error:", error);

        businesses = [...demoBusinesses];
        filteredBusinesses = [...businesses];

        populateFilters();
        sortBusinesses();
        renderBusinesses();
        updateStats();

        showToast(
            "Database connection failed. Showing demo businesses.",
            "error"
        );
    }
}

// ======================================================
// RENDER BUSINESSES
// ======================================================

function renderBusinesses() {
    const grid = document.getElementById("businessGrid");

    if (!grid) return;

    if (filteredBusinesses.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <h3>No businesses found</h3>
                <p>Try another search or category.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = filteredBusinesses
        .map(createBusinessCard)
        .join("");
}

// ======================================================
// BUSINESS CARD
// ======================================================

function createBusinessCard(business) {
    const id = String(business.id || "");

    const name = escapeHTML(
        business.name || "Unnamed Business"
    );

    const category = escapeHTML(
        business.category || "General"
    );

    const location = escapeHTML(
        business.location || "Not specified"
    );

    const phone = escapeHTML(
        business.phone || ""
    );

    const description = escapeHTML(
        business.description ||
        "No description available."
    );

    const plan = String(
        business.plan || "free"
    ).toLowerCase();

    const favorite =
        getFavorites().includes(id);

    let badge = "";

    if (plan === "premium") {
        badge =
            `<span class="business-badge premium">PREMIUM</span>`;
    }

    if (plan === "featured") {
        badge =
            `<span class="business-badge featured">FEATURED</span>`;
    }

    return `
        <article class="business-card">

            <div class="business-card-top">

                <div class="business-icon">
                    ${getCategoryIcon(category)}
                </div>

                ${badge}

                <button
                    type="button"
                    class="favorite-btn ${favorite ? "active" : ""}"
                    onclick="toggleFavorite('${escapeJS(id)}')"
                    aria-label="Favorite ${name}"
                >
                    ${favorite ? "♥" : "♡"}
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
                        type="button"
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
                                    href="tel:${phone}"
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
// CATEGORY ICON
// ======================================================

function getCategoryIcon(category) {
    const value =
        String(category || "").toLowerCase();

    if (
        value.includes("food") ||
        value.includes("restaurant")
    ) {
        return "🍽️";
    }

    if (
        value.includes("shop") ||
        value.includes("store")
    ) {
        return "🛍️";
    }

    if (value.includes("fashion")) {
        return "👕";
    }

    if (
        value.includes("electronic") ||
        value.includes("mobile") ||
        value.includes("phone")
    ) {
        return "📱";
    }

    if (value.includes("sport")) {
        return "🏏";
    }

    if (
        value.includes("education") ||
        value.includes("school")
    ) {
        return "📚";
    }

    if (
        value.includes("beauty") ||
        value.includes("salon")
    ) {
        return "💈";
    }

    if (
        value.includes("medical") ||
        value.includes("hospital") ||
        value.includes("doctor")
    ) {
        return "🏥";
    }

    if (
        value.includes("car") ||
        value.includes("auto")
    ) {
        return "🚗";
    }

    if (value.includes("hotel")) {
        return "🏨";
    }

    return "🏢";
}

// ======================================================
// SEARCH / FILTERS
// ======================================================

function setupEvents() {
    const searchInput =
        document.getElementById("searchInput");

    const categoryFilter =
        document.getElementById("categoryFilter");

    const locationFilter =
        document.getElementById("locationFilter");

    const sortSelect =
        document.getElementById("sortSelect");

    if (searchInput) {
        searchInput.addEventListener(
            "input",
            applyFilters
        );
    }

    if (categoryFilter) {
        categoryFilter.addEventListener(
            "change",
            applyFilters
        );
    }

    if (locationFilter) {
        locationFilter.addEventListener(
            "change",
            applyFilters
        );
    }

    if (sortSelect) {
        sortSelect.addEventListener(
            "change",
            applyFilters
        );
    }
}

function applyFilters() {
    const searchInput =
        document.getElementById("searchInput");

    const categoryFilter =
        document.getElementById("categoryFilter");

    const locationFilter =
        document.getElementById("locationFilter");

    const search =
        String(
            searchInput?.value || ""
        )
        .toLowerCase()
        .trim();

    const category =
        String(
            categoryFilter?.value || ""
        )
        .toLowerCase()
        .trim();

    const location =
        String(
            locationFilter?.value || ""
        )
        .toLowerCase()
        .trim();

    filteredBusinesses =
        businesses.filter(function (business) {

            const name =
                String(
                    business.name || ""
                )
                .toLowerCase();

            const businessCategory =
                String(
                    business.category || ""
                )
                .toLowerCase();

            const businessLocation =
                String(
                    business.location || ""
                )
                .toLowerCase();

            const description =
                String(
                    business.description || ""
                )
                .toLowerCase();

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
    const sortSelect =
        document.getElementById("sortSelect");

    const sort =
        sortSelect?.value || "featured";

    if (sort === "name") {
        filteredBusinesses.sort(
            function (a, b) {
                return String(
                    a.name || ""
                ).localeCompare(
                    String(b.name || "")
                );
            }
        );
    }

    if (sort === "newest") {
        filteredBusinesses.sort(
            function (a, b) {
                return (
                    new Date(
                        b.created_at || 0
                    ) -
                    new Date(
                        a.created_at || 0
                    )
                );
            }
        );
    }

    if (sort === "featured") {
        const rank = {
            premium: 3,
            featured: 2,
            free: 1
        };

        filteredBusinesses.sort(
            function (a, b) {
                const planA =
                    String(
                        a.plan || "free"
                    ).toLowerCase();

                const planB =
                    String(
                        b.plan || "free"
                    ).toLowerCase();

                return (
                    (rank[planB] || 1) -
                    (rank[planA] || 1)
                );
            }
        );
    }
}

// ======================================================
// FILTER OPTIONS
// ======================================================

function populateFilters() {
    const categoryFilter =
        document.getElementById(
            "categoryFilter"
        );

    const locationFilter =
        document.getElementById(
            "locationFilter"
        );

    if (categoryFilter) {

        const categories = [
            ...new Set(
                businesses
                    .map(
                        function (business) {
                            return business.category;
                        }
                    )
                    .filter(Boolean)
            )
        ].sort();

        categoryFilter.innerHTML =
            `<option value="">All Categories</option>` +
            categories
                .map(
                    function (category) {
                        return `
                            <option value="${escapeHTML(category)}">
                                ${escapeHTML(category)}
                            </option>
                        `;
                    }
                )
                .join("");
    }

    if (locationFilter) {

        const locations = [
            ...new Set(
                businesses
                    .map(
                        function (business) {
                            return business.location;
                        }
                    )
                    .filter(Boolean)
            )
        ].sort();

        locationFilter.innerHTML =
            `<option value="">All Locations</option>` +
            locations
                .map(
                    function (location) {
                        return `
                            <option value="${escapeHTML(location)}">
                                ${escapeHTML(location)}
                            </option>
                        `;
                    }
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

    const name =
        form.name?.value.trim();

    const category =
        form.category?.value.trim();

    const location =
        form.location?.value.trim();

    const phone =
        form.phone?.value.trim();

    const description =
        form.description?.value.trim();

    if (
        !name ||
        !category ||
        !location
    ) {
        showToast(
            "Please fill in the required fields.",
            "error"
        );

        return;
    }

    const businessData = {
        name: name,
        category: category,
        location: location,
        phone: phone || "",
        description: description || ""
    };

    try {

        const response =
            await fetch(
                `${SUPABASE_URL}/rest/v1/Business`,
                {
                    method: "POST",

                    headers: {
                        apikey: SUPABASE_KEY,
                        Authorization:
                            `Bearer ${SUPABASE_KEY}`,
                        "Content-Type":
                            "application/json",
                        Prefer:
                            "return=representation"
                    },

                    body:
                        JSON.stringify(
                            businessData
                        )
                }
            );

        if (!response.ok) {
            const error =
                await response.text();

            throw new Error(error);
        }

        form.reset();

        showToast(
            "Your business has been added to LocalLift! 🔥",
            "success"
        );

        await loadBusinesses();

    } catch (error) {

        console.error(
            "Insert error:",
            error
        );

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

    const business =
        businesses.find(
            function (business) {
                return String(
                    business.id
                ) === String(id);
            }
        );

    if (!business) return;

    closeBusinessDetails();

    const modal =
        document.createElement("div");

    modal.id =
        "businessModal";

    modal.className =
        "custom-modal";

    const name =
        escapeHTML(
            business.name ||
            "Business"
        );

    const category =
        escapeHTML(
            business.category ||
            "General"
        );

    const location =
        escapeHTML(
            business.location ||
            "Not specified"
        );

    const description =
        escapeHTML(
            business.description ||
            "No description available."
        );

    const phone =
        escapeHTML(
            business.phone ||
            ""
        );

    modal.innerHTML = `
        <div
            class="modal-overlay"
            onclick="closeBusinessDetails()"
        ></div>

        <div class="modal-content">

            <button
                type="button"
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

            <h2>
                ${name}
            </h2>

            <p>
                📍 ${location}
            </p>

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
        document.getElementById(
            "businessModal"
        );

    if (modal) {
        modal.remove();
    }
}

// ======================================================
// FAVORITES
// ======================================================

function getFavorites() {
    try {

        const saved =
            localStorage.getItem(
                "locallift_favorites"
            );

        const favorites =
            JSON.parse(
                saved || "[]"
            );

        return Array.isArray(
            favorites
        )
            ? favorites
            : [];

    } catch (error) {

        console.error(
            "Favorites error:",
            error
        );

        return [];
    }
}

function toggleFavorite(id) {

    const favorites =
        getFavorites();

    const stringId =
        String(id);

    const index =
        favorites.indexOf(
            stringId
        );

    if (index >= 0) {

        favorites.splice(
            index,
            1
        );

        showToast(
            "Removed from favorites."
        );

    } else {

        favorites.push(
            stringId
        );

        showToast(
            "Added to favorites ❤️",
            "success"
        );
    }

    localStorage.setItem(
        "locallift_favorites",
        JSON.stringify(
            favorites
        )
    );

    updateFavoriteCount();
    renderBusinesses();
}

function updateFavoriteCount() {

    const count =
        getFavorites().length;

    document
        .querySelectorAll(
            ".favorite-count"
        )
        .forEach(
            function (element) {
                element.textContent =
                    count;
            }
        );
}

// ======================================================
// PROMOTION REQUEST
// ======================================================

function openPromotionRequest(plan) {

    const oldModal =
        document.getElementById(
            "promotionModal"
        );

    if (oldModal) {
        oldModal.remove();
    }

    const selectedPlan =
        String(
            plan ||
            "Featured — Rs. 500/month"
        );

    const modal =
        document.createElement(
            "div"
        );

    modal.id =
        "promotionModal";

    modal.className =
        "custom-modal";

    modal.innerHTML = `
        <div
            class="modal-overlay"
            onclick="closePromotionRequest()"
        ></div>

        <div class="modal-content">

            <button
                type="button"
                class="modal-close"
                onclick="closePromotionRequest()"
                aria-label="Close"
            >
                ×
            </button>

            <div class="business-icon large">
                🚀
            </div>

            <h2>
                Promote Your Business
            </h2>

            <p>
                You selected:
                <strong>
                    ${escapeHTML(selectedPlan)}
                </strong>
            </p>

            <form
                id="promotionForm"
                onsubmit="submitPromotionRequest(event)"
            >

                <input
                    type="hidden"
                    name="plan"
                    value="${escapeHTML(selectedPlan)}"
                >

                <input
                    type="text"
                    name="businessName"
                    placeholder="Business name"
                    autocomplete="organization"
                    required
                >

                <input
                    type="text"
                    name="ownerName"
                    placeholder="Owner name"
                    autocomplete="name"
                    required
                >

                <input
                    type="tel"
                    name="phone"
                    placeholder="Phone number"
                    autocomplete="tel"
                    required
                >

                <button
                    type="submit"
                    class="primary-btn"
                >
                    Send Request on WhatsApp
                </button>

            </form>

            <p class="promotion-note">
                WhatsApp will open with your request ready to send.
            </p>

        </div>
    `;

    document.body.appendChild(
        modal
    );
}

// ======================================================
// CLOSE PROMOTION
// ======================================================

function closePromotionRequest() {

    const modal =
        document.getElementById(
            "promotionModal"
        );

    if (modal) {
        modal.remove();
    }
}

// ======================================================
// SEND PROMOTION REQUEST
// ======================================================

function submitPromotionRequest(event) {

    event.preventDefault();

    const form =
        event.target;

    const plan =
        form.plan?.value.trim();

    const businessName =
        form.businessName?.value.trim();

    const ownerName =
        form.ownerName?.value.trim();

    const phone =
        form.phone?.value.trim();

    if (
        !plan ||
        !businessName ||
        !ownerName ||
        !phone
    ) {

        showToast(
            "Please complete all fields.",
            "error"
        );

        return;
    }

    const message =
`Hi LocalLift! 👋

I want to promote my business.

Business: ${businessName}
Owner: ${ownerName}
Phone: ${phone}
Package: ${plan}

Please send me the payment details and next steps.`;

    const whatsappURL =
        `https://wa.me/${OWNER_CONTACT}?text=${encodeURIComponent(message)}`;

    closePromotionRequest();

    window.location.href =
        whatsappURL;
}

// ======================================================
// STATS
// ======================================================

function updateStats() {

    const businessCount =
        document.querySelector(
            ".business-count"
        );

    const categoryCount =
        document.querySelector(
            ".category-count"
        );

    const locationCount =
        document.querySelector(
            ".location-count"
        );

    if (businessCount) {

        businessCount.textContent =
            businesses.length;
    }

    if (categoryCount) {

        categoryCount.textContent =
            new Set(
                businesses
                    .map(
                        function (business) {
                            return business.category;
                        }
                    )
                    .filter(Boolean)
            ).size;
    }

    if (locationCount) {

        locationCount.textContent =
            new Set(
                businesses
                    .map(
                        function (business) {
                            return business.location;
                        }
                    )
                    .filter(Boolean)
            ).size;
    }
}

// ======================================================
// LOADING
// ======================================================

function showLoading() {

    const grid =
        document.getElementById(
            "businessGrid"
        );

    if (!grid) return;

    grid.innerHTML = `
        <div class="loading-state">

            <div class="loader"></div>

            <p>
                Loading businesses...
            </p>

        </div>
    `;
}

// ======================================================
// TOAST
// ======================================================

function showToast(
    message,
    type = "info"
) {

    const old =
        document.querySelector(
            ".locallift-toast"
        );

    if (old) {
        old.remove();
    }

    const toast =
        document.createElement(
            "div"
        );

    toast.className =
        `locallift-toast ${type}`;

    toast.textContent =
        message;

    document.body.appendChild(
        toast
    );

    setTimeout(
        function () {
            toast.classList.add(
                "show"
            );
        },
        20
    );

    setTimeout(
        function () {

            toast.classList.remove(
                "show"
            );

            setTimeout(
                function () {
                    toast.remove();
                },
                300
            );

        },
        3500
    );
}

// ======================================================
// SECURITY HELPERS
// ======================================================

function escapeHTML(value) {

    return String(value)
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );
}

function escapeJS(value) {

    return String(value)
        .replaceAll(
            "\\",
            "\\\\"
        )
        .replaceAll(
            "'",
            "\\'"
        );
}

// ======================================================
// MAKE FUNCTIONS AVAILABLE TO HTML
// ======================================================

window.addBusiness =
    addBusiness;

window.openBusinessDetails =
    openBusinessDetails;

window.closeBusinessDetails =
    closeBusinessDetails;

window.toggleFavorite =
    toggleFavorite;

window.openPromotionRequest =
    openPromotionRequest;

window.closePromotionRequest =
    closePromotionRequest;

window.submitPromotionRequest =
    submitPromotionRequest;