import { Request } from 'express';
import * as admin from 'firebase-admin';

export const AuthHelper = () => {

  return {
    decodeToken: function(request: Request) {
      const idToken = request.get('Authorization')?.split('Bearer ')[1] ||'';
      return admin.auth().verifyIdToken(idToken);
    }
  
  }
  

};
