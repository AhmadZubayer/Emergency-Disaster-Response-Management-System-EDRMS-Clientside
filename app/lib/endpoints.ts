export const ENDPOINTS = {
  APP: {
    HEALTH: '/',
  },

  AUTH: {
    REGISTER: '/auth/register-user',
    VERIFY_EMAIL: '/auth/verify-email',
    SIGN_IN: '/auth/sign-in',
    LOGIN: '/auth/sign-in',
    REFRESH_TOKEN: '/auth/refresh-token',
    LOGOUT: '/auth/logout',
  },

  USERS: {
    UPDATE_PROFILE: '/users/update-profile',
    COMPLETE_PROFILE: '/users/complete-profile',
    TOGGLE_SAFE: '/users/is-safe',
    IS_SAFE: '/users/is-safe',
  },

  RELIEF_ORG: {
    SIGN_UP: '/relief-org/sign-up-as-relief-org',
    LIST: '/relief-org',
    ME: '/relief-org/profile/me',
    DETAIL: (id: string | number) =>
      `/relief-org/${encodeURIComponent(String(id))}`,
    VERIFY: (id: string | number) =>
      `/relief-org/${encodeURIComponent(String(id))}/verify`,
  },

  DISASTER: {
    CREATE: '/disaster',
  },

  VOLUNTEERS: {
    REGISTER: '/volunteers/register',
    ME: '/volunteers/me',
    UPDATE_PROFILE: '/volunteers/me',
    APPLY_VERIFICATION: '/volunteers/verification/apply',
    REVIEW_VERIFICATION: (id: string | number) =>
      `/volunteers/${encodeURIComponent(String(id))}/verification`,
    UPDATE_LOCATION: '/volunteers/duty/location',
    NEARBY_RESCUE_REQUESTS: '/volunteers/rescue-requests/nearby',
    ACCEPT_TASK: (requestId: string | number) =>
      `/volunteers/rescue-tasks/${encodeURIComponent(String(requestId))}/accept`,
    REJECT_TASK: (requestId: string | number) =>
      `/volunteers/rescue-tasks/${encodeURIComponent(String(requestId))}/reject`,
    MY_TASKS: '/volunteers/rescue-tasks/my',
    UPDATE_TASK_PROGRESS: (taskId: string | number) =>
      `/volunteers/rescue-tasks/${encodeURIComponent(String(taskId))}/progress`,
    COMPLETE_TASK: (taskId: string | number) =>
      `/volunteers/rescue-tasks/${encodeURIComponent(String(taskId))}/complete`,
    REPORT_ROUTE: '/volunteers/field-reports/routes',
    REPORT_SHORTAGE: '/volunteers/field-reports/shortages',
    MY_FIELD_REPORTS: '/volunteers/field-reports/my',
    ORGANIZATION_REQUESTS: '/volunteers/organization-requests',
    JOIN_ORGANIZATION_REQUEST: (id: string | number) =>
      `/volunteers/organization-requests/${encodeURIComponent(String(id))}/join`,
    MY_ORGANIZATION_JOINS: '/volunteers/organization-requests/my/joins',
    JOIN_RESCUE_GROUP: (id: string | number) =>
      `/volunteers/rescue-groups/${encodeURIComponent(String(id))}/join`,
    JOIN_MISSING_PERSON_GROUP: (id: string | number) =>
      `/volunteers/missing-person-groups/${encodeURIComponent(String(id))}/join`,
    MY_GROUP_JOINS: '/volunteers/group-joins/my',
  },

  DONATIONS: {
    CAMPAIGNS: '/donations/campaigns',
    CAMPAIGN_DETAIL: (id: string | number) =>
      `/donations/campaigns/${encodeURIComponent(String(id))}`,
    DONATE: (id: string | number) =>
      `/donations/campaigns/${encodeURIComponent(String(id))}/donate`,
    PAYMENT_SUCCESS: '/donations/payment/success',
    PAYMENT_CANCEL: '/donations/payment/cancel',
    APPLY_FOR_AID: (id: string | number) =>
      `/donations/campaigns/${encodeURIComponent(String(id))}/apply`,
    MY_APPLICATIONS: '/donations/my-applications',
    APPLICATIONS: '/donations/applications',
    REVIEW_APPLICATION: (id: string | number) =>
      `/donations/applications/${encodeURIComponent(String(id))}/review`,
  },

  RESCUE_REQUESTS: {
    LIST: '/rescue-requests',
    CREATE: '/rescue-requests',
    MY_REQUESTS: '/rescue-requests/my',
    DETAIL: (id: string | number) =>
      `/rescue-requests/${encodeURIComponent(String(id))}`,
    UPDATE_STATUS: (id: string | number) =>
      `/rescue-requests/${encodeURIComponent(String(id))}/status`,
    CANCEL: (id: string | number) =>
      `/rescue-requests/${encodeURIComponent(String(id))}/cancel`,
  },

  MISSING_PERSONS: {
    LIST: '/missing-persons',
    CREATE: '/missing-persons',
    MY_REPORTS: '/missing-persons/my',
    DETAIL: (id: string | number) =>
      `/missing-persons/${encodeURIComponent(String(id))}`,
    UPDATE: (id: string | number) =>
      `/missing-persons/${encodeURIComponent(String(id))}`,
    DELETE: (id: string | number) =>
      `/missing-persons/${encodeURIComponent(String(id))}`,
    UPDATE_STATUS: (id: string | number) =>
      `/missing-persons/${encodeURIComponent(String(id))}/status`,
  },

  COMMUNITY_POSTS: {
    LIST: '/community-posts',
    CREATE: '/community-posts',
    DETAIL: (id: string | number) =>
      `/community-posts/${encodeURIComponent(String(id))}`,
    UPDATE: (id: string | number) =>
      `/community-posts/${encodeURIComponent(String(id))}`,
    DELETE: (id: string | number) =>
      `/community-posts/${encodeURIComponent(String(id))}`,
    COMMENTS: (id: string | number) =>
      `/community-posts/${encodeURIComponent(String(id))}/comments`,
    ADD_COMMENT: (id: string | number) =>
      `/community-posts/${encodeURIComponent(String(id))}/comments`,
    DELETE_COMMENT: (postId: string | number, commentId: string | number) =>
      `/community-posts/${encodeURIComponent(String(postId))}/comments/${encodeURIComponent(String(commentId))}`,
    UPDATE_STATUS: (id: string | number) =>
      `/community-posts/${encodeURIComponent(String(id))}/status`,
    BUMP: (id: string | number) =>
      `/community-posts/${encodeURIComponent(String(id))}/bump`,
    REACT: (id: string | number) =>
      `/community-posts/${encodeURIComponent(String(id))}/react`,
    REPORT: (id: string | number) =>
      `/community-posts/${encodeURIComponent(String(id))}/report`,
  },

  SHELTERS: {
    LIST: '/shelter',
    CREATE: '/shelter',
    DETAIL: (id: string | number) =>
      `/shelter/${encodeURIComponent(String(id))}`,
    UPDATE: (id: string | number) =>
      `/shelter/${encodeURIComponent(String(id))}`,
    DELETE: (id: string | number) =>
      `/shelter/${encodeURIComponent(String(id))}`,
  },

  ADMIN: {
    ACCOUNTS: '/admin/accounts',
    UPDATE_ACCOUNT_ROLE: (id: string | number) =>
      `/admin/accounts/${encodeURIComponent(String(id))}/role`,
    DELETE_ACCOUNT: (id: string | number) =>
      `/admin/accounts/${encodeURIComponent(String(id))}`,
    RESTORE_ACCOUNT: (id: string | number) =>
      `/admin/accounts/${encodeURIComponent(String(id))}/restore`,
    VOLUNTEERS: '/admin/volunteers',
    VERIFY_VOLUNTEER: (id: string | number) =>
      `/admin/volunteers/${encodeURIComponent(String(id))}/verify`,
    RELIEF_ORGS: '/admin/relief-orgs',
    VERIFY_RELIEF_ORG: (id: string | number) =>
      `/admin/relief-orgs/${encodeURIComponent(String(id))}/verify`,
    DISASTERS: '/admin/disasters',
    VERIFY_DISASTER: (id: string | number) =>
      `/admin/disasters/${encodeURIComponent(String(id))}/verify`,
    RESCUE_REQUESTS: '/admin/rescue-requests',
    COMMUNITY_POSTS: '/admin/community-posts',
    MODERATE_COMMUNITY_POST: (id: string | number) =>
      `/admin/community-posts/${encodeURIComponent(String(id))}/status`,
    DELETE_COMMUNITY_POST: (id: string | number) =>
      `/admin/community-posts/${encodeURIComponent(String(id))}`,
    RESTORE_COMMUNITY_POST: (id: string | number) =>
      `/admin/community-posts/${encodeURIComponent(String(id))}/restore`,
    REPORTS: '/admin/reports',
  },
} as const;

export type Endpoints = typeof ENDPOINTS;
export default ENDPOINTS;
