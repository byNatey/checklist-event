// Création d’une ligne
function createLine(title = "", note = "") {
    const div = document.createElement("div");
    div.className = "line";
    div.innerHTML = `
        <input class="line-title" placeholder="Titre de la ligne" value="${title}">
        <input class="line-note" placeholder="Note / détails" value="${note}">
        <button class="delete-line">🗑</button>
    `;
    div.querySelector(".delete-line").addEventListener("click", () => {
        div.remove();
        saveToLocal();
    });
    return div;
}

// Ajout de ligne
document.querySelectorAll(".add-line").forEach(btn => {
    btn.addEventListener("click", () => {
        const parent = btn.parentElement;
        parent.insertBefore(createLine(), btn);
        saveToLocal();
    });
});

// Sauvegarde locale
function saveToLocal() {
    const data = {};
    document.querySelectorAll(".subsection").forEach(sec => {
        const id = sec.id;
        data[id] = [];
        sec.querySelectorAll(".line").forEach(line => {
            data[id].push({
                title: line.querySelector(".line-title").value,
                note: line.querySelector(".line-note").value
            });
        });
    });
    localStorage.setItem("checklistData", JSON.stringify(data));
}

// Chargement local
function loadFromLocal() {
    const raw = localStorage.getItem("checklistData");
    if (!raw) return;
    const data = JSON.parse(raw);

    for (const id in data) {
        const sec = document.getElementById(id);
        if (!sec) continue;
        const addBtn = sec.querySelector(".add-line");
        sec.querySelectorAll(".line").forEach(l => l.remove());
        data[id].forEach(item => {
            const line = createLine(item.title, item.note);
            sec.insertBefore(line, addBtn);
        });
    }
}

loadFromLocal();

// Navigation latérale
document.querySelectorAll(".sidebar button[data-target]").forEach(btn => {
    btn.addEventListener("click", () => {
        const target = document.getElementById(btn.dataset.target);
        if (target) {
            target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    });
});

// Synchro GitHub
async function syncToGitHub() {
    const token = localStorage.getItem("githubToken");
    if (!token) {
        alert("Aucun token GitHub enregistré.");
        return;
    }

    const data = localStorage.getItem("checklistData") || "{}";

    const repo = "bynatey/checklist-event";
    const path = "data.json";

    const getFile = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
        headers: { Authorization: `token ${token}` }
    });

    const fileInfo = await getFile.json();

    await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
        method: "PUT",
        headers: {
            Authorization: `token ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            message: "Mise à jour checklist",
            content: btoa(unescape(encodeURIComponent(data))),
            sha: fileInfo.sha
        })
    });

    document.getElementById("syncStatus").textContent = "Synchronisation réussie !";
}

document.getElementById("syncNowBtn").addEventListener("click", syncToGitHub);

document.getElementById("saveTokenBtn").addEventListener("click", () => {
    const token = document.getElementById("githubToken").value;
    localStorage.setItem("githubToken", token);
    alert("Token enregistré !");
});

// Mode sombre
document.getElementById("darkModeBtn").addEventListener("click", () => {
    document.body.classList.toggle("light");
});

// Reset
document.getElementById("resetBtn").addEventListener("click", () => {
    if (confirm("Réinitialiser toute la checklist ?")) {
        localStorage.removeItem("checklistData");
        location.reload();
    }
});

// PDF (simple impression)
document.getElementById("pdfBtn").addEventListener("click", () => {
    window.print();
});

// Sauvegarde automatique sur changement
document.addEventListener("input", (e) => {
    if (e.target.classList.contains("line-title") || e.target.classList.contains("line-note")) {
        saveToLocal();
    }
});
