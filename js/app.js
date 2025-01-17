const API_BASE_URL = "http://localhost:8080/api";

// Hent leveringer
function fetchDeliveries() {
    fetch(`${API_BASE_URL}/deliveries`)
        .then(response => response.json())
        .then(data => {
            const list = document.getElementById("delivery-list");
            if (!list) return;
            list.innerHTML = ""; // Ryd eksisterende liste
            data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); // Sortér ældste først
            data.forEach(delivery => {
                const div = document.createElement("div");
                div.className = "delivery";
                div.innerHTML = `
                    <p>Levering til: ${delivery.adresse}</p>
                    <p>Status: ${delivery.drone ? (delivery.delivered ? "Leveret" : "Mangler levering") : "Mangler drone"}</p>
                    ${!delivery.drone ? `<button onclick="scheduleDrone(${delivery.id})">Tilknyt drone</button>` : ""}
                `;
                list.appendChild(div);
            });
        })
        .catch(error => console.error("Fejl ved hentning af leveringer:", error));
}


// Simuler oprettelse af levering
function simulateDelivery() {
    fetch(`${API_BASE_URL}/deliveries/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pizzaId: Math.floor(Math.random() * 100) + 1 }) // Eksempel på pizza-ID
    })
        .then(response => {
            if (!response.ok) throw new Error("Fejl ved oprettelse af levering");
            return response.json();
        })
        .then(data => {
            console.log("Levering oprettet:", data);
            fetchDeliveries(); // Opdater leveringslisten
        })
        .catch(error => console.error("Fejl:", error));
}

function scheduleDrone(deliveryId) {
    fetch(`http://localhost:8080/api/deliveries/schedule?id=${deliveryId}`, { method: "POST" })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(text); });
            }
            return response.text(); // Serverens respons som tekst
        })
        .then(data => {
            console.log("Server-respons:", data);
            showMessage(data); // Viser succesmeddelelse fra serverens svar
            fetchDeliveries(); // Opdater leveringslisten
        })
        .catch(error => {
            console.error("Fejl:", error);
            showMessage("Fejl ved tildeling af drone", true); // Viser fejlmeddelelse
        });
}

// Funktion til at vise en besked i UI'et
function showMessage(message, isError = false) {
    const messageDiv = document.getElementById("messages");
    if (!messageDiv) {
        console.error("Elementet med ID 'messages' findes ikke.");
        return;
    }
    messageDiv.textContent = message;
    messageDiv.className = `messages ${isError ? "error" : ""}`;
    messageDiv.style.display = "block";
    setTimeout(() => {
        messageDiv.style.display = "none";
    }, 3000);
}


function addDrone() {
    fetch("http://localhost:8080/api/drones/add", { method: "POST" })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(text); });
            }
            return response.json();
        })
        .then(data => {
            console.log("Drone oprettet:", data);
            showMessage(`Drone oprettet med UUID: ${data.serialUuid}`);
            fetchDeliveries(); // Opdater leveringslisten
        })
        .catch(error => {
            console.error("Fejl:", error);
            showMessage("Fejl ved oprettelse af drone", true);
        });
}


// Opdater liste hvert 60. sekund
setInterval(fetchDeliveries, 60000);
fetchDeliveries();
