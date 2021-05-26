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
    this.activeOns = this.activeOns.filter(act => !(act.eventName === eventName && act.listenerCB.toString() === listenerCB.toString())); // remove previously added activeOns
    this.activeOns.push({eventName, listenerCB}); // push new activeOn
    // console.log('activeOns::', this.activeOns);
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
    const activeOns = this.activeOns.filter(act => act.eventName === eventName);
    for (const activeOn of activeOns) {
      window.removeEventListener(eventName, activeOn.listenerCB);
      // console.log('removed listener on--', eventName, activeOn.listenerCB);
    }
  }



}


module.exports = new EventEmitter();
