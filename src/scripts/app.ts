import SNESROM from "../libs/SNESROM";
import { zipSync, unzipSync } from "fflate";

const roms: Map<string, SNESROM> = new Map();

const fileInput = document.getElementById("file-input") as HTMLInputElement;
const romList = document.getElementById("rom-list") as HTMLDivElement;
const downloadBtn = document.getElementById(
	"download-btn"
) as HTMLButtonElement;
const downloadMenu = document.getElementById("download-menu") as HTMLDivElement;
const progressBar = document.getElementById("progress-bar") as HTMLDivElement;
const snackbar = document.getElementById("snackbar") as HTMLDivElement;
const dropZone = document.getElementById("drop-zone") as HTMLDivElement;
const romCounter = document.getElementById("rom-counter") as HTMLDivElement;
const zipIndividually = document.getElementById(
	"zip-individually"
) as HTMLInputElement;

function formatSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	const kb = bytes / 1024;
	if (kb < 1024) return `${kb.toFixed(1)} KB`;
	const mb = kb / 1024;
	return `${mb.toFixed(1)} MB`;
}

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

function updateToolbarButtons() {
	const empty = roms.size === 0;
	downloadBtn.disabled = empty;
	romCounter.textContent = empty
		? ""
		: `${roms.size} ROM${roms.size === 1 ? "" : "s"} loaded`;
}

function createRomCard(rom: SNESROM): HTMLDivElement {
	const template = document.getElementById(
		"rom-card-template"
	) as HTMLTemplateElement;
	const clone = template.content.cloneNode(true) as DocumentFragment;
	const card = clone.querySelector(".rom-card") as HTMLDivElement;

	card.dataset.hash = rom.hash;
	card.querySelector(".rom-card-title")!.textContent = rom.title;
	const nameInput = card.querySelector(
		"[data-field='name']"
	) as HTMLInputElement;
	nameInput.value = rom.name;
	nameInput.addEventListener("input", () => {
		rom.name = nameInput.value;
	});
	card.querySelector("[data-field='size']")!.textContent = formatSize(rom.size);
	card.querySelector("[data-field='romsize']")!.textContent =
		rom.romSizeKbit > 0 ? `${rom.romSizeKbit} Kbit` : "Unknown";
	card.querySelector("[data-field='ramsize']")!.textContent =
		rom.ramSizeKbit > 0 ? `${rom.ramSizeKbit} Kbit` : "None";
	card.querySelector("[data-field='region']")!.textContent = rom.region;
	card.querySelector("[data-field='video']")!.textContent = rom.video;
	card.querySelector("[data-field='romtype']")!.textContent = rom.romType || "Unknown";
	card.querySelector("[data-field='memmap']")!.textContent = rom.hiROM
		? "HiROM"
		: "LoROM";
	card.querySelector("[data-field='checksum']")!.textContent =
		rom.checksumValid === null ? "N/A" : rom.checksumValid ? "Valid" : "Invalid";
	card.querySelector("[data-field='hash']")!.textContent = rom.hash;
	card.querySelector("[data-field='header']")!.textContent = rom.headerSize
		? "Yes"
		: "No";

	const header = card.querySelector(".rom-card-header")!;
	const toggleExpand = () => {
		const expanded = card.classList.toggle("expanded");
		header.setAttribute("aria-expanded", String(expanded));
	};
	header.addEventListener("click", toggleExpand);
	header.addEventListener("keydown", (e) => {
		if ((e as KeyboardEvent).key === "Enter" || (e as KeyboardEvent).key === " ") {
			e.preventDefault();
			toggleExpand();
		}
	});

	card.querySelector(".btn-remove")!.addEventListener("click", () => {
		roms.delete(rom.hash);
		card.remove();
		updateToolbarButtons();
	});

	return card;
}

function isZip(file: File): boolean {
	return file.name.toLowerCase().endsWith(".zip");
}

function isRom(name: string): boolean {
	const lower = name.toLowerCase();
	return lower.endsWith(".smc") || lower.endsWith(".sfc");
}

function extractRomsFromZip(
	buffer: ArrayBuffer
): { name: string; data: ArrayBuffer }[] {
	const entries = unzipSync(new Uint8Array(buffer));
	const extracted: { name: string; data: ArrayBuffer }[] = [];
	for (const [path, data] of Object.entries(entries)) {
		const name = path.split("/").pop()!;
		if (isRom(name)) {
			extracted.push({ name, data: data.buffer as ArrayBuffer });
		}
	}
	return extracted;
}

function readFile(file: File): Promise<ArrayBuffer> {
	return new Promise((resolve) => {
		const reader = new FileReader();
		reader.addEventListener("load", () =>
			resolve(reader.result as ArrayBuffer)
		);
		reader.readAsArrayBuffer(file);
	});
}

