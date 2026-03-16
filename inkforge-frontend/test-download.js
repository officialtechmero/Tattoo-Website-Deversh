
async function testDownload() {
  const testUrl = "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&q=80&w=1000";
  const apiUrl = `http://localhost:5051/api/download-image?url=${encodeURIComponent(testUrl)}&name=test-image`;

  console.log(`Testing download API with: ${apiUrl}`);
  
  try {
    const response = await fetch(apiUrl);
    console.log(`Status: ${response.status}`);
    console.log(`Headers:`, Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const buffer = await response.arrayBuffer();
      console.log(`Success! Received ${buffer.byteLength} bytes.`);
    } else {
      const text = await response.text();
      console.error(`Failed: ${text}`);
    }
  } catch (error) {
    console.error(`Error:`, error);
  }
}

testDownload();
