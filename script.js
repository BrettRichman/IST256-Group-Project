const API = 'http://localhost:3000/api';

//  AUTH HELPERS

function requireAuth() {
    if (sessionStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'login.html';
    }
}

function logout() {
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('currentUserEmail');
    window.location.href = 'index.html';
}

//  SIGN UP  →  POST /api/members

async function signUp(event) {
    event.preventDefault();

    const name            = document.getElementById('name').value.trim();
    const email           = document.getElementById('email').value.trim();
    const phone           = document.getElementById('phone').value.trim();
    const year            = document.getElementById('year').value.trim();
    const address         = document.getElementById('address').value.trim();
    const password        = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (!name || !email || !year || !address || !password) {
        alert('Please fill in all required fields.');
        return;
    }
    if (password !== confirmPassword) {
        alert('Passwords do not match.');
        return;
    }

    try {
        const res = await fetch(`${API}/members`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, phone, year, address, password })
        });

        const data = await res.json();

        if (res.status === 409) {
            alert('This email is already registered.');
            return;
        }
        if (!res.ok) {
            alert(data.message || 'Sign-up failed.');
            return;
        }

        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('currentUserEmail', email);
        alert('Registration Successful!');
        window.location.href = 'members.html';
    } catch (err) {
        alert('Could not connect to server. Is it running?');
    }
}

//  LOGIN  →  POST /api/login

async function login(event) {
    event.preventDefault();

    const email    = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    try {
        const res  = await fetch(`${API}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (!res.ok) {
            alert(data.message || 'Invalid email or password.');
            return;
        }

        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('currentUserEmail', data.user.email);
        window.location.href = 'members.html';
    } catch (err) {
        alert('Could not connect to server. Is it running?');
    }
}

//  MEMBERS PAGE  →  GET /api/members

async function displayMembers() {
    const table = document.getElementById('memberTable');
    if (!table) return;

    try {
        const res     = await fetch(`${API}/members`);
        const members = await res.json();

        if (members.length === 0) {
            table.innerHTML = '<tr><td colspan="4">No members</td></tr>';
            return;
        }

        table.innerHTML = members.map(m => `
            <tr>
                <td>${m.name}</td>
                <td>${m.phone || 'N/A'}</td>
                <td>${m.email}</td>
                <td>${m.affiliation}</td>
            </tr>
        `).join('');
    } catch (err) {
        table.innerHTML = '<tr><td colspan="4">Error loading members.</td></tr>';
    }
}

//  PRODUCTS  →  GET / POST / PUT / DELETE /api/products

async function loadProducts() {
    await displayProducts();
}

async function displayProducts() {
    const tbody = document.querySelector('#productTable tbody');
    if (!tbody) return;

    try {
        const res      = await fetch(`${API}/products`);
        const products = await res.json();

        if (products.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7">No products yet</td></tr>';
            return;
        }

        tbody.innerHTML = products.map(p => `
            <tr>
                <td>${p.item_id}</td>
                <td>${p.name}</td>
                <td>${p.description}</td>
                <td>${p.email}</td>
                <td>$${parseFloat(p.price).toFixed(2)}</td>
                <td>${p.hours || ''}</td>
                <td>
                    <button class="btn btn-success btn-sm me-1" onclick="addToCart('${p.item_id}')">Add to Cart</button>
                    <button class="btn btn-warning btn-sm me-1" onclick="editProduct('${p.item_id}')">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteProduct('${p.item_id}')">Delete</button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="7">Error loading products.</td></tr>';
    }
}

async function addOrUpdateProduct(event) {
    event.preventDefault();

    const itemId      = document.getElementById('itemId').value.trim();
    const format      = document.getElementById('format').value.trim();
    const description = document.getElementById('description').value.trim();
    const email       = document.getElementById('email').value.trim();
    const price       = document.getElementById('price').value.trim();
    const hours       = document.getElementById('hours').value.trim();

    if (!itemId || !format || !description || !email || !price || !hours) {
        alert('Fill all fields');
        return;
    }

    // Try PUT first; if 404 it doesn't exist so do POST
    try {
        let res = await fetch(`${API}/products/${itemId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ format, description, email, price, hours })
        });

        if (res.status === 404) {
            res = await fetch(`${API}/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemId, format, description, email, price, hours })
            });
        }

        if (!res.ok) {
            const data = await res.json();
            alert(data.message || 'Failed to save product.');
            return;
        }

        await displayProducts();
        document.getElementById('productForm').reset();
    } catch (err) {
        alert('Could not connect to server.');
    }
}

