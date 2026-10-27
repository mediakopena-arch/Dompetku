# Mengaktifkan berbagi catatan (Firebase)

1. Buka https://console.firebase.google.com, klik **Add project**, beri nama (misalnya `dompetku`). Google Analytics boleh dimatikan.
2. Di halaman proyek, klik ikon **Web** (`</>`), beri nama aplikasi, klik Register. Salin nilai `apiKey`, `authDomain`, `projectId`, `appId`.
3. Buka file `firebase-config.js` di repo (ikon pensil), ganti keempat nilai `ISI_DI_SINI`, lalu Commit.
4. Di Firebase: **Build → Authentication → Get started → Sign-in method → Anonymous → Enable → Save**.
5. Di Firebase: **Build → Firestore Database → Create database** (pilih lokasi terdekat, mode production).
6. Buka tab **Rules** di Firestore, hapus isinya, tempel isi `firebase-rules.txt`, lalu **Publish**.
7. Buka aplikasi, tab **Riwayat → Berbagi catatan → Mulai berbagi**, lalu **Salin tautan undangan** dan kirim ke pasangan atau keluarga.

Catatan keamanan: kode ruang bersifat rahasia. Siapa pun yang memilikinya bisa melihat dan mengubah catatan. Jangan unggah kode itu ke tempat umum.
