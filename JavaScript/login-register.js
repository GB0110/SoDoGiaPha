const wrapper = document.querySelector('.wrapper');
const loginLink = document.querySelector('.login-link');
const registerLink = document.querySelector('.register-link');
const btnPopup = document.querySelector('.btnLogin-popup');
const iconClose = document.querySelector('.icon-close');
const backLogin = document.querySelector('.back-login');
const rememberForgot = document.querySelector('.forgot-pass');


registerLink.addEventListener('click', ()=> {
    wrapper.classList.add('active');
})

loginLink.addEventListener('click', ()=> {
    wrapper.classList.remove('active');
})

btnPopup.addEventListener('click', ()=> {
    wrapper.classList.add('active-popup');
})

iconClose.addEventListener('click', ()=> {
    wrapper.classList.remove('active-popup');
})

rememberForgot.addEventListener('click', ()=> {
    wrapper.classList.add('active-forgotpassword');
})

backLogin.addEventListener('click', ()=> {
    wrapper.classList.remove('active-forgotpassword');
})