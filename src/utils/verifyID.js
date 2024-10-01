export default function verifyID(email, id, storageObject) {
  const records = storageObject[email];
  if (!records) {
    return false;
  }
  return records.some((record) => record.id === id);
}
