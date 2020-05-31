const products = document.getElementById('products');
const item = document.getElementById('item');
const cartSection = document.getElementById('cart');

// endpoint to fetch data
// development
// const endpoint = 'http://localhost:3000/.netlify/functions/api';
// production
const endpoint =
	'https://netlify-express-pere-test.netlify.app/.netlify/functions/api';

// state
const cart = [];

// fetch items from backend
function addStock(data) {
	products.innerHTML += data
		.map(
			(item) => `<div class="item">
	<h3>${item.name} - ${item.price} ${item.currency}</h3><button data-item="${item.name}" data-price="${item.price}" data-currency="${item.currency}">Add to cart</button>
	</div>`
		)
		.join('');
}

// display items to the cart
function addToCart(cartArray) {
	const basket = cartSection.querySelector('#cart-details');
	const total = cartSection.querySelector('#cart-total');
	const totalAmount = cartArray.reduce((a, b) => {
		return a + parseInt(b.price, 10);
	}, 0);
	console.log(totalAmount);
	basket.innerHTML = cartArray
		.map(
			(item) =>
				`<div class="item"><h3>${item.item} - ${item.price} ${item.currency}</h3><button>Remove</button></div>`
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
			// console.log(data.data[0]);
			addStock(data.data);
		})
		.catch((err) => {
			console.log(err);
		});
});

products.addEventListener('click', (e) => {
	const clickedEl = e.target;
	if (clickedEl.tagName === 'BUTTON') {
		const item = clickedEl.getAttribute('data-item');
		const price = clickedEl.getAttribute('data-price');
		const currency = clickedEl.getAttribute('data-currency');
		cart.push({
			item,
			price,
			currency,
		});
		addToCart(cart);
	}
});
