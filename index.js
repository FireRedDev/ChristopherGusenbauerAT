const navbar = document.getElementById("nav-list")
const expandableitems = document.querySelectorAll(
    ".nav-list li:not(:first-child):not(:nth-child(2))",
  );
  const mediaQuery = window.matchMedia('(min-width: 800px)')

  function toggleMenu() {    
    expandableitems.forEach(nav =>  {
        if(nav.style.display=="list-item")
        nav.style.display="none"
        else 
        nav.style.display="list-item"
    });
  }
  
  function handleTabletChange(e) {
    // Check if the media query is true
    if (e.matches) {
      // Desktop Menu, reactivate navbaritems
      expandableitems.forEach(nav =>  {
        nav.style.display="list-item"
    });
    }
  }

  // Register event listener
  mediaQuery.addListener(handleTabletChange)


  document.querySelector('.collapse')
    .addEventListener('click', toggleMenu)