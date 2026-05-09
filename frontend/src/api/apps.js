import { api } from './client';

// ── Clinic Scheduler ──
export const fetchSchedulerConfig = () => api.get('/apps/scheduler/config');

// ── SubPool Marketplace ──
export const fetchSubPoolConfig = () => api.get('/apps/subpool/config');

// ── Compliance Sentinel ──
export const fetchComplianceConfig = () => api.get('/apps/compliance/config');

// ── DataFlow Pro ──
export const fetchDataFlowClients = () => api.get('/apps/dataflow/clients');
export const fetchDataFlowPrograms = () => api.get('/apps/dataflow/programs');
export const fetchDataFlowConfig = () => api.get('/apps/dataflow/config');

// ── ABA Pocket RBT Mentor ──
export const fetchRbtMentorClients = () => api.get('/apps/rbt-mentor/clients');
export const fetchBehaviorTemplates = () => api.get('/apps/rbt-mentor/templates');
export const fetchRbtMentorPermissions = () => api.get('/apps/rbt-mentor/permissions');

// ── BCBA Pocket ──
export const fetchBcbaClients = () => api.get('/apps/bcba/clients');
export const fetchBcbaConfig = () => api.get('/apps/bcba/config');

// ── Material Maker ──
export const fetchMaterialMakerConfig = () => api.get('/apps/material-maker/config');

// ── Program Tree ──
export const fetchProgramTreePools = () => api.get('/apps/program-tree/pools');
export const fetchProgramTreeFlagTypes = () => api.get('/apps/program-tree/flag-types');
export const fetchProgramTreeDomains = () => api.get('/apps/program-tree/domains');
export const fetchProgramTemplates = () => api.get('/apps/program-tree/templates');
export const fetchAceCurriculum = () => api.get('/apps/program-tree/curriculum');
export const fetchProgramTreeClients = () => api.get('/apps/program-tree/clients');

// ── Session Structure ──
export const fetchSessionStructureConfig = () => api.get('/apps/session-structure/config');

// ── Caregiver Portal ──
export const fetchCaregiverClients = () => api.get('/apps/caregiver/clients');
export const fetchCaregiverLibrary = () => api.get('/apps/caregiver/library');
export const fetchCaregiverSessionConfig = () => api.get('/apps/caregiver/session-config');

// ── ZoneMate ──
export const fetchZoneMateCatalog = () => api.get('/apps/zonemate/catalog');
export const fetchZoneMateConfig = () => api.get('/apps/zonemate/config');
