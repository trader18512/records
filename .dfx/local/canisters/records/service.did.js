export const idlFactory = ({ IDL }) => {
  return IDL.Service({
    'createHealthRecord' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Text, IDL.Text],
        [
          IDL.Variant({
            'Ok' : IDL.Record({
              'id' : IDL.Principal,
              'doctorId' : IDL.Text,
              'prescription' : IDL.Text,
              'patientId' : IDL.Text,
              'diagnosis' : IDL.Text,
            }),
            'Err' : IDL.Variant({
              'HealthRecordDoesNotExist' : IDL.Text,
              'StaffDoesNotExist' : IDL.Text,
              'PatientDoesNotExist' : IDL.Text,
            }),
          }),
        ],
        [],
      ),
    'createPatient' : IDL.Func(
        [IDL.Text],
        [
          IDL.Record({
            'id' : IDL.Principal,
            'name' : IDL.Text,
            'healthRecordIds' : IDL.Vec(IDL.Text),
          }),
        ],
        [],
      ),
    'createStaff' : IDL.Func(
        [IDL.Text, IDL.Text],
        [
          IDL.Record({
            'id' : IDL.Principal,
            'name' : IDL.Text,
            'role' : IDL.Text,
          }),
        ],
        [],
      ),
    'readHealthRecordById' : IDL.Func(
        [IDL.Text],
        [
          IDL.Opt(
            IDL.Record({
              'id' : IDL.Principal,
              'doctorId' : IDL.Text,
              'prescription' : IDL.Text,
              'patientId' : IDL.Text,
              'diagnosis' : IDL.Text,
            })
          ),
        ],
        ['query'],
      ),
    'readPatientById' : IDL.Func(
        [IDL.Text],
        [
          IDL.Opt(
            IDL.Record({
              'id' : IDL.Principal,
              'name' : IDL.Text,
              'healthRecordIds' : IDL.Vec(IDL.Text),
            })
          ),
        ],
        ['query'],
      ),
    'readStaffById' : IDL.Func(
        [IDL.Text],
        [
          IDL.Opt(
            IDL.Record({
              'id' : IDL.Principal,
              'name' : IDL.Text,
              'role' : IDL.Text,
            })
          ),
        ],
        ['query'],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
