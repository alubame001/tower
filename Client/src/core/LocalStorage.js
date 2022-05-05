export default {
  get (name) {
    return parseInt(window.localStorage.getItem(name) || 0, 10)
  },

  value (name) {
    return window.localStorage.getItem(name);
  },
  set (name, value) {
    window.localStorage.setItem(name, value)
  }
}
