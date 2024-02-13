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
    Vec
} from 'azle';

const Patient = Record({
    id: Principal,
    name: text,
    healthRecordIds: Vec(text)
});
type Patient = typeof Patient.tsType;

const Staff = Record({
    id: Principal,
    name: text,
    role: text
});
type Staff = typeof Staff.tsType;

const HealthRecord = Record({
    id: Principal,
    patientId: text,
    doctorId: text,
    diagnosis: text,
    prescription: text
});
type HealthRecord = typeof HealthRecord.tsType;

const HospitalError = Variant({
    PatientDoesNotExist: text,
    StaffDoesNotExist: text,
    HealthRecordDoesNotExist: text
});
type HospitalError = typeof HospitalError.tsType;

let patients = StableBTreeMap<text, Patient>(0);
let staffs = StableBTreeMap<text, Staff>(0);
let healthRecords = StableBTreeMap<text, HealthRecord>(0);

export default Canister({
    // Patient related operations
    createPatient: update([text], Patient, (name) => {
        const id = generateId();
        const patient: Patient = {
            id,
            name,
            healthRecordIds: []
        };
    
        patients.insert(patient.id.toText(), patient);  // Convert Principal to string for StableBTreeMap
    
        return patient;
    }),
    
    readPatientById: query([text], Opt(Patient), (id) => {
        return patients.get(id);
    }),
    // Staff related operations
    createStaff: update([text, text], Staff, (name, role) => {
        const id = generateId();
        const staff: Staff = {
            id,
            name,
            role
        };

        staffs.insert(staff.id.toText(), staff);

        return staff;
    }),
    readStaffById: query([text], Opt(Staff), (id) => {
        return staffs.get(id);
    }),
    // HealthRecord related operations
    createHealthRecord: update([text, text, text, text], Result(HealthRecord, HospitalError), (patientId, doctorId, diagnosis, prescription) => {
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
