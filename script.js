/* =========================================
LOCALLIFT 2.0
SUPABASE
========================================= */

const SUPABASE_URL =
"https://lhfpowxkmbyyewwxihtw.supabase.co";

const SUPABASE_KEY =
"sb_publishable_PvjBQAO6FTmtv-F1KYPZVg_6sYUZf84";

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
description:
"A cozy local café serving delicious food and drinks."
},
{
name: "Pixel Tech",
category: "Technology",
location: "Mirpur",
phone: "",
description:
"Phones, computers, accessories and technology services."
},
{
name: "Urban Threads",
category: "Clothing",
location: "Mirpur",
phone: "",
description:
"Trendy clothing and fashion for everyday style."
},
{
name: "Glow Studio",
category: "Beauty",
location: "Mirpur",
phone: "",
description:
"Beauty and personal care services."
},
{
name: "QuickFix Services",
category: "Services",
location: "Mangla",
phone: "",
description:
"Reliable local repair and maintenance services."
},
{
name: "Spice House",
category: "Restaurant",
location: "Jhelum",
phone: "",
description:
"Fresh and tasty local food for everyone."
}
];

let businesses = [...defaultBusinesses];

let currentBusiness = null;

/* =========================================
ELEMENTS
========================================= */

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

const resetFilters =
document.getElementById("resetFilters");

const businessModal =
document.getElementById("businessModal");

const detailsModal =
document.getElementById("detailsModal");

const businessForm =
document.getElementById("businessForm");

const descriptionInput =
document.getElementById("businessDescription");

const descriptionCount =
document.getElementById("descriptionCount");

const toast =
document.getElementById("toast");

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

const div =
document.createElement("div");

div.textContent =
value == null ? "" : String(value);

return div.innerHTML;
}

/* =========================================
TOAST
========================================= */

let toastTimer;

function showToast(message) {

if (!toast) {
return;
}

toast.textContent = message;

toast.classList.add("show");

clearTimeout(toastTimer);

toastTimer = setTimeout(function () {
toast.classList.remove("show");
}, 2600);
}

/* =========================================
LOAD BUSINESSES
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
  ...onlineBusinesses.map(function (business) {

    return {
      ...business,
      icon: getIcon(business.category)
    };

  })
];


renderBusinesses();

} catch (error) {

console.error(
  "LocalLift loading error:",
  error
);

businesses = [
  ...defaultBusinesses
];

renderBusinesses();

}
}

/* =========================================
RENDER BUSINESSES
========================================= */

