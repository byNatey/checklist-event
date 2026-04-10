function createLine(title = "", note = "") {
    const div = document.createElement("div");
    div.className = "line";
    div.innerHTML = `
        <input class="line-title" value="${title}" placeholder="Titre">
        <input class="line-note" value="${note}" placeholder="Note">
        <button class="delete-line">🗑</button>
    `;
    div.querySelector(".delete-line").onclick = () => {
        div.remove();
        save();
    };
    return div;
}

document.querySelectorAll(".add-line").forEach(btn => {
    btn.onclick = () => {
        const target = document.getElementById(btn.dataset.target);
        target.appendChild(createLine());
        save();
    };
});

function save() {
    const data = {};
    document.querySelectorAll(".subsection").forEach(sec => {
        data[sec.id] = [];
        sec.querySelectorAll(".line").forEach(line => {
            data[sec.id].push({
                title: line.querySelector(".line-title").value,
                note: line.querySelector(".line-note").value
            });
        });
    });
    localStorage.setItem("checklist", JSON.stringify(data));
}

function load() {
    const raw = localStorage.getItem("checklist");
    if (!raw) return;
    const data = JSON.parse(raw);
    for (const id in data) {
        const sec = document.getElementById(id);
        if (!sec) continue;
        sec.innerHTML = "";
        data[id].forEach(item => {
            sec.appendChild(createLine(item.title, item.note));
        });
    }
}

load();

document.getElementById("resetBtn").onclick = () => {
    if (confirm("Réinitialiser ?")) {
        localStorage.removeItem("checklist");
        location.reload();
    }
};

document.getElementById("darkModeBtn").onclick = () => {
    document.body.classList.toggle("dark");
};

document.getElementById("pdfBtn").onclick = () => window.print();

document.getElementById("saveTokenBtn").onclick = () => {
    localStorage.setItem("token", document.getElementById("githubToken").value);
};

document.getElementById("syncNowBtn").onclick = async () => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Aucun token");

    const data = localStorage.getItem("checklist");
    const repo = "bynatey/checklist-event";
    const path = "data.json";

    const res = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
        headers: { Authorization: `token ${token}` }
    });
    const file = await res.json();

    await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
        method: "PUT",
        headers: { Authorization: `token ${token}` },
        body: JSON.stringify({
            message: "update",
            content: btoa(unescape(encodeURIComponent(data))),
            sha: file.sha
        })
    });

    document.getElementById("syncStatus").textContent = "Synchronisé !";
};
