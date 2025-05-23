export const globalConfig = {
  logoPath: "/squad-logo.svg",
  faviconPath: "/squad-logo.svg",
  siteTitle: "Strategy Squad Manager",
  fontFamily: "CalSans",
  components: {
    header: true,
    logo: true,
    dotGridBackground: true,
    clientSideDataFetching: true,
    churchWelcome: true,
    accountManager: true,
    layoutToggle: true,
    customScrollbar: true,
    milestoneTracking: true
  },
  dropbox: {
    devMode: true, // Set to false in production
    devModeDBPath: "/Church Media Company Team Folder/2. Client Accounts/306 - Bogus Summit Sanctuary",
    productionPath: "/Church Media Company Team Folder/2. Client Accounts/306 - Bogus Summit Sanctuary",
    chunkSize: 149 * 1024 * 1024, // 149 MB chunks
    maxRetries: 3 // Number of retries for 409 errors
  }
}; 