export type Role = 'SKY Super Admin'|'Finance / Accounts'|'Center Admin';
export type ModuleId = 'dashboard'|'centers'|'users'|'staff'|'players'|'passports'|'sessions'|'bookings'|'assessments'|'payments'|'cms'|'features'|'reports'|'settings';
export type Center={id:number;name:string;city:string;area:string;address:string;sports:string[];status:'Active'|'Pending'|'Suspended';coaches:number;capacity:number};
export type Passport={id:number;name:string;duration:number;credits:number;price:number;access:string;status:'Active'|'Draft'};
export type Session={id:number;title:string;sport:string;center:string;coach:string;date:string;time:string;capacity:number;booked:number;status:'Open'|'Full'|'Completed'|'Cancelled'};
export type Booking={id:string;player:string;age:number;parent:string;session:string;center:string;passport:string;status:'Confirmed'|'Attended'|'Cancelled'|'No Show'};
export type Feature={id:string;name:string;parent:boolean;coach:boolean;web:boolean;admin:boolean};
