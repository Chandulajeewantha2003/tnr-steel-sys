var swiper = new Swiper(".swiper-brands", {
    spaceBetween: 0,
    centeredSlides: true,
    speed: 3000,
    spaceBetween: 10,
    loop: true,
    slidesPerView: 2,
    autoplay: {
        delay: 1,
    },
    breakpoints: {
        576: {
            slidesPerView: 2,
            spaceBetween: 10,
        },
        768: {
            slidesPerView: 3,
            spaceBetween: 20,
        },
        992: {
            slidesPerView: 4,
            spaceBetween: 30,
        },
    },
    allowTouchMove: false,
    disableOnInteraction: true,
});

//////////////////////

var swiper = new Swiper(".swiper-testimonials", {
    slidesPerView: 3,
    spaceBetween: 10,
    autoplay: {
        delay: 2500,
        disableOnInteraction: false,
    },
    pagination: {
        el: ".swiper-pagination",
        clickable: true,
    },
    // navigation: {
    //     nextEl: ".swiper-button-next",
    //     prevEl: ".swiper-button-prev",
    // },
});

//////////////////////

var swiper = new Swiper(".swiper-product-imgs", {
    slidesPerView: 1,
    autoplay: {
        delay: 2500,
        disableOnInteraction: false,
    },
    pagination: {
        el: ".swiper-pagination",
        clickable: true,
    },
});

//////////////////////

$("#jumbo").vegas({
    timer: false,
    overlay: true,
    slides: [{
        src: "media/bg/1.jpg"
    }, {
        src: "media/bg/2.jpg"
    }],
    animation: "kenburns",
    transition: "burn",
});



//////////////////////

AOS.init();

function userLogin() {
    // #
}