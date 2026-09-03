/* =========================================================
   LOCALLIFT — SCRIPT.JS
   ========================================================= */


/* =========================================================
   CONFIG
   ========================================================= */

const SUPABASE_URL =
    "https://lhfpowxkmbyyewwxihtw.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_PvjBQAO6FTmtv-F1KYPZVg_6sYUZf84";

const OWNER_CONTACT =
    "923498092089";


/* =========================================================
   DATA
   ========================================================= */

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


/* =========================================================
   START
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    setupEvents();

    loadBusinesses();

    updateFavoriteCount();

});


/* =========================================================
   EVENTS
   ========================================================= */

function setupEvents() {

    const searchInput =
        document.getElementById("searchInput");

    const categoryFilter =
        document.getElementById("categoryFilter");

    const locationFilter =
        document.getElementById("locationFilter");

    const sortSelect =
        document.getElementById("sortSelect");

    const resetFilters =
        document.getElementById("resetFilters");

    const businessForm =
        document.getElementById("businessForm");

    const featuredBtn =
        document.getElementById("featuredBtn");

    const mobileMenuBtn =
        document.getElementById("mobileMenuBtn");

    const mobileMenu =
        document.getElementById("mobileMenu");


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


    if (resetFilters) {

        resetFilters.addEventListener(
            "click",
            resetAllFilters
        );

    }


    if (businessForm) {

        businessForm.addEventListener(
            "submit",
            addBusiness
        );

    }


    if (featuredBtn) {

        featuredBtn.addEventListener(
            "click",
            function () {

                openPromotionRequest(
                    "Featured — Rs. 500/month"
                );

            }
        );

    }


    if (mobileMenuBtn && mobileMenu) {

        mobileMenuBtn.addEventListener(
            "click",
            function () {

                mobileMenu.classList.toggle("active");

            }
        );


        mobileMenu
            .querySelectorAll("a")
            .forEach(function (link) {

                link.addEventListener(
                    "click",
                    function () {

                        mobileMenu.classList.remove(
                            "active"
                        );

                    }
                );

            });

    }

}


/* =========================================================
   LOAD BUSINESSES
   ========================================================= */

