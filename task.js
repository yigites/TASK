(() => {
    const addJQ = () => {
        if (window.jQuery) {
            console.log("jq zaten ekli");
            init();
            return;
        }

        const jqScript = document.createElement("script");
        jqScript.src = "https://code.jquery.com/jquery-3.7.1.min.js";
        jqScript.onload = init;
        document.head.append(jqScript);
    };

    const init = () => {
        fetchProducts();
        checkLikedProducts();
        buildCSS();
    };

    function fetchProducts() {
        try {
            const localProducts = localStorage.getItem("productsData");
            if (localProducts) {
                console.log("veriler lokaden alindi");
                buildHTML(JSON.parse(localProducts));
            } else {
                console.log("veriler apiden alinacak");
                getProducts();
            }
        } catch (error) {
            console.error("LocalStorage erisim hatasi:", error);
            getProducts();
        }
    }

    function getProducts() {
        $.ajax({
            url: 'https://gist.githubusercontent.com/sevindi/5765c5812bbc8238a38b3cf52f233651/raw/56261d81af8561bf0a7cf692fe572f9e1e91f372/products.json',
            method: 'GET',
            dataType: 'json',
            success: function (data) {
                localStorage.setItem('productsData', JSON.stringify(data));
                console.log("Veriler basariyla alindi");
                buildHTML(data);
            },
            error: function (error) {
                console.error("Ürün verileri alinamadi:", error);
            }
        });
    }

    //like sistemi burada olacak
    const likeProduct = (productId) => {
        console.log("urun begenildi id:", productId);

        let likedProducts = JSON.parse(localStorage.getItem("likedProducts")) || [];

        if (likedProducts.includes(productId)) {
            likedProducts = likedProducts.filter(id => id !== productId); //idsi olmayanları listeden çıkardım
            console.log("begendien -");
            $(`button[data-product-id='${productId}']`).removeClass('active'); //jquery select fonksiyonu ile favori butonlari bulma
        } else {
            likedProducts.push(productId);
            console.log("begeniden +");
            $(`button[data-product-id='${productId}']`).addClass('active');
        }

        localStorage.setItem("likedProducts", JSON.stringify(likedProducts));
    };

    const checkLikedProducts = () => {
        const likedProducts = JSON.parse(localStorage.getItem("likedProducts")) || [];

        likedProducts.forEach(productId => {
            $(`button[data-product-id='${productId}']`).addClass('active');
        });
    };

    const buildCSS = () => {
        const css = `
body {
    font-family: Arial, sans-serif;
}

.likeable-container {
    position: relative;
    max-width: 90%;
    margin: 5% auto;
    padding: 20px;
    text-align: left;
}

.my-carousel-container {
    position: relative;
    left: 2%;
    overflow: hidden;
}

.my-carousel-container .carousel-title p {
    font-weight: lighter;
    font-size: 32px;
    font-family: 'Open Sans', sans-serif;
    margin-bottom: 10px;
    margin-left: 65px;
}

.carousel-padded {
    display: flex;
    overflow-x: auto;
    scroll-behavior: smooth;
    max-width: 1600px;
    margin-left: 50px;
}

.carousel-padded::-webkit-scrollbar {
    display: none;
}

.carousel-product {
    position: relative;
    flex: 0 0 calc(100% / 7.5);
    min-width: calc(100% / 7.5);
    margin: 1%;
    text-align: left;
}

.carousel-product a {
    color: black;
    text-decoration: none;
}


.carousel-product .product-price p {
    font-size: 18px;
    color: #193db0;
    font-weight: bold;
    margin-top: -10px;
}

.carousel-product .heart-icon {
    font-size: 20px;
    cursor: pointer;
    color: black;
}

.carousel-product .product-name p {
    font-size: 14px;
    font-family: 'Open Sans', sans-serif;
    margin-left: 2%;
}

.carousel-product .heart-icon.active svg path {
    stroke: #193db0 !important;
    fill: #193db0 !important;

}


.carousel-product .fav-icon {
    width: 34px;
    height: 34px;
    background-color: #fff;
    border-radius: 5px;
    box-shadow: 0 3px 6px rgba(0, 0, 0, .16);
    border: 0.5px solid #b6b7b9;
    position: absolute;
    top: 2%;
    left: 80%;
    display: flex;
    justify-content: center;
    align-items: center;
}

.carousel-product img {
    width: 100%;
    height: auto;
    max-width: 210px;
    max-height: 290px;
}

.carousel-buttons {
    position: absolute;
    top: 50%;
    background: transparent;
    color: gray;
    border: none;
    cursor: pointer;
    font-size: 36px;
    z-index: 10;
}

.like-btn {
    background: transparent;
    border: none;
    cursor: pointer;
    z-index: 10;
}

.prev-btn {
    left: 1px;
}

.next-btn {
    right: 1px;
}

/* Responsive*/
@media (max-width: 1200px) {
    .carousel-product {
        flex: 0 0 calc(100% / 5);
    }
}

@media (max-width: 992px) {
    .carousel-product {
        flex: 0 0 calc(100% / 4);
    }
}

@media (max-width: 768px) {
    .carousel-product {
        flex: 0 0 calc(100% / 3);
    }
}

@media (max-width: 576px) {
    .carousel-product {
        flex: 0 0 calc(100% / 2);
    }
}`;

        $('<style>').addClass('carousel-style').html(css).appendTo('head');
    };


    const buildHTML = (products) => {
        if (!products) {
            console.error("Hatali urun verisi alindi");
            return;
        }

        const deleteCarousel = document.querySelector('#similar-items-recommendations');
        if (deleteCarousel) {
            deleteCarousel.remove();
        }

        const productHTML = products.map(product => `
            <div class="carousel-product">
                <div class="fav-icon">
                    <button class="like-btn heart-icon" data-product-id="${product.id}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20.576" height="19.483" viewBox="0 0 20.576 19.483">
                            <path fill="none" stroke="#555" stroke-width="1.5px" d="M19.032 7.111c-.278-3.063-2.446-5.285-5.159-5.285a5.128 5.128 0 0 0-4.394 2.532 4.942 4.942 0 0 0-4.288-2.532C2.478 1.826.31 4.048.032 7.111a5.449 5.449 0 0 0 .162 2.008 8.614 8.614 0 0 0 2.639 4.4l6.642 6.031 6.755-6.027a8.615 8.615 0 0 0 2.639-4.4 5.461 5.461 0 0 0 .163-2.012z" transform="translate(.756 -1.076)"></path>
                        </svg>
                    </button>
                </div>
                <a href="${product.url}" target="_blank">
                    <img src="${product.img}" alt="${product.name}">
                    <div class="product-name"> <p>${product.name}</p> </div>
                    <div class="product-price"> <p>${product.price} TRY</p> </div>
                </a>
            </div>
        `).join("");


        const html = `
        <div class="likeable-container">
            <div class="my-carousel-container">
                <div class="carousel-title"> <p>You Might Also Like</p> </div>
                <button class="carousel-buttons prev-btn">&#10094;</button>
                <div class="carousel-padded">${productHTML}</div>
                <button class="carousel-buttons next-btn">&#10095;</button>
            </div>
        </div>
        `;
        //$(".product-detail").after(html);
        $("#we-option-combine").after(html);
        setEvents();
    };

    const setEvents = () => {
        const container = $(".carousel-padded");
        const scrollAmount = container.width() * 0.4;

        $(".prev-btn").on("click", () => {
            container.scrollLeft(container.scrollLeft() - scrollAmount);
        });

        $(".next-btn").on("click", () => {
            container.scrollLeft(container.scrollLeft() + scrollAmount);
        });

        $(".like-btn").on("click", function () {
            const productId = $(this).data('product-id');
            try {
                likeProduct(productId);
            } catch (error) {
                console.log(error);
            }
        });
    };

    /*LOCALDE CALISMAK ICIN*/

    /*
    const header = document.createElement("div");
    header.id = "we-option-combine";
    document.body.appendChild(header);
    */

    addJQ();
})();
