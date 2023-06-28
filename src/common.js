
export const chromeStorage = chrome.storage.sync;

export const SyncModes = Object.freeze({
  TO_JOURNAL: 'to_journal',
  TO_PAGE: 'to_page',
});


// returns [isValid, errorMessage]
export async function validateSyncOptions() {
  let errorMessage = '';
  const syncMode = await readStorage('syncMode');
  const syncTarget = await readStorage('syncTarget');
  if (syncMode === SyncModes.TO_PAGE && !syncTarget) {
    errorMessage += '- Please specify the page to sync to\n';
  }

  if (errorMessage) {
    return [false, errorMessage];
  } else {
    return [true, ''];
  }
}

export async function readStorage(key) {
  return (await chromeStorage.get(key))[key];
}