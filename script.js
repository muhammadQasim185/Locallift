const SUPABASE_URL = "https://lhfpowxkmbyyewwxihtw.supabase.co/rest/v1/";
const SUPABASE_KEY = "sb_publishable_PvjBQAO6FTmtv-F1KYPZVg_6sYUZf84";

const defaultBusinesses = [
  {
    name: "Nova Café",
    category: "Restaurant",
    location: "Mirpur",
    phone: "",
    description: "A cozy local café serving delicious food and drinks.",
    icon: "☕"
  },
  {
    name: "Pixel Tech",
    category: "Technology",
    location: "Mirpur",
    phone: "",
    description: "Phones, computers, accessories and technology services.",
    icon: "💻"
  },
  {
    name: "Urban Threads",
    category: "Clothing",
    location: "Jhelum",
    phone: "",
    description: "Trendy clothing and fashion for everyday style.",
    icon: "👕"
  },
  {
    name: "Glow Studio",
    category: "Beauty",
    location: "Mirpur",
    phone: "",
    description: "Beauty and personal care services.",
    icon: "✨"
  },
  {
    name: "QuickFix Services",
    category: "Services",
    location: "Mangla",
    phone: "",
    description: "Reliable local repair and maintenance services.",
    icon: "🔧"
  },
  {
    name: "Spice House",
    category: "Restaurant",
    location: "Jhelum",
    phone: "",
    description: "Fresh and tasty local food for everyone.",
    icon: "🍽️"
  }
];

let businesses = [...defaultBusinesses];

const businessList = document.getElementById("businessList");
const resultCount = document.getElementById("resultCount");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const modal = document.getElementById("businessModal");

function escapeHTML(text) {
  const div = document.createElement("div");
  div.textContent = text || "";
  return div.innerHTML;
}

async function loadBusinesses() {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/business?select=*`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    if (!response.ok) {
      throw new Error("Could not load businesses");
    }

    const onlineBusinesses = await response.json();

    businesses = [...defaultBusinesses, ...onlineBusinesses];

    renderBusinesses();
  } catch (error) {
    console.error("Supabase error:", error);

    // Website still works with the default businesses
    businesses = [...defaultBusinesses];
    renderBusinesses();
  }
}

function renderBusinesses(list = businesses) {
  businessList.innerHTML = "";

  resultCount.textContent =
    `${list.length} ${list.length === 1 ? "business" : "businesses"}`;

  if (list.length === 0) {
    businessList.innerHTML = `
      <div class="no-results">
        <h3>No businesses found</h3>
        <p>Try another search or category.</p>
      </div>
    `;
    return;
  }

  list.forEach((business) => {
    const card = document.createElement("div");
    card.className = "business-card";

    const phone = escapeHTML(business.phone);
    const name = escapeHTML(business.name);
    const category = escapeHTML(business.category);
    const location = escapeHTML(business.location);
    const description = escapeHTML(business.description);

    card.innerHTML = `
      <div class="business-icon">
        ${business.icon || "🏪"}
      </div>

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
            ? `<a class="call-btn" href="tel:${phone}">📞 Call</a>`
            : `<button class="call-btn" onclick="showDetailsByName('${name.replace(/'/g, "\\'")}')">📋 Details</button>`
        }

        <button class="view-btn" onclick="showDetailsByName('${name.replace(/'/g, "\\'")}')">
          View
        </button>
      </div>
    `;

    businessList.appendChild(card);
  });
}

function searchBusinesses() {
  const searchTerm = searchInput.value.toLowerCase().trim();
  const selectedCategory = categoryFilter.value;

  const filtered = businesses.filter(business => {
    const matchesSearch =
      (business.name || "").toLowerCase().includes(searchTerm) ||
      (business.category || "").toLowerCase().includes(searchTerm) ||
      (business.location || "").toLowerCase().includes(searchTerm) ||
      (business.description || "").toLowerCase().includes(searchTerm);

    const matchesCategory =
      selectedCategory === "All" ||
      business.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  renderBusinesses(filtered);
}

function filterCategory(category) {
  categoryFilter.value = category;
  searchInput.value = "";
  searchBusinesses();

  document.querySelector(".business-section").scrollIntoView({
    behavior: "smooth"
  });
}

function showDetailsByName(name) {
  const business = businesses.find(b => b.name === name);

  if (!business) return;

  alert(
    `${business.name}\n\n` +
    `Category: ${business.category}\n` +
    `Location: ${business.location}\n\n` +
    `${business.description}` +
    (business.phone ? `\n\nPhone: