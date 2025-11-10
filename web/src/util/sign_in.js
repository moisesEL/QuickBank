async function sendRequestAndProcessResponse(Email, Password, form, msgBox) {
    const valueEmail = Email.value.trim();
    const valuePassword = Password.value.trim();

        // Aquí devolvemos la promesa del fetch (no hace falta try/catch)
        return fetch(
            form.action + 
            `${encodeURIComponent(valueEmail)}/${encodeURIComponent(valuePassword)}`,
            {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
            }
        )
        
        
    }

export default sendRequestAndProcessResponse;