//go through prodcut-details.ejs file and also through cart.controller.js 

const addToCartButtonElement = document.querySelector('#product-details button');
const cartBadgeElements = document.querySelectorAll('.nav-items .badge');

async function addToCart(){
  const productId = addToCartButtonElement.dataset.productid;
  const csrfToken = addToCartButtonElement.dataset.csrf;
  let response;

 try{ 
   response = await fetch('/cart/items', {
    method: 'POST',
    body: JSON.stringify({
       productId: productId,//this productId has been used in cart.controller.js file to store the information of the product into the session cart
       _csrf: csrfToken
    }),
    headers: {
        'Content-Type': 'application/json'//this Content-type is the header and that's the header our backend code will look for to parse incoming data through post request
                                          //here we are submitting json type data, go through the app.js file
     }
  });
 } catch (error){
    alert('Something went wrong!');
    return;
 }

  if (!response.ok){
    alert('Something went wrong!');
    return;
  }

  const responseData = await response.json();//go through cart.controller.js where at the end of the cartItem() function we have returned 
                                            //some response in json format that contains totalQuantity property which will used to show the notifaction of how many products has been added into the cart
    const newTotalQuantity = responseData.newTotalItems;    
    
    for (const cartBadgeElement of cartBadgeElements){
      cartBadgeElement.textContent = newTotalQuantity;
    }
    
}

addToCartButtonElement.addEventListener('click', addToCart);