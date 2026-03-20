/* AUTH */

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


/* SIGN UP */

function signUp(event) {
    event.preventDefault();

    var name = document.getElementById('name').value.trim();
    var email = document.getElementById('email').value.trim();
    var phone = document.getElementById('phone').value.trim();
    var year = document.getElementById('year').value.trim();
    var address = document.getElementById('address').value.trim();
    var password = document.getElementById('password').value;
    var confirmPassword = document.getElementById('confirmPassword').value;

    if (!name || !email || !year || !address || !password) {
        alert('Please fill in all required fields.');
        return;
    }

    if (password !== confirmPassword) {
        alert('Passwords do not match.');
        return;
    }

    var members = JSON.parse(localStorage.getItem('members')) || [];

    if (members.find(function(m) { return m.email === email; })) {
        alert('This email is already registered.');
        return;
    }

    var newMember = { name, email, phone, year, address, password };
    members.push(newMember);
    localStorage.setItem('members', JSON.stringify(members));

    sessionStorage.setItem('isLoggedIn', 'true');
    sessionStorage.setItem('currentUserEmail', email);

    alert('Registration Successful!');
    window.location.href = 'members.html';
}


/* LOGIN */

function login(event) {
    event.preventDefault();

    var email = document.getElementById('loginEmail').value.trim();
    var pass = document.getElementById('loginPassword').value;

    var members = JSON.parse(localStorage.getItem('members')) || [];
    var user = members.find(function(m) { return m.email === email && m.password === pass; });

    if (user) {
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('currentUserEmail', email);
        window.location.href = 'members.html';
    } else {
        alert('Invalid email or password.');
    }
}


/* MEMBERS */

function displayMembers() {
    var table = document.getElementById('memberTable');
    if (!table) return;

    var members = JSON.parse(localStorage.getItem('members')) || [];

    if (members.length === 0) {
        table.innerHTML = '<tr><td colspan="4">No members</td></tr>';
        return;
    }

    table.innerHTML = '';

    for (var i = 0; i < members.length; i++) {
        var m = members[i];
        table.innerHTML +=
            '<tr>' +
            '<td>' + m.name + '</td>' +
            '<td>' + (m.phone || 'N/A') + '</td>' +
            '<td>' + m.email + '</td>' +
            '<td>' + m.address + '</td>' +
            '</tr>';
    }
}


/* PRODUCTS */

var products = [];

function loadProducts() {
    products = JSON.parse(localStorage.getItem('products')) || [];
    displayProducts();
}

function displayProducts() {
    var tbody = document.querySelector('#productTable tbody');
    if (!tbody) return;

    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7">No products yet</td></tr>';
        return;
    }

    tbody.innerHTML = '';

    for (var i = 0; i < products.length; i++) {
        var p = products[i];

        tbody.innerHTML +=
            '<tr>' +
            '<td>' + p.itemId + '</td>' +
            '<td>' + p.format + '</td>' +
            '<td>' + p.description + '</td>' +
            '<td>' + p.category + '</td>' +
            '<td>$' + parseFloat(p.price).toFixed(2) + '</td>' +
            '<td>' + (p.additional || '') + '</td>' +
            '<td>' +
            '<button class="btn btn-success btn-sm me-1" onclick="addToCart(\'' + p.itemId + '\')">Add to Cart</button>' +
            '<button class="btn btn-warning btn-sm me-1" onclick="editProduct(\'' + p.itemId + '\')">Edit</button>' +
            '<button class="btn btn-danger btn-sm" onclick="deleteProduct(\'' + p.itemId + '\')">Delete</button>' +
            '</td>' +
            '</tr>';
    }
}

function addOrUpdateProduct(event) {
    event.preventDefault();

    var itemId = document.getElementById('itemId').value.trim();
    var format = document.getElementById('format').value.trim();
    var description = document.getElementById('description').value.trim();
    var category = document.getElementById('category').value.trim();
    var price = document.getElementById('price').value.trim();
    var additional = document.getElementById('additional').value.trim();

    if (!itemId || !format || !description || !category || !price) {
        alert('Fill all fields');
        return;
    }

    var found = false;

    for (var i = 0; i < products.length; i++) {
        if (products[i].itemId === itemId) {
            products[i] = { itemId, format, description, category, price, additional };
            found = true;
            break;
        }
    }

    if (!found) {
        products.push({ itemId, format, description, category, price, additional });
    }

    localStorage.setItem('products', JSON.stringify(products));
    displayProducts();
    document.getElementById('productForm').reset();
}


/* 🔥 ADD TO CART (FIXED) */

function addToCart(itemId) {
    var cart = JSON.parse(localStorage.getItem('cart')) || [];
    var storedProducts = JSON.parse(localStorage.getItem('products')) || [];

    var product = null;

    for (var i = 0; i < storedProducts.length; i++) {
        if (storedProducts[i].itemId === itemId) {
            product = storedProducts[i];
            break;
        }
    }

    if (!product) {
        alert("Product not found!");
        return;
    }

    cart.push(product);
    localStorage.setItem('cart', JSON.stringify(cart));

    alert("Added to cart!");
}


/* CART PAGE */

function loadCart() {
    displayCart();
}

function displayCart() {
    var table = document.getElementById('cartTable');
    if (!table) return;

    var cart = JSON.parse(localStorage.getItem('cart')) || [];

    if (cart.length === 0) {
        table.innerHTML = '<tr><td colspan="4">Cart empty</td></tr>';
        return;
    }

    table.innerHTML = '';
    var total = 0;

    for (var i = 0; i < cart.length; i++) {
        var item = cart[i];
        total += parseFloat(item.price);

        table.innerHTML +=
            '<tr>' +
            '<td>' + item.format + '</td>' +
            '<td>' + item.category + '</td>' +
            '<td>$' + item.price + '</td>' +
            '<td><button class="btn btn-danger btn-sm" onclick="removeFromCart(' + i + ')">Remove</button></td>' +
            '</tr>';
    }

    document.getElementById('totalPrice').innerText = 'Total: $' + total.toFixed(2);
}

function removeFromCart(index) {
    var cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCart();
}

function purchaseCart() {
    var cart = JSON.parse(localStorage.getItem('cart')) || [];

    if (cart.length === 0) {
        alert('Cart is empty');
        return;
    }

    alert('Purchase successful!');
    localStorage.removeItem('cart');
    displayCart();
}


/* SEARCH (jQuery) */

$(document).on('keyup', '#searchInput', function() {
    var value = $(this).val().toLowerCase();

    $('#productTable tbody tr').each(function() {
        var text = $(this).text().toLowerCase();
        $(this).toggle(text.indexOf(value) > -1);
    });
});