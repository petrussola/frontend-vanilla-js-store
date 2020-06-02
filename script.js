const products = document.getElementById('products');
const item = document.getElementById('item');
const cartSection = document.getElementById('cart');
const cartDetails = document.getElementById('cart-details');
const paymentSection = document.getElementById('payment');
const form = document.getElementById('payment-form');
const paymentButton = document.getElementById('submit');
const paymentOutcome = document.getElementById('payment-outcome');
const billingForm = document.getElementById('billing-details');

// endpoint to fetch data
// development
const endpoint = 'http://localhost:3000/.netlify/functions/api';
// production
// const endpoint =
// 	'https://netlify-express-pere-test.netlify.app/.netlify/functions/api';

// state
let cart = [];
let counterCartItem = 0;
let totalAmount = 0;
let billingDetails = {
	name: '',
	address: '',
	city: '',
	postalcode: '',
	country: '',
};

//stripe
var stripe = Stripe('pk_test_h8MeWS53S1PWBKuif0ev6BjO00VnXGmdmn');
var elements = stripe.elements();
var card;

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
	if (cart.length === 0) {
		paymentSection.classList.add('hidden');
	}
	displayCartToScreen(newCart);
}

// display items to the cart
function displayCartToScreen(cartArray) {
	const basket = cartSection.querySelector('#cart-details');
	const total = cartSection.querySelector('#cart-total');
	totalAmount = cartArray.reduce((a, b) => {
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
window.addEventListener('load', () => {
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
	// Set up Stripe.js and Elements to use in checkout form
	var style = {
		base: {
			color: '#32325d',
			fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
			fontSmoothing: 'antialiased',
			fontSize: '16px',
			'::placeholder': {
				color: '#aab7c4',
			},
		},
		invalid: {
			color: '#fa755a',
			iconColor: '#fa755a',
		},
	};

	card = elements.create('card', { style: style });
	card.mount('#card-element');

	// payment form change
	card.on('change', ({ error, complete }) => {
		const displayError = document.getElementById('card-errors');
		if (error) {
			displayError.textContent = error.message;
		} else if (complete) {
			paymentButton.disabled = false;
		} else {
			displayError.textContent = '';
		}
	});
});

// add items to cart
products.addEventListener('click', (e) => {
	const clickedEl = e.target;
	if (clickedEl.tagName === 'BUTTON') {
		// payment form is hidden by default
		// when adding a item to the cart, if class is hidden
		// we remove it
		if (paymentSection.classList.contains('hidden')) {
			paymentSection.classList.remove('hidden');
		}
		const item = clickedEl.getAttribute('data-item');
		const price = clickedEl.getAttribute('data-price');
		const currency = clickedEl.getAttribute('data-currency');
		addToCart(counterCartItem, item, price, currency);
	}
});

// remove item from cart
cartDetails.addEventListener('click', (e) => {
	const clickedEl = e.target;
	if (clickedEl.tagName === 'BUTTON') {
		const id = clickedEl.getAttribute('data-productId');
		removeFromCart(id);
	}
});

// submit payment form
form.addEventListener('submit', async function (ev) {
	ev.preventDefault();
	let bodyPayment = {
		amount: totalAmount,
		shipping: {
			address: {
				line1: billingDetails.address,
				city: billingDetails.city,
				country: billingDetails.country,
				postal_code: billingDetails.postalcode,
			},
			name: billingDetails.name,
		},
	};
	try {
		const res = await fetch(`${endpoint}/secret`, {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(bodyPayment),
		});
		const secret = await res.json();
		stripe
			.confirmCardPayment(secret.client_secret, {
				payment_method: {
					card: card,
					billing_details: {
						name: billingDetails.name,
						address: {
							city: billingDetails.city,
							country: billingDetails.country,
							line1: billingDetails.address,
							'postal_code': billingDetails.postalcode,
						},
					},
				},
			})
			.then(function (result) {
				if (result.error) {
					// Show error to your customer (e.g., insufficient funds)
					paymentOutcome.textContent = result.error.message;
					paymentOutcome.classList.add('error');
				} else {
					// The payment has been processed!
					if (result.paymentIntent.status === 'succeeded') {
						// Show a success message to your customer
						// There's a risk of the customer closing the window before callback
						// execution. Set up a webhook or plugin to listen for the
						// payment_intent.succeeded event that handles any business critical
						// post-payment actions.
						paymentOutcome.textContent = 'Payment succeded';
						paymentOutcome.classList.add('success');
					}
				}
			});
	} catch (error) {
		console.log(error);
	}
});

// on change input fields billing details
const formControl = document.querySelectorAll('.form-control');
formControl.forEach((item) => {
	const inputField = item.querySelectorAll('input');
	inputField.forEach((element) => {
		element.addEventListener('keyup', (e) => {
			billingDetails[e.target.id] = e.target.value;
		});
	});
});