async function loadBusinesses() {

    showLoading();

    try {

        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/Business?select=*`,
            {
                method: "GET",

                headers: {
                    apikey: SUPABASE_KEY,
                    Authorization:
                        `Bearer ${SUPABASE_KEY}`,
                    "Content-Type":
                        "application/json"
                }
            }
        );


        if (!response.ok) {

            const error =
                await response.text();

            throw new Error(error);

        }


        const data =
            await response.json();


        if (
            Array.isArray(data) &&
            data.length > 0
        ) {

            businesses = data;

        } else {

            businesses = [
                ...demoBusinesses
            ];

        }


        filteredBusinesses = [
            ...businesses
        ];


        populateFilters();

        sortBusinesses();

        renderBusinesses();

        updateStats();


    } catch (error) {

        console.error(
            "LocalLift Supabase error:",
            error
        );


        businesses = [
            ...demoBusinesses
        ];

        filteredBusinesses = [
            ...businesses
        ];


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


/* =========================================================
   RENDER
   ========================================================= */

function renderBusinesses() {

    const grid =
        document.getElementById(
            "businessGrid"
        );


    if (!grid) return;


    const resultsLabel =
        document.getElementById(
            "resultsLabel"
        );


    if (resultsLabel) {

        if (filteredBusinesses.length === 0) {

            resultsLabel.textContent =
                "No results found";

        } else {

            resultsLabel.textContent =
                `${filteredBusinesses.length} business${
                    filteredBusinesses.length === 1
                        ? ""
                        : "es"
                }`;

        }

    }


    if (filteredBusinesses.length === 0) {

        grid.innerHTML = `
            <div class="empty-state">
                <h3>No businesses found</h3>
                <p>Try changing your search or filters.</p>
            </div>
        `;

        return;

    }


    grid.innerHTML =
        filteredBusinesses
            .map(createBusinessCard)
            .join("");

}


/* =========================================================
   BUSINESS CARD
   ========================================================= */

function createBusinessCard(business) {

    const id =
        String(
            business.id || ""
        );


    const name =
        escapeHTML(
            business.name ||
            "Unnamed Business"
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


    const phone =
        escapeHTML(
            business.phone ||
            ""
        );


    const description =
        escapeHTML(
            business.description ||
            "No description available."
        );


    const plan =
        String(
            business.plan ||
            "free"
        ).toLowerCase();


    const favorite =
        getFavorites().includes(id);


    let badge = "";


    if (plan === "premium") {

        badge =
            `<span class="business-badge premium">
                PREMIUM
            </span>`;

    } else if (plan === "featured") {

        badge =
            `<span class="business-badge featured">
                FEATURED
            </span>`;

    }


    const icon =
        getCategoryIcon(
            business.category
        );


    return `
        <article class="business-card">

            <div class="business-card-top">

                <div class="business-icon">
                    ${icon}
                </div>

                ${badge}

                <button
                    type="button"
                    class="favorite-btn ${
                        favorite ? "active" : ""
                    }"
                    data-favorite-id="${escapeHTML(id)}"
                    aria-label="Favorite business"
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
                        data-details-id="${escapeHTML(id)}"
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


/* =========================================================
   CARD BUTTON EVENTS
   ========================================================= */

document.addEventListener(
    "click",
    function (event) {

        const favoriteButton =
            event.target.closest(
                "[data-favorite-id]"
            );


        if (favoriteButton) {

            toggleFavorite(
                favoriteButton.dataset.favoriteId
            );

            return;

        }


        const detailsButton =
            event.target.closest(
                "[data-details-id]"
            );


        if (detailsButton) {

            openBusinessDetails(
                detailsButton.dataset.detailsId
            );

        }

    }
);


/* =========================================================
   CATEGORY ICON
   ========================================================= */

function getCategoryIcon(category) {

    const value =
        String(
            category || ""
        ).toLowerCase();


    if (
        value.includes("food") ||
        value.includes("restaurant") ||
        value.includes("cafe")
    ) {
        return "FOOD";
    }


    if (
        value.includes("shop") ||
        value.includes("store")
    ) {
        return "SHOP";
    }


    if (
        value.includes("fashion") ||
        value.includes("clothing")
    ) {
        return "STYLE";
    }


    if (
        value.includes("electronic") ||
        value.includes("mobile")
    ) {
        return "TECH";
    }


    if (
        value.includes("sport") ||
        value.includes("cricket")
    ) {
        return "SPORT";
    }


    if (
        value.includes("education") ||
        value.includes("school") ||
        value.includes("academy")
    ) {
        return "EDU";
    }


    if (
        value.includes("beauty") ||
        value.includes("salon")
    ) {
        return "BEAUTY";
    }


    if (
        value.includes("medical") ||
        value.includes("clinic") ||
        value.includes("hospital")
    ) {
        return "CARE";
    }


    if (
        value.includes("car") ||
        value.includes("auto")
    ) {
        return "AUTO";
    }


    if (
        value.includes("hotel") ||
        value.includes("guest")
    ) {
        return "STAY";
    }


    return "LOCAL";

}


/* =========================================================
   FILTERING
   ========================================================= */

function applyFilters() {

    const searchInput =
        document.getElementById(
            "searchInput"
        );


    const categoryFilter =
        document.getElementById(
            "categoryFilter"
        );


    const locationFilter =
        document.getElementById(
            "locationFilter"
        );


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
        businesses.filter(
            function (business) {

                const name =
                    String(
                        business.name || ""
                    ).toLowerCase();


                const businessCategory =
                    String(
                        business.category || ""
                    ).toLowerCase();


                const businessLocation =
                    String(
                        business.location || ""
                    ).toLowerCase();


                const description =
                    String(
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

            }
        );


    sortBusinesses();

    renderBusinesses();

}


/* =========================================================
   RESET
   ========================================================= */

function resetAllFilters() {

    const searchInput =
        document.getElementById(
            "searchInput"
        );

    const categoryFilter =
        document.getElementById(
            "categoryFilter"
        );

    const locationFilter =
        document.getElementById(
            "locationFilter"
        );

    const sortSelect =
        document.getElementById(
            "sortSelect"
        );


    if (searchInput) {
        searchInput.value = "";
    }


    if (categoryFilter) {
        categoryFilter.value = "";
    }


    if (locationFilter) {
        locationFilter.value = "";
    }


    if (sortSelect) {
        sortSelect.value = "featured";
    }


    filteredBusinesses = [
        ...businesses
    ];


    sortBusinesses();

    renderBusinesses();

}


/* =========================================================
   SORT
   ========================================================= */

function sortBusinesses() {

    const sortSelect =
        document.getElementById(
            "sortSelect"
        );


    const sort =
        sortSelect?.value ||
        "featured";


    if (sort === "name") {

        filteredBusinesses.sort(
            function (a, b) {

                return String(
                    a.name || ""
                ).localeCompare(
                    String(
                        b.name || ""
                    )
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

                return (
                    (rank[
                        String(
                            b.plan || "free"
                        ).toLowerCase()
                    ] || 1) -
                    (rank[
                        String(
                            a.plan || "free"
                        ).toLowerCase()
                    ] || 1)
                );

            }
        );

    }

}


/* =========================================================
   FILTER OPTIONS
   ========================================================= */

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
                        business =>
                            String(
                                business.category || ""
                            ).trim()
                    )
                    .filter(Boolean)
            )
        ].sort(
            function (a, b) {
                return a.localeCompare(b);
            }
        );


        categoryFilter.innerHTML =
            `<option value="">
                All Categories
            </option>` +
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
                        business =>
                            String(
                                business.location || ""
                            ).trim()
                    )
                    .filter(Boolean)
            )
        ].sort(
            function (a, b) {
                return a.localeCompare(b);
            }
        );


        locationFilter.innerHTML =
            `<option value="">
                All Locations
            </option>` +
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


