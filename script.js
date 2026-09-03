/* =========================================
   LOCALIFT — SUPABASE CONFIG
   ========================================= */

const SUPABASE_URL = "https://lhfpowxkmbyyewwxihtw.supabase.co";
const SUPABASE_KEY = "sb_publishable_PvjBQAO6FTmtv-F1KYPZVg_6sYUZf84";

const TABLE_NAME = "Business";


/* =========================================
   DEFAULT BUSINESSES
   ========================================= */

const defaultBusinesses = [
  {
    name: "Nova Café",
    category: "Restaurant",
    location: "Mirpur",
    phone: "",
    description: "A cozy local café serving delicious food and drinks."
  },
  {
    name: "Pixel Tech",
    category: "Technology",
    location: "Mirpur",
    phone: "",
    description: "Phones, computers, accessories and technology services."
  },
  {
    name: "Urban Threads",
    category: "Clothing",
    location: "Mirpur",
    phone: "",
    description: "Trendy clothing and fashion for everyday style."
  },
  {
    name: "Glow Studio",
    category: "Beauty",
    location: "Mirpur",
    phone: "",
    description: "Beauty and personal care services."
  },
  {
    name: "QuickFix Services",
    category: "Services",
    location: "Mangla",
    phone: "",
    description: "Reliable local repair and maintenance services."
  },
  {
    name: "Spice House",
    category: "Restaurant",
    location: "Jhelum",
    phone: "",
    description: "Fresh and tasty local food for everyone."
  }
];

let businesses = [...defaultBusinesses];


/* =========================================
   PAGE ELEMENTS
   ========================================= */

const businessList = document.getElementById("businessList");
const resultCount = document.getElementById("resultCount");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const modal = document.getElementById("businessModal");


/* =========================================
   ICONS
   ========================================= */

function getIcon(category) {
  const icons = {
    Restaurant: "🍔",
    Clothing: "👕",
    Technology: "💻",
    Beauty: "✨",
    Services: "🔧",
    Grocery: "🛒",
    Education: "📚",
    Health: "🏥",
    Hotel: "🏨",
    Automotive: "🚗"
  };

  return icons[category] || "🏪";
}


/* =========================================
   SECURITY
   ========================================= */

function escapeHTML(value) {
  const div = document.createElement("div");
  div.textContent = value == null ? "" : String(value);
  return div.innerHTML;
}


/* =========================================
   LOAD BUSINESSES FROM SUPABASE
   ========================================= */

async function loadBusinesses() {

  try {

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/${TABLE_NAME}?select=*`,
      {
        method: "GET",
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Load failed (${response.status}): ${errorText}`
      );
    }

    const onlineBusinesses = await response.json();

    businesses = [
      ...defaultBusinesses,
      ...onlineBusinesses.map(function (business) {
        return {
          ...business,
          icon: getIcon(business.category)
        };
      })
    ];

    renderBusinesses();

  } catch (error) {

    console.error("LocalLift loading error:", error);

    businesses = [...defaultBusinesses];

    renderBusinesses();

  }
}


/* =========================================
   RENDER BUSINESS CARDS
   ========================================= */

