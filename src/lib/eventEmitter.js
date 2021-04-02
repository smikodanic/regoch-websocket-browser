class EventEmitter {

  /**
   * Create and emit the event
   * @param {string} eventName - event name, for example: 'pushstate'
   * @param {any} detail - event argument
   * @returns {void}
   */
  emit(eventName, detail) {
    const evt = new CustomEvent(eventName, {detail});
    window.dispatchEvent(evt);
  }


  /**
   * Listen for the event
   * @param {string} eventName - event name, for example: 'pushstate'
   * @param {Function} listener - callback function with event parameter
   * @returns {void}
   */
  on(eventName, listener) {
    window.addEventListener(eventName, event => {
      listener(event);
    });
  }


  /**
   * Listen for the event only once
   * @param {string} eventName - event name, for example: 'pushstate'
   * @param {Function} listener - callback function with event parameter
   * @returns {void}
   */
  once(eventName, listener) {
    window.addEventListener(eventName, event => {
      listener(event);
      window.removeEventListener(eventName, () => {});
    }, {once: true});
  }


  /**
   * Stop listening the event
   * @param {string} eventName - event name, for example: 'pushstate'
   * @returns {void}
   */
  off(eventName) {
    window.removeEventListener(eventName, event => {});
  }



}


module.exports = new EventEmitter();
