import { firebaseConfig } from "./firebase-config.js";
const V = "10.14.1", B = "https://www.gstatic.com/firebasejs/" + V + "/";
const $ = (id) => document.getElementById(id);
const box = $("share"), RK = "dompetku-room";
const configured = firebaseConfig && firebaseConfig.apiKey && !/^ISI/.test(firebaseConfig.apiKey);
let room = null, unsub = null, status = "", cls = "";
try { room = localStorage.getItem(RK); } catch (e) {}
const hm = location.hash.match(/r=([a-z0-9]{16,40})/i);
if (hm) { room = hm[1].toLowerCase(); try { localStorage.setItem(RK, room); } catch (e) {} history.replaceState(null, "", location.pathname + location.search); }

function newCode() { const a = new Uint8Array(12); crypto.getRandomValues(a); return Array.from(a, (b) => b.toString(36).padStart(2, "0")).join("").slice(0, 20); }
function setStatus(t, c) { status = t; cls = c || ""; ui(); }
function ui() {
  if (!box) return;
  box.innerHTML = "<h3>Berbagi catatan</h3>";
  const add = (tag, text, c) => { const e = document.createElement(tag); e.textContent = text; if (c) e.className = c; box.appendChild(e); return e; };
  if (!configured) { add("p", "Fitur berbagi belum aktif. Isi file firebase-config.js dengan konfigurasi Firebase kamu (langkahnya ada di README)."); return; }
  if (!room) {
    add("p", "Catat bersama pasangan atau keluarga. Buat kode lalu bagikan, atau masukkan kode dari orang lain. Catatan yang sudah ada di HP ini akan digabung.");
    const b = add("button", "Mulai berbagi", "save"); b.onclick = () => join(newCode());
    const i = document.createElement("input"); i.placeholder = "Tempel kode dari orang lain"; i.setAttribute("aria-label", "Kode berbagi"); i.style.marginTop = "12px"; box.appendChild(i);
    const g = add("button", "Gabung", "link"); g.style.margin = "0 auto"; g.onclick = () => { const v = i.value.trim().toLowerCase(); if (/^[a-z0-9]{16,40}$/.test(v)) join(v); else { i.value = ""; i.placeholder = "Kode tidak valid"; } };
    return;
  }
  add("p", status || "Menghubungkan…", cls);
  add("p", "Kode ruang (rahasiakan, siapa pun yang punya kode bisa melihat dan mengubah catatan):");
  add("code", room);
  const c = add("button", "Salin tautan undangan", "save");
  c.onclick = async () => { const u = location.origin + location.pathname + "#r=" + room; try { await navigator.clipboard.writeText(u); c.textContent = "Tersalin"; } catch (e) { prompt("Salin tautan ini:", u); } };
  const o = add("button", "Berhenti berbagi di HP ini", "link"); o.onclick = () => { if (confirm("Berhenti berbagi di HP ini? Catatan tetap ada di HP ini, tapi tidak lagi tersambung.")) leave(); };
}
function leave() { if (unsub) unsub(); unsub = null; delete window.dompetkuSync; room = null; try { localStorage.removeItem(RK); } catch (e) {} setStatus("", ""); }
function join(code) { room = code; try { localStorage.setItem(RK, room); } catch (e) {} start(); }

async function start() {
  ui();
  if (!configured || !room) return;
  try {
    const [{ initializeApp }, { getAuth, signInAnonymously }, fs] = await Promise.all([import(B + "firebase-app.js"), import(B + "firebase-auth.js"), import(B + "firebase-firestore.js")]);
    const app = initializeApp(firebaseConfig);
    await signInAnonymously(getAuth(app));
    const col = fs.collection(fs.getFirestore(app), "rooms", room, "tx");
    const fail = () => setStatus("Gagal menyimpan. Cek koneksi.", "bad");
    window.dompetkuSync = {
      put: (o) => fs.setDoc(fs.doc(col, String(o.id)), o).catch(fail),
      del: (id) => fs.deleteDoc(fs.doc(col, String(id))).catch(fail),
      wipe: async (ids) => { try { for (const id of ids) await fs.deleteDoc(fs.doc(col, id)); } catch (e) { fail(); } }
    };
    const MK = "dompetku-merged-" + room;
    const local = window.dompetku.all();
    let first = true;
    unsub = fs.onSnapshot(col, async (sn) => {
      const remote = sn.docs.map((d) => d.data());
      let merged = false; try { merged = !!localStorage.getItem(MK); } catch (e) {}
      if (first && !merged) {
        const ids = new Set(remote.map((r) => String(r.id)));
        for (const t of local) if (!ids.has(String(t.id))) { remote.push(t); fs.setDoc(fs.doc(col, String(t.id)), t).catch(fail); }
        try { localStorage.setItem(MK, "1"); } catch (e) {}
      }
      first = false;
      window.dompetku.set(remote);
      setStatus("Tersinkron", "ok");
    }, () => setStatus("Sinkronisasi terputus. Muat ulang halaman.", "bad"));
  } catch (e) { setStatus("Tidak bisa terhubung ke Firebase. Periksa konfigurasi.", "bad"); }
}
start();
