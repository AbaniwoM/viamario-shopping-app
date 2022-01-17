
var addItemId = 0;
function addToCart(item) {
    addItemId += 1;
    var selectedItem = document.createElement('div');
    selectedItem.classList.add('cartImg');
    selectedItem.setAttribute('id', addItemId);
    var img = document.createElement('img');
    img.setAttribute('url', item.children[0].currentUrl);
    var cartItems = document.getElementsById('title');
    selectedItem.append(img);
    cartItems.append(selectedItem);
}