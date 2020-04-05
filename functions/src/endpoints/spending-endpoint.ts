import * as express from 'express';
import * as admin from 'firebase-admin';
import * as moment from 'moment';
import { Spending } from '../models/spending';
import { ApiResponse } from '../models/api-response';
import { helpers } from '../shared/helpers';

export const spendingEndpoint =  (db: FirebaseFirestore.Firestore) => {
  const endpoint = express();

  // get list of spending
  endpoint.get('/', async (request, response) => {

    try {

      const idToken = helpers.getToken(request);

      admin.auth().verifyIdToken(idToken).then(async (decoded) => {

        const uid = decoded.uid;
        const month = request.query.m || moment().format('MMM');
        const year = request.query.y || moment().format('YYYY');
        const startDate = moment(`${month}-1-${year}`,'MMM-D-YYYY');
        const endDate = moment(startDate).endOf('month');
        console.log(startDate);
        console.log(endDate);
        const query = db.collection('accounts').doc(uid).collection('spending');

        const result = await query.where('date', '>', startDate.toDate()).where('date', '<=', endDate.toDate()).get();
        const spendingList: Spending[] = [];
        result.forEach(
          (doc) => {
            spendingList.push(<Spending>{
              id: doc.id, 
              date: doc.get('date').toDate(),
              amount: doc.get('amount'),
              description: doc.get('description'),
              location: doc.get('location'),
              category: doc.get('category'),
              notes: doc.get('notes')
            })
          }
        );
        // const spendingListSortedByDate = spendingList.sort((a: any, b: any) => {
        //  return a.data.date.getTime() - b.data.date.getTime();
        // });
        response.json(<ApiResponse>{
          code: 'OK',
          description: 'Spending[]', 
          data: spendingList 
        });

      })
      .catch((error) => {
        response.status(401).send(error);
      })


    } catch (error) {
      response.status(500).send(error);
    }

  })
  
  // add new spending
  endpoint.post('/', async (request, response) => {

    try {  

      const idToken = helpers.getToken(request);
      admin.auth().verifyIdToken(idToken).then(async (decoded) => {

        const uid = decoded.uid;
        const account = db.collection('accounts').doc(uid);

        const spendingRef =  await account.collection('spending').add({
          date: new Date(request.body['date']),
          amount: request.body['amount'],
          description: request.body['description'],
          location: request.body['location'],
          category: request.body['category'],
          notes: request.body['notes'] || ''
        });
        const spending = await spendingRef.get();
         
        response
          .status(200)
          .json(<ApiResponse>{
            code: 'OK',
            description: 'Spending',
            data: <Spending>{
              id: spending.id,
              date: spending.get('date').toDate(),
              amount: spending.get('amount'),
              description: spending.get('description'),
              location: spending.get('location'),
              category: spending.get('category'),
              notes: spending.get('notes')
            }
          })
          
      })
      .catch((error) => {
        response.status(500).send(error);
      })

    } catch (error) {
          
      response.status(500).send(error)
    }        
  })

  // edit spending
  endpoint.put('/', async (request, response) => {
 
    try {  
      
      const idToken = helpers.getToken(request);
      admin.auth().verifyIdToken(idToken).then(async (decoded) => {

        const uid = decoded.uid;
        const account = db.collection('accounts').doc(uid);
        const id = request.body['id'];
        await account.collection('spending').doc(id).set({
          date: new Date(request.body['date']),
          amount: request.body['amount'],
          description: request.body['description'],
          location: request.body['location'],
          category: request.body['category'],
          notes: request.body['notes'] || ''
        });
      
        const document = await account.collection('spending').doc(id).get();
        
        response
          .status(200)
          .json(<ApiResponse>{
            code: 'OK',
            description: 'Spending',
            data: <Spending>{
              id: document.id,
              date: document.get('date').toDate(),
              amount: document.get('amount'),
              description: document.get('description'),
              location: document.get('location'),
              category: document.get('category'),
              notes: document.get('notes')
            }
          })          

      })
      .catch((error) => {
        response.status(500).send(error);
      });

      
    } catch (error) {
          
      response.status(500).send(error)
    }        
  })

  // delete spending
  endpoint.delete('/', async (request, response) => {
 
    try {  
      const idToken = helpers.getToken(request);
      admin.auth().verifyIdToken(idToken).then(async (decoded) => {
      
        const uid = decoded.uid;
        const account = db.collection('accounts').doc(uid);
        const id = request.query.id;
        await account.collection('spending').doc(id).delete();
         
        response
          .status(200)
          .json(<ApiResponse>{
            code: 'OK',
            description: 'Boolean',
            data: true
          })
          
        
      })
      .catch((error) => { response.status(500).send(error);});


      
    } catch (error) {
          
      response.status(500).send(error)
    }        
  })

  return endpoint;
}