function renderBusinesses(list = businesses) {

if (!businessList) {
return;
}

businessList.innerHTML = "";

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
    <div class="no-results-icon">⌕</div>
    <h3>No businesses found</h3>
    <p>
      Try another search or category.
    </p>
  </div>
`;

return;

}

list.forEach(function (business, index) {

const card =
  document.createElement("article");

card.className =
  "business-card";

card.style.animationDelay =
  `${Math.min(index * 45, 300)}ms`;


const name =
  escapeHTML(business.name);

const category =
  escapeHTML(business.category);

const location =
  escapeHTML(business.location);

const phone =
  escapeHTML(business.phone);

const description =
  escapeHTML(
    business.description ||
    "Local business on LocalLift."
  );


const icon =
  business.icon ||
  getIcon(business.category);


card.innerHTML = `

  <div class="business-card-top">

    <div class="business-icon">
      ${icon}
    </div>

    <span class="business-category">
      ${category || "Business"}
    </span>

  </div>

  <h3>${name || "Unnamed Business"}</h3>

  <p class="business-location">
    📍 ${location || "Location not provided"}
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
      class="view-btn"
      type="button"
    >
      View details
    </button>

  </div>
`;


const viewButton =
  card.querySelector(".view-btn");


if (viewButton) {

  viewButton.addEventListener(
    "click",
    function () {
      showDetails(business);
    }
  );

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
? searchInput.value
.toLowerCase()
.trim()
: "";

const selectedCategory =
categoryFilter
? categoryFilter.value
: "All";

const filtered =
businesses.filter(function (business) {

  const text =
    `${business.name || ""} ` +
    `${business.category || ""} ` +
    `${business.location || ""} ` +
    `${business.phone || ""} ` +
    `${business.description || ""}`;


  const matchesSearch =
    text
      .toLowerCase()
      .includes(searchTerm);


  const matchesCategory =
    selectedCategory === "All" ||
    business.category === selectedCategory;


  return (
    matchesSearch &&
    matchesCategory
  );

});

renderBusinesses(filtered);

updateCategoryButtons(
selectedCategory
);

}

/* =========================================
CATEGORY FILTER
========================================= */

function filterCategory(category) {

if (categoryFilter) {
categoryFilter.value =
category;
}

if (searchInput) {
searchInput.value = "";
}

updateClearButton();

searchBusinesses();

scrollToBusinesses();
}

/* =========================================
CATEGORY BUTTON UI
========================================= */

function updateCategoryButtons(category) {

const buttons =
document.querySelectorAll(
".category-card"
);

buttons.forEach(function (button) {

button.classList.toggle(
  "active",
  button.dataset.category === category
);

});

}

/* =========================================
RESET FILTERS
========================================= */

function resetAllFilters() {

if (searchInput) {
searchInput.value = "";
}

if (categoryFilter) {
categoryFilter.value = "All";
}

updateClearButton();

searchBusinesses();

updateCategoryButtons("All");

}

/* =========================================
CLEAR SEARCH
========================================= */

function updateClearButton() {

if (!clearSearch || !searchInput) {
return;
}

clearSearch.classList.toggle(
"show",
searchInput.value.length > 0
);
}

if (clearSearch) {

clearSearch.addEventListener(
"click",
function () {

  if (searchInput) {
    searchInput.value = "";
    searchInput.focus();
  }

  updateClearButton();

  searchBusinesses();

}

);

}

/* =========================================
SCROLL TO DIRECTORY
========================================= */

function scrollToBusinesses() {

const section =
document.getElementById("businesses");

if (section) {

section.scrollIntoView({
  behavior: "smooth",
  block: "start"
});

}

}

/* =========================================
DETAILS MODAL
========================================= */

function showDetails(business) {

currentBusiness =
business;

const detailsIcon =
document.getElementById("detailsIcon");

const detailsCategory =
document.getElementById("detailsCategory");

const detailsName =
document.getElementById("detailsName");

const detailsLocation =
document.getElementById("detailsLocation");

const detailsPhone =
document.getElementById("detailsPhone");

const detailsDescription =
document.getElementById("detailsDescription");

const detailsPhoneRow =
document.getElementById("detailsPhoneRow");

const detailsCall =
document.getElementById("detailsCall");

const detailsCopy =
document.getElementById("detailsCopy");

const detailsMap =
document.getElementById("detailsMap");

if (detailsIcon) {
detailsIcon.textContent =
getIcon(business.category);
}

if (detailsCategory) {
detailsCategory.textContent =
business.category ||
"Business";
}

if (detailsName) {
detailsName.textContent =
business.name ||
"Unnamed Business";
}

if (detailsLocation) {
detailsLocation.textContent =
business.location ||
"Location not provided";
}

if (detailsDescription) {
detailsDescription.textContent =
business.description ||
"No description available.";
}

if (business.phone) {

if (detailsPhoneRow) {
  detailsPhoneRow.style.display =
    "flex";
}

if (detailsPhone) {
  detailsPhone.textContent =
    business.phone;
}

if (detailsCall) {
  detailsCall.href =
    `tel:${business.phone}`;

  detailsCall.style.display =
    "block";
}

if (detailsCopy) {
  detailsCopy.style.display =
    "block";
}

} else {

if (detailsPhoneRow) {
  detailsPhoneRow.style.display =
    "none";
}

if (detailsCall) {
  detailsCall.style.display =
    "none";
}

if (detailsCopy) {
  detailsCopy.style.display =
    "none";
}

}

if (detailsMap) {

const location =
  encodeURIComponent(
    business.location || ""
  );

detailsMap.href =
  `https://www.google.com/maps/search/?api=1&query=${location}`;

}

openDetails();

}

/* =========================================
OPEN DETAILS
========================================= */

function openDetails() {

if (!detailsModal) {
return;
}

detailsModal.classList.add("show");

detailsModal.setAttribute(
"aria-hidden",
"false"
);

document.body.classList.add(
"modal-open"
);

}

/* =========================================
CLOSE DETAILS
========================================= */

function closeDetails() {

if (!detailsModal) {
return;
}

detailsModal.classList.remove("show");

detailsModal.setAttribute(
"aria-hidden",
"true"
);

document.body.classList.remove(
"modal-open"
);

currentBusiness =
null;

}

/* =========================================
COPY PHONE
========================================= */

