/* AUTH */

/* Redirect to login page if user is not logged in */
function requireAuth() {
    if (sessionStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'login.html';
    }
}

/* Log out the user and go to home */
function logout() {
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('currentUserEmail');
    window.location.href = 'index.html';
}


/* SIGN UP */

function signUp(event) {
    event.preventDefault();

    var name            = document.getElementById('name').value.trim();
    var email           = document.getElementById('email').value.trim();
    var phone           = document.getElementById('phone').value.trim();
    var year            = document.getElementById('year').value.trim();
    var address         = document.getElementById('address').value.trim();
    var password        = document.getElementById('password').value;
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

    var newMember = { name: name, email: email, phone: phone, year: year, address: address, password: password };
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
    var pass  = document.getElementById('loginPassword').value;

    var members = JSON.parse(localStorage.getItem('members')) || [];
    var user = members.find(function(m) { return m.email === email && m.password === pass; });

    if (user) {
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('currentUserEmail', email);
        window.location.href = 'members.html';
    } else {
        alert('Invalid email or password. Please try again.');
    }
}


/* MEMBERS PAGE */

function displayMembers() {
    var memberTable = document.getElementById('memberTable');
    if (!memberTable) return;

    var members = JSON.parse(localStorage.getItem('members')) || [];

    if (members.length === 0) {
        memberTable.innerHTML = '<tr><td colspan="4" class="text-center">No members registered yet.</td></tr>';
        return;
    }

    memberTable.innerHTML = '';

    for (var i = 0; i < members.length; i++) {
        var member = members[i];
        var row = '<tr>' +
            '<td>' + member.name + '</td>' +
            '<td>' + (member.phone || 'N/A') + '</td>' +
            '<td>' + member.email + '</td>' +
            '<td>' + member.address + '</td>' +
            '</tr>';
        memberTable.innerHTML += row;
    }
}


/* PRODUCTS PAGE */

var products = [];

function loadProducts() {
    var stored = localStorage.getItem('products');
    if (stored) {
        products = JSON.parse(stored);
    } else {
        products = [];
    }
    displayProducts();
}

function displayProducts() {
    var tbody = document.querySelector('#productTable tbody');
    if (!tbody) return;

    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">No products yet. Add one above.</td></tr>';
        return;
    }

    tbody.innerHTML = '';

    for (var i = 0; i < products.length; i++) {
        var p = products[i];
        var row = document.createElement('tr');
        row.innerHTML =
            '<td>' + p.itemId + '</td>' +
            '<td>' + p.format + '</td>' +
            '<td>' + p.description + '</td>' +
            '<td>' + p.category + '</td>' +
            '<td>$' + parseFloat(p.price).toFixed(2) + '</td>' +
            '<td>' + (p.additional || '') + '</td>' +
            '<td>' +
                '<button class="btn btn-sm btn-warning me-1" onclick="editProduct(\'' + p.itemId + '\')">Edit</button>' +
                '<button class="btn btn-sm btn-danger" onclick="deleteProduct(\'' + p.itemId + '\')">Delete</button>' +
            '</td>';
        tbody.appendChild(row);
    }
}

function addOrUpdateProduct(event) {
    event.preventDefault();

    var itemId      = document.getElementById('itemId').value.trim();
    var format      = document.getElementById('format').value.trim();
    var description = document.getElementById('description').value.trim();
    var category    = document.getElementById('category').value.trim();
    var price       = document.getElementById('price').value.trim();
    var additional  = document.getElementById('additional').value.trim();

    if (!itemId || !format || !description || !category || !price) {
        alert('Please fill in all required fields.');
        return;
    }

    var existing = null;
    for (var i = 0; i < products.length; i++) {
        if (products[i].itemId === itemId) {
            existing = products[i];
            break;
        }
    }

    if (existing) {
        existing.format      = format;
        existing.description = description;
        existing.category    = category;
        existing.price       = price;
        existing.additional  = additional;
        alert('Product updated!');
    } else {
        products.push({ itemId: itemId, format: format, description: description, category: category, price: price, additional: additional });
        alert('Product added!');
    }

    localStorage.setItem('products', JSON.stringify(products));
    displayProducts();
    document.getElementById('productForm').reset();
}

function editProduct(itemId) {
    var product = null;
    for (var i = 0; i < products.length; i++) {
        if (products[i].itemId === itemId) {
            product = products[i];
            break;
        }
    }
    if (!product) return;

    document.getElementById('itemId').value      = product.itemId;
    document.getElementById('format').value      = product.format;
    document.getElementById('description').value = product.description;
    document.getElementById('category').value    = product.category;
    document.getElementById('price').value       = product.price;
    document.getElementById('additional').value  = product.additional || '';
}

function deleteProduct(itemId) {
    if (!confirm('Are you sure you want to delete this product?')) return;

    var newList = [];
    for (var i = 0; i < products.length; i++) {
        if (products[i].itemId !== itemId) {
            newList.push(products[i]);
        }
    }
    products = newList;

    localStorage.setItem('products', JSON.stringify(products));
    displayProducts();
}

