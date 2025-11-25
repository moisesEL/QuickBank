async function create_customer_xml (data) {
    let url = `/CRUDBankServerSide/webresources/customer`;
    let xml = `
        <customer>
            <city>${data.city}</city>
            <email>${data.email}</email>
            <firstName>${data.firstName}</firstName>
            <lastName>${data.lastName}</lastName>
            <middleInitial>${data.middleInitial}</middleInitial>
            <password>${data.password}</password>
            <phone>${data.phone}</phone>
            <state>${data.state}</state>
            <street>${data.street}</street>
            <zip>${data.zip}</zip>
        </customer>
    `
    return await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/xml'
        },
        body: xml
    })
}

export default create_customer_xml;