if (document.getElementById("detailsCopy")) {

document
.getElementById("detailsCopy")
.addEventListener(
"click",
async function () {

    if (
      !currentBusiness ||
      !currentBusiness.phone
    ) {
      return;
    }


    try {

      await navigator.clipboard.writeText(
        currentBusiness.phone
      );

      showToast(
        "Phone number copied."
      );

    } catch (error) {

      showToast(
        "Could not copy the number."
      );

    }

  }
);

}

/* =========================================
ADD BUSINESS MODAL
========================================= */

function openModal() {

if (!businessModal) {
return;
}

businessModal.classList.add("show");

businessModal.setAttribute(
"aria-hidden",
"false"
);

document.body.classList.add(
"modal-open"
);

setTimeout(function () {

const nameInput =
  document.getElementById(
    "businessName"
  );

if (nameInput) {
  nameInput.focus();
}

}, 100);

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

document.body.classList.remove(
"modal-open"
);

}

/* =========================================
CLOSE MODALS BY CLICKING BACKDROP
========================================= */

if (businessModal) {

businessModal.addEventListener(
"click",
function (event) {

  if (
    event.target ===
    businessModal
  ) {
    closeModal();
  }

}

);

}

if (detailsModal) {

detailsModal.addEventListener(
"click",
function (event) {

  if (
    event.target ===
    detailsModal
  ) {
    closeDetails();
  }

}

);

}

/* =========================================
ESC KEY
========================================= */

document.addEventListener(
"keydown",
function (event) {

if (event.key !== "Escape") {
  return;
}

closeModal();
closeDetails();

}
);

/* =========================================
DESCRIPTION COUNTER
========================================= */

if (descriptionInput) {

descriptionInput.addEventListener(
"input",
function () {

  if (descriptionCount) {

    descriptionCount.textContent =
      descriptionInput.value.length;

  }

}

);

}

/* =========================================
ADD BUSINESS TO SUPABASE
========================================= */

async function addBusiness(event) {

event.preventDefault();

const form =
event.target;

const submitButton =
form.querySelector(
".submit-btn"
);

const nameElement =
document.getElementById(
"businessName"
);

const categoryElement =
document.getElementById(
"businessCategory"
);

const locationElement =
document.getElementById(
"businessLocation"
);

const phoneElement =
document.getElementById(
"businessPhone"
);

const descriptionElement =
document.getElementById(
"businessDescription"
);

if (
!nameElement ||
!categoryElement ||
!locationElement ||
!phoneElement ||
!descriptionElement
) {

showToast(
  "Form fields are missing."
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
phoneElement.value.trim();

const description =
descriptionElement.value.trim();

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

/* EXACT DATABASE COLUMNS */

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

if (submitButton) {

  submitButton.disabled =
    true;

  submitButton.classList.add(
    "loading"
  );

}


const response =
  await fetch(
    `${SUPABASE_URL}/rest/v1/${TABLE_NAME}`,
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


let savedBusiness =
  newBusiness;


if (
  Array.isArray(
    savedBusinesses
  ) &&
  savedBusinesses.length > 0
) {

  savedBusiness =
    savedBusinesses[0];

}


businesses.push({

  ...savedBusiness,

  icon:
    getIcon(
      savedBusiness.category
    )

});


form.reset();


if (descriptionCount) {
  descriptionCount.textContent =
    "0";
}


closeModal();


searchBusinesses();


showToast(
  "🎉 Business added to LocalLift!"
);

} catch (error) {

console.error(
  "LocalLift Supabase insert error:",
  error
);


alert(
  "Supabase error:\n\n" +
  error.message
);

} finally {

if (submitButton) {

  submitButton.disabled =
    false;

  submitButton.classList.remove(
    "loading"
  );

}

}

}

/* =========================================
EVENTS
========================================= */

if (searchInput) {

searchInput.addEventListener(
"input",
function () {

  updateClearButton();

  searchBusinesses();

}

);

}

if (categoryFilter) {

categoryFilter.addEventListener(
"change",
searchBusinesses
);

}

if (resetFilters) {

resetFilters.addEventListener(
"click",
resetAllFilters
);

}

/* =========================================
GLOBAL HTML FUNCTIONS
========================================= */

window.openModal =
openModal;

window.closeModal =
closeModal;

window.closeDetails =
closeDetails;

window.addBusiness =
addBusiness;

window.filterCategory =
filterCategory;

window.searchBusinesses =
searchBusinesses;

window.scrollToBusinesses =
scrollToBusinesses;

/* =========================================
START
========================================= */

loadBusinesses();