// checkout.js

const cart = JSON.parse(localStorage.getItem("cart")) || [];

if (cart.length === 0) {
  alert("Cart is empty");
  window.location.href = "index.html";
}

// Render order summary
const summaryDiv = document.getElementById("summary");

let subtotal = 0;
cart.forEach(item => {
  subtotal += item.price * item.qty;

  summaryDiv.innerHTML += `
    <p style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e9ecef;">
      <span>${item.name} × ${item.qty}</span>
      <span style="font-weight: 600;">₹${item.price * item.qty}</span>
    </p>
  `;
});

const taxRate = 0.18; // 18% GST
const taxAmount = subtotal * taxRate;
const total = subtotal + taxAmount;

summaryDiv.innerHTML += `
  <hr style="margin: 15px 0;">
  <p style="display: flex; justify-content: space-between; padding: 8px 0;">
    <span>Subtotal:</span>
    <span style="font-weight: 600;">₹${subtotal.toFixed(2)}</span>
  </p>
  <p style="display: flex; justify-content: space-between; padding: 8px 0;">
    <span>Tax (GST 18%):</span>
    <span style="font-weight: 600; color: #11998e;">₹${taxAmount.toFixed(2)}</span>
  </p>
  <hr style="margin: 15px 0;">
  <h3 style="display: flex; justify-content: space-between; color: #11998e;">
    <span>Total:</span>
    <span>₹${total.toFixed(2)}</span>
  </h3>
`;

// Place order
async function placeOrder() {
  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const address = document.getElementById("address").value.trim();

  if (!name || !phone || !address) {
    alert("Please fill all details");
    return;
  }

  // Check if user has enough coins
  const gameState = localStorage.getItem("gameState");
  if (!gameState) {
    alert("Play the game first to earn coins! 🎮");
    window.location.href = "game.html";
    return;
  }

  const state = JSON.parse(gameState);
  if (state.coins < total) {
    alert(`Not enough coins! You have ${Math.floor(state.coins)} coins but need ${Math.floor(total)} coins. Play the game to earn ${Math.floor(total - state.coins)} more coins! 🎮`);
    window.location.href = "game.html";
    return;
  }

  const token = localStorage.getItem("token");

  if (!token) {
    alert("Please login to place order");
    window.location.href = "client.html";
    return;
  }

  // Deduct coins
  state.coins -= total;
  localStorage.setItem("gameState", JSON.stringify(state));

  // FINAL ORDER OBJECT
  const order = {
    customer: {
      name,
      phone,
      address
    },
    items: cart,
    subtotal: subtotal,
    tax: taxAmount,
    total: total,
    status: "placed",
    createdAt: new Date()
  };

  console.log("ORDER:", order);

  try {
    const response = await fetch(API_ENDPOINTS.orders, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(order)
    });

    // Check if response is ok before parsing JSON
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server error:", errorText);
      alert("Error placing order. Please check console for details.");
      return;
    }

    const result = await response.json();

    alert(`Order placed successfully! ${Math.floor(total)} coins deducted. 💰`);

    localStorage.removeItem("cart");
    window.location.href = "orders.html";
  } catch (err) {
    console.error("Error:", err);
    alert("Error placing order: " + err.message);
  }
}
