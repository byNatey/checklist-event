// Structure initiale basée sur exemple.pdf
const initialData = {
    sec1A: [
        ["Nombre de Nintendo Switch disponibles", "Ex : 3 consoles"],
        ["Jeux disponibles (Mario Kart, Smash, etc.)", "Liste des jeux"],
        ["Projecteurs à emprunter", "Ex : 2 projecteurs"],
        ["Manettes disponibles (2 par Switch minimum)", "Ex : 6 manettes"],
        ["Multiprises & rallonges", "Quantité / emplacement"],
        ["Écrans / murs de projection disponibles", "Salle / emplacement"]
    ],
    sec1B: [
        ["Local attribué pour la LAN", "Nom / numéro du local"],
        ["Organisation de l'installation (qui fait quoi)", "Responsables installation"],
        ["Organisation du rangement", "Responsables rangement"],
        ["Sécurisation des câbles au sol (ruban adhésif)", "Zones à sécuriser"],
        ["Ventilation du local (projecteurs qui chauffent)", "Fenêtres / portes / ventilateurs"],
        ["Format : tournoi ou free-play", "Ex : tournoi Mario Kart"]
    ],
    sec2A: [
        ["Matériel pour le bar (table, nappes, gobelets, serviettes)", "Détails du bar"],
        ["Frigo / glacière disponible", "Qui apporte ?"],
        ["Boissons prévues (softs ou alcool)", "Liste des boissons"],
        ["Enceintes (Bluetooth ou système plus puissant)", "Qui prête ?"],
        ["Lumières (LED, spots, guirlandes)", "Type de lumières"],
        ["Tente / abri (si disponible)", "Disponibilité / taille"],
        ["Accès à l'électricité extérieure", "Emplacement de la prise"],
        ["Rallonges longues & multiprises", "Quantité / longueur"]
    ],
    sec2B: [
        ["Organisation du bar", "Qui fait quoi ?"],
        ["Sécurité / circulation", "Zones / consignes"],
        ["Gestion des déchets", "Sacs, poubelles, tri"],
        ["Planning des bénévoles", "Créneaux / rôles"]
    ],
    sec3LAN_A: [
        ["Alimentation électrique (prises disponibles)", "Emplacements / quantité"],
        ["Câblage HDMI / USB-C / adaptateurs", "Liste des câbles nécessaires"],
        ["Écrans / projecteurs", "Quantité / emplacement"]
    ],
    sec3LAN_B: [
        ["Installation du matériel (ordre, câblage, sécurité)", "Responsables / étapes"],
        ["Rangement et inventaire du matériel", "Qui range quoi ?"]
    ],
    sec3LAN_C: [
        ["Ruban adhésif pour sécuriser les câbles", "Zones à sécuriser"],
        ["Chiffons pour nettoyer les tables", "Quantité"],
        ["Powerbanks / chargeurs", "Besoin estimé"]
    ],
    sec3PARK_A: [
        ["Système son (enceintes, câbles, alimentation)", "Type / puissance"],
        ["Lumières (LED, spots, guirlandes)", "Liste du matériel"],
        ["Accès à l'électricité extérieure", "Emplacement de la prise"]
    ],
    sec3PARK_B: [
        ["Installation du matériel (son, lumière, bar)", "Responsables / étapes"],
        ["Sécurité (circulation, zones interdites)", "Détails sécurité"]
    ],
    sec3PARK_C: [
        ["Lampes LED portables", "Quantité / emplacement"],
        ["Rubalise pour délimiter les zones", "Zones à baliser"],
        ["Sacs poubelles", "Quantité / détails"]
    ],
    sec3GEN_A: [
        ["Extincteur disponible", "Emplacement"],
        ["Multiprises supplémentaires", "Quantité"]
    ],
    sec3GEN_B: [
        ["Planning d'installation", "Heures / responsables"],
        ["Transport du matériel", "Qui transporte quoi ?"]
    ],
    sec3GEN_C: [
        ["Chargeurs divers", "Type / quantité"],
        ["Eau pour les bénévoles", "Quantité / emplacement"]
    ]
};

const REPO = "bynatey/checklist-event";
const PATH = "data.json";
const LS_KEY_DATA = "checklist_cisc";
const LS_KEY_TOKEN = "checklist_token";
const LS_KEY_THEME = "checklist_theme";

// Création d'une ligne (avec suppression)
function createLine(sectionId, title, sub, checked = false) {
    const line = document.createElement("div");
    line.className = "checkline";

    const box = document.createElement("span");
    box.className = "checkbox";
    box.dataset.state = checked ? "1" : "0";
    box.textContent = checked ? "☒" : "☐";

    box.addEventListener("click", () => {
        box.dataset.state = box.dataset.state === "1" ? "0" : "1";
        box.textContent = box.dataset.state === "1" ? "☒" : "☐";
        saveState();
    });

    const textWrap = document.createElement("div");
    textWrap.className = "line-text";

    const t = document.createElement("div");
    t.className = "line-title";
    t.textContent = title;

    const s = document.createElement("div");
    s.className = "line-sub";
    s.textContent = sub || "";

    textWrap.appendChild(t);
    textWrap.appendChild(s);

    const del = document.createElement("button");
    del.className = "delete-line";
    del.textContent = "🗑";
    del.addEventListener("click", () => {
        line.remove();
        saveState();
    });

    line.appendChild(box);
    line.appendChild(textWrap);
    line.appendChild(del);

    return line;
}

