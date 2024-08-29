import { collection, deleteDoc, doc, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { db, storage } from '@/lib/firebase.config';

// h05HandleDeleteUploadedPdfFiles funkció
export const h05HandleDeleteUploadedPdfFiles = async (
  idsToDelete: string[],
  uploadedFiles: any[],
  setDeletingFiles: (value: Set<string>) => void,
  setUploadCounts: (value: any) => void,
  setUploadedFiles: (value: any[]) => void,
  fetchRecentUploads: () => Promise<void>,
  toast: (options: any) => void,
  setIsDeleteMode: (value: boolean) => void,
  setSelectedForDelete: (value: Set<string>) => void,
  getCollectionName: (type: string) => string
) => {
  const filesToDelete = idsToDelete.reverse();
  const deletedFiles: any[] = [];
  let locationError = false;

  for (const id of filesToDelete) {
    setDeletingFiles(prev => new Set(prev).add(id));
    const file = uploadedFiles.find(f => f.id === id);
    if (file) {
      const collectionName = getCollectionName(file.type);
      try {
        // Törlés a Firestore-ból
        await deleteDoc(doc(db, collectionName, id));
        
        // Törlés a Storage-ból
        const storageRef = ref(storage, `${collectionName}/${file.name}`);
        await deleteObject(storageRef);

        deletedFiles.push(file);

        // Számok frissítése
        setUploadCounts(prev => ({
          ...prev,
          [file.type]: prev[file.type] - 1,
        }));

        // A fájl eltávolítása az uploadedFiles állapotból
        setUploadedFiles(prev => prev.filter(f => f.id !== id));

        // Kis késleltetés a vizuális hatás érdekében
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error("Error deleting file:", error);
      }
    }
    setDeletingFiles(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }

  // Törlés naplózása
  try {
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });

    for (const file of deletedFiles) {
      await addDoc(collection(db, 'EventLog'), {
        action: 'delete',
        fileName: file.name,
        fileType: file.type,
        deletedBy: 'Emily Parker',
        deletedAt: serverTimestamp(),
        location: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        },
      });
    }
  } catch (error) {
    console.error("Error getting location:", error);
    locationError = true;

    // Naplózás hely nélkül
    for (const file of deletedFiles) {
      await addDoc(collection(db, 'EventLog'), {
        action: 'delete',
        fileName: file.name,
        fileType: file.type,
        deletedBy: 'Emily Parker',
        deletedAt: serverTimestamp(),
        location: null,
      });
    }
  }

  // Fájllista frissítése
  await fetchRecentUploads();
  setSelectedForDelete(new Set());
  setIsDeleteMode(false);

  // Toast üzenetek megjelenítése
  if (deletedFiles.length > 0) {
    toast({
      title: deletedFiles.length === 1 ? "File Deleted" : "Files Deleted",
      description: deletedFiles.length === 1
        ? "The selected file was successfully deleted!"
        : "The selected files were successfully deleted!",
    });
  }

  if (locationError) {
    toast({
      title: "Location Error",
      description: "Unable to record location data for this action.",
      variant: "destructive",
    });
  }
};
