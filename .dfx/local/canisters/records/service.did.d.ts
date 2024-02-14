import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface _SERVICE {
  'createHealthRecord' : ActorMethod<
    [string, string, string, string],
    {
        'Ok' : {
          'id' : Principal,
          'doctorId' : string,
          'prescription' : string,
          'patientId' : string,
          'diagnosis' : string,
        }
      } |
      {
        'Err' : { 'HealthRecordDoesNotExist' : string } |
          { 'StaffDoesNotExist' : string } |
          { 'PatientDoesNotExist' : string }
      }
  >,
  'createPatient' : ActorMethod<
    [string, number, string, string],
    {
      'id' : Principal,
      'age' : number,
      'bloodType' : string,
      'name' : string,
      'healthRecordIds' : Array<string>,
      'gender' : string,
    }
  >,
  'createStaff' : ActorMethod<
    [string, string],
    { 'id' : Principal, 'name' : string, 'role' : string }
  >,
  'readHealthRecordById' : ActorMethod<
    [string],
    [] | [
      {
        'id' : Principal,
        'doctorId' : string,
        'prescription' : string,
        'patientId' : string,
        'diagnosis' : string,
      }
    ]
  >,
  'readPatientById' : ActorMethod<
    [string],
    [] | [
      {
        'id' : Principal,
        'age' : number,
        'bloodType' : string,
        'name' : string,
        'healthRecordIds' : Array<string>,
        'gender' : string,
      }
    ]
  >,
  'readStaffById' : ActorMethod<
    [string],
    [] | [{ 'id' : Principal, 'name' : string, 'role' : string }]
  >,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: ({ IDL }: { IDL: IDL }) => IDL.Type[];
