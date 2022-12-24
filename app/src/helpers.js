import { auth } from "./firebase";

const API = 'https://server-sucaufqy2a-uc.a.run.app'

/**
 * Function to fetch data from your API
 */

export async function fetchFromAPI(endpointURL, opts) {
    // Set defaults, then overwrite with any options passed in using destructuring
    const { method, body } = { method: 'POST', body: null, ...opts }
    
    // Authentication
    const user = auth.currentUser;

    const token = user && (await user.getIdToken());

    const res = await fetch(`${API}/${endpointURL}`, {
        method,
        ...(body && { body: JSON.stringify(body) }),
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    })
    return res.json();
}