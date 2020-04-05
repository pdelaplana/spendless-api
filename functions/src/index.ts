import { db } from './firebase';
import { server } from './server';
import * as functions from 'firebase-functions';
// import * as bodyParser from 'body-parser';

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });


const main = server(db);

export const api = functions.https.onRequest(main);



