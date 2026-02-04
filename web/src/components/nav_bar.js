const navBarTemplate = document.createElement("template");
navBarTemplate.innerHTML = `
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
<style>
@import url('https://fonts.googleapis.com/css2?family=Kode+Mono&display=swap');

* {
    box-sizing: border-box;
}


nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    width: 100vw;
    height: 75px;
    color: var(--primary-text-color);
    background-color: var(--primary-background);
    padding: 15px 60px 10px 60px;
    z-index: 100;
    font-family: 'Kode Mono', monospace;
    font-weight: 400;
    box-shadow: 0 2px 10px var(--navbar-shadow);
}

ul {
    padding: 0px;
    margin: 0px;
    width: 100%;
    list-style-type: none;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
}

#firstListedItem {
    margin-right: auto;
}

a {
    border: none;
    width: min-content;
    white-space: nowrap;
    padding: 8px 6px;
    border-radius: 10px;
    color: var(--primary-btn-color);
    text-decoration: none;
    cursor: pointer;
}

#logoContainer {
    display: grid;
    grid-template-columns: min-content min-content;
    align-items: center;
    max-height: 100%;
    grid-gap: 15px;
    padding: 0px;
    border-radius: 10px;
    color: var(--primary-text-color);
}

#logoIcon {
    height: 48px;
    align-self: center;
    flex-shrink: 0;
}

#logoText {
    margin: 0;
    white-space: nowrap;
    line-height: 1;
    display: flex;
    align-items: flex-end;
    height: 100%;
}

#toggle-theme-button {
    aspect-ratio: 1/1;
    width: min-content;
    height: min-content;
    border-radius: 35px;
    cursor: pointer;
    color: purple;
    background: var(--toggle-background);
    border-color: var(--toggle-border);
    transition: all 0.3s ease;
}

#loginContainer {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 10px;
}

#signIn {
    background-color: var(--primary-login-btn-background);
    font-size: 20px;
}

#signIn:hover {
    color: var(--primary-btn-hover);
}

#signUp {
    background-color: var(--primary-btn-background);
    font-size: 20px;
}

#signUp:hover {
    color: var(--primary-btn-hover);
}

.dropdown-container {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
}

.dropdown-button {
    background-color: var(--primary-btn-background);
    color: var(--primary-btn-color);
    border: none;
    padding: 10px 15px;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    transition: background-color 0.3s;
}

.dropdown-button:hover {
    background-color: var(--primary-btn-hover);
    color: var(--primary-text-color);
}

.dropdown-arrow {
    font-size: 12px;
    transition: transform 0.3s;
}

.dropdown-content.show ~ .dropdown-button .dropdown-arrow {
    transform: rotate(180deg);
}

.dropdown-content {
    display: none;
    position: absolute;
    right: 0;
    top: 100%;
    background-color: var(--primary-background);
    min-width: 200px;
    box-shadow: 0 8px 16px var(--dropdown-content-shadow);
    border-radius: 8px;
    z-index: 1000;
    margin-top: 5px;
    border: 1px solid var(--border-color);
}

.dropdown-content.show {
    display: block;
}

.dropdown-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    text-decoration: none;
    color: var(--primary-text-color);
    background: none;
    border: none;
    width: 100%;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.2s;
}

.dropdown-item:hover {
    background-color: var(--secondary-background);
}

.accounts-btn {
    border-radius: 0px;
}

.user-avatar {
    font-size: 18px;
}

.dropdown-item:first-child {
    border-radius: 8px 8px 0 0;
}

.dropdown-item:last-child {
    border-radius: 0 0 8px 8px;
}

@media screen and (max-width: 600px) {
    nav {
        padding: 7px 10px 5px 10px;
        height: min-content;
    }
    ul {
        flex-direction: column;
        gap: 10px;
    }
    li {
        display: flex;
        flex-direction: column;
        gap: 10px;
        justify-content: center;
        align-items: center;
        width: 100%;
    }
    #logoText {
        font-size: 1.5em;
    }
    #logoIcon {
        height: 38px;
    }
    #loginContainer {
        flex-direction: column;
        gap: 10px;
    }
    #loginContainer a {
        font-size: 1em;
        padding: 4px 3px;
        width: min-content;
        border-radius: 10px;

    }
}
</style>

<nav aria-label="Main navigation" id="mainNavigation">
    <div id="placeholderBox"></div>
    <ul>
        <li id="firstListedItem">
            <a id="logoContainer" href="/QuickBank">
                <img id="logoIcon" alt="Bitcoin Cat Logo" src="/QuickBank/src/assets/Logo.png"/></image>
                <h1 id="logoText">QuickBank</h1>
            </a>
        </li>
        <li>
            <button id="toggle-theme-button">
                <i class="material-icons" id="toggle-theme-icon">mode_night</i>
            </button>
        </li>
    </ul>
</nav>`;

