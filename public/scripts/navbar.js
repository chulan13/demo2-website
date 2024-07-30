// nav-bar
const nav = document.querySelector(".nav"),
  searchIcon = document.querySelector("#searchIcon"),
  searchBox = document.querySelector("#searchBox"),
  searchInput = document.querySelector("#searchInput"),
  navOpenBtn = document.querySelector(".navOpenBtn"),
  navCloseBtn = document.querySelector(".navCloseBtn");

searchIcon.addEventListener("click", () => {
  nav.classList.toggle("openSearch");
  nav.classList.remove("openNav");
  if (nav.classList.contains("openSearch")) {
    searchBox.style.display = "block";  // show search box
    searchInput.focus();  // focus on the search input
    return searchIcon.classList.replace("uil-search", "uil-times");  // Change icon to close
  }
  searchBox.style.display = "none";  // hide search box
  searchIcon.classList.replace("uil-times", "uil-search");  // Change icon back to search
});

navOpenBtn.addEventListener("click", () => {
  nav.classList.add("openNav");
  nav.classList.remove("openSearch");
  searchIcon.classList.replace("uil-times", "uil-search");
  searchBox.style.display = "none";
});

navCloseBtn.addEventListener("click", () => {
  nav.classList.remove("openNav");
});

// add event listener for the search input
searchInput.addEventListener("keypress", (e) => {
  if (e.key === 'Enter') {
    const query = searchInput.value;
    if (query) {
      performSearch(query);
    }
  }
});

// function to handle the search
function performSearch(query) {
  // remove previous highlights
  removeHighlights();

  // highlight the search term in text nodes
  highlightText(document.body, query);

  // reset search input
  searchInput.value = '';
  searchBox.style.display = "none";
  searchIcon.classList.replace("uil-times", "uil-search");
  nav.classList.remove("openSearch");
}

// function to remove previous highlights
function removeHighlights() {
  const highlights = document.querySelectorAll('.highlight');
  highlights.forEach((highlight) => {
    const parent = highlight.parentNode;
    parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
    parent.normalize(); // merge adjacent text nodes
  });
}

// function to highlight text nodes
function highlightText(element, query) {
  if (element.nodeType === Node.TEXT_NODE) {
    const regex = new RegExp(`(${query})`, 'gi');
    const content = element.textContent;
    const highlightedContent = content.replace(regex, '<span class="highlight">$1</span>');
    const tempElement = document.createElement('div');
    tempElement.innerHTML = highlightedContent;
    
    while (tempElement.firstChild) {
      element.parentNode.insertBefore(tempElement.firstChild, element);
    }
    element.parentNode.removeChild(element);
  } else if (element.nodeType === Node.ELEMENT_NODE) {
    element.childNodes.forEach(child => highlightText(child, query));
  }
}
