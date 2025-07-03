import React, { useRef } from 'react';

const FileUploadButton = () => {
  const fileInput = useRef<HTMLInputElement>(null);

  // Function to trigger the file input click event
  const handleButtonClick = () => {
    if (!fileInput.current) return; 
    fileInput.current.click(); 
  };

  // Function to handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return; 
    const file = event.target.files[0];
    if (file) {
      console.log('File selected:', file);
      // You can perform your logic here to display the file or upload it
    }
  };

  return (
    <div>
      <button onClick={handleButtonClick}>Upload File</button>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInput}
        style={{ display: 'none' }} // Hide the file input
        onChange={handleFileChange}
      />
    </div>
  );
};

export default FileUploadButton;
