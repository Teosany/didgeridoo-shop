// === constants ===
const MAX_QTY = 9;
const productIdKey = "product";
const orderIdKey = "order";
const inputIdKey = "qte";

// === global variables  ===
// the total cost of selected products 
let total = 0;
let deleteButton;

// function called when page is loaded, it performs initializations 
let init = function () {
	createShop();
	// add init function 
	search();
	createSaveButton();
	initialState();
}
window.addEventListener("load", init);

// usefull functions
/*
* create and add all the div.produit elements to the div#boutique element
* according to the product objects that exist in 'catalog' variable
*/
let createShop = function () {
	let shop = document.getElementById("boutique");
	for (i = 0; i < catalog.length; i++) {
		shop.appendChild(createProduct(catalog[i], i));
	}
}

/*
* create the div.produit elment corresponding to the given product
* The created element receives the id "index-product" where index is replaced by param's value
* @param product (product object) = the product for which the element is created
* @param index (int) = the index of the product in catalog, used to set the id of the created element
*/
let createProduct = function (product, index) {
	// build the div element for product
	let block = document.createElement("div");
	block.className = "produit";
	// set the id for this product
	block.id = index + "-" + productIdKey;
	block.dataset.item = product.name.toLowerCase();
	// build the h4 part of 'block'
	block.appendChild(createBlock("h4", product.name));

	// /!\ should add the figure of the product... does not work yet... /!\ 
	block.appendChild(createFigureBlock(product.image));

	// build and add the div.description part of 'block' 
	block.appendChild(createBlock("div", product.description, "description"));
	// build and add the div.price part of 'block'
	block.appendChild(createBlock("div", product.price, "prix"));
	// build and add control div block to product element
	block.appendChild(createOrderControlBlock(index));
	return block;
}


/* return a new element of tag 'tag' with content 'content' and class 'cssClass'
 * @param tag (string) = the type of the created element (example : "p")
 * @param content (string) = the html wontent of the created element (example : "bla bla")
 * @param cssClass (string) (optional) = the value of the 'class' attribute for the created element
 */
let createBlock = function (tag, content, cssClass) {
	let element = document.createElement(tag);
	if (cssClass != undefined) {
		element.className = cssClass;
	}
	element.innerHTML = content;
	return element;
}

/*
* builds the control element (div.controle) for a product
* @param index = the index of the considered product
*
* TODO : add the event handling, 
*   /!\  in this version button and input do nothing  /!\  
*/
let createOrderControlBlock = function (index) {
	let control = document.createElement("div");
	control.className = "controle";

	// create input quantity element
	let input = document.createElement("input");
	input.id = index + '-' + inputIdKey;
	input.type = "number";
	input.value = "0";
	input.className = "input"

	// add max & min value for the number input 
	input.max = MAX_QTY;
	input.min = "0";

	// add input to control as its child
	control.appendChild(input);

	// create order button
	var button = document.createElement("button");
	button.className = 'commander';
	button.id = index + "-" + orderIdKey;
	button.disabled = true;
	// add control to control as its child
	control.appendChild(button);

	// add verification if the user enter manual value more than the max or negative numbers & set to min or max 
	input.addEventListener('change', function () {
		let value = parseInt(input.value);
		if (value > MAX_QTY) {
			input.value = MAX_QTY;
		}
		if (value < 0) {
			input.value = 0;
		}

	// add input limitation depending on the added quantity
	if (document.getElementById(index)) {
		input.value = valuee(value, index)
	}
		// add opacity and cursor change when more than 0
		if (input.value > 0 && input.value <= 9) {
			button.style.opacity = "1";
			button.style.cursor = "pointer";
			button.disabled = false;
		} else {
			button.style.opacity = "0.25";
			button.style.cursor = "not-allowed";
			button.disabled = true;
		}
	});

	button.addEventListener('click', function () {
		addToCart(index, catalog);
	});

	// the built control div node is returned
	return control;
}

const valuee = (value, index) => {
		let parent = document.getElementById(index)
		let qntt = parseInt(parent.querySelector('.quantite').innerHTML)
		let input2 = 9 - qntt
		if (value > 9 - qntt) {
			return parseInt(input2)
		} else {
			return parseInt(value)
		}
}

// add function addToCart to create element in the cart 
function addToCart(index, catalog) {
	let quantityInput = document.getElementById(index + '-' + inputIdKey);
	let quantity = parseInt(quantityInput.value);

	let existingCartItem = document.getElementById(index);

	// shopping cart limit
	if (existingCartItem) {
		let existingQuantity = existingCartItem.querySelector(".quantite");
		let newQuantity = parseInt(existingQuantity.innerHTML) + quantity;


		if (newQuantity < 10) {
			existingQuantity.innerHTML = newQuantity;
		} else {
			return
		}
	} else {
		let cartItem = document.createElement("div");
		cartItem.className = "achat";
		cartItem.id = index;

		cartItem.appendChild(createFigureBlock(catalog[index].image));
		cartItem.appendChild(createBlock("h4", catalog[index].name));
		let quantite = cartItem.appendChild(createBlock("span", quantity, "quantite"));
		let reg = cartItem.appendChild(createBlock('span', '', 'reg'))
		let plus = reg.appendChild(createBlock('button', '+', 'plus'))
		let minus = reg.appendChild(createBlock('button', '-', 'minus'))
		cartItem.appendChild(createBlock("span", catalog[index].price + ' € ', "prix"));

		deleteButton = document.createElement("button");
		deleteButton.className = 'retirer';
		deleteButton.id = index + "-delete";
		cartItem.appendChild(deleteButton);

		let cartContainer = document.querySelector(".achats");
		cartContainer.appendChild(cartItem);

		// add function for changing the quantity in the shopping cart 
		lie(quantite, plus, minus, index)
	}

	deleteBut(index)
	total += quantity * catalog[index].price;
	updateTotalCost();
}

