/*export default function authHeader() {
    let token = sessionStorage.getItem('token');

    let headers = {
        "Content-Type": "application/json", // Type de contenu
    };

    if (token) {
        headers["Authorization"] = token; // Ajoute le token si disponible
    }
    headers["Access-Control-Allow-Origin"] = "*"; // Permet les requêtes cross-origin
    headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"; // Méthodes autorisées
    headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"; // En-têtes autorisés
    return headers;
}*/




export default function authHeader() {

    let token = sessionStorage.getItem('token');

    if (token) {
        return { Authorization: token };
    } else {
        return {};
    }
}

/*
export default function authHeader() {
    let token = sessionStorage.getItem('token');

    let headers = {
        "Access-Control-Allow-Origin": "*", // Permet les requêtes cross-origin
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
    };

    if (token) {
        headers["Authorization"] = token;
    }

    return headers;
}
*/


