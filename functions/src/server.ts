import { accountEndpoint } from './endpoints/account-endpoint';
import { spendingEndpoint } from './endpoints/spending-endpoint';
import * as express from 'express';
import * as cors from 'cors';
import { helloWorldEndpoint } from './endpoints/helloWorld-endpoint';

export const server = (db: FirebaseFirestore.Firestore) => {
  const main = express();
  
  // main.use(cors({origin:true}));
  main.use(cors());

  // routes
  main.use('/v1/spending', spendingEndpoint(db));
  main.use('/v1/accounts', accountEndpoint(db));
  main.use('/v1/helloworld', helloWorldEndpoint(db));

  // main.use(bodyParser.json());
  // main.use(bodyParser.urlencoded({ extended: false }));
  main.use(express.json());
  main.use(express.urlencoded({ extended: false }));

  return main;

}