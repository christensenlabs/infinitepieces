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

// ── Supervision Command Center ──
export const fetchSupervisionRoster = () => api.get('/apps/supervision/roster');
export const fetchSupervisionConfig = () => api.get('/apps/supervision/config');

// ── Treatment Integrity Lab ──
export const fetchIntegrityStaff = () => api.get('/apps/integrity/staff');
export const fetchIntegrityChecklist = () => api.get('/apps/integrity/checklist');

// ── Risk & Governance Hub ──
export const fetchRiskIncidents = () => api.get('/apps/risk/incidents');
export const fetchRiskCredentials = () => api.get('/apps/risk/credentials');
export const fetchRiskConsents = () => api.get('/apps/risk/consents');

// ── Outcomes Intelligence ──
export const fetchOutcomesKpis = () => api.get('/apps/outcomes/kpis');
export const fetchOutcomesStagnantTargets = () => api.get('/apps/outcomes/stagnant-targets');

// ── Gestalt AAC ──
export const fetchAacConfig = () => api.get('/apps/aac/config');

// ── Auth War Room ──
export const fetchAuthWarRoomData = () => api.get('/apps/auth-war-room/data');

// ── Clinical QA Chart Audit ──
export const fetchChartAuditQueue = () => api.get('/apps/chart-audit/queue');
export const fetchChartAuditStats = () => api.get('/apps/chart-audit/stats');
export const fetchRemediationChecklist = () => api.get('/apps/chart-audit/remediation');

// ── Intake Builder ──
export const fetchIntakeCases = () => api.get('/apps/intake/cases');
export const fetchIntakeStages = () => api.get('/apps/intake/stages');
export const fetchAssessmentDomains = () => api.get('/apps/intake/domains');
export const fetchPlanSections = () => api.get('/apps/intake/plan-sections');
export const fetchIntakeStats = () => api.get('/apps/intake/stats');

// ── Competency & Credential Vault ──
export const fetchCredentialStaff = () => api.get('/apps/credentials/staff');
export const fetchCredentialStats = () => api.get('/apps/credentials/stats');

// ── HIPAA Trust Center ──
export const fetchSecurityEvents = () => api.get('/apps/trust-center/events');
export const fetchDeviceSessions = () => api.get('/apps/trust-center/devices');
export const fetchResponseChecklist = () => api.get('/apps/trust-center/response-checklist');
export const fetchTrustCenterStats = () => api.get('/apps/trust-center/stats');

// ── API / Integration Hub ──
export const fetchIntegrationCatalog = () => api.get('/apps/integrations/catalog');
export const fetchIntegrationJobs = () => api.get('/apps/integrations/jobs');
export const fetchServiceCodeMappings = () => api.get('/apps/integrations/mappings');
export const fetchIntegrationStats = () => api.get('/apps/integrations/stats');

// ── De-identified Outcomes Registry ──
export const fetchRegistryCohorts = () => api.get('/apps/registry/cohorts');
export const fetchRegistryTransformations = () => api.get('/apps/registry/transformations');
export const fetchCohortMetrics = () => api.get('/apps/registry/metrics');
export const fetchRegistryStats = () => api.get('/apps/registry/stats');

// ── Infinite Comms ──
export const fetchCommsUsers = () => api.get('/apps/comms/users');
export const fetchCommsChannels = () => api.get('/apps/comms/channels');
export const fetchCommsMessages = () => api.get('/apps/comms/messages');
