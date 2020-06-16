//VARIÁVEIS - FAZEM COM QUE AS TAGS HTML COM CLASS SEJAM EDITÁVEIS ATRAVÉS DAS VARIÁVEIS CORRESPONDENTES

const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");



//CARRINHO DE COMPRAS
let cart = [];

//BOTÕES
let buttonsDOM = [];

//CLASSE CORRESPONDENTE AOS PRODUTOS
class Products {
    async getProducts() {
        try {
            let result = await fetch("products.json"); //PEGA OS PRODUTOS DO ARQUIVO 'products.json'
            let data = await result.json(); //FAZ COM QUE OS RESULTADOS SEJAM INTERPRETADOS PELO NAVEGADOR ATRAVES DO JSON

            let products = data.items; //FAZ UMA APRESENTAÇÃO NOS ITEMS DO ARQUIVO JSON
            products = products.map(item => {
                const { title, price } = item.fields;
                const { id } = item.sys;
                const image = item.fields.image.fields.file.url;
                return { title, price, id, image }
            })
            return products //RETORNA O RESULTADO DA VARIÁVEL ACIMA
        } catch (error) {
            console.log(error);
        }
    }
}

//CLASSE DE APRESENTAÇÃO DA VIEW DOS PRODUTOS
class UI {
    displayProducts(products) {
        let result = '';
        products.forEach(product => { //ISSO FAZ COM QUE A CLASSE UI CRIE UM COMANDO HTML ABAIXO PARA CADA PRODUTO QUE ENCONTRAR
            result += `
            <!-- APRESENTA 1 PRODUTO -->
            <article class="product">
                <div class="img-container">
                    <img
                     src=${product.image}
                     alt="product"
                     class="product-img">
                    <button class="bag-btn" data-id=${product.id}>
                        <i class="fas fa-shopping-cart">
                            adicionar ao carrinho
                        </i>
                    </button>
                </div>
                <h3>${product.title}</h3>
                <h4>${product.price}</h4>
            </article>
            <!-- FIM DA APRESENTAÇÃO DO PRODUTO-->
            
            `;
        });
        productsDOM.innerHTML = result;
    }
    getBagButtons() { //ESSE MÉTODO FAZ COM QUE OS BOTÕES NAS IMAGENS RECEBAM O VALOR DO ID DO PRODUTO CORRESPONDENTE
        const buttons = [...document.querySelectorAll(".bag-btn")];
        buttonsDOM = buttons;
        buttons.forEach(button => {
            let id = button.dataset.id;
            let inCart = cart.find(item => item.id === id);
            if (inCart) {
                button.innerText = "No Carrinho";
                button.disabled = true;
            }
            button.addEventListener('click', (event) => {
                event.target.innerText = "No Carrinho";
                event.target.disabled = true;
                // PEGA OS PRODUTOS DA VARIÁVEL PRODUTOS
                let cartItem = { ...Storage.getProduct(id), amount: 1 };
                // ADICIONA O PRODURTO NO CARRINHO
                cart = [...cart, cartItem];
                // SALVA O CARRINHO NO LOCAL STORAGE
                Storage.saveCart(cart);
                // COLOCA OS VALORES NO CARRINHO
                this.setCartValues(cart);
                // APRESENTA OS ITEMS DO CARRINHO
                this.addCartItem(cartItem);
                // APRESENTA O CARRINHO
                this.showCart();
            });
        });
    }
    setCartValues(cart) {
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map(item => {
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount
        })
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
        cartItems.innerText = itemsTotal;
    }
    addCartItem(item) {
        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML = `
        <img src=${item.image} alt="product" />
        <div>
            <h4>${item.title}</h4>
            <h5>${item.price}</h5>
            <span class="remove-item" data-id=${item.id}>remover</span>
        </div>
        <div>
            <i class="fas fa-chevron-up" data-id=${item.id}></i>
            <p class="item-amount">${item.amount}</p>
            <i class="fas fa-chevron-down" data-id=${item.id}></i>
        </div>`;
        cartContent.appendChild(div);
    }
    showCart() {
        cartOverlay.classList.add("transparentBcg");
        cartDOM.classList.add("showCart");
    }
    setupAPP() {
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.populateCart(cart);
        cartBtn.addEventListener('click', this.showCart);
        closeCartBtn.addEventListener('click', this.hideCart);
    }
    populateCart(cart) {
        cart.forEach(item => this.addCartItem(item));
    }
    hideCart() {
        cartOverlay.classList.remove("transparentBcg");
        cartDOM.classList.remove("showCart");
    }
    cartLogic() {
        //BOTÃO DE LIMPAR O CARRINHO
        clearCartBtn.addEventListener('click', () => {
            this.clearCart();
        });
        //FUNCIONALIDADE DO CARRINHO
        cartContent.addEventListener('click', event => {
            if (event.target.classList.contains("remove-item")) {
                let removeItem = event.target;
                let id = removeItem.dataset.id;
                cartContent.removeChild(removeItem.parentElement.parentElement);
                this.removeItem(id);
            }
            else if (event.target.classList.contains("fa-chevron-up")) {
                let addAmount = event.target;
                let id = addAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount = tempItem.amount + 1;
                Storage.saveCart(cart);
                this.setCartValues(cart);
                addAmount.nextElementSibling.innerText = tempItem.amount;
            }
            else if (event.target.classList.contains("fa-chevron-down")) {
                let lowerAmount = event.target;
                let id = lowerAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount = tempItem.amount - 1;
                if (tempItem.amount > 0) {
                    Storage.saveCart(cart);
                    this.setCartValues(cart);
                    lowerAmount.previousElementSibling.innerText = tempItem.amount;
                } else {
                    cartContent.removeChild(lowerAmount.parentElement.parentElement);
                    this.removeItem(id);
                }
            }
        });
    }
    clearCart() {
        let cartItems = cart.map(item => item.id);
        cartItems.forEach(id => this.removeItem(id));

        while (cartContent.children.length > 0) {
            cartContent.removeChild(cartContent.children[0])
        }
        this.hideCart();
    }
    removeItem(id) {
        cart = cart.filter(item => item.id !== id);
        this.setCartValues(cart);
        Storage.saveCart(cart);
        let button = this.getSingleButton(id);
        button.disabled = false;
        button.innerHTML = `<i class="fas fa-shopping-cart">adicionar ao carrinho</i>`;
    }
    getSingleButton(id) {
        return buttonsDOM.find(button => button.dataset.id === id);
    }
}
//CLASSE DO ARMAZENAMENTO NO LOCAL STORAGE
class Storage {
    static saveProducts(products) {
        localStorage.setItem("products", JSON.stringify(products)); //TRANSFORMA OS VALORES JSON DA VARIAVEL PRODUTOS EM STRINGS
    }

    static getProduct(id) {
        let products = JSON.parse(localStorage.getItem('products'));
        return products.find(product => product.id === id);
    }
    static saveCart(cart) {
        localStorage.setItem("cart", JSON.stringify(cart));
    }
    static getCart() {
        return localStorage.getItem("cart") ? JSON.parse(localStorage.getItem("cart")) : [];
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const ui = new UI();
    const products = new Products();
    //CONFIGURAÇÃO DA APP
    ui.setupAPP();

    //PEGA TODOS OS PRODUTOS
    products.getProducts().then(products => {
        ui.displayProducts(products)
        Storage.saveProducts(products); //SALVA OS PRODUTOS ENCONTRADOS NO LOCAL STORAGE
    }).then(() => {
        ui.getBagButtons();
        ui.cartLogic();
    });
});