class EventEmitter {

  constructor() {
    this.activeOns = []; // [{eventName:string, listenerCB:Function}]
  }

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
    const listenerCB = event => { listener(event); };

    // remove duplicated listeners
    let ind = 0;
    for (const activeOn of this.activeOns) {
      if (activeOn.eventName === eventName && activeOn.listenerCB.toString() === listenerCB.toString()) {
        window.removeEventListener(eventName, activeOn.listenerCB);
        this.activeOns.splice(ind, 1);
      }
      ind++;
    }

    this.activeOns.push({eventName, listenerCB});
    window.addEventListener(eventName, listenerCB);
  }


  /**
   * Listen for the event only once
   * @param {string} eventName - event name, for example: 'pushstate'
   * @param {Function} listener - callback function with event parameter
   * @returns {void}
   */
  once(eventName, listener) {
    const listenerCB = event => {
      listener(event);
      window.removeEventListener(eventName, listenerCB);
    };
    window.addEventListener(eventName, listenerCB, {once: true});
  }


  /**
   * Stop listening the event for multiple listeners defined with on().
   * For example eventEmitter.on('msg', fja1) & eventEmitter.on('msg', fja2) then eventEmitter.off('msg') will remove fja1 and fja2 listeners.
   * @param {string} eventName - event name, for example: 'pushstate'
   * @returns {void}
   */
  off(eventName) {
    let ind = 0;
    for (const activeOn of this.activeOns) {
      if (activeOn.eventName === eventName) {
        window.removeEventListener(eventName, activeOn.listenerCB);
        this.activeOns.splice(ind, 1);
      }
      ind++;
    }
  }



  /**
   * Get all active listeners.
   * @returns {{eventName:string, listenerCB:Function}[]}
   */
  getListeners() {
    return {...this.activeOns};
  }



}


module.exports = new EventEmitter();
