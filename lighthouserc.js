module.exports = {
    ci: {
      collect: {
        // URLs to test - adjust these to match your app
        url: ['http://localhost:3003','http://localhost:3003/?account=2542'],
        
        // Command to start your dev server
        startServerCommand: 'npm run dev', // or 'npm start', 'yarn dev', etc.
        
        // Pattern to look for to know server is ready
        startServerReadyPattern: 'ready|listening|started',
        
        // How long to wait for server to start (in milliseconds)
        startServerReadyTimeout: 60000,
        
        // Number of runs for more accurate results
        numberOfRuns: 3,
      },
      
      // Performance thresholds - adjust these based on your requirements
      assert: {
        assertions: {
          'categories:performance': ['warn', {minScore: 0.8}],
          'categories:accessibility': ['warn', {minScore: 0.9}],
          'categories:best-practices': ['warn', {minScore: 0.9}],
          'categories:seo': ['warn', {minScore: 0.8}],
          
          // Core Web Vitals thresholds
          'first-contentful-paint': ['warn', {maxNumericValue: 2000}],
          'largest-contentful-paint': ['warn', {maxNumericValue: 2500}],
          'cumulative-layout-shift': ['warn', {maxNumericValue: 0.1}],
        },
      },
      
      // Upload results to temporary public storage for easy viewing
      upload: {
        target: 'temporary-public-storage',
      },
    },
  };