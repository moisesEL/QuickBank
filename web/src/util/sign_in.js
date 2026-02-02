const url = "/CRUDBankServerSide/webresources/customer/sigin/";
async function sign_in(Email, Password) {
const valueEmail = Email.value.trim();
const valuePassword = Password.value.trim();
    // Aquí devolvemos la promesa del fetch (no hace falta try/catch)
    return fetch(
        url + 
        `${encodeURIComponent(valueEmail)}/${encodeURIComponent(valuePassword)}`,
        {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        }
        })
}
window.addEventListener("DOMContentLoaded", () => {
    const msgBox = document.getElementById("responseMsg");
    const Email = document.getElementById("Email");
    const Password = document.getElementById("Password");

    document.getElementById("form").addEventListener("submit", validarSignIn);
    //Rellena automaticamente el input email si existe una correo guardado
    const storedEmail = sessionStorage.getItem("customer.email");
        if(storedEmail){
            Email.removeAttribute("autofocus");
            document.activeElement.blur();
            Password.focus();
            Email.value = storedEmail;
        }
    function validarSignIn(event) {
        event.preventDefault();
        event.stopPropagation();

        try{
            // Validar que email y password no esten vacios
            if (Email.value.trim() === "" || Password.value.trim() === "")
                throw new Error("Email and password input must be filled.");
            
                // Expresión regular para validar el email
            const emailRegExp = new RegExp(/^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/ );
            if (!emailRegExp.test(Email.value.trim())) {
            throw new Error("Email has not a valid format.");
            }
                
            // Validar longitud del email y password
            if (Email.value.length > 255)
                throw new Error("Email cannot have more than 255 characters");
                        
            if (Password.value.length > 20)
                throw new Error("Password cannot have more than 20 characters");

            // Llama a la función para enviar datos y procesar respuesta
            sign_in(Email, Password) 

            .then(response => {
                if (response.status === 401) {
                throw new Error('The username and/or password are incorrect.');
                } else if (response.status === 500) {
                throw new Error('Server error. Please try again later.');
                } else if (!response.ok) {
                throw new Error('Unexpected error.');
                }
                return response.json(); // si todo va bien, convertimos la respuesta
            })                    
            .then(data => {
            // Guardamos los datos en el sessionStorage
                sessionStorage.setItem("customer.id", data.id);
                sessionStorage.setItem("customer.firstName", data.firstName);
                sessionStorage.setItem("customer.lastName", data.lastName);
                sessionStorage.setItem("customer.middleInitial", data.middleInitial);
                sessionStorage.setItem("customer.email", data.email);
                sessionStorage.setItem("customer.phone", data.phone);
                sessionStorage.setItem("customer.street", data.street);
                sessionStorage.setItem("customer.city", data.city);
                sessionStorage.setItem("customer.state", data.state);
                sessionStorage.setItem("customer.zip", data.zip);
                sessionStorage.setItem("customer.password", data.password);

                window.location.replace("/QuickBank/src/views/profile.html");
            })
            .catch(error => {
                // Mostrar mensaje de error
                msgBox.className = 'error';
                msgBox.textContent = 'Error: ' + error.message;
                msgBox.style.display = 'block';
            });
        } catch (error) {
            msgBox.className = "error";
            msgBox.textContent = "Error: " + error.message;
            msgBox.style.display = "block";
        }
    }
})
