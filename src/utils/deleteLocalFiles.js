import fs from "fs";
const deleteLocalFiles = (filePaths) => {
  filePaths.forEach((filePath) => {
    fs.unlink(filePath, (err) => {
      if (err) console.error(`Error deleting file ${filePath}:`, err);
      else console.log(`File ${filePath} deleted successfully.`);
    });
  });
};

export { deleteLocalFiles };
