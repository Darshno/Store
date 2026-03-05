const API = API_ENDPOINTS.products.replace('/products', '');

// Check authentication
const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));

if (!token || !user) {
  window.location.href = "seller-login.html";
}

document.getElementById("sellerName").innerText = `Welcome, ${user.name}`;

async function uploadProduct() {
  const name = document.getElementById("name").value;
  const price = document.getElementById("price").value;
  const description = document.getElementById("description").value;
  const image = document.getElementById("image").value;
  const type = document.getElementById("type").value;

  if (!name || !price || !description || !image || !type) {
    alert("Please fill all fields");
    return;
  }

  const token = localStorage.getItem("token");

  if (!token) {
    alert("Please login first");
    window.location.href = "client.html";
    return;
  }

  const res = await fetch(`${API}/add-product`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ name, price, description, image, type })
  });

  const data = await res.json();

  if (res.ok) {
    alert("Product uploaded successfully");
    document.getElementById("name").value = "";
    document.getElementById("price").value = "";
    document.getElementById("description").value = "";
    document.getElementById("image").value = "";
    document.getElementById("type").value = "";
    loadProducts();
  } else {
    alert(data.message || "Failed to upload product");
  }
}

async function loadProducts() {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Please login first");
    window.location.href = "client.html";
    return;
  }

  const res = await fetch(`${API}/seller-products`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  const products = await res.json();
  const container = document.getElementById("productList");
  container.innerHTML = "";

  if (products.length === 0) {
    container.innerHTML = "<p>No products yet</p>";
    return;
  }

  products.forEach(p => {
    const div = document.createElement("div");
    div.className = "product";
    div.innerHTML = `
      <h3>${p.name}</h3>
      <p>Price: ₹${p.price}</p>
      <p>${p.description}</p>
      <p>Type: ${p.type}</p>
      <button class="btn-danger" onclick="deleteProduct('${p._id}')">Delete</button>
    `;
    container.appendChild(div);
  });
}

async function deleteProduct(id) {
  if (!confirm("Are you sure you want to delete this product?")) {
    return;
  }

  const token = localStorage.getItem("token");

  const res = await fetch(`${API}/delete-product/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  const data = await res.json();
  alert(data.message);
  loadProducts();
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "seller-login.html";
}

loadProducts();