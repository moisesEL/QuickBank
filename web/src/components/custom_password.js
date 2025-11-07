const template = document.createElement("template");
template.innerHTML = `
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <style>
        input {
            min-height: 20px;
            border-radius: 6px;
            border: none;
            padding: 3px 5px;
            color: var(--secondary-text-color);
            background-color: var(--secondary-background);
            font-size: 1em;
            transition: all 0.3s ease;
        }
        #input-wrapper {
            display: grid;
            grid-template-columns: 1fr 0px;
        }
        button {
            cursor: pointer;
            position: relative;
            top: 0px;
            left: -26.5px;
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
        .input_error {
            border: 2px solid var(--error-border-color);
        }
    </style>
    <div id="input-wrapper">
        <input type="password"/>
        <button id="visibility_button"><i class="material-icons" id="visibility_icon">visibility</i></button>
    </div>
`;
class Password extends HTMLElement {
    constructor() {
        super();
        this.root = this.attachShadow({mode: "open"})
        this.root.appendChild(template.content.cloneNode(true))
        
        this.password = this.root.querySelector("input")
        this.visibility_icon = this.root.getElementById("visibility_icon")
        this.visibility_button = this.root.getElementById("visibility_button")

        // toggle visibility on click
        this.visibility_button.addEventListener("click", () => {
            this.toggleVisibility();
        })
        // toggle visibility on enter or space
        this.visibility_button.addEventListener("keydown", (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                this.toggleVisibility();
            }
        });

        this.password.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                const form = this.closest('form');
                if (form) {
                    form.dispatchEvent(new Event('submit', { cancelable: true }));
                }
            }
        });
    }

    toggleVisibility() {
        if (this.visibility_icon.innerHTML === 'visibility') {
            this.visibility_icon.innerHTML = 'visibility_off';
            this.password.setAttribute("type", "text")
        }
        else {
            this.visibility_icon.innerHTML = 'visibility';
            this.password.setAttribute("type", "password")
        }
    }

    static get observedAttributes() {
        return ['placeholder', 'name', 'id', 'class'];
    }
    
    attributeChangedCallback(attrName, oldVal, newVal) {
        if (attrName.toLowerCase() === 'name') {
            this.password.setAttribute('name', newVal);
        }
        if (attrName.toLowerCase() === 'placeholder') {
            this.password.setAttribute('placeholder', newVal);
        }
        if (attrName.toLowerCase() === 'id') {
            this.password.setAttribute('id', newVal);
        }
        if (attrName.toLowerCase() === 'class') {
            this.password.setAttribute('class', newVal);
        }
    }

    get value() {
        return this.password.value;
    }

    get name() {
        return this.password.getAttribute('name');
    }

    get id() {
        return this.password.id;
    }

    set id(value) {
        this.password.setAttribute('id', value);
    }

    get class() {
        return this.password.className;
    }

    set class(value) {
        this.password.setAttribute('className', value);
    }
}

window.customElements.define("custom-password", Password);