class NavBar extends HTMLElement {
    constructor() {
        super();
        this.root = this.attachShadow({mode: "open"});
        this.root.appendChild(navBarTemplate.content.cloneNode(true))
        this.nav = this.root.querySelector("#mainNavigation");
        this.ul = this.root.querySelector("ul");
        this.toggleThemeButton = this.root.querySelector("#toggle-theme-button");
        this.toggleThemeIcon = this.root.querySelector("#toggle-theme-icon");
        this.logoIcon = this.root.querySelector("#logoIcon");
    }
    connectedCallback () {
        this.checkTheme();
        const voidBox = document.createElement("div");
        voidBox.style = "content: '';display: block;width: 100%;"
        voidBox.style.height = getComputedStyle(this.nav).height;
        this.root.insertBefore(voidBox, this.nav);
        window.addEventListener("resize", () => {
            voidBox.style.height = getComputedStyle(this.nav).height;
        });

        const loginContainer = document.createElement("template");
        loginContainer.innerHTML = `
            <li>
                <a id="signIn" href="/QuickBank/src/views/sign_in.html">
                    Sign in
                </a>
            </li>
            <li>
                <a id="signUp" href="/QuickBank/src/views/sign_up.html">
                    Sign up
                </a>
            </li>`;
        const dropDownMenu = document.createElement("template");
        dropDownMenu.innerHTML = `
        <li class="dropdown-container">
            <button class="dropdown-button">
                <span class="user-avatar">👤</span>
                <span>${sessionStorage.getItem('customer.firstName') || 'User'}<span>
                <span class="dropdown-arrow">▼</span>
            </button>
            <div class="dropdown-content">
                <a href="/QuickBank/src/views/profile.html" class="dropdown-item">
                    <span>👤</span> Profile
                </a>
                <a href="/QuickBank/src/views/accounts.html" class="dropdown-item accounts-btn">
                    <span>📊</span> Accounts
                </a>
                <button class="dropdown-item logout-btn">
                    <span>🚪</span> Logout
                </button>
            </div>
        </li>`;

        if (sessionStorage.getItem('customer.id')) {
            this.ul.insertBefore(dropDownMenu.content.cloneNode(true), this.ul.lastElementChild)
            this.initializeDropdown();
        }
        else {
            this.ul.insertBefore(loginContainer.content.cloneNode(true), this.ul.lastElementChild)
        }

        this.toggleThemeButton.addEventListener('click', () => this.toggleTheme())
    }

    checkTheme() {
        let theme = sessionStorage.getItem('theme') || 'light';
        const lightStyle = document.querySelector('link[href="/QuickBank/src/css/light_theme.css"]');
        const darkStyle = document.querySelector('link[href="/QuickBank/src/css/dark_theme.css"]');
        if (theme === 'dark') {
            if (lightStyle) lightStyle.disabled = true;
            if (darkStyle) darkStyle.disabled = false;
            this.toggleThemeIcon.innerText = 'mode_night';
            this.logoIcon.setAttribute('src', '/QuickBank/src/assets/Logo dark mode.png')
        }
        else {
            if (lightStyle) lightStyle.disabled = false;
            if (darkStyle) darkStyle.disabled = true;
            this.toggleThemeIcon.innerText = 'light_mode';
            this.logoIcon.setAttribute('src', '/QuickBank/src/assets/Logo.png')
        }
    }

    toggleTheme() {
    const currentTheme = sessionStorage.getItem('theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    sessionStorage.setItem('theme', newTheme);
    this.checkTheme();
    }

    initializeDropdown() {
        const dropdownButton = this.root.querySelector('.dropdown-button');
        const dropdownContent = this.root.querySelector('.dropdown-content');
        const logoutBtn = this.root.querySelector('.logout-btn');

        // Toggle dropdown
        dropdownButton.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownContent.classList.toggle('show');
        });

        // Cerrar dropdown al hacer click fuera
        document.addEventListener('click', () => {
            dropdownContent.classList.remove('show');
        });

        // Manejar logout
        logoutBtn.addEventListener('click', () => {
            sessionStorage.clear();
            window.location.href = '/QuickBank';
        });

        // Prevenir que el dropdown se cierre al hacer click dentro
        dropdownContent.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
}

window.customElements.define("nav-bar", NavBar);