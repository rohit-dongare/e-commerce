// go through cart.ejs , cart-item.ejs file, cart.routes.js ,cart.controller.js, cart.model.js file

const cartItemUpdateFormElements = document.querySelectorAll('.cart-item-management');
const cartTotalPriceElement = document.getElementById('cart-total-price');
const cartBadgeElements = document.querySelectorAll('.nav-items .badge');


async function updateCartItem(event){
    event.preventDefault();
  
    const form = event.target;

    const productId = form.dataset.productid;
    const csrfToken = form.dataset.csrf;
    const quantity = form.firstElementChild.value;//the input field that has no of quantities per product

    let response;

   try {
     response =  await fetch('/cart/items', {
        method: 'PATCH',
        body: JSON.stringify({
          productId: productId,
          quantity: quantity,
          _csrf: csrfToken
        }),
        headers: {
          'Content-type': 'application/json'
        }
      });
   } catch (error){
       alert('something went wrong!');
       return;
   }

   if (!response.ok){
    alert('something went wrong!');
    return;
   }
   
   const responseData = await response.json();

   if (responseData.updatedCartData.updatedItemPrice === 0){
      form.parentElement.parentElement.remove();

   }  else{
      const cartItemTotalPriceElement = form.parentElement.querySelector('.cart-item-price');
      cartItemTotalPriceElement.textContent = responseData.updatedCartData.updatedItemPrice.toFixed(2);//go through cart.controller.js file
   }
   
   cartTotalPriceElement.textContent = responseData.updatedCartData.newTotalPrice.toFixed(2);

   for (const cartBadgeElement of cartBadgeElements){
      cartBadgeElement.textContent = responseData.updatedCartData.newTotalQuantity;
   }
  
}


for (const formElement of cartItemUpdateFormElements){
    formElement.addEventListener('submit', updateCartItem);
}