const footerTemplate = document.createElement("template");
footerTemplate.innerHTML = `
<style>
    @import url('https://fonts.googleapis.com/css2?family=Kode+Mono&display=swap');
    footer {
        color: var(--white);
        background-color: var(--footer-background);
        text-align: center;
        padding: 20px 10px;
        font-family: 'Kode Mono', monospace;
        border-top: 1px solid var(--border-color);
        width: 100%;
        box-sizing: border-box;
    }
</style>

<footer>
    <p>© 2025 QuickBank. Todos los derechos reservados.</p>
</footer>
`;

class Footer extends HTMLElement {
    constructor() {
        super();
       this.root = this.attachShadow({mode: "open"});
        this.root.appendChild(footerTemplate.content.cloneNode(true))
    }
}

window.customElements.define("main-footer", Footer);
