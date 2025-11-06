const template = document.createElement("template");
template.innerHTML = `
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <style>
        label {
            padding: 0px 0px 0px 2px;
            font-size: 1em;
            color: var(--primary-text-color);
        }
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
        #password {
            width: calc(100% - 10px);
        }
        #visibility_icon {
            cursor: pointer;
            position: relative;
            top: 0px;
            left: -26.5px;
            border-radius: 6px;
            color: var(--secondary-text-color);
        }
    </style>
    <div>
        <label for="password" id="password-label">Password:</label>
        <div id="input-wrapper">
            <input type="password" id="password" name="password"/>
            <i class="material-icons" id="visibility_icon">visibility</i>
        </div>
    </div>
`;
class Password extends HTMLElement {
    constructor() {
        super();
        this.root = this.attachShadow({mode: "open"})
        this.root.appendChild(template.content.cloneNode(true))
        
        this.label = this.root.getElementById("password-label")
        this.password = this.root.getElementById("password")
        this.visibility_icon = this.root.getElementById("visibility_icon")
        this.visibility_icon.addEventListener("click", (event) => {
            if (this.visibility_icon.innerHTML === 'visibility') {
                this.visibility_icon.innerHTML = 'visibility_off';
                this.password.setAttribute("type", "text")
            }
            else {
                this.visibility_icon.innerHTML = 'visibility';
                this.password.setAttribute("type", "password")
            }
        })
    }
    connectedCallback () {
        
    }
    static get observedAttributes(){
        return ['label', 'placeholder'];
    }
    
    attributeChangedCallback(attrName, oldVal, newVal) {
        if (attrName.toLowerCase() === 'label') {
            this.label.innerHTML = newVal;
        }
        if (attrName.toLowerCase() === 'placeholder') {
            this.password.setAttribute('placeholder', newVal);
        }
    }
}

window.customElements.define("custom-password", Password);