function renderBusinesses(list = businesses) {

  if (!businessList) {
    return;
  }

  businessList.innerHTML = "";

  if (resultCount) {
    resultCount.textContent =
      `${list.length} ${list.length === 1 ? "business" : "businesses"}`;
  }

  if (list.length === 0) {

    businessList.innerHTML = `
      <div class="no-results">
        <h3>No businesses found</h3>
        <p>Try another search or category.</p>
      </div>
    `;

    return;
  }

  list.forEach(function (business) {

    const card = document.createElement("div");
    card.className = "business-card";

    const name = escapeHTML(business.name);
    const category = escapeHTML(business.category);
    const location = escapeHTML(business.location);
    const phone = escapeHTML(business.phone);
    const description = escapeHTML(business.description);

    const icon = business.icon || getIcon(business.category);

    card.innerHTML = `
      <div class="business-icon">
        ${icon}
      </div>

      <div class="business-card-content">

        <h3>${name}</h3>

        <span class="business-category">
          ${category}
        </span>

        <p class="business-location">
          📍 ${location}
        </p>

        <p class="business-description">
          ${description}
        </p>

        <div class="card-actions">

          ${
            phone
              ? `
                <a
                  class="call-btn"
                  href="tel:${phone}"
                >
                  📞 Call
                </a>
              `
              : ""
          }

          <button
            class="view-btn details-button"
            type="button"
          >
            View Details
          </button>

        </div>

      </div>
    `;

    const detailButton =
      card.querySelector(".details-button");

    if (detailButton) {
      detailButton.addEventListener("click", function () {
        showDetails(business);
      });
    }

    businessList.appendChild(card);

  });
}


/* =========================================
   SEARCH
   ========================================= */

function searchBusinesses() {

  const searchTerm =
    searchInput
      ? searchInput.value.toLowerCase().trim()
      : "";

  const selectedCategory =
    categoryFilter
      ? categoryFilter.value
      : "All";

  const filtered = businesses.filter(function (business) {

    const text =
      `${business.name || ""} ` +
      `${business.category || ""} ` +
      `${business.location || ""} ` +
      `${business.description || ""}`;

    const matchesSearch =
      text.toLowerCase().includes(searchTerm);

    const matchesCategory =
      selectedCategory === "All" ||
      business.category === selectedCategory;

    return matchesSearch && matchesCategory;

  });

  renderBusinesses(filtered);
}


/* =========================================
   CATEGORY FILTER
   ========================================= */

function filterCategory(category) {

  if (categoryFilter) {
    categoryFilter.value = category;
  }

  if (searchInput) {
    searchInput.value = "";
  }

  searchBusinesses();

  const section =
    document.querySelector(".business-section");

  if (section) {
    section.scrollIntoView({
      behavior: "smooth"
    });
  }
}


/* =========================================
   BUSINESS DETAILS
   ========================================= */

function showDetails(business) {

  const name =
    business.name || "Business";

  const category =
    business.category || "Not specified";

  const location =
    business.location || "Not specified";

  const phone =
    business.phone || "Not available";

  const description =
    business.description || "No description available.";

  alert(
    `${name}\n\n` +
    `Category: ${category}\n` +
    `Location: ${location}\n` +
    `Phone: ${phone}\n\n` +
    `${description}`
  );
}


/* =========================================
   OPEN MODAL
   ========================================= */

function openModal() {

  if (!modal) {
    alert("The business form could not be opened.");
    return;
  }

  modal.classList.add("show");
}


/* =========================================
   CLOSE MODAL
   ========================================= */

function closeModal() {

  if (!modal) {
    return;
  }

  modal.classList.remove("show");
}


/* =========================================
   CLOSE MODAL OUTSIDE CLICK
   ========================================= */

if (modal) {

  modal.addEventListener("click", function (event) {

    if (event.target === modal) {
      closeModal();
    }

  });

}


/* =========================================
   ADD BUSINESS
   ========================================= */

async function addBusiness(event) {

  event.preventDefault();

  const form = event.target;

  const submitButton =
    form.querySelector(".submit-btn");

  const nameElement =
    document.getElementById("businessName");

  const categoryElement =
    document.getElementById("businessCategory");

  const locationElement =
    document.getElementById("businessLocation");

  const phoneElement =
    document.getElementById("businessPhone");

  const descriptionElement =
    document.getElementById("businessDescription");


  if (
    !nameElement ||
    !categoryElement ||
    !locationElement ||
    !phoneElement ||
    !descriptionElement
  ) {

    alert(
      "Some form fields are missing. Please check index.html."
    );

    return;
  }


  const name =
    nameElement.value.trim();

  const category =
    categoryElement.value.trim();

  const location =
    locationElement.value.trim();

  const phone =
   