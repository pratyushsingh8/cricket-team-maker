let players = [];
let selectedCaptains = [];

function addPlayer() {
  const nameInput = document.getElementById("playerName");
  const roleInput = document.getElementById("playerRole");
  const name = nameInput.value.trim();
  const role = roleInput.value;

  if (name && role && !players.some(p => p.name === name)) {
    const player = { name, role };
    players.push(player);
    nameInput.value = "";
    updatePlayerList();
    saveToLocal();
  } else {
    alert("Please enter a valid name and role.");
  }
}

function updatePlayerList() {
  const list = document.getElementById("playerList");
  list.innerHTML = "";

  players.forEach((player, index) => {
    const li = document.createElement("li");
    li.textContent = `${player.name} (${player.role})`;

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "❌";
    removeBtn.style.marginLeft = "10px";
    removeBtn.onclick = () => {
      players.splice(index, 1);
      updatePlayerList();
      selectedCaptains = selectedCaptains.filter(p => p.name !== player.name);
      updateManualCaptainList();
      saveToLocal();
    };

    li.appendChild(removeBtn);
    list.appendChild(li);
  });

  updateManualCaptainList();
}

function handleModeChange(mode) {
  document.getElementById("autoMode").style.display = mode === "auto" ? "block" : "none";
  document.getElementById("manualMode").style.display = mode === "manual" ? "block" : "none";
  document.getElementById("captains").textContent = "";
  selectedCaptains = [];
  updateManualCaptainList();
}

function selectRandomCaptains() {
  if (players.length < 2) {
    alert("Need at least 2 players!");
    return;
  }
  const shuffled = [...players].sort(() => Math.random() - 0.5);
  selectedCaptains = [shuffled[0], shuffled[1]];
  document.getElementById("captains").textContent = `Captains: ${selectedCaptains[0].name} 🆚 ${selectedCaptains[1].name}`;
  saveToLocal();
}

function updateManualCaptainList() {
  const list = document.getElementById("manualCaptainList");
  list.innerHTML = "";
  players.forEach((player) => {
    const li = document.createElement("li");
    li.textContent = `${player.name} (${player.role})`;
    li.style.cursor = "pointer";
    li.style.padding = "5px";
    li.style.border = "1px solid gray";
    li.style.margin = "5px auto";
    li.style.maxWidth = "200px";
    li.style.borderRadius = "6px";

    li.onclick = () => toggleCaptain(player, li);

    if (selectedCaptains.some(c => c.name === player.name)) {
      li.style.backgroundColor = "#0d6efd";
      li.style.color = "white";
    }

    list.appendChild(li);
  });
}

function toggleCaptain(player, li) {
  const index = selectedCaptains.findIndex(p => p.name === player.name);
  if (index !== -1) {
    selectedCaptains.splice(index, 1);
  } else if (selectedCaptains.length < 2) {
    selectedCaptains.push(player);
  }
  updateManualCaptainList();
  saveToLocal();
}

function confirmManualCaptains() {
  if (selectedCaptains.length !== 2) {
    alert("Please select exactly 2 captains.");
    return;
  }
  document.getElementById("captains").textContent = `Captains: ${selectedCaptains[0].name} 🆚 ${selectedCaptains[1].name}`;
  saveToLocal();
}

function generateTeams() {
  if (players.length < 4) {
    alert("Add more players to form teams.");
    return;
  }

  if (selectedCaptains.length !== 2) {
    alert("Please select or confirm 2 captains first.");
    return;
  }

  const teamA = [selectedCaptains[0]];
  const teamB = [selectedCaptains[1]];

  const categorized = { batsman: [], bowler: [], allrounder: [] };

  players.forEach(p => {
    if (!selectedCaptains.some(c => c.name === p.name)) {
      categorized[p.role].push(p);
    }
  });

  for (let role in categorized) {
    categorized[role].sort(() => Math.random() - 0.5);
  }

  const maxCount = Math.max(
    categorized.batsman.length,
    categorized.bowler.length,
    categorized.allrounder.length
  );

  for (let i = 0; i < maxCount; i++) {
    for (let role in categorized) {
      const player = categorized[role][i];
      if (player) {
        (teamA.length <= teamB.length ? teamA : teamB).push(player);
      }
    }
  }

  document.getElementById("teamA").innerHTML = teamA.map(p => `<li>${p.name}</li>`).join("");
  document.getElementById("teamB").innerHTML = teamB.map(p => `<li>${p.name}</li>`).join("");

  previewTeamStrength(teamA, teamB);
}

function previewTeamStrength(teamA, teamB) {
  const roleCount = (team) => {
    const count = { batsman: 0, bowler: 0, allrounder: 0 };
    team.forEach(p => {
      if (p.role) {
        count[p.role]++;
      }
    });
    return count;
  };

  const teamAStrength = roleCount(teamA);
  const teamBStrength = roleCount(teamB);

  document.getElementById("teamStrengthA").innerHTML = `
    <h3>Team A Strength</h3>
    Batsmen: ${teamAStrength.batsman} | Bowlers: ${teamAStrength.bowler} | Allrounders: ${teamAStrength.allrounder}
  `;
  document.getElementById("teamStrengthB").innerHTML = `
    <h3>Team B Strength</h3>
    Batsmen: ${teamBStrength.batsman} | Bowlers: ${teamBStrength.bowler} | Allrounders: ${teamBStrength.allrounder}
  `;
}

function saveToLocal() {
  localStorage.setItem("players", JSON.stringify(players));
  localStorage.setItem("selectedCaptains", JSON.stringify(selectedCaptains));
}

function loadFromLocal() {
  const savedPlayers = JSON.parse(localStorage.getItem("players"));
  const savedCaptains = JSON.parse(localStorage.getItem("selectedCaptains"));

  if (savedPlayers) players = savedPlayers;
  if (savedCaptains) selectedCaptains = savedCaptains;

  updatePlayerList();

  if (selectedCaptains.length === 2) {
    document.getElementById("captains").textContent = `Captains: ${selectedCaptains[0].name} 🆚 ${selectedCaptains[1].name}`;
  }
}

window.onload = loadFromLocal;

function resetAll() {
  if (!confirm("Are you sure you want to reset everything?")) return;

  players = [];
  selectedCaptains = [];
  localStorage.removeItem("players");
  localStorage.removeItem("selectedCaptains");

  document.getElementById("playerName").value = "";
  document.getElementById("playerList").innerHTML = "";
  document.getElementById("manualCaptainList").innerHTML = "";
  document.getElementById("captains").textContent = "";
  document.getElementById("teamA").innerHTML = "";
  document.getElementById("teamB").innerHTML = "";
  document.getElementById("teamStrengthA").innerHTML = "";
  document.getElementById("teamStrengthB").innerHTML = "";
}