// add function to remove item from cart 
function removeCartItem(index) {
	let cartItem = document.getElementById(index);

	if (cartItem) {
		let quantity = parseInt(cartItem.querySelector(".quantite").innerHTML);
		let price = parseFloat(cartItem.querySelector(".prix").innerHTML.replace(' € ', ''));

		total -= quantity * price;

		cartItem.remove();
		updateTotalCost();
	}
	// deleting the shopping cart when verification fails
	if (document.querySelector(".achat")) {

	} else if (document.getElementById('save')) {
		document.getElementById('save').remove();
	}
}

// add to update the total of the cart when new item
function updateTotalCost() {
	let totalCostElement = document.getElementById("montant");
	totalCostElement.innerHTML = total;
}

/*
* create and return the figure block for this product
* see the static version of the project to know what the <figure> should be
* @param product (product object) = the product for which the figure block is created
*
* TODO : write the correct code
*/

// function for adding a HTML figure with image
let createFigureBlock = function (img) {
	const figure = document.createElement("figure");
	figure.className = "figure-item";

	const imageElement = document.createElement("img");
	imageElement.src = img;
	imageElement.alt = "";

	figure.appendChild(imageElement);

	return figure;
}

// function for catalog product filtering
function search() {
	const boxes = document.querySelectorAll('.produit')
	const searchBox = document.getElementById('filter')

	if (searchBox !== null) {
		searchBox.addEventListener('keyup', (e) => {
			searchText = e.target.value.toLowerCase().trim();

			boxes.forEach((produit) => {
				const data = produit.dataset.item;
				if (data.includes(searchText)) {
					produit.style.display = 'inline-block';
				} else {
					produit.style.display = 'none';
				}
			});
		})
	}
}

// reset field and key after pressing
document.addEventListener("click", (e) => {
	if (e.target.className == "commander" && e.target.parentNode.firstChild.value >= 0) {
		const button = e.target
		button.parentNode.firstChild.value = 0;

		button.style.opacity = "0.25";
		button.style.cursor = "not-allowed";
		button.disabled = true;
	}
});

// add button for save
function createSaveButton() {
	let saveButton = document.createElement("button");
	saveButton.id = "saveCartButton";
	saveButton.textContent = "Sauvegarder le Panier";

	let shop = document.getElementById("panier");
	shop.appendChild(saveButton);

	// updateData()
	saveButton.addEventListener('click', updateData)
}

// add button for delete item
function deleteBut(index) {
	deleteButton = document.getElementById(index + "-delete");
	deleteButton.addEventListener('click', function () {
		removeCartItem(index);
	});
}

// add function to change the quantity in the shopping cart
function lie(quantite, plus, minus, index) {
	plus.addEventListener("click", function () {
		if (quantite.innerHTML < 9) {
			quantite.innerHTML++
			total = Number(total) + Number(catalog[index].price);
			updateTotalCost();
		}
	})
	minus.addEventListener("click", function () {
		if (quantite.innerHTML <= 9 && quantite.innerHTML > 1) {
			quantite.innerHTML--
			total = Number(total) - Number(catalog[index].price);
			updateTotalCost();
		}
	})
}

// add download cart save
const initialState = () => {
	if (localStorage.getItem('products') !== null) {
		document.querySelector('.achats').innerHTML = localStorage.getItem('products');
		countSumm()
		buttons()
	}
}

// add update cart save
const updateData = () => {
	let parent = document.querySelector('.achats');
	let html = parent.innerHTML;
	html = html.trim();

	if (html.length) {
		localStorage.setItem('products', html);
	} else {
		localStorage.removeItem('products');
	}
}

// add loaded cart count
const countSumm = () => {
	document.querySelectorAll('.achat').forEach(e1 => {
		let totalCostElement = document.getElementById("montant")
		total += parseInt(e1.querySelector('.prix').innerHTML) * parseInt(e1.querySelector('.quantite').innerHTML)
		totalCostElement.innerHTML = total;
	});
}

// add loaded cart buttons
const buttons = () => {
	document.querySelectorAll('.achat').forEach(e1 => {
		let plus = e1.querySelector('.plus')
		let minus = e1.querySelector('.minus')
		let quantite = e1.querySelector('.quantite')
		lie(quantite, plus, minus, e1.id)
		deleteBut(e1.id)
	});
}

