// Kompresja zdjęć po stronie klienta przed zapisem jako data URL.
//
// W projekcie nie ma zewnętrznego storage na pliki (S3/Cloudinary/Vercel
// Blob) — to świadomy kompromis MVP: zdjęcia lądują jako data URL wprost w
// bazie. Bez resize'u nawet jedno zdjęcie z telefonu (kilka MB) rozdęłoby
// wiersz. Max 1200px + JPEG q=0.75 trzyma to zwykle w granicach kilkuset KB.
// Przy większym wolumenie zdjęć to pierwsze miejsce do wymiany na prawdziwy
// blob storage.

const MAX_DIMENSION = 1200;
const JPEG_QUALITY = 0.75;

export function compressImageToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("To nie jest plik obrazu."));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Nie udało się odczytać pliku."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Nieprawidłowy plik obrazu."));
      img.onload = () => {
        let { width, height } = img;
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          const scale = MAX_DIMENSION / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas niedostępny w tej przeglądarce."));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
