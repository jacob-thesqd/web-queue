export const globalConfig = {
  logoPath: "/squad-logo.svg",
  faviconPath: "/squad-logo.svg",
  siteTitle: "Strategy Squad Manager",
  fontFamily: "CalSans",
  termsUrl: "https://churchmediasquad.com/terms-of-service",
  components: {
    header: true,
    logo: true,
    dotGridBackground: true,
    clientSideDataFetching: true,
    churchWelcome: true,
    accountManager: true,
    layoutToggle: true,
    customScrollbar: true,
    milestoneTracking: true,
    airtableMilestoneStepper: true, // Enable Airtable data source for milestone stepper
    airtableQueueNumber: true, // Enable Airtable queue number integration
    socialMediaUploader: true, // Enable social media uploader with dynamic Dropbox paths
    airtableDepartmentFiltering: true, // Enable department-based card filtering
    discoverySubmissionModal: true, // Enable discovery questionnaire submission modal
    loadingOverlay: true // Enable glassmorphic loading overlay
  },
  loadingOverlay: {
    enabled: true, // Master toggle for loading overlay
    progressBarDuration: 1, // Progress bar completion time in seconds
    minimumDisplayTime: 4.5, // Minimum time overlay shows in seconds
    componentLoadingDelay: 200, // Delay for component loading detection in ms
    transitionDelay: 600, // Delay before hiding overlay after everything loads in ms
    domReadyDelay: 100, // Delay for DOM ready detection in ms
    initializationDelay: 250 // Delay for app initialization in ms
  },
  airtable: {
    cacheDuration: 60 * 60 * 1000, // 1 hour in milliseconds
    retryAttempts: 3, // Number of retry attempts for failed requests
    timeoutMs: 10000, // Request timeout in milliseconds
    createUploadRecords: true, // Create records in Airtable after successful Dropbox uploads
    enableGlobalApiCache: true, // Enable centralized API caching to prevent duplicate calls
    debugCaching: true // Show cache hit/miss logs in development
  },
  dropbox: {
    devMode: false, // Set to false in production
    devModeDBPath: "/Church Media Company Team Folder/2. Client Accounts/306 - Bogus Summit Sanctuary",
    productionPath: "/Church Media Company Team Folder/2. Client Accounts", // Production base path
    chunkSize: 149 * 1024 * 1024, // 149 MB chunks
    maxRetries: 3 // Number of retries for 409 errors
  },
  socialMediaUploader: {
    enabled: true, // Master toggle for social media uploader
    showDestinationInfo: false, // Show the blue upload destination info box
    showChurchName: false, // Show church name in upload destination
    showQueuePosition: true, // Show queue position in upload info
    showUploadPath: false, // Show full upload path to user
    customUploadText: "Drop your Sunday photos here", // Custom text for upload area
    customButtonText: "Select photos", // Custom text for file selection button
    showSuccessDetails: true, // Show detailed success message with destination
    showFilePreview: true, // Show file previews in upload area
    maxFileSizeMB: 20, // Maximum file size in MB
    maxFiles: 10, // Maximum number of files per upload
    autoDateFolder: true, // Automatically create date-based folders
    dateFormat: "YYYY-MM-DD", // Date format for folder creation
    targetSubfolder: "1. Client Assets/Sunday Photos", // Subfolder path within client directory
    allowedFileTypes: ["image/jpeg", "image/png", "image/webp", "image/heic"], // Allowed file types
    enforceFileTypeRestriction: false, // Strictly enforce file type restrictions
    showFileSizeInUI: true, // Show max file size info in UI
    showDebugLogs: false, // Show debug logs in console
    fallbackToGlobalPath: false, // Whether to fall back to global path if account lookup fails
    enableSundayPhotosLock: true, // Enable weekly upload limiting based on Airtable field
    sundayPhotosLockMessage: "Woops! You've already uploaded your Sunday photos for the week" // Custom message when uploads are locked
  }
}; 