"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import {
  AlertCircleIcon,
  CheckCircle2Icon,
  FileArchiveIcon,
  FileIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  HeadphonesIcon,
  ImageIcon,
  Trash2Icon,
  UploadCloudIcon,
  UploadIcon,
  VideoIcon,
  XIcon,
  LockIcon,
} from "lucide-react"

import {
  formatBytes,
  useFileUpload,
} from "@/hooks/use-file-upload"
import { useDropboxUpload } from "@/hooks/use-dropbox-upload"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useAirtableAccountData } from "@/hooks/useAirtableAccountData"
import { useAirtableSundayPhotos } from "@/hooks/useAirtableSundayPhotos"
import { globalConfig } from "@/config/globalConfig"

// Create some dummy initial files
const initialFiles: never[] = []

const getFileIcon = (file: { file: File | { type: string; name: string } }) => {
  const fileType = file.file instanceof File ? file.file.type : file.file.type
  const fileName = file.file instanceof File ? file.file.name : file.file.name

  const iconMap = {
    pdf: {
      icon: FileTextIcon,
      conditions: (type: string, name: string) =>
        type.includes("pdf") ||
        name.endsWith(".pdf") ||
        type.includes("word") ||
        name.endsWith(".doc") ||
        name.endsWith(".docx"),
    },
    archive: {
      icon: FileArchiveIcon,
      conditions: (type: string, name: string) =>
        type.includes("zip") ||
        type.includes("archive") ||
        name.endsWith(".zip") ||
        name.endsWith(".rar"),
    },
    excel: {
      icon: FileSpreadsheetIcon,
      conditions: (type: string, name: string) =>
        type.includes("excel") ||
        name.endsWith(".xls") ||
        name.endsWith(".xlsx"),
    },
    video: {
      icon: VideoIcon,
      conditions: (type: string) => type.includes("video/"),
    },
    audio: {
      icon: HeadphonesIcon,
      conditions: (type: string) => type.includes("audio/"),
    },
    image: {
      icon: ImageIcon,
      conditions: (type: string) => type.startsWith("image/"),
    },
  }

  for (const { icon: Icon, conditions } of Object.values(iconMap)) {
    if (conditions(fileType, fileName)) {
      return <Icon className="size-5 opacity-60" />
    }
  }

  return <FileIcon className="size-5 opacity-60" />
}

const getFilePreview = (file: {
  file: File | { type: string; name: string; url?: string }
}) => {
  const fileType = file.file instanceof File ? file.file.type : file.file.type
  const fileName = file.file instanceof File ? file.file.name : file.file.name

  const renderImage = (src: string) => (
    <img
      src={src}
      alt={fileName}
      className="size-full rounded-t-[inherit] object-cover"
    />
  )

  return (
    <div className="bg-accent flex aspect-square items-center justify-center overflow-hidden rounded-t-[inherit]">
      {fileType.startsWith("image/") ? (
        file.file instanceof File ? (
          (() => {
            const previewUrl = URL.createObjectURL(file.file)
            return renderImage(previewUrl)
          })()
        ) : file.file.url ? (
          renderImage(file.file.url)
        ) : (
          <ImageIcon className="size-5 opacity-60" />
        )
      ) : (
        getFileIcon(file)
      )}
    </div>
  )
}

interface SocialMediaUploaderProps {
  accountNumber?: number;
}

