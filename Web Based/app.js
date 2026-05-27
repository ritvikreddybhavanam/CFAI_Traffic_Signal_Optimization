// -------------------------
// READ TRAFFIC DATA
// -------------------------
function getTraffic() {
    return {
        N: +north.value,
        S: +south.value,
        E: +east.value,
        W: +west.value
    };
}

// -------------------------
// DECISION SYSTEM (RULE BASED)
// -------------------------
function decide(t) {

    let best = "N";
    let max = t.N;

    if (t.S > max) { max = t.S; best = "S"; }
    if (t.E > max) { max = t.E; best = "E"; }
    if (t.W > max) { best = "W"; }

    return best;
}

// -------------------------
// DISPLAY SIGNAL
// -------------------------
function showSignal(dir) {
    document.getElementById("signal").innerText =
        dir + " GREEN 🚦";
}

// -------------------------
// GRAPH DRAWING
// -------------------------
function drawGraph(t) {

    let canvas = document.getElementById("graph");
    let ctx = canvas.getContext("2d");

    canvas.width = 300;
    canvas.height = 200;

    let values = [t.N, t.S, t.E, t.W];
    let colors = ["red", "blue", "green", "yellow"];

    ctx.clearRect(0, 0, 300, 200);

    values.forEach((v, i) => {
        ctx.fillStyle = colors[i];
        ctx.fillRect(i * 70, 200 - v * 2, 40, v * 2);
    });
}

// -------------------------
// MAIN FUNCTION
// -------------------------
function runSystem() {

    let t = getTraffic();
    let best = decide(t);

    showSignal(best);
    drawGraph(t);
}

// -------------------------
// AUTO LOOP SYSTEM
// -------------------------
function startSystem() {
    setInterval(runSystem, 2000);
}