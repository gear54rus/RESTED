import Immutable from 'immutable';
import { requestID } from 'utils/request';

// Checks whether the collection name is taken
function isUnique(name, collections) {
  return collections.every(item => (
    item.name.trim() !== name.trim()
  ));
}

/**
 * Creates a new collection, factoring in the names of
 * the collections that already exist
 */
export default function newCollection(collections, requests = []) {
  let i = 0;
  let name;

  do {
    name = `Collection${i ? ` ${i}` : ''}`;
    i += 1;
  } while (!isUnique(name, collections));

  return Immutable.fromJS({
    name,
    id: requestID(),
    minimized: false,
    requests,
  });
}