/* =========================================================
   ADD BUSINESS
   ========================================================= */

async function addBusiness(event) {

    event.preventDefault();


    const form =
        event.target;


    const button =
        document.getElementById(
            "addBusinessBtn"
        );


    const name =
        String(
            form.elements.name?.value || ""
        ).trim();


    const category =
        String(
            form.elements.category?.value || ""
        ).trim();


    const location =
        String(
            form.elements.location?.value || ""
        ).trim();


    const phone =
        String(
            form.elements.phone?.value || ""
        ).trim();


    const description =
        String(
            form.elements.description?.value || ""
        ).trim();


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

        phone: phone,

        description: description

    };


    if (button) {

        button.disabled = true;

        button.innerHTML =
            `<span>Adding...</span>`;

    }


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
            "Your business has been added to LocalLift!",
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

    } finally {

        if (button) {

            button.disabled = false;

            button.innerHTML =
                `<span>Add Business</span>
                 <span>→</span>`;

        }

    }

}


/* =========================================================
   BUSINESS DETAILS
   ========================================================= */

function openBusinessDetails(id) {

    const business =
        businesses.find(
            function (item) {

                return String(
                    item.id
                ) === String(id);

            }
        );


    if (!business) return;


    closeBusinessDetails();


    const modal =
        document.createElement(
            "div"
        );


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


    const icon =
        getCategoryIcon(
            business.category
        );


    modal.innerHTML = `

        <div
            class="modal-overlay"
            data-close-business="true"
        ></div>


        <div class="modal-content">

            <button
                type="button"
                class="modal-close"
                id="businessModalClose"
            >
                ×
            </button>


            <div class="business-icon large">
                ${icon}
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
                            class="btn btn-primary full-btn"
                            href="tel:${phone}"
                        >
                            Call Business
                        </a>
                    `
                    : ""
            }

        </div>

    `;


    document.body.appendChild(
        modal
    );


    const closeButton =
        document.getElementById(
            "businessModalClose"
        );


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeBusinessDetails
        );

    }


    const overlay =
        modal.querySelector(
            "[data-close-business]"
        );


    if (overlay) {

        overlay.addEventListener(
            "click",
            closeBusinessDetails
        );

    }

}


/* =========================================================
   CLOSE BUSINESS DETAILS
   ========================================================= */

function closeBusinessDetails() {

    const modal =
        document.getElementById(
            "businessModal"
        );


    if (modal) {

        modal.remove();

    }

}


/* =========================================================
   FAVORITES
   ========================================================= */

function getFavorites() {

    try {

        const saved =
            localStorage.getItem(
                "locallift_favorites"
            );


        const parsed =
            JSON.parse(
                saved || "[]"
            );


        return Array.isArray(
            parsed
        )
            ? parsed.map(
                String
            )
            : [];

    } catch {

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
            "Added to favorites.",
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


/* =========================================================
   PROMOTION MODAL
   ========================================================= */

function openPromotionRequest(plan) {

    closePromotionRequest();


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
            data-close-promotion="true"
        ></div>


        <div class="modal-content">

            <button
                type="button"
                class="modal-close"
                id="promotionModalClose"
            >
                ×
            </button>


            <div class="business-icon large">
                PRO
            </div>


            <p class="business-category">
                PROMOTION REQUEST
            </p>


            <h2>
                Get Your Business Featured
            </h2>


            <p>
                Selected package:
                <strong>
                    ${escapeHTML(plan)}
                </strong>
            </p>


            <form
                id="promotionForm"
            >

                <input
                    type="hidden"
                    name="plan"
                    value="${escapeHTML(plan)}"
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
                    placeholder="Owner name"
                    required
                >


                <input
                    type="tel"
                    name="phone"
                    placeholder="Phone number"
                    required
                >


                <button
                    type="submit"
                >
                    Continue to WhatsApp →
                </button>

            </form>


            <p class="promotion-note">
                Your request will open in WhatsApp with
                the information you provide.
            </p>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    const closeButton =
        document.getElementById(
            "promotionModalClose"
        );


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closePromotionRequest
        );

    }


    const overlay =
        modal.querySelector(
            "[data-close-promotion]"
        );


    if (overlay) {

        overlay.addEventListener(
            "click",
            closePromotionRequest
        );

    }


    const form =
        document.getElementById(
            "promotionForm"
        );


    if (form) {

        form.addEventListener(
            "submit",
            submitPromotionRequest
        );

    }

}


/* =========================================================
   CLOSE PROMOTION MODAL
   ========================================================= */

function closePromotionRequest() {

    const modal =
        document.getElementById(
            "promotionModal"
        );


    if (modal) {

        modal.remove();

    }

}


/* =========================================================
   WHATSAPP PROMOTION REQUEST
   ========================================================= */

function submitPromotionRequest(event) {

    event.preventDefault();


    const form =
        event.target;


    const plan =
        String(
            form.elements.plan?.value ||
            ""
        ).trim();


    const businessName =
        String(
            form.elements.businessName?.value ||
            ""
        ).trim();


    const ownerName =
        String(
            form.elements.ownerName?.value ||
            ""
        ).trim();


    const phone =
        String(
            form.elements.phone?.value ||
            ""
        ).trim();


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
`Hi LocalLift!

