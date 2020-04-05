import { Request } from "express";

export const helpers = {
  getToken: function(request: Request){
    return request.get('Authorization')?.split('Bearer ')[1] ||'';
  }
};

