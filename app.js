const STATUSES = ["New", "Confirmed", "Pending", "In production", "Sent for polishing", "Polishing returned", "Ready to pack", "Partly dispatched", "Dispatched", "On hold", "Returned", "Cancelled"];
const seedOrders = [
  { id:"VS-1001", customer:"Gupta Traders Ambala", product:"Kadai No.10", quantity:200, unit:"pcs", rate:185, status:"Dispatched", owner:"Ramesh", blocker:"", channel:"Distributor", updated:"07 Sep 2026" },
  { id:"VS-1002", customer:"Sharma Bartan Bhandar Karnal", product:"Gilas 300ml", quantity:30, unit:"dozen", rate:260, status:"On hold", owner:"Munshi ji", blocker:"Payment hold - old dues INR 1.8 lakh", channel:"Distributor", updated:"05 Sep 2026" },
  { id:"VS-1003", customer:"Bansal & Sons Rohtak", product:"Tope No.6", quantity:120, unit:"pcs", rate:340, status:"Sent for polishing", owner:"Ramesh", blocker:"Polish return pending", channel:"Distributor", updated:"07 Sep 2026" },
  { id:"VS-1004", customer:"Mehra Kitchenware Jalandhar", product:"Kadai No.10", quantity:300, dispatched:180, unit:"pcs", rate:180, status:"Partly dispatched", owner:"Ramesh", blocker:"", channel:"Distributor", updated:"06 Sep 2026" },
  { id:"VS-1005", customer:"Verma Utensils Sonipat", product:"Kadhai 10 no.", quantity:180, unit:"kg", rate:0, status:"Pending", owner:"Kunal", blocker:"Rate confirmation required", channel:"Phone", updated:"06 Sep 2026" },
  { id:"VS-1006", customer:"New Delhi Steel House", product:"Thali 12 inch", quantity:50, unit:"dozen", rate:610, status:"Dispatched", owner:"Ramesh", blocker:"", channel:"Distributor", updated:"07 Sep 2026" },
  { id:"VS-1007", customer:"Online - Kunal", product:"Patila set 5pc", quantity:8, unit:"set", rate:1199, status:"Dispatched", owner:"Kunal", blocker:"", channel:"Online", updated:"07 Sep 2026" }
];
const seedLots = [
  { id:"PL-204", contractor:"Pappu", sent:"420 kg", received:"1,180 pcs", variance:"6 kg short", status:"Unreconciled" },
  { id:"PL-205", contractor:"Bahar Polishing Unit", sent:"120 pcs", received:"0 pcs", variance:"Awaiting return", status:"Open" }
];
let orders = JSON.parse(localStorage.getItem("vardhan-orders") || "null") || seedOrders;
const lots = seedLots;
const $ = (id) => document.getElementById(id);
const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;" }[char]));
function save() { localStorage.setItem("vardhan-orders", JSON.stringify(orders)); }
function isBlocked(order) { return Boolean(order.blocker) || order.status === "On hold" || order.status === "Sent for polishing" || order.status === "Pending"; }
function badge(status) { const cls = status.toLowerCase().replaceAll(" ", "-"); return `<span class="badge ${cls}">${esc(status)}</span>`; }
function render() {
  const search = $("searchInput").value.toLowerCase().trim();
  const filter = $("statusFilter").value;
  const filtered = orders.filter((order) => (!filter || order.status === filter) && `${order.id} ${order.customer} ${order.product}`.toLowerCase().includes(search));
  $("ordersBody").innerHTML = filtered.map((order) => {
    const remaining = Math.max(0, order.quantity - (order.dispatched || 0));
    return `<tr data-id="${esc(order.id)}"><td><span class="order-id">${esc(order.id)}</span><span class="sub">${esc(order.channel)}</span></td><td><strong>${esc(order.customer)}</strong><span class="sub">${esc(order.product)}</span></td><td>${esc(order.quantity)} ${esc(order.unit)}${order.dispatched ? `<span class="sub">${esc(order.dispatched)} sent / ${esc(remaining)} left</span>` : ""}</td><td>${badge(order.status)}</td><td>${esc(order.owner)}</td><td>${order.blocker ? `<span class="sub">${esc(order.blocker)}</span>` : `<span class="muted">-</span>`}</td><td>${esc(order.updated)}</td></tr>`;
  }).join("");
  $("emptyOrders").classList.toggle("hidden", filtered.length > 0);
  $("openCount").textContent = orders.filter((o) => !["Dispatched", "Cancelled"].includes(o.status)).length;
  $("blockedCount").textContent = orders.filter(isBlocked).length;
  $("partialCount").textContent = orders.filter((o) => o.status === "Partly dispatched").length;
  $("polishingCount").textContent = lots.filter((l) => l.status !== "Reconciled").length;
  $("blockedList").innerHTML = orders.filter(isBlocked).slice(0, 6).map((o) => `<div class="item"><div class="item-title">${esc(o.id)} · ${esc(o.customer)}</div><div class="item-meta">${badge(o.status)} ${esc(o.blocker || "Needs review")} · Owner: ${esc(o.owner)}</div></div>`).join("") || `<p class="empty">No blocked orders.</p>`;
  $("polishingList").innerHTML = lots.map((l) => `<div class="item"><div class="item-title">${esc(l.id)} · ${esc(l.contractor)}</div><div class="item-meta">${esc(l.sent)} sent · ${esc(l.received)} received · <strong>${esc(l.variance)}</strong></div></div>`).join("");
}
function fillStatusSelect(selectId, includeAll = false) { const select = $(selectId); select.innerHTML = includeAll ? `<option value="">All statuses</option>` : ""; STATUSES.forEach((status) => { select.insertAdjacentHTML("beforeend", `<option value="${esc(status)}">${esc(status)}</option>`); }); }
function openOrder(order) {
  $("dialogTitle").textContent = order ? `Edit ${order.id}` : "New order";
  $("orderId").value = order?.id || ""; $("customer").value = order?.customer || ""; $("channel").value = order?.channel || "Distributor"; $("product").value = order?.product || ""; $("quantity").value = order?.quantity || ""; $("unit").value = order?.unit || "pcs"; $("rate").value = order?.rate || ""; $("status").value = order?.status || "New"; $("owner").value = order?.owner || "Kunal"; $("blocker").value = order?.blocker || "";
  $("orderDialog").showModal();
}
$("newOrderButton").addEventListener("click", () => openOrder());
$("searchInput").addEventListener("input", render); $("statusFilter").addEventListener("change", render);
$("ordersBody").addEventListener("click", (event) => { const row = event.target.closest("tr[data-id]"); if (row) openOrder(orders.find((order) => order.id === row.dataset.id)); });
$("orderForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const id = $("orderId").value || `VS-${1000 + orders.length + 1}`;
  const existing = orders.find((order) => order.id === id);
  const value = { id, customer:$("customer").value.trim(), channel:$("channel").value, product:$("product").value.trim(), quantity:Number($("quantity").value), unit:$("unit").value, rate:Number($("rate").value || 0), status:$("status").value, owner:$("owner").value, blocker:$("blocker").value.trim(), updated:"Today" };
  if (existing) Object.assign(existing, value); else orders.unshift(value);
  save(); $("orderDialog").close(); render();
});
fillStatusSelect("status"); fillStatusSelect("statusFilter", true); render();
