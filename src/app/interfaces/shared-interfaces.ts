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

export interface ReserveItem {
    startHour: number;
    endHour: number;
    startMinute: number;
    endMinute: number;
    item: string;
    date: string;
    user:string;
}

export interface User {
    _id: string;
    fullName: string;
    email: string;
    mobileNumber: string;
    isManager: number;
    isOwner: number;
    qrCode:string;
    business:string;
    record:Record;
}

export interface ItemManagement {
    _id?: string;
    user:string;
    item?:string | null;
    acceptedBy?:string;
    startHour:number;
    startMinute:number;
    endHour:number;
    endMinute:number;
    date:string;
    isPaid:number;
    accepted?:number;

}
