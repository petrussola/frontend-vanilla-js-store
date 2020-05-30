const products = document.getElementById('products');
const item = document.getElementById('item');

// endpoint to fetch data
// development
const endpoint = 'http://localhost:3000/.netlify/functions/api';
// production
// const endpoint =
// 	'https://netlify-express-pere-test.netlify.app/.netlify/functions/api';

// state
const cart = [];

function addStock(data) {
	products.innerHTML += `
	${data.map(
		(item) => `<div class="item">
		<h2>${item.name} - ${item.price} ${item.currency}</h2><button data-item="${item.name}" data-price="${item.price}" data-currency="${item.currency}">Add to cart</button>
		</div>`
	)}
		`;
}

// add to cart
function addToCart(e) {
	console.log(e);
}

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
		console.log(cart);
	}
});
