import {
    blob,
    Canister,
    ic,
    Err,
    nat64,
    Ok,
    Opt,
    Principal,
    query,
    Record,
    Result,
    StableBTreeMap,
    text,
    update,
    Variant,
    Vec,
    nat16,
    nat8
} from 'azle';

const Patient = Record({
    id: Principal,
    name: text,
    age: nat8,
    gender: text,
    bloodType: text,
    allergies: text,
    healthRecordIds: Vec(text)
});
type Patient = typeof Patient.tsType;

const Staff = Record({
    id: Principal,
    name: text,
    staffID: text,
    password: text,
    role: text
});
type Staff = typeof Staff.tsType;

const HealthRecord = Record({
    id: Principal,
    patientId: text,
    doctorId: text,
    diagnosis: text,
    doctorsNotes: text,
    prescription: text
});
type HealthRecord = typeof HealthRecord.tsType;

const HospitalError = Variant({
    PatientDoesNotExist: text,
    StaffDoesNotExist: text,
    HealthRecordDoesNotExist: text,
    IncorrectPassword: text,
    Unauthorized: text
});
type HospitalError = typeof HospitalError.tsType;

let patients = StableBTreeMap<text, Patient>(0);
let staffs = StableBTreeMap<text, Staff>(1);
let healthRecords = StableBTreeMap<text, HealthRecord>(2);

type OptStaff = null | Staff;
let loggedInStaff: OptStaff = null;

export default Canister({
    // Login operation
    login: update([text, text], Result(text, HospitalError), (staffID, password) => {
        const staffOpt = staffs.get(staffID);

        if ('None' in staffOpt) {
            return Err({
                StaffDoesNotExist: staffID
            });
        }

        const staff = staffOpt.Some;
        if (staff.password !== password) {
            return Err({
                IncorrectPassword: "The password or staff ID you entered is incorrect."
            });
        }

        loggedInStaff = staff;
        return Ok(staff.role);
    }),
    // Patient related operations
    createPatient: update([text,nat8,text, text, text], Result(Patient, HospitalError), (name, age, gender, allergies, bloodType) => {
        if (loggedInStaff === null || loggedInStaff.role !== 'healthRecordOfficer') {
            return Err({
                Unauthorized: "You must be a health Record Officer to create a health record."
            });
        }
        const id = generateId();
        const patient: Patient = {
            id,
            name,
            age,
            gender,
            bloodType,
            allergies,
            healthRecordIds: []
        };
    
        patients.insert(patient.id.toText(), patient);  // Convert Principal to string for StableBTreeMap
    
        return Ok(patient);
    }),
    
    readPatientById: query([text], Result(Opt(Patient), HospitalError), (id) => {
        if (loggedInStaff === null || (loggedInStaff.role !== 'doctor' && loggedInStaff.role !== 'healthRecordOfficer')) {
            return Err({
                Unauthorized: "You must be a doctor or a health record officer to read staff records."
            });
        }
        return Ok(patients.get(id));
    }),
    // Staff related operations
    createStaff: update([text, text, text, text], Staff, (name, staffID, password, role) => {
        const id = generateId();
        const staff: Staff = {
            id,
            staffID,
            password,
            name,
            role
        };

        staffs.insert(staff.id.toText(), staff);

        return staff;
    }),
    readStaffById: query([text], Result(Opt(Staff), HospitalError), (id) => {
        if (loggedInStaff === null || loggedInStaff.role !== 'admin') {
            return Err({
                Unauthorized: "You must be an administrator to read staff records."
            });
        }
    
        return Ok(staffs.get(id));
    }),
    // HealthRecord related operations
    createHealthRecord: update([text, text, text, text, text], Result(HealthRecord, HospitalError), (patientId, doctorId, diagnosis, doctorsNotes, prescription) => {
        if (loggedInStaff === null || loggedInStaff.role !== 'doctor') {
            return Err({
                Unauthorized: "You must be a doctor to create a health record."
            });
        }
        const patientOpt = patients.get(patientId);
        const doctorOpt = staffs.get(doctorId);

        if ('None' in patientOpt) {
            return Err({
                PatientDoesNotExist: patientId
            });
        }

        if ('None' in doctorOpt) {
            return Err({
                StaffDoesNotExist: doctorId
            });
        }

        const id = generateId();
        const healthRecord: HealthRecord = {
            id,
            patientId,
            doctorId,
            diagnosis,
            doctorsNotes,
            prescription
        };

        healthRecords.insert(healthRecord.id.toText(), healthRecord);

        const patient = patientOpt.Some;
        patient.healthRecordIds.push(healthRecord.id.toText());
        patients.insert(patient.id.toText(), patient);

        return Ok(healthRecord);
    }),
    readHealthRecordById: query([text], Opt(HealthRecord), (id) => {
        return healthRecords.get(id);
    })
});

function generateId(): Principal {
    const randomBytes = new Array(29)
        .fill(0)
        .map((_) => Math.floor(Math.random() * 256));

    return Principal.fromUint8Array(Uint8Array.from(randomBytes));
}
