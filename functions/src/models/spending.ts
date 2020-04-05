export interface ISpendingStore {
  date: Date;
  description: string;
  location: string;
  category: string;
  amount: number;
  notes: string;
  
}
export class Spending implements ISpendingStore {
  id: string;
  date: Date;
  description: string;
  location: string;
  category: string;
  amount: number;
  notes: string;
  

  constructor(id: string, date: Date, description: string, location: string, category: string, amount: number, notes: string) {
    this.id = id;
    this.date = date;
    this.description = description;
    this.location = location;
    this.category = category;
    this.amount = amount;
    this.notes = notes;
  }
}