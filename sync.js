import { firebaseConfig, ROOM } from "./firebase-config.js";
const V = "10.14.1", B = "https://www.gstatic.com/firebasejs/" + V + "/";
const box = document.getElementById("share");
const configured = firebaseConfig && firebaseConfig.apiKey && !/^ISI/.test(firebaseConfig.apiKey) && /^[a-z0-9]{16,40}$/.test(ROOM || "");
let status = "Menghubungkan…", cls = "";
const msg = (e) => (e && (e.code || e.message)) || String(e);

function ui() {
  if (!box) return;
  box.innerHTML = "<h3>Sinkronisasi otomatis</h3>";
  const add = (text, c) => { const p = document.createElement("p"); p.textContent = text; if (c) p.className = c; box.appendChild(p); };
  if (!configured) { add("Belum aktif. Periksa file firebase-config.js.", "bad"); return; }
  add(status, cls);
  add("Semua HP yang membuka aplikasi ini memakai catatan yang sama. Perubahan di satu HP langsung muncul di HP lain.");
}
function setStatus(t, c) { status = t; cls = c || ""; ui(); }

async function start() {
  ui();
  if (!configured) return;
  try {
    const [{ initializeApp }, { getAuth, signInAnonymously }, fs] = await Promise.all([import(B + "firebase-app.js"), import(B + "firebase-auth.js"), import(B + "firebase-firestore.js")]);
    const app = initializeApp(firebaseConfig);
    await signInAnonymously(getAuth(app));
    const db = fs.getFirestore(app);
    const col = fs.collection(db, "rooms", ROOM, "tx");
    const authRef = fs.doc(db, "rooms", ROOM, "cfg", "auth");
    const fail = (err) => setStatus("Gagal menyimpan: " + msg(err), "bad");
    window.dompetkuSync = {
      put: (o) => fs.setDoc(fs.doc(col, String(o.id)), o).catch(fail),
      del: (id) => fs.deleteDoc(fs.doc(col, String(id))).catch(fail),
      setPw: (h) => fs.setDoc(authRef, { hash: h }).catch(fail),
      wipe: async (ids) => { try { for (const id of ids) await fs.deleteDoc(fs.doc(col, id)); } catch (e) { fail(e); } }
    };
    const MK = "dompetku-merged-" + ROOM;
    const local = window.dompetku.all();
    let first = true;
    fs.onSnapshot(col, (sn) => {
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
    }, (err) => setStatus("Sinkronisasi gagal: " + msg(err), "bad"));
    fs.onSnapshot(authRef, (d) => {
      const A = window.dompetkuAuth; if (!A) return;
      if (d.exists() && d.data().hash) A.set(d.data().hash);
      else if (A.custom()) fs.setDoc(authRef, { hash: A.get() }).catch(() => {});
    }, (err) => setStatus("Tersinkron, tapi sandi belum tersinkron: " + msg(err), "bad"));
  } catch (e) { setStatus("Tidak bisa terhubung: " + msg(e), "bad"); }
}
start();
