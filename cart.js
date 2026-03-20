
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