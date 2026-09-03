/* =====================================================
   LOCALLIFT
   SUPABASE + DIRECTORY + MONETIZATION SYSTEM
   ===================================================== */


/* =====================================================
   SUPABASE SETTINGS
   ===================================================== */

const SUPABASE_URL =
  "https://lhfpowxkmbyyewwxihtw.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_PvjBQAO6FTmtv-F1KYPZVg_6sYUZf84";


/*
  IMPORTANT:

  Paste the SAME Supabase publishable key that already
  worked for your current LocalLift website.

  Do not change your table name.

  Current table:
  Business

  Existing columns:
  id
  created_at
  name
  category
  location
  phone
  description
*/


/* =====================================================
   OWNER CONTACT
   ===================================================== */

/*
  Put YOUR business contact here later.

  Example:

  const OWNER_CONTACT = "03001234567";

  This is used when someone wants a paid promotion.

  You can leave it blank for now.
*/

const OWNER_CONTACT = "";


/* =====================================================
   DEFAULT BUSINESSES
   ===================================================== */

const defaultBusinesses = [

  {
    name: "Nova Café",
    category: "Restaurant",
    location: "Mirpur",
    phone: "",
    description:
      "A cozy local café serving delicious food and drinks.",
    icon: "☕",
    plan: "featured"
  },

  {
    name: "Pixel Tech",
    category: "Technology",
    location: "Mirpur",
    phone: "",
    description:
      "Phones, computers, accessories and technology services.",
    icon: "💻",
    plan: "premium"
  },

  {
    name: "Urban Threads",
    category: "Clothing",
    location: "Mirpur",
    phone: "",
    description:
      "Trendy clothing and fashion for everyday style.",
    icon: "👕",
    plan: "free"
  },

  {
    name: "Glow Studio",
    category: "Beauty",
    location: "Mirpur",
    phone: "",
    description:
      "Beauty and personal care services.",
    icon: "✨",
    plan: "free"
  },

  {
    name: "QuickFix Services",
    category: "Services",
    location: "Mangla",
    phone: "",
    description:
      "Reliable local repair and maintenance services.",
    icon: "🔧",
    plan: "featured"
  },

  {
    name: "Spice House",
    category: "Restaurant",
    location: "Jhelum",
    phone: "",
    description:
      "Fresh and tasty local food for everyone.",
    icon: "🍽️",
    plan: "free"
  }

];


let businesses = [...defaultBusinesses];

let currentFilteredBusinesses = [];

let toastTimer = null;


/* =====================================================
   ELEMENTS
   ===================================================== */

const businessList =
  document.getElementById("businessList");

const resultCount =
  document.getElementById("resultCount");

const searchInput =
  document.getElementById("searchInput");

const clearSearch =
  document.getElementById("clearSearch");

const categoryFilter =
  document.getElementById("categoryFilter");

const sortFilter =
  document.getElementById("sortFilter");

const businessModal =
  document.getElementById("businessModal");

const detailsModal =
  document.getElementById("detailsModal");

const promotionModal =
  document.getElementById("promotionModal");

const detailsContent =
  document.getElementById("detailsContent");

const toast =
  document.getElementById("toast");

const backTop =
  document.getElementById("backTop");

const themeToggle =
  document.getElementById("themeToggle");


/* =====================================================
   HTML SECURITY
   ===================================================== */

function escapeHTML(value) {

  const div =
    document.createElement("div");

  div.textContent =
    value == null ? "" : String(value);

  return div.innerHTML;
}


/* =====================================================
   ICONS
   ===================================================== */

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


/* =====================================================
   PLAN HELPERS
   ===================================================== */

function getPlan(business) {

  if (!business) {
    return "free";
  }

  return String(
    business.plan || "free"
  ).toLowerCase();

}


function getPlanRank(business) {

  const plan =
    getPlan(business);

  if (plan === "premium") {
    return 2;
  }

  if (plan === "featured") {
    return 1;
  }

  return 0;
}


/*
  Paid plans are represented on the front-end only
  until a real payment/business approval system exists.

  Your Supabase schema does NOT need a "plan" column.
*/


/* =====================================================
   FAVORITES
   ===================================================== */