// Rendu depuis un objet de données
function renderFromData(data) {
    Object.keys(initialData).forEach(id => {
        const container = document.getElementById(id);
        if (!container) return;
        container.innerHTML = "";
        const lines = (data && data[id]) || initialData[id].map(([title, sub]) => ({
            title,
            sub,
            checked: false
        }));
        lines.forEach(item => {
            container.appendChild(createLine(id, item.title, item.sub, item.checked));
        });
    });
}

// Sauvegarde locale
function saveState() {
    const result = {};
    Object.keys(initialData).forEach(id => {
        const container = document.getElementById(id);
        if (!container) return;
        result[id] = [];
        container.querySelectorAll(".checkline").forEach(line => {
            const box = line.querySelector(".checkbox");
            const title = line.querySelector(".line-title").textContent;
            const sub = line.querySelector(".line-sub").textContent;
            result[id].push({
                title,
                sub,
                checked: box.dataset.state === "1"
            });
        });
    });
    localStorage.setItem(LS_KEY_DATA, JSON.stringify(result));
}

// Chargement local
function loadLocalState() {
    const raw = localStorage.getItem(LS_KEY_DATA);
    if (!raw) {
        renderFromData(null);
        return;
    }
    try {
        const data = JSON.parse(raw);
        renderFromData(data);
    } catch {
        renderFromData(null);
    }
}

// Synchro descendante depuis GitHub (si token présent)
async function loadFromGitHubIfPossible() {
    const token = localStorage.getItem(LS_KEY_TOKEN);
    if (!token) {
        // Pas de token → on reste sur localStorage
        return;
    }
    try {
        const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${PATH}`, {
            headers: { Authorization: `token ${token}` }
        });
        if (!res.ok) return;
        const file = await res.json();
        if (!file.content) return;
        const decoded = decodeURIComponent(escape(atob(file.content)));
        const data = JSON.parse(decoded);
        renderFromData(data);
        localStorage.setItem(LS_KEY_DATA, JSON.stringify(data));
        const status = document.getElementById("syncStatus");
        if (status) status.textContent = "Données chargées depuis GitHub.";
    } catch (e) {
        console.error("Erreur synchro descendante :", e);
    }
}

// Ajout de ligne
document.querySelectorAll(".add-line").forEach(btn => {
    btn.addEventListener("click", () => {
        const targetId = btn.dataset.target;
        const container = document.getElementById(targetId);
        if (!container) return;

        const title = prompt("Titre de la ligne :");
        if (!title) return;
        const sub = prompt("Sous-texte (optionnel) :") || "";

        const line = createLine(targetId, title, sub, false);
        container.appendChild(line);
        saveState();
    });
});

// Boutons header
document.getElementById("resetBtn").addEventListener("click", () => {
    if (!confirm("Réinitialiser toute la checklist ?")) return;
    localStorage.removeItem(LS_KEY_DATA);
    loadLocalState();
});

document.getElementById("darkModeBtn").addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem(LS_KEY_THEME, document.body.classList.contains("dark") ? "dark" : "light");
});

document.getElementById("pdfBtn").addEventListener("click", () => {
    window.print();
});

// Thème au chargement
(function initTheme() {
    const t = localStorage.getItem(LS_KEY_THEME);
    if (t === "dark") document.body.classList.add("dark");
})();

// Enregistrer token
document.getElementById("saveTokenBtn").addEventListener("click", () => {
    const token = document.getElementById("githubToken").value.trim();
    if (!token) {
        alert("Token vide.");
        return;
    }
    localStorage.setItem(LS_KEY_TOKEN, token);
    alert("Token enregistré.");
});

// Synchro montante vers GitHub
document.getElementById("syncNowBtn").addEventListener("click", async () => {
    const token = localStorage.getItem(LS_KEY_TOKEN);
    if (!token) {
        alert("Aucun token enregistré.");
        return;
    }

    const data = localStorage.getItem(LS_KEY_DATA) || "{}";

    try {
        const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${PATH}`, {
            headers: { Authorization: `token ${token}` }
        });
        const file = await res.json();

        const putRes = await fetch(`https://api.github.com/repos/${REPO}/contents/${PATH}`, {
            method: "PUT",
            headers: {
                Authorization: `token ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: "Mise à jour checklist CISC",
                content: btoa(unescape(encodeURIComponent(data))),
                sha: file.sha
            })
        });

        const status = document.getElementById("syncStatus");
        if (!putRes.ok) {
            if (status) status.textContent = "Erreur de synchronisation.";
            throw new Error("Erreur API GitHub");
        }

        if (status) status.textContent = "Synchronisation réussie.";
    } catch (e) {
        const status = document.getElementById("syncStatus");
        if (status) status.textContent = "Erreur de synchronisation.";
        console.error(e);
    }
});

// Init : d'abord local, puis GitHub si possible
(async function init() {
    loadLocalState();
    await loadFromGitHubIfPossible();
})();
