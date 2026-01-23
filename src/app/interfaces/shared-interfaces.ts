export interface Business {
    _id: string;
    name: string;
}

export interface Record {
 state: number;
 isDeleted: number;
 createdAt: string;
}

export interface Branch {
    name:string;
    business:string;
    _id?:string;
}

export interface BranchItem {
  _id: string;
  name: string;
  branch:string;
}