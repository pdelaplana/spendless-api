import { AuthHelper } from './../shared/auth-helper';
import { Account } from './../models/account';
import { ApiResponse } from './../models/api-response';
import * as express from 'express';


export const accountEndpoint =  (db: FirebaseFirestore.Firestore) => {
  const endpoint = express();
  const authHelper = AuthHelper();

  // get account
  endpoint.get('/', async (request, response) => {
    try {
      authHelper.decodeToken(request).then(async (token) => {
        const uid = token.uid;
        const account = await db.collection('accounts').doc(uid).get();
        response.json(<ApiResponse>{
          code: 'OK',
          description: 'Account', 
          data: <Account>{
            name: account.get('name'),
            email: account.get('email'),
            spendingLimit: account.get('spendingLimit')
          } 
        });
      })
      .catch((error) => {
        response.status(401).send(error);
      })
      
    } catch (error) {
      response.status(500).send(error);
    }

  })
  
  // add new account
  endpoint.post('/', async (request, response) => {
    try {    

      authHelper.decodeToken(request).then(async (token) => {
        const uid = token.uid;
        await db.collection('accounts').doc(uid).set({
          name: request.body.name,
          email: request.body.email,
          spendingLimit: request.body.spendingLimit || 1000
        });
        
        const account = await db.collection('accounts').doc(uid).get();
        
        response
          .status(200)
          .json(<ApiResponse>{
            code: 'OK',
            description: 'Account',
            data: <Account>{
              name: account.get('name'),
              email: account.get('email'),
              spendingLimit: account.get('spendingLimit'),
            }
          })
    
      }) 
      .catch((error) => {
        response.status(401).send(error);
      })

      
    } catch (error) {
          
      response.status(500).send(error)
    }        
  })

  // edit account
  endpoint.put('/', async (request, response) => {
 
    try {  
      console.info('[PUT] accounts');

      authHelper.decodeToken(request).then(async (token) => {
        const uid = token.uid;
        console.debug('uid', uid);
        
        let account = await db.collection('accounts').doc(uid).get();
        
        await db.collection('accounts').doc(uid).set({
          name: request.body['name'] || account.get('name'),
          email: request.body['email'] || account.get('email'),
          spendingLimit: request.body['spendingLimit'] || account.get('spendingLimit'),
        });
            
        account = await db.collection('accounts').doc(uid).get();
         
        response
          .status(200)
          .json(<ApiResponse>{
            code: 'OK',
            description: 'Account',
            data: <Account>{
              name: account.get('name'),
              email: account.get('email'),
              spendingLimit: account.get('spendingLimit'),
            }
          })
          

      })
      .catch((error) => {
        response.status(401).send(error);
      })

    } catch (error) {
          
      response.status(500).send(error)
    }        
  })

  // delete spending
  endpoint.delete('/:uid', async (request, response) => {
 
    try {  
      const uid = request.params.uid;
      await db.collection('accounts').doc(uid).delete();
         
      response
        .status(200)
        .json(<ApiResponse>{
          code: 'OK',
          description: 'Boolean',
          data: true
        })
        
    } catch (error) {
          
      response.status(500).send(error)
    }        
  })

  return endpoint;
}