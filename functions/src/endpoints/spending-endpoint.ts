import { AuthHelper } from './../shared/auth-helper';
import * as express from 'express';
import * as moment from 'moment';
import { Spending } from '../models/spending';
import { ApiResponse } from '../models/api-response';


export const spendingEndpoint =  (db: FirebaseFirestore.Firestore) => {
  const endpoint = express();
  const authHelper = AuthHelper();
  const pageSize = 10;

  const buildQuery = async (uid:string, startDate:Date, endDate:Date, size:number = 10 ) => {
    const spendingList: Spending[] = [];

    const query = db.collection('accounts').doc(uid).collection('spending')
      .where('date', '>', startDate)
      .where('date', '<=', endDate)
      .orderBy('date', 'desc');
      //.limit(size); TODO: Temporarily disable paging logic

    await query.get().then(results => {
      results.forEach(
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
    });
    
    return spendingList;
  }

  const buildQueryFromLastDoc = async (uid: string, id: string, startDate:Date, endDate:Date, size: number = 10) => {
    const spendingList: Spending[] = [];
    const account = db.collection('accounts').doc(uid);

    await account.collection('spending').doc(id).get().then(async snapshot  => {
      
      const query = account.collection('spending')
                .where('date', '>', startDate)
                .where('date', '<=', endDate)
                .orderBy('date', 'desc')
                .startAfter(snapshot.get('date'));
                //.limit(size); TODO: Temporarily disable paging logic
      await query.get()
          .then(items => {
            items.forEach(
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
            )
          })
          .catch(error => console.error(error));
      
    }).catch(error => console.error(error))

    return spendingList;

    
  }

  // get list of spending
  endpoint.get('/', async (request, response) => {

    try {

      authHelper.decodeToken(request).then(async (decoded) => {
 
        console.info('endpoint: api/spending/get', request);

        const uid = decoded.uid;
        // const lastDocId = request.query.last ?? null;
        const lastDocId = null;  // TODO: temporarily disable paging location
        const size: number = request.query.size ? parseInt(request.query.size) : pageSize;
        const month = request.query.m ?? moment().format('MMM');
        const year = request.query.y ?? moment().format('YYYY');

        const startDate = moment(`${month}-1-${year}`,'MMM-D-YYYY');
        const endDate = moment(startDate).endOf('month');

        if (lastDocId !== null){

          await buildQueryFromLastDoc(uid, lastDocId, startDate.toDate(), endDate.toDate(), size)
            .then(result => {
              response.json(<ApiResponse>{
                code: 'OK',
                description: 'Spending[]', 
                data: result 
              });
            });
            
        } else {

          await buildQuery(uid, startDate.toDate(), endDate.toDate(), size)
            .then(result => {
              response.json(<ApiResponse>{
                code: 'OK',
                description: 'Spending[]', 
                data: result 
              });
            })
        }
        
      })
      .catch((error) => {
        console.error('endpoint: /api/account/get', error);
        response.status(401).send(error);
      })

    } catch (error) {
      response.status(500).send(error);
    }

  })
  
  // add new spending
  endpoint.post('/', async (request, response) => {

    try {  

      authHelper.decodeToken(request).then(async (decoded) => {

        console.info('executing endpoint => api/spending/post');

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
      
      authHelper.decodeToken(request).then(async (decoded) => {

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
      authHelper.decodeToken(request).then(async (decoded) => {
      
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