function getFavorites() {

  try {

    return JSON.parse(
      localStorage.getItem(
        "locallift_favorites"
      )
    ) || [];

  } catch {

    return [];

  }

}


function saveFavorites(favorites) {

  localStorage.setItem(
    "locallift_favorites",
    JSON.stringify(favorites)
  );

}


function getBusinessKey(business) {

  if (business.id) {
    return `id-${business.id}`;
  }

  return [
    business.name,
    business.location,
    business.category
  ]
    .join("|")
    .toLowerCase();

}


function isFavorite(business) {

  const favorites =
    getFavorites();

  return favorites.includes(
    getBusinessKey(business)
  );

}


function toggleFavorite(business) {

  const favorites =
    getFavorites();

  const key =
    getBusinessKey(business);

  const index =
    favorites.indexOf(key);

  if (index >= 0) {

    favorites.splice(index, 1);

    showToast(
      "Removed from favorites."
    );

  } else {

    favorites.push(key);

    showToast(
      "⭐ Added to favorites."
    );

  }

  saveFavorites(favorites);

  searchBusinesses();

}


/* =====================================================
   LOAD BUSINESSES
   ===================================================== */

async function loadBusinesses() {

  renderLoading();

  try {

    if (
      !SUPABASE_KEY ||
      SUPABASE_KEY ===
        "PASTE_YOUR_EXISTING_PUBLISHABLE_KEY_HERE"
    ) {

      throw new Error(
        "Supabase publishable key is missing."
      );

    }


    const response =
      await fetch(
        `${SUPABASE_URL}/rest/v1/Business?select=*`,
        {

          method: "GET",

          headers: {

            apikey: SUPABASE_KEY,

            Authorization:
              `Bearer ${SUPABASE_KEY}`

          }

        }
      );


    if (!response.ok) {

      const errorText =
        await response.text();

      throw new Error(
        `Load failed (${response.status}): ${errorText}`
      );

    }


    const onlineBusinesses =
      await response.json();


    businesses = [

      ...defaultBusinesses,

      ...onlineBusinesses.map(
        function (business) {

          return {

            ...business,

            icon:
              getIcon(
                business.category
              ),

            plan:
              "free"

          };

        }
      )

    ];


    updateStats();

    searchBusinesses();


  } catch (error) {

    console.error(
      "LocalLift Supabase load error:",
      error
    );


    /*
      The website still works with default
      businesses if Supabase is temporarily
      unavailable.
    */

    businesses =
      [...defaultBusinesses];

    updateStats();

    searchBusinesses();

  }

}


/* =====================================================
   LOADING UI
   ===================================================== */

function renderLoading() {

  if (!businessList) {
    return;
  }

  businessList.innerHTML = `

    <div class="no-results">

      <h3>Loading businesses...</h3>

      <p>
        Finding local businesses for you.
      </p>

    </div>

  `;

}


/* =====================================================
   RENDER BUSINESSES
   ===================================================== */

function renderBusinesses(
  list = businesses
) {

  if (!businessList) {
    return;
  }


  currentFilteredBusinesses =
    list;


  businessList.innerHTML =
    "";


  if (resultCount) {

    resultCount.textContent =
      `${list.length} ${
        list.length === 1
          ? "business"
          : "businesses"
      } found`;

  }


  if (list.length === 0) {

    businessList.innerHTML = `

      <div class="no-results">

        <h3>
          No businesses found
        </h3>

        <p>
          Try another search or category.
        </p>

      </div>

    `;

    return;

  }


  list.forEach(
    function (business) {

      const card =
        document.createElement("article");

      card.className =
        "business-card";


      const name =
        escapeHTML(
          business.name
        );

      const category =
        escapeHTML(
          business.category
        );

      const location =
        escapeHTML(
          business.location
        );

      const phone =
        escapeHTML(
          business.phone
        );

      const description =
        escapeHTML(
          business.description ||
          "Local business on LocalLift."
        );


      const icon =
        business.icon ||
        getIcon(
          business.category
        );


      const plan =
        getPlan(business);


      const favorite =
        isFavorite(business);


      let planBadge = "";


      if (plan === "premium") {

        planBadge = `
          <span class="premium-badge">
            🚀 PREMIUM
          </span>
        `;

      } else if (plan === "featured") {

        planBadge = `
          <span class="featured-badge">
            ⭐ FEATURED
          </span>
        `;

      }


      card.innerHTML = `

        <div class="card-top">

          <div class="business-icon">
            ${icon}
          </div>

          <button
            class="favorite-btn ${
              favorite ? "active" : ""
            }"
            type="button"
            aria-label="Favorite ${name}"
          >
            ${favorite ? "♥" : "♡"}
          </button>

        </div>


        <h3>
          ${name}
        </h3>


        <div class="badges">

          <span class="business-category">
            ${category}
          </span>

          ${planBadge}

        </div>


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

              : `
                <button
                  class="call-btn details-button"
                  type="button"
                >
                  📋 Details
                </button>
              `
          }


          <button
            class="view-btn details-button"
            type="button"
          >
            View
          </button>

        </div>

      `;


      const favoriteButton =
        card.querySelector(
          ".favorite-btn"
        );


      if (favoriteButton) {

        favoriteButton.addEventListener(
          "click",
          function () {

            toggleFavorite(
              business
            );

          }
        );

      }


      const detailButtons =
        card.querySelectorAll(
          ".details-button"
        );


      detailButtons.forEach(
        function (button) {

          button.addEventListener(
            "click",
            function () {

              showDetails(
                business
              );

            }
          );

        }
      );


      businessList.appendChild(card);

    }
  );

}


