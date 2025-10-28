'use client'

import { Button } from '@/components/ui/button';
import { showToast } from '@/lib/showToast';
import axios from 'axios';
import { CldUploadWidget } from 'next-cloudinary';
import { FaPlus } from 'react-icons/fa';

const UploadMedia = ({ isMultiple = true }) => {
  const handleOnError = (error) => {
    console.error('Upload error:', error);
    showToast('error', error.statusText || 'Upload failed');
  }

  // This fires when ALL uploads in the queue complete
  const handleOnQueuesEnd = async (result, { widget }) => {
    console.log('All uploads complete:', result);
    
    const files = result.info?.files;
    
    if (!files || files.length === 0) {
      showToast('error', 'No files uploaded');
      return;
    }

    // Filter successful uploads
    const uploadedFiles = files
      .filter(file => file.uploadInfo && !file.failed)
      .map(file => {
        const info = file.uploadInfo;
        return {
          title: info.original_filename || info.public_id,
          alt: info.original_filename || '',
          thumbnail_url: info.thumbnail_url || info.secure_url,
          path: info.path || info.public_id,
          asset_id: info.asset_id,
          public_id: info.public_id,
          secure_url: info.secure_url,
          url: info.url,
          format: info.format,
          resource_type: info.resource_type,
          width: info.width,
          height: info.height,
          bytes: info.bytes,
          folder: info.folder || 'wallframe',
          created_at: info.created_at,
        };
      });

    if (uploadedFiles.length === 0) {
      showToast('error', 'All uploads failed');
      return;
    }

    console.log('Saving to database:', uploadedFiles);

    try {
      const { data: mediaUploadResponse } = await axios.post(
        '/api/media/create', 
        uploadedFiles
      );
      
      if (!mediaUploadResponse.success) {
        throw new Error(mediaUploadResponse.message);
      }
      
      showToast('success', `${uploadedFiles.length} file(s) saved successfully`);
      widget.close(); // Close widget after successful save
      
    } catch (error) {
      console.error('Database save error:', error);
      const errorMessage = error.response?.data?.message || error.message;
      showToast('error', errorMessage);
    }
  }

  return (
    <CldUploadWidget 
      signatureEndpoint="/api/cloudinary-signature"
      uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
      options={{
        multiple: isMultiple,
        sources: ['local', 'url', 'unsplash', 'google_drive'],
        folder: 'wallframe',
        maxFiles: isMultiple ? 20 : 1,
      }}
      onError={handleOnError}
      onQueuesEnd={handleOnQueuesEnd} // ✅ This is the correct callback
    >
      {({ open }) => {
        return (
          <Button onClick={() => open()}>
            <FaPlus className="mr-2" />
            Upload Media
          </Button>
        );
      }}
    </CldUploadWidget>
  )
}

export default UploadMedia
