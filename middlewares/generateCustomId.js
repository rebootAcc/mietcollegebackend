exports.generateCustomId = async (Model, idField, prefix) => {
  const records = await Model.find({}, { [idField]: 1, _id: 0 }).sort({
    [idField]: 1,
  });

  const ids = records
    .map((record) => {
      if (record[idField]) {
        return parseInt(record[idField].replace(prefix, ""), 10);
      }
      return null;
    })
    .filter((id) => id !== null);

  let newId = 1;
  for (let i = 0; i < ids.length; i++) {
    if (newId < ids[i]) {
      break;
    }
    newId++;
  }

  return `${prefix}${String(newId).padStart(4, "0")}`;
};

exports.generateNestedCustomId = async (Model, nestedField, prefix) => {
  // Get all payment details across all patient records and extract paymentIds
  const records = await Model.find({}, { [nestedField]: 1, _id: 0 });
  const ids = [];

  records.forEach((record) => {
    record.paymentDetails.forEach((payment) => {
      if (payment.paymentId && payment.paymentId.startsWith(prefix)) {
        ids.push(parseInt(payment.paymentId.replace(prefix, ""), 10));
      }
    });
  });

  // Find the next unique ID
  let newId = 1;
  ids.sort((a, b) => a - b);
  for (let i = 0; i < ids.length; i++) {
    if (newId < ids[i]) {
      break;
    }
    newId++;
  }

  return `${prefix}${String(newId).padStart(4, "0")}`;
};
