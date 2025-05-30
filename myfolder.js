const fs = require('fs').promises; // Use promises for async/await

async function matchFilename(jsonFilePath, tradeTypeId, requiredFilename) {
  try {
    // Read and parse the JSON file
    const data = await fs.readFile(jsonFilePath, 'utf8');
    const jsonData = JSON.parse(data);

    // Filter documents by trade_type_id
    const documents = jsonData.selectdocuments.filter(
      (doc) => doc.trade_type_id === tradeTypeId
    );

    // Check if any document_type matches the required filename
    const matchedDocument = documents.find(
      (doc) => doc.document_type === requiredFilename
    );

    if (matchedDocument) {
      console.log(
        `Match found for trade_type_id ${tradeTypeId}: ${matchedDocument.document_type} (${matchedDocument.document_types_opt_man})`
      );
      return matchedDocument;
    } else {
      console.log(
        `No match found for document_type "${requiredFilename}" with trade_type_id ${tradeTypeId}`
      );
      return null;
    }
  } catch (error) {
    console.error('Error reading or processing JSON file:', error.message);
    return null;
  }
}

// Example usage
const jsonFilePath = './jsonfiles/tradetypeselectdocuments.json'; // Path to your JSON file
const tradeTypeId = '1'; // Example trade_type_id
const requiredFilename = 'Police Check'; // Example document_type to match
matchFilename(jsonFilePath, tradeTypeId, requiredFilename);