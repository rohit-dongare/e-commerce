
//go through product-item.ejs file

const deleteProductButtonElements = document.querySelectorAll('.product-item button');//because it will return an array of buttons having delete functionality as there are no. of delete buttons so we 
                                    //have to know which product's button has clicked


async function deleteProduct(event){
   const buttonElement =  event.target;//it represents on which element the event has occured e.g button in this case
   const productId = buttonElement.dataset.productid;//this dataset property we have added product-item.ejs file for individual button it will be different 
   const csrfToken = buttonElement.dataset.csrf;//below while fetching the delete request we also need this csrftoken otherwise server will block this request

   //it admin.routes.js file you can see there is a delete request for /product:id it is actually /admin/product/:id , we have added this /admin in app.js file 
   //we have to send this request to the server to delete the product
   //here i am sending the DELETE request to the server
   //in the URL i am also sending the id of the product which i want to delete
   //also i am sending the csrfToken to verify the authenticity of the request
   const response = await fetch('/admin/products/' + productId + '?_csrf=' + csrfToken, {
    method: 'DELETE'
   });//we can send fetching request i.e get request, post request or Delete Request in our case
         //fetch requires URL to which request should be send e.g localhost:3000/admin/products/productid
         //you don't have to add this localhost:3000 as this is the domain that hosting this website , but if there is different server you want to send request
         //which is not hosting this website then you have to add this domain


    if (!response.ok){
        alert('Something went wrong');
        return;
    }     

    //now remove product element from the DOM using dom traversal
    //we are traversing from the delete button to it's parent element and then again to its parent element and then again to its parent element and then again to its parent element
    //so we have reached to the <li> element which is considered as a single product
    buttonElement.parentElement.parentElement.parentElement.parentElement.remove();//this will reach upto the <li> element which is considered as a single product
}



for (const deleteProductButtonElement of deleteProductButtonElements){
    deleteProductButtonElement.addEventListener('click', deleteProduct);
}                                    