/* =====================================================
   SEARCH + FILTER + SORT
   ===================================================== */

function searchBusinesses() {

  const searchTerm =
    searchInput
      ? searchInput.value
          .toLowerCase()
          .trim()
      : "";


  const selectedCategory =
    categoryFilter
      ? categoryFilter.value
      : "All";


  let filtered =
    businesses.filter(
      function (business) {

        const searchableText = [

          business.name || "",
          business.category || "",
          business.location || "",
          business.description || ""

        ]
          .join(" ")
          .toLowerCase();


        const matchesSearch =
          searchableText.includes(
            searchTerm
          );


        const matchesCategory =
          selectedCategory === "All" ||
          business.category ===
            selectedCategory;


        return (
          matchesSearch &&
          matchesCategory
        );

      }
    );


  const sortValue =
    sortFilter
      ? sortFilter.value
      : "newest";


  if (sortValue === "name") {

    filtered.sort(
      function (a, b) {

        return String(
          a.name || ""
        ).localeCompare(
          String(b.name || "")
        );

      }
    );

  }


  if (sortValue === "location") {

    filtered.sort(
      function (a, b) {

        return String(
          a.location || ""
        ).localeCompare(
          String(b.location || "")
        );

      }
    );

  }


  if (sortValue === "newest") {

    filtered.sort(
      function (a, b) {

        const planDifference =
          getPlanRank(b) -
          getPlanRank(a);

        if (planDifference !== 0) {
          return planDifference;
        }


        const dateA =
          new Date(
            a.created_at || 0
          ).getTime();


        const dateB =
          new Date(
            b.created_at || 0
          ).getTime();


        return dateB - dateA;

      }
    );

  }


  renderBusinesses(
    filtered
  );

}


/* =====================================================
   CATEGORY FILTER
   ===================================================== */

function filterCategory(
  category
) {

  if (categoryFilter) {

    categoryFilter.value =
      category;

  }


  if (searchInput) {

    searchInput.value =
      "";

  }


  document
    .querySelectorAll(
      ".category-btn"
    )
    .forEach(
      function (button) {

        button.classList.toggle(
          "active",
          button.dataset.category ===
            category
        );

      }
    );


  updateClearSearch();

  searchBusinesses();

  scrollToBusinesses();

}


/* =====================================================
   SEARCH CLEAR
   ===================================================== */

function updateClearSearch() {

  if (!clearSearch || !searchInput) {
    return;
  }

  clearSearch.classList.toggle(
    "show",
    searchInput.value.length > 0
  );

}


if (searchInput) {

  searchInput.addEventListener(
    "input",
    function () {

      updateClearSearch();

      searchBusinesses();

    }
  );

}


if (clearSearch) {

  clearSearch.addEventListener(
    "click",
    function () {

      if (searchInput) {

        searchInput.value =
          "";

        searchInput.focus();

      }

      updateClearSearch();

      searchBusinesses();

    }
  );

}


