const products = document.getElementById('products');
const item = document.getElementById('item');
const cartSection = document.getElementById('cart');
const cartDetails = document.getElementById('cart-details');

// endpoint to fetch data
// development
const endpoint = 'http://localhost:3000/.netlify/functions/api';
// production
// const endpoint =
// 	'https://netlify-express-pere-test.netlify.app/.netlify/functions/api';

// state
let cart = [];
let counterCartItem = 0;

// empty cart
function emptyCart() {
	cart.length = 0;
}

// fetch items from backend
function addStock(data) {
	products.innerHTML += data
		.map(
			(item) => `<div class="item">
	<h3>${item.name} - ${item.price} ${item.currency}</h3><button data-id="${item.id}" data-item="${item.name}" data-price="${item.price}" data-currency="${item.currency}">Add to cart</button>
	</div>`
		)
		.join('');
}

// add items to cart
function addToCart(id, item, price, currency) {
	cart.push({
		id,
		item,
		price,
		currency,
	});
	counterCartItem++;
	displayCartToScreen(cart);
}

// remove item from cart
function removeFromCart(id) {
	const newCart = cart.filter((item) => {
		return item.id !== parseInt(id, 10);
	});
	cart = newCart;
	displayCartToScreen(newCart);
}

// display items to the cart
function displayCartToScreen(cartArray) {
	const basket = cartSection.querySelector('#cart-details');
	const total = cartSection.querySelector('#cart-total');
	const totalAmount = cartArray.reduce((a, b) => {
		return a + parseInt(b.price, 10);
	}, 0);
	basket.innerHTML = cartArray
		.map(
			(item) =>
				`<div class="item"><h3>${item.item} - ${item.price} ${item.currency}</h3><button data-productId="${item.id}">Remove</button></div>`
		)
		.join('');
	total.innerHTML = `Total: ${totalAmount} EUR`;
}

// event listeners
window.addEventListener('DOMContentLoaded', () => {
	fetch(endpoint)
		.then((res) => {
			return res.json();
		})
		.then((data) => {
			addStock(data.data);
		})
		.catch((err) => {
			console.log(err);
		});
});

// event listener to add to cart
products.addEventListener('click', (e) => {
	const clickedEl = e.target;
	if (clickedEl.tagName === 'BUTTON') {
		const item = clickedEl.getAttribute('data-item');
		const price = clickedEl.getAttribute('data-price');
		const currency = clickedEl.getAttribute('data-currency');
		addToCart(counterCartItem, item, price, currency);
	}
});

// event listener to remove item
cartDetails.addEventListener('click', (e) => {
	const clickedEl = e.target;
	if (clickedEl.tagName === 'BUTTON') {
		const id = clickedEl.getAttribute('data-productId');
		removeFromCart(id);
	}
});
