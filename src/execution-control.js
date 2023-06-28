/* Control the execution of the crawler 
This file is used by both service worker and popup.

Stores a map of instance ID => InstanceInfo{ id, name, model, isActive }
*/

import { chromeStorage } from './common.js';

var cl = console.log;

// clear storage for testing
// chrome.storage.sync.clear();



class InstanceInfo {
  constructor(id, name, model, isActive) {
    this.id = id;
    this.name = name;
    this.model = model;
    this.isActive = isActive;
  }
}

export async function currentInstanceID() {
  return chrome.instanceID.getID();
}

export async function isCurrent(id) {
  const currentID = await currentInstanceID();
  cl(`currentID: ${currentID}, id: ${id}, euqal: ${currentID === id}`);
  return currentID === id;
}

export async function getInstances() {
  let instances = (await chromeStorage.get("instances")).instances;
  // Turn JSON into a map since chrome storage only stores JSON.
  return instances === undefined ? new Map() : new Map(Object.entries(instances));
}

export async function getInstanceById(id) {
  let instances = await getInstances();
  return instances.get(id);
}

export async function getCurrentInstance() {
  return await getInstanceById(await currentInstanceID());
}

export async function insertOrUpdateInstance(instanceInfo) {
  cl(`set instance:`);
  cl(instanceInfo);
  let instances = await getInstances();

  if (instanceInfo.isActive) {
    // Only one instance can be active at a time.
    for (let instance of instances.values()) {
      instance.isActive = false;
      instances.set(instance.id, instance);
    }
  }

  instances.set(instanceInfo.id, instanceInfo);
  await chromeStorage.set({ "instances": Object.fromEntries(instances) });
}

// Make sure current machine's information is synced to chrome storage,
// so it's known to other machines.
//
// When first registered, the instance is inactive. It will be set to active
// later by user manually.
//
// TODO: add a timeout to stored info, since instance ID can change
// e.g. https://stackoverflow.com/questions/42468802/
export async function syncInstances() {
  cl("call syncInstances");
  let instances = await getInstances();
  const currentInstance = {
    id: await currentInstanceID(),
    model: (await chrome.system.cpu.getInfo()).modelName,
    isActive: false
  };
  cl("savedInstances: ");
  cl(instances);

  // TODO: test-only, remove later
  const testInstance = {
    id: "the-other-instance",
    model: "windows",
    isActive: false
  };
  insertOrUpdateInstance(testInstance);

  // Don't override stored instance as it might be in different state.
  if (!instances.has(currentInstance.id)) {
    insertOrUpdateInstance(currentInstance);
  }
}

/* Determines whether the current extension instance should fetch tweets */
export async function eligibleToRun() {
  const instance = await getCurrentInstance();
  return instance.isActive;
}

export async function activateInstanceById(id) {
  const instance = await getInstanceById(id);
  instance.isActive = true;
  await insertOrUpdateInstance(instance);
}