document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const leadsBody = document.getElementById("leads-body");
    const statTotal = document.getElementById("stat-total");
    const statContacted = document.getElementById("stat-contacted");
    const statNew = document.getElementById("stat-new");

    const newLeadModal = document.getElementById("new-lead-modal");
    const openNewLeadBtn = document.getElementById("open-new-lead-modal");
    const closeNewLeadBtn = document.getElementById("close-modal");
    const cancelNewLeadBtn = document.getElementById("cancel-modal");
    const newLeadForm = document.getElementById("new-lead-form");

    const aiPanel = document.getElementById("ai-panel");
    const closeAiPanelBtn = document.getElementById("close-ai-panel");
    const aiLoading = document.getElementById("ai-loading");
    const aiResults = document.getElementById("ai-results");

    // API Configuration
    const API_BASE = "";

    // Initialize
    fetchLeads();

    // -----------------------------------------
    // Event Listeners
    // -----------------------------------------

    // Modals
    openNewLeadBtn.addEventListener("click", () => newLeadModal.classList.remove("hidden"));
    closeNewLeadBtn.addEventListener("click", () => newLeadModal.classList.add("hidden"));
    cancelNewLeadBtn.addEventListener("click", () => newLeadModal.classList.add("hidden"));
    closeAiPanelBtn.addEventListener("click", () => aiPanel.classList.remove("open"));

    // Form submission
    newLeadForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = document.getElementById("name").value;
        const company = document.getElementById("company").value;
        const email = document.getElementById("email").value;
        const status = document.getElementById("status").value;

        try {
            const res = await fetch(`${API_BASE}/add-lead`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, company, email, status })
            });

            if (res.ok) {
                newLeadForm.reset();
                newLeadModal.classList.add("hidden");
                fetchLeads(); // Refresh table
            } else {
                alert("Failed to add lead.");
            }
        } catch (error) {
            console.error("Error adding lead:", error);
            alert("Network error.");
        }
    });

    // -----------------------------------------
    // Core Functions
    // -----------------------------------------

    async function fetchLeads() {
        try {
            const res = await fetch(`${API_BASE}/leads`);
            const leads = await res.json();

            updateStats(leads);
            renderTable(leads);
        } catch (error) {
            console.error("Error fetching leads:", error);
            leadsBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--danger)">Failed to load leads. Ensure the backend is running.</td></tr>`;
        }
    }

    function updateStats(leads) {
        statTotal.textContent = leads.length;
        statContacted.textContent = leads.filter(l => l.status === "Contacted").length;
        statNew.textContent = leads.filter(l => l.status === "New").length;
    }

    function renderTable(leads) {
        leadsBody.innerHTML = "";

        if (leads.length === 0) {
            leadsBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted)">No leads found. Add one to get started!</td></tr>`;
            return;
        }

        leads.forEach(lead => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><strong>${lead.name}</strong></td>
                <td>${lead.company}</td>
                <td>${lead.email}</td>
                <td><span class="status-badge ${lead.status}">${lead.status}</span></td>
                <td>
                    <div class="action-btns">
                        <button class="btn btn-sm btn-secondary" onclick="updateLeadStatus(${lead.id}, '${lead.status === 'New' ? 'Contacted' : 'New'}')">
                            <i class="fa-solid fa-rotate"></i> Toggle
                        </button>
                        <button class="btn btn-sm ai-btn" onclick="analyzeLead(${lead.id})">
                            <i class="fa-solid fa-wand-magic-sparkles"></i> Analyze
                        </button>
                        <button class="btn icon-btn" onclick="deleteLead(${lead.id})"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </td>
            `;
            leadsBody.appendChild(tr);
        });
    }

    // -----------------------------------------
    // API Actions (Exposed to Global Scope for inline onclick)
    // -----------------------------------------

    window.analyzeLead = async function (id) {
        aiPanel.classList.add("open");
        aiResults.classList.add("hidden");
        aiLoading.classList.remove("hidden");

        try {
            const res = await fetch(`${API_BASE}/analyze/${id}`);
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Analysis failed");

            // Populate AI Panel
            document.getElementById("ai-priority").textContent = data.ai_analysis.priority;

            // Adjust priority badge color
            const pBadge = document.getElementById("ai-priority");
            pBadge.style.color = data.ai_analysis.priority.includes("High") ? "#fca5a5" :
                data.ai_analysis.priority.includes("Medium") ? "#fde047" : "#86efac";

            // Show cached badge if loaded from DB
            document.getElementById("ai-cached").style.display = data.cached ? "block" : "none";

            document.getElementById("ai-next-action").textContent = data.ai_analysis.next_action;
            document.getElementById("ai-outreach").textContent = data.ai_analysis.outreach_message;

            aiLoading.classList.add("hidden");
            aiResults.classList.remove("hidden");

        } catch (error) {
            console.error("AI Error:", error);
            aiLoading.innerHTML = `<p style="color: var(--danger)"><i class="fa-solid fa-triangle-exclamation"></i> AI Analysis Failed</p>`;
        }
    };

    window.updateLeadStatus = async function (id, newStatus) {
        try {
            const res = await fetch(`${API_BASE}/leads/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) fetchLeads();
        } catch (error) {
            console.error("Update error:", error);
        }
    };

    window.deleteLead = async function (id) {
        if (!confirm("Are you sure you want to delete this lead?")) return;

        try {
            const res = await fetch(`${API_BASE}/leads/${id}`, {
                method: "DELETE"
            });
            if (res.ok) fetchLeads();
        } catch (error) {
            console.error("Delete error:", error);
        }
    };
});
