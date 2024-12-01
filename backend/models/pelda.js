function sumPrices(products) {
    return products.reduce((total, product) => total + product.price, 0);
}

function calculateTotalPrice(products) {
    return sumPrices(products);
}

function calculateAveragePrice(products) {
    return sumPrices(products) / products.length;
}