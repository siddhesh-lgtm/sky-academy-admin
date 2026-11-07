import type {Role,ModuleId,Center,Passport,Session,Booking,Feature,ParentAccount} from './types';
export const moduleMeta:{id:ModuleId;label:string;group:string;desc:string}[]=[
{id:'dashboard',label:'Dashboard',group:'Overview',desc:'Key academy numbers and today’s operations'},
{id:'centers',label:'Center Management',group:'Organization',desc:'Active centers and training infrastructure'},
{id:'applications',label:'Center Applications',group:'Organization',desc:'Maker-checker onboarding review queue'},
{id:'users',label:'Users & Roles',group:'Organization',desc:'Web admin accounts only (3 roles)'},
{id:'staff',label:'Staff & Coaches',group:'Organization',desc:'Center-scoped staff and coach assignments'},
{id:'players',label:'Parents & Players',group:'Members',desc:'Guardians, children, consents and profiles'},
{id:'passports',label:'Passport Management',group:'Training',desc:'Training passes, access and session credits'},
{id:'sessions',label:'Session Management',group:'Training',desc:'Schedules, coaches, availability and capacity'},
{id:'bookings',label:'Bookings & Attendance',group:'Training',desc:'Session reservations and attendance records'},
{id:'assessments',label:'Assessments',group:'Training',desc:'Templates and player development tracking'},
{id:'payments',label:'Payments & Finance',group:'Business',desc:'Orders, transactions and refunds'},
{id:'reports',label:'Reports & Analytics',group:'Business',desc:'Utilization and revenue reporting'},
{id:'cms',label:'Website CMS',group:'Platform',desc:'Public website content and publishing'},
{id:'features',label:'Module & Feature Flags',group:'Platform',desc:'Feature availability by app surface'},
{id:'settings',label:'Settings & Audit Logs',group:'Platform',desc:'Policies, security and activity tracking'}
];
export const permissions:Record<Role,ModuleId[]>={
'SKY Super Admin':moduleMeta.map(m=>m.id),
'Finance / Accounts':['dashboard','passports','payments','reports'],
'Center Admin':['dashboard','centers','staff','players','passports','sessions','bookings','assessments','reports']
};
export const seedCenters:Center[]=[
{id:1,name:'SKY Andheri Cricket Hub',city:'Mumbai',area:'Andheri West',address:'Andheri West, Mumbai',sports:['Cricket'],status:'Active',coaches:8,capacity:18},
{id:2,name:'SKY Powai Cricket Arena',city:'Mumbai',area:'Powai',address:'Hiranandani Gardens, Powai',sports:['Cricket'],status:'Active',coaches:6,capacity:16},
{id:3,name:'SKY Thane Cricket Academy',city:'Thane',area:'Ghodbunder Road',address:'Ghodbunder Road, Thane',sports:['Cricket'],status:'Active',coaches:5,capacity:20},
{id:4,name:'SKY Bandra Cricket Center',city:'Mumbai',area:'Bandra West',address:'Bandra West, Mumbai',sports:['Cricket'],status:'Active',coaches:7,capacity:16},
{id:5,name:'SKY Navi Mumbai Cricket',city:'Navi Mumbai',area:'Vashi',address:'Vashi, Navi Mumbai',sports:['Cricket'],status:'Pending',coaches:0,capacity:14}
];
export const seedPassports:Passport[]=[
{id:1,name:'Trial Passport',duration:7,credits:1,price:0,access:'Selected centers',status:'Active'},
{id:2,name:'SKY Starter',duration:30,credits:5,price:2499,access:'All eligible centers',status:'Active'},
{id:3,name:'SKY Plus',duration:60,credits:12,price:5499,access:'All eligible centers',status:'Active'},
{id:4,name:'SKY Pro',duration:90,credits:20,price:8499,access:'All eligible centers',status:'Active'},
];
export const seedSessions:Session[]=[
{id:101,title:'Cricket Fundamentals U12',sport:'Cricket',center:'SKY Andheri Cricket Hub',coach:'Rahul Sharma',date:'2026-11-07',time:'07:00',capacity:12,booked:9,status:'Open'},
{id:102,title:'Batting Technique U10',sport:'Cricket',center:'SKY Powai Cricket Arena',coach:'Aditya Mehta',date:'2026-11-07',time:'09:00',capacity:12,booked:12,status:'Full'},
{id:103,title:'Bowling Basics U11',sport:'Cricket',center:'SKY Powai Cricket Arena',coach:'Priya Nair',date:'2026-11-08',time:'17:00',capacity:10,booked:6,status:'Open'},
{id:104,title:'Cricket Match Practice',sport:'Cricket',center:'SKY Thane Cricket Academy',coach:'Sameer Patil',date:'2026-11-08',time:'08:00',capacity:16,booked:11,status:'Open'},
{id:105,title:'Fielding & Fitness U12',sport:'Cricket',center:'SKY Bandra Cricket Center',coach:'Aditya Mehta',date:'2026-11-09',time:'18:00',capacity:14,booked:8,status:'Open'},
];
export const seedBookings:Booking[]=[
{id:'BK-1001',player:'Aarav Patel',age:10,parent:'Neha Patel',session:'Cricket Fundamentals U12',center:'SKY Andheri Cricket Hub',passport:'SKY Starter',status:'Confirmed'},
{id:'BK-1002',player:'Riya Shah',age:9,parent:'Pooja Shah',session:'Batting Technique U10',center:'SKY Powai Cricket Arena',passport:'SKY Plus',status:'Confirmed'},
{id:'BK-1003',player:'Vivaan Rao',age:11,parent:'Anita Rao',session:'Bowling Basics U11',center:'SKY Powai Cricket Arena',passport:'SKY Starter',status:'Attended'},
{id:'BK-1004',player:'Anaya Desai',age:8,parent:'Kiran Desai',session:'Cricket Match Practice',center:'SKY Thane Cricket Academy',passport:'SKY Pro',status:'Confirmed'},
{id:'BK-1005',player:'Kabir Singh',age:12,parent:'Meera Singh',session:'Fielding & Fitness U12',center:'SKY Bandra Cricket Center',passport:'SKY Plus',status:'Cancelled'}
];
/** Parent / guardian accounts for Admin → Parents & Players (FE demo). */
export const seedParents:ParentAccount[]=[
{id:'PAR-1001',name:'Neha Patel',email:'neha@example.com',phone:'+91 98765 41001',city:'Mumbai',status:'Active',loginEnabled:true,password:'parent123',consentMedia:true,consentLocation:true,children:[{id:'CH-1001',name:'Aarav Patel',age:10,passport:'SKY Starter',status:'Active'}]},
{id:'PAR-1002',name:'Pooja Shah',email:'pooja@example.com',phone:'+91 98765 41002',city:'Mumbai',status:'Active',loginEnabled:true,password:'parent123',consentMedia:true,consentLocation:false,children:[{id:'CH-1002',name:'Riya Shah',age:9,passport:'SKY Plus',status:'Active'}]},
{id:'PAR-1003',name:'Anita Rao',email:'anita@example.com',phone:'+91 98765 41003',city:'Navi Mumbai',status:'Active',loginEnabled:true,password:'parent123',consentMedia:false,consentLocation:true,children:[{id:'CH-1003',name:'Vivaan Rao',age:11,passport:'SKY Starter',status:'Active'}]},
{id:'PAR-1004',name:'Kiran Desai',email:'kiran@example.com',phone:'+91 98765 41004',city:'Thane',status:'Active',loginEnabled:true,password:'parent123',consentMedia:true,consentLocation:true,children:[{id:'CH-1004',name:'Anaya Desai',age:8,passport:'SKY Pro',status:'Active'}]},
{id:'PAR-1005',name:'Meera Singh',email:'meera@example.com',phone:'+91 98765 41005',city:'Mumbai',status:'Active',loginEnabled:false,password:'parent123',consentMedia:true,consentLocation:true,children:[{id:'CH-1005',name:'Kabir Singh',age:12,passport:'SKY Plus',status:'Active'}]},
];
export const seedFeatures:Feature[]=[
{id:'passport.purchase',name:'Passport Purchase',parent:true,coach:false,web:true,admin:true},
{id:'session.booking',name:'Session Booking',parent:true,coach:true,web:false,admin:true},
{id:'session.evidence',name:'Coach Photo / Video Evidence',parent:false,coach:true,web:false,admin:true},
{id:'assessments',name:'Player Assessments',parent:true,coach:true,web:false,admin:true},
{id:'session.waitlist',name:'Session Waitlist',parent:false,coach:false,web:false,admin:false},
{id:'centers.directory',name:'Center Directory',parent:true,coach:false,web:true,admin:true},
{id:'tournaments',name:'Tournaments',parent:false,coach:false,web:false,admin:false}
];
export const users=[
{name:'SKY Platform Owner',email:'superadmin@skyacademy.demo',role:'SKY Super Admin',center:'All centers',status:'Active'},
{name:'Sneha Joshi',email:'finance@skyacademy.demo',role:'Finance / Accounts',center:'Platform-wide',status:'Active'},
{name:'Vikram Desai',email:'vikram@skyacademy.demo',role:'Center Admin',center:'SKY Andheri Cricket Hub',status:'Active'},
{name:'Rahul Sharma',email:'rahul@skyacademy.demo',role:'Head Coach',center:'SKY Andheri Cricket Hub',status:'Active'},
{name:'Amit Kulkarni',email:'amit@skyacademy.demo',role:'Coach',center:'SKY Andheri Cricket Hub',status:'Active'},
{name:'Sonal Verma',email:'sonal@skyacademy.demo',role:'Coach',center:'SKY Andheri Cricket Hub',status:'Active'},
{name:'Meera Iyer',email:'meera.iyer@skyacademy.demo',role:'Center Admin',center:'SKY Powai Cricket Arena',status:'Active'},
{name:'Aditya Mehta',email:'aditya@skyacademy.demo',role:'Head Coach',center:'SKY Powai Cricket Arena',status:'Active'},
{name:'Priya Nair',email:'priya@skyacademy.demo',role:'Coach',center:'SKY Powai Cricket Arena',status:'Active'},
{name:'Ravi Shetty',email:'ravi@skyacademy.demo',role:'Coach',center:'SKY Powai Cricket Arena',status:'Active'},
{name:'Karan Joshi',email:'karan@skyacademy.demo',role:'Center Admin',center:'SKY Thane Cricket Academy',status:'Active'},
{name:'Sameer Patil',email:'sameer@skyacademy.demo',role:'Head Coach',center:'SKY Thane Cricket Academy',status:'Active'},
{name:'Nisha Kadam',email:'nisha@skyacademy.demo',role:'Coach',center:'SKY Thane Cricket Academy',status:'Active'},
{name:'Farhan Ali',email:'farhan@skyacademy.demo',role:'Center Admin',center:'SKY Bandra Cricket Center',status:'Active'},
{name:'Leena Dsouza',email:'leena@skyacademy.demo',role:'Head Coach',center:'SKY Bandra Cricket Center',status:'Active'},
{name:'Rohan Kapoor',email:'rohan@skyacademy.demo',role:'Coach',center:'SKY Bandra Cricket Center',status:'Active'},
{name:'Neha Patel',email:'neha@example.com',role:'Parent / Guardian',center:'No fixed center',status:'Active'},
];
/** Demo web-admin logins (same admin panel; Center Admin is center-scoped). */
export const authAccounts:{email:string;password:string;name:string;role:Role;center:string}[]=[
{email:'superadmin@skyacademy.demo',password:'super123',name:'SKY Platform Owner',role:'SKY Super Admin',center:'All centers'},
{email:'vikram@skyacademy.demo',password:'center123',name:'Vikram Desai',role:'Center Admin',center:'SKY Andheri Cricket Hub'},
{email:'finance@skyacademy.demo',password:'finance123',name:'Sneha Joshi',role:'Finance / Accounts',center:'Platform-wide'},
];
export const payments=[
{id:'TXN-0921',parent:'Neha Patel',passport:'SKY Starter',amount:2499,date:'Nov 05, 2026',status:'Successful'},
{id:'TXN-0920',parent:'Pooja Shah',passport:'SKY Plus',amount:5499,date:'Nov 04, 2026',status:'Successful'},
{id:'TXN-0919',parent:'Kiran Desai',passport:'SKY Pro',amount:8499,date:'Nov 04, 2026',status:'Successful'},
{id:'TXN-0918',parent:'Anita Rao',passport:'SKY Starter',amount:2499,date:'Nov 03, 2026',status:'Refund Requested'},
{id:'TXN-0917',parent:'Meera Singh',passport:'SKY Plus',amount:5499,date:'Nov 03, 2026',status:'Failed'}
];
export const activity=[
{action:'Center application submitted',entity:'SKY Navi Mumbai Cricket',by:'Applicant',time:'8 min ago'},
{action:'Passport purchased',entity:'SKY Starter · Aarav Patel',by:'Neha Patel',time:'21 min ago'},
{action:'Session roster updated',entity:'Cricket Fundamentals U12',by:'Rahul Sharma',time:'47 min ago'},
{action:'Assessment template published',entity:'Cricket Batting Skills v2',by:'SKY Platform Owner',time:'Yesterday'},
{action:'Web user signed in',entity:'Admin panel',by:'SKY Platform Owner',time:'2 min ago'},
{action:'Feature flag reviewed',entity:'passport.purchase',by:'SKY Platform Owner',time:'1 hr ago'},
{action:'Center approved',entity:'SKY Bandra Cricket Center',by:'SKY Platform Owner',time:'3 hr ago'},
{action:'Refund queued',entity:'TXN-0918',by:'Sneha Joshi',time:'35 min ago'},
{action:'Payment statement exported',entity:'Nov 2026 finance pack',by:'Sneha Joshi',time:'2 hr ago'},
{action:'Failed payment flagged',entity:'TXN-0917',by:'Sneha Joshi',time:'Yesterday'},
{action:'Session capacity updated',entity:'Cricket Fundamentals U12',by:'Vikram Desai',time:'18 min ago'},
{action:'Staff assigned',entity:'Rahul Sharma · Head Coach',by:'Vikram Desai',time:'4 hr ago'},
{action:'Attendance marked',entity:'Aarav Patel · Confirmed',by:'Vikram Desai',time:'Yesterday'},
];
