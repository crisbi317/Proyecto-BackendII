// Obtener cartId del elemento HTML
const userCartId = document.querySelector('#user-cart-id')?.value;

showButtonCart();

async function addToCart(pid) {
 
    if (!userCartId) {
   
        if (confirm('Debes iniciar sesión para agregar productos al carrito. ¿Deseas ir al login?')) {
            window.location.href = '/login';
        }
        return;
    }

    let cartId = userCartId;

    const addProductResponse = await fetch(`/api/carts/${cartId}/product/${pid}`, {
        method: 'POST'
    });

    const addProduct = await addProductResponse.json();

    if (addProduct.status === 'error') {
        // Mostrar mensaje de error más claro para problemas de stock
        if (addProduct.message.includes('stock')) {
            alert('⚠️ ' + addProduct.message);
        } else {
            alert('Error: ' + addProduct.message);
        }
        return;
    }

    showButtonCart();

    alert('✓ Producto añadido satisfactoriamente!');
}

function showButtonCart() {
    
    if (userCartId) {
        document.querySelector('#button-cart').setAttribute("href", `/cart/${userCartId}`);
        document.querySelector('.view-cart').style.display = "block";
    } else {
        
        document.querySelector('.view-cart').style.display = "none";
    }
}