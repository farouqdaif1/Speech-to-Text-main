// Function to set a cookie without an expiration date (session cookie)
export default function setCookie(name, value) {
  document.cookie = `${name}=${value}; path=/`;
}
