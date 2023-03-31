/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};

;// CONCATENATED MODULE: ./src/js/ChatMessagesMaker.js
class ChatMessagesMaker {
  constructor(chatInput, messages, messagesContainer) {
    this.chatInput = chatInput;
    this.messages = messages;
    this.messagesContainer = messagesContainer;
  }
  static getTime() {
    const date = new Date();
    const options = {
      dateStyle: 'short',
      timeStyle: 'short'
    };
    const formattedDate = new Intl.DateTimeFormat('ru-RU', options).format(date).replace(/\d{2}(\d{2}),/, '$1');
    return formattedDate;
  }
  addMessage(coords) {
    const time = this.constructor.getTime();
    this.messages.insertAdjacentHTML('beforeend', `
      <div class="message">
        <div class="message__header">${time}</div>
        <div class="message__text">${this.chatInput.value}</div>
        <div class="message__coordinates">[${coords.lat}, ${coords.lon}] <a href="http://www.google.com/maps/place/${coords.lat},${coords.lon}" target="_blank">&#128065;</a></div>
      </div>
    `);
    this.messagesContainer.scrollTo(0, this.messagesContainer.scrollHeight);
    this.chatInput.value = '';
    this.chatInput.dataset.geoResponse = '';
    this.chatInput.focus();
  }
}
;// CONCATENATED MODULE: ./src/js/Modal.js
class Modal {
  constructor(modalWindow, modalHeader, modalMessage, modalForm, modalFormInput, modalCancelButton, chatInput, chatMessagesMaker) {
    this.modalWindow = modalWindow;
    this.modalHeader = modalHeader;
    this.modalMessage = modalMessage;
    this.modalForm = modalForm;
    this.modalFormInput = modalFormInput;
    this.modalCancelButton = modalCancelButton;
    this.chatInput = chatInput;
    this.chatMessagesMaker = chatMessagesMaker;
  }
  setContent(content) {
    this.modalHeader.textContent = content.header;
    this.modalMessage.textContent = content.message;
  }
  toggle() {
    this.modalWindow.classList.toggle('active');
  }
  getCoords() {
    const formattedInput = this.modalFormInput.value.replace(/^\[/, '').replace(/\]$/, '').replace(/, /, ',');
    const [lat, lon] = formattedInput.split(',');
    const convertedInput = {
      lat: +lat,
      lon: +lon
    };
    return convertedInput;
  }
  checkModalFormInput() {
    const regex = /^\[?[−-]?([0-9]|[1-8][0-9])(\.\d{1,5})?,\s?[−-]?([0-9]|[1-9][0-9]|[1][0-7][0-9])(\.\d{1,5})?\]?$/;
    return regex.test(this.modalFormInput.value);
  }
  static manageValidity(currentValidity, input) {
    if (currentValidity) {
      input.setCustomValidity('');
    } else {
      input.setCustomValidity('Координаты не соответствуют примеру');
    }
  }
  assignInputCheckerHandler() {
    this.modalFormInput.addEventListener('change', () => this.constructor.manageValidity(this.checkModalFormInput(), this.modalFormInput));
    this.modalFormInput.addEventListener('input', () => this.constructor.manageValidity(this.checkModalFormInput(), this.modalFormInput));
  }
  assignSubmitHandler() {
    this.modalForm.addEventListener('submit', event => {
      event.preventDefault();
      if (this.checkModalFormInput()) {
        this.toggle();
        this.chatMessagesMaker.addMessage(this.getCoords());
        this.modalHeader.textContent = '';
        this.modalMessage.textContent = '';
        this.modalForm.reset();
      } else {
        this.modalFormInput.setCustomValidity('Координаты не соответствуют примеру');
      }
    });
  }
  assignCancelHandler() {
    this.modalCancelButton.onclick = () => {
      this.chatInput.focus();
      this.chatInput.selectionStart = this.chatInput.value.length;
      this.toggle();
      this.modalHeader.textContent = '';
      this.modalMessage.textContent = '';
      this.modalForm.reset();
    };
  }
}
;// CONCATENATED MODULE: ./src/js/Geolocation.js
class Geolocation {
  constructor(chatInput) {
    this.chatInput = chatInput;
  }
  setLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => this.handleSuccess(position), error => this.handleFailure(error));
    } else {
      this.chatInput.dataset.geoResponse = JSON.stringify({
        header: 'Ваш браузер не поддерживает геолокацию',
        message: 'Смените браузер, либо введите местоположение в ручную.'
      });
    }
  }
  handleSuccess(position) {
    this.chatInput.dataset.geoResponse = JSON.stringify({
      success: true,
      lat: position.coords.latitude,
      lon: position.coords.longitude
    });
  }
  handleFailure(error) {
    const response = {
      header: '',
      message: ''
    };
    switch (error.code) {
      case error.PERMISSION_DENIED:
        response.header = 'Настройками текущего браузера запрещен запрос геолокации';
        response.message = 'Измените настройки конфиденциальности, либо введите местоположение в ручную.';
        break;
      case error.POSITION_UNAVAILABLE:
        response.header = 'Информация о вашем местоположении недоступна';
        response.message = 'Введите местоположение в ручную.';
        break;
      case error.TIMEOUT:
        response.header = 'Истекло время ожидания запроса вашего местоположения';
        response.message = 'Нажмите "Отмена" и попробуйте ещё раз, либо введите местоположение в ручную.';
        break;
      default:
        response.header = 'Произошла неизвестная ошибка';
        response.message = 'Нажмите "Отмена" и попробуйте ещё раз, либо введите местоположение в ручную.';
        break;
    }
    this.chatInput.dataset.geoResponse = JSON.stringify(response);
  }
}
;// CONCATENATED MODULE: ./src/js/enterHandler.js
function enterHandler(event, chatInput, chatMessagesMaker, geolocation, modal) {
  if (event.key === 'Enter') {
    const {
      value
    } = chatInput;
    if (!value || !value.trim()) {
      chatInput.setAttribute('value', '');
      return;
    }
    geolocation.setLocation();
    chatInput.setAttribute('disabled', '');
    chatInput.setAttribute('disabled', '');
    const promise = new Promise(resolve => {
      setTimeout(() => {
        if (chatInput.dataset.geoResponse) {
          resolve();
        }
      }, 100);
    });
    promise.then(() => {
      const geoResponse = JSON.parse(chatInput.dataset.geoResponse);
      chatInput.removeAttribute('disabled');
      if (geoResponse.success) {
        chatMessagesMaker.addMessage(geoResponse);
      } else {
        modal.setContent(geoResponse);
        modal.toggle();
      }
    });
  }
}
;// CONCATENATED MODULE: ./src/js/app.js




