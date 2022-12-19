const API = 'http://localhost:3333';

/**
 * Function to fetch data from your API
 */

export async function fetchFromAPI(endpointURL, opts) {
    // Set defaults, then overwrite with any options passed in using destructuring
    const { method, body } = { method: 'POST', body: null, ...opts }
    const res = await fetch(`${API}/${endpointURL}`, {
        method,
        ...(body && { body: JSON.stringify(body) }),
        headers: {
            'Content-Type': 'application/json',
        },
    })
    return res.json();
}