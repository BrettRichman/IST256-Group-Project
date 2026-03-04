
// SIGN UP JS
function signUp(event) {
    event.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const year = document.getElementById('year').value.trim();
    const address = document.getElementById('address').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (!name || !email || !year || !address || !password) {
        alert("Please fill in all required fields.");
        return;
    }
    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    let members = JSON.parse(localStorage.getItem('members')) || [];
    if (members.find(m => m.email === email)) {
        alert("This email is already registered.");
        return;
    }

    const newMember = { name, email, phone, year, address, password };
    members.push(newMember);
    localStorage.setItem('members', JSON.stringify(members));

  
    sessionStorage.setItem('isLoggedIn', 'true');
    alert("Registration Successful!");
    window.location.href = "Members.html";
}

// DISPLAY MEMBERS JS
function displayMembers() {
    const memberTable = document.getElementById('memberTable');
    let members = JSON.parse(localStorage.getItem('members')) || [];

    memberTable.innerHTML = "";

    members.forEach(member => {
        const row = `
            <tr>
                <td>${member.name}</td>
                <td>${member.phone || "N/A"}</td>
                <td>${member.email}</td>
                <td>${member.address}</td>
            </tr>
        `;
        memberTable.innerHTML += row;
    });
}

// LOGIN JS
function login(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const pass = document.getElementById('loginPassword').value;
    
    let members = JSON.parse(localStorage.getItem('members')) || [];
    const user = members.find(m => m.email === email && m.password === pass);

    if (user) {
        sessionStorage.setItem('isLoggedIn', 'true');
        window.location.href = "Members.html";
    } else {
        alert("Invalid credentials!");
    }
}


function checkAuth() {
    const directoryBtn = document.getElementById('directoryBtn');
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    
    if (isLoggedIn === 'true') {
        directoryBtn.style.display = 'block';
    } else {
        directoryBtn.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', checkAuth);


// home page javascript!!!!
function displayWelcome() {
    // Check if user is logged in
    if (sessionStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'index.html';
        return;
    }

    // Get user email from sessionStorage (set during login/signup)
    const email = sessionStorage.getItem('currentUserEmail');
    if (!email) {
        document.getElementById('welcomeMsg').innerText = 'Welcome!';
        return;
    }

    // Get user info from localStorage
    const members = JSON.parse(localStorage.getItem('members')) || [];
    const user = members.find(m => m.email === email);
    if (user) {
        document.getElementById('welcomeMsg').innerText = `Welcome, ${user.name}!`;
    }
}

// Logout function
function logout() {
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('currentUserEmail');
    window.location.href = 'index.html';
}

// products.js

let products = [];

// Load JSON from file or localStorage
function loadProducts() {
    if (!localStorage.getItem('products')) {
        fetch('products.json')
            .then(response => response.json())
            .then(data => {
                products = data.products;
                localStorage.setItem('products', JSON.stringify(products));
                displayProducts();
            });
    } else {
        products = JSON.parse(localStorage.getItem('products'));
        displayProducts();
    }
}

// Display products in table
function displayProducts() {
    const tbody = document.querySelector('#productTable tbody');
    tbody.innerHTML = '';
    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.itemId}</td>
            <td>${product.description}</td>
            <td>${product.category}</td>
            <td>${product.format}</td>
            <td>${product.price}</td>
            <td>${product.additional || ''}</td>
            <td>
                <button class="btn btn-sm btn-warning" onclick="editProduct('${product.itemId}')">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteProduct('${product.itemId}')">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Add or Update product
function addOrUpdateProduct(event) {
    event.preventDefault();
    const itemId = document.getElementById('itemId').value.trim();
    const description = document.getElementById('description').value.trim();
    const category = document.getElementById('category').value.trim();
    const format = document.getElementById('format').value.trim();
    const price = document.getElementById('price').value.trim();
    const additional = document.getElementById('additional').value.trim();

    if (!itemId || !description || !category || !format || !price) {
        alert("Please fill in all required fields.");
        return;
    }

    const existing = products.find(p => p.itemId === itemId);
    if (existing) {
        // Update
        existing.description = description;
        existing.category = category;
        existing.format = format;
        existing.price = price;
        existing.additional = additional;
        alert("Product updated!");
    } else {
        // Add new
        products.push({ itemId, description, category, format, price, additional });
        alert("Product added!");
    }

    localStorage.setItem('products', JSON.stringify(products));
    displayProducts();
    document.getElementById('productForm').reset();
}

// Edit product - populate form for editing
function editProduct(itemId) {
    const product = products.find(p => p.itemId === itemId);
    if (!product) return;
    document.getElementById('itemId').value = product.itemId;
    document.getElementById('description').value = product.description;
    document.getElementById('category').value = product.category;
    document.getElementById('format').value = product.format;
    document.getElementById('price').value = product.price;
    document.getElementById('additional').value = product.additional || '';
}

// Delete product
function deleteProduct(itemId) {
    if (!confirm("Are you sure you want to delete this product?")) return;
    products = products.filter(p => p.itemId !== itemId);
    localStorage.setItem('products', JSON.stringify(products));
    displayProducts();
}

// Search/filter with jQuery
$('#searchInput').on('keyup', function() {
    const value = $(this).val().toLowerCase();
    $('#productTable tbody tr').filter(function() {
        $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
    });
});