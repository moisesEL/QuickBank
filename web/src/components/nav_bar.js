const template = document.createElement("template");
template.innerHTML = `
<style>
    @import url('https://fonts.googleapis.com/css2?family=Kode+Mono&display=swap');

    :host::before {
        content: '';
        display: block;
        height: calc(50px + 20px + 5px);
        width: 100%;
    }

    header {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        width: calc(100% - 120px);
        height: 50px;
        color: var(--primary-text-color);
        background-color: var(--primary-background);
        display: flex;
        justify-content: space-between;
        padding: 15px 60px 10px 60px;
        z-index: 100;
        font-family: 'Kode Mono', monospace;
        font-weight: 400;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
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
        height: 100%; /* ← Ocupa toda la altura disponible */
    }

    #loginContainer {
        padding: 0px 10px;
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
        box-shadow: 0 8px 16px rgba(0,0,0,0.1);
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
        width: calc(100% - 32px);
        cursor: pointer;
        font-size: 14px;
        transition: background-color 0.2s;
    }

    .dropdown-item:hover {
        background-color: var(--secondary-background);
    }

    .logout-btn {
        color: var(--error-border-color);
        width: 100%;
    }

    .logout-btn:hover {
        background-color: var(--error-border-color);
        color: var(--primary-btn-color);
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

</style>
<header>
    <a id="logoContainer" href="/QuickBank">
        <img id="logoIcon" src="/QuickBank/src/assets/Logo.png"/></image>
        <h1 id="logoText">QuickBank</h1>
    </a>
</header>`;

class NavBar extends HTMLElement {
    constructor() {
        super();
        this.root = this.attachShadow({mode: "open"});
        this.root.appendChild(template.content.cloneNode(true))
    }
    connectedCallback () {
        const loginContainer = document.createElement("template");
        loginContainer.innerHTML = `
        <div id="loginContainer">
            <a id="signIn" href="/QuickBank/src/views/sign_in.html">
                Sign in
            </a>
            <a id="signUp" href="/QuickBank/src/views/sign_up.html">
                Sign up
            </a>
        </div>`;
        const dropDownMenu = document.createElement("template");
        dropDownMenu.innerHTML = `
        <div class="dropdown-container">
            <button class="dropdown-button">
                <span class="user-avatar">👤</span>
                ${sessionStorage.getItem('customer.firstName') || 'User'}
                <span class="dropdown-arrow">▼</span>
            </button>
            <div class="dropdown-content">
                <a href="/QuickBank/src/views/profile.html" class="dropdown-item">
                    <span>👤</span> Profile
                </a>
                <button class="dropdown-item logout-btn">
                    <span>🚪</span> Logout
                </button>
            </div>
        </div>`;

        if (sessionStorage.getItem('customer.email')) {
            this.root.querySelector("header").appendChild(dropDownMenu.content.cloneNode(true))
            this.initializeDropdown();
        }
        else {
            this.root.querySelector("header").appendChild(loginContainer.content.cloneNode(true))
        }
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
            window.location.href = 'index.html';
        });

        // Prevenir que el dropdown se cierre al hacer click dentro
        dropdownContent.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
}

window.customElements.define("nav-bar", NavBar);