type AddResult = "added" | "duplicate" | "invalid";

async function addRom(name: string, buffer: ArrayBuffer): Promise<AddResult> {
	const rom = new SNESROM(name, buffer);
	await rom.computeHash();
	if (roms.has(rom.hash)) return "duplicate";
	if (!rom.valid()) return "invalid";

	roms.set(rom.hash, rom);
	romList.appendChild(createRomCard(rom));
	return "added";
}

async function readRomEntries(
	file: File
): Promise<{ name: string; data: ArrayBuffer }[]> {
	const buffer = await readFile(file);
	return isZip(file)
		? extractRomsFromZip(buffer)
		: [{ name: file.name, data: buffer }];
}

async function handleFiles(files: FileList) {
	showProgress();

	const groups = await Promise.all(Array.from(files).map(readRomEntries));
	const results = await Promise.all(
		groups.flat().map((e) => addRom(e.name, e.data))
	);
	const duplicates = results.filter((r) => r === "duplicate").length;
	const invalid = results.filter((r) => r === "invalid").length;

	hideProgress();
	updateToolbarButtons();

	const parts: string[] = [];
	if (duplicates > 0)
		parts.push(`${duplicates} duplicate${duplicates > 1 ? "s" : ""}`);
	if (invalid > 0)
		parts.push(`${invalid} invalid`);
	if (parts.length > 0)
		showSnackbar(`${parts.join(", ")} not added.`);
}

function concatBuffers(
	buffer1: ArrayBuffer,
	buffer2: ArrayBuffer
): ArrayBuffer {
	const result = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
	result.set(new Uint8Array(buffer1), 0);
	result.set(new Uint8Array(buffer2), buffer1.byteLength);
	return result.buffer;
}

function handleDownload(withHeaders: boolean) {
	showProgress();
	const ext = withHeaders ? ".smc" : ".sfc";
	const wrapIndividually = zipIndividually.checked;
	const files: Record<string, Uint8Array> = {};

	const usedNames = new Set<string>();
	for (const [, rom] of roms) {
		let name = rom.name
			.replace(/\.[^.]+$/, "")
			.replace(/[^a-zA-Z0-9_\-() ]/g, "_");
		const baseName = name;
		let counter = 1;
		while (usedNames.has(name)) {
			name = `${baseName} (${counter++})`;
		}
		usedNames.add(name);

		const data = withHeaders
			? new Uint8Array(concatBuffers(new ArrayBuffer(512), rom.buffer))
			: new Uint8Array(rom.buffer);

		if (wrapIndividually)
			files[name + ".zip"] = zipSync({ [name + ext]: data });
		else files[name + ext] = data;
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

// Drag & drop
let dragCounter = 0;

document.addEventListener("dragenter", (e) => {
	e.preventDefault();
	dragCounter++;
	if (dragCounter === 1) {
		dropZone.classList.add("active");
	}
});

document.addEventListener("dragover", (e) => {
	e.preventDefault();
});

document.addEventListener("dragleave", (e) => {
	e.preventDefault();
	dragCounter--;
	if (dragCounter === 0) {
		dropZone.classList.remove("active");
	}
});

document.addEventListener("drop", (e) => {
	e.preventDefault();
	dragCounter = 0;
	dropZone.classList.remove("active");
	if (e.dataTransfer?.files.length) {
		handleFiles(e.dataTransfer.files);
	}
});

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
		const isOpen = downloadMenu.classList.toggle("open");
		downloadBtn.setAttribute("aria-expanded", String(isOpen));
	}
});

document.querySelectorAll(".download-option").forEach((btn) => {
	btn.addEventListener("click", (e) => {
		const withHeaders =
			(e.target as HTMLButtonElement).dataset.headers === "true";
		downloadMenu.classList.remove("open");
		handleDownload(withHeaders);
	});
});

document.addEventListener("click", (e) => {
	if (!(e.target as Element).closest(".download-wrapper")) {
		downloadMenu.classList.remove("open");
		downloadBtn.setAttribute("aria-expanded", "false");
	}
});

document.addEventListener("keydown", (e) => {
	if (e.key === "Escape" && downloadMenu.classList.contains("open")) {
		downloadMenu.classList.remove("open");
		downloadBtn.setAttribute("aria-expanded", "false");
		downloadBtn.focus();
	}
});

// Persist preferences
zipIndividually.checked = localStorage.getItem("zipIndividually") === "true";
zipIndividually.addEventListener("change", () => {
	localStorage.setItem("zipIndividually", String(zipIndividually.checked));
});