export default function SocialMediaUploader({ accountNumber: propAccountNumber }: SocialMediaUploaderProps) {
  const searchParams = useSearchParams();
  const accountFromUrl = searchParams ? parseInt(searchParams.get('account') || '0') : 0;
  
  // Use account number from URL params if available, otherwise fall back to prop
  const accountNumber = accountFromUrl || propAccountNumber;
  
  const maxSizeMB = globalConfig.socialMediaUploader.maxFileSizeMB
  const maxSize = maxSizeMB * 1024 * 1024
  const maxFiles = globalConfig.socialMediaUploader.maxFiles
  const [uploading, setUploading] = useState(false)
  const [allUploadsComplete, setAllUploadsComplete] = useState(false)

  // Fetch all account data from Airtable (includes dropbox path, queue number, church name, etc.)
  const { 
    accountData, 
    dropboxPath, 
    queueNumber, 
    churchName, 
    loading: pathLoading, 
    error: pathError 
  } = useAirtableAccountData(accountNumber);

  // Check if Sunday photos have already been uploaded this week
  const { 
    sundayPhotosUploaded, 
    loading: sundayPhotosLoading, 
    error: sundayPhotosError 
  } = useAirtableSundayPhotos(
    globalConfig.socialMediaUploader.enableSundayPhotosLock ? accountNumber : undefined
  );

  const { uploadProgress, uploadToDropbox } = useDropboxUpload({
    accountNumber, // Pass account number to the upload hook
    onProgress: (fileId, progress) => {
      console.log(`File ${fileId} upload progress: ${progress}%`)
    },
    onComplete: (fileId, filePath) => {
      console.log(`File ${fileId} uploaded to: ${filePath}`)
    },
    onError: (fileId, error) => {
      console.error(`File ${fileId} upload error: ${error}`)
    }
  })

  // Debug logging (controlled by config)
  if (globalConfig.socialMediaUploader.showDebugLogs) {
    console.log('🔍 SocialMediaUploader Debug:');
    console.log('- Account Number prop:', propAccountNumber);
    console.log('- Account Number from URL:', accountFromUrl);
    console.log('- Final Account Number used:', accountNumber);
    console.log('- Account Number type:', typeof accountNumber);
    console.log('- Account Data:', accountData);
    console.log('- Dropbox Path:', dropboxPath);
    console.log('- Queue Number:', queueNumber);
    console.log('- Church Name:', churchName);
    console.log('- Sunday Photos Uploaded:', sundayPhotosUploaded);
  }

  const [
    { files, isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      clearFiles,
      getInputProps,
    },
  ] = useFileUpload({
    multiple: true,
    maxFiles,
    maxSize,
    initialFiles,
  })

  // Check if all uploads are complete
  useEffect(() => {
    if (files.length > 0 && uploading) {
      const uploadedFiles = files.filter(file => 
        uploadProgress[file.id] && uploadProgress[file.id].status === 'completed'
      );
      
      if (uploadedFiles.length === files.length) {
        setAllUploadsComplete(true);
        setUploading(false);
      }
    }
  }, [files, uploadProgress, uploading]);

  // Reset completion state when files change
  useEffect(() => {
    setAllUploadsComplete(false);
  }, [files.length]);

  const handleUpload = async () => {
    if (files.length === 0) return
    
    setUploading(true)
    setAllUploadsComplete(false)
    
    try {
      const uploadPromises = files.map((file) => {
        if (file.file instanceof File) {
          return uploadToDropbox(file.id, file.file)
        }
        return Promise.resolve()
      })
      
      await Promise.all(uploadPromises)
      
    } catch (error) {
      console.error("Upload failed:", error)
    }
  }

  const handleNewUpload = () => {
    clearFiles();
    setAllUploadsComplete(false);
  }

  // Show loading state if path or Sunday photos status is being fetched
  if ((pathLoading || (globalConfig.socialMediaUploader.enableSundayPhotosLock && sundayPhotosLoading)) && accountNumber) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p className="mt-2 text-sm text-gray-600">Loading upload configuration...</p>
      </div>
    );
  }

  // Show error if path couldn't be loaded
  if (pathError && accountNumber) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-red-600">
        <AlertCircleIcon className="h-8 w-8 mb-2" />
        <p className="text-sm">Failed to load upload configuration</p>
        <p className="text-xs text-gray-500 mt-1">{pathError}</p>
      </div>
    );
  }

  // Show locked state if Sunday photos have already been uploaded
  if (globalConfig.socialMediaUploader.enableSundayPhotosLock && sundayPhotosUploaded) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex flex-col items-center text-center">
          <div className="bg-orange-100 rounded-full p-2 mb-4">
            <LockIcon className="h-4 w-4 text-orange-600" />
          </div>
          <p className="text-muted-foreground max-w-sm text-sm font-medium">
            {globalConfig.socialMediaUploader.sundayPhotosLockMessage}
          </p>
        </div>
      </div>
    );
  }

  // Show error for Sunday photos status (but don't block functionality)
  if (sundayPhotosError && accountNumber) {
    console.warn('Warning: Could not check Sunday photos status:', sundayPhotosError);
  }

  // Get today's date for display
  const todaysDate = new Date().toLocaleDateString();

  return (
    <div className="flex flex-col gap-2">
      {/* Info about upload path */}
      {accountNumber && dropboxPath && globalConfig.socialMediaUploader.enabled && globalConfig.socialMediaUploader.showDestinationInfo && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
          <p className="text-sm text-blue-800">
            <strong>Upload Destination:</strong> Sunday Photos for {todaysDate}
            {globalConfig.socialMediaUploader.showChurchName && churchName && (
              <span className="ml-2">({churchName})</span>
            )}
          </p>
          {globalConfig.socialMediaUploader.showUploadPath && (
            <p className="text-xs text-blue-600 mt-1 truncate">
              {dropboxPath}/{globalConfig.socialMediaUploader.targetSubfolder}/{new Date().toISOString().split('T')[0]}/
            </p>
          )}
          {globalConfig.socialMediaUploader.showQueuePosition && queueNumber && (
            <p className="text-xs text-blue-600 mt-1">
              Queue Position: #{queueNumber}
            </p>
          )}
        </div>
      )}

      {/* Drop area */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        data-dragging={isDragging || undefined}
        data-files={files.length > 0 || undefined}
        className="border-input data-[dragging=true]:bg-accent/50 has-[input:focus]:border-ring has-[input:focus]:ring-ring/50 relative flex min-h-52 flex-col items-center overflow-hidden rounded-xl border border-dashed p-4 transition-colors not-data-[files]:justify-center has-[input:focus]:ring-[3px]"
      >
        <input
          {...getInputProps()}
          className="sr-only"
          aria-label="Upload image file"
        />
        {files.length > 0 ? (
          <div className="flex w-full flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="truncate text-sm font-medium">
                Files ({files.length})
              </h3>
              <div className="flex gap-2">
                {allUploadsComplete ? (
                  <Button variant="outline" size="sm" onClick={handleNewUpload}>
                    <UploadIcon
                      className="-ms-0.5 size-3.5 opacity-60"
                      aria-hidden="true"
                    />
                    New Upload
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" size="sm" onClick={openFileDialog} disabled={uploading}>
                      <UploadIcon
                        className="-ms-0.5 size-3.5 opacity-60"
                        aria-hidden="true"
                      />
                      Add files
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={clearFiles}
                      disabled={uploading}
                    >
                      <Trash2Icon
                        className="-ms-0.5 size-3.5 opacity-60"
                        aria-hidden="true"
                      />
                      Remove all
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm" 
                      onClick={handleUpload}
                      disabled={uploading || files.length === 0}
                    >
                      <UploadCloudIcon
                        className="-ms-0.5 size-3.5 mr-1"
                        aria-hidden="true"
                      />
                      {uploading ? 'Uploading...' : 'Upload to Dropbox'}
                    </Button>
                  </>
                )}
              </div>
            </div>

            {allUploadsComplete ? (
              <div className="flex flex-col items-center justify-center py-8">
                <CheckCircle2Icon className="size-6 text-green-500 mb-2" />
                <p className="text-green-600 font-medium text-sm mt-1">
                  {files.length === 1 ? 'Your file has' : 'All ' + files.length + ' files have'} been uploaded successfully
                </p>
                {accountNumber && dropboxPath && (
                  <p className="text-xs text-gray-500 mt-2">
                    Uploaded to Sunday Photos folder for {todaysDate}
                  </p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="bg-background relative flex flex-col rounded-md border"
                  >
                    {getFilePreview(file)}
                    <Button
                      onClick={() => removeFile(file.id)}
                      size="icon"
                      className="border-background focus-visible:border-background absolute -top-2 -right-2 size-6 rounded-full border-2 shadow-none"
                      aria-label="Remove image"
                      disabled={uploading}
                    >
                      <XIcon className="size-3.5" />
                    </Button>
                    <div className="flex min-w-0 flex-col gap-0.5 border-t p-3">
                      <p className="truncate text-[13px] font-medium">
                        {file.file.name}
                      </p>
                      <p className="text-muted-foreground truncate text-xs">
                        {formatBytes(file.file.size)}
                      </p>
                      {uploadProgress[file.id] && (
                        <div className="mt-2">
                          <Progress 
                            value={uploadProgress[file.id].progress} 
                            className="h-1" 
                          />
                          <p className="text-muted-foreground text-xs mt-1">
                            {uploadProgress[file.id].status === 'error' 
                              ? `Error: ${uploadProgress[file.id].error}` 
                              : uploadProgress[file.id].status === 'completed'
                                ? 'Upload complete'
                                : `${uploadProgress[file.id].progress}%`
                            }
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
            <div
              className="bg-background mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border"
              aria-hidden="true"
            >
              <ImageIcon className="size-4 opacity-60" />
            </div>
            <p className="mb-1.5 text-sm font-medium">{globalConfig.socialMediaUploader.customUploadText}</p>
            <p className="text-muted-foreground text-xs">
              Max {maxFiles} files ∙ Up to {maxSizeMB}MB each
            </p>
            <Button variant="outline" className="mt-4" onClick={openFileDialog}>
              <UploadIcon className="-ms-1 opacity-60" aria-hidden="true" />
              {globalConfig.socialMediaUploader.customButtonText}
            </Button>
          </div>
        )}
      </div>

      {errors.length > 0 && (
        <div
          className="text-destructive flex items-center gap-1 text-xs"
          role="alert"
        >
          <AlertCircleIcon className="size-3 shrink-0" />
          <span>{errors[0]}</span>
        </div>
      )}
    </div>
  )
} 