const SUPABASE_URL = "https://lhfpowxkmbyyewwxihtw.supabase.co";
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

    businesses = [...defaultBusinesses];

    renderBusinesses();
  }
}

function renderBusinesses(list = businesses) {
  if (!businessList) return;

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
            : `<button class="call-btn details-button">📋 Details</button>`
        }

        <button class="view-btn details-button">
          View
        </button>
      </div>
    `;

    const buttons = card.querySelectorAll(".details-button");

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        showDetailsByName(business.name);
      });
    });

    businessList.appendChild(card);
  });
}

function searchBusinesses() {
  if (!searchInput || !categoryFilter) return;

  const searchTerm = searchInput.value.toLowerCase().trim();
  const selectedCategory = categoryFilter.value;

  const filtered = businesses.filter((business) => {
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
  if (categoryFilter) {
    categoryFilter.value = category;
  }

  if (searchInput) {
    searchInput.value = "";
  }

  searchBusinesses();

  const section = document.querySelector(".business-section");

  if (section) {
    section.scrollIntoView({
      behavior: "smooth"
    });
  }
}

function showDetailsByName(name) {
  const business = businesses.find((b) => b.name === name);

  if (!business) return;

  alert(
    `${business.name}\n\n` +
    `Category: ${business.category}\n` +
    `Location: ${business.location}\n\n` +
    `${business.description}` +
    (business.phone
      ? `\n\nPhone: ${business.phone}`
      : "")
  );
}

/* This exact name matches your HTML button */
function openModa1() {
  if (modal) {
    modal.classList.add("show");
  }
}

function closeModal() {
  if (modal) {
    modal.classList.remove("show");
  }
}

if (modal) {
  modal.addEventListener("click", function (event) {
    if (event.target === modal) {
      closeModal();
    }
  });
}

async function addBusiness(event) {
  event.preventDefault();

  const name = document.getElementById("businessName").value.trim();
  const category = document.getElementById("businessCategory").value;
  const location = document.getElementById("businessLocation").value.trim();
  const phone = document.getElementById("businessPhone").value.trim();
  const description =
    document.getElementById("businessDescription").value.trim();

  if (!name || !category || !location) {
    alert("Please fill in the required fields.");
    return;
  }

  const icons = {
    Restaurant: "🍔",
    Clothing: "👕",
    Technology: "💻",
    Beauty: "✨",
    Services: "🔧"
  };

  const newBusiness = {
    name: name,
    category: category,
    location: location,
    phone: phone,
    description:
      description || "Local business on LocalLift.",
    icon: icons[category] || "🏪"
  };

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/business`,
      {
        method: "POST",
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=representation"
        },
        body: JSON.stringify(newBusiness)
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Supabase error:", errorText);
      throw new Error("Could not add business");
    }

    const savedBusiness = await response.json();

    businesses.push(savedBusiness[0]);

    event.target.reset();

    closeModal();

    renderBusinesses();

    alert("🎉 Your business has been added to LocalLift!");
  } catch (error) {
    console.error("Error:", error);

    alert(
      "❌ Could not add the business. Please check your connection and try again."
    );
  }
}

if (searchInput) {
  searchInput.addEventListener("input", searchBusinesses);
}

if (categoryFilter) {
  categoryFilter.addEventListener("change", searchBusinesses);
}

loadBusinesses();
window.openModa1 = openModa1;
window.openModal = openModa1;
window.closeModal = closeModal;