const chat = document.querySelector('.chat-widget');
const messagesContainer = chat.querySelector('.chat-widget__messages-container');
const messages = chat.querySelector('.chat-widget__messages');
const chatInput = chat.querySelector('.chat-widget__input');
const chatMessagesMaker = new ChatMessagesMaker(chatInput, messages, messagesContainer);
const modalWindow = document.querySelector('.modal');
const modalHeader = modalWindow.querySelector('.modal__header');
const modalMessage = modalWindow.querySelector('.modal__message');
const modalForm = modalWindow.querySelector('.modal__form');
const modalFormInput = modalWindow.querySelector('.modal-form__input');
const modalCancelButton = modalWindow.querySelector('.modal-form__button-cancel');
const modal = new Modal(modalWindow, modalHeader, modalMessage, modalForm, modalFormInput, modalCancelButton, chatInput, chatMessagesMaker);
modal.assignInputCheckerHandler();
modal.assignSubmitHandler();
modal.assignCancelHandler();
const geolocation = new Geolocation(chatInput);
chatInput.addEventListener('keyup', event => enterHandler(event, chatInput, chatMessagesMaker, geolocation, modal));
chatInput.value = 'Хорошего дня! &#128512;';
chatMessagesMaker.addMessage({
  lat: 51.50851,
  lon: -0.12572
});
chatInput.focus();
;// CONCATENATED MODULE: ./src/index.js


/******/ })()
;