const uploadImages = async () => {
  const response = await fetch('/api/upload-images', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      images: [
        { name: 'Laser Lemonade Machine', path: '/path/to/Laser_Lemonade_Machine.png' },
        { name: 'Hypernova Headphones', path: '/path/to/Hypernova_Headphones.png' },
      ]
    }),
  });

  const result = await response.json();
  console.log('Uploaded images:', result.uploadedImages);
};
