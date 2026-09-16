import { useEffect } from 'react';

/**
 * Hook to trigger re-renders when localStorage state changes via storage.js
 * 
 * @param {Function} callback - The function to call when the 'mindora-storage-update' event is dispatched.
 */
export function useStorageListener(callback) {
  useEffect(() => {
    const handleUpdate = (event) => {
      // You can also inspect event.detail.key and event.detail.value if you only want to react to specific changes
      if (callback) {
        callback(event.detail);
      }
    };
    window.addEventListener('mindora-storage-update', handleUpdate);
    return () => {
      window.removeEventListener('mindora-storage-update', handleUpdate);
    };
  }, [callback]);
}