/* =====================================================
   STATS
   ===================================================== */

function updateStats() {

  const totalBusinesses =
    document.getElementById(
      "totalBusinesses"
    );

  const totalCategories =
    document.getElementById(
      "totalCategories"
    );

  const totalLocations =
    document.getElementById(
      "totalLocations"
    );


  const realOnlineBusinesses =
    businesses.filter(
      function (business) {

        return Boolean(
          business.id
        );

      }
    );


  const categories =
    new Set(
      businesses
        .map(
          function (business) {
            return business.category;
          }
        )
        .filter(Boolean)
    );


  const locations =
    new Set(
      businesses
        .map(
          function (business) {
            return String(
              business.location || ""
            )
              .trim()
              .toLowerCase();
          }
        )
        .filter(Boolean)
    );


  if (totalBusinesses) {

    totalBusinesses.textContent =
      businesses.length;

  }


  if (totalCategories) {

    totalCategories.textContent =
      categories.size;

  }


  if (totalLocations) {

    totalLocations.textContent =
      locations.size;

  }

}


/* =====================================================
   DETAILS MODAL
   ===================================================== */

function showDetails(
  business
) {

  if (
    !detailsModal ||
    !detailsContent
  ) {

    return;

  }


  const name =
    escapeHTML(
      business.name
    );

  const category =
    escapeHTML(
      business.category
    );

  const location =
    escapeHTML(
      business.location
    );

  const phone =
    escapeHTML(
      business.phone
    );

  const description =
    escapeHTML(
      business.description ||
      "Local business on LocalLift."
    );


  const icon =
    business.icon ||
    getIcon(
      business.category
    );


  const plan =
    getPlan(business);


  let badge = "";


  if (plan === "premium") {

    badge = `
      <span class="premium-badge">
        🚀 PREMIUM
      </span>
    `;

  } else if (plan === "featured") {

    badge = `
      <span class="featured-badge">
        ⭐ FEATURED
      </span>
    `;

  }


  detailsContent.innerHTML = `

    <div class="details-icon">
      ${icon}
    </div>

    <div class="badges">

      <span class="business-category">
        ${category}
      </span>

      ${badge}

    </div>

    <h2>
      ${name}
    </h2>


    <div class="details-meta">

      <div>

        <strong>
          LOCATION
        </strong>

        📍 ${location}

      </div>


      ${
        phone
          ? `
            <div>

              <strong>
                PHONE
              </strong>

              📞 ${phone}

            </div>
          `
          : ""
      }

    </div>


    <p class="details-description">
      ${description}
    </p>


    ${
      phone
        ? `
          <a
            class="details-call"
            href="tel:${phone}"
          >
            📞 Call this business
          </a>
        `
        : ""
    }

  `;


  detailsModal.classList.add(
    "show"
  );

  detailsModal.setAttribute(
    "aria-hidden",
    "false"
  );

}


/* =====================================================
   CLOSE DETAILS
   ===================================================== */

function closeDetails() {

  if (!detailsModal) {
    return;
  }

  detailsModal.classList.remove(
    "show"
  );

  detailsModal.setAttribute(
    "aria-hidden",
    "true"
  );

}


/* =====================================================
   BUSINESS MODAL
   ===================================================== */

function openModal() {

  if (!businessModal) {
    return;
  }

  businessModal.classList.add(
    "show"
  );

  businessModal.setAttribute(
    "aria-hidden",
    "false"
  );


  setTimeout(
    function () {

      const input =
        document.getElementById(
          "businessName"
        );

      if (input) {
        input.focus();
      }

    },
    100
  );

}


function closeModal() {

  if (!businessModal) {
    return;
  }

  businessModal.classList.remove(
    "show"
  );

  businessModal.setAttribute(
    "aria-hidden",
    "true"
  );

}


/* =====================================================
   PROMOTION REQUEST
   ===================================================== */

function openPromotionRequest(
  plan
) {

  if (!promotionModal) {
    return;
  }


  const planInput =
    document.getElementById(
      "promotionPlan"
    );


  if (planInput) {

    planInput.value =
      plan;

  }


  promotionModal.classList.add(
    "show"
  );

  promotionModal.setAttribute(
    "aria-hidden",
    "false"
  );


  setTimeout(
    function () {

      const input =
        document.getElementById(
          "promotionBusiness"
        );

      if (input) {
        input.focus();
      }

    },
    100
  );

}


