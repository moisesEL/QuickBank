// This is a custom web component that wraps around a password input to
// dinamically change it's type attribute between "text" and "password".
// To use it, you have to add <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
// and <script type="module" src="<PATH>/custom_password.js"></script> in the head element of your html
// then wrap each SINGULAR password input between the custom-password element.
// Example: <custom-password> <input type="password" name="password"> </custom-password>

const customPasswordTemplate = document.createElement("template");
customPasswordTemplate.innerHTML = `
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <style>
        div {
            display: grid;
            grid-template-columns: 100% 0px;
        }
        button {
            cursor: pointer;
            position: relative;
            top: 1px;
            left: -24px;
            border-radius: 6px;
            color: var(--secondary-text-color);
            border: none;
            background: none;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
    </style>
    <div>
        <slot></slot>
        <button id="visibility_button" aria-label="Show password" aria-pressed="false">
            <i class="material-icons" id="visibility_icon">visibility</i>
        </button>
    </div>
`;
class Password extends HTMLElement {
    constructor() {
        super();
        this.root = this.attachShadow({mode: "open"})
        this.root.appendChild(customPasswordTemplate.content.cloneNode(true))
    }
    
    connectedCallback() {
        this.passwordWrapper = this.root.querySelector("slot");
        this.visibility_icon = this.root.getElementById("visibility_icon")
        this.visibility_button = this.root.getElementById("visibility_button")

        this.passwordWrapper.addEventListener('slotchange', () => {
            this.password = this.passwordWrapper.assignedNodes()[1];
            if (this.password) {
                // toggle visibility on click
                this.visibility_button.addEventListener("click", (event) => {
                    event.preventDefault();
                    this.toggleVisibility();
                })
    
                // toggle visibility on enter or space
                this.visibility_button.addEventListener("keydown", (event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        this.toggleVisibility();
                    }
                });
            }
        });
    }

    toggleVisibility() {
        if (this.visibility_icon.innerHTML === 'visibility') {
            this.visibility_icon.innerHTML = 'visibility_off';
            this.visibility_button.setAttribute('aria-pressed', 'true');
            this.password.setAttribute("type", "text")
        }
        else {
            this.visibility_icon.innerHTML = 'visibility';
            this.visibility_button.setAttribute('aria-pressed', 'false');
            this.password.setAttribute("type", "password")
        }
    }
}

window.customElements.define("custom-password", Password);
