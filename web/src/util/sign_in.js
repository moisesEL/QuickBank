function validarSignIn(event) {
        try {
            //De aqui obtenemos los objetos para los elementos del form
            const tfEmail = document.getElementById("tfEmail");
            const tfPassword = document.getElementById("tfPassword");
            const signInForm = document.getElementById("signInForm");

            // Detenemos la propagación de eventos y la acción por defecto del formulario como dijo javi
            event.preventDefault();
            event.stopPropagation();
                    
            // Validar que email y password están informados
            if (tfEmail.value.trim() === "" || tfPassword.value.trim() === "") {
                throw new Error("Los campos están vacíos.");
            }
                   
            // Validar longitud del email
            if (tfEmail.value.length > 255) {
                throw new Error("El email demasiado largo");
            }
                    
            // Validar formato del email con la nueva expresión regular 
            const emailRegExp = new RegExp("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,255}$");
            if (!emailRegExp.exec(tfEmail.value.trim())) {
                throw new Error("El email no tiene el formato");
            }
            // validar longitud del password
            if (tfPassword.value.length>255)
                throw new Error("Password demasiado largo.");
     
         // Con esto llamar a la función para enviar datos 
            sendRequestAndProcessResponse();
        } catch (error) {
            // Mostramos mensaje de error en la pantalla
            const msgBox = document.getElementById("responseMsg");
            msgBox.className = 'error';
            msgBox.textContent = 'Error: ' + error.message;
            msgBox.style.display = 'block';
        }
    }

    
     // Envía una petición GET y procesa la respuesta en formato JSON.
    
    function sendRequestAndProcessResponse() {
        const signInForm = document.getElementById("signInForm");
        const msgBox = document.getElementById("responseMsg");
        const tfEmail = document.getElementById("tfEmail");
        const tfPassword = document.getElementById("tfPassword");
        
        const valueTfEmail = tfEmail.value.trim();
        const valueTfPassword = tfPassword.value.trim();

        // Petición Fetch usando JSON
        fetch(
            signInForm.action +
            `${encodeURIComponent(valueTfEmail)}/${encodeURIComponent(valueTfPassword)}`,
            {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            }
        )
        .then(response => {
            if (response.status === 401) {
                    throw new Error('El usuario y/o la contraseña son incorrectos.');
            } else if (response.status === 500) {
                    throw new Error('Error en el servidor. Intente más tarde.');
            } else if (!response.ok) {
                    throw new Error('Error inesperado.');
            }
                        
            return response.json();
        })
        .then(data => {
             // Aquí guardamos los datos en la sessionStorage
            sessionStorage.setItem("customer.id", data.id);
            sessionStorage.setItem("customer.firstName", data.firstName);
            sessionStorage.setItem("customer.lastName", data.lastName);
            sessionStorage.setItem("customer.middleInitial", data.middleInitial);
            sessionStorage.setItem("customer.street", data.street);
            sessionStorage.setItem("customer.city", data.city);
            sessionStorage.setItem("customer.state", data.state);
            sessionStorage.setItem("customer.zip", data.zip);
            sessionStorage.setItem("customer.phone", data.phone);
            sessionStorage.setItem("customer.email", data.email);
            sessionStorage.setItem("customer.password", data.password);
        
            window.location.replace("./change_password.html") ;
        })
        .catch(error => {
            // Mensaje de error
            msgBox.className = 'error';
            msgBox.textContent = 'Error: ' + error.message;
            msgBox.style.display = 'block';
        });
    }