/* Search filter using jQuery */
$(document).on('keyup', '#searchInput', function() {
    var value = $(this).val().toLowerCase();
    $('#productTable tbody tr').each(function() {
        var rowText = $(this).text().toLowerCase();
        if (rowText.indexOf(value) > -1) {
            $(this).show();
        } else {
            $(this).hide();
        }
    });
});
var productCatalog = [
    {
        productId: "IST101",
        description: "Intro to IST Tutoring Session",
        category: "Tutoring",
        unitOfMeasure: "hour",
        price: 25.00,
        weight: "",
        color: ""
    },
    {
        productId: "ISTNotebook",
        description: "IST Branded Notebook",
        category: "Supplies",
        unitOfMeasure: "each",
        price: 8.50,
        weight: "0.5 lb",
        color: "Blue"
    }
];

var cart = [];
function renderCatalog(filterText = "") {
    var tbody = $("#catalogTable tbody");
    tbody.empty();

    var search = filterText.toLowerCase();

    productCatalog.forEach(p => {
        var rowText = (p.productId + p.description + p.category + p.unitOfMeasure + p.color).toLowerCase();
        if (search && !rowText.includes(search)) return;

        tbody.append(`
            <tr>
                <td>${p.productId}</td>
                <td>${p.description}</td>
                <td>${p.category}</td>
                <td>${p.unitOfMeasure}</td>
                <td>$${p.price.toFixed(2)}</td>
                <td>${p.weight || ""}</td>
                <td>${p.color || ""}</td>
                <td><button class="btn btn-sm btn-psu" onclick="addToCart('${p.productId}')">Add</button></td>
            </tr>
        `);
    });

    $("#jsonOutput").text(JSON.stringify(productCatalog, null, 2));
}
function addToCart(id) {
    var product = productCatalog.find(p => p.productId === id);
    if (!product) return;

    var existing = cart.find(c => c.productId === id);
    if (existing) {
        existing.qty++;
    } else {
        cart.push({
            productId: product.productId,
            description: product.description,
            unitOfMeasure: product.unitOfMeasure,
            price: product.price,
            qty: 1
        });
    }
    renderCart();
}

function removeFromCart(id) {
    cart = cart.filter(c => c.productId !== id);
    renderCart();
}

function renderCart() {
    var tbody = $("#cartTable tbody");
    tbody.empty();

    if (cart.length === 0) {
        tbody.append(`<tr><td colspan="7" class="text-center">Cart is empty.</td></tr>`);
        $("#cartTotal").text("0.00");
        return;
    }

    var total = 0;
 cart.forEach(item => {
        var line = item.qty * item.price;
        total += line;

        tbody.append(`
            <tr>
                <td>${item.productId}</td>
                <td>${item.description}</td>
                <td>${item.unitOfMeasure}</td>
                <td>$${item.price.toFixed(2)}</td>
                <td>${item.qty}</td>
                <td>$${line.toFixed(2)}</td>
                <td><button class="btn btn-sm btn-danger" onclick="removeFromCart('${item.productId}')">X</button></td>
            </tr>
        `);
    });

    $("#cartTotal").text(total.toFixed(2));
}
$("#catalogForm").on("submit", function (e) {
    e.preventDefault();

    var id = $("#prodId").val().trim();
    var desc = $("#prodDesc").val().trim();
    var cat = $("#prodCat").val().trim();
    var uom = $("#prodUom").val().trim();
    var price = parseFloat($("#prodPrice").val());
    var weight = $("#prodWeight").val().trim();
    var color = $("#prodColor").val().trim();

    if (!id || !desc || !cat || !uom || isNaN(price) || price <= 0) {
        $("#formStatus").addClass("text-danger").text("Please fill all required fields correctly.");
        alert("Error: Invalid form input.");
        return;
    }

    var existing = productCatalog.find(p => p.productId === id);

    if (existing) {
        existing.description = desc;
        existing.category = cat;
        existing.unitOfMeasure = uom;
        existing.price = price;
        existing.weight = weight;
        existing.color = color;
        $("#formStatus").addClass("text-success").text("Product updated.");
    } else {
        productCatalog.push({
            productId: id,
            description: desc,
            category: cat,
            unitOfMeasure: uom,
            price: price,
            weight: weight,
            color: color
        });
        $("#formStatus").addClass("text-success").text("Product added.");
    }

    alert("Success: Product saved.");
    $("#catalogForm")[0].reset();
    renderCatalog($("#catalogSearch").val());
});
$("#catalogSearch").on("keyup", function () {
    renderCatalog($(this).val());
});
$("#sendCartBtn").on("click", function () {
    if (cart.length === 0) {
        $("#ajaxStatus").addClass("text-danger").text("Cart is empty.");
        return;
    }

    $.ajax({
        url: "https://example.com/api/cart",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify(cart),
        success: function () {
            $("#ajaxStatus").addClass("text-success").text("Cart sent successfully (simulated).");
        },
        error: function () {
            $("#ajaxStatus").addClass("text-success").text("AJAX request sent (API not implemented).");
        }
    });
});
$(document).ready(function () {
    renderCatalog("");
    renderCart();
});