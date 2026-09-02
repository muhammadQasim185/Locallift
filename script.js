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

let businesses = JSON.parse(
  localStorage.getItem("localliftBusinesses")
) || defaultBusinesses;

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

  list.forEach((business, index) => {
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
            ? `<a class="call-btn" href="tel:${phone}">
                📞 Call
              </a>`
            : `<button class="call-btn" onclick="showDetails(${index})">
                📋 Details
              </button>`
        }

        <button
          class="view-btn"
          onclick="showDetails(${index})"
        >
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
      business.name.toLowerCase().includes(searchTerm) ||
      business.category.toLowerCase().includes(searchTerm) ||
      business.location.toLowerCase().includes(searchTerm) ||
      business.description.toLowerCase().includes(searchTerm);

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

function showDetails(index) {
  const business = businesses[index];

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

function openModal() {
  modal.classList.add("show");
}

function closeModal() {
  modal.classList.remove("show");
}

modal.addEventListener("click", function(event) {
  if (event.target === modal) {
    closeModal();
  }
});

function addBusiness(event) {
  event.preventDefault();

  const name = document.getElementById("businessName").value.trim();
  const category = document.getElementById("businessCategory").value;
  const location = document.getElementById("businessLocation").value.trim();
  const phone = document.getElementById("businessPhone").value.trim();
  const description =
    document.getElementById("businessDescription").value.trim();

  const icons = {
    Restaurant: "🍔",
    Clothing: "👕",
    Technology: "💻",
    Beauty: "✨",
    Services: "🔧"
  };

  const newBusiness = {
    name,
    category,
    location,
    phone,
    description: description || "Local business on LocalLift.",
    icon: icons[category] || "🏪"
  };

  businesses.push(newBusiness);

  localStorage.setItem(
    "localliftBusinesses",
    JSON.stringify(businesses)
  );

  event.target.reset();

  closeModal();

  renderBusinesses();

  alert("🎉 Your business has been added to LocalLift!");
}

renderBusinesses();