function closePromotionModal() {

  if (!promotionModal) {
    return;
  }

  promotionModal.classList.remove(
    "show"
  );

  promotionModal.setAttribute(
    "aria-hidden",
    "true"
  );

}


/* =====================================================
   PROMOTION FORM
   ===================================================== */

function submitPromotionRequest(
  event
) {

  event.preventDefault();


  const businessName =
    document.getElementById(
      "promotionBusiness"
    ).value.trim();


  const phone =
    document.getElementById(
      "promotionPhone"
    ).value.trim();


  const plan =
    document.getElementById(
      "promotionPlan"
    ).value;


  if (
    !businessName ||
    !phone ||
    !plan
  ) {

    showToast(
      "Please fill in all fields."
    );

    return;

  }


  /*
    If you add your owner contact above,
    this opens the user's phone's messaging
    application.

    Otherwise we show a clear message.
  */

  if (OWNER_CONTACT) {

    const message =
      `Hello LocalLift! I want to promote my business.%0A%0A` +
      `Business: ${encodeURIComponent(businessName)}%0A` +
      `Plan: ${encodeURIComponent(plan)}%0A` +
      `Contact: ${encodeURIComponent(phone)}`;


    const cleanNumber =
      OWNER_CONTACT.replace(
        /[^0-9+]/g,
        ""
      );


    window.open(
      `https://wa.me/${cleanNumber.replace("+", "")}?text=${message}`,
      "_blank"
    );


    showToast(
      "Opening your promotion request..."
    );

  } else {

    showToast(
      "Promotion request saved. Add your contact number in script.js to receive requests."
    );

  }


  document
    .getElementById(
      "promotionForm"
    )
    .reset();


  closePromotionModal();

}


/* =====================================================
   ADD BUSINESS
   ===================================================== */

