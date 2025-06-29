// --- FRONTEND CODE (Runs in Browser) --- //
const header = document.getElementsByClassName('header');
console.log(header);
const cardcontainer = document.getElementsByClassName('card-container');
const checkoutButton = document.getElementById('cart');
const returnbutton = document.getElementById('returnbutton');
const checkoutWindow = document.getElementsByClassName('checkoutWindow');
const mainContent = document.getElementsByClassName('content');
const PayButton = document.getElementById('payButton');
const removeButtons = document.querySelectorAll('.remove--button');
const addButton = document.getElementsByClassName('add-button');
const stripe = Stripe('pk_test_51Qe3ndFllnWu1kBSxH5mXMuuIfHDWaqTkeRzar9kjnNCBEyLI4x6qFIXpmmD4GLAPFQAVSHGgbrPMbiYbu9mSg1k00BJ3GrN4Q');

header.scrollY = () => {
    if (window.scrollY > 0) {
       alert('header--scrolled');
    }
};

const cardData = [
    {
        imgSrc: './img/coffee.jpg',
        title: 'Dark roast coffee',
        description: 'A bold and bitter coffee experience',
        imgAlt: 'Coffee beans',
        Price: '€12.50'
    },
    {
        imgSrc: './img/coffee.jpg',
        title: 'Medium roast coffee',
        description: 'A nice balance of flavor and strength',
        imgAlt: 'Coffee beans',
        Price: '€12.50'
    },
];

if (cardcontainer.length > 0) {
    for (let i = 0; i < cardData.length; i++) {
        const { imgSrc, title, description, imgAlt, Price } = cardData[i];

        const card = document.createElement('article');
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
        cardPrice.textContent = 'Price: ' + Price;

        const addButton = document.createElement('button');
        addButton.innerText = 'Add to Cart';
        addButton.className = 'add-button';

        card.appendChild(imageSection);
        card.appendChild(textSection);
        textSection.appendChild(cardTitle);
        textSection.appendChild(cardDesc);
        textSection.appendChild(cardPrice);
        textSection.appendChild(addButton);

        cardcontainer[0].appendChild(card);
    }
}

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

addButton.onclick = function() {
    
}

returnbutton.onclick = function() {
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
    fetch('/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
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