I want to promote my business.

Business: ${businessName}
Owner: ${ownerName}
Phone: ${phone}
Package: ${plan}

Please send me the payment details and next steps.`;


    const whatsappURL =
        `https://wa.me/${OWNER_CONTACT}?text=${
            encodeURIComponent(message)
        }`;


    closePromotionRequest();


    showToast(
        "Opening WhatsApp...",
        "success"
    );


    setTimeout(
        function () {

            window.location.href =
                whatsappURL;

        },
        250
    );

}


/* =========================================================
   STATS
   ========================================================= */

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
                        business =>
                            String(
                                business.category || ""
                            ).trim()
                    )
                    .filter(Boolean)
            ).size;

    }


    if (locationCount) {

        locationCount.textContent =
            new Set(
                businesses
                    .map(
                        business =>
                            String(
                                business.location || ""
                            ).trim()
                    )
                    .filter(Boolean)
            ).size;

    }

}


/* =========================================================
   LOADING
   ========================================================= */

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
                Loading local businesses...
            </p>

        </div>

    `;

}


/* =========================================================
   TOAST
   ========================================================= */

function showToast(
    message,
    type = "info"
) {

    const oldToast =
        document.querySelector(
            ".locallift-toast"
        );


    if (oldToast) {

        oldToast.remove();

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


    requestAnimationFrame(
        function () {

            toast.classList.add(
                "show"
            );

        }
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


/* =========================================================
   SECURITY HELPERS
   ========================================================= */

function escapeHTML(value) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   GLOBAL FUNCTIONS
   ========================================================= */

window.openPromotionRequest =
    openPromotionRequest;

window.closePromotionRequest =
    closePromotionRequest;

window.submitPromotionRequest =
    submitPromotionRequest;

window.openBusinessDetails =
    openBusinessDetails;

window.closeBusinessDetails =
    closeBusinessDetails;

window.toggleFavorite =
    toggleFavorite;

window.addBusiness =
    addBusiness;