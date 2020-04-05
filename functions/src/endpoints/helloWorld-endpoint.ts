import * as express from 'express';

export const helloWorldEndpoint =  (db: FirebaseFirestore.Firestore) => {
  const endpoint = express();

  endpoint.get('/', (request, response)=> {
    response.status(200).send('Hello World')
  });

  return endpoint;
}