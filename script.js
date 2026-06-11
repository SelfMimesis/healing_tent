(function () {
  "use strict";

  const shell = document.getElementById("screenShell");
  const screen = document.getElementById("hudScreen");
  const leftStack = document.getElementById("leftStack");
  const scanArea = document.getElementById("scanArea");
  const switchGrid = document.getElementById("switchGrid");
  const switchGridTwo = document.getElementById("switchGridTwo");
  const lowerReadouts = document.getElementById("lowerReadouts");
  const towerColumns = document.getElementById("towerColumns");
  const microDials = document.getElementById("microDials");

  const glyphChars = "ACDEHJKLMNPQRSTVWXYZ0123456789";
  const state = {
    needles: [],
    tinyNeedles: [],
    fills: [],
    bars: [],
    switches: [],
    values: [],
    segments: []
  };

  function fitScreen() {
    const scale = Math.min(window.innerWidth / 1024, window.innerHeight / 768, 1);
    shell.style.width = `${1024 * scale}px`;
    shell.style.height = `${768 * scale}px`;
    screen.style.transform = `scale(${scale})`;
  }

  function glyph(length) {
    let out = "";
    for (let i = 0; i < length; i += 1) {
      out += glyphChars[Math.floor(Math.random() * glyphChars.length)];
    }
    return out;
  }

  function makeTick(parent, count, radius) {
    for (let i = 0; i < count; i += 1) {
      const tick = document.createElement("span");
      tick.className = "dial-tick";
      tick.style.transform = `rotate(${(360 / count) * i}deg) translateY(0)`;
      tick.style.transformOrigin = `0 ${radius}px`;
      parent.appendChild(tick);
    }
  }

  function makeStatusModule(index) {
    const module = document.createElement("article");
    module.className = "status-module";
    module.style.animationDelay = `${index * -1.2}s`;

    const dial = document.createElement("div");
    dial.className = "dial";
    dial.style.setProperty("--angle", `${-52 + index * 18}deg`);
    makeTick(dial, 12, 37);

    const needle = document.createElement("span");
    needle.className = "needle";
    dial.appendChild(needle);

    const dialLabel = document.createElement("span");
    dialLabel.className = "dial-label";
    dialLabel.textContent = "SET";
    dial.appendChild(dialLabel);

    const dialRight = document.createElement("span");
    dialRight.className = "dial-label-right";
    dialRight.textContent = `${glyph(4)} ${glyph(4)}`;
    dial.appendChild(dialRight);

    const lanes = document.createElement("div");
    lanes.className = "data-lanes";

    for (let i = 0; i < 2; i += 1) {
      const lane = document.createElement("div");
      lane.className = "lane";

      const shellEl = document.createElement("div");
      shellEl.className = "lane-shell";

      const fill = document.createElement("div");
      fill.className = "lane-fill";
      fill.style.setProperty("--fill", `${58 + Math.random() * 28}%`);

      const empty = document.createElement("div");
      empty.className = "lane-empty";

      const caption = document.createElement("div");
      caption.className = "lane-caption";
      caption.textContent = i === 0 ? `${glyph(8)} RUN TRACE` : `${glyph(7)} APDN SALT`;

      shellEl.append(fill, empty);
      lane.append(shellEl, caption);
      lanes.appendChild(lane);
      state.fills.push({ el: fill, phase: Math.random() * 6.2, base: 54 + Math.random() * 16 });
    }

    module.append(dial, lanes);
    state.needles.push({ el: needle, base: -64 + index * 21, range: 42, speed: 0.62 + index * 0.09, phase: index * 1.8 });
    return module;
  }

  function makeScanBlock(index) {
    const block = document.createElement("article");
    block.className = "scan-block";

    const barcodeWrap = document.createElement("div");
    barcodeWrap.className = "barcode-wrap";

    const labels = document.createElement("div");
    labels.className = "barcode-labels";
    labels.innerHTML = `<span>ANALOG</span><span>SYNC</span>`;

    const barcode = document.createElement("div");
    barcode.className = "barcode";
    for (let i = 0; i < 72; i += 1) {
      const bar = document.createElement("span");
      const width = 1 + Math.floor(Math.random() * 3);
      bar.style.setProperty("--w", `${width}px`);
      barcode.appendChild(bar);
      state.bars.push({ el: bar, phase: Math.random() * 6.2, speed: 0.8 + Math.random() * 1.4 });
    }

    const caption = document.createElement("div");
    caption.className = "scan-caption";
    caption.textContent = index === 0 ? "DPCT TRANSITION" : "DPCT TRANSITION .NET";

    barcodeWrap.append(labels, barcode, caption);

    const copy = document.createElement("div");
    copy.className = "scan-copy";

    const title = document.createElement("div");
    title.className = "scan-title";
    title.textContent = index === 0 ? "CTAMP N3R0T5" : "CTAMP RCU3T1C";

    const subtitle = document.createElement("div");
    subtitle.className = "scan-subtitle";
    subtitle.textContent = "N41TCT3AE BPAC N7AECP";

    const numbers = document.createElement("div");
    numbers.className = "numbers-row";
    [
      ["AUX", 82],
      ["TC7", 44],
      ["TPA", 98]
    ].forEach(([label, value], valueIndex) => {
      const cell = document.createElement("div");
      cell.className = "number-cell";
      cell.innerHTML = `<span class="number-label">${label}</span><span class="digit">${value}</span>`;
      const digit = cell.querySelector(".digit");
      state.values.push({
        el: digit,
        base: value,
        swing: valueIndex === 1 ? 3 : 5,
        phase: index * 2 + valueIndex
      });
      numbers.appendChild(cell);
    });

    copy.append(title, subtitle, numbers);
    block.append(barcodeWrap, copy);
    return block;
  }

  function makeSwitch(label, lit) {
    const item = document.createElement("div");
    item.className = "switch-item";
    item.innerHTML = `<span class="switch-label">${label}</span><span class="switch-box"></span>`;
    const box = item.querySelector(".switch-box");
    box.style.setProperty("--lit", lit ? "1" : "0");
    state.switches.push({ el: box, phase: Math.random() * 6.2, lit });
    return item;
  }

  function makeReadoutColumn(offset) {
    const col = document.createElement("div");
    col.className = "readout-col";
    const labels = ["BCH DTSE", "NU3 SPNNP", "PNHC CPN", "SCN A57GE", "NU3 TCRAT", "TULN JNCE", "CTY RPH20H", "NAN ATCLN"];
    labels.forEach((label, index) => {
      const row = document.createElement("div");
      row.className = "micro-row";
      row.innerHTML = `<span class="micro-label">${label}</span><span class="micro-value">${(index + offset) % 9}</span>`;
      state.values.push({
        el: row.querySelector(".micro-value"),
        base: (index + offset) % 9,
        swing: 1,
        phase: index * 0.7 + offset
      });
      col.appendChild(row);
    });

    const table = document.createElement("div");
    table.className = "micro-table";
    for (let i = 0; i < 12; i += 1) {
      const cell = document.createElement("span");
      cell.textContent = glyph(4);
      table.appendChild(cell);
    }
    col.appendChild(table);
    return col;
  }

  function makeTowerColumn(index) {
    const col = document.createElement("div");
    col.className = "tower-col";
    for (let i = 0; i < 49; i += 1) {
      const segment = document.createElement("span");
      segment.className = "tower-segment";
      col.appendChild(segment);
      state.segments.push({
        el: segment,
        phase: index * 1.5 + i * 0.15,
        row: i,
        column: index
      });
    }
    return col;
  }

  function makeTinyDial(index) {
    const dial = document.createElement("div");
    dial.className = "tiny-dial";
    for (let i = 0; i < 8; i += 1) {
      const mark = document.createElement("span");
      mark.className = "tiny-mark";
      mark.style.transform = `rotate(${i * 45}deg)`;
      dial.appendChild(mark);
    }
    const needle = document.createElement("span");
    needle.className = "tiny-needle";
    dial.appendChild(needle);
    state.tinyNeedles.push({ el: needle, base: -105 + index * 24, range: 65, speed: 0.78 + index * 0.18, phase: index * 2.4 });
    return dial;
  }

  function build() {
    for (let i = 0; i < 4; i += 1) {
      leftStack.appendChild(makeStatusModule(i));
    }

    for (let i = 0; i < 2; i += 1) {
      scanArea.appendChild(makeScanBlock(i));
    }

    ["TCT", "NINPUT", "CPAU", "TNKSE"].forEach((label, index) => {
      switchGrid.appendChild(makeSwitch(label, index === 0));
    });

    ["TCT", "NINPUT", "CPSNL", "N7TTH"].forEach((label, index) => {
      switchGridTwo.appendChild(makeSwitch(label, index !== 1));
    });

    lowerReadouts.append(makeReadoutColumn(3), makeReadoutColumn(0));

    for (let i = 0; i < 3; i += 1) {
      towerColumns.appendChild(makeTowerColumn(i));
      microDials.appendChild(makeTinyDial(i));
    }
  }

  function animate(now) {
    const t = now / 1000;

    state.needles.forEach((item) => {
      const angle = item.base + Math.sin(t * item.speed + item.phase) * item.range;
      item.el.style.setProperty("--angle", `${angle.toFixed(2)}deg`);
    });

    state.tinyNeedles.forEach((item) => {
      const angle = item.base + Math.sin(t * item.speed + item.phase) * item.range;
      item.el.style.setProperty("--angle", `${angle.toFixed(2)}deg`);
    });

    state.fills.forEach((item) => {
      const width = item.base + Math.sin(t * 0.8 + item.phase) * 18 + Math.sin(t * 1.7 + item.phase) * 4;
      item.el.style.setProperty("--fill", `${Math.max(24, Math.min(92, width)).toFixed(1)}%`);
    });

    state.bars.forEach((item) => {
      const wave = 0.65 + Math.sin(t * item.speed + item.phase) * 0.28 + Math.sin(t * 3.1 + item.phase) * 0.08;
      item.el.style.setProperty("--bar-scale", Math.max(0.32, Math.min(1, wave)).toFixed(3));
      item.el.style.setProperty("--bar-alpha", (0.58 + wave * 0.34).toFixed(3));
    });

    state.segments.forEach((item) => {
      const flow = Math.sin(t * 1.4 + item.phase) * 0.5 + 0.5;
      const scan = Math.sin(t * 2.1 - item.row * 0.17 + item.column) * 0.5 + 0.5;
      const alpha = 0.32 + flow * 0.28 + scan * 0.32;
      item.el.style.setProperty("--seg-alpha", Math.min(1, alpha).toFixed(3));
      item.el.style.setProperty("--seg-shift", `${(Math.sin(t * 0.9 + item.phase) * 0.8).toFixed(2)}px`);
    });

    state.switches.forEach((item, index) => {
      const pulse = Math.sin(t * 1.7 + item.phase) > (item.lit ? -0.3 : 0.78);
      item.el.style.setProperty("--lit", pulse ? "1" : "0.08");
      item.el.style.opacity = `${0.82 + Math.sin(t * 1.1 + index) * 0.12}`;
    });

    state.values.forEach((item) => {
      const value = Math.round(item.base + Math.max(0, Math.sin(t * 0.65 + item.phase)) * item.swing);
      item.el.textContent = String(value).padStart(item.base > 9 ? 2 : 1, "0");
    });

    requestAnimationFrame(animate);
  }

  build();
  fitScreen();
  window.addEventListener("resize", fitScreen);
  requestAnimationFrame(animate);
})();
