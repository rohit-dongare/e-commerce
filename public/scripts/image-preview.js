const imagePickerElement = document.getElementById('image');
const imagePreviewElement = document.querySelector('#image-upload-control img');

function updateImagePreview (){
   const files = imagePickerElement.files;//basically it returns an array , here in this case we are only selecting one file at a time, but one select multiple files to upload

   if (!files || files.length === 0){
      imagePreviewElement.style.display = 'none';
      return;
   }

   const pickedFile = files[0];//

   imagePreviewElement.src = URL.createObjectURL(pickedFile);//URL is the built in class and createObjectURL is static method so we access it using this URL class instead of creating object to call this method
   imagePreviewElement.style.display = 'block';
}

imagePickerElement.addEventListener('change', updateImagePreview);