// Obtener cartId del elemento HTML (si el usuario está autenticado)
const userCartId = document.querySelector('#user-cart-id')?.value;

showButtonCart();

async function addToCart(pid) {
    // Priorizar el carrito del usuario autenticado
    let cartId = userCartId || localStorage.getItem('cartId');

    if (!cartId) {
        const createCartResponse = await fetch('/api/carts', {
            method: 'POST'
        });

        const createCart = await createCartResponse.json();

        if (createCart.status === 'error') {
            return alert(createCart.message);
        }

        console.log(createCart);

        cartId = createCart.payload._id;
        // Solo guardar en localStorage si no es usuario autenticado
        if (!userCartId) {
            localStorage.setItem('cartId', cartId);
        }
    }

    const addProductResponse = await fetch(`/api/carts/${cartId}/product/${pid}`, {
        method: 'POST'
    });

    const addProduct = await addProductResponse.json();

    if (addProduct.status === 'error') {
        return alert(addProduct.message);
    }

    showButtonCart();

    alert('Producto añadido satisfactoriamente!');
}

function showButtonCart() {
    // Priorizar el carrito del usuario autenticado
    const cartId = userCartId || localStorage.getItem('cartId');

    if (cartId) {
        document.querySelector('#button-cart').setAttribute("href", `/cart/${cartId}`);
        document.querySelector('.view-cart').style.display = "block";
    }  
}