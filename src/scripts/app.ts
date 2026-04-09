import SNESROM from "../libs/SNESROM";
import { zipSync } from "fflate";

const roms: Map<string, SNESROM> = new Map();

const fileInput = document.getElementById("file-input") as HTMLInputElement;
const romList = document.getElementById("rom-list") as HTMLDivElement;
const downloadBtn = document.getElementById("download-btn") as HTMLButtonElement;
const downloadMenu = document.getElementById("download-menu") as HTMLDivElement;
const progressBar = document.getElementById("progress-bar") as HTMLDivElement;
const snackbar = document.getElementById("snackbar") as HTMLDivElement;

function showProgress() {
    progressBar.classList.add("active");
}

function hideProgress() {
    progressBar.classList.remove("active");
}

function showSnackbar(message: string) {
    snackbar.textContent = message;
    snackbar.classList.add("visible");
    setTimeout(() => snackbar.classList.remove("visible"), 4000);
}

function updateDownloadBtn() {
    downloadBtn.disabled = roms.size === 0;
}

function createRomCard(rom: SNESROM): HTMLDivElement {
    const template = document.getElementById("rom-card-template") as HTMLTemplateElement;
    const clone = template.content.cloneNode(true) as DocumentFragment;
    const card = clone.querySelector(".rom-card") as HTMLDivElement;

    card.dataset.hash = rom.hash;
    card.querySelector(".rom-card-title")!.textContent = rom.title;
    card.querySelector("[data-field='name']")!.textContent = rom.name;
    card.querySelector("[data-field='size']")!.textContent = String(rom.size);
    card.querySelector("[data-field='region']")!.textContent = rom.region;
    card.querySelector("[data-field='video']")!.textContent = rom.video;
    card.querySelector("[data-field='memmap']")!.textContent = rom.hiROM ? "HiROM" : "LoROM";
    card.querySelector("[data-field='hash']")!.textContent = rom.hash;
    card.querySelector("[data-field='header']")!.textContent = rom.headerSize ? "Yes" : "No";

    card.querySelector(".rom-card-header")!.addEventListener("click", () => {
        card.classList.toggle("expanded");
    });

    card.querySelector(".btn-remove")!.addEventListener("click", () => {
        roms.delete(rom.hash);
        card.remove();
        updateDownloadBtn();
    });

    return card;
}

async function handleFiles(files: FileList) {
    showProgress();
    let notAddedCount = 0;

    const promises = Array.from(files).map((file) => {
        return new Promise<void>((resolve) => {
            const reader = new FileReader();
            reader.addEventListener("load", async () => {
                const rom = new SNESROM(file.name, reader.result as ArrayBuffer);
                await rom.computeHash();
                if (roms.has(rom.hash) || !rom.valid()) {
                    notAddedCount++;
                } else {
                    roms.set(rom.hash, rom);
                    romList.appendChild(createRomCard(rom));
                }
                resolve();
            });
            reader.readAsArrayBuffer(file);
        });
    });

    await Promise.all(promises);
    hideProgress();
    updateDownloadBtn();

    if (notAddedCount > 0) {
        const msg = notAddedCount > 1
            ? `${notAddedCount} duplicate or invalid ROMs were not added.`
            : "1 duplicate or invalid ROM was not added.";
        showSnackbar(msg);
    }
}

function concatBuffers(buffer1: ArrayBuffer, buffer2: ArrayBuffer): ArrayBuffer {
    const result = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
    result.set(new Uint8Array(buffer1), 0);
    result.set(new Uint8Array(buffer2), buffer1.byteLength);
    return result.buffer;
}

function handleDownload(withHeaders: boolean) {
    showProgress();
    const files: Record<string, Uint8Array> = {};

    for (const [, rom] of roms) {
        const name = rom.name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9_\-() ]/g, "_");
        if (withHeaders) {
            const buffer = concatBuffers(new ArrayBuffer(512), rom.buffer);
            files[name + ".smc"] = new Uint8Array(buffer);
        } else {
            files[name + ".sfc"] = new Uint8Array(rom.buffer);
        }
    }

    const zipped = zipSync(files);
    const blob = new Blob([zipped.buffer as ArrayBuffer]);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (withHeaders ? "smc" : "sfc") + " ROMs.zip";
    a.click();
    URL.revokeObjectURL(url);
    hideProgress();
}

// Event listeners
fileInput.addEventListener("change", (e) => {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
        handleFiles(input.files);
        input.value = "";
    }
});

downloadBtn.addEventListener("click", () => {
    if (!downloadBtn.disabled) {
        downloadMenu.classList.toggle("open");
    }
});

document.querySelectorAll(".download-option").forEach((btn) => {
    btn.addEventListener("click", (e) => {
        const withHeaders = (e.target as HTMLButtonElement).dataset.headers === "true";
        downloadMenu.classList.remove("open");
        handleDownload(withHeaders);
    });
});

document.addEventListener("click", (e) => {
    if (!(e.target as Element).closest(".download-wrapper")) {
        downloadMenu.classList.remove("open");
    }
});
