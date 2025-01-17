const API_BASE_URL = "http://localhost:8080/api";

// Vis besked i UI
function showMessage(message, isError = false) {
    const messageDiv = document.getElementById("messages");
    if (!messageDiv) return;
    messageDiv.textContent = message;
    messageDiv.className = `messages ${isError ? "error" : "success"}`;
    messageDiv.style.display = "block";
    setTimeout(() => {
        messageDiv.style.display = "none";
    }, 3000);
}

// Hent leveringer fra backend og opdater UI
function fetchDeliveries() {
    fetch(`${API_BASE_URL}/deliveries`)
        .then((response) => {
            if (!response.ok) throw new Error("Fejl ved hentning af leveringer");
            return response.json();
        })
        .then((deliveries) => {
            renderDeliveries(deliveries);
        })
        .catch((error) => {
            console.error("Fejl:", error);
            showMessage("Kunne ikke hente leveringer", true);
        });
}

// Render leveringer i UI
function renderDeliveries(deliveries) {
    const list = document.getElementById("delivery-list");
    if (!list) return;

    list.innerHTML = ""; // Ryd listen

    deliveries
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)) // Sortér efter ældste
        .forEach((delivery) => {
            const div = document.createElement("div");
            div.className = "delivery";

            div.innerHTML = `
        <p>
          <strong>Adresse:</strong>
          <i class="fas fa-map-marker-alt" style="color: red;"></i> ${delivery.adresse || "Ukendt adresse"}
        </p>
        <p><strong>Status:</strong> ${
                delivery.drone
                    ? delivery.delivered
                        ? "Leveret"
                        : "Mangler levering"
                    : "Mangler drone"
            }</p>
        ${
                !delivery.drone
                    ? `<button onclick="scheduleDrone(${delivery.id})">Tilknyt drone</button>`
                    : delivery.drone && !delivery.delivered
                        ? `<button onclick="markAsDelivered(${delivery.id})">Afslut levering</button>`
                        : ""
            }
      `;

            list.appendChild(div);
        });
}

// Simuler oprettelse af levering
function simulateDelivery() {
    fetch(`${API_BASE_URL}/deliveries/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pizzaId: Math.floor(Math.random() * 100) + 1 }),
    })
        .then((response) => {
            if (!response.ok) throw new Error("Fejl ved oprettelse af levering");
            return response.json();
        })
        .then((data) => {
            console.log("Levering oprettet:", data);
            showMessage("Levering oprettet!");
            fetchDeliveries(); // Opdater listen
        })
        .catch((error) => {
            console.error("Fejl:", error);
            showMessage("Kunne ikke oprette levering", true);
        });
}

// Tilknyt drone til levering
function scheduleDrone(deliveryId) {
    fetch(`${API_BASE_URL}/deliveries/schedule?id=${deliveryId}`, { method: "POST" })
        .then((response) => {
            if (!response.ok) {
                return response.text().then((text) => {
                    throw new Error(text);
                });
            }
            return response.text();
        })
        .then((data) => {
            console.log("Server-respons:", data);
            showMessage(data); // Vis serverens besked
            fetchDeliveries(); // Opdater listen
        })
        .catch((error) => {
            console.error("Fejl:", error);
            showMessage("Fejl ved tildeling af drone", true);
        });
}

// Marker levering som afsluttet
function markAsDelivered(deliveryId) {
    fetch(`${API_BASE_URL}/deliveries/markDelivered?id=${deliveryId}`, { method: "POST" })
        .then((response) => {
            if (!response.ok) throw new Error("Fejl ved afslutning af levering");
            return response.text();
        })
        .then((data) => {
            console.log("Levering afsluttet:", data);
            showMessage("Levering afsluttet!");
            fetchDeliveries(); // Opdater listen
        })
        .catch((error) => {
            console.error("Fejl:", error);
            showMessage("Fejl ved afslutning af levering", true);
        });
}

// Opret en ny drone
function addDrone() {
    fetch(`${API_BASE_URL}/drones/add`, { method: "POST" })
        .then((response) => {
            if (!response.ok) {
                return response.text().then((text) => {
                    throw new Error(text);
                });
            }
            return response.json();
        })
        .then((data) => {
            console.log("Drone oprettet:", data);
            showMessage(`Drone oprettet med UUID: ${data.serialUuid}`);
            fetchDeliveries(); // Opdater listen
        })
        .catch((error) => {
            console.error("Fejl:", error);
            showMessage("Kunne ikke oprette drone", true);
        });
}

// Opdater leveringslisten hvert 60. sekund
setInterval(fetchDeliveries, 60000);
fetchDeliveries();

// Event listeners til knapper
document.getElementById("add-drone-btn").addEventListener("click", addDrone);
document.getElementById("simulate-delivery-btn").addEventListener("click", simulateDelivery);


fetch("http://localhost:8080/api/deliveries/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        pizzaId: 2,
        address: "Nørrebrogade 123, 2200 København"
    })
})
    .then(response => response.json())
    .then(data => {
        console.log("Levering oprettet:", data);
    })
    .catch(error => console.error("Fejl:", error));