async function deleteProduct(itemId) {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
        await fetch(`${API}/products/${itemId}`, { method: 'DELETE' });
        await displayProducts();
    } catch (err) {
        alert('Could not connect to server.');
    }
}

async function editProduct(itemId) {
    try {
        const res     = await fetch(`${API}/products/${itemId}`);
        const product = await res.json();

        document.getElementById('itemId').value      = product.item_id;
        document.getElementById('format').value      = product.name;
        document.getElementById('description').value = product.description;
        document.getElementById('hours').value       = product.hours;
        document.getElementById('price').value       = product.price;
        document.getElementById('email').value       = product.email;
    } catch (err) {
        alert('Could not load product.');
    }
}

// Add to cart still uses localStorage for the cart (session-only, no DB needed)
async function addToCart(itemId) {
    const res     = await fetch(`${API}/products/${itemId}`);
    const product = await res.json();

    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push(product);
    localStorage.setItem('cart', JSON.stringify(cart));
    alert('Added to cart!');
}

//  CART PAGE 

function loadCart() { displayCart(); }

function displayCart() {
    const table = document.getElementById('cartTable');
    if (!table) return;

    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    if (cart.length === 0) {
        table.innerHTML = '<tr><td colspan="4">Cart empty</td></tr>';
        document.getElementById('totalPrice').innerText = 'Total: $0.00';
        return;
    }

    let total = 0;
    table.innerHTML = cart.map((item, i) => {
        total += parseFloat(item.price);
        return `
            <tr>
                <td>${item.name || item.format}</td>
                <td>${item.email}</td>
                <td>$${parseFloat(item.price).toFixed(2)}</td>
                <td><button class="btn btn-danger btn-sm" onclick="removeFromCart(${i})">Remove</button></td>
            </tr>
        `;
    }).join('');

    document.getElementById('totalPrice').innerText = `Total: $${total.toFixed(2)}`;
}

function removeFromCart(index) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCart();
}

function purchaseCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) { alert('No tutors selected.'); return; }
    window.location.href = 'billing.html';
}

//  BILLING  →  POST /api/billing

async function submitBilling(event) {
    event.preventDefault();

    const studentName  = document.getElementById('studentName').value.trim();
    const studentEmail = document.getElementById('studentEmail').value.trim();
    const cardNumber   = document.getElementById('cardNumber').value.trim();
    const cart         = JSON.parse(localStorage.getItem('cart')) || [];

    try {
        const res = await fetch(`${API}/billing`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                studentName,
                studentEmail,
                paymentMethod: { cardNumber },
                cartItems: cart
            })
        });

        if (!res.ok) {
            const data = await res.json();
            alert(data.message || 'Billing failed.');
            return;
        }

        localStorage.setItem('recentOrder', JSON.stringify(cart));
        localStorage.removeItem('cart');
        window.location.href = 'confirmation.html';
    } catch (err) {
        alert('Could not connect to server.');
    }
}

//  RETURNS: POST /api/returns  |  PUT /api/returns/:id

async function submitReturn(event) {
    event.preventDefault();

    const productName = document.getElementById('productName').value.trim();
    const reason      = document.getElementById('reason').value.trim();
    const condition   = document.getElementById('condition').value.trim();

    try {
        const res = await fetch(`${API}/returns`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productName, reason, condition })
        });

        const data = await res.json();
        if (!res.ok) { alert(data.message || 'Return failed.'); return; }

        alert('Return submitted successfully!');
        window.location.href = 'index.html';
    } catch (err) {
        alert('Could not connect to server.');
    }
}

//  CONFIRMATION PAGE  (reads from localStorage recentOrder)

function loadConfirmation() {
    const order = JSON.parse(localStorage.getItem('recentOrder')) || [];
    const table = document.getElementById('confirmTable');
    if (!table) return;

    let total = 0;
    table.innerHTML = order.map(item => {
        total += parseFloat(item.price);
        return `
            <tr>
                <td>${item.name || item.format}</td>
                <td>${item.email}</td>
                <td>$${parseFloat(item.price).toFixed(2)}</td>
                <td>${item.hours || 'N/A'}</td>
            </tr>
        `;
    }).join('');

    document.getElementById('confirmTotal').innerText = `Total: $${total.toFixed(2)}`;
}

function finishOrder() {
    localStorage.removeItem('recentOrder');
    alert('Order complete!');
    window.location.href = 'index.html';
}

//  SEARCH (jQuery)

$(document).on('keyup', '#searchInput', function () {
    const value = $(this).val().toLowerCase();
    $('#productTable tbody tr').each(function () {
        $(this).toggle($(this).text().toLowerCase().includes(value));
    });
});