async function addBusiness(
  event
) {

  event.preventDefault();


  const form =
    event.target;


  const submitButton =
    form.querySelector(
      ".submit-btn"
    );


  const name =
    document
      .getElementById(
        "businessName"
      )
      .value
      .trim();


  const category =
    document
      .getElementById(
        "businessCategory"
      )
      .value;


  const location =
    document
      .getElementById(
        "businessLocation"
      )
      .value
      .trim();


  const phone =
    document
      .getElementById(
        "businessPhone"
      )
      .value
      .trim();


  const description =
    document
      .getElementById(
        "businessDescription"
      )
      .value
      .trim();


  if (
    !name ||
    !category ||
    !location
  ) {

    showToast(
      "Please fill in the required fields."
    );

    return;

  }


  const newBusiness = {

    name: name,

    category: category,

    location: location,

    phone: phone,

    description:
      description ||
      "Local business on LocalLift."

  };


  try {

    if (
      !SUPABASE_KEY ||
      SUPABASE_KEY ===
        "PASTE_YOUR_EXISTING_PUBLISHABLE_KEY_HERE"
    ) {

      throw new Error(
        "Your Supabase publishable key is missing."
      );

    }


    if (submitButton) {

      submitButton.disabled =
        true;

      submitButton.textContent =
        "Adding...";

    }


    const response =
      await fetch(
        `${SUPABASE_URL}/rest/v1/Business`,
        {

          method: "POST",

          headers: {

            apikey:
              SUPABASE_KEY,

            Authorization:
              `Bearer ${SUPABASE_KEY}`,

            "Content-Type":
              "application/json",

            Prefer:
              "return=representation"

          },

          body:
            JSON.stringify(
              newBusiness
            )

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
      Array.isArray(
        savedBusinesses
      ) &&
      savedBusinesses.length > 0
    ) {

      businesses.push({

        ...savedBusinesses[0],

        icon:
          getIcon(
            savedBusinesses[0]
              .category
          ),

        plan:
          "free"

      });

    } else {

      businesses.push({

        ...newBusiness,

        icon:
          getIcon(
            newBusiness.category
          ),

        plan:
          "free"

      });

    }


    form.reset();

    closeModal();

    updateStats();

    searchBusinesses();


    showToast(
      "🎉 Your business has been added to LocalLift!"
    );


  } catch (error) {

    console.error(
      "LocalLift Supabase insert error:",
      error
    );


    showToast(
      "❌ Supabase error. Check the browser console for details."
    );


    console.error(
      error.message
    );


  } finally {

    if (submitButton) {

      submitButton.disabled =
        false;

      submitButton.textContent =
        "Add Business";

    }

  }

}


/* =====================================================
   TOAST
   ===================================================== */

function showToast(
  message
) {

  if (!toast) {
    return;
  }


  toast.textContent =
    message;


  toast.classList.add(
    "show"
  );


  clearTimeout(
    toastTimer
  );


  toastTimer =
    setTimeout(
      function () {

        toast.classList.remove(
          "show"
        );

      },
      3000
    );

}


/* =====================================================
   SCROLL HELPERS
   ===================================================== */

function scrollToBusinesses() {

  const section =
    document.getElementById(
      "businesses"
    );

  if (section) {

    section.scrollIntoView({
      behavior: "smooth"
    });

  }

}


function scrollToPricing() {

  const section =
    document.getElementById(
      "pricing"
    );

  if (section) {

    section.scrollIntoView({
      behavior: "smooth"
    });

  }

}


/* =====================================================
   DARK MODE
   ===================================================== */

function loadTheme() {

  const savedTheme =
    localStorage.getItem(
      "locallift_theme"
    );


  if (savedTheme === "dark") {

    document.body.classList.add(
      "dark"
    );

    if (themeToggle) {
      themeToggle.textContent =
        "☀";
    }

  }

}


function toggleTheme() {

  const dark =
    document.body.classList.toggle(
      "dark"
    );


  localStorage.setItem(
    "locallift_theme",
    dark ? "dark" : "light"
  );


  if (themeToggle) {

    themeToggle.textContent =
      dark ? "☀" : "☾";

  }

}


if (themeToggle) {

  themeToggle.addEventListener(
    "click",
    toggleTheme
  );

}


/* =====================================================
   MODAL CLICK OUTSIDE
   ===================================================== */

[
  businessModal,
  detailsModal,
  promotionModal
].forEach(
  function (modalElement) {

    if (!modalElement) {
      return;
    }


    modalElement.addEventListener(
      "click",
      function (event) {

        if (
          event.target ===
          modalElement
        ) {

          modalElement.classList.remove(
            "show"
          );

        }

      }
    );

  }
);


/* =====================================================
   ESC KEY
   ===================================================== */

document.addEventListener(
  "keydown",
  function (event) {

    if (event.key !== "Escape") {
      return;
    }

    closeModal();
    closeDetails();
    closePromotionModal();

  }
);


/* =====================================================
   SORT EVENT
   ===================================================== */

if (sortFilter) {

  sortFilter.addEventListener(
    "change",
    searchBusinesses
  );

}


if (categoryFilter) {

  categoryFilter.addEventListener(
    "change",
    function () {

      const category =
        categoryFilter.value;


      document
        .querySelectorAll(
          ".category-btn"
        )
        .forEach(
          function (button) {

            button.classList.toggle(
              "active",
              button.dataset.category ===
                category
            );

          }
        );


      searchBusinesses();

    }
  );

}


/* =====================================================
   BACK TO TOP
   ===================================================== */

window.addEventListener(
  "scroll",
  function () {

    if (!backTop) {
      return;
    }


    backTop.classList.toggle(
      "show",
      window.scrollY > 500
    );

  }
);


/* =====================================================
   GLOBAL FUNCTIONS FOR HTML
   ===================================================== */

window.openModal =
  openModal;

window.closeModal =
  closeModal;

window.addBusiness =
  addBusiness;

window.filterCategory =
  filterCategory;

window.searchBusinesses =
  searchBusinesses;

window.showDetails =
  showDetails;

window.closeDetails =
  closeDetails;

window.openPromotionRequest =
  openPromotionRequest;

window.closePromotionModal =
  closePromotionModal;

window.submitPromotionRequest =
  submitPromotionRequest;

window.scrollToBusinesses =
  scrollToBusinesses;

window.scrollToPricing =
  scrollToPricing;


/* =====================================================
   START LOCALLIFT
   ===================================================== */

loadTheme();

loadBusinesses();