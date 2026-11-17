// Assignment: dynamic CMS comparison table generated from external JSON.
const tableBody = document.getElementById("cms-table-body");
const status = document.getElementById("cms-status");

function addTextCell(row, content) {
    const cell = document.createElement("td");
    cell.textContent = content;
    row.appendChild(cell);
    return cell;
}

function addLink(parent, label, url) {
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = label;
    parent.appendChild(link);
}

function addListCell(row, items) {
    const cell = document.createElement("td");
    const list = document.createElement("ul");
    for (const item of items) {
        const li = document.createElement("li");
        li.textContent = item;
        list.appendChild(li);
    }
    cell.appendChild(list);
    row.appendChild(cell);
}

async function loadCMS() {
    try {
        const response = await fetch("cms-data.json");
        if (!response.ok) throw new Error("Could not retrieve JSON data");
        const systems = await response.json();
        if (!Array.isArray(systems)) throw new Error("Invalid JSON data format");

        systems.forEach(cms => {
            const row = document.createElement("tr");
            const nameCell = addTextCell(row, cms.name);
            nameCell.className = "cms-system-name";
            addTextCell(row, cms.support);
            addTextCell(row, cms.technology);
            addListCell(row, cms.capabilities);
            addListCell(row, cms.limitations);

            const exampleCell = document.createElement("td");
            addLink(exampleCell, cms.example.label, cms.example.url);
            const note = document.createElement("p");
            note.className = "cms-small-label";
            addLink(note, "Example evidence", cms.exampleEvidence);
            exampleCell.appendChild(note);
            const heading = document.createElement("p");
            heading.className = "cms-small-label";
            heading.textContent = "Research sources:";
            exampleCell.appendChild(heading);
            const sourceList = document.createElement("ul");
            cms.sources.forEach(source => {
                const li = document.createElement("li");
                addLink(li, source.label, source.url);
                sourceList.appendChild(li);
            });
            exampleCell.appendChild(sourceList);
            row.appendChild(exampleCell);
            tableBody.appendChild(row);
        });
        status.textContent = `Displaying ${systems.length} content management systems, loaded from cms-data.json.`;
    } catch (error) {
        status.textContent = "Unable to load the table. Please open the website through Live Server or GitHub Pages so JavaScript can fetch cms-data.json.";
        console.error("CMS JSON loading error:", error);
    }
}

loadCMS();
