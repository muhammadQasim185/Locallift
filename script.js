const businesses=[
{name:"Nova Café",cat:"Restaurant",loc:"Mirpur",icon:"☕",desc:"Coffee, snacks and a relaxed place to hang out."},
{name:"Pixel Tech",cat:"Technology",loc:"Mirpur",icon:"💻",desc:"Phones, accessories and everyday tech solutions."},
{name:"Urban Threads",cat:"Clothing",loc:"Jhelum",icon:"👕",desc:"Modern clothing and streetwear for everyday style."},
{name:"Glow Studio",cat:"Beauty",loc:"Mirpur",icon:"✨",desc:"Beauty and grooming services in a friendly studio."},
{name:"QuickFix Services",cat:"Services",loc:"Mangla",icon:"🔧",desc:"Reliable local repair and maintenance services."},
{name:"Spice House",cat:"Restaurant",loc:"Jhelum",icon:"🍽️",desc:"Local food and family dining."}
];
function renderBusinesses(){
 const q=document.getElementById("search").value.toLowerCase(), c=document.getElementById("category").value;
 const list=businesses.filter(b=>(c==="all"||b.cat===c)&&(b.name+" "+b.cat+" "+b.loc).toLowerCase().includes(q));
 document.getElementById("businessGrid").innerHTML=list.length?list.map(b=>`<article class="card"><div class="cover">${b.icon}</div><div class="card-body"><div class="tag">${b.cat}</div><h3>${b.name}</h3><div class="loc">📍 ${b.loc}</div><p class="desc">${b.desc}</p></div></article>`).join(""):`<p>No businesses found. Try another search.</p>`;
}
function openModal(){document.getElementById("modal").style.display="flex"}
function closeModal(){document.getElementById("modal").style.display="none"}
function addBusiness(e){
 e.preventDefault();
 businesses.unshift({name:name.value,cat:newCategory.value,loc:location.value,icon:"🏪",desc:description.value||"Local business listed on LocalLift."});
 closeModal(); e.target.reset(); renderBusinesses(); alert("Listing added! In a real launch, this would go to your admin dashboard for approval.");
}
renderBusinesses();