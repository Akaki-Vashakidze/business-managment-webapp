export interface Business {
    _id: string;
    name: string;
}

export interface Record {
 state: number;
 isDeleted: number;
 createdAt: string;
}

export interface branch {
    name:string;
    business:string;
    _id:string;
}