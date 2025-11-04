const template = document.createElement("template");
template.innerHTML = `
<style>
    a {
        border: none;
        width: min-content;
        white-space: nowrap;
        padding: 8px 6px;
        border-radius: 10px;
        color: var(--primary-btn-color);
        background-color: var(--primary-btn-background);
        text-decoration: none;
    }

    a:hover {
        cursor: pointer;
        color: var(--primary-btn-hover, rgba(225, 225, 225));
    }

    header {
        position: fixed;
        top: 0px;
        width: 100%;
        height: 60px;
        background-color: white;
        display: flex;
        justify-content: space-between;
    }

    header > div {
        display: flex;
        align-items: center;
        width: min-content;
    }

    .logContainer {
        padding: 4px 10px;
        display: flex;
        gap: 10px;
    }

    .signIn {
        background-color: var(--primary-login-background, green);
        font-size: 20px;
    }

    .signUp {
        background-color: var(--primary-btn-background, black);
        font-size: 20px;
    }

    .logo {
        width: min-content;
        flex-shrink: 0;
    }

    .logoIcon {
        height: 100%;
        align-self: center;
    }
</style>
<header>
    <div class="logo">
        <img class="logoIcon" src="src/assets/Logo.png"/></image>
        <h1>QuickBank</h1>
    </div>
    <div class="logContainer">
        <a class="signIn" href="src/views/sign_in.html">
            Sign in
        </a>
        <a class="signUp" href="src/views/sign_up.html">
            Sign up
        </a>
    </div>
</header>`;

class NavBar extends HTMLElement {
    constructor() {
        super();
    }
    connectedCallback () {
        const shadowRoot = this.attachShadow({mode: "open"});
        shadowRoot.appendChild(template.content.cloneNode(true))
        
    }
}

window.customElements.define("nav-bar", NavBar);