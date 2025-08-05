const header = document.getElementsByClassName('header'); 
console.log(header);
const cardcontainer = document.getElementsByClassName('card-container'); 
const checkoutButton = document.getElementById('cart'); 
const returnbutton = document.getElementById('returnbutton'); 
const checkoutWindow = document.getElementsByClassName('checkoutWindow'); 
const mainContent = document.getElementsByClassName('content'); 
const PayButton = document.getElementById('payButton'); 
const removeButtons = document.querySelectorAll('.remove--button'); 
const addPopUp = document.querySelector('.added'); 
const addButtons = document.querySelectorAll('.add-button'); 
const stripe = Stripe('pk_test_51Qe3ndFllnWu1kBSxH5mXMuuIfHDWaqTkeRzar9kjnNCBEyLI4x6qFIXpmmD4GLAPFQAVSHGgbrPMbiYbu9mSg1k00BJ3GrN4Q');

let cart = []; 

console.log('header--scrolled'); 

function updateCartUI() {

  const cartItemsContainer = document.querySelector('.checkoutWindow__item'); // Container to hold cart items
  const totalPriceElement = document.getElementById('js--totalprice'); // Element to display total price

  cartItemsContainer.innerHTML = '';

  let total = 0;

  cart.forEach(item => {
    total += item.price * item.quantity;

    const itemCard = document.createElement('section');
    itemCard.className = 'info-card';

    const itemName = document.createElement('h3'); 
    itemName.textContent = item.name;

    const itemQty = document.createElement('p'); 
    itemQty.textContent = `Quantity: ${item.quantity}`;

    const itemSubtotal = document.createElement('p');
    itemSubtotal.textContent = `Subtotal: €${((item.price * item.quantity) / 100).toFixed(2)}`;

    itemCard.appendChild(itemName);
    itemCard.appendChild(itemQty);
    itemCard.appendChild(itemSubtotal);

    cartItemsContainer.appendChild(itemCard);
  });

  
  totalPriceElement.textContent = `Total: €${(total / 100).toFixed(2)}`;
}

fetch('/api/products')
  .then(res => res.json()) 
  .then(cardData => {
    if (cardcontainer.length > 0) { 
      for (let i = 0; i < cardData.length; i++) {
        const { imgSrc, title, description, imgAlt, price } = cardData[i]; // alle info in de cardData

        const card = document.createElement('article'); // article element bouwen
        card.classList.add('card');

        
        const imageSection = document.createElement('section');
        imageSection.className = 'info-card';

        const image = document.createElement('img');
        image.src = imgSrc;
        image.alt = imgAlt;
        image.className = 'card-image';
        imageSection.appendChild(image);

        
        const textSection = document.createElement('section');
        textSection.className = 'info-card';

        const cardTitle = document.createElement('h3'); 
        cardTitle.textContent = title;

        const cardDesc = document.createElement('p'); 
        cardDesc.textContent = description;

        const cardPrice = document.createElement('p'); 
        cardPrice.className = 'card-price';
        cardPrice.textContent = 'Price: €' + (price / 100).toFixed(2);

        
        const addButton = document.createElement('button');
        addButton.innerText = 'Add to Cart';
        addButton.className = 'add-button';

        
        addButton.onclick = function () {
          console.log('Add button clicked');
          addPopUp.style.display = 'flex'; 

          const name = cardTitle.textContent.trim().toLowerCase(); 

          const product = cardData.find(p => p.title.toLowerCase() === name);
          if (!product) {
            console.error('Product not found in array:', name);
            return; 
          }

          const productPrice = product.price;

          
          const existingItem = cart.find(item => item.name === name);
          if (existingItem) {
            existingItem.quantity += 1; 
          } else {
            cart.push({ name, price: productPrice, quantity: 1 }); 
          }

          updateCartUI(); 
          console.log('Cart updated:', cart);

          
          setTimeout(() => {
            addPopUp.style.display = 'none';
          }, 1000);
        };

        
        card.appendChild(imageSection);
        card.appendChild(textSection);
       
        textSection.appendChild(cardTitle);
        textSection.appendChild(cardDesc);
        textSection.appendChild(cardPrice);
        textSection.appendChild(addButton);

        
        cardcontainer[0].appendChild(card);
      }
    }
  })
  .catch(err => console.error("Error loading products:", err)); 


checkoutButton.onclick = () => {
  if (mainContent.length > 0) {
    mainContent[0].style.display = 'none'; 
    checkoutButton.style.display = 'none'; 
  }
  if (checkoutWindow.length > 0) {
    checkoutWindow[0].style.display = 'flex'; 
    returnbutton.style.display = 'block';
  }
};


returnbutton.onclick = () => {
  if (mainContent.length > 0) {
    mainContent[0].style.display = 'block'; 
    checkoutButton.style.display = 'block'; 
  }
  if (checkoutWindow.length > 0) {
    checkoutWindow[0].style.display = 'none'; 
    returnbutton.style.display = 'none'; 
  }
};


PayButton.onclick = () => {
  if (cart.length === 0) {
    alert("Your cart is empty!"); 
    return;
  }

  console.log('Sending cart to server:', cart); 

 
  fetch('/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cart }),
  })
  .then(res => {
    if (!res.ok) throw new Error("Network response was not ok");
    return res.json();
  })
  .then(data => {
    if (data.id) {
      stripe.redirectToCheckout({ sessionId: data.id });
    } else {
      console.error("Session ID missing:", data); 
    }
  })
  .catch(err => console.error("Stripe checkout error:", err)); 
};


removeButtons.forEach(btn => {
  btn.onclick = (e) => {
    e.preventDefault(); 
    const item = btn.closest('.checkoutWindow__item');
    if (item) item.remove(); 
  };
});


window.onscroll = () => {
  if (header.length > 0) {
    if (window.scrollY > 0) {
      header[0].classList.add('header--scrolled'); 
    } else {
      header[0].classList.remove('header--scrolled'); 
    }
  }
};
