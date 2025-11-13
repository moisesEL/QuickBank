async function create_customer (data) {
    let url = `/CRUDBankServerSide/webresources/customer`;
    return await fetch(url, {
        method: 'POST',
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
}

export default create_customer;