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
        #visibility_icon {
            cursor: pointer;
            position: relative;
            top: 0px;
            left: -26.5px;
            border-radius: 6px;
            color: var(--secondary-text-color);
        }
    </style>
    <div id="input-wrapper">
        <input type="password"/>
        <i class="material-icons" id="visibility_icon">visibility</i>
    </div>
`;
class Password extends HTMLElement {
    constructor() {
        super();
        this.root = this.attachShadow({mode: "open"})
        this.root.appendChild(template.content.cloneNode(true))
        
        this.password = this.root.querySelector("input")
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

    static get observedAttributes(){
        return ['placeholder', 'name'];
    }
    
    attributeChangedCallback(attrName, oldVal, newVal) {
        if (attrName.toLowerCase() === 'name') {
            this.password.setAttribute('name', newVal);
        }
        if (attrName.toLowerCase() === 'placeholder') {
            this.password.setAttribute('placeholder', newVal);
        }
    }
}

window.customElements.define("custom-password", Password);