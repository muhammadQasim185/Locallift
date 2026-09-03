/* =========================
   LOCALIFT SUPABASE SETTINGS
   ========================= */

const SUPABASE_URL = "https://lhfpowxkmbyyewwxihtw.supabase.co";

/*
  Paste your existing Supabase PUBLISHABLE key
  between the quotation marks below.

  Do NOT paste the key into ChatGPT.
*/
const SUPABASE_KEY = "sb_publishable_PvjBQAO6FTmtv-F1KYPZVg_6sYUZf84";


/* =========================
   DEFAULT BUSINESSES
   ========================= */

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
    location: "Mirpur",
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


/* =========================
   PAGE ELEMENTS
   ========================= */

const businessList = document.getElementById("businessList");
const resultCount = document.getElementById("resultCount");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const modal = document.getElementById("businessModal");


/* =========================
   HELPERS
   ========================= */

function escapeHTML(value) {
  const div = document.createElement("div");
  div.textContent = value == null ? "" : String(value);
  return div.innerHTML;
}

function getIcon(category) {
  const icons = {
    Restaurant: "🍔",
    Clothing: "👕",
    Technology: "💻",
    Beauty: "✨",
    Services: "🔧"
  };

  return icons[category] || "🏪";
}


/* =========================
   LOAD BUSINESSES
   ========================= */

async function loadBusinesses() {

  try {

    if (
      !SUPABASE_KEY ||
      SUPABASE_KEY === "PASTE_YOUR_PUBLISHABLE_KEY_HERE"
    ) {
      throw new Error("Supabase publishable key has not been added.");
    }

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/Business?select=*`,
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

    console.error("LocalLift Supabase load error:", error);

    businesses = [...defaultBusinesses];

    renderBusinesses();

  }
}


/* =========================
   RENDER BUSINESSES
   ========================= */

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
            : `<button class="call-btn details-button" type="button">📋 Details</button>`
        }

        <button
          class="view-btn details-button"
          type="button"
        >
          View
        </button>

      </div>
    `;

    const detailButtons =
      card.querySelectorAll(".details-button");

    detailButtons.forEach(function (button) {

      button.addEventListener("click", function () {
        showDetails(business);
      });

    });

    businessList.appendChild(card);

  });
}


/* =========================
   SEARCH
   ========================= */

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


/* =========================
   CATEGORY FILTER
   ========================= */

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


/* =========================
   DETAILS
   ========================= */

function showDetails(business) {

  let message =
    `${business.name}\n\n` +
    `Category: ${business.category}\n` +
    `Location: ${business.location}\n\n` +
    `${business.description}`;

  if (business.phone) {
    message += `\n\nPhone: ${business.phone}`;
  }

  alert(message);
}


/* =========================
   OPEN MODAL
   ========================= */

function openModal() {

  if (!modal) {
    alert("The business form could not be opened.");
    return;
  }

  modal.classList.add("show");
}


/* =========================
   CLOSE MODAL
   ========================= */

function closeModal() {

  if (!modal) {
    return;
  }

  modal.classList.remove("show");
}


/* =========================
   CLOSE WHEN CLICKING OUTSIDE
   ========================= */

if (modal) {

  modal.addEventListener("click", function (event) {

    if (event.target === modal) {
      closeModal();
    }

  });

}


/* =========================
   ADD BUSINESS
   ========================= */

async function addBusiness(event) {

  event.preventDefault();

  const form = event.target;
  const submitButton =
    form.querySelector(".submit-btn");

  const name =
    document.getElementById("businessName").value.trim();

  const category =
    document.getElementById("businessCategory").value;

  const location =
    document.getElementById("businessLocation").value.trim();

  const phone =
    document.getElementById("businessPhone").value.trim();

  const description =
    document.getElementById("businessDescription").value.trim();


  if (!name || !category || !location) {

    alert("Please fill in the required fields.");

    return;
  }


  const newBusiness = {
    name: name,
    category: category,
    location: location,
    phone: phone,
    description:
      description || "Local business on LocalLift."
  };


  try {

    if (
      !SUPABASE_KEY ||
      SUPABASE_KEY === "PASTE_YOUR_PUBLISHABLE_KEY_HERE"
    ) {
      throw new Error(
        "Your Supabase publishable key is missing from script.js."
      );
    }


    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Adding...";
    }


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

        body: JSON.stringify(newBusiness)
      }
    );


    if (!response.ok) {

      const errorText =
        await response.text();

      throw new Error(
        `Insert failed (${response.status}): ${errorText}`
      );
    }


    const savedBusinesses =
      await response.json();


    if (
      Array.isArray(savedBusinesses) &&
      savedBusinesses.length > 0
    ) {

      const savedBusiness =
        savedBusinesses[0];

      businesses.push({
        ...savedBusiness,
        icon: getIcon(savedBusiness.category)
      });

    } else {

      businesses.push({
        ...newBusiness,
        icon: getIcon(newBusiness.category)
      });

    }


    form.reset();

    closeModal();

    renderBusinesses();

    alert(
      "🎉 Your business has been added to LocalLift!"
    );


  } catch (error) {

    console.error(
      "LocalLift Supabase insert error:",
      error
    );

    /*
      IMPORTANT:
      This shows the REAL error instead of
      hiding it behind "check your connection".
    */

    alert(
      "❌ Supabase error:\n\n" +
      error.message
    );


  } finally {

    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = "Add Business";
    }

  }
}


/* =========================
   SEARCH EVENTS
   ========================= */

if (searchInput) {

  searchInput.addEventListener(
    "input",
    searchBusinesses
  );

}

if (categoryFilter) {

  categoryFilter.addEventListener(
    "change",
    searchBusinesses
  );

}


/* =========================
   MAKE BUTTON FUNCTIONS
   AVAILABLE TO HTML
   ========================= */

window.openModal = openModal;
window.closeModal = closeModal;
window.addBusiness = addBusiness;
window.filterCategory = filterCategory;
window.searchBusinesses = searchBusinesses;


/* =========================
   START WEBSITE
   ========================= */

loadBusinesses();