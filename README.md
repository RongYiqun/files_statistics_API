# files_statistics_API

Develop an API for processing analytics files for Publift

To start the program, run `npm start` in command line

To run tests, run `npm test` in commnad line

To avoid "port in use" error, please don't run the program and the test in the same time. Please keep original files in "analytics" folder and "uploads" to run the tests.

API:

1.  '/upload' : When making a request to this endpont, remember to attaced csv file with name field 'file'.
2.  '/analytics/file/:id' : When making a request to this endpont, ':id' means the fileId return from the upload endpoint after successful file load.
